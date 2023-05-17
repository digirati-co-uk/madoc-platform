import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { useRouteContext } from '../../../../shared/plugins/public-api';
import { useTopic } from '../../../../site/pages/loaders/topic-loader';
import { useTranslation } from 'react-i18next';

export function DeleteTopic() {
  const api = useApi();
  const { topicType } = useRouteContext();
  const { data, isLoading } = useTopic();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [deleteTopic] = useMutation(async () => {
    if (data) {
      await api.enrichment.deleteEntity(data.type_slug, data.slug);
      navigate(`/topics/${topicType}?deleted=true`);
    }
  });

  return (
    <div>
      <div>
        {data?.id === 'null' ? (
          <WarningMessage>{t('ID field is <b>null</b>. Deletion will not work')}</WarningMessage>
        ) : null}
      </div>
      <ButtonRow>
        <Button disabled={isLoading} $primary $error onClick={() => deleteTopic()}>
          {t('Delete topic')}
        </Button>
      </ButtonRow>
    </div>
  );
}
