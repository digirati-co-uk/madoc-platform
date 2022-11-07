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
// import { CustomManifestHeader } from '../../frontend/shared/custom-blocks/custom-ida-hero/custom-manifest-header';
// import { CustomCanvasHeader } from '../../frontend/shared/custom-blocks/custom-ida-hero/custom-canvas-header';
// import { IDAManifestMetadata } from '../../frontend/shared/custom-blocks/metadata/metadata';
import { FeedbackBtn } from '../../frontend/shared/custom-blocks/feedback-btn/feedback-btn';
import { GridHeader } from '../../frontend/shared/custom-blocks/grid-header/grid-header';
import { TopicHero } from '../../frontend/shared/custom-blocks/custom-ida-hero/topic-hero';
import {TopicAggHero} from "../../frontend/shared/custom-blocks/custom-ida-hero/topic-agg-hero";

export const defaultPageBlockDefinitions: PageBlockDefinition<any, any, any, any>[] = [
  simpleHtmlBlock,
  currentManifest,
  (Surface as any)[Symbol.for('slot-model')] as any,
  (CrowdSourcingBanner as any)[Symbol.for('slot-model')] as any,
  (CanvasPanelBlock as any)[Symbol.for('slot-model')] as any,
  (SingleProject as any)[Symbol.for('slot-model')] as any,
  (SingleCollection as any)[Symbol.for('slot-model')] as any,
  (FeaturedItem as any)[Symbol.for('slot-model')] as any,
  simpleMarkdownBlock,
  // (IDAManifestMetadata as any)[Symbol.for('slot-model')] as any,
  // (CustomManifestHeader as any)[Symbol.for('slot-model')] as any,
  // (CustomCanvasHeader as any)[Symbol.for('slot-model')] as any,
  (TopicHero as any)[Symbol.for('slot-model')] as any,
  (TopicAggHero as any)[Symbol.for('slot-model')] as any,
  (FeedbackBtn as any)[Symbol.for('slot-model')] as any,
  (GridHeader as any)[Symbol.for('slot-model')] as any,
];
