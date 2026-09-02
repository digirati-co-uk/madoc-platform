import cache from 'memory-cache';
import { cachePromiseSWR } from '../../src/utility/cache-helper';

afterEach(() => cache.clear());

test('shares cold loads and serves stale values without waiting for refresh', async () => {
  let finishColdLoad: (value: { version: number }) => void = () => undefined;
  const coldGetter = jest.fn(
    () =>
      new Promise<{ version: number }>(resolve => {
        finishColdLoad = resolve;
      })
  );

  const first = cachePromiseSWR('locale', coldGetter, 1000);
  const second = cachePromiseSWR('locale', coldGetter, 1000);
  expect(coldGetter).toHaveBeenCalledTimes(1);

  finishColdLoad({ version: 1 });
  await expect(Promise.all([first, second])).resolves.toEqual([{ version: 1 }, { version: 1 }]);

  cache.del('locale');
  let finishRefresh: (value: { version: number }) => void = () => undefined;
  const refreshGetter = jest.fn(
    () =>
      new Promise<{ version: number }>(resolve => {
        finishRefresh = resolve;
      })
  );

  await expect(cachePromiseSWR('locale', refreshGetter, 1000)).resolves.toEqual({ version: 1 });
  await expect(cachePromiseSWR('locale', refreshGetter, 1000)).resolves.toEqual({ version: 1 });
  expect(refreshGetter).toHaveBeenCalledTimes(1);

  finishRefresh({ version: 2 });
  await Promise.resolve();
  await Promise.resolve();
  await expect(cachePromiseSWR('locale', refreshGetter, 1000)).resolves.toEqual({ version: 2 });
});
