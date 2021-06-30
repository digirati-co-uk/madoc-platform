import styled, { css } from 'styled-components';

export const ContextualPositionWrapper = styled.div`
  position: relative;
`;

export const ContextualLabel = styled.button`
  background: #eee;
  border-radius: 3px;
  padding: 0.3em 0.8em;
  border: 2px solid #eee;

  &:hover {
    background: #ccc;
    border: 2px solid #ccc;
  }

  &:focus {
    border: 2px solid #3579f6;
  }

  svg {
    transform: translateY(0.1em);
  }
`;

export const ContextualMenuWrapper = styled.div<{ $isOpen?: boolean; $padding?: boolean; $right?: boolean }>`
  position: absolute;
  padding: 0.15em;
  top: 100%;
  margin-top: 0.5em;
  color: #000;
  background: #eee;
  box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.18), 0 0px 0px 1px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  border-radius: 7px;
  z-index: 10;
  transition: transform 0.2s, opacity 0.2s;
  font-size: 0.8em;
  
  ${props =>
    props.$right &&
    css`
      right: 0;
    `}

  ${props =>
    props.$isOpen
      ? css`
          visibility: visible;
          transform: translateY(0);
          opacity: 1;
        `
      : css`
          visibility: hidden;
          pointer-events: none;
          transform: translateY(-0.35em);
          opacity: 0;
        `}
  ${props =>
    props.$padding &&
    css`
      padding: 0.5em;
    `}
`;

export const ContextualMenuList = styled.div`
  padding: 0.25em 0;
  min-width: 8em;

  & ~ & {
    border-top: 1px solid #ccc;
  }

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
  }
`;

export const ContextualMenuListItem = styled.a<{ $disabled?: boolean }>`
  padding: 0.25em 0.5em;
  border-radius: 3px;
  border: none;
  display: block;
  background: none;
  width: 100%;
  text-align: left;
  color: #000;
  text-decoration: none;
  user-select: none;

  &:hover,
  &:focus {
    background: #3579f6;
    color: #fff;
    outline: none;
  }

  ${props =>
    props.$disabled &&
    css`
      pointer-events: none;
      color: #999;
    `}
`;
