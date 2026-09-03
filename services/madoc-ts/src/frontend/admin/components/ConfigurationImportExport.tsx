import React, { useRef, useState } from 'react';
import deepmerge from 'deepmerge';
import { ErrorMessage } from '../../shared/callouts/ErrorMessage';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import { Button } from '../../shared/navigation/Button';
import { ButtonDropdown, ButtonDropdownDefaultItem } from '../../shared/navigation/ButtonDropdown';

export type ConfigurationScope = 'global' | 'project' | 'site' | 'site-project';

interface ConfigurationImportExportProps<T extends object> {
  configuration: T;
  scope: ConfigurationScope;
  immutableFields?: readonly string[];
  onImport: (configuration: T) => void;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function serialiseConfiguration(scope: ConfigurationScope, configuration: object): string {
  return JSON.stringify({ type: 'madoc-configuration', scope, configuration }, null, 2);
}

export function importConfiguration<T extends object>(
  contents: string,
  scope: ConfigurationScope,
  current: T,
  immutableFields: readonly string[] = []
): T {
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

  const mutableConfiguration = Object.fromEntries(
    Object.entries(imported.configuration).filter(([key]) => !immutableFields.includes(key))
  );

  return deepmerge(current, mutableConfiguration, { arrayMerge: (_current, importedArray) => importedArray }) as T;
}

export function ConfigurationImportExport<T extends object>({
  configuration,
  scope,
  immutableFields,
  onImport,
}: ConfigurationImportExportProps<T>) {
  const fileInput = useRef<HTMLInputElement>(null);
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
      onImport(importConfiguration(await file.text(), scope, configuration, immutableFields));
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
    <div className="relative z-30 mb-6 max-w-[550px] space-y-3 [&_[role=menu]]:left-0 [&_[role=menu]]:right-auto [&_[role=menu]]:z-40 [&_[role=menu]]:min-w-[13rem]">
      <ButtonDropdown
        as={Button}
        items={[
          {
            render: () => (
              <ButtonDropdownDefaultItem className="hover:bg-gray-100">Export configuration</ButtonDropdownDefaultItem>
            ),
            onClick: download,
          },
          {
            render: () => (
              <ButtonDropdownDefaultItem className="hover:bg-gray-100">Import configuration</ButtonDropdownDefaultItem>
            ),
            onClick: () => fileInput.current?.click(),
          },
        ]}
      >
        Config import/export
      </ButtonDropdown>
      <input
        ref={fileInput}
        className="sr-only"
        aria-label="Import configuration"
        type="file"
        accept=".json,application/json"
        onChange={upload}
      />
      {error ? <ErrorMessage role="alert">{error}</ErrorMessage> : null}
      {importedFile ? (
        <SuccessMessage role="status">
          Loaded {importedFile}. Review the configuration and save to apply it.
        </SuccessMessage>
      ) : null}
    </div>
  );
}
