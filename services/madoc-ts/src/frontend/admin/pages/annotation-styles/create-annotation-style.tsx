import React from 'react';
import { useTranslation } from 'react-i18next';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { SystemBackground, SystemGrid, SystemMenu, SystemMenuItem } from '../../../shared/atoms/SystemUI';
import { AnnotationStyleForm } from '../../../shared/components/AnnotationStyleForm';
import { ButtonRow } from '../../../shared/navigation/Button';
import { AdminHeader } from '../../molecules/AdminHeader';

export function CreateAnnotationStyle() {
  const { t } = useTranslation();
  return (
    <>
      <AdminHeader
        title={t('Create new annotation style')}
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Annotation styles'), link: '/site/annotation-styles' },
        ]}
        noMargin
      />

      <SystemBackground>
        <SystemGrid.Container>
          <SystemGrid.Menu>
            <SystemMenu>
              <SystemMenuItem>Annotations panel</SystemMenuItem>
              <SystemMenuItem>Document panel</SystemMenuItem>
              <SystemMenuItem>Submission panel</SystemMenuItem>
              <SystemMenuItem>
                Current submission
                <SystemMenu>
                  <SystemMenuItem>Top level</SystemMenuItem>
                  <SystemMenuItem>Current level</SystemMenuItem>
                  <SystemMenuItem $active>Adjacent</SystemMenuItem>
                  <SystemMenuItem>Hidden</SystemMenuItem>
                </SystemMenu>
              </SystemMenuItem>
            </SystemMenu>
          </SystemGrid.Menu>
          <SystemGrid.Content>
            <SystemListItem>
              <div style={{ maxWidth: 500, flex: 1 }}>
                <ButtonRow $noMargin>This is where the form for creating new styles goes.</ButtonRow>

                <AnnotationStyleForm
                  value={{}}
                  onUpdate={newValues => {
                    console.log(newValues);
                  }}
                />
              </div>
            </SystemListItem>
          </SystemGrid.Content>
        </SystemGrid.Container>
      </SystemBackground>
    </>
  );
}
