import { useMemo } from 'react';
import { SupportedExportResource, SupportedExportResourceTypes } from '../../../extensions/project-export/types';
import { filePatternsToList } from '../../../extensions/project-export/utils/file-patterns-to-list';
import { useProjectExports } from './use-project-exports';

export function useExportResources(
  selectedType: string | null,
  options: {
    subjectsType: SupportedExportResourceTypes;
    subjects: SupportedExportResource[];
    subjectParent?: SupportedExportResource;
    context?: SupportedExportResource;
    config?: any;
    allProjects?: number[];
  }
) {
  const items = useProjectExports(options.subjectsType);
  const selected = selectedType ? items.find(r => r.type === selectedType) : null;

  const expectedFiles = useMemo(() => {
    const files = [];

    if (selected && selected.metadata.filePatterns) {
      for (const subject of options.subjects) {
        files.push(...filePatternsToList(selected, { subject, ...options }));
      }
    }

    return files;
  }, [options, selected]);

  return [expectedFiles, selected] as const;
}
