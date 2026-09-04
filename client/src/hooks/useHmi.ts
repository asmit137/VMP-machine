import { useEffect, useState, useCallback } from 'react';
import type { Scenario, HmiState } from '../types';
import { api } from '../api/hmiApi';

export function useHmi() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [state, setState] = useState<HmiState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([api.getScenario(), api.getHmiState()])
      .then(([sc, st]) => {
        setScenario(sc);
        setState(st);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

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
    api,
  };
}
