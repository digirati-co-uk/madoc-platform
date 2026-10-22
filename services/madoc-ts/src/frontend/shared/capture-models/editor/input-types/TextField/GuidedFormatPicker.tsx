import React, { useId, useState } from 'react';
import { Field, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { compileMask } from '../../../../utility/input-mask';
import {
  customFormatExamples,
  guidedFormatGroups,
  guidedFormatPresets,
  resolveGuidedFormat,
} from '../../../../utility/guided-formats';
import type { TextFieldProps } from './TextField';
import { FormattedTextInput } from './FormattedTextInput';

const inputClass =
  'block m-0 w-full rounded border border-gray-400 bg-white px-3 py-2 text-sm font-normal leading-6 outline-none focus:border-blue-600 disabled:bg-gray-100';

export function GuidedFormatPicker() {
  const { values, errors, setFieldValue } = useFormikContext<Partial<TextFieldProps>>();
  const { t } = useTranslation();
  const id = useId();
  const current = values.inputFormat || 'text';
  const oldFormats: Record<string, string> = {
    number: 'Any number (sign, decimal point or exponent)',
    time: 'HH:mm (optional seconds and fractions)',
    'date-time': 'DD-MM-YYYY HH:mm (optional seconds and fractions)',
  };
  const known =
    current === 'text' ||
    current === 'custom' ||
    !!oldFormats[current] ||
    guidedFormatPresets.some(preset => preset.id === current);
  const custom = current === 'custom';
  const mask = custom ? compileMask(values.formatTemplate || '', true) : undefined;
  const format = resolveGuidedFormat(values);
  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold leading-6">
        {t('Input format')}
        <Field as="select" name="inputFormat" value={current} disabled={!!values.multiline} className={inputClass}>
          <option value="text">{t('Free text · anything can be typed')}</option>
          {guidedFormatGroups.map(group => (
            <optgroup key={group} label={t(group)}>
              {guidedFormatPresets
                .filter(preset => preset.group === group)
                .map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.group === 'Numbers' ? t(preset.label) : preset.label} · {t('e.g.')} {preset.example}
                  </option>
                ))}
            </optgroup>
          ))}
          <option value="custom">{t('Custom pattern…')}</option>
          {oldFormats[current] ? (
            <optgroup label={t('Existing setting')}>
              <option value={current}>{t(oldFormats[current], { nsSeparator: false })}</option>
            </optgroup>
          ) : null}
          {!known ? <option value={current}>{current}</option> : null}
        </Field>
      </label>
      <p className="text-xs text-gray-600">
        {t(
          values.multiline
            ? 'Formats apply to single-line fields. Turn off multiline input to use one.'
            : 'Choose a format and try it below. Saved values are never rewritten when you change the format.'
        )}
      </p>
      {!values.multiline && current.startsWith('number-') ? (
        <label className="flex gap-2 text-sm">
          <Field type="checkbox" name="allowNegative" />
          {t('Allow a minus sign')}
        </label>
      ) : null}
      {!values.multiline && custom ? (
        <div className="space-y-2">
          <label className="block text-sm font-bold leading-6">
            {t('Pattern')}
            <Field
              name="formatTemplate"
              className={`${inputClass} font-mono`}
              aria-invalid={!!errors.formatTemplate || undefined}
              aria-describedby={`${id}-pattern-help ${id}-pattern-error`}
            />
          </label>
          <p id={`${id}-pattern-help`} className="text-xs text-gray-600">
            {t(
              '# = digit, @ = letter, * = letter or digit. Other characters are fixed. Put \\ before # @ * or \\ to show it as typed. Use 1–32 slots and at most 48 characters.'
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {customFormatExamples.map(example => (
              <button
                key={example.pattern}
                type="button"
                className="rounded border border-gray-400 bg-white px-2 py-1 text-xs"
                onClick={() => setFieldValue('formatTemplate', example.pattern)}
              >
                {t(example.label)} · {example.pattern}
              </button>
            ))}
          </div>
          <p id={`${id}-pattern-error`} role="status" className="text-xs text-red-700">
            {typeof mask === 'string' ? t(mask) : ''}
          </p>
          {format ? (
            <p className="text-xs text-gray-600">
              {t('Example')}: {format.example}. {t('Custom patterns check shape only.')}
            </p>
          ) : null}
        </div>
      ) : null}
      {!values.multiline && current !== 'text' ? (
        <div
          onKeyDown={event => {
            if (event.key === 'Enter') event.preventDefault();
          }}
        >
          <label htmlFor={`${id}-sample`} className="block text-sm font-bold leading-6">
            {t('Try it')}
          </label>
          <FormatSample
            key={JSON.stringify([current, values.formatTemplate || '', !!values.allowNegative])}
            id={`${id}-sample`}
            inputFormat={values.inputFormat}
            formatTemplate={values.formatTemplate}
            allowNegative={values.allowNegative}
          />
          {format?.historicalMask ? (
            <p className="text-xs text-gray-600">
              {t('Three-digit historical years are also accepted without padding.')}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// Samples are disposable. Remounting on configuration changes resets their value and input baseline together.
function FormatSample(props: Pick<TextFieldProps, 'id' | 'inputFormat' | 'formatTemplate' | 'allowNegative'>) {
  const [sample, setSample] = useState('');
  return <FormattedTextInput {...props} value={sample} onChange={setSample} />;
}
