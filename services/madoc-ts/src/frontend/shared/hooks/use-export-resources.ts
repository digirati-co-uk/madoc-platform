import { useMemo } from 'react';
import { SupportedExportResource, SupportedExportResourceTypes } from '../../../extensions/project-export/types';
import { useProjectExports } from './use-project-exports';

export function useExportResources(
  selectedType: string | null,
  options: {
    subjectsType: SupportedExportResourceTypes;
    subjects: SupportedExportResource[];
    subjectParent?: SupportedExportResource;
    context?: SupportedExportResource;
    config?: any;
  }
) {
  const items = useProjectExports(options.subjectsType);
  const selected = selectedType ? items.find(r => r.type === selectedType) : null;

  const expectedFiles = useMemo(() => {
    const files = [];
    if (selected && selected.metadata.filePatterns) {
      for (const subject of options.subjects) {
        // This will be split
        for (const file of selected.metadata.filePatterns) {
          const manifest =
            subject.type === 'manifest'
              ? subject.id
              : options.subjectParent?.type === 'manifest'
              ? options.subjectParent.id
              : options.context?.type === 'manifest'
              ? options.context.id
              : null;
          const canvas = subject.type === 'canvas' ? subject.id : null;
          const project = options.context?.type === 'project' ? options.context.id : null;

          files.push({
            subject,
            path: file
              .replace(/\{manifest}/g, `${manifest}`)
              .replace(/\{canvas}/g, `${canvas}`)
              .replace(/\{project}/g, `${project}`),
          });
        }
      }
    }

    return files;
  }, [options, selected]);

  return [expectedFiles, selected] as const;
}
