const { resolve, join } = require('path');
const TJS = require('typescript-json-schema');
const { writeFileSync, readdirSync } = require('fs');

const files = readdirSync(join(__dirname, './src/types/schemas')).map(f => join(__dirname, './src/types/schemas', f));

const program = TJS.getProgramFromFiles(files, {
  baseUrl: './src/types/schemas',
  skipLibCheck: true,
});

const generator = TJS.buildGenerator(program, {});

const symbols = generator.getMainFileSymbols(program, files);

for (const typeName of symbols) {
  const schema = TJS.generateSchema(program, typeName, { required: true, noExtraProps: true });
  if (schema) {
    writeFileSync(join(resolve(__dirname, 'schemas'), `${typeName}.json`), JSON.stringify(schema, null, 2));
  }
}
