import { getValue } from '@iiif/vault-helpers';
import deepmerge from 'deepmerge';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import invariant from 'tiny-invariant';
import { ExportResourceRequest } from '../../../extensions/project-export/types';
import { BaseTask } from '../../../gateway/tasks/base-task';
import { FilePreview } from '../../shared/components/FilePreview';
import { LocaleString } from '../../shared/components/LocaleString';
import { RichSelectionGrid } from '../../shared/components/RichSelectionGrid';
import { RootStatistics } from '../../shared/components/RootStatistics';
import { Stepper, StepperContainer } from '../../shared/components/Stepper';
import { useApi } from '../../shared/hooks/use-api';
import { useProjectExports } from '../../shared/hooks/use-project-exports';
import { EmptyState } from '../../shared/layout/EmptyState';
import { ProjectExportSnippet } from '../components/ProjectExportSnippet/ProjectExportSnippet';
import { useExportBuilder } from '../stores/export-builder';
import { EditExportConfiguration } from './edit-export-configuration';
import { shallow } from 'zustand/shallow';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { ErrorMessage } from '../../shared/callouts/ErrorMessage';

export function BuildProjectExport() {
  const params = useParams<{ id: string }>();
  const configs = useProjectExports();
  const store = useExportBuilder();
  const [finishChoice, setFinishChoices] = useState(false);
  const selectedTypes = useExportBuilder((s: any) => Object.keys(s.choices), shallow);
  const allComplete =
    useExportBuilder(
      (s: any) =>
        Object.entries(s.choices).reduce((acc, [, next]) => {
          return acc && (next as any).is_complete;
        }, true),
      shallow
    ) && selectedTypes.length > 0;

  const api = useApi();
  const [rootStatistics, setRootStatistics] = useState<Partial<BaseTask['root_statistics']>>({});
  const [generateExport, generateExportStatus] = useMutation(async () => {
    const exportPlan: any = {
      canvas: [],
      manifest: [],
      project: [],
    };
    const choices = Object.entries(store.choices).map(([a, b]) => [a, (b as any).config]);
    for (const [plan, planConfig] of choices) {
      const config = configs.find(s => s.type === plan);
      if (config) {
        for (const supported of config.supportedTypes) {
          exportPlan[supported] = exportPlan[supported] ? exportPlan[supported] : [];
          exportPlan[supported].push([plan, planConfig]);
        }
      }
    }

    invariant(params.id);

    const temp = `project-${params.id}-${Date.now()}`;

    const input: Omit<ExportResourceRequest, 'context' | 'subject'> = {
      subjectExports: exportPlan.project || [],
      // Need to sort into these exports.
      exportPlan: exportPlan,
      standalone: false,
      // Need the output.
      output: {
        type: 'zip',
        path: `projects/${params.id}`,
        options: { tempDir: `temp/${temp}` },
        fileName: `${temp}.zip`,
      },
    };

    const { task } = await api.createProjectExport(params.id, {
      label: `Export of ${temp}`,
      request: input,
    });

    if (!task) {
      throw new Error('Unknown error');
    }

    return await api.wrapTask(
      Promise.resolve(task),
      t => {
        return t;
      },
      {
        setRootStatistics,
        root: true,
      }
    );
  });

  useEffect(() => () => store.reset(), []);

  const isGenerating = !generateExportStatus.isIdle;

  return (
    <>
      <StepperContainer>
        <Stepper
          status={finishChoice || isGenerating ? 'done' : 'progress'}
          title="Choose options"
          description="Click to edit selection"
          open={!finishChoice && !isGenerating}
          onClickDescription={() => setFinishChoices(false)}
        >
          <RichSelectionGrid
            selected={selectedTypes}
            onSelect={type => {
              if (selectedTypes.includes(type)) {
                store.remove(type);
              } else {
                const full = configs.find(s => s.type === type);
                if (full) {
                  let config: any = deepmerge({}, full?.configuration?.defaultValues || {});
                  if (full.supportedContexts?.includes('project_id')) {
                    config.project_id = `urn:madoc:project:${params.id}`;
                  }
                  if (full?.hookConfig) {
                    config = full.hookConfig(
                      { id: Number(params.id), type: 'project' },
                      {
                        config,
                        api,
                      },
                      full?.configuration
                    );
                  }

                  console.log('config -> ', config);

                  store.add(type, config, !full.configuration);
                }
              }
            }}
            items={configs.map(item => ({
              id: item.type,
              label: item.metadata.label,
              description: item.metadata.description,
            }))}
          />

          <ButtonRow>
            <Button $primary onClick={() => setFinishChoices(true)}>
              Close and continue
            </Button>
          </ButtonRow>
        </Stepper>

        {configs.map(selected => {
          if (!selectedTypes.includes(selected.type)) {
            return null;
          }

          const status = selected.configuration && !store.choices[selected.type].is_complete ? 'progress' : 'done';

          console.log('selected', store.choices[selected.type].config);

          return (
            <Stepper
              status={store.choices[selected.type].is_complete ? 'done' : 'progress'}
              title={getValue(selected.metadata.label)}
              description={getValue(selected.metadata.description)}
              onClickDescription={() => (selected.configuration ? store.uncomplete(selected.type) : void 0)}
              open={status !== 'done' && !isGenerating}
              key={selected.type}
            >
              <LocaleString>{selected.metadata.label}</LocaleString>
              {selected.configuration ? (
                <EditExportConfiguration
                  config={selected}
                  value={store.choices[selected.type].config}
                  onUpdate={newValues => {
                    store.configure(selected.type, newValues);
                    store.complete(selected.type);
                  }}
                />
              ) : (
                <EmptyState>
                  No configuration options
                  <Button onClick={() => store.complete(selected.type)}>Save and close</Button>
                </EmptyState>
              )}
            </Stepper>
          );
        })}

        <Stepper
          status={isGenerating ? 'done' : allComplete ? 'progress' : 'todo'}
          title="Start export"
          description="Starting export"
          open={allComplete && !isGenerating}
        >
          <h4>Selected configuration</h4>
          <FilePreview fileName="config.json" download={false}>
            {{
              type: 'text',
              value: JSON.stringify(
                Object.entries(store.choices).map(([a, b]) => [a, (b as any).config]),
                null,
                2
              ),
            }}
          </FilePreview>

          <ButtonRow>
            <Button $primary onClick={() => generateExport()}>
              Generate export
            </Button>
          </ButtonRow>
        </Stepper>

        {isGenerating ? (
          <Stepper
            status={'progress'}
            title={generateExportStatus.isLoading ? 'Loading...' : 'Download export'}
            description=""
            open={true}
          >
            {generateExportStatus.isLoading && rootStatistics ? <RootStatistics {...rootStatistics} /> : null}

            {generateExportStatus.isError ? (
              <>
                <ErrorMessage>Could not generate export.</ErrorMessage>
                <FilePreview fileName="task.json" download={false}>
                  {{ type: 'json', value: JSON.stringify(generateExportStatus.error, null, 2) || '' }}
                </FilePreview>
              </>
            ) : null}

            {generateExportStatus.isSuccess ? (
              <div style={{ maxWidth: 400 }}>
                <ProjectExportSnippet
                  task={generateExportStatus.data as any}
                  taskLink={`/tasks/${generateExportStatus.data?.id}`}
                  apiDownload
                />
              </div>
            ) : null}
          </Stepper>
        ) : null}
      </StepperContainer>
    </>
  );
}
