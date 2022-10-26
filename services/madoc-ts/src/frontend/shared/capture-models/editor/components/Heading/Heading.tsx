import styled, { css } from 'styled-components';
import { globalFont } from '../../../../variables';

export const Heading = styled.header<{ size: 'large' | 'medium' | 'small' }>`
  font-family: ${globalFont};
  line-height: 1.4em;
  margin: .3em 0;
  ${props =>
    props.size === 'large' &&
    css`
      font-weight: 700;
      letter-spacing: -0.8px;
      font-size: 2.4em;
    `}
  ${props =>
    props.size === 'medium' &&
    css`
      letter-spacing: -0.6px;
      font-weight: 500;
      font-size: 1.8em;
    `}
  ${props =>
    props.size === 'small' &&
    css`
      letter-spacing: -0.3px;
      font-size: 1.2em;
      font-weight: 600;
    `}
`;
