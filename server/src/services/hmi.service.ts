import { sessionRepository } from '../repositories/session.repository';
import { itemRepository } from '../repositories/item.repository';
import { HmiError } from '../errors/HmiError';
import { canAdvance, canStart, canStop, type State } from '../domain/workflow';

async function getState(): Promise<State> {
  const session = await sessionRepository.get();
  const items = await itemRepository.all();
  return { currentStage: session.currentStage, status: session.status, items };
}

export const hmiService = {
  getState,

  async confirmItem(id: string): Promise<State> {
    const changed = await itemRepository.confirm(id);
    if (changed === 0) throw new HmiError('Unknown item.');
    return getState();
  },

  // The core gate: refuse to advance unless the stage is fully confirmed.
  async advance(): Promise<State> {
    const state = await getState();
    if (!canAdvance(state)) {
      throw new HmiError('Confirm every item on this stage before continuing.');
    }
    await sessionRepository.setStage(Math.min(state.currentStage + 1, 5));
    return getState();
  },

  async start(): Promise<State> {
    const state = await getState();
    if (!canStart(state)) {
      throw new HmiError('Cannot start: complete all setup stages first.');
    }
    await sessionRepository.setStatus('RUNNING');
    return getState();
  },

  async stop(): Promise<State> {
    const state = await getState();
    if (!canStop(state)) {
      throw new HmiError('Cannot stop: operation is not running.');
    }
    // Status becomes STOPPED; current_stage is deliberately preserved.
    await sessionRepository.setStatus('STOPPED');
    return getState();
  },

  async reset(): Promise<State> {
    await sessionRepository.reset();
    await itemRepository.resetAll();
    return getState();
  },
};
