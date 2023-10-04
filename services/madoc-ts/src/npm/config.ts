// This is for all built-in extension points (excluding page blocks / models)

import { wikidataSource } from '../extensions/completions/sources/wikidata-source';
import { worldcatFastSource } from '../extensions/completions/sources/worldcat-fast-source';
import { crowdsourcedTranscription } from '../extensions/projects/templates/crowdsourced-transcription';
import { customProject } from '../extensions/projects/templates/custom-project';
// import { metadataSuggestions } from '../extensions/projects/templates/metadata-suggestions';
import { ocrCorrection } from '../extensions/projects/templates/ocr-correction';
import { allExports } from '../extensions/project-export/export-configs/index';
import {
  siteConfigurationModel,
  NonProjectOptions,
  ProjectConfigContributions,
  ProjectConfigOther,
  ProjectConfigReview,
  ProjectConfigSearch,
  ProjectConfigInterface,
  postProcessConfiguration,
} from '../frontend/shared/configuration/site-config';
import { migrateConfig } from '../utility/config-migrations';

export const projectTemplates = {
  crowdsourcedTranscription,
  // Has large react dependencies.
  //  metadataSuggestions,
  customProject,
  ocrCorrection,
};

export const exportConfig = allExports;

export const dataSources = {
  wikidataSource,
  worldcatFastSource,
};

export const siteConfiguration = {
  legacy: siteConfigurationModel,
  site: NonProjectOptions,
  contributions: ProjectConfigContributions,
  other: ProjectConfigOther,
  review: ProjectConfigReview,
  search: ProjectConfigSearch,
  interface: ProjectConfigInterface,
  helpers: {
    postProcessConfiguration,
    migrateConfig,
  },
};

// // Type exports.
// export { ExportConfig } from '../extensions/project-export/types';
// export { CompletionSource } from '../extensions/completions/types';
// export {
//   ProjectTemplate,
//   JsonProjectTemplate,
//   ProjectTemplateConfig,
//   CaptureModelShorthand,
//   ModelDefinition,
// } from '../extensions/projects/types';
// export { ProjectConfiguration, ProjectConfigurationNEW } from '../types/schemas/project-configuration';
