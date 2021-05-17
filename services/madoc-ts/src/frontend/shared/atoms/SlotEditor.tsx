import styled from 'styled-components';
import { PageEditorButton } from './PageEditor';

export const SlotEditorContainer = styled.div`
  background: #53658f;
  color: #fff;
  padding: 0.2em;
  font-size: 0.85em;
  display: flex;
  align-items: center;
  border-radius: 3px 3px 0 0;
  margin-top: 1em;
`;

export const SlotEditorLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-weight: bold;
  align-self: center;
  padding: 0 1em;
`;

export const SlotEditorReadOnly = styled(SlotEditorContainer)`
  background: #ddd;
`;

export const SlotEditorLabelReadOnly = styled(SlotEditorLabel)`
  color: #333;
`;

export const SlotEditorButton = styled(PageEditorButton)`
  padding: 0.4em 0.85em;
  font-size: 0.9em;
  & ~ & {
    margin-left: 0.2em;
  }
`;

export const SlotEditorWhy = styled.div`
  color: rgba(255, 255, 255, 0.8);
  margin-left: auto;
  padding: 0 0.5em;
  cursor: pointer;
  &:hover {
    color: #fff;
    text-decoration: underline;
  }
`;

export const SlotOutlineContainer = styled.div`
  outline: 1px solid rgba(33, 47, 79, 0.3);
  outline-offset: -1px;
  clear: both;
  padding: 0.1px;
  margin-bottom: 1em;
`;
