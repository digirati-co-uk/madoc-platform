import { useCallback, useRef, useState } from 'react';

export function useDecayState(duration = 1000) {
  const [isOn, setIsOn] = useState(false);
  const timeout = useRef<any>(undefined);
  const trigger = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setIsOn(true);
    timeout.current = setTimeout(() => {
      setIsOn(false);
      timeout.current = null;
    }, duration);
  }, [duration]);

  return [isOn, trigger] as const;
}
