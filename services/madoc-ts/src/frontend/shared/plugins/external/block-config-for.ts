import { captureModelShorthand } from '@capture-models/helpers';
import { BaseField } from '@capture-models/types';
import React from 'react';
import { PageBlockDefinition, PageBlockEditor } from '../../../../extensions/page-blocks/extension';
import { EditorialContext } from '../../../../types/schemas/site-page';

export function blockConfigFor<Props, MappedProps = Props>(
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
  const definition: PageBlockDefinition<any, any, any, any> = {
    type: model.type,
    label: model.label,
    model: captureModelShorthand(model.editor),
    render: function PageBlock(props) {
      return React.createElement(Component, model.mapToProps ? model.mapToProps(props) : props);
    },
    defaultData: model.defaultProps || {},
    renderType: 'react',
    internal: model.internal,
    requiredContext: model.requiredContext,
    anyContext: model.anyContext,
    customEditor: model.customEditor,
  };

  (Component as any)[Symbol.for('slot-model')] = definition;

  return definition;
}
