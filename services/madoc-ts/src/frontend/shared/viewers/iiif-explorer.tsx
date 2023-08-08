import React from 'react';
import { madocLazy } from '../utility/madoc-lazy';
import '@manifest-editor/iiif-browser-bundle/dist-umd/style.css';

const ExplorerInner = madocLazy(() =>
  import('@manifest-editor/iiif-browser-bundle').then(m => ({ default: m.IIIFExplorer }))
);

export function IIIFExplorer(props: import('@manifest-editor/iiif-browser-bundle').IIIFExplorerProps) {
  return (
    <React.Suspense fallback={'loading...'}>
      <ExplorerInner {...props} />
    </React.Suspense>
  );
}
