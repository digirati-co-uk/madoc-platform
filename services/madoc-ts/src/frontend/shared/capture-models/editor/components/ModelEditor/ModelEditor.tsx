import React, { useEffect, useMemo, useState } from 'react';
import { BrowserComponent } from '../../../../utility/browser-component';
import { CaptureModel, ModelFields } from '../../../types/capture-model';
import { StructureType } from '../../../types/utility';
import { modelFieldsToModelRoot } from '../../../utility/model-fields-to-model-root';
import { Button } from '../../atoms/Button';
import { Card, CardContent, CardMeta, CardHeader } from '../../atoms/Card';
import { Dropdown } from '../../atoms/Dropdown';
import { Grid, GridColumn } from '../../atoms/Grid';
import { List, ListHeader, ListContent, ListItem } from '../../atoms/List';
import { MultiDropdown } from '../../atoms/MultiDropdown';
import { StyledFormField, StyledFormLabel } from '../../atoms/StyledForm';
import { expandModelFields, mergeFlatKeys, structureToFlatStructureDefinition } from '../../core/structure-editor';
import { SelectModelFields } from '../SelectModelFields/SelectModelFields';
import { StructureMetadataEditor } from '../StructureMetadataEditor/StructureMetadataEditor';
import { Box } from '@styled-icons/entypo/Box';
import { Edit } from '@styled-icons/entypo/Edit';
import { Tag } from '../../atoms/Tag';
import { useTranslation } from 'react-i18next';
import { ReorderableFieldList } from '../ReorderableFieldList/ReorderableFieldList.lazy';

type Props = {
  document: CaptureModel['document'];
  setLabel: (label: string) => void;
  model: StructureType<'model'>;
  modelFields: ModelFields;
  setDescription: (description: string) => void;
  setInstructions: (instructions: string) => void;
  setModelFields: (fields: ModelFields) => void;
  setModelRoot: (modelRoot?: string[] | null) => void;

  initialPath?: number[];
  popFocus: () => void;
};

// Set label
// Set description
// Add field
// Remove field
// @todo later
//   - Reorder fields
//   - Profile value
export const ModelEditor: React.FC<Props> = ({
  document,
  model,
  popFocus,
  modelFields,
  setLabel,
  setDescription,
  setModelRoot,
  setInstructions,
  initialPath = [],
  setModelFields,
}) => {
  const { t } = useTranslation();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selected, setSelected] = useState<string[][]>(() => expandModelFields(modelFields));
  const modelRoot = model.modelRoot || [];

  const flatKeys = useMemo(() => mergeFlatKeys(selected), [selected]);
  const modelRootOptions = useMemo(() => modelFieldsToModelRoot(flatKeys, { singleLevel: true }), [flatKeys]);

  useEffect(() => {
    if (flatKeys) {
      setModelFields(flatKeys);
    }
  }, [flatKeys, setModelFields]);

  useEffect(() => {
    if (modelRootOptions.length === 0) {
      setModelRoot(null);
    }
  }, [modelRootOptions]);

  return (
    <Card fluid>
      <CardContent>
        <Grid>
          {initialPath.length ? (
            <GridColumn>
              <Button onClick={() => popFocus()}>{t('back')}</Button>
            </GridColumn>
          ) : null}
          <GridColumn fluid>
            <CardHeader>{model.label}</CardHeader>
            <CardMeta>{t('Model')}</CardMeta>
          </GridColumn>
        </Grid>
      </CardContent>
      <CardContent extra>
        <StructureMetadataEditor
          key={`${model.label}${model.description}${model.instructions}`}
          structure={model}
          onSave={values => {
            setLabel(values.label);
            setDescription(values.description || '');
            if (values.type === 'model') {
              setInstructions(values.instructions || '');
            }
          }}
        />
      </CardContent>
      <CardContent>
        <BrowserComponent fallback={<>{t('loading...')}</>}>
          <ReorderableFieldList document={document} selected={selected} setSelected={setSelected} />
        </BrowserComponent>
      </CardContent>
      <CardContent>
        {isSelecting ? (
          <React.Fragment>
            <SelectModelFields
              document={document}
              selected={selected}
              onSave={m => {
                setIsSelecting(false);
                setSelected(s => (s ? [...s, m] : [m]));
              }}
            />
            <br />
            <Button onClick={() => setIsSelecting(false)}>{t('Cancel')}</Button>
          </React.Fragment>
        ) : (
          <Button onClick={() => setIsSelecting(true)}>{t('Add new field')}</Button>
        )}
      </CardContent>
      {modelRootOptions.length ? (
        <CardContent extra>
          <StyledFormField>
            <StyledFormLabel>
              {t('Model root')}
              <Dropdown
                placeholder={t('Choose a root for the form')}
                fluid
                selection
                isClearable
                value={modelRoot.join('{SEPARATOR}')}
                onChange={val => {
                  const newRoot = val ? val.split('{SEPARATOR}') : [];
                  setModelRoot(newRoot.length ? newRoot : null);
                }}
                options={modelRootOptions.map(source => {
                  return {
                    key: source.root.join(' / '),
                    text: source.root.join(' / '),
                    value: source.root.join('{SEPARATOR}'),
                  };
                })}
              />
            </StyledFormLabel>
          </StyledFormField>
        </CardContent>
      ) : null}
      <CardContent extra>
        <pre>{JSON.stringify(mergeFlatKeys(selected), null, 2)}</pre>
      </CardContent>
    </Card>
  );
};
