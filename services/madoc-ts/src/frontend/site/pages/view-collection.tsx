import React from 'react';
import { UniversalComponent } from '../../types';
import { createUniversalComponent } from '../../shared/utility/create-universal-component';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { LocaleString } from '../../shared/components/LocaleString';
import { useApi } from '../../shared/hooks/use-api';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { Pagination } from '../../shared/components/Pagination';

type ViewCollectionType = {
  data: any;
  params: { id: string };
  query: { page: string };
  variables: { id: number; page: number };
};

export const ViewCollection: React.FC<CollectionFull> = ({ collection, pagination }) => {
  const api = useApi();
  const { data: projectList } = useQuery(
    ['site-collection-projects', { id: collection.id }],
    async () => {
      return await api.getSiteProjects({ collection_id: collection.id });
    },
    { refetchInterval: false, refetchOnWindowFocus: false }
  );

  return (
    <>
      <LocaleString as="h1">{collection.label}</LocaleString>
      {projectList
        ? projectList.projects.map((project: any) => (
            <div key={project.id}>
              <LocaleString>{project.label}</LocaleString>
            </div>
          ))
        : null}
      <h3>Manifests</h3>
      {collection.items.map(manifest => (
        <div key={manifest.id}>
          <Link to={`/collections/${collection.id}/manifests/${manifest.id}`}>
            <LocaleString>{manifest.label}</LocaleString>
          </Link>
        </div>
      ))}
      <hr />
      <Pagination
        pageParam={'c'}
        page={pagination ? pagination.page : 1}
        totalPages={pagination ? pagination.totalPages : 1}
        stale={!pagination}
      />
    </>
  );
};

export const ViewCollection2: UniversalComponent<ViewCollectionType> = createUniversalComponent<ViewCollectionType>(
  () => {
    return <h1>View collection</h1>;
  },
  {
    getKey: (params, query) => {
      return ['view-collection', { id: Number(params.id), page: query.page ? Number(query.page) : 1 }];
    },
    getData: async (key, vars, api) => {
      // Running projects
      // Crowdsourcing tasks
      // Configuration, from the config service describing what a user can do.

      // 3 requests:
      // - Configuration API - passing in context.
      // - IIIF API - passing ID.
      // - Projects API - passing in IIIF resource
      //
      // todo notes
      // - Collections will only fetch a project if they are under the context of a project endpoint
      // - Manifests will always fetch a project
      // - Canvases will always fetch a project (using the manifest).

      return {
        projects: [
          // Link resource_id => project resource_id in derived
          // maybe some custom field for anonymous users.
          {
            // Project = collection + task + project in database.
            // Collections and manifests in the project, go into the created collection
            // Project configuration is stored in the config server
            // PER OBJECT configuration overrides is stored in the config service.
            // How to track what collections and manifests are in a project
            // - Pause project
            // - Add content
            // - Resume project - generates tables mapping all collections and manifests
            // - Show warning when editing collection or manifest that is part of a project.
            // - Possibly, when editing a collection in a project we could retro-actively add entries to that table.
            //    - If add manifest to collection AND collection in project, add manifest to project
            // - Not needed for canvases, as manifest will always be in context.
            // - todo: remove canvas-only page, must be in manifest.
            // - The table could be the top level collection..
            // - todo: add "root task" to sub-sub-tasks
            id: 123,
            title: 'Transcribe our books',
            description:
              'This resource is part of a crowdsourcing project to transcribe all of the books in the Scottish bridges collection.',
            callToAction: 'transcribe this document',
            taskId: '1231123-123123-123123-123123',
            statistics: {
              all: {
                completed: 5,
                progress: 23,
                pending: 10,
              },
              subtasks: {
                '2': { status: 3 }, // Done
                '3': { status: 2 }, // In progress
                '4': { status: 4 }, // In progress, not accepting more contributions
                '5': { status: 5 }, // In review
              },
            },
          },
        ],
        // // Task where subject = id
        // // Anonymous = nothing, user = their tasks, admin = all tasks
        // tasks: [
        //   {
        //     id: '1231123-123123-123123-123123',
        //     rootTask: '1231123-123123-123123-123123',
        //     type: 'collection-crowdsourcing',
        //     assignedTo: 'urn:madoc:user:1',
        //     statistics: {
        //       completed: 5,
        //       progress: 23,
        //       pending: 10,
        //     },
        //   },
        // ],
        // What sort of configuration? Public? (site.read)
        // [site, projectId].projectConfiguration
        configuration: {
          allowManifestNavigation: true,
          allowCanvasNavigation: true,
          claimGranularity: 'canvas',
          maxContributionsPerResource: 2,
        },

        // Same as normal.
        collection: {
          id: 1,
          label: { en: ['My collection'] },
          items: [
            { id: 2, label: { en: ['Manifest 1'] } },
            { id: 3, label: { en: ['Manifest 2'] } },
            { id: 4, label: { en: ['Manifest 3'] } },
            { id: 5, label: { en: ['Manifest 4'] } },
          ],
        },
        pagination: {
          /* ... */
        },
      };
    },
  }
);
