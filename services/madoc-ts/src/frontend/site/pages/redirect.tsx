import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router';

export const RedirectPage: React.FC = () => {
  const { pathname, search } = useLocation();
  const { pagePath } = useParams<{ pagePath: string }>();

  return (
    <Navigate
      to={{
        pathname: `/${pagePath}`,
        search,
      }}
      state={{ referrer: pathname }}
    />
  );
};
