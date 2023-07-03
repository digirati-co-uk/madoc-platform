import { build } from "vite";
import chalk from "chalk";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import { existsSync } from "node:fs";
import * as execa from "execa";

const onlyPackage = process.argv[2];

export function defineConfig(options) {

  const replacements = [
    {
      find: /@\/npm\/(.*)/,
      replacement: '@madoc.io/$1',
    }
  ];

  return {
    define: {
      "process.env.NODE_ENV": '"production"',
      "window.__TAURI__": "false",
    },
    resolve: {
      alias: replacements
    },
    build: {
      target: options.isNode ? 'node16': undefined,
      copyPublicDir: false,
      sourcemap: true,
      outDir: options.outDir || `dist/${options.name}`,
      lib: {
        entry: options.entry,
        name: options.globalName,
        formats: options.globalName ? ["umd"] : ["es", "cjs"],
        fileName: (format) => {
          if (format === "umd") {
            return `index.umd.js`;
          }
          if (format === "es") {
            return `esm/${options.name}.mjs`;
          }
          return `${format}/${options.name}.cjs`;
        },
      },
      minify: "terser",
      plugins: [],
      rollupOptions: {
        treeshake: true,
        external: options.external,
        output: {
          globals: options.globals,
          inlineDynamicImports: !!options.globalName,
        },
      },
    },
  };
}


(async () => {
  const NPM = "npm";
  const external = [];

  const sourceDir = "src/npm";
  const distDir = "npm";


  const sources = await readdir(path.join(cwd(), sourceDir));
  for (const source of sources) {
    const pkg = path.basename(source, ".ts");

    if (onlyPackage && pkg !== onlyPackage) {
      continue;
    }

    if (pkg.endsWith(".umd")) {
      continue;
    }

    const npmPath = path.join(cwd(), distDir, pkg);
    const umdPath = path.join(cwd(), sourceDir, `${pkg}.umd.ts`);
    const dist = path.join(npmPath, "dist");
    const distUmd = path.join(npmPath, "dist-umd");
    const packageJson = path.join(npmPath, "package.json");
    const entry = `src/npm/${pkg}.ts`;

    if (
      !existsSync(npmPath) || !existsSync(packageJson)
    ) {
      throw new Error(`Invalid package: ${pkg}`);
    }

    const packageJsonContents = JSON.parse(await readFile(packageJson, "utf-8"));

    const isNode = !!packageJsonContents.nodeDependencies;

    const external = Object.keys(packageJsonContents.dependencies || {});
    if (packageJsonContents.nodeDependencies) {
      external.push(...packageJsonContents.nodeDependencies);
    }
    if (packageJsonContents.peerDependencies) {
      external.push(...Object.keys(packageJsonContents.peerDependencies));
    }

    if (external.includes("react")) {
      external.push("react/jsx-runtime");
    }

    buildMsg(`@madoc.io/${pkg}`);
    await build(
      defineConfig({
        entry: entry,
        name: "index",
        isNode: isNode,
        outDir: dist,
        external: external,
      }),
    );

    if (packageJsonContents.globalName) {
      const umdEntry = existsSync(umdPath) ? umdPath : entry;

      const globals = external.includes("react") ? {
        react: "React",
        "react-dom": "ReactDOM",
      } : {};

      listItem(`Building UMD - ${packageJsonContents.globalName}`);
      listItem(`Entry: ${umdEntry}`);

      const umdExternal = external.includes("react") ? ["react", "react-dom", "react-dom/server"] : [];

      if (external.includes("styled-components")) {
        umdExternal.push("styled-components");
        globals["styled-components"] = "styled";
      }

      if (external.includes('react-router-dom')) {
        umdExternal.push('react-router-dom');
        globals['react-router-dom'] = 'ReactRouterDOM';
      }

      await build(
        defineConfig({
          entry: umdEntry,
          name: "index",
          outDir: distUmd,
          globalName: packageJsonContents.globalName,
          external: umdExternal,
          globals,
        }),
      );
    }

    if (packageJsonContents.types) {
      listItem("Building typescript definitions");
      try {
        await execa("./node_modules/.bin/dts-bundle-generator", [`--out-file=${npmPath}/index.d.ts`, `./${entry}`, "--no-check"]);
      } catch (e) {
        console.log(e.stdout);
        console.error(e.stderr);
        process.exit(1);
      }
    }
  }

  function buildMsg(name) {
    console.log(chalk.grey(`\n\nBuilding ${chalk.blue(name)}\n`));
  }

  function listItem(name) {
    console.log(chalk.gray(`- ${chalk.green(name)}`));
  }
})();
