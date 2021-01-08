import { serialiseCaptureModel, traverseDocument } from '@capture-models/helpers';
import { BaseField } from '@capture-models/types';
import { sql } from 'slonik';
import { RouteMiddleware } from '../../types/route-middleware';
import {
  captureModelFieldToOpenAnnotation,
  captureModelFieldToW3CAnnotation,
} from '../../utility/model-annotation-helpers';

const gatewayHost = process.env.GATEWAY_HOST || 'http://localhost:8888';

export const sitePublishedModels: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const { siteApi } = context.state;
  const { derived_from, format, selectors } = context.query;

  // Formats:
  // - Models (default)
  // - W3C Annotation
  // - JSON
  // - Open Annotation

  const models = await siteApi.getAllCaptureModels({
    target_id: `urn:madoc:canvas:${context.params.id}`,
    target_type: 'Canvas',
    derived_from,
    all_derivatives: true,
  });

  const resp = await context.connection.one(sql<{ id: number; source: string }>`
    select id, source from iiif_resource where id = ${Number(context.params.id)}
  `);

  const ms = [];

  for (const model of models) {
    ms.push(siteApi.getCaptureModel(model.id, { published: true }));
  }

  const defaultOptions = {
    madocCanvasId: Number(context.params.id),
    gatewayHost,
    path: context.path,
    canvas: resp.source,
  };

  switch (format) {
    case 'capture-model':
    default: {
      // Just return the models as they are.
      context.response.body = {
        models: await Promise.all(ms),
      };
      break;
    }
    case 'open-annotation':
    case 'w3c-annotation': {
      // Return a W3C annotation list.
      // Supported annotations:
      // - Text + selector
      // - Dataset = selector
      const annotations: any[] = [];
      for await (const singleModel of ms) {
        traverseDocument(singleModel.document, {
          beforeVisitEntity(entity, key, parent) {
            if (parent && parent.temp && parent.temp.EXTRACTED) {
              return;
            }
            // Check if there is a selector, if there is then mark it as EXTRACTED
            // Extracted entities will become annotations
            // If there is a labelledBy then use this for the annotation.

            if (entity.selector) {
              const labelProp = entity.labelledBy
                ? entity.properties[entity.labelledBy]
                : entity.properties[Object.keys(entity.properties)[0]];
              // Try to get the value of the labelledby
              if (labelProp && labelProp[0] && labelProp[0].type !== 'entity' && (labelProp[0] as BaseField).value) {
                const labelValue = (labelProp[0] as BaseField).value;
                annotations.push(
                  format === 'open-annotation'
                    ? captureModelFieldToOpenAnnotation(entity.id, labelValue, entity.selector, defaultOptions)
                    : captureModelFieldToW3CAnnotation(entity.id, labelValue, entity.selector, defaultOptions)
                );
                entity.temp = entity.temp ? entity.temp : {};
                entity.temp.EXTRACTED = true;
              }
            }
          },
          visitProperty(property, list, parent) {
            const revised: string[] = [];
            for (const item of list) {
              if (item.revises) {
                revised.push(item.revises);
              }
            }

            for (const item of list) {
              if (revised.indexOf(item.id) !== -1) {
                item.temp = item.temp ? item.temp : {};
                item.temp.REVISED = true;
              }
            }
          },
          visitField(field, key, parent) {
            if ((parent && parent.temp && parent.temp.EXTRACTED) || (field.temp && field.temp.REVISED)) {
              return;
            }

            const canAddAnnotation = selectors ? !!(field.selector && field.selector.state) : true;
            console.log({ selectors, selector: field.selector });
            if (canAddAnnotation) {
              annotations.push(
                format === 'open-annotation'
                  ? captureModelFieldToOpenAnnotation(field.id, field.value, field.selector, defaultOptions)
                  : captureModelFieldToW3CAnnotation(field.id, field.value, field.selector, defaultOptions)
              );
            }
          },
        });
      }

      if (format === 'open-annotation') {
        context.response.body = {
          '@context': 'http://iiif.io/api/presentation/3/context.json',
          '@id': `${gatewayHost}${context.path}?format=open-annotation`,
          '@type': 'sc:AnnotationList',
          resources: annotations,
        };
      } else {
        // W3C annotation page.
        context.response.body = {
          id: `${gatewayHost}${context.path}?format=w3c-annotation`,
          type: 'AnnotationPage',
          items: annotations,
        };
      }

      return;
    }

    case 'json': {
      // return JSON.
      context.response.body = {
        models: await Promise.all(
          ms.map(model =>
            model.then(m => {
              traverseDocument(m.document, {
                visitProperty(property, list, parent) {
                  const revised: string[] = [];
                  for (const item of list) {
                    if (item.revises) {
                      revised.push(item.revises);
                    }
                  }

                  parent.properties[property] = (parent.properties[property] as any[]).filter(item => {
                    return revised.indexOf(item.id) === -1;
                  });
                },
              });

              const serialised = serialiseCaptureModel(m.document, {
                addSelectors: true,
                normalisedValueLists: true,
              });

              serialised.id = m.id;

              return serialised;
            })
          )
        ),
      };
      return;
    }
  }
};
