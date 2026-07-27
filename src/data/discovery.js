/**
 * DISCOVERY SEARCH POOL (Antonio's spec, 2026-07-27).
 *
 * The homepage search placeholder is not static: it rotates through these
 * terms, one every few seconds, deliberately mixing categories, so a visitor
 * who never types still learns the breadth of what Save My Gig covers.
 *
 * RULES:
 *  - Never include anything the "Popular fixes" row already shows (that row
 *    owns the urgent problems; this pool owns everything else).
 *  - Every term MUST return at least one result in the site's own search.
 *    scripts/check-discovery.mjs enforces both rules in the gate, so a term
 *    for content that does not exist yet (Serato, Traktor, Engine DJ...)
 *    simply cannot ship until its guide does. Add the guide, add the term.
 *  - Keep terms short: they render inside the input on a phone.
 *
 * The rotation interleaves categories round-robin (never two of a kind in a
 * row), which is why the shape is arrays per category rather than one list.
 */
export const DISCOVERY = {
  equipment: [
    'CDJ-3000X',
    'CDJ-3000',
    'DJM-A9',
    'DJM-V10',
    'CDJ-2000NXS2',
    'DJM-900NXS2',
    'OPUS-QUAD',
  ],
  software: [
    'rekordbox',
  ],
  concepts: [
    'OneLibrary',
    'Device Library',
    'Pro DJ Link',
    'HID mode',
    'MBR',
  ],
  features: [
    'hot cues',
    'beat jump',
    'touch preview',
  ],
  preparation: [
    'backup strategy',
    'firmware update',
    'My Settings',
    'two drives',
  ],
  knowledge: [
    'Beat FX',
    'emergency loop',
    'Wi-Fi',
  ],
};
