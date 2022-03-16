import { modelFieldsToModelRoot } from '../../../src/frontend/shared/capture-models/utility/model-fields-to-model-root';

describe('modelFieldsToModelRoot', function() {
  test('Simple model', () => {
    expect(modelFieldsToModelRoot([['person', ['firstName', 'lastName']]])).toEqual([{ root: ['person'] }]);
  });
  test('Flat model with no root', () => {
    expect(modelFieldsToModelRoot(['firstName', 'lastName'])).toEqual([]);
  });
  test('Deep model with 2 roots', () => {
    expect(
      modelFieldsToModelRoot([
        //
        [
          'personA',
          ['firstName', 'lastName'],
          //
        ],
        [
          'personB',
          //
          [
            //
            'firstName',
            'lastName',
            ['relative', ['firstName']],
          ],
        ],
      ])
    ).toEqual([
      //
      { root: ['personA'] },
      { root: ['personB'] },
      { root: ['personB', 'relative'] },
    ]);
  });
  test('Simple model (singleLevel=true)', () => {
    expect(modelFieldsToModelRoot([['person', ['firstName', 'lastName']]], { singleLevel: true })).toEqual([
      { root: ['person'] },
    ]);
  });
  test('Simple model, non-root (singleLevel=true)', () => {
    expect(
      modelFieldsToModelRoot(['transcription', ['person', ['firstName', 'lastName']]], { singleLevel: true })
    ).toEqual([]);
  });
  test('Flat model with no root (singleLevel=true)', () => {
    expect(modelFieldsToModelRoot(['firstName', 'lastName'], { singleLevel: true })).toEqual([]);
  });
  test('Deep model with 2 roots (singleLevel=true)', () => {
    expect(
      modelFieldsToModelRoot(
        [
          //
          [
            'personA',
            ['firstName', 'lastName'],
            //
          ],
          [
            'personB',
            //
            [
              //
              'firstName',
              'lastName',
              ['relative', ['firstName']],
            ],
          ],
        ],
        { singleLevel: true }
      )
    ).toEqual([]);
  });
});
