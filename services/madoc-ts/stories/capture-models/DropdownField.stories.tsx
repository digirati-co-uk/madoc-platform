import * as React from 'react';
import { PluginProvider } from '../../src/frontend/shared/capture-models/plugin-api/context';
import { FieldEditor } from '../../src/frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import { FieldInstanceList } from '../../src/frontend/shared/capture-models/editor/components/FieldInstanceList/FieldInstanceList';
import { FieldWrapper } from '../../src/frontend/shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import { DropdownField } from '../../src/frontend/shared/capture-models/editor/input-types/DropdownField/DropdownField';
import '../../src/frontend/shared/capture-models/editor/input-types/DropdownField/index';

export default { title: 'Capture models/Dropdown' };

export const Simple: React.FC = () => {
  const [value, setValue] = React.useState<string | undefined>('');
  return (
    <form>
      <DropdownField
        id="1"
        options={[
          { text: 'Test 1', value: '1' },
          { text: 'Test 2', value: '2' },
          { text: 'Test 3', value: '3' },
        ]}
        label="Some label"
        type="dropdown-field"
        value={value}
        updateValue={setValue}
      />
    </form>
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
            type: 'dropdown-field',
            value: 'value 2',
            options: [
              { text: 'Test 1', value: '1' },
              { text: 'Test 2', value: '2' },
              { text: 'Test 3', value: '3' },
            ],
            description: 'Some other longer description',
            label: 'Another field',
          } as any,
        ]}
      />
    </PluginProvider>
  );
};

export const WithFieldWrapper: React.FC = () => {
  return (
    <PluginProvider>
      <FieldWrapper
        field={
          {
            id: '1',
            type: 'dropdown-field',
            value: 'value 2',
            options: [
              { text: 'Test 1', value: '1' },
              { text: 'Test 2', value: '2' },
              { text: 'Test 3', value: '3' },
            ],
            description: 'Some other longer description',
            label: 'Another field',
          } as any
        }
        onUpdateValue={value => console.log(value)}
      />
    </PluginProvider>
  );
};

export const DropdownFieldEditor: React.FC = () => {
  return (
    <PluginProvider>
      <div style={{ margin: 40 }}>
        <FieldEditor
          field={
            {
              id: '1',
              type: 'dropdown-field',
              value: undefined,
              options: [
                { text: 'Test 1', value: '1' },
                { text: 'Test 2', value: '2' },
                { text: 'Test 3', value: '3' },
              ],
              description: 'Some other longer description',
              label: 'Another field',
            } as any
          }
          onDelete={() => {
            console.log('deleted');
          }}
          onSubmit={newField => console.log(newField)}
        />
      </div>
    </PluginProvider>
  );
};
