import React, { useContext, useMemo, useState } from 'react';
import { ProjectConfiguration } from '../../../types/schemas/project-configuration';
import { SitePage } from '../../../types/site-pages-recursive';

export type SiteConfigurationContext = {
  project: ProjectConfiguration;
  navigation: SitePage[];
  editMode: boolean;
  setEditMode: (value: boolean) => void;
};

const defaultSiteConfigurationContext: SiteConfigurationContext = {
  // This will be overridden.
  project: {} as any,
  navigation: [],
  editMode: false,
  setEditMode: (value: boolean) => {},
};

const Context = React.createContext<SiteConfigurationContext>(defaultSiteConfigurationContext);

export function useSiteConfiguration() {
  return useContext(Context);
}

export const ConfigProvider: React.FC<{ project?: Partial<ProjectConfiguration>; navigation?: SitePage[] }> = props => {
  const ctx = useSiteConfiguration();
  const [editMode, setEditMode] = useState(false);

  // Disabled claim granularity.
  if (props.project && props.project.claimGranularity && props.project.claimGranularity !== 'canvas') {
    props.project.claimGranularity = 'canvas';
  }

  const newContext: SiteConfigurationContext = useMemo(() => {
    return {
      project: {
        ...ctx.project,
        ...(props.project || {}),
      },
      navigation: [...ctx.navigation, ...(props.navigation || [])],
      setEditMode,
      editMode,
    };
  }, [ctx.project, ctx.navigation, props.project, props.navigation, editMode]);

  return <Context.Provider value={newContext}>{props.children}</Context.Provider>;
};
