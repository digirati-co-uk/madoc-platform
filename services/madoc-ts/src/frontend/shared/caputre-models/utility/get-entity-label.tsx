import { isEntity } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';
import React from 'react';

export function getEntityLabel(document: CaptureModel['document'], defaultLabel?: string | any): string {
  const fallback = defaultLabel || '';

  if (
    document.labelledBy &&
    document.properties[document.labelledBy] &&
    document.properties[document.labelledBy].length > 0
  ) {
    const fields = document.properties[document.labelledBy];
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
