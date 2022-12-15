import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { SupportedExportResource } from '../../../../../extensions/project-export/types';
import { FilePreview } from '../../../../shared/components/FilePreview';
import { RichSelectionGrid } from '../../../../shared/components/RichSelectionGrid';
import { useApi } from '../../../../shared/hooks/use-api';
import { usePaginatedData } from '../../../../shared/hooks/use-data';
import { useExportResourcePreview } from '../../../../shared/hooks/use-export-resource-preview';
import { useExportResources } from '../../../../shared/hooks/use-export-resources';
import { useProjectExports } from '../../../../shared/hooks/use-project-exports';
import { Pagination } from '../../../molecules/Pagination';
import { ManifestCanvases } from './manifest-canvases';

export function ManifestExport() {
  const api = useApi();
  const params = useParams();
  const { resolvedData: data } = usePaginatedData(ManifestCanvases);
  const manifestOptions = useProjectExports('manifest');
  const canvasOptions = useProjectExports('canvas');
  const [selectedType, setSelected] = useState<string>('');
  const subjects: SupportedExportResource[] = data?.manifest.items.map(r => ({ id: r.id, type: 'canvas' })) || [];
  const [expectedCanvasFiles, selected] = useExportResources(selectedType, {
    subjects,
    subjectsType: 'canvas',
    subjectParent: data ? { id: data.manifest.id, type: 'manifest' } : undefined,
  });
  const [{ data: manifestData }, , expectedManifestFiles] = useExportResourcePreview(selectedType, {
    subject: { id: Number(params.id), type: 'manifest' },
    config: {},
  });

  return (
    <div>
      <h2>Manifest export</h2>
      <RichSelectionGrid
        selected={[selectedType]}
        onSelect={id => setSelected(id)}
        items={[...manifestOptions, ...canvasOptions].map(item => ({
          id: item.type,
          label: item.metadata.label,
          description: item.metadata.description,
        }))}
      />

      {expectedManifestFiles && expectedManifestFiles.length ? (
        <div>
          {manifestData ? (
            <div style={{ marginTop: 10 }}>
              {manifestData.map(file => (
                <FilePreview key={file.path} fileName={file.path}>
                  {file.content}
                </FilePreview>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {expectedCanvasFiles && expectedCanvasFiles.length ? (
        <div style={{ marginTop: 10 }}>
          {data?.pagination.totalPages !== 1 ? (
            <Pagination
              page={data ? data.pagination.page : 1}
              totalPages={data ? data.pagination.totalPages : 1}
              stale={!data}
            />
          ) : null}
          {expectedCanvasFiles.map(file => (
            <FilePreview
              key={file.path}
              fileName={file.path}
              lazyLoad={() =>
                selected &&
                selected
                  .exportData(file.subject, {
                    subjectParent: { id: data?.manifest.id || 0, type: 'manifest' },
                    api,
                    config: {},
                  })
                  .then(r => {
                    return r?.find(item => item.path === file.path)?.content;
                  })
              }
            />
          ))}
          {data?.pagination.totalPages !== 1 ? (
            <Pagination
              page={data ? data.pagination.page : 1}
              totalPages={data ? data.pagination.totalPages : 1}
              stale={!data}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
