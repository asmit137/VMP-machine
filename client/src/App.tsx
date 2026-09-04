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
import type { Stage } from './types';

const STAGE_LABELS: Stage[] = ['POWER_ON', 'MACHINE_CHECKS', 'TOOLS', 'WORKPIECE', 'READY', 'OPERATION'];
const STAGE_DISPLAY = ['Power On', 'Machine Checks', 'Tools', 'Workpiece', 'Ready', 'Operation'];

export default function App() {
  const { scenario, state, error, busy, run, api } = useHmi();
  const stage = state?.workflow.currentStage;

  useEffect(() => {
    if (stage !== undefined) window.scrollTo(0, 0);
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
      <div className="loading-screen">
        <div className="loading-spinner" aria-hidden="true" />
        <p className="loading-title">Loading HMI…</p>
        <p className="loading-sub">
          The API is hosted on Render's free tier — it may take&nbsp;
          <strong>up to 60 seconds</strong> to wake up on the first visit.
          <br />Please wait while the server starts.
        </p>
      </div>
    );
  }


  const stageIndex = STAGE_LABELS.indexOf(stage ?? 'POWER_ON');
  const next  = () => run(api.nextStage);
  const start = () => run(api.startOperation);
  const stop  = () => run(api.stopOperation);
  const reset = () => run(api.reset);

  return (
    <div className="app">
      <TopBar
        operation={scenario.operation}
        material={scenario.material}
        busy={busy}
      />
      <StepHeader labels={STAGE_DISPLAY} current={stageIndex} />

      <main className="screen">
        {error && (
          <div style={{ width: '100%', maxWidth: 680, marginBottom: 16 }}>
            <p className="error" role="alert">{error}</p>
          </div>
        )}

        {stage === 'POWER_ON' && (
          <PowerOnPage scenario={scenario} busy={busy} onBegin={next} />
        )}
        {stage === 'MACHINE_CHECKS' && (
          <MachineChecksPage state={state} busy={busy} onNext={next}
            onCloseDoor={() => run(api.closeDoor)}
            onOpenDoor={() => run(api.openDoor)}
            onReleaseEstop={() => run(api.releaseEstop)}
            onPressEstop={() => run(api.pressEstop)}
            onTriggerAlarm={() => run(api.triggerAlarm)}
            onClearAlarm={() => run(api.clearAlarm)}
            onCompleteReference={() => run(api.completeReference)}
          />
        )}
        {stage === 'TOOLS' && (
          <ToolsPage state={state} busy={busy} onNext={next}
            onSetOffset={(id) => run(() => api.setToolOffset(id))}
            onConfirmTool={(id) => run(() => api.confirmTool(id))}
            onLoadTool={(id) => run(() => api.loadTool(id))}
            onResetTool={(id) => run(() => api.resetTool(id))}
          />
        )}
        {stage === 'WORKPIECE' && (
          <WorkpiecePage state={state} scenario={scenario} busy={busy} onNext={next}
            onOrient={() => run(api.orientWorkpiece)}
            onClamp={() => run(api.clampWorkpiece)}
            onEstablishZero={() => run(api.establishPartZero)}
            onSetOffset={() => run(api.setWorkOffset)}
          />
        )}
        {stage === 'READY' && (
          <ReadyReviewPage state={state} busy={busy} onStart={start} />
        )}
        {stage === 'OPERATION' && (
          <OperationPage
            scenario={scenario}
            state={state}
            busy={busy}
            onStart={start}
            onStop={stop}
            onReset={reset}
          />
        )}
      </main>
    </div>
  );
}
