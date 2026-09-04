import { pool } from '../../db/pool';
import { getMachineState } from '../machine/machine.service';
import { getAllTools } from '../tools/tool.service';
import { getWorkpiece } from '../workpiece/workpiece.service';
import { getMachineCheckStatuses, getMachineSequentialStatuses, machineChecksComplete } from '../machine/machineChecks';
import { getToolStatuses, allToolsReady } from '../tools/toolChecks';
import { getWorkpieceCheckStatuses, isWorkpieceReady } from '../workpiece/workpieceChecks';
import { canProceed, canStartOperation } from './workflowRules';
import { HmiError } from '../../errors/HmiError';
import type { Stage, OperationState, HmiState, STAGE_ORDER } from './workflow.types';
import { STAGE_ORDER as STAGES } from './workflow.types';

async function getWorkflowRow(): Promise<{ currentStage: Stage; operationState: OperationState }> {
  const { rows } = await pool.query(
    `SELECT current_stage, operation_state FROM sessions WHERE id = 1 LIMIT 1`
  );
  if (rows.length === 0) throw new Error('Session not found');
  return {
    currentStage:   rows[0].current_stage as Stage,
    operationState: rows[0].operation_state as OperationState,
  };
}

export async function buildHmiState(): Promise<HmiState> {
  const [machine, tools, workpiece, workflow] = await Promise.all([
    getMachineState(),
    getAllTools(),
    getWorkpiece(),
    getWorkflowRow(),
  ]);

  const state: HmiState = {
    machine,
    tools,
    workpiece,
    workflow,
    readiness: {
      machineChecksComplete: machineChecksComplete(machine),
      allToolsReady: allToolsReady(tools),
      workpieceReady: isWorkpieceReady(workpiece),
      canProceed: false,
      canStartOperation: false,
      machineCheckStatuses: getMachineCheckStatuses(machine),
      machineSequentialStatuses: getMachineSequentialStatuses(machine),
      toolStatuses: getToolStatuses(tools),
      workpieceCheckStatuses: getWorkpieceCheckStatuses(workpiece),
    },
  };

  state.readiness.canProceed = canProceed(workflow.currentStage, state);
  state.readiness.canStartOperation = canStartOperation(state);

  return state;
}

export const workflowService = {
  buildHmiState,

  async advanceStage(): Promise<HmiState> {
    const state = await buildHmiState();
    const { currentStage } = state.workflow;

    if (!canProceed(currentStage, state)) {
      throw new HmiError(
        `Stage ${currentStage} is not complete. Cannot advance.`,
        409
      );
    }

    const idx = STAGES.indexOf(currentStage);
    if (idx < 0 || idx >= STAGES.length - 1) {
      throw new HmiError('Already at final stage', 409);
    }

    const nextStage = STAGES[idx + 1];
    await pool.query(
      `UPDATE sessions SET current_stage = $1, updated_at = NOW() WHERE id = 1`,
      [nextStage]
    );

    return buildHmiState();
  },

  async startOperation(): Promise<HmiState> {
    const state = await buildHmiState();

    if (!canStartOperation(state)) {
      throw new HmiError('Cannot start: not all readiness conditions are met.', 409);
    }
    if (state.workflow.operationState === 'RUNNING') {
      throw new HmiError('Operation is already running.', 409);
    }

    await pool.query(
      `UPDATE sessions SET current_stage = 'OPERATION', operation_state = 'RUNNING', updated_at = NOW() WHERE id = 1`
    );

    return buildHmiState();
  },

  async stopOperation(): Promise<HmiState> {
    const state = await buildHmiState();

    if (state.workflow.operationState !== 'RUNNING') {
      throw new HmiError('Cannot stop: operation is not running.', 409);
    }

    await pool.query(
      `UPDATE sessions SET operation_state = 'STOPPED', updated_at = NOW() WHERE id = 1`
    );

    return buildHmiState();
  },

  async resetSession(): Promise<HmiState> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE sessions SET current_stage = 'POWER_ON', operation_state = 'STOPPED', updated_at = NOW() WHERE id = 1`
      );

      await client.query(
        `UPDATE machine_state
         SET power_available = true, estop_released = true, door_closed = false,
             alarm_active = false, lubrication_ready = true, coolant_ready = true,
             reference_complete = false, updated_at = NOW()
         WHERE session_id = 1`
      );

      await client.query(
        `UPDATE tools SET offset_available = true, confirmed = true, updated_at = NOW()
         WHERE id IN ('T1','T3') AND session_id = 1`
      );
      await client.query(
        `UPDATE tools SET offset_available = false, confirmed = false, updated_at = NOW()
         WHERE id = 'T2' AND session_id = 1`
      );

      await client.query(
        `UPDATE workpiece_setup
         SET orientation_correct = true, clamped = true, part_zero_established = true,
             work_offset = 'G54', work_offset_set = false, updated_at = NOW()
         WHERE session_id = 1`
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    return buildHmiState();
  },
};
