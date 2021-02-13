import { captureModelShorthand } from '@capture-models/helpers';
import { BaseField } from '@capture-models/types';
import React from 'react';
import { EditorialContext } from '../../types/schemas/site-page';
import { PageBlockDefinition } from './extension';
import mitt from 'mitt';

export const reactBlockEmitter = mitt();

export function blockEditorFor<Props>(
  Component: React.FC<Props>,
  model: {
    label: string;
    type: string;
    defaultProps?: Partial<Props>;
    editor: {
      [T in keyof Props]?: string | ({ type: string } & Partial<BaseField>);
    };
    requiredContext?: Array<keyof EditorialContext>;
    anyContext?: Array<keyof EditorialContext>;
  }
): PageBlockDefinition<any, any, any, any> {
  const definition: PageBlockDefinition<any, any, any, any> = {
    type: model.type,
    label: model.label,
    model: captureModelShorthand(model.editor),
    render: function PageBlock(props) {
      return React.createElement(Component, props);
    },
    defaultData: model.defaultProps || {},
    renderType: 'react',
    requiredContext: model.requiredContext,
    anyContext: model.anyContext,
  };

  reactBlockEmitter.emit('block', definition);

  (Component as any)[Symbol.for('slot-model')] = definition;

  return definition;
}

export function extractBlockDefinitions(components: any): PageBlockDefinition<any, any, any, any>[] {
  if (!components) {
    return [];
  }

  return React.Children.map(components, singleComponent => {
    const props = singleComponent.props || {};

    // @ts-ignore
    const definition =
      singleComponent &&
      singleComponent.type &&
      (singleComponent.type[Symbol.for('slot-model')] as PageBlockDefinition<any, any, any, any>);
    if (definition) {
      return {
        ...definition,
        defaultData: {
          ...(definition.defaultData || {}),
          ...(props || {}),
        },
      };
    }
  }).filter((e: any) => e);
}
