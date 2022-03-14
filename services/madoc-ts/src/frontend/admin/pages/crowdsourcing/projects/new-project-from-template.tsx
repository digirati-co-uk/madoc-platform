import { InternationalString } from '@hyperion-framework/types';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import slugify from 'slugify';
import { CreateProject } from '../../../../../types/schemas/create-project';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { EditShorthandCaptureModel } from '../../../../shared/capture-models/EditorShorthandCaptureModel';
import { ProjectBanner } from '../../../../shared/components/ProjectBanner';
import { Stepper, StepperContainer } from '../../../../shared/components/Stepper';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { useApi } from '../../../../shared/hooks/use-api';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';
import { useDefaultLocale, useSupportedLocales } from '../../../../shared/hooks/use-site';
import { WidePage } from '../../../../shared/layout/WidePage';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { MetadataEditor } from '../../../molecules/MetadataEditor';

export const NewProjectFromTemplate: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const { template: chosenTemplateType } = useParams<{ template: string }>();
  const [label, setLabel] = useState<InternationalString>({ en: [''] });
  const [summary, setSummary] = useState<InternationalString>({ en: [''] });
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const defaultLocale = useDefaultLocale();
  const availableLanguages = useSupportedLocales();
  const template = useProjectTemplate(chosenTemplateType);

  const [saveProject, { status, data, isSuccess, reset }] = useMutation(async (config: CreateProject) => {
    try {
      return await api.createProject(config);
    } catch (e) {
      return { error: e.message };
    }
  });
  const isError = !!data?.error;

  useEffect(() => {
    const textLabel = Object.values(label)[0]?.join('') || '';

    if (autoSlug) {
      setSlug(slugify(textLabel, { lower: true }));
    }
  }, [autoSlug, label]);

  const [step, setStep] = useState(0);
  const [customOptions, setCustomOptions] = useState<any>(null);
  const basicDetailsDone = label && summary && slug;
  const hasTemplate = template?.setup?.defaults && template?.setup?.model;

  if (!template) {
    return <div>Template not found</div>;
  }
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Projects'), link: '/projects' },
          { label: t('Create project'), link: '/projects/create' },
          {
            label: template.metadata.actionLabel || template.metadata.label,
            link: `/projects/create/${template.type}`,
            active: true,
          },
        ]}
        title={template.metadata.label}
        subtitle={template.metadata.description}
      />
      <WidePage>
        <StepperContainer>
          <Stepper
            status={basicDetailsDone ? 'done' : 'progress'}
            title="Project details"
            description={step === 0 ? '' : 'Click to edit'}
            onClickDescription={() => setStep(0)}
            open={step === 0}
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
                  setStep(1);
                } else {
                  setStep(2);
                }
              }}
              disabled={!basicDetailsDone}
            >
              Save
            </Button>
          </Stepper>

          {hasTemplate ? (
            <Stepper
              description={step === 1 || !basicDetailsDone ? '' : 'Click to edit'}
              onClickDescription={() => setStep(1)}
              status={step === 2 ? 'done' : step === 1 ? 'progress' : 'todo'}
              title="Additional settings"
              open={step === 1}
            >
              <div style={{ maxWidth: 550 }}>
                {template?.setup?.model ? (
                  <EditShorthandCaptureModel
                    saveLabel="Save"
                    data={template?.setup?.defaults}
                    template={template?.setup?.model}
                    onSave={model => {
                      reset();
                      setCustomOptions(model);
                      setStep(2);
                    }}
                  />
                ) : null}
              </div>
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
                    saveProject({ label, summary, slug, template: chosenTemplateType, template_options: customOptions })
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
