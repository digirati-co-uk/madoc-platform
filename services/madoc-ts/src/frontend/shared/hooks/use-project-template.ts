import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { ProjectTemplate } from '../../../extensions/projects/types';
import { useProjectTemplates } from './use-project-templates';

export function useProjectTemplate(name?: string): ProjectTemplate | undefined {
  const templates = useProjectTemplates();

  return useMemo(() => (name ? templates.find(t => t.type === name) : undefined), [name, templates]);
}

export function useRemoteProjectTemplate(
  nameOrUrl = 'custom',
  enabled = false
): [ProjectTemplate | undefined, boolean, string] {
  const existing = useProjectTemplate(nameOrUrl);
  const isRemote = nameOrUrl.startsWith('http');
  const { data, status } = useQuery(
    ['get-remote-template', { key: nameOrUrl }],
    async () => {
      const fetched = await fetch(nameOrUrl);
      return fetched.json();
    },
    { enabled: isRemote && enabled }
  );

  if (isRemote) {
    return [data, true, status];
  }

  return [existing, false, ''];
}
