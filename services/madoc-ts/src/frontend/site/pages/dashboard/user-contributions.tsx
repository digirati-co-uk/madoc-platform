import React from 'react';
import { ContributorTasks } from '../../features/sharedFeatures/ContributorTasks';
import { UserStatistics } from '../../features/userDash/UserStatistics';

export const UserContributions: React.FC = () => {
  return (
    <>
      <UserStatistics />
      <ContributorTasks />
    </>
  );
};
