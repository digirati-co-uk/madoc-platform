import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { SupportedExportResource } from '../../../extensions/project-export/types';
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
    const files = [];
    if (selected && selected.metadata.filePatterns) {
      // This will be split
      for (const file of selected.metadata.filePatterns) {
        const manifest =
          options.subject.type === 'manifest'
            ? options.subject.id
            : options.subjectParent?.type === 'manifest'
            ? options.subjectParent.id
            : options.context?.type === 'manifest'
            ? options.context.id
            : null;
        const canvas = options.subject.type === 'canvas' ? options.subject.id : null;
        const project = options.context?.type === 'project' ? options.context.id : null;

        files.push(
          file
            .replace(/\{manifest}/g, `${manifest}`)
            .replace(/\{canvas}/g, `${canvas}`)
            .replace(/\{project}/g, `${project}`)
        );
      }
    }

    return files;
  }, [options, selected]);

  const query = useQuery(
    ['export-item', { type: selectedType, ...options }],
    async () => {
      if (selected) {
        return selected.exportData(options.subject, {
          subjectParent: options.subjectParent,
          api,
          config: options.config,
          context: options.subjectParent || options.context,
        });
      }
    },
    { enabled: options.loadFiles !== false }
  );

  return [query, selected, expectedFiles] as const;
}
