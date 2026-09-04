import type { Scenario } from '../types';

interface Props {
  scenario: Scenario;
  busy: boolean;
  onBegin: () => void;
}

export function PowerOnPage({ scenario, busy, onBegin }: Props) {
  return (
    <section className="card intro">
      <h1>Machine Powered On</h1>
      <p className="lead">
        Review the production job below. All startup checks must be completed before machining can begin.
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
          <dt>CNC Program</dt>
          <dd>{scenario.cncProgram} · {scenario.cncRevision}</dd>
        </div>
        <div>
          <dt>Fixture</dt>
          <dd>{scenario.fixture}</dd>
        </div>
        <div>
          <dt>Work Offset</dt>
          <dd>{scenario.workOffset}</dd>
        </div>
      </dl>
      <button className="btn primary big" onClick={onBegin} disabled={busy} id="power-begin-btn">
        {busy && <span className="loader" />}
        {busy ? 'Starting…' : 'Begin Startup Checks'}
      </button>
    </section>
  );
}
