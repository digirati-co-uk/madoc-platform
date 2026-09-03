import { resolveTypesenseMetadataFacets } from '../../src/frontend/site/features/search/resolve-typesense-facets';

const discovered = [
  { attribute: 'metadata_creator', label: 'creator' },
  { attribute: 'metadata_subject', label: 'subject' },
  { attribute: 'metadata_date', label: 'date' },
];

test('an empty facet configuration exposes every discovered facet', () => {
  expect(resolveTypesenseMetadataFacets(discovered, [])).toEqual([
    { id: 'metadata_creator', label: 'creator', fields: [{ attribute: 'metadata_creator' }] },
    { id: 'metadata_subject', label: 'subject', fields: [{ attribute: 'metadata_subject' }] },
    { id: 'metadata_date', label: 'date', fields: [{ attribute: 'metadata_date' }] },
  ]);
});

test('configured facets preserve order, labels, combined fields, and value groups', () => {
  expect(
    resolveTypesenseMetadataFacets(discovered, [
      {
        id: 'people',
        label: { en: ['People'] },
        keys: ['metadata.Subject', 'metadata.Creator'],
        values: [
          {
            id: 'creator-values',
            label: { en: ['Named creators'] },
            values: ['Alice', 'Bob'],
            key: 'metadata.Creator',
          },
        ],
      },
      { id: 'dates', label: { en: ['Dates'] }, keys: ['metadata.Date'] },
    ])
  ).toEqual([
    {
      id: 'people',
      label: { en: ['People'] },
      fields: [
        {
          attribute: 'metadata_creator',
          values: [{ id: 'creator-values', label: { en: ['Named creators'] }, values: ['Alice', 'Bob'] }],
        },
      ],
    },
    {
      id: 'dates',
      label: { en: ['Dates'] },
      fields: [{ attribute: 'metadata_date', values: undefined }],
    },
  ]);
});
