import Ajv from 'ajv';
import schema from '../../schemas/ProjectUpdateRequest.json';

const ajv = new Ajv();
ajv.addSchema(schema, 'ProjectUpdateRequest');

test('project update request accepts an optional title and requires the update body', () => {
  expect(ajv.validate('ProjectUpdateRequest', { title: 'Launch', update: '**Ready**' })).toBe(true);
  expect(ajv.validate('ProjectUpdateRequest', { update: '**Ready**' })).toBe(true);
  expect(ajv.validate('ProjectUpdateRequest', { title: 'Launch' })).toBe(false);
  expect(ajv.validate('ProjectUpdateRequest', { update: '', unexpected: true })).toBe(false);
});
