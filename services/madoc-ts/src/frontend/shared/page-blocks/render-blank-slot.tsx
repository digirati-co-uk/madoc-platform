import React from 'react';
import { useMutation } from 'react-query';
import { extractBlockDefinitions } from '../../../extensions/page-blocks/block-editor-react';
import { CreateSlotRequest, EditorialContext } from '../../../types/schemas/site-page';
import { useProject } from '../../site/hooks/use-project';
import { Button, ButtonRow } from '../atoms/Button';
import { EmptySlotContainer } from '../atoms/EmptySlot';
import { EmptyState } from '../atoms/EmptyState';
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
      <div>
        <EmptyState $box>Empty slot</EmptyState>
        {isPage ? (
          <ButtonRow>
            <Button onClick={() => createSlot()}>Customise</Button>
          </ButtonRow>
        ) : (
          <ButtonRow>
            <Button onClick={() => createSlot('exact')}>Customise only on this page</Button>
            <Button onClick={() => createSlot('all')}>Customise on all of this type in this context</Button>
          </ButtonRow>
        )}
      </div>
    );
  }

  return (
    <EmptySlotContainer>
      {children}
      {isPage ? (
        <ButtonRow>
          <Button onClick={() => createSlot()}>Customise</Button>
        </ButtonRow>
      ) : (
        <ButtonRow>
          <Button onClick={() => createSlot('exact')}>Customise only on this page</Button>
          <Button onClick={() => createSlot('all')}>Customise on all of this type in this context</Button>
        </ButtonRow>
      )}
    </EmptySlotContainer>
  );
};
