import type { State } from '../types';

interface Props {
  state: State;
  busy: boolean;
  onProceed: () => void;
}

const GROUPS: { key: string; label: string }[] = [
  { key: 'machine_checks', label: 'Machine checks' },
  { key: 'tools', label: 'Tools' },
  { key: 'workpiece', label: 'Workpiece' },
];

export function ReadyReviewPage({ state, busy, onProceed }: Props) {
  return (
    <section className="card">
      <div className="ready-head">
        <h1>4 Ready review</h1>
        <span className="badge ready">READY</span>
      </div>
      <p className="subtitle">
        All checks confirmed. Review below and proceed to operation.
      </p>

      {GROUPS.map((g) => (
        <div key={g.key} className="review-group">
          <h2>{g.label}</h2>
          <ul className="review-list">
            {state.items
              .filter((i) => i.stage === g.key)
              .map((i) => (
                <li key={i.id}>
                  <span className="tick">✓</span> {i.title}
                </li>
              ))}
          </ul>
        </div>
      ))}

      <button className="btn primary big" onClick={onProceed} disabled={busy}>
        {busy && <span className="loader" />}
        {busy ? 'Proceeding...' : 'Proceed to operation'}
      </button>
    </section>
  );
}
