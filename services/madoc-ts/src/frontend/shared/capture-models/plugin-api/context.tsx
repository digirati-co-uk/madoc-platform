import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { ContentTypeMap } from '../types/content-types';
import { PluginStore } from '../types/plugin-store';
import { pluginStore } from './globals';

export const PluginContext = React.createContext<PluginStore>(pluginStore);

PluginContext.displayName = 'Plugins';

export const PluginProvider: React.FC = ({ children }) => {
  return <PluginContext.Provider value={pluginStore}>{children}</PluginContext.Provider>;
};

export const ContentContext = createContext<{ type: string; state: any }>({ type: 'none', state: {} });

ContentContext.displayName = 'Content';

export function ContentProvider<
  Content extends ContentTypeMap,
  K extends keyof ContentTypeMap,
  State = Content[K]['state'],
>({
  type,
  state,
  children,
}: PropsWithChildren<{
  type: K;
  state: State;
}>): React.ComponentElement<any, any> {
  return (
    <ContentContext.Provider
      value={useMemo(() => {
        return { type, state };
      }, [state, type])}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const c = useContext(ContentContext);
  if (!c) throw new Error('useCtx must be inside a Provider with a value');
  return c;
}
