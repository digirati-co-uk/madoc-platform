import { RouteMiddleware } from '../../types/route-middleware';
import { mysql } from '../../utility/mysql';

type PageBlockRow = {
  page_title: string;
  page_created: Date;
  page_modified: Date;
  layout: string;
  data: string;
  position: number;
};

export const sitePage: RouteMiddleware<{ slug: string; pageSlug: string }> = async context => {
  const { slug, pageSlug } = context.params;

  const rows: PageBlockRow[] = await new Promise(resolve =>
    context.mysql.query(
      mysql`
      select
          page.title as page_title,
          page.created as page_created,
          page.modified as page_modified,
          block.layout,
          block.data,
          block.position
      from site_page page
          left join site_page_block block on page.id = block.page_id
          left join site on page.site_id = site.id
      where site.slug = ${slug} 
        and page.slug = ${pageSlug}
      order by block.position
  `,
      (err, results) => {
        resolve(results);
      }
    )
  );

  context.response.body = rows.reduce(
    (state, row) => {
      if (row.page_title && !state.title) {
        state.title = row.page_title;
      }

      state.blocks.push({
        layout: row.layout,
        data: JSON.parse(row.data),
      });

      return state;
    },
    {
      title: '',
      blocks: [],
    } as {
      title: string;
      blocks: Array<{ layout: string; data: any }>;
    }
  );
};
