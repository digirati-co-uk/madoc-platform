import { InternationalString } from '@iiif/presentation-3';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import slugify from 'slugify';
import { CreateProject } from '../../../../../types/schemas/create-project';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { ProjectBanner } from '../../../../shared/components/ProjectBanner';
import { Stepper, StepperContainer } from '../../../../shared/components/Stepper';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { useApi } from '../../../../shared/hooks/use-api';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { useProjectTemplate, useRemoteProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { useDefaultLocale, useSupportedLocales } from '../../../../shared/hooks/use-site';
import { WidePage } from '../../../../shared/layout/WidePage';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { ErrorBoundary } from '../../../../shared/utility/error-boundary';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { MetadataEditor } from '../../../molecules/MetadataEditor';

const PROJECT_DETAILS = 0;
const ADDITIONAL_SETTINGS = 1;
const COMPLETE = 2;
const CUSTOM_CONFIG = 3;

export const NewProjectFromTemplate: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const location = useLocation();
  const chosenTemplateType = location.pathname.split('/create/')[1];
  const query = useLocationQuery<{ template: string }>();

  const [label, setLabel] = useState<InternationalString>({ en: [''] });
  const [summary, setSummary] = useState<InternationalString>({ en: [''] });
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const defaultLocale = useDefaultLocale();
  const availableLanguages = useSupportedLocales();
  const [isSelected, setIsSelected] = useState(
    Boolean(query.template && query.template.startsWith('urn:madoc:project:'))
  );
  const [template, isRemote, templateStatus] = useRemoteProjectTemplate(
    chosenTemplateType === 'remote' ? query.template : chosenTemplateType,
    isSelected
  );

  const [saveProject, { status, data, isSuccess, reset }] = useMutation(async (config: CreateProject) => {
    try {
      return await api.createProject(config);
    } catch (e) {
      return { error: (e as any).message };
    }
  });
  const isError = !!data?.error;

  useEffect(() => {
    const textLabel = Object.values(label)[0]?.join('') || '';

    if (autoSlug) {
      setSlug(slugify(textLabel, { lower: true }));
    }
  }, [autoSlug, label]);

  const [step, setStep] = useState(PROJECT_DETAILS);
  const [customOptions, setCustomOptions] = useState<any>(null);
  const [customConfigValues, setCustomConfigValues] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const basicDetailsDone = label && summary && slug;
  const hasTemplate = template?.setup?.defaults && template?.setup?.model;
  const ModelPreview = template?.setup?.modelPreview;
  const customConfig = template?.customConfig;
  const hasCustomConfig = !!(customConfig && !customConfig.replacesProjectConfig);

  if ((!template && !isRemote) || templateStatus === 'error') {
    return <div>Template not found</div>;
  }

  if (templateStatus === 'loading') {
    return <div>Loading...</div>;
  }

  const header = (
    <AdminHeader
      breadcrumbs={[
        { label: t('Site admin'), link: '/' },
        { label: t('Projects'), link: '/projects' },
        { label: t('Create project'), link: '/projects/create' },
        template
          ? {
              label: template.metadata.actionLabel || template.metadata.label,
              link: `/projects/create/${template.type}`,
              active: true,
            }
          : null,
      ]}
      title={template?.metadata.label}
      subtitle={template?.metadata.description}
    />
  );

  if (isRemote && !isSelected) {
    return (
      <>
        {header}
        <WidePage>
          <SuccessMessage>
            <p>Are you sure you want to load this remote template</p>
            <p>
              <a href={query.template}>{query.template}</a>
            </p>

            <ButtonRow>
              <Button $primary onClick={() => setIsSelected(true)}>
                Import
              </Button>
            </ButtonRow>
          </SuccessMessage>
        </WidePage>
      </>
    );
  }

  return (
    <>
      {header}
      <WidePage>
        <StepperContainer>
          <Stepper
            status={basicDetailsDone ? 'done' : 'progress'}
            title="Project details"
            description={step === PROJECT_DETAILS ? '' : 'Click to edit'}
            onClickDescription={() => (isSuccess ? null : setStep(0))}
            open={step === PROJECT_DETAILS}
          >
            <InputContainer wide>
              <InputLabel htmlFor="label">Label</InputLabel>
              <MetadataEditor
                fluid
                id={'label'}
                fields={label}
                onSave={output => setLabel(output.toInternationalString())}
                availableLanguages={availableLanguages}
                metadataKey={'label'}
              />
            </InputContainer>

            <InputContainer wide>
              <InputLabel htmlFor="summary">Description</InputLabel>
              <MetadataEditor
                fluid
                id={'summary'}
                fields={summary}
                onSave={output => setSummary(output.toInternationalString())}
                availableLanguages={availableLanguages}
                metadataKey={'summary'}
                defaultLocale={defaultLocale}
              />
            </InputContainer>

            <InputContainer wide>
              <InputLabel htmlFor="slug">Slug</InputLabel>
              <Input
                type="text"
                value={slug}
                onFocus={() => setAutoSlug(false)}
                onChange={e => setSlug(e.currentTarget.value)}
                id={'slug'}
              />
            </InputContainer>

            <Button
              $primary
              onClick={() => {
                reset();
                if (hasTemplate) {
                  setStep(ADDITIONAL_SETTINGS);
                } else {
                  if (hasCustomConfig) {
                    setStep(CUSTOM_CONFIG);
                  } else {
                    setStep(COMPLETE);
                  }
                }
              }}
              disabled={!basicDetailsDone}
            >
              Save
            </Button>
          </Stepper>

          {hasTemplate ? (
            <Stepper
              description={step === ADDITIONAL_SETTINGS || !basicDetailsDone ? '' : 'Click to edit'}
              onClickDescription={() => (isSuccess ? null : setStep(1))}
              status={step > ADDITIONAL_SETTINGS ? 'done' : step === ADDITIONAL_SETTINGS ? 'progress' : 'todo'}
              title="Additional settings"
              open={step === ADDITIONAL_SETTINGS}
            >
              <div style={{ display: 'flex' }}>
                <div style={{ maxWidth: 550, flex: 1 }}>
                  {template?.setup?.model ? (
                    <EditShorthandCaptureModel
                      saveLabel="Save"
                      data={template?.setup?.defaults}
                      template={template?.setup?.model}
                      onPreview={
                        ModelPreview
                          ? model => {
                              setPreviewData(model);
                            }
                          : undefined
                      }
                      onSave={model => {
                        reset();
                        setCustomOptions(model);
                        setStep(hasCustomConfig ? CUSTOM_CONFIG : COMPLETE);
                      }}
                    />
                  ) : null}
                </div>

                {previewData && ModelPreview ? (
                  <ErrorBoundary onError={() => <div>ERROR: project preview failed.</div>}>
                    <div style={{ flex: 1, padding: '0 1em' }}>
                      <ModelPreview {...previewData} />
                    </div>
                  </ErrorBoundary>
                ) : null}
              </div>
            </Stepper>
          ) : null}

          {hasCustomConfig ? (
            <Stepper
              title={'Custom config'}
              description={''}
              open={step === CUSTOM_CONFIG}
              status={step > CUSTOM_CONFIG ? 'done' : step === CUSTOM_CONFIG ? 'progress' : 'todo'}
            >
              <EditShorthandCaptureModel
                saveLabel="Save"
                data={customConfig?.defaults}
                template={customConfig?.model}
                onSave={model => {
                  reset();
                  setCustomConfigValues(model);
                  setStep(COMPLETE);
                }}
              />
            </Stepper>
          ) : null}

          <Stepper
            status={isError ? 'error' : isSuccess && !isError ? 'done' : step === 2 ? 'progress' : 'todo'}
            title={'Complete'}
            description={''}
            open={step === 2}
          >
            <p>Click the button below to create your project</p>
            {isError ? <ErrorMessage $banner>{data.error || 'Unknown error'}</ErrorMessage> : null}
            {isSuccess && !isError ? (
              <div>
                <ProjectBanner project={data} admin />
              </div>
            ) : null}
            {!isSuccess && !isError ? (
              <ButtonRow>
                <Button
                  $primary
                  disabled={status === 'loading' || isSuccess}
                  onClick={() =>
                    saveProject({
                      label,
                      summary,
                      slug,
                      template: chosenTemplateType,
                      template_options: customOptions,
                      template_config: customConfigValues,

                      remote_template: isRemote ? template : null,
                    })
                  }
                >
                  Create
                </Button>
              </ButtonRow>
            ) : null}
          </Stepper>
        </StepperContainer>
      </WidePage>
    </>
  );
};
