export async function migrate() {
  // @ts-ignore
  const { migrator } = require('../migrate');

  return migrator.up() as any;
}
