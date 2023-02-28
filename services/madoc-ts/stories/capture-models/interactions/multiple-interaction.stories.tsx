import * as React from 'react';
import { expect } from '@storybook/jest';
import { CaptureModelTestHarness } from './CaptureModelTestHarness';
import { within, userEvent } from '@storybook/testing-library';
// @ts-ignore
import fixture from '../../../fixtures/04-selectors/02-multiple-selectors.json';
export default { title: 'Capture model interactions / multiple region', component: CaptureModelTestHarness };

export const StaticModelViewer = CaptureModelTestHarness.story({
  captureModel: fixture,
});

export const TestDefineRegion = CaptureModelTestHarness.story({
  captureModel: fixture,
});

TestDefineRegion.play = async args => {
  const canvas = within(args.canvasElement);

  await CaptureModelTestHarness.waitForViewer(args);

  const Input1 = await canvas.getByRole('textbox', {
    name: /First name The name of the thing/,
  });
  await userEvent.type(Input1, 'Admi', { delay: 100 });

  const Input2 = await canvas.getByRole('textbox', {
    name: /Last name The last name of the thing/,
  });
  await userEvent.type(Input2, 'McAdmin', { delay: 100 });

  await CaptureModelTestHarness.publishSubmission(args);

  const RevisionList = await canvas.findByText('Revision list');
  await userEvent.click(RevisionList);

  const revisions = await CaptureModelTestHarness.getRevisions(args);
  expect(revisions[1].revision.status).toEqual('submitted');
  expect(revisions[1].revision.fields).toHaveLength(2);

  //edit it
  const EditBtn = await canvas.getByRole('button', {
    name: /Edit/,
  });
  await userEvent.click(EditBtn);

  const Input1a = await canvas.getByRole('textbox', {
    name: /First name The name of the thing/,
  });
  await userEvent.type(Input1a, 'n', { delay: 100 });
  await CaptureModelTestHarness.publishSubmission(args);

  await userEvent.click(RevisionList);

  // should be changed field
  const Field = await canvas.findByText('Admin');
  expect(Field);
};
