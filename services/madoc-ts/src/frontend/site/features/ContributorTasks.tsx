import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { ProjectFull } from '../../../types/schemas/project-full';
import { parseUrn } from '../../../utility/parse-urn';
import { ButtonRow, TinyButton } from '../../shared/navigation/Button';
import { GridContainer, HalfGird } from '../../shared/layout/Grid';
import { Heading3, Subheading3 } from '../../shared/typography/Heading3';
import { Status } from '../../shared/atoms/Status';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../../shared/layout/Table';
import { HrefLink } from '../../shared/utility/href-link';
import { isContributor } from '../../shared/utility/user-roles';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useUserHomepage } from '../hooks/use-user-homepage';

export const ContributorTasks: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useUserHomepage();
  const createLink = useRelativeLinks();

  const rootTaskMap = useMemo(() => {
    if (data && data.projects) {
      const map: { [id: string]: ProjectFull } = {};
      for (const project of data.projects) {
        map[project.task_id] = project;
      }
      return map;
    }

    return {};
  }, [data]);

  if (!data || !isContributor(data.userDetails)) {
    return null;
  }

  const drafts = data.contributorDraftTasks;
  const reviews = data.contributorReviewTasks;

  function getLink(task: BaseTask) {
    const fallback = `/tasks/${task.id}`;

    if (task.subject) {
      const parsedSubject = parseUrn(task.subject);
      if (!parsedSubject) {
        return fallback;
      }

      const projectId =
        task.root_task && rootTaskMap[task.root_task] ? task.root_task && rootTaskMap[task.root_task].slug : undefined;

      if (parsedSubject.type === 'manifest') {
        return createLink({
          projectId,
          manifestId: parsedSubject.id,
        });
      }

      if (!task.subject_parent || parsedSubject.type !== 'canvas') {
        return fallback;
      }

      const parsedParent = parseUrn(task.subject_parent);
      if (parsedParent && parsedParent.type === 'manifest') {
        return createLink({
          projectId,
          manifestId: parsedParent.id,
          canvasId: parsedSubject.id,
          subRoute: 'model',
          query: {
            revisionId: task.state?.revisionId,
          },
        });
      }
    }

    return fallback;
  }

  return (
    <>
      <Heading3>{t('Your contributions')}</Heading3>
      <ButtonRow>
        <TinyButton as={HrefLink} href={`/tasks?type=crowdsourcing-task`} $primary>
          {t('Browse all contributions')}
        </TinyButton>
      </ButtonRow>
      <GridContainer>
        <HalfGird $margin>
          <Subheading3>{t('Contributions in progress')}</Subheading3>
          <TableContainer>
            {drafts && drafts.tasks.length ? (
              drafts.tasks.map(task => (
                <TableRow key={task.id}>
                  <TableRowLabel>
                    <Status status={task.status} text={task.status_text} />
                  </TableRowLabel>
                  <TableRowLabel>
                    <Link to={getLink(task)}>{task.name}</Link>
                  </TableRowLabel>
                </TableRow>
              ))
            ) : (
              <TableEmpty>{t('No contributions yet')}</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
        <HalfGird $margin>
          <Subheading3>{t('Contributions in review')}</Subheading3>
          <TableContainer>
            {reviews && reviews.tasks.length ? (
              reviews.tasks.map(task => (
                <TableRow key={task.id}>
                  <TableRowLabel>
                    <Status status={task.status} text={task.status_text} />
                  </TableRowLabel>
                  <TableRowLabel>
                    <Link to={createLink({ taskId: task.id, query: { status: 2, type: 'crowdsourcing-task' } })}>
                      {task.name}
                    </Link>
                  </TableRowLabel>
                </TableRow>
              ))
            ) : (
              <TableEmpty>{t('No contributions in review')}</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
      </GridContainer>
    </>
  );
};
