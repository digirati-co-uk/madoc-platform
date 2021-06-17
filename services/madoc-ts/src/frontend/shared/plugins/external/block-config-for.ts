import React from 'react';

export function blockConfigFor(Component: any, model: any) {
  const definition = {
    type: model.type,
    label: model.label,
    modelShorthand: model.editor,
    render: function PageBlock(props: any) {
      return React.createElement(Component, model.mapToProps ? model.mapToProps(props) : props);
    },
    defaultData: model.defaultProps || {},
    renderType: 'react',
    internal: model.internal,
    requiredContext: model.requiredContext,
    anyContext: model.anyContext,
    customEditor: model.customEditor,
  };

  Component[Symbol.for('slot-model')] = definition;

  return definition;
}
