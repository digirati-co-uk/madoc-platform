import * as React from 'react';
import { expect } from '@storybook/test';
import { CaptureModelTestHarness } from './CaptureModelTestHarness';
import { within, userEvent } from '@storybook/test';
// @ts-ignore
import fixture from '../../../fixtures/04-selectors/05-wunder-selector.json';
export default { title: 'Capture model interactions / Remove region', component: CaptureModelTestHarness };

export const StaticModelViewer = CaptureModelTestHarness.story({
  captureModel: fixture,
});

export const TestDefineRegion = CaptureModelTestHarness.story({
  captureModel: fixture,
});

TestDefineRegion.play = async args => {
  const canvas = within(args.canvasElement);

  await CaptureModelTestHarness.waitForViewer(args);

  const DefineRegion = await canvas.findByText('Define region');
  await userEvent.click(DefineRegion);

  const Preview = await canvas.findByRole('img');
  await Preview;
  expect(Preview).toHaveAccessibleName('You selected a region at 164, 235, 2199, 771');

  const DiscardBtn = await canvas.findByText('discard selection');
  await userEvent.click(DiscardBtn);

  await CaptureModelTestHarness.publishSubmission(args);

  const RevisionList = await canvas.findByText('Revision list');
  await userEvent.click(RevisionList);

  const revisions = await CaptureModelTestHarness.getRevisions(args);
  expect(revisions).toHaveLength(2);
};
