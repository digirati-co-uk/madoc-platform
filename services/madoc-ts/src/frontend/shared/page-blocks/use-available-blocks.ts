import { useMemo, useState } from 'react';
import { EditorialContext } from '../../../types/schemas/site-page';
import { useApi } from '../hooks/use-api';
import { useSite } from '../hooks/use-site';

export function useAvailableBlocks(props: {
  context?: EditorialContext;
  pagePath?: string;
  source?: { type: string; id: string };
}) {
  const api = useApi();
  const site = useSite();
  const { id: sourceId, type: sourceType } = props.source || {};

  const blockTypes = useMemo(() => {
    return api.pageBlocks.getDefinitions(site.id, props.context);
  }, [api.pageBlocks, props.context, site.id]);

  const availableBlocks = useMemo(() => {
    return blockTypes.filter(block => {
      if (sourceId) {
        // We only want matching sources here.
        return block?.source?.id === sourceId && block?.source?.type === sourceType;
      }

      if (block?.source?.type === 'custom-page') {
        return block?.source.id === props.pagePath;
      }

      return !block.internal;
    });
  }, [blockTypes, props.pagePath, sourceId, sourceType]);

  const contextBlocks = useMemo(() => {
    const context = JSON.parse(JSON.stringify(props.context));
    return blockTypes.filter(block => {
      if (block?.anyContext?.some(b => Object.keys(context).indexOf(b) >= 0)) {
        return block;
      }
      return false;
    });
  }, [blockTypes, props.context]);

  const [filteredBlocks, setFilteredBlocks] = useState(availableBlocks);

  function searchBlocks(e: string) {
    const result = availableBlocks
      ? availableBlocks.filter(block => block.label.toLowerCase().includes(e.toLowerCase()))
      : '';

    setFilteredBlocks(result ? result : []);
  }

  const pagePathBlocks = useMemo(() => {
    return blockTypes.filter(block => {
      if (block?.source?.type === 'custom-page' && props.pagePath) {
        return block?.source.id === props.pagePath;
      }
      return false;
    });
  }, [blockTypes, props.pagePath]);

  const pluginBlocks = useMemo(() => {
    return blockTypes.filter(block => {
      if (block?.source?.type === 'plugin') {
        return block?.source.id;
      }
      return false;
    });
  }, [blockTypes, props.pagePath]);

  return {
    availableBlocks,
    contextBlocks,
    filteredBlocks,
    searchBlocks,
    pagePathBlocks,
    pluginBlocks,
  };
}
