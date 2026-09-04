import type { WorkpieceState, WorkpieceSubstageStatus } from './workpiece.types';

export function isFixtureReady(w: WorkpieceState): boolean {
  return Boolean(w.fixture);
}

export function isOrientationReady(w: WorkpieceState): boolean {
  return w.orientationCorrect;
}

export function isClampingReady(w: WorkpieceState): boolean {
  return w.clamped;
}

export function isPartZeroReady(w: WorkpieceState): boolean {
  return w.partZeroEstablished;
}

export function isWorkOffsetReady(w: WorkpieceState): boolean {
  return w.workOffsetSet && Boolean(w.workOffset);
}

/** All 5 workpiece substages must pass. */
export function isWorkpieceReady(w: WorkpieceState): boolean {
  return (
    isFixtureReady(w) &&
    isOrientationReady(w) &&
    isClampingReady(w) &&
    isPartZeroReady(w) &&
    isWorkOffsetReady(w)
  );
}

export function getWorkpieceCheckStatuses(w: WorkpieceState): WorkpieceSubstageStatus[] {
  return [
    { id: 'fixture',     title: 'Fixture Selected',          completed: isFixtureReady(w) },
    { id: 'orientation', title: 'Workpiece Orientation Correct', completed: isOrientationReady(w) },
    { id: 'clamping',    title: 'Workpiece Clamped',         completed: isClampingReady(w) },
    { id: 'partZero',    title: 'Part Zero Established',     completed: isPartZeroReady(w) },
    { id: 'workOffset',  title: `Work Offset ${w.workOffset ?? 'G54'} Set`, completed: isWorkOffsetReady(w) },
  ];
}

/** Returns substage ids that are not yet complete. */
export function getWorkpieceBlockingReasons(w: WorkpieceState): string[] {
  return getWorkpieceCheckStatuses(w)
    .filter(s => !s.completed)
    .map(s => s.title);
}
