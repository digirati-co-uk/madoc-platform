import type { InternationalString } from '@iiif/presentation-3';
import type { TFunction } from 'i18next';
import { Input, InputContainer, InputLabel } from '../../../../../../shared/form/Input';
import { Button, ButtonRow } from '../../../../../../shared/navigation/Button';
import { MetadataEditor } from '../../../../../molecules/MetadataEditor';

interface TabularProjectDetailsStepProps {
  t: TFunction;
  label: InternationalString;
  summary: InternationalString;
  slug: string;
  availableLanguages: string[];
  defaultLocale: string;
  detailsDone: boolean;
  onLabelChange: (value: InternationalString) => void;
  onSummaryChange: (value: InternationalString) => void;
  onSlugFocus: () => void;
  onSlugChange: (value: string) => void;
  onSave: () => void;
}

export function TabularProjectDetailsStep(props: TabularProjectDetailsStepProps) {
  const {
    t,
    label,
    summary,
    slug,
    availableLanguages,
    defaultLocale,
    detailsDone,
    onLabelChange,
    onSummaryChange,
    onSlugFocus,
    onSlugChange,
    onSave,
  } = props;

  return (
    <>
      <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 12 }}>{t('Project details')}</div>
      <InputContainer wide>
        <InputLabel htmlFor="label">{t('Label')}</InputLabel>
        <MetadataEditor
          fluid
          id="label"
          fields={label}
          onSave={output => onLabelChange(output.toInternationalString())}
          availableLanguages={availableLanguages}
          metadataKey="label"
        />
      </InputContainer>

      <InputContainer wide>
        <InputLabel htmlFor="summary">{t('Description')}</InputLabel>
        <MetadataEditor
          fluid
          id="summary"
          fields={summary}
          onSave={output => onSummaryChange(output.toInternationalString())}
          availableLanguages={availableLanguages}
          metadataKey="summary"
          defaultLocale={defaultLocale}
        />
      </InputContainer>

      <InputContainer wide>
        <InputLabel htmlFor="slug">{t('Slug')}</InputLabel>
        <Input
          type="text"
          value={slug}
          onFocus={onSlugFocus}
          onChange={event => onSlugChange(event.currentTarget.value)}
          id="slug"
        />
      </InputContainer>

      <ButtonRow>
        <Button $primary disabled={!detailsDone} onClick={onSave}>
          {t('Save')}
        </Button>
      </ButtonRow>
    </>
  );
}
