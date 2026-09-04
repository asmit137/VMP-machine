import { useState, useEffect } from 'react';
import type { Scenario, HmiState } from '../types';

interface Props {
  scenario: Scenario;
  state: HmiState;
  busy: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function OperationPage({ scenario, state, busy, onStart, onStop, onReset }: Props) {
  const { operationState } = state.workflow;
  const { canStartOperation } = state.readiness;
  const [activeAction, setActiveAction] = useState<'start' | 'stop' | 'reset' | null>(null);

  useEffect(() => {
    if (!busy) setActiveAction(null);
  }, [busy]);

  const isRunning = operationState === 'RUNNING';

  return (
    <section className="card operation">
      <h1>Operation</h1>
      <p className="subtitle">{scenario.operation}</p>

      <div
        className={`status-panel ${operationState.toLowerCase()}`}
        role="status"
        aria-live="polite"
      >
        <span className="status-label">{operationState}</span>
        {isRunning && <p className="status-hint">Machining in progress…</p>}
      </div>

      <div className="op-controls">
        {isRunning ? (
          <button
            className="btn stop big"
            onClick={() => { setActiveAction('stop'); onStop(); }}
            disabled={busy}
            id="op-stop-btn"
          >
            {busy && activeAction === 'stop' && <span className="loader" />}
            {busy && activeAction === 'stop' ? 'Stopping…' : '■ Stop Operation'}
          </button>
        ) : (
          <button
            className="btn start big"
            onClick={() => { setActiveAction('start'); onStart(); }}
            disabled={!canStartOperation || busy}
            id="op-start-btn"
          >
            {busy && activeAction === 'start' && <span className="loader" />}
            {busy && activeAction === 'start' ? 'Starting…' : '▶ Start Operation'}
          </button>
        )}

        {!isRunning && (
          <button
            className="btn big"
            onClick={() => { setActiveAction('reset'); onReset(); }}
            disabled={busy}
            id="op-reset-btn"
            style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
          >
            {busy && activeAction === 'reset' ? 'Resetting…' : '↺ Reset Demo'}
          </button>
        )}
      </div>

      {!isRunning && !canStartOperation && (
        <p className="hint" style={{ color: 'var(--warn)' }}>
          Machine, tools, or workpiece conditions not fully met — return to previous stages.
        </p>
      )}
      {operationState === 'STOPPED' && canStartOperation && (
        <p className="hint">Operation stopped. All conditions met — ready to restart.</p>
      )}
    </section>
  );
}
