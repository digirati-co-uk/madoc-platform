import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CustomRouteContext } from '../../shared/page-blocks/slot-context';
import { Button } from '../../shared/navigation/Button';
import { HrefLink } from '../../shared/utility/href-link';
import { CanvasViewer } from './CanvasViewer';
import { StandaloneCanvasViewer } from '../../shared/components/StandaloneCanvasViewer';
import { useRouteContext } from '../hooks/use-route-context';
import { useManifestPagination } from '../../shared/components/CanvasNavigationMinimalist';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { ManifestCanvasGrid } from './ManifestCanvasGrid';
import styled from 'styled-components';

const CanvasNavigator = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5em;
  background: #dddddd;
`;

export function ManifestModelCanvasPreview(props: { isModel?: boolean }) {
  const createLink = useRelativeLinks();
  const { canvasId } = useRouteContext();
  const manifestPagination = useManifestPagination();
  const next = manifestPagination?.nextItem && manifestPagination.nextItem.id;
  const prev = manifestPagination?.prevItem && manifestPagination.prevItem.id;

  const isModel = props.isModel;
  console.log(props.isModel);

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
          View all canvases
        </Button>
        <div>
          {prev && (
            <>
              {isModel ? (
                <Button
                  as={HrefLink}
                  to={
                    createLink({
                      canvasId: '',
                      subRoute: 'model',
                    }) + `/${prev}`
                  }
                >
                  Previous
                </Button>
              ) : (
                <Button
                  as={HrefLink}
                  to={createLink({
                    canvasId: prev,
                    subRoute: '',
                  })}
                >
                  Previous
                </Button>
              )}
            </>
          )}

          {next && (
            <>
              {isModel ? (
                <Button
                  style={{ marginLeft: '0.5em ' }}
                  as={HrefLink}
                  to={
                    createLink({
                      canvasId: '',
                      subRoute: 'model',
                    }) + `/${next}`
                  }
                >
                  Next
                </Button>
              ) : (
                <Button
                  style={{ marginLeft: '0.5em ' }}
                  as={HrefLink}
                  to={createLink({
                    canvasId: next,
                    subRoute: '',
                  })}
                >
                  next
                </Button>
              )}
            </>
          )}
        </div>
      </CanvasNavigator>

      <CanvasViewer>
        <StandaloneCanvasViewer canvasId={canvasId} />
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
