import React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams } from 'react-router-dom';
import ReactTimeago from 'react-timeago';
import styled, { css } from 'styled-components';
import { SubjectSnippet } from '../../../../../extensions/tasks/resolvers/subject-resolver';
import { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import { extractIdFromUrn } from '../../../../../utility/parse-urn';
import { SimpleStatus } from '../../../../shared/atoms/SimpleStatus';
import { DisplayBreadcrumbs } from '../../../../shared/components/Breadcrumbs';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useData } from '../../../../shared/hooks/use-data';
import { SimpleTable } from '../../../../shared/layout/SimpleTable';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../../shared/utility/href-link';
import { RefetchProvider } from '../../../../shared/utility/refetch-context';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { UniversalRoute } from '../../../../types';
import { useRelativeLinks } from '../../../hooks/use-relative-links';
import { useTaskMetadata } from '../../../hooks/use-task-metadata';

const TaskListContainer = styled.div`
  min-width: 0;
  flex: 1;
  overflow-x: hidden;
  height: 80vh;
  border-right: 3px solid #dbdbdb;
`;

const TaskPreviewContainer = styled.div`
  padding: 1em;
  min-width: 700px;
`;

const ReviewListingContainer = styled.div`
  display: flex;
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
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    &:hover {
      background: none;
    }
  }
`;

export function ReviewListingPage({ route }: { route: UniversalRoute }) {
  const { t } = useTranslation();
  const { data, refetch } = useData<{ tasks: CrowdsourcingTask[] }>(ReviewListingPage);
  const params = useParams<{ taskId?: string }>();
  const createLink = useRelativeLinks();

  if (!data) {
    return <>Loading...</>;
  }

  if (data && !params.taskId && data.tasks[0]) {
    return <Redirect to={createLink({ taskId: undefined, subRoute: `reviews/${data.tasks[0].id}` })} />;
  }

  // 1. Make requests for all crowdsourcing tasks marked as in review.
  // 2. Make an infinite list of these
  // 3. Have an extra parameter for "selectedTask" for the right side
  // 4. Display current review interface
  // 5. Add alternative version with form and then actions, with a toggle.

  return (
    <RefetchProvider refetch={refetch}>
      <DisplayBreadcrumbs currentPage={t('Reviews')} />
      <ReviewListingContainer>
        <TaskListContainer>
          <SimpleTable.Table>
            <thead>
              <SimpleTable.Row>
                <SimpleTable.Header>Resource</SimpleTable.Header>
                <SimpleTable.Header>Date</SimpleTable.Header>
                <SimpleTable.Header>Status</SimpleTable.Header>
                <SimpleTable.Header>Contributor</SimpleTable.Header>
              </SimpleTable.Row>
            </thead>
            <tbody>
              {data?.tasks.map(task => (
                <SingleReviewTableRow key={task.id} task={task} active={task.id === params.taskId} />
              ))}
            </tbody>
          </SimpleTable.Table>
        </TaskListContainer>
        <TaskPreviewContainer>{renderUniversalRoutes(route.routes, { refetchListing: refetch })}</TaskPreviewContainer>
      </ReviewListingContainer>
    </RefetchProvider>
  );
}

function SingleReviewTableRow({ task, active }: { task: CrowdsourcingTask; active?: boolean }) {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const metadata = useTaskMetadata<{ subject?: SubjectSnippet }>(task);

  return (
    <ThickTableRow $active={active}>
      <SimpleTable.Cell style={{ textAlign: 'left' }}>
        <HrefLink
          href={createLink({
            taskId: undefined,
            subRoute: `reviews/${task.id}`,
          })}
        >
          {metadata && metadata.subject ? (
            metadata.subject.parent ? (
              <>
                <LocaleString>{metadata.subject.parent.label}</LocaleString> -{' '}
                <LocaleString>{metadata.subject.label}</LocaleString>
              </>
            ) : (
              <LocaleString>{metadata.subject.label}</LocaleString>
            )
          ) : (
            task.name
          )}
        </HrefLink>
      </SimpleTable.Cell>
      <SimpleTable.Cell style={{ paddingLeft: '1em' }}>
        {task.modified_at ? <ReactTimeago date={new Date(task.modified_at)} /> : null}
      </SimpleTable.Cell>
      <SimpleTable.Cell>
        <SimpleStatus status={task.status} status_text={task.status_text || ''} />
      </SimpleTable.Cell>
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
      all_tasks: true,
      type: 'crowdsourcing-task',
      root_task_id: project.task_id,
      // status: 2,
      per_page: 20,
      detail: true,
      ...vars.query,
    });
  },
});
