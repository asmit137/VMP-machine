
import { machineChecksComplete } from '../machine/machineChecks';
import { allToolsReady } from '../tools/toolChecks';
import { isWorkpieceReady } from '../workpiece/workpieceChecks';
import type { Stage, HmiState } from './workflow.types';

export function canProceed(stage: Stage, state: HmiState): boolean {
  switch (stage) {
    case 'POWER_ON':
      return state.machine.powerAvailable;

    case 'MACHINE_CHECKS':
      return machineChecksComplete(state.machine);

    case 'TOOLS':
      return allToolsReady(state.tools);

    case 'WORKPIECE':
      return isWorkpieceReady(state.workpiece);

    case 'READY':
      return canStartOperation(state);

    case 'OPERATION':
      return false;

    default:
      return false;
  }
}

export function canStartOperation(state: HmiState): boolean {
  return (
    machineChecksComplete(state.machine) &&
    allToolsReady(state.tools) &&
    isWorkpieceReady(state.workpiece) &&
    state.workflow.operationState !== 'RUNNING'
  );
}

export function canProceedToMachineChecks(state: HmiState): boolean {
  return state.machine.powerAvailable;
}

export function canProceedToTools(state: HmiState): boolean {
  return machineChecksComplete(state.machine);
}

export function canProceedToWorkpiece(state: HmiState): boolean {
  return machineChecksComplete(state.machine) && allToolsReady(state.tools);
}

export function canEnterReady(state: HmiState): boolean {
  return (
    machineChecksComplete(state.machine) &&
    allToolsReady(state.tools) &&
    isWorkpieceReady(state.workpiece)
  );
}
