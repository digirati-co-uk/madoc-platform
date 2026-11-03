import React, { useMemo, useState } from 'react';
import { useMutation, useQueryCache } from 'react-query';
import { useTranslation } from 'react-i18next';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import type { ProjectTemplateAdminModelProps } from '../types';
import {
  getTranscriptionMetadata,
  updateTranscriptionTemplateConfig,
  type TranscriptionMetadata,
} from '../transcription-metadata';

const inputClass =
  'block w-full rounded border border-gray-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export function TranscriptionProjectMetadataEditor({
  projectId,
  projectSlug,
  captureModel,
  templateConfig,
}: ProjectTemplateAdminModelProps) {
  const api = useApi();
  const cache = useQueryCache();
  const { t } = useTranslation();
  const initial = useMemo(() => getTranscriptionMetadata(captureModel, templateConfig), [captureModel, templateConfig]);
  const [draft, setDraft] = useState<TranscriptionMetadata>();
  const values = draft || initial;
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const [save, status] = useMutation(async () => {
    await api.updateProjectTemplateConfig(projectId, updateTranscriptionTemplateConfig(templateConfig, values));
    await Promise.all([
      cache.invalidateQueries(['project-model', { id: projectId }]),
      cache.invalidateQueries(['get-project', { id: projectId }]),
      cache.invalidateQueries(['getSiteProject', [projectSlug]]),
    ]);
    setDraft(undefined);
  });

  return (
    <form
      className="mb-8 max-w-3xl space-y-5"
      onSubmit={event => {
        event.preventDefault();
        if (dirty && !status.isLoading) void save().catch(() => undefined);
      }}
    >
      <h3 className="text-lg font-semibold">{t('Transcription instructions and description')}</h3>
      <fieldset className="space-y-5" disabled={status.isLoading}>
        <div>
          <label className="mb-2 block font-semibold" htmlFor="transcription-form-label">
            {t('Form label')}
          </label>
          <input
            id="transcription-form-label"
            className={inputClass}
            required
            value={values.modelLabel}
            onChange={event => setDraft({ ...values, modelLabel: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold" htmlFor="transcription-description">
            {t('Form description')}
          </label>
          <textarea
            id="transcription-description"
            className={inputClass}
            rows={3}
            value={values.modelDescription}
            onChange={event => setDraft({ ...values, modelDescription: event.target.value })}
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold" htmlFor="transcription-instructions">
            {t('Crowdsourcing instructions')}
          </label>
          <textarea
            id="transcription-instructions"
            className={inputClass}
            rows={5}
            value={values.crowdsourcingInstructions}
            onChange={event => setDraft({ ...values, crowdsourcingInstructions: event.target.value })}
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!dirty}
            className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50"
          >
            {t(status.isLoading ? 'Saving' : 'Save')}
          </button>
          <button
            type="button"
            disabled={!dirty}
            className="rounded border border-gray-400 px-4 py-2 disabled:opacity-50"
            onClick={() => {
              setDraft(undefined);
              status.reset();
            }}
          >
            {t('Cancel')}
          </button>
        </div>
      </fieldset>
      {status.isError ? (
        <p role="alert" className="text-red-700">
          {t('Could not save changes. Please try again.')}
        </p>
      ) : null}
      {status.isSuccess && !dirty ? (
        <p role="status" className="text-green-700">
          {t('Changes saved')}
        </p>
      ) : null}
    </form>
  );
}
