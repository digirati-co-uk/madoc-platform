import { ImageService } from '@iiif/presentation-3';
import React, { useMemo } from 'react';
import { webglSupport } from '../../../../utility/webgl-support';
import { AnnotationStyleProvider, useAnnotationStyles } from '../../../AnnotationStyleContext';
import { BaseContent, ContentOptions } from '../../../types/content-types';
import { useAllSelectors, useCurrentSelector, useSelectorActions } from '../../stores/selectors/selector-hooks';
import {
  useExternalManifest,
  CanvasContext,
  useCanvas,
  useImageService,
  VaultProvider,
  useThumbnail,
} from 'react-iiif-vault';
import { AtlasAuto, getId, GetTile, TileSet, Preset, PopmotionControllerConfig } from '@atlas-viewer/atlas';
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

const Canvas: React.FC<{
  isEditing?: boolean;
  onDeselect?: () => void;
  onCreated?: (ctx: any) => void;
  unstable_webglRenderer?: boolean;
  controllerConfig?: PopmotionControllerConfig;
}> = ({ isEditing, onDeselect, children, onCreated, unstable_webglRenderer, controllerConfig }) => {
  const canvas = useCanvas();
  const { data: service } = useImageService() as { data?: ImageService };
  const thumbnail = useThumbnail({ minWidth: 100 });
  const style = useAnnotationStyles();

  const tiles: any | undefined = useMemo(() => {
    if (canvas && service) {
      return {
        id: getId(service),
        width: canvas.width,
        height: canvas.height,
        imageService: service,
        thumbnail: thumbnail?.type === 'fixed' ? thumbnail : undefined,
      };
    }
    return undefined;
  }, [canvas, service, thumbnail]);

  if (!service || !canvas) {
    return null;
  }

  return (
    <AtlasAuto
      containerStyle={{ flex: '1 1 0px' }}
      onCreated={onCreated}
      mode={isEditing ? 'sketch' : 'explore'}
      unstable_webglRenderer={webglSupport() && unstable_webglRenderer}
      controllerConfig={controllerConfig}
    >
      <world onClick={onDeselect}>
        <AnnotationStyleProvider theme={style}>
          <ImageServiceContext value={service}>
            {tiles ? <TileSet x={0} y={0} height={canvas.height} width={canvas.width} tiles={tiles} /> : null}
            <world-object id={`${canvas.id}/annotations`} x={0} y={0} height={canvas.height} width={canvas.width}>
              {children}
            </world-object>
          </ImageServiceContext>
        </AnnotationStyleProvider>
      </world>
    </AtlasAuto>
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
  const [actions] = useSelectorActions();

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
          --atlas-background: ${backgroundColor || '#f9f9f9'};
        }
        `}
      </style>
      <CanvasContext canvas={props.state.canvasId}>
        <Canvas
          unstable_webglRenderer={props.options?.custom?.unstable_webglRenderer}
          controllerConfig={props.options?.custom?.controllerConfig}
          onCreated={props.options?.custom?.onCreateAtlas}
          isEditing={!!currentSelector}
          onDeselect={() => {
            if (currentSelector) {
              actions.clearSelector();
            }
          }}
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
