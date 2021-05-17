import React, { useContext, useEffect, useMemo, useState } from 'react';
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
  setEditMode: (value: boolean) => {
    // no-op
  },
};

const Context = React.createContext<SiteConfigurationContext>(defaultSiteConfigurationContext);

export function useSiteConfiguration() {
  return useContext(Context);
}

export const ConfigProvider: React.FC<{ project?: Partial<ProjectConfiguration>; navigation?: SitePage[] }> = props => {
  const ctx = useSiteConfiguration();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setEditMode(ctx.editMode);
  }, [ctx.editMode]);

  const newContext: SiteConfigurationContext = useMemo(() => {
    return {
      project: {
        ...ctx.project,
        ...(props.project || {}),
      },
      navigation: [...ctx.navigation, ...(props.navigation || [])],
      setEditMode: value => {
        console.log('setting edit mode', value);
        ctx.setEditMode(value);
        setEditMode(value);
      },
      editMode,
    };
  }, [ctx, props.project, props.navigation, editMode]);

  return <Context.Provider value={newContext}>{props.children}</Context.Provider>;
};
