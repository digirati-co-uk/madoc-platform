import { DatabasePoolConnectionType, NotFoundError } from 'slonik';
import { SiteUserRepository } from '../../src/repository/site-user-repository';

jest.mock('../../src/utility/parse-jwt', () => ({ parseJWT: jest.fn() }));
jest.mock('../../src/utility/verify-signed-token', () => ({ verifySignedToken: jest.fn() }));
jest.mock('../../src/utility/php-hash-compare', () => ({ phpHashCompare: jest.fn() }));
jest.mock('../../src/utility/php-password-hash', () => ({ passwordHash: jest.fn() }));
jest.mock('../../src/utility/slonik-helpers', () => ({ sqlDate: jest.fn(), upsert: jest.fn() }));

const jwt = { user: { id: 1, name: 'User', service: false }, scope: ['site.view'] };

test('database failures do not turn an authenticated request into an anonymous user', async () => {
  const error = new Error('Database unavailable');
  const connection = { one: jest.fn().mockRejectedValue(error) };
  const repository = new SiteUserRepository(connection as unknown as DatabasePoolConnectionType);
  await expect(repository.getUserFromJwt(1, jwt)).rejects.toBe(error);
  expect(connection.one).toHaveBeenCalledTimes(1);
});

test('an authenticated token for a missing user still resolves anonymously', async () => {
  const connection = { one: jest.fn().mockRejectedValue(new NotFoundError()) };
  const repository = new SiteUserRepository(connection as unknown as DatabasePoolConnectionType);
  await expect(repository.getUserFromJwt(1, jwt)).resolves.toBeUndefined();
});
