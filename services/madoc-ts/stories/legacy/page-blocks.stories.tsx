import { color, select, text } from '@storybook/addon-knobs';
import * as React from 'react';
import styled, { css } from 'styled-components';
import { getDefaultPageBlockDefinitions } from '../../src/extensions/page-blocks/default-definitions';
import { PageBlockDefinition } from '../../src/extensions/page-blocks/extension';
import {
  AddBlockContainer,
  AddBlockIconWrapper,
  AddBlockLabel,
  AddBlockList,
  AddBlockPluginName,
} from '../../src/frontend/shared/page-blocks/AddBlock';
import { Heading1, Subheading1 } from '../../src/frontend/shared/typography/Heading1';
import { Heading2 } from '../../src/frontend/shared/typography/Heading2';
import { ModalButton } from '../../src/frontend/shared/components/Modal';
import { useAccessibleColor } from '../../src/frontend/shared/hooks/use-accessible-color';
import { useGoogleFonts } from '../../src/frontend/shared/hooks/use-google-fonts';

export default { title: 'Legacy/Page blocks' };

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

const blocks = [
  ...getDefaultPageBlockDefinitions(),
  Heading1[Symbol.for('slot-model')],
  {
    ...(Heading2[Symbol.for('slot-model') as any] as any),
    source: { id: '123', type: 'plugin', name: 'Editorial plugin' },
  },
] as PageBlockDefinition<any, any, any>[];

export const SelectBlock = () => {
  return (
    <>
      <ModalButton
        title="Add block"
        render={() => {
          return (
            <>
              <AddBlockList>
                {blocks.map((block, n) => {
                  if (!block) {
                    return null;
                  }
                  const Icon = block.svgIcon;
                  return (
                    <AddBlockContainer $active={n === 2}>
                      <AddBlockIconWrapper>
                        {Icon ? (
                          <Icon />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            viewBox="0 0 385.419 385.419"
                          >
                            <path
                              fill="#D1D8E8"
                              d="M188.998 331.298l-.231-107.449-92.494-53.907-92.327 53.712.225 108.29 92.102 53.475 92.725-54.121zm-83.342 26.994l.165-75.232 64.289-37.558.165 75.067-64.619 37.723zM96.26 191.586l64.603 37.658-64.384 37.606-64.605-37.8 64.386-37.464zm-73.557 53.77l64.411 37.691-.164 75.335-64.092-37.217-.155-75.809zM288.748 169.948l-92.324 53.706.231 108.29 92.104 53.475 92.714-54.121-.231-107.449-92.494-53.901zm-.013 21.638l64.605 37.658-64.386 37.606-64.606-37.801 64.387-37.463zm-73.556 53.77l64.404 37.691-.164 75.335-64.076-37.217-.164-75.809zm82.958 112.936l.159-75.232 64.289-37.558.164 75.067-64.612 37.723zM285.216 53.892L192.719 0l-92.324 53.697.222 108.295 92.102 53.479 92.717-54.121-.22-107.458zm-92.509-32.257l64.609 37.649-64.384 37.619-64.609-37.811 64.384-37.457zm-73.558 53.766l64.411 37.698-.161 75.335-64.095-37.211-.155-75.822zm82.95 112.942l.162-75.234 64.292-37.564.164 75.073-64.618 37.725z"
                            />
                          </svg>
                        )}
                      </AddBlockIconWrapper>
                      <AddBlockLabel>{block.label}</AddBlockLabel>
                      {block.source ? (
                        <AddBlockPluginName>{block.source.name}</AddBlockPluginName>
                      ) : (
                        <AddBlockPluginName>Built-in</AddBlockPluginName>
                      )}
                    </AddBlockContainer>
                  );
                })}
              </AddBlockList>
            </>
          );
        }}
        openByDefault
        modalSize={'lg'}
      >
        <button>Open</button>
      </ModalButton>
    </>
  );
};
