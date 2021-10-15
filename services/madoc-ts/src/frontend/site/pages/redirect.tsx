import React from 'react';
import { Redirect, useLocation, useParams } from 'react-router';

export const RedirectPage: React.FC = () => {
  const { pathname, search } = useLocation();
  const { pagePath } = useParams<{ pagePath: string }>();

  return (
    <Redirect
      to={{
        pathname: `/${pagePath}`,
        search,
        state: { referrer: pathname },
      }}
    />
  );
};
