import { DatabaseTransactionConnectionType, sql } from 'slonik';
import invariant from 'tiny-invariant';
import { createRevisionRequestFromStructure } from '../frontend/shared/capture-models/helpers/create-revision-request';
import { findStructure } from '../frontend/shared/capture-models/helpers/find-structure';
import { forkExistingRevision } from '../frontend/shared/capture-models/helpers/fork-existing-revision';
import { generateId } from '../frontend/shared/capture-models/helpers/generate-id';
import { traverseDocument } from '../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel, Contributor, Revision, Target } from '../frontend/shared/capture-models/types/capture-model';
import { RevisionRequest } from '../frontend/shared/capture-models/types/revision-request';
import {
  CaptureModelDocumentRow,
  CaptureModelRevisionRow,
  CaptureModelRow,
  CaptureModelSnippetRow,
  CaptureModelStructureRow,
} from '../types/capture-model-db';
import { CaptureModelSnippet } from '../types/schemas/capture-model-snippet';
import { NotFound } from '../utility/errors/not-found';
import { parseProjectId } from '../utility/parse-project-id';
import { parseUrn } from '../utility/parse-urn';
import { upsert } from '../utility/slonik-helpers';
import { BaseRepository } from '../repository/base-repository';
import { cloneModel } from './server-filters/clone-model';
import { filterModelGetOptions } from './server-filters/filter-model-get-options';
import { updateRevisionInDocument } from './server-filters/update-revision-in-document';
import { CaptureModelGetOptions } from './types';

export class CaptureModelRepository extends BaseRepository<'capture_model_api_migrated'> {
  static queries = {
    getCaptureModelByProjectId: (idOrSlug: string | number, site_id: number) => {
      const { projectSlug, projectId } = parseProjectId(idOrSlug);

      const query =
        typeof projectSlug !== 'undefined'
          ? sql`ip.slug = ${projectSlug}`
          : projectId
          ? sql`ip.id = ${projectId}`
          : null;

      invariant(query, 'Invalid project id');

      return sql<CaptureModelRow>`
          select model.*, cms.structure_data as structure_data, cmd.document_data as document_data
          from capture_model model
          
          left join capture_model_structure cms on cms.id = model.structure_id and cms.site_id = ${site_id}
          left join capture_model_document cmd on model.document_id = cmd.id and cmd.site_id = ${site_id}
          left join iiif_project ip on model.id = ip.capture_model_id
  
          where ${query}
            and model.site_id = ${site_id}
      `;
    },

    captureModelExists: (id: string, site_id: number) => sql<{ id: string }>`
      select model.id from capture_model model where id = ${id} and site_id = ${site_id}
    `,

    getCaptureModelById: (id: string, site_id: number) => sql<CaptureModelRow>`
        select model.*, cms.structure_data as structure_data, cmd.document_data as document_data
        from capture_model model
        
        left join capture_model_structure cms on cms.id = model.structure_id and cms.site_id = ${site_id}
        left join capture_model_document cmd on model.document_id = cmd.id and cmd.site_id = ${site_id}

        where model.id = ${id}
          and model.site_id = ${site_id}
    `,

    getDocumentById: (id: string, site_id: number) => sql<CaptureModelDocumentRow>`
        select *
        from capture_model_document
        where id = ${id}
          and site_id = ${site_id}
    `,

    listDocuments: (
      { perPage = 25, page = 1, all }: { page?: number; perPage?: number; all?: boolean },
      site_id: number
    ) => {
      const offset = (page - 1) * perPage;
      const paging = all ? sql`` : sql`limit ${perPage} offset ${offset}`;

      return sql<CaptureModelDocumentRow>`
          select *
          from capture_model_document
          where site_id = ${site_id}
          ${paging}
      `;
    },

    listStructures: (
      { perPage = 25, page = 1, all }: { page?: number; perPage?: number; all?: boolean },
      site_id: number
    ) => {
      const offset = (page - 1) * perPage;
      const paging = all ? sql`` : sql`limit ${perPage} offset ${offset}`;

      return sql<CaptureModelStructureRow>`
          select *
          from capture_model_structure
          where site_id = ${site_id}
          ${paging}
      `;
    },

    getStructureById: (id: string, site_id: number) => sql<CaptureModelStructureRow>`
        select *
        from capture_model_structure
        where id = ${id}
          and site_id = ${site_id}
    `,

    getRevisionById: (id: string, site_id: number) => sql<CaptureModelRevisionRow>`
        select r.*, u.name as author_name
        from capture_model_revision r
                 left join "user" u on u.id = r.author_id
        where r.id = ${id}
          and r.site_id = ${site_id}
    `,

    getModelRevisions: (model_id: string, site_id: number) => sql<CaptureModelRevisionRow>`
        select r.*, u.name as author_name
        from capture_model_revision r
                 left join capture_model cm on cm.id = r.capture_model_id
                 left join "user" u on u.id = r.author_id
        where cm.id = ${model_id}
          and r.site_id = ${site_id}
    `,

    listAllCaptureModels(
      {
        perPage = 24,
        page = 1,
        allDerivatives,
        derivedFrom,
        all,
        target,
      }: {
        page?: number;
        perPage?: number;
        allDerivatives?: boolean;
        derivedFrom?: string;
        all?: boolean;
        target?: string;
      },
      site_id: number
    ) {
      const offset = (page - 1) * perPage;
      const paging = all ? sql`` : sql`limit ${perPage} offset ${offset}`;
      const derivedQuery = derivedFrom
        ? sql`and derived_from = ${derivedFrom}`
        : allDerivatives
        ? sql``
        : sql`and derived_from is null`;

      const targetQuery = target
        ? sql`
        and jsonb_path_query_first(cm.target::jsonb, '$[*] ? (@.id == $target)', ${sql.json({
          target,
        })}::jsonb) is not null`
        : sql``;

      return sql<CaptureModelSnippetRow>`
          select cm.id,
                 cm.derived_from,
                 cm.created_at,
                 cm.updated_at,
                 cm.site_id,
                 cms.structure_label as label
          from capture_model cm
            left join capture_model_structure cms on cm.structure_id = cms.id
            where cm.site_id = ${site_id}
            ${derivedQuery}
            ${targetQuery}
          ${paging}
      `;
    },

    listAllRevisions(
      {
        perPage = 24,
        page = 1,
        all,
      }: {
        page?: number;
        perPage?: number;
        all?: boolean;
      },
      site_id: number
    ) {
      const offset = (page - 1) * perPage;
      const paging = all ? sql`` : sql`limit ${perPage} offset ${offset}`;

      return sql<CaptureModelRevisionRow>`
          select r.*, u.name as author_name
          from capture_model_revision r
                   left join capture_model cm on cm.id = r.capture_model_id
                   left join "user" u on u.id = r.author_id
          where r.site_id = ${site_id}
          ${paging}
      `;
    },
  };
  static mutations = {
    createDocument: (doc: CaptureModel['document'], site_id: number, target?: CaptureModel['target']) => {
      invariant(site_id, 'Site id is required');
      invariant(doc, 'Model document is required');
      invariant(doc.id, 'Capture model document must have an id');

      return sql<CaptureModelDocumentRow>`
        insert into capture_model_document (id, document_data, search_strings, target, site_id)
        values (
          ${doc.id},
          ${sql.json(doc as any)},
          ${CaptureModelRepository.extractDocumentSearchStrings(doc)},
          ${target ? sql.json(target) : null},
          ${site_id}
        )
        returning *
      `;
    },

    upsertDocument: (doc: CaptureModel['document'], site_id: number, target?: CaptureModel['target']) =>
      upsert<Partial<CaptureModelDocumentRow>, CaptureModelDocumentRow>(
        'capture_model_document',
        ['id'],
        [
          {
            id: doc.id,
            document_data: doc,
            site_id: site_id,
            target: target,
            search_strings: CaptureModelRepository.extractDocumentSearchStrings(doc),
          },
        ],
        ['id', 'document_data', 'site_id', 'target', 'search_strings'],
        { jsonKeys: ['document_data', 'target'] }
      ),

    upsertStructure: (structure: CaptureModel['structure'], site_id: number) =>
      upsert<Partial<CaptureModelStructureRow>, CaptureModelStructureRow>(
        'capture_model_structure',
        ['id'],
        [
          {
            id: structure.id,
            structure_data: structure,
            structure_label: structure.label,
            site_id: site_id,
          },
        ],
        ['id', 'structure_data', 'structure_label', 'site_id'],
        { jsonKeys: ['structure_data'] }
      ),

    updateDocument: (doc: CaptureModel['document'], site_id: number, search_strings?: boolean) => {
      invariant(site_id, 'Site id is required');
      invariant(doc, 'Model document is required');
      invariant(doc.id, 'Capture model document must have an id');

      const setSearchStrings = search_strings
        ? sql`search_strings = ${CaptureModelRepository.extractDocumentSearchStrings(doc)},`
        : sql``;

      return sql<CaptureModelDocumentRow>`
        update capture_model_document
          set
            ${setSearchStrings}  
            document_data = ${sql.json(doc as any)}
          where site_id = ${site_id} and id = ${doc.id} 
          returning *;
      `;
    },

    deleteDocument: (doc: string | CaptureModel['document'], site_id: number) => {
      const id = typeof doc === 'string' ? doc : doc.id;
      invariant(id, 'Invalid document ID');

      return sql`
          delete
          from capture_model_document
          where id = ${id}
            and site_id = ${site_id}
      `;
    },

    deleteCaptureModel: (doc: string | CaptureModel, site_id: number) => {
      const id = typeof doc === 'string' ? doc : doc.id;
      invariant(id, 'Invalid model ID');

      return sql`
          delete
          from capture_model
          where id = ${id}
            and site_id = ${site_id}
      `;
    },

    createStructure: (structure: CaptureModel['structure'], site_id: number) => {
      invariant(structure.id, 'Invalid structure');
      invariant(site_id, 'Site id is required');

      return sql<CaptureModelStructureRow>`
          insert into capture_model_structure (id, structure_data, structure_label, site_id)
          values (${structure.id},
                  ${sql.json(structure)},
                  ${structure.label || ''},
                  ${site_id})
          returning *
      `;
    },

    updateStructure: (structure: CaptureModel['structure'], site_id: number) => {
      invariant(site_id, 'Site id is required');
      invariant(structure, 'Model structure is required');
      invariant(structure.id, 'Capture model structure must have an id');

      return sql<CaptureModelStructureRow>`
        update capture_model_structure
          set structure_data = ${sql.json(structure as any)},
              structure_label = ${structure.label || ''}
          where site_id = ${site_id} and id = ${structure.id} 
          returning *;
      `;
    },

    deleteStructure: (structure: string | CaptureModel['structure'], site_id: number) => {
      const id = typeof structure === 'string' ? structure : structure.id;
      invariant(id, 'Invalid structure ID');

      return sql`
          delete
          from capture_model_structure
          where id = ${id}
            and site_id = ${site_id}
      `;
    },

    createRevision: (
      revision: Revision,
      document_id: string,
      site_id: number,
      user_id?: number,
      capture_model_id?: string
    ) => {
      const { id, revises, approved: _, status, label, ...revisionData } = revision;
      const approved = (status || '').toLowerCase() === 'accepted';

      return sql<CaptureModelStructureRow>`
          insert into capture_model_revision (id, document_id, capture_model_id, revision_label, status, approved, revises, revision_data, site_id, author_id)
          values (
            ${id},
            ${document_id},
            ${capture_model_id || null},
            ${label || null},
            ${status || 'draft'},
            ${approved},
            ${revises || null},
            ${sql.json(revisionData as any)},
            ${site_id},
            ${user_id || null}
          )
          on conflict (id)
              do update set status         = ${status || 'draft'},
                            revision_label = ${label || null},
                            approved       = ${approved}
          returning *
      `;
    },

    updateRevisionStatus: (revision: Revision | string, newStatus: Revision['status'], site_id: number) => {
      const id = typeof revision === 'string' ? revision : revision.id;

      invariant(id, 'Invalid revision');
      invariant(newStatus, 'No status');

      const approved = newStatus.toLowerCase() === 'accepted';

      return sql<CaptureModelRevisionRow>`
        update capture_model_revision
          set approved = ${approved},
              status = ${newStatus}
          where site_id = ${site_id} and id = ${id} 
          returning *;
      `;
    },

    updateRevisionDeletedFields: (
      revision: Revision | string,
      deletedFields: Revision['deletedFields'],
      site_id: number
    ) => {
      const id = typeof revision === 'string' ? revision : revision.id;

      invariant(id, 'Invalid revision');

      return sql<CaptureModelRevisionRow>`
        update capture_model_revision
          set deleted_fields = ${sql.json(deletedFields || [])}
          where site_id = ${site_id} and id = ${id} 
          returning *;
      `;
    },

    deleteRevision: (revision: string | Revision, site_id: number) => {
      const id = typeof revision === 'string' ? revision : revision.id;
      invariant(id, 'Invalid revision ID');

      return sql`
          delete
          from capture_model_revision
          where id = ${id}
            and site_id = ${site_id}
      `;
    },

    createCaptureModel: (captureModel: CaptureModel, site_id: number) => {
      invariant(captureModel.id, 'Capture model must have an ID');
      invariant(site_id, 'Site id is required');

      return sql`
        insert into capture_model (id, derived_from, profile, target, integrity, site_id, document_id, structure_id)
        values (
          ${captureModel.id},
          ${captureModel.derivedFrom || null},
          ${captureModel.profile || null},
          ${captureModel.target ? sql.json(captureModel.target) : null},
          ${captureModel.integrity ? sql.json(captureModel.integrity) : null},
          ${site_id},
          ${captureModel.document.id},
          ${captureModel.structure.id}
        )
        -- We will ignore invalid derived from calls, as these could be cross-site or cross-madoc.
        -- on conflict on constraint capture_model_derived_from_fk do update set derived_from = null;
      `;
    },

    updateCaptureModel: (captureModel: CaptureModel, site_id: number) => {
      invariant(captureModel.id, 'Capture model must have an ID');
      invariant(site_id, 'Site id is required');

      return sql`
        update capture_model set
          profile = ${captureModel.profile || null},
          integrity = ${captureModel.integrity ? sql.json(captureModel.integrity) : null},
          document_id = ${captureModel.document.id},
          structure_id = ${captureModel.structure.id}
        where id = ${captureModel.id} and site_id = ${site_id}
      `;
    },
  };

  static getUserFromRevision(revision: Revision): number | undefined {
    const author = parseUrn(revision.authors ? revision.authors[0] || '' : '');
    return author && author.type === 'user' ? author.id : undefined;
  }

  static parseDocumentRow(row: CaptureModelDocumentRow | CaptureModelRow): CaptureModel['document'] {
    return row.document_data;
  }

  static parseStructureRow(row: CaptureModelStructureRow | CaptureModelRow): CaptureModel['structure'] {
    return row.structure_data;
  }

  static parseRevisionRow(row: CaptureModelRevisionRow): [Revision, Record<string, Contributor>] {
    const contributors: Record<string, Contributor> = {};

    if (row.author_id) {
      contributors[`urn:madoc:user:${row.author_id}`] = {
        id: `urn:madoc:user:${row.author_id}`,
        type: 'Person',
        name: row.author_name,
      };
    }

    return [
      {
        ...(row.revision_data || {}),
        id: row.id,
        revises: row.revises,
        approved: row.approved,
        status: row.status,
        authors: row.author_id ? [`urn:madoc:user:${row.author_id}`] : row.revision_data.authors,
        label: row.revision_label,
        deletedFields: row.deleted_fields && row.deleted_fields.length ? row.deleted_fields : undefined,
        captureModelId: row.capture_model_id,
      } as Revision,
      contributors,
    ];
  }

  static parseCaptureModelSnippetRow(row: CaptureModelSnippetRow): CaptureModelSnippet {
    return {
      id: row.id,
      label: row.label,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      derivedFrom: row.derived_from || undefined,
    };
  }

  static parseCaptureModelRow(
    row: CaptureModelRow,
    revision_rows: readonly CaptureModelRevisionRow[] = []
  ): CaptureModel {
    const [revisions, contributors] = revision_rows.reduce(
      ([revs, allContributors], currentValue) => {
        const [a, b] = CaptureModelRepository.parseRevisionRow(currentValue);
        return [
          { ...revs, [a.id]: a },
          { ...allContributors, ...b },
        ];
      },
      [{}, {}] as [Record<string, Revision>, Record<string, Contributor>]
    );
    const document = CaptureModelRepository.parseDocumentRow(row);
    const structure = CaptureModelRepository.parseStructureRow(row);

    return {
      id: row.id,
      structure,
      document,
      revisions: Object.values(revisions),
      derivedFrom: row.derived_from || undefined,
      integrity: row.integrity || undefined,
      profile: row.profile || undefined,
      target: row.target || undefined,
      contributors,
    };
  }

  static extractDocumentSearchStrings(doc: CaptureModel['document']) {
    // Not currently implemented.
    return '';
  }

  // Atomic APIs.
  async createDocument(
    doc: CaptureModel['document'],
    siteId: number,
    target?: CaptureModel['target']
  ): Promise<CaptureModel['document']> {
    return CaptureModelRepository.parseDocumentRow(
      await this.connection.one(CaptureModelRepository.mutations.createDocument(doc, siteId, target))
    );
  }

  async deleteDocument(doc: CaptureModel['document'] | string, siteId: number) {
    await this.connection.query(CaptureModelRepository.mutations.deleteDocument(doc, siteId));
  }

  async updateDocument(doc: CaptureModel['document'], siteId: number) {
    return CaptureModelRepository.parseDocumentRow(
      await this.connection.one(CaptureModelRepository.mutations.updateDocument(doc, siteId))
    );
  }

  async getDocumentById(id: string, siteId: number) {
    return CaptureModelRepository.parseDocumentRow(
      await this.connection.one(CaptureModelRepository.queries.getDocumentById(id, siteId))
    );
  }

  async getAllDocuments(
    options: { page?: number; perPage?: number; all?: boolean },
    siteId: number
  ): Promise<CaptureModel['document'][]> {
    return (await this.connection.any(CaptureModelRepository.queries.listDocuments(options, siteId))).map(
      CaptureModelRepository.parseDocumentRow
    );
  }

  async createStructure(structure: CaptureModel['structure'], siteId: number) {
    return CaptureModelRepository.parseStructureRow(
      await this.connection.one(CaptureModelRepository.mutations.createStructure(structure, siteId))
    );
  }

  async deleteStructure(structure: CaptureModel['structure'] | string, siteId: number) {
    await this.connection.query(CaptureModelRepository.mutations.deleteStructure(structure, siteId));
  }

  async updateStructure(structure: CaptureModel['structure'], siteId: number) {
    return CaptureModelRepository.parseStructureRow(
      await this.connection.one(CaptureModelRepository.mutations.updateStructure(structure, siteId))
    );
  }

  async getStructureById(id: string, siteId: number) {
    return CaptureModelRepository.parseStructureRow(
      await this.connection.one(CaptureModelRepository.queries.getStructureById(id, siteId))
    );
  }

  async getAllStructures(
    options: { page?: number; perPage?: number; all?: boolean },
    siteId: number
  ): Promise<CaptureModel['structure'][]> {
    return (await this.connection.any(CaptureModelRepository.queries.listStructures(options, siteId))).map(
      CaptureModelRepository.parseStructureRow
    );
  }

  async listCaptureModels(
    options: {
      page?: number;
      perPage?: number;
      allDerivatives?: boolean;
      derivedFrom?: string;
      all?: boolean;
      target?: string;
    },
    siteId: number
  ): Promise<CaptureModelSnippet[]> {
    return (await this.connection.any(CaptureModelRepository.queries.listAllCaptureModels(options, siteId))).map(
      CaptureModelRepository.parseCaptureModelSnippetRow
    );
  }

  async getCaptureModel(
    id: string,
    options: CaptureModelGetOptions,
    siteId: number,
    transaction?: DatabaseTransactionConnectionType
  ) {
    const [model, revisions] = await Promise.all([
      (transaction || this.connection).one(CaptureModelRepository.queries.getCaptureModelById(id, siteId)),
      (transaction || this.connection).any(CaptureModelRepository.queries.getModelRevisions(id, siteId)),
    ]);
    const fullModel = CaptureModelRepository.parseCaptureModelRow(model, revisions);
    if (options.fullModel) {
      return fullModel;
    }

    return filterModelGetOptions(fullModel, options);
  }

  async captureModelExists(id: string, siteId: number): Promise<boolean> {
    try {
      const model = await this.connection.maybeOne(CaptureModelRepository.queries.captureModelExists(id, siteId));
      return !!model;
    } catch (e) {
      return false;
    }
  }

  async createCaptureModel(model: CaptureModel, siteId: number): Promise<CaptureModel> {
    // Create new capture model if it doesn't exist
    await this.connection.transaction(async q => {
      await q.query(CaptureModelRepository.mutations.upsertDocument(model.document, siteId));
      await q.query(CaptureModelRepository.mutations.upsertStructure(model.structure, siteId));
      await q.query(CaptureModelRepository.mutations.createCaptureModel(model, siteId));
      if (model.revisions) {
        for (const revision of model.revisions) {
          const userId = CaptureModelRepository.getUserFromRevision(revision);
          await q.query(
            CaptureModelRepository.mutations.createRevision(revision, model.document.id, siteId, userId, model.id)
          );
        }
      }
    });

    return model;
  }

  async updateCaptureModel(
    model: CaptureModel,
    siteId: number,
    transaction?: DatabaseTransactionConnectionType
  ): Promise<CaptureModel> {
    const transactionCallback = async (q: DatabaseTransactionConnectionType) => {
      await q.query(CaptureModelRepository.mutations.upsertDocument(model.document, siteId));
      await q.query(CaptureModelRepository.mutations.upsertStructure(model.structure, siteId));
      await q.query(CaptureModelRepository.mutations.updateCaptureModel(model, siteId));
      if (model.revisions) {
        for (const revision of model.revisions) {
          const userId = CaptureModelRepository.getUserFromRevision(revision);
          await q.query(
            CaptureModelRepository.mutations.createRevision(revision, model.document.id, siteId, userId, model.id)
          );
        }
      }
    };

    if (transaction) {
      await transactionCallback(transaction);

      return model;
    }

    // Update whole model
    await this.connection.transaction(transactionCallback);

    return model;
  }

  async deleteCaptureModel(model: CaptureModel | string, siteId: number): Promise<void> {
    // Delete whole capture model
    await this.connection.query(CaptureModelRepository.mutations.deleteCaptureModel(model, siteId));
  }

  async updateRevisionFields(revision: Revision, siteId: number, transaction?: DatabaseTransactionConnectionType) {
    await (transaction || this.connection).query(
      CaptureModelRepository.mutations.updateRevisionStatus(revision, revision.status, siteId)
    );
    await (transaction || this.connection).query(
      CaptureModelRepository.mutations.updateRevisionDeletedFields(revision, revision.deletedFields, siteId)
    );
  }

  async deleteRevision(revision: string | Revision, siteId: number) {
    await this.connection.query(CaptureModelRepository.mutations.deleteRevision(revision, siteId));
  }

  async getRevisionRow(id: string, siteId: number) {
    return CaptureModelRepository.parseRevisionRow(
      await this.connection.one(CaptureModelRepository.queries.getRevisionById(id, siteId))
    );
  }

  async getRevision(
    revOrId: string | Revision,
    siteId: number,
    { showRevised, userId }: { userId?: number; showRevised?: boolean } = {}
  ) {
    const id = typeof revOrId === 'string' ? revOrId : revOrId.id;
    const [revision] = await this.getRevisionRow(id, siteId);

    invariant(revision.captureModelId, 'Invalid revision');

    const fullModel = await this.getCaptureModel(
      revision.captureModelId,
      {
        revisionId: id,
        onlyRevisionFields: !showRevised,
        userId,
      },
      siteId
    );

    return {
      captureModelId: revision.captureModelId,
      source: revision.source,
      document: fullModel.document,
      revision,
    };
  }

  async cloneCaptureModel(
    idOrModel: CaptureModel | string,
    siteId: number,
    options: {
      target: Target[];
      beforeSave?: (model: CaptureModel) => CaptureModel;
      beforeClone?: (model: CaptureModel) => CaptureModel;
    }
  ) {
    const id = typeof idOrModel === 'string' ? idOrModel : idOrModel.id;

    invariant(id, 'Invalid model id');

    let model = await this.getCaptureModel(id, { revisionStatus: 'approved' }, siteId);

    if (options.beforeClone) {
      model = options.beforeClone(model);
    }

    model = cloneModel(model, { target: options.target });
    // This might be able to check if a field exists at a target, but that is for the
    // application calling to decide. It's valid in here to have 2 capture models that are
    // derived form the same model against the same target.
    // Create json_populate_recordset and then query for target and type

    if (options.beforeSave) {
      model = options.beforeSave(model);
    }

    return await this.createCaptureModel(model, siteId);
  }

  async updateRevision(
    req: RevisionRequest,
    {
      siteId,
      userId,
      allowCanonicalChanges = false,
      allowCustomStructure = false,
      allowAnonymous = false,
      allowReview = false,
      checkUserIdMatches = true,
      showRevised = false,
    }: {
      siteId: number;
      userId?: number;
      allowCanonicalChanges?: boolean;
      allowCustomStructure?: boolean;
      allowReview?: boolean;
      allowAnonymous?: boolean;
      checkUserIdMatches?: boolean;
      showRevised?: boolean;
    }
  ) {
    console.log('Update revision =>');
    await this.connection.transaction(async transaction => {
      console.log('  Start transaction');
      invariant(req.captureModelId, 'Missing Capture model id');

      const captureModel = await this.getCaptureModel(
        req.captureModelId,
        {
          fullModel: true,
        },
        siteId,
        transaction
      );

      console.log('  Loaded capture model', captureModel.id);

      const [storedRevision] = await this.getRevisionRow(req.revision.id, siteId);

      console.log('  Loaded stored revision', storedRevision);

      // Allow users to access their own revisions.
      if (
        userId &&
        checkUserIdMatches &&
        (!storedRevision.authors || storedRevision.authors?.indexOf(`urn:madoc:user:${userId}`) === -1)
      ) {
        throw new NotFound(`Revision not found`);
      }

      // Fix for when the base document is not marked as immutable.
      if (!req.document.immutable) {
        req.document.immutable = true;
      }

      console.log('  Passed validation');

      updateRevisionInDocument(captureModel, req, {
        allowCanonicalChanges,
        allowAnonymous,
        allowCustomStructure,
      });

      console.log('  Updated revision in document');

      // Update with the new document.
      await transaction.query(CaptureModelRepository.mutations.updateDocument(captureModel.document, siteId));

      console.log('  Updated document');

      try {
        // Update revision?
        if (req.revision.deletedFields) {
          await transaction.query(
            CaptureModelRepository.mutations.updateRevisionDeletedFields(
              req.revision,
              req.revision.deletedFields,
              siteId
            )
          );
        }

        await transaction.query(
          CaptureModelRepository.mutations.updateRevisionStatus(req.revision, req.revision.status, siteId)
        );

        if (req.revision.status !== storedRevision.status || req.revision.label !== storedRevision.label) {
          if (allowReview || req.revision.status === 'submitted' || req.revision.status === 'draft') {
            await this.updateRevisionFields(req.revision, siteId, transaction);
          }
        }
      } catch (err) {
        console.log('ERR', err);
      }
    });

    console.log('  Updated revision fields');

    return this.getRevision(req.revision.id, siteId, { userId, showRevised });
  }

  async createRevision(
    req: RevisionRequest,
    {
      siteId,
      userId,
      allowCanonicalChanges = false,
      allowCustomStructure = false,
      allowAnonymous = false,
      showRevised = false,
    }: {
      siteId: number;
      userId?: number;
      allowCanonicalChanges?: boolean;
      allowCustomStructure?: boolean;
      allowAnonymous?: boolean;
      showRevised?: boolean;
    }
  ) {
    if (userId) {
      req.author = { id: `urn:madoc:user:${userId}`, type: 'Person' };
    }

    await this.connection.transaction(async transaction => {
      invariant(req.captureModelId, 'Missing Capture model id');

      // @todo only return the canonical model.
      // @todo If this doesn't exist, then we're creating a new one?
      const captureModel = await this.getCaptureModel(
        req.captureModelId,
        {
          fullModel: true,
        },
        siteId,
        transaction
      );

      // Fix for when the base document is not marked as immutable.
      if (!req.document.immutable) {
        req.document.immutable = true;
      }

      updateRevisionInDocument(captureModel, req, {
        allowCanonicalChanges,
        allowAnonymous,
        allowCustomStructure,
      });

      // Update with the new document.
      await transaction.query(CaptureModelRepository.mutations.updateDocument(captureModel.document, siteId));

      await transaction.query(
        CaptureModelRepository.mutations.createRevision(
          req.revision,
          captureModel.document.id,
          siteId,
          userId,
          captureModel.id
        )
      );

      // Update revision?
      if (req.revision.deletedFields) {
        await transaction.query(
          CaptureModelRepository.mutations.updateRevisionDeletedFields(req.revision, req.revision.deletedFields, siteId)
        );
      }

      await transaction.query(
        CaptureModelRepository.mutations.updateRevisionStatus(req.revision, req.revision.status, siteId)
      );
    });

    return this.getRevision(req.revision.id, siteId, { userId, showRevised });
  }

  async forkRevision(
    captureModelId: string,
    revisionId: string,
    siteId: number,
    {
      userId,
      includeRevisions,
      includeStructures,
      cloneMode = 'FORK_TEMPLATE',
      modelMapping = {},
      modelRoot = [],
    }: {
      userId?: number;
      includeRevisions?: boolean;
      includeStructures?: boolean;
      cloneMode?: string; // @todo REVISION_CLONE_MODE has inter-dependency issues
      modelMapping?: any;
      modelRoot?: [];
    } = {}
  ) {
    const baseRevision = await this.getRevisionTemplate(captureModelId, revisionId, siteId, {
      userId,
      includeRevisions,
      includeStructures,
    });

    return forkExistingRevision(baseRevision, {
      cloneMode,
      modelMapping,
      modelRoot,
    });
  }

  async getRevisionTemplate(
    captureModelId: string,
    revisionId: string,
    siteId: number,
    {
      includeRevisions,
      includeStructures,
      userId,
    }: { userId?: number; includeRevisions?: boolean; includeStructures?: boolean } = {}
  ) {
    const captureModel = await this.getCaptureModel(
      captureModelId,
      {
        userId,
        revisionId,
        onlyRevisionFields: true,
        showAllRevisions: false,
      },
      siteId
    );

    if (includeStructures) {
      const foundStructure = findStructure(captureModel, revisionId);
      if (foundStructure) {
        return createRevisionRequestFromStructure(captureModel, foundStructure);
      } // fallthrough to check revisions.
    }

    if (includeRevisions) {
      const revision = captureModel.revisions?.find(r => r.id === revisionId);
      if (revision) {
        return {
          captureModelId: captureModel.id,
          source: revision.source,
          document: captureModel.document,
          revision,
        } as RevisionRequest;
      }
    }

    throw new Error('Revision does not exist on capture model');
  }

  // USED IN MERGE WORKFLOW
  async cloneRevision(captureModelId: string, revisionId: string, siteId: number, userId?: number) {
    const req = await this.getRevisionTemplate(captureModelId, revisionId, siteId, {
      includeRevisions: true,
      includeStructures: false,
      // User ID omitted here because it's used for review process so ALL revisions are required.
    });

    const author = `urn:madoc:user:${userId}`;

    // Add additional author.
    if (userId && req.revision.authors?.indexOf(author) === -1) {
      req.revision.authors.push(author);
    }

    // Add user as owner of clone.
    if (userId) {
      req.author = { id: author, type: 'Person' };
    }

    // Add new id.
    const originalId = req.revision.id;
    const newId = generateId();
    req.revision.revises = originalId;
    req.revision.id = newId;

    traverseDocument(req.document, {
      visitField(field) {
        if (field.revision === originalId) {
          field.id = generateId();
          field.revision = newId;
          if (field.selector) {
            field.selector.id = generateId();
            field.selector.revisedBy = [];
          }
        }
      },
      visitEntity(entity) {
        if (entity.revision === originalId) {
          entity.id = generateId();
          entity.revision = newId;
          if (entity.selector) {
            entity.selector.id = generateId();
            if (entity.selector.revisedBy) {
              for (const selector of entity.selector.revisedBy) {
                if (selector.revisionId && selector.revisionId === originalId) {
                  selector.id = generateId();
                  selector.revisionId = newId;
                  if (selector.revises) {
                    selector.revises = entity.selector.id;
                  }
                }
              }
            }
          }
        }
      },
    });

    return req;
  }

  async listAllRevisions(
    options: {
      page?: number;
      perPage?: number;
      all?: boolean;
    },
    site_id: number
  ) {
    return (await this.connection.any(CaptureModelRepository.queries.listAllRevisions(options, site_id))).map(row => {
      return CaptureModelRepository.parseRevisionRow(row)[0];
    });
  }

  async searchPublished(siteId: number) {
    // @todo this does need to be re-implemented for the search manifest functionality to work
    //   however this might be a good time to use the actual search service for that instead.
    return [];
  }

  isMigrated() {
    return this.flags.capture_model_api_migrated;
  }
}
