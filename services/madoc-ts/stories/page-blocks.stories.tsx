import { color, select, text } from '@storybook/addon-knobs';
import * as React from 'react';
import styled from 'styled-components';
import { Heading1, Subheading1 } from '../src/frontend/shared/atoms/Heading1';
import { useAccessibleColor } from '../src/frontend/shared/hooks/use-accessible-color';
import { useGoogleFonts } from '../src/frontend/shared/hooks/use-google-fonts';

export default { title: 'Page blocks' };

export const Default_ = () => {
  return <div>This contains some of the atoms that can be used to compose page block atoms.</div>;
};

// Surface

// What should a default surface look like?
// - Gray
// - Padded

const surfaceVariations = {
  sm: {
    $padding: '1em',
    $fontSize: '0.85em',
  },
  md: {
    $padding: '2em',
    $fontSize: '1em',
  },
  lg: {
    $padding: '3em',
    $fontSize: '1.3em',
  },
};

function parseProp(name: string, defaultValue: string) {
  return (props: any) => {
    if (!props[name]) {
      return defaultValue;
    }

    if (surfaceVariations[props[name]] && surfaceVariations[props[name]][name]) {
      return surfaceVariations[props[name]][name];
    }

    return props[name];
  };
}

const SurfaceStyled = styled.div<{
  $background?: string;
  $color?: string;
  $textAlign?: 'left' | 'center' | 'right';
  $padding?: 'sm' | 'md' | 'lg';
  $fontSize?: 'sm' | 'md' | 'lg';
  $font?: string;
}>`
  background: ${props => (props.$background ? props.$background : '#eee')};
  color: ${props => (props.$color ? props.$color : '#000')};
  padding: ${parseProp('$padding', '1em')};
  font-size: ${parseProp('$fontSize', '1em')};
  font-family: ${props => (props.$font ? `${props.$font}, sans-serif` : 'inherit')};
  text-align: ${props => (props.$textAlign ? props.$textAlign : 'left')};
`;

type SurfaceProps = {
  background?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  font?: string;
  padding?: 'sm' | 'md' | 'lg';
  fontSize?: 'sm' | 'md' | 'lg';
};

const Surface: React.FC<SurfaceProps> = ({
  textAlign,
  textColor,
  background = '#eee',
  font,
  fontSize,
  padding,
  children,
}) => {
  useGoogleFonts(font);

  const accessibleTextColor = useAccessibleColor(background, textColor);

  return (
    <SurfaceStyled
      $color={accessibleTextColor}
      $background={background}
      $textAlign={textAlign}
      $font={font}
      $padding={padding}
      $fontSize={fontSize}
    >
      {children}
    </SurfaceStyled>
  );
};

export const Surface_Default = () => {
  const background = color('Background', '#eee');
  const textColor = color('Color', '#000');
  const content = text('Content', 'The content of the surface.');
  const paddingSize = select('Padding size', ['sm', 'md', 'lg'], 'sm');
  const fontSize = select('Font size', ['sm', 'md', 'lg'], 'sm');
  const font = text('Font (from google)', 'Oswald');
  const textAlign = select('Text alignment', ['left', 'center', 'right'], 'left');

  return (
    <Surface
      textAlign={textAlign}
      textColor={textColor}
      font={font}
      background={background}
      fontSize={fontSize}
      padding={paddingSize}
    >
      {content}
    </Surface>
  );
};

export const Surface_Heading1 = () => {
  const background = color('Background', '#444');
  const textColor = color('Color', '#fff');
  const heading = text('Heading', 'The content of the surface.');
  const subheading = text('Subheading', 'The subheading under the title');
  const paddingSize = select('Padding size', ['sm', 'md', 'lg'], 'md');
  const fontSize = select('Font size', ['sm', 'md', 'lg'], 'md');
  const font = text('Font (from google)', 'PT Serif');
  const textAlign = select('Text alignment', ['left', 'center', 'right'], 'center');

  return (
    <Surface
      textAlign={textAlign}
      textColor={textColor}
      font={font}
      background={background}
      fontSize={fontSize}
      padding={paddingSize}
    >
      <Heading1>{heading}</Heading1>
      <Subheading1>{subheading}</Subheading1>
    </Surface>
  );
};
