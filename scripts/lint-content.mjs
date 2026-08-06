// Content lint for Save My Gig. Runs on the BUILT HTML (what actually ships),
// so it catches copy that comes from data files and components too.
// Run: npm run build && node scripts/lint-content.mjs
//
// Enforces the standing rules:
//  - No em or en dashes in visible copy.
//  - Never claim "no ads" (behaviour, not a promise).
//  - No version/product SNAPSHOTS that go stale. State a threshold or name the
//    models instead. Volatile facts live in src/data/facts.js.
//  - No CONDESCENSION. This site is for working DJs. They may be early in their
//    career, but they are professionals, the way a Formula Ford driver is a
//    professional driver. You do not tell them to stay calm and you do not tell
//    them to try the other deck. Antonio's rule, and it is a positioning rule,
//    not a style preference: copy pitched at a rookie tells every real DJ that
//    this site was built by people who have never stood in a booth, and we lose
//    them on that line and never get them back.
// <script> and <style> blocks and HTML comments are stripped first, so code
// comments do not trip the lint; only rendered copy is checked.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.argv[2] || 'dist';
const SKIP = (p) => p.includes('/preview/') || p.endsWith('/lab.html');

const RULES = [
  { name: 'em/en dash',            re: /[—–]/g },
  { name: '"no ads" claim',        re: /\bno ads?\b|\bad-free\b/gi },
  { name: 'snapshot: latest',      re: /\blatest\b/gi },
  { name: 'snapshot: newest',      re: /\bnewest\b/gi },
  { name: 'snapshot: flagship',    re: /\bflagship\b/gi },
  { name: 'snapshot: current version/firmware/release', re: /current (version|firmware|release)/gi },
  { name: 'snapshot: at the time of writing', re: /at the time of writing/gi },
  { name: 'snapshot: as of <date>', re: /\bas of \d/gi },
  // A counted promise ("the seven rules") breaks the day a rule is added.
  // Antonio's call, 2026-07-27: say "the mandatory rules" and let the page
  // show its own count. Numbers in a list are fine; numbers in a PROMISE rot.
  { name: 'snapshot: counted rules promise', re: /\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d+) rules\b/gi },

  // Condescension. Every one of these has actually shipped on this site.
  { name: 'condescending: telling a pro to calm down', re: /\bstay calm\b|\bdon'?t panic\b|\bdo not panic\b|\bbefore you panic\b|\bbefore panicking\b|\bstop panicking\b|\bpanic not required\b|\bfirst,? breathe\b|\btake a (deep )?breath\b|\brelax,\b/gi },
  /* Reflex-tier instructions. A working DJ has done these before they open a
     website. If one is genuinely needed, name it under a `.assumed` line as
     something we ASSUME is done, do not print it as a step.

     WHAT THIS RULE ACTUALLY GUARDS, AND WHAT IT DOES NOT (settled 2026-08-06,
     after going back to the commit that wrote it, 6f0f967 "Write for DJs who
     are already DJs"). It encodes ONE editorial filter of Antonio's, quoted
     from that commit message:

       "DOES A COMPETENT DJ, MID-PANIC, PLAUSIBLY FAIL TO THINK OF THIS? If
        they would have done it in the first ten seconds on instinct, it does
        not belong on the page."

     Applying that filter is what deleted reseat, the other slot, the other
     player, wiping the contacts and swapping in your own clone from the
     emergency list, replacing all five with a single `.assumed` line. The three
     patterns below are the fragments of the copy that was removed.

     So this is NOT a rule about hedging, vague qualifiers or the "just try
     wiggling it a bit" register, and reading it that way inverts it. "Firmly"
     is not the offence: a precise physical qualifier is the USEFUL part of any
     instruction that survives the filter, and an instruction that survives it
     should be as exact as we can make it. The offence is printing an INSTINCT
     as a STEP at all. Do not narrow this rule to punctuation or register; it is
     about which moves earn a line on a rescue screen.

     ONE SANCTIONED EXCEPTION, NAMED RATHER THAN ACCIDENTAL. The tree's
     `usb/start` node now prints the reseat as a check, because the 2026-08-05
     audit found the screen ASSERTED it had been done while no page on the site
     had ever asked for it, and because reseating firmly and into the second
     slot fixes a large share of real cases at zero risk. That is a deliberate
     partial reversal of the July filter on one screen, on new evidence, and it
     is listed in `allow` below as the exact sentence it is allowed to be.

     Two consequences of doing it this way, both wanted:
      - The pattern got STRICTER, not looser. It used to be evadable by
        punctuation: "push it back in, firmly" slipped past `push it back in
        firmly` on the comma alone, which meant the rule was already not
        enforcing itself and nobody had noticed.
      - Rewording the sanctioned sentence fails the build. That is the point. If
        this copy changes, the exception should be re-argued, not inherited.

     The patterns are English only, as they have been since July, so the pt and
     es mirrors of this sentence are not machine-checked. Their wording is held
     in step by the same-commit mirroring rule and by check-tree, not here. */
  {
    name: 'condescending: reflex-tier step',
    re: /(pull|take) (the|your) (usb|drive|stick) out,? (and )?(wait|count)|push it back in,?\s*firmly|wipe the usb tip/gi,
    allow: ['Pull the drive out and push it back in, firmly. Then try the other slot on the same player.'],
  },
];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}
const files = (await walk(ROOT)).filter((p) => !SKIP(p));
const hits = [];
// The manifest is JSON, not HTML, so the walk below never sees it, and an
// em dash hid in the PWA install dialog's app name until Antonio's browser
// showed it to him ("it's the same as: MADE WITH AI!"). Lint every string
// the manifest ships.
try {
  const mf = await readFile(join(ROOT, 'manifest.webmanifest'), 'utf-8');
  if (/[—–]/.test(mf)) hits.push('manifest.webmanifest: em/en dash in manifest text');
} catch { /* no manifest in this build */ }
/* NO EMOJI IN A CONTROL'S LABEL (added 2026-08-06).
   The design system has said "monochrome stroke icons always" since the
   2026-08-03 polish sprint, and the rescue tunnel and the /gear and
   /files-lost headers were cleaned under that rule the same day. The CTA
   labels were missed, because the emoji lived INSIDE the label string rather
   than in an icon slot, so for three more days the most urgent buttons on the
   site carried a glossy 3D siren, a shield, a plug and a phone next to a
   disciplined 17px stroke set, and /recovery had a yellow warning triangle
   inside a red danger panel. All of them are src/components/Icon.astro now.
   This is the rule that stops the next one, and it is checked on the BUILT
   HTML because that is the only place an emoji added via a data file, an i18n
   catalogue or a component prop becomes visible.

   WHAT COUNTS. Anything in the pictographic planes (U+1F000-U+1FAFF), always,
   plus any BMP symbol explicitly forced to emoji presentation with a
   variation selector (U+FE0F). What does NOT count is a plain monochrome
   glyph: the tunnel's back arrow, the feedback page's tick and the checklist's
   circled-i are all typographic characters that render as text in every font,
   and banning them would be a different rule with a different argument.

   WHERE IT LOOKS. Buttons, anchors styled as buttons, the mobile sticky CTA
   and the rescue tunnel's option pads: everything a DJ taps. Body copy is out
   of scope on purpose, so this cannot start policing prose. */
const EMOJI = /[\u{1F000}-\u{1FAFF}]|[\u{2190}-\u{2BFF}\u{2E00}-\u{2E7F}\u{3000}-\u{303F}]\u{FE0F}/gu;
const CONTROLS = [
  ['button', /<button\b[^>]*>([\s\S]*?)<\/button>/gi],
  ['button-styled link', /<a\b[^>]*class="[^"]*\b(?:btn|sticky-cta)\b[^"]*"[^>]*>([\s\S]*?)<\/a>/gi],
  ['option pad', /<div\b[^>]*class="[^"]*\bpad-title\b[^"]*"[^>]*>([\s\S]*?)<\/div>/gi],
];

for (const f of files) {
  const raw = await readFile(f, 'utf-8');
  const text = visibleText(raw);
  // Whitespace-normalised copy of the page, used only by rules that carry an
  // `allow` list: the sanctioned sentence has to be removable by exact match,
  // and visibleText leaves the markup's own line breaks in place.
  const flat = text.replace(/\s+/g, ' ');
  for (const r of RULES) {
    const subject = r.allow ? r.allow.reduce((s, a) => s.split(a).join(' '), flat) : text;
    const m = subject.match(r.re);
    if (m) hits.push(`${f}: ${r.name} -> ${[...new Set(m)].slice(0, 4).join(', ')}`);
  }
  for (const [what, re] of CONTROLS) {
    for (const m of raw.matchAll(re)) {
      // Group 1 for button/pad, and for the anchor form too: the class
      // alternation is non-capturing so the label is always group 1.
      const label = visibleText(m[1] || '');
      const found = label.match(EMOJI);
      if (found) {
        hits.push(`${f}: emoji in a ${what} label -> ${[...new Set(found)].join(' ')} in ${JSON.stringify(label.trim().replace(/\s+/g, ' ').slice(0, 50))}`);
      }
    }
  }
}
if (hits.length) { console.log('CONTENT LINT FAIL:\n' + hits.join('\n')); process.exit(1); }
console.log(`Content lint PASS (${files.length} pages, 0 violations, ${CONTROLS.length} control kinds checked for emoji)`);
