import * as React from 'react';
import { InternationalString } from '@iiif/presentation-3';
import {
  MetadataCard,
  MetadataCardItem,
  MetadataCardLabel,
  MetadataEmptyState,
} from '../../src/frontend/shared/atoms/MetadataConfiguration';
import { ButtonRow, SmallButton } from '../../src/frontend/shared/navigation/Button';
import { useTranslation } from 'react-i18next';
interface annotation {
  id: string;
  label: InternationalString;
  type: 'project' | 'capture-model' | 'external';
  count?: number;
}
export const AnnotationsPanel: React.FC<{ annotations?: annotation[] }> = ({ annotations }) => {
  const { t } = useTranslation();
  const regionCollections = [{ id: '1234', label: 'myProject', type: 'AnnotationPage' }];
  const regions = [
    { id: '1234', label: 'anno1', target: { x: 123, y: 321 } },
    { id: '4352', label: 'anno2', target: { x: 123, y: 321 } },
  ];

  if (!regions || !regions.length) {
    return <MetadataEmptyState>{t('No annotations')}</MetadataEmptyState>;
  }
  return (
    <>
      <div>
        <ButtonRow>
          {regions.length !== 0 && regionCollections.length > 1 && (
            <SmallButton
              onClick={() => {
                console.log('hi');
              }}
            >
              {t('Back to list')}
            </SmallButton>
          )}
        </ButtonRow>

        {regions.length === 0 ? (
          <MetadataEmptyState style={{ marginTop: 100 }}>{t('No annotations')}</MetadataEmptyState>
        ) : null}

        {regions.map(item => {
          return (
            <MetadataCardItem
              key={item.id}
              // onMouseOver={styles.contributedAnnotations.hotspot ? undefined : () => setHighlightStatus(item.id, true)}
              // onMouseOut={styles.contributedAnnotations.hotspot ? undefined : () => setHighlightStatus(item.id, false)}
              // onMouseOver={() => setHighlightStatus(item.id, true)}
              // onMouseOut={() => setHighlightStatus(item.id, false)}
            >
              <MetadataCard interactive>
                <MetadataCardLabel>{item.label}</MetadataCardLabel>
              </MetadataCard>
            </MetadataCardItem>
          );
        })}
      </div>
    </>
  );
};
