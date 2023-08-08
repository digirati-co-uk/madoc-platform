import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BackToChoicesButton } from '../../../shared/capture-models/new/components/BackToChoicesButton';
import { DirectEditButton } from '../../../shared/capture-models/new/components/DirectEditButton';
import { EditorRenderingConfig, EditorSlots } from '../../../shared/capture-models/new/components/EditorSlots';
import {
  RevisionProviderFeatures,
  RevisionProviderWithFeatures,
} from '../../../shared/capture-models/new/components/RevisionProviderWithFeatures';
import { SimpleSaveButton } from '../../../shared/capture-models/new/components/SimpleSaveButton';
import { RevisionRequest } from '../../../shared/capture-models/types/revision-request';
import { LocaleString } from '../../../shared/components/LocaleString';
import { useApi } from '../../../shared/hooks/use-api';
import { EmptyState } from '../../../shared/layout/EmptyState';
import { Heading2 } from '../../../shared/typography/Heading2';
import { isEditingAnotherUsersRevision } from '../../../shared/utility/is-editing-another-users-revision';
import { useManifestModel } from '../../hooks/use-manifest-model';
import { useManifestUserTasks } from '../../hooks/use-manifest-user-tasks';
import { useModelPageConfiguration } from '../../hooks/use-model-page-configuration';
import { useProject } from '../../hooks/use-project';
import { useProjectStatus } from '../../hooks/use-project-status';
import { RouteContext, useRouteContext } from '../../hooks/use-route-context';
import { CanvasModelUserStatus } from '../canvas/CanvasModelUserStatus';
import { CanvasViewerEditorStyleReset } from '../../../shared/atoms/CanvasViewerGrid';
import { useSiteConfiguration } from '../SiteConfigurationContext';
import { useLoadedCaptureModel } from '../../../shared/hooks/use-loaded-capture-model';

export function ManifestCaptureModelEditor({ revision }: { revision: string; isSegmentation?: boolean }) {
  const { t } = useTranslation();
  const { projectId, manifestId } = useRouteContext();
  const { data: projectModel } = useManifestModel();
  const { data: project } = useProject();
  const [{ captureModel }, , modelRefetch] = useLoadedCaptureModel(projectModel?.model?.id, undefined, undefined);
  const { updateClaim, preventFurtherSubmission, canContribute, markedAsUnusable, user } = useManifestUserTasks();
  const { isPreparing } = useProjectStatus();
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
  const isEditing = isEditingAnotherUsersRevision(captureModel, revision, user);
  const autoSave = config.project.modelPageOptions?.enableAutoSave;

  const features: RevisionProviderFeatures = isPreparing
    ? {
        autosave: autoSave,
        autoSelectingRevision: true,
        revisionEditMode: false,
        directEdit: true,
      }
    : {
        preventMultiple: !allowMultiple,
        forkMode: !!config.project.forkMode,
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
    await modelRefetch();

    // If we have disabled preview, we need to show the post-submission.
    if (disablePreview && ctx.revisionRequest.revision.status !== 'draft') {
      if (disableNextCanvas) {
        setPostSubmissionMessage(true);
      } else {
        setPostSubmission(true);
      }
    }
  }

  if (api.getIsServer() || !manifestId || !projectId || (isPreparing && !canContribute)) {
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
              <strong>{t('Task is complete!')}</strong>
              <span style={{ color: 'black', margin: 0 }}>
                {markedAsUnusable
                  ? t('You have marked this as unusable')
                  : t(
                      'Thank you for your submission. You can view your contribution below. You can continue working on another manifest'
                    )}
              </span>
            </EmptyState>
            <CanvasViewerEditorStyleReset>
              <EditorSlots.TopLevelEditor />
            </CanvasViewerEditorStyleReset>
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
