import React from 'react';
import { ContributionsTasks } from '../../features/userDash/ContributionsTasks';
import { UserStatistics } from '../../features/userDash/UserStatistics';

export const UserContributions: React.FC = () => {
  return (
    <>
      <UserStatistics />
      <ContributionsTasks />
    </>
  );
};
