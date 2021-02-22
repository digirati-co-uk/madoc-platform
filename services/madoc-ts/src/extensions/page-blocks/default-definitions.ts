import { Surface } from '../../frontend/shared/atoms/Surface';
import { PageBlockDefinition } from './extension';
import simpleHtmlBlock from './simple-html-block/simple-html-block';
import currentManifest from './current-manifest-snippet-block';
import simpleMarkdownBlock from './simple-markdown-block/simple-markdown-block';
import '../../frontend/shared/atoms/Surface';

export const defaultPageBlockDefinitions: PageBlockDefinition<any, any, any, any>[] = [
  simpleHtmlBlock,
  currentManifest,
  (Surface as any)[Symbol.for('slot-model')] as any,
  simpleMarkdownBlock,
];
