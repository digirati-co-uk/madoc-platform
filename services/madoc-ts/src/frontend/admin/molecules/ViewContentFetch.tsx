import React from 'react';
import { ViewContent } from '../../shared/components/ViewContent';
import { useApiCanvas } from '../../shared/hooks/use-api-canvas';

export const ViewContentFetch: React.FC<{ id: number }> = ({ id }) => {
  const { data } = useApiCanvas(id);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <ViewContent
      target={[
        { type: 'Canvas', id: 'http://canvas/' + data.canvas.id },
        { type: 'Manifest', id: 'http://manifest/top' },
      ]}
      canvas={data.canvas}
    />
  );
};
