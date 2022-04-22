import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import styled from 'styled-components';
import { AnnotationStyles } from '../../../../types/annotation-styles';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import {
  SystemAction,
  SystemActions,
  SystemBackground,
  SystemDescription,
  SystemListingLabel,
  SystemMetadata,
  SystemName,
  SystemVersion,
} from '../../../shared/atoms/SystemUI';
import { ModalButton } from '../../../shared/components/Modal';
import { useApi } from '../../../shared/hooks/use-api';
import { useData } from '../../../shared/hooks/use-data';
import { EmptyState } from '../../../shared/layout/EmptyState';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';
import { AnnotationStylePreview, AnnotationStylePreviewList } from '../../molecules/AnnotationStylePreview';

export function ListAnnotationStyles() {
  const { t } = useTranslation();
  const api = useApi();
  const { data, refetch } = useData<{ styles: AnnotationStyles[] }>(ListAnnotationStyles);
  const [deleteAnnotationStyle, deleteAnnotationStyleStatus] = useMutation((id: number) => {
    return api.deleteAnnotationStyle(id);
  });

  return (
    <>
      <AdminHeader title={t('Annotation styles')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} noMargin />

      <SystemBackground>
        <SystemListItem>
          <ButtonRow $noMargin>
            <Button as={HrefLink} href={`/site/annotation-styles/new`}>
              {t('Create new style')}
            </Button>
          </ButtonRow>
        </SystemListItem>

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
                  <Button as={HrefLink} $primary href={`/site/annotation-styles/${style.id}`}>
                    {t('View style')}
                  </Button>
                </SystemAction>
                <SystemAction>
                  <ModalButton
                    title={'Are you sure you want to delete'}
                    render={() => <p>Are you sure you want to delete this annotation style?</p>}
                    renderFooter={({ close }) => (
                      <ButtonRow $noMargin>
                        <Button disabled={deleteAnnotationStyleStatus.isLoading}>Cancel</Button>
                        <Button
                          $error
                          $primary
                          disabled={deleteAnnotationStyleStatus.isLoading}
                          onClick={() => {
                            deleteAnnotationStyle(style.id)
                              .then(() => refetch())
                              .then(() => close());
                          }}
                        >
                          {t('Delete')}
                        </Button>
                      </ButtonRow>
                    )}
                  >
                    <Button $error $primary>
                      {t('Delete')}
                    </Button>
                  </ModalButton>
                </SystemAction>
              </SystemActions>
            </SystemListItem>
          ))
        ) : (
          <EmptyState>No annotation styles</EmptyState>
        )}
      </SystemBackground>
    </>
  );
}

serverRendererFor(ListAnnotationStyles, {
  getKey: () => ['listAnnotationStyles', {}],
  getData: (key, vars, api) => {
    return api.listAnnotationStyles();
  },
});
