import { Revisions, RoundedCard } from '@capture-models/editor';
import React from 'react';
import { CroppedImage } from '../../../atoms/Images';
import { DefaultInlineEntity } from './DefaultInlineEntity';
import { EditorRenderingConfig } from './EditorSlots';

export const SegmentationInlineEntity: EditorRenderingConfig['InlineEntity'] = props => {
  const previewData = Revisions.useStoreState(s => s.selector.selectorPreviewData);
  const selector = props.entity.selector;

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
