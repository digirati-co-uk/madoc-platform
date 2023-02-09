import * as React from 'react';
import { FieldWrapper } from '../../src/frontend/shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import { PluginProvider } from '../../src/frontend/shared/capture-models/plugin-api/context';
import { TaggedTextField } from '../../src/frontend/shared/capture-models/editor/input-types/TaggedTextField/TaggedTextField';

import { FieldEditor } from '../../src/frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import '../../src/frontend/shared/capture-models/editor/input-types/TaggedTextField/index';

export default { title: 'Capture models/ Tagged text field' };

export const Simple: React.FC = () => {
  const [value, setValue] = React.useState('');
  return (
    <form>
      <TaggedTextField
        id="1"
        label="Some label"
        preset={'bentham'}
        type="text-field"
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
        field={{
          id: '1',
          type: 'tagged-text-field',
          value: 'value 2',
          description: '<header>Testing a header</header><p>First paragraph</p><footer>This is a footer</footer>',
          label: 'Another field',
        }}
        onUpdateValue={value => console.log(value)}
      />
    </PluginProvider>
  );
};

export const TaggedTextFieldEditor: React.FC = () => {
  return (
    <PluginProvider>
      <div style={{ margin: 40 }}>
        <FieldEditor
          field={
            {
              id: '1',
              type: 'tagged-text-field',
              value: '<header>Testing a header</header><p>First paragraph</p><footer>This is a footer</footer>',
              preset: 'bentham',
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
