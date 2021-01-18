import { PageBlockDefinition } from './extension';
import simpleHtmlBlock from './simple-html-block/simple-html-block';
import currentManifest from './current-manifest-snippet-block';

export const defaultPageBlockDefinitions: PageBlockDefinition<any, any, any, any>[] = [
  simpleHtmlBlock,
  currentManifest,
];
