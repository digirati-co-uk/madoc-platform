import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom';
import { useManifestStructure } from '../../shared/hooks/use-manifest-structure';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';

export const RedirectToNextCanvas: React.FC<{ subRoute?: string }> = ({ subRoute }) => {
  const { manifestId, canvasId: id } = useRouteContext();
  const structure = useManifestStructure(manifestId);
  const createLink = useRelativeLinks();

  const idx = structure.data && id ? structure.data.ids.indexOf(id) : -1;

  if (!structure.data || idx === -1 || !manifestId) {
    return null;
  }

  if (idx < structure.data.items.length - 1) {
    return <Redirect to={createLink({ manifestId, canvasId: structure.data.items[idx + 1].id, subRoute })} />;
  }

  return null;
};
