import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FilePreview } from '../../../../shared/components/FilePreview';
import { RichSelectionGrid } from '../../../../shared/components/RichSelectionGrid';
import { useExportResourcePreview } from '../../../../shared/hooks/use-export-resource-preview';
import { useProjectExports } from '../../../../shared/hooks/use-project-exports';
import { Spinner } from '../../../../shared/icons/Spinner';
import { EmptyState } from '../../../../shared/layout/EmptyState';

export function CanvasExport() {
  const params = useParams<'id' | 'manifestId'>();
  const items = useProjectExports('canvas');
  const [selectedType, setSelected] = useState<string>('');
  const [{ data, isLoading }, selected, expectedFiles] = useExportResourcePreview(selectedType, {
    subject: { id: Number(params.id), type: 'canvas' },
    subjectParent: { id: Number(params.manifestId), type: 'manifest' },
    config: {},
  });

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
