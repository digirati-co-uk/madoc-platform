import React, { useEffect, useState } from 'react';
import { MetadataDiff, MetadataEditor, MetadataEditorProps } from './MetadataEditor';
import { useMutation } from 'react-query';
import { Button } from '../../shared/atoms/Button';
import { MetadataDefinition } from '../../../types/schemas/metadata-definition';
import { useTranslation } from 'react-i18next';
import { ParsedMetadata } from '../../../utility/map-metadata-list';
import { Heading3 } from '../../shared/atoms/Heading3';

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
  sectionIndex: number;
  sectionKey: string;
  metadata: ParsedMetadata;
  onSaveField: MetadataEditorProps['onSave'];
  availableLanguages: string[];
}> = ({ sectionKey, sectionIndex, metadata, onSaveField, availableLanguages }) => {
  const keys = Object.keys(metadata);
  const [isRemoved, setIsRemoved] = useState(false);

  const undoRemove = () => {
    if (onSaveField) {
      for (const itemId of keys) {
        onSaveField({
          items: [],
          key: `${sectionKey}.${sectionIndex}.${itemId}`,
          toInternationalString() {
            return {}; // @todo figure out how to implement this part.
          },
          getDiff() {
            return {
              added: [],
              modified: [],
              removed: [],
            };
          },
        });
      }
    }
    setIsRemoved(false);
  };

  const removeAll = () => {
    if (onSaveField) {
      for (const itemId of keys) {
        const item = metadata[itemId];
        if (Array.isArray(item)) continue;

        onSaveField({
          items: [],
          key: `${sectionKey}.${sectionIndex}.${itemId}`,
          getDiff() {
            return {
              added: [],
              modified: [],
              removed: item.items.map(arr => {
                return arr.id;
              }),
            };
          },
          toInternationalString() {
            return {};
          },
        });
      }
      setIsRemoved(true);
    }
  };

  if (isRemoved) {
    return (
      <div style={{ padding: '4em' }}>
        Field removed, <Button onClick={undoRemove}>undo</Button>
      </div>
    );
  }

  return (
    <div style={{ margin: 10, padding: 20 }}>
      {keys.map(itemId => {
        const item = metadata[itemId];
        const itemKey = `${sectionKey}.${sectionIndex}.${itemId}`;
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
      <button onClick={removeAll}>Remove</button>
    </div>
  );
};

export const MetadataSectionEditor: React.FC<{
  itemId: string;
  item: ParsedMetadata[];
  onSaveField: MetadataEditorProps['onSave'];
  availableLanguages: string[];
}> = ({ itemId, item, onSaveField, availableLanguages }) => {
  const [newSections, setNewSections] = useState<ParsedMetadata[]>([]);

  const addNewSection = () => {
    setNewSections(sections => [
      ...sections,
      {
        label: { type: 'values', items: [] },
        value: { type: 'values', items: [] },
      },
    ]);
  };

  return (
    <div style={{ marginBottom: 20, border: '2px solid #ddd', padding: 10 }}>
      <Heading3 style={{ marginLeft: 20 }}>{itemId}</Heading3>
      {item.map((section, key) => {
        return (
          <MetadataSection
            sectionIndex={key}
            metadata={section}
            key={key}
            sectionKey={itemId}
            onSaveField={onSaveField}
            availableLanguages={availableLanguages}
          />
        );
      })}
      {newSections.map((section, key) => {
        return (
          <MetadataSection
            sectionIndex={key + item.length}
            metadata={section}
            key={key}
            sectionKey={itemId}
            onSaveField={onSaveField}
            availableLanguages={availableLanguages}
          />
        );
      })}
      <Button onClick={addNewSection}>Add new {itemId} field</Button>
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
      <pre>{JSON.stringify(metadataMap, null, 2)}</pre>
      {metadataKeys.map(itemId => {
        const item = metadata[itemId];
        if (Array.isArray(item)) {
          return (
            <MetadataSectionEditor
              availableLanguages={availableLanguages}
              item={item}
              itemId={itemId}
              onSaveField={onSaveField}
            />
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
