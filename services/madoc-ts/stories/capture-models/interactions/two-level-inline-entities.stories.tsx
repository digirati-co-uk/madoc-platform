import * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { CaptureModelTestHarness } from './CaptureModelTestHarness';

const twoLevelInlineModel = {
  document: {
    id: 'two-level-root',
    type: 'entity',
    label: 'Two level root',
    properties: {
      illustrations: [
        {
          id: 'illustration-1',
          type: 'entity',
          label: 'Illustration',
          pluralLabel: 'Illustrations',
          allowMultiple: true,
          labelledBy: 'name',
          selector: {
            id: 'illustration-selector-1',
            type: 'box-selector',
            state: null,
          },
          properties: {
            name: [
              {
                id: 'illustration-name-1',
                type: 'text-field',
                label: 'Name',
                value: '',
              },
            ],
            notes: [
              {
                id: 'illustration-notes-1',
                type: 'text-field',
                label: 'Notes',
                value: '',
                multiline: true,
              },
            ],
          },
        },
      ],
    },
  },
};

const deepModel = {
  document: {
    id: 'deep-root',
    type: 'entity',
    label: 'Deep root',
    properties: {
      sections: [
        {
          id: 'section-1',
          type: 'entity',
          label: 'Section',
          allowMultiple: true,
          labelledBy: 'title',
          properties: {
            title: [
              {
                id: 'section-title-1',
                type: 'text-field',
                label: 'Section title',
                value: '',
              },
            ],
            nested: [
              {
                id: 'nested-1',
                type: 'entity',
                label: 'Nested',
                allowMultiple: false,
                labelledBy: 'inner-name',
                properties: {
                  'inner-name': [
                    {
                      id: 'inner-name-1',
                      type: 'text-field',
                      label: 'Inner name',
                      value: '',
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  },
};

export default {
  title: 'Capture model interactions / Two-level inline entities',
  component: CaptureModelTestHarness,
};

export const TwoLevelInlineNoNavigation = {
  args: {
    captureModel: twoLevelInlineModel,
  },
};

TwoLevelInlineNoNavigation.play = async args => {
  const canvas = within(args.canvasElement);
  await CaptureModelTestHarness.waitForViewer(args);

  await canvas.findByLabelText(
    'Name',
    {
      selector: 'input',
      exact: true,
    },
    { timeout: 3000 }
  );

  expect(canvas.queryByText(/^Prev /)).toBeNull();
  expect(canvas.queryByText(/^Next /)).toBeNull();

  await canvas.findByText(/Define region/i);

  const collapseButtons = await canvas.findAllByRole('button', { name: /Collapse/i });
  await userEvent.click(collapseButtons[0]);

  expect(canvas.queryByLabelText('Name', { selector: 'input', exact: true })).toBeNull();

  const collapsedCard = await canvas.findByText(/No value \(click to edit\)/i);
  await userEvent.click(collapsedCard);

  await canvas.findByLabelText('Name', {
    selector: 'input',
    exact: true,
  });
};

export const DeeperModelsKeepNavigationBehaviour = {
  args: {
    captureModel: deepModel,
  },
};

DeeperModelsKeepNavigationBehaviour.play = async args => {
  const canvas = within(args.canvasElement);
  await CaptureModelTestHarness.waitForViewer(args);

  expect(canvas.queryByLabelText('Inner name', { selector: 'input', exact: true })).toBeNull();

  const openNestedEntity = await canvas.findByText(/No value \(click to edit\)/i);
  await userEvent.click(openNestedEntity);

  await canvas.findByLabelText(
    'Inner name',
    {
      selector: 'input',
      exact: true,
    },
    { timeout: 3000 }
  );
};
