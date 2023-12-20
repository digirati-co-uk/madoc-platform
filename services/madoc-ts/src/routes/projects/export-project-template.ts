import { getValue } from '@iiif/vault-helpers';
import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { RouteMiddleware } from '../../types/route-middleware';
import { traverseStructure } from '../../utility/traverse-structure';
import { userWithScope } from '../../utility/user-with-scope';
import { parseProjectId } from '../../utility/parse-project-id';
import { NotFound } from '../../utility/errors/not-found';
import { api } from '../../gateway/api.server';
import { JsonProjectTemplate } from '../../extensions/projects/types';
import deepmerge from 'deepmerge';

export const exportProjectTemplate: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const { projectSlug, projectId } = parseProjectId(context.params.id);

  if (!projectId && !projectSlug) {
    throw new NotFound();
  }

  const userApi = api.asUser({ siteId });
  const project = await userApi.getProject(context.params.id);
  const captureModel: CaptureModel = await userApi.getCaptureModel(project.capture_model_id);

  const newDocument = deepmerge({}, captureModel.document, { clone: true });
  const newStructure = deepmerge({}, captureModel.structure as any, { clone: true });

  const idMapping: Record<string, string> = {};
  const updateId = (e: any) => {
    if (e.id) {
      if (!idMapping[e.id]) {
        idMapping[e.id] = generateId();
      }
      e.id = idMapping[e.id];
    }
  };
  traverseDocument(newDocument, {
    visitEntity: updateId,
    visitField: updateId,
    visitSelector: updateId,
  });
  traverseStructure(newStructure as any, updateId);

  const key = Object.keys(project.label || {})[0];
  const values = key && project.label[key] ? project.label[key] : [];
  const value = values && values.length ? values[0] : 'Untitled project';

  context.response.body = {
    type: `template-${project.id}-${project.slug}`,
    metadata: {
      label: `${value} (copy)`,
      description: `Copy of ${value}`,
      version: '1.0.0',
    },
    configuration: {
      defaults: project.config,
    },
    captureModel: {
      document: newDocument,
      structure: newStructure,
    },
  } as JsonProjectTemplate;
};
