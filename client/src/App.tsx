import { useEffect } from 'react';
import { useHmi } from './hooks/useHmi';
import { TopBar } from './components/TopBar';
import { StepHeader } from './components/StepHeader';
import { PowerOnPage } from './pages/PowerOnPage';
import { MachineChecksPage } from './pages/MachineChecksPage';
import { ToolsPage } from './pages/ToolsPage';
import { WorkpiecePage } from './pages/WorkpiecePage';
import { ReadyReviewPage } from './pages/ReadyReviewPage';
import { OperationPage } from './pages/OperationPage';

const STAGE_LABELS = ['Power On', 'Machine Checks', 'Tools', 'Workpiece', 'Ready', 'Operation'];

export default function App() {
  const { scenario, state, error, busy, run, api } = useHmi();

  const stage = state?.currentStage;

  useEffect(() => {
    if (stage !== undefined) {
      window.scrollTo(0, 0);
    }
  }, [stage]);

  if (error && !state) {
    return (
      <div className="screen">
        <p className="error" role="alert">{error}</p>
      </div>
    );
  }
  if (!scenario || !state) {
    return (
      <div className="screen">
        <p className="muted">Loading HMI…</p>
      </div>
    );
  }

  const confirm = (id: string) => run(() => api.confirmItem(id));
  const next = () => run(api.next);

  return (
    <div className="app">
      <TopBar
        operation={scenario.operation}
        quantity={scenario.quantity}
        busy={busy}
      />
      <StepHeader labels={STAGE_LABELS} current={stage} />

      <main className="screen">
        {error && (
          <p className="error" role="alert">{error}</p>
        )}

        {stage === 0 && (
          <PowerOnPage scenario={scenario} busy={busy} onBegin={next} />
        )}
        {stage === 1 && (
          <MachineChecksPage state={state} busy={busy} onConfirm={confirm} onNext={next} />
        )}
        {stage === 2 && (
          <ToolsPage scenario={scenario} state={state} busy={busy} onConfirm={confirm} onNext={next} />
        )}
        {stage === 3 && (
          <WorkpiecePage scenario={scenario} state={state} busy={busy} onConfirm={confirm} onNext={next} />
        )}
        {stage === 4 && (
          <ReadyReviewPage state={state} busy={busy} onProceed={next} />
        )}
        {stage === 5 && (
          <OperationPage
            scenario={scenario}
            state={state}
            busy={busy}
            onStart={() => run(api.start)}
            onStop={() => run(api.stop)}
            onReset={() => run(api.reset)}
          />
        )}
      </main>
    </div>
  );
}
