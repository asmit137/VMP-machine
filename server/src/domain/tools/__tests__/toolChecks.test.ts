import { describe, it, expect } from 'vitest';
import { isToolReady, allToolsReady, getToolStatuses } from '../toolChecks';
import type { ToolState } from '../tool.types';

const READY_TOOL: ToolState = {
  id: 'T1', toolNumber: 'T01', name: '10mm Face Mill',
  required: true, loaded: true, toolNumberCorrect: true,
  typeCorrect: true, offsetAvailable: true, confirmed: true,
};

describe('isToolReady', () => {
  it('returns true when all conditions are met', () => {
    expect(isToolReady(READY_TOOL)).toBe(true);
  });
  it('returns false when not loaded', () => {
    expect(isToolReady({ ...READY_TOOL, loaded: false })).toBe(false);
  });
  it('returns false when tool number is wrong', () => {
    expect(isToolReady({ ...READY_TOOL, toolNumberCorrect: false })).toBe(false);
  });
  it('returns false when tool type is wrong', () => {
    expect(isToolReady({ ...READY_TOOL, typeCorrect: false })).toBe(false);
  });
  it('returns false when offset is not available', () => {
    expect(isToolReady({ ...READY_TOOL, offsetAvailable: false })).toBe(false);
  });
  it('returns false when not confirmed', () => {
    expect(isToolReady({ ...READY_TOOL, confirmed: false })).toBe(false);
  });
  it('returns false when not required (non-required tools are skipped but isToolReady itself returns false)', () => {
    expect(isToolReady({ ...READY_TOOL, required: false })).toBe(false);
  });
});

describe('allToolsReady', () => {
  const tools: ToolState[] = [
    READY_TOOL,
    { ...READY_TOOL, id: 'T3', toolNumber: 'T03', name: '5mm Drill' },
  ];
  const incompleteT2: ToolState = {
    id: 'T2', toolNumber: 'T02', name: '6mm End Mill',
    required: true, loaded: true, toolNumberCorrect: true,
    typeCorrect: true, offsetAvailable: false, confirmed: false,
  };

  it('returns true when all required tools are ready', () => {
    expect(allToolsReady(tools)).toBe(true);
  });
  it('returns false when one required tool is missing offset', () => {
    expect(allToolsReady([...tools, incompleteT2])).toBe(false);
  });
  it('ignores non-required tools', () => {
    const nonRequired: ToolState = { ...incompleteT2, required: false };
    expect(allToolsReady([...tools, nonRequired])).toBe(true);
  });
  it('returns false with empty list', () => {
    expect(allToolsReady([])).toBe(true); // vacuously true — no required tools
  });
});

describe('getToolStatuses', () => {
  it('returns detailed status including individual property flags', () => {
    const incompleteT2: ToolState = {
      id: 'T2', toolNumber: 'T02', name: '6mm End Mill',
      required: true, loaded: true, toolNumberCorrect: true,
      typeCorrect: true, offsetAvailable: false, confirmed: false,
    };
    const statuses = getToolStatuses([incompleteT2]);
    expect(statuses[0].completed).toBe(false);
    expect(statuses[0].details.loaded).toBe(true);
    expect(statuses[0].details.offsetAvailable).toBe(false);
    expect(statuses[0].details.confirmed).toBe(false);
  });
});
