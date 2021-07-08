import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import styled from 'styled-components';
import { extractBlockDefinitions } from '../../../extensions/page-blocks/block-editor-react';
import { EditorialContext, SiteBlock, SiteSlot } from '../../../types/schemas/site-page';
import { Button, ButtonRow, TinyButton } from '../atoms/Button';
import { SurfaceProps } from '../atoms/Surface';
import { ModalButton } from '../components/Modal';
import { useApi } from '../hooks/use-api';
import { TableHandleIcon } from '../icons/TableHandleIcon';
import { BlockCreator } from './block-creator';
import { ExplainSlot } from './explain-slot';
import { RenderBlock } from './render-block';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import {
  SlotEditorContainer,
  SlotEditorButton,
  SlotEditorLabel,
  SlotEditorWhy,
  SlotOutlineContainer,
} from '../atoms/SlotEditor';
import { SlotLayout } from '../atoms/SlotLayout';
import { SurfaceEditor } from './surface-editor';
import { CustomEditorTypes } from './custom-editor-types';

type SlotEditorProps = {
  slot: SiteSlot;
  blocks: SiteBlock[];
  layout?: string;
  context?: EditorialContext;
  onUpdateSlot?: () => void;
  onUpdateBlock?: (blockId: number) => void | Promise<void>;
  invalidateSlots?: () => void | Promise<void>;
  onResetSlot?: () => void;
  defaultContents?: any;
  surfaceProps?: SurfaceProps;
  pagePath?: string;
};

const EditingBlockContainer = styled.div`
  flex: 1 1 0px;
  border-bottom: 1px solid #ccc;
  padding-left: 10px;
  background: inherit;
`;

const EditingBlock = styled.div`
  display: flex;
`;

const EditingBlockActions = styled.div`
  background: #eee;
  padding: 0.5em;
  border-bottom: 1px solid #ccc;
`;

const EditBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TableHandle = styled(TableHandleIcon)`
  margin: 4px;
`;

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const SlotEditor: React.FC<SlotEditorProps> = props => {
  const [isEditing, setIsEditing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [blockOrder, setBlockOrder] = useState(() => props.blocks.map(block => block.id));
  const slotSurface = useRef<SurfaceProps>(props.slot?.props?.surface || {});

  useEffect(() => {
    setBlockOrder(props.blocks.map(block => block.id));
  }, [props.blocks]);

  const orderedBlocks = useMemo(() => {
    const blocksToShow: SiteBlock[] = [...props.blocks];

    blocksToShow.sort((a: SiteBlock, b: SiteBlock) => {
      return blockOrder.indexOf(a.id) > blockOrder.indexOf(b.id) ? 1 : -1;
    });

    return blocksToShow;
  }, [blockOrder, props.blocks]);

  const api = useApi();

  const [removeSlot] = useMutation(async () => {
    await api.pageBlocks.deleteSlot(props.slot.id);
    if (props.onUpdateSlot) {
      props.onUpdateSlot();
    }
    if (props.invalidateSlots) {
      await props.invalidateSlots();
    }
  });

  const [updateSlot] = useMutation(async (slot: SiteSlot) => {
    await api.pageBlocks.updateSlot(slot.id, slot);
    if (props.onUpdateSlot) {
      props.onUpdateSlot();
    }
    if (props.invalidateSlots) {
      await props.invalidateSlots();
    }
  });

  const [saveBlockToSlot] = useMutation(async (block: SiteBlock) => {
    const currentBlockIds = props.blocks.map(bl => bl.id);
    await api.pageBlocks.updateSlotStructure(props.slot.id, [...currentBlockIds, block.id]);
    if (props.onUpdateSlot) {
      props.onUpdateSlot();
    }
    if (props.invalidateSlots) {
      await props.invalidateSlots();
    }
  });

  const [removeBlock] = useMutation(async (blockId: number) => {
    const currentBlockIds = props.blocks.map(bl => bl.id);
    await api.pageBlocks.updateSlotStructure(
      props.slot.id,
      currentBlockIds.filter(id => id !== blockId)
    );
    if (props.onUpdateSlot) {
      props.onUpdateSlot();
    }
    if (props.invalidateSlots) {
      await props.invalidateSlots();
    }
  });

  const onDragEnd = async (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const newOrder = reorder(blockOrder, result.source.index, result.destination.index);
    setBlockOrder(newOrder);
    await api.pageBlocks.updateSlotStructure(props.slot.id, newOrder);
    if (props.invalidateSlots) {
      await props.invalidateSlots();
    }
  };

  if (isResetting) {
    return (
      <div>
        <SlotEditorContainer>
          <SlotEditorLabel>{props.slot.label || props.slot.slotId}</SlotEditorLabel>

          <SlotEditorButton onClick={() => setIsResetting(false)}>Cancel</SlotEditorButton>
          <SlotEditorButton onClick={() => removeSlot()}>Confirm reset</SlotEditorButton>
        </SlotEditorContainer>
        <SlotOutlineContainer>
          <SlotLayout layout={props.layout} surfaceProps={props.surfaceProps}>
            {props.defaultContents}
          </SlotLayout>
        </SlotOutlineContainer>
      </div>
    );
  }

  const defaultDefinitions = extractBlockDefinitions(props.defaultContents);

  return (
    <CustomEditorTypes>
      <SlotEditorContainer>
        <SlotEditorLabel>{props.slot.label || props.slot.slotId}</SlotEditorLabel>
        <SlotEditorButton
          onClick={() => {
            setIsEditing(e => !e);
          }}
        >
          {isEditing ? 'Finish editing' : 'Edit blocks'}
        </SlotEditorButton>
        <ModalButton
          as={SlotEditorButton}
          title="Add block"
          modalSize={'lg'}
          render={({ close }) => (
            <BlockCreator
              pagePath={props.pagePath}
              context={props.context}
              defaultBlocks={defaultDefinitions}
              existingBlocks={props.blocks}
              onSave={block => {
                saveBlockToSlot(block).then(() => {
                  close();
                });
              }}
            />
          )}
        >
          Add block
        </ModalButton>

        <ModalButton
          as={SlotEditorButton}
          title="Edit surface"
          modalSize="lg"
          render={() => {
            return (
              <SurfaceEditor
                surfaceContent={
                  <div>
                    {orderedBlocks.map(block => {
                      return (
                        <RenderBlock
                          key={block.id}
                          block={block}
                          context={props.context}
                          editable={false}
                          showWarning={true}
                          onUpdateBlock={props.onUpdateBlock}
                        />
                      );
                    })}
                  </div>
                }
                surfaceProps={slotSurface.current}
                onChange={newData => {
                  slotSurface.current = newData;
                }}
              />
            );
          }}
          footerAlignRight
          renderFooter={({ close }) => {
            return (
              <ButtonRow $noMargin>
                <Button
                  $primary
                  onClick={() => {
                    updateSlot({
                      ...props.slot,
                      props: {
                        ...(props.slot.props || {}),
                        surface: slotSurface.current,
                      },
                    }).then(() => {
                      close();
                    });
                  }}
                >
                  Save
                </Button>
              </ButtonRow>
            );
          }}
        >
          Edit surface
        </ModalButton>

        {/*/!* @todo *!/*/}
        {/*<SlotEditorButton>Change layout</SlotEditorButton>*/}
        {/*<ModalButton as={SlotEditorButton} title="Advanced options" render={() => <div>Advanced</div>}>*/}
        {/*  Advanced options*/}
        {/*</ModalButton>*/}
        <SlotEditorButton onClick={() => setIsResetting(r => !r)}>Reset slot</SlotEditorButton>

        <ModalButton
          as={SlotEditorWhy}
          title="Why am I seeing this slot?"
          modalSize={'md'}
          render={({ close }) => <ExplainSlot context={props.context} slot={props.slot} />}
        >
          Why am I seeing this slot?
        </ModalButton>
      </SlotEditorContainer>
      <SlotOutlineContainer>
        {isResetting ? (
          <div>{props.defaultContents || null}</div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable" direction={props.layout === 'flex' ? 'horizontal' : 'vertical'}>
              {provided => (
                <SlotLayout
                  layout={props.layout}
                  surfaceProps={props.surfaceProps}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {orderedBlocks.map((block, idx) => {
                    if (isEditing) {
                      return (
                        <Draggable key={block.id} draggableId={`${block.id}`} index={idx}>
                          {providedInner => (
                            <EditingBlock key={block.id} ref={providedInner.innerRef} {...providedInner.draggableProps}>
                              <EditingBlockActions>
                                <TableHandle {...providedInner.dragHandleProps} />
                              </EditingBlockActions>
                              <EditingBlockContainer>
                                <EditBlockWrapper>
                                  <RenderBlock
                                    key={block.id}
                                    block={block}
                                    context={props.context}
                                    editable={true}
                                    showWarning={true}
                                    onUpdateBlock={props.onUpdateBlock}
                                  />
                                </EditBlockWrapper>
                              </EditingBlockContainer>
                              <EditingBlockActions>
                                <TinyButton onClick={() => removeBlock(block.id)}>Remove</TinyButton>
                              </EditingBlockActions>
                            </EditingBlock>
                          )}
                        </Draggable>
                      );
                    }

                    return (
                      <RenderBlock
                        key={block.id}
                        block={block}
                        context={props.context}
                        onUpdateBlock={() => {
                          if (props.onUpdateSlot) {
                            props.onUpdateSlot();
                          }
                        }}
                      />
                    );
                  })}
                  {provided.placeholder}
                </SlotLayout>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </SlotOutlineContainer>
    </CustomEditorTypes>
  );
};
