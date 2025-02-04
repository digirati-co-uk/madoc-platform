import React, { useEffect, useState } from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import { ModalButton } from '../../../shared/components/Modal';
import { LockIcon } from '../../../shared/icons/LockIcon';
import { Button, ButtonIcon, ButtonRow } from '../../../shared/navigation/Button';
import { GridContainer, HalfGird } from '../../../shared/layout/Grid';
import { Input, InputContainer, InputLabel } from '../../../shared/form/Input';
import { WhiteTickIcon } from '../../../shared/icons/TickIcon';
import { ItemFilterContainer, ItemFilterPopupContainer } from '../../../shared/components/ItemFilter';
import { useApi } from '../../../shared/hooks/use-api';
import { useUserPermissions } from '../../../shared/hooks/use-site';
import { createLink } from '../../../shared/utility/create-link';
import { HrefLink } from '../../../shared/utility/href-link';
import { useCanvasModel } from '../../hooks/use-canvas-model';
import { usePrepareContribution } from '../../hooks/use-prepare-contribution';
import { useProjectCanvasTasks } from '../../hooks/use-project-canvas-tasks';
import { useRouteContext } from '../../hooks/use-route-context';

export const CanvasTaskProgress: React.FC = () => {
  const { t } = useTranslation();
  const { buttonProps, isOpen } = useDropdownMenu(1, {
    disableFocusFirstItemOnClick: true,
  });
  const { canvasId } = useRouteContext();
  const api = useApi();
  const { canProgress, isAdmin } = useUserPermissions();
  const [prepare] = usePrepareContribution();

  const { slug } = useParams<{ slug?: string }>();
  const { data: projectTasks, refetch } = useProjectCanvasTasks();
  const { data: canvasModel, refetch: refetchModel } = useCanvasModel();

  const canvasTask = projectTasks?.canvasTask;
  const userTasks = projectTasks?.userTasks;
  const isManifestComplete = projectTasks?.isManifestComplete;
  const canBeMarkedAsComplete = !canvasTask || canvasTask.status <= 1;
  const totalContributors = projectTasks?.totalContributors;

  const [requiredApprovals, setRequiredApprovals] = useState(0);

  useEffect(() => {
    if (canvasTask) {
      setRequiredApprovals(canvasTask.state.approvalsRequired || 0);
    }
  }, [canvasTask]);

  const [markAsComplete, markAsCompleteStatus] = useMutation(async () => {
    if (canvasTask) {
      await api.updateRevisionTask(canvasTask.id, {
        status: 3,
        status_text: 'completed',
      });
      await refetch();
    }
  });
  const [markAsCompleteNoTask, markAsCompleteNoTaskStatus] = useMutation(async () => {
    await prepare();
    await refetch();
    await markAsComplete();
  });

  const [markAsIncomplete, markAsIncompleteStatus] = useMutation(async () => {
    if (canvasTask) {
      await api.updateRevisionTask(canvasTask.id, {
        status: 2,
        status_text: 'in progress',
      });
      // mark parent as incomplete
      await api.updateRevisionTask(canvasTask.parent_task, {
        status: 2,
        status_text: 'in progress',
      });
      await refetch();
    }
  });

  const [updateRequiredApprovals, updateRequiredApprovalsStatus] = useMutation(async () => {
    if (canvasTask) {
      await api.updateRevisionTask(canvasTask.id, {
        state: {
          approvalsRequired: requiredApprovals,
        },
      });
      await refetch();
    }
  });

  const [deleteCaptureModel, deleteCaptureModelStatus] = useMutation(async () => {
    if (canvasModel && canvasModel.model && canvasModel.model.id && userTasks) {
      await Promise.all(
        userTasks.map(
          userTask =>
            userTask &&
            userTask.id &&
            api.deleteTask(userTask.id).catch(err => {
              console.log(err);
            })
        )
      );

      await api.deleteCaptureModel(canvasModel.model.id);
      await refetchModel();
    }
  });

  if (!slug || (!isAdmin && !canProgress)) {
    return null;
  }

  return (
    <ItemFilterContainer>
      <Button {...buttonProps}>
        <ButtonIcon>
          <LockIcon />
        </ButtonIcon>
        {t('Administer')}
      </Button>
      <ItemFilterPopupContainer $visible={isOpen} role="menu">
        <div style={{ width: 400, padding: '1em' }}>
          {canvasTask?.status === 2 ? (
            <div>
              {t('Current status')}: <strong>{canvasTask.status_text}</strong>
              <ButtonRow>
                <Button onClick={() => markAsComplete()} disabled={markAsCompleteStatus.isLoading}>
                  <ButtonIcon>
                    <WhiteTickIcon />
                  </ButtonIcon>
                  {t('Mark as complete 1')}
                </Button>
              </ButtonRow>
              {isAdmin && canvasTask?.state.approvalsRequired && (
                <div>
                  <InputContainer>
                    <InputLabel htmlFor="approvals">
                      {t('Approvals required')} ({canvasTask.state.approvalsRequired})
                    </InputLabel>
                    <GridContainer>
                      <HalfGird $margin>
                        <Input
                          type="number"
                          id="approvals"
                          value={requiredApprovals}
                          onChange={e => {
                            const newValue = Number(e.target.value);
                            if (!Number.isNaN(newValue)) {
                              setRequiredApprovals(newValue);
                            }
                          }}
                        />
                      </HalfGird>
                      <HalfGird $margin>
                        <Button
                          $primary
                          disabled={
                            canvasTask.state.approvalsRequired === requiredApprovals ||
                            updateRequiredApprovalsStatus.isLoading
                          }
                          onClick={() => updateRequiredApprovals()}
                        >
                          {updateRequiredApprovalsStatus.isLoading ? t('Loading') : t('Update required approvals')}
                        </Button>
                      </HalfGird>
                    </GridContainer>
                  </InputContainer>
                </div>
              )}
            </div>
          ) : null}
          {isManifestComplete ? <div>{t('Manifest has been marked as complete')}</div> : null}
          {canvasTask?.status === 3 ? (
            <div>
              {t('Current status')}: <strong>{canvasTask.status_text}</strong>
              <ButtonRow>
                <Button onClick={() => markAsIncomplete()} disabled={markAsIncompleteStatus.isLoading}>
                  {t('Mark as incomplete')}
                </Button>
              </ButtonRow>
            </div>
          ) : null}
          {canBeMarkedAsComplete ? (
            <div>
              {t('Current status')}: <strong>{canvasTask ? canvasTask.status_text : 'Not started'}</strong>
              {canvasTask ? (
                <ButtonRow>
                  <Button onClick={() => markAsComplete()} disabled={markAsCompleteStatus.isLoading}>
                    <ButtonIcon>
                      <WhiteTickIcon />
                    </ButtonIcon>
                    {t('Mark as complete')}
                  </Button>
                </ButtonRow>
              ) : (
                <ButtonRow>
                  <Button onClick={() => markAsCompleteNoTask()} disabled={markAsCompleteNoTaskStatus.isLoading}>
                    <ButtonIcon>
                      <WhiteTickIcon />
                    </ButtonIcon>
                    {t('Mark as complete')}
                  </Button>
                </ButtonRow>
              )}
            </div>
          ) : null}
          {totalContributors ? (
            <div>
              {t('Total contributors')}: <strong>{totalContributors}</strong>
              <ButtonRow>
                <Button
                  as={HrefLink}
                  href={createLink({
                    projectId: slug,
                    subRoute: 'tasks',
                    query: { subject: `urn:madoc:canvas:${canvasId}` },
                  })}
                >
                  {t('See contributions')}
                </Button>
              </ButtonRow>
            </div>
          ) : null}
          {isAdmin && canvasModel && canvasModel.model && canvasModel.model.id ? (
            <ModalButton
              title="Are you sure you want to delete this model?"
              render={() => {
                return <div>{t('All of the contributions to this canvas will be deleted')}</div>;
              }}
              renderFooter={({ close }) => {
                return (
                  <ButtonRow style={{ margin: '0 0 0 auto' }}>
                    <Button
                      $error
                      onClick={() => deleteCaptureModel().then(close)}
                      disabled={deleteCaptureModelStatus.isLoading}
                    >
                      {t('Delete all contributions')}
                    </Button>
                  </ButtonRow>
                );
              }}
            >
              <ButtonRow>
                <Button $error>{t('Delete all contributions')}</Button>
              </ButtonRow>
            </ModalButton>
          ) : null}
        </div>
      </ItemFilterPopupContainer>
    </ItemFilterContainer>
  );
};
