import React, { JSXElementConstructor } from 'react';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';
import { AvailableBlocks } from '../../frontend/shared/page-blocks/available-blocks';
import { blockConfigFor } from '../../frontend/shared/plugins/external/block-config-for';
import { BlockHook } from '../../types/block-hook';
import { EditorialContext } from '../../types/schemas/site-page';
import { defaultPageBlockDefinitions } from './default-definitions';
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

export function extractBlockDefinitions(components: any, recurse = true): PageBlockDefinition<any, any, any, any>[] {
  const extracted: PageBlockDefinition<any, any, any, any>[] = [];
  if (!components) {
    return [];
  }

  const available: any[] = [];
  const names: string[] = [];

  extracted.push(
    ...React.Children.map(components, singleComponent => {
      const props = singleComponent.props || {};

      if (singleComponent && singleComponent.type === AvailableBlocks) {
        available.push(...(singleComponent.props.children || []));
        if (singleComponent.props.names) {
          names.push(...singleComponent.props.names);
        }
        return undefined;
      }

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
    }).filter((e: any) => e)
  );

  if (recurse && (available.length || names.length)) {
    extracted.push(...extractBlockDefinitions(available, false));

    for (const name of names) {
      const definition = Object.values(defaultPageBlockDefinitions).find(r => r && r.type === name);
      if (definition) {
        extracted.push({
          ...definition,
          defaultData: {
            ...(definition.defaultData || {}),
          },
        });
      }
    }
  }

  return extracted;
}
