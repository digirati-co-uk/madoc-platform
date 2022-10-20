import React, { ComponentType, LazyExoticComponent } from 'react';

export function madocLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: ComponentType<any>
): LazyExoticComponent<T> {
  if (!(globalThis as any).window) {
    if (!fallback) {
      return React.Fragment as any;
    }

    return fallback as any;
  }

  return React.lazy(factory);
}
