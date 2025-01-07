import { CanvasPanelBlock } from '../../frontend/site/blocks/CanvasPanelBlock';
import { SingleCollection } from '../../frontend/site/blocks/SingleCollection';
import { SingleProject } from '../../frontend/site/blocks/SingleProject';
import { Surface } from '../../frontend/shared/layout/Surface';
import { FeaturedItem } from '../../frontend/site/blocks/FeaturedItem';
import { CrowdSourcingBanner } from '../../frontend/site/blocks/CrowdSourcingBanner';
import { PageBlockDefinition } from './extension';
import simpleHtmlBlock from './simple-html-block/simple-html-block';
import currentManifest from './current-manifest-snippet-block';
import simpleMarkdownBlock from './simple-markdown-block/simple-markdown-block';
import { EmbedItem } from '../../frontend/site/blocks/EmbedItem';
import { GABlock } from '../../frontend/shared/atoms/GABlock';

export function getDefaultPageBlockDefinitions(): PageBlockDefinition<any, any, any, any>[] {
  return [
    simpleHtmlBlock,
    currentManifest,
    (Surface as any)[Symbol.for('slot-model')] as any,
    (CrowdSourcingBanner as any)[Symbol.for('slot-model')] as any,
    (CanvasPanelBlock as any)[Symbol.for('slot-model')] as any,
    (SingleProject as any)[Symbol.for('slot-model')] as any,
    (SingleCollection as any)[Symbol.for('slot-model')] as any,
    (FeaturedItem as any)[Symbol.for('slot-model')] as any,
    (EmbedItem as any)[Symbol.for('slot-model')] as any,
    (GABlock as any)[Symbol.for('slot-model')] as any,
    simpleMarkdownBlock,
  ];
}
