import type { HmiState } from '../types';

interface Props {
  state: HmiState;
  busy: boolean;
  onStart: () => void;
}

function ReadyRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="review-item">
      <span className={`substage-icon ${ok ? 'ok' : 'nok'}`}>{ok ? '✓' : '✗'}</span>
      {label}
    </li>
  );
}

export function ReadyReviewPage({ state, busy, onStart }: Props) {
  const { machineCheckStatuses, toolStatuses, workpieceCheckStatuses,
          machineChecksComplete, allToolsReady, workpieceReady, canStartOperation } = state.readiness;

  // Domain readiness = all three areas complete (independent of operation state).
  // This drives the blocking-reasons display — we only show blockers for incomplete domain conditions.
  const domainReady = machineChecksComplete && allToolsReady && workpieceReady;

  return (
    <section className="card">
      <div className="ready-head">
        <h1>Ready Review</h1>
        <span className={`badge ${domainReady ? 'ready' : 'notready'}`}>
          {domainReady ? 'READY' : 'NOT READY'}
        </span>
      </div>
      <p className="subtitle">
        All three domains must be satisfied before the operation can start.
      </p>

      <div className="review-groups">
        {/* Machine */}
        <div className={`review-group ${machineChecksComplete ? 'ok' : 'nok'}`}>
          <h2>
            <span className={`substage-icon sm ${machineChecksComplete ? 'ok' : 'nok'}`}>
              {machineChecksComplete ? '✓' : '✗'}
            </span>
            Machine Checks
          </h2>
          <ul className="review-list">
            {machineCheckStatuses.map(s => (
              <ReadyRow key={s.id} ok={s.completed} label={s.title} />
            ))}
          </ul>
        </div>

        {/* Tools */}
        <div className={`review-group ${allToolsReady ? 'ok' : 'nok'}`}>
          <h2>
            <span className={`substage-icon sm ${allToolsReady ? 'ok' : 'nok'}`}>
              {allToolsReady ? '✓' : '✗'}
            </span>
            Required Tools
          </h2>
          <ul className="review-list">
            {toolStatuses.map(ts => (
              <ReadyRow key={ts.id} ok={ts.completed} label={ts.title} />
            ))}
          </ul>
        </div>

        {/* Workpiece */}
        <div className={`review-group ${workpieceReady ? 'ok' : 'nok'}`}>
          <h2>
            <span className={`substage-icon sm ${workpieceReady ? 'ok' : 'nok'}`}>
              {workpieceReady ? '✓' : '✗'}
            </span>
            Workpiece Setup
          </h2>
          <ul className="review-list">
            {workpieceCheckStatuses.map(s => (
              <ReadyRow key={s.id} ok={s.completed} label={s.title} />
            ))}
          </ul>
        </div>
      </div>

      {!domainReady && (
        <div className="blocking-reasons">
          <p className="blocking-label">Blocking conditions:</p>
          <ul className="blocking-list">
            {!machineChecksComplete && <li>Machine checks incomplete</li>}
            {!allToolsReady && <li>One or more required tools not ready</li>}
            {!workpieceReady && <li>Workpiece setup incomplete</li>}
          </ul>
        </div>
      )}

      <div className="stage-footer">
        <button
          className="btn start big"
          onClick={onStart}
          disabled={!canStartOperation || busy}
          id="ready-start-btn"
        >
          {busy ? <><span className="loader" />Starting…</> : '▶ Start Operation'}
        </button>
      </div>
    </section>
  );
}
