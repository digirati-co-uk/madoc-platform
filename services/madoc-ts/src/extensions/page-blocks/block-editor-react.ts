import { BaseField } from '@capture-models/types';
import React from 'react';
import { blockConfigFor } from '../../frontend/shared/plugins/external/block-config-for';
import { EditorialContext } from '../../types/schemas/site-page';
import { PageBlockDefinition, PageBlockEditor, PageBlockExtension } from './extension';

export function blockEditorFor<Props, MappedProps = Props>(
  Component: React.FC<Props>,
  model: {
    label: string;
    type: string;
    defaultProps?: Partial<MappedProps>;
    editor: {
      [T in keyof MappedProps]?: string | ({ type: string } & Partial<BaseField> & any);
    };
    internal?: boolean;
    requiredContext?: Array<keyof EditorialContext>;
    anyContext?: Array<keyof EditorialContext>;
    mapToProps?: (props: MappedProps) => Props;
    customEditor?: PageBlockEditor;
  }
): PageBlockDefinition<any, any, any, any> {
  const definition = blockConfigFor(Component, model);

  PageBlockExtension.register(definition);

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
