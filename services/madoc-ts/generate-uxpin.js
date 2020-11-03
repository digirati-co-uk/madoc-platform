const fs = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');

(async () => {
  const items = await fs.readdir(path.join(__dirname, 'src/frontend/shared/atoms'));
  for (item of items) {
    const fileName = path.basename(item, '.tsx');
    // Create
    const exists = existsSync(path.join(__dirname, `src/uxpin-merge/01-atoms/${fileName}/${fileName}.tsx`));
    if (exists) {
      console.log(`Skipping ${fileName} - already exists`);
      continue;
    }

    await fs.mkdir(`src/uxpin-merge/01-atoms/${fileName}/`);
    await fs.writeFile(
      path.join(__dirname, `src/uxpin-merge/01-atoms/${fileName}/${fileName}.tsx`),
      `import React from 'react';
import { ${fileName} as Original${fileName} } from '../../../frontend/shared/atoms/${fileName}';

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
  }
})();
