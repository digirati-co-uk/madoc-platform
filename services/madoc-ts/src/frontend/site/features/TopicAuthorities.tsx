import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import React from 'react';
import styled from 'styled-components';
import { Network } from '@styled-icons/entypo/Network';
import { useTopic } from '../pages/loaders/topic-loader';

const LinkWrapper = styled.div`
  padding: 0.5em 0;
  a {
    font-size: 14px;
    text-decoration: none;
    vertical-align: middle;
    margin: 0 1em;
    text-transform: capitalize;
    color: #000000;
    :hover {
      color: #056db7;
      text-decoration: underline;
      cursor: pointer;
    }
  }

  svg {
    color: #056db7;
    height: 18px;
    margin-right: 8px;
  }
`;
export const TopicAuthorities: React.FC<{
  textColor?: string;
  iconColor?: string;
}> = ({ textColor, iconColor }) => {
  const { data } = useTopic();
  const links = data?.authorities;

  return (
    <LinkWrapper>
      {links
        ? links.map((link, i) => {
            return (
              link.url && (
                <a key={i} href={link.url} target="_blank" rel="noreferrer" style={{ color: textColor }}>
                  <Network style={{ color: iconColor }} /> {link.authority}
                </a>
              )
            );
          })
        : null}
    </LinkWrapper>
  );
};

blockEditorFor(TopicAuthorities, {
  type: 'default.TopicAuthorities',
  label: 'Topic authorities',
  anyContext: [],
  requiredContext: ['topic'],
  defaultProps: {
    textColor: '#000000',
    svgColor: '#056db7',
  },
  editor: {
    textColor: { label: 'Link Color', type: 'color-field' },
    svgColor: { label: 'Icon color', type: 'color-field' },
  },
});
