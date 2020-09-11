import React from 'react';
import { Heading3, Subheading3 } from '../atoms/Heading3';
import { GridContainer, HalfGird } from '../atoms/Grid';
import { TableContainer, TableEmpty, TableRow, TableRowLabel } from '../atoms/Table';
import { Status } from '../atoms/Status';
import { Link } from 'react-router-dom';
import { TinyButton } from '../atoms/Button';
import { HrefLink } from '../utility/href-link';
import { Pagination } from '../../../types/schemas/_pagination';
import { CrowdsourcingTask } from '../../../gateway/tasks/crowdsourcing-task';
import { stringify } from 'query-string';

export const ContributorTasks: React.FC<{
  projectId?: string | number;
  rootTaskId?: string;
  drafts: { tasks: CrowdsourcingTask[]; pagination: Pagination };
  reviews: { tasks: CrowdsourcingTask[]; pagination: Pagination };
}> = ({ drafts, reviews, projectId, rootTaskId }) => {
  return (
    <>
      <Heading3>Your contributions</Heading3>
      <GridContainer>
        <HalfGird $margin>
          <Subheading3>Contributions in progress</Subheading3>
          <TableContainer>
            {drafts && drafts.tasks.length ? (
              drafts.tasks.map(task => (
                <TableRow key={task.id}>
                  <TableRowLabel>
                    <Status status={task.status} text={task.status_text} />
                  </TableRowLabel>
                  <TableRowLabel>
                    <Link to={`${projectId ? `/projects/${projectId}` : ''}/tasks/${task.id}`}>{task.name}</Link>
                  </TableRowLabel>
                </TableRow>
              ))
            ) : (
              <TableEmpty>No contributions yet</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
        <HalfGird $margin>
          <Subheading3>Contributions in review</Subheading3>
          <TableContainer>
            {reviews && reviews.tasks.length ? (
              reviews.tasks.map(task => (
                <TableRow key={task.id}>
                  <TableRowLabel>
                    <Status status={task.status} text={task.status_text} />
                  </TableRowLabel>
                  <TableRowLabel>
                    <Link to={`${projectId ? `/projects/${projectId}` : ''}/tasks/${task.id}`}>{task.name}</Link>
                  </TableRowLabel>
                </TableRow>
              ))
            ) : (
              <TableEmpty>No contributions in review</TableEmpty>
            )}
          </TableContainer>
        </HalfGird>
      </GridContainer>
      <TinyButton as={HrefLink} href={`/tasks?${stringify({ type: 'crowdsourcing-task', root_task_id: rootTaskId })}`}>
        Browse all contributions
      </TinyButton>
    </>
  );
};
