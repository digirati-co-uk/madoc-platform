/** @jest-environment node */
import { getProjectRawData } from '../../src/routes/projects/get-project-raw-data';
import { CaptureModelRepository } from '../../src/capture-model-server/capture-model-repository';

jest.mock('../../src/utility/slonik-helpers', () => ({ upsert: jest.fn() }));

function createContext(manifestId?: unknown) {
  return {
    params: { id: '7' },
    query: { manifest_id: manifestId, entity: 'rows', status: 'approved' },
    state: { jwt: { user: { id: 1 }, site: { id: 5 }, scope: ['site.admin'] } },
    connection: { one: jest.fn(async () => ({ id: 7 })) },
    captureModels: { getModelFieldRevisionsByProject: jest.fn(async () => []) },
    response: {},
  };
}

test('forwards a validated manifest filter while retaining project/site scope', async () => {
  const context = createContext('2');
  await getProjectRawData(context as unknown as Parameters<typeof getProjectRawData>[0], jest.fn());
  expect(context.captureModels.getModelFieldRevisionsByProject).toHaveBeenCalledWith({
    projectId: 7,
    siteId: 5,
    manifestId: 2,
    entity: 'rows',
    status: 'approved',
  });
});

test.each(['', '0', '-1', '1.2', '2oops', '9007199254740992', ['2'], { id: 2 }])(
  'rejects an invalid manifest filter: %p',
  async manifestId => {
    const context = createContext(manifestId);
    await expect(
      getProjectRawData(context as unknown as Parameters<typeof getProjectRawData>[0], jest.fn())
    ).rejects.toThrow('Invalid manifest ID');
    expect(context.captureModels.getModelFieldRevisionsByProject).not.toHaveBeenCalled();
  }
);

test('preserves admin-only access', async () => {
  const context = createContext('2');
  context.state.jwt.scope = ['models.view'];
  await expect(
    getProjectRawData(context as unknown as Parameters<typeof getProjectRawData>[0], jest.fn())
  ).rejects.toThrow('Scope site.admin required.');
  expect(context.connection.one).not.toHaveBeenCalled();
});

test('filters model targets before expanding fields and preserves the unfiltered project query', () => {
  const scoped = CaptureModelRepository.queries.modelFieldRevisions({ siteId: 5, projectId: 7, manifestId: 2 });
  expect(scoped.sql).toContain('cm.target @>');
  expect(scoped.sql.indexOf('cm.target @>')).toBeLessThan(scoped.sql.indexOf('select entity.properties'));
  expect(scoped.values).toContain(JSON.stringify([{ id: 'urn:madoc:manifest:2' }]));
  expect(scoped.sql).toMatch(/p.id = \$\d+ and p.site_id = \$\d+/);
  const project = CaptureModelRepository.queries.modelFieldRevisions({ siteId: 5, projectId: 7 });
  expect(project.sql).not.toContain('cm.target @>');
  expect(project.sql).toContain('cmr.approved = true');
});
