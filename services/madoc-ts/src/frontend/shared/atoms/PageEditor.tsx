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
  background: #212f4f;
  border-radius: 3px;
  padding: 0.5em 1em;
  color: #fff;
  font-size: 0.8em;
  border: none;

  & ~ & {
    margin-left: 0.5em;
  }

  outline: none;
  cursor: pointer;

  text-decoration: none;
  display: inline-block;
  vertical-align: top;
  border: 2px solid #212f4f;

  &:active {
    box-shadow: inset 0 2px 8px 0 rgba(33, 47, 79, 1);
  }
  &:link,
  &:visited {
    color: #fff;
  }
  &:hover {
    background: #33456d;
    border-color: #33456d;
  }
  &:focus {
    outline: none;
    background: #33456d;
    border-color: rgba(255, 255, 255, 0.6);
  }

  &:focus:hover {
    border-color: #33456d;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    &:hover {
      background: #212f4f;
      border-color: #212f4f;
    }
  }
`;
