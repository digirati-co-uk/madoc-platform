import React from 'react';
import { useFormikContext } from 'formik';
import { useUnmount } from '../../hooks/useUnmount';

export const AutoSaveFormik: React.FC = () => {
  const { submitForm, dirty } = useFormikContext();

  useUnmount(() => {
    if (dirty) {
      submitForm();
    }
  }, [dirty, submitForm]);

  return null;
};
