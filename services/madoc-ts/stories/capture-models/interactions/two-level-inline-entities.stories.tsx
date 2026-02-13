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

  expect(canvas.queryByText(/^Prev /)).toBeNull();
  expect(canvas.queryByText(/^Next /)).toBeNull();

  const emptyAdd = await canvas.findByRole('button', { name: /\+ Add Illustration/i });
  await userEvent.click(emptyAdd);

  await canvas.findByLabelText(
    'Name',
    {
      selector: 'input',
      exact: true,
    },
    { timeout: 3000 }
  );
  await canvas.findByRole('button', { name: /Add another Illustration/i });
  await canvas.findByText(/Define region/i);

  const initialRemoveButton = await canvas.findByRole('button', { name: /Remove Illustration/i });
  expect(initialRemoveButton.innerHTML).toMatch(/M6 19c0 1\.1/);

  const collapseButtons = await canvas.findAllByRole('button', { name: /Collapse/i });
  await userEvent.click(collapseButtons[0]);

  let collapsedHeader = await canvas.findByTestId('compact-inline-header');
  expect(collapsedHeader.getAttribute('data-has-divider')).toEqual('false');
  expect(canvas.queryByLabelText('Name', { selector: 'input', exact: true })).toBeNull();

  const collapsedCard = await canvas.findByText(/No value \(click to edit\)/i);
  await userEvent.click(collapsedCard);

  await canvas.findByLabelText(
    'Name',
    {
      selector: 'input',
      exact: true,
    },
    { timeout: 3000 }
  );
  collapsedHeader = await canvas.findByTestId('compact-inline-header');
  expect(collapsedHeader.getAttribute('data-has-divider')).toEqual('true');

  const originalConfirm = window.confirm;
  try {
    let confirmCalls = 0;
    (window as any).confirm = () => {
      confirmCalls++;
      return false;
    };

    const removeButton = await canvas.findByRole('button', { name: /Remove Illustration/i });
    await userEvent.click(removeButton);
    expect(confirmCalls).toEqual(1);
    await canvas.findByLabelText('Name', {
      selector: 'input',
      exact: true,
    });
  } finally {
    window.confirm = originalConfirm;
  }
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
