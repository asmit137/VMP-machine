export type Status = 'READY' | 'RUNNING' | 'STOPPED';
export type StageKey = 'machine_checks' | 'tools' | 'workpiece';

export interface Item {
  id: string;
  stage: StageKey;
  sortOrder: number;
  title: string;
  detail: string;
  confirmed: boolean;
}

export interface State {
  currentStage: number;
  status: Status;
  items: Item[];
}

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
