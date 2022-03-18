import * as React from 'react';
import { BaseField } from '../../../types/field-types';
import { createFormFieldReducer } from '../../core/current-form';
import { FieldWrapper } from '../FieldWrapper/FieldWrapper';
import { FieldSet, FieldSetRenderField } from './FieldSet';

import '../../input-types/TextField';

export default { title: 'Capture model editor components/Fieldset' };

const model0 = require('../../../../../../../fixtures/01-basic/01-single-field.json');
const model1 = require('../../../../../../../fixtures/01-basic/02-multiple-fields.json');
const model2 = require('../../../../../../../fixtures/02-nesting/03-deeply-nested-subset.json');
const model = require('../../../../../../../fixtures/02-nesting/04-deeply-nested-mixed-instance.json');

const firstOption = model1.structure.items[0].fields.reduce(createFormFieldReducer(model1.document), []);

const simpleRenderField: FieldSetRenderField = (field: BaseField, config) => {
  return (
    <div key={config.key}>
      <FieldWrapper field={field} onUpdateValue={value => console.log('field updated value => ', value)} />
    </div>
  );
};

export const Simple: React.FC = () => (
  <FieldSet fields={firstOption} renderField={simpleRenderField} label={model1.structure.items[0].label} />
);

const secondOption = model0.structure.items[0].fields.reduce(createFormFieldReducer(model0.document), []);

export const SingleField: React.FC = () => (
  <FieldSet fields={secondOption} renderField={simpleRenderField} label={model0.structure.items[0].label} />
);

const nestedModel = model.structure.items[0].fields.reduce(createFormFieldReducer(model.document), []);

export const NestedModel: React.FC = () => (
  <FieldSet fields={nestedModel} renderField={simpleRenderField} label={model.structure.label} />
);

export const CustomNestedModel: React.FC = () => (
  <FieldSet
    fields={nestedModel}
    renderField={simpleRenderField}
    label={model.structure.label}
    renderNestedFieldset={(props, { key }) => (
      <FieldSet
        {...props}
        style={{
          background: `hsl(${props.depth * 80}, 80%, 70%)`,
          marginBottom: 10,
          padding: 15,
          border: '1px solid #000',
        }}
        key={key}
        renderField={(field, config) => (
          <FieldWrapper field={field} onUpdateValue={value => console.log('field updated value => ', value)} />
        )}
      />
    )}
  />
);
