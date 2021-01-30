import React, { useContext, useMemo } from 'react';
import { ProjectConfiguration } from '../../../types/schemas/project-configuration';

export type SiteConfigurationContext = {
  project: ProjectConfiguration;
};

const defaultSiteConfigurationContext: SiteConfigurationContext = {
  // This will be overridden.
  project: {} as any,
};

const Context = React.createContext<SiteConfigurationContext>(defaultSiteConfigurationContext);

export function useSiteConfiguration() {
  return useContext(Context);
}

export const ConfigProvider: React.FC<{ project?: Partial<ProjectConfiguration> }> = props => {
  const ctx = useSiteConfiguration();
  const newContext: SiteConfigurationContext = useMemo(() => {
    return {
      project: {
        ...ctx.project,
        ...(props.project || {}),
      },
    };
  }, [ctx.project, props.project]);

  return <Context.Provider value={newContext}>{props.children}</Context.Provider>;
};
