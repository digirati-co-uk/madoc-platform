import { FormikCheckbox } from '../../atoms/FormikCheckbox';
import { Field } from 'formik';
import { GuidedFormatPicker } from './GuidedFormatPicker';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TextFieldProps } from './TextField';

const inputClass =
  'block m-0 w-full rounded border border-gray-400 bg-white px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-blue-600 disabled:bg-gray-100';

function TextFieldEditor(_props: Partial<TextFieldProps>) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold leading-6">
        {t('Placeholder')}
        <Field className={inputClass} type="text" name="placeholder" required={false} />
      </label>
      <GuidedFormatPicker />
      <label className="block text-sm font-bold leading-6">
        <FormikCheckbox name="multiline" required={false} />
        {t('Allow multiline input')}
      </label>
      <label className="block text-sm font-bold leading-6">
        {t('Minimum lines')}
        <Field className={inputClass} type="number" name="minLines" required={false} />
      </label>
      <label className="block text-sm font-bold leading-6">
        <FormikCheckbox name="previewInline" required={false} />
        {t('Preview text as inline (span)')}
      </label>
    </div>
  );
}

export default TextFieldEditor;
