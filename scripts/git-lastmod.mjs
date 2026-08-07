/*
 * REAL PER-PAGE lastmod FOR THE SITEMAP.
 *
 * The sitemap stamped every one of its 111 URLs with the BUILD timestamp, which
 * is worse than having no dates at all: a sitemap where /legal and a fix article
 * rewritten this morning claim the same lastmod, and where all 111 change on a
 * build that touched one file, teaches Google that this site's dates carry no
 * information. Google says so explicitly, and then ignores the field.
 *
 * So the date comes from git: the last commit that touched the page's own source
 * file, or the DATA the page is generated from, whichever is later.
 *
 *   THE DATA FILES ARE INCLUDED and the layouts and components are NOT, and that
 *   split is the whole design. lastmod means "when did what a reader sees on THIS
 *   url last change". A rescue screen is a rendering of src/data/emergency-tree.js
 *   and /checklist is a rendering of src/data/checklist.js, so editing the tree
 *   genuinely changes those pages and must move their dates. Base.astro, on the
 *   other hand, is on all 111: counting it would put every page back on one
 *   shared timestamp, which is the bug this file exists to remove. Same for
 *   global.css. A footer tweak is not a content update and should not claim to be.
 *
 * ONE `git log` PROCESS, not one per file. A --name-only walk of the whole
 * history is a single spawn and gives the first (most recent) date each path
 * appears at, which is exactly the per-file answer, for every file at once.
 *
 * FALLBACK IS THE BUILD TIME, per page and silently. A file with no history is
 * either genuinely new in this working tree or the build is running somewhere
 * git cannot answer, and in both cases "now" is the best available truth and a
 * missing lastmod would be worse. Note for whoever debugs this on the host: a
 * SHALLOW clone (git clone --depth 1, which some CI providers still default to)
 * has only one commit, so every file resolves to that one date and the output
 * degenerates back to a single shared timestamp. It does not break the build and
 * it does not break the sitemap, but the freshness signal is gone. If that is
 * ever what production looks like, the fix is on the host, not here.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const PAGES = join(ROOT, 'src', 'pages');

/** path (repo-relative, POSIX) -> ISO date of the last commit touching it. */
function historyByPath() {
  const map = new Map();
  let out;
  try {
    out = execFileSync('git', ['log', '--no-merges', '--date-order', '--format=%x00%cI', '--name-only'], {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return map; // no git, no history: every page falls back to build time
  }
  let when = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('\u0000')) { when = line.slice(1).trim(); continue; }
    const p = line.trim();
    // First sighting wins: git log is newest-first, so that is the last commit
    // that touched the path.
    if (p && when && !map.has(p)) map.set(p, when);
  }
  return map;
}

/** The data modules a page renders from, one level deep, src/data only. */
function dataDepsOf(file) {
  let src;
  try { src = readFileSync(file, 'utf8'); } catch { return []; }
  const deps = [];
  // Only the frontmatter matters, and only static imports; a query suffix like
  // ?raw is stripped so an svg-as-string import still resolves to a real file.
  const re = /^\s*import\s[^;]*?from\s+['"]([^'"]+)['"]/gm;
  let m;
  while ((m = re.exec(src))) {
    const spec = m[1].split('?')[0];
    if (!spec.startsWith('.')) continue;
    const abs = resolve(dirname(file), spec);
    if (!abs.startsWith(join(ROOT, 'src', 'data'))) continue;
    if (existsSync(abs)) deps.push(abs);
  }
  return deps;
}

/** URL path -> the .astro file that renders it, dynamic routes included. */
function sourceFor(path) {
  const clean = path === '/' ? '' : path.replace(/\/$/, '');
  const direct = [join(PAGES, `${clean}.astro`), join(PAGES, clean, 'index.astro')];
  for (const c of direct) if (existsSync(c)) return c;
  // A dynamic route: walk up the segments looking for the [...slug] file that
  // owns this branch. /protocol/usb/start -> src/pages/protocol/[...slug].astro
  const segs = clean.split('/').filter(Boolean);
  for (let i = segs.length; i > 0; i--) {
    const dir = join(PAGES, ...segs.slice(0, i - 1));
    const cand = join(dir, '[...slug].astro');
    if (existsSync(cand)) return cand;
  }
  return null;
}

/**
 * Returns lastmod(urlPath) -> ISO string. `fallback` is used for any page whose
 * source, or whose git history, cannot be found.
 */
/**
 * IS THIS A SHALLOW CLONE, AND DID THE DATES DEGENERATE (2026-08-07).
 *
 * The header note above has always warned that `git clone --depth 1` gives every
 * file the same single commit date, which silently collapses all 111 per-page
 * dates into one and throws away the whole point of this file. The warning was
 * there. NOTHING CHECKED IT, and the check has to run where the risk lives.
 *
 * It lives on Cloudflare, not here. Every claim that per-page dates "work" was
 * measured on a local dist built from a full clone, which is precisely the
 * local-versus-production mistake this project has a standing rule about. What
 * triggered writing this: production served a sitemap index dated exactly the
 * HEAD commit's timestamp, which is the signature of a shallow clone, while the
 * same build here produced a different and correct date.
 *
 * So the build log now says which it got. Loud, and on every build, because a
 * build log nobody reads is still better than a silent regression, and this is
 * the only place production can be observed without a browser.
 *
 * It does NOT fail the build. A degraded freshness signal is not worth blocking
 * a deploy over, and failing here would take the site down for an SEO nicety.
 */
function reportHealth(history, dates) {
  let shallow = false;
  try {
    shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
      cwd: ROOT, encoding: 'utf8',
    }).trim() === 'true';
  } catch { /* no git: the fallback path already covers it */ }

  const distinct = new Set(dates).size;
  const label = `lastmod: ${dates.length} pages, ${distinct} distinct date(s), ` +
    `${history.size} paths in history, shallow=${shallow}`;

  if (shallow || (dates.length > 10 && distinct <= 1)) {
    console.warn(
      `\n  WARNING  ${label}\n` +
      '  Every page is about to claim the same lastmod, so the sitemap carries no\n' +
      '  freshness signal at all. Cause is almost always a shallow clone on the\n' +
      '  build host (git clone --depth 1), which leaves one commit for git log to\n' +
      '  find. The fix is on the HOST, not in this file: give the build a full\n' +
      '  clone, or run `git fetch --unshallow` before `astro build`.\n'
    );
  } else {
    console.log(`  ${label}`);
  }
}

export function makeLastmod(fallback) {
  const history = historyByPath();
  const cache = new Map();
  const issued = [];
  const dateOf = (abs) => history.get(relative(ROOT, abs).split('\\').join('/'));
  const issue = (path) => {
    if (cache.has(path)) return cache.get(path);
    let answer = fallback;
    const file = sourceFor(path);
    if (file) {
      const dates = [file, ...dataDepsOf(file)].map(dateOf).filter(Boolean);
      // Latest wins: a page is as fresh as the freshest thing it renders.
      if (dates.length) answer = dates.sort()[dates.length - 1];
    }
    cache.set(path, answer);
    issued.push(answer);
    return answer;
  };

  // REPORTED ON EXIT, not from a call site in astro.config.mjs. The sitemap
  // integration serializes pages inside its own build hook, so there is no
  // moment in the config where "all the dates have been issued" is knowable.
  // Process exit is that moment, it needs no cooperation from Astro's
  // internals, and it cannot be forgotten by whoever edits the config next.
  process.on('exit', () => {
    if (issued.length) reportHealth(history, issued);
  });

  return issue;
}
