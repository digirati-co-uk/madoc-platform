import { InternationalString } from '@iiif/presentation-3';
import * as React from 'react';
import styled from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useAccessibleColor } from '../hooks/use-accessible-color';
import { useGoogleFonts } from '../hooks/use-google-fonts';

const surfaceVariations: any = {
  none: {
    $padding: '0',
    $fontSize: '1em',
    $marginBottom: '0',
  },
  sm: {
    $padding: '1em',
    $fontSize: '0.85em',
    $marginBottom: '0.5em',
  },
  md: {
    $padding: '2em',
    $fontSize: '1em',
    $marginBottom: '1em',
  },
  lg: {
    $padding: '3em',
    $fontSize: '1.3em',
    $marginBottom: '1.5em',
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
  $fullWidth?: boolean;
  $padding?: 'none' | 'sm' | 'md' | 'lg';
  $marginBottom?: 'none' | 'sm' | 'md' | 'lg';
  $fontSize?: 'sm' | 'md' | 'lg';
  $fontWeight?: '400' | '500' | '700' | '300';
  $font?: string;
}>`
  background: ${props => (props.$background ? props.$background : 'transparent')};
  color: ${props => (props.$color ? props.$color : 'inherit')};
  padding: ${parseProp('$padding', '0')};
  font-size: ${parseProp('$fontSize', '1em')};
  font-weight: ${props => (props.$fontWeight ? props.$fontWeight : 'inherit')};
  font-family: ${props => (props.$font ? `${props.$font}, sans-serif` : 'inherit')};
  text-align: ${props => (props.$textAlign ? props.$textAlign : 'left')};
  margin-bottom: ${parseProp('$marginBottom', '0')};
  margin-left: ${props => (props.$fullWidth ? '-2em' : '')};
  margin-right: ${props => (props.$fullWidth ? '-2em' : '')};
`;

export type SurfaceProps = {
  label?: string;
  id?: string;
  background?: string;
  textColor?: string;
  fullWidth?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  font?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  marginBottom?: 'none' | 'sm' | 'md' | 'lg';
  fontSize?: 'sm' | 'md' | 'lg';
  fontWeight?: '400' | '500' | '700' | '300';
};

export const Surface: React.FC<SurfaceProps> = ({
  id,
  textAlign,
  textColor,
  background,
  fullWidth,
  font,
  fontSize,
  fontWeight,
  padding,
  children,
  marginBottom,
}) => {
  useGoogleFonts(font);

  const accessibleTextColor = useAccessibleColor(background || '#fff');
  const color = textColor ? textColor : accessibleTextColor;

  return (
    <SurfaceStyled
      id={id}
      $color={color}
      $fullWidth={fullWidth}
      $background={background}
      $textAlign={textAlign}
      $font={font}
      $padding={padding}
      $fontSize={fontSize}
      $fontWeight={fontWeight}
      $marginBottom={marginBottom}
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
    label: null,
    textColor: '',
    background: '',
    font: '',
    padding: 'none',
    fullWidth: false,
    fontSize: 'md',
    fontWeight: '400',
    textAlign: 'left',
    marginBottom: 'none',
  },
  editor: {
    label: { label: 'Label', type: 'text-field' },
    textColor: { label: 'Text color', type: 'color-field' },
    background: { label: 'Background color', type: 'color-field' },
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
    fontWeight: {
      label: 'Font Weight',
      type: 'dropdown-field',
      options: [
        { value: '400', text: 'Regular' },
        { value: '500', text: 'Medium' },
        { value: '600', text: 'Bold' },
        { value: '300', text: 'Light' },
      ],
    },
    marginBottom: {
      label: 'Bottom margin',
      type: 'dropdown-field',
      options: [
        { value: 'none', text: 'No margin' },
        { value: 'sm', text: 'Small' },
        { value: 'md', text: 'Medium' },
        { value: 'lg', text: 'Large' },
      ],
    },
    fullWidth: { label: 'Full width', type: 'checkbox-field', inlineLabel: 'Show full width' },
  },
});
