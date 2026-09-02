import { useState, useEffect } from 'react';
import type { State, StageKey } from '../types';

interface Props {
  title: string;
  subtitle: string;
  stageKey: StageKey;
  state: State;
  busy: boolean;
  onConfirm: (id: string) => void;
  onNext: () => void;
}

export function ChecklistStage({
  title,
  subtitle,
  stageKey,
  state,
  busy,
  onConfirm,
  onNext,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!busy) setActiveId(null);
  }, [busy]);

  const items = state.items
    .filter((i) => i.stage === stageKey)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const done = items.filter((i) => i.confirmed).length;
  const allDone = items.length > 0 && done === items.length;

  return (
    <section className="card">
      <h1>{title}</h1>
      <p className="subtitle">{subtitle}</p>
      <p className="progress-count">
        {done} of {items.length} confirmed
      </p>

      <ul className="checklist">
        {items.map((item) => (
          <li key={item.id} className={`check ${item.confirmed ? 'confirmed' : ''}`}>
            <div className="check-text">
              <span className="check-title">{item.title}</span>
              <span className="check-detail">{item.detail}</span>
            </div>
            <button
              className={`btn ${item.confirmed ? 'ok' : 'confirm'}`}
              onClick={() => {
                setActiveId(item.id);
                onConfirm(item.id);
              }}
              disabled={item.confirmed || busy}
              aria-label={`Confirm ${item.title}`}
            >
              {busy && activeId === item.id && <span className="loader" />}
              {item.confirmed ? (
                <>
                  <span style={{ color: '#fff', marginRight: '6px' }}>✓</span> Confirmed
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </li>
        ))}
      </ul>

      <button
        className="btn primary big"
        onClick={onNext}
        disabled={!allDone || busy}
      >
        {busy && allDone && <span className="loader" />}
        {busy && allDone ? 'Proceeding...' : allDone ? 'Next' : `Confirm all ${items.length} items to continue`}
      </button>
    </section>
  );
}
