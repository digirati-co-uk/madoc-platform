import { InternationalString } from '@iiif/presentation-3';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useParams } from 'react-router-dom';
import slugify from 'slugify';
import type { ProjectTemplate } from '../../../../../extensions/projects/types';
import { CreateProject } from '../../../../../types/schemas/create-project';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { ProjectBanner } from '../../../../shared/components/ProjectBanner';
import { Stepper, StepperContainer } from '../../../../shared/components/Stepper';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { useApi } from '../../../../shared/hooks/use-api';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { useRemoteProjectTemplate } from '../../../../shared/hooks/use-project-template';
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

function getSingleQueryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return value || '';
}

function isValidUploadedProjectTemplate(value: any): value is ProjectTemplate {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof value.type === 'string' &&
    value.metadata &&
    typeof value.metadata.label === 'string' &&
    typeof value.metadata.description === 'string'
  );
}

export const NewProjectFromTemplate: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const { template: routeTemplate } = useParams<{ template: string }>();
  const chosenTemplateType = routeTemplate || '';
  const isRemoteTemplateType = chosenTemplateType === 'remote';
  const query = useLocationQuery<{ template?: string | string[]; source?: string | string[] }>();
  const initialTemplate = getSingleQueryValue(query.template);
  const initialSource = getSingleQueryValue(query.source) === 'upload' ? 'upload' : 'url';

  const [label, setLabel] = useState<InternationalString>({ en: [''] });
  const [summary, setSummary] = useState<InternationalString>({ en: [''] });
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const defaultLocale = useDefaultLocale();
  const availableLanguages = useSupportedLocales();
  const [isSelected, setIsSelected] = useState(
    Boolean(initialTemplate && initialTemplate.startsWith('urn:madoc:project:'))
  );
  const [source, setSource] = useState<'url' | 'upload'>(initialSource);
  const [remoteTemplateInput, setRemoteTemplateInput] = useState(initialTemplate);
  const [remoteTemplateReference, setRemoteTemplateReference] = useState(initialTemplate);
  const [uploadedTemplate, setUploadedTemplate] = useState<ProjectTemplate | undefined>(undefined);
  const [uploadedTemplateName, setUploadedTemplateName] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fetchedTemplate, isRemote, templateStatus] = useRemoteProjectTemplate(
    isRemoteTemplateType ? remoteTemplateReference || 'remote' : chosenTemplateType,
    isRemoteTemplateType ? isSelected : true
  );
  const template = isRemoteTemplateType && source === 'upload' ? uploadedTemplate : fetchedTemplate;

  useEffect(() => {
    if (!isRemoteTemplateType) {
      return;
    }
    const nextTemplate = getSingleQueryValue(query.template);
    const nextSource = getSingleQueryValue(query.source) === 'upload' ? 'upload' : 'url';
    setSource(nextSource);
    setRemoteTemplateInput(nextTemplate);
    setRemoteTemplateReference(nextTemplate);
    setIsSelected(Boolean(nextTemplate && nextTemplate.startsWith('urn:madoc:project:')));
    setUploadError(null);
    setUploadedTemplate(undefined);
    setUploadedTemplateName('');
  }, [isRemoteTemplateType, query.source, query.template]);

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

  if (!isRemoteTemplateType && ((!template && !isRemote) || templateStatus === 'error')) {
    return <div>Template not found</div>;
  }

  if (source !== 'upload' && templateStatus === 'loading') {
    return <div>Loading...</div>;
  }

  const header = (
    <AdminHeader
      breadcrumbs={[
        { label: t('Site admin'), link: '/' },
        { label: t('Projects'), link: '/projects' },
        { label: t('Create project'), link: '/projects/create' },
        template || isRemoteTemplateType
          ? {
              label: template?.metadata.actionLabel || template?.metadata.label || t('Import template'),
              link: `/projects/create/${chosenTemplateType}`,
              active: true,
            }
          : null,
      ]}
      title={template?.metadata.label || (isRemoteTemplateType ? t('Import project template') : undefined)}
      subtitle={
        template?.metadata.description ||
        (isRemoteTemplateType ? t('Use a URL/URN or upload a project template JSON file.') : undefined)
      }
    />
  );

  const openUrlSource = () => {
    setSource('url');
    setUploadError(null);
    setUploadedTemplate(undefined);
    setUploadedTemplateName('');
  };

  const openUploadSource = () => {
    setSource('upload');
    setUploadError(null);
    setIsSelected(false);
    setRemoteTemplateReference('');
  };

  const loadTemplateFromReference = () => {
    const trimmed = remoteTemplateInput.trim();
    if (!trimmed) {
      return;
    }

    if (!trimmed.startsWith('http') && !trimmed.startsWith('urn:madoc:project:')) {
      setUploadError(t('Enter a URL or a Madoc project URN.'));
      return;
    }

    setUploadError(null);
    setRemoteTemplateReference(trimmed);
    setIsSelected(trimmed.startsWith('urn:madoc:project:'));
  };

  const onTemplateFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    if (!file) {
      return;
    }

    setUploadError(null);

    try {
      const fileContents = await file.text();
      const parsed = JSON.parse(fileContents);
      if (!isValidUploadedProjectTemplate(parsed)) {
        throw new Error('Invalid project template file');
      }
      setUploadedTemplate(parsed);
      setUploadedTemplateName(file.name);
    } catch (error) {
      setUploadedTemplate(undefined);
      setUploadedTemplateName('');
      setUploadError((error as Error).message || 'Unable to parse template file');
    }
  };

  if (
    isRemoteTemplateType &&
    source === 'url' &&
    (!remoteTemplateReference || !isSelected || templateStatus === 'error')
  ) {
    return (
      <>
        {header}
        <WidePage>
          <StepperContainer>
            <Stepper status={'progress'} title={t('Template source')} description={''} open>
              <InputContainer wide>
                <InputLabel>{t('Choose source')}</InputLabel>
                <ButtonRow>
                  <Button $primary onClick={openUrlSource}>
                    {t('Remote URL or URN')}
                  </Button>
                  <Button onClick={openUploadSource}>{t('Upload JSON file')}</Button>
                </ButtonRow>
              </InputContainer>

              <InputContainer wide>
                <InputLabel htmlFor="templateReference">{t('Template URL or URN')}</InputLabel>
                <Input
                  id="templateReference"
                  type="text"
                  placeholder="https://example.com/template.json or urn:madoc:project:123"
                  value={remoteTemplateInput}
                  onChange={event => setRemoteTemplateInput(event.currentTarget.value)}
                />
              </InputContainer>

              <ButtonRow>
                <Button $primary disabled={!remoteTemplateInput.trim()} onClick={loadTemplateFromReference}>
                  {t('Load template')}
                </Button>
              </ButtonRow>

              {templateStatus === 'error' ? (
                <ErrorMessage $banner>{t('Unable to load template from this URL/URN')}</ErrorMessage>
              ) : null}

              {uploadError ? <ErrorMessage $banner>{uploadError}</ErrorMessage> : null}

              {remoteTemplateReference && isRemote && !isSelected ? (
                <SuccessMessage>
                  <p>{t('Are you sure you want to load this remote template?')}</p>
                  <p>
                    <a href={remoteTemplateReference}>{remoteTemplateReference}</a>
                  </p>

                  <ButtonRow>
                    <Button $primary onClick={() => setIsSelected(true)}>
                      {t('Import')}
                    </Button>
                  </ButtonRow>
                </SuccessMessage>
              ) : null}
            </Stepper>
          </StepperContainer>
        </WidePage>
      </>
    );
  }

  if (isRemoteTemplateType && source === 'upload' && !template) {
    return (
      <>
        {header}
        <WidePage>
          <StepperContainer>
            <Stepper status={'progress'} title={t('Template source')} description={''} open>
              <InputContainer wide>
                <InputLabel>{t('Choose source')}</InputLabel>
                <ButtonRow>
                  <Button onClick={openUrlSource}>{t('Remote URL or URN')}</Button>
                  <Button $primary onClick={openUploadSource}>
                    {t('Upload JSON file')}
                  </Button>
                </ButtonRow>
              </InputContainer>

              <InputContainer wide>
                <InputLabel htmlFor="uploadTemplateFile">{t('Project template JSON')}</InputLabel>
                <Input
                  id="uploadTemplateFile"
                  type="file"
                  accept=".json,application/json"
                  onChange={onTemplateFileUpload}
                />
              </InputContainer>

              {uploadedTemplateName ? (
                <SuccessMessage $banner>
                  {t('Loaded template file')}: {uploadedTemplateName}
                </SuccessMessage>
              ) : null}

              {uploadError ? <ErrorMessage $banner>{uploadError}</ErrorMessage> : null}
            </Stepper>
          </StepperContainer>
        </WidePage>
      </>
    );
  }

  if (!template) {
    return <div>Template not found</div>;
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

                      remote_template: isRemoteTemplateType ? template : null,
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
