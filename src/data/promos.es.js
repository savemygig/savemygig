/*
 * PROMO BANNER CARDS, SPANISH (neutral Latin American).
 *
 * Mirror of src/data/promos.js: identical order, href, tone, icon and
 * mobileOnly. ONLY q, qs and cta differ. Change the English file first,
 * mirror here in the same commit.
 *
 * Doctrine notes that bit during authoring (translation-doctrine-and-glossary):
 *   - tú, never vos, never usted. el USB (masculine, matching the tree),
 *     memoria USB where the fuller form reads better. reproductor for the
 *     unit in prose, deck where one line must fit on a phone (the tree uses
 *     both). computadora, laptop, celular. el gig, matching the checklist.
 *   - rekordbox lowercase even at the start of a line. Emergency Mode,
 *     Emergency Loop and OneLibrary are never translated.
 *   - Questions open with ¿. No exclamation marks, no em or en dashes.
 *   - qs is read on a phone in one line. Shorten the wording, never the
 *     warning. test-promo-fit.mjs measures every slide at 360, 390, 430.
 */
export const PROMOS = [
  { href: '/emergency', tone: 'red', icon: 'alert',
    q: '¿USB no detectado y tocas en un rato?', qs: '¿USB muerto y tocas ya?', cta: 'Abre el Emergency Mode' },
  { href: '/knowledge/pioneer-dj/rekordbox', tone: 'red', icon: 'disc',
    q: '¿Playlists perdidas en un reproductor pero bien en otro?', qs: '¿Playlists solo en un deck?', cta: 'Eso es OneLibrary. Mira por qué' },
  { href: '/fix/cdj-error-e-8302', tone: 'red', icon: 'alert',
    q: '¿Error E-8302 en el CDJ?', qs: '¿E-8302 en el CDJ?', cta: 'Qué significa, y la solución' },
  { href: '/fix/rekordbox-export-failed', tone: 'red', icon: 'disc',
    q: '¿rekordbox dice que el export falló?', qs: '¿Falló el export de rekordbox?', cta: 'Recupéralo en el orden correcto' },
  { href: '/fix/emergency-loop-mode', tone: 'red', icon: 'alert',
    q: '¿El player repite los últimos segundos del track?', qs: '¿Player en loop de 2 segundos?', cta: 'Eso es Emergency Loop. Haz esto' },
  { href: '/fix/waveforms-not-loading-cdj', tone: 'red', icon: 'disc',
    q: '¿Los tracks suenan pero las waveforms no cargan?', qs: '¿Waveforms no cargan?', cta: 'Esto es lo que falta' },
  { href: '/recovery', tone: 'amber', icon: 'rescue',
    q: '¿El drive murió con tu música adentro?', qs: '¿Drive muerto con tu música?', cta: 'Mira qué se puede recuperar' },
  { href: '/checklist', tone: 'green', icon: 'check',
    q: '¿Sales al gig en una hora?', qs: '¿Gig en una hora?', cta: 'Haz el checklist pre-gig' },
  { href: '/fix/format-usb-for-cdj', tone: 'green', icon: 'usb',
    q: '¿USB nuevo que el CDJ no quiere leer?', qs: '¿El CDJ rechaza tu USB?', cta: 'El formato que siempre funciona' },
  { href: '/fix/exfat-vs-fat32-cdj', tone: 'green', icon: 'usb',
    q: '¿exFAT o FAT32? Importa más de lo que crees', qs: '¿exFAT o FAT32?', cta: 'Qué players leen cuál' },
  { href: '/fix/dj-usb-backup-strategy', tone: 'green', icon: 'check',
    q: '¿Un solo USB entre tú y un gig muerto?', qs: '¿Un drive, un gig muerto?', cta: 'El hábito de las dos unidades' },
  { href: '/fix/move-rekordbox-library-new-laptop', tone: 'green', icon: 'disc',
    q: '¿Mudas rekordbox a una computadora nueva?', qs: '¿rekordbox en laptop nueva?', cta: 'Conserva cada cue y playlist' },
  { href: '/gear', tone: 'amber', icon: 'usb',
    q: '¿No sabes en qué memoria USB confiar?', qs: '¿En qué USB confiar?', cta: 'Las que sobreviven al booth' },
  { href: '/prepare', tone: 'amber', icon: 'check',
    q: '¿Cansado de que esto pase?', qs: '¿Cansado de esto?', cta: 'Arma un setup que no falla' },
  { href: '/knowledge/pioneer-dj', tone: 'amber', icon: 'disc',
    q: '¿Tocas en equipo que nunca has usado?', qs: '¿Equipo que nunca usaste?', cta: 'Abre el manual del hardware' },
  // MOBILE ONLY, mirror of the English slide. See promos.js.
  { href: '/install', tone: 'green', icon: 'save', mobileOnly: true,
    q: '¿Booth en un sótano, sin señal?', qs: '¿Booth sin señal?', cta: 'Lleva el rescate en tu celular' },
];
