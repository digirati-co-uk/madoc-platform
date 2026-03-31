import type { InternationalString } from '@iiif/presentation-3';
import type { TFunction } from 'i18next';
import { Input, InputContainer, InputLabel } from '@/frontend/shared/form/Input';
import { MetadataEditor } from '../../../../../molecules/MetadataEditor';

interface TabularProjectDetailsStepProps {
  t: TFunction;
  label: InternationalString;
  summary: InternationalString;
  slug: string;
  availableLanguages: string[];
  defaultLocale: string;
  onLabelChange: (value: InternationalString) => void;
  onSummaryChange: (value: InternationalString) => void;
  onSlugFocus: () => void;
  onSlugChange: (value: string) => void;
}

export function TabularProjectDetailsStep(props: TabularProjectDetailsStepProps) {
  const {
    t,
    label,
    summary,
    slug,
    availableLanguages,
    defaultLocale,
    onLabelChange,
    onSummaryChange,
    onSlugFocus,
    onSlugChange,
  } = props;

  const labelUsage = t('Used as the project title shown in listings and on the project page.');
  const descriptionUsage = t('Used as the project summary shown to contributors before they start work.');
  const slugUsage = t('Used in the project URL. Keep it short and unique for this site.');

  const TooltipHint = (tooltipProps: { text: string }) => {
    return (
      <span
        title={tooltipProps.text}
        aria-label={tooltipProps.text}
        className="ml-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-slate-400 text-[11px] leading-none text-slate-600"
      >
        ?
      </span>
    );
  };

  return (
    <>
      <h2 className="text-2xl font-light mb-1">{t('Project details')}</h2>
      <div className="text-xs text-slate-700 mb-1">* {t('Required fields')}</div>
      <hr className="mb-4" />
      <InputContainer wide>
        <InputLabel htmlFor="label">
          {t('Label')} * <TooltipHint text={labelUsage} />
        </InputLabel>
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
        <InputLabel htmlFor="description">
          {t('Description')} * <TooltipHint text={descriptionUsage} />
        </InputLabel>
        <MetadataEditor
          fluid
          id="description"
          fields={summary}
          onSave={output => onSummaryChange(output.toInternationalString())}
          availableLanguages={availableLanguages}
          metadataKey="description"
          defaultLocale={defaultLocale}
        />
      </InputContainer>

      <InputContainer wide>
        <InputLabel htmlFor="slug">
          {t('Slug')} * <TooltipHint text={slugUsage} />
        </InputLabel>
        <Input
          type="text"
          value={slug}
          onChange={event => {
            onSlugFocus();
            onSlugChange(event.currentTarget.value);
          }}
          id="slug"
        />
      </InputContainer>
    </>
  );
}
