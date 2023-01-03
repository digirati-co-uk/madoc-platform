import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import React from 'react';
import styled from 'styled-components';
import { Network } from '@styled-icons/entypo/Network';
import { primaryBackground } from '../../shared/navigation/Button';

const LinkWrapper = styled.div`
  margin: 1em 0;
  a {
    font-size: 14px;
    color: black;
    text-decoration: none;
    vertical-align: middle;
    padding: 0.5em;
    margin-right: 1em;

    :hover {
      color: ${primaryBackground};
      cursor: pointer;
    }

  }

  svg {
    fill: ${primaryBackground};
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
    url1: '',
    text1: '',
    url2: '',
    text2: '',
    url3: '',
    text3: '',
  },
  editor: {
    url1: { type: 'text-field', label: 'URL' },
    text1: { type: 'text-field', label: 'Link text' },
    url2: { type: 'text-field', label: 'URL' },
    text2: { type: 'text-field', label: 'Link text' },
    url3: { type: 'text-field', label: 'URL' },
    text3: { type: 'text-field', label: 'Link text' },
  },
  mapToProps(formInput: any) {
    const links: {
      url?: string;
      text?: string;
    }[] = [];
    if (formInput.url1) links.push({ url: formInput.url1, text: formInput.text1 });
    if (formInput.url2) links.push({ url: formInput.url2, text: formInput.text2 });
    if (formInput.url3) links.push({ url: formInput.url3, text: formInput.text3 });
    return { links };
  },
});
