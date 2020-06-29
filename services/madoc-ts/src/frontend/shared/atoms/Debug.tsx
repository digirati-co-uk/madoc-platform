import React from 'react';
import { useLocationQuery } from '../hooks/use-location-query';

export const Debug: React.FC<{ children: any }> = ({ children }) => {
  const { debug } = useLocationQuery();

  if (!debug) return <React.Fragment />;

  return <pre>{JSON.stringify(children, null, 2)}</pre>;
};
