import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import slugify from 'slugify';
import { useMutation } from 'react-query';
import { useTranslation } from 'react-i18next';
import { InternationalString } from '@iiif/presentation-3';
import { CreateProject } from '../../../../../types/schemas/create-project';
import { useApi } from '../../../../shared/hooks/use-api';
import { useDefaultLocale, useSupportedLocales } from '../../../../shared/hooks/use-site';
import { WidePage } from '../../../../shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { Button, ButtonRow, TinyButton } from '../../../../shared/navigation/Button';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { buildTabularProjectSetupPayload } from '../../../components/tabular/cast-a-net/CastANetStructure';
import type {
  DefineTabularModelValue,
  NetConfig,
  TabularModelPayload,
} from '../../../components/tabular/cast-a-net/types';
import { ProjectBanner } from '../../../../shared/components/ProjectBanner';
import { madocLazy } from '../../../../shared/utility/madoc-lazy';
import type { IIIFBrowserProps } from 'iiif-browser';
import 'iiif-browser/dist/index.css';
import { VaultProvider } from 'react-iiif-vault';
import { BrowserComponent } from '../../../../shared/utility/browser-component';
import type { Root } from 'react-dom/client';
import { ModalButton } from '../../../../shared/components/Modal';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';

const DefineTabularModelLazy = madocLazy(async () => {
  const imported = await import('../../../components/tabular/cast-a-net/DefineTabularModel');
  return { default: imported.DefineTabularModel };
});

const CastANetLazy = madocLazy(async () => {
  const imported = await import('../../../components/tabular/cast-a-net/CastANet');
  return { default: imported.CastANet };
});

const IsolatedIIIFBrowser: React.FC<IIIFBrowserProps> = props => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!hostRef.current) return;
      const [{ createRoot }, browserModule] = await Promise.all([import('react-dom/client'), import('iiif-browser')]);
      if (cancelled || !hostRef.current) return;

      if (!rootRef.current) {
        rootRef.current = createRoot(hostRef.current);
      }

      rootRef.current.render(
        <VaultProvider>
          <browserModule.IIIFBrowser {...props} />
        </VaultProvider>
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [props]);

  useEffect(() => {
    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, []);

  return <div ref={hostRef} />;
};

const STEP_DETAILS = 0;
const STEP_SETTINGS = 1;
const STEP_MODEL = 2;
const STEP_NET = 3;
const STEP_PREVIEW = 4;
const STEP_COMPLETE = 5;

const hasIntlValue = (value?: InternationalString) => {
  if (!value) return false;
  const first = Object.values(value)[0];
  return Boolean(first && first.join('').trim());
};

export const TabularProjectWizard: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const defaultLocale = useDefaultLocale();
  const availableLanguages = useSupportedLocales();
  const [step, setStep] = useState(STEP_DETAILS);
  const [label, setLabel] = useState<InternationalString>({ [defaultLocale]: [''] });
  const [summary, setSummary] = useState<InternationalString>({ [defaultLocale]: [''] });
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  const [enableZoomTracking, setEnableZoomTracking] = useState(false);
  const [manifestId, setManifestId] = useState<string | undefined>();
  const [canvasId, setCanvasId] = useState<string | undefined>();
  const [iiifError, setIiifError] = useState<string | null>(null);
  const [iiifBrowserSelection, setIiifBrowserSelection] = useState<string | null>(null);

  const [tabularModel, setTabularModel] = useState<DefineTabularModelValue>({
    columns: 0,
    previewRows: 0,
    headings: [],
  });
  const [tabularPayload, setTabularPayload] = useState<TabularModelPayload | null>(null);
  const [isModelValid, setIsModelValid] = useState(false);

  const [netConfig, setNetConfig] = useState<NetConfig>({
    rows: 5,
    cols: 5,
    top: 10,
    left: 10,
    width: 80,
    height: 80,
    rowPositions: [],
    colPositions: [],
  });

  const [saveProject, { status, data, isSuccess, reset }] = useMutation(async (config: CreateProject) => {
    try {
      return await api.createProject(config);
    } catch (e) {
      return { error: (e as any).message };
    }
  });

  const isError = !!data?.error;
  const detailsDone = hasIntlValue(label) && hasIntlValue(summary) && !!slug.trim();
  const hasImage = Boolean(manifestId && canvasId);
  const requiresNetStep = enableZoomTracking && hasImage;
  const modelSaved = tabularModel.saved ? tabularModel.saved.every(Boolean) : false;

  useEffect(() => {
    if (autoSlug) {
      const textLabel = Object.values(label)[0]?.join('') || '';
      setSlug(slugify(textLabel, { lower: true }));
    }
  }, [autoSlug, label]);

  useEffect(() => {
    const cols = Math.max(1, Math.floor(tabularModel.columns || 0));
    const rows = Math.max(1, Math.floor(tabularModel.previewRows || 0)) || 5;
    setNetConfig(prev => ({
      ...prev,
      cols,
      rows,
    }));
  }, [tabularModel.columns, tabularModel.previewRows]);

  const clearImageSelection = () => {
    setManifestId(undefined);
    setCanvasId(undefined);
    setIiifError(null);
    setIiifBrowserSelection(null);
  };

  const setupPayload = useMemo(() => {
    if (!tabularPayload) return null;
    return buildTabularProjectSetupPayload(netConfig, tabularPayload);
  }, [netConfig, tabularPayload]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !setupPayload) return '';
    const outline = {
      label,
      summary,
      slug,
      enableZoomTracking,
      iiif: { manifestId, canvasId },
      tabular: setupPayload,
    };
    const encoded = encodeURIComponent(btoa(JSON.stringify(outline)));
    return `${window.location.origin}${window.location.pathname}?outline=${encoded}`;
  }, [label, summary, slug, enableZoomTracking, manifestId, canvasId, setupPayload]);

  const moveNextFromModel = () => {
    if (!isModelValid || !modelSaved) {
      return;
    }
    if (requiresNetStep) {
      setStep(STEP_NET);
    } else {
      setStep(STEP_PREVIEW);
    }
  };

  useEffect(() => {
    if (isSuccess && !isError) {
      setStep(STEP_COMPLETE);
    }
  }, [isSuccess, isError]);

  const steps = useMemo(
    () => [
      { id: STEP_DETAILS, label: t('Project details') },
      { id: STEP_SETTINGS, label: t('Additional settings') },
      { id: STEP_MODEL, label: t('Define tabular model') },
      { id: STEP_NET, label: t('Cast a net'), disabled: !requiresNetStep },
      { id: STEP_PREVIEW, label: t('Preview') },
      { id: STEP_COMPLETE, label: t('Complete'), disabled: !isSuccess && step !== STEP_COMPLETE },
    ],
    [t, requiresNetStep, isSuccess, step]
  );

  const goToStep = (id: number, disabled?: boolean) => {
    if (disabled) return;
    if (id === STEP_COMPLETE && !(isSuccess && !isError)) return;
    if (id <= step) {
      setStep(id);
    }
  };

  const onAddCanvas = useCallback(
    (result: any) => {
      const first = Array.isArray(result) ? result[0] : result;
      const resource = first?.resource || first;
      const parent = first?.parent || null;

      if (!resource?.id || resource?.type !== 'Canvas') {
        setIiifError(t('Select a canvas from the IIIF browser.'));
        return;
      }

      if (!parent?.id || parent?.type !== 'Manifest') {
        setIiifError(t('Select a canvas from within a manifest.'));
        return;
      }

      setCanvasId(resource.id);
      setManifestId(parent.id);
      setIiifError(null);
      setIiifBrowserSelection(`${resource.id}`);
    },
    [t]
  );

  const navigationOptions: IIIFBrowserProps['navigation'] = useMemo(() => {
    return {
      clickToSelect: true,
      doubleClickToNavigate: true,
      clickToNavigate: false,
      markedResources: [],
      canSelectOnlyAllowedDomains: false,
      multiSelect: false,
      allowNavigationToBuiltInPages: false,
      canNavigateToCanvas: true,
      canNavigateToManifest: true,
      canNavigateToCollection: true,
      canSelectCollection: false,
      canSelectManifest: false,
      canSelectCanvas: true,
    } satisfies IIIFBrowserProps['navigation'];
  }, []);

  const historyOptions: IIIFBrowserProps['history'] = useMemo(() => {
    return {
      saveToLocalStorage: true,
      restoreFromLocalStorage: true,
      localStorageKey: 'iiif-browser-generic',
    };
  }, []);

  const uiOptions: IIIFBrowserProps['ui'] = useMemo(
    () => ({
      defaultPages: {
        about: false,
        bookmarks: false,
        history: false,
        viewSource: false,
        homepage: false,
      },
    }),
    []
  );
  const outputOptions: IIIFBrowserProps['output'] = useMemo<IIIFBrowserProps['output']>(
    () => [
      {
        type: 'callback',
        cb: onAddCanvas,
        format: {
          type: 'custom',
          format(resource, parent, vault) {
            return {
              resource: vault.get(resource),
              parent,
            };
          },
        },
        label: t('Use selected canvas'),
        supportedTypes: ['Canvas'],
      },
    ],
    [onAddCanvas, t]
  );
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Projects'), link: '/projects' },
          { label: t('Create project'), link: '/projects/create' },
          { label: t('Tabular project'), link: '/projects/create/tabular-project', active: true },
        ]}
        title={t('Create tabular project')}
        subtitle={t('Build a tabular modal project')}
      />

      <div
        style={{
          background: '#273668',
          color: '#fff',
          padding: '18px 32px 14px',
          marginBottom: 24,
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, overflowX: 'auto' }}>
          {steps.map((item, index) => {
            const isDone = step > item.id || (item.id === STEP_COMPLETE && isSuccess && !isError);
            const isActive = step === item.id || (item.id === STEP_COMPLETE && isSuccess && !isError);
            const isDisabled = !!item.disabled;
            const circleStyle: React.CSSProperties = {
              height: 24,
              width: 24,
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDone ? '#8DA0FF' : isActive ? '#ffffff' : '#cdd4ea',
              color: isDone ? '#fff' : isActive ? '#273668' : '#273668',
              border: isActive && !isDone ? '2px solid #8DA0FF' : '2px solid transparent',
              fontSize: 12,
              fontWeight: 600,
              flex: '0 0 auto',
              opacity: isDisabled ? 0.5 : 1,
            };
            const lineStyle: React.CSSProperties = {
              height: 2,
              width: 44,
              background: isDone ? '#8DA0FF' : '#4a5b9e',
              opacity: isDisabled ? 0.4 : 1,
              flex: '0 0 auto',
            };
            return (
              <React.Fragment key={item.id}>
                <button
                  type="button"
                  onClick={() => goToStep(item.id, isDisabled)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    padding: 0,
                    textAlign: 'left',
                  }}
                >
                  <span style={circleStyle}>{isDone ? '✓' : ''}</span>
                  <span style={{ display: 'grid', gap: 2 }}>
                    <span style={{ fontSize: 16, fontWeight: isActive ? 600 : 500 }}>{item.label}</span>
                    {isDone && !isDisabled ? (
                      <span style={{ fontSize: 12, textDecoration: 'underline', opacity: 0.9 }}>
                        {t('Click to edit')}
                      </span>
                    ) : null}
                  </span>
                </button>
                {index < steps.length - 1 ? <span style={lineStyle} /> : null}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <WidePage>
        {step === STEP_DETAILS ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('Project details')}</div>
            <InputContainer wide>
              <InputLabel htmlFor="label">{t('Label')}</InputLabel>
              <MetadataEditor
                fluid
                id={'label'}
                fields={label}
                onSave={output => setLabel(output.toInternationalString())}
                availableLanguages={availableLanguages}
                metadataKey={'label'}
              />
            </InputContainer>

            <InputContainer wide>
              <InputLabel htmlFor="summary">{t('Description')}</InputLabel>
              <MetadataEditor
                fluid
                id={'summary'}
                fields={summary}
                onSave={output => setSummary(output.toInternationalString())}
                availableLanguages={availableLanguages}
                metadataKey={'summary'}
                defaultLocale={defaultLocale}
              />
            </InputContainer>

            <InputContainer wide>
              <InputLabel htmlFor="slug">{t('Slug')}</InputLabel>
              <Input
                type="text"
                value={slug}
                onFocus={() => setAutoSlug(false)}
                onChange={e => setSlug(e.currentTarget.value)}
                id={'slug'}
              />
            </InputContainer>

            <ButtonRow>
              <Button
                $primary
                disabled={!detailsDone}
                onClick={() => {
                  reset();
                  setStep(STEP_SETTINGS);
                }}
              >
                {t('Save')}
              </Button>
            </ButtonRow>
          </>
        ) : null}

        {step === STEP_SETTINGS ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t('Additional settings')}</div>
            <div style={{ marginBottom: 20 }}>
              <div>{t('Select to enable the zoom tracking option for your tabular model')}</div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 10, maxWidth: 600 }}>
                {t(
                  'Zoom tracking enables the application to support contributor users as they  navigate through the tabular data structure. The zoom tracking will  attempt to move the image focus to reflect the user’s current location  in the table structure. To provide this option to the user, casting a  grid on a reference image is necessary..'
                )}
              </div>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  style={{ margin: 0 }}
                  type="checkbox"
                  checked={enableZoomTracking}
                  onChange={e => setEnableZoomTracking(e.currentTarget.checked)}
                />
                <span style={{ fontSize: 13 }}>{t('Use zoom tracking')}</span>
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>{t('Reference image (optional)')}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {t(
                  'Select an image to guide configuration. This is required when zoom tracking is on; optional when zoom tracking is off.'
                )}
              </div>

              {hasImage ? (
                <SuccessMessage>
                  <div style={{ display: 'flex', flexDirection: 'column', rowGap: 4 }}>
                    <div>
                      {t('Selected manifest')}: <strong>{manifestId}</strong>
                    </div>
                    <div>
                      {t('Selected canvas')}: <strong>{canvasId}</strong>
                    </div>
                    <TinyButton onClick={clearImageSelection}>{t('Clear selection')}</TinyButton>
                  </div>
                </SuccessMessage>
              ) : null}

              {!hasImage && iiifBrowserSelection ? (
                <div style={{ fontSize: 12, opacity: 0.75 }}>{iiifBrowserSelection}</div>
              ) : null}

              {iiifError ? <ErrorMessage>{iiifError}</ErrorMessage> : null}

              {enableZoomTracking && !hasImage ? (
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  {t('Select a reference canvas to enable zoom tracking and Cast a net.')}
                </div>
              ) : null}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ModalButton
                  title={t('Browse IIIF resources')}
                  modalSize="lg"
                  render={() => (
                    <div className="tabular-iiif-browser-modal" style={{ minHeight: 420 }}>
                      <style>
                        {`
                          .tabular-iiif-browser-modal .grid-lg,
                          .tabular-iiif-browser-modal .grid-md,
                          .tabular-iiif-browser-modal .grid-sm {
                            display: grid;
                            gap: 12px;
                          }

                          .tabular-iiif-browser-modal button,
                          .tabular-iiif-browser-modal [role="button"],
                          .tabular-iiif-browser-modal a {
                            color: #1f2d5a;
                          }

                          .tabular-iiif-browser-modal button:disabled,
                          .tabular-iiif-browser-modal [role="button"][aria-disabled="true"] {
                            color: #64748b;
                          }
                        `}
                      </style>
                      <BrowserComponent fallback={<div>{t('Loading IIIF browser...')}</div>}>
                        <IsolatedIIIFBrowser
                          className="h-[56vh] min-h-[420px] w-full min-w-0 flex-2 border-none"
                          navigation={navigationOptions}
                          history={historyOptions}
                          output={outputOptions}
                          ui={uiOptions}
                        />
                      </BrowserComponent>
                    </div>
                  )}
                >
                  <Button>{t('Browse manifests')}</Button>
                </ModalButton>
                {hasImage ? <span style={{ fontSize: 12, opacity: 0.75 }}>{t('Canvas selected')}</span> : null}
              </div>
            </div>

            <ButtonRow>
              <Button
                $primary
                disabled={enableZoomTracking && !hasImage}
                onClick={() => {
                  reset();
                  setStep(STEP_MODEL);
                }}
              >
                {t('Save')}
              </Button>
            </ButtonRow>
          </>
        ) : null}

        {step === STEP_MODEL ? (
          <div style={{ paddingBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('Define tabular model')}</div>
            <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
              <DefineTabularModelLazy
                value={tabularModel}
                onChange={setTabularModel}
                onModelChange={res => {
                  setTabularPayload(res.payload);
                  setIsModelValid(res.isValid);
                }}
                manifestId={manifestId}
                canvasId={canvasId}
              />
            </BrowserComponent>

            {!modelSaved ? (
              <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>{t('Save the model to continue.')}</div>
            ) : null}

            <ButtonRow style={{ marginTop: 16 }}>
              <Button $primary disabled={!isModelValid || !modelSaved} onClick={moveNextFromModel}>
                {t('Save')}
              </Button>
            </ButtonRow>
          </div>
        ) : null}

        {step === STEP_NET ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('Cast a net')}</div>
            {requiresNetStep ? (
              <BrowserComponent fallback={<div>{t('Loading...')}</div>}>
                <CastANetLazy manifestId={manifestId} canvasId={canvasId} value={netConfig} onChange={setNetConfig} />
              </BrowserComponent>
            ) : (
              <div style={{ padding: 12, fontSize: 13 }}>
                {t('Enable zoom tracking and select a reference canvas to use Cast a net.')}
              </div>
            )}

            <div style={{ marginTop: 12 }}>
              <TinyButton onClick={clearImageSelection}>{t('Select a different image')}</TinyButton>
            </div>

            <ButtonRow>
              <Button
                $primary
                onClick={() => {
                  reset();
                  setStep(STEP_PREVIEW);
                }}
              >
                {t('Save')}
              </Button>
            </ButtonRow>
          </>
        ) : null}

        {step === STEP_PREVIEW ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('Preview')}</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <div>
                <strong>{t('Label')}:</strong> {Object.values(label)[0]?.join('')}
              </div>
              <div>
                <strong>{t('Description')}:</strong> {Object.values(summary)[0]?.join('')}
              </div>
              <div>
                <strong>{t('Slug')}:</strong> {slug}
              </div>
              <div>
                <strong>{t('Zoom tracking')}:</strong> {enableZoomTracking ? t('Enabled') : t('Disabled')}
              </div>
              {manifestId ? (
                <div>
                  <strong>{t('Manifest')}:</strong> {manifestId}
                </div>
              ) : null}
              {canvasId ? (
                <div>
                  <strong>{t('Canvas')}:</strong> {canvasId}
                </div>
              ) : null}
              {shareUrl ? (
                <div>
                  <strong>{t('Share outline')}:</strong>{' '}
                  <a href={shareUrl} target="_blank" rel="noreferrer">
                    {t('Open share link')}
                  </a>
                </div>
              ) : null}
            </div>

            {isError ? <ErrorMessage $banner>{data.error || 'Unknown error'}</ErrorMessage> : null}

            <ButtonRow>
              <Button onClick={() => setStep(STEP_DETAILS)}>{t('Edit project details')}</Button>
              <Button
                $primary
                disabled={status === 'loading' || isSuccess}
                onClick={() =>
                  saveProject({
                    label,
                    summary,
                    slug,
                    template: 'tabular-project',
                    template_options: {
                      enableZoomTracking,
                      iiif: { manifestId, canvasId },
                      tabular: setupPayload,
                    },
                    template_config: {
                      enableZoomTracking,
                      iiif: { manifestId, canvasId },
                      tabular: setupPayload,
                    },
                    remote_template: null,
                  })
                }
              >
                {t('Create')}
              </Button>
            </ButtonRow>
          </>
        ) : null}

        {step === STEP_COMPLETE || (isSuccess && !isError) ? (
          <>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>{t('Complete')}</div>
            {isSuccess && !isError ? (
              <div>
                <ProjectBanner project={data} admin />
              </div>
            ) : null}
          </>
        ) : null}
      </WidePage>
    </>
  );
};
