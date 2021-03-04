import React, { ComponentPropsWithRef, forwardRef } from 'react';
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

export const Heading1: React.FC<ComponentPropsWithRef<typeof _Heading1>> = forwardRef(function Heading1(
  props: any,
  ref
) {
  const site = useSite();
  return (
    <>
      {typeof props.children === 'string' && site ? (
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
    text: { label: 'Text content', type: 'text-field' },
  },
  defaultProps: {
    text: 'Example header',
  },
  mapToProps: props => ({
    children: <>{props.text}</>,
  }),
});

export const Subheading1 = styled.p`
  font-size: 1em;
  opacity: 0.8;
  margin-bottom: 1em;
  max-width: 50em;
  & a {
    color: #5071f4;
    font-size: 0.85em;
  }
`;
