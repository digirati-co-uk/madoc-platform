import type { InternationalString } from '@iiif/presentation-3';
import type { TFunction } from 'i18next';
import type { CreateProject } from '@/types/schemas/create-project';
import { ErrorMessage } from '@/frontend/shared/callouts/ErrorMessage';
import { SuccessMessage } from '@/frontend/shared/callouts/SuccessMessage';
import { Button, ButtonRow } from '@/frontend/shared/navigation/Button';
import { HrefLink } from '@/frontend/shared/utility/href-link';

interface TabularProjectCompleteStepProps {
  t: TFunction;
  isProjectCompleted: boolean;
  createdProjectPath: string | null;
  label: InternationalString;
  summary: InternationalString;
  defaultLocale: string;
  slug: string;
  enableZoomTracking: boolean;
  configuredRowCount: number;
  configuredColumnCount: number;
  crowdsourcingInstructions?: string;
  createProjectPayload: CreateProject | null;
  isError: boolean;
  errorMessage?: string;
  status: string;
  onComplete: () => void;
}

const getIntlEntries = (value: InternationalString, preferredLocale: string) => {
  const entries = Object.entries(value).map(([locale, parts]) => ({ locale, text: parts.join(' ').trim() }));
  if (!entries.length) {
    return preferredLocale ? [{ locale: preferredLocale, text: '' }] : [];
  }

  const preferredEntry = entries.find(entry => entry.locale === preferredLocale);
  const otherEntries = entries
    .filter(entry => entry.locale !== preferredLocale)
    .sort((a, b) => a.locale.localeCompare(b.locale));

  return preferredEntry ? [preferredEntry, ...otherEntries] : otherEntries;
};

export function TabularProjectCompleteStep(props: TabularProjectCompleteStepProps) {
  const {
    t,
    isProjectCompleted,
    createdProjectPath,
    label,
    summary,
    defaultLocale,
    slug,
    enableZoomTracking,
    configuredRowCount,
    configuredColumnCount,
    crowdsourcingInstructions,
    createProjectPayload,
    isError,
    errorMessage,
    status,
    onComplete,
  } = props;
  const hasCrowdsourcingInstructions = !!crowdsourcingInstructions?.trim();
  const labelEntries = getIntlEntries(label, defaultLocale);
  const summaryEntries = getIntlEntries(summary, defaultLocale);

  return (
    <>
      <div className="text-2xl font-light mb-1">{t('Complete')}</div>
      {isProjectCompleted ? (
        <>
          <SuccessMessage $banner>{t('Project completed.')}</SuccessMessage>
          {createdProjectPath ? (
            <ButtonRow>
              <Button $primary as={HrefLink} href={createdProjectPath}>
                {t('Go to project')}
              </Button>
            </ButtonRow>
          ) : null}
        </>
      ) : (
        <>
          <div className="mb-3 grid gap-1.5 rounded border border-[#d6d6d6] bg-[#f9fafc] p-3 text-sm">
            <div>
              <strong>{t('Label')}:</strong>
              <div className="mt-1 grid gap-1 pl-4">
                {labelEntries.map(entry => (
                  <div key={`label-${entry.locale}`} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[#3d4f88]">{entry.locale}</div>
                    <div>{entry.text || t('None')}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <strong>{t('Description')}:</strong>
              <div className="mt-1 grid gap-1 pl-4">
                {summaryEntries.map(entry => (
                  <div key={`description-${entry.locale}`} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[#3d4f88]">{entry.locale}</div>
                    <div>{entry.text || t('None')}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <strong>{t('Slug')}:</strong> {slug}
            </div>
            <div>
              <strong>{t('Zoom tracking')}:</strong> {enableZoomTracking ? t('Enabled') : t('Disabled')}
            </div>
            <div>
              <strong>{t('Rows')}:</strong> {configuredRowCount}
            </div>
            <div>
              <strong>{t('Columns')}:</strong> {configuredColumnCount}
            </div>
            {hasCrowdsourcingInstructions ? (
              <div>
                <strong>{t('Contributor instructions')}:</strong>{' '}
                <span className="whitespace-pre-wrap">{crowdsourcingInstructions}</span>
              </div>
            ) : null}
          </div>

          {isError ? <ErrorMessage $banner>{errorMessage || 'Unknown error'}</ErrorMessage> : null}

          <ButtonRow>
            <Button
              $primary
              disabled={status === 'loading' || isProjectCompleted || !createProjectPayload}
              onClick={onComplete}
            >
              {t('Complete project')}
            </Button>
          </ButtonRow>
        </>
      )}
    </>
  );
}
