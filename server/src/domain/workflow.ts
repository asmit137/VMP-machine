export const STAGES = [
  'power_on',
  'machine_checks',
  'tools',
  'workpiece',
  'ready_review',
  'operation',
] as const;

export type Stage = (typeof STAGES)[number];
export type Status = 'READY' | 'RUNNING' | 'STOPPED';

// The three stages that carry a confirmable checklist.
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
  currentStage: number; // index into STAGES
  status: Status;
  items: Item[];
}

// Map a numeric stage to its checklist key (stages 1..3 only).
export function stageKeyForIndex(index: number): StageKey | null {
  switch (index) {
    case 1:
      return 'machine_checks';
    case 2:
      return 'tools';
    case 3:
      return 'workpiece';
    default:
      return null;
  }
}

export function itemsForStage(items: Item[], stage: StageKey): Item[] {
  return items
    .filter((i) => i.stage === stage)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// A checklist stage is complete only when it has items and all are confirmed.
export function isStageComplete(items: Item[], stage: StageKey): boolean {
  const group = itemsForStage(items, stage);
  return group.length > 0 && group.every((i) => i.confirmed);
}

// Can the operator move from the current stage to the next one?
// Checklist stages gate on completion; intro (0) and review (4) pass freely.
export function canAdvance(state: State): boolean {
  const key = stageKeyForIndex(state.currentStage);
  if (key) return isStageComplete(state.items, key);
  return state.currentStage === 0 || state.currentStage === 4;
}

// Are all three setup stages done? Precondition for starting the operation.
export function allSetupComplete(state: State): boolean {
  return (
    isStageComplete(state.items, 'machine_checks') &&
    isStageComplete(state.items, 'tools') &&
    isStageComplete(state.items, 'workpiece')
  );
}

// READY/STOPPED -> RUNNING, allowed only at the operation stage once setup is done.
export function canStart(state: State): boolean {
  return (
    state.currentStage === 5 &&
    state.status !== 'RUNNING' &&
    allSetupComplete(state)
  );
}

// RUNNING -> STOPPED, allowed only while running.
export function canStop(state: State): boolean {
  return state.currentStage === 5 && state.status === 'RUNNING';
}
