import { useTranslation } from 'react-i18next';
import { useSite, useUser } from '../../shared/hooks/use-site';
import { useProject } from './use-project';
import { useRouteContext } from './use-route-context';

export const useCurrentAdminPages = () => {
  const { slug } = useSite();
  const { manifestId, collectionId, canvasId } = useRouteContext();
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
      link: `/s/${slug}/madoc/admin/projects/${project.data?.id}`,
    });
  }

  if (collectionId) {
    availablePages.push({
      label: t('Collection'),
      link: `/s/${slug}/madoc/admin/collections/${collectionId}`,
    });
  }

  if (manifestId) {
    availablePages.push({
      label: t('Manifest'),
      link: `/s/${slug}/madoc/admin/manifests/${manifestId}`,
    });
  }

  if (canvasId && manifestId) {
    availablePages.push({
      label: t('Canvas'),
      link: `/s/${slug}/madoc/admin/manifests/${manifestId}/canvases/${canvasId}`,
    });
  }

  return availablePages;
};
