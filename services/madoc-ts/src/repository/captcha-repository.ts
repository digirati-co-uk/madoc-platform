import { DatabasePoolConnectionType, DatabaseTransactionConnectionType, sql } from 'slonik';
import { BaseRepository } from './base-repository';
import Cap, { ChallengeConfig, Solution, TokenConfig } from '@cap.js/server';

export class CaptchaRepository extends BaseRepository {
  constructor(
    connection: DatabasePoolConnectionType | DatabaseTransactionConnectionType,
    flags?: Record<string, boolean>
  ) {
    super(connection, flags);
  }

  private _cap: Cap | null = null;

  getCap(): Cap {
    if (this._cap === null) {
      this._cap = new Cap({
        storage: {
          challenges: {
            store: async (token, challengeData) => {
              await this.connection.query(
                sql`
                  INSERT INTO
                    captcha_challenges (token, data, expires)
                  VALUES (${token}, ${JSON.stringify(challengeData)}, ${challengeData.expires})
                  ON CONFLICT (token) DO
                    UPDATE SET data = ${JSON.stringify(challengeData)}, expires = ${challengeData.expires}
                `
              );
            },
            read: async token => {
              const row = await this.connection.maybeOne(
                sql<{ data: any; expires: number }>`
                  SELECT data, expires FROM captcha_challenges WHERE token = ${token} AND expires > ${Date.now()}
                `
              );

              return row ? { challenge: row.data, expires: row.expires } : null;
            },
            delete: async token => {
              await this.connection.query(
                sql`
                  DELETE FROM captcha_challenges WHERE token = ${token}
                `
              );
            },
            listExpired: async () => {
              const rows = await this.connection.any(
                sql<{ token: string }>`
                  SELECT token FROM captcha_challenges WHERE expires <= ${Date.now()}
                `
              );

              return rows.map(row => row.token);
            },
          },
          tokens: {
            store: async (tokenKey, expires) => {
              await this.connection.query(
                sql`
                  INSERT INTO captcha_tokens (key, expires) VALUES (${tokenKey}, ${expires})
                  ON CONFLICT (key) DO UPDATE SET expires = ${expires}
                `
              );
            },
            get: async tokenKey => {
              const row = await this.connection.maybeOne(
                sql<{ expires: number }>`
                  SELECT expires FROM captcha_tokens WHERE key = ${tokenKey} AND expires > ${Date.now()}
                `
              );

              return row ? row.expires : null;
            },
            delete: async tokenKey => {
              await this.connection.query(
                sql`
                  DELETE FROM captcha_tokens WHERE key = ${tokenKey}
                `
              );
            },
            listExpired: async () => {
              const rows = await this.connection.any(
                sql<{ key: string }>`
                  SELECT key FROM captcha_tokens WHERE expires <= ${Date.now()}
                `
              );

              return rows.map(row => row.key);
            },
          },
        },
      });
    }
    return this._cap;
  }

  createChallenge(conf?: ChallengeConfig) {
    return this.getCap().createChallenge(conf);
  }

  redeemChallenge(solution: Solution) {
    return this.getCap().redeemChallenge(solution);
  }

  validateToken(token: string, conf?: TokenConfig) {
    return this.getCap().validateToken(token, conf);
  }

  cleanup() {
    return this.getCap().cleanup();
  }
}
