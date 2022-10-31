import React, { ComponentType, PropsWithChildren, Suspense, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/use-api';

export const BrowserComponent: React.FC<{ fallback: any }> = ({ fallback, children }) => {
  const isServer = !(globalThis as any).window;

  if (isServer) {
    return fallback;
  }

  return <Suspense fallback={fallback}>{children}</Suspense>;
};

export function LazyBrowserComponent<Props, T extends ComponentType<Props>>({
  fallback,
  factory,
  ...props
}: PropsWithChildren<
  {
    factory: () => Promise<{ default: T }>;
    fallback: any;
  } & Props
>) {
  const Component = useMemo(() => {
    return React.lazy(factory);
  }, []);

  return <Component {...(props as any)} />;
}
