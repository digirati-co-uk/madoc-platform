import * as React from 'react';
import { expect } from '@storybook/jest';
import { CaptureModelTestHarness } from './CaptureModelTestHarness';
import { within, userEvent } from '@storybook/testing-library';
// @ts-ignore
import fixture from '../../../fixtures/01-basic/01-single-field.json';
export default { title: 'Capture model interactions / Basic model interaction', component: CaptureModelTestHarness };

export const StaticModelViewer = CaptureModelTestHarness.story({
  captureModel: fixture,
});

export const TestVisualRendering = CaptureModelTestHarness.story({
  captureModel: fixture,
});

TestVisualRendering.play = async args => {
  const canvas = within(args.canvasElement);

  await CaptureModelTestHarness.waitForViewer(args);

  const Input = await canvas.findByLabelText(
    'Name',
    {
      selector: 'input',
      exact: true,
    },
    { timeout: 3000 }
  );

  expect(Input.getAttribute('name')).toEqual('9a98d760-56a3-4474-8080-346200910907');

  await userEvent.type(Input, ' - automated change', { delay: 100 });

  await CaptureModelTestHarness.publishSubmission(args);

  const RevisionList = await canvas.findByText('Revision list');
  await userEvent.click(RevisionList);

  await canvas.findByText('Forth Road Bridge - automated change');

  const revisions = await CaptureModelTestHarness.getRevisions(args);

  expect(revisions).toHaveLength(2);

  expect(revisions[1].revision.status).toEqual('submitted');
};
