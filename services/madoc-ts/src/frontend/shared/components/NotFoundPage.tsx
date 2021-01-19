import React from 'react';

export const NotFoundPage: React.FC<{ error?: any }> = () => {
  return <h1>Not found</h1>;
};

export const ErrorPage: React.FC<{ error?: any }> = () => {
  return (
    <>
      <h1>An error occurred</h1>
    </>
  );
};
