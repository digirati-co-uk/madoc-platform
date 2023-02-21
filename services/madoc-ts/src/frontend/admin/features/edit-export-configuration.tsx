import React, { useMemo } from 'react';
import { useResourceContext } from 'react-iiif-vault';
import { ExportConfig } from '../../../extensions/project-export/types';
import { EditShorthandCaptureModel } from '../../shared/capture-models/EditorShorthandCaptureModel';
import { EditorSlots } from '../../shared/capture-models/new/components/EditorSlots';
import { useApi } from '../../shared/hooks/use-api';

interface EditExportConfigurationProps {
  config: ExportConfig;
  value?: ExportConfig['configuration'];
  onUpdate: (newValues: any) => void;
}
export function EditExportConfiguration(props: EditExportConfigurationProps) {
  const ctx = useResourceContext();
  const selected = props.config;
  const api = useApi();
  const editorConfig = useMemo<ExportConfig['configuration'] | undefined>(() => {
    // if (selected?.hookConfig) {
    //   const hooked = selected.hookConfig(
    //     { id: 38, type: 'project' },
    //     {
    //       // config,
    //       api,
    //     },
    //     selected?.configuration
    //   );
    //   if (hooked) {
    //     return hooked;
    //   }
    // }

    return selected.configuration;
  }, [selected.configuration]);

  console.log(props);

  if (!editorConfig) {
    // No config.
    return null;
  }

  return (
    <EditShorthandCaptureModel
      slotConfig={{}}
      data={props.value?.defaultValues || selected.configuration?.defaultValues || {}}
      template={props.value?.editor || editorConfig.editor}
      onSave={newData => props.onUpdate(newData)}
      saveLabel="Update"
      // fullDocument={!!document}
      keepExtraFields
      immutableFields={['project_id']}
    >
      <EditorSlots.TopLevelEditor />
    </EditShorthandCaptureModel>
  );
}
