import styled, { css } from 'styled-components';

export const LightNavigation = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
`;

export const LightNavigationItem = styled.li<{ $active?: boolean }>`
  font-size: 14px;
  background: #e9e9e9;
  border-radius: 5px;
  margin-right: 0.7em;
  a {
    text-decoration: none;
    color: #333;
    padding: 0.65em 1em;
    display: block;
    border-bottom-width: 3px;
    &:hover {
      text-decoration: underline;
    }
  }
  ${props =>
    props.$active &&
    css`
      background: #333;
      color: #fff;
      a {
        color: #fff;
      }
    `}
`;
