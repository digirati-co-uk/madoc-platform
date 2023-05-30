import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import React from 'react';
import styled from 'styled-components';
import { Network } from '@styled-icons/entypo/Network';

const LinkWrapper = styled.div`
  a {
    font-size: 14px;
    text-decoration: none;
    vertical-align: middle;
    margin: 0 1em;

    :hover {
      color: black;
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
export const ExternalLinks: React.FC<{
  links?: {
    url?: string;
    text?: string;
  }[];
}> = ({ links }) => {
  return (
    <LinkWrapper>
      {links
        ? links.map((link, i) => {
            return (
              link.url && (
                <a key={i} href={link.url} target="_blank" rel="noreferrer">
                  <Network /> {link.text ? link.text : link.url}
                </a>
              )
            );
          })
        : null}
    </LinkWrapper>
  );
};

blockEditorFor(ExternalLinks, {
  type: 'default.ExternalLinks',
  label: 'External Links',
  anyContext: [],
  requiredContext: [],
  defaultProps: {
    links: [
      {
        url: '',
        text: '',
      },
    ],
  },
  editor: {
    links: {
      allowMultiple: true,
      label: 'Link',
      pluralLabel: 'Links',
      labelledBy: 'text',
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'links.text': {
      type: 'text-field',
      label: 'Display text',
    },
    'links.url': {
      type: 'text-field',
      label: 'URL',
    },
  },
});
