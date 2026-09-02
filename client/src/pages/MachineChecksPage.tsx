import { ChecklistStage } from '../components/ChecklistStage';
import type { State } from '../types';

interface Props {
  state: State;
  busy: boolean;
  onConfirm: (id: string) => void;
  onNext: () => void;
}

export function MachineChecksPage({ state, busy, onConfirm, onNext }: Props) {
  return (
    <ChecklistStage
      title="1 Machine checks"
      subtitle="Verify the machine on the floor, then confirm each item."
      stageKey="machine_checks"
      state={state}
      busy={busy}
      onConfirm={onConfirm}
      onNext={onNext}
    />
  );
}
