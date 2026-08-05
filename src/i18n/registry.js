/**
 * THE LANGUAGE REGISTRY. One file, one switch.
 *
 * Every language fact lives here so that launch day is flipping `live` to
 * true, not hunting five files for the one that still says the language does
 * not exist. This was specified in the detection spec on 2026-08-03 and is
 * built exactly as specified.
 *
 * WHAT `live: false` MEANS, PRECISELY. It is not cosmetic. While a language
 * is not live:
 *   - its pages render with <meta name="robots" content="noindex,nofollow">
 *   - it is excluded from the sitemap
 *   - NO hreflang alternate is emitted for it on any page, so Google is
 *     never told the translation exists
 *   - browser detection never selects it
 *   - the picker still links to it, so Antonio and reviewers can read every
 *     page in context
 * The translated pages are therefore fully browsable and completely
 * invisible to search engines. That is what "keep them available only for
 * review, do not publish yet" has to mean technically.
 *
 * TO PUBLISH A LANGUAGE: set `live: true`, run the gate, ship. The hreflang
 * alternates, the sitemap entries, the detection and the indexable robots
 * tag all switch on together, which is the only safe order: a page that is
 * indexable before its hreflang exists is a duplicate-content problem.
 */

export const LANGS = [
  {
    code: 'en',
    // BCP 47, for <html lang> and hreflang. Deliberately bare "en": the
    // English site is not US-specific and should serve every English query.
    tag: 'en',
    // og:locale wants the underscore form.
    ogLocale: 'en_US',
    // Shown in the picker, in the language itself. Never "English (US)".
    name: 'English',
    // The URL prefix. Empty for the canonical language, which keeps every
    // existing English URL exactly where it is. Renaming live URLs to /en/
    // would have thrown away every link and ranking the site has.
    prefix: '',
    live: true,
    dir: 'ltr',
  },
  {
    code: 'pt',
    // pt-BR, not pt. The market decision is Brazil specifically: Portugal
    // scores Very High on English proficiency, Brazil scores Low. Declaring
    // pt-BR tells Google to serve this to Brazilian searchers and lets a
    // future European Portuguese version exist without a fight.
    tag: 'pt-BR',
    ogLocale: 'pt_BR',
    name: 'Português',
    prefix: '/pt',
    live: true,
    dir: 'ltr',
  },
  {
    code: 'es',
    // Bare "es", not es-419 and not es-MX. The translation is deliberately
    // neutral Latin American, so it should answer for every Spanish query
    // rather than being scoped to one region. es-419 is poorly supported by
    // search engines in practice and would exclude Spain for no gain.
    tag: 'es',
    ogLocale: 'es_ES',
    name: 'Español',
    prefix: '/es',
    live: true,
    dir: 'ltr',
  },
];

export const DEFAULT_LANG = 'en';

export const byCode = (code) => LANGS.find((l) => l.code === code) || LANGS[0];

/** Languages a visitor or a crawler may actually be sent to. */
export const liveLangs = () => LANGS.filter((l) => l.live);

/** True when at least one translation is published. Gates the whole
 *  detection script: with nothing live there is nothing to detect. */
export const anyTranslationLive = () => liveLangs().some((l) => l.code !== DEFAULT_LANG);

/**
 * WHERE THE TOP-OF-PAGE NOTICE STRIP MUST STAY SILENT.
 *
 * The Emergency Engine's founding rule: nothing competes with the decision on
 * screen. A DJ two minutes from a set does not need a note about translation
 * quality or about which language they landed in.
 *
 * This list used to live inside TranslationNotice.astro. It moved here on
 * 2026-08-05 because there are now TWO strips in that slot (TranslationNotice
 * and LangUndo) plus the wrapper in Base.astro, which has to know whether
 * either of them will render.
 *
 * AND THAT SEARCH TURNED UP A LATENT BUG WORTH RECORDING. The wrapper was being
 * collapsed with `.tx-wrap:empty`, and :empty counts whitespace TEXT NODES.
 * Astro leaves a newline where a top-level `{cond && ...}` expression renders
 * nothing, so `<div class="tx-wrap">` has never actually been empty, not even
 * with one child: the built English homepage contained
 * `<div class="tx-wrap">\n\n</div>`. The selector therefore never matched, and
 * every English page plus every pt/es rescue-tunnel page has been carrying a
 * dead 24px --page-top box under the nav. Measured at 390x844 after removing
 * it: the last homepage door came up 21px on the tightest phone in the gate
 * (iPhone SE slack +120px to +141px) and the fifth /emergency door came up 24px
 * in all three languages (tightest case +41px to +65px).
 * anyNotice() asks the question directly instead, so the wrapper is simply not
 * emitted when neither strip can draw. `.tx-wrap:empty` stays in the CSS as a
 * harmless backstop.
 * One list, three readers, no drift.
 *
 * Paths are ENGLISH canonical paths, matched exactly or as a prefix. Extend the
 * list here rather than adding conditions at any call site.
 */
export const NOTICE_SILENT = ['/emergency', '/protocol', '/saved', '/files-lost', '/card-ready'];

/** True on the pages listed above, where no notice strip may render. */
export const noticeSilent = (path) =>
  NOTICE_SILENT.some((p) => path === p || path.startsWith(p + '/'));

/** True when the notice slot has anything at all to draw, so Base.astro can
 *  leave the wrapper out entirely rather than trusting :empty. */
export const anyNotice = (lang, path) => lang !== DEFAULT_LANG && !noticeSilent(path);

/**
 * Canonical path for a page in a given language.
 * `path` is always the ENGLISH path, e.g. "/checklist". English keeps it
 * unprefixed; the others get their prefix. The root is special-cased so we
 * emit "/pt" rather than "/pt/".
 */
export function localizedPath(path, code) {
  const { prefix } = byCode(code);
  if (!prefix) return path;
  return path === '/' ? prefix : `${prefix}${path}`;
}

/** Strip a known language prefix, giving back the English path. */
export function stripPrefix(path) {
  for (const l of LANGS) {
    if (!l.prefix) continue;
    if (path === l.prefix) return '/';
    if (path.startsWith(l.prefix + '/')) return path.slice(l.prefix.length);
  }
  return path;
}
