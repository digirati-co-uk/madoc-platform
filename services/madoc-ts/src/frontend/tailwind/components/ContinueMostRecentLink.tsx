import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useContinueContribution } from '../../shared/hooks/use-continue-contribution';
import { useRecentUserTasks } from '../../shared/hooks/use-recent-user-tasks';
import { HrefLink } from '../../shared/utility/href-link';
import { useProjectShadowConfiguration } from '../../site/hooks/use-project-shadow-configuration';

export function ContinueMostRecentLink(props: { children?: (link: string) => ReactNode }) {
  const { t } = useTranslation();
  const recentTasks = useRecentUserTasks(1);
  const { showCaptureModelOnManifest } = useProjectShadowConfiguration();
  const mostRecent = useContinueContribution(
    recentTasks && recentTasks.length ? recentTasks[0].task : undefined,
    showCaptureModelOnManifest
  );

  if (!mostRecent) {
    return null;
  }

  if (props.children) {
    return <>{props.children(mostRecent)}</>;
  }

  return <HrefLink href={mostRecent}>{t('Continue where you left off')}</HrefLink>;
}
