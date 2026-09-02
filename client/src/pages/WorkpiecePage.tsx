import { ChecklistStage } from '../components/ChecklistStage';
import type { Scenario, State } from '../types';

interface Props {
  scenario: Scenario;
  state: State;
  busy: boolean;
  onConfirm: (id: string) => void;
  onNext: () => void;
}

export function WorkpiecePage({ scenario, state, busy, onConfirm, onNext }: Props) {
  return (
    <ChecklistStage
      title="3 Workpiece setup"
      subtitle={`Fixture ${scenario.fixture} · Work offset ${scenario.workOffset}.`}
      stageKey="workpiece"
      state={state}
      busy={busy}
      onConfirm={onConfirm}
      onNext={onNext}
    />
  );
}
