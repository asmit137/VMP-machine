import { ChecklistStage } from '../components/ChecklistStage';
import type { Scenario, State } from '../types';

interface Props {
  scenario: Scenario;
  state: State;
  busy: boolean;
  onConfirm: (id: string) => void;
  onNext: () => void;
}

export function ToolsPage({ scenario, state, busy, onConfirm, onNext }: Props) {
  return (
    <ChecklistStage
      title="2 Required tools"
      subtitle={`Load each tool for CNC program ${scenario.cncProgram} ${scenario.cncRevision}.`}
      stageKey="tools"
      state={state}
      busy={busy}
      onConfirm={onConfirm}
      onNext={onNext}
    />
  );
}
