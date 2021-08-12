import send from 'koa-send';
import { RouteMiddleware } from '../../types/route-middleware';
import { ThemeListItem } from '../../types/themes';
import { NotFound } from '../../utility/errors/not-found';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';

export const listThemes: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const themes: ThemeListItem[] = [];
  const diskThemes = await context.themes.getDiskThemes();
  const allThemes = await context.themes.listThemes();
  const siteTheme = await context.themes.getSiteTheme(siteId);

  const diskKeys = Object.keys(diskThemes);
  const dbKeys = [];

  for (const theme of allThemes) {
    const onDisk = diskThemes[theme.theme_id];
    // Push each theme.
    themes.push(context.themes.mapTheme(theme, { onDisk: !!onDisk, siteTheme }));
    // Keep track of keys.
    dbKeys.push(theme.theme_id);
  }

  for (const diskKey of diskKeys) {
    if (dbKeys.indexOf(diskKey) === -1) {
      // We have an uninstalled theme.
      const diskTheme = diskThemes[diskKey];
      themes.push(context.themes.mapDiskTheme(diskTheme));
    }
  }

  context.response.body = {
    themes,
  };
};

export const installTheme: RouteMiddleware<{ theme_id: string }> = async context => {
  userWithScope(context, ['site.admin']);

  const diskTheme = await context.themes.getDiskTheme(context.params.theme_id);
  if (!diskTheme) {
    throw new NotFound('Theme not found');
  }

  const theme = await context.themes.installTheme(diskTheme);

  context.response.body = {
    theme: context.themes.mapTheme(theme, { onDisk: true }),
  };
};

export const enableTheme: RouteMiddleware<{ theme_id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const theme = await context.themes.getTheme(context.params.theme_id);

  if (!theme) {
    throw new RequestError('Theme not found');
  }

  await context.themes.setSiteTheme(theme.theme_id, siteId);

  context.response.status = 200;
};

export const disableTheme: RouteMiddleware<{ theme_id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const theme = await context.themes.getTheme(context.params.theme_id);

  if (!theme) {
    throw new RequestError('Theme not found');
  }

  await context.themes.unsetSiteTheme(theme.theme_id, siteId);

  context.response.status = 200;
};

export const uninstallTheme: RouteMiddleware<{ theme_id: string }> = async context => {
  userWithScope(context, ['site.admin']);
  // Check if any sites are using
  // Remove from database.
  await context.themes.deleteTheme(context.params.theme_id);

  context.response.status = 200;
};

export const serveThemeAsset: RouteMiddleware<{ theme_id: string; bundleName: string }> = async (context, next) => {
  if ((context.params.bundleName || '').match(/\.\./)) {
    context.status = 404;
    return;
  }

  const assets = await context.themes.getAssetPath(context.params.theme_id, context.params.bundleName);

  if (!assets) {
    context.status = 404;
    return;
  }

  await send(context, context.params.bundleName, { root: assets.assetDirectory });
};
