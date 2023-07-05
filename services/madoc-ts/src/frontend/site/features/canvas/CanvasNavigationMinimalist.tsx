import React from 'react';
import { useTranslation } from 'react-i18next';
import { useManifestStructure } from '../../../shared/hooks/use-manifest-structure';
import { createLink } from '../../../shared/utility/create-link';
import { PaginationContainer, PaginationText, NavigationButton } from '../../../shared/components/NavigationButton';

export const CanvasNavigationMinimalist: React.FC<{
  hash?: string;
  handleNavigation?: (canvasId: number) => Promise<void> | void;
  canvasId: string | number;
  manifestId?: string | number;
  projectId?: string | number;
  collectionId?: string | number;
  subRoute?: string;
  query?: any;
  size?: string | undefined;
}> = ({ canvasId: id, manifestId, projectId, collectionId, subRoute, query, handleNavigation, hash, size }) => {
  const structure = useManifestStructure(manifestId);
  const { t } = useTranslation();

  const idx = structure.data ? structure.data.ids.indexOf(Number(id)) : -1;

  if (!structure.data || idx === -1 || !manifestId) {
    return null;
  }

  return (
    <PaginationContainer style={{ display: 'flex' }} $size={size}>
      {idx > 0 ? (
        <NavigationButton
          alignment="left"
          onClick={e => {
            if (handleNavigation) {
              e.preventDefault();
              if (structure.data) {
                handleNavigation(structure.data.items[idx - 1].id);
              }
            }
          }}
          link={createLink({
            projectId,
            collectionId,
            manifestId,
            canvasId: structure.data.items[idx - 1].id,
            subRoute,
            query,
            hash,
          })}
          item={structure.data.items[idx - 1]}
        />
      ) : null}
      {
        <PaginationText>
          {t('Page {{page}} of {{count}}', {
            page: idx + 1,
            count: structure.data.items.length > 1 ? structure.data.items.length : 1,
          })}
        </PaginationText>
      }
      {idx < structure.data.items.length - 1 ? (
        <NavigationButton
          alignment="right"
          onClick={e => {
            if (handleNavigation) {
              e.preventDefault();
              if (structure.data) {
                handleNavigation(structure.data.items[idx + 1].id);
              }
            }
          }}
          link={createLink({
            projectId,
            collectionId,
            manifestId,
            canvasId: structure.data.items[idx + 1].id,
            subRoute,
            query,
            hash,
          })}
          item={structure.data.items[idx + 1]}
        />
      ) : null}
    </PaginationContainer>
  );
};
