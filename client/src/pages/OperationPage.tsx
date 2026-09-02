import { useState, useEffect } from 'react';
import type { Scenario, State } from '../types';

interface Props {
  scenario: Scenario;
  state: State;
  busy: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function OperationPage({ scenario, state, busy, onStart, onStop, onReset }: Props) {
  const { status } = state;
  const [activeAction, setActiveAction] = useState<'start' | 'stop' | 'reset' | null>(null);

  useEffect(() => {
    if (!busy) setActiveAction(null);
  }, [busy]);

  return (
    <section className="card operation">
      <h1>5 Operation</h1>
      <p className="subtitle">{scenario.operation}</p>

      <div
        className={`status-panel ${status.toLowerCase()}`}
        role="status"
        aria-live="polite"
      >
        <span className="status-label">{status}</span>
      </div>

      <div className="op-controls">
        {status === 'RUNNING' ? (
          <button
            className="btn stop big"
            onClick={() => {
              setActiveAction('stop');
              onStop();
            }}
            disabled={busy}
          >
            {busy && activeAction === 'stop' && <span className="loader" />}
            {busy && activeAction === 'stop' ? 'Stopping...' : '■ Stop operation'}
          </button>
        ) : (
          <button
            className="btn start big"
            onClick={() => {
              setActiveAction('start');
              onStart();
            }}
            disabled={busy}
          >
            {busy && activeAction === 'start' && <span className="loader" />}
            {busy && activeAction === 'start' ? 'Starting...' : '▶ Start operation'}
          </button>
        )}
        
        {status !== 'RUNNING' && (
          <button
            className="btn big"
            onClick={() => {
              setActiveAction('reset');
              onReset();
            }}
            disabled={busy}
            style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', color: 'var(--text)' }}
          >
            {busy && activeAction === 'reset' ? 'Resetting...' : 'Reset demo'}
          </button>
        )}
      </div>

      {status === 'RUNNING' && (
        <p className="hint running-hint">Simulation running… machining in progress.</p>
      )}
      {status === 'STOPPED' && (
        <p className="hint">Operation stopped. Stage preserved. you can start again.</p>
      )}
    </section>
  );
}
