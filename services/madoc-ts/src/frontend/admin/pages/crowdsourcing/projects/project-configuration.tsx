import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { ProjectConfigurationNEW } from '../../../../../types/schemas/project-configuration';
import { migrateConfig } from '../../../../../utility/config-migrations';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import {
  EditorShorthandCaptureModelRef,
  EditShorthandCaptureModel,
} from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { useAdminLayout } from '../../../components/AdminMenu';
import {
  postProcessConfiguration,
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
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';
import { AccordionItem, AccordionContainer, useAccordionItems } from '../../../../shared/navigation/Accordion';
import { InterfaceIcon } from '../../../../shared/icons/InterfaceIcon';
import { SearchIcon } from '../../../../shared/icons/SearchIcon';
import { ContributionIcon } from '../../../../shared/icons/ContributionIcon';
import { ReviewIcon } from '../../../../shared/icons/ReviewIcon';
import { SettingsIcon } from '../../../../shared/icons/SettingsIcon';
import { FloatingToolbar } from '../../../../shared/atoms/FloatingToolbar';
import { HrefLink } from '../../../../shared/utility/href-link';

export const ProjectConfiguration: React.FC = () => {
  const { getItemProps, onKeyDown, openAll, closeAll } = useAccordionItems(5);
  const params = useParams() as { id: string };
  const { data: project } = apiHooks.getProject(() => (params.id ? [params.id] : undefined), {
    refetchOnWindowFocus: false,
  });
  const reviewRef = useRef<EditorShorthandCaptureModelRef>(null);
  const interfaceRef = useRef<EditorShorthandCaptureModelRef>(null);
  const searchRef = useRef<EditorShorthandCaptureModelRef>(null);
  const contributionsRef = useRef<EditorShorthandCaptureModelRef>(null);
  const otherRef = useRef<EditorShorthandCaptureModelRef>(null);

  const { scrollToTop } = useAdminLayout();
  const api = useApi();
  const { data: _projectConfiguration, refetch, updatedAt } = apiHooks.getSiteConfiguration(
    () => (params.id ? [{ project_id: params.id, show_source: true }] : undefined),
    {
      refetchOnWindowFocus: false,
      forceFetchOnMount: false,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnReconnect: false,
    }
  );

  const { _source, ...projectConfiguration } = useMemo(() => {
    if (!_projectConfiguration) {
      return {} as ProjectConfigurationNEW;
    }

    return migrateConfig.version1to2(_projectConfiguration);
  }, [_projectConfiguration]);

  const { t } = useTranslation();
  const [didSave, setDidSave] = useShortMessage();
  const projectTemplate = useProjectTemplate(project?.template);

  const save = async () => {
    if (!project) {
      return;
    }

    // Combine config from refs.
    const config = {
      ...(reviewRef.current?.getData() || {}),
      ...(interfaceRef.current?.getData() || {}),
      ...(searchRef.current?.getData() || {}),
      ...(contributionsRef.current?.getData() || {}),
      ...(otherRef.current?.getData() || {}),
    };

    const toSave = migrateConfig.version2to1(config);

    await api.saveSiteConfiguration(postProcessConfiguration(toSave), { project_id: project.id });
    await refetch();
    setDidSave();
    scrollToTop();
  };

  if (projectTemplate?.configuration?.frozen) {
    return <EmptyState>{t('There is no configuration for this project type')}</EmptyState>;
  }

  if (!project || !_projectConfiguration) {
    return null;
  }

  return (
    <div style={{ flex: 1, marginBottom: '2em' }}>
      {didSave ? <SuccessMessage $margin>{t('Changes saved')}</SuccessMessage> : null}

      <ButtonRow>
        <Button onClick={openAll}>Open all</Button>
        <Button onClick={closeAll}>Close all</Button>
        <Button as={HrefLink} href={`./v1`}>
          Old UI
        </Button>
      </ButtonRow>

      <AccordionContainer onKeyDown={onKeyDown}>
        <AccordionItem
          large
          overflow
          label="Interface"
          description="With description"
          icon={<InterfaceIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(0)}
        >
          <EditShorthandCaptureModel
            ref={interfaceRef}
            key={updatedAt}
            searchLabel={t('Search configuration')}
            immutableFields={projectTemplate?.configuration?.immutable}
            data={projectConfiguration}
            template={ProjectConfigInterface}
          />
        </AccordionItem>

        <AccordionItem
          large
          overflow
          label="Search & browse"
          description="With description"
          icon={<SearchIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(1)}
        >
          <EditShorthandCaptureModel
            key={updatedAt}
            ref={searchRef}
            immutableFields={projectTemplate?.configuration?.immutable}
            data={projectConfiguration}
            template={ProjectConfigSearch}
          />
        </AccordionItem>

        <AccordionItem
          large
          overflow
          label="Contributions"
          description="With description"
          icon={<ContributionIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(2)}
        >
          <EditShorthandCaptureModel
            key={updatedAt}
            ref={contributionsRef}
            immutableFields={projectTemplate?.configuration?.immutable}
            data={projectConfiguration}
            template={ProjectConfigContributions}
          />
        </AccordionItem>

        <AccordionItem
          large
          overflow
          label="Review process"
          description="With description"
          icon={<ReviewIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(3)}
        >
          <EditShorthandCaptureModel
            ref={reviewRef}
            key={updatedAt}
            immutableFields={projectTemplate?.configuration?.immutable}
            data={projectConfiguration}
            template={ProjectConfigReview}
          />
        </AccordionItem>

        <AccordionItem
          large
          overflow
          label="Other"
          description="With description"
          icon={<SettingsIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(4)}
        >
          <EditShorthandCaptureModel
            key={updatedAt}
            ref={otherRef}
            immutableFields={projectTemplate?.configuration?.immutable}
            data={projectConfiguration}
            template={ProjectConfigOther}
          />
        </AccordionItem>
      </AccordionContainer>

      <FloatingToolbar data-bottom>
        <h3 style={{ marginRight: 'auto' }}>Save configuration</h3>
        <Button $primary onClick={save}>
          Save changes
        </Button>
      </FloatingToolbar>
    </div>
  );
};

serverRendererFor(ProjectConfiguration, {
  hooks: [
    { name: 'getProject', creator: params => [params.id] },
    { name: 'getSiteConfiguration', creator: params => [{ project_id: params.id }] },
  ],
});
