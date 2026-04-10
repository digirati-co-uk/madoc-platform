import React from 'react';
import { StructureType } from '../../../types/utility';
import { Button } from '../../atoms/Button';
import { List, ListContent, ListDescription, ListHeader, ListItem } from '../../atoms/List';
import { Folder } from '@styled-icons/entypo/Folder';
import { List as ListIcon } from '@styled-icons/entypo/List';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Tag } from '../../atoms/Tag';
import { useTranslation } from 'react-i18next';

type Props = {
  choice: StructureType<'choice'>;
  pushFocus: (key: number) => void;
  onRemove: (key: number) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
};

export const ChoiceList: React.FC<Props> = ({ onRemove, choice, onReorder, pushFocus }) => {
  const { t } = useTranslation();
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    onReorder(result.source.index, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {provided => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            <List>
              {choice.items.map((item, key) => (
                <Draggable key={item.id} draggableId={item.id} index={key}>
                  {innerProvided => (
                    <ListItem
                      ref={innerProvided.innerRef}
                      {...innerProvided.draggableProps}
                      {...innerProvided.dragHandleProps}
                      onClick={() => {
                        pushFocus(key);
                      }}
                    >
                      {item.type === 'model' ? <ListIcon size={15} /> : <Folder size={15} />}
                      <ListContent fluid>
                        <ListHeader>{item.label}</ListHeader>
                        {item.description ? <ListDescription>{item.description}</ListDescription> : null}
                      </ListContent>
                      <ListContent>
                        <Button
                          alert
                          size="mini"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Remove the current item.
                            onRemove(key);
                          }}
                        >
                          {t('Remove')}
                        </Button>
                        <Tag>{item.type}</Tag>
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
};

export default ChoiceList;
