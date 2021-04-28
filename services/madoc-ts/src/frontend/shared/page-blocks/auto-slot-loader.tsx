import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import { useRouteMatch } from 'react-router-dom';
import { EditorialContext } from '../../../types/schemas/site-page';
import { useSiteConfiguration } from '../../site/features/SiteConfigurationContext';
import { useApi } from '../hooks/use-api';
import { SlotProvider } from './slot-context';

export const AutoSlotLoader: React.FC = ({ children }) => {
  const routeMatch = useRouteMatch<any>();
  const api = useApi();
  const { editMode } = useSiteConfiguration();

  const parsedContext = useMemo(() => {
    const routeContext: EditorialContext = {};

    routeContext.collection = routeMatch.params.collectionId ? Number(routeMatch.params.collectionId) : undefined;
    routeContext.manifest = routeMatch.params.manifestId ? Number(routeMatch.params.manifestId) : undefined;
    routeContext.canvas = routeMatch.params.canvasId ? Number(routeMatch.params.canvasId) : undefined;
    routeContext.project = routeMatch.params.slug ? routeMatch.params.slug : undefined;

    return routeContext;
  }, [
    routeMatch.params.canvasId,
    routeMatch.params.collectionId,
    routeMatch.params.manifestId,
    routeMatch.params.slug,
  ]);

  const { data, refetch } = useQuery(
    ['slot-request', parsedContext],
    async () => {
      return api.pageBlocks.requestSlots(parsedContext);
    },
    { enabled: routeMatch.isExact }
  );

  const invalidateSlots = async () => {
    await refetch();
  };

  // Now to resolve the slots.
  return (
    <SlotProvider
      onCreateSlot={invalidateSlots}
      onUpdateSlot={invalidateSlots}
      onUpdateBlock={invalidateSlots}
      editable={editMode}
      slots={data}
      context={parsedContext}
    >
      {children}
    </SlotProvider>
  );
};
