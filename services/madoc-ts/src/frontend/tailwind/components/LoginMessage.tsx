import { ReactNode } from 'react';

export function LoginMessage(props: { children: ReactNode }) {
  return <div className="flex gap-2 mb-4 text-sm text-gray-600 bg-blue-100 p-4 rounded">{props.children}</div>;
}
