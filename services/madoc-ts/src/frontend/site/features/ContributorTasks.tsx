import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TinyButton } from '../../shared/atoms/Button';
import { GridContainer, HalfGird } from '../../shared/atoms/Grid';
import { Heading3, Subheading3 } from '../../shared/atoms/Heading3';
import { Status } from '../../shared/atoms/Status';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { HrefLink } from '../../shared/utility/href-link';
import { isContributor } from '../../shared/utility/user-roles';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useUserHomepage } from '../hooks/use-user-homepage';

export const ContributorTasks: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useUserHomepage();
  const createLink = useRelativeLinks();

  if (!data || !isContributor(data.userDetails)) {
    return null;
  }

  const drafts = data.contributorDraftTasks;
  const reviews = data.contributorReviewTasks;

  return (
    <>
      <Heading3>{t('Your contributions')}</Heading3>
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
                    <Link to={`/tasks/${task.id}`}>{task.name}</Link>
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
                    <Link to={createLink({ taskId: task.id })}>{task.name}</Link>
                  </TableRowLabel>
                </TableRow>
              ))
            ) : (
              <TableEmpty>{t('No contributions in review')}</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
      </GridContainer>
      <TinyButton as={HrefLink} href={`/tasks?type=crowdsourcing-task`}>
        {t('Browse all contributions')}
      </TinyButton>
    </>
  );
};
