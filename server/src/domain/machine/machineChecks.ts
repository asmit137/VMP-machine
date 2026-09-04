import type { MachineState, SubstageStatus, SequentialSubstageStatus } from './machine.types';

export function getMachineCheckStatuses(m: MachineState): SubstageStatus[] {
  return [
    { id: 'power',       title: 'Power / Control Available',  completed: m.powerAvailable },
    { id: 'estop',       title: 'E-Stop Released',            completed: m.eStopReleased },
    { id: 'door',        title: 'Guard / Door Closed',        completed: m.doorClosed },
    { id: 'alarm',       title: 'No Active Alarm',            completed: !m.alarmActive },
    { id: 'lubrication', title: 'Lubrication Ready',          completed: m.lubricationReady },
    { id: 'coolant',     title: 'Coolant Ready',              completed: m.coolantReady },
    { id: 'reference',   title: 'Reference Return Complete',  completed: m.referenceComplete },
  ];
}

export function getMachineSequentialStatuses(m: MachineState): SequentialSubstageStatus[] {
  const statuses = getMachineCheckStatuses(m);
  let sawIncomplete = false;

  return statuses.map((s): SequentialSubstageStatus => {
    if (sawIncomplete) return { ...s, workflowState: 'locked' };
    if (!s.completed) {
      sawIncomplete = true;
      return { ...s, workflowState: 'current' };
    }
    return { ...s, workflowState: 'ready' };
  });
}

export function machineChecksComplete(m: MachineState): boolean {
  return getMachineCheckStatuses(m).every(s => s.completed);
}

export function isPowerAvailable(m: MachineState) { return m.powerAvailable; }
export function isEStopReleased(m: MachineState)  { return m.eStopReleased; }
export function isDoorClosed(m: MachineState)      { return m.doorClosed; }
export function hasNoActiveAlarm(m: MachineState)  { return !m.alarmActive; }
export function isLubricationReady(m: MachineState){ return m.lubricationReady; }
export function isCoolantReady(m: MachineState)    { return m.coolantReady; }
export function isReferenceComplete(m: MachineState){ return m.referenceComplete; }

