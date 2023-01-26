import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
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
import { ButtonIcon } from '../../../../shared/navigation/Button';
import { Chevron } from '../../../../shared/icons/Chevron';
import { useResizeLayout } from '../../../../shared/hooks/use-resize-layout';
import { LayoutHandle } from '../../../../shared/layout/LayoutContainer';
import ResizeHandleIcon from '../../../../shared/icons/ResizeHandleIcon';
import { stringify } from 'query-string';

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

export function ReviewListingPage() {
  const { t } = useTranslation();
  const { data, refetch } = useData<{ tasks: CrowdsourcingTask[] }>(ReviewListingPage);
  const params = useParams<{ taskId?: string }>();
  const createLink = useRelativeLinks();
  const { page, sort_by = '', ...query } = useLocationQuery();

  const QuerySortToggle = (field: string) => {
    const sort = sort_by.split(',');
    if (sort && sort.includes(`${field}:desc`)) {
      const i = sort.indexOf(`${field}:desc`);
      sort[i] = `${field}:asc`;
      return `?${stringify({ ...query, sort_by: sort.join(',') })}`;
    }
    if (sort && sort.includes(`${field}:asc`)) {
      const i = sort.indexOf(`${field}:asc`);
      sort.splice(i, 1);

      return `?${stringify({ ...query, sort_by: sort.join(',') })}`;
    }

    sort.push(`${field}:desc`);
    return `?${stringify({ ...query, sort_by: sort.join(',') })}`;
  };

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
                  <HrefLink
                    href={QuerySortToggle('subject')}
                    style={{ color: sort_by && sort_by.includes('subject:') ? '#3579f6' : 'black' }}
                  >
                    Manifest <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </HrefLink>
                </SimpleTable.Header>
                <SimpleTable.Header>
                  <HrefLink
                    href={QuerySortToggle('subject_parent')}
                    style={{ color: sort_by && sort_by.includes('subject_parent') ? '#3579f6' : 'black' }}
                  >
                    Canvas <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </HrefLink>
                </SimpleTable.Header>
                <SimpleTable.Header>
                  <HrefLink
                    href={QuerySortToggle('modified_at')}
                    style={{ color: sort_by && sort_by.includes('modified_at') ? '#3579f6' : 'black' }}
                  >
                    Modified <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </HrefLink>
                </SimpleTable.Header>
                <SimpleTable.Header>
                  <HrefLink
                    href={QuerySortToggle('status')}
                    style={{ color: sort_by && sort_by.includes('status') ? '#3579f6' : 'black' }}
                  >
                    Status <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </HrefLink>
                </SimpleTable.Header>
                <SimpleTable.Header>
                  <HrefLink
                    href={QuerySortToggle('user_identifier')}
                    style={{ color: sort_by && sort_by.includes('user_identifier') ? '#3579f6' : 'black' }}
                  >
                    Contributor <Chevron style={{ transform: 'rotate(0.25turn)' }} />
                  </HrefLink>
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
  const navigate = useNavigate();
  const metadata = useTaskMetadata<{ subject?: SubjectSnippet }>(task);

  return (
    <ThickTableRow
      $active={active}
      onClick={() => navigate(createLink({ taskId: undefined, subRoute: `reviews/${task.id}`, query }))}
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
