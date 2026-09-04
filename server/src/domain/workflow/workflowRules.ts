/**
 * workflowRules.ts — Pure domain functions that determine workflow transitions.
 * No HTTP, no database. Fully testable in isolation.
 */

import { machineChecksComplete } from '../machine/machineChecks';
import { allToolsReady } from '../tools/toolChecks';
import { isWorkpieceReady } from '../workpiece/workpieceChecks';
import type { Stage, HmiState } from './workflow.types';

/** Can the workflow proceed past the given stage? */
export function canProceed(stage: Stage, state: HmiState): boolean {
  switch (stage) {
    case 'POWER_ON':
      // Power on just needs power available (which is always true in the scenario,
      // but we still check the domain field)
      return state.machine.powerAvailable;

    case 'MACHINE_CHECKS':
      return machineChecksComplete(state.machine);

    case 'TOOLS':
      return allToolsReady(state.tools);

    case 'WORKPIECE':
      return isWorkpieceReady(state.workpiece);

    case 'READY':
      // READY → OPERATION requires all three domains to be satisfied
      return canStartOperation(state);

    case 'OPERATION':
      // Once in OPERATION, NEXT is not applicable
      return false;

    default:
      return false;
  }
}

/** Named convenience function used by the READY stage and START endpoint. */
export function canStartOperation(state: HmiState): boolean {
  return (
    machineChecksComplete(state.machine) &&
    allToolsReady(state.tools) &&
    isWorkpieceReady(state.workpiece) &&
    state.workflow.operationState !== 'RUNNING'
  );
}

export function canProceedToMachineChecks(state: HmiState): boolean {
  return state.machine.powerAvailable;
}

export function canProceedToTools(state: HmiState): boolean {
  return machineChecksComplete(state.machine);
}

export function canProceedToWorkpiece(state: HmiState): boolean {
  return machineChecksComplete(state.machine) && allToolsReady(state.tools);
}

export function canEnterReady(state: HmiState): boolean {
  return (
    machineChecksComplete(state.machine) &&
    allToolsReady(state.tools) &&
    isWorkpieceReady(state.workpiece)
  );
}
