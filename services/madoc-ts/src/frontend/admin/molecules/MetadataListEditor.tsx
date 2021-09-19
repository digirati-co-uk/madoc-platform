import React, { useEffect, useState } from 'react';
import { useDefaultLocale, useSupportedLocales, useUser } from '../../shared/hooks/use-site';
import { MetadataDiff, MetadataEditor, MetadataEditorProps } from './MetadataEditor';
import { useMutation } from 'react-query';
import { Button } from '../../shared/navigation/Button';
import { MetadataDefinition } from '../../../types/schemas/metadata-definition';
import { useTranslation } from 'react-i18next';
import { ParsedMetadata } from '../../../utility/map-metadata-list';
import { Heading3 } from '../../shared/typography/Heading3';

export const MetadataListItem: React.FC<{
  labelKey: string;
  itemKey: string;
  items: MetadataDefinition[];
  onSaveField: MetadataEditorProps['onSave'];
  availableLanguages: string[];
  defaultLocale?: string;
}> = ({ labelKey, itemKey, items, onSaveField, availableLanguages, defaultLocale }) => {
  const { t } = useTranslation();
  return (
    <div>
      <label htmlFor={itemKey} style={{ marginBottom: `5px`, display: `block` }}>
        {t(labelKey, { context: 'metadata' })}
      </label>
      <MetadataEditor
        id={itemKey}
        fields={items}
        metadataKey={itemKey}
        onSave={onSaveField}
        availableLanguages={availableLanguages}
        defaultLocale={defaultLocale}
      />
    </div>
  );
};

export const MetadataSection: React.FC<{
  sectionIndex?: number;
  sectionKey: string;
  metadata: ParsedMetadata;
  onSaveField: MetadataEditorProps['onSave'];
  availableLanguages: string[];
  defaultLocale?: string;
  fixedItems?: boolean;
}> = ({ sectionKey, sectionIndex, metadata, onSaveField, availableLanguages, defaultLocale, fixedItems }) => {
  const keys = Object.keys(metadata);
  const [isRemoved, setIsRemoved] = useState(false);

  const indexStr = typeof sectionIndex === 'undefined' ? '' : `${sectionIndex}.`;

  const undoRemove = () => {
    if (onSaveField) {
      for (const itemId of keys) {
        onSaveField({
          items: [],
          key: `${sectionKey}.${indexStr}${itemId}`,
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
          key: `${sectionKey}.${indexStr}${itemId}`,
          getDiff() {
            return {
              added: [],
              modified: [],
              removed: (item as any).items.map((arr: any) => {
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
        const itemKey = `${sectionKey}.${indexStr}${itemId}`;
        if (Array.isArray(item)) {
          return null; // not supported.
        }

        return (
          <MetadataListItem
            key={itemKey}
            labelKey={itemId}
            items={(item as any).items}
            itemKey={itemKey}
            onSaveField={onSaveField}
            availableLanguages={availableLanguages}
            defaultLocale={defaultLocale}
          />
        );
      })}
      {fixedItems ? null : <Button onClick={removeAll}>Remove</Button>}
    </div>
  );
};

export const MetadataSectionEditor: React.FC<{
  itemId: string;
  item: ParsedMetadata[];
  onSaveField: MetadataEditorProps['onSave'];
  availableLanguages: string[];
  defaultLocale?: string;
}> = ({ itemId, item, onSaveField, availableLanguages, defaultLocale }) => {
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
            defaultLocale={defaultLocale}
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
            defaultLocale={defaultLocale}
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
  loading?: boolean;
}> = ({ metadata, onSave, template = [], loading }) => {
  const { t } = useTranslation();
  // Props
  const metadataKeys = Object.keys(metadata).sort((a, b) => template.indexOf(a) - template.indexOf(b));
  const availableLanguages = useSupportedLocales();
  const defaultLocale = useDefaultLocale();
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
      {!metadata.metadata ? (
        <MetadataSectionEditor
          availableLanguages={availableLanguages}
          item={[]}
          itemId={'metadata'}
          onSaveField={onSaveField}
          defaultLocale={defaultLocale}
        />
      ) : null}

      {metadataKeys.indexOf('requiredStatement') === -1 ? (
        <MetadataSection
          fixedItems={true}
          metadata={{
            label: [],
            value: [],
          }}
          sectionKey={'requiredStatement'}
          onSaveField={onSaveField}
          availableLanguages={availableLanguages}
          defaultLocale={defaultLocale}
        />
      ) : null}

      {metadataKeys.map(itemId => {
        const item = metadata[itemId];

        if (Array.isArray(item)) {
          return (
            <MetadataSectionEditor
              key={itemId}
              availableLanguages={availableLanguages}
              defaultLocale={defaultLocale}
              item={item}
              itemId={itemId}
              onSaveField={onSaveField}
            />
          );
        }

        if ((item as any).label && (item as any).value) {
          return (
            <div>
              <Heading3 style={{ marginLeft: 20 }}>{itemId}</Heading3>
              <MetadataSection
                fixedItems={true}
                metadata={item as any}
                key={itemId}
                sectionKey={itemId}
                onSaveField={onSaveField}
                availableLanguages={availableLanguages}
                defaultLocale={defaultLocale}
              />
            </div>
          );
        }

        return (
          <MetadataListItem
            key={itemId}
            itemKey={itemId}
            labelKey={itemId}
            items={(item as any).items}
            onSaveField={onSaveField}
            availableLanguages={availableLanguages}
            defaultLocale={defaultLocale}
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
          defaultLocale={defaultLocale}
        />
      ))}
      <Button disabled={!!loading} onClick={() => saveChanges()}>
        {t('Save changes')}
      </Button>
    </>
  );
};
