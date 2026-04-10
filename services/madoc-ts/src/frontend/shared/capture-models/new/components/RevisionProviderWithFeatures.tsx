import React from 'react';
import { AnnotationStyles } from '../../../../../types/annotation-styles';
import { AnnotationStyleProvider } from '../../AnnotationStyleContext';
import {
  CaptureModelVisualSettings,
  CaptureModelVisualSettingsProvider,
} from '../../editor/components/CaptureModelVisualSettings/CaptureModelVisualSettings';
import { WithModelNamespace } from '../../hooks/use-model-translation';
import { CaptureModel } from '../../types/capture-model';
import { AutosaveRevision } from '../features/AutosaveRevision';
import { AutoSelectingRevision } from '../features/AutoSelectingRevision';
import { BasicUnNesting } from '../features/BasicUnNesting';
import { CorrectingRevisionSubtree } from '../features/CorrectingRevisionSubtree';
import { SwitchEditMode } from '../features/SwitchEditMode';
import { SwitchFieldAfterRevises } from '../features/SwitchFieldAfterRevises';
import { ContributorProvider } from './ContributorContext';
import { EditorConfig, EditorRenderingConfig, EditorSlots } from './EditorSlots';
import { Revisions } from '../../editor/stores/revisions';

export type RevisionProviderFeatures = {
  revisionEditMode?: boolean;
  autosave?: boolean;
  autoSelectingRevision?: boolean;
  directEdit?: boolean;
  preventMultiple?: boolean;
  basicUnNesting?: boolean;
  translationNamespace?: string;
  forkMode?: boolean;
};

export const RevisionProviderWithFeatures: React.FC<{
  slotConfig?: {
    editor?: Partial<EditorConfig>;
    components?: Partial<EditorRenderingConfig>;
  };
  children?: React.ReactNode;
  captureModel?: CaptureModel | undefined;
  initialRevision?: string | undefined;
  revision?: string | undefined;
  excludeStructures?: boolean | undefined;
  features?: RevisionProviderFeatures;
  visualConfig?: Partial<CaptureModelVisualSettings>;
  annotationTheme?: AnnotationStyles['theme'];
}> = ({
  annotationTheme,
  slotConfig,
  children,
  revision,
  captureModel,
  excludeStructures,
  initialRevision,
  features,
  visualConfig = {},
}) => {
  const {
    autoSelectingRevision = true,
    // autosave = true,
    revisionEditMode = true,
    directEdit = false,
    preventMultiple = false,
    basicUnNesting = true,
    translationNamespace = 'capture-models',
    forkMode = false,
  } = features || {};
  const { components, editor } = slotConfig || {};

  return (
    <ContributorProvider value={captureModel?.contributors || {}}>
      <CaptureModelVisualSettingsProvider {...visualConfig}>
        <WithModelNamespace namespace={translationNamespace || 'capture-models'}>
          <AnnotationStyleProvider theme={annotationTheme}>
            <Revisions.Provider
              key={captureModel?.id}
              revision={revision}
              captureModel={captureModel}
              excludeStructures={excludeStructures}
              initialRevision={initialRevision}
            >
              {/*<DebugRevisionSwitcher contributors={captureModel?.contributors} />*/}
              {/*<AutoSelectDefineRegion />*/}
              {features?.autosave ? <AutosaveRevision /> : null}
              {revisionEditMode ? <SwitchFieldAfterRevises /> : null}
              {revisionEditMode ? <SwitchEditMode /> : null}
              {autoSelectingRevision ? (
                <AutoSelectingRevision forkMode={forkMode} directEdit={directEdit} preventMultiple={preventMultiple} />
              ) : null}
              {basicUnNesting ? <BasicUnNesting /> : null}
              <CorrectingRevisionSubtree />
              <EditorSlots.Provider config={editor} components={components}>
                {children}
              </EditorSlots.Provider>
            </Revisions.Provider>
          </AnnotationStyleProvider>
        </WithModelNamespace>
      </CaptureModelVisualSettingsProvider>
    </ContributorProvider>
  );
};
