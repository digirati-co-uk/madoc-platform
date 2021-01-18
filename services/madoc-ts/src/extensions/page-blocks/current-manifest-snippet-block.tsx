import { captureModelShorthand } from '@capture-models/helpers';
import React from 'react';
import { ManifestSnippet } from '../../frontend/shared/components/ManifestSnippet';
import { ReactPageBlockDefinition } from './extension';

const definition: ReactPageBlockDefinition<
  {
    flat?: boolean;
    lightBackground?: boolean;
    size?: 'lg' | 'md' | 'sm';
    center?: boolean;
    buttonRole?: 'button' | 'link';
    containThumbnail?: boolean;
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
    containThumbnail: {
      label: 'Thumbnail layout',
      type: 'checkbox-field',
      inlineLabel: 'Contain thumbnail',
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
    containThumbnail: true,
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
