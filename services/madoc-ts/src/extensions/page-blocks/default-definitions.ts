import { CanvasPanelBlock } from '../../frontend/shared/components/CanvasPanelBlock';
import { SingleCollection } from '../../frontend/shared/components/SingleCollection';
import { SingleProject } from '../../frontend/shared/components/SingleProject';
import { Surface } from '../../frontend/shared/layout/Surface';
import { FeaturedItem } from '../../frontend/shared/components/FeaturedItem';
import { CrowdSourcingBanner } from '../../frontend/shared/components/CrowdSourcingBanner';
import { PageBlockDefinition } from './extension';
import simpleHtmlBlock from './simple-html-block/simple-html-block';
import currentManifest from './current-manifest-snippet-block';
import simpleMarkdownBlock from './simple-markdown-block/simple-markdown-block';
import { EmbedItem } from '../../frontend/site/features/sharedBlocks/EmbedItem';

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
    simpleMarkdownBlock,
  ];
}
