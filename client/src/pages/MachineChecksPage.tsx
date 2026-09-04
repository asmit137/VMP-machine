import { useEffect, useRef } from 'react';
import { SubstageList } from '../components/SubstageList';
import type { HmiState } from '../types';

interface Props {
  state: HmiState;
  busy: boolean;
  onNext: () => void;
  onCloseDoor: () => void;
  onOpenDoor: () => void;
  onReleaseEstop: () => void;
  onPressEstop: () => void;
  onTriggerAlarm: () => void;
  onClearAlarm: () => void;
  onCompleteReference: () => void;
}

export function MachineChecksPage({
  state, busy, onNext,
  onCloseDoor, onOpenDoor, onReleaseEstop, onPressEstop,
  onTriggerAlarm, onClearAlarm, onCompleteReference,
}: Props) {
  const { machineSequentialStatuses, machineChecksComplete } = state.readiness;
  const m = state.machine;

  // ─── Auto-advance when all checks become complete ────────────────────────────
  // We track whether we've already triggered advance to avoid double-firing.
  const advancedRef = useRef(false);
  useEffect(() => {
    if (machineChecksComplete && !advancedRef.current && !busy) {
      advancedRef.current = true;
      onNext();
    }
    // Reset the guard if checks are no longer complete (e.g. alarm triggered)
    if (!machineChecksComplete) {
      advancedRef.current = false;
    }
  }, [machineChecksComplete, busy, onNext]);

  // ─── Derive current active substage id ──────────────────────────────────────
  const currentSubstage = machineSequentialStatuses.find(s => s.workflowState === 'current');

  // ─── Context hint shown below sim controls ───────────────────────────────────
  const hint = currentSubstage
    ? `Waiting for: ${currentSubstage.title}`
    : machineChecksComplete
      ? 'All conditions met — advancing…'
      : '';

  return (
    <SubstageList
      title="Machine Checks"
      subtitle="Conditions are verified automatically in order. Perform the highlighted action."
      statuses={machineSequentialStatuses}
      primaryButton={
        <button
          className="btn primary big"
          onClick={onNext}
          disabled={!machineChecksComplete || busy}
          id="machine-next-btn"
        >
          {busy
            ? <><span className="loader" />Advancing…</>
            : machineChecksComplete
              ? 'Next →'
              : 'Complete all checks to continue'}
        </button>
      }
    >
      {/* ── Context hint ── */}
      {hint && (
        <p className="sim-current-hint">{hint}</p>
      )}

      {/* ── Door controls ── */}
      {!m.doorClosed && (
        <button
          className={`btn ${currentSubstage?.id === 'door' ? 'sim-active' : 'sim'}`}
          onClick={onCloseDoor}
          disabled={busy}
          id="btn-close-door"
        >
          ↓ Close Door
        </button>
      )}
      {m.doorClosed && (
        <button className="btn sim-danger" onClick={onOpenDoor} disabled={busy} id="btn-open-door">
          ↑ Open Door
        </button>
      )}

      {/* ── E-Stop controls ── */}
      {!m.eStopReleased && (
        <button
          className={`btn ${currentSubstage?.id === 'estop' ? 'sim-active' : 'sim'}`}
          onClick={onReleaseEstop}
          disabled={busy}
          id="btn-release-estop"
        >
          ○ Release E-Stop
        </button>
      )}
      {m.eStopReleased && (
        <button className="btn sim-danger" onClick={onPressEstop} disabled={busy} id="btn-press-estop">
          ● Press E-Stop
        </button>
      )}

      {/* ── Alarm controls ── */}
      {!m.alarmActive && (
        <button className="btn sim-danger" onClick={onTriggerAlarm} disabled={busy} id="btn-trigger-alarm">
          ⚠ Trigger Alarm
        </button>
      )}
      {m.alarmActive && (
        <button
          className={`btn ${currentSubstage?.id === 'alarm' ? 'sim-active' : 'sim'}`}
          onClick={onClearAlarm}
          disabled={busy}
          id="btn-clear-alarm"
        >
          ✓ Clear Alarm
        </button>
      )}

      {/* ── Reference return ── */}
      {!m.referenceComplete && (
        <button
          className={`btn ${currentSubstage?.id === 'reference' ? 'sim-active' : 'sim'}`}
          onClick={onCompleteReference}
          disabled={busy}
          id="btn-return-reference"
        >
          ⌖ Return to Reference
        </button>
      )}
    </SubstageList>
  );
}
