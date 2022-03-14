import React from 'react';
import { PageBlockDefinition } from '../../../../extensions/page-blocks/extension';
import { captureModelShorthand } from '../../capture-models/helpers/capture-model-shorthand';

export function blockConfigFor(Component: any, model: any) {
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
