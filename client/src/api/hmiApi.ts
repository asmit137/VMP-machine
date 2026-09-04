import type { HmiState, Scenario } from '../types';

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

async function request<T = HmiState>(
  path: string,
  method: 'GET' | 'POST' = 'GET',
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? data.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  // ─── Scenario & state ───────────────────────────────────────────────────
  getScenario: (): Promise<Scenario> =>
    request<Scenario>('/scenario'),

  getHmiState: (): Promise<HmiState> =>
    request('/hmi/state'),

  // ─── Workflow ──────────────────────────────────────────────────────────
  nextStage:      (): Promise<HmiState> => request('/hmi/stage/next', 'POST'),
  startOperation: (): Promise<HmiState> => request('/hmi/operation/start', 'POST'),
  stopOperation:  (): Promise<HmiState> => request('/hmi/operation/stop', 'POST'),
  reset:          (): Promise<HmiState> => request('/hmi/reset', 'POST'),

  // ─── Machine simulation ────────────────────────────────────────────────
  closeDoor:          (): Promise<HmiState> => request('/machine/simulate/door/close', 'POST'),
  openDoor:           (): Promise<HmiState> => request('/machine/simulate/door/open', 'POST'),
  releaseEstop:       (): Promise<HmiState> => request('/machine/simulate/estop/release', 'POST'),
  pressEstop:         (): Promise<HmiState> => request('/machine/simulate/estop/press', 'POST'),
  triggerAlarm:       (): Promise<HmiState> => request('/machine/simulate/alarm/trigger', 'POST'),
  clearAlarm:         (): Promise<HmiState> => request('/machine/simulate/alarm/clear', 'POST'),
  completeReference:  (): Promise<HmiState> => request('/machine/simulate/reference/complete', 'POST'),
  resetReference:     (): Promise<HmiState> => request('/machine/simulate/reference/reset', 'POST'),

  // ─── Tool actions ──────────────────────────────────────────────────────
  loadTool:       (id: string): Promise<HmiState> => request(`/tools/${id}/load`, 'POST'),
  unloadTool:     (id: string): Promise<HmiState> => request(`/tools/${id}/unload`, 'POST'),
  setToolOffset:  (id: string): Promise<HmiState> => request(`/tools/${id}/set-offset`, 'POST'),
  confirmTool:    (id: string): Promise<HmiState> => request(`/tools/${id}/confirm`, 'POST'),
  resetTool:      (id: string): Promise<HmiState> => request(`/tools/${id}/reset`, 'POST'),

  // ─── Workpiece actions ─────────────────────────────────────────────────
  orientWorkpiece:   (): Promise<HmiState> => request('/workpiece/orient', 'POST'),
  clampWorkpiece:    (): Promise<HmiState> => request('/workpiece/clamp', 'POST'),
  establishPartZero: (): Promise<HmiState> => request('/workpiece/establish-zero', 'POST'),
  setWorkOffset:     (): Promise<HmiState> => request('/workpiece/set-offset', 'POST'),
  resetWorkpiece:    (): Promise<HmiState> => request('/workpiece/reset', 'POST'),
};
