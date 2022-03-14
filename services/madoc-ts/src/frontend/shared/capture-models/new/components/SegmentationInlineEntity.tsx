import React from 'react';
import { CroppedImage } from '../../../atoms/Images';
import { RoundedCard } from '../../editor/components/RoundedCard/RoundedCard';
import { Revisions } from '../../editor/stores/revisions/index';
import { DefaultInlineEntity } from './DefaultInlineEntity';
import { EditorRenderingConfig } from './EditorSlots';
import { useResolvedSelector } from '../hooks/use-resolved-selector';

export const SegmentationInlineEntity: EditorRenderingConfig['InlineEntity'] = props => {
  const previewData = Revisions.useStoreState(s => s.selector.selectorPreviewData);
  const [selector] = useResolvedSelector(props.entity);

  if (selector && previewData[selector.id]) {
    return (
      <RoundedCard
        size="small"
        key={props.entity.id}
        interactive={true}
        onClick={props.chooseEntity}
        onRemove={props.canRemove ? props.onRemove : undefined}
      >
        <CroppedImage $size="small" style={{ margin: '0 auto' }}>
          <img src={previewData[selector.id]} />
        </CroppedImage>
      </RoundedCard>
    );
  }

  return <DefaultInlineEntity {...props} />;
};
