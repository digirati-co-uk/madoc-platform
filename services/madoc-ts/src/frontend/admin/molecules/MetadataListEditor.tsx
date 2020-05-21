import React, { useEffect, useState } from 'react';
import { MetadataDiff, MetadataEditor, MetadataEditorProps } from './MetadataEditor';
import { useMutation } from 'react-query';
import { Button } from '../atoms/Button';
import { MetadataDefinition } from '../../../types/schemas/metadata-definition';
import { useTranslation } from 'react-i18next';
import { ParsedMetadata } from '../../../utility/map-metadata-list';

export const MetadataListItem: React.FC<{
  labelKey: string;
  itemKey: string;
  items: MetadataDefinition[];
  onSaveField: MetadataEditorProps['onSave'];
  availableLanguages: string[];
}> = ({ labelKey, itemKey, items, onSaveField, availableLanguages }) => {
  const { t } = useTranslation();
  return (
    <div>
      <label htmlFor={itemKey}>{t(labelKey, { context: 'metadata' })}</label>
      <MetadataEditor
        id={itemKey}
        fields={items}
        metadataKey={itemKey}
        onSave={onSaveField}
        availableLanguages={availableLanguages}
      />
    </div>
  );
};

export const MetadataSection: React.FC<{
  sectionKey: string;
  metadata: ParsedMetadata;
  onSaveField: MetadataEditorProps['onSave'];
  availableLanguages: string[];
}> = ({ sectionKey, metadata, onSaveField, availableLanguages }) => {
  const keys = Object.keys(metadata);

  return (
    <div style={{ margin: 10, padding: 20 }}>
      {keys.map((itemId, itemIndex) => {
        const item = metadata[itemId];
        const itemKey = `${sectionKey}.${itemIndex}.${itemId}`;
        if (Array.isArray(item)) {
          return null; // not supported.
        }

        return (
          <MetadataListItem
            key={itemKey}
            labelKey={itemId}
            items={item.items}
            itemKey={itemKey}
            onSaveField={onSaveField}
            availableLanguages={availableLanguages}
          />
        );
      })}
    </div>
  );
};

export const MetadataListEditor: React.FC<{
  metadata: ParsedMetadata;
  template?: string[];
  onSave: (opts: { diff: MetadataDiff; empty: boolean }) => void;
}> = ({ metadata, onSave, template = [] }) => {
  // Props
  const metadataKeys = Object.keys(metadata).sort((a, b) => template.indexOf(a) - template.indexOf(b));
  const availableLanguages = ['en', 'es', 'fr'];
  const templateKeys = template.filter(key => metadataKeys.indexOf(key) === -1);

  // State.
  const [metadataMap, setMetadataMap] = useState<{ [key: string]: MetadataDiff }>({});

  const [saveChanges] = useMutation(async () => {
    const keys = Object.keys(metadataMap);

    const fullDiff: MetadataDiff = {
      added: [],
      modified: [],
      removed: [],
    };

    if (keys.length === 0) {
      onSave({ diff: fullDiff, empty: true });
      return;
    }

    for (const key of keys) {
      const diff = metadataMap[key];
      fullDiff.added.push(...diff.added);
      fullDiff.modified.push(...diff.modified);
      fullDiff.removed.push(...diff.removed);
    }

    onSave({ diff: fullDiff, empty: false });
  });

  const onSaveField: MetadataEditorProps['onSave'] = diff => {
    // Diff map:
    // { key: Diff }
    // When save is hit, then we merge these
    // The most up-to-date diff for each key will be recorded.
    setMetadataMap(mapping => {
      return { ...mapping, [diff.key]: diff.getDiff() };
    });
  };

  return (
    <>
      {metadataKeys.map(itemId => {
        const item = metadata[itemId];
        if (Array.isArray(item)) {
          return (
            <div style={{ marginLeft: 10, border: '2px solid #ddd', padding: 20 }}>
              <h4>{itemId}</h4>
              {item.map((section, key) => {
                return (
                  <MetadataSection
                    metadata={section}
                    key={key}
                    sectionKey={itemId}
                    onSaveField={onSaveField}
                    availableLanguages={availableLanguages}
                  />
                );
              })}
            </div>
          );
        }
        return (
          <MetadataListItem
            key={itemId}
            itemKey={itemId}
            labelKey={itemId}
            items={item.items}
            onSaveField={onSaveField}
            availableLanguages={availableLanguages}
          />
        );
      })}
      {templateKeys.map(templateKey => (
        <MetadataListItem
          key={templateKey}
          itemKey={templateKey}
          labelKey={templateKey}
          items={[]}
          onSaveField={onSaveField}
          availableLanguages={availableLanguages}
        />
      ))}
      <Button onClick={() => saveChanges()}>Save changes</Button>
    </>
  );
};
