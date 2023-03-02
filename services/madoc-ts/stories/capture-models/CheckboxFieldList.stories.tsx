import * as React from 'react';
import { FieldInstanceList } from '../../src/frontend/shared/capture-models/editor/components/FieldInstanceList/FieldInstanceList';
import { FieldWrapper } from '../../src/frontend/shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import { PluginProvider } from '../../src/frontend/shared/capture-models/plugin-api/context';
import { CheckboxFieldList } from '../../src/frontend/shared/capture-models/editor/input-types/CheckboxListField/CheckboxFieldList';
import { FieldEditor } from '../../src/frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import '../../src/frontend/shared/capture-models/editor/input-types/CheckboxListField/index';

export default { title: 'Capture models/Checkbox list' };

export const Simple: React.FC = () => {
  const [value, setValue] = React.useState({});
  return (
    <form>
      <CheckboxFieldList
        id="1"
        label="Some label"
        options={[
          { value: 'test-1', label: 'Test 1' },
          { value: 'test-2', label: 'Test 2' },
          { value: 'test-3', label: 'Test 3' },
          { value: 'test-4', label: 'Test 4' },
          { value: 'test-5', label: 'Test 5' },
        ]}
        type="checkbox-list-field"
        value={value}
        updateValue={setValue}
      />
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
            type: 'checkbox-list-field',
            value: {
              'test-1': true,
              'test-3': true,
            },
            description: 'Some other longer description',
            inlineLabel: 'Confirm this thing',
            label: 'Another field',
            options: [
              { value: 'test-1', label: 'Test 1' },
              { value: 'test-2', label: 'Test 2' },
              { value: 'test-3', label: 'Test 3' },
              { value: 'test-4', label: 'Test 4' },
              { value: 'test-5', label: 'Test 5' },
            ],
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
            type: 'checkbox-list-field',
            value: {
              'test-1': true,
              'test-3': true,
            },
            description: 'Some other longer description',
            inlineLabel: 'Confirm this thing',
            label: 'Another field',
            options: [
              { value: 'test-1', label: 'Test 1' },
              { value: 'test-2', label: 'Test 2' },
              { value: 'test-3', label: 'Test 3' },
              { value: 'test-4', label: 'Test 4' },
              { value: 'test-5', label: 'Test 5' },
            ],
          } as any,
        ]}
      />
    </PluginProvider>
  );
};

export const WithPreviewList: React.FC = () => {
  return (
    <PluginProvider>
      <FieldInstanceList
        property="test"
        fields={[
          {
            id: '1',
            type: 'checkbox-list-field',
            value: {
              'test-1': true,
              'test-3': true,
            },
            description: 'Some other longer description',
            inlineLabel: 'Confirm this thing',
            label: 'Another field',
            previewList: true,
            options: [
              { value: 'test-1', label: 'Test 1' },
              { value: 'test-2', label: 'Test 2' },
              { value: 'test-3', label: 'Test 3' },
              { value: 'test-4', label: 'Test 4' },
              { value: 'test-5', label: 'Test 5' },
            ],
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
          field={
            {
              id: '1',
              type: 'checkbox-list-field',
              value: {
                'test-1': true,
                'test-3': true,
              },
              description: 'Some other longer description',
              label: 'Another field',
              options: [
                { value: 'test-1', label: 'Test 1' },
                { value: 'test-2', label: 'Test 2' },
                { value: 'test-3', label: 'Test 3' },
                { value: 'test-4', label: 'Test 4' },
                { value: 'test-5', label: 'Test 5' },
              ],
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
