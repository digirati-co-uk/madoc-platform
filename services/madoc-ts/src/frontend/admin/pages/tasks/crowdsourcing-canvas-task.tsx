import React, { useMemo, useState } from 'react';
import { CrowdsourcingCanvasTask } from '../../../../gateway/tasks/crowdsourcing-canvas-task';
import { parseUrn } from '../../../../utility/parse-urn';
import { Inspector } from '../../../shared/caputre-models/inspector/Inspector';
import { Editor, EditorProps } from '../../../shared/caputre-models/new/Editor';
import { apiHooks } from '../../../shared/hooks/use-api-query';

export const ViewCrowdsourcingCanvasTask: React.FC<{ projectId: string | number; task: CrowdsourcingCanvasTask }> = ({
  task,
  projectId,
}) => {
  const [contentConfiguration, setContentConfiguration] = useState(0);
  const [configurationIndex, setConfigurationIndex] = useState(0);
  const canvasId = useMemo(() => {
    const parsed = parseUrn(task.subject);
    if (!parsed) {
      throw new Error('Invalid task');
    }
    return parsed.id;
  }, [task.subject]);

  const { data, isFetching } = apiHooks.getSiteProjectCanvasModel(() => [projectId, canvasId], {
    refetchOnWindowFocus: false,
  });
  const { data: model } = apiHooks.getCaptureModel(
    () => (data && data.model && data.model.id ? [data.model.id] : undefined),
    { refetchOnWindowFocus: false }
  );
  const { data: canvas } = apiHooks.getCanvasById(() => [canvasId], { refetchOnWindowFocus: false });

  if (isFetching) {
    return <div>Loading...</div>;
  }

  if (!model) {
    return <div>Could not display</div>;
  }

  // All of the different ways you could configure it.
  const contentConfigurations = [
    // Just the canvas ID.
    {
      canvasId,
    },
    // Explorer with no ID
    {
      explorer: true,
    },
    // Canvas ID with explorer.
    {
      canvasId,
      explorer: true,
    },
    // Capture model target.
    {
      target: model.target,
      ...(canvas || {}),
    },
    // Capture model target without canvas.
    {
      target: model.target,
    },
    // Undefined, load from capture model.
    undefined,
  ];

  const configurations: Array<Partial<EditorProps> & { label: string }> = [
    {
      label: 'Revision - readonly',
      revisionId: '0eff8455-fa65-48da-98a8-62d7a0d7354e',
      readOnly: true,
    },
    {
      label: 'Revision - with editing allowed, starting in read only mode',
      revisionId: '0eff8455-fa65-48da-98a8-62d7a0d7354e',
      readOnly: true,
      allowEditingRevision: true,
    },
    {
      label: 'Revision - with editing allowed',
      revisionId: '0eff8455-fa65-48da-98a8-62d7a0d7354e',
      allowEditingRevision: true,
    },
    {
      label: 'Revision - with navigation',
      revisionId: '0eff8455-fa65-48da-98a8-62d7a0d7354e',
      allowNavigation: true,
    },
    {
      label: 'No revision',
      allowNavigation: true,
    },
  ];

  const { label, ...props } = configurations[configurationIndex];

  return (
    <div>
      <button onClick={() => setContentConfiguration(t => (t + 1) % contentConfigurations.length)}>
        Change content loading
      </button>
      <button onClick={() => setConfigurationIndex(t => (t + 1) % configurations.length)}>Change config loading</button>
      <h1>{label}</h1>
      <Inspector captureModel={model} />
      <Editor captureModel={model} content={contentConfigurations[contentConfiguration]} {...props} />
      <pre>{JSON.stringify(model, null, 2)}</pre>
      <pre>{JSON.stringify(task, null, 2)}</pre>
    </div>
  );
};
