import copy from 'fast-copy';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { PluginContext } from '../../../plugin-api/context';
import { CaptureModel } from '../../../types/capture-model';
import { BaseField } from '../../../types/field-types';
import { BaseSelector, SelectorTypeMap } from '../../../types/selector-types';
import { Button } from '../../atoms/Button';
import { Card, CardHeader, CardContent, CardMeta } from '../../atoms/Card';
import { Grid, GridColumn } from '../../atoms/Grid';
import { List, ListItem, ListHeader, ListContent, ListDescription } from '../../atoms/List';
import { Dropdown } from '../../atoms/Dropdown';
import { useMiniRouter } from '../../hooks/useMiniRouter';
import { ChooseSelectorButton } from '../ChooseSelectorButton/ChooseSelectorButton';
import { NewDocumentForm } from '../NewDocumentForm/NewDocumentForm';
import { NewFieldForm } from '../NewFieldForm/NewFieldForm';
import { SubtreeBreadcrumb } from '../SubtreeBreadcrumb/SubtreeBreadcrumb';
import { Box } from '@styled-icons/entypo/Box';
import { Edit } from '@styled-icons/entypo/Edit';
import { Tag } from '../../atoms/Tag';
import { StyledForm, StyledFormField, StyledFormInput, StyledFormLabel, StyledCheckbox } from '../../atoms/StyledForm';
import { CardButton } from '../CardButton/CardButton';
import { CardButtonGroup } from '../CardButtonGroup/CardButtonGroup';
import { ConfirmButton } from '../../atoms/ConfirmButton';
import { useTranslation } from 'react-i18next';

export type DocumentEditorProps = {
  setLabel: (label: string) => void;
  setDescription: (label: string) => void;
  setAllowMultiple: (allow: boolean) => void;
  setRequired: (allow: boolean) => void;
  setDependant: (payload?: any) => void;
  setLabelledBy: (label: string) => void;
  setPluralLabel: (label: string) => void;
  selectField: (term: string) => void;
  popSubtree: (payload?: { count: number }) => void;
  pushSubtree: (term: string) => void;
  deselectField: (payload?: any) => void;
  addField: (payload?: any) => void;
  selectedField?: string | null;
  subtreePath: string[];
  subtree: CaptureModel['document'];
  subtreeFields: Array<{ term: string; value: CaptureModel['document'] | BaseField }>;
  setSelector: (payload: { term?: string; selector: BaseSelector | undefined }) => void;
  onDelete?: () => void;
};

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  setLabel,
  setDescription,
  selectField,
  deselectField,
  setAllowMultiple,
  setRequired,
  setDependant,
  setPluralLabel,
  setLabelledBy,
  addField,
  popSubtree,
  selectedField,
  subtreePath,
  subtree,
  subtreeFields,
  pushSubtree,
  setSelector,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [route, router] = useMiniRouter(['list', 'newField', 'newDocument'], 'list');
  const { selectors } = useContext(PluginContext);
  const isRoot = subtreePath.length === 0;
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [customLabelledBy, setCustomLabelBy] = useState(false);

  const filteredFields = subtreeFields?.filter(f => f.term !== subtree.label);

  const subtreeFieldOptions = useMemo(
    () => [
      {
        key: '',
        value: '',
        text: 'none',
      },
      ...subtreeFields.map(item => ({
        key: item.term,
        value: item.term,
        text: item.value.label === item.term ? item.term : `${item.value.label} (${item.term})`,
      })),
    ],
    [subtreeFields]
  );

  useEffect(() => {
    if (subtree.labelledBy && !subtreeFieldOptions.find(opt => opt.value === subtree.labelledBy) && !customLabelledBy) {
      setCustomLabelBy(true);
    }
  }, [subtreeFieldOptions, subtree.labelledBy, customLabelledBy]);

  useEffect(() => {
    if (route !== 'list') {
      deselectField();
    }
  }, [deselectField, route]);

  return (
    <div key={subtreePath.join('.')}>
      <Card fluid={true}>
        {route === 'list' ? (
          <>
            <CardContent>
              <Grid>
                {subtreePath.length ? (
                  <GridColumn>
                    <Button onClick={() => popSubtree()}>back</Button>
                  </GridColumn>
                ) : null}
                <GridColumn fluid>
                  <CardHeader>
                    <SubtreeBreadcrumb popSubtree={popSubtree} subtreePath={subtreePath} />
                  </CardHeader>
                  {subtree.description ? <CardMeta>{subtree.description}</CardMeta> : null}
                </GridColumn>
              </Grid>
            </CardContent>
            {metadataOpen ? (
              <CardContent extra>
                <StyledForm>
                  <StyledFormField>
                    <StyledFormLabel>
                      {t('Label')}
                      <StyledFormInput
                        type="text"
                        name="label"
                        required={true}
                        value={subtree.label}
                        onChange={e => setLabel(e.currentTarget.value)}
                      />
                    </StyledFormLabel>
                  </StyledFormField>
                  <StyledFormField>
                    <StyledFormLabel>
                      {t('Description')}
                      <StyledFormInput
                        type="textarea"
                        name="description"
                        value={subtree.description}
                        onChange={e => setDescription(e.currentTarget.value)}
                      />
                    </StyledFormLabel>
                  </StyledFormField>
                  {!isRoot && (
                    <>
                      <StyledFormField>
                        <StyledFormLabel>
                          <StyledCheckbox
                            type="checkbox"
                            name="allowMultiple"
                            checked={!!subtree.allowMultiple}
                            value={!!subtree.allowMultiple as any}
                            onChange={e => setAllowMultiple(e.currentTarget.checked)}
                          />
                          {t('Allow multiple instances')}
                        </StyledFormLabel>
                      </StyledFormField>
                      <StyledFormField>
                        <StyledFormLabel>
                          <StyledCheckbox
                            type="checkbox"
                            name="isRequired"
                            checked={!!subtree.required}
                            value={!!subtree.required as any}
                            onChange={e => setRequired(e.currentTarget.checked)}
                          />
                          {t('Required field')}
                        </StyledFormLabel>
                      </StyledFormField>
                      {subtreeFields && (
                        <StyledFormField>
                          <StyledFormLabel>
                            {t('Depends on? (This field will only appear if the dependant field has a value)')}
                          </StyledFormLabel>
                          <Dropdown
                            placeholder={t('Choose a field')}
                            fluid
                            selection
                            options={filteredFields.map(
                              f =>
                                f && {
                                  key: f.value.id,
                                  text: f.term || '',
                                  value: f.term,
                                }
                            )}
                            value={subtree.dependant}
                            onChange={val => {
                              setDependant(val || undefined);
                            }}
                          />
                        </StyledFormField>
                      )}
                      {subtree.allowMultiple ? (
                        <StyledFormField>
                          <StyledFormLabel>
                            {t('Plural label (used when referring to lists of this document)')}
                            <StyledFormInput
                              type="textarea"
                              name="pluralLabel"
                              value={subtree.pluralLabel}
                              onChange={e => setPluralLabel(e.currentTarget.value)}
                            />
                          </StyledFormLabel>
                        </StyledFormField>
                      ) : null}
                    </>
                  )}
                  {customLabelledBy ? (
                    <StyledFormField>
                      <StyledFormLabel>
                        {t('Entity labelled by property')}
                        <StyledFormInput
                          type="textarea"
                          name="labelledBy"
                          value={subtree.labelledBy}
                          onChange={e => setLabelledBy(e.currentTarget.value)}
                        />
                      </StyledFormLabel>
                    </StyledFormField>
                  ) : (
                    <>
                      <StyledFormField>
                        <StyledFormLabel>
                          {t('Entity labelled by property')}
                          <Dropdown
                            placeholder="Choose property"
                            fluid
                            selection
                            value={subtree.labelledBy}
                            onChange={val => {
                              setLabelledBy(val || '');
                            }}
                            options={subtreeFieldOptions}
                          />
                        </StyledFormLabel>
                      </StyledFormField>
                    </>
                  )}
                  <StyledFormField>
                    <StyledFormLabel>
                      <StyledCheckbox
                        type="checkbox"
                        name="allowMultiple"
                        checked={customLabelledBy}
                        value={customLabelledBy as any}
                        onChange={e => setCustomLabelBy(e.currentTarget.checked)}
                      />
                      {t('Advanced labelled by property')}
                    </StyledFormLabel>
                  </StyledFormField>
                  <StyledFormField>
                    <StyledFormLabel>
                      {t('Choose selector (optional)')}
                      <ChooseSelectorButton
                        value={subtree.selector ? subtree.selector.type : ''}
                        onChange={selectorType => {
                          if (selectorType) {
                            const selector = selectors[selectorType as keyof SelectorTypeMap];
                            if (selector) {
                              setSelector({
                                selector: {
                                  type: selector.type,
                                  state: copy(selector.defaultState),
                                } as any,
                              });
                            }
                          } else {
                            setSelector({ selector: undefined });
                          }
                        }}
                      />
                    </StyledFormLabel>
                  </StyledFormField>
                </StyledForm>
                {subtree.selector ? (
                  <StyledFormField>
                    <StyledFormLabel>
                      <StyledCheckbox
                        type="checkbox"
                        checked={!!subtree.selector.required}
                        onChange={(e: any) => {
                          const checked = e.target.checked;
                          const prevSelector = subtree.selector;
                          if (prevSelector) {
                            setSelector({
                              selector: {
                                ...prevSelector,
                                required: checked,
                              },
                            });
                          }
                        }}
                        style={{ marginRight: 10 }}
                      />
                      {t('Selector is required')}
                    </StyledFormLabel>
                  </StyledFormField>
                ) : null}
                <Button size="tiny" onClick={() => setMetadataOpen(m => !m)}>
                  {t('Close metadata')}
                </Button>
              </CardContent>
            ) : (
              <CardContent extra>
                <Button size="tiny" onClick={() => setMetadataOpen(m => !m)}>
                  {t('Edit metadata')}
                </Button>
              </CardContent>
            )}
            <CardContent extra>
              <List>
                {subtreeFields.map(({ value: item, term }, key) => (
                  <ListItem
                    key={key}
                    style={{ background: term === selectedField ? '#cbd3ed' : undefined }}
                    onClick={() => {
                      if (item.type === 'entity') {
                        pushSubtree(term);
                      } else {
                        selectField(term);
                      }
                    }}
                  >
                    {item.type === 'entity' ? <Box size={16} /> : <Edit size={16} />}
                    <ListContent fluid>
                      <ListHeader>{item.label === term ? term : `${item.label} (${term})`}</ListHeader>
                      {item.description ? <ListDescription>{item.description}</ListDescription> : null}
                    </ListContent>
                    <ListContent>
                      <Tag>{item.type}</Tag>
                    </ListContent>
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <CardContent extra>
              <CardButtonGroup>
                <CardButton size="small" onClick={router.newField}>
                  {t('Add field')}
                </CardButton>
                <CardButton size="small" onClick={router.newDocument}>
                  {t('Add nested entity')}
                </CardButton>
              </CardButtonGroup>
            </CardContent>
            {onDelete ? (
              <CardContent extra>
                <CardButtonGroup>
                  <ConfirmButton
                    message={t('Are you sure you want to remove this and all of the fields in this list?')}
                    onClick={() => onDelete()}
                  >
                    <Button type="button" alert>
                      {t('Delete this entity')}
                    </Button>
                  </ConfirmButton>
                </CardButtonGroup>
              </CardContent>
            ) : null}
          </>
        ) : route === 'newField' ? (
          <>
            <CardContent>
              <Grid>
                <GridColumn>
                  <Button onClick={router.list}>{t('back')}</Button>
                </GridColumn>
                <GridColumn fluid>
                  <CardHeader>{t('Create new field')}</CardHeader>
                </GridColumn>
              </Grid>
            </CardContent>
            <CardContent extra>
              <NewFieldForm
                key={Object.keys(subtree.properties).length}
                existingTerms={Object.keys(subtree.properties)}
                onSave={newField => {
                  // Use term to get plugin.
                  addField({
                    term: newField.term,
                    field: {
                      type: newField.fieldType,
                      label: newField.term,
                      value: copy(newField.field.defaultValue),
                      selector: newField.selector
                        ? {
                            type: newField.selector.type,
                            state: copy(newField.selector.defaultState),
                          }
                        : undefined,
                      ...newField.field.defaultProps,
                    },
                    select: true,
                  });
                  router.list();
                }}
              />
            </CardContent>
          </>
        ) : (
          <>
            <CardContent>
              <Grid>
                <GridColumn>
                  <Button onClick={router.list}>{t('back')}</Button>
                </GridColumn>
                <GridColumn fluid>
                  <CardHeader>{t('Create new document')}</CardHeader>
                </GridColumn>
              </Grid>
            </CardContent>

            <CardContent extra>
              <NewDocumentForm
                existingTerms={Object.keys(subtree.properties)}
                onSave={newDoc => {
                  // Use term to get plugin.
                  addField({
                    term: newDoc.term,
                    field: {
                      type: 'entity',
                      label: newDoc.term,
                      selector: newDoc.selector
                        ? {
                            type: newDoc.selector.type,
                            state: copy(newDoc.selector.defaultState),
                          }
                        : undefined,
                      properties: {},
                    },
                    select: true,
                  });
                  router.list();
                }}
              />
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};
