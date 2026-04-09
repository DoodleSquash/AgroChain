import { useState, useEffect } from 'react';

export function usePersistentState<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (state === undefined || state === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);

  return [state, setState];
}
