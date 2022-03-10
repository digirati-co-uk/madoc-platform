import { createContextStore } from 'easy-peasy';
import React, { useEffect, useRef } from 'react';
import { CaptureModel } from '../../../types/capture-model';
import { revisionStore } from './revisions-store';
import { RevisionsModel } from './revisions-model';

export const {
  Provider,
  useStore,
  useStoreActions,
  useStoreDispatch,
  useStoreRehydrated,
  useStoreState,
} = createContextStore<RevisionsModel>(revisionStore);

type RevisionProviderProps = {
  captureModel?: CaptureModel;
  initialRevision?: string;
  revision?: string;
  excludeStructures?: boolean;
};

const InternalRevisionProvider: React.FC<RevisionProviderProps> = ({
  children,
  captureModel,
  initialRevision,
  revision,
  excludeStructures,
}) => {
  const lastModel = useRef<string>();
  const lastRevision = useRef<string>();
  const { setCaptureModel, selectRevision } = useStoreActions(a => ({
    selectRevision: a.selectRevision,
    setCaptureModel: a.setCaptureModel,
  }));

  useEffect(() => {
    if (captureModel && (!lastModel.current || lastModel.current !== captureModel.id)) {
      lastModel.current = captureModel.id;
      setCaptureModel({
        captureModel,
        initialRevision: initialRevision ? initialRevision : revision,
        excludeStructures,
      });
    }

    if (revision && (!lastRevision.current || lastRevision.current !== revision)) {
      lastRevision.current = revision;
      selectRevision({ revisionId: revision });
    }
  }, [captureModel, excludeStructures, initialRevision, revision, selectRevision, setCaptureModel]);

  return <>{children}</>;
};

export const RevisionProvider: React.FC<RevisionProviderProps & { initialData?: RevisionProviderProps }> = ({
  children,
  revision,
  ...props
}) => {
  const { captureModel, initialRevision, excludeStructures } = props.initialData ? props.initialData : props;

  return (
    <Provider>
      <InternalRevisionProvider
        captureModel={captureModel}
        initialRevision={initialRevision}
        excludeStructures={excludeStructures}
        revision={revision}
      >
        {children}
      </InternalRevisionProvider>
    </Provider>
  );
};
