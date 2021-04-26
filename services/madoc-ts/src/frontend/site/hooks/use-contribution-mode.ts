import { useSiteConfiguration } from '../features/SiteConfigurationContext';

export function useContributionMode() {
  const {
    project: { contributionMode },
  } = useSiteConfiguration();

  return contributionMode || 'annotation';
}
