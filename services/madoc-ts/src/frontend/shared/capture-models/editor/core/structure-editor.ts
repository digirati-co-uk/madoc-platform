import { isEntity } from '../../helpers/is-entity';
import { CaptureModel, ModelFields, NestedModelFields } from '../../types/capture-model';

type FlatStructureDefinition =
  | {
      label?: string;
      type: 'model';
      key: string[];
      fields: FlatStructureDefinition[];
    }
  | {
      label?: string;
      type: Exclude<string, 'model'>;
      key: string[];
    };

export function getDocumentFields(
  document: CaptureModel['document'],
  rootKeys: string[] = []
): FlatStructureDefinition {
  const structure: FlatStructureDefinition = {
    label: document.label,
    type: 'model',
    key: rootKeys,
    fields: [],
  };
  for (const key of Object.keys(document.properties)) {
    // @todo validation of values to make sure they are all the same type.
    const values = document.properties[key];
    if (!values || values.length === 0) continue;
    const value = values[0];

    // we have a key.
    structure.fields.push(
      isEntity(value)
        ? getDocumentFields(value, [...rootKeys, key])
        : {
            label: value.label,
            type: value.type,
            key: [...rootKeys, key],
          }
    );
  }

  return structure;
}

export function structureToFlatStructureDefinition(
  document: CaptureModel['document'],
  modelFields: ModelFields,
  structures: FlatStructureDefinition[] = [],
  keyScope: string[] = []
): FlatStructureDefinition[] {
  modelFields.reduce((acc, field) => {
    if (typeof field === 'string') {
      const fullFieldList = document.properties[field];
      // @todo validation?
      if (!fullFieldList || !fullFieldList.length) return acc;
      const fullField = fullFieldList[0];
      acc.push({
        key: [...keyScope, field],
        type: fullField.type,
        label: fullField.label,
      });
    }

    const [modelKey, fields] = field as [string, ModelFields];
    const fullFieldList = document.properties[modelKey];
    // @todo validation?
    if (!fullFieldList || !fullFieldList.length) return acc;

    const nestedModel = fullFieldList[0] as CaptureModel['document'];

    // for  [a, [b, c]]
    // We want to get [a, b] and [a, c] extracted
    return structureToFlatStructureDefinition(nestedModel, fields, structures, [...keyScope, modelKey]);
  }, structures);

  return structures;
}

export function expandModelFields(fields: ModelFields): string[][] {
  const reducer = (prefix: string[]) => (acc: string[][], next: string | NestedModelFields): string[][] => {
    if (typeof next === 'string') {
      acc.push([...prefix, next]);
      return acc;
    }
    const [name, nextFields] = next;

    if (typeof nextFields === 'undefined') {
      throw new Error(`Invalid model fields at level ${name} (${JSON.stringify(fields, null, 2)})`);
    }

    return nextFields.reduce(reducer([...prefix, name]), acc);
  };

  return fields.reduce(reducer([]), []);
}

export function mergeFlatKeys(inputKeys: string[][]): ModelFields {
  const keyHash = inputKeys.map(k => k.join('--HASH--'));
  const keys = inputKeys.filter((k, i) => keyHash.indexOf(k.join('--HASH--')) === i);
  const array: ModelFields = [];
  const uniqueKeys = [];
  const entityBuffer: { key: string; values: string[][] } = {
    key: '',
    values: [],
  };
  const entityMap: { [key: string]: number } = {};
  const flushBuffer = () => {
    // Flush last.
    if (entityBuffer.key) {
      const existing = entityMap[entityBuffer.key];
      // flush the buffer.
      if (typeof existing !== 'undefined') {
        // Existing entity
        const item = array[existing] as [string, ModelFields];
        item[1].push(...mergeFlatKeys(entityBuffer.values));
      } else {
        // new entity.
        array.push([entityBuffer.key, mergeFlatKeys(entityBuffer.values)]);
        entityMap[entityBuffer.key] = array.length - 1;
      }
      // reset the buffer.
      entityBuffer.key = '';
      entityBuffer.values = [];
    }
  };

  for (const key of keys) {
    if (key.length === 0) continue;
    // Flush
    if (entityBuffer.key !== key[0]) {
      flushBuffer();
    }
    // For top level fields.
    if (key.length === 1) {
      if (uniqueKeys.indexOf(key[0]) !== -1) continue;
      uniqueKeys.push(key[0]);
      array.push(key[0]);
      continue;
    }
    const [entity, ...path] = key;
    entityBuffer.key = entity;
    entityBuffer.values.push(path);
  }
  // Flush last.
  flushBuffer();

  return array;
}

export function documentFieldOptionsToStructure(definitions: FlatStructureDefinition[]): ModelFields {
  const flatKeys = [];
  for (const def of definitions) {
    flatKeys.push(def.key);
  }

  return mergeFlatKeys(flatKeys);
}

export function structureToTree(level: CaptureModel['structure'], keyAcc: number[] = []): any | null {
  switch (level.type) {
    case 'choice':
      return {
        id: keyAcc.length ? keyAcc.join('--') : 'root',
        icon: 'folder-close',
        label: level.label,
        nodeData: { ...level, key: keyAcc },
        isExpanded: true,
        childNodes: level.items
          .map((choiceItem, choiceKey) => structureToTree(choiceItem, [...keyAcc, choiceKey]))
          .filter(e => e) as any[],
      };

    case 'model':
      return {
        id: keyAcc.length ? keyAcc.join('--') : 'root',
        icon: 'form',
        label: level.label,
        nodeData: { ...level, key: keyAcc },
      };

    default:
      return null;
  }
}
