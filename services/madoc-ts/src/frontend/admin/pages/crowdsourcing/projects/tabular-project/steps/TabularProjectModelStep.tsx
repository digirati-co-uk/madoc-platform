import type { ComponentType } from 'react';
import type { TFunction } from 'i18next';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import type { DefineTabularModelValue, TabularModelChange } from '../../../../../components/tabular/cast-a-net/types';

interface DefineTabularModelComponentProps {
  value: DefineTabularModelValue;
  onChange: (next: DefineTabularModelValue) => void;
  onModelChange: (res: TabularModelChange) => void;
  manifestId?: string;
  canvasId?: string;
}

interface TabularProjectModelStepProps {
  t: TFunction;
  tabularModel: DefineTabularModelValue;
  manifestId?: string;
  canvasId?: string;
  isModelValid: boolean;
  modelSaved: boolean;
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
    modelSaved,
    onTabularModelChange,
    onModelChange,
    onSave,
    onCancel,
    DefineTabularModelComponent,
  } = props;

  return (
    <div style={{ paddingBottom: 16 }}>
      <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
        <DefineTabularModelComponent
          value={tabularModel}
          onChange={onTabularModelChange}
          onModelChange={onModelChange}
          manifestId={manifestId}
          canvasId={canvasId}
        />
      </BrowserComponent>

      {!modelSaved ? <div className="mt-1 text-sm">{t('Save the model to continue.')}</div> : null}

      <ButtonRow>
        <Button type="button" onClick={onCancel}>
          {t('Cancel')}
        </Button>
        <Button $primary disabled={!isModelValid || !modelSaved} onClick={onSave}>
          {t('Save and continue')}
        </Button>
      </ButtonRow>
    </div>
  );
}
