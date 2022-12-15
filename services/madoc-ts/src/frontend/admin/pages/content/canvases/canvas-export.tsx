import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExportConfig } from '../../../../../extensions/project-export/types';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { EditorSlots } from '../../../../shared/capture-models/new/components/EditorSlots';
import { FilePreview } from '../../../../shared/components/FilePreview';
import { RichSelectionGrid } from '../../../../shared/components/RichSelectionGrid';
import { useApi } from '../../../../shared/hooks/use-api';
import { useExportResourcePreview } from '../../../../shared/hooks/use-export-resource-preview';
import { useProjectExports } from '../../../../shared/hooks/use-project-exports';
import { Spinner } from '../../../../shared/icons/Spinner';
import { EmptyState } from '../../../../shared/layout/EmptyState';

export function CanvasExport() {
  const params = useParams<'id' | 'manifestId'>();
  const api = useApi();
  const items = useProjectExports('canvas');
  const [selectedType, setSelected] = useState<string>('');
  const [config, setConfig] = useState<any>();
  const [{ data, isLoading }, selected, expectedFiles] = useExportResourcePreview(selectedType, {
    subject: { id: Number(params.id), type: 'canvas' },
    subjectParent: { id: Number(params.manifestId), type: 'manifest' },
    config: config,
  });

  const editorConfig = useMemo<ExportConfig['configuration'] | undefined>(() => {
    if (selected?.hookConfig) {
      const hooked = selected.hookConfig(
        { id: Number(params.id), type: 'canvas' },
        {
          config,
          api,
          subjectParent: { id: Number(params.manifestId), type: 'manifest' },
        },
        selected?.configuration
      );
      if (hooked) {
        return hooked;
      }
    }

    return selected?.configuration;
  }, [api, params.id, params.manifestId, selectedType]);

  useEffect(() => {
    setConfig(selected?.configuration?.defaultValues);
  }, [selectedType]);

  return (
    <div>
      <h2>Canvas export</h2>
      <RichSelectionGrid
        selected={[selectedType]}
        // onSelect={id => setSelected(s => (s.indexOf(id) === -1 ? [...s, id] : s.filter(i => i !== id)))}
        onSelect={id => setSelected(id)}
        items={items.map(item => ({
          id: item.type,
          label: item.metadata.label,
          description: item.metadata.description,
        }))}
      />

      {selected && selected.configuration && editorConfig ? (
        <EditShorthandCaptureModel
          slotConfig={{}}
          data={config}
          template={editorConfig.editor}
          onSave={newData => setConfig(newData)}
          saveLabel="Update"
          // fullDocument={!!document}
          keepExtraFields
        >
          <EditorSlots.TopLevelEditor />
        </EditShorthandCaptureModel>
      ) : null}
      {config ? <pre>{JSON.stringify(config, null, 2)}</pre> : null}

      {selected && isLoading ? (
        <EmptyState>
          <Spinner stroke="#000" />
        </EmptyState>
      ) : null}
      {selected && (!data || data.length === 0) && !isLoading ? <EmptyState>No exported data</EmptyState> : null}
      <>
        {data ? (
          <div style={{ marginTop: 10 }}>
            {data.map(file => (
              <FilePreview key={file.path} fileName={file.path}>
                {file.content}
              </FilePreview>
            ))}
          </div>
        ) : null}
      </>
    </div>
  );
}
