import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDefaultLocale, useSite, useSupportedLocales } from '@/frontend/shared/hooks/use-site';
import { useApi } from '@/frontend/shared/hooks/use-api';
import { WidePage } from '@/frontend/shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { madocLazy } from '@/frontend/shared/utility/madoc-lazy';
import 'iiif-browser/dist/index.css';
import { TabularWizardHeader } from './tabular-project/components/TabularWizardHeader';
import { TabularIiifBrowserModal } from './tabular-project/components/TabularIiifBrowserModal';
import { TabularProjectDetailsStep } from './tabular-project/steps/TabularProjectDetailsStep';
import { TabularProjectSettingsStep } from './tabular-project/steps/TabularProjectSettingsStep';
import { TabularProjectModelStep } from './tabular-project/steps/TabularProjectModelStep';
import { TabularProjectNetStep } from './tabular-project/steps/TabularProjectNetStep';
import { TabularProjectPreviewStep } from './tabular-project/steps/TabularProjectPreviewStep';
import { TabularProjectCompleteStep } from './tabular-project/steps/TabularProjectCompleteStep';
import { useTabularProjectController } from './tabular-project/hooks/use-tabular-project-controller';

const loadDefineTabularModel = () => import('../../../components/tabular/cast-a-net/DefineTabularModel');
const loadCastANet = () => import('../../../components/tabular/cast-a-net/CastANet');

const DefineTabularModelLazy = madocLazy(async () => {
  const imported = await loadDefineTabularModel();
  return { default: imported.DefineTabularModel };
});

const CastANetLazy = madocLazy(async () => {
  const imported = await loadCastANet();
  return { default: imported.CastANet };
});

const LEAVE_SETUP_MESSAGE = 'are you sure you want to leave? Your tabular project will not be saved.';

export const TabularProjectWizard: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const defaultLocale = useDefaultLocale();
  const availableLanguages = useSupportedLocales();
  const site = useSite();

  const controller = useTabularProjectController({
    api,
    defaultLocale,
    siteSlug: site?.slug,
    t,
  });
  const { stepIds } = controller;
  const shouldWarnOnLeave = !controller.isProjectCompleted;
  const isUndoingPopNavigationRef = React.useRef(false);

  const confirmLeaveSetup = React.useCallback(() => window.confirm(LEAVE_SETUP_MESSAGE), []);

  const cancelSetup = React.useCallback(() => {
    if (!shouldWarnOnLeave || confirmLeaveSetup()) {
      navigate('/projects/create');
    }
  }, [confirmLeaveSetup, navigate, shouldWarnOnLeave]);

  React.useEffect(() => {
    if (!shouldWarnOnLeave) {
      return;
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = LEAVE_SETUP_MESSAGE;
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [shouldWarnOnLeave]);

  React.useEffect(() => {
    if (!shouldWarnOnLeave) {
      return;
    }

    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) {
        return;
      }
      if (anchor.target && anchor.target.toLowerCase() !== '_self') {
        return;
      }
      if (anchor.hasAttribute('download')) {
        return;
      }

      const currentUrl = new URL(window.location.href);
      const nextUrl = new URL(anchor.href, window.location.href);
      const isSameDestination =
        currentUrl.origin === nextUrl.origin &&
        currentUrl.pathname === nextUrl.pathname &&
        currentUrl.search === nextUrl.search &&
        currentUrl.hash === nextUrl.hash;
      if (isSameDestination) {
        return;
      }

      if (!confirmLeaveSetup()) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => {
      document.removeEventListener('click', onDocumentClick, true);
    };
  }, [confirmLeaveSetup, shouldWarnOnLeave]);

  React.useEffect(() => {
    if (!shouldWarnOnLeave) {
      return;
    }

    const onPopState = () => {
      if (isUndoingPopNavigationRef.current) {
        isUndoingPopNavigationRef.current = false;
        return;
      }
      if (!confirmLeaveSetup()) {
        isUndoingPopNavigationRef.current = true;
        window.history.go(1);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [confirmLeaveSetup, shouldWarnOnLeave]);

  React.useEffect(() => {
    // Warm these chunks so the wizard step transition is deterministic.
    void loadDefineTabularModel();
    void loadCastANet();
  }, []);

  const iiifBrowser = (
    <TabularIiifBrowserModal
      t={t}
      iiifHomeLoadError={controller.iiifHomeLoadError}
      browserVersion={controller.iiifBrowserVersion}
      navigationOptions={controller.navigationOptions}
      historyOptions={controller.historyOptions}
      searchOptions={controller.searchOptions}
      outputOptions={controller.outputOptions}
      uiOptions={controller.uiOptions}
    />
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
        title={t('Create tabular data project')}
        subtitle={t(
          'Build a tabular capture model to support transcribing data for your project, using a table structure'
        )}
        noMargin
      />

      <TabularWizardHeader
        t={t}
        steps={controller.steps}
        currentStep={controller.step}
        maxReachedStep={controller.maxReachedStep}
        completeStepId={stepIds.complete}
        isProjectCompleted={controller.isProjectCompleted}
        onStepClick={controller.goToStep}
      />

      <WidePage>
        {controller.step === stepIds.details ? (
          <TabularProjectDetailsStep
            t={t}
            label={controller.label}
            summary={controller.summary}
            slug={controller.slug}
            availableLanguages={availableLanguages}
            defaultLocale={defaultLocale}
            detailsDone={controller.detailsDone}
            onLabelChange={controller.setLabel}
            onSummaryChange={controller.setSummary}
            onSlugFocus={controller.disableAutoSlug}
            onSlugChange={controller.setSlug}
            onSave={controller.saveDetailsStep}
            onCancel={cancelSetup}
          />
        ) : null}

        {controller.step === stepIds.settings ? (
          <TabularProjectSettingsStep
            t={t}
            enableZoomTracking={controller.enableZoomTracking}
            hasImage={controller.hasImage}
            manifestId={controller.manifestId}
            canvasId={controller.canvasId}
            selectedCanvasLabel={controller.selectedCanvasLabel}
            selectedCanvasThumbnail={controller.selectedCanvasThumbnail}
            iiifBrowserSelection={controller.iiifBrowserSelection}
            iiifError={controller.iiifError}
            iiifBrowser={iiifBrowser}
            onEnableZoomTrackingChange={controller.setEnableZoomTracking}
            onClearImageSelection={controller.clearImageSelection}
            onRegisterBrowserClose={controller.setBrowserCloseHandler}
            onSave={controller.saveSettingsStep}
            onCancel={cancelSetup}
          />
        ) : null}

        {controller.step === stepIds.model ? (
          <TabularProjectModelStep
            t={t}
            tabularModel={controller.tabularModel}
            manifestId={controller.manifestId}
            canvasId={controller.canvasId}
            isModelValid={controller.isModelValid}
            modelSaved={controller.modelSaved}
            onTabularModelChange={controller.setTabularModel}
            onModelChange={controller.onModelChange}
            onSave={controller.moveNextFromModel}
            onCancel={cancelSetup}
            DefineTabularModelComponent={DefineTabularModelLazy}
          />
        ) : null}

        {controller.step === stepIds.net ? (
          <TabularProjectNetStep
            t={t}
            requiresNetStep={controller.requiresNetStep}
            manifestId={controller.manifestId}
            canvasId={controller.canvasId}
            netConfig={controller.netConfig}
            castANetHeight={controller.castANetHeight}
            isDividerHover={controller.isCastANetDividerHover}
            netColumnCount={controller.netColumnCount}
            headings={controller.netHeadings}
            tooltips={controller.netTooltips}
            iiifBrowser={iiifBrowser}
            onNetConfigChange={controller.setNetConfig}
            onSave={controller.saveNetStep}
            onClearImageSelection={controller.clearImageSelection}
            onRegisterBrowserClose={controller.setBrowserCloseHandler}
            onStartResize={controller.startCastANetResize}
            onDividerHoverChange={controller.setIsCastANetDividerHover}
            onCancel={cancelSetup}
            CastANetComponent={CastANetLazy}
          />
        ) : null}

        {controller.step === stepIds.preview ? (
          <TabularProjectPreviewStep
            t={t}
            shareUrl={controller.shareUrl}
            shareCopied={controller.shareCopied}
            canTrackPreviewOnCanvas={controller.canTrackPreviewOnCanvas}
            hasImage={controller.hasImage}
            manifestId={controller.manifestId}
            canvasId={controller.canvasId}
            netConfig={controller.netConfig}
            previewCanvasHeight={controller.previewCanvasHeight}
            previewCanvasActiveCell={controller.previewCanvasActiveCell}
            previewColumns={controller.previewColumns}
            previewTooltips={controller.previewTooltips}
            previewTableRowCount={controller.previewTableRowCount}
            previewRows={controller.previewRows}
            previewActiveCell={controller.previewActiveCell}
            previewTableHeight={controller.previewTableHeight}
            isDividerHover={controller.isCastANetDividerHover}
            canSave={!!controller.createProjectPayload}
            iiifBrowser={iiifBrowser}
            onCopyShareLink={controller.copyShareLink}
            onNudgePreviewNet={controller.nudgePreviewNet}
            onNetConfigChange={controller.setNetConfig}
            onRegisterBrowserClose={controller.setBrowserCloseHandler}
            onStartResize={controller.startPreviewResize}
            onDividerHoverChange={controller.setIsCastANetDividerHover}
            onPreviewRowsChange={controller.setPreviewRows}
            onPreviewActiveCellChange={controller.setPreviewActiveCell}
            onAddRow={controller.addPreviewRow}
            onSave={controller.savePreviewStep}
            onCancel={cancelSetup}
            CastANetComponent={CastANetLazy}
          />
        ) : null}

        {controller.step === stepIds.complete || controller.isProjectCompleted ? (
          <TabularProjectCompleteStep
            t={t}
            isProjectCompleted={controller.isProjectCompleted}
            createdProjectPath={controller.createdProjectPath}
            primaryLabel={controller.primaryLabel}
            primarySummary={controller.primarySummary}
            slug={controller.slug}
            enableZoomTracking={controller.enableZoomTracking}
            hasImage={controller.hasImage}
            configuredColumnCount={controller.configuredColumnCount}
            projectDetailsForConfirmation={controller.projectDetailsForConfirmation}
            setupPayload={controller.setupPayload}
            tabularPayload={controller.tabularPayload}
            createProjectPayload={controller.createProjectPayload}
            isError={controller.isError}
            errorMessage={controller.errorMessage}
            status={controller.status}
            onComplete={controller.completeProject}
          />
        ) : null}
      </WidePage>
    </>
  );
};
