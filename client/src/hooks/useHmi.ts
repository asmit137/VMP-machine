import { useEffect, useState, useCallback } from 'react';
import type { Scenario, HmiState } from '../types';
import { api } from '../api/hmiApi';

export function useHmi() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [state, setState] = useState<HmiState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Load scenario + full HMI state on mount
  useEffect(() => {
    Promise.all([api.getScenario(), api.getHmiState()])
      .then(([sc, st]) => {
        setScenario(sc);
        setState(st);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  /**
   * Execute any API action that returns a fresh HmiState.
   * Replaces state with the server response — no client-side recalculation.
   */
  const run = useCallback(async (action: () => Promise<HmiState>) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await action();
      setState(updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, []);

  /** Manually refresh state from the server without a mutation. */
  const refresh = useCallback(async () => {
    try {
      setState(await api.getHmiState());
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  return {
    scenario,
    state,
    error,
    busy,
    run,
    refresh,
    // Expose api so pages don't need to import separately
    api,
  };
}
