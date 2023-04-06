import { InternationalString } from '@iiif/presentation-3';
import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { SingleProject } from '../../shared/components/SingleProject';
import { useProjectList } from '../hooks/use-project-list';

interface AllProjectPaginatedItemsProps {
  customButtonLabel?: InternationalString;
  background?: string;
  radius?: string;
}

export const AllProjectsPaginatedItems: React.FC<AllProjectPaginatedItemsProps> = ({
  customButtonLabel,
  radius,
  background,
}) => {
  const { resolvedData: data } = useProjectList();

  return (
    <>
      {data?.projects.map(project => (
        <SingleProject
          key={project.id}
          project={{ id: project.slug }}
          data={project as any}
          customButtonLabel={customButtonLabel}
          radius={radius}
          background={background}
        />
      ))}
    </>
  );
};

blockEditorFor(AllProjectsPaginatedItems, {
    type: 'default.AllProjectsPaginatedItems',
    label: 'All projects listing',
    internal: true,
    defaultProps: {
        customButtonLabel: '',
        background: null,
        radius: null,
    },
    source: {
        name: 'All projects page',
        type: 'custom-page',
        id: '/projects',
    },
    anyContext: [],
    requiredContext: [],
    editor: {
        customButtonLabel: {type: 'text-field', label: 'Custom button label'},
        background: {type: 'color-field', label: 'Background color', defaultValue: '#eeeeee'},
        radius: {type: 'text-field', label: 'Border radius', defaultValue: ''},
    },
});
