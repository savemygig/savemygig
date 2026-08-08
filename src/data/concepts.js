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
 * `aliases` are the other ways the same idea is written in copy, and they ARE
 * consumed: scripts/autolink.mjs flattens label plus aliases into one
 * vocabulary and matches longest first. This comment used to say nothing
 * consumed them, which was true when the file was written and stopped being
 * true the day the autolinker shipped. Corrected 2026-08-07.
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
  // ANTONIO'S EQUIPMENT LINKING RULE, 2026-08-07: if the text names a model and
  // a page exists, link it. This registry held SIX of the fifteen models with
  // pages, so nine models were being named across the site and never linked,
  // including every one on the /emergency lead paragraph. All fifteen are here
  // now, and adding a model page means adding one line here as well.
  //
  // Rule 7 in autolink.mjs (longest label first) is what makes this safe: a
  // bare family word can never steal a link from a specific model, because
  // "CDJ-3000X" is matched before "CDJ-3000" and both before "CDJ".
  { key: 'cdj-3000x', kind: 'product', label: 'CDJ-3000X', page: '/knowledge/pioneer-dj/cdj-3000x', aliases: ['CDJ 3000X'] },
  { key: 'cdj-3000', kind: 'product', label: 'CDJ-3000', page: '/knowledge/pioneer-dj/cdj-3000', aliases: ['CDJ 3000'] },
  { key: 'cdj-2000nxs2', kind: 'product', label: 'CDJ-2000NXS2', page: '/knowledge/pioneer-dj/cdj-2000nxs2', aliases: ['CDJ 2000NXS2', 'CDJ-2000 NXS2'] },
  { key: 'cdj-2000nxs', kind: 'product', label: 'CDJ-2000NXS', page: '/knowledge/pioneer-dj/cdj-2000nxs', aliases: ['CDJ 2000NXS', 'CDJ-2000 NXS', 'CDJ-2000nexus'] },
  { key: 'cdj-1500x', kind: 'product', label: 'CDJ-1500X', page: '/knowledge/pioneer-dj/cdj-1500x', aliases: ['CDJ 1500X'] },
  { key: 'cdj-900nxs', kind: 'product', label: 'CDJ-900NXS', page: '/knowledge/pioneer-dj/cdj-900nxs', aliases: ['CDJ 900NXS', 'CDJ-900 NXS'] },
  { key: 'xdj-1000mk2', kind: 'product', label: 'XDJ-1000MK2', page: '/knowledge/pioneer-dj/xdj-1000mk2', aliases: ['XDJ 1000MK2', 'XDJ-1000 MK2'] },
  { key: 'xdj-700', kind: 'product', label: 'XDJ-700', page: '/knowledge/pioneer-dj/xdj-700', aliases: ['XDJ 700'] },
  { key: 'djm-a9', kind: 'product', label: 'DJM-A9', page: '/knowledge/pioneer-dj/djm-a9', aliases: ['DJM A9'] },
  { key: 'djm-v10', kind: 'product', label: 'DJM-V10', page: '/knowledge/pioneer-dj/djm-v10', aliases: ['DJM V10', 'DJM-V10-LF'] },
  { key: 'djm-v5', kind: 'product', label: 'DJM-V5', page: '/knowledge/pioneer-dj/djm-v5', aliases: ['DJM V5'] },
  { key: 'djm-900nxs2', kind: 'product', label: 'DJM-900NXS2', page: '/knowledge/pioneer-dj/djm-900nxs2', aliases: ['DJM 900NXS2'] },
  { key: 'djm-900nxs', kind: 'product', label: 'DJM-900NXS', page: '/knowledge/pioneer-dj/djm-900nxs', aliases: ['DJM 900NXS', 'DJM-900nexus'] },
  { key: 'djm-750mk2', kind: 'product', label: 'DJM-750MK2', page: '/knowledge/pioneer-dj/djm-750mk2', aliases: ['DJM 750MK2', 'DJM-750 MK2'] },
  // euphonia is lower case in AlphaTheta's own branding and on our page, and the
  // capitalised form appears in copy too, so both are carried.
  { key: 'euphonia', kind: 'product', label: 'euphonia', page: '/knowledge/pioneer-dj/euphonia', aliases: ['Euphonia', 'EUPHONIA'] },
  // ALLEN & HEATH, added 2026-08-08 with the brand's first two pages. Without
  // these, "Xone:92" was named across the site and never linked, which is the
  // exact gap that left nine Pioneer models unlinked until yesterday.
  // Allen & Heath write the name with a colon. The spaced and colon-less forms
  // are carried as aliases because copy and search queries use all three.
  { key: 'xone-96', kind: 'product', label: 'Xone:96', page: '/knowledge/allen-heath/xone-96', aliases: ['Xone 96', 'Xone96'] },
  { key: 'xone-92', kind: 'product', label: 'Xone:92', page: '/knowledge/allen-heath/xone-92', aliases: ['Xone 92', 'Xone92'] },
  { key: 'rekordbox', kind: 'product', label: 'rekordbox', page: '/knowledge/pioneer-dj/rekordbox', aliases: ['Rekordbox'] },
  { key: 'djm-rec', kind: 'product', label: 'DJM-REC', page: '/knowledge/pioneer-dj/djm-rec', aliases: ['DJM REC'] },
  { key: 'firmware-matrix', kind: 'product', label: 'firmware issues by version', page: '/knowledge/pioneer-dj/firmware' },

  // ------------------------------------------------------- PRODUCT FAMILIES
  // Antonio's rule 2, 2026-08-07: when only the FAMILY is named and no page
  // exists for the family itself, send the reader to the most representative
  // model, so a bare "CDJ" is a starting point rather than a dead word.
  //
  // These are LAST in the products block on purpose. Rule 7 sorts by label
  // length across the whole vocabulary, so a three-letter family word loses to
  // every model name automatically and can only win where no model is named.
  // The plural forms are carried as aliases because the matcher's word-boundary
  // test would otherwise skip "CDJs" entirely.
  //
  // MEASURED BEFORE SHIPPING: a bare family word appears on 103 pages for CDJ,
  // 32 for DJM and 24 for XDJ, so with first-mention-per-page this adds at most
  // 159 links across three languages, roughly 53 per language.
  //
  // WORTH A SECOND LOOK, and it is a judgement call rather than a defect: every
  // one of those 103 CDJ links lands on the CDJ-3000X, on pages that are mostly
  // not about the CDJ-3000X. The alternative destination is /equipment, which
  // lists every model and is arguably the truer "logical starting point" in
  // Antonio's own words. It is one line to switch, here, and nothing else in the
  // site needs to change.
  { key: 'family-cdj', kind: 'product', label: 'CDJ', page: '/knowledge/pioneer-dj/cdj-3000x', aliases: ['CDJs'] },
  { key: 'family-djm', kind: 'product', label: 'DJM', page: '/knowledge/pioneer-dj/djm-a9', aliases: ['DJMs'] },
  { key: 'family-xdj', kind: 'product', label: 'XDJ', page: '/knowledge/pioneer-dj/xdj-1000mk2', aliases: ['XDJs'] },
  // A bare "Xone" goes to the Xone:96, which is the one Allen & Heath present as
  // the range's headline and the one a reader who says "a Xone" most likely means
  // in a modern booth. Same rule as the CDJ, DJM and XDJ families above, and the
  // same open question recorded there about whether a family word is better
  // pointed at /equipment than at one model.
  { key: 'family-xone', kind: 'product', label: 'Xone', page: '/knowledge/allen-heath/xone-96', aliases: ['Xones'] },

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
