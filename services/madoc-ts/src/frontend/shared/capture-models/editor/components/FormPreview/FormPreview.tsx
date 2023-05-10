import { useFormikContext } from 'formik';
import React, { useState } from 'react';
import { BaseField } from '../../../types/field-types';
import { Button } from '../../atoms/Button';
import { FieldWrapper } from '../FieldWrapper/FieldWrapper';
import { useTranslation } from 'react-i18next';

export const FormPreview: React.FC<{
  term?: string;
  type: string;
  defaultValue?: any;
  setDefaultValue?: (value: any) => void;
  mapValues?: (props: any) => any;
}> = ({ type, term, mapValues, defaultValue, setDefaultValue }) => {
  const { t } = useTranslation();
  const { values } = useFormikContext<BaseField>();
  const [value, setValue] = useState(values.value);

  // const [field] = useField(values, value, setValue);
  return (
    <>
      <FieldWrapper
        field={{ ...(mapValues && values ? mapValues(values) : values), value, type }}
        term={term}
        onUpdateValue={setValue}
      />
      {setDefaultValue && value !== defaultValue ? (
        <>
          <Button type="button" onClick={() => setDefaultValue(value)} size="mini">
            {t('Use as default value')}
          </Button>
        </>
      ) : null}
    </>
  );
};
