import React from 'react';
import { ContributorTasks } from '../../features/ContributorTasks';
import { UserStatistics } from '../../features/UserStatistics';

export const UserContributions: React.FC = () => {
  return (
    <>
      <UserStatistics />
      <ContributorTasks />
    </>
  );
};
