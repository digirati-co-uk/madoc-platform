import { DatabasePoolConnectionType, DatabaseTransactionConnectionType, sql } from 'slonik';
import invariant from 'tiny-invariant';
import { v4 } from 'uuid';
import {
  TermConfiguration,
  TermConfigurationRequest,
  TermConfigurationRow,
  TermConfigurationRowUserJoin,
} from '../types/term-configurations';
import { BaseRepository } from './base-repository';

export class TermConfigurationsRepository extends BaseRepository {
  constructor(postgres: DatabasePoolConnectionType | DatabaseTransactionConnectionType) {
    super(postgres);
  }

  static queries = {
    listAllTermConfigurations: (site_id: number) => sql<TermConfigurationRow>`
      select * from term_configurations where site_id = ${site_id}
    `,
    getTermConfiguration: (id: string, site_id: number) => sql<TermConfigurationRow>`
      select t.*, u.name as creator_name from term_configurations t 
         join "user" u on t.creator = u.id
         where t.id = ${id} and site_id = ${site_id} limit 1
    `,
  };

  static mutations = {
    createTermConfiguration: (term: TermConfigurationRequest, user_id: number, site_id: number) => sql<
      TermConfigurationRow
    >`
      insert into term_configurations
        (
         id, url_pattern, results_path, label_path, uri_path, resource_class_path,
         description_path, language_path,
         term_label, term_description, attribution, site_id, creator, created_at
        ) values (
          ${v4()}, 
          ${term.url_pattern}, 
          ${term.paths.results}, 
          ${term.paths.label}, 
          ${term.paths.uri}, 
          ${term.paths.resource_class || null}, 
          ${term.paths.description || null}, 
          ${term.paths.language || null}, 
          ${term.label}, 
          ${term.description || null}, 
          ${term.attribution || null}, 
          ${site_id}, 
          ${user_id}, 
          now()
      ) returning *
    `,

    updateTermConfiguration: (term: TermConfigurationRequest & { id: string }, site_id: number) => sql<
      TermConfigurationRow
    >`
       update term_configurations set
          url_pattern = ${term.url_pattern},
          results_path = ${term.paths.results},
          label_path = ${term.paths.label},
          uri_path = ${term.paths.uri},
          resource_class_path = ${term.paths.resource_class || null},
          description_path = ${term.paths.description || null},
          language_path = ${term.paths.language || null},
          term_label = ${term.label},
          term_description = ${term.description || null},
          attribution = ${term.attribution || null}
        where id = ${term.id} and site_id = ${site_id} returning *
    `,

    deleteTermConfiguration: (id: string, site_id: number) => sql<TermConfigurationRow>`
      delete from term_configurations where id = ${id} and site_id = ${site_id}
    `,
  };

  async createTermConfiguration(term: TermConfigurationRequest, user_id: number, site_id: number) {
    invariant(user_id, 'User id must be provided');
    invariant(site_id, 'Site id must be provided');

    const result = await this.connection.one(
      TermConfigurationsRepository.mutations.createTermConfiguration(term, user_id, site_id)
    );
    return TermConfigurationsRepository.mapRow(result);
  }

  async updateTermConfiguration(term: TermConfigurationRequest & { id: string }, site_id: number) {
    invariant(term.id, 'Term id must be provided');
    invariant(site_id, 'Site id must be provided');

    const result = await this.connection.one(
      TermConfigurationsRepository.mutations.updateTermConfiguration(term, site_id)
    );
    return TermConfigurationsRepository.mapRow(result);
  }

  async deleteTermConfiguration(id: string, site_id: number) {
    invariant(id, 'Term id must be provided');
    invariant(site_id, 'Site id must be provided');

    await this.connection.query(TermConfigurationsRepository.mutations.deleteTermConfiguration(id, site_id));
  }

  async listAllTermConfigurations(site_id: number) {
    invariant(site_id, 'Site id must be provided');

    const result = await this.connection.any(TermConfigurationsRepository.queries.listAllTermConfigurations(site_id));
    return result.map(TermConfigurationsRepository.mapRow);
  }

  async getTermConfiguration(id: string, site_id: number) {
    invariant(id, 'Term id must be provided');
    invariant(site_id, 'Site id must be provided');

    const result = await this.connection.maybeOne(
      TermConfigurationsRepository.queries.getTermConfiguration(id, site_id)
    );
    return result ? TermConfigurationsRepository.mapRow(result) : undefined;
  }

  static mapRow(row: TermConfigurationRow | TermConfigurationRowUserJoin): TermConfiguration {
    return {
      id: row.id,
      url_pattern: row.url_pattern,
      paths: {
        results: row.results_path,
        label: row.label_path,
        uri: row.uri_path,
        description: row.description_path,
        language: row.language_path,
        resource_class: row.resource_class_path,
      },
      label: row.term_label,
      description: row.term_description,
      attribution: row.attribution,
      created_at: new Date(row.created_at),
      creator: {
        id: row.creator,
        name: (row as TermConfigurationRowUserJoin).creator_name,
      },
    };
  }
}
