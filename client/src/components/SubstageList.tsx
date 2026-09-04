// Sequential substage list — renders ready / current / locked workflow states
// when workflowState is provided, or plain ok / nok otherwise.
//
// MachineChecksPage passes SequentialSubstageStatus[] (has workflowState).
// WorkpiecePage / ToolsPage pass plain SubstageStatus[] (no workflowState).
// Both work with the same component.

import type { SequentialSubstageStatus, SubstageStatus, SubstageWorkflowState } from '../types';

// Accept either plain or sequential substage statuses
type AnySubstageStatus = SubstageStatus | SequentialSubstageStatus;

function getWorkflowState(s: AnySubstageStatus): SubstageWorkflowState | null {
  return 'workflowState' in s ? s.workflowState : null;
}

interface Props {
  title: string;
  subtitle?: string;
  statuses: AnySubstageStatus[];
  /** Optional simulation/operator controls rendered below the substage list */
  children?: React.ReactNode;
  /** The primary action button (Next / Start) */
  primaryButton: React.ReactNode;
}

// ─── Visual config per workflow state ────────────────────────────────────────

const SEQUENTIAL_CONFIG: Record<SubstageWorkflowState, {
  rowClass: string;
  iconClass: string;
  badgeClass: string;
  icon: string;
  label: string;
}> = {
  ready: {
    rowClass:  'substage-row ok',
    iconClass: 'substage-icon ok',
    badgeClass:'substage-badge ok',
    icon:      '✓',
    label:     'READY',
  },
  current: {
    rowClass:  'substage-row current',
    iconClass: 'substage-icon current',
    badgeClass:'substage-badge current',
    icon:      '▶',
    label:     'ACTIVE',
  },
  locked: {
    rowClass:  'substage-row locked',
    iconClass: 'substage-icon locked',
    badgeClass:'substage-badge locked',
    icon:      '🔒',
    label:     'LOCKED',
  },
};

// Plain ok/nok config (used when workflowState is not present)
const PLAIN_CONFIG = {
  ok:  { rowClass: 'substage-row ok',  iconClass: 'substage-icon ok',  badgeClass: 'substage-badge ok',  icon: '✓', label: 'READY' },
  nok: { rowClass: 'substage-row nok', iconClass: 'substage-icon nok', badgeClass: 'substage-badge nok', icon: '✗', label: 'NOT READY' },
};

export function SubstageList({ title, subtitle, statuses, children, primaryButton }: Props) {
  const isSequential = statuses.some(s => 'workflowState' in s);
  const done  = isSequential
    ? statuses.filter(s => getWorkflowState(s) === 'ready').length
    : statuses.filter(s => s.completed).length;
  const total = statuses.length;
  const allDone = total > 0 && done === total;

  return (
    <section className="card">
      <h1>{title}</h1>
      {subtitle && <p className="subtitle">{subtitle}</p>}
      <p className="progress-count">{done} of {total} conditions {isSequential ? 'ready' : 'met'}</p>

      <ul className="substage-list">
        {statuses.map(s => {
          const wfState = getWorkflowState(s);
          const cfg = wfState
            ? SEQUENTIAL_CONFIG[wfState]
            : (s.completed ? PLAIN_CONFIG.ok : PLAIN_CONFIG.nok);

          return (
            <li key={s.id} className={cfg.rowClass}>
              <span className={cfg.iconClass}>{cfg.icon}</span>
              <span className="substage-title">{s.title}</span>
              <span className={cfg.badgeClass}>{cfg.label}</span>
            </li>
          );
        })}
      </ul>

      {children && (
        <div className="sim-controls">
          <p className="sim-controls-label">Simulation Controls</p>
          <div className="sim-btns">
            {children}
          </div>
        </div>
      )}

      <div className="stage-footer">
        {primaryButton}
        {!allDone && (
          <p className="stage-blocked-hint">
            {isSequential
              ? 'Perform the highlighted action above to continue'
              : `${total - done} condition${total - done !== 1 ? 's' : ''} incomplete — use simulation controls above`}
          </p>
        )}
      </div>
    </section>
  );
}
