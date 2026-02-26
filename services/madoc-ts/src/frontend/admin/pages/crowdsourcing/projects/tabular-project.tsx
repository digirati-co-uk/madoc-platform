import React from 'react';
import { useTranslation } from 'react-i18next';
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

const DefineTabularModelLazy = madocLazy(async () => {
  const imported = await import('../../../components/tabular/cast-a-net/DefineTabularModel');
  return { default: imported.DefineTabularModel };
});

const CastANetLazy = madocLazy(async () => {
  const imported = await import('../../../components/tabular/cast-a-net/CastANet');
  return { default: imported.CastANet };
});

export const TabularProjectWizard: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
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

  const iiifBrowser = (
    <TabularIiifBrowserModal
      t={t}
      iiifMadocSearchInput={controller.iiifMadocSearchInput}
      onIiifMadocSearchInputChange={controller.setIiifMadocSearchInput}
      isLoadingIiifHome={controller.isLoadingIiifHome}
      onSearchMadocResources={controller.searchMadocResources}
      onClearMadocSearch={controller.clearMadocSearch}
      iiifHomeStats={controller.iiifHomeStats}
      iiifPasteUrl={controller.iiifPasteUrl}
      onIiifPasteUrlChange={controller.setIiifPasteUrl}
      onOpenIiifUrl={controller.openIiifUrl}
      iiifHomeLoadError={controller.iiifHomeLoadError}
      iiifBrowserModalError={controller.iiifBrowserModalError}
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
        title={t('Create tabular project')}
        subtitle={t('Build a tabular model project')}
        noMargin
      />

      <TabularWizardHeader
        t={t}
        steps={controller.steps}
        currentStep={controller.step}
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
          />
        ) : null}

        {controller.step === stepIds.settings ? (
          <TabularProjectSettingsStep
            t={t}
            enableZoomTracking={controller.enableZoomTracking}
            hasImage={controller.hasImage}
            manifestId={controller.manifestId}
            canvasId={controller.canvasId}
            iiifBrowserSelection={controller.iiifBrowserSelection}
            iiifError={controller.iiifError}
            iiifBrowser={iiifBrowser}
            onEnableZoomTrackingChange={controller.setEnableZoomTracking}
            onClearImageSelection={controller.clearImageSelection}
            onRegisterBrowserClose={controller.setBrowserCloseHandler}
            onSave={controller.saveSettingsStep}
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
            enableZoomTracking={controller.enableZoomTracking}
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
