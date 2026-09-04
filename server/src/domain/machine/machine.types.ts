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

export type SubstageWorkflowState = 'ready' | 'current' | 'locked';

export interface SequentialSubstageStatus extends SubstageStatus {
  workflowState: SubstageWorkflowState;
}
