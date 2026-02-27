import type { TFunction } from 'i18next';
import type { CreateProject } from '../../../../../../../types/schemas/create-project';
import { ErrorMessage } from '../../../../../../shared/callouts/ErrorMessage';
import { SuccessMessage } from '../../../../../../shared/callouts/SuccessMessage';
import { Button, ButtonRow } from '../../../../../../shared/navigation/Button';
import { HrefLink } from '../../../../../../shared/utility/href-link';
import type {
  TabularModelPayload,
  TabularProjectSetupPayload,
} from '../../../../../components/tabular/cast-a-net/types';
import { PayloadCard } from '../components/PayloadCard';

interface TabularProjectCompleteStepProps {
  t: TFunction;
  isProjectCompleted: boolean;
  createdProjectPath: string | null;
  primaryLabel: string;
  primarySummary: string;
  slug: string;
  enableZoomTracking: boolean;
  hasImage: boolean;
  configuredColumnCount: number;
  projectDetailsForConfirmation: unknown;
  setupPayload: TabularProjectSetupPayload | null;
  tabularPayload: TabularModelPayload | null;
  createProjectPayload: CreateProject | null;
  isError: boolean;
  errorMessage?: string;
  status: string;
  onComplete: () => void;
}

export function TabularProjectCompleteStep(props: TabularProjectCompleteStepProps) {
  const {
    t,
    isProjectCompleted,
    createdProjectPath,
    primaryLabel,
    primarySummary,
    slug,
    enableZoomTracking,
    hasImage,
    configuredColumnCount,
    projectDetailsForConfirmation,
    setupPayload,
    tabularPayload,
    createProjectPayload,
    isError,
    errorMessage,
    status,
    onComplete,
  } = props;

  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('Complete')}</div>
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
          <div
            style={{
              border: '1px solid #d6d6d6',
              borderRadius: 4,
              background: '#f9fafc',
              padding: 12,
              marginBottom: 12,
              fontSize: 13,
              display: 'grid',
              gap: 6,
            }}
          >
            <div>
              <strong>{t('Label')}:</strong> {primaryLabel}
            </div>
            <div>
              <strong>{t('Description')}:</strong> {primarySummary}
            </div>
            <div>
              <strong>{t('Slug')}:</strong> {slug}
            </div>
            <div>
              <strong>{t('Zoom tracking')}:</strong> {enableZoomTracking ? t('Enabled') : t('Disabled')}
            </div>
            <div>
              <strong>{t('Reference image')}:</strong> {hasImage ? t('Selected') : t('Not selected')}
            </div>
            <div>
              <strong>{t('Columns')}:</strong> {configuredColumnCount}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 12,
              marginBottom: 16,
            }}
          >
            <PayloadCard title={t('Project details payload')} value={projectDetailsForConfirmation} />
            <PayloadCard title={t('Capture model payload')} value={setupPayload?.model ?? tabularPayload} />
            <PayloadCard title={t('Cast a net payload')} value={setupPayload?.structure} />
            <PayloadCard title={t('Create project request payload')} value={createProjectPayload} />
          </div>

          {isError ? <ErrorMessage $banner>{errorMessage || 'Unknown error'}</ErrorMessage> : null}

          <ButtonRow>
            <Button
              $primary
              disabled={status === 'loading' || isProjectCompleted || !createProjectPayload}
              onClick={onComplete}
            >
              {t('Complete')}
            </Button>
          </ButtonRow>
        </>
      )}
    </>
  );
}
