import { useFormik } from 'formik';
import React from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { Button } from '../../atoms/Button';
import {
  StyledForm,
  StyledFormField,
  StyledFormInputElement,
  StyledFormLabel,
  StyledFormTextarea,
} from '../../atoms/StyledForm';
import { useUnmount } from '../../hooks/useUnmount';
import { useTranslation } from 'react-i18next';

type Props = {
  profiles?: string[];
  structure: CaptureModel['structure'];
  onSave: (structure: CaptureModel['structure']) => void;
};

export const StructureMetadataEditor: React.FC<Props> = ({ profiles = [], structure, onSave }) => {
  const { t } = useTranslation();
  const formik = useFormik({
    initialValues: structure,
    onSubmit: values => {
      onSave(values);
    },
  });

  const dirty = formik.dirty;
  const submitForm = formik.submitForm;

  useUnmount(() => {
    if (dirty) {
      submitForm();
    }
  }, [dirty, submitForm]);

  return (
    <StyledForm onSubmit={formik.handleSubmit}>
      <StyledFormField>
        <StyledFormLabel>
          {t('Label')}
          <StyledFormInputElement
            type="text"
            name="label"
            id="label"
            required={true}
            value={formik.values.label}
            onChange={formik.handleChange}
          />
        </StyledFormLabel>
      </StyledFormField>

      <StyledFormField>
        <StyledFormLabel>
          {t('Description')}
          <StyledFormTextarea
            name="description"
            id="description"
            value={formik.values.description}
            onChange={formik.handleChange}
          />
        </StyledFormLabel>
      </StyledFormField>

      {profiles.length ? (
        <div style={{ color: '#000' }}>
          <h4>{t('Profiles')}</h4>
          {profiles.map((prof, idx) => {
            return (
              <div key={idx}>
                {prof}{' '}
                {(formik.values.profile || []).indexOf(prof) === -1 ? (
                  <button
                    type="button"
                    onClick={() => formik.setFieldValue('profile', [...(formik.values.profile || []), prof])}
                  >
                    {t('enable')}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      formik.setFieldValue(
                        'profile',
                        (formik.values.profile || []).filter(v => v !== prof)
                      )
                    }
                  >
                    {t('disable')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      {formik.values.type === 'model' ? (
        <StyledFormField>
          <StyledFormLabel>
            {t('Crowdsourcing Instructions')}
            <StyledFormTextarea name="instructions" value={formik.values.instructions} onChange={formik.handleChange} />
          </StyledFormLabel>
        </StyledFormField>
      ) : null}
      {formik.dirty ? (
        <Button type="submit" color="blue" size="small">
          {t('Save')}
        </Button>
      ) : null}
    </StyledForm>
  );
};
