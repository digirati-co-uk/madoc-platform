import * as React from 'react';
export default { title: 'Capture models / Mustache' };

import model1 from '../../fixtures/97-bugs/05-chain.json';
import model2 from '../../fixtures/03-revisions/02-single-field-with-multiple-revisions.json';
import model3 from '../../fixtures/96-jira/MAD-1076.json';
import { serialiseCaptureModel } from '../../src/frontend/shared/capture-models/helpers/serialise-capture-model';
import { mustache } from '../../src/utility/mustache';

export const Default = () => {
  // 1. Find a capture model

  const serialised = serialiseCaptureModel(model3.document, {
    addSelectors: true,
    normalisedValueLists: true,
  });

  const text = mustache(
    `
<div>
  {{#ocr-correction.properties}}
    {{#properties.lines}}
        <div style="margin-left:calc({{selector.x}}px/10)">
          {{#properties.text}}
            {{value}}
          {{/properties.text}}
        </div>
    {{/properties.lines}}
  {{/ocr-correction}} 
</div>
  `,
    serialised
  );

  return (
    <div>
      <h1>Mustache.</h1>
      <p>This demo will have 3 tabs</p>
      <ul>
        <li>The capture model editor</li>
        <li>The capture model preview</li>
        <li>Mustache/Markdown editor + preview</li>
      </ul>
      <div dangerouslySetInnerHTML={{ __html: text }} />
      <pre>{JSON.stringify(serialised, null, 2)}</pre>
    </div>
  );
};
