import { sql } from 'slonik';
import { AnnotationStyles, AnnotationStylesRow } from '../types/annotation-styles';
import { BaseRepository } from './base-repository';

export class AnnotationStylesRepository extends BaseRepository {
  static query = {
    listAnnotationStyles: (siteId: number) => sql<AnnotationStylesRow>`
        select *
        from annotation_styles
        where site_id = ${siteId}
    `,
    getAnnotationStyles: (id: number, siteId: number) => sql<AnnotationStylesRow>`
        select *
        from annotation_styles
        where id = ${id}
          and site_id = ${siteId}
    `,
    getProjectAnnotationStyle: (projectId: number, siteId: number) => sql<AnnotationStylesRow>`
        select *
        from annotation_styles
                 left join iiif_project asp
                           on annotation_styles.id = asp.style_id and asp.site_id = ${siteId}
        where asp.id = ${projectId}
          and annotation_styles.site_id = ${siteId}
    `,
  };

  static mutations = {
    createAnnotationStyles: (name: string, creator: AnnotationStyles['creator'], data: any, siteId: number) => sql<
      AnnotationStylesRow
    >`
        insert into annotation_styles (name, created_at, data, site_id, creator)
        values (${name}, current_date, ${sql.json(data)}, ${siteId}, ${creator?.id || null})
        returning *
    `,

    updateAnnotationStyles: ({ id, name, creator, createdAt, ...data }: AnnotationStyles, siteId: number) => sql`
        update annotation_styles
        set data = ${sql.json(data as any)},
            name = ${name}
        where id = ${id}
          and site_id = ${siteId}
    `,

    deleteAnnotationStyles: (id: number, siteId: number) => sql`
        delete
        from annotation_styles
        where id = ${id}
          and site_id = ${siteId}
    `,

    setProjectStyle: (styleId: number | null, projectId: number, siteId: number) => sql`
        update iiif_project
        set style_id = ${styleId}
        where id = ${projectId}
          and site_id = ${siteId}
    `,
  };

  async listAnnotationStyles(siteId: number): Promise<AnnotationStyles[]> {
    const list = await this.connection.any(AnnotationStylesRepository.query.listAnnotationStyles(siteId));
    return list.map(style => this.mapAnnotationStylesRow(style));
  }

  async getAnnotationStyles(id: number, siteId: number): Promise<AnnotationStyles> {
    return this.mapAnnotationStylesRow(
      await this.connection.one(AnnotationStylesRepository.query.getAnnotationStyles(id, siteId))
    );
  }

  async getProjectAnnotationStyle(projectId: number, siteId: number): Promise<AnnotationStyles | null> {
    const style = await this.connection.maybeOne(
      AnnotationStylesRepository.query.getProjectAnnotationStyle(projectId, siteId)
    );

    if (!style) {
      return null;
    }

    return this.mapAnnotationStylesRow(style);
  }

  async updateAnnotationStyles(style: AnnotationStyles, siteId: number): Promise<void> {
    await this.connection.query(AnnotationStylesRepository.mutations.updateAnnotationStyles(style, siteId));
  }

  async createAnnotationStyles(
    name: string,
    creator: AnnotationStyles['creator'],
    data: any,
    siteId: number
  ): Promise<AnnotationStyles> {
    return this.mapAnnotationStylesRow(
      await this.connection.one(
        AnnotationStylesRepository.mutations.createAnnotationStyles(name, creator, data, siteId)
      )
    );
  }

  async deleteAnnotationStyles(id: number, siteId: number): Promise<void> {
    await this.connection.query(AnnotationStylesRepository.mutations.deleteAnnotationStyles(id, siteId));
  }

  async addStyleToProject(styleId: number | null, projectId: number, siteId: number) {
    await this.connection.query(AnnotationStylesRepository.mutations.setProjectStyle(styleId, projectId, siteId));
  }

  async removeStyleFromProject(projectId: number, siteId: number) {
    await this.connection.query(AnnotationStylesRepository.mutations.setProjectStyle(null, projectId, siteId));
  }

  mapAnnotationStylesRow(row: AnnotationStylesRow): AnnotationStyles {
    return {
      id: row.id,
      createdAt: row.created_at,
      creator:
        row.creator__id && row.creator__name
          ? {
              id: row.creator__id,
              name: row.creator__name,
            }
          : undefined,
      name: row.name,
      theme: row.data?.theme || {},
    };
  }
}
