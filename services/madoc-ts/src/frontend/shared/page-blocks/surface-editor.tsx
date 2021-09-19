import React, { useMemo } from 'react';
import { Surface, SurfaceProps } from '../layout/Surface';
import { useBlockEditor } from './block-editor';

export const SurfaceEditor: React.FC<{
  surfaceContent: any;
  surfaceProps: SurfaceProps;
  onChange: (props: SurfaceProps) => void;
}> = ({ surfaceProps, onChange, surfaceContent }) => {
  const block = useMemo(() => {
    return {
      type: 'surface',
      static_data: surfaceProps,
      name: 'Surface',
      lazy: false,
    };
  }, [surfaceProps]);

  const { editor, preview } = useBlockEditor(block, data => {
    onChange(data.static_data);
  });

  return (
    <div>
      {preview ? <Surface {...preview.static_data}>{surfaceContent}</Surface> : null}
      <div>{editor}</div>
    </div>
  );
};
