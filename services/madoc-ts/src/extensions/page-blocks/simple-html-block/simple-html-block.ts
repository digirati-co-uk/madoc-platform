import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { HTMLPageBlockDefinition } from '../extension';

const definition: HTMLPageBlockDefinition<{ html: string }> = {
  label: 'Simple HTML block',
  type: 'simple-html-block',
  renderType: 'html',
  model: captureModelShorthand({
    html: {
      label: 'Enter HTML content',
      type: 'html-field',
    },
  }),
  defaultData: {
    html: '',
  },
  render: data => {
    return `<div class="simple-html-block">${data.html}</div>`;
  },
};

export default definition;
