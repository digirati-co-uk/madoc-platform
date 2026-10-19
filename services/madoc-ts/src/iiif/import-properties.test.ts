import { preserveIIIFProperties } from '../repository/iiif-annotations';
import { CommonQueryMethodsType, SqlSqlTokenType } from 'slonik';

test('an invalid embedded page is recorded as an error while other pages are preserved', async () => {
  const saved: Record<string, unknown>[] = [];
  let pageId = 0;
  const connection = {
    maybeOne: jest.fn(async (query: SqlSqlTokenType) => {
      if (query.sql.includes('insert into iiif_linking')) return {
        id: ++pageId, resource_id: 12, uri: `https://example.org/page/${pageId}`,
        properties: { mode: 'json', position: 0, generation: 0, status: 'pending' },
      };
      return { source: 'https://example.org/canvas', resource_type: 'canvas' };
    }),
    any: jest.fn().mockResolvedValue([]),
    query: jest.fn(async (query: SqlSqlTokenType) => {
      for (const value of query.values) {
        if (typeof value === 'string' && value.startsWith('{')) saved.push(JSON.parse(value));
      }
    }),
  };
  await preserveIIIFProperties(connection as unknown as CommonQueryMethodsType, 1, 12, {
    annotations: [
      { id: 'https://example.org/page/1', type: 'AnnotationPage', items: [{ type: 'Annotation' }] },
      { id: 'https://example.org/page/2', type: 'AnnotationPage', items: [] },
    ],
  });
  expect(pageId).toBe(2);
  expect(saved).toContainEqual(expect.objectContaining({ status: 'error', error: expect.stringContaining('target') }));
  expect(saved).toContainEqual(expect.objectContaining({ status: 'ready', document: expect.objectContaining({ items: [] }) }));
});
