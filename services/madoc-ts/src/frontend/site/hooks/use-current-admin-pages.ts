import { useTranslation } from 'react-i18next';
import { useSite, useUser } from '../../shared/hooks/use-site';
import { useProject } from './use-project';
import { useRouteContext } from './use-route-context';

export const useCurrentAdminPages = () => {
  const { slug } = useSite();
  const { manifestId, collectionId, canvasId, topicType, topic } = useRouteContext();
  const user = useUser();
  const { t } = useTranslation();
  const project = useProject();
  const availablePages: Array<{ label: string; link: string }> = [];

  if (!user || !user.scope || user.scope.indexOf('site.admin') === -1) {
    return availablePages;
  }

  if (project && project.data) {
    // @todo requires ID, instead of link.
    availablePages.push({
      label: t('Project'),
      link: `/s/${slug}/admin/projects/${project.data?.id}`,
    });
  }

  if (collectionId) {
    availablePages.push({
      label: t('Collection'),
      link: `/s/${slug}/admin/collections/${collectionId}`,
    });
  }

  if (manifestId) {
    availablePages.push({
      label: t('Manifest'),
      link: `/s/${slug}/admin/manifests/${manifestId}`,
    });
  }

  if (canvasId && manifestId) {
    availablePages.push({
      label: t('Canvas'),
      link: `/s/${slug}/admin/manifests/${manifestId}/canvases/${canvasId}`,
    });
  }

  if (topicType) {
    availablePages.push({
      label: t('Topic type'),
      link: `/s/${slug}/admin/topics/${topicType}`,
    });

    if (topic) {
      availablePages.push({
        label: t('Topic'),
        link: `/s/${slug}/admin/topics/${topicType}/${topic}`,
      });
    }
  }

  return availablePages;
};
