import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExportConfig, SupportedExportResource } from '../../../../../extensions/project-export/types';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { EditorSlots } from '../../../../shared/capture-models/new/components/EditorSlots';
import { FilePreview } from '../../../../shared/components/FilePreview';
import { RichSelectionGrid } from '../../../../shared/components/RichSelectionGrid';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData, usePaginatedData } from '../../../../shared/hooks/use-data';
import { useExportResourcePreview } from '../../../../shared/hooks/use-export-resource-preview';
import { useExportResources } from '../../../../shared/hooks/use-export-resources';
import { useProjectExports } from '../../../../shared/hooks/use-project-exports';
import { Pagination } from '../../../molecules/Pagination';
import { ManifestCanvases } from './manifest-canvases';
import { ManifestProjects } from './manifest-projects';

export function ManifestExport() {
  const api = useApi();
  const params = useParams();
  const { resolvedData: data } = usePaginatedData(ManifestCanvases);
  const { data: allProjectsData } = useData(ManifestProjects);
  const manifestOptions = useProjectExports('manifest');
  const canvasOptions = useProjectExports('canvas');
  const [config, setConfig] = useState<any>();
  const [selectedType, setSelected] = useState<string>('');
  const subjects: SupportedExportResource[] = data?.manifest.items.map(r => ({ id: r.id, type: 'canvas' })) || [];
  const [expectedCanvasFiles, selected] = useExportResources(selectedType, {
    subjects,
    subjectsType: 'canvas',
    subjectParent: data ? { id: data.manifest.id, type: 'manifest' } : undefined,
    allProjects: allProjectsData?.projects.map(p => p.id),
    config,
  });
  const [{ data: manifestData }, , expectedManifestFiles] = useExportResourcePreview(selectedType, {
    subject: { id: Number(params.id), type: 'manifest' },
    config,
  });
  const editorConfig = useMemo<ExportConfig['configuration'] | undefined>(() => {
    if (selected?.hookConfig) {
      const hooked = selected.hookConfig(
        { id: Number(params.id), type: 'canvas' },
        {
          config,
          api,
          subjectParent: { id: Number(params.id), type: 'manifest' },
        },
        selected?.configuration
      );
      if (hooked) {
        return hooked;
      }
    }

    return selected?.configuration;
  }, [api, params.id, params.manifestId, selectedType]);

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

      {selected && selected.configuration && editorConfig ? (
        <EditShorthandCaptureModel
          slotConfig={{}}
          data={config || selected?.configuration?.defaultValues}
          template={editorConfig.editor}
          onSave={newData => setConfig(newData)}
          saveLabel="Update"
          // fullDocument={!!document}
          keepExtraFields
        >
          <EditorSlots.TopLevelEditor />
        </EditShorthandCaptureModel>
      ) : null}

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
                    config,
                  })
                  .catch(err => {
                    console.log(err);
                    return [];
                  })
                  .then(r => {
                    console.log('all', r);
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
