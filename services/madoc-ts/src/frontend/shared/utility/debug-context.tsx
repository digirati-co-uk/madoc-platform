import React, { DependencyList, EffectCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ModalButton } from '../components/Modal';
import { Button } from '../plugins/public-api';

type DevContext = {
  ctx: {
    route?: any;
    hooks?: Record<string, number | undefined>;
  };
  setCtx: (ctx: DevContext['ctx'] | ((c: DevContext['ctx']) => DevContext['ctx'])) => void;
};

function noop() {
  // do nothing.
}

const DevOnlyDebugContext = React.createContext<DevContext>({ ctx: {}, setCtx: noop });

const DevOnlyDebug: React.FC = props => {
  const [ctx, setCtx] = useState<DevContext['ctx']>({});

  return (
    <DevOnlyDebugContext.Provider value={useMemo(() => ({ ctx, setCtx }), [ctx])}>
      <div style={{ position: 'fixed', bottom: 10, right: 50, padding: '0.4em', fontSize: '0.8em', zIndex: 10000 }}>
        <ModalButton
          title="Debug"
          render={() => (
            <>
              <pre>{JSON.stringify(ctx, null, 2)}</pre>
            </>
          )}
        >
          <Button $primary>Show debug</Button>
        </ModalButton>
      </div>
      {props.children}
    </DevOnlyDebugContext.Provider>
  );
};

export function useDebugEffect(effect: EffectCallback, deps?: DependencyList) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(effect, deps);
  }
}

export function useDebugContext(): Readonly<[DevContext['ctx'], DevContext['setCtx']]> {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { ctx, setCtx } = useContext(DevOnlyDebugContext);

    return [ctx, setCtx] as const;
  } else {
    return [{}, noop] as const;
  }
}

export const DebugContext: typeof DevOnlyDebug = process.env.NODE_ENV === 'development' ? DevOnlyDebug : React.Fragment;
