/** @jest-environment node */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const TRANSLATIONS = join(__dirname, '../../translations');

function translationFiles(): string[] {
  return readdirSync(TRANSLATIONS)
    .filter(language => statSync(join(TRANSLATIONS, language)).isDirectory())
    .flatMap(language =>
      readdirSync(join(TRANSLATIONS, language))
        .filter(file => file.endsWith('.json'))
        .map(file => join(language, file))
    );
}

// The admin localisation screen uses en/*.json as the list of keys it will save. If a file
// stops parsing, every translation saved for that namespace is silently discarded.
describe('translation files', () => {
  test.each(translationFiles())('%s is valid JSON', file => {
    expect(() => JSON.parse(readFileSync(join(TRANSLATIONS, file), 'utf-8'))).not.toThrow();
  });
});
