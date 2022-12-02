import { useState } from 'react';
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
  }
) {
  const api = useApi();
  const items = useProjectExports(options.subject.type);
  const selected = selectedType ? items.find(r => r.type === selectedType) : null;

  const query = useQuery(['export-item', { type: selectedType, ...options }], async () => {
    if (selected) {
      return selected.exportData(options.subject, {
        subjectParent: options.subjectParent,
        api,
        config: options.config,
        context: options.subjectParent || options.context,
      });
    }
  });

  return [query, selected] as const;
}
