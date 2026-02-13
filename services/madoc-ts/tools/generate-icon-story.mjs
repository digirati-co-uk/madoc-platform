#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(projectRoot, 'src');
const outputFile = path.join(projectRoot, 'stories/components/generated-icons.stories.tsx');

async function walk(dir) {
  const dirEntries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of dirEntries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

function escapeForSingleQuote(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function parseNamedExports(source) {
  const names = new Set();

  const declarationPattern = /export\s+(?:const|function|class)\s+([A-Za-z_][A-Za-z0-9_]*)/g;
  for (const match of source.matchAll(declarationPattern)) {
    const name = match[1];
    if (name && /^[A-Z]/.test(name)) {
      names.add(name);
    }
  }

  const exportListPattern = /export\s*{([^}]+)}/g;
  for (const match of source.matchAll(exportListPattern)) {
    const section = match[1] || '';
    const parts = section
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      const aliasMatch = part.match(/\s+as\s+([A-Za-z_][A-Za-z0-9_]*)$/);
      const originalMatch = part.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
      const name = aliasMatch ? aliasMatch[1] : originalMatch ? originalMatch[1] : null;
      if (name && /^[A-Z]/.test(name)) {
        names.add(name);
      }
    }
  }

  return [...names];
}

async function main() {
  const allFiles = await walk(srcRoot);
  const iconFiles = allFiles
    .filter(file => /[\\/]icons[\\/].*Icon\.tsx$/.test(file))
    .sort((a, b) => a.localeCompare(b));

  const iconEntries = [];
  const skippedFiles = [];

  for (const filePath of iconFiles) {
    const source = await fs.readFile(filePath, 'utf8');
    const fileBase = path.basename(filePath, '.tsx');
    const aliasedImportPath = path
      .relative(srcRoot, filePath)
      .replace(/\\/g, '/')
      .replace(/\.tsx$/, '');
    const importPath = `@/${aliasedImportPath}`;

    const namedExports = parseNamedExports(source);
    const hasDefaultExport = /export\s+default\b/.test(source);

    if (!namedExports.length && !hasDefaultExport) {
      skippedFiles.push(path.relative(projectRoot, filePath));
      continue;
    }

    for (const name of namedExports) {
      iconEntries.push({
        source: importPath,
        componentName: name,
        importLine: `import { ${name} } from '${importPath}';`,
        importType: 'named',
      });
    }

    if (hasDefaultExport && !namedExports.length) {
      iconEntries.push({
        source: importPath,
        componentName: fileBase,
        importLine: `import ${fileBase} from '${importPath}';`,
        importType: 'default',
      });
    }
  }

  iconEntries.sort((a, b) => a.componentName.localeCompare(b.componentName));

  const importMap = new Map();
  for (const entry of iconEntries) {
    const existing = importMap.get(entry.source) || { defaultName: null, named: new Set() };
    if (entry.importType === 'default') {
      existing.defaultName = entry.componentName;
    } else {
      existing.named.add(entry.componentName);
    }
    importMap.set(entry.source, existing);
  }

  const importStatements = [...importMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([source, spec]) => {
      const named = [...spec.named].sort((a, b) => a.localeCompare(b));
      if (spec.defaultName && named.length) {
        return `import ${spec.defaultName}, { ${named.join(', ')} } from '${source}';`;
      }
      if (spec.defaultName) {
        return `import ${spec.defaultName} from '${source}';`;
      }
      return `import { ${named.join(', ')} } from '${source}';`;
    });

  const iconRows = iconEntries.map(
    entry => `  {
    name: '${escapeForSingleQuote(entry.componentName)}',
    component: ${entry.componentName},
    importLine: '${escapeForSingleQuote(entry.importLine)}',
  }`
  );

  const generated = `import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
${importStatements.join('\n')}

const icons = [
${iconRows.join(',\n')}
] as const;

const meta: Meta = {
  title: 'components / icons (Generated)',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

const iconPreviewProps = {
  width: '1.35em',
  height: '1.35em',
  title: 'icon',
  className: 'generated-icon',
} as const;

export const AllIcons: Story = {
  render: () => {
    return (
      <div style={{ padding: '1rem', background: '#f7f7f7' }}>
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          }}
        >
          {icons.map(icon => {
            const Icon = icon.component as any;
            return (
              <div
                key={icon.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px minmax(0, 1fr)',
                  gap: '0.75rem',
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  background: '#fff',
                  padding: '0.65rem',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 4,
                    border: '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#111',
                  }}
                >
                  {React.createElement(Icon, iconPreviewProps)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 4 }}>{icon.name}</div>
                  <code
                    style={{
                      display: 'block',
                      fontSize: '0.74rem',
                      lineHeight: 1.25,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      color: '#334155',
                    }}
                  >
                    {icon.importLine}
                  </code>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
};
`;

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, generated);

  console.log(`Generated ${path.relative(projectRoot, outputFile)} with ${iconEntries.length} icon entries from ${iconFiles.length} files.`);
  if (skippedFiles.length) {
    console.log(`Skipped ${skippedFiles.length} files with no exported components:`);
    for (const skippedFile of skippedFiles) {
      console.log(`- ${skippedFile}`);
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
