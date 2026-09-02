import { describe, it, expect } from 'vitest';
import {
  canAdvance,
  canStart,
  canStop,
  isStageComplete,
  allSetupComplete,
  type State,
  type Item,
} from './workflow';

function item(
  id: string,
  stage: Item['stage'],
  confirmed: boolean,
  order: number,
): Item {
  return { id, stage, sortOrder: order, title: id, detail: '', confirmed };
}

const buildItems = (opts: {
  checks?: boolean;
  tools?: boolean;
  wp?: boolean;
}): Item[] => [
  item('c1', 'machine_checks', opts.checks ?? false, 0),
  item('c2', 'machine_checks', opts.checks ?? false, 1),
  item('t1', 'tools', opts.tools ?? false, 2),
  item('w1', 'workpiece', opts.wp ?? false, 3),
];

describe('stage gating', () => {
  it('a stage is incomplete until every item is confirmed', () => {
    expect(isStageComplete(buildItems({ checks: false }), 'machine_checks')).toBe(false);
  });

  it('a stage is complete when all its items are confirmed', () => {
    expect(isStageComplete(buildItems({ checks: true }), 'machine_checks')).toBe(true);
  });

  it('cannot advance from machine checks until all checks confirmed', () => {
    const state: State = { currentStage: 1, status: 'READY', items: buildItems({ checks: false }) };
    expect(canAdvance(state)).toBe(false);
  });

  it('can advance from machine checks once all checks confirmed', () => {
    const state: State = { currentStage: 1, status: 'READY', items: buildItems({ checks: true }) };
    expect(canAdvance(state)).toBe(true);
  });

  it('power-on (0) and ready-review (4) stages can always advance', () => {
    const base = buildItems({});
    expect(canAdvance({ currentStage: 0, status: 'READY', items: base })).toBe(true);
    expect(canAdvance({ currentStage: 4, status: 'READY', items: base })).toBe(true);
  });
});

describe('operation control', () => {
  const complete = buildItems({ checks: true, tools: true, wp: true });

  it('all setup complete only when every stage is done', () => {
    expect(allSetupComplete({ currentStage: 5, status: 'READY', items: complete })).toBe(true);
    expect(
      allSetupComplete({
        currentStage: 5,
        status: 'READY',
        items: buildItems({ checks: true, tools: true, wp: false }),
      }),
    ).toBe(false);
  });

  it('can start only at the operation stage with all setup complete', () => {
    expect(canStart({ currentStage: 5, status: 'READY', items: complete })).toBe(true);
    expect(canStart({ currentStage: 5, status: 'RUNNING', items: complete })).toBe(false);
    expect(canStart({ currentStage: 4, status: 'READY', items: complete })).toBe(false);
  });

  it('a stopped operation can be started again', () => {
    expect(canStart({ currentStage: 5, status: 'STOPPED', items: complete })).toBe(true);
  });

  it('can stop only while running', () => {
    expect(canStop({ currentStage: 5, status: 'RUNNING', items: complete })).toBe(true);
    expect(canStop({ currentStage: 5, status: 'READY', items: complete })).toBe(false);
  });
});
