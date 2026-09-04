import type { HmiState, ToolSubstageStatus } from '../types';

interface Props {
  state: HmiState;
  busy: boolean;
  onNext: () => void;
  onSetOffset: (id: string) => void;
  onConfirmTool: (id: string) => void;
  onLoadTool: (id: string) => void;
  onResetTool: (id: string) => void;
}

function ToolDetail({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="tool-detail-row">
      <span className={`tool-detail-icon ${ok ? 'ok' : 'nok'}`}>{ok ? '✓' : '✗'}</span>
      <span className="tool-detail-label">{label}</span>
    </div>
  );
}

function ToolCard({
  status, busy, onLoad, onSetOffset, onConfirm, onReset,
}: {
  status: ToolSubstageStatus;
  busy: boolean;
  onLoad: () => void;
  onSetOffset: () => void;
  onConfirm: () => void;
  onReset: () => void;
}) {
  const { details, completed, title, id } = status;

  return (
    <div className={`tool-card ${completed ? 'tool-ready' : 'tool-nok'}`}>
      <div className="tool-card-header">
        <span className="tool-card-id">{id}</span>
        <span className="tool-card-name">{title.replace(`${id} - `, '')}</span>
        <span className={`tool-status-badge ${completed ? 'ok' : 'nok'}`}>
          {completed ? '✓ READY' : '✗ NOT READY'}
        </span>
      </div>

      <div className="tool-details">
        <ToolDetail label="Tool Loaded"        ok={details.loaded} />
        <ToolDetail label="Correct Tool Number" ok={details.toolNumberCorrect} />
        <ToolDetail label="Correct Tool Type"  ok={details.typeCorrect} />
        <ToolDetail label="Offset Available"   ok={details.offsetAvailable} />
        <ToolDetail label="Tool Confirmed"     ok={details.confirmed} />
      </div>

      <div className="tool-actions">
        {!details.loaded && (
          <button className="btn sim" onClick={onLoad} disabled={busy} id={`btn-load-${id}`}>
            Load Tool
          </button>
        )}
        {!details.offsetAvailable && details.loaded && (
          <button className="btn sim" onClick={onSetOffset} disabled={busy} id={`btn-offset-${id}`}>
            Set Offset
          </button>
        )}
        {!details.confirmed && details.loaded && details.offsetAvailable && (
          <button className="btn sim" onClick={onConfirm} disabled={busy} id={`btn-confirm-${id}`}>
            Confirm Tool
          </button>
        )}
        {(details.confirmed || details.offsetAvailable) && (
          <button className="btn sim-danger" onClick={onReset} disabled={busy} id={`btn-reset-${id}`}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export function ToolsPage({ state, busy, onNext, onSetOffset, onConfirmTool, onLoadTool, onResetTool }: Props) {
  const { toolStatuses, allToolsReady } = state.readiness;

  return (
    <section className="card">
      <h1>Required Tools</h1>
      <p className="subtitle">All required tools must be loaded, offset-set, and confirmed.</p>
      <p className="progress-count">
        {toolStatuses.filter(t => t.completed).length} of {toolStatuses.length} tools ready
      </p>

      <div className="tool-grid">
        {toolStatuses.map(ts => (
          <ToolCard
            key={ts.id}
            status={ts}
            busy={busy}
            onLoad={() => onLoadTool(ts.id)}
            onSetOffset={() => onSetOffset(ts.id)}
            onConfirm={() => onConfirmTool(ts.id)}
            onReset={() => onResetTool(ts.id)}
          />
        ))}
      </div>

      <div className="stage-footer">
        <button
          className="btn primary big"
          onClick={onNext}
          disabled={!allToolsReady || busy}
          id="tools-next-btn"
        >
          {busy ? <><span className="loader" />Checking…</> : allToolsReady ? 'Next →' : 'All tools must be ready to continue'}
        </button>
        {!allToolsReady && (
          <p className="stage-blocked-hint">
            {toolStatuses.filter(t => !t.completed).length} tool(s) not ready
          </p>
        )}
      </div>
    </section>
  );
}
