import React from 'react';
import {
  SystemBackground,
  SystemListingContainer,
  SystemListingDescription,
  SystemListingItem,
  SystemListingLabel,
  SystemListingMetadata,
  SystemListingThumbnail,
} from '../../../../shared/atoms/SystemUI';
import { useBase64 } from '../../../../shared/hooks/use-base64';
import { useProjectTemplates } from '../../../../shared/hooks/use-project-templates';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { HrefLink } from '../../../../shared/utility/href-link';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { useTranslation } from 'react-i18next';

export const NewProjectPage: React.FC = () => {
  const { t } = useTranslation();

  const availableTemplates = useProjectTemplates();
  const { encode } = useBase64();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Projects'), link: '/projects' },
          { label: t('Create project'), link: '/projects/create', active: true },
        ]}
        title={t('Create new project')}
        noMargin
      />
      <SystemBackground>
        <SystemListingContainer>
          {availableTemplates.map(template => {
            return (
              <SystemListingItem key={template.type}>
                <SystemListingThumbnail>
                  {template.metadata.thumbnail ? (
                    <img src={`data:image/svg+xml;base64,${encode(template.metadata.thumbnail)}`} />
                  ) : null}
                </SystemListingThumbnail>
                <SystemListingMetadata>
                  <SystemListingLabel>{template.metadata.label}</SystemListingLabel>
                  <SystemListingDescription>{template.metadata.description}</SystemListingDescription>
                  <ButtonRow>
                    <Button $primary as={HrefLink} href={`/projects/create/${template.type}`}>
                      {template.metadata.actionLabel || 'Create project'}
                    </Button>
                    {template.metadata.documentation ? (
                      <Button $link as={'a'} href={template.metadata.documentation}>
                        {t('View documentation')}
                      </Button>
                    ) : null}
                  </ButtonRow>
                </SystemListingMetadata>
              </SystemListingItem>
            );
          })}
        </SystemListingContainer>
      </SystemBackground>
    </>
  );
};
