import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { getProjectSearchIndexEntityOptions } from '../../../../shared/capture-models/helpers/project-search-index-options';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { useIndexResources } from '../../../hooks/use-index-resource';
import {
  ProjectSearchIndexDefinition,
  ProjectSearchIndexRequest,
} from '../../../../../types/schemas/project-search-index';
import { ProjectContent } from './project-content';

const emptyRequest: ProjectSearchIndexRequest = {
  label: '',
  summary: '',
  entityPath: [],
  facets: [],
  includeUnapproved: false,
  enabled: true,
};

function samePath(left: string[] | undefined, right: string[] | undefined) {
  return JSON.stringify(left || []) === JSON.stringify(right || []);
}

export function ProjectSearchIndex() {
  const { id = '' } = useParams<{ id: string }>();
  const api = useApi();
  const { data: structure } = useData(ProjectContent);
  const [indexContext, manifestIndexStatus] = useIndexResources(structure?.items || []);
  const [editingId, setEditingId] = useState<string>();
  const [request, setRequest] = useState<ProjectSearchIndexRequest>(emptyRequest);
  const configuration = useQuery(['project-search-indexes', id], () => api.getProjectSearchIndexes(id));
  const model = useQuery(['project-search-index-model', id], async () => {
    const project = await api.getProject(id);
    return api.crowdsourcing.getCaptureModel(project.capture_model_id);
  });
  const entityOptions = useMemo(
    () => (model.data ? getProjectSearchIndexEntityOptions(model.data.document) : []),
    [model.data]
  );
  const selectedEntity = entityOptions.find(option => samePath(option.path, request.entityPath));

  useEffect(() => {
    const wholeModel = entityOptions.find(option => option.path.length === 0);
    if (!editingId && !request.label && wholeModel) {
      setRequest(current => ({ ...current, label: wholeModel.pluralLabel || wholeModel.label }));
    }
  }, [editingId, entityOptions, request.label]);

  const [save, saveStatus] = useMutation(
    async () =>
      editingId
        ? api.updateProjectSearchIndex(id, editingId, request)
        : api.createProjectSearchIndex(id, request),
    {
      onSuccess: async () => {
        setEditingId(undefined);
        setRequest(emptyRequest);
        await configuration.refetch();
      },
    }
  );
  const [reindex, reindexStatus] = useMutation(async (indexId: string) => api.reindexProjectSearchIndex(id, indexId));
  const [remove] = useMutation(async (indexId: string) => {
    if (!window.confirm('Delete this custom search index?')) return;
    await api.deleteProjectSearchIndex(id, indexId);
    await configuration.refetch();
  });

  const edit = (index: ProjectSearchIndexDefinition) => {
    setEditingId(index.id);
    setRequest({
      presetKey: index.presetKey,
      label: index.label,
      summary: index.summary,
      entityPath: index.entityPath,
      uniqueField: index.uniqueField,
      facets: index.facets,
      includeUnapproved: index.includeUnapproved,
      enabled: index.enabled,
    });
  };

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-slate-900">Project resources</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Refresh the manifests and canvases from this project in the normal project search.
        </p>
        <button
          type="button"
          className="mt-4 rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          disabled={manifestIndexStatus.isLoading}
          onClick={() => indexContext()}
        >
          Index all manifests{manifestIndexStatus.isLoading ? ` ${manifestIndexStatus.percent}%` : ''}
        </button>
      </section>

      {configuration.data?.available.length ? (
        <section>
          <h2 className="text-xl font-semibold text-slate-900">Available search indexes</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {configuration.data.available.map(preset => (
              <article key={preset.key} className="rounded border border-slate-200 bg-white p-4">
                <h3 className="font-semibold text-slate-900">{preset.metadata.label}</h3>
                {preset.metadata.summary ? <p className="mt-1 text-sm text-slate-600">{preset.metadata.summary}</p> : null}
                <button
                  type="button"
                  className="mt-4 rounded border border-blue-700 px-3 py-1.5 text-sm text-blue-700"
                  onClick={() => {
                    setEditingId(undefined);
                    setRequest({
                      presetKey: preset.key,
                      label: preset.metadata.label,
                      summary: preset.metadata.summary,
                      entityPath: preset.entityPath,
                      uniqueField: preset.uniqueField,
                      facets: preset.facets || [],
                      includeUnapproved: false,
                      enabled: true,
                    });
                  }}
                >
                  Configure
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-xl font-semibold text-slate-900">Custom indexes</h2>
        <div className="mt-4 space-y-3">
          {configuration.data?.indexes.map(index => (
            <article key={index.id} className="rounded border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{index.label}</h3>
                  {index.summary ? <p className="mt-1 text-sm text-slate-600">{index.summary}</p> : null}
                  <p className="mt-2 text-xs text-slate-500">
                    {index.lastIndexedAt
                      ? `${index.documentCount || 0} records · indexed ${new Date(index.lastIndexedAt).toLocaleString()}`
                      : 'Not indexed yet'}
                  </p>
                  {index.warnings?.length ? (
                    <p className="mt-1 text-xs text-amber-700">{index.warnings.length} indexing warning(s)</p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded border px-3 py-1.5 text-sm" onClick={() => edit(index)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded border border-blue-700 px-3 py-1.5 text-sm text-blue-700 disabled:opacity-50"
                    disabled={reindexStatus.isLoading}
                    onClick={() => reindex(index.id)}
                  >
                    Reindex
                  </button>
                  <button
                    type="button"
                    className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700"
                    onClick={() => remove(index.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!configuration.data?.indexes.length ? <p className="text-sm text-slate-500">No custom indexes yet.</p> : null}
        </div>
      </section>

      <section className="max-w-3xl rounded border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-xl font-semibold text-slate-900">{editingId ? 'Edit search index' : 'Create search index'}</h2>
        <div className="mt-5 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Indexing target
            <select
              className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2"
              value={JSON.stringify(request.entityPath)}
              onChange={event => {
                const path = JSON.parse(event.target.value) as string[];
                const option = entityOptions.find(entity => samePath(entity.path, path));
                setRequest({
                  ...request,
                  entityPath: path,
                  label: option?.pluralLabel || option?.label || request.label,
                  uniqueField: undefined,
                  facets: [],
                });
              }}
            >
              {entityOptions.map(option => (
                <option key={JSON.stringify(option.path)} value={JSON.stringify(option.path)}>
                  {option.path.length ? `${option.pluralLabel} (${option.path.join(' → ')})` : 'Whole capture model'}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Label
            <input
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
              value={request.label}
              onChange={event => setRequest({ ...request, label: event.target.value })}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Summary
            <textarea
              className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
              value={request.summary || ''}
              onChange={event => setRequest({ ...request, summary: event.target.value })}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Unique field
            <select
              className="mt-1 block w-full rounded border border-slate-300 bg-white px-3 py-2"
              value={request.uniqueField ? JSON.stringify(request.uniqueField) : ''}
              onChange={event =>
                setRequest({ ...request, uniqueField: event.target.value ? JSON.parse(event.target.value) : undefined })
              }
            >
              <option value="">Treat every entity as unique</option>
              {selectedEntity?.fields.map(field => (
                <option key={JSON.stringify(field.path)} value={JSON.stringify(field.path)}>
                  {field.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Facets</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {selectedEntity?.fields.map(field => {
                const checked = !!request.facets?.some(facet => samePath(facet.path, field.path));
                return (
                  <label key={JSON.stringify(field.path)} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setRequest({
                          ...request,
                          facets: checked
                            ? (request.facets || []).filter(facet => !samePath(facet.path, field.path))
                            : [...(request.facets || []), { path: field.path, label: field.label }],
                        })
                      }
                    />
                    {field.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              className="mt-1"
              type="checkbox"
              checked={!!request.includeUnapproved}
              onChange={event => setRequest({ ...request, includeUnapproved: event.target.checked })}
            />
            <span>
              Include draft and non-approved annotations
              <span className="block text-xs text-amber-700">
                These contributions will be visible through the public project search.
              </span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={request.enabled !== false}
              onChange={event => setRequest({ ...request, enabled: event.target.checked })}
            />
            Show this index as a tab in project search
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              className="rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={!request.label.trim() || !selectedEntity || saveStatus.isLoading}
              onClick={() => save()}
            >
              {editingId ? 'Save changes' : 'Create index'}
            </button>
            {editingId ? (
              <button
                type="button"
                className="rounded border px-4 py-2 text-sm"
                onClick={() => {
                  setEditingId(undefined);
                  setRequest(emptyRequest);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
          {saveStatus.error ? <p className="text-sm text-red-700">Failed to save the search index.</p> : null}
          {reindexStatus.isSuccess ? <p className="text-sm text-green-700">Reindex queued.</p> : null}
        </div>
      </section>
    </div>
  );
}
