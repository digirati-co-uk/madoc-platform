import { FormikCheckbox } from '../../atoms/FormikCheckbox';
import { Field, useFormikContext } from 'formik';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TextFieldProps } from './TextField';

const inputClass =
  'block m-0 w-full rounded border border-gray-400 bg-white px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-blue-600 disabled:bg-gray-100';

function TextFieldEditor(_props: Partial<TextFieldProps>) {
  const { values } = useFormikContext<Partial<TextFieldProps>>();
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold leading-6">
        {t('Placeholder')}
        <Field className={inputClass} type="text" name="placeholder" required={false} />
      </label>
      <label className="block text-sm font-bold leading-6">
        {t('Input format')}
        <Field
          as="select"
          name="inputFormat"
          value={values.inputFormat || 'text'}
          disabled={!!values.multiline}
          className={inputClass}
        >
          <option value="text">{t('Plain text')}</option>
          <option value="number">{t('Number')}</option>
          <option value="time">{t('Time')}</option>
          <option value="date-time">{t('Date and time')}</option>
        </Field>
        <span className="block text-xs font-normal text-gray-600">
          {t('Format guidance applies to single-line input. Existing values are preserved.')}
        </span>
      </label>
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
