import React from 'react';
import { useManifestStructure } from '../hooks/use-manifest-structure';
import { createLink } from '../utility/create-link';
import { SnippetStructure } from './StructureSnippet';

export const CanvasNavigation: React.FC<{
  canvasId: string | number;
  manifestId?: string | number;
  projectId?: string | number;
  collectionId?: string | number;
  subRoute?: string;
  admin?: boolean;
  query?: any;
}> = ({ canvasId: id, manifestId, projectId, collectionId, subRoute, admin, query }) => {
  const structure = useManifestStructure(manifestId);

  const idx = structure.data ? structure.data.ids.indexOf(Number(id)) : -1;

  if (!structure.data || idx === -1 || !manifestId) {
    return null;
  }

  return (
    <div style={{ display: 'flex', marginTop: '1em', marginBottom: '1em' }}>
      {idx > 0 ? (
        <SnippetStructure
          label="Previous:"
          alignment="left"
          link={createLink({
            projectId,
            collectionId,
            manifestId,
            canvasId: structure.data.items[idx - 1].id,
            subRoute,
            query,
          })}
          item={structure.data.items[idx - 1]}
        />
      ) : null}
      {idx < structure.data.items.length - 1 ? (
        <SnippetStructure
          label="Next:"
          alignment="right"
          link={createLink({
            projectId,
            collectionId,
            manifestId,
            canvasId: structure.data.items[idx + 1].id,
            subRoute,
            query,
            admin,
          })}
          item={structure.data.items[idx + 1]}
        />
      ) : null}
    </div>
  );
};
