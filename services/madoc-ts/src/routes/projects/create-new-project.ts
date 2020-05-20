import { RouteMiddleware } from '../../types/route-middleware';
import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
import { sql } from 'slonik';
import { CreateProject } from '../../types/schemas/create-project';
import { InternationalString } from '@hyperion-framework/types';

const firstLang = (field: InternationalString) => {
  const keys = Object.keys(field);
  return (field[keys[0]] || [])[0] || 'Untitled project';
};

export const createNewProject: RouteMiddleware<{}, CreateProject> = async context => {
  const { siteId, id } = userWithScope(context, ['site.admin']);
  const userApi = api.asUser({ userId: id, siteId });

  const { label, slug, summary } = context.requestBody;

  // 1. Create collection [flat]
  const collection = await userApi.createCollection({
    type: 'Collection',
    label: label,
    summary: summary,
  });

  // 2. Create or fork capture model
  const captureModel = await userApi.createCaptureModel('Transcribe all of the books');

  // 3. Create crowdsourcing task.
  const task = await userApi.newTask({
    name: firstLang(label),
    subject: `urn:madoc:collection:${collection.id}`,
    parameters: [captureModel.id],
    type: 'crowdsourcing-project',
    status_text: 'paused',
    status: 0,
    description: firstLang(summary),
  });

  // 4. Create project entry.
  try {
    const project = await context.connection.one(sql<{
      id: number;
      task_id: string;
      collection_id: string;
      slug: string | null;
      capture_model_id: number;
    }>`
        insert into iiif_project (task_id, collection_id, slug, site_id, capture_model_id)
        VALUES (${task.id}, ${collection.id}, ${slug}, ${siteId}, ${captureModel.id})
        returning *
    `);

    // 5. todo Post default configuration to config service.

    // For now.
    context.response.body = project;
  } catch (err) {
    // todo
    //   Mark task as errored – or delete it
    //   Delete collection
    //   Delete capture model derivative.
  }

  //create table iiif_project
  // (
  // 	id serial not null
  // 		constraint iiif_project_pk
  // 			primary key,
  // 	task_id uuid not null,
  // 	collection_id integer not null
  // 		constraint iiif_project_iiif_resource_id_fk
  // 			references iiif_resource,
  // 	slug text not null,
  // 	site_id integer not null,
  // 	capture_model_id uuid not null
  // );
  //
  // alter table iiif_project owner to madoc;
  //
  // create unique index iiif_project_site_id_slug_uindex
  // 	on iiif_project (site_id, slug);

  // Name of project
  // Project content
  // crowdsourcing template - later
  //
  // What this will do:
  // - Create new row for project in DB
  // - Create new collection and link to project
  // - Create new capture model that will be used as base - possibly from template (context is [site, project])
  // - Create new root crowdsourcing task
  //
  // Endpoints for admins
  // - Update project
  //    - Update project metadata
  //    - Resume/start project
  //    - Pause project
  //    - Finish project
  // - Update project content
  // - Export project
  //
  // Other project related endpoints for users
  // - Claim resource
  // - Abandon resource (DELETE claim)
  // - Get random resource
};
