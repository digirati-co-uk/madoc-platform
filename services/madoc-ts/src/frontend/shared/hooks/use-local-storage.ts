import { useEffect, useRef, useState } from 'react';
import mitt from 'mitt';

const lsEmitter = mitt();

export function useLocalStorage<T>(key: string, initialValue?: T) {
  const lastStoredValue = useRef<string>();

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
        return initialValue as T;
      }
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      if (item) {
        lastStoredValue.current = item;
      }
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue as T;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: ((prev: T) => T) | T) => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        const valueJson = JSON.stringify(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, valueJson);
        // Store last changed value.
        lastStoredValue.current = valueJson;
        // Emit change for other hooks.
        lsEmitter.emit(`change:${key}`, { valueJson });
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  // Detect adjacent hook changes.
  useEffect(() => {
    const listener: any = ({ valueJson }: { valueJson: string | null }) => {
      if (valueJson && valueJson !== lastStoredValue.current) {
        try {
          setStoredValue(JSON.parse(valueJson));
          lastStoredValue.current = valueJson;
        } catch (e) {
          // unknown error.
        }
      }
    };

    lsEmitter.on(`change:${key}`, listener);

    return () => {
      lsEmitter.off(`change:${key}`, listener);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}
