import React from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useMutation } from 'react-query';
import { BaseTask } from '../../../../gateway/tasks/base-task';
import {
  ContextualLabel,
  ContextualMenuList,
  ContextualMenuListItem,
  ContextualMenuWrapper,
  ContextualPositionWrapper,
} from '../../../shared/navigation/ContextualMenu';
import { useApi } from '../../../shared/hooks/use-api';
import { SettingsIcon } from '../../../shared/icons/SettingsIcon';
import { AssignTask } from './AssignTask';
import { ModalButton } from '../../../shared/components/Modal';

export const TaskContextualMenu: React.FC<{ task: BaseTask; refetch?: () => Promise<void> }> = ({ task, refetch }) => {
  const { isOpen, buttonProps, itemProps } = useDropdownMenu(9);
  const api = useApi();

  const [unassignUser, unassignUserStatus] = useMutation(async () => {
    if (task.id) {
      await api.unassignTask(task.id);
      if (refetch) {
        await refetch();
      }
    }
  });

  const canAssign = task.type !== 'crowdsourcing-task';

  // For now, to be improved.
  if (!canAssign) {
    return null;
  }

  return (
    <ContextualPositionWrapper>
      <ContextualLabel {...buttonProps}>
        <SettingsIcon style={{ fontSize: '0.9em' }} /> settings
      </ContextualLabel>
      <ContextualMenuWrapper $padding $isOpen={isOpen}>
        <ContextualMenuList>
          <ModalButton
            $disabled={!canAssign}
            as={ContextualMenuListItem}
            {...itemProps[0]}
            title="Assign task to user"
            render={({ close }) => (
              <AssignTask
                task={task}
                afterAssign={async () => {
                  if (refetch) {
                    await refetch();
                  }
                  close();
                }}
              />
            )}
          >
            Assign to user
          </ModalButton>
          <ContextualMenuListItem
            {...itemProps[1]}
            $disabled={unassignUserStatus.isLoading}
            onClick={() => unassignUser()}
          >
            Unassign task
          </ContextualMenuListItem>
        </ContextualMenuList>
      </ContextualMenuWrapper>
    </ContextualPositionWrapper>
  );
};
