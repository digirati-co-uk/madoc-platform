import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react';

type FormikCheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'name' | 'value' | 'defaultValue' | 'checked' | 'onChange' | 'type'
> & {
  name: string;
};

export function FormikCheckbox({ name, className = '', ...props }: FormikCheckboxProps) {
  const [field, , helpers] = useField<unknown>(name);

  return (
    <input
      {...props}
      name={name}
      type="checkbox"
      className={`m-[0.8rem] h-4 w-4 self-start [grid-area:checkbox] ${className}`}
      checked={Array.isArray(field.value) ? field.value.length > 0 : !!field.value}
      onBlur={field.onBlur}
      onChange={event => helpers.setValue(event.currentTarget.checked)}
    />
  );
}
