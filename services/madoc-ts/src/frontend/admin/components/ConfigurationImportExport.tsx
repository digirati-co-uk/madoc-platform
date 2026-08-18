import React, { useState } from 'react';
import { ErrorMessage } from '../../shared/callouts/ErrorMessage';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import { Button } from '../../shared/navigation/Button';

export type ConfigurationScope = 'global' | 'site';

interface ConfigurationImportExportProps<T extends object> {
  configuration: T;
  scope: ConfigurationScope;
  onImport: (configuration: T) => void;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function serialiseConfiguration(scope: ConfigurationScope, configuration: object): string {
  return JSON.stringify({ type: 'madoc-configuration', scope, configuration }, null, 2);
}

export function importConfiguration<T extends object>(contents: string, scope: ConfigurationScope, current: T): T {
  const imported: unknown = JSON.parse(contents);

  if (!isObject(imported) || imported.type !== 'madoc-configuration') {
    throw new Error('Not a Madoc configuration file');
  }
  if (imported.scope !== scope) {
    throw new Error(`Expected a ${scope} configuration file`);
  }
  if (!isObject(imported.configuration)) {
    throw new Error('Configuration must be a JSON object');
  }

  return { ...current, ...imported.configuration };
}

export function ConfigurationImportExport<T extends object>({
  configuration,
  scope,
  onImport,
}: ConfigurationImportExportProps<T>) {
  const [error, setError] = useState<string>();
  const [importedFile, setImportedFile] = useState<string>();

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([serialiseConfiguration(scope, configuration)], { type: 'application/json' })
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `madoc-${scope}-configuration.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    try {
      onImport(importConfiguration(await file.text(), scope, configuration));
      setError(undefined);
      setImportedFile(file.name);
    } catch (uploadError) {
      setImportedFile(undefined);
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to import configuration');
    } finally {
      input.value = '';
    }
  };

  return (
    <div className="mb-6 max-w-[550px] space-y-3">
      <p>Export the current configuration, or import a JSON file to review before saving.</p>
      <Button onClick={download}>Export configuration</Button>
      <div>
        <label className="mb-1 block font-semibold" htmlFor={`${scope}-configuration-import`}>
          Import configuration
        </label>
        <input id={`${scope}-configuration-import`} type="file" accept=".json,application/json" onChange={upload} />
      </div>
      {error ? <ErrorMessage role="alert">{error}</ErrorMessage> : null}
      {importedFile ? (
        <SuccessMessage role="status">
          Loaded {importedFile}. Review the configuration and save to apply it.
        </SuccessMessage>
      ) : null}
    </div>
  );
}
