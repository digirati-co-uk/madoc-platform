import styled from 'styled-components';

export const PageEditorContainer = styled.div`
  background: #53658f;
  border-radius: 4px;
  padding: 1.5em;
  margin: 0.5em 0;
  color: #fff;
  a {
    color: #fff;
  }
`;

export const PageEditorTitle = styled.div`
  font-size: 1.5em;
  margin-bottom: 0.5em;
`;

export const PageEditorDescription = styled.div`
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.8);
`;

export const PageEditorActions = styled.div`
  margin-top: 1em;
`;

export const PageEditorButton = styled.button`
  &[data-read-only='true'] {
    color: #4b67e1;
    background-color: white;
  }

  background: transparent;
  border-radius: 3px;
  padding: 0.5em 1em;
  color: #fff;
  font-size: 0.8em;
  border: 1px solid #fff;
  margin: 0 0.5em;

  & ~ * {
    margin-left: 0.5em;
  }

  outline: none;
  cursor: pointer;

  text-decoration: none;
  display: inline-block;
  vertical-align: top;

  &:active {
    box-shadow: inset 0 2px 8px 0 rgba(33, 47, 79, 1);
  }
  &:link,
  &:visited {
    color: #fff;
  }
  &:hover {
    background: white;
    border-color: #4b67e1;
    color: #4b67e1;
  }
  &:focus {
    background: white;
    border-color: #4b67e1;
    color: #4b67e1;
  }

  &:focus:hover {
    border-color: #4b67e1;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    &:hover {
      background: #4b67e1;
      border-color: #4b67e1;
    }
  }
`;
