import React, { useLayoutEffect, useRef, useState } from 'react';
import { AnnotationPage, ImageService } from '@hyperion-framework/types';
import { AtlasAuto, RegionHighlight, Runtime } from '@atlas-viewer/atlas';
import { useCanvas, useImageService } from '@hyperion-framework/react-vault';
import { useTranslation } from 'react-i18next';
import { Button, ButtonRow } from '../navigation/Button';
import { webglSupport } from '../utility/webgl-support';
import { AtlasTiledImages } from './AtlasTiledImages';
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
  const [isLoaded, setIsLoaded] = useState(false);
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

  useLayoutEffect(() => {
    setIsLoaded(true);
  }, []);

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
      <style>
        {`
        .atlas-container {
          --atlas-container-flex: 1 1 0px;
          --atlas-background: #f9f9f9;
        }
        `}
      </style>
      {isLoaded ? (
        <>
          <AtlasAuto
            containerStyle={{ flex: '1 1 0px' }}
            onCreated={rt => {
              runtime.current = rt.runtime;
            }}
            unstable_webglRenderer={webglSupport() && unstable_webglRenderer}
          >
            <world>
              <AtlasTiledImages key={canvas.id} canvas={canvas} service={service as ImageService} />
              <worldObject height={canvas.height} width={canvas.width}>
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
                  <box key={anno.id} {...anno} />
                ))}
              </worldObject>
            </world>
          </AtlasAuto>
          <ButtonRow style={{ position: 'absolute', top: 0, left: 10, zIndex: 20 }}>
            <Button onClick={goHome}>{t('atlas__zoom_home', { defaultValue: 'Home' })}</Button>
            <Button onClick={zoomOut}>{t('atlas__zoom_out', { defaultValue: '-' })}</Button>
            <Button onClick={zoomIn}>{t('atlas__zoom_in', { defaultValue: '+' })}</Button>
          </ButtonRow>
        </>
      ) : null}
    </div>
  );
});
