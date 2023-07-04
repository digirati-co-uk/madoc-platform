import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ButtonRow, TinyButton } from '../../../shared/navigation/Button';
import { Heading3 } from '../../../shared/typography/Heading3';
import { Status } from '../../../shared/atoms/Status';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../../../shared/layout/Table';
import { HrefLink } from '../../../shared/utility/href-link';
import { isReviewer } from '../../../shared/utility/user-roles';
import { useRelativeLinks } from '../../hooks/use-relative-links';
import { useUserHomepage } from '../../hooks/use-user-homepage';

export const ReviewerTasks: React.FC = () => {
  const { data } = useUserHomepage();
  const { t } = useTranslation();
  const createLink = useRelativeLinks();

  if (!data || !isReviewer(data.userDetails)) {
    return null;
  }

  const reviews = data.reviewerTasks;

  return (
    <>
      <Heading3>{t('Review tasks')}</Heading3>
      <ButtonRow>
        <TinyButton as={HrefLink} href={`/tasks?type=crowdsourcing-review`}>
          {t('Browse all review tasks')}
        </TinyButton>
      </ButtonRow>
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
          <TableEmpty>{t('No reviews')}</TableEmpty>
        )}
      </TableContainer>
    </>
  );
};
