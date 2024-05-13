import { ImageService } from '@iiif/presentation-3';
import React, { useEffect, useState } from 'react';
import { useImageService } from 'react-iiif-vault';
import { CroppedImage } from '../../../../atoms/Images';
import { useCroppedRegion } from '../../../../hooks/use-cropped-region';
import { useSelectorHelper } from '../../../editor/stores/selectors/selector-helper';
import { resolveSelector } from '../../../helpers/resolve-selector';
import { BaseSelector } from '../../../types/selector-types';

export const ViewSelector: React.FC<{
  selector?: BaseSelector;
  fluidImage?: boolean;
  inline?: boolean;
  small?: boolean;
  highlightRevisionChanges?: string;
}> = ({ selector: _selector, fluidImage, inline, highlightRevisionChanges }) => {
  const selector = _selector ? resolveSelector(_selector, highlightRevisionChanges) : undefined;
  const helper = useSelectorHelper();
  const { data: service } = useImageService() as { data?: ImageService };
  const croppedRegion = useCroppedRegion();
  const [image, setImage] = useState('');
  const [mask, setMask] = useState<any | null>(null);
  const selectorId = selector?.id;
  const [didError, setDidError] = useState(false);

  const handleSvgError = (e: any) => {
    setDidError(true);
  };
  useEffect(() => {
    if (!selector) return;

    if (selector.type === 'polygon-selector' && selector.state && selector.state.shape) {
      const points = selector.state.shape.points as Array<[number, number]>;
      const isOpen = selector.state.shape.open;
      if (points && ((points.length > 1 && isOpen) || (points.length > 2 && !isOpen))) {
        const padding = 30;
        const x1 = Math.min(...points.map(p => p[0])) - padding;
        const y1 = Math.min(...points.map(p => p[1])) - padding;
        const x2 = Math.max(...points.map(p => p[0])) + padding;
        const y2 = Math.max(...points.map(p => p[1])) + padding;
        const cropped = croppedRegion({ x: x1, y: y1, width: x2 - x1, height: y2 - y1 });
        if (cropped) {
          const ratio = 1;

          setImage(cropped);

          const Shape = isOpen ? 'polyline' : 'polygon';
          const svgPoints = points.map(p => `${(p[0] - x1) * ratio},${(p[1] - y1) * ratio}`).join(' ');

          setMask(
            <svg width="100%" height="100%" viewBox={`0 0 ${(x2 - x1) * ratio} ${(y2 - y1) * ratio}`}>
              {!didError ? (
                <>
                  <defs>
                    <mask id={`selector-mask-${selector.id}`}>
                      <rect x="0" y="0" width="100%" height="100%" fill="rgba(255, 255, 255, .1)" />
                      <Shape points={svgPoints} style={{ fill: 'white', stroke: '#000', strokeWidth: 4 }} />
                    </mask>
                  </defs>
                  <image
                    href={cropped}
                    mask={isOpen ? undefined : `url(#selector-mask-${selector.id})`}
                    width="100%"
                    height="100%"
                    {...({ onError: handleSvgError } as any)}
                  />
                  {isOpen ? (
                    <polyline points={svgPoints} style={{ fill: 'none', stroke: 'red', strokeWidth: 4 }} />
                  ) : null}
                </>
              ) : (
                <Shape
                  points={svgPoints}
                  style={isOpen ? { stroke: '#000', strokeWidth: 2 } : { fill: 'white', stroke: 'red', strokeWidth: 2 }}
                />
              )}
            </svg>
          );
        }
      }
    }

    if (selector.type === 'box-selector') {
      if (service && selector.state) {
        const cropped = croppedRegion(selector.state);
        if (cropped) {
          setImage(cropped);
        }
      }
      if (selector.revisedBy && selector.revisedBy[0]) {
        const cropped = croppedRegion(selector.revisedBy[0].state);
        if (cropped) {
          setImage(cropped);
        }
      }
    }
  }, [didError, croppedRegion, selector, service]);

  if (!image) {
    return null;
  }

  return (
    <CroppedImage
      data-size="small"
      $fluid={fluidImage}
      style={{ margin: inline ? 'none' : '0 .5em', background: '#f9f9f9' }}
      onClick={e => {
        if (selectorId) {
          e.preventDefault();
          e.stopPropagation();
          helper.withSelector(selectorId).zoomTo();
        }
      }}
    >
      {mask ? (
        mask
      ) : (
        <img src={image} data-madoc-id={selectorId} alt="cropped region of image" width={fluidImage ? '100%' : 100} />
      )}
    </CroppedImage>
  );
};
