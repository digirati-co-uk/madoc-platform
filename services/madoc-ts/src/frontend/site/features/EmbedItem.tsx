import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import React from 'react';
import styled from 'styled-components';

const EmbedWrapper = styled.div`
  iframe {
    border: none;
  }
`;
export const EmbedItem: React.FC<{
  link?: string;
  height?: string;
  width?: string;
}> = ({ link, height, width }) => {
  return (
    <EmbedWrapper>
      <iframe src={link} height={height} width={width} loading="lazy" referrerPolicy="no-referrer" sandbox="allow-scripts" />
    </EmbedWrapper>
  );
};

blockEditorFor(EmbedItem, {
    type: 'default.EmbedItem',
    label: 'Embed an item',
    anyContext: [],
    requiredContext: [],
    defaultProps: {
        link: '',
        height: '200',
        width: '400',
    },
    editor: {
        link: {type: 'text-field', label: 'src or link'},
        height: {type: 'text-field', label: 'height (px)'},
        width: {type: 'text-field', label: 'width (px)'},
    },
});
