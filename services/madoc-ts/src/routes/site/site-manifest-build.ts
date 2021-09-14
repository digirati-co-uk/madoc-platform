import { AnnotationPage } from '@hyperion-framework/types';
import { Vault } from '@hyperion-framework/vault';
import { sql } from 'slonik';
import { deprecationGetItemsJson } from '../../deprecations/01-local-source-canvas';
import { gatewayHost } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { IIIFBuilder } from '../../utility/iiif-builder/iiif-builder';
import { createMetadataReducer } from '../../utility/iiif-metadata';

type IIIFExportRow = {
  derived__id: number;
  iiif__id: number;
  iiif__type: string;
  iiif__source: string;
  iiif__thumbnail: string | null;
  iiif__duration: number | null;
  iiif__height: number | null;
  iiif__width: number | null;
  iiif__nav_date: number | null;
  iiif__rights: string | null;
  iiif__viewing_direction: 0 | 1 | 2 | 3 | null;
  iiif__items_json: any | null;
  iiif__thumbnail_json: any | null;
  iiif__local_source: string | null;
  iiif__item_index?: number;
} & (
  | {
      linking__id: number;
      linking__uri: string;
      linking__type: string;
      linking__label: string | null;
      linking__property: string;
      linking__source: string | null;
      linking__file_path: string | null;
      linking__file_bucket: string | null;
      linking__file_hash: string | null;
      linking__motivation: string | null;
      linking__format: string | null;
      linking__properties: any | null;
    }
  | {
      linking__id: null;
      linking__uri: null;
      linking__type: null;
      linking__label: null;
      linking__property: null;
      linking__source: null;
      linking__file_path: null;
      linking__file_bucket: null;
      linking__file_hash: null;
      linking__motivation: null;
      linking__format: null;
      linking__properties: null;
    }
) &
  (
    | {
        metadata__id: number;
        metadata__key: string;
        metadata__value: string;
        metadata__language: string;
        metadata__source: string;
      }
    | {
        metadata__id: null;
        metadata__key: null;
        metadata__value: null;
        metadata__language: null;
        metadata__source: null;
      }
  );

export const siteManifestBuild: RouteMiddleware<{
  slug: string;
  id: string;
  version: string;
  projectSlug?: string;
}> = async context => {
  const vault = new Vault();
  const builder = new IIIFBuilder(vault);
  const site = context.state.site;
  const siteSlug = context.params.slug;
  const manifestId = Number(context.params.id);
  const version = context.params.version;
  const projectSlug = context.params.projectSlug;

  const baseUrl = `${gatewayHost}/s/${siteSlug}`;

  const rows = await context.connection.any(sql<IIIFExportRow>`
      select 
        -- Derived.
        dervied_manifest.resource_id as derived__id,
        -- IIIF
        iiif.id as iiif__id,
        iiif.type as iiif__type,
        iiif.source as iiif__source,
        iiif.default_thumbnail as iiif__thumbnail,
        iiif.duration as iiif__duration,
        iiif.height as iiif__height,
        iiif.width as iiif__width,
        iiif.nav_date as iiif__nav_date,
        iiif.rights as iiif__rights,
        iiif.viewing_direction as iiif__viewing_direction,
        iiif.items_json as iiif__items_json,
        iiif.thumbnail_json as iiif__thumbnail_json,
        iiif.local_source as iiif__local_source,
        manifest_items.item_index as iiif__item_index,
        -- Metadata properties
        metadata.id as metadata__id,
        metadata.key as metadata__key,
        metadata.value as metadata__value,
        metadata.language as metadata__language,
        metadata.source as metadata__source,
        -- linking properties
        linking.id as linking__id,
        linking.uri as linking__uri,
        linking.type as linking__type,
        linking.label as linking__label,
        linking.property as linking__property,
        linking.source as linking__source,
        linking.file_path as linking__file_path,
        linking.file_bucket as linking__file_bucket,
        linking.file_hash as linking__file_hash,
        linking.motivation as linking__motivation,
        linking.format as linking__format,
        linking.properties as linking__properties
         
      from iiif_derived_resource dervied_manifest
      -- get the list of canvases
      left join iiif_derived_resource_items manifest_items on dervied_manifest.resource_id = manifest_items.resource_id and manifest_items.site_id = ${site.id}
      -- get the IIIF data for the manifest
      left join iiif_resource iiif on (dervied_manifest.resource_id = iiif.id or manifest_items.item_id = iiif.id)
      -- get metadata
      left join iiif_metadata metadata on iiif.id = metadata.resource_id and metadata.site_id = ${site.id}
      -- get linking
      left join iiif_linking linking on iiif.id = linking.resource_id and linking.site_id = ${site.id}
      
      where dervied_manifest.resource_id = ${manifestId}
        and dervied_manifest.site_id = ${site.id}
  `);

  function reduceIIIFExportRows(items: readonly IIIFExportRow[]) {
    const reducer = createMetadataReducer(r => ({ id: r.resource_id }));
    const state: {
      Resource: {
        [id: number]: {
          id: number;
          type: string;
          source: string;
          thumbnail: string | null;
          duration: number | null;
          height: number | null;
          width: number | null;
          nav_date: number | null;
          rights: string | null;
          viewing_direction: 0 | 1 | 2 | 3 | null;
          items?: any;
          thumbnail_json?: any;
          local_source: string | null;
        };
      };
      Linking: {
        [iiifId: number]: {
          [id: number]: {
            id: number;
            uri: string;
            type: string;
            label: string | null;
            property: string;
            source: string | null;
            file_path: string | null;
            file_bucket: string | null;
            file_hash: string | null;
            motivation: string | null;
            format: string | null;
            properties: any | null;
          };
        };
      };
      Relations: { [id: number]: Array<{ order: number; id: number }> };
      Metadata: {
        [iiifId: number]: {
          [key: string]: any;
        };
      };
    } = {
      Linking: {},
      Resource: {},
      Relations: {},
      Metadata: {},
    };
    const processedMetadataIds = [];
    const processedIIIFIds = [];
    const processedLinking = [];

    for (const item of items) {
      // Relations.
      if (item.derived__id !== item.iiif__id) {
        state.Relations[item.derived__id] = state.Relations[item.derived__id] ? state.Relations[item.derived__id] : [];
        if (!state.Relations[item.derived__id].find(i => i.id === item.iiif__id)) {
          state.Relations[item.derived__id].push({
            id: item.iiif__id,
            order: item.iiif__item_index || 0,
          });
        }
      }

      // Metadata
      if (item.metadata__id !== null && processedMetadataIds.indexOf(item.metadata__id) === -1) {
        state.Metadata = reducer(state.Metadata, {
          key: item.metadata__key,
          language: item.metadata__language,
          value: item.metadata__value,
          resource_id: item.iiif__id,
          source: item.metadata__source,
        });
        processedMetadataIds.push(item.metadata__id);
      }

      if (item.iiif__id !== null && processedIIIFIds.indexOf(item.iiif__id) === -1) {
        state.Resource[item.iiif__id] = {
          id: item.iiif__id,
          type: item.iiif__type,
          source: item.iiif__source,
          thumbnail: item.iiif__thumbnail,
          duration: item.iiif__duration,
          height: item.iiif__height,
          width: item.iiif__width,
          nav_date: item.iiif__nav_date,
          rights: item.iiif__rights,
          viewing_direction: item.iiif__viewing_direction,
          items: item.iiif__items_json || undefined,
          thumbnail_json: item.iiif__thumbnail_json || undefined,
          local_source: item.iiif__local_source,
        };

        processedIIIFIds.push(item.iiif__id);
      }

      if (item.linking__id !== null && processedLinking.indexOf(item.linking__id) === -1) {
        state.Linking[item.iiif__id] = state.Linking[item.iiif__id] ? state.Linking[item.iiif__id] : {};
        state.Linking[item.iiif__id][item.linking__id] = {
          id: item.linking__id,
          uri: item.linking__uri,
          type: item.linking__type,
          label: item.linking__label,
          property: item.linking__property,
          source: item.linking__source,
          file_path: item.linking__file_path,
          file_bucket: item.linking__file_bucket,
          file_hash: item.linking__file_hash,
          motivation: item.linking__motivation,
          format: item.linking__format,
          properties: item.linking__properties,
        };

        processedLinking.push(item.linking__id);
      }
    }

    return state;
  }

  const table = reduceIIIFExportRows(rows);
  const manifestRow = table.Resource[manifestId];

  // Shim for canvases.
  for (const canvas of Object.values(table.Resource)) {
    if (canvas.type === 'canvas') {
      if (!canvas.items) {
        const resp = await deprecationGetItemsJson({
          connection: context.connection,
          row: {
            id: canvas.id,
            width: canvas.width,
            height: canvas.height,
            items_json: canvas.items,
            thumbnail_json: canvas.thumbnail_json,
            local_source: canvas.local_source,
          },
        });

        canvas.height = resp.height;
        canvas.width = resp.width;
        canvas.items = resp.items;
      }
    }
  }

  const configOptions = {
    includeSearchService: false, // The search service doesn't appear to be working.
    addUniversalAnnotations: true,
    includeManifestHomepage: false, // Serializer not working for homepage.
    includeCanvasHomepage: false, // Serializer not working for homepage.
    jsonModels: true,
    sourceIds: false, // Source IDs supported in theory for both P2 and P3. Version = source is the same as P3.
  };

  const useSourceIds = version === 'source' || configOptions.sourceIds;

  const newManifestId =
    manifestRow.source && useSourceIds
      ? manifestRow.source
      : `${baseUrl}/api/manifests/${manifestId}/export/${version}`;

  const newManifest = builder.createManifest(newManifestId, manifest => {
    const manifestMetadata = table.Metadata[manifestRow.id] || {};
    const manifestLinking = Object.values(table.Linking[manifestRow.id] || {});
    // Manifest properties.
    if (configOptions.includeSearchService) {
      manifest.addServiceProperty({
        '@context': 'http://iiif.io/api/search/0/context.json',
        id: `${baseUrl}/api/manifests/${manifestId}/search/1.0`,
        profile: 'http://iiif.io/api/search/0/search',
        label: 'Search within',
      } as any);
    }
    if (configOptions.includeManifestHomepage) {
      if (projectSlug) {
        manifest.setHomepage({
          id: `${baseUrl}/projects/${projectSlug}/manifests/${manifestRow.id}`,
          type: 'Text',
          label: { en: ['View on Madoc'] },
          format: 'text/html',
        } as any);
      } else {
        manifest.setHomepage({
          id: `${baseUrl}/manifests/${manifestRow.id}`,
          type: 'Text',
          label: { en: ['View on Madoc'] },
          format: 'text/html',
        } as any);
      }
    }
    if (manifestRow.thumbnail) {
      manifest.addThumbnail({
        id: manifestRow.thumbnail,
        type: 'Image',
        format: 'image/jpeg',
      });
    }
    if (manifestRow.rights) {
      manifest.setRights(manifestRow.rights);
    }
    if (manifestRow.viewing_direction) {
      manifest.setViewingDirection(manifestRow.viewing_direction);
    }

    // Metadata / descriptive.
    manifest.setLabel(manifestMetadata.label);

    if (manifestMetadata.summary) {
      manifest.setSummary(manifestMetadata.summary);
    }

    if (manifestMetadata.metadata) {
      manifest.setMetadata(manifestMetadata.metadata);
    }

    if (manifestMetadata.requiredStatement) {
      manifest.setRequiredStatement(manifestMetadata.requiredStatement);
    }

    const mapNormalLink = (link: any) => ({
      id: link.uri,
      type: link.type as any,
      format: link.format || undefined,
      ...(link.properties || {}),
    });

    for (const linking of manifestLinking) {
      switch (linking.property) {
        case 'seeAlso':
          manifest.addSeeAlso(mapNormalLink(linking));
          break;
        case 'service':
          manifest.addServiceProperty(mapNormalLink(linking));
          break;
        case 'homepage':
          manifest.setHomepage(mapNormalLink(linking));
          break;
        case 'rendering':
          manifest.addRendering(mapNormalLink(linking));
          break;
        case 'partOf':
          manifest.isPartOf({
            id: linking.uri,
            type: linking.type as any,
            ...(linking.properties || {}),
          });
          break;
        case 'start':
          manifest.setStart({
            id: linking.uri,
            type: linking.type as any,
            ...(linking.properties || {}),
          });
          break;
        case 'services':
          manifest.addServicesProperty(mapNormalLink(linking));
          break;
      }
    }

    const canvases = (table.Relations[manifestId] || [])
      .sort((a, b) => a.order - b.order)
      .map(c => table.Resource[c.id]);

    for (const canvasRow of canvases) {
      const newCanvasId = canvasRow.source && useSourceIds ? canvasRow.source : `${manifest.id}/c${canvasRow.id}`;
      manifest.createCanvas(newCanvasId, canvas => {
        const canvasMetadata = table.Metadata[canvasRow.id] || {};
        const canvasLinking = Object.values(table.Linking[canvasRow.id] || {});

        canvas.setHeight(canvasRow.height || 0);
        canvas.setWidth(canvasRow.width || 0);
        if (canvasRow.duration) {
          canvas.setDuration(canvasRow.duration);
        }

        if (canvasRow.thumbnail) {
          canvas.addThumbnail({
            id: canvasRow.thumbnail,
            type: 'Image',
            format: 'image/jpeg',
          });
        }
        if (canvasRow.rights) {
          canvas.setRights(canvasRow.rights);
        }
        if (canvasRow.viewing_direction) {
          canvas.setViewingDirection(canvasRow.viewing_direction);
        }

        // Metadata / descriptive.
        canvas.setLabel(canvasMetadata.label);

        if (canvasMetadata.summary) {
          canvas.setSummary(canvasMetadata.summary);
        }

        if (canvasMetadata.metadata) {
          canvas.setMetadata(canvasMetadata.metadata);
        }

        if (canvasMetadata.requiredStatement) {
          canvas.setRequiredStatement(canvasMetadata.requiredStatement);
        }

        for (const linking of canvasLinking) {
          switch (linking.property) {
            case 'seeAlso':
              canvas.addSeeAlso(mapNormalLink(linking));
              break;
            case 'service':
              canvas.addServiceProperty(mapNormalLink(linking));
              break;
            case 'homepage':
              canvas.setHomepage(mapNormalLink(linking));
              break;
            case 'rendering':
              canvas.addRendering(mapNormalLink(linking));
              break;
            case 'partOf':
              canvas.isPartOf({
                id: linking.uri,
                type: linking.type as any,
                ...(linking.properties || {}),
              });
              break;
            case 'start':
              canvas.setStart({
                id: linking.uri,
                type: linking.type as any,
                ...(linking.properties || {}),
              });
              break;
          }
        }

        const annoVer = configOptions.sourceIds ? 'source' : version;

        if (configOptions.addUniversalAnnotations) {
          canvas.addAnnotations({
            id: projectSlug
              ? `${baseUrl}/api/canvases/${canvasRow.id}/models?format=open-annotation&version=${annoVer}&m=${manifestId}&selectors=true&project=${projectSlug}`
              : `${baseUrl}/api/canvases/${canvasRow.id}/models?format=open-annotation&version=${annoVer}&m=${manifestId}&selectors=true`,
            type: 'AnnotationPage',
            label: { none: ['Annotations'] },
          });
        }
        if (configOptions.jsonModels) {
          canvas.addSeeAlso({
            id: projectSlug
              ? `${baseUrl}/api/canvases/${canvasRow.id}/models?format=json&version=${annoVer}&m=${manifestId}&selectors=true&project=${projectSlug}`
              : `${baseUrl}/api/canvases/${canvasRow.id}/models?format=json&version=${annoVer}&m=${manifestId}&selectors=true`,
            type: 'Dataset',
            format: 'application/json',
            profile: 'https://madoc.io/capture-models/json/v1.0',
          } as any);
        }

        if (configOptions.includeCanvasHomepage) {
          if (projectSlug) {
            canvas.setHomepage({
              id: `${baseUrl}/projects/${projectSlug}/manifests/${manifestRow.id}/c/${canvasRow.id}`,
              type: 'Text',
              label: { en: ['View on Madoc'] },
              format: 'text/html',
            } as any);
          } else {
            canvas.setHomepage({
              id: `${baseUrl}/manifests/${manifestRow.id}/c/${canvasRow.id}`,
              type: 'Text',
              label: { en: ['View on Madoc'] },
              format: 'text/html',
            } as any);
          }
        }

        // Annotation pages
        if (canvasRow.items) {
          for (const item of canvasRow.items as AnnotationPage[]) {
            canvas.createAnnotationPage(item.id, annotationPage => {
              if (item.items) {
                for (const annotation of item.items) {
                  annotationPage.createAnnotation(annotation);
                }
              }
            });
          }
        }
      });
    }
  });

  switch (version) {
    case 'normalized':
      context.response.body = {
        manifestId: newManifest.id,
        madocId: manifestRow.id,
        store: vault.getState().hyperion,
      };
      break;
    case '3.0':
    case 'source':
      context.set('Access-Control-Allow-Origin', '*');
      context.response.status = 200;
      context.response.body = builder.toPresentation3({ id: newManifest.id, type: 'Manifest' });
      return;
    case '2.1':
      context.set('Access-Control-Allow-Origin', '*');
      context.response.status = 200;
      context.response.body = builder.toPresentation2({ id: newManifest.id, type: 'Manifest' });
      return;
    default:
      context.status = 404;
      return;
  }
};
