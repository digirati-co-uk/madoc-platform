import React, { useContext, useMemo } from 'react';
import { ProjectConfiguration } from '../../../types/schemas/project-configuration';

export type SiteConfigurationContext = {
  project: ProjectConfiguration;
};

const defaultSiteConfigurationContext = {
  project: {
    // Need something here.. Will always be overridden
    allowCollectionNavigation: true,
    allowManifestNavigation: true,
    allowCanvasNavigation: true,
    randomlyAssignCanvas: false,
    priorityRandomness: true,
    claimGranularity: 'canvas',
    maxContributionsPerResource: false,
    allowSubmissionsWhenCanvasComplete: false,
    randomlyAssignReviewer: false,
    manuallyAssignedReviewer: null,
    adminsAreReviewers: true,
    hideCompletedResources: false,
    revisionApprovalsRequired: 20,
    contributionWarningTime: false,
    skipAutomaticOCRImport: false,
  } as const,
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
