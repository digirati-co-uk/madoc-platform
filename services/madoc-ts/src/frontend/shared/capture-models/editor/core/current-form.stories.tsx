import { FieldSet } from '../components/FieldSet/FieldSet';
import { CaptureModelProvider } from './capture-model-provider';
import React, { useEffect } from 'react';
import { useCurrentForm } from './current-form';
import { useNavigation } from './navigation';
import '../input-types/TextField/index';

const withSimpleCaptureModel = (Component: React.FC): React.FC => () => (
  <CaptureModelProvider captureModel={require('../../../../../../fixtures/simple.json')}>
    <Component />
  </CaptureModelProvider>
);

export default {
  title: 'Core/Current form',
};

export const SimpleForm: React.FC = withSimpleCaptureModel(() => {
  const { currentFields, updateFieldValue } = useCurrentForm();
  const { replacePath } = useNavigation();

  useEffect(() => {
    replacePath([0, 0]);
  }, [replacePath]);

  return (
    <FieldSet
      fields={currentFields}
      renderField={(field, { key, path }) => (
        <ul key={key}>
          <li>
            <strong>Label: </strong> {field.label}
          </li>
          <li>
            <strong>Description: </strong> {field.description}
          </li>
          <li>
            <strong>Type: </strong> {field.type}
          </li>
          <li>
            <strong>Value: </strong> {typeof field.value === 'string' ? field.value : 'n/a'}{' '}
            <button onClick={() => updateFieldValue(path, `${new Date().getTime()}`)}>Update value</button>
          </li>
        </ul>
      )}
    />
  );
});
