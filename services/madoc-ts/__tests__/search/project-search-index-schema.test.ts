import Ajv from 'ajv';
import schema from '../../schemas/ProjectSearchIndexRequest.json';

test('project search index request schema includes its facet definition', () => {
  const ajv = new Ajv();
  ajv.addSchema(schema, 'ProjectSearchIndexRequest');

  expect(
    ajv.validate('ProjectSearchIndexRequest', {
      label: 'People',
      entityPath: ['people'],
      facets: [{ label: 'Role', path: ['role'] }],
    })
  ).toBe(true);
});
