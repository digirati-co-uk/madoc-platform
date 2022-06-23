import React, { useMemo } from 'react';
import { CanvasFull } from '../../../../types/canvas-full';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { ApiArgs } from '../../../shared/hooks/use-api-query';
import { useData } from '../../../shared/hooks/use-data';
import { HighlightedRegionProvider } from '../../../shared/hooks/use-highlighted-regions';
import { AutoSlotLoader } from '../../../shared/page-blocks/auto-slot-loader';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { Outlet } from 'react-router-dom';

export type CanvasLoaderType = {
  params: {
    slug?: string;
    collectionId?: string;
    manifestId?: string;
    canvasId: string;
  };
  query: Record<string, never>;
  variables: ApiArgs<'getSiteCanvas'>;
  data: CanvasFull;
};

export const CanvasLoader: UniversalComponent<CanvasLoaderType> = createUniversalComponent<CanvasLoaderType>(
  () => {
    const { data } = useData(CanvasLoader, []);
    const ctx = useMemo(
      () => (data ? { id: data.canvas.id, name: data.canvas.label || { none: ['Untitled canvas'] } } : undefined),
      [data]
    );

    return (
      <AutoSlotLoader>
        <BreadcrumbContext canvas={ctx}>
          <HighlightedRegionProvider>
            <Outlet />
          </HighlightedRegionProvider>
        </BreadcrumbContext>
      </AutoSlotLoader>
    );
  },
  {
    getKey: params => {
      return ['getSiteCanvas', [Number(params.canvasId)]];
    },
    getData: async (key, vars, api) => {
      return api.getSiteCanvas(vars[0], { plaintext: true });
    },
  }
);
