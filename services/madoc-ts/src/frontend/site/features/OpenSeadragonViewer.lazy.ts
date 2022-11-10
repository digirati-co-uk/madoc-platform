import { madocLazy } from '../../shared/utility/madoc-lazy';

export const OpenSeadragonViewer = madocLazy(async () => {
  const imported = await import('./OpenSeadragonViewer');
  return { default: imported.OpenSeadragonViewer };
});
