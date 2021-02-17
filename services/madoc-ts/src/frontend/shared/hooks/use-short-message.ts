import { useCallback, useEffect, useState } from 'react';

export function useShortMessage() {
  const [didSave, setDidSave] = useState(false);

  useEffect(() => {
    if (didSave) {
      const time = setTimeout(() => {
        setDidSave(false);
      }, 2000);

      return () => {
        clearTimeout(time);
      };
    }
  }, [didSave]);

  return [
    didSave,
    useCallback(() => {
      setDidSave(true);
    }, []),
  ] as const;
}
