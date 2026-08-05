/*
 * PROMO BANNER CARDS, ENGLISH (canonical).
 *
 * Extracted from PromoBanner.astro on 2026-08-05 when the banner gained
 * Portuguese and Spanish. Same pattern as the emergency tree: one data file
 * per language, the component renders whichever it is given. Structure is
 * shared and must stay a mirror across promos.js / promos.pt.js /
 * promos.es.js: identical order, identical href, tone, icon and mobileOnly.
 * ONLY q, qs and cta differ. Change the flow here first, then mirror it in
 * the same commit.
 *
 * hrefs are UNPREFIXED. PromoBanner.astro adds /pt or /es at render time so
 * a reader stays inside their language. `exclude` is compared against the
 * unprefixed href.
 *
 * Rules (see the component header for the why):
 *   - internal links only, no external or affiliate destinations
 *   - phrased as the problem the DJ actually has, not as a feature
 *   - q is the desktop line, qs the phone line: test-promo-fit.mjs proves
 *     every slide holds ONE title line + ONE CTA line at iPhone widths,
 *     in all three languages
 */
export const PROMOS = [
  { href: '/emergency', tone: 'red', icon: 'alert',
    q: 'USB not detected and you play soon?', qs: 'USB dead, playing soon?', cta: 'Start Emergency Mode' },
  { href: '/knowledge/pioneer-dj/rekordbox', tone: 'red', icon: 'disc',
    q: 'Playlists missing on one deck but fine on another?', qs: 'Playlists on one deck only?', cta: 'That is OneLibrary. Here is why' },
  { href: '/fix/cdj-error-e-8302', tone: 'red', icon: 'alert',
    q: 'Getting error E-8302 on the CDJ?', qs: 'E-8302 on the CDJ?', cta: 'What it means, and the fix' },
  { href: '/fix/rekordbox-export-failed', tone: 'red', icon: 'disc',
    q: 'rekordbox says the export failed?', qs: 'rekordbox export failed?', cta: 'Recover it in the right order' },
  { href: '/fix/emergency-loop-mode', tone: 'red', icon: 'alert',
    q: 'Player looping the last two seconds of a track?', qs: 'Player looping two seconds?', cta: 'That is Emergency Loop. Do this' },
  { href: '/fix/waveforms-not-loading-cdj', tone: 'red', icon: 'disc',
    q: 'Tracks play but the waveforms never load?', qs: 'Waveforms never load?', cta: 'Here is what is missing' },
  { href: '/recovery', tone: 'amber', icon: 'rescue',
    q: 'Drive died and your music is on it?', qs: 'Drive died with your music?', cta: 'See what is still recoverable' },
  { href: '/checklist', tone: 'green', icon: 'check',
    q: 'Leaving for a gig in an hour?', qs: 'Gig in an hour?', cta: 'Run the pre-gig checklist' },
  { href: '/fix/format-usb-for-cdj', tone: 'green', icon: 'usb',
    q: 'New USB that the CDJ refuses to read?', qs: 'CDJ refuses your new USB?', cta: 'Format it the way that always works' },
  { href: '/fix/exfat-vs-fat32-cdj', tone: 'green', icon: 'usb',
    q: 'exFAT or FAT32? It matters more than you think', qs: 'exFAT or FAT32?', cta: 'Which players read which' },
  { href: '/fix/dj-usb-backup-strategy', tone: 'green', icon: 'check',
    q: 'One drive between you and a dead gig?', qs: 'One drive, one dead gig?', cta: 'The two-drive habit' },
  { href: '/fix/move-rekordbox-library-new-laptop', tone: 'green', icon: 'disc',
    q: 'Moving rekordbox to a new laptop?', qs: 'rekordbox to a new laptop?', cta: 'Keep every cue and playlist' },
  { href: '/gear', tone: 'amber', icon: 'usb',
    q: 'Not sure which USB drive to trust?', qs: 'Which USB drive to trust?', cta: 'The ones that survive booths' },
  { href: '/prepare', tone: 'amber', icon: 'check',
    q: 'Tired of this happening at all?', qs: 'Tired of this happening?', cta: 'Build a setup that does not fail' },
  { href: '/knowledge/pioneer-dj', tone: 'amber', icon: 'disc',
    q: 'Playing on gear you have never touched?', qs: 'Gear you never touched?', cta: 'Open the hardware field manual' },
  // MOBILE ONLY (Antonio: two banners polluted the phone, so on mobile the
  // install pitch lives here in the rotation and the standalone banner hides;
  // desktop keeps the standalone banner and never shows this slide).
  { href: '/install', tone: 'green', icon: 'save', mobileOnly: true,
    q: 'Basement booth, zero bars?', qs: 'Basement booth, zero bars?', cta: 'Keep the rescue on your phone' },
];
