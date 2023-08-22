import copy from 'fast-copy';
import React, { useContext, useState } from 'react';
import { Field, Form, Formik } from 'formik';
import { BrowserComponent } from '../../../../utility/browser-component';
import { generateId } from '../../../helpers/generate-id';
import { PluginContext } from '../../../plugin-api/context';
import { BaseField } from '../../../types/field-types';
import { BaseSelector, SelectorTypeMap } from '../../../types/selector-types';
import { Button } from '../../atoms/Button';
import { Segment } from '../../atoms/Segment';
import { ConfirmButton } from '../../atoms/ConfirmButton';
import { ChooseSelectorButton } from '../ChooseSelectorButton/ChooseSelectorButton';
import { ChooseFieldButton } from '../ChooseFieldButton/ChooseFieldButton';
import { FormPreview } from '../FormPreview/FormPreview';
import { Dropdown } from '../../atoms/Dropdown';
import {
  StyledCheckbox,
  StyledFormField,
  StyledFormInputElement,
  StyledFormLabel,
  StyledFormTextarea,
} from '../../atoms/StyledForm';
import { AutoSaveFormik } from '../AutoSaveFormik/AutoSaveFormik';
import { MultiDropdown } from '../../atoms/MultiDropdown';
import { useTranslation } from 'react-i18next';

export type FieldSource = {
  id: string;
  name: string;
  description?: string;
  defaultProps?: any;
  fieldTypes: string[];
};

export const FieldEditor: React.FC<{
  field: BaseField;
  term?: string;
  onSubmit: (newProps: BaseField, term?: string) => void;
  onDelete?: (term?: string) => void;
  onChangeFieldType?: (type: string, defaults: any, term?: string) => void;
  setSaveHandler?: (handler: () => void) => void;
  sourceTypes?: Array<FieldSource>;
  subtreeFields?: any[];
}> = ({ onSubmit, onDelete, onChangeFieldType, sourceTypes, field: props, term, subtreeFields }) => {
  const { t } = useTranslation();
  const ctx = useContext(PluginContext);
  const { fields, selectors } = useContext(PluginContext);
  const [selector, setSelector] = useState<BaseSelector | undefined>(props.selector);
  const field = ctx.fields[props.type];
  const [defaultValue, setDefaultValue] = useState<any>(props.value);

  if (!field) {
    throw new Error(`Plugin ${props.type} does not exist`);
  }

  const editorProps = field.mapEditorProps ? field.mapEditorProps(props) : props;
  const editor = React.createElement(field.Editor, editorProps as any);
  const dataSources = (sourceTypes || []).filter(sourceType => {
    return sourceType.fieldTypes.indexOf(props.type) !== -1;
  });
  const [dataSource, setDataSource] = useState<string[]>(props.dataSources || []);
  const [dependantField, setDependantField] = useState<string | undefined>(props.dependant || undefined);

  return (
    <BrowserComponent fallback="loading...">
      <Formik
        initialValues={props}
        onSubmit={newProps => {
          if (field.onEditorSubmit) {
            onSubmit(
              field.onEditorSubmit({
                ...newProps,
                type: props.type,
                selector,
                dataSources: dataSource && dataSource.length ? dataSource : undefined,
                dependent: dependantField ? dependantField : undefined,
                value: defaultValue,
              }),
              term
            );
          } else {
            onSubmit(
              {
                ...newProps,
                type: props.type,
                selector,
                dataSources: dataSource && dataSource.length ? dataSource : undefined,
                dependant: dependantField ? dependantField : undefined,
                value: defaultValue,
              },
              term
            );
          }
        }}
      >
        <Form>
          <AutoSaveFormik />
          <Segment>
            <h3 style={{ textAlign: 'center' }}>{t('Preview')}</h3>
            <FormPreview
              key={`${props.type}-${term}`}
              type={props.type}
              term={term}
              defaultValue={defaultValue}
              setDefaultValue={setDefaultValue}
              mapValues={field.onEditorSubmit}
            />
          </Segment>
          <StyledFormField>
            <StyledFormLabel>
              {t('Label')}
              <Field as={StyledFormInputElement} type="text" name="label" required={true} />
            </StyledFormLabel>
          </StyledFormField>
          <StyledFormField>
            <StyledFormLabel>
              {t('Description')}
              <Field as={StyledFormTextarea} name="description" />
            </StyledFormLabel>
          </StyledFormField>
          {onChangeFieldType ? (
            <StyledFormField>
              <StyledFormLabel>
                {t('Field type')}
                <ChooseFieldButton
                  fieldType={field.type}
                  onChange={type =>
                    type && fields[type] ? onChangeFieldType(type, (fields[type] as any).defaultProps, term) : null
                  }
                />
              </StyledFormLabel>
            </StyledFormField>
          ) : null}
          {subtreeFields && (
            <StyledFormField>
              <StyledFormLabel>
                {t('Depends on? (Chosen field will only appear if the this field has a value)')}
              </StyledFormLabel>
              <Dropdown
                placeholder={t('Choose a field')}
                fluid
                selection
                options={subtreeFields.map(f =>
                  f
                    ? {
                        key: f.value.id,
                        text: f.term || '',
                        value: f.value.id,
                      }
                    : null
                )}
                value={dependantField}
                onChange={val => {
                  setDependantField(val || undefined);
                }}
              />
            </StyledFormField>
          )}
          {dataSources ? (
            <StyledFormField>
              <StyledFormLabel>
                {t('Dynamic data sources')}
                <MultiDropdown
                  placeholder={t('Choose data sources')}
                  fluid
                  selection
                  value={dataSource}
                  onChange={val => {
                    setDataSource(val || []);
                  }}
                  options={dataSources.map(source => {
                    return {
                      key: source.id,
                      text: source.name || '',
                      value: source.id,
                    };
                  })}
                />
              </StyledFormLabel>
            </StyledFormField>
          ) : null}
          <StyledFormField>
            <StyledFormLabel>
              {t('Choose selector (optional)')}
              <ChooseSelectorButton
                value={props.selector ? props.selector.type : ''}
                onChange={v => {
                  if (v) {
                    const chosenSelector = selectors[v as keyof SelectorTypeMap];
                    if (chosenSelector) {
                      setSelector({
                        id: generateId(),
                        type: chosenSelector.type,
                        state: copy(chosenSelector.defaultState),
                      });
                    }
                  } else {
                    setSelector(undefined);
                  }
                }}
              />
            </StyledFormLabel>
          </StyledFormField>
          {selector ? (
            <StyledFormField>
              <StyledFormLabel>
                <StyledCheckbox
                  type="checkbox"
                  checked={!!selector.required}
                  onChange={(e: any) => {
                    const checked = e.target.checked;
                    setSelector(prevSelector => {
                      if (!prevSelector) {
                        return prevSelector;
                      }
                      return {
                        ...prevSelector,
                        required: checked,
                      };
                    });
                  }}
                  style={{ marginRight: 10 }}
                />
                {t('Selector is required')}
              </StyledFormLabel>
            </StyledFormField>
          ) : null}
          <StyledFormField>
            <StyledFormLabel>
              <Field as={StyledCheckbox} type="checkbox" name="allowMultiple" style={{ marginRight: 10 }} />
              {t('Allow multiple instances')}
            </StyledFormLabel>
          </StyledFormField>
          <StyledFormField>
            <StyledFormLabel>
              <Field as={StyledCheckbox} type="checkbox" name="required" style={{ marginRight: 10 }} />
              {t('Required field')}
            </StyledFormLabel>
          </StyledFormField>
          <StyledFormField>
            <StyledFormLabel>
              {t('Plural label (used when referring to lists of this document)')}
              <Field as={StyledFormInputElement} type="text" name="pluralField" />
            </StyledFormLabel>
            <StyledFormLabel>
              {t('Max number of instances (used when referring to lists of this document)')}
              <Field as={StyledFormInputElement} type="number" name="maxMultiple" />
            </StyledFormLabel>
          </StyledFormField>
          {editor}
          <div style={{ marginTop: 20 }}>
            <Button type="submit" primary style={{ marginRight: '.5em' }}>
              {t('Save changes')}
            </Button>
            {onDelete ? (
              <ConfirmButton message={t('Are you sure you want to remove this field?')} onClick={() => onDelete(term)}>
                <Button type="button" alert>
                  {t('Delete field')}
                </Button>
              </ConfirmButton>
            ) : null}
          </div>
        </Form>
      </Formik>
    </BrowserComponent>
  );
};
