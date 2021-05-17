import styled, { css } from 'styled-components';

export const TaskListContainer = styled.div`
  background: #f4f5f7;
  overflow: hidden;
  display: flex;
  height: 100%;
  max-height: 100%;
  width: 100%;
  padding: 0.5em 0.5em 1em 0.5em;
`;

export const TaskListInnerContainer = styled.div`
  overflow-y: scroll;
  max-height: 100%;
  width: 100%;
  padding-right: 0.75em;
`;

export const TaskItem = styled.div<{ $selected?: boolean }>`
  background: #fff;
  display: flex;

  margin: 0.5em 0;
  border: 2px solid transparent;
  border-radius: 5px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.12);

  padding: 0.5em;
  font-size: 0.85em;
  cursor: pointer;
  width: 100%;

  ${props =>
    props.$selected &&
    css`
      border-color: #4265e9;
    `};
`;

export const TaskItemImageContainer = styled.div`
  background: rgba(0, 0, 0, 0.15);
  width: 4.4em;
  min-width: 4.4em;
  height: 4.4em;
  border-radius: 3px;
  overflow: hidden;

  img {
    display: inline-block;
    object-fit: cover;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
  }
`;

export const TaskItemAuthor = styled.div`
  font-weight: bold;
  margin-bottom: 0.2em;
`;

export const TaskItemDescription = styled.div`
  color: #666;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const TaskItemMetadata = styled.div`
  flex: 1 1 0px;
  padding-left: 0.5em;
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;
`;

export const TaskItemTag = styled.div`
  background: #d5dae8;
  height: 1.3em;
  border-radius: 0.65em;
  font-size: 0.8em;
  color: #78818b;
  padding: 0 0.5em;
  & ~ & {
    margin-left: 0.5em;
  }
`;

export const TaskItemTagType = styled(TaskItemTag)`
  background: #9e62ce;
  color: #fff;
`;

export const TaskItemTagStatus = styled(TaskItemTag)`
  //background: gray;
`;

export const TaskItemTagSuccess = styled(TaskItemTag)`
  background: #337c34;
  color: #fff;
`;

export const TaskItemTagContainer = styled.div`
  display: flex;
  padding: 0.4em 0;
`;
