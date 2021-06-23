import { useMemo } from 'react';
import * as React from 'react';
import styled, { css } from 'styled-components';
import { HrefLink } from '../utility/href-link';
import { Button } from './Button';

export const KanbanBoard = styled.div`
  overflow: auto;
  background: #fff;
  height: 100%;
  justify-items: stretch;
`;

export const KanbanBoardContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  min-height: 600px;
  max-height: 900px;
`;

export const KanbanCol = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 1em;
  width: 33.3333%;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background-color: #f4f5f7;
  overflow: auto;
`;

export const KanbanColTitle = styled.div`
  //background: red;
  padding: 10px;
  font-weight: bold;
  font-size: 0.875rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  position: sticky;
  background: #e7e7ec;
  top: 0px;
  min-height: 2.3rem;
  text-align: center;
`;

export const KanbanCard = styled.div<{ $disabled?: boolean }>`
  background: #fff;
  margin: 0.5em 0.75em;
  border-radius: 5px;
  box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.12);
  ${props =>
    props.$disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`;

export const KanbanCardInner = styled.div`
  padding: 1em 1em 0;
`;

export const KanbanLabel = styled.div`
  font-size: 0.85em;
  line-height: 1.35em;
  font-weight: bold;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const KanbanType = styled.div`
  font-size: 0.75em;
  color: #999;
`;

export const KanbanAvatarContainer = styled.button<{ $inline?: boolean }>`
  display: flex;
  padding: 0.5em;
  align-items: center;
  border-radius: 5px;
  margin: 0.5em;
  border: 2px solid transparent;
  background: none;
  &:hover {
    background: #e9e9e9;
    cursor: pointer;
  }
  &:focus {
    border-color: #4265e9;
  }
  text-decoration: none;

  ${props =>
    props.$inline &&
    css`
      margin: 0;
      padding: 0.1em;
    `}
`;

export const KanbanAvatar = styled.div`
  background: #93cea4;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.9em;
  line-height: 24px;
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
`;

export const KanbanAssigneeName = styled.div`
  color: #555;
  margin: 0 1em;
  font-size: 0.9em;
  font-weight: bold;
`;

/**
 * Source: Robert Sharp
 */
function pastelColour(input: string) {
  const baseRed = 128;
  const baseGreen = 128;
  const baseBlue = 128;

  //lazy seeded random hack to get values from 0 - 256
  //for seed just take bitwise XOR of first two chars
  let seed = input.charCodeAt(0) ^ input.charCodeAt(1);
  const rand_1 = Math.abs(Math.sin(seed++) * 10000) % 256;
  const rand_2 = Math.abs(Math.sin(seed++) * 10000) % 256;
  const rand_3 = Math.abs(Math.sin(seed++) * 10000) % 256;

  //build colour
  const red = Math.round((rand_1 + baseRed) / 2);
  const green = Math.round((rand_2 + baseGreen) / 2);
  const blue = Math.round((rand_3 + baseBlue) / 2);

  const color = red + blue + green <= 500 ? 'white' : 'black';

  return [`rgb(${red}, ${green}, ${blue})`, color];
}

export const KanbanAssignee: React.FC<{ children: string; href?: string; inline?: boolean }> = ({
  href,
  inline,
  children,
}) => {
  const [background, color] = useMemo(() => pastelColour(children), [children]);

  return (
    <KanbanAvatarContainer as={href ? HrefLink : undefined} href={href} $inline={inline}>
      <KanbanAvatar style={{ background, color }}>{children[0].toUpperCase()}</KanbanAvatar>
      <KanbanAssigneeName>{children}</KanbanAssigneeName>
    </KanbanAvatarContainer>
  );
};

export const KanbanEmpty = styled.div`
  font-size: 1.8em;
  color: #999;
  text-align: center;
  padding: 2em 0;
`;

export const KanbanCardButton = styled(Button)`
  text-align: center;
  display: block;
  padding: 0.5em;
  font-size: 0.8em;
  width: 100%;
  border-radius: 0 0 5px 5px;
  border: none;
`;

export const KanbanCardTextButton = styled.button`
  text-align: center;
  display: block;
  padding: 0.75em;
  font-size: 0.8em;
  width: 100%;
  cursor: pointer;
  border-radius: 0 0 5px 5px;
  border: none;
  background: #fff;
  color: #104e8b;
  font-weight: bold;
  &:focus {
    outline: none;
  }
`;
