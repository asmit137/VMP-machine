// ─── Workflow types ────────────────────────────────────────────────────────
export type Stage =
  | 'POWER_ON'
  | 'MACHINE_CHECKS'
  | 'TOOLS'
  | 'WORKPIECE'
  | 'READY'
  | 'OPERATION';

export type OperationState = 'STOPPED' | 'RUNNING';

// ─── Domain state ─────────────────────────────────────────────────────────
export interface MachineState {
  powerAvailable: boolean;
  eStopReleased: boolean;
  doorClosed: boolean;
  alarmActive: boolean;
  lubricationReady: boolean;
  coolantReady: boolean;
  referenceComplete: boolean;
}

export interface ToolState {
  id: string;
  toolNumber: string;
  name: string;
  required: boolean;
  loaded: boolean;
  toolNumberCorrect: boolean;
  typeCorrect: boolean;
  offsetAvailable: boolean;
  confirmed: boolean;
}

export interface WorkpieceState {
  fixture: string;
  orientationCorrect: boolean;
  clamped: boolean;
  partZeroEstablished: boolean;
  workOffset: string | null;
  workOffsetSet: boolean;
  material: string;
  drawingRevision: string;
}

// ─── Substage status (calculated by backend) ───────────────────────────────
export interface SubstageStatus {
  id: string;
  title: string;
  completed: boolean;
}

/**
 * Workflow position of a machine-check sub-stage in the sequential model.
 *  'ready'   — condition satisfied, its turn has already passed
 *  'current' — first un-satisfied condition; operator acts here
 *  'locked'  — a prior condition is still incomplete; this one cannot proceed yet
 */
export type SubstageWorkflowState = 'ready' | 'current' | 'locked';

/** Combines the raw condition value with its workflow position. */
export interface SequentialSubstageStatus extends SubstageStatus {
  workflowState: SubstageWorkflowState;
}

export interface ToolSubstageStatus {
  id: string;
  title: string;
  completed: boolean;
  details: {
    loaded: boolean;
    toolNumberCorrect: boolean;
    typeCorrect: boolean;
    offsetAvailable: boolean;
    confirmed: boolean;
  };
}

export interface WorkpieceSubstageStatus {
  id: string;
  title: string;
  completed: boolean;
}

// ─── Readiness report (backend-derived, never computed in React) ───────────
export interface ReadinessReport {
  machineChecksComplete: boolean;
  allToolsReady: boolean;
  workpieceReady: boolean;
  canProceed: boolean;
  canStartOperation: boolean;
  /** Raw condition values — used by ReadyReviewPage summary */
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

// ─── Full HMI state ────────────────────────────────────────────────────────
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

// ─── Scenario metadata (unchanged) ────────────────────────────────────────
export interface Scenario {
  operation: string;
  quantity: number;
  material: string;
  drawingRevision: string;
  cncProgram: string;
  cncRevision: string;
  fixture: string;
  workOffset: string;
}
