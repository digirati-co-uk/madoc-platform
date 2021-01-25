import React from 'react';
import { Heading1 } from '../../shared/atoms/Heading1';
import { useUserHomepage } from '../hooks/use-user-homepage';

export const UserGreeting: React.FC = () => {
  const { data } = useUserHomepage();

  if (!data) {
    return null;
  }

  return <Heading1>Welcome back {data.userDetails.user.name}</Heading1>;
};
