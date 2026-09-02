import { useEffect, useState, useCallback } from 'react';
import type { Scenario, State } from '../types';
import { api } from '../api/hmiApi';

export function useHmi() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [state, setState] = useState<State | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Load the preloaded scenario and the persisted session on first render.
  useEffect(() => {
    Promise.all([api.getScenario(), api.getState()])
      .then(([sc, st]) => {
        setScenario(sc);
        setState(st);
      })
      .catch((e) => setError(e.message));
  }, []);

  // Run an action, replace state with the server's response, surface errors.
  const run = useCallback(async (action: () => Promise<State>) => {
    setBusy(true);
    setError(null);
    try {
      setState(await action());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  return { scenario, state, error, busy, run, api };
}
