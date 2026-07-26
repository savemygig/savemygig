// SINGLE SOURCE OF TRUTH for version thresholds, player compatibility, the
// verification date and official vendor links.
//
// WHY THIS FILE EXISTS: the site must not go stale when software updates.
// Antonio's rule: state a THRESHOLD ("fixed in 7.2.13"), never a SNAPSHOT
// ("the current version is 7.2.16"). "Fixed in 7.2.13" stays true forever;
// "the current version is 7.2.16" is wrong the day 7.2.17 ships.
//
// When the scheduled source-check (claude/source-check-<date>.md) reports a
// change, edit THIS FILE ONLY, bump CHECKED, then run:
//   npm run build && node scripts/lint-content.mjs && node scripts/geo-check.mjs
//
// Banned in page copy, enforced by scripts/lint-content.mjs on the BUILT HTML:
// latest, newest, flagship, "current version/firmware/release",
// "at the time of writing", "as of <date>". Name the threshold or the models
// instead. This file may hold a newest-known version for internal reference,
// but it must never be rendered as "current" or "latest" in copy.

export const CHECKED = '26 July 2026';

export const REKORDBOX = {
  dualFormatFloor: '7.2.13',        // first safe version that writes BOTH DB formats. Permanent.
  withdrawn: '7.2.12',              // withdrawn, exports could fail to load. Never use. Permanent.
  deviceLibraryPlusIntro: '6.6.11', // OneLibrary (then "Device Library Plus"), March 2023.
  newestKnown: '7.2.16',            // reference only. DO NOT render as "current" or "latest".
  source: 'https://rekordbox.com/en/support/',
};

// Official pages so DJs check the vendor for the release, not us.
export const VENDOR_LINKS = [
  { name: 'rekordbox (AlphaTheta)', url: 'https://rekordbox.com/en/support/' },
  { name: 'Serato DJ', url: 'https://serato.com/dj/downloads' },
  { name: 'Traktor Pro', url: 'https://www.native-instruments.com/en/support/downloads/' },
  { name: 'Engine DJ', url: 'https://enginedj.com/downloads' },
];

// FAT32 + MBR works on every player here, always. exFAT is the variable.
// Each row: model, library format, exFAT support (with the firmware threshold
// where one applies), and a short note. Edit here when a source-check reports
// a change. Facts verified against AlphaTheta / Pioneer DJ official pages.
export const PLAYERS = [
  { m: 'CDJ-3000X',      lib: 'OneLibrary',     exfat: 'Yes',                note: 'No SD card slot. USB-A x1, USB-C x2.' },
  { m: 'CDJ-1500X',      lib: 'OneLibrary',     exfat: 'Yes',                note: 'Announced July 2026. Needs rekordbox 7.2.16 or later.' },
  { m: 'CDJ-3000',       lib: 'Device Library', exfat: 'Yes, firmware 1.20+', note: 'Device Library on firmware 3.22. Firmware 3.30 added OneLibrary but was withdrawn.' },
  { m: 'CDJ-2000NXS2',   lib: 'Device Library', exfat: 'No',                 note: 'The workhorse in most club booths. FAT32 only.' },
  { m: 'CDJ-2000 / NXS', lib: 'Device Library', exfat: 'No',                 note: 'Still everywhere. FAT32 only.' },
  { m: 'CDJ-900 / 850',  lib: 'Device Library', exfat: 'No',                 note: 'FAT32 only.' },
  { m: 'XDJ-AZ',         lib: 'OneLibrary',     exfat: 'Yes',                note: '' },
  { m: 'XDJ-RX3',        lib: 'Device Library', exfat: 'Yes, firmware 1.11+', note: '' },
  { m: 'XDJ-XZ',         lib: 'Device Library', exfat: 'Yes, firmware 1.23+', note: '' },
  { m: 'XDJ-700',        lib: 'Device Library', exfat: 'No',                 note: 'Officially FAT32, FAT or HFS+ only.' },
  { m: 'OPUS-QUAD',      lib: 'OneLibrary',     exfat: 'Yes',                note: 'First OneLibrary player.' },
  { m: 'OMNIS-DUO',      lib: 'OneLibrary',     exfat: 'Yes',                note: '' },
];
