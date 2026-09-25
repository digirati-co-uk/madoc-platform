import React, { ComponentType, FormEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MarkdownEditorModule, { Props as MarkdownEditorProps } from 'rich-markdown-editor';
import { CreateProjectUpdate } from '../../../types/projects';
import { ErrorMessage } from '../../shared/callouts/ErrorMessage';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { ProjectUpdateMarkdown } from './ProjectUpdateMarkdown';

// rich-markdown-editor is CommonJS and is double-wrapped by the frontend's ESM build.
const MarkdownEditor = (
  typeof MarkdownEditorModule === 'function'
    ? MarkdownEditorModule
    : (MarkdownEditorModule as unknown as { default: ComponentType<MarkdownEditorProps> }).default
) as ComponentType<MarkdownEditorProps>;

interface ProjectUpdateFormProps {
  initialTitle?: string;
  initialUpdate?: string;
  initialOpenInNewTab?: boolean;
  isLoading: boolean;
  error?: unknown;
  submitLabel: string;
  onSubmit: (update: CreateProjectUpdate) => void;
  onCancel?: () => void;
}

export function ProjectUpdateForm({
  initialTitle = '',
  initialUpdate = '',
  initialOpenInNewTab = false,
  isLoading,
  error,
  submitLabel,
  onSubmit,
  onCancel,
}: ProjectUpdateFormProps) {
  const { t } = useTranslation();
  const inputId = useId();
  const [title, setTitle] = useState(initialTitle);
  const [update, setUpdate] = useState(initialUpdate);
  const [openInNewTab, setOpenInNewTab] = useState(initialOpenInNewTab);
  const [isPreview, setIsPreview] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ title: title.trim() || undefined, update, openInNewTab });
  };

  return (
    <form onSubmit={submit}>
      {error ? <ErrorMessage $margin>{error instanceof Error ? error.message : t('Failed')}</ErrorMessage> : null}

      <div className="mb-4">
        <label className="block mb-1 font-medium" htmlFor={`${inputId}-title`}>
          {t('Title')}
        </label>
        <input
          id={`${inputId}-title`}
          className="w-full rounded border border-gray-300 px-3 py-2"
          maxLength={200}
          value={title}
          onChange={event => setTitle(event.target.value)}
        />
      </div>

      <label className="mb-4 flex items-center gap-2">
        <input type="checkbox" checked={openInNewTab} onChange={event => setOpenInNewTab(event.target.checked)} />
        {t('Open links in new tab')}
      </label>

      <div className="flex gap-2 border-b border-gray-300 mb-4" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={!isPreview}
          className={`px-3 py-2 border-b-2 ${!isPreview ? 'border-blue-500' : 'border-transparent'}`}
          onClick={() => setIsPreview(false)}
        >
          {t('Edit')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isPreview}
          className={`px-3 py-2 border-b-2 ${isPreview ? 'border-blue-500' : 'border-transparent'}`}
          onClick={() => setIsPreview(true)}
        >
          {t('Preview')}
        </button>
      </div>

      {isPreview ? (
        <div className="min-h-[12rem] rounded border border-gray-300 px-4 py-2 bg-white" role="tabpanel">
          {title.trim() ? <h3 className="text-xl font-semibold mb-3">{title.trim()}</h3> : null}
          <ProjectUpdateMarkdown markdown={update} openInNewTab={openInNewTab} />
        </div>
      ) : (
        <div role="tabpanel">
          <label className="block mb-1 font-medium" id={`${inputId}-update-label`}>
            {t('Update')}
          </label>
          <div
            id={`${inputId}-update`}
            aria-labelledby={`${inputId}-update-label`}
            className="min-h-[12rem] rounded border border-gray-300 bg-white px-4 py-3 [&_.ProseMirror]:min-h-[10rem] [&_.ProseMirror]:outline-none"
          >
            <MarkdownEditor
              defaultValue={update}
              placeholder={t('Write a project update…')}
              onChange={value => setUpdate(value())}
            />
          </div>
        </div>
      )}

      <ButtonRow $noMargin className="mt-4">
        <Button type="submit" $primary disabled={isLoading || !update.trim()}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" onClick={onCancel} disabled={isLoading}>
            {t('Cancel')}
          </Button>
        ) : null}
      </ButtonRow>
    </form>
  );
}
