import { useEffect, useState } from 'react';

// useState backed by localStorage. Storage failures (corrupt JSON, exceeded quota)
// fall back to in-memory state instead of crashing the app.
export const usePersistedState = <T>(key: string, initialValue: T, onSaveError?: () => void) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initialValue;
    } catch (error) {
      console.warn(`Could not read saved data for ${key}`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Could not save data for ${key}`, error);
      onSaveError?.();
    }
    // onSaveError is only read when a save fails, so a new callback needs no re-save
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, value]);

  return [value, setValue] as const;
};
