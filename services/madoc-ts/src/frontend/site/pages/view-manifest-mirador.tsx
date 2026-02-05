import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useApi } from '../../shared/hooks/use-api';
import React, { useMemo } from 'react';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { useRouteContext } from '../hooks/use-route-context';
import { ErrorBoundary } from '../../shared/utility/error-boundary';

export const ViewManifestMirador: React.FC<{
  hideNavigation?: boolean;
  hideBreadcrumbs?: boolean;
}> = ({ hideNavigation, hideBreadcrumbs }) => {
  const { manifestId } = useRouteContext();

  const api = useApi();
  const slug = api.getSiteSlug();

  if (api.getIsServer() || !manifestId) {
    return null;
  }

  const embedUrl = useMemo(() => {
    const manifestUrl = `${window.location.origin}/s/${slug}/madoc/api/manifests/${manifestId}/export/source`;
    return `https://projectmirador.org/embed/?iiif-content=${encodeURIComponent(manifestUrl)}`;
  }, [manifestId, slug]);

  return (
    <ErrorBoundary>
      {hideBreadcrumbs ? null : <DisplayBreadcrumbs />}
      <div style={{ position: 'relative', height: '80vh' }}>
        {hideNavigation ? <style>{`.mirador-osd-navigation { display: none }`}</style> : null}
        <iframe
          title="Mirador viewer"
          src={embedUrl}
          style={{ border: 0, width: '100%', height: '100%' }}
          allowFullScreen
        />
      </div>
    </ErrorBoundary>
  );
};

blockEditorFor(ViewManifestMirador, {
  type: 'ViewManifestMirador',
  label: 'Mirador manifest viewer',
  requiredContext: ['manifest'],
  editor: {},
});
