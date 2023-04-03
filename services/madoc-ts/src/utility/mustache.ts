/**
 * Adapted from: https://github.com/aishikaty/tiny-mustache/blob/master/mustache.js
 *
 * - No partials
 * - No HTML dependency
 *
 * @version 0.4.2 */
export function mustache(template: string, self: any, parent?: any, invert?: any) {
  const render = mustache;
  let output = '';
  let i;

  function get(ctx: any, path: any): any {
    path = path.pop ? path : path.split('.');
    ctx = ctx[path.shift()];
    ctx = ctx != null ? ctx : '';
    return 0 in path ? get(ctx, path) : ctx;
  }

  self = Array.isArray(self) ? self : self ? [self] : [];
  self = invert ? (0 in self ? [] : [1]) : self;

  for (i = 0; i < self.length; i++) {
    let childCode = '';
    let depth = 0;
    let inverted: any;
    let ctx = typeof self[i] === 'object' ? self[i] : {};
    ctx = Object.assign({}, parent, ctx);
    ctx[''] = { '': self[i] };

    template.replace(
      /([\s\S]*?)({{((\/)|(\^)|#)(.*?)}}|$)/g,
      // @ts-ignore
      function(
        match,
        code,
        y,
        z,
        close,
        // eslint-disable-next-line no-shadow
        invert,
        name
      ) {
        if (!depth) {
          output += code.replace(/{{{(.*?)}}}|{{(!?)(&?)(>?)(.*?)}}/g, function(
            // eslint-disable-next-line no-shadow
            match: any,
            // eslint-disable-next-line no-shadow
            raw: any,
            // eslint-disable-next-line no-shadow
            comment: any,
            // eslint-disable-next-line no-shadow
            isRaw: any,
            // eslint-disable-next-line no-shadow
            partial: any,
            // eslint-disable-next-line no-shadow
            name: any
          ) {
            return raw
              ? get(ctx, raw)
              : isRaw
              ? get(ctx, name)
              : // Disabled partial.
              // : partial
              // ? render(get(ctx, name), ctx)
              !comment
              ? get(ctx, name)
              : '';
          });
          inverted = invert;
        } else {
          childCode += (depth && !close) || depth > 1 ? match : code;
        }
        if (close) {
          if (!--depth) {
            name = get(ctx, name);
            if (/^f/.test(typeof name)) {
              // eslint-disable-next-line no-shadow
              output += name.call(ctx, childCode, function(template: string) {
                return render(template, ctx);
              });
            } else {
              output += render(childCode, name, ctx, inverted);
            }
            childCode = '';
          }
        } else {
          ++depth;
        }
      }
    );
  }
  return output;
}
