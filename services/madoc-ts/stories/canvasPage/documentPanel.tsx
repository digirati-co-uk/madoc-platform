
import { useTranslation } from 'react-i18next';

import { ModelDocumentIcon } from '../../src/frontend/shared/icons/ModelDocumentIcon';

import { CanvasMenuHook } from '../../src/frontend/site/hooks/canvas-menu/types';

export function DocumentPanel(): CanvasMenuHook {
  const { t } = useTranslation();
  // const data = {};

  // const validModels =
  //   data && data.models
  //     ? data.models.filter((model: any) => {
  //         const flatProperties = Object.values(model.document.properties);
  //
  //         const nestedItems = flatProperties
  //           .flatMap(b => b)
  //           .map((f: any) => f.properties && Object.values(f.properties));
  //
  //         const emptyFlat = nestedItems
  //           .filter(x => x)
  //           .flatMap(a => a)
  //           .flatMap(b => b.filter((f: any) => f.value));
  //         const emptyFields = flatProperties.flatMap(c => c).filter((f: any) => f.value);
  //         const isApproved = model.revisions.filter((q: { approved: boolean }) => q.approved);
  //         return flatProperties.length > 0 && isApproved.length > 0 && (emptyFlat.length > 0 || emptyFields.length > 0);
  //       })
  //     : [];

  const content = (
    <>
      {/*{validModels.length ? (*/}
      {/*  data.models.map((model: CaptureModel) => {*/}
      {/*    const incompleteRevisions = (model.revisions || [])*/}
      {/*      .filter(rev => {*/}
      {/*        return !rev.approved;*/}
      {/*      })*/}
      {/*      .map(rev => rev.id);*/}

      {/*    const flatProperties = Object.entries(model.document.properties);*/}
      {/*    if (flatProperties.length === 0) {*/}
      {/*      return null;*/}
      {/*    }*/}

      {/*    return (*/}
      {/*      <ViewDocument*/}
      {/*        key={JSON.stringify(captureModel.document)}*/}
      {/*        hideEmpty*/}
      {/*        document={captureModel.document}*/}
      {/*        filterRevisions={incompleteRevisions}*/}
      {/*      />*/}
      {/*    );*/}
      {/*  })*/}
      {/*) : (*/}
      {/*  <MetadataEmptyState style={{ marginTop: 100 }}>{t('No document yet')}</MetadataEmptyState>*/}
      {/*)}*/}
    </>
  );
  return {
    id: 'document',
    label: t('Document'),
    icon: <ModelDocumentIcon />,
    isLoaded: true,
    notifications: 0,
    content,
  };
}
