import { InternationalString } from '@hyperion-framework/types';
import * as React from 'react';
import { FieldWrapper } from '../../src/frontend/shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import { PluginProvider } from '../../src/frontend/shared/capture-models/plugin-api/context';
import { InternationalField } from '../../src/frontend/shared/capture-models/editor/input-types/InternationalField/InternationalField';
import { FieldEditor } from '../../src/frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import '../../src/frontend/shared/capture-models/editor/input-types/InternationalField/index';

export default { title: 'Capture models/International Field' };

export const Simple: React.FC = () => {
  const [value, setValue] = React.useState<InternationalString>({ en: [''] });
  return (
    <form>
      <InternationalField id="1" label="Some label" type="international-field" value={value} updateValue={setValue} />
    </form>
  );
};

export const WithFieldWrapper: React.FC = () => {
  return (
    <PluginProvider>
      <FieldWrapper
        field={{
          id: '1',
          type: 'international-field',
          value: 'value 2',
          description: 'Some other longer description',
          label: 'Another field',
        }}
        onUpdateValue={value => console.log(value)}
      />
    </PluginProvider>
  );
};

export const InternationalFieldEditor: React.FC = () => {
  return (
    <PluginProvider>
      <div style={{ margin: 40 }}>
        <FieldEditor
          field={{
            id: '1',
            type: 'international-field',
            value: { en: ['value 2'] },
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
