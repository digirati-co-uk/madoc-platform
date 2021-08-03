import { getSpecificity } from '../src/database/queries/site-editorial';

describe('Slot specificity', () => {
  test('project specificity none=true', () => {
    expect(
      getSpecificity({
        project: {
          none: true,
        },
      })
    ).toEqual(0);
  });

  test('project specificity all=true', () => {
    expect(
      getSpecificity({
        project: {
          all: true,
        },
      })
    ).toEqual(1);
  });

  test('canvas and project together', () => {
    expect(
      getSpecificity({
        project: {
          all: true,
        },
        canvas: {
          exact: 123,
        },
      })
    ).toEqual(4001);
  });

  test('all items together', () => {
    expect(
      getSpecificity({
        project: {
          all: true,
        },
        collection: {
          all: true,
        },
        manifest: {
          whitelist: [1],
        },
        canvas: {
          exact: 123,
        },
      })
    ).toEqual(4311);
  });
});
