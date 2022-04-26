import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackToChoicesButton } from '../../shared/capture-models/new/components/BackToChoicesButton';
import { DirectEditButton } from '../../shared/capture-models/new/components/DirectEditButton';
import { EditorRenderingConfig, EditorSlots } from '../../shared/capture-models/new/components/EditorSlots';
import {
  RevisionProviderFeatures,
  RevisionProviderWithFeatures,
} from '../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { SimpleSaveButton } from '../../shared/capture-models/new/components/SimpleSaveButton';
import { RevisionRequest } from '../../shared/capture-models/types/revision-request';
import { LocaleString } from '../../shared/components/LocaleString';
import { useApi } from '../../shared/hooks/use-api';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useCurrentUser } from '../../shared/hooks/use-current-user';
import { TickIcon } from '../../shared/icons/TickIcon';
import { EmptyState } from '../../shared/layout/EmptyState';
import { ButtonIcon } from '../../shared/navigation/Button';
import { Heading2 } from '../../shared/typography/Heading2';
import { isEditingAnotherUsersRevision } from '../../shared/utility/is-editing-another-users-revision';
import { useManifestModel } from '../hooks/use-manifest-model';
import { useManifestUserTasks } from '../hooks/use-manifest-user-tasks';
import { useModelPageConfiguration } from '../hooks/use-model-page-configuration';
import { useProject } from '../hooks/use-project';
import { useProjectStatus } from '../hooks/use-project-status';
import { RouteContext, useRouteContext } from '../hooks/use-route-context';
import { CanvasModelUserStatus } from './CanvasModelUserStatus';
import { CanvasViewerEditorStyleReset } from './CanvasViewerGrid';
import { useSiteConfiguration } from './SiteConfigurationContext';

export function ManifestCaptureModelEditor({ revision }: { revision: string; isSegmentation?: boolean }) {
  const { t } = useTranslation();
  const { projectId, manifestId } = useRouteContext();
  const { data: projectModel } = useManifestModel();
  const { data: project } = useProject();
  const modelId = projectModel?.model?.id;
  const { data: captureModel } = apiHooks.getCaptureModel(() => (modelId ? [modelId] : undefined));
  const { updateClaim, allTasksDone, markedAsUnusable } = useManifestUserTasks();
  const { isPreparing } = useProjectStatus();
  const user = useCurrentUser(true);
  const config = useSiteConfiguration();
  const {
    disableSaveForLater = false,
    disablePreview = false,
    disableNextCanvas = false,
  } = useModelPageConfiguration();
  const api = useApi();
  const [postSubmission, setPostSubmission] = useState(false);
  const [postSubmissionMessage, setPostSubmissionMessage] = useState(false);
  const allowMultiple = !config.project.modelPageOptions?.preventMultipleUserSubmissionsPerResource;
  const preventFurtherSubmission = !allowMultiple && allTasksDone;
  const isEditing = isEditingAnotherUsersRevision(captureModel, revision, user.user);
  const canContribute =
    user &&
    user.scope &&
    (user.scope.indexOf('site.admin') !== -1 ||
      user.scope.indexOf('models.admin') !== -1 ||
      user.scope.indexOf('models.contribute') !== -1);

  console.log({ preventFurtherSubmission });

  const isModelAdmin =
    user && user.scope && (user.scope.indexOf('site.admin') !== -1 || user.scope.indexOf('models.admin') !== -1);

  const features: RevisionProviderFeatures = isPreparing
    ? {
        autosave: false,
        autoSelectingRevision: true,
        revisionEditMode: false,
        directEdit: true,
      }
    : {
        preventMultiple: !allowMultiple,
      };

  const components: Partial<EditorRenderingConfig> = isPreparing
    ? {
        SubmitButton: DirectEditButton,
      }
    : isEditing
    ? {
        SubmitButton: SimpleSaveButton,
      }
    : {};

  async function onAfterSave(ctx: { revisionRequest: RevisionRequest; context: RouteContext }) {
    if (!isEditing && !isPreparing) {
      await updateClaim(ctx);
    }

    // If we have disabled preview, we need to show the post-submission.
    if (disablePreview && ctx.revisionRequest.revision.status !== 'draft') {
      if (disableNextCanvas) {
        setPostSubmissionMessage(true);
      } else {
        setPostSubmission(true);
      }
    }
  }

  if (api.getIsServer() || !manifestId || !projectId || (isPreparing && !isModelAdmin)) {
    return null;
  }

  return (
    <RevisionProviderWithFeatures
      features={features}
      key={revision}
      revision={revision}
      captureModel={captureModel}
      slotConfig={{
        editor: {
          allowEditing: !preventFurtherSubmission,
          deselectRevisionAfterSaving: true,
          saveOnNavigate: isPreparing,
          disableSaveForLater,
        },
        components: components,
      }}
    >
      <div>
        {project ? (
          <>
            <LocaleString as={Heading2} $margin={true}>
              {project.label}
            </LocaleString>
          </>
        ) : null}

        {postSubmissionMessage ? (
          <div>
            <EditorSlots.PostSubmission stacked messageOnly onContinue={() => setPostSubmissionMessage(false)} />
          </div>
        ) : null}
        <CanvasModelUserStatus isEditing={isEditing} />
        {preventFurtherSubmission ? (
          <>
            <EmptyState style={{ fontSize: '1.25em' }} $box>
              <ButtonIcon>
                <TickIcon />
              </ButtonIcon>
              <strong>{t('Task is complete!')}</strong>
            </EmptyState>
            <EmptyState>
              {markedAsUnusable
                ? t('You have marked this as unusable')
                : t(
                    'Thank you for your submission. You can view your contribution below. You can continue working on another manifest'
                  )}
            </EmptyState>
          </>
        ) : postSubmission ? (
          <div>
            <EditorSlots.PostSubmission stacked onContinue={() => setPostSubmission(false)} />
          </div>
        ) : canContribute && captureModel ? (
          <>
            <BackToChoicesButton />

            <CanvasViewerEditorStyleReset>
              <EditorSlots.TopLevelEditor />
            </CanvasViewerEditorStyleReset>

            <EditorSlots.SubmitButton afterSave={onAfterSave} />
          </>
        ) : (
          <EmptyState>{t('Loading your model')}</EmptyState>
        )}
      </div>
    </RevisionProviderWithFeatures>
  );
}
