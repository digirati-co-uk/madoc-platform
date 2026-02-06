import { Hono } from 'hono';

import { requestMadocSiteUrn } from './jwt.js';
import type { AddConfigPayload } from './types.js';
import { ConfigService } from './configurator.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function createConfigApp(configService: ConfigService): Hono {
  const app = new Hono();

  app.get('/configurator', c => c.text('This is the Madoc config service.'));
  app.get('/configurator/', c => c.text('This is the Madoc config service.'));

  app.post('/configurator', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const payload = await parseJsonBody<AddConfigPayload>(c.req.raw);

    if (!payload) {
      return c.text('POSTed JSON fails jsonschema validation, error: Invalid JSON body', 400);
    }

    const result = await configService.addConfig(payload, contextUrn);
    if (result.err) {
      if (result.err === 409) {
        return c.text(`Config already exists at: ${(result.obj as { id?: string })?.id ?? 'unknown'}`, 409);
      }

      if (result.err === 403) {
        return c.text('No Madoc site urn set in JWT.', 403);
      }

      return c.text(`POSTed JSON fails jsonschema validation, error: ${result.err}`, 400);
    }

    return c.json(result.obj ?? {});
  });

  app.post('/configurator/', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const payload = await parseJsonBody<AddConfigPayload>(c.req.raw);

    if (!payload) {
      return c.text('POSTed JSON fails jsonschema validation, error: Invalid JSON body', 400);
    }

    const result = await configService.addConfig(payload, contextUrn);
    if (result.err) {
      if (result.err === 409) {
        return c.text(`Config already exists at: ${(result.obj as { id?: string })?.id ?? 'unknown'}`, 409);
      }

      if (result.err === 403) {
        return c.text('No Madoc site urn set in JWT.', 403);
      }

      return c.text(`POSTed JSON fails jsonschema validation, error: ${result.err}`, 400);
    }

    return c.json(result.obj ?? {});
  });

  app.get('/configurator/query', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const contextList = c.req.queries('context') ?? [];
    const identifier = c.req.query('id') ?? null;
    const service = c.req.query('service') ?? null;
    const scopeKey = c.req.query('scope_key') ?? null;
    const atTime = c.req.query('at_time') ?? null;
    const version = c.req.query('version') ?? null;

    const result = await configService.getConfig({
      identifier,
      scopeList: contextList,
      service,
      scopeKey,
      versionId: version,
      atTime,
      contextUrn,
    });

    return c.json({
      query: {
        identifier,
        context: contextList,
        service,
        scope_key: scopeKey,
        at_time: atTime,
      },
      config: result,
    });
  });

  app.get('/configurator/:restfulId/versions', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const restfulId = c.req.param('restfulId');

    if (!isUuid(restfulId)) {
      return c.notFound();
    }

    const result = await configService.getAllVersions(restfulId, null, contextUrn);
    if (!result) {
      return c.text(`${restfulId} does not exist`, 404);
    }

    return c.json(result);
  });

  app.get('/configurator/:restfulId/versions/:versionId', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const restfulId = c.req.param('restfulId');
    const versionId = c.req.param('versionId');

    if (!isUuid(restfulId)) {
      return c.notFound();
    }

    if (versionId === 'all') {
      const allVersions = await configService.getAllVersions(restfulId, null, contextUrn);
      if (!allVersions) {
        return c.text(`${restfulId} does not exist`, 404);
      }
      return c.json(allVersions);
    }

    const parsed = Number(versionId);
    if (!Number.isInteger(parsed)) {
      return c.text('Version must be "all" or an integer identifier', 400);
    }

    const result = await configService.restfulGetConfig(restfulId, parsed, null, contextUrn);
    if (!result) {
      return c.text(`${restfulId} at null with version ${parsed} does not exist`, 404);
    }

    c.header('ETag', `w"${result[1]}"`);
    return c.json(result[0]);
  });

  app.get('/configurator/:restfulId/datetime/:dateTimeString', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const restfulId = c.req.param('restfulId');
    const dateTimeString = c.req.param('dateTimeString');

    if (!isUuid(restfulId)) {
      return c.notFound();
    }

    const dateTime = configService.parseDateTime(dateTimeString);
    const result = await configService.restfulGetConfig(restfulId, null, dateTime, contextUrn);

    if (!result) {
      return c.text(`${restfulId} at ${dateTime?.toISOString() ?? 'null'} with version null does not exist`, 404);
    }

    c.header('ETag', `w"${result[1]}"`);
    return c.json(result[0]);
  });

  app.get('/configurator/:restfulId', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const restfulId = c.req.param('restfulId');

    if (!isUuid(restfulId)) {
      return c.notFound();
    }

    const result = await configService.restfulGetConfig(restfulId, null, null, contextUrn);
    if (!result) {
      return c.text(`${restfulId} at null with version null does not exist`, 404);
    }

    c.header('ETag', `w"${result[1]}"`);
    return c.json(result[0]);
  });

  app.get('/configurator/:restfulId/', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const restfulId = c.req.param('restfulId');

    if (!isUuid(restfulId)) {
      return c.notFound();
    }

    const result = await configService.restfulGetConfig(restfulId, null, null, contextUrn);
    if (!result) {
      return c.text(`${restfulId} at null with version null does not exist`, 404);
    }

    c.header('ETag', `w"${result[1]}"`);
    return c.json(result[0]);
  });

  app.put('/configurator/:restfulId', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const restfulId = c.req.param('restfulId');

    if (!isUuid(restfulId)) {
      return c.notFound();
    }

    const requestEtag = c.req.header('If-Match');
    if (!requestEtag) {
      return c.text('If-Match header must be set on PUT operations.', 400);
    }

    const configObject = await parseJsonBody<Record<string, unknown>>(c.req.raw);
    if (!configObject) {
      return c.text('POSTed JSON fails jsonschema validation, error: Invalid JSON body', 400);
    }

    const result = await configService.restfulPutConfig(restfulId, configObject, requestEtag, contextUrn);

    if (!result.existing) {
      return c.text(`${restfulId} does not exist`, 404);
    }

    if (result.err) {
      if (result.err === 412) {
        return c.text('If-Match header does not match', 412);
      }

      return c.text(`POSTed JSON fails jsonschema validation, error: ${result.err}`, 400);
    }

    return c.body(null, 204);
  });

  app.put('/configurator/:restfulId/', async c => {
    const contextUrn = requestMadocSiteUrn(c);
    const restfulId = c.req.param('restfulId');

    if (!isUuid(restfulId)) {
      return c.notFound();
    }

    const requestEtag = c.req.header('If-Match');
    if (!requestEtag) {
      return c.text('If-Match header must be set on PUT operations.', 400);
    }

    const configObject = await parseJsonBody<Record<string, unknown>>(c.req.raw);
    if (!configObject) {
      return c.text('POSTed JSON fails jsonschema validation, error: Invalid JSON body', 400);
    }

    const result = await configService.restfulPutConfig(restfulId, configObject, requestEtag, contextUrn);

    if (!result.existing) {
      return c.text(`${restfulId} does not exist`, 404);
    }

    if (result.err) {
      if (result.err === 412) {
        return c.text('If-Match header does not match', 412);
      }

      return c.text(`POSTed JSON fails jsonschema validation, error: ${result.err}`, 400);
    }

    return c.body(null, 204);
  });

  return app;
}
