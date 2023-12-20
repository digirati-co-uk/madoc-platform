import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { ProjectTemplate } from '../../../extensions/projects/types';
import { useApi } from './use-api';
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
  const api = useApi();
  const isInternal = nameOrUrl.startsWith('urn:madoc:project:');
  const isRemote = nameOrUrl.startsWith('http') || isInternal;
  const { data, status } = useQuery(
    ['get-remote-template', { key: nameOrUrl }],
    async () => {
      if (isInternal) {
        return await api.exportProject(parseInt(nameOrUrl.replace('urn:madoc:project:', ''), 10));
      }

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
