import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TinyButton } from '../../shared/atoms/Button';
import { Heading3 } from '../../shared/atoms/Heading3';
import { Status } from '../../shared/atoms/Status';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../../shared/atoms/Table';
import { HrefLink } from '../../shared/utility/href-link';
import { isReviewer } from '../../shared/utility/user-roles';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useUserHomepage } from '../hooks/use-user-homepage';

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
      <Heading3>{t('Reviews')}</Heading3>
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
      <TinyButton as={HrefLink} href={`/tasks?type=crowdsourcing-review`}>
        {t('Browse all reviews')}
      </TinyButton>
    </>
  );
};
