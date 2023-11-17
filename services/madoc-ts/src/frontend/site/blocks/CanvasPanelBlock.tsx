import React, { DetailedHTMLProps } from 'react';
import { Helmet as _Helmet } from 'react-helmet';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';

const Helmet: any = _Helmet;

interface CanvasPanelBlockProps {
  //
  manifestId: string;
  canvasId: string;
  height: string;
  width: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'canvas-panel': DetailedHTMLProps<any, any>;
    }
  }
}

export function CanvasPanelBlock(props: CanvasPanelBlockProps) {
  const width = props.width || undefined;
  const height = props.height || undefined;
  return (
    <>
      <Helmet>
        <script src="https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@latest/dist/bundle.js" />
      </Helmet>
      <canvas-panel width={width} height={height} manifest-id={props.manifestId} canvas-id={props.canvasId} />
    </>
  );
}

blockEditorFor(CanvasPanelBlock, {
  label: 'Canvas panel block',
  requiredContext: [],
  anyContext: [],
  type: 'default.CanvasPanelBlock',
  defaultProps: {
    manifestId: '',
    canvasId: '',
    width: '',
    height: '',
  },
  editor: {
    manifestId: { type: 'text-field', label: 'Manifest id' },
    canvasId: { type: 'text-field', label: 'Canvas id' },
    width: { type: 'text-field', label: 'Width (optional)' },
    height: { type: 'text-field', label: 'Height (optional)' },
  },
});
