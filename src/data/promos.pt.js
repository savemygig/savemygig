/*
 * PROMO BANNER CARDS, BRAZILIAN PORTUGUESE (pt-BR).
 *
 * Mirror of src/data/promos.js: identical order, href, tone, icon and
 * mobileOnly. ONLY q, qs and cta differ. Change the English file first,
 * mirror here in the same commit.
 *
 * Doctrine notes that bit during authoring (translation-doctrine-and-glossary):
 *   - pen drive, never unidade flash USB. você, never tu. player and deck
 *     both exist in the tree; the promos say player for the unit, matching
 *     the triage doors.
 *   - rekordbox lowercase even at the start of a line.
 *   - Emergency Mode and Emergency Loop are brand and feature names, never
 *     translated. OneLibrary likewise.
 *   - No exclamation marks, no em or en dashes. The build rejects them.
 *   - qs is read on a phone in one line. Shorten the wording, never the
 *     warning. test-promo-fit.mjs measures every slide at 360, 390, 430.
 */
export const PROMOS = [
  { href: '/emergency', tone: 'red', icon: 'alert',
    q: 'USB não detectado e a gig é agora?', qs: 'USB morto, gig agora?', cta: 'Abra o Emergency Mode' },
  { href: '/knowledge/pioneer-dj/rekordbox', tone: 'red', icon: 'disc',
    q: 'Playlists sumiram em um player mas aparecem no outro?', qs: 'Playlists só em um player?', cta: 'Isso é OneLibrary. Entenda por quê' },
  { href: '/fix/cdj-error-e-8302', tone: 'red', icon: 'alert',
    q: 'Erro E-8302 no CDJ?', qs: 'E-8302 no CDJ?', cta: 'O que significa, e a solução' },
  { href: '/fix/rekordbox-export-failed', tone: 'red', icon: 'disc',
    q: 'O rekordbox diz que o export falhou?', qs: 'Export do rekordbox falhou?', cta: 'Recupere na ordem certa' },
  { href: '/fix/emergency-loop-mode', tone: 'red', icon: 'alert',
    q: 'Player repetindo os últimos segundos da track?', qs: 'Player em loop de 2 segundos?', cta: 'Isso é Emergency Loop. Faça isto' },
  { href: '/fix/waveforms-not-loading-cdj', tone: 'red', icon: 'disc',
    q: 'As tracks tocam mas os waveforms não carregam?', qs: 'Waveforms não carregam?', cta: 'Veja o que está faltando' },
  { href: '/recovery', tone: 'amber', icon: 'rescue',
    q: 'O drive morreu com a sua música dentro?', qs: 'Drive morreu com sua música?', cta: 'Veja o que ainda dá para recuperar' },
  { href: '/checklist', tone: 'green', icon: 'check',
    q: 'Saindo para a gig em uma hora?', qs: 'Gig em uma hora?', cta: 'Rode o checklist pré-gig' },
  { href: '/fix/format-usb-for-cdj', tone: 'green', icon: 'usb',
    q: 'Pen drive novo que o CDJ se recusa a ler?', qs: 'CDJ recusa seu pen drive?', cta: 'O formato que sempre funciona' },
  { href: '/fix/exfat-vs-fat32-cdj', tone: 'green', icon: 'usb',
    q: 'exFAT ou FAT32? Importa mais do que você imagina', qs: 'exFAT ou FAT32?', cta: 'Quais players leem cada um' },
  { href: '/fix/dj-usb-backup-strategy', tone: 'green', icon: 'check',
    q: 'Um único pen drive entre você e uma gig morta?', qs: 'Um drive, uma gig morta?', cta: 'O hábito dos dois drives' },
  { href: '/fix/move-rekordbox-library-new-laptop', tone: 'green', icon: 'disc',
    q: 'Levando o rekordbox para um notebook novo?', qs: 'rekordbox em notebook novo?', cta: 'Leve cada cue e playlist junto' },
  { href: '/gear', tone: 'amber', icon: 'usb',
    q: 'Não sabe em qual pen drive confiar?', qs: 'Em qual pen drive confiar?', cta: 'Os que aguentam o booth' },
  { href: '/prepare', tone: 'amber', icon: 'check',
    q: 'Cansado de ver isso acontecer?', qs: 'Cansado de passar por isso?', cta: 'Monte um setup que não falha' },
  { href: '/knowledge/pioneer-dj', tone: 'amber', icon: 'disc',
    q: 'Vai tocar em equipamento que você nunca usou?', qs: 'Equipamento que nunca usou?', cta: 'Abra o manual do hardware' },
  // MOBILE ONLY, mirror of the English slide. See promos.js.
  { href: '/install', tone: 'green', icon: 'save', mobileOnly: true,
    q: 'Booth no porão, sem sinal?', qs: 'Booth no porão, sem sinal?', cta: 'Leve o resgate no celular' },
];
