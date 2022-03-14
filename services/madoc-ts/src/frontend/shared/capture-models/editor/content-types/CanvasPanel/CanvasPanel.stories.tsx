import * as React from 'react';
import { Revisions as RevisionStore } from '../../stores/revisions';
import CanvasPanel from './CanvasPanel';
import './index';
import { useState } from 'react';
import { useSelectorHelper } from '../../stores/selectors/selector-helper';
const model = require('../../../../../../../fixtures/04-selectors/05-wunder-selector.json');
const ocrModel = require('../../../../../../../fixtures/02-nesting/06-ocr.json');

export default { title: 'Content Types/Canvas Panel' };

export const Simple: React.FC = () => {
  return (
    <RevisionStore.Provider
      initialData={{ captureModel: model, initialRevision: 'e801f905-5afc-4612-9e59-2b78cf407b9d' }}
    >
      <CanvasPanel
        id="123"
        type="canvas-panel"
        options={{}}
        state={{
          canvasId: 'https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0001.JP2',
          manifestId: 'https://iiif.wellcomecollection.org/presentation/v2/b18035723',
        }}
      />
    </RevisionStore.Provider>
  );
};

export const OCRCanvas: React.FC = () => {
  const helper = useSelectorHelper();
  const [highlighted, setHighlighted] = useState(false);

  return (
    <RevisionStore.Provider
      initialData={{ captureModel: ocrModel, initialRevision: '320a754b-4546-4271-b226-c97a90807950' }}
    >
      <button
        onClick={() => {
          if (highlighted) {
            helper.clearHighlight('0117a007-70cf-4e2f-b1bb-d997d80099f6');
            setHighlighted(false);
          } else {
            helper.highlight('0117a007-70cf-4e2f-b1bb-d997d80099f6');
            setHighlighted(true);
          }
        }}
      >
        Highlight selector
      </button>
      <CanvasPanel
        id="123"
        type="canvas-panel"
        options={{
          selectorVisibility: {
            adjacentSelectors: false,
            currentSelector: true,
            displaySelectors: true,
            topLevelSelectors: true,
          },
        }}
        state={{
          canvasId: 'https://iiif.wellcomecollection.org/presentation/b18035723/canvases/b18035723_0036.JP2',
          manifestId: 'https://iiif.wellcomecollection.org/presentation/v2/b18035723',
        }}
      />
    </RevisionStore.Provider>
  );
};
