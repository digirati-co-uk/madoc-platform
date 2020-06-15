import React, { ComponentType, PropsWithChildren, Suspense, useMemo } from 'react';
import { useIsServer } from '../components/SSRContext';

export const BrowserComponent: React.FC<{ fallback: any }> = ({ fallback, children }) => {
  const isServer = useIsServer();

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
