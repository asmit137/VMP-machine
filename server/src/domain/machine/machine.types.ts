export interface MachineState {
  powerAvailable: boolean;
  eStopReleased: boolean;
  doorClosed: boolean;
  alarmActive: boolean;
  lubricationReady: boolean;
  coolantReady: boolean;
  referenceComplete: boolean;
}

export interface SubstageStatus {
  id: string;
  title: string;
  completed: boolean;
}

/**
 * Workflow position of a single machine-check sub-stage in the
 * SEQUENTIAL evaluation model.
 *
 *  'ready'   — condition is satisfied AND its turn has passed
 *  'current' — this is the first un-satisfied condition; operator acts here
 *  'locked'  — a prior condition is still not satisfied; this one cannot
 *              be considered yet (even if the raw machine value is already true)
 */
export type SubstageWorkflowState = 'ready' | 'current' | 'locked';

/** Combines the raw condition value with the workflow position. */
export interface SequentialSubstageStatus extends SubstageStatus {
  /** Workflow position in the sequential evaluation chain. */
  workflowState: SubstageWorkflowState;
}
