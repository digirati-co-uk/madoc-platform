import React from 'react';
import { CaptureModel, ModelFields } from '../../../types/capture-model';
import { StructureType } from '../../../types/utility';
import { Grid, GridColumn } from '../../atoms/Grid';
import { ChoiceEditor } from '../ChoiceEditor/ChoiceEditor';
import { ModelEditor } from '../ModelEditor/ModelEditor';
import { Tree } from '../Tree/Tree';
import { useTranslation } from 'react-i18next';

type Props = {
  tree: any[];
  structure: CaptureModel['structure'];
  currentPath?: number[];
  document: CaptureModel['document'];
  setPath?: (ids: number[]) => void;
  setLabel: (value: string) => void;
  setDescription: (value: string) => void;
  setProfile: (value: string[]) => void;
  setInstructions: (value: string) => void;
  onAddChoice: (choice: StructureType<'choice'>) => void;
  onAddModel: (model: StructureType<'model'>) => void;
  setModelRoot: (modelRoot?: string[] | null) => void;
  onRemove: (id: number) => void;
  pushFocus: (idx: number) => void;
  setFocus: (idx: number[]) => void;
  popFocus: (payload?: any) => void;
  setModelFields: (fields: ModelFields) => void;
  reorderChoices: (startIndex: number, endIndex: number) => void;
};

export const StructureEditor: React.FC<Props> = ({
  tree,
  document,
  structure,
  setFocus,
  currentPath,
  setDescription,
  setInstructions,
  setModelRoot,
  setLabel,
  setProfile,
  setPath,
  popFocus,
  reorderChoices,
  onRemove,
  pushFocus,
  onAddChoice,
  onAddModel,
  setModelFields,
}) => {
  const { t } = useTranslation();
  return (
    <Grid padded>
      <GridColumn>
        <Tree tree={tree[0]} onClick={({ key }) => setFocus(key)} />
      </GridColumn>
      <GridColumn fluid>
        {structure ? (
          structure.type === 'choice' ? (
            <ChoiceEditor
              key={`${structure.label}${structure.type}${structure.description}`}
              choice={structure}
              onAddChoice={onAddChoice}
              onAddModel={onAddModel}
              popFocus={popFocus}
              onRemove={onRemove}
              pushFocus={pushFocus}
              setLabel={setLabel}
              setDescription={setDescription}
              initialPath={currentPath}
              setProfile={setProfile}
              reorderChoices={reorderChoices}
            />
          ) : structure.type === 'model' ? (
            <ModelEditor
              model={structure}
              initialPath={currentPath}
              popFocus={popFocus}
              key={(currentPath || []).map(r => `${r}`).join('-')}
              setLabel={setLabel}
              setDescription={setDescription}
              setInstructions={setInstructions}
              setModelRoot={setModelRoot}
              document={document}
              modelFields={structure.fields}
              setModelFields={setModelFields}
            />
          ) : (
            <div>{t('Unknown type')}</div>
          )
        ) : (
          <div>{t('empty')}</div>
        )}
      </GridColumn>
    </Grid>
  );
};
