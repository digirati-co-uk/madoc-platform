import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnnotationPage, ImageService } from '@hyperion-framework/types';
import { AtlasAuto, RegionHighlight, Runtime } from '@atlas-viewer/atlas';
import { useCanvas, useImageService } from '@hyperion-framework/react-vault';
import { Button, ButtonRow, TinyButton } from '../atoms/Button';
import { MetadataCard, MetadataCardItem, MetadataCardLabel } from '../atoms/MetadataConfiguration';
import { useAnnotationPage } from '../hooks/use-annotation-page';
import { Spinner } from '../icons/Spinner';
import { AtlasTiledImages } from './AtlasTiledImages';

export const SimpleAtlasViewer: React.FC<{
  style?: React.CSSProperties;
  highlightedRegions?: Array<[number, number, number, number]>;
  annotationPages?: AnnotationPage[];
}> = ({ style = { height: 600 }, highlightedRegions, annotationPages }) => {
  const canvas = useCanvas();
  const runtime = useRef<Runtime>();
  const { data: service } = useImageService();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnnotationOpen, setIsAnnotationOpen] = useState(false);
  const [currentAnnotationPage, setCurrentAnnotationPage] = useState<string | undefined>(undefined);
  const [chosenLabel, setChosenLabel] = useState<any>('');

  const {
    setHighlightedAnnotation,
    highlightedAnnotation,
    annotationRegions,
    isLoading: isAnnotationPageLoading,
    annotationPage,
  } = useAnnotationPage(isAnnotationOpen ? currentAnnotationPage : undefined);

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

  useEffect(() => {
    setHighlightedAnnotation(undefined);
    setCurrentAnnotationPage(undefined);
  }, [canvas, setHighlightedAnnotation]);

  useEffect(() => {
    if (chosenLabel && !currentAnnotationPage && annotationPages) {
      const found = annotationPages.find(page => (page.label as any) === chosenLabel);
      if (found) {
        setCurrentAnnotationPage(found.id);
      }
    }
  }, [annotationPages, chosenLabel, currentAnnotationPage]);

  useEffect(() => {
    if (annotationPages && annotationPages.length === 1) {
      setCurrentAnnotationPage(annotationPages[0].id);
    }
  }, [canvas, annotationPages]);

  useLayoutEffect(() => {
    if (runtime.current) {
      runtime.current.world.recalculateWorldSize();
    }
  }, [isAnnotationOpen]);

  useLayoutEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!canvas) {
    return null;
  }

  return (
    <div style={{ display: 'flex', width: '100%' }}>
      {isAnnotationOpen && annotationPages?.length ? (
        <div style={{ minWidth: 300, width: 300, padding: 10 }}>
          {currentAnnotationPage ? (
            <div>
              {annotationPages.length > 1 ? (
                <TinyButton
                  onClick={() => {
                    setCurrentAnnotationPage(undefined);
                    setChosenLabel('');
                  }}
                >
                  back
                </TinyButton>
              ) : null}
              {isAnnotationPageLoading ? <Spinner /> : null}
              {!annotationPage || annotationPage.items.length === 0 ? <p>No annotations yet</p> : null}
              {((annotationPage && annotationPage.items) || []).map((item: any) => {
                // Unsupported annotation.
                if (!item || !item.body || !item.body.value) {
                  return null;
                }

                return (
                  <MetadataCardItem
                    key={item.id}
                    onMouseOver={() => setHighlightedAnnotation(item.id)}
                    onMouseOut={() => setHighlightedAnnotation(itemId => (itemId === item.id ? undefined : itemId))}
                  >
                    <MetadataCard interactive={item.target.indexOf('xywh') !== -1}>
                      <MetadataCardLabel>{item.body.value}</MetadataCardLabel>
                    </MetadataCard>
                  </MetadataCardItem>
                );
              })}
            </div>
          ) : (
            <div>
              {annotationPages.map(page => {
                return (
                  <MetadataCardItem
                    key={page.id}
                    onClick={() => {
                      setCurrentAnnotationPage(page.id);
                      setChosenLabel(page.label);
                    }}
                  >
                    <MetadataCard interactive>
                      <MetadataCardLabel>{page.label || 'Untitled page'}</MetadataCardLabel>
                    </MetadataCard>
                  </MetadataCardItem>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
      <div style={{ position: 'relative', flex: '1 1 0px' }}>
        {isLoaded ? (
          <>
            <AtlasAuto style={style} onCreated={rt => (runtime.current = rt.runtime)}>
              <world>
                <AtlasTiledImages canvas={canvas} service={service as ImageService} />
                <worldObject height={canvas.height} width={canvas.width}>
                  {highlightedRegions
                    ? highlightedRegions.map(([x, y, width, height], key) => {
                        return (
                          <React.Fragment key={key}>
                            <RegionHighlight
                              region={{ id: key, x, y, width, height }}
                              isEditing={false}
                              background={'rgba(2,219,255, .5)'}
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
                  {annotationRegions
                    ? annotationRegions.map((region, key) => {
                        const { x, y, width, height } = region.target;
                        return (
                          <React.Fragment key={key}>
                            <RegionHighlight
                              region={{ id: region.id, x, y, width, height }}
                              isEditing={false}
                              background={
                                region.id === highlightedAnnotation ? 'rgba(2,219,255, .5)' : 'rgba(2,219,255, .2)'
                              }
                              onSave={() => {
                                // no-op
                              }}
                              onClick={() => {
                                // no-op
                                setHighlightedAnnotation(region.id);
                              }}
                            />
                          </React.Fragment>
                        );
                      })
                    : null}
                </worldObject>
              </world>
            </AtlasAuto>
            <ButtonRow style={{ position: 'absolute', top: 0, left: 10, zIndex: 20 }}>
              <Button onClick={goHome}>Home</Button>
              <Button onClick={zoomOut}>-</Button>
              <Button onClick={zoomIn}>+</Button>
              {annotationPages?.length ? (
                <Button onClick={() => setIsAnnotationOpen(s => !s)}>Annotations</Button>
              ) : null}
            </ButtonRow>
          </>
        ) : null}
      </div>
    </div>
  );
};
