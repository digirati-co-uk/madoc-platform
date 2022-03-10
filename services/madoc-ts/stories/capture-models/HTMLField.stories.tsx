import * as React from 'react';
import { FieldInstanceList } from '../../src/frontend/shared/capture-models/editor/components/FieldInstanceList/FieldInstanceList';
import { FieldWrapper } from '../../src/frontend/shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import { PluginProvider } from '../../src/frontend/shared/capture-models/plugin-api/context';
import { HTMLField } from '../../src/frontend/shared/capture-models/editor/input-types/HTMLField/HTMLField';
import { withKnobs } from '@storybook/addon-knobs';
import { FieldEditor } from '../../src/frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import '../../src/frontend/shared/capture-models/editor/input-types/HTMLField/index';

export default { title: 'Capture models/HTMLField', decorators: [withKnobs] };

export const Simple: React.FC = () => {
  const [value, setValue] = React.useState('');
  return (
    <form>
      <HTMLField id="1" label="Some label" type="html-field" value={value} updateValue={setValue} />
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
            type: 'html-field',
            value: '<p>testing html <strong>this is html</strong> <u>underlined</u> test</p>',
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
        field={{
          id: '1',
          type: 'html-field',
          value: 'value 2',
          description: 'Some other longer description',
          label: 'Another field',
        }}
        onUpdateValue={value => console.log(value)}
      />
    </PluginProvider>
  );
};

export const HTMLFieldEditor: React.FC = () => {
  return (
    <React.Suspense fallback={null}>
      <PluginProvider>
        <div style={{ margin: 40 }}>
          <FieldEditor
            field={{
              id: '1',
              type: 'html-field',
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
    </React.Suspense>
  );
};
