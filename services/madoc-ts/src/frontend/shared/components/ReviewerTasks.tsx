import React from 'react';
import { Heading3 } from '../atoms/Heading3';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../atoms/Table';
import { Status } from '../atoms/Status';
import { Link } from 'react-router-dom';
import { TinyButton } from '../atoms/Button';
import { HrefLink } from '../utility/href-link';
import { Pagination } from '../../../types/schemas/_pagination';
import { CrowdsourcingReview } from '../../../gateway/tasks/crowdsourcing-review';
import { stringify } from 'query-string';

export const ReviewerTasks: React.FC<{
  projectId?: string | number;
  rootTaskId?: string;
  reviews: { tasks: CrowdsourcingReview[]; pagination: Pagination };
}> = ({ reviews, rootTaskId, projectId }) => {
  return (
    <>
      <Heading3>Reviews</Heading3>
      <TableContainer>
        {reviews && reviews.tasks.length ? (
          reviews.tasks.map(task => (
            <TableRow key={task.id}>
              <TableRowLabel>
                <Status status={task.status} text={task.status_text} />
              </TableRowLabel>
              <TableRowLabel data-cy="task-name">
                <Link to={`${projectId ? `/projects/${projectId}` : ''}/tasks/${task.id}`}>{task.name}</Link>
              </TableRowLabel>
            </TableRow>
          ))
        ) : (
          <TableEmpty>No reviews</TableEmpty>
        )}
      </TableContainer>
      <TinyButton
        as={HrefLink}
        href={`/tasks?${stringify({ type: 'crowdsourcing-review', root_task_id: rootTaskId })}`}
      >
        Browse all reviews
      </TinyButton>
    </>
  );
};
