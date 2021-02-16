import { generateId } from '@capture-models/helpers';
import { InternationalString } from '@hyperion-framework/types';
import produce from 'immer';
import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { MetadataEditor } from '../../admin/molecules/MetadataEditor';
import { Button } from '../atoms/Button';
import { CloseIcon } from '../atoms/CloseIcon';
import {
  FacetEditActions,
  FacetEditBack,
  FacetEditContainer,
  FacetEditRemove,
  MetadataCard,
  MetadataCardItem,
  MetadataCardLabel,
  MetadataCardListContainer,
  MetadataInputLabel,
  MetadataCardRemove,
  MetadataCardRemoveLabel,
  MetadataCardSubtext,
  MetadataDropzone,
  MetadataEmbeddedList,
  MetadataEmptyState,
  MetadataListContainer,
  MetadataListItemChildren,
  MetadataListItemCollapse,
  MetadataListItemContainer,
  MetadataListItemIcon,
  MetadataListItemLabel,
  MetadataListItemSubtitle,
  TableHandleIcon,
} from '../atoms/MetadataConfiguration';
import { useApi } from '../hooks/use-api';
import { apiHooks } from '../hooks/use-api-query';
import { useDrag, useDrop } from 'react-dnd';
import { useDefaultLocale, useSupportedLocales } from '../hooks/use-site';
import { Spinner } from '../icons/Spinner';
import { LocaleString } from './LocaleString';

const MetadataSingleValue: React.FC<{ parentLabel: string; value: string; total_items: number; language?: string }> = ({
  parentLabel,
  value,
  language,
  total_items,
}) => {
  const [, drag, preview] = useDrag({
    item: { type: 'facet-value', parentLabel, value, language },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <MetadataListItemContainer ref={preview}>
      <MetadataListItemIcon ref={drag}>
        <TableHandleIcon />
      </MetadataListItemIcon>
      <MetadataListItemLabel>{value}</MetadataListItemLabel>
      <MetadataListItemSubtitle>{total_items} instances</MetadataListItemSubtitle>
    </MetadataListItemContainer>
  );
};

const MetadataSingleFacet: React.FC<{
  label: string;
  total_items: number;
  language?: string;
  expandable?: boolean;
}> = ({ label, language, expandable = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const childElements = apiHooks.getMetadataValues(() => [label], {
    enabled: isOpen,
  });
  const [, drag, preview] = useDrag({
    item: { type: 'facet', label, language },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <>
      <MetadataListItemContainer ref={preview}>
        <MetadataListItemIcon ref={drag}>
          <TableHandleIcon />
        </MetadataListItemIcon>
        <MetadataListItemLabel>{label}</MetadataListItemLabel>
        {expandable ? (
          <MetadataListItemCollapse onClick={() => setIsOpen(o => !o)}>
            {childElements.isLoading ? <Spinner stroke="#000" /> : isOpen ? '-' : '+'}
          </MetadataListItemCollapse>
        ) : null}
      </MetadataListItemContainer>
      {childElements.data && isOpen ? (
        <MetadataListItemChildren>
          {childElements.data.values.map((value, idx) => {
            return <MetadataSingleValue key={idx} parentLabel={label} {...value} />;
          })}
        </MetadataListItemChildren>
      ) : null}
    </>
  );
};

const Container = styled.div`
  display: flex;
`;

const MetadataColumn = styled.div`
  width: 400px;
  max-height: 800px;
  overflow-y: auto;
`;

const EditorColumn = styled.div`
  flex: 1 1 0px;
  margin-right: 1em;
`;

type FacetConfigValue = {
  id: string;
  label: InternationalString;
  values: string[];
  key: string;
};

export type FacetConfig = {
  id: string;
  label: InternationalString;
  keys: string[];
  values?: FacetConfigValue[];
};

type FacetConfigActions =
  | {
      type: 'add-facet';
      facet: FacetConfig;
    }
  | {
      type: 'remove-facet';
      facet: FacetConfig;
    }
  | {
      type: 'edit-facet';
      facet: FacetConfig;
    }
  | {
      type: 'add-facet-value';
      facetId: string;
      value: FacetConfigValue;
    }
  | {
      type: 'remove-facet-value';
      facetId: string;
      value: FacetConfigValue;
    }
  | {
      type: 'edit-facet-value';
      facetId: string;
      value: FacetConfigValue;
    }
  | {
      type: 'reorder-facets';
      sourceIndex: number;
      destinationIndex: number;
    }
  | {
      type: 'reorder-facet-values';
      facetId: string;
      sourceIndex: number;
      destinationIndex: number;
    };

const facetConfigStateReducer = produce((state: FacetConfig[], action: FacetConfigActions) => {
  switch (action.type) {
    case 'add-facet': {
      state.push(action.facet);
      break;
    }
    case 'add-facet-value': {
      const facet = state.find(f => f.id === action.facetId);
      if (facet) {
        if (!facet.values) {
          facet.values = [action.value];
        } else {
          facet.values.push(action.value);
        }
      }
      break;
    }

    case 'edit-facet': {
      const facet = state.find(f => f.id === action.facet.id);
      if (facet) {
        // Any more properties here.
        facet.label = action.facet.label;
        facet.keys = action.facet.keys;
      }
      break;
    }
    case 'edit-facet-value': {
      const facet = state.find(f => f.id === action.facetId);
      if (facet && facet.values) {
        const value = facet.values.find(v => v.id === action.value.id);
        if (value) {
          // Add any more properties here.
          value.label = action.value.label;
          value.values = action.value.values;
        }
      }
      break;
    }

    case 'reorder-facets': {
      const [removed] = state.splice(action.sourceIndex, 1);
      state.splice(action.destinationIndex, 0, removed);

      break;
    }

    case 'reorder-facet-values': {
      const facet = state.find(f => f.id === action.facetId);
      if (facet && facet.values) {
        const [removed] = facet.values.splice(action.sourceIndex, 1);
        facet.values.splice(action.destinationIndex, 0, removed);
      }

      break;
    }

    case 'remove-facet': {
      return state.filter(f => f.id !== action.facet.id);
    }
    case 'remove-facet-value': {
      const facet = state.find(f => f.id === action.facetId);
      if (facet && facet.values) {
        facet.values = facet.values.filter(v => v.id !== action.value.id);
      }
      break;
    }
    default:
      return state;
  }
});

const createInitialValues = (initialState: any) => {
  return initialState;
};

const useFacetConfigState = (initialState: FacetConfig[]) => {
  const [state, dispatch] = useReducer(facetConfigStateReducer, initialState, createInitialValues);

  const actions = useMemo(() => {
    const addFacet = (facet: FacetConfig) => {
      dispatch({ type: 'add-facet', facet });
    };
    const removeFacet = (facet: FacetConfig) => {
      dispatch({ type: 'remove-facet', facet });
    };
    const editFacet = (facet: FacetConfig) => {
      dispatch({ type: 'edit-facet', facet });
    };
    const addFacetValue = (id: string, value: FacetConfigValue) => {
      dispatch({ type: 'add-facet-value', facetId: id, value });
    };
    const removeFacetValue = (id: string, value: FacetConfigValue) => {
      dispatch({ type: 'remove-facet-value', facetId: id, value });
    };
    const editFacetValue = (id: string, value: FacetConfigValue) => {
      dispatch({ type: 'edit-facet-value', facetId: id, value });
    };
    const reorderFacets = (source: number, dest: number) => {
      dispatch({ type: 'reorder-facets', sourceIndex: source, destinationIndex: dest });
    };
    const reorderFacetValues = (id: string, source: number, dest: number) => {
      dispatch({ type: 'reorder-facet-values', facetId: id, sourceIndex: source, destinationIndex: dest });
    };

    const createNewFacetObject = (label: string, keys: string[], labelLang?: string): FacetConfig => {
      return {
        id: generateId(),
        keys: keys,
        values: [],
        label: { [labelLang || 'en']: [label] },
      };
    };
    const createNewFacetValueObject = (
      label: string,
      values: string[],
      labelLang: string,
      parentLabel: string
    ): FacetConfigValue => {
      return {
        id: generateId(),
        values: values,
        label: { [labelLang || 'en']: [label] },
        key: parentLabel,
      };
    };

    return {
      addFacet,
      removeFacet,
      editFacet,
      addFacetValue,
      removeFacetValue,
      editFacetValue,
      createNewFacetObject,
      createNewFacetValueObject,
      reorderFacets,
      reorderFacetValues,
    };
  }, [dispatch]);

  return [state as FacetConfig[], actions] as const;
};

const EditSingleValue: React.FC<{
  index: number;
  keys: string[];
  value: FacetConfigValue;
  editFacetValue: (value: FacetConfigValue) => void;
  removeFacetValue: (value: FacetConfigValue) => void;
}> = ({ index, keys, value, removeFacetValue, editFacetValue }) => {
  const defaultLocale = useDefaultLocale();
  const availableLanguages = useSupportedLocales();
  const [isOpen, setIsOpen] = useState(false);
  const { id, label, values } = value;

  const [dropValueState, dropValue] = useDrop({
    accept: 'facet-value',
    canDrop: item => {
      return keys.indexOf(`metadata.${item.parentLabel}`) !== -1 && values.indexOf(item.value) === -1;
    },
    drop: (item: any) => {
      editFacetValue({
        ...value,
        values: [...values, item.value],
      });
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  if (isOpen) {
    return (
      <Draggable draggableId={id} index={index}>
        {provided => (
          <FacetEditContainer ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
            <FacetEditActions>
              <FacetEditBack
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Back
              </FacetEditBack>
              <FacetEditRemove onClick={() => removeFacetValue(value)}>
                <CloseIcon />
                remove
              </FacetEditRemove>
            </FacetEditActions>
            <MetadataInputLabel htmlFor="title">Title</MetadataInputLabel>
            <MetadataEditor
              fluid
              id="title"
              fields={label}
              onSave={ret => {
                editFacetValue({
                  ...value,
                  label: ret.toInternationalString(),
                });
              }}
              metadataKey="label"
              availableLanguages={availableLanguages}
              defaultLocale={defaultLocale}
            />
            <MetadataInputLabel htmlFor="included-fields">
              When searching for this, search the above fields with all of these values
            </MetadataInputLabel>
            <MetadataEmbeddedList id="included-fields" ref={dropValue} canDrop={dropValueState.canDrop}>
              {(values || []).map(key => {
                return (
                  <MetadataCardItem key={key}>
                    <MetadataCard>
                      <MetadataCardLabel>{key}</MetadataCardLabel>
                    </MetadataCard>
                    <MetadataCardRemove
                      onClick={() => {
                        editFacetValue({
                          ...value,
                          values: values.filter(v => v !== key),
                        });
                      }}
                    >
                      <CloseIcon /> <MetadataCardRemoveLabel>remove</MetadataCardRemoveLabel>
                    </MetadataCardRemove>
                  </MetadataCardItem>
                );
              })}
              <MetadataDropzone>drop value from right list</MetadataDropzone>
            </MetadataEmbeddedList>
          </FacetEditContainer>
        )}
      </Draggable>
    );
  }

  return (
    <Draggable draggableId={id} index={index}>
      {provided => (
        <MetadataCardItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <MetadataCard onClick={() => setIsOpen(true)} interactive>
            <MetadataCardLabel>
              <LocaleString>{label}</LocaleString>
            </MetadataCardLabel>
            <MetadataCardSubtext>click to customise</MetadataCardSubtext>
          </MetadataCard>
          <MetadataCardRemove onClick={() => removeFacetValue(value)}>
            <CloseIcon /> <MetadataCardRemoveLabel>remove</MetadataCardRemoveLabel>
          </MetadataCardRemove>
        </MetadataCardItem>
      )}
    </Draggable>
  );
};

const EditSingleFacet: React.FC<{
  facet: FacetConfig;
  onBack: () => void;
  onRemove: (facet: FacetConfig) => void;
  onSaveFacet: (newFacet: FacetConfig) => void;

  // Facet value management
  addFacetValue: (id: string, value: FacetConfigValue) => void;
  createNewFacetValueObject: (
    label: string,
    values: string[],
    labelLang: string,
    parentLabel: string
  ) => FacetConfigValue;
  editFacetValue: (id: string, value: FacetConfigValue) => void;
  removeFacetValue: (id: string, value: FacetConfigValue) => void;
  reorderFacetValues: (id: string, source: number, dest: number) => void;
  allowSavingValues?: boolean;
}> = ({
  facet,
  onBack,
  onRemove,
  onSaveFacet,
  removeFacetValue,
  editFacetValue,
  createNewFacetValueObject,
  addFacetValue,
  reorderFacetValues,
  allowSavingValues,
}) => {
  const defaultLocale = useDefaultLocale();
  const availableLanguages = useSupportedLocales();

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    reorderFacetValues(facet.id, result.source.index, result.destination.index);
  };

  const [dropFieldsState, dropFields] = useDrop({
    accept: 'facet',
    canDrop: item => {
      return facet.keys.indexOf(`metadata.${item.label}`) === -1;
    },
    drop: (item: any) => {
      onSaveFacet({
        ...facet,
        keys: [...facet.keys, `metadata.${item.label}`],
      });
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const [dropValueState, dropValue] = useDrop({
    accept: 'facet-value',
    canDrop: item => {
      return facet.keys.indexOf(`metadata.${(item as any).parentLabel}`) !== -1;
    },
    drop: (item: any, monitor) => {
      if (monitor.isOver({ shallow: true })) {
        addFacetValue(
          facet.id,
          createNewFacetValueObject(item.value, [item.value], item.language, `metadata.${item.parentLabel}`)
        );
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <FacetEditContainer>
      <FacetEditActions>
        <FacetEditBack onClick={onBack}>Back</FacetEditBack>
        <FacetEditRemove onClick={() => onRemove(facet)}>
          <CloseIcon />
          remove
        </FacetEditRemove>
      </FacetEditActions>
      <MetadataInputLabel htmlFor="title">Title</MetadataInputLabel>
      <MetadataEditor
        fluid
        id="title"
        fields={facet.label}
        onSave={ret => {
          onSaveFacet({
            ...facet,
            label: ret.toInternationalString(),
          });
        }}
        metadataKey="label"
        defaultLocale={defaultLocale}
        availableLanguages={availableLanguages}
      />
      <MetadataInputLabel htmlFor="included-fields">This will combine the following fields</MetadataInputLabel>
      <MetadataEmbeddedList id="included-fields" ref={dropFields} canDrop={dropFieldsState.canDrop}>
        {facet.keys.map(key => {
          const visualKey = key.startsWith('metadata.') ? key.slice('metadata.'.length) : key;
          return (
            <MetadataCardItem key={key}>
              <MetadataCard>
                <MetadataCardLabel>{visualKey}</MetadataCardLabel>
              </MetadataCard>
              <MetadataCardRemove
                onClick={() => {
                  onSaveFacet({
                    ...facet,
                    keys: facet.keys.filter(f => f !== key),
                  });
                }}
              >
                <CloseIcon /> <MetadataCardRemoveLabel>remove</MetadataCardRemoveLabel>
              </MetadataCardRemove>
            </MetadataCardItem>
          );
        })}
        <MetadataDropzone>drop item from the right list</MetadataDropzone>
      </MetadataEmbeddedList>
      {allowSavingValues ? (
        <>
          <MetadataInputLabel htmlFor="included-values">
            The facet list will only contain the following values
          </MetadataInputLabel>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <MetadataEmbeddedList id="included-values" ref={dropValue} canDrop={dropValueState.canDrop}>
                    {(facet.values || []).map((value, idx) => {
                      return (
                        <EditSingleValue
                          key={value.id}
                          index={idx}
                          keys={facet.keys}
                          removeFacetValue={(v: FacetConfigValue) => removeFacetValue(facet.id, v)}
                          editFacetValue={(v: FacetConfigValue) => editFacetValue(facet.id, v)}
                          value={value}
                        />
                      );
                    })}
                    {!facet.values || facet.values.length === 0 ? (
                      <MetadataEmptyState>Showing all values</MetadataEmptyState>
                    ) : null}
                    {provided.placeholder}
                  </MetadataEmbeddedList>
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      ) : null}
    </FacetEditContainer>
  );
};

const MetadataConfigEditor: React.FC<{
  facets: FacetConfig[];
  onSave: (facets: FacetConfig[]) => void | Promise<void>;
  allowSavingValues?: boolean;
}> = props => {
  const [
    facets,
    {
      addFacet,
      addFacetValue,
      createNewFacetObject,
      createNewFacetValueObject,
      editFacet,
      editFacetValue,
      removeFacet,
      removeFacetValue,
      reorderFacets,
      reorderFacetValues,
    },
  ] = useFacetConfigState(props.facets);

  const [isSaving, setIsSaving] = useState(false);
  const [willShowSavedMessage, setWillShowSavedMessage] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    if (isSaving) {
      setWillShowSavedMessage(true);
    } else if (willShowSavedMessage) {
      setWillShowSavedMessage(true);
      setShowSavedMessage(true);
      const timeout = setTimeout(() => {
        setShowSavedMessage(false);
      }, 2000);
      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {
      // no-op
    };
  }, [isSaving]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    reorderFacets(result.source.index, result.destination.index);
  };

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'facet',
    canDrop: () => true,
    drop: (item: any) => {
      addFacet(createNewFacetObject(item.label, [`metadata.${item.label}`], item.language));
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();

  const selectedItem = useMemo(() => {
    return facets.find(facet => facet.id === selectedItemId);
  }, [facets, selectedItemId]);

  const saveButton = (
    <div style={{ textAlign: 'right' }}>
      <Button
        disabled={isSaving}
        onClick={() => {
          setIsSaving(true);
          Promise.resolve(props.onSave(facets)).then(() => {
            setIsSaving(false);
          });
        }}
      >
        {showSavedMessage ? 'Changed saved!' : 'Save changes'}
      </Button>
    </div>
  );

  if (selectedItem) {
    return (
      <>
        {saveButton}
        <EditSingleFacet
          key={selectedItemId}
          facet={selectedItem}
          onBack={() => {
            setSelectedItemId(undefined);
          }}
          onRemove={item => {
            removeFacet(item);
          }}
          onSaveFacet={facet => {
            editFacet(facet);
          }}
          addFacetValue={addFacetValue}
          createNewFacetValueObject={createNewFacetValueObject}
          editFacetValue={editFacetValue}
          removeFacetValue={removeFacetValue}
          reorderFacetValues={reorderFacetValues}
          allowSavingValues={props.allowSavingValues}
        />
      </>
    );
  }

  return (
    <>
      {saveButton}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {provided => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              <MetadataCardListContainer ref={drop} isOver={isOver} canDrop={canDrop}>
                {facets.map((facet, idx) => (
                  <Draggable key={facet.id} draggableId={facet.id} index={idx}>
                    {providedInner => (
                      <MetadataCardItem
                        ref={providedInner.innerRef}
                        {...providedInner.draggableProps}
                        {...providedInner.dragHandleProps}
                      >
                        <MetadataCard onClick={() => setSelectedItemId(facet.id)} interactive>
                          <MetadataCardLabel>
                            <LocaleString>{facet.label}</LocaleString>
                          </MetadataCardLabel>
                          <MetadataCardSubtext>click to customise</MetadataCardSubtext>
                        </MetadataCard>
                        <MetadataCardRemove onClick={() => removeFacet(facet)}>
                          <CloseIcon /> <MetadataCardRemoveLabel>remove</MetadataCardRemoveLabel>
                        </MetadataCardRemove>
                      </MetadataCardItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                {facets.length === 0 ? (
                  <MetadataDropzone>
                    nothing added yet, drop value from right list. All values will be shown
                  </MetadataDropzone>
                ) : null}
              </MetadataCardListContainer>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export const MetadataFacetEditor: React.FC<{
  onSave: (facets: FacetConfig[]) => void | Promise<void>;
  facets: FacetConfig[];
  allowSavingValues?: boolean;
}> = ({ facets, onSave, allowSavingValues = true }) => {
  const api = useApi();
  const keys = apiHooks.getMetadataKeys(() => []);

  if (api.getIsServer()) {
    return null;
  }

  return (
    <Container>
      <EditorColumn>
        <MetadataConfigEditor facets={facets} onSave={onSave} allowSavingValues={allowSavingValues} />
      </EditorColumn>
      <MetadataColumn>
        <MetadataListContainer>
          {keys.data
            ? keys.data.metadata.map((metadata, idx) => (
                <MetadataSingleFacet key={idx} expandable={allowSavingValues} {...metadata} />
              ))
            : null}
        </MetadataListContainer>
      </MetadataColumn>
    </Container>
  );
};
