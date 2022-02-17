import { CanvasPanelBlock } from '../../frontend/shared/components/CanvasPanelBlock';
import { Surface } from '../../frontend/shared/layout/Surface';
import { CrowdSourcingBanner } from '../../frontend/shared/components/CrowdSourcingBanner';
import { PageBlockDefinition } from './extension';
import simpleHtmlBlock from './simple-html-block/simple-html-block';
import currentManifest from './current-manifest-snippet-block';
import simpleMarkdownBlock from './simple-markdown-block/simple-markdown-block';

export const defaultPageBlockDefinitions: PageBlockDefinition<any, any, any, any>[] = [
  simpleHtmlBlock,
  currentManifest,
  (Surface as any)[Symbol.for('slot-model')] as any,
  (CrowdSourcingBanner as any)[Symbol.for('slot-model')] as any,
  (CanvasPanelBlock as any)[Symbol.for('slot-model')] as any,
  simpleMarkdownBlock,
];
