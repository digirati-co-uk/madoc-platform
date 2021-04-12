import styled, { css } from 'styled-components';

export const TaskListContainer = styled.div`
  background: #fff;
`;

export const TaskItem = styled.div<{ $selected?: boolean }>`
  background: #fff;
  display: flex;
  border-bottom: 1px solid #eee;
  padding: 0.5em;
  font-size: 0.85em;
  cursor: pointer;
  max-width: 100%;

  ${props =>
    props.$selected &&
    css`
      background: #eff1ff;
    `}
`;

export const TaskItemImageContainer = styled.div`
  background: rgba(0, 0, 0, 0.15);
  width: 4.8em;
  min-width: 4.8em;
  height: 4.8em;

  img {
    display: inline-block;
    object-fit: contain;
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
