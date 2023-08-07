import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { TableHandleIcon } from '../icons/TableHandleIcon';
import { TableActions, TableContainer, TableRow, TableRowLabel } from '../layout/Table';

const TableHandle = styled(TableHandleIcon)`
  margin: 4px;
  color: #979797;
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
