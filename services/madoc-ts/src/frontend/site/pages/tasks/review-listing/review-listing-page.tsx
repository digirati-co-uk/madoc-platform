import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { SubjectSnippet } from '../../../../../extensions/tasks/resolvers/subject-resolver';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { SimpleStatus } from '../../../../shared/atoms/SimpleStatus';
import { DisplayBreadcrumbs } from '../../../blocks/Breadcrumbs';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useInfiniteData } from '../../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { SimpleTable } from '../../../../shared/layout/SimpleTable';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../../shared/utility/href-link';
import { useRelativeLinks } from '../../../hooks/use-relative-links';
import { useTaskMetadata } from '../../../hooks/use-task-metadata';
import { Button, ButtonIcon, ButtonRow } from '../../../../shared/navigation/Button';
import { Chevron } from '../../../../shared/icons/Chevron';
import { useResizeLayout } from '../../../../shared/hooks/use-resize-layout';
import { LayoutHandle } from '../../../../shared/layout/LayoutContainer';
import ResizeHandleIcon from '../../../../shared/icons/ResizeHandleIcon';
import { useInfiniteAction } from '../../../hooks/use-infinite-action';
import { RefetchProvider } from '../../../../shared/utility/refetch-context';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import ListItemIcon from '../../../../shared/icons/ListItemIcon';
import { useKeyboardListNavigation } from '../../../hooks/use-keyboard-list-navigation';
import { useLocalStorage } from '../../../../shared/hooks/use-local-storage';
import { ItemFilter } from '../../../../shared/components/ItemFilter';

const TaskListContainer = styled.div`
  height: 80vh;
  overflow: auto;
  position: relative;
  background: #fff;
`;

const TaskPreviewContainer = styled.div`
  position: relative;
  min-width: 200px;
  flex: 1;
  width: 750px;
`;

const ReviewListingContainer = styled.div`
  display: flex;
  position: relative;
  background-color: #f7f7f7;
  margin-bottom: 1em;
  a {
    color: #2b669a;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const ThickTableRow = styled(SimpleTable.Row)<{ $active?: boolean }>`
  ${props =>
    props.$active &&
    css`
      background: #edf4fb;
    `}
  &:hover {
    background: #edf4fb;
    cursor: pointer;
  }
  ${SimpleTable.Cell} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background: none;
    }
  }
`;

const HeaderLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: black;

  svg {
    fill: #555555;
    vertical-align: middle;
    transition: background-color 0.2s, height 0.3s, transform 0.5s;
    transition-timing-function: ease-in-out;
    height: 2px;
    width: 16px;
    transform: rotatex(0deg);
    background-color: rgba(85, 85, 85, 1);
  }

  &[data-no-sort='true'] {
    & svg {
      height: 1em;
      width: 1em;
      transform: rotatex(180deg);
      background-color: rgba(85, 85, 85, 0);
    }
  }

  &[data-is-active='true'] {
    color: #3579f6;

    &[data-is-desc='true'] {
      & svg {
        height: 1em;
        width: 1em;
        transform: rotatex(0deg);
        background-color: rgba(85, 85, 85, 0);
      }
    }

    &[data-is-desc='false'] {
      & svg {
        height: 1em;
        width: 1em;
        transform: rotatex(180deg);
        background-color: rgba(85, 85, 85, 0);
      }
    }
  }
`;

const ResizeHandle = styled.div`
  position: absolute;
  right: 0;
  top: -8px;
  bottom: -8px;
  width: 18px;
  cursor: col-resize;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: transparent;

  &:hover {
    background-color: rgba(0, 0, 0, 0.15);
    svg {
      fill: #555555;
    }
  }

  svg {
    pointer-events: none;
    fill: transparent;
  }
`;

const ResizableHeader = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  &:hover ${ResizeHandle} {
    background-color: #dddddd;

    svg {
      fill: #555555;
    }
  }
`;

export function ReviewListingPage() {
  const { t } = useTranslation();
  const params = useParams<{ taskId?: string; slug?: string }>();
  const projectId = params.slug;
  const createLink = useRelativeLinks();
  const navigate = useNavigate();
  const { sort_by = '', status, assignee } = useLocationQuery();
  const [hideManifests, setHideManifests] = useLocalStorage('hide-manifest-reviews', false);

  const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({
    manifest: 320,
    canvas: 220,
    modified: 140,
    status: 140,
    assignee: 180,
  });

  const startResize = (column: string, startX: number) => {
    const startWidth = columnWidths[column];

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      setColumnWidths(w => ({
        ...w,
        [column]: Math.max(80, startWidth + delta),
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const REVIEW_STATUS_MAP: Record<string, number> = {
    todo: 1,
    in_review: 2,
    approved: 3,
    changes_requested: 4,
  };

  const { widthB, refs } = useResizeLayout(`review-dashboard-resize`, {
    left: true,
    widthB: '750px',
    minWidthPx: 200,
  });

  const {
    data: pages,
    fetchMore,
    refetch,
    canFetchMore,
    isFetchingMore,
  } = useInfiniteData(ReviewListingPage, undefined, {
    // keepPreviousData: true,
    refetchOnMount: true,
    forceFetchOnMount: true,
    getFetchMore: lastPage => {
      if (lastPage.pagination.totalPages === 0 || lastPage.pagination.totalPages === lastPage.pagination.page) {
        return undefined;
      }
      return {
        page: lastPage.pagination.page + 1,
      };
    },
  });

  const [loadMoreButton] = useInfiniteAction({
    fetchMore,
    canFetchMore,
    isFetchingMore,
    container: refs.resizableDiv,
  });

  const QuerySortToggle = (field: string) => {
    const sort = sort_by;
    if (sort && sort.includes(`${field}:desc`)) {
      return createLink({ taskId: undefined, subRoute: `reviews`, query: { sort_by: `${field}:asc` } });
    }
    if (sort && sort.includes(`${field}:asc`)) {
      return createLink({ taskId: undefined, subRoute: `reviews`, query: { sort_by: '' } });
    }
    return createLink({ taskId: undefined, subRoute: `reviews`, query: { sort_by: `${field}:desc` } });
  };

  // 1. Make requests for all crowdsourcing tasks marked as in review.
  // 2. Make an infinite list of these
  // 3. Have an extra parameter for "selectedTask" for the right side
  // 4. Display current review interface
  // 5. Add alternative version with form and then actions, with a toggle.
  const containerProps = useKeyboardListNavigation('data-review-task-row');

  return (
    <RefetchProvider refetch={refetch}>
      <DisplayBreadcrumbs currentPage={t('Reviews')} />

      <div style={{ paddingBottom: '0.5em' }}>
        <ButtonRow>
          <Button
            as={Link}
            to={createLink({ projectId: projectId, subRoute: 'tasks', query: { type: 'crowdsourcing-review' } })}
          >
            {t('Task view')}
          </Button>

          <Button onClick={() => setHideManifests(!hideManifests)}>
            {hideManifests ? t('Hide manifests') : t('Show manifests')}
          </Button>

          {(status || assignee) && (
            <Button as={Link} to={createLink({ projectId, subRoute: 'reviews', query: {} })}>
              {t('Reset filters')}
            </Button>
          )}

          {(() => {
            const selectedStatusKey =
              status && Object.entries(REVIEW_STATUS_MAP).find(([, v]) => String(v) === String(status))?.[0];
            return (
              <ItemFilter
                label={
                  status
                    ? t(
                        Object.entries(REVIEW_STATUS_MAP).find(([, v]) => String(v) === String(status))?.[0] ??
                          'Filter by status'
                      )
                    : t('Filter by status')
                }
                closeOnChange
                items={[
                  { key: 'todo', label: t('To do') },
                  { key: 'in_review', label: t('In review') },
                  { key: 'approved', label: t('Approved') },
                  { key: 'changes_requested', label: t('Changes requested') },
                ].map(s => ({
                  id: s.key,
                  label: s.label,
                  onChange: selected => {
                    navigate(
                      createLink({
                        projectId,
                        subRoute: 'reviews',
                        taskId: undefined,
                        query: {
                          status: selected ? REVIEW_STATUS_MAP[s.key] : undefined,
                          assignee,
                          page: undefined,
                        },
                      })
                    );
                  },
                }))}
                selected={selectedStatusKey ? [selectedStatusKey] : []}
              />
            );
          })()}
        </ButtonRow>
      </div>

      <ReviewListingContainer ref={refs.container as any}>
        <TaskListContainer ref={refs.resizableDiv as any} style={{ width: widthB }}>
          {!pages ? (
            <>Loading...</>
          ) : (
            <>
              <SimpleTable.Table
                style={{
                  tableLayout: 'fixed',
                  width: '100%',
                }}
              >
                <colgroup>
                  <col style={{ width: columnWidths.manifest }} />
                  <col style={{ width: columnWidths.canvas }} />
                  <col style={{ width: columnWidths.modified }} />
                  <col style={{ width: columnWidths.status }} />
                  <col style={{ width: columnWidths.assignee }} />
                </colgroup>
                <thead>
                  <SimpleTable.Row style={{ height: 47 }}>
                    <SimpleTable.Header style={{ width: columnWidths.manifest, position: 'relative' }}>
                      <ResizableHeader>
                        <HeaderLink
                          as={HrefLink}
                          href={QuerySortToggle('subject')}
                          data-is-active={sort_by && sort_by.includes('subject:')}
                          data-is-desc={sort_by && sort_by.includes('desc')}
                        >
                          Manifest <Chevron />
                        </HeaderLink>
                        <ResizeHandle
                          onMouseDown={e => startResize('manifest', e.clientX)}
                          onClick={e => e.stopPropagation()}
                        >
                          <ResizeHandleIcon />
                        </ResizeHandle>
                      </ResizableHeader>
                    </SimpleTable.Header>
                    <SimpleTable.Header style={{ width: columnWidths.canvas, position: 'relative' }}>
                      <ResizableHeader>
                        <HeaderLink
                          as={HrefLink}
                          href={QuerySortToggle('subject_parent')}
                          data-is-active={sort_by && sort_by.includes('subject_parent')}
                          data-is-desc={sort_by && sort_by.includes('desc')}
                        >
                          Canvas <Chevron />
                        </HeaderLink>
                        <ResizeHandle
                          className="resize-handle"
                          onMouseDown={e => startResize('canvas', e.clientX)}
                          onClick={e => e.stopPropagation()}
                        >
                          <ResizeHandleIcon />
                        </ResizeHandle>
                      </ResizableHeader>
                    </SimpleTable.Header>
                    <SimpleTable.Header style={{ width: columnWidths.modified, position: 'relative' }}>
                      <ResizableHeader>
                        <HeaderLink
                          as={HrefLink}
                          href={QuerySortToggle('modified_at')}
                          data-is-active={sort_by && sort_by.includes('modified_at')}
                          data-is-desc={sort_by && sort_by.includes('desc')}
                          data-no-sort={!sort_by}
                        >
                          Modified <Chevron />
                        </HeaderLink>
                        <ResizeHandle
                          className="resize-handle"
                          onMouseDown={e => startResize('modified', e.clientX)}
                          onClick={e => e.stopPropagation()}
                        >
                          <ResizeHandleIcon />
                        </ResizeHandle>
                      </ResizableHeader>
                    </SimpleTable.Header>
                    <SimpleTable.Header style={{ width: columnWidths.status, position: 'relative' }}>
                      <ResizableHeader>
                        <HeaderLink
                          as={HrefLink}
                          href={QuerySortToggle('status')}
                          data-is-active={sort_by && sort_by.includes('status')}
                          data-is-desc={sort_by && sort_by.includes('desc')}
                        >
                          Status <Chevron />
                        </HeaderLink>
                        <ResizeHandle
                          className="resize-handle"
                          onMouseDown={e => startResize('status', e.clientX)}
                          onClick={e => e.stopPropagation()}
                        >
                          <ResizeHandleIcon />
                        </ResizeHandle>
                      </ResizableHeader>
                    </SimpleTable.Header>
                    <SimpleTable.Header style={{ width: columnWidths.assignee, position: 'relative' }}>
                      <ResizableHeader>
                        <HeaderLink
                          as={HrefLink}
                          href={QuerySortToggle('user_identifier')}
                          data-is-active={sort_by && sort_by.includes('user_identifier')}
                          data-is-desc={sort_by && sort_by.includes('desc')}
                        >
                          Assignee <Chevron />
                        </HeaderLink>
                        <ResizeHandle
                          className="resize-handle"
                          onMouseDown={e => startResize('assignee', e.clientX)}
                          onClick={e => e.stopPropagation()}
                        >
                          <ResizeHandleIcon />
                        </ResizeHandle>
                      </ResizableHeader>
                    </SimpleTable.Header>
                  </SimpleTable.Row>
                </thead>
                <tbody {...(containerProps as any)}>
                  {pages &&
                    pages.map(data =>
                      (data.tasks || []).map((task: CrowdsourcingTask, index: number) => {
                        return (
                          <SingleReviewTableRow
                            index={index}
                            key={task.id}
                            task={task}
                            active={task.id === params.taskId}
                            page={data.pagination.page}
                            hideManifests={hideManifests}
                            columnWidths={columnWidths}
                          />
                        );
                      })
                    )}
                </tbody>
              </SimpleTable.Table>
              <Button
                ref={loadMoreButton}
                onClick={() => fetchMore()}
                style={{ display: canFetchMore ? 'block' : 'none' }}
              >
                Load more
              </Button>
            </>
          )}
        </TaskListContainer>

        <LayoutHandle ref={refs.resizer as any}>
          <ButtonIcon>
            <ResizeHandleIcon />
          </ButtonIcon>
        </LayoutHandle>
        <TaskPreviewContainer>
          {params.taskId ? (
            <>
              <Outlet />
            </>
          ) : (
            <EmptyState>
              <ListItemIcon />
              Select a list item from the left panel to view
            </EmptyState>
          )}
        </TaskPreviewContainer>
      </ReviewListingContainer>
    </RefetchProvider>
  );
}
function SingleReviewTableRow({
  task,
  active,
  page,
  index,
  hideManifests,
  columnWidths,
}: {
  task: CrowdsourcingTask;
  active?: boolean;
  page?: number;
  index: number;
  hideManifests?: boolean;
  columnWidths: Record<string, number>;
}) {
  const { ...query } = useLocationQuery();
  const createLink = useRelativeLinks({ subRoute: 'reviews' });
  const navigate = useNavigate();
  const metadata = useTaskMetadata<{ subject?: SubjectSnippet }>(task);

  if (metadata.subject?.type === 'manifest' && hideManifests) {
    return null;
  }

  return (
    <ThickTableRow
      tabIndex={index === 0 ? 0 : -1}
      data-review-task-row={index}
      $active={active}
      onClick={e => {
        if ((e.target as any)?.tagName === 'A') return;
        navigate(
          createLink({
            subRoute: `reviews`,
            taskId: task.id,
            query,
            hash: page ? page.toString() : '1',
          })
        );
      }}
    >
      {/* manifest */}
      <SimpleTable.Cell style={{ width: columnWidths.manifest }}>
        {metadata.subject && metadata.subject.type === 'manifest' ? (
          <LocaleString style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {metadata.subject.label}
          </LocaleString>
        ) : (
          metadata.subject?.parent && (
            <LocaleString style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {metadata.subject.parent.label}
            </LocaleString>
          )
        )}
      </SimpleTable.Cell>
      {/* resource name */}
      <SimpleTable.Cell style={{ width: columnWidths.canvas }}>
        {metadata.subject && metadata.subject.type === 'manifest'
          ? ''
          : metadata.subject?.label && <LocaleString>{metadata.subject.label}</LocaleString>}
      </SimpleTable.Cell>
      {/* date modified*/}
      <SimpleTable.Cell style={{ width: columnWidths.modified }}>
        {task.modified_at ? <> {new Date(task.modified_at).toLocaleDateString()} </> : null}
      </SimpleTable.Cell>
      {/* status */}
      <SimpleTable.Cell style={{ width: columnWidths.status }}>
        <SimpleStatus
          onClick={e => {
            e.stopPropagation();
            navigate(createLink({ subRoute: `reviews`, taskId: task.id, query: { status: task.status } }));
          }}
          status={task.status}
          status_text={task.status_text || ''}
        />
      </SimpleTable.Cell>
      {/* assignee */}
      <SimpleTable.Cell
        style={{ width: columnWidths.assignee }}
        onClick={e => {
          if (task.assignee) {
            e.stopPropagation();
            navigate(createLink({ subRoute: `reviews`, taskId: task.id, query: { assignee: task.assignee.id } }));
          }
        }}
        className="hover:underline"
      >
        {task.assignee ? task.assignee.name : ''}
      </SimpleTable.Cell>
    </ThickTableRow>
  );
}

serverRendererFor(ReviewListingPage, {
  noSsr: true,
  getKey: (params, { preview, ...query }) => {
    return ['all-review-tasks', { query, projectSlug: params.slug, page: query.page || 1 }];
  },
  getData: async (key, vars, api) => {
    const slug = vars.projectSlug;
    const project = slug ? await api.getProject(slug) : undefined;

    return api.getTasks(vars.page, {
      all_tasks: !project?.task_id,
      type: 'crowdsourcing-task',
      root_task_id: project?.task_id,
      per_page: 20,
      detail: true,
      ...vars.query,
    });
  },
});
