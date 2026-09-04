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

export interface WorkpieceSubstageStatus {
  id: string;
  title: string;
  completed: boolean;
}
