import React, { useEffect, useMemo, useState } from 'react';
import { CaptureModel, ModelFields } from '../../../types/capture-model';
import { StructureType } from '../../../types/utility';
import { Button } from '../../atoms/Button';
import { Card, CardContent, CardMeta, CardHeader } from '../../atoms/Card';
import { Grid, GridColumn } from '../../atoms/Grid';
import { List, ListHeader, ListContent, ListItem } from '../../atoms/List';
import { expandModelFields, mergeFlatKeys, structureToFlatStructureDefinition } from '../../core/structure-editor';
import { SelectModelFields } from '../SelectModelFields/SelectModelFields';
import { StructureMetadataEditor } from '../StructureMetadataEditor/StructureMetadataEditor';
import { Box } from '@styled-icons/entypo/Box';
import { Edit } from '@styled-icons/entypo/Edit';
import { Tag } from '../../atoms/Tag';
import { useTranslation } from 'react-i18next';

type Props = {
  document: CaptureModel['document'];
  setLabel: (label: string) => void;
  model: StructureType<'model'>;
  modelFields: ModelFields;
  setDescription: (description: string) => void;
  setInstructions: (instructions: string) => void;
  setModelFields: (fields: ModelFields) => void;

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
  setInstructions,
  initialPath = [],
  setModelFields,
}) => {
  const { t } = useTranslation();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selected, setSelected] = useState<string[][]>(() => expandModelFields(modelFields));

  const flatKeys = useMemo(() => mergeFlatKeys(selected), [selected]);

  useEffect(() => {
    if (flatKeys) {
      setModelFields(flatKeys);
    }
  }, [flatKeys, setModelFields]);

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
        <List>
          {structureToFlatStructureDefinition(document, mergeFlatKeys(selected)).map((item, key) => (
            <ListItem key={key}>
              {item.type === 'entity' ? <Box size={16} /> : <Edit size={16} />}
              <ListContent fluid>
                <ListHeader>{item.label}</ListHeader>
              </ListContent>
              <ListContent>
                <Tag style={{ marginRight: 5 }}>{item.type}</Tag>
                <Button
                  alert
                  size="mini"
                  onClick={() => {
                    // Remove the current item.
                    setSelected(selected.filter(r => r.join('--HASH--') !== item.key.join('--HASH--')));
                  }}
                >
                  {t('Remove')}
                </Button>
              </ListContent>
            </ListItem>
          ))}
        </List>
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
      <CardContent extra>
        <pre>{JSON.stringify(mergeFlatKeys(selected), null, 2)}</pre>
      </CardContent>
    </Card>
  );
};
