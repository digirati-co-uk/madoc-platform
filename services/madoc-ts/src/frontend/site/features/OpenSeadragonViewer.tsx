import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useCanvas, useImageService, useRenderingStrategy } from 'react-iiif-vault';
import { useOpenSeadragon } from 'use-open-seadragon';

export const OpenSeadragonViewer = forwardRef(function OpenSeadragonViewer(props: OSDViewerProps, ref) {
  const canvas = useCanvas();
  const [strategy] = useRenderingStrategy();
  const { data: service } = useImageService();

  if (strategy.type !== 'images' || !strategy.image) {
    return null;
  }

  if (!service) {
    return null;
  }

  return <InnerViewer key={canvas?.id} ref={ref} source={service} onReady={props.onReady} />;
});

export interface OSDViewerProps {
  onReady?: (osd: any) => void;
}

const InnerViewer = forwardRef(function InnerViewer(props: OSDViewerProps & { source: any }, fwdRef) {
  const [ref, viewer] = useOpenSeadragon(props.source, {
    id: 'openseadragon',
  });
  const initialised = useRef(false);

  useImperativeHandle(fwdRef, () => ({
    zoomIn() {
      viewer?.viewer?.viewport.zoomBy(1 / 0.7);
    },
    zoomOut() {
      viewer?.viewer?.viewport.zoomBy(0.7);
    },
    goHome() {
      viewer?.viewer?.viewport.goHome();
    },
    rotate() {
      // @ts-ignore
      viewer?.viewer?.viewport.setRotation((viewer?.viewer?.viewport.getRotation() || 0) + 90);
    },
  }));

  if (viewer.isReady && !initialised.current) {
    initialised.current = true;
    props.onReady?.(viewer?.viewer);
  }

  return (
    <div
      id={'openseadragon'}
      style={{ flex: '1 1 0px', minWidth: 0, width: '100%', height: '100%', minHeight: 500, background: '#f9f9f9' }}
      ref={ref}
    />
  );
});
