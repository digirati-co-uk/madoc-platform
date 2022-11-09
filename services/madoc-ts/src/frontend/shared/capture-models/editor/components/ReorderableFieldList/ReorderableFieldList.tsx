import { expandModelFields, mergeFlatKeys, structureToFlatStructureDefinition } from '../../core/structure-editor';
import { List, ListContent, ListHeader, ListItem } from '../../atoms/List';
import { Box } from '@styled-icons/entypo/Box';
import { Edit } from '@styled-icons/entypo/Edit';
import { Tag } from '../../atoms/Tag';
import { Button } from '../../atoms/Button';
import React, { SetStateAction, useMemo } from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

interface ReorderableFieldListProps {
  document: CaptureModel['document'];
  selected: string[][];
  setSelected: (action: SetStateAction<string[][]>) => void;
}

export default function ReorderableFieldList({ document, selected, setSelected }: ReorderableFieldListProps) {
  const { t } = useTranslation();

  const flatItems = useMemo(() => {
    return structureToFlatStructureDefinition(document, mergeFlatKeys(selected));
  }, [document, selected]);

  const onDragEnd = (result: DropResult) => {
    const destination = result.destination;
    if (!destination) {
      return;
    }

    setSelected(_items => {
      const items = [..._items];
      const [removed] = items.splice(result.source.index, 1);
      items.splice(destination.index, 0, removed);
      return expandModelFields(mergeFlatKeys(items));
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {provided => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <List>
              {flatItems.map((item, key) => (
                <Draggable key={item.key.join('--HASH--')} draggableId={item.key.join('--HASH--')} index={key}>
                  {innerProvided => (
                    <ListItem
                      ref={innerProvided.innerRef}
                      {...innerProvided.draggableProps}
                      {...innerProvided.dragHandleProps}
                      key={key}
                    >
                      {item.type === 'entity' ? <Box size={16} /> : <Edit size={16} />}
                      <ListContent fluid>
                        <ListHeader>{item.fullLabel || item.label}</ListHeader>
                      </ListContent>
                      <ListContent>
                        <Tag style={{ marginRight: 5 }}>{item.type}</Tag>
                        <Button
                          alert
                          size="mini"
                          onClick={() => {
                            // Remove the current item.
                            setSelected(selected.filter(r => r.join('--HASH--') !== item.key.join('--HASH--')));
                          }}
                        >
                          {t('Remove')}
                        </Button>
                      </ListContent>
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
