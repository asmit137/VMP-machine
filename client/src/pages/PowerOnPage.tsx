import type { Scenario } from '../types';

interface Props {
  scenario: Scenario;
  busy: boolean;
  onBegin: () => void;
}

export function PowerOnPage({ scenario, busy, onBegin }: Props) {
  return (
    <section className="card intro">
      <h1>Machine powered on</h1>
      <p className="lead">
        Follow each instruction on screen. Confirm every item before moving on.
      </p>
      <dl className="meta">
        <div>
          <dt>Operation</dt>
          <dd>{scenario.operation}</dd>
        </div>
        <div>
          <dt>Material</dt>
          <dd>{scenario.material}</dd>
        </div>
        <div>
          <dt>Drawing</dt>
          <dd>{scenario.drawingRevision}</dd>
        </div>
        <div>
          <dt>CNC program</dt>
          <dd>
            {scenario.cncProgram} · {scenario.cncRevision}
          </dd>
        </div>
      </dl>
      <button className="btn primary big" onClick={onBegin} disabled={busy}>
        {busy && <span className="loader" />}
        {busy ? 'Starting...' : 'Begin startup'}
      </button>
    </section>
  );
}
