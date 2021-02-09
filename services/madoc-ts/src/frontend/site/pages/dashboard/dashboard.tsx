import React from 'react';
import { ContributorTasks } from '../../features/ContributorTasks';
import { ReviewerTasks } from '../../features/ReviewerTasks';
import { UserGreeting } from '../../features/UserGreeting';
import { UserProjects } from '../../features/UserProjects';
import { UserStatistics } from '../../features/UserStatistics';

export const UserDashboard: React.FC = () => {
  return (
    <>
      <UserStatistics />

      <UserProjects />
    </>
  );
};
