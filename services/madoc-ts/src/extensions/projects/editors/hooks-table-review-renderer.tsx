import React, { useMemo } from 'react';
import { useCaptureModelEditorApi } from '../../../frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { useReviewRendererContext } from '../../../frontend/site/pages/tasks/review-renderers/review-renderer-context';
import {
  CustomAdminPreviewRendererProps,
  CustomReviewRendererProps,
} from '../../../frontend/site/pages/tasks/review-renderers/types';
import { Button } from '../../../frontend/shared/navigation/Button';

type HooksTableLayoutProps = {
  mode: 'read' | 'write';
  subjectType: 'canvas' | 'manifest';
  viewer?: React.ReactNode;
  saveControl?: React.ReactNode;
  controls?: React.ReactNode;
  DefaultControls?: React.FC<any>;
  meta?: React.ReactNode;
};

const HooksTableLayout: React.FC<HooksTableLayoutProps> = ({
  mode,
  subjectType,
  viewer,
  saveControl,
  controls,
  DefaultControls,
  meta,
}) => {
  const table = useCaptureModelEditorApi({ tableProperty: 'rows' });
  const isReadOnly = mode === 'read';
  const topLevelKeys = useMemo(() => Object.keys(table.topLevelFields), [table.topLevelFields]);

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
      <div className="flex min-h-0 min-w-0 flex-1">
        {subjectType === 'canvas' ? <div className="basis-1/2 min-w-0 overflow-hidden border-r border-gray-300">{viewer}</div> : null}
        <div className="flex min-h-full min-w-0 basis-1/2 flex-col overflow-auto">
          <div className="flex flex-col gap-3 p-3">
            {subjectType === 'manifest' ? <div>No image preview for manifest reviews.</div> : null}
            {!isReadOnly ? (
              <div className="flex gap-2">
                <Button onClick={() => table.addRow()}>Add row</Button>
              </div>
            ) : null}
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr>
                  {table.columns.map(column => (
                    <th key={column.key} className="border border-gray-300 p-2 align-top">
                      {column.label}
                    </th>
                  ))}
                  {!isReadOnly ? <th className="border border-gray-300 p-2 align-top">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {table.rows.map(row => (
                  <tr key={row.entityId}>
                    {table.columns.map(column => {
                      const cell = row.getCell(column.key);
                      const value = String(cell?.value ?? '');
                      return (
                        <td key={column.key} className="border border-gray-300 p-2 align-top">
                          {isReadOnly ? (
                            <div>{value || '-'}</div>
                          ) : (
                            <input
                              value={value}
                              className="w-full rounded border border-gray-300 p-1"
                              onChange={e => row.setCell(column.key, e.target.value)}
                            />
                          )}
                        </td>
                      );
                    })}
                    {!isReadOnly ? (
                      <td className="border border-gray-300 p-2 align-top">
                        <Button onClick={() => table.removeRow(row.rowIndex)} disabled={table.rowCount < 2}>
                          Remove
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>

            {topLevelKeys.length ? (
              <div className="flex flex-col gap-2">
                <strong>Top-level fields</strong>
                {topLevelKeys.map(property => (
                  <div key={property}>
                    <label htmlFor={`table-top-level-${property}`}>
                      <strong>{property}</strong>
                    </label>
                    {(table.topLevelFields[property] || []).map((field, index) => (
                      <div key={`${property}-${field.fieldId || index}`}>
                        {isReadOnly ? (
                          <div>{String(field.value || '-')}</div>
                        ) : (
                          <textarea
                            id={`table-top-level-${property}`}
                            className="min-h-16 w-full rounded border border-gray-300 p-1"
                            value={String(field.value || '')}
                            onChange={e => field.setValue(e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : null}

            {saveControl ? <div>{saveControl}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HooksTableReviewRenderer: React.FC<CustomReviewRendererProps> = props => {
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
};

export const HooksTableAdminPreviewRenderer: React.FC<CustomAdminPreviewRendererProps> = props => {
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
};
