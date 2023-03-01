import React, { forwardRef, useImperativeHandle } from 'react';
import { useCanvas, useRenderingStrategy } from 'react-iiif-vault';
import { useOpenSeadragon } from 'use-open-seadragon';

export const OpenSeadragonViewer = forwardRef(function OpenSeadragonViewer(props, ref) {
  const canvas = useCanvas();
  const [strategy] = useRenderingStrategy();

  if (strategy.type !== 'images' || !strategy.image) {
    return null;
  }

  return (
    <InnerViewer key={canvas?.id} ref={ref} source={strategy.image.service ? strategy.image.service : strategy.image} />
  );
});

const InnerViewer = forwardRef(function InnerViewer(props: any, fwdRef) {
  const [ref, viewer] = useOpenSeadragon(props.source);

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

  return (
    <div
      style={{ flex: '1 1 0px', minWidth: 0, width: '100%', height: '100%', minHeight: 500, background: '#f9f9f9' }}
      ref={ref}
    />
  );
});
