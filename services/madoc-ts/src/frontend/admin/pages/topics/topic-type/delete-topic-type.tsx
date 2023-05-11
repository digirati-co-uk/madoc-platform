import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';

export function DeleteTopicType() {
  const api = useApi();
  const { data, isLoading } = useTopicType();
  const navigate = useNavigate();

  const [deleteTopicType] = useMutation(async () => {
    if (data) {
      await api.authority.entity_type.delete(data?.id);
      navigate(`/topics`);
    }
  });

  return (
    <div>
      <div>
        {data?.id === 'null' ? (
          <WarningMessage>
            ID field is <strong>null</strong>. Deletion will not work
          </WarningMessage>
        ) : null}
      </div>
      <ButtonRow>
        <Button disabled={isLoading} $primary $error onClick={() => deleteTopicType()}>
          Delete topic type
        </Button>
      </ButtonRow>
    </div>
  );
}
