import { sql } from 'slonik';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { api } from '../../gateway/api.server';
import { CrowdsourcingTask } from '../../gateway/tasks/crowdsourcing-task';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { getCroppedImageFromService } from '../../utility/get-cropped-image-from-service';
import { parseUrn } from '../../utility/parse-urn';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const svgFromCrowdsourcingTask: RouteMiddleware = async context => {
  const { siteId, id } = optionalUserWithScope(context, ['site.admin']);
  const userApi = api.asUser({ siteId });

  console.log({
    siteId,
    id,
    taskId: context.params.taskId,
  });

  // 1. Get the task.
  const task = await userApi.getTask<CrowdsourcingTask>(context.params.taskId);
  if (task.type !== 'crowdsourcing-task') {
    throw new NotFound('Task not found');
  }

  const subject = parseUrn(task.subject);
  if (!subject || subject.type !== 'canvas') {
    throw new NotFound('Canvas not found');
  }

  // Get revision
  const revisionId = task.state.revisionId;
  if (!revisionId) {
    context.response.body = { empty: true };
    return;
  }

  const revision = await context.captureModels.getRevision(revisionId, siteId, {});
  const document = revision.document;
  const selectors: Array<{ x: number; y: number; width: number; height: number }> = [];
  traverseDocument(document, {
    visitSelector: selector => {
      if (selector.type === 'box-selector' && selector.state) {
        selectors.push(selector.state);
      }
    },
  });

  if (!selectors.length) {
    context.response.body = { empty: true };
    return;
  }

  const resp = await context.connection.any(sql<{ items_json: any[]; width: number; height: number }>`
    select ir.id, ir.width, ir.height, ir.items_json from iiif_derived_resource ifd
        left join iiif_resource ir on ifd.resource_id = ir.id
    where ir.id = ${subject.id} and site_id = ${siteId}
  `);

  let x = Math.min(...selectors.map(s => s.x));
  let y = Math.min(...selectors.map(s => s.y));
  let width = Math.max(...selectors.map(s => s.x + s.width)) - x;
  let height = Math.max(...selectors.map(s => s.y + s.height)) - y;

  width = width * 1.2;
  height = height * 1.2;
  x = Math.max(0, x - width * 0.1);
  y = Math.max(0, y - height * 0.1);

  if (x + width > resp[0].width) {
    width = resp[0].width - x;
  }
  if (y + height > resp[0].height) {
    height = resp[0].height - y;
  }

  if (width > height) {
    // Adjust height and y
    const diff = width - height;
    const half = diff / 2;
    y = y - half;
    height = height + diff;
  } else {
    // Adjust width and x
    const diff = height - width;
    const half = diff / 2;
    x = x - half;
    width = width + diff;
  }

  const imageService = resp[0].items_json[0].items[0].body.service[0];
  const url = await getCroppedImageFromService(imageService, {
    region: { x, y, w: width, h: height },
    width: 256,
    height: 256,
    validate: true,
  });

  if (!url) {
    context.response.body = { empty: true };
    return;
  }

  const finalSelectors = [];
  const existing: string[] = [];
  for (const selector of selectors) {
    const key = `${selector.x}-${selector.y}-${selector.width}-${selector.height}`;
    if (existing.indexOf(key) === -1) {
      existing.push(key);
      finalSelectors.push(selector);
    }
  }

  const strokeWidth = ~~((width / 256) * 2);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="${x} ${y} ${width} ${height}" class="selector-preview-svg">
      <image x="${x}" y="${y}" height="${height}" width="${width}" href="${url}" />
      ${finalSelectors
        .map(s => {
          return `<rect x="${s.x}" y="${s.y}" width="${s.width}" height="${s.height}" fill="none" stroke-width="${strokeWidth}px" />`;
        })
        .join('')}
    </svg>
  `;

  context.response.body = { svg, empty: false };
};
