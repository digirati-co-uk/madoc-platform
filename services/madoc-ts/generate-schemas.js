const { resolve, join } = require('path');
const TJS = require('typescript-json-schema');
const { writeFileSync, readdirSync } = require('fs');
const crypto = require('crypto');
const traverse = require('traverse');

const files = readdirSync(join(__dirname, './src/types/schemas')).map(f => join(__dirname, './src/types/schemas', f));

const program = TJS.getProgramFromFiles(files, {
  baseUrl: './src/types/schemas',
  skipLibCheck: true,
  jsx: 'react',
  esModuleInterop: true,
  typeRoots: ['../../node_modules/@types', 'node_modules/@types'],
  allowSyntheticDefaultImports: true,
});

const generator = TJS.buildGenerator(program, { required: true, noExtraProps: false });

const symbols = generator.getMainFileSymbols(program, files);

const includeRefs = ['BaseTheme', 'ConfigResponse', 'ProjectFull'];

for (const typeName of symbols) {
  console.log('starting... ', typeName);

  const schema = generator.getSchemaForSymbol(typeName, includeRefs.indexOf(typeName) !== -1);

  const definitionKeys = schema.definitions ? Object.keys(schema.definitions) : [];
  const definitionMapping = {};
  let hasOverrides = false;
  for (const definitionKey of definitionKeys) {
    if (definitionKey.indexOf('<') !== -1) {
      definitionMapping[definitionKey] = crypto
        .createHash('md5')
        .update(definitionKey)
        .digest('hex');
      hasOverrides = true;
      schema.definitions[definitionMapping[definitionKey]] = schema.definitions[definitionKey];
      delete schema.definitions[definitionKey];
    }
  }

  if (hasOverrides) {
    traverse(schema).forEach(value => {
      if (value && typeof value.$ref !== 'undefined') {
        const ref = value.$ref.slice('#/definitions/'.length);
        const override = definitionMapping[ref];
        if (override) {
          value.$ref = `#/definitions/${override}`;
        }
      }
    });
  }

  if (schema) {
    writeFileSync(join(resolve(__dirname, 'schemas'), `${typeName}.json`), JSON.stringify(schema, null, 2));
  }
}
