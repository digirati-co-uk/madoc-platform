import React from 'react';
import { useTranslation } from 'react-i18next';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { DisplayBreadcrumbs } from '../blocks/Breadcrumbs';
import { Button, ButtonIcon, ButtonRow } from '../../shared/navigation/Button';
import {
  LayoutContainer,
  LayoutContent,
  LayoutHandle,
  LayoutSidebar,
  OuterLayoutContainer,
} from '../../shared/layout/LayoutContainer';
import { TaskListContainer, TaskListInnerContainer } from '../../shared/atoms/TaskList';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useResizeLayout } from '../../shared/hooks/use-resize-layout';
import { useUser } from '../../shared/hooks/use-site';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { useInfiniteData } from '../../shared/hooks/use-data';
import { Pagination as PaginationType } from '../../../types/schemas/_pagination';
import { Link, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { TaskFilterStatuses } from '../features/tasks/TaskFilterStatuses';
import { TaskFilterType } from '../features/tasks/TaskFilterType';
import { TaskListItem } from '../features/tasks/TaskListItem';
import { useGoToQuery } from '../hooks/use-go-to-query';
import { useInfiniteAction } from '../hooks/use-infinite-action';
import { useRelativeLinks } from '../hooks/use-relative-links';
import ResizeHandleIcon from '../../shared/icons/ResizeHandleIcon';
import { useRouteContext } from '../hooks/use-route-context';

type AllTasksType = {
  query: any;
  variables: { page?: number; query: { type?: string }; projectSlug?: string };
  params: { slug?: string };
  data: { tasks: BaseTask[]; pagination: PaginationType };
};

export const AllTasks: UniversalComponent<AllTasksType> = createUniversalComponent<AllTasksType>(
  () => {
    const [isOpen, setIsOpen] = useLocalStorage('all-tasks-open', true);
    const { widthB, refs } = useResizeLayout('all-tasks', {
      left: true,
      widthB: '280px',
      maxWidthPx: 450,
      minWidthPx: 240,
      onDragEnd: () => {
        setIsOpen(true);
      },
    });
    const { taskId, slug } = useParams<{ taskId?: string; slug?: string }>();
    const { page, ...query } = useLocationQuery();
    const { projectId } = useRouteContext();
    const user = useUser();
    const isAdmin = user && user.scope && user.scope.indexOf('site.admin') !== -1;
    const isReviewer = isAdmin || (user && user.scope && user.scope.indexOf('tasks.create') !== -1);
    const {
      data: pages,
      fetchMore,
      canFetchMore,
      isFetchingMore,
    } = useInfiniteData(AllTasks, undefined, {
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
    const createLink = useRelativeLinks();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const goToQuery = useGoToQuery();

    // Different statuses by type.
    const statuses: any = {
      default: [
        { label: t('New'), value: 1 },
        { label: t('In progress'), value: 2 },
        { label: t('Complete'), value: 3 },
        { label: t('Rejected'), value: -1 },
      ],
      'crowdsourcing-review': [
        { label: t('In progress'), value: 1 },
        { label: t('New submissions'), value: 2 },
        { label: t('Completed'), value: 3 },
        { label: t('Rejected'), value: -1 },
      ],
      'crowdsourcing-task': [
        { label: t('In progress'), value: 1 },
        { label: t('In review'), value: 2 },
        { label: t('Approved'), value: 3 },
        { label: t('Rejected'), value: -1 },
      ],
    };

    if (!user) {
      return <Navigate to="/" />;
    }

    const viewProjectDash = projectId ? createLink({ projectId, subRoute: 'reviews' }) : undefined;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <DisplayBreadcrumbs currentPage={t('Tasks')} />
        <ButtonRow>
          {viewProjectDash ? (
            <Button as={Link} to={viewProjectDash}>
              {t('View project dashboard')}
            </Button>
          ) : null}

          {query.subject ? (
            <Button onClick={() => goToQuery({ subject: undefined })}>{t('Clear image filter')}</Button>
          ) : null}
          <TaskFilterStatuses statuses={query.type && statuses[query.type] ? statuses[query.type] : statuses.default} />
          <TaskFilterType
            types={[
              // List of types may vary by user/page
              { label: t('All'), value: '' },
              { label: t('Contributions'), value: 'crowdsourcing-task' },
              isReviewer ? { label: t('Reviews'), value: 'crowdsourcing-review' } : (null as any),
              !isAdmin || slug ? (null as any) : { label: t('Manifest import'), value: 'madoc-manifest-import' },
              !isAdmin || slug ? (null as any) : { label: t('Collection import'), value: 'madoc-collection-import' },
            ].filter(e => e !== null)}
          />
        </ButtonRow>

        <OuterLayoutContainer style={{ maxHeight: '80vh' }}>
          <LayoutContainer ref={refs.container as any}>
            <LayoutSidebar ref={refs.resizableDiv as any} $noScroll style={{ width: isOpen ? widthB : 0 }}>
              <TaskListContainer>
                <TaskListInnerContainer>
                  {pages
                    ? pages.map(data =>
                        (data.tasks || []).map(subtask => {
                          return (
                            <TaskListItem
                              task={subtask}
                              key={subtask.id}
                              onClick={() => navigate(createLink({ taskId: subtask.id, query }))}
                              selected={subtask.id === taskId}
                            />
                          );
                        })
                      )
                    : null}
                  <Button
                    ref={loadMoreButton}
                    onClick={() => fetchMore()}
                    style={{ display: canFetchMore ? 'block' : 'none' }}
                  >
                    Load more
                  </Button>
                </TaskListInnerContainer>
              </TaskListContainer>
            </LayoutSidebar>
            <LayoutHandle ref={refs.resizer as any} onClick={() => setIsOpen(o => !o)}>
              <ButtonIcon>
                <ResizeHandleIcon />
              </ButtonIcon>
            </LayoutHandle>
            <LayoutContent $padding>
              <Outlet />
            </LayoutContent>
          </LayoutContainer>
        </OuterLayoutContainer>
      </div>
    );
  },
  {
    noSsr: true,
    getKey: (params, { preview, ...query }) => {
      return ['all-tasks', { query, projectSlug: params.slug }];
    },
    getData: async (key, vars, api) => {
      const slug = vars.projectSlug;
      if (slug) {
        const project = await api.getProject(slug);

        return api.getTasks(vars.page, {
          all_tasks: true,
          type: 'crowdsourcing-task',
          root_task_id: project.task_id,
          per_page: 20,
          detail: true,
          ...vars.query,
        });
      }

      return api.getTasks(vars.page, { all_tasks: true, detail: true, per_page: 20, ...vars.query });
    },
  }
);
