import { useEffect, useMemo, useState } from 'react';
import { createHelper, SlowState, InputShape } from 'polygon-editor';

export function useHelper(data: any, render: (t: any, s: any) => void, commitShape: (shape: InputShape) => void) {
  const [state, setState] = useState<SlowState>({} as any);
  const helper = useMemo(() => {
    return createHelper(data, commitShape);
  }, []);

  useEffect(() => {
    helper.clock.start(render, setState);
    return () => {
      helper.clock.stop();
    };
  }, []);

  return {
    state,
    helper,
  };
}
