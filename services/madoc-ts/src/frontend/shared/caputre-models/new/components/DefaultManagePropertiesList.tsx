import { Revisions } from '@capture-models/editor';
import React, { useCallback } from 'react';
import styled from 'styled-components';
import { TinyButton } from '../../../atoms/Button';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { useManagePropertyList } from '../hooks/use-manage-property-list';
import { EditorRenderingConfig } from './EditorSlots';

const NewInstanceContainer = styled.div`
  text-align: center;
`;

export const DefaultManagePropertyList: EditorRenderingConfig['ManagePropertyList'] = ({
  property,
  type,
  children,
}) => {
  const { allowMultiple, label, createNewEntity, createNewField } = useManagePropertyList(property);

  if (!allowMultiple) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <NewInstanceContainer>
        <TinyButton onClick={() => (type === 'entity' ? createNewEntity : createNewField)}>Add {label}</TinyButton>
      </NewInstanceContainer>
    </>
  );
};
