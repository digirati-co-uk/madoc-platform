import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { AnnotationBuckets, AnnotationStyles } from '../../../../types/annotation-styles';
import { HotSpot } from '../../../shared/atoms/HotSpot';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { SystemBackground, SystemGrid, SystemMenu, SystemMenuItem } from '../../../shared/atoms/SystemUI';
import { getDefaultAnnotationStyles } from '../../../shared/capture-models/AnnotationStyleContext';
import { TextField } from '../../../shared/capture-models/editor/input-types/TextField/TextField';
import { AnnotationStyleForm } from '../../../shared/components/AnnotationStyleForm';
import { InputContainer, InputLabel } from '../../../shared/form/Input';
import { useApi } from '../../../shared/hooks/use-api';
import { ButtonRow, Button } from '../../../shared/navigation/Button';
import { AdminHeader } from '../../molecules/AdminHeader';
import {
  annotationBucketOrder,
  AnnotationStyleBigBackground,
  AnnotationStyleBigBox,
  AnnotationStylePreview,
  AnnotationStylePreviewList,
} from '../../molecules/AnnotationStylePreview';

function getDefaultStyles() {
  const defaultStyles = getDefaultAnnotationStyles();
  const keys = Object.keys(defaultStyles);
  try {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const unhashed = JSON.parse(atob(hash)) as any;
      for (const key of keys) {
        if (unhashed[key]) {
          (defaultStyles as any)[key] = unhashed[key];
        }
      }
    }
  } catch (e) {
    // no-op
  }
  return defaultStyles;
}

export function CreateAnnotationStyle({ existing }: { existing?: AnnotationStyles }) {
  const { t } = useTranslation();
  const [toApply, setToApply] = useState<any>();
  const [newConfig, setNewConfig] = useState<AnnotationStyles['theme']>(existing?.theme || getDefaultStyles);
  const [current, setCurrent] = useState<AnnotationBuckets>('highlighted');
  const [title, setTitle] = useState(existing?.name || 'Untitled style');
  const api = useApi();
  const navigate = useNavigate();
  const [createNew, createNewStatus] = useMutation(async () => {
    if (existing) {
      await api.updateAnnotationStyle({
        ...existing,
        name: title,
        theme: newConfig,
      });
      setChanged(false);
    } else {
      const newTheme = await api.createAnnotationStyle(title, { theme: newConfig });
      navigate(`/site/annotation-styles/${newTheme.id}`);
    }
  });
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setChanged(true);
    if (!existing) {
      navigate(`#${btoa(JSON.stringify(newConfig))}`, { replace: true });
    }
  }, [existing, title, newConfig]);

  useEffect(() => {
    const toApply = { backgroundColor: 'none', borderWidth: '0', ...(newConfig[current] || {}) };

    if (!toApply[':hover']) {
      toApply[':hover'] = {
        backgroundColor: toApply.backgroundColor,
        borderColor: toApply.borderColor,
        borderStyle: toApply.borderStyle,
        borderWidth: toApply.borderWidth,
      };
    }
    if (!toApply[':active']) {
      toApply[':active'] = {
        backgroundColor: toApply.backgroundColor,
        borderColor: toApply.borderColor,
        borderStyle: toApply.borderStyle,
        borderWidth: toApply.borderWidth,
      };
    }

    setToApply(toApply as any);
  }, [newConfig, current]);

  function menu(name: AnnotationBuckets) {
    return { onClick: () => setCurrent(name), $active: current === name };
  }

  const hotspot = newConfig[current].hotspot ? <HotSpot $size={newConfig[current].hotspotSize || 'lg'} /> : null;

  return (
    <>
      <AdminHeader
        title={existing ? t('Edit annotation style') : t('Create new annotation style')}
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Annotation styles'), link: '/site/annotation-styles' },
        ]}
        noMargin
      />

      <SystemBackground>
        <SystemGrid.Container>
          <SystemGrid.Menu style={{ marginTop: '12em' }}>
            <SystemMenu>
              <SystemMenuItem {...menu('highlighted')}>Highlighted styles</SystemMenuItem>
              <SystemMenuItem {...menu('contributedAnnotations')}>Annotations panel</SystemMenuItem>
              <SystemMenuItem {...menu('contributedDocument')}>Document panel</SystemMenuItem>
              <SystemMenuItem {...menu('submissions')}>Submission panel</SystemMenuItem>
              <SystemMenuItem>
                <SystemMenuItem as="span" {...menu('topLevel')}>
                  Current submission
                </SystemMenuItem>
                <SystemMenu>
                  <SystemMenuItem {...menu('topLevel')}>Top level</SystemMenuItem>
                  <SystemMenuItem {...menu('currentLevel')}>Current level</SystemMenuItem>
                  <SystemMenuItem {...menu('adjacent')}>Adjacent</SystemMenuItem>
                  <SystemMenuItem {...menu('hidden')}>Hidden</SystemMenuItem>
                </SystemMenu>
              </SystemMenuItem>
            </SystemMenu>
          </SystemGrid.Menu>
          <SystemGrid.Content>
            <SystemListItem $block>
              <InputContainer>
                <InputLabel htmlFor="title">Title</InputLabel>
                <TextField id="title" type="text-field" value={title} label="Title" updateValue={setTitle} />
              </InputContainer>

              <AnnotationStylePreviewList style={{ marginTop: '1em' }}>
                {annotationBucketOrder.map(theme => {
                  return (
                    <AnnotationStylePreview
                      key={theme}
                      title={theme}
                      data={(newConfig as any)[theme] || {}}
                      style={{ width: 50, height: 50 }}
                      {...menu(theme)}
                    />
                  );
                })}
              </AnnotationStylePreviewList>
            </SystemListItem>

            <SystemListItem $block>
              <div style={{ marginBottom: '2em' }}>
                <AnnotationStyleBigBackground>
                  {toApply ? (
                    <>
                      <AnnotationStyleBigBox style={toApply}>{hotspot}Normal</AnnotationStyleBigBox>
                      <AnnotationStyleBigBox style={toApply[':hover']}>{hotspot}Hover</AnnotationStyleBigBox>
                      <AnnotationStyleBigBox style={toApply[':active']}>{hotspot}Active</AnnotationStyleBigBox>
                    </>
                  ) : null}
                </AnnotationStyleBigBackground>
              </div>

              <AnnotationStyleForm
                key={current}
                showHotspot={
                  current === 'contributedAnnotations' || current === 'contributedDocument' || current === 'submissions'
                }
                value={newConfig[current] || {}}
                onUpdate={newValues => {
                  setNewConfig(prev => {
                    if (prev[current] === newValues) {
                      return prev;
                    }
                    return { ...prev, [current]: newValues };
                  });
                }}
              />
            </SystemListItem>
            <SystemListItem $block>
              <ButtonRow $right $noMargin>
                <Button $primary disabled={createNewStatus.isLoading || !changed} onClick={() => createNew()}>
                  {existing ? 'Update style' : 'Create style'}
                </Button>
              </ButtonRow>
            </SystemListItem>
          </SystemGrid.Content>
        </SystemGrid.Container>
      </SystemBackground>
    </>
  );
}
