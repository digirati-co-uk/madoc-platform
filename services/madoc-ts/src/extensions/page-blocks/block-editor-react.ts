import React from 'react';
import { AvailableBlocks } from '../../frontend/shared/page-blocks/available-blocks';
import { getDefaultPageBlockDefinitions } from './default-definitions';
import { PageBlockDefinition } from './extension';

export function extractBlockDefinitions(
  components: any,
  { recurse = true }: { recurse?: boolean } = {}
): PageBlockDefinition<any, any, any, any>[] {
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
    extracted.push(...extractBlockDefinitions(available, { recurse: false }));

    for (const name of names) {
      const definition = Object.values(getDefaultPageBlockDefinitions()).find(r => r && r.type === name);
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
