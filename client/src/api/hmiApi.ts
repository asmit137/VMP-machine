import type { State, Scenario } from '../types';

// Remove any trailing slashes to prevent //api/scenario double-slash errors
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

async function request(path: string, method: 'GET' | 'POST' = 'GET'): Promise<State> {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getScenario: async (): Promise<Scenario> => {
    const res = await fetch(`${BASE}/api/scenario`);
    if (!res.ok) throw new Error('Failed to load scenario');
    return res.json();
  },
  getState: () => request('/state'),
  confirmItem: (id: string) => request(`/items/${id}/confirm`, 'POST'),
  next: () => request('/stage/next', 'POST'),
  start: () => request('/operation/start', 'POST'),
  stop: () => request('/operation/stop', 'POST'),
  reset: () => request('/reset', 'POST'),
};
