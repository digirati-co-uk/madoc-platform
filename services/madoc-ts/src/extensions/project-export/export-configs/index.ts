import { canvasAnnotationExport } from './canvas/canvas-annotation-export';
import { canvasApiExport } from './canvas/canvas-api-export';
import { canvasModelExport } from './canvas/canvas-model-export';
import { canvasPlaintextExport } from './canvas/canvas-plaintext-export';
import { manifestApiExport } from './manifest/manifest-api-export';
import { projectApiExport } from './project/project-api-export';
import { projectCsvSimpleExport } from './project/project-csv-simple-export';

export const allExports = {
  canvasApiExport,
  canvasModelExport,
  canvasPlaintextExport,
  canvasAnnotationExport,
  manifestApiExport,
  projectApiExport,
  projectCsvSimpleExport,
};
