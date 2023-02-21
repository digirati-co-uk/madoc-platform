import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { SupportedExportResource } from '../../../extensions/project-export/types';
import { filePatternsToList } from '../../../extensions/project-export/utils/file-patterns-to-list';
import { useApi } from './use-api';
import { useProjectExports } from './use-project-exports';

export function useExportResourcePreview(
  selectedType: string | null,
  options: {
    subject: SupportedExportResource;
    subjectParent?: SupportedExportResource;
    context?: SupportedExportResource;
    config?: any;
    loadFiles?: boolean;
  }
) {
  const api = useApi();
  const items = useProjectExports(options.subject.type);
  const selected = selectedType ? items.find(r => r.type === selectedType) : null;
  const expectedFiles = useMemo(() => {
    if (selected) {
      return filePatternsToList(selected, { ...options });
    }

    return [];
  }, [options, selected]);

  const query = useQuery(
    ['export-item', { type: selectedType, ...options }],
    async () => {
      if (selected) {
        try {
          return await selected.exportData(options.subject, {
            subjectParent: options.subjectParent,
            api,
            config: options.config,
            context: options.subjectParent || options.context,
          });
        } catch (e) {
          console.log(e);
        }
      }
    },
    { enabled: options.loadFiles !== false }
  );

  return [query, selected, expectedFiles] as const;
}
