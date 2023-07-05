import React from 'react';
import { Button } from '../../../shared/navigation/Button';
import { useManifestStructure } from '../../../shared/hooks/use-manifest-structure';
import { useUser } from '../../../shared/hooks/use-site';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRelativeLinks } from '../../hooks/use-relative-links';
import { useRouteContext } from '../../hooks/use-route-context';

export const GoToFirstCanvas: React.FC<{
  navigateToModel?: boolean;
  $primary?: boolean;
  $large?: boolean;
}> = ({ $primary, $large, children, navigateToModel }) => {
  const { projectId, manifestId } = useRouteContext();
  const createLink = useRelativeLinks();
  const { data } = useManifestStructure(manifestId);
  const user = useUser();
  const firstCanvas = data?.items[0];

  if (!projectId || !user || !manifestId) {
    return null;
  }

  const link = firstCanvas
    ? createLink({
        canvasId: firstCanvas.id,
        subRoute: navigateToModel ? 'model' : undefined,
      })
    : undefined;

  return (
    <Button as={link ? HrefLink : 'div'} href={link} $primary={$primary} $large={$large} disabled={!firstCanvas}>
      {children}
    </Button>
  );
};
