import React from 'react';
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
