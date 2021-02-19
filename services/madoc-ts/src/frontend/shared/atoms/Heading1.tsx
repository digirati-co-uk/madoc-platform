import React, { forwardRef } from 'react';
import { Helmet } from 'react-helmet';
import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { useSite } from '../hooks/use-site';

export const _Heading1 = styled.h1<{ $margin?: boolean }>`
  font-size: 2em;
  font-weight: 600;
  margin-bottom: 0.2em;
  ${props =>
    props.$margin &&
    css`
      margin-bottom: 1em;
    `}
`;

export const Heading1: typeof _Heading1 = forwardRef(function Heading1(props: any, ref) {
  const site = useSite();
  return (
    <>
      {typeof props.children === 'string' ? (
        <Helmet>
          <title>
            {site.title} - {props.children}
          </title>
        </Helmet>
      ) : null}
      <_Heading1 ref={ref} {...props} />
    </>
  );
}) as any;

blockEditorFor(Heading1, {
  type: 'heading-1',
  label: 'Heading 1',
  editor: {
    children: { label: 'Text content', type: 'text-field' },
  },
  defaultProps: {
    children: 'Example header',
  },
});

export const Subheading1 = styled.div`
  font-size: 1em;
  color: #999;
  margin-bottom: 1em;
  & a {
    color: #5071f4;
    font-size: 0.85em;
  }
`;
