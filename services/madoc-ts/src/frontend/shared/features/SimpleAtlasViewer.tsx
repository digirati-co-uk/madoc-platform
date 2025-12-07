import React, { useEffect, useRef, useState } from 'react';
import { AnnotationPage } from '@iiif/presentation-3';
import { RegionHighlight, Runtime } from '@atlas-viewer/atlas';
import { ErrorBoundary } from 'react-error-boundary';
import { useCanvas, useImageService, CanvasPanel, CanvasContext } from 'react-iiif-vault';
import { useTranslation } from 'react-i18next';
import { CanvasViewerButton, CanvasViewerControls } from '../atoms/CanvasViewerGrid';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { ViewReadOnlyAnnotation } from '../atlas/ViewReadOnlyAnnotation';
import { GhostCanvas } from '../atoms/GhostCanvas';
import { useSelectorController } from '../capture-models/editor/stores/selectors/selector-helper';
import { useBrowserLayoutEffect } from '../hooks/use-browser-layout-effect';
import { HomeIcon } from '../icons/HomeIcon';
import { MinusIcon } from '../icons/MinusIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { useReadOnlyAnnotations } from '../hooks/use-read-only-annotations';
import { InfoMessage } from '../callouts/InfoMessage';
import { Button } from '../navigation/Button';
import { BrowserComponent } from '../utility/browser-component';
import { OpenSeadragonViewer } from './OpenSeadragonViewer.lazy';
import { RotateIcon } from '../icons/RotateIcon';
import { useModelPageConfiguration } from '../../site/hooks/use-model-page-configuration';
import { PolygonSelectorProps } from '../capture-models/editor/selector-types/PolygonSelector/PolygonSelector';

const runtimeOptions = { maxOverZoom: 5 };
const defaultPreset = ['default-preset', { runtimeOptions }] as any;

export const SimpleAtlasViewer = React.forwardRef<
  any,
  {
    style?: React.CSSProperties;
    highlightedRegions?: Array<[number, number, number, number]>;
    annotationPages?: AnnotationPage[];
    unstable_webglRenderer?: boolean;
    isModel?: boolean;
  }
>(function SimpleAtlasViewer({ style = { height: 600 }, highlightedRegions, unstable_webglRenderer, isModel }, ref) {
  const { t } = useTranslation();
  const canvas = useCanvas();
  const runtime = useRef<Runtime>();
  const osd = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: service } = useImageService();
  const {
    project: { atlasBackground },
  } = useSiteConfiguration();
  const [isLoaded, setIsLoaded] = useState(false);
  const controller = useSelectorController();
  const readOnlyAnnotations = useReadOnlyAnnotations(false);
  const [isOSD, setIsOSD] = useState(false);

  const { enableRotation = false, hideViewerControls = false } = useModelPageConfiguration();

  // Handle small images - prevent stretching beyond original size
  const handleRuntimeCreated = (preset: { runtime: Runtime }) => {
    runtime.current = preset.runtime;

    if (!canvas || !containerRef.current) return;

    // Get container dimensions (screen pixels)
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Get canvas (image) dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Check if the image is smaller than the viewport
    if (canvasWidth < containerWidth && canvasHeight < containerHeight) {
      // Image is smaller than viewport - display at original size (1:1 zoom), centered
      // Use setTimeout to ensure the runtime is fully initialized
      setTimeout(() => {
        if (runtime.current) {
          // At 1:1 zoom, the visible region in canvas units equals the container size in pixels
          // This shows the canvas at its original pixel size, centered with padding around it
          const viewWidth = containerWidth;
          const viewHeight = containerHeight;

          // Center the canvas within the view
          const x = (canvasWidth - viewWidth) / 2;
          const y = (canvasHeight - viewHeight) / 2;

          runtime.current.world.gotoRegion({
            x,
            y,
            width: viewWidth,
            height: viewHeight,
          });
        }
      }, 50);
    }
  };

  const goHome = () => {
    if (runtime.current) {
      // For small images, go to the constrained view instead of default home
      if (canvas && containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        if (canvasWidth < containerWidth && canvasHeight < containerHeight) {
          // Small image - go to original size view (1:1 zoom)
          const viewWidth = containerWidth;
          const viewHeight = containerHeight;
          const x = (canvasWidth - viewWidth) / 2;
          const y = (canvasHeight - viewHeight) / 2;

          runtime.current.world.gotoRegion({ x, y, width: viewWidth, height: viewHeight });
          return;
        }
      }
      runtime.current.world.goHome();
    }
    if (osd.current) {
      osd.current.goHome();
    }
  };

  const zoomIn = () => {
    if (runtime.current) {
      runtime.current.world.zoomIn();
    }
    if (osd.current) {
      osd.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (runtime.current) {
      runtime.current.world.zoomOut();
    }
    if (osd.current) {
      osd.current.zoomOut();
    }
  };

  const rotate = () => {
    setIsOSD(true);
    if (osd.current) {
      osd.current.rotate();
    }
  };

  useBrowserLayoutEffect(() => {
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    return controller.on('zoomTo', e => {
      const found = readOnlyAnnotations.find(r => {
        return r.id === e.selectorId;
      });
      if (found && found.target) {
        if ((found.target as any).type === 'polygon') {
          const target: Exclude<PolygonSelectorProps['state'], null> = found.target as any;
          const x = Math.min(...target.shape.points.map(p => p[0]));
          const y = Math.min(...target.shape.points.map(p => p[1]));
          const width = Math.max(...target.shape.points.map(p => p[0])) - x;
          const height = Math.max(...target.shape.points.map(p => p[1])) - y;
          runtime.current?.world.gotoRegion({ x, y, width, height });
        } else {
          runtime.current?.world.gotoRegion(found.target as any);
        }
      }
    });
  }, [readOnlyAnnotations, controller]);

  if (!canvas) {
    return null;
  }

  // Combine forwarded ref with containerRef
  const setRefs = (element: HTMLDivElement | null) => {
    (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    }
  };

  return (
    <div
      ref={setRefs}
      style={{
        position: 'relative',
        flex: '1 1 0px',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style,
      }}
    >
      <ErrorBoundary resetKeys={[canvas.id]} fallbackRender={() => <GhostCanvas />}>
        <style>
          {`
        .atlas-container {
          --atlas-container-flex: 1 1 0px;
          --atlas-background:  ${style.backgroundColor || atlasBackground || '#E4E7F0'};
        }
        `}
        </style>
        {isLoaded ? (
          <>
            {isOSD ? (
              <>
                <InfoMessage
                  style={{ lineHeight: '3.4em', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
                >
                  {t('You cannot edit annotations if you are rotating')}
                  <Button style={{ margin: '0.8em' }} onClick={() => setIsOSD(false)}>
                    Reset
                  </Button>
                </InfoMessage>
                <BrowserComponent fallback={null}>
                  <OpenSeadragonViewer ref={osd} />
                </BrowserComponent>
              </>
            ) : (
              <CanvasPanel.Viewer
                renderPreset={defaultPreset}
                runtimeOptions={runtimeOptions}
                key={canvas.id}
                onCreated={handleRuntimeCreated}
              >
                <CanvasContext canvas={canvas.id}>
                  <CanvasPanel.RenderCanvas />
                  <worldObject key={`${canvas.id}/world`} height={canvas.height} width={canvas.width}>
                    {highlightedRegions
                      ? highlightedRegions.map(([x, y, width, height], key) => {
                          return (
                            <React.Fragment key={key}>
                              <RegionHighlight
                                region={{ id: key, x, y, width, height }}
                                isEditing={false}
                                style={{
                                  background: 'rgba(2,219,255, .5)',
                                }}
                                onSave={() => {
                                  // no-op
                                }}
                                onClick={() => {
                                  // no-op
                                }}
                              />
                            </React.Fragment>
                          );
                        })
                      : null}
                    {readOnlyAnnotations.map(anno => (
                      <ViewReadOnlyAnnotation key={anno.id} {...anno} />
                    ))}
                  </worldObject>
                </CanvasContext>
              </CanvasPanel.Viewer>
            )}

            {hideViewerControls && isModel ? null : (
              <CanvasViewerControls>
                {enableRotation && isModel ? (
                  <CanvasViewerButton onClick={rotate}>
                    <RotateIcon title={t('atlas__rotate', { defaultValue: 'Rotate' })} />
                  </CanvasViewerButton>
                ) : null}
                <CanvasViewerButton onClick={goHome}>
                  <HomeIcon title={t('atlas__zoom_home', { defaultValue: 'Home' })} />
                </CanvasViewerButton>
                <CanvasViewerButton onClick={zoomOut}>
                  <MinusIcon title={t('atlas__zoom_out', { defaultValue: 'Zoom out' })} />
                </CanvasViewerButton>
                <CanvasViewerButton onClick={zoomIn}>
                  <PlusIcon title={t('atlas__zoom_in', { defaultValue: 'Zoom in' })} />
                </CanvasViewerButton>
              </CanvasViewerControls>
            )}
          </>
        ) : null}
      </ErrorBoundary>
    </div>
  );
});
