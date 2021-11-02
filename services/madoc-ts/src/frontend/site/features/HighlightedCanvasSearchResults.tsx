import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { InfoMessage } from '../../shared/callouts/InfoMessage';
import { useCanvasSearch } from '../../shared/hooks/use-canvas-search';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useRouteContext } from '../hooks/use-route-context';
import { CanvasHighlightedRegions } from './CanvasHighlightedRegions';

export const HighlightedCanvasSearchResults: React.FC = () => {
  const { canvasId } = useRouteContext<{ canvasId: number }>();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  const [searchText, highlightedRegions] = useCanvasSearch(canvasId);

  return (
    <>
      {highlightedRegions && highlightedRegions.bounding_boxes ? (
        <InfoMessage>
          {highlightedRegions.bounding_boxes.length} {t('Search results for {{searchText}}', { searchText })}{' '}
          <Link to={createLink()}>{t('Clear search')}</Link>
        </InfoMessage>
      ) : null}
    </>
  );
};

blockEditorFor(HighlightedCanvasSearchResults, {
  type: 'default.HighlightedCanvasSearchResults',
  label: 'Highlighted canvas search results',
  anyContext: ['canvas'],
  requiredContext: ['canvas'],
  editor: {},
});
