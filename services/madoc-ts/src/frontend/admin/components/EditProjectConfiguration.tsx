import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectConfigurationNEW } from '../../../types/schemas/project-configuration';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import {
  EditorShorthandCaptureModelRef,
  EditShorthandCaptureModel,
} from '../../shared/capture-models/EditorShorthandCaptureModel';
import { useAdminLayout } from '../components/AdminMenu';
import {
  ProjectConfigContributions,
  ProjectConfigInterface,
  ProjectConfigOther,
  ProjectConfigReview,
  ProjectConfigSearch,
} from '../../shared/configuration/site-config';
import { useShortMessage } from '../../shared/hooks/use-short-message';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { AccordionItem, AccordionContainer, useAccordionItems } from '../../shared/navigation/Accordion';
import { InterfaceIcon } from '../../shared/icons/InterfaceIcon';
import { SearchIcon } from '../../shared/icons/SearchIcon';
import { ContributionIcon } from '../../shared/icons/ContributionIcon';
import { ReviewIcon } from '../../shared/icons/ReviewIcon';
import { SettingsIcon } from '../../shared/icons/SettingsIcon';
import { FloatingToolbar } from '../../shared/atoms/FloatingToolbar';
import { HrefLink } from '../../shared/utility/href-link';

interface EditProjectConfigurationProps {
  updateKey: any;
  configuration: ProjectConfigurationNEW;
  immutableFields?: string[];
  old?: boolean;
  onSave: (config: ProjectConfigurationNEW) => Promise<void>;
}

export function EditProjectConfiguration(props: EditProjectConfigurationProps) {
  const { getItemProps, onKeyDown, openAll, closeAll } = useAccordionItems(5);
  const reviewRef = useRef<EditorShorthandCaptureModelRef>(null);
  const interfaceRef = useRef<EditorShorthandCaptureModelRef>(null);
  const searchRef = useRef<EditorShorthandCaptureModelRef>(null);
  const contributionsRef = useRef<EditorShorthandCaptureModelRef>(null);
  const otherRef = useRef<EditorShorthandCaptureModelRef>(null);

  const { scrollToTop } = useAdminLayout();
  const projectConfiguration = props.configuration;
  const { t } = useTranslation();
  const [didSave, setDidSave] = useShortMessage();

  const save = async () => {
    // Combine config from refs.
    const config = {
      ...(reviewRef.current?.getData() || {}),
      ...(interfaceRef.current?.getData() || {}),
      ...(searchRef.current?.getData() || {}),
      ...(contributionsRef.current?.getData() || {}),
      ...(otherRef.current?.getData() || {}),
    };

    await props.onSave(config);
    setDidSave();
    scrollToTop();
  };

  return (
    <div style={{ flex: 1, marginBottom: '2em' }}>
      {didSave ? <SuccessMessage $margin>{t('Changes saved')}</SuccessMessage> : null}

      <ButtonRow>
        <Button onClick={openAll}>Open all</Button>
        <Button onClick={closeAll}>Close all</Button>
        {props.old === false ? null : (
          <Button as={HrefLink} href={`./v1`}>
            Old UI
          </Button>
        )}
      </ButtonRow>

      <AccordionContainer onKeyDown={onKeyDown}>
        <AccordionItem
          large
          overflow
          label="Interface"
          description="Customise project pages, manifest pages and canvas pages"
          icon={<InterfaceIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(0)}
        >
          <EditShorthandCaptureModel
            key={props.updateKey}
            ref={interfaceRef}
            searchLabel={t('Search configuration')}
            immutableFields={props.immutableFields}
            data={projectConfiguration}
            template={ProjectConfigInterface}
          />
        </AccordionItem>

        <AccordionItem
          large
          overflow
          label="Search & browse"
          description="Customise navigation and search options"
          icon={<SearchIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(1)}
        >
          <EditShorthandCaptureModel
            key={props.updateKey}
            ref={searchRef}
            immutableFields={props.immutableFields}
            data={projectConfiguration}
            template={ProjectConfigSearch}
          />
        </AccordionItem>

        <AccordionItem
          large
          overflow
          label="Contributions"
          description="Customise the contribution process, contribution interface and submission process"
          icon={<ContributionIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(2)}
        >
          <EditShorthandCaptureModel
            key={props.updateKey}
            ref={contributionsRef}
            immutableFields={props.immutableFields}
            data={projectConfiguration}
            template={ProjectConfigContributions}
          />
        </AccordionItem>

        <AccordionItem
          large
          overflow
          label="Review process"
          description="Customise the review process and reviewers"
          icon={<ReviewIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(3)}
        >
          <EditShorthandCaptureModel
            key={props.updateKey}
            ref={reviewRef}
            immutableFields={props.immutableFields}
            data={projectConfiguration}
            template={ProjectConfigReview}
          />
        </AccordionItem>

        <AccordionItem
          large
          overflow
          label="Other"
          description="Miscellaneous settings"
          icon={<SettingsIcon aria-hidden="true" />}
          maxHeight={false}
          {...getItemProps(4)}
        >
          <EditShorthandCaptureModel
            key={props.updateKey}
            ref={otherRef}
            immutableFields={props.immutableFields}
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
}
