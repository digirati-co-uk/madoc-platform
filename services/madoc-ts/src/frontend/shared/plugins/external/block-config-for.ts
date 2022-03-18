import React from 'react';
import { useQuery } from 'react-query';
import { PageBlockDefinition } from '../../../../extensions/page-blocks/extension';
import { captureModelShorthand } from '../../capture-models/helpers/capture-model-shorthand';
import { useApi } from '../../hooks/use-api';

export function blockConfigFor(Component: any, model: any) {
  if (model.hooks && model.hooks.length) {
    const OriginalComponent = Component;
    Component = function WrappedComponent(_props: any) {
      // This.. is exotic. But `model` is ALWAYS static.
      // So although all "rules of hooks" are broken, it is the same
      // effect as handwriting the hooks individually.
      // It's sort of like an eval React component.
      let props = _props;
      if (model.hooks && model.hooks.length) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const api = useApi();
        for (const hook of model.hooks) {
          const args = hook.creator(_props);
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const query = useQuery(
            [hook.name, args],
            async () => {
              return (api as any)[hook.name](args) as any;
            },
            {
              enabled: typeof args !== 'undefined',
              refetchOnWindowFocus: false,
              refetchOnMount: false,
              refetchInterval: false,
              refetchIntervalInBackground: false,
              retry: false,
              useErrorBoundary: false,
            }
          );
          if (typeof query.data !== 'undefined') {
            props = hook.mapToProps(props, query.data);
          }
        }
      }
      return React.createElement(OriginalComponent, props);
    };
    Component.displayName = OriginalComponent.displayName;
  }

  const definition: PageBlockDefinition<any, any, any> = {
    type: model.type,
    label: model.label,
    svgIcon: model.svgIcon
      ? typeof model.svgIcon === 'string'
        ? function SvgIcon(props: any) {
            return React.createElement('span', { dangerouslySetInnerHTML: { __html: model.svgIcon }, ...props });
          }
        : model.svgIcon
      : undefined,
    model: model.editor
      ? model.editor.type === 'entity'
        ? model.editor
        : captureModelShorthand(model.editor)
      : undefined,
    render: function PageBlock(props: any) {
      return React.createElement(Component, model.mapToProps ? model.mapToProps(props) : props);
    },
    hooks: model.hooks,
    defaultData: model.defaultProps || {},
    renderType: 'react',
    internal: model.internal,
    requiredContext: model.requiredContext,
    anyContext: model.anyContext,
    customEditor: model.customEditor,
    mapFromProps: model.mapFromProps,
    mapToProps: model.mapToProps,
    source: model.source,
  };

  Component[Symbol.for('slot-model')] = definition;

  return definition;
}
