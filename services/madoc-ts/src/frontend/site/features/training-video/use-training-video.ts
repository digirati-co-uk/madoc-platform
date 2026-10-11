import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryCache } from 'react-query';
import { TrainingVideoWatchedResponse } from '../../../../types/schemas/training-video';
import { useApi } from '../../../shared/hooks/use-api';
import { useSiteConfiguration } from '../SiteConfigurationContext';
import { findTrainingVideoBlock, toPageApiPath, TrainingVideoContent } from './training-video-rules';

const WATCHED_KEY = ['training-video-watched'];

export interface TrainingVideoState {
  projectId?: number;
  helpPagePath?: string;
  video?: TrainingVideoContent;
  isLoggedIn: boolean;
  isWatched: boolean;
  isWatchedLoading: boolean;
  showOnContributionPage: boolean;
  hideHeaderButton: boolean;
  markWatched: () => Promise<void>;
  isMarkingWatched: boolean;
}

/**
 * The project's training video: where its help page is, the main video on it
 * (in the reader's language), and whether this volunteer has marked it watched.
 */
export function useTrainingVideo(projectSlug: string | undefined): TrainingVideoState {
  const api = useApi();
  const isServer = api.getIsServer();
  const queryCache = useQueryCache();
  const { i18n } = useTranslation();
  const { project: inheritedConfig } = useSiteConfiguration();
  const user = isServer ? undefined : api.getCurrentUser()?.user;

  // A plain query rather than apiHooks: these blocks are registered from the API client's own module,
  // and apiHooks reads ApiClient when it loads, which would be a circular import.
  const { data: project } = useQuery(
    ['training-video-project', projectSlug],
    () => api.getSiteProject(projectSlug as string),
    { enabled: !!projectSlug && !isServer, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );
  const projectId = project && project.id > 0 ? project.id : undefined;
  const config = project?.config;

  const helpPagePath = (config?.trainingVideoPage || inheritedConfig.trainingVideoPage || '').trim() || undefined;
  const options = { ...(inheritedConfig.trainingVideoOptions || {}), ...(config?.trainingVideoOptions || {}) };
  const pageApiPath = projectId ? toPageApiPath(helpPagePath) : undefined;

  const { data: pageResponse } = useQuery(
    ['training-video-page', pageApiPath],
    () => api.pageBlocks.getPage(pageApiPath as string),
    { enabled: !!pageApiPath && !isServer, staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false }
  );

  const video = useMemo(() => {
    const block = findTrainingVideoBlock(pageResponse?.page, i18n.language);
    const content = block?.static_data as TrainingVideoContent | undefined;
    return content?.link ? content : undefined;
  }, [pageResponse, i18n.language]);

  const { data: watched, isLoading: isWatchedLoading } = useQuery(WATCHED_KEY, () => api.getTrainingVideoWatched(), {
    enabled: !!user && !!video,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const [mark, { isLoading: isMarkingWatched }] = useMutation(async (id: number) => api.markTrainingVideoWatched(id), {
    onSuccess: (response: TrainingVideoWatchedResponse) => {
      queryCache.setQueryData(WATCHED_KEY, response);
    },
  });

  return {
    projectId,
    helpPagePath,
    video,
    isLoggedIn: !!user,
    isWatched: !!(projectId && watched?.watched[String(projectId)]),
    isWatchedLoading: !!user && !!video && isWatchedLoading,
    showOnContributionPage: !!options.showOnContributionPage,
    hideHeaderButton: !!options.hideHeaderButton,
    markWatched: async () => {
      if (projectId) {
        await mark(projectId, { throwOnError: true });
      }
    },
    isMarkingWatched,
  };
}
