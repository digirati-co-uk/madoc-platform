import React from 'react';
import { useCaptureModelEditorApi } from '../../../frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { useReviewRendererContext } from '../../../frontend/site/pages/tasks/review-renderers/review-renderer-context';
import {
  CustomAdminPreviewRendererProps,
  CustomReviewRendererProps,
} from '../../../frontend/site/pages/tasks/review-renderers/types';
import { Button } from '../../../frontend/shared/navigation/Button';
import { HooksTableGridRenderer, HooksTableTopLevelFieldsModalButton } from './hooks-table-grid-renderer';

type HooksTableLayoutProps = {
  mode: 'read' | 'write';
  subjectType: 'canvas' | 'manifest';
  viewer?: React.ReactNode;
  saveControl?: React.ReactNode;
  controls?: React.ReactNode;
  DefaultControls?: React.ComponentType<{ compact?: boolean }>;
  meta?: React.ReactNode;
};

function HooksTableLayout({
  mode,
  subjectType,
  viewer,
  saveControl,
  controls,
  DefaultControls,
  meta,
}: HooksTableLayoutProps) {
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });
  const isReadOnly = mode === 'read';

  if (table.status !== 'ready') {
    return (
      <div className="flex h-full min-h-0 flex-col">
        {controls || (DefaultControls ? <DefaultControls /> : null)}
        <div className="p-4">
          <strong>Table configuration unavailable.</strong>
          {table.errors.length ? <pre className="mt-2 whitespace-pre-wrap">{table.errors.join('\n')}</pre> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {controls || (DefaultControls ? <DefaultControls /> : null)}
      {meta ? <div className="flex flex-wrap gap-4 border-b border-gray-300 bg-gray-100 px-3 py-2 text-sm">{meta}</div> : null}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 basis-1/2 border-b border-gray-300">
          {subjectType === 'canvas' ? (
            <div className="h-full min-h-0">{viewer}</div>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-700">
              No image preview for manifest reviews.
            </div>
          )}
        </div>
        <div className="min-h-0 basis-1/2 overflow-auto">
          <div className="flex flex-col gap-3 p-3">
            <div className="flex flex-wrap gap-2">
              {!isReadOnly ? <Button onClick={() => table.addRow()}>Add row</Button> : null}
              <HooksTableTopLevelFieldsModalButton table={table} mode={mode} />
            </div>

            <HooksTableGridRenderer table={table} mode={mode} />

            {saveControl ? <div>{saveControl}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HooksTableReviewRenderer(props: CustomReviewRendererProps) {
  const review = useReviewRendererContext();

  return (
    <HooksTableLayout
      mode={props.mode}
      subjectType={props.subjectType}
      viewer={props.viewer}
      saveControl={props.saveControl}
      controls={props.controls || <props.DefaultControls />}
      DefaultControls={props.DefaultControls}
      meta={
        <>
          <span>Task: {review.task.name}</span>
          <span>Assignee: {review.assigneeName || 'Unassigned'}</span>
          <span>Mode: {review.mode}</span>
        </>
      }
    />
  );
}

export function HooksTableAdminPreviewRenderer(props: CustomAdminPreviewRendererProps) {
  return (
    <HooksTableLayout
      mode={props.mode}
      subjectType={props.subjectType}
      viewer={props.viewer}
      saveControl={props.saveControl}
      controls={props.controls}
      DefaultControls={props.DefaultControls}
    />
  );
}
