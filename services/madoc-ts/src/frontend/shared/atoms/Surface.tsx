import * as React from 'react';
import styled from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { useAccessibleColor } from '../hooks/use-accessible-color';
import { useGoogleFonts } from '../hooks/use-google-fonts';

const surfaceVariations: any = {
  none: {
    $padding: '0',
    $fontSize: '1em',
  },
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
  $padding?: 'none' | 'sm' | 'md' | 'lg';
  $fontSize?: 'sm' | 'md' | 'lg';
  $font?: string;
}>`
  background: ${props => (props.$background ? props.$background : 'transparent')};
  color: ${props => (props.$color ? props.$color : 'inherit')};
  padding: ${parseProp('$padding', '0')};
  font-size: ${parseProp('$fontSize', '1em')};
  font-family: ${props => (props.$font ? `${props.$font}, sans-serif` : 'inherit')};
  text-align: ${props => (props.$textAlign ? props.$textAlign : 'left')};
`;

export type SurfaceProps = {
  background?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  font?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fontSize?: 'sm' | 'md' | 'lg';
};

export const Surface: React.FC<SurfaceProps> = ({
  textAlign,
  textColor,
  background,
  font,
  fontSize,
  padding,
  children,
}) => {
  useGoogleFonts(font);

  const accessibleTextColor = useAccessibleColor(background || '#fff', textColor);

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

blockEditorFor(Surface, {
  label: 'Surface',
  type: 'surface',
  internal: true,
  defaultProps: {
    textColor: '',
    background: '',
    font: '',
    padding: 'none',
    fontSize: 'md',
    textAlign: 'left',
  },
  editor: {
    textColor: { label: 'Text color', type: 'text-field' },
    background: { label: 'Background color', type: 'text-field' },
    font: { label: 'Font (from google)', type: 'text-field' },
    padding: {
      label: 'Padding size',
      description: 'How much padding should the surface have. (default: none)',
      type: 'dropdown-field',
      options: [
        { value: 'none', text: 'No padding' },
        { value: 'sm', text: 'Small' },
        { value: 'md', text: 'Medium' },
        { value: 'lg', text: 'Large' },
      ],
    },
    textAlign: {
      label: 'Text align',
      type: 'dropdown-field',
      options: [
        { value: 'left', text: 'Left aligned' },
        { value: 'center', text: 'Center aligned' },
        { value: 'right', text: 'Right aligned' },
      ],
    },
    fontSize: {
      label: 'Font size',
      type: 'dropdown-field',
      options: [
        { value: 'sm', text: 'Small' },
        { value: 'md', text: 'Medium' },
        { value: 'lg', text: 'Large' },
      ],
    },
  },
});
