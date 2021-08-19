import { sql } from 'slonik';
import { getProject } from '../../database/queries/project-queries';
import { NoteListMap, NoteListRow } from '../../types/personal-notes';
import { RouteMiddleware } from '../../types/route-middleware';
import { parseProjectId } from '../../utility/parse-project-id';
import { SQL_EMPTY } from '../../utility/postgres-tags';
import { userWithScope } from '../../utility/user-with-scope';

export const getAllProjectNotes: RouteMiddleware = async context => {
  const { id: userId, siteId } = userWithScope(context, ['site.view']);
  const parsedId = context.params.id ? parseProjectId(context.params.id) : undefined;
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : undefined;

  const page = Number(context.query.page) || 1;
  const notesPerPage = 20;

  const query = sql`
    n.user_id = ${userId} 
    ${project ? sql`and n.project_id = ${project.id}` : SQL_EMPTY}
  `;

  const { total_notes } = await context.connection.one(sql<{ total_notes: number }>`
    select COUNT (*) as total_notes from project_notes n
    where ${query}
  `);

  const totalPages = Math.ceil(total_notes / notesPerPage);

  const notes = await context.connection.any(sql<NoteListRow>`
    select 
       -- notes --
       n.id as personal_notes__id,
       n.note as personal_notes__note,
       n.type as personal_notes__type,
           
       -- iiif resource ---
       ir.id as iiif__id,
       ir.type as iiif__type,
       ir.default_thumbnail as iiif__thumbnail,

       -- resource metadata ---
       im.language as iiif__label_language,
       im.value as iiif__label_value,

       -- iiif resource parent (manifest) ---
       ir2.id as iiif_parent__id,
       ir2.type as iiif_parent__type,
       ir2.default_thumbnail as iiif_parent__thumbnail,

       -- parent metadata ---
       im2.language as iiif_parent__label_language,
       im2.value as iiif_parent__label_value
        
    
    from project_notes n
    left join iiif_resource ir on n.resource_id = ir.id
    left join iiif_derived_resource_items idri on ir.id = idri.item_id
    left join iiif_resource ir2 on idri.resource_id = ir2.id
    left outer join iiif_metadata im2 on ir2.id = im2.resource_id
    left outer join iiif_metadata im on ir.id = im.resource_id
    where ${query}
    and im.key = 'label'
    and im.site_id = ${siteId}
    and im2.key = 'label'
    and im2.site_id = ${siteId}
    limit ${notesPerPage} offset ${(page - 1) * notesPerPage}
  `);

  const notesMap: NoteListMap = {};

  function notesReducer(state: NoteListMap, next: NoteListRow) {
    if (!state[next.personal_notes__id]) {
      state[next.personal_notes__id] = {
        id: next.personal_notes__id,
        note: next.personal_notes__note,
        type: next.personal_notes__type,
        resource: {
          id: next.iiif__id,
          type: next.iiif__type,
          thumbnail: next.iiif__thumbnail,
          label: {
            [next.iiif__label_language]: [next.iiif__label_value],
          },
        },
        parentResource: next.iiif_parent__id
          ? {
              id: next.iiif_parent__id,
              type: next.iiif_parent__type,
              thumbnail: next.iiif_parent__thumbnail,
              label: {
                [next.iiif_parent__label_language]: [next.iiif_parent__label_value],
              },
            }
          : undefined,
      };
    } else {
      // Don't support multiple labels for now.
    }

    return state;
  }

  context.response.body = {
    notes: Object.values(notes.reduce(notesReducer, notesMap)),
    pagination: {
      page,
      totalResults: total_notes,
      totalPages,
    },
  };
};
