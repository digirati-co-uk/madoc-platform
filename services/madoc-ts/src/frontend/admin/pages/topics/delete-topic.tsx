import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { useApi } from '../../../shared/hooks/use-api';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { useRouteContext } from '../../../shared/plugins/public-api';
import { useTopic } from '../../../site/pages/loaders/topic-loader';

export function DeleteTopic() {
  const api = useApi();
  const { topicType } = useRouteContext();
  const { data, isLoading } = useTopic();
  const navigate = useNavigate();

  const [deleteTopic] = useMutation(async () => {
    if (data) {
      await api.authority.entity.delete(data?.id);
      navigate(`/topics/${topicType}?deleted=true`);
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
        <Button disabled={isLoading} $primary $error onClick={() => deleteTopic()}>
          Delete topic
        </Button>
      </ButtonRow>
    </div>
  );
}
