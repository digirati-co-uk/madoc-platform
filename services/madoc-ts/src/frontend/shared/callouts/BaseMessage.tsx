import styled, { css } from 'styled-components';

export const BaseMessage = styled.div<{ $small?: boolean; $wide?: boolean; $margin?: boolean; $banner?: boolean }>`
  background: #000;
  color: #fff;
  width: 100%;
  padding: 0.5em 1em;
  line-height: 1.9em;

  a {
    color: #fff;
  }

  svg {
    fill: #fff;
    margin: 0 0.5em;
    vertical-align: text-bottom;
  }

  ${props =>
    props.$small &&
    css`
      font-size: 0.75em;
      padding: 0.25em 0.5em;
      line-height: 1.6em;
    `}

  ${props =>
    props.$wide &&
    css`
      margin-left: -2em;
      margin-right: -2em;
      width: auto;
      svg {
        height: 0.8em;
        vertical-align: baseline;
      }
    `}

  ${props =>
    props.$margin &&
    css`
      margin-bottom: 1em;
    `}
 
  ${props =>
    props.$banner &&
    css`
      border-radius: 5px;
      box-shadow: 0 3px 15px 0 rgb(0 0 0 / 16%);
    `}
`;
