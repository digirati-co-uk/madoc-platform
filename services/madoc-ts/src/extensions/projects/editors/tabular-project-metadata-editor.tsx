import { VaultProvider } from 'react-iiif-vault';
import { TabularProjectModelPreview } from '../../../frontend/admin/pages/crowdsourcing/model-editor/TabularProjectModelPreview';
import React, { useMemo, useRef, useState } from 'react';
import { useQueryCache, useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import type { ProjectTemplateAdminModelProps } from '../types';
import type { TabularProjectMetadataUpdate } from '../../../types/schemas/tabular-project-metadata';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import {
  getTabularModelInstructions,
  resolveTabularInstructions,
} from '../../../frontend/shared/utility/tabular-instructions';
import { isHiddenFieldType, type TabularTemplateConfig } from './tabular-project-custom-editor-utils';

interface MetadataForm {
  crowdsourcingInstructions: string;
  columns: NonNullable<TabularProjectMetadataUpdate['columns']>;
}

const inputClass =
  'block w-full rounded border border-gray-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export function TabularProjectMetadataEditor({
  projectId,
  projectSlug,
  captureModel,
  templateConfig,
}: ProjectTemplateAdminModelProps) {
  const { t } = useTranslation();
  const api = useApi();
  const queryCache = useQueryCache();
  const initial = useMemo<MetadataForm>(() => {
    const config = templateConfig as TabularTemplateConfig | null;
    return {
      crowdsourcingInstructions: resolveTabularInstructions(config?.crowdsourcingInstructions, [
        getTabularModelInstructions(captureModel),
      ]),
      columns: (config?.tabular?.model?.columns || []).flatMap(column =>
        column.id &&
        !column.id.startsWith('__') &&
        column.saved !== false &&
        !isHiddenFieldType(column.type || column.fieldType)
          ? [
              {
                id: column.id,
                label: column.label || column.id,
                helpText: column.helpText ?? config?.tabular?.model?.captureModelFields?.[column.id]?.description ?? '',
              },
            ]
          : []
      ),
    };
  }, [captureModel, templateConfig]);
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [draft, setDraft] = useState<MetadataForm>();
  const values = draft || initial;
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  const [save, status] = useMutation(async () => {
    const update: TabularProjectMetadataUpdate = {};
    if (values.crowdsourcingInstructions !== initial.crowdsourcingInstructions) {
      update.crowdsourcingInstructions = values.crowdsourcingInstructions;
    }
    const changedColumns = values.columns.filter(
      (column, index) =>
        column.label !== initial.columns[index]?.label || column.helpText !== initial.columns[index]?.helpText
    );
    if (changedColumns.length) {
      update.columns = changedColumns;
    }
    await api.patchTabularProjectMetadata(projectId, update);
    await Promise.all([
      queryCache.invalidateQueries(['project-model', { id: projectId }]),
      queryCache.invalidateQueries(['get-project', { id: projectId }]),
      queryCache.invalidateQueries(['getSiteProject', [projectSlug]]),
    ]);
    setDraft(undefined);
  });

  const previewConfig = useMemo(() => {
    const config = templateConfig as TabularTemplateConfig | null;
    return {
      ...config,
      tabular: {
        ...config?.tabular,
        model: {
          ...config?.tabular?.model,
          columns: (config?.tabular?.model?.columns || []).map(column => ({
            ...column,
            ...values.columns.find(value => value.id === column.id),
          })),
        },
      },
    };
  }, [templateConfig, values.columns]);

  return (
    <>
      <div role="tablist" aria-label={t('Model editor')} className="mb-6 flex gap-6 border-b border-gray-300">
        {[t('Instructions and labels'), t('Contributor preview')].map((label, index) => (
          <button
            key={index}
            ref={element => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={`tabular-model-tab-${index}`}
            aria-controls={`tabular-model-panel-${index}`}
            aria-selected={activeTab === index}
            tabIndex={activeTab === index ? 0 : -1}
            className={`border-b-2 px-1 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 ${activeTab === index ? 'border-blue-700 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            onClick={() => setActiveTab(index)}
            onKeyDown={event => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                event.preventDefault();
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - index;
                setActiveTab(next);
                tabRefs.current[next]?.focus();
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="tabular-model-panel-0" aria-labelledby="tabular-model-tab-0" hidden={activeTab !== 0}>
        <form
          className="mb-8 max-w-3xl space-y-5"
          onSubmit={event => {
            event.preventDefault();
            if (dirty && !status.isLoading) void save().catch(() => undefined);
          }}
        >
          <fieldset disabled={status.isLoading} className="space-y-5">
            <div>
              <label className="mb-2 block font-semibold" htmlFor="tabular-contributor-instructions">
                {t('Contributor instructions')}
              </label>
              <textarea
                id="tabular-contributor-instructions"
                className={inputClass}
                rows={5}
                value={values.crowdsourcingInstructions}
                onChange={event => setDraft({ ...values, crowdsourcingInstructions: event.target.value })}
              />
            </div>
            {values.columns.length ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{t('Column labels and help text')}</h3>
                {values.columns.map((column, index) => (
                  <div key={column.id} className="grid gap-3 rounded border border-gray-200 p-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold" htmlFor={`tabular-column-label-${index}`}>
                        {t('Column {{number}} label', { number: index + 1 })}
                      </label>
                      <input
                        id={`tabular-column-label-${index}`}
                        className={inputClass}
                        required
                        maxLength={160}
                        value={column.label}
                        onChange={event =>
                          setDraft({
                            ...values,
                            columns: values.columns.map((item, i) =>
                              i === index ? { ...item, label: event.target.value } : item
                            ),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold" htmlFor={`tabular-column-help-${index}`}>
                        {t('Column {{number}} help text', { number: index + 1 })}
                      </label>
                      <textarea
                        id={`tabular-column-help-${index}`}
                        className={inputClass}
                        rows={2}
                        value={column.helpText}
                        onChange={event =>
                          setDraft({
                            ...values,
                            columns: values.columns.map((item, i) =>
                              i === index ? { ...item, helpText: event.target.value } : item
                            ),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
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
              {t('Could not save changes. Please try again.')}{' '}
              {status.error instanceof Error ? status.error.message : ''}
            </p>
          ) : null}
          {status.isSuccess && !dirty ? (
            <p role="status" className="text-green-700">
              {t('Changes saved')}
            </p>
          ) : null}
        </form>
      </div>
      <div role="tabpanel" id="tabular-model-panel-1" aria-labelledby="tabular-model-tab-1" hidden={activeTab !== 1}>
        {activeTab === 1 ? (
          <>
            {dirty ? (
              <p className="mb-4 text-sm text-amber-800">
                {t('Previewing unsaved changes. Return to Instructions and labels to save them.')}
              </p>
            ) : null}
            <VaultProvider>
              <TabularProjectModelPreview
                projectId={String(projectId)}
                templateConfig={previewConfig}
                instructions={values.crowdsourcingInstructions}
              />
            </VaultProvider>
          </>
        ) : null}
      </div>
    </>
  );
}
