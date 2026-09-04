import type { MachineState } from '../machine/machine.types';
import type { ToolState } from '../tools/tool.types';
import type { WorkpieceState } from '../workpiece/workpiece.types';
import type { SubstageStatus, SequentialSubstageStatus } from '../machine/machine.types';
import type { ToolSubstageStatus } from '../tools/tool.types';
import type { WorkpieceSubstageStatus } from '../workpiece/workpiece.types';

export type Stage =
  | 'POWER_ON'
  | 'MACHINE_CHECKS'
  | 'TOOLS'
  | 'WORKPIECE'
  | 'READY'
  | 'OPERATION';

export type OperationState = 'STOPPED' | 'RUNNING';

export interface HmiState {
  machine: MachineState;
  tools: ToolState[];
  workpiece: WorkpieceState;
  workflow: {
    currentStage: Stage;
    operationState: OperationState;
  };
  readiness: ReadinessReport;
}

export interface ReadinessReport {
  machineChecksComplete: boolean;
  allToolsReady: boolean;
  workpieceReady: boolean;
  canProceed: boolean;
  canStartOperation: boolean;
  /** Raw condition values — used by ReadyReviewPage summary. */
  machineCheckStatuses: SubstageStatus[];
  /**
   * Sequential workflow positions for each machine-check substage.
   * Backend computes ready/current/locked — frontend renders only,
   * never re-evaluates business logic.
   */
  machineSequentialStatuses: SequentialSubstageStatus[];
  toolStatuses: ToolSubstageStatus[];
  workpieceCheckStatuses: WorkpieceSubstageStatus[];
}

// The ordered stage progression used for advancing the workflow
export const STAGE_ORDER: Stage[] = [
  'POWER_ON',
  'MACHINE_CHECKS',
  'TOOLS',
  'WORKPIECE',
  'READY',
  'OPERATION',
];
