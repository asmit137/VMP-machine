import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../repositories/session.repository', () => ({
  sessionRepository: {
    ensure: vi.fn(),
    get: vi.fn(),
    setStage: vi.fn().mockResolvedValue(undefined),
    setStatus: vi.fn().mockResolvedValue(undefined),
    reset: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../repositories/item.repository', () => ({
  itemRepository: {
    seedIfEmpty: vi.fn(),
    all: vi.fn(),
    confirm: vi.fn(),
    resetAll: vi.fn().mockResolvedValue(undefined),
  },
}));

import { hmiService } from './hmi.service';
import { sessionRepository } from '../repositories/session.repository';
import { itemRepository } from '../repositories/item.repository';
import { HmiError } from '../errors/HmiError';
import type { Item, Status } from '../domain/workflow';

const session = vi.mocked(sessionRepository);
const items = vi.mocked(itemRepository);

function makeItems(c: { checks?: boolean; tools?: boolean; wp?: boolean }): Item[] {
  return [
    { id: 'c1', stage: 'machine_checks', sortOrder: 0, title: 'c1', detail: '', confirmed: c.checks ?? false },
    { id: 't1', stage: 'tools', sortOrder: 1, title: 't1', detail: '', confirmed: c.tools ?? false },
    { id: 'w1', stage: 'workpiece', sortOrder: 2, title: 'w1', detail: '', confirmed: c.wp ?? false },
  ];
}

function setState(
  currentStage: number,
  status: Status,
  confirmed: { checks?: boolean; tools?: boolean; wp?: boolean },
) {
  session.get.mockResolvedValue({ currentStage, status });
  items.all.mockResolvedValue(makeItems(confirmed));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('hmiService', () => {
  it('confirmItem throws on an unknown id', async () => {
    items.confirm.mockResolvedValue(0);
    await expect(hmiService.confirmItem('nope')).rejects.toBeInstanceOf(HmiError);
  });

  it('confirmItem persists and returns fresh state for a valid id', async () => {
    items.confirm.mockResolvedValue(1);
    setState(1, 'READY', { checks: true });
    const state = await hmiService.confirmItem('c1');
    expect(items.confirm).toHaveBeenCalledWith('c1');
    expect(state.currentStage).toBe(1);
  });

  it('advance is blocked until the current stage is complete', async () => {
    setState(1, 'READY', { checks: false });
    await expect(hmiService.advance()).rejects.toBeInstanceOf(HmiError);
    expect(session.setStage).not.toHaveBeenCalled();
  });

  it('advance moves to the next stage once complete', async () => {
    setState(1, 'READY', { checks: true });
    await hmiService.advance();
    expect(session.setStage).toHaveBeenCalledWith(2);
  });

  it('start is blocked unless all setup stages are complete', async () => {
    setState(5, 'READY', { checks: true, tools: true, wp: false });
    await expect(hmiService.start()).rejects.toBeInstanceOf(HmiError);
    expect(session.setStatus).not.toHaveBeenCalled();
  });

  it('start sets RUNNING when setup is complete', async () => {
    setState(5, 'READY', { checks: true, tools: true, wp: true });
    await hmiService.start();
    expect(session.setStatus).toHaveBeenCalledWith('RUNNING');
  });

  it('stop is blocked unless the operation is running', async () => {
    setState(5, 'READY', { checks: true, tools: true, wp: true });
    await expect(hmiService.stop()).rejects.toBeInstanceOf(HmiError);
  });

  it('stop sets STOPPED while running and preserves the stage', async () => {
    setState(5, 'RUNNING', { checks: true, tools: true, wp: true });
    await hmiService.stop();
    expect(session.setStatus).toHaveBeenCalledWith('STOPPED');
    expect(session.setStage).not.toHaveBeenCalled(); // stage must be preserved
  });
});
