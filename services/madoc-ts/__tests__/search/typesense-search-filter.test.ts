import {
  getTypesenseCollectionFilter,
  getTypesenseResourceTypes,
  getTypesenseSearchFilter,
  resolveTypesenseTabOptions,
} from '../../src/search/typesense/project-filter';

test('enables every Typesense tab and resource type by default', () => {
  const defaults = resolveTypesenseTabOptions();

  expect(defaults).toEqual({
    allResources: true,
    projects: true,
    collections: true,
    manifests: true,
    canvases: true,
  });
  expect(getTypesenseResourceTypes(defaults)).toEqual(['Project', 'Collection', 'Manifest', 'Canvas']);
  expect(getTypesenseSearchFilter()).toBeUndefined();
});

test('uses the legacy manifest-only option as the default for missing Typesense options', () => {
  const legacyManifestOnly = resolveTypesenseTabOptions(undefined, true);

  expect(legacyManifestOnly).toEqual({
    allResources: false,
    projects: false,
    collections: false,
    manifests: true,
    canvases: false,
  });
  expect(getTypesenseSearchFilter(12, getTypesenseResourceTypes(legacyManifestOnly))).toBe(
    'contexts:=`urn:madoc:project:12` && (resource_type:=`Manifest`)'
  );
});

test('combines explicit options with project and browse-navigation constraints', () => {
  const explicitLegacyOverrides = resolveTypesenseTabOptions(
    { allResources: true, projects: true, collections: true, manifests: false, canvases: true },
    true
  );
  expect(explicitLegacyOverrides).toEqual({
    allResources: true,
    projects: true,
    collections: true,
    manifests: false,
    canvases: true,
  });

  const constrained = resolveTypesenseTabOptions({ canvases: false }, false, {
    projectSearch: true,
    allowCollectionNavigation: false,
  });
  expect(getTypesenseResourceTypes(constrained)).toEqual(['Manifest']);
});

test('combines collection, project, and resource type scope', () => {
  expect(getTypesenseCollectionFilter(44)).toBe('contexts:=`urn:madoc:collection:44`');
  expect(getTypesenseCollectionFilter()).toBeUndefined();
  expect(getTypesenseSearchFilter(12, ['Manifest'], 44)).toBe(
    'contexts:=`urn:madoc:project:12` && contexts:=`urn:madoc:collection:44` && (resource_type:=`Manifest`)'
  );
});
