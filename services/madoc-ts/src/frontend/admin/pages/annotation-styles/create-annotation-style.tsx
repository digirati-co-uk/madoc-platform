import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { useHistory } from 'react-router-dom';
import { AnnotationBuckets, AnnotationStyles } from '../../../../types/annotation-styles';
import { SystemListItem } from '../../../shared/atoms/SystemListItem';
import { SystemBackground, SystemGrid, SystemMenu, SystemMenuItem } from '../../../shared/atoms/SystemUI';
import { getDefaultAnnotationStyles } from '../../../shared/capture-models/AnnotationStyleContext';
import { TextField } from '../../../shared/capture-models/editor/input-types/TextField/TextField';
import { AnnotationStyleForm } from '../../../shared/components/AnnotationStyleForm';
import { InputContainer, InputLabel } from '../../../shared/form/Input';
import { useApi } from '../../../shared/hooks/use-api';
import { ButtonRow, Button } from '../../../shared/navigation/Button';
import { AdminHeader } from '../../molecules/AdminHeader';

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
  const canvas = useRef<any>();
  const displayAnno = useRef<any>();
  const [newConfig, setNewConfig] = useState<AnnotationStyles['theme']>(existing?.theme || getDefaultStyles);
  const [current, setCurrent] = useState<AnnotationBuckets>('highlighted');
  const [title, setTitle] = useState(existing?.name || 'Untitled style');
  const api = useApi();
  const { push } = useHistory();
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
      push(`/site/annotation-styles/${newTheme.id}`);
    }
  });
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setChanged(true);
    if (!existing) {
      history.pushState({}, '', `#${btoa(JSON.stringify(newConfig))}`);
    }
  }, [existing, title, newConfig]);

  useEffect(() => {
    if (canvas.current) {
      // eslint-disable-next-line no-inner-declarations
      function createInitial() {
        const linkingAnno = {
          type: 'Annotation',
          motivation: ['linking'],
          target: 'https://digirati-co-uk.github.io/wunder/canvases/0#300,900,500,500',
        };
        canvas.current.vault.load('fake-id', linkingAnno).then((linkingAnnoWithId: any) => {
          displayAnno.current = canvas.current.createAnnotationDisplay(linkingAnnoWithId);
          displayAnno.current.applyStyle(newConfig[current] || { backgroundColor: 'none', borderWidth: '0' });
          canvas.current.annotations.add(displayAnno.current);
        });
      }

      if (canvas.current.ready) {
        createInitial();
      } else {
        canvas.current.addEventListener('ready', createInitial);
      }
    }
  }, []);

  useEffect(() => {
    if (displayAnno.current) {
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

      displayAnno.current.applyStyle(toApply);
    }
  }, [newConfig, current]);

  function menu(name: AnnotationBuckets) {
    return { onClick: () => setCurrent(name), $active: current === name };
  }

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
                Current submission
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
            </SystemListItem>

            <SystemListItem $block>
              <div style={{ marginBottom: '2em' }}>
                <Helmet>
                  <script src="https://cdn.jsdelivr.net/npm/@digirati/canvas-panel-web-components@1.0.48/dist/bundle.js" />
                </Helmet>
                {/* @ts-ignore */}
                <canvas-panel
                  ref={canvas}
                  height={350}
                  target="200,800,800,800"
                  manifest-id="https://digirati-co-uk.github.io/wunder.json"
                  canvas-id={'https://digirati-co-uk.github.io/wunder/canvases/0'}
                />
              </div>

              <AnnotationStyleForm
                key={current}
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
