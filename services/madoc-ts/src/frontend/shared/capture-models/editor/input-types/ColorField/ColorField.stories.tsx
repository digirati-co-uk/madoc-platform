import * as React from 'react';
import { PluginProvider } from '../../../plugin-api/context';
import { FieldEditor } from '../../components/FieldEditor/FieldEditor';
import { FieldInstanceList } from '../../components/FieldInstanceList/FieldInstanceList';
import { FieldWrapper } from '../../components/FieldWrapper/FieldWrapper';
import { ColorField } from './ColorField';
import '../../bundle';

export default { title: 'Capture models/Color field' };

export const Simple: React.FC = () => {
  const [value, setValue] = React.useState('#000000');
  return (
    <form>
      <ColorField
        id="1"
        label="Pick the primary color"
        inlineLabel="Primary"
        type="color-field"
        value={value}
        updateValue={setValue}
      />
    </form>
  );
};

export const SimpleWithoutLabel: React.FC = () => {
  const [value, setValue] = React.useState('#000000');
  return (
    <form>
      <ColorField id="1" label="Some label" type="color-field" value={value} updateValue={setValue} />
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
            type: 'color-field',
            value: '#ff0000',
            description: 'Some other longer description',
            inlineLabel: 'Choose color',
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
            type: 'color-field',
            value: '#ff0000',
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
            type: 'color-field',
            value: '#ff0000',
            description: 'Some other longer description',
            inlineLabel: 'Choose color',
            label: 'Another field',
          } as any,
        ]}
      />
    </PluginProvider>
  );
};

export const ColorFieldEditor: React.FC = () => {
  return (
    <PluginProvider>
      <div style={{ margin: 40 }}>
        <FieldEditor
          field={{
            id: '1',
            type: 'color-field',
            value: '#ff0000',
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
