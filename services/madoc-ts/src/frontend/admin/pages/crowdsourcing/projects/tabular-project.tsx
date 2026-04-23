import React from 'react';
import { useTranslation } from 'react-i18next';
import { useBeforeUnload, useNavigate } from 'react-router-dom';
import { useDefaultLocale, useSite, useSupportedLocales } from '@/frontend/shared/hooks/use-site';
import { useApi } from '@/frontend/shared/hooks/use-api';
import { WidePage } from '@/frontend/shared/layout/WidePage';
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
  const isProceedingWithBackNavigation = React.useRef(false);
  const hasPushedGuardEntry = React.useRef(false);

  const confirmLeaveSetup = React.useCallback(() => window.confirm(LEAVE_SETUP_MESSAGE), []);

  const cancelSetup = React.useCallback(() => {
    if (!shouldWarnOnLeave || confirmLeaveSetup()) {
      navigate('/projects/create');
    }
  }, [confirmLeaveSetup, navigate, shouldWarnOnLeave]);

  useBeforeUnload(
    React.useCallback(
      event => {
        if (!shouldWarnOnLeave) {
          return;
        }
        event.preventDefault();
        event.returnValue = LEAVE_SETUP_MESSAGE;
      },
      [shouldWarnOnLeave]
    )
  );

  React.useEffect(() => {
    if (!shouldWarnOnLeave) {
      return;
    }

    if (!hasPushedGuardEntry.current) {
      // Add an in-place history entry so browser Back can be intercepted even after direct opens.
      window.history.pushState({ ...(window.history.state || {}), tabularLeaveGuard: true }, '', window.location.href);
      hasPushedGuardEntry.current = true;
    }

    const onPopState = () => {
      if (isProceedingWithBackNavigation.current) {
        isProceedingWithBackNavigation.current = false;
        return;
      }

      if (!confirmLeaveSetup()) {
        window.history.pushState(
          { ...(window.history.state || {}), tabularLeaveGuard: true },
          '',
          window.location.href
        );
        return;
      }

      isProceedingWithBackNavigation.current = true;
      window.history.back();
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

  const isCompleteStep = controller.step === stepIds.complete || controller.isProjectCompleted;
  const showHeaderActions = !isCompleteStep;

  const handleSaveAndContinue = () => {
    switch (controller.step) {
      case stepIds.details:
        void controller.saveDetailsStep();
        return;
      case stepIds.settings:
        controller.saveSettingsStep();
        return;
      case stepIds.model:
        controller.moveNextFromModel();
        return;
      case stepIds.net:
        controller.saveNetStep();
        return;
      case stepIds.preview:
        controller.savePreviewStep();
        return;
      default:
        return;
    }
  };

  const isSaveDisabled = (() => {
    switch (controller.step) {
      case stepIds.details:
        return !controller.detailsDone || controller.isCheckingDetails;
      case stepIds.settings:
        return controller.enableZoomTracking && !controller.hasImage;
      case stepIds.model:
        return false;
      case stepIds.net:
        return false;
      case stepIds.preview:
        return !controller.createProjectPayload;
      default:
        return true;
    }
  })();

  return (
    <>
      <TabularWizardHeader
        t={t}
        steps={controller.steps}
        currentStep={controller.step}
        maxReachedStep={controller.maxReachedStep}
        completeStepId={stepIds.complete}
        isProjectCompleted={controller.isProjectCompleted}
        onStepClick={controller.goToStep}
        showActions={showHeaderActions}
        onCancel={cancelSetup}
        onSaveAndContinue={handleSaveAndContinue}
        isSaveDisabled={isSaveDisabled}
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
            onLabelChange={controller.setLabel}
            onSummaryChange={controller.setSummary}
            onSlugFocus={controller.disableAutoSlug}
            onSlugChange={controller.setSlug}
            slugError={controller.detailsError}
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
          />
        ) : null}

        {controller.step === stepIds.model ? (
          <TabularProjectModelStep
            t={t}
            tabularModel={controller.tabularModel}
            crowdsourcingInstructions={controller.crowdsourcingInstructions}
            manifestId={controller.manifestId}
            canvasId={controller.canvasId}
            showValidationErrors={controller.showModelValidationErrors}
            onTabularModelChange={controller.setTabularModel}
            onCrowdsourcingInstructionsChange={controller.setCrowdsourcingInstructions}
            onModelChange={controller.onModelChange}
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
            onClearImageSelection={controller.clearImageSelection}
            onRegisterBrowserClose={controller.setBrowserCloseHandler}
            onStartResize={controller.startCastANetResize}
            onDividerHoverChange={controller.setIsCastANetDividerHover}
            CastANetComponent={CastANetLazy}
          />
        ) : null}

        {controller.step === stepIds.preview ? (
          <TabularProjectPreviewStep
            t={t}
            shareUrl={controller.shareUrl}
            shareCopied={controller.shareCopied}
            crowdsourcingInstructions={controller.crowdsourcingInstructions}
            canTrackPreviewOnCanvas={controller.canTrackPreviewOnCanvas}
            hasImage={controller.hasImage}
            manifestId={controller.manifestId}
            canvasId={controller.canvasId}
            netConfig={controller.netConfig}
            previewCanvasHeight={controller.previewCanvasHeight}
            previewCanvasActiveCell={controller.previewCanvasActiveCell}
            previewColumns={controller.previewColumns}
            previewTooltips={controller.previewTooltips}
            previewFieldTypes={controller.previewFieldTypes}
            previewDropdownOptionsText={controller.previewDropdownOptionsText}
            previewTableRowCount={controller.previewTableRowCount}
            previewRows={controller.previewRows}
            previewActiveCell={controller.previewActiveCell}
            previewTableHeight={controller.previewTableHeight}
            isDividerHover={controller.isCastANetDividerHover}
            iiifBrowser={iiifBrowser}
            onCopyShareLink={controller.copyShareLink}
            onNudgePreviewNet={controller.nudgePreviewNet}
            onNetConfigChange={controller.setNetConfig}
            onRegisterBrowserClose={controller.setBrowserCloseHandler}
            onStartResize={controller.startPreviewResize}
            onDividerHoverChange={controller.setIsCastANetDividerHover}
            onPreviewRowsChange={controller.setPreviewRows}
            onPreviewActiveCellChange={controller.setPreviewActiveCell}
            canRemovePreviewRow={controller.canRemovePreviewRow}
            onAddRow={controller.addPreviewRow}
            onRemoveRow={controller.removePreviewRow}
            CastANetComponent={CastANetLazy}
          />
        ) : null}

        {controller.step === stepIds.complete || controller.isProjectCompleted ? (
          <TabularProjectCompleteStep
            t={t}
            isProjectCompleted={controller.isProjectCompleted}
            createdProjectPath={controller.createdProjectPath}
            label={controller.label}
            summary={controller.summary}
            defaultLocale={defaultLocale}
            slug={controller.slug}
            enableZoomTracking={controller.enableZoomTracking}
            configuredRowCount={controller.previewTableRowCount}
            configuredColumnCount={controller.configuredColumnCount}
            crowdsourcingInstructions={controller.crowdsourcingInstructions}
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
