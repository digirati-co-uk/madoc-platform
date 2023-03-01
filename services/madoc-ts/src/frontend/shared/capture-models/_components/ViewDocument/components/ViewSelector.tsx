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
  const selectorId = selector?.id;

  useEffect(() => {
    if (selector && service && selector.state) {
      const cropped = croppedRegion(selector.state);
      if (cropped) {
        setImage(cropped);
      }
    }
    if (selector && selector.revisedBy && selector.revisedBy[0]) {
      const cropped = croppedRegion(selector.revisedBy[0].state);
      if (cropped) {
        setImage(cropped);
      }
    }
  }, [croppedRegion, selector, service]);

  if (!image) {
    return null;
  }

  return (
    <CroppedImage
      data-size="tiny"
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
      <img src={image} data-madoc-id={selectorId} alt="cropped region of image" width={fluidImage ? '100%' : 100} />
    </CroppedImage>
  );
};
