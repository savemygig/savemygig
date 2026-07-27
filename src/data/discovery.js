/**
 * DISCOVERY SEARCH POOL (Antonio's spec, 2026-07-27, refined same day).
 *
 * The homepage search placeholder rotates through these terms so a visitor
 * who never types still learns the breadth of what Save My Gig covers.
 *
 * STRUCTURE (Antonio): the categories are the SITE'S OWN PILLARS, emergency,
 * prevention, recovery, knowledge, and the rotation interleaves them
 * round-robin, so the box walks a visitor through what the site IS.
 *
 * PHRASING (Antonio, said with love: "use the brain"): every term must read
 * like something a DJ would actually type with a problem or a doubt, never a
 * bare feature noun. "hot cues" is a DJ-course search and this is not a DJ
 * course; "CDJ-3000 freeze" is a bad night, which is our business.
 *
 * RULES, gate-enforced by scripts/check-discovery.mjs:
 *  - every term must match a page TITLE or section HEADING (buried body-text
 *    matches do not count, that is how "Wi-Fi" shipped and searched like the
 *    site had nothing);
 *  - never duplicate the Popular fixes row (it owns the urgent classics);
 *  - a term for content that does not exist yet cannot ship. Add the guide,
 *    then add the term.
 *  - keep terms short: they render inside the input on a phone.
 */
export const DISCOVERY = {
  emergency: [
    'USB not playing',
    'no sound',
    'player frozen',
    'emergency loop',
    'DJM no sound',
  ],
  prevention: [
    'two identical drives',
    'backup strategy',
    'firmware update',
    'MBR or GPT',
    'My Settings',
  ],
  recovery: [
    'dead drive',
    'data recovery',
    'rekordbox database',
    'rekordbox not detecting USB',
    'waveforms missing',
  ],
  knowledge: [
    'OneLibrary vs Device Library',
    'CDJ-3000 freeze',
    'DJM-A9 freeze',
    'Pro DJ Link freeze',
    'screen frozen',
  ],
};
