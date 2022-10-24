import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import React from 'react';
import { Network } from '@styled-icons/entypo/Network';
import styled from 'styled-components';

const LinkWrapper = styled.div`
  a {
    color: #333333;
    font-size: 13px;

    :hover {
      color: black;
      text-decoration: underline;
    }
  }
  svg {
    color: #002d4b;
    height: 12px;
    margin: 0 5px;
  }
`;
export const ExternalLinks: React.FC<{ link?: string; text?: string }> = ({ link, text }) => {
  // const getIcon = () => {
  //   if (link?.includes('github')) {
  //     return <GithubWithCircle />;
  //   } else if (link?.includes('youtube')) {
  //     return <YoutubeWithCircle />;
  //   } else {
  //     return <Network />;
  //   }
  // };

  return (
    <LinkWrapper>
      <a href={link} target="_blank" rel="noreferrer">
        <Network />
        {text ? text : link}
      </a>
    </LinkWrapper>
  );
};

blockEditorFor(ExternalLinks, {
  type: 'default.ExternalLinks',
  label: 'External Links',
  anyContext: [],
  requiredContext: [],
  defaultProps: {
    link: 'hi',
    text: 'hi',
  },
  editor: {
    link: { type: 'text-field', label: 'Link' },
    text: { type: 'text-field', label: 'Link text' },
  },
});
