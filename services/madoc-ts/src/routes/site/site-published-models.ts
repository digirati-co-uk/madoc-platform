import { serialiseCaptureModel, traverseDocument } from '@capture-models/helpers';
import { BaseField } from '@capture-models/types';
import { sql } from 'slonik';
import { getProject } from '../../database/queries/project-queries';
import { PARAGRAPHS_PROFILE } from '../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { RequestError } from '../../utility/errors/request-error';
import {
  captureModelFieldToOpenAnnotation,
  captureModelFieldToW3CAnnotation,
} from '../../utility/model-annotation-helpers';
import { parseProjectId } from '../../utility/parse-project-id';
import { gatewayHost } from '../../gateway/api.server';

export type SitePublishedModelsQuery = {
  format?:
    | 'capture-model'
    | 'capture-model-with-pages'
    | 'open-annotation'
    | 'w3c-annotation'
    | 'json'
    | 'w3c-annotation-pages';
  project_id?: string | number;
  model_id?: string;
  selectors?: boolean;
  derived_from?: string;
  version?: 'source' | '3.0' | '2.1';
  m?: string;
};

export const sitePublishedModels: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const { site, siteApi } = context.state;
  const {
    derived_from,
    format,
    model_id,
    version = 'source',
    m: manifestId,
  } = context.query as SitePublishedModelsQuery;
  const selectors = castBool(context.query.selectors);

  if (version !== 'source' && !manifestId) {
    throw new RequestError('Cannot request models with version and no manifest ID');
  }

  // Formats:
  // - Models (default)
  // - W3C Annotation
  // - JSON
  // - Open Annotation

  const parsedId = context.query.project_id ? parseProjectId(context.query.project_id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, site.id)) : null;
  const derivedFrom = project ? project.capture_model_id : derived_from;

  const models =
    model_id && format !== 'w3c-annotation-pages'
      ? [{ id: model_id, derivatives: 0, label: '' }]
      : await siteApi.getAllCaptureModels({
          target_id: `urn:madoc:canvas:${context.params.id}`,
          target_type: 'Canvas',
          derived_from: derivedFrom,
          all_derivatives: true,
        });

  const resp = await context.connection.one(sql<{ id: number; source: string }>`
    select id, source from iiif_resource where id = ${Number(context.params.id)}
  `);

  const annotationPages = [];

  if (format === 'w3c-annotation-pages' || format === 'capture-model-with-pages') {
    annotationPages.push(
      ...models.map(model => {
        return {
          id: `${gatewayHost}${context.path}?format=w3c-annotation&model_id=${model.id}`,
          label: model.label,
          type: 'AnnotationPage',
        };
      })
    );

    if (format === 'w3c-annotation-pages') {
      context.response.body = {
        pages: annotationPages,
      };
      return;
    }
  }

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

  if (version === '3.0' || version === '2.1') {
    defaultOptions.canvas = `${gatewayHost}/s/${site.slug}/madoc/api/manifests/${manifestId}/export/${version}/c${resp.id}`;
  }

  switch (format) {
    case 'capture-model':
    case 'capture-model-with-pages':
    default: {
      // Just return the models as they are.
      context.response.body = {
        models: await Promise.all(ms),
        pages: annotationPages.length ? annotationPages : undefined,
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
      const resolveModels = await Promise.all(ms);
      for await (const singleModel of resolveModels) {
        traverseDocument(singleModel.document, {
          beforeVisitEntity(entity, key, parent) {
            if (entity.profile === PARAGRAPHS_PROFILE || (parent && parent.temp && parent.temp.PARAGRAPHS)) {
              entity.temp = entity.temp ? entity.temp : {};
              entity.temp.PARAGRAPHS = true;
            }

            if (parent && parent.temp && parent.temp.EXTRACTED) {
              return;
            }
            // Check if there is a selector, if there is then mark it as EXTRACTED
            // Extracted entities will become annotations
            // If there is a labelledBy then use this for the annotation.

            if (entity.selector && entity.selector.state) {
              const labelProp = entity.labelledBy
                ? entity.properties[entity.labelledBy]
                : entity.properties[Object.keys(entity.properties)[0]];
              // Try to get the value of the labelledby
              if (labelProp && labelProp[0] && labelProp[0].type !== 'entity' && (labelProp[0] as BaseField).value) {
                if (entity.temp && entity.temp.PARAGRAPHS) {
                  // We have a paragraphs item.
                  const labelValue = (labelProp as BaseField[])
                    .map(field => {
                      return field.value;
                    })
                    .join(' ');
                  annotations.push(
                    format === 'open-annotation'
                      ? captureModelFieldToOpenAnnotation(entity.id, labelValue, entity.selector, defaultOptions)
                      : captureModelFieldToW3CAnnotation(entity.id, labelValue, entity.selector, defaultOptions)
                  );
                } else {
                  const labelValue = (labelProp[0] as BaseField).value;
                  annotations.push(
                    format === 'open-annotation'
                      ? captureModelFieldToOpenAnnotation(entity.id, labelValue, entity.selector, defaultOptions)
                      : captureModelFieldToW3CAnnotation(entity.id, labelValue, entity.selector, defaultOptions)
                  );
                }
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
            if (canAddAnnotation && field.value) {
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
          label: resolveModels.length === 1 ? resolveModels[0].document.label : null,
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

              if (!serialised) {
                return { id: m.id, derivedFrom: m.derivedFrom };
              }

              serialised.id = m.id;
              serialised.derivedFrom = m.derivedFrom;

              return serialised;
            })
          )
        ),
      };
      return;
    }
  }
};
