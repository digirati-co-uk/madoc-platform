import React from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { WarningMessage } from '../../../../shared/callouts/WarningMessage';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { useApi } from '../../../../shared/hooks/use-api';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';
import { useTranslation } from 'react-i18next';
import { InfoMessage } from '../../../../shared/callouts/InfoMessage';
export function DeleteTopicType() {
  const api = useApi();
  const { data, isLoading } = useTopicType();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const canDelete = data && data.topic_count < 1;

  const [deleteTopicType] = useMutation(async () => {
    if (data) {
      await api.enrichment.deleteEntityType(data?.slug);
      navigate(`/topics`);
    }
  });

  return (
    <div>
      <div>
        {data?.slug === 'null' ? (
          <WarningMessage>{t('slug field is <b>null</b>. Deletion will not work')}</WarningMessage>
        ) : null}
      </div>
      <p>This topic type will be deleted and all data will be lost</p>
      {!canDelete && <InfoMessage>{t('This topic type cannot be delete if it has topics')}</InfoMessage>}
      <ButtonRow>
        <Button disabled={isLoading || !canDelete} $primary $error onClick={() => deleteTopicType()}>
          {t('Delete topic type')}
        </Button>
      </ButtonRow>
    </div>
  );
}
