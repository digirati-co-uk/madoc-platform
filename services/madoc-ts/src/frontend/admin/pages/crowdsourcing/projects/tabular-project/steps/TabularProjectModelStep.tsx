import { type ComponentType } from 'react';
import type { TFunction } from 'i18next';
import { BrowserComponent } from '@/frontend/shared/utility/browser-component';
import type { DefineTabularModelValue, TabularModelChange } from '../../../../../components/tabular/cast-a-net/types';

interface DefineTabularModelComponentProps {
  value: DefineTabularModelValue;
  onChange: (next: DefineTabularModelValue) => void;
  onModelChange: (res: TabularModelChange) => void;
  crowdsourcingInstructions?: string;
  onCrowdsourcingInstructionsChange?: (next: string) => void;
  showValidationErrors?: boolean;
  manifestId?: string;
  canvasId?: string;
}

interface TabularProjectModelStepProps {
  t: TFunction;
  tabularModel: DefineTabularModelValue;
  crowdsourcingInstructions: string;
  manifestId?: string;
  canvasId?: string;
  showValidationErrors: boolean;
  onTabularModelChange: (next: DefineTabularModelValue) => void;
  onCrowdsourcingInstructionsChange: (next: string) => void;
  onModelChange: (res: TabularModelChange) => void;
  DefineTabularModelComponent: ComponentType<DefineTabularModelComponentProps>;
}

export function TabularProjectModelStep(props: TabularProjectModelStepProps) {
  const {
    t,
    tabularModel,
    crowdsourcingInstructions,
    manifestId,
    canvasId,
    showValidationErrors,
    onTabularModelChange,
    onCrowdsourcingInstructionsChange,
    onModelChange,
    DefineTabularModelComponent,
  } = props;

  return (
    <div style={{ paddingBottom: 16 }}>
      <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
        <DefineTabularModelComponent
          value={tabularModel}
          onChange={onTabularModelChange}
          onModelChange={onModelChange}
          crowdsourcingInstructions={crowdsourcingInstructions}
          onCrowdsourcingInstructionsChange={onCrowdsourcingInstructionsChange}
          showValidationErrors={showValidationErrors}
          manifestId={manifestId}
          canvasId={canvasId}
        />
      </BrowserComponent>
    </div>
  );
}
