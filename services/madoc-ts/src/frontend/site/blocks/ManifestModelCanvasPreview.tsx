import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CustomRouteContext } from '../../shared/page-blocks/slot-context';
import { Button, ButtonIcon, ButtonRow } from '../../shared/navigation/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { CanvasViewer } from '../features/canvas/CanvasViewer';
import { StandaloneCanvasViewer } from '../../shared/components/StandaloneCanvasViewer';
import { useRouteContext } from '../hooks/use-route-context';
import { useManifestPagination } from '../../shared/hooks/use-manifest-pagination';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { ManifestCanvasGrid } from './ManifestCanvasGrid';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ArrowForwardIcon } from '../../shared/icons/ArrowForwardIcon';
import { ArrowBackIcon } from '../../shared/icons/ArrowBackIcon';

const CanvasNavigator = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5em;
  background: #e6ecfe;
  margin: 0.5em 0;
  border-radius: 3px;
`;

export function ManifestModelCanvasPreview(props: { isModel?: boolean }) {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { canvasId } = useRouteContext();
  const manifestPagination = useManifestPagination();
  const next = manifestPagination?.nextItem && manifestPagination.nextItem.id;
  const prev = manifestPagination?.prevItem && manifestPagination.prevItem.id;

  const isModel = props.isModel;

  if (!canvasId) {
    return <ManifestCanvasGrid inPage />;
  }

  return (
    <CustomRouteContext ctx={{ canvas: canvasId }}>
      <CanvasNavigator>
        <Button
          as={HrefLink}
          to={createLink({
            canvasId: '',
            subRoute: isModel ? 'model' : '',
          })}
        >
          {t('View all canvases')}
        </Button>
        <ButtonRow $noMargin>
          {isModel ? (
            <Button
              as={HrefLink}
              disabled={!prev}
              to={
                createLink({
                  canvasId: '',
                  subRoute: 'model',
                }) + `/${prev}`
              }
            >
              <ArrowBackIcon style={{ marginRight: 5, fontSize: '1.2em' }} />
              {t('Previous canvas')}
            </Button>
          ) : (
            <Button
              as={HrefLink}
              disabled={!prev}
              to={createLink({
                canvasId: prev || '',
                subRoute: '',
              })}
            >
              <ArrowBackIcon style={{ marginRight: 5, fontSize: '1.2em' }} />
              {t('Previous canvas')}
            </Button>
          )}
          {isModel ? (
            <Button
              disabled={!next}
              as={HrefLink}
              to={
                createLink({
                  canvasId: '',
                  subRoute: 'model',
                }) + `/${next}`
              }
            >
              {t('Next canvas')} <ArrowForwardIcon style={{ marginLeft: 5, fontSize: '1.2em' }} />
            </Button>
          ) : (
            <Button
              disabled={!next}
              style={{ marginLeft: '0.5em ' }}
              as={HrefLink}
              to={
                next
                  ? createLink({
                      canvasId: next,
                      subRoute: '',
                    })
                  : '#'
              }
            >
              {t('Next canvas')} <ArrowForwardIcon style={{ marginLeft: 5, fontSize: '1.2em' }} />
            </Button>
          )}
        </ButtonRow>
      </CanvasNavigator>

      <CanvasViewer>
        <StandaloneCanvasViewer canvasId={canvasId} isModel={isModel} />
      </CanvasViewer>
    </CustomRouteContext>
  );
}

blockEditorFor(ManifestModelCanvasPreview, {
  type: 'default.ManifestModelCanvasPreview',
  label: 'Manifest model canvas preview',
  requiredContext: ['project', 'manifest', 'canvas'],
  anyContext: [],
  editor: {},
});
