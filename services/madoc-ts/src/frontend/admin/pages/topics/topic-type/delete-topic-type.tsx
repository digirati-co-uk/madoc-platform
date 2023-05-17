import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';
import { useTranslation } from 'react-i18next';

export function DeleteTopicType() {
  const api = useApi();
  const { data, isLoading } = useTopicType();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [deleteTopicType] = useMutation(async () => {
    if (data) {
      await api.enrichment.deleteEntityType(data?.slug);
      navigate(`/topics`);
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
        <Button disabled={isLoading} $primary $error onClick={() => deleteTopicType()}>
          {t('Delete topic type')}
        </Button>
      </ButtonRow>
    </div>
  );
}
