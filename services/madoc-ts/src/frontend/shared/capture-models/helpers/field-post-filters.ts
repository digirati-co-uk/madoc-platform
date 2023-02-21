import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { isEntityEmpty } from '../utility/is-entity-empty';
import { isEmptyFieldList } from '../utility/is-field-list-empty';
import { isEntity, isEntityList } from './is-entity';
import { traverseDocument } from './traverse-document';

type PostFilter = (fields: BaseField[]) => BaseField[];

export function filterEmptyFields(fields: BaseField[], parent?: CaptureModel['document']): BaseField[] {
  if (fields.length === 1) {
    return fields;
  }

  if (isEntityList(fields) && fields.length > 1) {
    // 1st is this allowMultiple?
    const first = fields.find(f => !f.revision) || fields[0];

    // In this case, we have a list of entites - but the templated entity might be in there.
    // This is a rough "isEntityEmpty"
    if (first && first.allowMultiple) {
      const findEmpty = fields.filter(r => !r.revision);
      if (findEmpty.length) {
        const toRemove: any[] = [];
        for (const found of findEmpty) {
          if (isEntity(found)) {
            if (isEntityEmpty(found)) {
              toRemove.push(found);
            }
          } else {
            if (isEmptyFieldList([found])) {
              toRemove.push(found);
            }
          }
        }
        return fields.filter(inst => toRemove.indexOf(inst) === -1);
      }
    }

    return fields;
  }

  const containsCanonical = fields.filter(f => !f.revision);

  if (fields.length === containsCanonical.length) {
    return fields;
  }

  const filtered = fields.filter(field => {
    return !!field.revision;
  });

  if (filtered.length === 0) {
    // When there is no other field, we return this.
    return fields;
  }

  return filtered;
}

export function filterRemovedFields(fieldsToRemove: string[]): PostFilter {
  return fields => {
    if (fields.length === 1) {
      return fields;
    }

    const filteredFields = fields.filter(f => fieldsToRemove.indexOf(f.id) === -1);

    if (filteredFields.length) {
      return filteredFields;
    }

    // Can't delete them all!
    return fields;
  };
}
