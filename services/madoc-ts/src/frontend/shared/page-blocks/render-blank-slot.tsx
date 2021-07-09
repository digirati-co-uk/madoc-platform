import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { extractBlockDefinitions } from '../../../extensions/page-blocks/block-editor-react';
import { CreateSlotRequest, EditorialContext } from '../../../types/schemas/site-page';
import { useProject } from '../../site/hooks/use-project';
import {
  ContextualMenuList,
  ContextualMenuListItem,
  ContextualMenuWrapper,
  ContextualPositionWrapper,
} from '../atoms/ContextualMenu';
import { EmptySlotActions, EmptySlotContainer, EmptySlotLabel } from '../atoms/EmptySlot';
import { PageEditorButton } from '../atoms/PageEditor';
import {
  SlotEditorButton,
  SlotEditorLabelReadOnly,
  SlotEditorReadOnly,
  SlotOutlineContainer,
} from '../atoms/SlotEditor';
import { useApi } from '../hooks/use-api';
import { useSlots } from './slot-context';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';

function exactFromContext(context: EditorialContext, projectId?: number): CreateSlotRequest['filters'] {
  return {
    collection: context.collection
      ? {
          exact: context.collection,
        }
      : {
          none: true,
        },
    manifest: context.manifest
      ? {
          exact: context.manifest,
        }
      : {
          none: true,
        },
    canvas: context.canvas
      ? {
          exact: context.canvas,
        }
      : {
          none: true,
        },
    project: projectId
      ? {
          exact: projectId,
        }
      : {
          none: true,
        },
  };
}

function allOfTypeFromContext(ctx: EditorialContext, projectId?: number): CreateSlotRequest['filters'] {
  const exact = exactFromContext(ctx, projectId);

  if (ctx.canvas) {
    return {
      ...exact,
      canvas: { all: true },
    };
  }
  if (ctx.manifest) {
    return {
      ...exact,
      manifest: { all: true },
    };
  }
  if (ctx.collection) {
    return {
      ...exact,
      collection: { all: true },
    };
  }

  if (ctx.project) {
    return {
      ...exact,
      project: { all: true },
    };
  }

  return exact;
}

export const BlankSlotDropdown: React.FC<{
  actions: Array<{
    label: string;
    onClick: () => void;
  }>;
}> = ({ actions, children }) => {
  const { buttonProps, itemProps, isOpen } = useDropdownMenu(actions.length);

  return (
    <ContextualPositionWrapper>
      <SlotEditorButton {...buttonProps}>{children}</SlotEditorButton>
      <ContextualMenuWrapper $padding $isOpen={isOpen}>
        <ContextualMenuList>
          {actions.map((action, n) => (
            <ContextualMenuListItem key={n} {...itemProps[n]} onClick={action.onClick}>
              {action.label}
            </ContextualMenuListItem>
          ))}
        </ContextualMenuList>
      </ContextualMenuWrapper>
    </ContextualPositionWrapper>
  );
};

export const RenderBlankSlot: React.FC<{ name: string }> = ({ name: slotId, children }) => {
  const { context, editable, isPage, beforeCreateSlot, onCreateSlot } = useSlots();
  const api = useApi();
  const blockDefinitions = extractBlockDefinitions(children);
  const { data: project } = useProject();

  const [createSlot, { isLoading }] = useMutation(async (type: string) => {
    // Customise for this page only.
    // if id for type, set it to exact
    // otherwise set to none.

    // Customise for all pages of this type.
    // Advanced [ .. ]

    const slotRequest: CreateSlotRequest = isPage
      ? {
          slotId,
          layout: 'none',
        }
      : type === 'exact'
      ? {
          slotId,
          layout: 'none',
          filters: exactFromContext(context, project?.id),
        }
      : type === 'all'
      ? {
          slotId,
          layout: 'none',
          filters: allOfTypeFromContext(context, project?.id),
        }
      : {
          // Default?
          slotId,
          layout: 'none',
        };

    await beforeCreateSlot(slotRequest);

    slotRequest.blocks = blockDefinitions.map(definition => {
      return {
        name: definition.label,
        type: definition.type,
        static_data: definition.defaultData,
        lazy: false,
      };
    });

    const newSlot = await api.pageBlocks.createSlot(slotRequest);

    await onCreateSlot(newSlot);

    return newSlot;
  });

  if (isLoading) {
    return <div>Creating slot...</div>;
  }

  if (!editable) {
    return <>{children}</>;
  }

  if (!children) {
    return (
      <>
        <EmptySlotContainer>
          <EmptySlotLabel>Empty slot</EmptySlotLabel>
          <EmptySlotActions>
            {isPage ? (
              <PageEditorButton onClick={() => createSlot()}>Customise</PageEditorButton>
            ) : (
              <BlankSlotDropdown
                actions={[
                  { label: 'Only on this page', onClick: () => createSlot('exact') },
                  { label: 'On all of this type in this context', onClick: () => createSlot('all') },
                ]}
              >
                Customise
              </BlankSlotDropdown>
            )}
          </EmptySlotActions>
        </EmptySlotContainer>
      </>
    );
  }

  return (
    <div>
      <SlotEditorReadOnly>
        <SlotEditorLabelReadOnly>{slotId}</SlotEditorLabelReadOnly>
        {isPage ? (
          <>
            <SlotEditorButton onClick={() => createSlot()}>Customise</SlotEditorButton>
          </>
        ) : (
          <>
            <BlankSlotDropdown
              actions={[
                { label: 'Only on this page', onClick: () => createSlot('exact') },
                { label: 'On all of this type in this context', onClick: () => createSlot('all') },
              ]}
            >
              Customise
            </BlankSlotDropdown>
          </>
        )}
      </SlotEditorReadOnly>
      <SlotOutlineContainer>{children}</SlotOutlineContainer>
    </div>
  );
};
