import * as React from 'react';
import { PluginProvider } from '../../src/frontend/shared/capture-models/plugin-api/context';
import { FieldEditor } from '../../src/frontend/shared/capture-models/editor/components/FieldEditor/FieldEditor';
import { FieldInstanceList } from '../../src/frontend/shared/capture-models/editor/components/FieldInstanceList/FieldInstanceList';
import { FieldWrapper } from '../../src/frontend/shared/capture-models/editor/components/FieldWrapper/FieldWrapper';
import {
  AutocompleteField,
  AutocompleteFieldProps,
  CompletionItem,
} from '../../src/frontend/shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import { withKnobs } from '@storybook/addon-knobs';
import '../../src/frontend/shared/capture-models/editor/input-types/AutocompleteField/index';

export default { title: 'Capture models/Autocomplete', decorators: [withKnobs] };

export const Simple: React.FC = () => {
  const [value, setValue] = React.useState<CompletionItem | undefined>();
  return (
    <form>
      <AutocompleteField
        id="1"
        label="Some label"
        type="autocomplete-field"
        dataSource={
          'https://gist.githubusercontent.com/stephenwf/8085651ddef94fb55f75c31fa33b36ab/raw/768995ed1a68eeeebd05bf791539682ae1cb5513/test.json?t=%'
        }
        value={value}
        updateValue={setValue}
      />
    </form>
  );
};

export const SimpleWithInitial: React.FC = () => {
  const [value, setValue] = React.useState<CompletionItem | undefined>();
  return (
    <form>
      <AutocompleteField
        id="1"
        label="Some label"
        type="autocomplete-field"
        dataSource={
          'https://gist.githubusercontent.com/stephenwf/8085651ddef94fb55f75c31fa33b36ab/raw/768995ed1a68eeeebd05bf791539682ae1cb5513/test.json?t=%'
        }
        requestInitial
        value={value}
        updateValue={setValue}
      />
    </form>
  );
};
export const SimpleWithFixedList: React.FC = () => {
  const [value, setValue] = React.useState<CompletionItem | undefined>();
  return (
    <form>
      <AutocompleteField
        id="1"
        label="Some label"
        type="autocomplete-field"
        dataSource={
          'https://gist.githubusercontent.com/stephenwf/8085651ddef94fb55f75c31fa33b36ab/raw/768995ed1a68eeeebd05bf791539682ae1cb5513/test.json'
        }
        requestInitial
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
            type: 'autocomplete-field',
            value: {
              uri: 'http://id.worldcat.org/fast/fst00969633',
              label: 'Indians of North America',
              resource_class: 'Topic',
            },
            dataSource:
              'https://gist.githubusercontent.com/stephenwf/8085651ddef94fb55f75c31fa33b36ab/raw/768995ed1a68eeeebd05bf791539682ae1cb5513/test.json?t=%',
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
            type: 'autocomplete-field',
            value: {
              uri: 'http://id.worldcat.org/fast/fst00969633',
              label: 'Indians of North America',
              resource_class: 'Topic',
            },
            dataSource:
              'https://gist.githubusercontent.com/stephenwf/8085651ddef94fb55f75c31fa33b36ab/raw/768995ed1a68eeeebd05bf791539682ae1cb5513/test.json?t=%',
            description: 'Some other longer description',
            label: 'Another field',
          } as any
        }
        onUpdateValue={value => console.log(value)}
      />
    </PluginProvider>
  );
};

export const AutocompleteFieldEditor: React.FC = () => {
  return (
    <PluginProvider>
      <div style={{ margin: 40 }}>
        <FieldEditor
          field={
            {
              id: '1',
              type: 'autocomplete-field',
              value: undefined,
              dataSource:
                'https://gist.githubusercontent.com/stephenwf/8085651ddef94fb55f75c31fa33b36ab/raw/768995ed1a68eeeebd05bf791539682ae1cb5513/test.json?t=%',
              description: 'Some other longer description',
              label: 'Another field',
            } as AutocompleteFieldProps
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
