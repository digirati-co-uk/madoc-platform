import { sql } from 'slonik';
import { mapPage } from '../../database/queries/site-editorial';
import { RouteMiddleware } from '../../types/route-middleware';
import { SitePage } from '../../types/schemas/site-page';
import { userWithScope } from '../../utility/user-with-scope';

function getPageNavigationQuery(siteId: number, pagePath?: string) {
  const parentPage = pagePath ? sql`parent.path = ${`/${pagePath}`}` : sql`page.parent_page is null`;

  return sql`
    select
      -- Main page
      page.id as page__id,
      page.path as page__path,
      page.title as page__title,
      page.navigation_title as page__navigation_title,
      page.parent_page as page__parent_page,
      -- Child page
      csp.id as child__id,
      csp.path as child__path,
      csp.title as child__title,
      csp.navigation_title as child__navigation_title,
      csp.parent_page as child__parent_page
    from site_pages page
             left join site_pages csp on csp.parent_page = page.id and csp.hide_from_navigation = false and csp.site_id = 1
             left join site_pages parent on parent.id = page.parent_page and parent.site_id = 1
    where ${parentPage}
      and page.hide_from_navigation = false
      and page.site_id = 1
  `;
}

export const getPageNavigation: RouteMiddleware<{ paths?: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const paths = context.params.paths;

  const result = await context.connection.any(getPageNavigationQuery(siteId, paths));

  const pages = result.map(page => mapPage(page as any, 'page__'));
  const childPages = result.map(page => mapPage(page as any, 'child__' as any));

  const pageMap: { [id: number]: SitePage } = {};
  for (const page of pages) {
    pageMap[page.id] = page;
  }

  for (const child of childPages) {
    const parentPage = child.parentPage ? pageMap[child.parentPage] : undefined;
    if (parentPage) {
      parentPage.subpages = parentPage.subpages ? parentPage.subpages : [];
      (parentPage.subpages as any[]).push(child);
    }
  }

  context.response.body = {
    navigation: pages,
  };
};
