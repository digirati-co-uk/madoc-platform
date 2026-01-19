import { ImageService } from '@iiif/presentation-3';
import React, { useRef } from 'react';
import { Preset, PopmotionControllerConfig } from '@atlas-viewer/atlas';
import { webglSupport } from '../../../../utility/webgl-support';
import { AnnotationStyleProvider, useAnnotationStyles } from '../../../AnnotationStyleContext';
import { getRevisionFieldFromPath } from '../../../helpers/get-revision-field-from-path';
import { EditorSlots } from '../../../new/components/EditorSlots';
import { BaseContent, ContentOptions } from '../../../types/content-types';
import { Revisions } from '../../stores/revisions/index';
import { useAllSelectors, useCurrentSelector, useSelectorActions } from '../../stores/selectors/selector-hooks';
import {
  useExternalManifest,
  CanvasContext,
  useCanvas,
  useImageService,
  VaultProvider,
  CanvasPanel,
} from 'react-iiif-vault';
import { ImageServiceContext } from './Atlas.helpers';

export type AtlasCustomOptions = {
  unstable_webglRenderer?: boolean;
  customFetcher?: <T>(url: string, options: T) => unknown | Promise<unknown>;
  onCreateAtlas?: (preset: Preset) => void;
  controllerConfig?: PopmotionControllerConfig;
  backgroundColor?: string;
};

export interface AtlasViewerProps extends BaseContent {
  id: string;
  type: string;
  state: {
    canvasId: string;
    manifestId: string;
    imageService?: string;
  };
  options: ContentOptions<AtlasCustomOptions>;
}

const runtimeOptions = { maxOverZoom: 5 };
const defaultPreset = ['default-preset', { runtimeOptions }] as any;

const Canvas: React.FC<{
  isEditing?: boolean;
  onDeselect?: () => void;
  onCreated?: (ctx: any) => void;
  unstable_webglRenderer?: boolean;
  controllerConfig?: PopmotionControllerConfig;
  containerRef?: React.RefObject<HTMLDivElement>;
  backgroundColor?: string;
}> = ({ isEditing, onDeselect, children, onCreated, unstable_webglRenderer, controllerConfig, containerRef, backgroundColor }) => {
  const canvas = useCanvas();
  const { data: service } = useImageService() as { data?: ImageService };
  const style = useAnnotationStyles();

  // Check if this is a small image (< 500x500) using image service dimensions
  // The image service contains the actual pixel dimensions, while canvas dimensions may differ
  const serviceWidth = (service as any)?.width;
  const serviceHeight = (service as any)?.height;
  const isSmallImage = serviceWidth && serviceHeight && serviceWidth < 500 && serviceHeight < 500;

  if (!service || !canvas) {
    return null;
  }

  // For small images, display as a simple centered image
  if (isSmallImage) {
    return (
      <div
        key={canvas.id}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: backgroundColor || '#E4E7F0',
          height: '100%',
        }}
      >
        <img
          src={`${(service as any).id || (service as any)['@id']}/full/full/0/default.jpg`}
          alt=""
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            width: serviceWidth,
            height: serviceHeight,
            objectFit: 'contain',
          }}
        />
      </div>
    );
  }

  return (
    <CanvasPanel.Viewer
      containerStyle={{ flex: '1 1 0px', height: '100%' }}
      onCreated={onCreated}
      mode={isEditing ? 'sketch' : 'explore'}
      unstable_webglRenderer={webglSupport() && unstable_webglRenderer}
      renderPreset={defaultPreset}
      runtimeOptions={runtimeOptions}
      controllerConfig={controllerConfig}
      height="100%"
    >
      <world
        onClick={e => {
          if (onDeselect) {
            e.stopPropagation();
            onDeselect();
          }
        }}
      >
        <AnnotationStyleProvider theme={style}>
          <CanvasContext canvas={canvas.id}>
            <ImageServiceContext value={service}>
              <CanvasPanel.RenderCanvas />
              <world-object id={`${canvas.id}/annotations`} x={0} y={0} height={canvas.height} width={canvas.width}>
                {children}
              </world-object>
            </ImageServiceContext>
          </CanvasContext>
        </AnnotationStyleProvider>
      </world>
    </CanvasPanel.Viewer>
  );
};

export const AtlasViewer: React.FC<AtlasViewerProps> = props => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLoaded } = useExternalManifest(props.state.manifestId);
  const currentSelector = useCurrentSelector('atlas', undefined);
  const selectorVisibility = {
    adjacentSelectors: true,
    topLevelSelectors: true,
    displaySelectors: true,
    currentSelector: true,
    ...(props.options && props.options.selectorVisibility ? props.options.selectorVisibility : {}),
  };
  const selectors = useAllSelectors('atlas', selectorVisibility);

  if (!isLoaded) {
    return null;
  }

  const { height = 500, width = '100%', maxHeight, maxWidth, custom = {} } = props.options || { height: 500 };
  const { backgroundColor } = custom;

  return (
    <div
      ref={containerRef}
      style={{
        flex: '1 1 0px',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        height,
        width,
        maxHeight,
        maxWidth,
      }}
    >
      <style>
        {`
        .atlas-container {
          --atlas-container-flex: 1 1 0px;
          --atlas-background: ${backgroundColor || '#E4E7F0'};
        }
        `}
      </style>
      <CanvasContext canvas={props.state.canvasId}>
        <Canvas
          unstable_webglRenderer={props.options?.custom?.unstable_webglRenderer}
          controllerConfig={props.options?.custom?.controllerConfig}
          onCreated={props.options?.custom?.onCreateAtlas}
          isEditing={!!currentSelector}
          containerRef={containerRef}
          backgroundColor={backgroundColor}
          // onDeselect={() => {
          //   if (currentSelector) {
          //     actions.clearSelector();
          //   }
          // }}
        >
          {selectors}
          {currentSelector}
          {props.children}
        </Canvas>
      </CanvasContext>
    </div>
  );
};

const WrappedViewer: React.FC<AtlasViewerProps> = props => {
  const customFetcher =
    props.options && props.options.custom && props.options.custom.customFetcher
      ? props.options.custom.customFetcher
      : undefined;

  return (
    <VaultProvider vaultOptions={customFetcher ? ({ customFetcher } as any) : undefined}>
      <AtlasViewer {...props}>{props.children}</AtlasViewer>
    </VaultProvider>
  );
};

export default WrappedViewer;
