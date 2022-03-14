import React from 'react';
import { registerContent } from '../../../plugin-api/global-store';
import { ContentSpecification } from '../../../types/content-types';
import { AtlasViewerProps } from './Atlas';

declare module '../../../types/content-types' {
  export interface ContentTypeMap {
    atlas: AtlasViewerProps;
  }
}

const specification: ContentSpecification<AtlasViewerProps> = {
  label: 'Atlas Viewer',
  type: 'atlas',
  supports: target => {
    if (target.length < 2) {
      return false;
    }
    const canvas = target[target.length - 1];
    const manifest = target[target.length - 2];

    return (
      manifest &&
      (manifest.type || '').toLowerCase() === 'manifest' &&
      canvas &&
      (canvas.type || '').toLowerCase() === 'canvas'
    );
  },
  targetToState: (target, options) => {
    if (options.targetOverride) {
      return options.targetOverride;
    }
    const canvas = target[target.length - 1];
    const manifest = target[target.length - 2];
    return {
      manifestId: manifest.id,
      canvasId: canvas.id,
    };
  },
  description: 'Supports viewing IIIF Canvases inside of a Manifest.',
  defaultState: {
    canvasId: '',
    manifestId: '',
  },
  DefaultComponent: React.lazy(() => import(/* webpackChunkName: "atlas" */ './Atlas')),
};

registerContent(specification);

export default specification;
