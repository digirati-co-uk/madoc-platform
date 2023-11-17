import { useRouteContext } from '../../site/hooks/use-route-context';
import { useCanvasSearch } from './use-canvas-search';
import { useManifestStructure } from './use-manifest-structure';
import { createLink } from '../utility/create-link';

export function useManifestPagination(subRoute?: string) {
  const { manifestId, collectionId, canvasId, projectId } = useRouteContext();
  const [searchText] = useCanvasSearch(canvasId);
  const structure = useManifestStructure(manifestId);
  const query = searchText ? { searchText } : undefined;

  const idx = structure.data && canvasId ? structure.data.ids.indexOf(canvasId) : -1;

  if (!structure.data || idx === -1 || !manifestId) {
    return null;
  }

  const hasPrevPage = idx > 0 && structure.data.items[idx - 1];
  const hasNextPage = idx < structure.data.items.length && structure.data.items[idx + 1];

  return {
    hasPrevPage: !!hasPrevPage,
    prevItem: hasPrevPage,
    prevPage: hasPrevPage
      ? createLink({
          projectId,
          collectionId,
          manifestId,
          canvasId: structure.data.items[idx - 1].id,
          subRoute,
          query,
        })
      : undefined,

    hasNextPage: !!hasNextPage,
    nextItem: hasNextPage,
    nextPage: hasNextPage
      ? createLink({
          projectId,
          collectionId,
          manifestId,
          canvasId: structure.data.items[idx + 1].id,
          subRoute,
          query,
        })
      : undefined,
  };
}
