import { InputShape } from 'polygon-editor';
import { ViewSelector } from '../../../_components/ViewDocument/components/ViewSelector';
import { BaseSelector, SelectorTypeProps } from '../../../types/selector-types';
import { useTranslation } from 'react-i18next';
import { satisfies } from 'semver';
import { Button } from '../../atoms/Button';
import { ButtonRow } from '../../../../navigation/Button';

export interface PolygonSelectorProps extends BaseSelector {
  id: string;
  type: 'polygon-selector';
  hidden?: boolean;
  state: null | {
    type: 'polygon' | 'polyline' | 'line';
    shape: InputShape;
    svgPreview?: string;
  };
}

export function PolygonSelector({
  chooseSelector,
  updateSelector,
  readOnly,
  state,
  currentSelectorId,
  clearSelector,
  id,
  ...props
}: SelectorTypeProps<PolygonSelectorProps>) {
  const { t } = useTranslation();
  const isSelecting = currentSelectorId === id;

  const parts: Record<string, React.ReactNode> = {
    preview: null,
    confirmButton: null,
    editButton: null,
  };

  const existingShape = Boolean(state && state.shape && state.shape.points.length > 1);
  const isLine = Boolean(existingShape && state?.shape.open);

  if (existingShape) {
    // We can show a preview of the shape here.
    parts.preview = (
      <ViewSelector
        fluidImage
        selector={{
          id: 'test',
          type: 'polygon-selector',
          state,
        }}
      />
    );
  }

  if (chooseSelector && !readOnly) {
    if (isSelecting) {
      // Show the editing controls.
      if (state && clearSelector) {
        // Show confirm button
        parts.confirmButton = (
          <Button primary size="small" onClick={() => clearSelector()}>
            {t('confirm')}
          </Button>
        );
      }
    } else {
      // Show edit button
      parts.editButton = (
        <Button primary size="small" onClick={() => chooseSelector(id)}>
          {existingShape ? (isLine ? t('edit line') : t('edit region')) : t('define region')}
        </Button>
      );
    }
  }

  return (
    <div>
      {parts.preview ? (
        <div style={{ marginBottom: 10 }}>{parts.preview}</div>
      ) : (
        <div style={{ padding: '10px 4px' }}>{t('Draw a shape')}</div>
      )}
      <ButtonRow $noMargin>
        {parts.confirmButton}
        {parts.discardButton}
        {parts.editButton}
      </ButtonRow>
    </div>
  );
}
