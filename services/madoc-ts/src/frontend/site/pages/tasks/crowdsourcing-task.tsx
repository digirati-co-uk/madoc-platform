import React from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from 'styled-components';
import { Link } from 'react-router-dom';
import { defaultTheme } from '../../../shared/capture-models/editor/themes';
import { Button } from '../../../shared/navigation/Button';
import { EditorSlots } from '../../../shared/capture-models/new/components/EditorSlots';
import { RevisionProviderWithFeatures } from '../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { SimpleSaveButton } from '../../../shared/capture-models/new/components/SimpleSaveButton';
import '../../../shared/capture-models/editor/input-types/TextField';
import '../../../shared/capture-models/editor/input-types/HTMLField';

import { CrowdsourcingTask } from '../../../../gateway/tasks/crowdsourcing-task';
import { HrefLink } from '../../../shared/utility/href-link';
import { useCrowdsourcingTaskDetails } from '../../hooks/use-crowdsourcing-task-details';
import { TaskContext } from '../loaders/task-loader';
import { WarningMessage } from '../../../shared/callouts/WarningMessage';
import { SuccessMessage } from '../../../shared/callouts/SuccessMessage';
import { ErrorMessage } from '../../../shared/callouts/ErrorMessage';
import { CrowdsourcingTaskManifest } from './crowdsourcing-task-manifest';

const ViewCrowdSourcingTask: React.FC<TaskContext<CrowdsourcingTask>> = ({ task, parentTask }) => {
  const { t } = useTranslation();
  const {
    isCanvas,
    project,
    backLink,
    editLink,
    mayExpire,
    isComplete,
    isSubmitted,
    modelId,
    captureModel,
    revisionId,
    wasRejected,
    changesRequested,
    rejectedMessage,
  } = useCrowdsourcingTaskDetails(task, parentTask);
  const showCaptureModelOnManifest = project?.config.shadow?.showCaptureModelOnManifest;

  if (!isCanvas && !showCaptureModelOnManifest) {
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
        {changesRequested ? (
          <WarningMessage $banner>
            <strong>{t('The following changes were requested')}</strong>
            <p>{changesRequested}</p>
          </WarningMessage>
        ) : null}
        {mayExpire ? <WarningMessage $banner>{t('Your contribution may expire soon')}</WarningMessage> : null}
        {isComplete ? (
          <SuccessMessage $banner>
            {t('This task is complete. You can make another contribution from the')}{' '}
            {backLink ? <Link to={backLink}>{t('Image page')}</Link> : t('Image page')}
          </SuccessMessage>
        ) : null}
        {wasRejected ? (
          <ErrorMessage $banner>
            {t('This contribution was rejected. You can make another contribution from the')}{' '}
            {backLink ? <Link to={backLink}>{t('Image page')}</Link> : t('Image page')}
            {rejectedMessage ? (
              <>
                <div style={{ marginTop: '.5em' }}>
                  <strong>{t('Message from reviewer')}</strong>
                </div>
                <p style={{ marginTop: '0.4em' }}>{rejectedMessage}</p>
              </>
            ) : null}
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

        {!isSubmitted && !isComplete && editLink && !wasRejected ? (
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
