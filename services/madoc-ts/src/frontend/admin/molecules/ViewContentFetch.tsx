import { Preset } from '@atlas-viewer/atlas';
import React, { useMemo } from 'react';
import { ViewContent } from '../../shared/components/ViewContent';
import { useApiCanvas } from '../../shared/hooks/use-api-canvas';
import { Spinner } from '../../shared/icons/Spinner';
import { BrowserComponent } from '../../shared/utility/browser-component';

export const ViewContentFetch: React.FC<{
  id: number;
  height?: number | string;
  onCreated?: (rt: Preset) => void;
  onPanInSketchMode?: () => void;
  homeCover?: true | false | 'start' | 'end';
  children?: React.ReactNode;
}> = ({ id, height, children, onCreated, onPanInSketchMode, homeCover }) => {
  const { data } = useApiCanvas(id);

  const canvas = useMemo(() => {
    if (!data) return null;
    return {
      ...data.canvas,
      id: data.canvas.source_id || 'http://canvas/' + data.canvas.id,
    };
  }, [data]);
  const target = useMemo(
    () =>
      canvas
        ? [
            { type: 'Canvas', id: canvas.id },
            { type: 'Manifest', id: 'http://manifest/top' },
          ]
        : [],
    [canvas]
  );

  if (!data || !canvas) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserComponent fallback={<Spinner />}>
      <ViewContent
        height={height}
        target={target}
        canvas={canvas as any}
        onCreated={onCreated}
        onPanInSketchMode={onPanInSketchMode}
        homeCover={homeCover}
      >
        {children}
      </ViewContent>
    </BrowserComponent>
  );
};
