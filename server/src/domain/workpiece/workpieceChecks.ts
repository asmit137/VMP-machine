import type { WorkpieceState, WorkpieceSubstageStatus } from './workpiece.types';

export function getWorkpieceCheckStatuses(w: WorkpieceState): WorkpieceSubstageStatus[] {
  return [
    { id: 'fixture',     title: 'Fixture Selected',          completed: !!w.fixture },
    { id: 'orientation', title: 'Workpiece Orientation Correct', completed: w.orientationCorrect },
    { id: 'clamping',    title: 'Workpiece Clamped',         completed: w.clamped },
    { id: 'partZero',    title: 'Part Zero Established',     completed: w.partZeroEstablished },
    { id: 'workOffset',  title: `Work Offset ${w.workOffset || 'G54'} Set`, completed: w.workOffsetSet && !!w.workOffset },
  ];
}

export function isWorkpieceReady(w: WorkpieceState): boolean {
  return getWorkpieceCheckStatuses(w).every(status => status.completed);
}

export function getWorkpieceBlockingReasons(w: WorkpieceState): string[] {
  return getWorkpieceCheckStatuses(w)
    .filter(s => !s.completed)
    .map(s => s.title);
}

export function isFixtureReady(w: WorkpieceState)    { return !!w.fixture; }
export function isOrientationReady(w: WorkpieceState){ return w.orientationCorrect; }
export function isClampingReady(w: WorkpieceState)   { return w.clamped; }
export function isPartZeroReady(w: WorkpieceState)   { return w.partZeroEstablished; }
export function isWorkOffsetReady(w: WorkpieceState) { return w.workOffsetSet && !!w.workOffset; }
