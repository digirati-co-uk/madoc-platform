import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CanvasNavigationMinimalist } from '../../shared/components/CanvasNavigationMinimalist';
import { LocaleString } from '../../shared/components/LocaleString';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { useData } from '../../shared/hooks/use-data';
import { GridIcon } from '../../shared/icons/GridIcon';
import { HrefLink } from '../../shared/utility/href-link';
import { ManifestLoader } from '../components';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';

const BrowseAll = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 40%;
  margin-left: 1rem;
  a {
    display: flex;
    align-items: center;
    font-size: 16px;
    color: #343a40;
  }
  svg {
    background-color: #ebebeb;
    padding: 0.05rem;
    margin-right: 1rem;
  }
`;

export const CanvasManifestNavigation: React.FC<{ subRoute?: string }> = ({ subRoute }) => {
  const { manifestId, collectionId, canvasId, projectId } = useRouteContext();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  const [searchText] = useCanvasSearch(canvasId);
  const { data: manifestResponse } = useData(ManifestLoader);
  const { showCanvasNavigation } = useCanvasNavigation();
  const manifest = manifestResponse?.manifest;

  if (!canvasId || !manifestId) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '60vw', fontSize: '24px', color: '#212529' }}>
        <LocaleString>{manifest ? manifest.label : { en: ['...'] }}</LocaleString>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '40%' }}>
        <BrowseAll>
          <HrefLink href={createLink({ manifestId: manifestId, canvasId: undefined, query: { listing: true } })}>
            <GridIcon style={{ width: '24px', height: '24px' }} />
            {t('Browse all')}
          </HrefLink>
        </BrowseAll>
        {showCanvasNavigation ? (
          <CanvasNavigationMinimalist
            manifestId={manifestId}
            canvasId={canvasId}
            projectId={projectId}
            collectionId={collectionId}
            query={searchText ? { searchText } : undefined}
            subRoute={subRoute}
          />
        ) : null}
      </div>
    </div>
  );
};
