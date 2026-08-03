/*
 * THE CONCEPT REGISTRY. One place that answers a single question:
 * "if I mention this on the site, where should it send the reader?"
 *
 * Antonio's rule (2026-08-03), and the whole reason this file exists:
 *
 *   PRODUCTS  (players, mixers, controllers, software) ALWAYS resolve to
 *             their own product or software page. A product is a thing you
 *             own and look up repeatedly; it earns a page and should never
 *             be answered with a dictionary line.
 *
 *   CONCEPTS  (technologies, file systems, terminology) resolve to their
 *             DICTIONARY ANCHOR, unless a fuller article exists, in which
 *             case the article wins because it is the better destination.
 *
 * That distinction is expressed as data, not judgement at the call site, so
 * every link in the site resolves the same way automatically. The intended
 * shape is a knowledge graph: concept to product, product to guide, guide
 * back to concept, without the reader feeling moved off their topic.
 *
 * HOW TO ADD SOMETHING
 *   Product: { key, kind: 'product', label, page, aliases? }
 *   Concept: { key, kind: 'concept', label, anchor, article?, aliases? }
 *   A concept with no `article` resolves to /knowledge/dictionary#<anchor>.
 *   Give it an `article` later and every link on the site follows, with no
 *   other edit anywhere. That is the point of the file.
 *
 * `aliases` are the other ways the same idea is written in copy. Nothing
 * consumes them yet: they exist so that IF we later automate first-mention
 * linking, the matcher has the vocabulary and we are not rewriting this file.
 * Antonio's steer is that linking stays intelligent rather than automatic,
 * editorial for now, so today this registry is used by hand and validated by
 * the gate.
 *
 * GUARDRAIL: scripts/check-concepts.mjs fails the build if any destination
 * here does not resolve in the built site, including the #anchor. A renamed
 * dictionary term or a moved page cannot rot these links silently.
 */

export const DICTIONARY = '/knowledge/dictionary';

export const CONCEPTS = [
  // ---------------------------------------------------------------- PRODUCTS
  // Every one of these has a real page. They never point at the dictionary,
  // even where the dictionary also mentions them.
  { key: 'cdj-3000x', kind: 'product', label: 'CDJ-3000X', page: '/knowledge/pioneer-dj/cdj-3000x', aliases: ['CDJ 3000X'] },
  { key: 'cdj-3000', kind: 'product', label: 'CDJ-3000', page: '/knowledge/pioneer-dj/cdj-3000', aliases: ['CDJ 3000'] },
  { key: 'cdj-2000nxs2', kind: 'product', label: 'CDJ-2000NXS2', page: '/knowledge/pioneer-dj/cdj-2000nxs2', aliases: ['CDJ 2000NXS2', 'CDJ-2000 NXS2'] },
  { key: 'djm-900nxs2', kind: 'product', label: 'DJM-900NXS2', page: '/knowledge/pioneer-dj/djm-900nxs2', aliases: ['DJM 900NXS2'] },
  { key: 'djm-a9', kind: 'product', label: 'DJM-A9', page: '/knowledge/pioneer-dj/djm-a9', aliases: ['DJM A9'] },
  { key: 'djm-v10', kind: 'product', label: 'DJM-V10', page: '/knowledge/pioneer-dj/djm-v10', aliases: ['DJM V10', 'DJM-V10-LF'] },
  { key: 'rekordbox', kind: 'product', label: 'rekordbox', page: '/knowledge/pioneer-dj/rekordbox', aliases: ['Rekordbox'] },
  { key: 'djm-rec', kind: 'product', label: 'DJM-REC', page: '/knowledge/pioneer-dj/djm-rec', aliases: ['DJM REC'] },
  { key: 'firmware-matrix', kind: 'product', label: 'firmware issues by version', page: '/knowledge/pioneer-dj/firmware' },

  // ---------------------------------------------------------------- CONCEPTS
  // WITH a fuller article: the article wins over the dictionary line.
  //
  // REFINEMENT 2026-08-03 (Antonio). "The article wins" is right, but only
  // when the article ANSWERS THE QUESTION THE CLICK ASKED. A reader who taps
  // MBR is asking "what is this?", and /fix/format-usb-for-cdj never tells
  // them: it is a procedure that USES MBR. They would land on a how-to and
  // still not know the word. His ruling: "we will not have a dedicated page
  // just to talk about FAT32 or MBR, it's somewhere there in the dictionary.
  // If you see those words and click, it should go straight to the
  // dictionary."
  // So the test is now: does the destination DEFINE the concept, or merely
  // use it? Define, the article wins. Use, the dictionary wins.
  //   fat32  -> dictionary. The exFAT vs FAT32 article compares them for a
  //             decision; it does not define the file system.
  //   mbr    -> dictionary. See above, a formatting walkthrough.
  //   exfat  -> ARTICLE KEPT. /fix/exfat-vs-fat32-cdj is literally titled and
  //             built around the exFAT question, so it answers the click.
  // HIS FUTURE IMPROVEMENT, RECORDED NOT BUILT: dedicated pages for the most
  // common technical concepts, so these stop being dictionary lines. Until
  // that exists, the dictionary anchor is the honest destination.
  { key: 'fat32', kind: 'concept', label: 'FAT32', anchor: 'fat32' },
  { key: 'exfat', kind: 'concept', label: 'exFAT', anchor: 'exfat', article: '/fix/exfat-vs-fat32-cdj' },
  { key: 'mbr', kind: 'concept', label: 'MBR', anchor: 'mbr', aliases: ['Master Boot Record'] },
  { key: 'emergency-loop', kind: 'concept', label: 'Emergency Loop', anchor: 'emergency-loop', article: '/fix/emergency-loop-mode' },
  { key: 'e-8302', kind: 'concept', label: 'E-8302', anchor: 'e-8302', article: '/fix/cdj-error-e-8302' },
  { key: 'onelibrary', kind: 'concept', label: 'OneLibrary', anchor: 'onelibrary', article: '/knowledge/pioneer-dj/rekordbox#onelibrary', aliases: ['Device Library Plus'] },

  // WITHOUT an article: the dictionary is the best destination we have, and
  // that is a legitimate answer, not a placeholder. Give any of these an
  // `article` the day one is written.
  { key: 'gpt', kind: 'concept', label: 'GPT', anchor: 'gpt', aliases: ['GUID Partition Table'] },
  { key: 'ntfs', kind: 'concept', label: 'NTFS', anchor: 'ntfs' },
  { key: 'folder-view', kind: 'concept', label: 'FOLDER view', anchor: 'folder-view' },
  { key: 'pro-dj-link', kind: 'concept', label: 'PRO DJ LINK', anchor: 'pro-dj-link', aliases: ['Pro DJ Link'] },
  { key: 'rekordbox-database', kind: 'concept', label: 'rekordbox database', anchor: 'rekordbox-database' },
  { key: 'uasp', kind: 'concept', label: 'UASP', anchor: 'uasp' },
  { key: 'isolator', kind: 'concept', label: 'isolator', anchor: 'isolator' },
  { key: 'booth-eq', kind: 'concept', label: 'booth EQ', anchor: 'booth-eq' },
  { key: 'channel-eq', kind: 'concept', label: 'channel EQ', anchor: 'channel-eq' },
  { key: 'crossfader-assign', kind: 'concept', label: 'crossfader assign', anchor: 'crossfader-assign' },
  { key: 'dvs', kind: 'concept', label: 'DVS', anchor: 'dvs', aliases: ['Digital Vinyl System'] },
  { key: 'trim', kind: 'concept', label: 'TRIM', anchor: 'trim-gain', aliases: ['gain'] },
  { key: 'quick-vs-full-format', kind: 'concept', label: 'quick format vs full format', anchor: 'quick-vs-full-format' },
  { key: 'flac', kind: 'concept', label: 'FLAC', anchor: 'flac' },
  { key: 'alac', kind: 'concept', label: 'Apple Lossless', anchor: 'alac', aliases: ['ALAC'] },
  { key: 'usb-connectors', kind: 'concept', label: 'USB-A, USB-B and USB-C', anchor: 'usb-connectors' },
];

const BY_KEY = new Map(CONCEPTS.map((c) => [c.key, c]));

/**
 * The single resolution rule. Products go to their page; concepts go to their
 * article if one exists, otherwise to their dictionary anchor.
 * Returns null for an unknown key so a caller fails loudly rather than
 * rendering a dead link.
 */
export function hrefFor(key) {
  const c = BY_KEY.get(key);
  if (!c) return null;
  if (c.kind === 'product') return c.page;
  return c.article ?? `${DICTIONARY}#${c.anchor}`;
}

export function conceptByKey(key) {
  return BY_KEY.get(key) ?? null;
}
