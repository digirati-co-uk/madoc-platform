import { BaseRepository } from './base-repository';
import { sql } from 'slonik';
import { NotAuthorized } from '../utility/errors/not-authorized';
import { compare } from 'bcrypt';

export type ApiKeyRequest = {
  label: string;
  clientId: string;
  clientSecret: string;
  userId: number;
  userName: string;
  scope: string[];
};

export type ApiKeyRow = {
  label: string;
  user_id: number;
  user_name: string;
  client_id: string;
  scope: string[];
  last_used: string | null;
  created_at: string;
};

export type ApiAuthenticationRequest = {
  client_id: string;
  client_secret: string;
};

export class ApiKeyRepository extends BaseRepository {
  static queries = {
    getSecretApiKeyByClientId: (clientId: string) => sql<
      ApiKeyRow & {
        id: number;
        client_secret: string;
        password_attempts: number;
        site_id: number;
      }
    >`
      select * from api_key
      where client_id = ${clientId};
    `,

    listApiKeys: (siteId: number) => sql<{
      label: string;
      user_id: number;
      user_name: string;
      client_id: string;
      scope: string[];
      last_used: string | null;
      created_at: string;
    }>`
      select 
         label, 
         u.name as user_name, 
         user_id,
         client_id,
         scope,
         last_used,
         created_at
      from api_key
          left join "user" u on u.id = api_key.user_id
          where site_id = ${siteId}
    `,
  };

  static inserts = {
    createApiKey: (req: ApiKeyRequest, siteId: number) => sql`
      insert into api_key (label, client_id, client_secret, user_id, user_name, password_attempts, site_id, scope)
      values (
        ${req.label}, 
        ${req.clientId}, 
        ${req.clientSecret}, 
        ${req.userId}, 
        ${req.userName}, 
        0, 
        ${siteId}, 
        ${sql.array(req.scope, 'text')}
      );
    `,
  };

  static updates = {
    deleteApiKey: (clientId: string, siteId: number) => sql`
      delete from api_key 
        where client_id = ${clientId}
        and site_id = ${siteId}
    `,

    setPasswordAttempts: (id: number, attempts: number) => sql`
      update api_key
      set password_attempts = ${attempts}
      where id = ${id}
    `,

    resetPasswordAttempts: (id: number) => sql`
      update api_key
      set password_attempts = 0, last_used = CURRENT_TIMESTAMP
      where id = ${id}
    `,
  };

  async listApiKeys(siteId: number) {
    return this.connection.any(ApiKeyRepository.queries.listApiKeys(siteId));
  }

  async createApiKey(req: ApiKeyRequest, siteId: number) {
    await this.connection.query(ApiKeyRepository.inserts.createApiKey(req, siteId));
  }

  async deleteApiKey(clientId: string, siteId: number) {
    await this.connection.query(ApiKeyRepository.updates.deleteApiKey(clientId, siteId));
  }

  async validateApiKey(authenticationRequest: ApiAuthenticationRequest) {
    const stored = await this.connection.maybeOne(
      ApiKeyRepository.queries.getSecretApiKeyByClientId(authenticationRequest.client_id)
    );

    if (!stored || !stored.site_id || !stored.client_secret || !stored.user_id) {
      console.log('Unable to find API key with client ID ' + authenticationRequest.client_id);
      throw new NotAuthorized();
    }

    if (stored.password_attempts >= 3) {
      console.log('API key with client ID ' + authenticationRequest.client_id + ' has too many failed login attempts');
      throw new NotAuthorized();
    }

    const secretMatches = await compare(authenticationRequest.client_secret, stored.client_secret);
    if (!secretMatches) {
      await this.connection.query(
        ApiKeyRepository.updates.setPasswordAttempts(stored.id, stored.password_attempts + 1)
      );

      console.log('Incorrect secret for API key with client ID ' + authenticationRequest.client_id);
      throw new NotAuthorized();
    }

    await this.connection.query(ApiKeyRepository.updates.resetPasswordAttempts(stored.id));

    return stored;
  }
}
