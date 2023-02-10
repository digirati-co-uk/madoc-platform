import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { SubjectSnippet } from '../../../../../extensions/tasks/resolvers/subject-resolver';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { SimpleStatus } from '../../../../shared/atoms/SimpleStatus';
import { DisplayBreadcrumbs } from '../../../../shared/components/Breadcrumbs';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useInfiniteData } from '../../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { SimpleTable } from '../../../../shared/layout/SimpleTable';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../../shared/utility/href-link';
import { useRelativeLinks } from '../../../hooks/use-relative-links';
import { useTaskMetadata } from '../../../hooks/use-task-metadata';
import { Button, ButtonIcon } from '../../../../shared/navigation/Button';
import { Chevron } from '../../../../shared/icons/Chevron';
import { useResizeLayout } from '../../../../shared/hooks/use-resize-layout';
import { LayoutHandle } from '../../../../shared/layout/LayoutContainer';
import ResizeHandleIcon from '../../../../shared/icons/ResizeHandleIcon';
import { useInfiniteAction } from '../../../hooks/use-infinite-action';
import { RefetchProvider } from '../../../../shared/utility/refetch-context';
import { useRouteContext } from '../../../hooks/use-route-context';
import { ReviewNavigation } from './ReviewNagivation';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import ListItemIcon from '../../../../shared/icons/ListItemIcon';

const TaskListContainer = styled.div`
  height: 80vh;
  overflow: auto;
  position: relative;
  background: #fff;
`;

const TaskPreviewContainer = styled.div`
  min-width: 600px;
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
  color: black;

  svg {
    fill: #555555;
    vertical-align: middle;
    transition: background-color 0.2s, height 0.3s, transform 0.5s;
    transition-timing-function: ease-in-out;
    height: 2px;
    width: 12px;
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

export function ReviewListingPage() {
  const { t } = useTranslation();
  const params = useParams<{ taskId?: string }>();
  const { projectId } = useRouteContext();
  const createLink = useRelativeLinks();
  const { sort_by = '', ...query } = useLocationQuery();
  const navigate = useNavigate();

  const { widthB, refs } = useResizeLayout(`review-dashboard-resize`, {
    left: true,
    widthB: '750px',
    minWidthPx: 400,
  });

  const { data: pages, fetchMore, refetch, canFetchMore, isFetchingMore } = useInfiniteData(
    ReviewListingPage,
    undefined,
    {
      getFetchMore: lastPage => {
        if (lastPage.pagination.totalPages === lastPage.pagination.page) {
          return undefined;
        }
        return {
          page: lastPage.pagination.page + 1,
        };
      },
    }
  );

  const [loadMoreButton] = useInfiniteAction({
    fetchMore,
    canFetchMore,
    isFetchingMore,
    container: refs.resizableDiv,
  });

  const beforeNavigate = useCallback(
    async (newTaskId, page, getNext) => {
      if (!isFetchingMore && canFetchMore && getNext) {
        await fetchMore();
      }
      navigate(createLink({ taskId: undefined, subRoute: `reviews/${newTaskId}`, query: { sort_by }, hash: page }));
    },
    [canFetchMore, createLink, fetchMore, isFetchingMore, navigate, sort_by]
  );

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

  return (
    <RefetchProvider refetch={refetch}>
      <DisplayBreadcrumbs currentPage={t('Reviews')} />

      <ReviewListingContainer ref={refs.container as any}>
        <TaskListContainer ref={refs.resizableDiv as any} style={{ width: widthB }}>
          {!pages ? (
            <>Loading...</>
          ) : (
            <>
              <SimpleTable.Table style={{ borderColor: 'transparent' }}>
                <thead>
                  <SimpleTable.Row>
                    <SimpleTable.Header>
                      <HeaderLink
                        as={HrefLink}
                        href={QuerySortToggle('subject')}
                        data-is-active={sort_by && sort_by.includes('subject:')}
                        data-is-desc={sort_by && sort_by.includes('desc')}
                      >
                        Manifest <Chevron />
                      </HeaderLink>
                    </SimpleTable.Header>
                    <SimpleTable.Header>
                      <HeaderLink
                        as={HrefLink}
                        href={QuerySortToggle('subject_parent')}
                        data-is-active={sort_by && sort_by.includes('subject_parent')}
                        data-is-desc={sort_by && sort_by.includes('desc')}
                      >
                        Canvas <Chevron />
                      </HeaderLink>
                    </SimpleTable.Header>
                    <SimpleTable.Header>
                      <HeaderLink
                        as={HrefLink}
                        href={QuerySortToggle('modified_at')}
                        data-is-active={sort_by && sort_by.includes('modified_at')}
                        data-is-desc={sort_by && sort_by.includes('desc')}
                        data-no-sort={!sort_by}
                      >
                        Modified <Chevron />
                      </HeaderLink>
                    </SimpleTable.Header>
                    <SimpleTable.Header>
                      <HeaderLink
                        as={HrefLink}
                        href={QuerySortToggle('status')}
                        data-is-active={sort_by && sort_by.includes('status')}
                        data-is-desc={sort_by && sort_by.includes('desc')}
                      >
                        Status <Chevron />
                      </HeaderLink>
                    </SimpleTable.Header>
                    <SimpleTable.Header>
                      <HeaderLink
                        as={HrefLink}
                        href={QuerySortToggle('user_identifier')}
                        data-is-active={sort_by && sort_by.includes('user_identifier')}
                        data-is-desc={sort_by && sort_by.includes('desc')}
                      >
                        Assignee <Chevron />
                      </HeaderLink>
                    </SimpleTable.Header>
                  </SimpleTable.Row>
                </thead>
                <tbody>
                  {pages &&
                    pages.map(data =>
                      (data.tasks || []).map((task: CrowdsourcingTask) => {
                        return (
                          <SingleReviewTableRow
                            key={task.id}
                            task={task}
                            active={task.id === params.taskId}
                            page={data.pagination.page}
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
              <ReviewNavigation
                handleNavigation={beforeNavigate}
                taskId={params.taskId}
                pages={pages}
                projectId={projectId}
                query={sort_by ? { sort_by } : undefined}
              />
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

function SingleReviewTableRow({ task, active, page }: { task: CrowdsourcingTask; active?: boolean; page?: number }) {
  const { ...query } = useLocationQuery();
  const createLink = useRelativeLinks();
  const navigate = useNavigate();
  const metadata = useTaskMetadata<{ subject?: SubjectSnippet }>(task);

  return (
    <ThickTableRow
      tabIndex={0}
      $active={active}
      onClick={() =>
        navigate(
          createLink({ taskId: undefined, subRoute: `reviews/${task.id}`, query, hash: page ? page.toString() : '1' })
        )
      }
    >
      {/* manifest */}
      <SimpleTable.Cell style={{ maxWidth: 300 }}>
        {metadata.subject && metadata.subject.parent && (
          <LocaleString style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {metadata.subject.parent.label}
          </LocaleString>
        )}
      </SimpleTable.Cell>
      {/* resource name */}
      <SimpleTable.Cell>
        {metadata && metadata.subject ? <LocaleString>{metadata.subject.label}</LocaleString> : task.name}
      </SimpleTable.Cell>
      {/* date modified*/}
      <SimpleTable.Cell>
        {task.modified_at ? <> {new Date(task.modified_at).toLocaleDateString()} </> : null}
      </SimpleTable.Cell>
      {/* status */}
      <SimpleTable.Cell>
        <SimpleStatus status={task.status} status_text={task.status_text || ''} />
      </SimpleTable.Cell>
      {/* assignee */}
      <SimpleTable.Cell>{task.assignee ? task.assignee.name : ''}</SimpleTable.Cell>
    </ThickTableRow>
  );
}

serverRendererFor(ReviewListingPage, {
  getKey: (params, { preview, ...query }) => {
    return ['all-review-tasks', { query, projectSlug: params.slug }];
  },
  getData: async (key, vars, api) => {
    const slug = vars.projectSlug;
    const project = await api.getProject(slug);

    return api.getTasks(vars.page, {
      all_tasks: false,
      type: 'crowdsourcing-task',
      root_task_id: project.task_id,
      per_page: 20,
      detail: true,
      ...vars.query,
    });
  },
});
