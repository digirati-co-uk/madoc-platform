import { createDefaultStructure } from '../../utility/create-default-structure';
import { createRevisionStore } from '../editor/stores/revisions/revisions-store';
import { CaptureModel } from '../types/capture-model';
import { captureModelShorthandText } from './capture-model-shorthand-text';
import { generateId } from './generate-id';
import { hydrateCaptureModel } from './hydrate-capture-model';

export function captureModelRevisionStoreShorthand(
  text: string,
  data: any,
  {
    slugify = false,
    withDocument = e => e,
    withStructure = e => e,
  }: {
    slugify?: boolean;
    withDocument?: (doc: CaptureModel['document']) => CaptureModel['document'];
    withStructure?: (doc: CaptureModel['structure']) => CaptureModel['structure'];
  } = {}
) {
  const document = withDocument(
    captureModelShorthandText(text, {
      defaultType: 'text-field',
      slugify: slugify,
    })
  );

  const hydrated = hydrateCaptureModel(document, data, { keepExtraFields: true });
  const structure = withStructure(createDefaultStructure(document));
  const captureModel: CaptureModel = {
    id: generateId(),
    document: hydrated,
    structure,
    revisions: [],
  };

  const store = createRevisionStore({
    captureModel: captureModel,
    excludeStructures: false,
  });
  const actions = store.getActions();

  return {
    store,
    actions,
    captureModel,
    structureId: structure.id,
  };
}
