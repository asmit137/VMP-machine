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
