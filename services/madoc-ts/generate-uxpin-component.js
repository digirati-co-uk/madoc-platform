const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');

const fileName = process.argv[2];
const filePath = process.argv[3];

(async () => {
  // Create
  const exists = existsSync(path.join(__dirname, `src/uxpin-merge/01-atoms/${fileName}/${fileName}.tsx`));
  if (exists) {
    console.log(`Skipping ${fileName} - already exists`);
  }

  await fs.mkdir(`src/uxpin-merge/01-atoms/${fileName}/`);
  await fs.writeFile(
    path.join(__dirname, `src/uxpin-merge/01-atoms/${fileName}/${fileName}.tsx`),
    `import React from 'react';
import { ${fileName} as Original${fileName} } from '../../../frontend/${filePath}/${fileName}';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function ${fileName}(props: Props) {
  return <Original${fileName} {...props} />;
}

export default ${fileName};`
  );
  await fs.mkdir(`src/uxpin-merge/01-atoms/${fileName}/presets/`);
  await fs.writeFile(
    path.join(__dirname, `src/uxpin-merge/01-atoms/${fileName}/presets/0-default.jsx`),
    `import React from 'react';
import ${fileName} from '../${fileName}';

export default (
  <${fileName} uxpId="${fileName}-1">
    Testing merge
  </${fileName}>
);`
  );

  console.log(`Generated ${fileName}`);
})();
