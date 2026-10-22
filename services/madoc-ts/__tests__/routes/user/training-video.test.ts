/** @jest-environment node */
import { markTrainingVideoWatchedRoute } from '../../../src/routes/user/training-video';
import { NotFound } from '../../../src/utility/errors/not-found';
import { RequestError } from '../../../src/utility/errors/request-error';

function fixture(body: unknown = { projectId: 12 }, scope = ['site.view']) {
  const context = {
    state: { jwt: { user: { id: 7 }, site: { id: 3 }, scope } },
    requestBody: body,
    projects: { getProjectByIdOrSlug: jest.fn().mockResolvedValue({ id: 12 }) },
    siteManager: { markTrainingVideoWatched: jest.fn().mockResolvedValue({ '12': '2026-10-22T00:00:00Z' }) },
    response: { body: undefined },
  };
  const invoke = () =>
    markTrainingVideoWatchedRoute(
      context as unknown as Parameters<typeof markTrainingVideoWatchedRoute>[0],
      async () => undefined
    );
  return { context, invoke };
}

test('rejects an identity without site access before touching preferences', async () => {
  const { context, invoke } = fixture({ projectId: 12 }, ['models.view']);
  await expect(invoke()).rejects.toBeInstanceOf(NotFound);
  expect(context.siteManager.markTrainingVideoWatched).not.toHaveBeenCalled();
});

test('rejects missing and invalid project IDs even when body validation is skipped', async () => {
  for (const body of [
    null,
    {},
    { projectId: '12' },
    { projectId: 0 },
    { projectId: -1 },
    { projectId: 1.5 },
    { projectId: Number.MAX_SAFE_INTEGER + 1 },
  ]) {
    const { context, invoke } = fixture(body);
    await expect(invoke()).rejects.toBeInstanceOf(RequestError);
    expect(context.siteManager.markTrainingVideoWatched).not.toHaveBeenCalled();
  }
});

test('does not save preferences for an inaccessible project', async () => {
  const { context, invoke } = fixture();
  context.projects.getProjectByIdOrSlug.mockRejectedValue(new NotFound());
  await expect(invoke()).rejects.toBeInstanceOf(NotFound);
  expect(context.projects.getProjectByIdOrSlug).toHaveBeenCalledWith(12, 3, true);
  expect(context.siteManager.markTrainingVideoWatched).not.toHaveBeenCalled();
});

test('saves against the authenticated user and site, returning the persisted flags', async () => {
  const { context, invoke } = fixture();
  await invoke();
  expect(context.siteManager.markTrainingVideoWatched).toHaveBeenCalledWith(7, 3, 12);
  expect(context.response.body).toEqual({ watched: { '12': '2026-10-22T00:00:00Z' } });
});
