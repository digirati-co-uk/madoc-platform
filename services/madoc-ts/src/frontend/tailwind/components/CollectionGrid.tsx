import React, { ReactNode } from 'react';

export function CollectionGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 my-5">{children}</div>;
}
