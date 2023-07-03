import React from 'react';
import { captureModelShorthand } from '../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { ManifestSnippet } from '../../frontend/shared/components/ManifestSnippet';
import { ReactPageBlockDefinition } from './extension';

const definition: ReactPageBlockDefinition<
  {
    flat?: boolean;
    lightBackground?: boolean;
    size?: 'lg' | 'md' | 'sm';
    center?: boolean;
    buttonRole?: 'button' | 'link';
    smallLabel?: boolean;
    fluid?: boolean;
  },
  'manifest'
> = {
  label: 'Current manifest snippet',
  type: 'current-manifest-snippet-block',
  renderType: 'react',
  model: captureModelShorthand({
    flat: {
      label: 'Appearance of the container',
      type: 'checkbox-field',
      inlineLabel: 'Hide drop shadow',
    },
    lightBackground: {
      label: 'Thumbnail background',
      type: 'checkbox-field',
      inlineLabel: 'Light background',
    },
    size: {
      label: 'Size',
      type: 'dropdown-field',
      options: [
        { value: 'sm', text: 'Small' },
        { value: 'md', text: 'Medium' },
        { value: 'lg', text: 'Large' },
      ],
    },
    center: {
      label: 'Text justification',
      type: 'checkbox-field',
      inlineLabel: 'Align center',
    },
    buttonRole: {
      label: 'Manifest link',
      type: 'dropdown-field',
      options: [
        { value: 'button', text: 'Button' },
        { value: 'link', text: 'Link' },
      ],
    },
    smallLabel: {
      label: 'Label size',
      type: 'checkbox-field',
      inlineLabel: 'Small label',
    },
    fluid: {
      label: 'Fluid width',
      type: 'checkbox-field',
      inlineLabel: 'Expand to fill available space',
    },
  }),
  defaultData: {
    flat: false,
    lightBackground: false,
    size: 'md',
    center: false,
    buttonRole: 'button',
    smallLabel: false,
    fluid: false,
  },
  requiredContext: ['manifest'],
  render: (data, context) => {
    if (!context.manifest) {
      return null;
    }
    return <ManifestSnippet id={context.manifest} {...data} />;
  },
};

export default definition;
