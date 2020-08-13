import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { TableActions, TableContainer, TableRow, TableRowLabel } from './Table';

const TableHandleIcon: React.FC<{ className: string } & any> = ({ className, ...props }) => (
  <div className={className} {...props}>
    <svg width="17px" height="11px" viewBox="0 0 17 11" version="1.1">
      <title>Handle</title>
      <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Compact-item" transform="translate(-10.000000, -10.000000)">
          <rect id="Rectangle" stroke="#B1B1B1" x="0.5" y="0.5" width="1197" height="29" />
          <g id="Handle" transform="translate(10.000000, 10.000000)" stroke="#979797" strokeLinecap="square">
            <line x1="16.5" y1="0.5" x2="0.5" y2="0.5" id="Line-5" />
            <line x1="16.5" y1="5.5" x2="0.5" y2="5.5" id="Line-5" />
            <line x1="16.5" y1="10.5" x2="0.5" y2="10.5" id="Line-5" />
          </g>
        </g>
      </g>
    </svg>
  </div>
);

const TableHandle = styled(TableHandleIcon)`
  margin: 4px;
`;

export const ReorderTableRow: React.FC<{
  id: string;
  idx: number;
  addition?: boolean;
  label: string | JSX.Element;
}> = ({ id, idx, label, addition, children }) => (
  <Draggable draggableId={id} index={idx}>
    {provided => (
      <TableRow ref={provided.innerRef} addition={addition} {...provided.draggableProps}>
        <TableHandle {...provided.dragHandleProps} />
        <TableRowLabel>{label}</TableRowLabel>
        <TableActions>{children}</TableActions>
      </TableRow>
    )}
  </Draggable>
);

export const ReorderTable: React.FC<{ reorder?: (source: number, dest: number) => void }> = ({ reorder, children }) => {
  const onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (reorder) {
      reorder(result.source.index, result.destination.index);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {provided => (
          <TableContainer {...provided.droppableProps} ref={provided.innerRef}>
            {children}
            {provided.placeholder}
          </TableContainer>
        )}
      </Droppable>
    </DragDropContext>
  );
};
