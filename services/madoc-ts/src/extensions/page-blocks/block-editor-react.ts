import React, { JSXElementConstructor } from 'react';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';
import { blockConfigFor } from '../../frontend/shared/plugins/external/block-config-for';
import { BlockHook } from '../../types/block-hook';
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
    svgIcon?: string | JSXElementConstructor<React.SVGProps<SVGSVGElement>>;
    requiredContext?: Array<keyof EditorialContext>;
    anyContext?: Array<keyof EditorialContext>;
    mapToProps?: (props: MappedProps) => Props;
    mapFromProps?: (props: Props) => MappedProps;
    customEditor?: PageBlockEditor;
    hooks?: Array<BlockHook>;
    source?: { type: string; id?: string; name: string };
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
      const propsToAdd = definition.mapFromProps ? definition.mapFromProps(props || {}) : props;
      return {
        ...definition,
        defaultData: {
          ...(definition.defaultData || {}),
          ...(propsToAdd || {}),
        },
      };
    }
  }).filter((e: any) => e);
}
