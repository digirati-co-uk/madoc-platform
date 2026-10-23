import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useApi } from '../../../shared/hooks/use-api';
import { AnnotationPageRecord } from '../../../../iiif/types';

interface AnnotationPagesProps {
  resourceId: number;
  allowBackfill?: boolean;
}

type AnnotationMode = 'external' | 'json';

const card = 'm-2 flex flex-col gap-3 rounded-[5px] bg-white p-3 shadow-[0_2px_3px_0_rgba(0,0,0,0.12)] sm:flex-row';
const linkButton =
  'rounded px-2 py-1 text-base text-[#4e66dd] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4e66dd] disabled:opacity-50';
const primaryButton =
  'rounded bg-[#4e66dd] px-4 py-2 text-sm text-white hover:bg-[#3f55c0] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4e66dd] disabled:opacity-50';
const field =
  'block w-full rounded border border-gray-300 p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4e66dd]';

function AnnotationIcon({ stored }: { stored: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        stored ? 'bg-[#4F8B68]' : 'bg-[#595C89]'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
        <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zm-3 11H7v-2h10v2zm0-3H7V8h10v2z" />
      </svg>
    </div>
  );
}

export function AnnotationPages({ resourceId, allowBackfill = false }: AnnotationPagesProps) {
  const api = useApi();
  const {
    data,
    refetch,
    isLoading,
    error: loadError,
  } = useQuery(['annotation-pages-summary', resourceId], () => api.getAnnotationPages(resourceId, true), { refetchInterval: 5000 });
  const [selected, setSelected] = useState<AnnotationPageRecord | null>(null);
  const [mode, setMode] = useState<AnnotationMode>('external');
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>, message = 'Saved') {
    setBusy(true);
    setFeedback('');
    try {
      await action();
      await refetch();
      setFeedback(message);
      return true;
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not save annotations');
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function edit(page: AnnotationPageRecord) {
    setBusy(true);
    setFeedback('');
    try {
      const { pages } = await api.getAnnotationPages(resourceId);
      const stored = pages.find(item => item.id === page.id);
      if (!stored?.properties.document) throw new Error('Annotation page is no longer available');
      setSelected(stored);
      setMode('json');
      setValue(JSON.stringify(stored.properties.document, null, 2));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Could not load annotation page');
    } finally {
      setBusy(false);
    }
  }

  function editSource(page: AnnotationPageRecord) {
    setSelected(page);
    setMode('external');
    setValue(page.uri);
    setFeedback('');
  }

  function reset() {
    setSelected(null);
    setValue('');
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const ok = await run(
      async () => {
        const input =
          mode === 'external'
            ? { mode, url: value.trim() }
            : { mode, page: JSON.parse(value) as Record<string, unknown> };
        if (selected) await api.updateAnnotationPage(resourceId, selected.id, input);
        else await api.addAnnotationPage(resourceId, input);
      },
      mode === 'external' ? 'Annotation fetch queued' : 'Annotations saved'
    );
    if (ok) reset();
  }

  const valueId = `annotation-value-${resourceId}`;
  const modeId = `annotation-mode-${resourceId}`;

  return (
    <section aria-label="Annotation pages" className="w-full">
      <div className="m-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Annotation pages</h2>
          <p className="text-sm text-gray-600">
            Imported annotation pages are included in the exported manifest. Remote pages are stored locally.
          </p>
        </div>
        {allowBackfill ? (
          <button
            type="button"
            className={linkButton}
            disabled={busy}
            onClick={() =>
              run(() => api.backfillIIIFProperties(resourceId), 'Import task queued. Existing edits will be kept.')
            }
          >
            Restore properties from source
          </button>
        ) : null}
      </div>

      {isLoading ? <p className="m-2 text-sm">Loading annotation pages…</p> : null}
      {loadError ? (
        <p role="alert" className="m-2 text-sm text-red-700">
          Could not load annotation pages.
        </p>
      ) : null}

      {data?.pages.map(page => {
        const name = page.label || page.uri;
        const sourceUrl = /^https?:\/\//i.test(page.uri) ? page.uri : undefined;
        return (
          <div key={page.id} className={card}>
            <AnnotationIcon stored={page.properties.status === 'ready'} />
            <div className="min-w-0 flex-1">
              <div className="text-[1.1em] font-semibold">{page.label}</div>
              <div className="text-[0.85em] text-gray-500">
                {page.properties.status === 'ready'
                  ? 'Stored locally'
                  : page.properties.status === 'pending'
                    ? 'Fetching page…'
                    : 'Could not load page'}
                {' · '}
                {page.properties.mode === 'external' ? 'External page' : 'JSON page'}
                {page.properties.annotationCount !== undefined
                  ? ` · ${page.properties.annotationCount} annotations`
                  : null}
              </div>
              <div className="break-all text-xs font-semibold">
                {sourceUrl ? (
                  <a
                    className="text-[#4e66dd] no-underline hover:underline"
                    href={sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {page.uri}
                  </a>
                ) : (
                  page.uri
                )}
              </div>
              {page.properties.fetchedAt ? (
                <p className="text-xs text-gray-600">Last saved: {page.properties.fetchedAt}</p>
              ) : null}
              {page.properties.textError ? (
                <p className="mt-1 text-sm text-amber-700">
                  Page stored; some plaintext could not be loaded: {page.properties.textError}
                </p>
              ) : null}
              {page.properties.error ? (
                <p role="alert" className="mt-1 text-sm text-red-700">
                  {page.properties.error}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-start gap-1 sm:justify-end">
              {page.properties.hasDocument ? (
                <button
                  type="button"
                  className={linkButton}
                  disabled={busy}
                  aria-label={`Edit JSON for ${name}`}
                  onClick={() => edit(page)}
                >
                  Edit JSON
                </button>
              ) : null}
              {page.properties.mode === 'external' ? (
                <>
                  <button
                    type="button"
                    className={linkButton}
                    disabled={busy}
                    aria-label={`Edit source for ${name}`}
                    onClick={() => editSource(page)}
                  >
                    Edit source
                  </button>
                  <button
                    type="button"
                    className={linkButton}
                    disabled={busy}
                    aria-label={`Refresh ${name}`}
                    onClick={() => run(() => api.refreshAnnotationPage(resourceId, page.id), 'Refresh queued')}
                  >
                    Refresh / retry
                  </button>
                </>
              ) : null}
              <button
                type="button"
                className={`${linkButton} !text-red-700`}
                disabled={busy}
                aria-label={`Remove ${name}`}
                onClick={() => run(() => api.deleteAnnotationPage(resourceId, page.id), 'Page removed')}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}

      <form onSubmit={save} className={`${card} sm:flex-col`}>
        {!selected ? (
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor={modeId}>
              Add annotation page
            </label>
            <select
              id={modeId}
              value={mode}
              onChange={event => {
                setMode(event.target.value as AnnotationMode);
                setValue('');
              }}
              className={`${field} sm:w-auto`}
            >
              <option value="external">External URL</option>
              <option value="json">JSON page</option>
            </select>
          </div>
        ) : (
          <p className="text-sm font-medium">Edit page: {selected.label || selected.uri}</p>
        )}
        <div>
          <label className="mb-1 block text-sm text-gray-600" htmlFor={valueId}>
            {mode === 'external' ? 'Annotation page URL' : 'Annotation page JSON'}
          </label>
          {mode === 'external' ? (
            <input
              id={valueId}
              type="url"
              required
              value={value}
              onChange={event => setValue(event.target.value)}
              placeholder="https://example.org/annotations/page.json"
              className={field}
            />
          ) : (
            <textarea
              id={valueId}
              required
              rows={12}
              value={value}
              onChange={event => setValue(event.target.value)}
              spellCheck={false}
              className={`${field} font-mono text-sm`}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={primaryButton} type="submit" disabled={busy}>
            {selected ? 'Save page' : 'Add page'}
          </button>
          {selected ? (
            <button className={linkButton} type="button" disabled={busy} onClick={reset}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <p role="status" aria-live="polite" className="m-2 min-h-[1.25rem] text-sm">
        {feedback}
      </p>
    </section>
  );
}
