import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useAdminLayout } from '../../../../shared/components/AdminMenu';
import {
  ProjectConfigContributions,
  ProjectConfigInterface,
  ProjectConfigOther,
  ProjectConfigReview,
  ProjectConfigSearch,
} from '../../../../shared/configuration/site-config';
import { useApi } from '../../../../shared/hooks/use-api';
import { apiHooks } from '../../../../shared/hooks/use-api-query';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { useShortMessage } from '../../../../shared/hooks/use-short-message';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { InfoMessage } from '../../../../shared/callouts/InfoMessage';
import { Heading2 } from '../../../../shared/typography/Heading2';
import { Accordion, AccordionItem, AccordionContainer } from '../../../../shared/navigation/Accordion';
import { BugIcon } from '../../../../shared/icons/BugIcon';

export const ProjectConfigurationNew: React.FC = () => {
  const params = useParams() as { id: string };
  const { data: project } = apiHooks.getProject(() => (params.id ? [params.id] : undefined));

  const { scrollToTop } = useAdminLayout();
  const api = useApi();
  const { data: _projectConfiguration, refetch, updatedAt } = apiHooks.getSiteConfiguration(() =>
    params.id ? [{ project_id: params.id, show_source: true }] : undefined
  );

  const { _source, ...projectConfiguration } = _projectConfiguration || {};

  const { t } = useTranslation();
  const [didSave, setDidSave] = useShortMessage();
  const projectTemplate = useProjectTemplate(project?.template);

  if (projectTemplate?.configuration?.frozen) {
    return <EmptyState>{t('There is no configuration for this project type')}</EmptyState>;
  }

  if (!project) {
    return null;
  }
  return (
    <div style={{ flex: 1, marginBottom: '2em' }}>
      <InfoMessage>🚧 New Configuration WIP 🚧</InfoMessage>

      <AccordionContainer>
        <AccordionItem
          large
          label="Search configuration"
          description="With description"
          icon={<BugIcon />}
          maxHeight={false}
        >
          <div style={{ height: '1800px' }}>
            <EditShorthandCaptureModel
              key={updatedAt}
              searchLabel={t('Search configuration')}
              immutableFields={projectTemplate?.configuration?.immutable}
              data={projectConfiguration}
              template={ProjectConfigInterface}
            />
          </div>
        </AccordionItem>

        <AccordionItem large label="Interface" description="With description" icon={<BugIcon />} maxHeight={false}>
          <div style={{ height: '1750px' }}>
            <EditShorthandCaptureModel
              key={updatedAt}
              immutableFields={projectTemplate?.configuration?.immutable}
              data={projectConfiguration}
              template={ProjectConfigInterface}
            />
          </div>
        </AccordionItem>

        <AccordionItem
          large
          label="Search & browse"
          description="With description"
          icon={<BugIcon />}
          maxHeight={false}
        >
          <div style={{ height: '350px' }}>
            <EditShorthandCaptureModel
              key={updatedAt}
              immutableFields={projectTemplate?.configuration?.immutable}
              data={projectConfiguration}
              template={ProjectConfigSearch}
            />
          </div>
        </AccordionItem>

        {/*<AccordionItem large label="Contributions" description="With description" icon={<BugIcon />} maxHeight={false}>*/}
        {/*    <EditShorthandCaptureModel*/}
        {/*    key={updatedAt}*/}
        {/*    immutableFields={projectTemplate?.configuration?.immutable}*/}
        {/*    data={projectConfiguration}*/}
        {/*    template={ProjectConfigContributions}*/}
        {/*  />*/}
        {/*</AccordionItem>*/}

        <AccordionItem large label="Review process" description="With description" icon={<BugIcon />} maxHeight={false}>
            <div style={{ height: '720px' }}>
          <EditShorthandCaptureModel
            key={updatedAt}
            immutableFields={projectTemplate?.configuration?.immutable}
            data={projectConfiguration}
            template={ProjectConfigReview}
          />
            </div>
        </AccordionItem>

        <AccordionItem large label="Other" description="With description" icon={<BugIcon />} maxHeight={false}>
            <div style={{ height: '650px' }}>
            <EditShorthandCaptureModel
            key={updatedAt}
            immutableFields={projectTemplate?.configuration?.immutable}
            data={projectConfiguration}
            template={ProjectConfigOther}
          />
            </div>
        </AccordionItem>
      </AccordionContainer>
    </div>
  );
};

serverRendererFor(ProjectConfigurationNew, {
  hooks: [
    { name: 'getProject', creator: params => [params.id] },
    { name: 'getSiteConfiguration', creator: params => [{ project_id: params.id }] },
  ],
});
