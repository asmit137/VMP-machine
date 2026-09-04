import type { MachineState, SubstageStatus, SequentialSubstageStatus } from './machine.types';

// ─── Individual substage validators — pure functions, no side effects ─────────

export function isPowerAvailable(m: MachineState): boolean {
  return m.powerAvailable === true;
}

export function isEStopReleased(m: MachineState): boolean {
  return m.eStopReleased === true;
}

export function isDoorClosed(m: MachineState): boolean {
  return m.doorClosed === true;
}

export function hasNoActiveAlarm(m: MachineState): boolean {
  return m.alarmActive === false;
}

export function isLubricationReady(m: MachineState): boolean {
  return m.lubricationReady === true;
}

export function isCoolantReady(m: MachineState): boolean {
  return m.coolantReady === true;
}

export function isReferenceComplete(m: MachineState): boolean {
  return m.referenceComplete === true;
}

// ─── Ordered substage definitions ─────────────────────────────────────────────

/** All 7 substages in the mandatory order. */
export function getMachineCheckStatuses(m: MachineState): SubstageStatus[] {
  return [
    { id: 'power', title: 'Power / Control Available', completed: isPowerAvailable(m) },
    { id: 'estop', title: 'E-Stop Released', completed: isEStopReleased(m) },
    { id: 'door', title: 'Guard / Door Closed', completed: isDoorClosed(m) },
    { id: 'alarm', title: 'No Active Alarm', completed: hasNoActiveAlarm(m) },
    { id: 'lubrication', title: 'Lubrication Ready', completed: isLubricationReady(m) },
    { id: 'coolant', title: 'Coolant Ready', completed: isCoolantReady(m) },
    { id: 'reference', title: 'Reference Return Complete', completed: isReferenceComplete(m) },
  ];
}

/**
 * Sequential sub-stage workflow evaluator.
 *
 * Algorithm:
 *   1. Walk the ordered substage list.
 *   2. Every substage before the first incomplete one  → 'ready'
 *   3. The FIRST incomplete substage                   → 'current'
 *   4. Every substage after the first incomplete one   → 'locked'
 *      (even if their underlying machine value is already true)
 *   5. If ALL substages are complete every one         → 'ready'
 *
 * This is the ONLY function the frontend needs to render the sequential UI.
 * The frontend must NOT re-implement this logic.
 */
export function getMachineSequentialStatuses(m: MachineState): SequentialSubstageStatus[] {
  const raw = getMachineCheckStatuses(m);
  let currentFound = false;

  return raw.map((s): SequentialSubstageStatus => {
    if (currentFound) {
      // A prior substage is not yet complete — this one is locked.
      return { ...s, workflowState: 'locked' };
    }
    if (!s.completed) {
      // This is the first incomplete substage — it becomes active.
      currentFound = true;
      return { ...s, workflowState: 'current' };
    }
    // Substage is complete and no blocker before it — it is ready.
    return { ...s, workflowState: 'ready' };
  });
}

/** All machine checks must pass before the main stage can advance. */
export function machineChecksComplete(m: MachineState): boolean {
  return getMachineCheckStatuses(m).every(s => s.completed);
}
