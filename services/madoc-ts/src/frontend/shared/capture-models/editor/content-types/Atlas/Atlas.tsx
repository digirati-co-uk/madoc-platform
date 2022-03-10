import { ImageService } from '@hyperion-framework/types';
import React, { Suspense, useMemo, useState } from 'react';
import { BaseContent, ContentOptions } from '../../../types/content-types';
import { useAllSelectors, useCurrentSelector, useSelectorActions } from '../../stores/selectors/selector-hooks';
import {
  useExternalManifest,
  CanvasContext,
  useCanvas,
  useImageService,
  VaultProvider,
  useVaultEffect,
} from '@hyperion-framework/react-vault';
import { AtlasAuto, getId, GetTile, TileSet, AtlasContextType, PopmotionControllerConfig } from '@atlas-viewer/atlas';
import { ImageServiceContext } from './Atlas.helpers';

export type AtlasCustomOptions = {
  unstable_webglRenderer?: boolean;
  customFetcher?: <T>(url: string, options: T) => unknown | Promise<unknown>;
  onCreateAtlas?: (context: AtlasContextType) => void;
  controllerConfig?: PopmotionControllerConfig;
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
  style?: any;
}> = ({ isEditing, onDeselect, children, onCreated, unstable_webglRenderer, controllerConfig, style }) => {
  const canvas = useCanvas();
  const { data: service } = useImageService() as { data?: ImageService };
  const [thumbnail, setThumbnail] = useState<any | undefined>(undefined);

  useVaultEffect(
    v => {
      if (canvas) {
        v.getThumbnail(canvas, { minWidth: 100 }, false).then(thumb => {
          if (thumb.best) {
            setThumbnail(thumb.best);
          }
        });
      } else {
        setThumbnail(undefined);
      }
    },
    [canvas]
  );

  const tiles: GetTile | undefined = useMemo(() => {
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
      style={style}
      onCreated={onCreated}
      mode={isEditing ? 'sketch' : 'explore'}
      unstable_webglRenderer={unstable_webglRenderer}
      controllerConfig={controllerConfig}
    >
      <world onClick={onDeselect}>
        <ImageServiceContext value={service}>
          {tiles ? <TileSet x={0} y={0} height={canvas.height} width={canvas.width} tiles={tiles} /> : null}
          <world-object x={0} y={0} height={canvas.height} width={canvas.width}>
            <Suspense fallback={null}>{children}</Suspense>
          </world-object>
        </ImageServiceContext>
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

  const { height = 500, width = '100%', maxHeight, maxWidth } = props.options || { height: 500 };

  const styleProps = {
    minWidth: 100,
    minHeight: 100,
    height,
    width,
    maxHeight,
    maxWidth,
  };

  return (
    <div style={styleProps}>
      <CanvasContext canvas={props.state.canvasId}>
        <Canvas
          style={{ height: styleProps.height }}
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
