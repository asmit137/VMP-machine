import { describe, it, expect } from 'vitest';
import { canProceed, canStartOperation } from '../workflowRules';
import type { HmiState } from '../workflow.types';
import type { MachineState } from '../../machine/machine.types';
import type { ToolState } from '../../tools/tool.types';
import type { WorkpieceState } from '../../workpiece/workpiece.types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MACHINE_OK: MachineState = {
  powerAvailable: true, eStopReleased: true, doorClosed: true,
  alarmActive: false, lubricationReady: true, coolantReady: true,
  referenceComplete: true,
};
const MACHINE_DOOR_OPEN: MachineState = { ...MACHINE_OK, doorClosed: false };
const MACHINE_NO_REF: MachineState    = { ...MACHINE_OK, referenceComplete: false };
const MACHINE_INITIAL: MachineState   = { ...MACHINE_OK, doorClosed: false, referenceComplete: false };

const T_READY = (id: string): ToolState => ({
  id, toolNumber: `T0${id}`, name: `Tool ${id}`,
  required: true, loaded: true, toolNumberCorrect: true,
  typeCorrect: true, offsetAvailable: true, confirmed: true,
});
const T2_INCOMPLETE: ToolState = {
  id: 'T2', toolNumber: 'T02', name: '6mm End Mill',
  required: true, loaded: true, toolNumberCorrect: true,
  typeCorrect: true, offsetAvailable: false, confirmed: false,
};

const TOOLS_OK       = [T_READY('T1'), T_READY('T2'), T_READY('T3')];
const TOOLS_INITIAL  = [T_READY('T1'), T2_INCOMPLETE, T_READY('T3')];

const WP_OK: WorkpieceState = {
  fixture: '4-jaw / vise fixture', orientationCorrect: true, clamped: true,
  partZeroEstablished: true, workOffset: 'G54', workOffsetSet: true,
  material: 'Aluminium 6061', drawingRevision: 'PART-001 Rev B',
};
const WP_NO_OFFSET: WorkpieceState = { ...WP_OK, workOffsetSet: false };

function makeState(overrides: Partial<{
  machine: MachineState;
  tools: ToolState[];
  workpiece: WorkpieceState;
  stage: HmiState['workflow']['currentStage'];
  operation: HmiState['workflow']['operationState'];
}>): HmiState {
  return {
    machine:   overrides.machine   ?? MACHINE_OK,
    tools:     overrides.tools     ?? TOOLS_OK,
    workpiece: overrides.workpiece ?? WP_OK,
    workflow: {
      currentStage:   overrides.stage     ?? 'POWER_ON',
      operationState: overrides.operation ?? 'STOPPED',
    },
    readiness: {} as HmiState['readiness'], // not used by pure rules
  };
}

// ─── canProceed tests ─────────────────────────────────────────────────────────

describe('canProceed — POWER_ON', () => {
  it('returns true when power is available', () => {
    expect(canProceed('POWER_ON', makeState({ stage: 'POWER_ON' }))).toBe(true);
  });
  it('returns false when power is unavailable', () => {
    expect(canProceed('POWER_ON', makeState({ stage: 'POWER_ON', machine: { ...MACHINE_OK, powerAvailable: false } }))).toBe(false);
  });
});

describe('canProceed — MACHINE_CHECKS', () => {
  it('returns true when all checks pass', () => {
    expect(canProceed('MACHINE_CHECKS', makeState({ stage: 'MACHINE_CHECKS' }))).toBe(true);
  });
  it('returns false when door is open', () => {
    expect(canProceed('MACHINE_CHECKS', makeState({ stage: 'MACHINE_CHECKS', machine: MACHINE_DOOR_OPEN }))).toBe(false);
  });
  it('returns false when reference is incomplete', () => {
    expect(canProceed('MACHINE_CHECKS', makeState({ stage: 'MACHINE_CHECKS', machine: MACHINE_NO_REF }))).toBe(false);
  });
  it('returns false for initial scenario (door open + no ref)', () => {
    expect(canProceed('MACHINE_CHECKS', makeState({ stage: 'MACHINE_CHECKS', machine: MACHINE_INITIAL }))).toBe(false);
  });
});

describe('canProceed — TOOLS', () => {
  it('returns true when all tools are ready', () => {
    expect(canProceed('TOOLS', makeState({ stage: 'TOOLS' }))).toBe(true);
  });
  it('returns false when T2 is incomplete', () => {
    expect(canProceed('TOOLS', makeState({ stage: 'TOOLS', tools: TOOLS_INITIAL }))).toBe(false);
  });
});

describe('canProceed — WORKPIECE', () => {
  it('returns true when workpiece is fully set up', () => {
    expect(canProceed('WORKPIECE', makeState({ stage: 'WORKPIECE' }))).toBe(true);
  });
  it('returns false when G54 is not set', () => {
    expect(canProceed('WORKPIECE', makeState({ stage: 'WORKPIECE', workpiece: WP_NO_OFFSET }))).toBe(false);
  });
});

describe('canProceed — READY', () => {
  it('returns true when all domains are complete and STOPPED', () => {
    expect(canProceed('READY', makeState({ stage: 'READY' }))).toBe(true);
  });
  it('returns false when RUNNING', () => {
    expect(canProceed('READY', makeState({ stage: 'READY', operation: 'RUNNING' }))).toBe(false);
  });
  it('returns false when any domain is incomplete', () => {
    expect(canProceed('READY', makeState({ stage: 'READY', tools: TOOLS_INITIAL }))).toBe(false);
  });
});

describe('canProceed — OPERATION', () => {
  it('always returns false (NEXT not valid in OPERATION)', () => {
    expect(canProceed('OPERATION', makeState({ stage: 'OPERATION' }))).toBe(false);
  });
});

// ─── canStartOperation tests ──────────────────────────────────────────────────

describe('canStartOperation', () => {
  it('returns true when everything is ready and STOPPED', () => {
    expect(canStartOperation(makeState({}))).toBe(true);
  });
  it('returns false when already RUNNING', () => {
    expect(canStartOperation(makeState({ operation: 'RUNNING' }))).toBe(false);
  });
  it('returns false when machine checks are incomplete', () => {
    expect(canStartOperation(makeState({ machine: MACHINE_DOOR_OPEN }))).toBe(false);
  });
  it('returns false when tools are not all ready', () => {
    expect(canStartOperation(makeState({ tools: TOOLS_INITIAL }))).toBe(false);
  });
  it('returns false when workpiece offset is not set', () => {
    expect(canStartOperation(makeState({ workpiece: WP_NO_OFFSET }))).toBe(false);
  });
});
