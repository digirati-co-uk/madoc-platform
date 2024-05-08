import { ImageService } from '@iiif/presentation-3';
import React from 'react';
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
import { Preset, PopmotionControllerConfig } from '@atlas-viewer/atlas';
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
}> = ({ isEditing, onDeselect, children, onCreated, unstable_webglRenderer, controllerConfig }) => {
  const canvas = useCanvas();
  const { data: service } = useImageService() as { data?: ImageService };
  const style = useAnnotationStyles();

  if (!service || !canvas) {
    return null;
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
