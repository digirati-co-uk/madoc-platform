import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import { CaptureModelTestHarness } from './CaptureModelTestHarness';
// @ts-ignore
import fixture from '../../../fixtures/97-bugs/05-chain.json';

export default { title: 'Capture model interactions / The Chain' };

export const NonInteractive = CaptureModelTestHarness.story({
  captureModel: fixture,
});

export const EnsureAllFieldsInComputedRevision = CaptureModelTestHarness.story({
  captureModel: fixture,
});
EnsureAllFieldsInComputedRevision.play = async args => {
  const canvas = within(args.canvasElement);

  await CaptureModelTestHarness.waitForViewer(args);

  // 1. Fill in one field.
  const DailyChoice = await canvas.findByText('Daily Data');
  await userEvent.click(DailyChoice);

  const Input = await canvas.findByLabelText(
    'Barometer Reading 1',
    {
      selector: 'input',
      exact: true,
    },
    { timeout: 3000 }
  );

  await userEvent.type(Input, 'Test data');

  await CaptureModelTestHarness.publishSubmission(args);

  (await canvas.findByText('Revision list')).click();
  (await canvas.findByText('Edit')).click();

  // Expect 5 inputs.
  await CaptureModelTestHarness.waitForViewer(args);

  const filled = await canvas.findByLabelText<HTMLInputElement>('Barometer Reading 1', { selector: 'input' });
  expect(filled.value).toEqual('Test data');

  expect(
    [
      await canvas.findByLabelText<HTMLInputElement>('Date of Entry (DD/MM/YYYY)', { selector: 'input' }),
      await canvas.findByLabelText<HTMLInputElement>('Barometer reading 2', { selector: 'input' }),
      await canvas.findByLabelText<HTMLInputElement>('Barometer reading 3', { selector: 'input' }),
      await canvas.findByLabelText<HTMLInputElement>('Thermometer reading 1', { selector: 'input' }),
      await canvas.findByLabelText<HTMLInputElement>('Thermometer reading 2', { selector: 'input' }),
      await canvas.findByLabelText<HTMLInputElement>('Thermometer reading 3', { selector: 'input' }),
    ].map(r => r.value)
  ).toEqual(['', '', '', '', '', '']);

  // Now check the COMPUTED variation.

  const computed = await CaptureModelTestHarness.getComputedRevision(args);

  expect(computed.document.properties['Annual Data']).toHaveLength(0);
  expect(computed.document.properties['Daily Data']).toHaveLength(1);
  expect(computed.document.properties['Diary Entry']).toHaveLength(0);
  expect(computed.document.properties['Transcribe Insert']).toHaveLength(0);
  expect(computed.document.properties['Weekly Data']).toHaveLength(0);

  const dailyData: CaptureModel['document'] = computed.document.properties['Daily Data'][0] as any;

  expect(dailyData.type).toEqual('entity');

  // The working one.
  expect(dailyData.properties['8.30']).toHaveLength(1);

  // Failing tests, bug: https://digirati.atlassian.net/browse/MAD-1286
  // expect(dailyData.properties['1:30']).toHaveLength(1);
  // expect(dailyData.properties['6:30']).toHaveLength(1);
  // expect(dailyData.properties['8:30']).toHaveLength(1);
  // expect(dailyData.properties['Date of Entry (DD/MM/YYYY)']).toHaveLength(1);
  // expect(dailyData.properties.Max).toHaveLength(1);
  // expect(dailyData.properties.Min).toHaveLength(1);
  // expect(dailyData.properties['Thermometer reading 3']).toHaveLength(1);
};
