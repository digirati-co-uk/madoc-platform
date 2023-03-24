import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import React from 'react';
import styled from 'styled-components';
import { useTopic } from '../pages/loaders/topic-loader';

export const ImageMask = styled.div<{ $height?: string }>`
  height: ${props => (props.$height ? `${props.$height}px` : '400px')};
  width: ${props => (props.$height ? `${props.$height}px` : '400px')};
  border-radius: 100%;
  background-size: contain;
  background-position: center;
`;
export const ImageWrapper = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: column;
`;

export const TopicHeroImage: React.FC<{ height?: string }> = ({ height }) => {
  const { data } = useTopic();
  if (!data) {
    return null;
  }
  return (
    <>
      <ImageWrapper>
        {data.other_data?.main_image?.url && (
          <ImageMask
            $height={height}
            style={{ backgroundImage: `url("${data.other_data?.main_image.url}")` }}
          />
        )}
      </ImageWrapper>
    </>
  );
};

blockEditorFor(TopicHeroImage, {
  type: 'default.TopicHeroImage',
  label: 'Topic hero image',
  anyContext: ['topic'],
  defaultProps: {},
  editor: {},
});
