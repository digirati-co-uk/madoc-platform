import '../../src/frontend/shared/capture-models/editor/bundle';
import { hydrateCompressedModel } from '../../src/frontend/shared/capture-models/helpers/hydrate-compressed-model';
import * as React from 'react';
import { ViewDocument } from '../../src/frontend/shared/capture-models/inspector/ViewDocument';
import { RevisionList } from '../../src/frontend/shared/capture-models/RevisionList';

const fixtureOptions = [
  {
    label: 'First model',
    document: {
      id: '3e922ab7-efaf-46fd-9a4a-13e8a4803f24',
      type: 'entity',
      label: 'Untitled document',
      properties: {
        regionOfInterest: [
          {
            id: '1d4b9d55-9077-4651-9467-0337d4de5dba',
            type: 'text-field',
            label: 'regionOfInterest',
            value: '',
            selector: {
              id: 'd0b5ccc1-fdf0-4812-bb11-4d1b9bedf62e',
              type: 'box-selector',
              state: null,
            },
          },
          {
            id: '935ca55f-b602-477e-aeba-1b0aaa1bb3ac',
            type: 'text-field',
            label: 'regionOfInterest',
            value: 'Also find this one in search if you can',
            revises: '1d4b9d55-9077-4651-9467-0337d4de5dba',
            selector: {
              id: 'b5ae0b2a-6928-43f5-ae70-8296c3d2a787',
              type: 'box-selector',
              state: {
                x: 520.1460937500001,
                y: 1040.67274017334,
                width: 378,
                height: 268,
              },
            },
            revision: '0eff8455-fa65-48da-98a8-62d7a0d7354e',
          },
          {
            id: '2b1b8c9c-6520-4d1c-962e-aa139d91a62f',
            type: 'text-field',
            label: 'regionOfInterest',
            value: 'test',
            revises: '935ca55f-b602-477e-aeba-1b0aaa1bb3ac',
            selector: {
              id: '325500b0-8402-4077-a05d-1f3185fbe91a',
              type: 'box-selector',
              state: {
                x: 1526.7110862305717,
                y: 216.79805309470055,
                width: 377.9999999999999,
                height: 268,
              },
            },
            revision: '81b5ab8e-7f28-4310-a5ca-c4ee7181448c',
          },
        ],
      },
    },
  },
  {
    label: 'Shorthand model',
    document: hydrateCompressedModel({
      __meta__: {
        label: { label: 'Label', type: 'text-field' },
        description: { label: 'Description', type: 'text-field' },
        'person.name': { label: 'Name', type: 'text-field' },
        'person.city': { label: 'City', type: 'text-field' },
        'person.relation.description': 'text-field',
        'person.relation.label': 'text-field',
      } as any,
      label: 'Test a value',
      description: 'Test a value',
      person: [
        {
          name: 'Person A',
          city: 'Glasgow',
          relation: [
            { label: 'A', description: 'A' },
            { label: 'B', description: 'B' },
            { label: 'B', description: 'C' },
          ],
        },
      ],
    }),
  },
];

export default { title: 'Legacy/Model inspector' };

export const View_Document_1 = () => {
  return <ViewDocument document={fixtureOptions[0].document} />;
};
export const View_Document_2 = () => {
  return <ViewDocument document={fixtureOptions[1].document} />;
};

export const Revision_List = () => {
  return <RevisionList revisions={[]} />;
};
