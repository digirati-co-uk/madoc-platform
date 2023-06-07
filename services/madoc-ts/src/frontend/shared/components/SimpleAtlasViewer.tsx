import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
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

export const SimpleAtlasViewer = React.forwardRef<
  any,
  {
    style?: React.CSSProperties;
    highlightedRegions?: Array<[number, number, number, number]>;
    annotationPages?: AnnotationPage[];
    unstable_webglRenderer?: boolean;
  }
>(function SimpleAtlasViewer({ style = { height: 600 }, highlightedRegions, unstable_webglRenderer }, ref) {
  const { t } = useTranslation();
  const canvas = useCanvas();
  const runtime = useRef<Runtime>();
  const { data: service } = useImageService();
  const {
    project: { atlasBackground },
  } = useSiteConfiguration();
  const [isLoaded, setIsLoaded] = useState(false);
  const controller = useSelectorController();
  const readOnlyAnnotations = useReadOnlyAnnotations(false);

  const goHome = () => {
    if (runtime.current) {
      runtime.current.world.goHome();
    }
  };

  const zoomIn = () => {
    if (runtime.current) {
      runtime.current.world.zoomIn();
    }
  };

  const zoomOut = () => {
    if (runtime.current) {
      runtime.current.world.zoomOut();
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
      if (found) {
        runtime.current?.world.gotoRegion(found.target);
      }
    });
  }, [readOnlyAnnotations, controller]);

  if (!canvas) {
    return null;
  }

  return (
    <div
      ref={ref}
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
          --atlas-background:  ${style.backgroundColor || atlasBackground || '#f9f9f9'};
        }
        `}
        </style>
        {isLoaded ? (
          <>
            <CanvasPanel.Viewer key={canvas.id} onCreated={preset => void (runtime.current = preset.runtime)}>
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
            <CanvasViewerControls>
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
          </>
        ) : null}
      </ErrorBoundary>
    </div>
  );
});
