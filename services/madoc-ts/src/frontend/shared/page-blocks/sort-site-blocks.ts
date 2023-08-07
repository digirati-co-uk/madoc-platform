import { SiteBlock } from '../../../types/schemas/site-page';

export function sortSiteBlocks(blocks: SiteBlock[], language: string, filterLangs = true): SiteBlock[] {
  const choiceMap: { [key: string]: Array<{ languages: string[]; id: number }> } = {};
  const chosenBlocks: { [key: string]: number } = {};

  blocks.forEach(block => {
    if (block.i18n && block.i18n.sortKey) {
      choiceMap[block.i18n.sortKey] = choiceMap[block.i18n.sortKey] || [];
      choiceMap[block.i18n.sortKey].push({ languages: block.i18n.languages, id: block.id });
      if (block.i18n.fallback) {
        chosenBlocks[block.i18n.sortKey] = block.id;
      }
    }
  });

  const keys = Object.keys(choiceMap);
  for (const key of keys) {
    const item = choiceMap[key];
    const chosen = item.find(i => i.languages.includes(language))?.id;
    if (chosen) {
      chosenBlocks[key] = chosen;
    }
  }

  const filteredBlocks = blocks.filter(block => {
    if (!filterLangs) {
      return true;
    }
    if (!block.i18n || !block.i18n.sortKey) {
      // All blocks without a sort key can be shown.
      return true;
    }

    const chosen = chosenBlocks[block.i18n.sortKey];
    return chosen === block.id;
  });

  return filteredBlocks.sort((a, b) => {
    const aOrder = typeof a.order === 'undefined' ? Infinity : a.order;
    const bOrder = typeof b.order === 'undefined' ? Infinity : b.order;

    return aOrder > bOrder ? 1 : -1;
  });
}
