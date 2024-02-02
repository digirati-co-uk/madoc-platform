import { InternationalString } from '@iiif/presentation-3';
import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { SingleProject } from './SingleProject';
import { useProjectList } from '../hooks/use-project-list';
import { SingleProjectItem } from '../../tailwind/blocks/SingleProjectItem';

interface AllProjectPaginatedItemsProps {
  customButtonLabel?: InternationalString;
  background?: string;
  radius?: string;
  grid?: boolean;
}

export const AllProjectsPaginatedItems: React.FC<AllProjectPaginatedItemsProps> = ({
  customButtonLabel,
  radius,
  background,
  grid,
}) => {
  const { resolvedData: data } = useProjectList();

  const Component = grid ? SingleProjectItem : SingleProject;

  return (
    <div style={grid ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 } : undefined}>
      {data?.projects.map(project => (
        <Component
          key={project.id}
          project={{ id: project.slug }}
          data={project as any}
          customButtonLabel={customButtonLabel}
          radius={radius}
          background={background}
        />
      ))}
    </div>
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
    grid: false,
  },
  source: {
    name: 'All projects page',
    type: 'custom-page',
    id: '/projects',
  },
  anyContext: [],
  requiredContext: [],
  editor: {
    customButtonLabel: { type: 'text-field', label: 'Custom button label' },
    background: { type: 'color-field', label: 'Background color', defaultValue: '#eeeeee' },
    radius: { type: 'text-field', label: 'Border radius', defaultValue: '' },
    grid: { type: 'checkbox-field', label: 'Use new grid', inlineLabel: 'enable grid' },
  },
});
