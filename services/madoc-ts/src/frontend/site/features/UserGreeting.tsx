import React from 'react';
import { Heading2 } from '../../shared/atoms/Heading2';
import { useUserHomepage } from '../hooks/use-user-homepage';

export const UserGreeting: React.FC = () => {
  const { data } = useUserHomepage();

  if (!data) {
    return null;
  }

  return <Heading2 $margin>Welcome back {data.userDetails.user.name}</Heading2>;
};
