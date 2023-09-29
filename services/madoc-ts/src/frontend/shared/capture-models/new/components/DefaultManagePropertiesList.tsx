import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { CloseIcon } from '../../../icons/CloseIcon';
import { useSelectorHelper } from '../../editor/stores/selectors/selector-helper';
import { useManagePropertyList } from '../hooks/use-manage-property-list';
import { EditorRenderingConfig } from './EditorSlots';

const NewInstanceContainer = styled.div`
  margin-bottom: 1em;
`;

const InstanceContainer = styled.div`
  display: flex;
  align-items: center;
`;

const InstanceComponent = styled.div`
  flex: 1 1 0px;
`;

const InstanceRemove = styled.div<{ $center?: boolean }>`
  margin-bottom: 1.3em;
  margin-left: 0.5em;
  ${props =>
    props.$center
      ? css`
          align-self: center;
        `
      : css`
          align-self: flex-end;
        `}
`;

const AddNewInstance = styled.button`
  background: #e8edff;
  color: rgba(0, 0, 0, 0.6);
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
    canAddAnother,
    canAdd,
    canRemove,
    dependantValue,
    label,
    createNewEntity,
    createNewField,
    removeItem,
  } = useManagePropertyList(property);

  const { t } = useTranslation();
  const helper = useSelectorHelper();

  const onMouseEnter = (selector?: string) => () => {
    if (selector) {
      helper.highlight(selector);
    }
  };

  const onMouseLeave = (selector?: string) => () => {
    if (selector) {
      helper.clearHighlight(selector);
    }
  };

  if (!allowMultiple || (!canRemove && !canAdd) || !dependantValue) {
    return <>{children}</>;
  }

  return (
    <>
      {canRemove
        ? // @todo this is a fragile model.
          React.Children.map(children, comp => {
            const item =
              (comp as any)?.props?.children?.props?.field ||
              (comp as any)?.props?.children?.props?.entity ||
              (comp as any)?.props?.field ||
              (comp as any)?.props?.entity;
            const id = item?.id;
            const selector = item?.selector?.id;

            return (
              <InstanceContainer
                data-instance-id={id}
                onMouseEnter={onMouseEnter(selector)}
                onMouseLeave={onMouseLeave(selector)}
              >
                <InstanceComponent>{comp}</InstanceComponent>
                <InstanceRemove onClick={() => removeItem(id)}>
                  <CloseIcon />
                </InstanceRemove>
              </InstanceContainer>
            );
          })
        : children}
      {canAdd && canAddAnother ? (
        <NewInstanceContainer>
          <AddNewInstance onClick={type === 'entity' ? createNewEntity : createNewField}>
            {t('Add another {{label}}', { label })}
          </AddNewInstance>
        </NewInstanceContainer>
      ) : null}
    </>
  );
};
