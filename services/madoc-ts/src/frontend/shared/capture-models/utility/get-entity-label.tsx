import { filterRevises } from '../helpers/filter-revises';
import { isEntity } from '../helpers/is-entity';
import { CaptureModel } from '../types/capture-model';

export function getEntityLabel(
  document: CaptureModel['document'],
  defaultLabel?: string | any,
  shouldFilterRevises = false
): string {
  const labelledBy = document.labelledBy;

  if (labelledBy && labelledBy.match(/{(.+?)}/)) {
    const state = {
      isEmpty: true,
      empty: '',
    };

    const labelToUse = labelledBy.replace(/{(.+?)(\/(.+?))?}/g, (substring, property, _, defaultPropertyLabel) => {
      if ((property || '').startsWith('@')) {
        if (property === '@empty') {
          state.empty = defaultPropertyLabel;
        }
        return '';
      }

      const possibleValue = getPropertyValueAsText(document, property);
      if (!possibleValue.trim()) {
        return defaultPropertyLabel || '';
      }

      state.isEmpty = false;
      return possibleValue;
    });

    if (state.isEmpty || !labelToUse) {
      return state.empty || labelToUse || defaultLabel;
    }

    return labelToUse.trim();
  }

  return getNonTemplatedEntityLabel(document, defaultLabel, shouldFilterRevises);
}

export function getNonTemplatedEntityLabel(
  document: CaptureModel['document'],
  defaultLabel?: string | any,
  shouldFilterRevises = false
): string {
  const fallback = defaultLabel || '';

  if (
    document.labelledBy &&
    document.properties[document.labelledBy] &&
    document.properties[document.labelledBy].length > 0
  ) {
    return getPropertyValueAsText(document, document.labelledBy, defaultLabel, shouldFilterRevises) || fallback;
  }

  const props = Object.keys(document.properties);

  for (const prop of props) {
    const items = document.properties[prop];
    if (items) {
      for (const item of items) {
        const parts: string[] = [];
        if (item && !isEntity(item) && typeof item.value === 'string' && item.value) {
          parts.push(item.value);
        } else if (isEntity(item)) {
          parts.push(getEntityLabel(item));
        }

        return parts.join(' ') || fallback;
      }
    }
  }

  return fallback;
}

export function getPropertyValueAsText(
  document: CaptureModel['document'],
  labelledBy: string,
  defaultLabel?: string,
  shouldFilterRevises = false
): string {
  const fallback = defaultLabel || '';

  if (labelledBy && document.properties[labelledBy] && document.properties[labelledBy].length > 0) {
    const fields = shouldFilterRevises
      ? filterRevises(document.properties[labelledBy])
      : document.properties[labelledBy];

    const parts: string[] = [];
    for (const field of fields) {
      if (!isEntity(field)) {
        if (field.value) {
          parts.push(field.value);
        }
      } else {
        parts.push(getEntityLabel(field, defaultLabel));
      }
    }

    return parts.join(' ') || fallback;
  }

  return fallback;
}
