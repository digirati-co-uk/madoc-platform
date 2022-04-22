import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { AnnotationStyles } from '../../../../../types/annotation-styles';
import { SystemListItem } from '../../../../shared/atoms/SystemListItem';
import {
  SystemAction,
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemMetadata,
  SystemName,
} from '../../../../shared/atoms/SystemUI';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { Button } from '../../../../shared/navigation/Button';
import { AnnotationStylePreview, AnnotationStylePreviewList } from '../../../molecules/AnnotationStylePreview';
import { ListAnnotationStyles } from '../../annotation-styles/list-annotation-styles';

export function ChooseAnnotationStyle(props: any) {
  const { t } = useTranslation();
  const { data } = useData<{ styles: AnnotationStyles[] }>(ListAnnotationStyles);
  const api = useApi();
  const { id: projectId } = useParams<{ id: string }>();

  const [chooseStyle, chooseStyleStatus] = useMutation(async (id: number) => {
    await api.updateProjectAnnotationStyle(projectId, id);
    await props.refetch();
  });

  return (
    <SystemBackground>
      {data ? (
        data.styles.map(style => (
          <SystemListItem key={style.id}>
            <SystemMetadata>
              <SystemName>{style.name}</SystemName>
              <SystemDescription>
                <AnnotationStylePreviewList>
                  {Object.keys(style.theme).map(theme => {
                    return (
                      <AnnotationStylePreview
                        key={theme}
                        title={theme}
                        data={(style.theme as any)[theme] || {}}
                        style={{ width: 50, height: 50 }}
                      />
                    );
                  })}
                </AnnotationStylePreviewList>
              </SystemDescription>
            </SystemMetadata>
            <SystemActions>
              <SystemAction>
                <Button
                  onClick={() => chooseStyle(style.id)}
                  $primary
                  disabled={chooseStyleStatus.isLoading || style.id === props.styleId}
                >
                  {style.id !== props.styleId ? t('Choose style') : t('This is the current style')}
                </Button>
              </SystemAction>
            </SystemActions>
          </SystemListItem>
        ))
      ) : (
        <EmptyState>No annotation styles</EmptyState>
      )}
    </SystemBackground>
  );
}
