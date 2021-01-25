import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { InfoMessage } from '../../shared/atoms/InfoMessage';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';

export const CanvasSearchNotification: React.FC = () => {
  const { t } = useTranslation();
  const { canvasId } = useRouteContext();
  const [searchText, highlightedRegions] = useCanvasSearch(canvasId);
  const createLink = useRelativeLinks();

  if (!highlightedRegions || !highlightedRegions.bounding_boxes) {
    return null;
  }

  return (
    <InfoMessage>
      <span
        dangerouslySetInnerHTML={{
          __html: t('{{count}} Search results for <strong>{{searchText}}</strong> ', {
            count: highlightedRegions.bounding_boxes.length,
            searchText,
          }),
        }}
      />
      <Link to={createLink()}>{t('Clear search')}</Link>
    </InfoMessage>
  );
};
