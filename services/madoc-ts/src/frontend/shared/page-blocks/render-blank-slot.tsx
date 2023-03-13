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
} from '../navigation/ContextualMenu';
import { EmptySlotActions, EmptySlotContainer, EmptySlotLabel } from '../layout/EmptySlot';
import { PageEditorButton } from './PageEditor';
import {
  SlotEditorButton,
  SlotEditorLabelReadOnly,
  SlotEditorReadOnly,
  SlotOutlineContainer,
} from '../layout/SlotEditor';
import { SlotLayout } from '../layout/SlotLayout';
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
    topicType: context.topicType
      ? {
          exact: context.topicType,
        }
      : {
          none: true,
        },
    topic: context.topic
      ? {
          exact: context.topic,
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

  if (ctx.topic) {
    return {
      ...exact,
      topic: { all: true },
    };
  }

  if (ctx.topicType) {
    return {
      ...exact,
      topicType: { all: true },
    };
  }

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
  layout?: string;
}> = ({ actions, layout, children }) => {
  const { buttonProps, itemProps, isOpen } = useDropdownMenu(actions.length, {
    disableFocusFirstItemOnClick: actions.length === 0,
  });

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

function createSlotRequest(
  slotId: string,
  context: EditorialContext,
  {
    type,
    isPage,
    source,
    projectId,
  }: {
    type: string;
    isPage?: boolean;
    source?: { type: string; id: string };
    projectId?: number;
  }
): CreateSlotRequest {
  if (isPage) {
    return {
      slotId,
      layout: 'none',
    };
  }

  if (source?.type === 'global') {
    // We want them on all pages.
    return {
      slotId,
      layout: 'none',
      filters: {
        canvas: { all: true, none: true },
        manifest: { all: true, none: true },
        collection: { all: true, none: true },
        project: { all: true, none: true },
        topic: { all: true, none: true },
        topicType: { all: true, none: true },
      },
    };
  }
  switch (type) {
    case 'exact':
      return {
        slotId,
        layout: 'none',
        filters: exactFromContext(context, projectId),
      };
    case 'all':
      return {
        slotId,
        layout: 'none',
        filters: allOfTypeFromContext(context, projectId),
      };
  }

  return {
    // Default?
    slotId,
    layout: 'none',
  };
}

export const RenderBlankSlot: React.FC<{
  id?: string;
  name: string;
  source?: { type: string; id: string };
  layout?: string;
}> = ({ id, name: slotId, source, layout, children }) => {
  const { context, editable, isPage, beforeCreateSlot, onCreateSlot } = useSlots();
  const api = useApi();
  const blockDefinitions = extractBlockDefinitions(children, { recurse: false });
  const { data: project } = useProject();

  const [createSlot, { isLoading }] = useMutation(async (type: string) => {
    // Customise for this page only.
    // if id for type, set it to exact
    // otherwise set to none.

    // Customise for all pages of this type.
    // Advanced [ .. ]
    const slotRequest = createSlotRequest(slotId, context, {
      type,
      isPage,
      source,
      projectId: project?.id,
    });

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
    console.log('1', newSlot)

    await onCreateSlot(newSlot);

    return newSlot;
  });

  if (isLoading) {
    return (
      <SlotLayout id={id} layout={layout}>
        <div>Creating slot...</div>
      </SlotLayout>
    );
  }

  if (!editable) {
    return (
      <SlotLayout id={id} layout={layout}>
        {children}
      </SlotLayout>
    );
  }

  if (!children) {
    return (
      <>
        <EmptySlotContainer id={id}>
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
    <div id={id}>
      <SlotEditorReadOnly>
        <SlotEditorLabelReadOnly>{slotId}</SlotEditorLabelReadOnly>
        {isPage || source?.type === 'global' ? (
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
      <SlotOutlineContainer>
        <SlotLayout layout={layout}>{children}</SlotLayout>
      </SlotOutlineContainer>
    </div>
  );
};
