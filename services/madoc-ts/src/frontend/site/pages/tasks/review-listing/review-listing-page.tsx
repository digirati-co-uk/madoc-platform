import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useParams, useLocation, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { SubjectSnippet } from '../../../../../extensions/tasks/resolvers/subject-resolver';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { extractIdFromUrn } from '../../../../../utility/parse-urn';
import { SimpleStatus } from '../../../../shared/atoms/SimpleStatus';
import { DisplayBreadcrumbs } from '../../../../shared/components/Breadcrumbs';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useData } from '../../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { SimpleTable } from '../../../../shared/layout/SimpleTable';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../../shared/utility/href-link';
import { RefetchProvider } from '../../../../shared/utility/refetch-context';
import { useRelativeLinks } from '../../../hooks/use-relative-links';
import { useTaskMetadata } from '../../../hooks/use-task-metadata';
import { ButtonIcon, TextButton } from '../../../../shared/navigation/Button';
import ReactTooltip from 'react-tooltip';
import { Chevron } from '../../../../shared/icons/Chevron';
import { useResizeLayout } from '../../../../shared/hooks/use-resize-layout';
import { LayoutHandle } from '../../../../shared/layout/LayoutContainer';
import ResizeHandleIcon from '../../../../shared/icons/ResizeHandleIcon';

const TaskListContainer = styled.div`
  height: 80vh;
  overflow: scroll;
  background: #fff;
`;

const TaskPreviewContainer = styled.div`
  min-width: 550px;
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
  ${SimpleTable.Cell} {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      background: none;
    }
  }
`;

export function ReviewListingPage() {
  const { t } = useTranslation();
  const { data, refetch } = useData<{ tasks: CrowdsourcingTask[] }>(ReviewListingPage);
  const params = useParams<{ taskId?: string }>();
  const createLink = useRelativeLinks();
  const navigate = useNavigate();
  const { page, ...query } = useLocationQuery();
  const location = useLocation();

  const { widthB, refs } = useResizeLayout(`review-dashboard-resize`, {
    left: true,
    widthB: '750px',
    minWidthPx: 400,
  });

  if (!data) {
    return <>Loading...</>;
  }

  if (data && !params.taskId && data.tasks[0]) {
    return <Navigate to={createLink({ taskId: undefined, subRoute: `reviews/${data.tasks[0].id}` })} />;
  }

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
          <SimpleTable.Table style={{ borderColor: 'transparent' }}>
            <thead>
              <SimpleTable.Row>
                <SimpleTable.Header>
                  <TextButton
                    style={{ color: query.sort_by && query.sort_by.includes('subject:') ? '#3579f6' : '' }}
                    onClick={e => {
                      if (query.sort_by === 'subject:desc') {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=subject:asc`);
                      } else if (query.sort_by === 'subject:asc') {
                        e.preventDefault();
                        navigate(`${location.pathname}`);
                      } else {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=subject:desc`);
                      }
                    }}
                  >
                    Manifest <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </TextButton>
                </SimpleTable.Header>
                <SimpleTable.Header>
                  <TextButton
                    style={{ color: query.sort_by && query.sort_by.includes('subject_parent') ? '#3579f6' : '' }}
                    onClick={e => {
                      if (query.sort_by === 'subject_parent:desc') {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=subject_parent:asc`);
                      } else if (query.sort_by === 'subject_parent:asc') {
                        e.preventDefault();
                        navigate(`${location.pathname}`);
                      } else {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=subject_parent:desc`);
                      }
                    }}
                  >
                    Canvas <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </TextButton>
                </SimpleTable.Header>
                <SimpleTable.Header>
                  <TextButton
                    style={{ color: query.sort_by && query.sort_by.includes('modified_by') ? '#3579f6' : '' }}
                    onClick={e => {
                      if (query.sort_by === 'modified_at:asc') {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=modified_at:desc`);
                      } else if (query.sort_by === 'modified_at:desc') {
                        e.preventDefault();
                        navigate(`${location.pathname}`);
                      } else {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=modified_at:asc`);
                      }
                    }}
                  >
                    Date <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </TextButton>
                </SimpleTable.Header>
                <SimpleTable.Header>
                  <TextButton
                    style={{ color: query.sort_by && query.sort_by.includes('status') ? '#3579f6' : '' }}
                    onClick={e => {
                      if (query.sort_by === 'status:desc') {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=status:asc`);
                      } else if (query.sort_by === 'status:asc') {
                        e.preventDefault();
                        navigate(`${location.pathname}`);
                      } else {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=status:desc`);
                      }
                    }}
                  >
                    Status <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </TextButton>
                </SimpleTable.Header>
                <SimpleTable.Header>
                  <TextButton
                    style={{ color: query.sort_by && query.sort_by.includes('user_identifier') ? '#3579f6' : '' }}
                    onClick={e => {
                      if (query.sort_by === 'user_identifier:desc') {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=user_identifier:asc`);
                      } else if (query.sort_by === 'user_identifier:asc') {
                        e.preventDefault();
                        navigate(`${location.pathname}`);
                      } else {
                        e.preventDefault();
                        navigate(`${location.pathname}?sort_by=user_identifier:desc`);
                      }
                    }}
                  >
                    Contributor <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </TextButton>
                </SimpleTable.Header>
              </SimpleTable.Row>
            </thead>
            <tbody>
              {data.tasks?.map(task => (
                <SingleReviewTableRow key={task.id} task={task} active={task.id === params.taskId} />
              ))}
            </tbody>
          </SimpleTable.Table>
        </TaskListContainer>
        <LayoutHandle ref={refs.resizer as any}>
          <ButtonIcon>
            <ResizeHandleIcon />
          </ButtonIcon>
        </LayoutHandle>
        <TaskPreviewContainer>
          <Outlet />
        </TaskPreviewContainer>
      </ReviewListingContainer>
    </RefetchProvider>
  );
}

function SingleReviewTableRow({ task, active }: { task: CrowdsourcingTask; active?: boolean }) {
  const { page, ...query } = useLocationQuery();
  const createLink = useRelativeLinks();
  const metadata = useTaskMetadata<{ subject?: SubjectSnippet }>(task);

  return (
    <ThickTableRow $active={active}>
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
        <HrefLink
          href={createLink({
            taskId: undefined,
            subRoute: `reviews/${task.id}`,
            query,
          })}
        >
          {metadata && metadata.subject ? <LocaleString>{metadata.subject.label}</LocaleString> : task.name}
        </HrefLink>
      </SimpleTable.Cell>
      {/* date */}
      <SimpleTable.Cell>
        <>
          {task.created_at ? (
            <div data-tip="created">{new Date(task.created_at).toLocaleDateString()}</div>
          ) : task.modified_at ? (
            <div data-tip="modified">{new Date(task.modified_at).toLocaleDateString()}</div>
          ) : null}
          <ReactTooltip place="bottom" type="dark" effect="solid" />
        </>
      </SimpleTable.Cell>
      {/* status */}
      <SimpleTable.Cell>
        <SimpleStatus status={task.status} status_text={task.status_text || ''} />
      </SimpleTable.Cell>
      {/* assignee */}
      <SimpleTable.Cell>
        {task.assignee ? (
          <HrefLink href={`/users/${extractIdFromUrn(task.assignee.id)}`}>{task.assignee.name}</HrefLink>
        ) : (
          ''
        )}
      </SimpleTable.Cell>
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
