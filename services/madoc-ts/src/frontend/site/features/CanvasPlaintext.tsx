import React from 'react';
import { useData } from '../../shared/hooks/use-data';
import { CanvasLoader } from '../pages/loaders/canvas-loader';

export const CanvasPlaintext: React.FC = () => {
  const { data } = useData(CanvasLoader);

  if (!data || !data.plaintext) {
    return null;
  }

  return (
    <>
      <h4>Transcription</h4>
      <pre>{data.plaintext}</pre>
    </>
  );
};
