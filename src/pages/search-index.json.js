/**
 * Build-time search index.
 *
 * Static site, so there is no server to query. Instead every indexable page is
 * read at build time and reduced to a small JSON record. The whole index is a
 * few KB, fetched once on first keystroke and cached, so search is instant and
 * costs nothing to run.
 *
 * Collapsed <details> content is included deliberately: a DJ searching
 * "FAT32 not in the list" must find the answer even though it sits inside a
 * closed section on the page.
 */
const PAGES = import.meta.glob('./**/*.astro', { query: '?raw', import: 'default', eager: true });

const EXCLUDE = ['/protocol/', '/saved', '/files-lost', '/card-ready', '/feedback', '/legal/privacy', '/legal/terms', '/legal/cookies', '/partners', '/404', '/search'];

function routeOf(file) {
  let r = file.replace(/^\.\//, '/').replace(/\.astro$/, '');
  if (r.endsWith('/index')) r = r.slice(0, -6) || '/';
  return r;
}

const pick = (src, re) => { const m = src.match(re); return m ? m[1].trim() : ''; };

function textOf(src) {
  // strip frontmatter, script, style, then tags, then collapse whitespace
  let s = src.replace(/^---[\s\S]*?---/, '')
             .replace(/<script[\s\S]*?<\/script>/g, '')
             .replace(/<style[\s\S]*?<\/style>/g, '')
             .replace(/\{[^{}]*\}/g, ' ')
             .replace(/<[^>]+>/g, ' ')
             .replace(/&[a-z]+;/g, ' ')
             .replace(/\s+/g, ' ')
             .trim();
  return s.slice(0, 1400);
}

export async function GET() {
  const docs = [];
  for (const [file, src] of Object.entries(PAGES)) {
    const route = routeOf(file);
    if (EXCLUDE.some((x) => route === x || route.startsWith(x))) continue;
    if (/noindex/.test(src)) continue;
    const title = pick(src, /title="([^"]+)"/);
    const desc = pick(src, /description="([^"]+)"/);
    // the questions on expandable sections are strong search targets
    const qs = [...src.matchAll(/\sq="([^"]+)"/g)].map((m) => m[1]);
    const heads = [...src.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    docs.push({
      u: route,
      t: title.replace(/\s*\|\s*Save My Gig!?\s*$/i, '').trim(),
      d: desc,
      h: [...qs, ...heads].slice(0, 14),
      b: textOf(src),
    });
  }
  return new Response(JSON.stringify(docs), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });
}
