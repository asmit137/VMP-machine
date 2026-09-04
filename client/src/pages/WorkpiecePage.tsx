import { SubstageList } from '../components/SubstageList';
import type { HmiState, Scenario } from '../types';

interface Props {
  state: HmiState;
  scenario: Scenario;
  busy: boolean;
  onNext: () => void;
  onOrient: () => void;
  onClamp: () => void;
  onEstablishZero: () => void;
  onSetOffset: () => void;
}

export function WorkpiecePage({
  state, scenario, busy, onNext,
  onOrient, onClamp, onEstablishZero, onSetOffset,
}: Props) {
  const { workpieceCheckStatuses, workpieceReady } = state.readiness;
  const w = state.workpiece;

  return (
    <SubstageList
      title="Workpiece Setup"
      subtitle={`Fixture: ${scenario.fixture} · Work Offset: ${scenario.workOffset}`}
      statuses={workpieceCheckStatuses}
      primaryButton={
        <button
          className="btn primary big"
          onClick={onNext}
          disabled={!workpieceReady || busy}
          id="workpiece-next-btn"
        >
          {busy ? <><span className="loader" />Checking…</> : workpieceReady ? 'Next →' : 'Complete workpiece setup to continue'}
        </button>
      }
    >
      {!w.orientationCorrect && (
        <button className="btn sim" onClick={onOrient} disabled={busy} id="btn-orient">
          ↻ Orient Workpiece
        </button>
      )}
      {!w.clamped && (
        <button className="btn sim" onClick={onClamp} disabled={busy} id="btn-clamp">
          ⊕ Clamp Workpiece
        </button>
      )}
      {!w.partZeroEstablished && (
        <button className="btn sim" onClick={onEstablishZero} disabled={busy} id="btn-establish-zero">
          ✦ Establish Part Zero
        </button>
      )}
      {!w.workOffsetSet && (
        <button className="btn sim" onClick={onSetOffset} disabled={busy} id="btn-set-g54">
          ⊞ Set {w.workOffset ?? 'G54'}
        </button>
      )}
    </SubstageList>
  );
}
