import { resolveSelector } from '../../frontend/shared/capture-models/helpers/resolve-selector';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const captureModelExport: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['models.view_published']);

  const selectors = castBool(context.query.selectors);
  const identifiers = castBool(context.query.identifiers);

  const model = await context.captureModels.getCaptureModel(
    context.params.id,
    {
      revisionStatus: 'approved',
    },
    siteId
  );

  const revised: string[] = [];

  traverseDocument(model.document, {
    visitEntity(entity) {
      if (entity.revises) {
        revised.push(entity.id);
      }
    },
    visitField(field) {
      if (field.revises) {
        revised.push(field.id);
      }
    },
  });

  function processLevel(doc: CaptureModel['document']) {
    const rootDoc: any = {};
    const props = Object.keys(doc.properties);

    if (identifiers) {
      rootDoc._id = doc.id;
    }

    for (const prop of props) {
      const values = [];
      for (const field of doc.properties[prop] as BaseField[]) {
        if (revised.indexOf(field.id) !== -1) {
          continue;
        }

        if (field.type === 'entity') {
          const processed = processLevel(field as any);
          if (processed) {
            values.push(processed);
          }
          continue;
        }

        if (field.value) {
          if (field.selector && selectors && field.selector.state) {
            values.push({
              target: {
                type: field.selector.type,
                state: field.selector.state,
              },
              value: field.value,
            });
          } else {
            values.push(field.value);
          }
        }
      }

      if (values.length === 1) {
        rootDoc[prop] = values[0];
      } else if (values.length > 0) {
        rootDoc[prop] = values;
      }
    }

    if (doc.selector && selectors && doc.selector.state) {
      rootDoc.target = {
        type: doc.selector.type,
        state: doc.selector.state,
      };
    }

    if (Object.keys(rootDoc).length === (identifiers ? 1 : 0)) {
      return undefined;
    }

    return rootDoc;
  }

  context.response.body = processLevel(model.document);
};
