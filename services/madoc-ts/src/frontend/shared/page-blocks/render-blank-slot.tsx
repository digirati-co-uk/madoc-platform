import React from 'react';
import { useMutation } from 'react-query';
import { extractBlockDefinitions } from '../../../extensions/page-blocks/block-editor-react';
import { CreateSlotRequest } from '../../../types/schemas/site-page';
import { Button } from '../atoms/Button';
import { useApi } from '../hooks/use-api';
import { useSlots } from './slot-context';

export const RenderBlankSlot: React.FC<{ name: string }> = ({ name: slotId, children }) => {
  const { slots, context, editable, onUpdateSlot, beforeCreateSlot, onCreateSlot } = useSlots();
  const api = useApi();
  const blockDefinitions = extractBlockDefinitions(children);
  const [createSlot, { isLoading }] = useMutation(async () => {
    const slotRequest: CreateSlotRequest = {
      slotId,
      layout: 'none',
    };

    beforeCreateSlot(slotRequest);

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
        CUSTOMISE SLOT <Button onClick={() => createSlot()}>Customise</Button>
      </div>
    );
  }

  return (
    <div>
      {children}
      <Button onClick={() => createSlot()}>Customise</Button>
    </div>
  );
};
