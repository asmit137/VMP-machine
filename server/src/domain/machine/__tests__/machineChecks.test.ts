import { describe, it, expect } from 'vitest';
import {
  isPowerAvailable, isEStopReleased, isDoorClosed, hasNoActiveAlarm,
  isLubricationReady, isCoolantReady, isReferenceComplete,
  getMachineCheckStatuses, machineChecksComplete,
} from '../machineChecks';
import type { MachineState } from '../machine.types';

const FULL_OK: MachineState = {
  powerAvailable: true,
  eStopReleased: true,
  doorClosed: true,
  alarmActive: false,
  lubricationReady: true,
  coolantReady: true,
  referenceComplete: true,
};

describe('individual machine substage validators', () => {
  it('isPowerAvailable: false when powerAvailable=false', () => {
    expect(isPowerAvailable({ ...FULL_OK, powerAvailable: false })).toBe(false);
  });
  it('isPowerAvailable: true when powerAvailable=true', () => {
    expect(isPowerAvailable(FULL_OK)).toBe(true);
  });

  it('isEStopReleased: false when eStopReleased=false', () => {
    expect(isEStopReleased({ ...FULL_OK, eStopReleased: false })).toBe(false);
  });
  it('isEStopReleased: true when eStopReleased=true', () => {
    expect(isEStopReleased(FULL_OK)).toBe(true);
  });

  it('isDoorClosed: false when doorClosed=false', () => {
    expect(isDoorClosed({ ...FULL_OK, doorClosed: false })).toBe(false);
  });
  it('isDoorClosed: true when doorClosed=true', () => {
    expect(isDoorClosed(FULL_OK)).toBe(true);
  });

  it('hasNoActiveAlarm: false when alarmActive=true', () => {
    expect(hasNoActiveAlarm({ ...FULL_OK, alarmActive: true })).toBe(false);
  });
  it('hasNoActiveAlarm: true when alarmActive=false', () => {
    expect(hasNoActiveAlarm(FULL_OK)).toBe(true);
  });

  it('isLubricationReady: false when lubricationReady=false', () => {
    expect(isLubricationReady({ ...FULL_OK, lubricationReady: false })).toBe(false);
  });
  it('isLubricationReady: true when lubricationReady=true', () => {
    expect(isLubricationReady(FULL_OK)).toBe(true);
  });

  it('isCoolantReady: false when coolantReady=false', () => {
    expect(isCoolantReady({ ...FULL_OK, coolantReady: false })).toBe(false);
  });
  it('isCoolantReady: true when coolantReady=true', () => {
    expect(isCoolantReady(FULL_OK)).toBe(true);
  });

  it('isReferenceComplete: false when referenceComplete=false', () => {
    expect(isReferenceComplete({ ...FULL_OK, referenceComplete: false })).toBe(false);
  });
  it('isReferenceComplete: true when referenceComplete=true', () => {
    expect(isReferenceComplete(FULL_OK)).toBe(true);
  });
});

describe('getMachineCheckStatuses', () => {
  it('returns 7 substages', () => {
    expect(getMachineCheckStatuses(FULL_OK)).toHaveLength(7);
  });
  it('door substage is false when door is open', () => {
    const statuses = getMachineCheckStatuses({ ...FULL_OK, doorClosed: false });
    expect(statuses.find(s => s.id === 'door')?.completed).toBe(false);
  });
  it('alarm substage is false when alarm is active', () => {
    const statuses = getMachineCheckStatuses({ ...FULL_OK, alarmActive: true });
    expect(statuses.find(s => s.id === 'alarm')?.completed).toBe(false);
  });
});

describe('machineChecksComplete', () => {
  it('returns true when all conditions are met', () => {
    expect(machineChecksComplete(FULL_OK)).toBe(true);
  });
  it('returns false when power is unavailable', () => {
    expect(machineChecksComplete({ ...FULL_OK, powerAvailable: false })).toBe(false);
  });
  it('returns false when e-stop is pressed', () => {
    expect(machineChecksComplete({ ...FULL_OK, eStopReleased: false })).toBe(false);
  });
  it('returns false when door is open', () => {
    expect(machineChecksComplete({ ...FULL_OK, doorClosed: false })).toBe(false);
  });
  it('returns false when alarm is active', () => {
    expect(machineChecksComplete({ ...FULL_OK, alarmActive: true })).toBe(false);
  });
  it('returns false when lubrication is not ready', () => {
    expect(machineChecksComplete({ ...FULL_OK, lubricationReady: false })).toBe(false);
  });
  it('returns false when coolant is not ready', () => {
    expect(machineChecksComplete({ ...FULL_OK, coolantReady: false })).toBe(false);
  });
  it('returns false when reference is incomplete', () => {
    expect(machineChecksComplete({ ...FULL_OK, referenceComplete: false })).toBe(false);
  });
  it('returns false for initial scenario (door open + reference incomplete)', () => {
    expect(machineChecksComplete({ ...FULL_OK, doorClosed: false, referenceComplete: false })).toBe(false);
  });
});
