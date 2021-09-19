import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '@capture-models/editor';
import { Link } from 'react-router-dom';
import { Button } from '../../../shared/navigation/Button';
import { EditorSlots } from '../../../shared/caputre-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../shared/caputre-models/new/components/RevisionProviderWithFeatures';
import { SimpleSaveButton } from '../../../shared/caputre-models/new/components/SimpleSaveButton';
import { LocaleString } from '../../../shared/components/LocaleString';
import { Heading3 } from '../../../shared/typography/Heading3';
import '@capture-models/editor/lib/input-types/TextField';
import '@capture-models/editor/lib/input-types/HTMLField';
import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { HrefLink } from '../../../shared/utility/href-link';
import { useCrowdsourcingTaskDetails } from '../../hooks/use-crowdsourcing-task-details';
import { TaskContext } from '../loaders/task-loader';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { CrowdsourcingTaskManifest } from './crowdsourcing-task-manifest';

const ViewCrowdSourcingTask: React.FC<TaskContext<CrowdsourcingTask>> = ({ task, parentTask }) => {
  const { t } = useTranslation();
  const {
    isCanvas,
    project,
    backLink,
    editLink,
    subject,
    mayExpire,
    isComplete,
    isSubmitted,
    modelId,
    captureModel,
    revisionId,
    wasRejected,
    changesRequested,
  } = useCrowdsourcingTaskDetails(task, parentTask);

  if (!isCanvas) {
    return (
      <CrowdsourcingTaskManifest
        task={parentTask ? parentTask : task}
        subtask={parentTask ? task : undefined}
        projectId={project?.slug}
      />
    );
  }

  return (
    <ThemeProvider theme={defaultTheme}>
      <div>
        {backLink ? (
          <div>
            <Link to={backLink}>{t('Back to resource')}</Link>
          </div>
        ) : null}
        {subject ? <LocaleString as="h1">{subject.label}</LocaleString> : null}
        {changesRequested ? (
          <div style={{ background: 'lightblue', padding: '1em', marginBottom: '1em' }}>
            <Heading3>{t('The following changes were requested')}</Heading3>
            <p>{changesRequested}</p>
          </div>
        ) : null}
        {mayExpire ? <WarningMessage>{t('Your contribution may expire soon')}</WarningMessage> : null}
        {isComplete ? (
          <WarningMessage>
            {t('This task is complete. You can make another contribution from the')}{' '}
            {backLink ? <Link to={backLink}>{t('Image page')}</Link> : t('Image page')}
          </WarningMessage>
        ) : null}
        {wasRejected ? (
          <ErrorMessage>
            {t('This contribution was rejected. You can make another contribution from the')}{' '}
            {backLink ? <Link to={backLink}>{t('Image page')}</Link> : t('Image page')}
          </ErrorMessage>
        ) : null}
        {isSubmitted ? <WarningMessage>{t('Your submission is in review')}</WarningMessage> : null}

        {captureModel && modelId ? (
          <RevisionProviderWithFeatures
            revision={revisionId}
            captureModel={captureModel}
            slotConfig={{
              editor: { allowEditing: false },
              components: { SubmitButton: SimpleSaveButton },
            }}
          >
            <EditorSlots.PreviewSubmission />
          </RevisionProviderWithFeatures>
        ) : null}

        {!isSubmitted && !isComplete && editLink ? (
          <div>
            <Button $primary as={HrefLink} href={editLink}>
              {t('Edit submission')}
            </Button>
          </div>
        ) : null}
      </div>
    </ThemeProvider>
  );
};

export default ViewCrowdSourcingTask;
