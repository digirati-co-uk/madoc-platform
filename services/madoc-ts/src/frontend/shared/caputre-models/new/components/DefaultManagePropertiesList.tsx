import React from 'react';
import styled from 'styled-components';
import { CloseIcon } from '../../../atoms/CloseIcon';
import { useManagePropertyList } from '../hooks/use-manage-property-list';
import { EditorRenderingConfig } from './EditorSlots';

const NewInstanceContainer = styled.div`
  margin-bottom: 0.5em;
`;

const InstanceContainer = styled.div`
  display: flex;
  align-items: center;
`;

const InstanceComponent = styled.div`
  flex: 1 1 0px;
`;

const InstanceRemove = styled.div`
  margin-bottom: 15px;
  margin-left: 5px;
`;

const AddNewInstance = styled.button`
  background: #eee;
  color: #666;
  font-size: 0.9em;
  border-radius: 1.25em;
  height: 2em;
  line-height: calc(2em - 4px);
  padding: 0 1em;
  border: 2px solid transparent;
  vertical-align: center;
  cursor: pointer;
  &:hover,
  &:focus {
    border: 2px solid #4265e9;
  }
  &:focus {
    outline: none;
  }
`;

export const DefaultManagePropertyList: EditorRenderingConfig['ManagePropertyList'] = ({
  property,
  type,
  children,
}) => {
  const {
    allowMultiple,
    canAdd,
    canRemove,
    label,
    createNewEntity,
    createNewField,
    removeItem,
  } = useManagePropertyList(property);

  if (!allowMultiple || (!canRemove && !canAdd)) {
    return <>{children}</>;
  }

  return (
    <>
      {canRemove
        ? // @todo this is a fragile model.
          React.Children.map(children, comp => {
            const id = (comp as any)?.props?.field?.id || (comp as any)?.props?.entity?.id;
            return (
              <InstanceContainer>
                <InstanceComponent>{comp}</InstanceComponent>
                <InstanceRemove onClick={() => removeItem(id)}>
                  <CloseIcon />
                </InstanceRemove>
              </InstanceContainer>
            );
          })
        : children}
      {canAdd ? (
        <NewInstanceContainer>
          <AddNewInstance onClick={type === 'entity' ? createNewEntity : createNewField}>
            + Add another {label}
          </AddNewInstance>
        </NewInstanceContainer>
      ) : null}
    </>
  );
};
