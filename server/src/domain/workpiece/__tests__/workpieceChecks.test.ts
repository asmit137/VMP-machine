import { describe, it, expect } from 'vitest';
import {
  isFixtureReady, isOrientationReady, isClampingReady,
  isPartZeroReady, isWorkOffsetReady, isWorkpieceReady,
  getWorkpieceCheckStatuses,
} from '../workpieceChecks';
import type { WorkpieceState } from '../workpiece.types';

const FULL_OK: WorkpieceState = {
  fixture: '4-jaw / vise fixture',
  orientationCorrect: true,
  clamped: true,
  partZeroEstablished: true,
  workOffset: 'G54',
  workOffsetSet: true,
  material: 'Aluminium 6061',
  drawingRevision: 'PART-001 Rev B',
};

describe('individual workpiece validators', () => {
  it('isFixtureReady: false when fixture is empty string', () => {
    expect(isFixtureReady({ ...FULL_OK, fixture: '' })).toBe(false);
  });
  it('isFixtureReady: true when fixture is set', () => {
    expect(isFixtureReady(FULL_OK)).toBe(true);
  });

  it('isOrientationReady: false when orientationCorrect=false', () => {
    expect(isOrientationReady({ ...FULL_OK, orientationCorrect: false })).toBe(false);
  });
  it('isOrientationReady: true when orientationCorrect=true', () => {
    expect(isOrientationReady(FULL_OK)).toBe(true);
  });

  it('isClampingReady: false when clamped=false', () => {
    expect(isClampingReady({ ...FULL_OK, clamped: false })).toBe(false);
  });
  it('isClampingReady: true when clamped=true', () => {
    expect(isClampingReady(FULL_OK)).toBe(true);
  });

  it('isPartZeroReady: false when partZeroEstablished=false', () => {
    expect(isPartZeroReady({ ...FULL_OK, partZeroEstablished: false })).toBe(false);
  });
  it('isPartZeroReady: true when partZeroEstablished=true', () => {
    expect(isPartZeroReady(FULL_OK)).toBe(true);
  });

  it('isWorkOffsetReady: false when workOffsetSet=false', () => {
    expect(isWorkOffsetReady({ ...FULL_OK, workOffsetSet: false })).toBe(false);
  });
  it('isWorkOffsetReady: false when workOffset is null', () => {
    expect(isWorkOffsetReady({ ...FULL_OK, workOffset: null })).toBe(false);
  });
  it('isWorkOffsetReady: true when workOffsetSet=true and workOffset is set', () => {
    expect(isWorkOffsetReady(FULL_OK)).toBe(true);
  });
});

describe('isWorkpieceReady', () => {
  it('returns true when all conditions are met', () => {
    expect(isWorkpieceReady(FULL_OK)).toBe(true);
  });
  it('returns false when fixture is missing', () => {
    expect(isWorkpieceReady({ ...FULL_OK, fixture: '' })).toBe(false);
  });
  it('returns false when orientation is wrong', () => {
    expect(isWorkpieceReady({ ...FULL_OK, orientationCorrect: false })).toBe(false);
  });
  it('returns false when not clamped', () => {
    expect(isWorkpieceReady({ ...FULL_OK, clamped: false })).toBe(false);
  });
  it('returns false when part zero is not established', () => {
    expect(isWorkpieceReady({ ...FULL_OK, partZeroEstablished: false })).toBe(false);
  });
  it('returns false when G54 is not set (initial scenario)', () => {
    expect(isWorkpieceReady({ ...FULL_OK, workOffsetSet: false })).toBe(false);
  });
});

describe('getWorkpieceCheckStatuses', () => {
  it('returns 5 substages', () => {
    expect(getWorkpieceCheckStatuses(FULL_OK)).toHaveLength(5);
  });
  it('workOffset substage is false when not set', () => {
    const statuses = getWorkpieceCheckStatuses({ ...FULL_OK, workOffsetSet: false });
    expect(statuses.find(s => s.id === 'workOffset')?.completed).toBe(false);
  });
});
