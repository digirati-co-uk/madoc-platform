import { AtlasContextType } from '@atlas-viewer/atlas';
import React from 'react';
import { ViewContent } from '../../shared/components/ViewContent';
import { useApiCanvas } from '../../shared/hooks/use-api-canvas';

export const ViewContentFetch: React.FC<{
  id: number;
  height?: number;
  onCreated?: (rt: AtlasContextType) => void;
  onPanInSketchMode?: () => void;
}> = ({ id, height, children, onCreated, onPanInSketchMode }) => {
  const { data } = useApiCanvas(id);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <ViewContent
      height={height}
      target={[
        { type: 'Canvas', id: 'http://canvas/' + data.canvas.id },
        { type: 'Manifest', id: 'http://manifest/top' },
      ]}
      canvas={data.canvas}
      onCreated={onCreated}
      onPanInSketchMode={onPanInSketchMode}
    >
      {children}
    </ViewContent>
  );
};
