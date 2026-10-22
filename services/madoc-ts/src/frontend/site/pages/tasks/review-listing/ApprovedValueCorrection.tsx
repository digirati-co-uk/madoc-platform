import React, { useContext, useEffect, useState } from 'react';
import copy from 'fast-copy';
import { useQueryCache } from 'react-query';
import { useTranslation } from 'react-i18next';
import type { CrowdsourcingTask } from '../../../../../gateway/tasks/crowdsourcing-task';
import type { CrowdsourcingReview } from '../../../../../gateway/tasks/crowdsourcing-review';
import type { CaptureModel } from '../../../../shared/capture-models/types/capture-model';
import type { BaseSelector } from '../../../../shared/capture-models/types/selector-types';
import { PluginContext } from '../../../../shared/capture-models/plugin-api/context';
import { useApi } from '../../../../shared/hooks/use-api';
import { canCorrectApprovedValues } from './correction-policy';
import { markCorrectionQueriesStale } from './correction-cache';
import { persistAndRefreshCorrection, refreshCorrectionSearch } from './correction-search';
import {
  correctionTargets,
  CorrectionTargets,
  saveValueCorrections,
  ValueCorrection,
  FULL_CORRECTION_MODEL_QUERY,
  requireFullCorrectionModel,
} from './save-value-corrections';

interface ApprovedValueCorrectionProps {
  taskId: string;
  modelId: string;
  revisionId: string;
  scope: string[];
  onClose: (saved: boolean) => void | Promise<void>;
}

interface CorrectionSession {
  baseline: CaptureModel;
  targets: CorrectionTargets;
}

type BoxState = { x: number; y: number; width: number; height: number };

function isBox(state: unknown): state is BoxState {
  if (!state || typeof state !== 'object') return false;
  const box = state as Record<string, unknown>;
  return ['x', 'y', 'width', 'height'].every(key => typeof box[key] === 'number' && Number.isFinite(box[key]));
}

function ExistingBoxCorrection({
  selector,
  state,
  update,
}: {
  selector: BaseSelector;
  state: unknown;
  update: (state: BoxState) => void;
}) {
  const { t } = useTranslation();
  if (selector.type !== 'box-selector' || !isBox(state)) {
    return <p className="text-sm text-slate-600">{t('This region cannot be corrected in this view.')}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {(['x', 'y', 'width', 'height'] as const).map(key => (
        <label key={key} className="text-sm">
          {t({ x: 'X position', y: 'Y position', width: 'Width', height: 'Height' }[key])}
          <input
            type="number"
            required
            min={key === 'width' || key === 'height' ? 1 : 0}
            step="any"
            value={state[key]}
            className="block w-full rounded border border-slate-300 px-2 py-1"
            onChange={event => {
              const value = event.currentTarget.valueAsNumber;
              if (Number.isFinite(value)) update({ ...state, [key]: value });
            }}
          />
        </label>
      ))}
    </div>
  );
}

// These built-in inputs commit synchronously. Rich/custom fields need their own flush contract.
const supportedFields = new Set([
  'text-field',
  'dropdown-field',
  'checkbox-field',
  'checkbox-list-field',
  'date-field',
  'color-field',
]);

export function ApprovedValueCorrection({ taskId, modelId, revisionId, scope, onClose }: ApprovedValueCorrectionProps) {
  const api = useApi();
  const cache = useQueryCache();
  const plugins = useContext(PluginContext);
  const { t } = useTranslation();
  const [session, setSession] = useState<CorrectionSession>();
  const [changes, setChanges] = useState<ValueCorrection[]>([]);
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [savedModel, setSavedModel] = useState<CaptureModel>();
  const [searchFailed, setSearchFailed] = useState(false);
  const saved = !!savedModel;

  const loadFresh = async () => {
    const task = await api.getTask<CrowdsourcingTask>(taskId, { detail: true });
    const model = requireFullCorrectionModel(
      await api.crowdsourcing.getCaptureModel(modelId, FULL_CORRECTION_MODEL_QUERY)
    );
    let review: CrowdsourcingReview | undefined;
    if (task.state.reviewTask) {
      try {
        review = await api.getTask<CrowdsourcingReview>(task.state.reviewTask, { detail: true });
      } catch (cause) {
        if (!(cause && typeof cause === 'object' && 'status' in cause && cause.status === 404)) throw cause;
      }
    }
    if (
      task.parameters[0] !== modelId ||
      task.state.revisionId !== revisionId ||
      !canCorrectApprovedValues({
        scope,
        taskStatus: task.status,
        revisionId,
        model,
        activeMerge: !!(task.state.mergeId || review?.state.currentMerge),
      })
    )
      throw new Error(t('This contribution is no longer available for approved correction.'));
    return model;
  };

  useEffect(() => {
    let active = true;
    loadFresh()
      .then(model => {
        const baseline = copy(model);
        const targets = correctionTargets(baseline, revisionId);
        if (active) setSession({ baseline, targets });
      })
      .catch(cause => {
        if (active) setError(cause instanceof Error ? cause.message : t('Unable to load corrections'));
      });
    return () => {
      active = false;
    };
    // The parent keys this component by task/session; scope is checked again before saving.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, modelId, revisionId]);

  const update = (change: ValueCorrection) => {
    if (isSaving || saved) return;
    setChanges(previous => [
      ...previous.filter(item => item.kind !== change.kind || item.id !== change.id),
      copy(change),
    ]);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || isSaving || saved) return;
    setIsSaving(true);
    setError(undefined);
    let persisted = false;
    let searchRefreshFailed = false;
    try {
      const result = await persistAndRefreshCorrection({
        persist: () =>
          saveValueCorrections({
            baseline: session.baseline,
            revisionId,
            changes,
            loadFresh,
            save: model => api.crowdsourcing.updateCaptureModel(modelId, model),
          }),
        onPersisted: model => {
          persisted = true;
          setSavedModel(model);
        },
        refreshSearch: model => refreshCorrectionSearch(api, model),
      });
      if (!result.searchRefreshed) {
        searchRefreshFailed = true;
        setSearchFailed(true);
        setError(t('Corrections saved, but search could not refresh. Retry search refresh or close this form.'));
        await markCorrectionQueriesStale(cache);
        return;
      }
      await markCorrectionQueriesStale(cache);
      await onClose(true);
    } catch (cause) {
      setError(
        persisted
          ? searchRefreshFailed
            ? t('Corrections saved, but search could not refresh. Retry search refresh or close this form.')
            : t('Corrections were saved, but this review could not refresh. Reload the page.')
          : cause instanceof Error
            ? cause.message
            : t('Unable to save corrections. Try again.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  const retrySearch = async () => {
    if (!savedModel || isSaving) return;
    setIsSaving(true);
    setError(undefined);
    let refreshed = false;
    try {
      // Retry only indexing. The persisted correction must never be written again.
      await refreshCorrectionSearch(api, savedModel);
      refreshed = true;
      setSearchFailed(false);
      await markCorrectionQueriesStale(cache);
      await onClose(true);
    } catch {
      setError(
        refreshed
          ? t('Corrections were saved, but this review could not refresh. Reload the page.')
          : t('Corrections saved, but search could not refresh. Retry search refresh or close this form.')
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={save}
      aria-label={t('Correcting approved values')}
      className="space-y-4 rounded border border-amber-300 bg-amber-50 p-3"
    >
      <p className="text-sm">
        {t(
          'Correct existing values and regions. Contributor attribution and approval stay as they are. Shared values may affect other contributions.'
        )}
      </p>
      <p className="text-xs text-slate-600">
        {t('Values are checked again before saving. Another edit made during the save may still be overwritten.')}
      </p>
      {error ? (
        <p role="alert" className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      {saved ? <p role="status">{t('Corrections saved. Reload this review if it does not refresh.')}</p> : null}
      {!session && !error ? <p role="status">{t('Loading...')}</p> : null}
      <fieldset disabled={isSaving || saved} className="space-y-4">
        {session?.targets.fields.map(field => {
          const plugin = plugins.fields[field.type];
          const change = changes.find(item => item.kind === 'value' && item.id === field.id);
          const value = change?.kind === 'value' ? change.value : field.value;
          return (
            <div key={field.id}>
              <label htmlFor={field.id} className="mb-1 block font-medium">
                {field.label}
              </label>
              {supportedFields.has(field.type) && plugin && !field.immutable ? (
                React.createElement(plugin.Component, {
                  ...field,
                  ...{ disabled: isSaving || saved },
                  value,
                  updateValue: (nextValue: unknown) => update({ kind: 'value', id: field.id, value: nextValue }),
                })
              ) : (
                <div className="text-sm text-slate-600">
                  {plugin ? React.createElement(plugin.TextPreview, { ...field, value }) : null}
                  <p>{t('This value is read-only in this correction view.')}</p>
                </div>
              )}
            </div>
          );
        })}
        {session?.targets.selectors.map(({ label, selector }) => {
          const change = changes.find(item => item.kind === 'selector' && item.id === selector.id);
          return (
            <fieldset key={selector.id} className="rounded border border-amber-200 p-2">
              <legend className="text-sm font-medium">
                {label} — {t('Region')}
              </legend>
              <ExistingBoxCorrection
                selector={selector}
                state={change?.kind === 'selector' ? change.state : selector.state}
                update={state => update({ kind: 'selector', id: selector.id, state })}
              />
            </fieldset>
          );
        })}
      </fieldset>
      <div className="flex flex-wrap items-center gap-2">
        {searchFailed ? (
          <button
            type="button"
            disabled={isSaving}
            aria-busy={isSaving}
            onClick={retrySearch}
            className="rounded border border-slate-400 px-3 py-2 text-sm"
          >
            {isSaving ? t('Refreshing search...') : t('Retry search refresh')}
          </button>
        ) : null}
        <button
          type="submit"
          disabled={!session || !changes.length || isSaving || saved}
          aria-busy={isSaving}
          className="rounded bg-blue-700 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSaving && !saved ? t('Saving...') : t('Save corrections')}
        </button>
        {discarding ? (
          <>
            <span className="text-sm">{t('Discard unsaved corrections?')}</span>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => onClose(false)}
              className="rounded border border-slate-400 px-3 py-2 text-sm"
            >
              {t('Discard changes')}
            </button>
            <button type="button" onClick={() => setDiscarding(false)} className="px-2 text-sm underline">
              {t('Keep editing')}
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isSaving}
            onClick={() => (changes.length && !saved ? setDiscarding(true) : onClose(saved))}
            className="rounded border border-slate-400 px-3 py-2 text-sm"
          >
            {saved ? t('Close') : t('Cancel')}
          </button>
        )}
      </div>
    </form>
  );
}
