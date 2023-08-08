import { madocLazy } from '../utility/madoc-lazy';

export const OpenSeadragonViewer = madocLazy(async () => {
  const imported = await import('./OpenSeadragonViewer');
  return { default: imported.OpenSeadragonViewer };
});
