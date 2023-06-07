import React from 'react';
import { ContributorTasks } from '../../features/contributor/ContributorTasks';
import { UserStatistics } from '../../features/contributor/UserStatistics';

export const UserContributions: React.FC = () => {
  return (
    <>
      <UserStatistics />
      <ContributorTasks />
    </>
  );
};
