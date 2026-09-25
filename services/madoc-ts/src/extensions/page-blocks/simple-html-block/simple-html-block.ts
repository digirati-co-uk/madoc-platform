import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { HTMLPageBlockDefinition } from '../extension';
import { setHtmlLinkTargets } from '../../../frontend/shared/utility/link-targets';

const definition: HTMLPageBlockDefinition<{ html: string; openInNewTab?: boolean }> = {
  label: 'Simple HTML block',
  type: 'simple-html-block',
  renderType: 'html',
  model: captureModelShorthand({
    html: {
      label: 'Enter HTML content',
      type: 'html-field',
      enableLinks: true,
    },
    openInNewTab: {
      label: 'Open links in new tab',
      type: 'checkbox-field',
    },
  }),
  defaultData: {
    html: '',
    openInNewTab: false,
  },
  render: data => {
    return `<div class="simple-html-block">${setHtmlLinkTargets(data.html || '', !!data.openInNewTab)}</div>`;
  },
};

export default definition;
