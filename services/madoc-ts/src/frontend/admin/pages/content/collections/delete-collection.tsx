import React from 'react';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { useMutation } from 'react-query';
import { Button } from '../../../../shared/atoms/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { CollectionFull } from '../../../../../types/schemas/collection-full';
import { useHistory } from 'react-router-dom';
import { Heading3 } from '../../../../shared/atoms/Heading3';

export const DeleteCollection: React.FC<{ collection: CollectionFull['collection'] }> = ({ collection }) => {
  const api = useApi();
  const history = useHistory();
  const [deleteCollection, { status }] = useMutation(async () => {
    await api.deleteCollection(collection.id);
    history.push(`/collections`);
  });

  return (
    <p>
      <Heading3>Are you sure you want to delete this collection?</Heading3>
      <Button disabled={status !== 'idle'} onClick={() => deleteCollection()}>
        Delete collection
      </Button>
    </p>
  );
};
