import React, { useEffect, useRef } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { isEntity } from '../../helpers/is-entity';

export const SwitchFieldAfterRevises: React.FC = () => {
  const lastRevisionSubtreeField = useRef<any>();
  const revisionSelectField = Revisions.useStoreActions(a => a.revisionSelectField);
  const {
    revisionSubtreeField,
    revisionSelectedFieldProperty,
    revisionSelectedFieldInstance,
    revisionSubtree,
  } = Revisions.useStoreState(a => ({
    revisionSubtreeField: a.revisionSubtreeField,
    revisionSelectedFieldProperty: a.revisionSelectedFieldProperty,
    revisionSelectedFieldInstance: a.revisionSelectedFieldInstance,
    revisionSubtree: a.revisionSubtree,
  }));

  useEffect(() => {
    if (revisionSubtreeField) {
      lastRevisionSubtreeField.current = revisionSubtreeField;
    } else {
      if (revisionSelectedFieldInstance && revisionSelectedFieldProperty) {
        if (revisionSubtree && isEntity(revisionSubtree)) {
          const fields = revisionSubtree.properties[revisionSelectedFieldProperty];
          if (fields.length) {
            for (const field of fields) {
              if (field.revises === revisionSelectedFieldInstance) {
                try {
                  revisionSelectField({
                    id: field.id,
                    term: revisionSelectedFieldProperty,
                  });
                } catch (e) {
                  // test
                }
              }
            }
          }
        }
      }
    }
  }, [
    revisionSelectField,
    revisionSelectedFieldInstance,
    revisionSelectedFieldProperty,
    revisionSubtree,
    revisionSubtreeField,
  ]);

  return null;
};
