import { captureModelShorthand } from '@capture-models/helpers';
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
    return data.html;
  },
};

export default definition;
