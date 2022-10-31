import { Preset } from '@atlas-viewer/atlas';
import React, { useMemo, Suspense } from 'react';
import { ViewContent } from '../../shared/components/ViewContent';
import { useApiCanvas } from '../../shared/hooks/use-api-canvas';
import { Spinner } from '../../shared/icons/Spinner';
import { BrowserComponent } from '../../shared/utility/browser-component';

export const ViewContentFetch: React.FC<{
  id: number;
  height?: number;
  onCreated?: (rt: Preset) => void;
  onPanInSketchMode?: () => void;
}> = ({ id, height, children, onCreated, onPanInSketchMode }) => {
  const { data } = useApiCanvas(id);

  const canvas = useMemo(() => {
    if (!data) return null;
    return {
      ...data.canvas,
      id: data.canvas.source_id || 'http://canvas/' + data.canvas.id,
    };
  }, [data]);

  if (!data || !canvas) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserComponent fallback={<Spinner />}>
      <ViewContent
        height={height}
        target={[
          { type: 'Canvas', id: data.canvas.source_id || 'http://canvas/' + data.canvas.id },
          { type: 'Manifest', id: 'http://manifest/top' },
        ]}
        canvas={canvas as any}
        onCreated={onCreated}
        onPanInSketchMode={onPanInSketchMode}
      >
        {children}
      </ViewContent>
    </BrowserComponent>
  );
};
