import * as React from 'react';
import { FieldInstanceList } from '../../src/frontend/shared/capture-models/editor/components/FieldInstanceList/FieldInstanceList';
import { FieldWrapper } from '../../src/frontend/shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import { PluginProvider } from '../../src/frontend/shared/capture-models/plugin-api/context';
import { CheckboxField } from '../../src/frontend/shared/capture-models/editor/input-types/CheckboxField/CheckboxField';
import { withKnobs } from '@storybook/addon-knobs';
import { FieldEditor } from '../../src/frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import '../../src/frontend/shared/capture-models/editor/input-types/CheckboxField/index';

export default { title: 'Capture models/Checkbox', decorators: [withKnobs] };

export const Simple: React.FC = () => {
  const [value, setValue] = React.useState(true);
  return (
    <form>
      <CheckboxField
        id="1"
        label="Some label"
        inlineLabel="Confirm this thing"
        type="checkbox-field"
        value={value}
        updateValue={setValue}
      />
    </form>
  );
};

export const SimpleWithoutLabel: React.FC = () => {
  const [value, setValue] = React.useState(true);
  return (
    <form>
      <CheckboxField id="1" label="Some label" type="checkbox-field" value={value} updateValue={setValue} />
    </form>
  );
};

export const WithFieldWrapper: React.FC = () => {
  return (
    <PluginProvider>
      <FieldWrapper
        field={
          {
            id: '1',
            type: 'checkbox-field',
            value: 'value 2',
            description: 'Some other longer description',
            inlineLabel: 'Confirm this thing',
            label: 'Another field',
          } as any
        }
        onUpdateValue={value => console.log(value)}
      />
    </PluginProvider>
  );
};
export const WithFieldWrapperNoLabel: React.FC = () => {
  return (
    <PluginProvider>
      <FieldWrapper
        field={
          {
            id: '1',
            type: 'checkbox-field',
            value: 'value 2',
            description: 'Some other longer description',
            label: 'Another field',
          } as any
        }
        onUpdateValue={value => console.log(value)}
      />
    </PluginProvider>
  );
};

export const WithPreview: React.FC = () => {
  return (
    <PluginProvider>
      <FieldInstanceList
        property="test"
        fields={[
          {
            id: '1',
            type: 'checkbox-field',
            value: 'value 2',
            description: 'Some other longer description',
            inlineLabel: 'Confirm this thing',
            label: 'Another field',
          } as any,
        ]}
      />
    </PluginProvider>
  );
};

export const CheckboxFieldEditor: React.FC = () => {
  return (
    <PluginProvider>
      <div style={{ margin: 40 }}>
        <FieldEditor
          field={{
            id: '1',
            type: 'checkbox-field',
            value: 'value 2',
            description: 'Some other longer description',
            label: 'Another field',
          }}
          onDelete={() => {
            console.log('deleted');
          }}
          onSubmit={newField => console.log(newField)}
        />
      </div>
    </PluginProvider>
  );
};
