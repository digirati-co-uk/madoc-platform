import defaultConfig from '../config.json';
import { ProjectConfiguration } from '../src/types/schemas/project-configuration';
import { migrateConfig } from '../src/utility/config-migrations';

describe('Configuration migration', () => {
  const siteConfig = defaultConfig.defaultSiteConfiguration as ProjectConfiguration;

  test('the conversion does not lose any fields', () => {
    const v2 = migrateConfig.version1to2(siteConfig);
    const { shadow, _version, _source, ...v1 } = migrateConfig.version2to1(v2);

    expect(v1).toEqual({
      ...siteConfig,
      typesenseOptions: {
        allResources: true,
        projects: true,
        collections: true,
        manifests: true,
        canvases: true,
      },
    });
    expect(shadow).toBeUndefined();
    expect(_version).toBe(1);
    expect(_source).toBeUndefined();
  });

  test('editor resizing can be disabled per project', () => {
    const config = {
      ...siteConfig,
      modelPageOptions: {
        ...siteConfig.modelPageOptions,
        enableEditorResizing: false,
      },
    };

    expect(migrateConfig.version2to1(migrateConfig.version1to2(config)).modelPageOptions?.enableEditorResizing).toBe(
      false
    );
  });
});
