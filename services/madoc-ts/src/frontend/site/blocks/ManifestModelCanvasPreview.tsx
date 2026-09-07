import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CustomRouteContext } from '../../shared/page-blocks/slot-context';
import { Link } from 'react-router-dom';
import { CanvasViewer } from '../features/canvas/CanvasViewer';
import { StandaloneCanvasViewer } from '../../shared/components/StandaloneCanvasViewer';
import { useRouteContext } from '../hooks/use-route-context';
import { useManifestPagination } from '../../shared/hooks/use-manifest-pagination';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { ManifestCanvasGrid } from './ManifestCanvasGrid';
import { useTranslation } from 'react-i18next';
import { ArrowForwardIcon } from '../../shared/icons/ArrowForwardIcon';
import { ArrowBackIcon } from '../../shared/icons/ArrowBackIcon';

const navigationLinkClassName =
  'inline-flex min-w-0 items-center justify-center rounded-[3px] border border-[rgba(27,31,35,0.15)] bg-gradient-to-b from-[#fafbfc] to-[#eff3f6] px-[1em] py-[0.4em] text-center text-[0.9em] leading-[1.18em] tracking-[0.25px] !text-[#333] no-underline hover:from-[#f0f3f6] hover:to-[#e6ebf1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 aria-disabled:pointer-events-none aria-disabled:cursor-not-allowed aria-disabled:opacity-60';

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
      <div className="my-[0.5em] [container-type:inline-size]">
        <div className="flex flex-col gap-2 rounded-[3px] bg-[#e6ecfe] p-[0.5em] [@container(min-width:640px)]:flex-row [@container(min-width:640px)]:justify-between">
          <Link className={navigationLinkClassName} to={createLink({ canvasId: '', subRoute: isModel ? 'model' : '' })}>
            {t('View all canvases')}
          </Link>
          <div className="grid grid-cols-2 gap-2 [@container(min-width:640px)]:flex">
            <Link
              className={navigationLinkClassName}
              aria-disabled={!prev}
              tabIndex={prev ? undefined : -1}
              onClick={event => {
                if (!prev) event.preventDefault();
              }}
              to={
                isModel
                  ? createLink({ canvasId: '', subRoute: 'model' }) + `/${prev}`
                  : createLink({ canvasId: prev || '', subRoute: '' })
              }
            >
              <ArrowBackIcon className="mr-[5px] shrink-0 text-[1.2em]" />
              <span>{t('Previous canvas')}</span>
            </Link>
            {manifestPagination ? (
              <div className="order-last col-span-2 flex items-center justify-center [@container(min-width:640px)]:order-none">
                {t('Page {{page}} of {{count}}', {
                  page: manifestPagination.currentPage,
                  count: manifestPagination.totalPages,
                })}
              </div>
            ) : null}
            <Link
              className={navigationLinkClassName}
              aria-disabled={!next}
              tabIndex={next ? undefined : -1}
              onClick={event => {
                if (!next) event.preventDefault();
              }}
              to={
                isModel
                  ? createLink({ canvasId: '', subRoute: 'model' }) + `/${next}`
                  : next
                    ? createLink({ canvasId: next, subRoute: '' })
                    : '#'
              }
            >
              <span>{t('Next canvas')}</span>
              <ArrowForwardIcon className="ml-[5px] shrink-0 text-[1.2em]" />
            </Link>
          </div>
        </div>
      </div>

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
