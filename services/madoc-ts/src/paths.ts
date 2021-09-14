import * as path from 'path';

export const ROOT_PATH = process.env.MADOC_ROOT_PATH || `/home/node/app`;

const STORAGE_FILE_DIRECTORY_ENV = process.env.STORAGE_FILE_DIRECTORY || process.env.OMEKA_FILE_DIRECTORY; // @todo deprecate env.

export const SCHEMAS_PATH = path.join(ROOT_PATH, 'schemas');
export const TRANSLATIONS_PATH = path.join(ROOT_PATH, 'translations');
export const THEMES_PATH = process.env.THEME_DIR || path.join(ROOT_PATH, 'themes');
export const FRONTEND_BUNDLE_PATH = path.join(ROOT_PATH, 'lib/frontend');
export const FILES_PATH = STORAGE_FILE_DIRECTORY_ENV || path.join(ROOT_PATH, 'omeka-files');
export const PLUGINS_PATH = path.join(FILES_PATH, 'plugins');
export const JWT_REQUEST_PATH = process.env.JWT_REQUEST_DIR || path.join(ROOT_PATH, 'service-jwts');
export const JWT_RESPONSE_PATH = process.env.JWT_RESPONSE_DIR || path.join(ROOT_PATH, 'service-jwt-responses');
export const OPEN_SSL_KEY_PATH = process.env.MADOC_KEY_PATH || '/openssl-certs/';
export const STORAGE_API_PATH = path.join(FILES_PATH, 'storage-api');
export const MANIFESTS_PATH = path.join(FILES_PATH, 'original/madoc-manifests/');
