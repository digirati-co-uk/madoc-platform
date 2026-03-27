import { useCallback, useState, type ComponentType } from 'react';
import type { TFunction } from 'i18next';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import type { DefineTabularModelValue, TabularModelChange } from '../../../../../components/tabular/cast-a-net/types';

interface DefineTabularModelComponentProps {
  value: DefineTabularModelValue;
  onChange: (next: DefineTabularModelValue) => void;
  onModelChange: (res: TabularModelChange) => void;
  showValidationErrors?: boolean;
  manifestId?: string;
  canvasId?: string;
}

interface TabularProjectModelStepProps {
  t: TFunction;
  tabularModel: DefineTabularModelValue;
  manifestId?: string;
  canvasId?: string;
  isModelValid: boolean;
  modelSaved?: boolean;
  onTabularModelChange: (next: DefineTabularModelValue) => void;
  onModelChange: (res: TabularModelChange) => void;
  onSave: () => void;
  onCancel: () => void;
  DefineTabularModelComponent: ComponentType<DefineTabularModelComponentProps>;
}

export function TabularProjectModelStep(props: TabularProjectModelStepProps) {
  const {
    t,
    tabularModel,
    manifestId,
    canvasId,
    isModelValid,
    onTabularModelChange,
    onModelChange,
    onSave,
    onCancel,
    DefineTabularModelComponent,
  } = props;
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const saveAndContinue = useCallback(() => {
    setShowValidationErrors(true);
    if (!isModelValid) {
      return;
    }
    onSave();
  }, [isModelValid, onSave]);

  return (
    <div style={{ paddingBottom: 16 }}>
      <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
        <DefineTabularModelComponent
          value={tabularModel}
          onChange={onTabularModelChange}
          onModelChange={onModelChange}
          showValidationErrors={showValidationErrors}
          manifestId={manifestId}
          canvasId={canvasId}
        />
      </BrowserComponent>

      <ButtonRow>
        <Button type="button" onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button $primary onClick={saveAndContinue}>
          {t('Save and continue')}
        </Button>
      </ButtonRow>
    </div>
  );
}
