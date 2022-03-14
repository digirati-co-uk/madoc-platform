import { useFormik } from 'formik';
import React from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { Button } from '../../atoms/Button';
import { StyledForm, StyledFormField, StyledFormInput } from '../../atoms/StyledForm';
import { useTranslation } from 'react-i18next';

type Props = {
  structure: CaptureModel['structure'];
  onSave: (structure: CaptureModel['structure']) => void;
};

export const ModelMetadataEditor: React.FC<Props> = ({ structure, onSave }) => {
  const { t } = useTranslation();
  const formik = useFormik({
    initialValues: structure,
    onSubmit: values => {
      onSave(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <StyledForm>
        <StyledFormField>
          <label>
            {t('Label')}
            <StyledFormInput
              type="text"
              name="label"
              required={true}
              value={formik.values.label}
              onChange={formik.handleChange}
            />
          </label>
        </StyledFormField>

        <StyledFormField>
          <label>
            {t('Description')}
            <StyledFormInput
              type="text"
              name="description"
              required={true}
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </label>
        </StyledFormField>
      </StyledForm>

      {formik.dirty ? (
        <Button type="submit" primary size="small">
          {t('Save')}
        </Button>
      ) : null}
    </form>
  );
};
