import React, { ComponentPropsWithRef, forwardRef } from 'react';
import { Helmet as _Helmet } from 'react-helmet';
import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { convertComponentToText } from '../../../utility/convert-component-to-text';
import { MaxWidthBackground, MaxWidthBackgroundContainer } from '../atoms/MaxWidthBackground';
import { useAccessibleColor } from '../hooks/use-accessible-color';
import { useSite } from '../hooks/use-site';

const Helmet = _Helmet as any;

export const _Heading1 = styled.h1<{ $margin?: boolean }>`
  font-size: 2em;
  font-weight: 600;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  width: 100%;
  position: relative;
  z-index: 3;
  ${props =>
    props.$margin &&
    css`
      margin-bottom: 1em;
    `}

  &[data-size='sm'] {
    font-size: 1.6em;
  }
  &[data-size='lg'] {
    font-size: 3.4em;
  }
  &[data-size='xl'] {
    font-size: 5em;
  }
`;

const backgroundShadow = css`
  position: absolute;
  content: '';
  width: 100%;
  height: 50%;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.65) 100%);
`;

const Heading1Background = styled(MaxWidthBackground)`
  &:has(img)::after {
    ${backgroundShadow}
  }

  &[data-align-right='false'] img {
    position: absolute;
    right: 0;
  }

  &[data-image-style='oct'] img {
    width: auto;
    clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
    aspect-ratio: 1 / 1;
    max-width: 100%;
  }

  &[data-image-style='bgh'] img {
    width: 50%;
  }

  &[data-image-style='dim'] img {
    width: auto;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    aspect-ratio: 1 / 1;
    max-width: 100%;
  }

  &[data-image-style='cir'] img {
    width: auto;
    clip-path: circle(40%);
    aspect-ratio: 1 / 1;
    max-width: 100%;
  }
`;

const Heading1Container = styled(MaxWidthBackgroundContainer)`
  display: flex;
  align-items: flex-end;
  padding-bottom: 1.5em;
  margin-left: -2em;
  margin-right: -2em;
  padding-left: 2em;
  padding-right: 2em;

  &[data-align-start='true'] {
    align-items: flex-start;
  }
  &[data-align-center='true'] {
    align-items: center;
  }

  &[data-has-background='true']::before {
    ${backgroundShadow}
  }
`;

export const Heading1: React.FC<{
  background?: string;
  fullWidth?: boolean;
  backgroundHeight?: number;
  alignBackground?: 'start' | 'center' | 'end';
  textAlign?: string;
  fontSize?: 'sm' | 'lg' | 'md' | 'xl';
  imageStyle?: 'bgf' | 'bgh' | 'dim' | 'cir' | 'oct';
  backgroundImage?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
} & ComponentPropsWithRef<typeof _Heading1>> = forwardRef(function Heading1(
  {
    fullWidth,
    background,
    textAlign,
    backgroundHeight = 200,
    fontSize,
    imageStyle,
    backgroundImage,
    alignBackground = 'end',
    ...props
  }: any,
  ref
) {
  const site = useSite();
  const _color = useAccessibleColor(background);
  const color = imageStyle === 'bgf' ? '#fff' : _color;
  const component = (
    <>
      {typeof props.children === 'string' && site ? (
        <Helmet>
          <title>
            {site.title} - {props.children}
          </title>
        </Helmet>
      ) : null}
      <_Heading1 ref={ref} data-size={fontSize} style={{ textAlign, color: background ? color : '' }} {...props} />
    </>
  );

  if (background || fullWidth) {
    return (
      <>
        {fullWidth ? (
          <>
            <Heading1Background
              data-image-style={imageStyle}
              data-align-right={textAlign === 'right'}
              style={{ '--max-bg-height': `${backgroundHeight}px`, backgroundColor: background } as any}
            >
              {backgroundImage ? <img src={backgroundImage.image} alt="" /> : null}
            </Heading1Background>
          </>
        ) : null}
        <Heading1Container
          data-align-start={alignBackground === 'start'}
          data-align-center={alignBackground === 'center'}
          data-has-background={!fullWidth && !!backgroundImage}
          style={
            {
              background: fullWidth ? '' : backgroundImage ? `url(${backgroundImage.image})` : background,
              '--max-bg-height': backgroundHeight ? `${backgroundHeight}px` : '',
            } as any
          }
        >
          {component}
        </Heading1Container>
      </>
    );
  }

  return component;
}) as any;

blockEditorFor(Heading1, {
  type: 'heading-1',
  label: 'Heading 1',
  editor: {
    text: { label: 'Text content', type: 'text-field', required: true },
    fullWidth: { label: 'Full width', type: 'checkbox-field', inlineLabel: 'Show full width' },
    background: { label: 'Background', type: 'color-field' },
    backgroundHeight: { label: 'Background height', type: 'text-field' },
    alignBackground: {
      label: 'Align title (vertical)',
      type: 'dropdown-field',
      options: [
        { value: 'start', text: 'Top' },
        { value: 'center', text: 'Center' },
        { value: 'end', text: 'Bottom' },
      ],
    },
    textAlign: {
      label: 'Align title (vertical)',
      type: 'dropdown-field',
      options: [
        { value: 'left', text: 'Left' },
        { value: 'center', text: 'Center' },
        { value: 'right', text: 'Right' },
      ],
    },
    fontSize: {
      label: 'Font size',
      type: 'dropdown-field',
      options: [
        { value: 'sm', text: 'Small' },
        { value: 'md', text: 'Normal' },
        { value: 'lg', text: 'Large' },
        { value: 'xl', text: 'Very Large' },
      ],
    },
    backgroundImage: { label: 'Background image', type: 'madoc-media-explorer' },
    imageStyle: {
      type: 'dropdown-field',
      options: [
        { value: 'bgf', text: 'Full Background Image' },
        { value: 'bgh', text: 'Half Background Image' },
        { value: 'dim', text: 'Diamond' },
        { value: 'cir', text: 'Circle' },
        { value: 'oct', text: 'Octagon' },
      ],
    },
  },
  defaultProps: {
    text: 'Example header',
    fullWidth: false,
    background: '',
    backgroundHeight: 200,
    alignBackground: 'start',
    textAlign: 'left',
    fontSize: 'md',
    backgroundImage: null,
    imageStyle: 'bgf',
  },
  svgIcon: props => {
    return (
      <svg width="1em" height="1em" viewBox="0 0 177 127" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="none" fillRule="evenodd">
          <path d="M0 0h177v127H0z" />
          <text fontFamily="Helvetica-Bold, Helvetica" fontSize={53} fontWeight="bold" fill="#000">
            <tspan x={57.075} y={84}>
              {'h1'}
            </tspan>
          </text>
        </g>
      </svg>
    );
  },
  mapFromProps: props =>
    ({
      ...props,
      text: convertComponentToText(props.children),
    } as any),
  mapToProps: props =>
    ({
      ...props,
      children: <>{props.text}</>,
      backgroundHeight:
        Number.isFinite(Number(props.backgroundHeight)) && !Number.isNaN(Number(props.backgroundHeight))
          ? Number(props.backgroundHeight)
          : 200,
    } as any),
});

export const Subheading1 = styled.p`
  font-size: 1em;
  opacity: 0.8;
  margin-bottom: 1em;
  & a {
    color: #5071f4;
    font-size: 0.85em;
  }
`;
