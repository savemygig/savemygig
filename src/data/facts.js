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
  { name: 'DJM-REC (AlphaTheta)', url: 'https://support.alphatheta.com/en-US/products/4406500786329' },
  { name: 'Engine DJ', url: 'https://enginedj.com/downloads' },
];

// Hardware reference facts (Pioneer DJ / AlphaTheta equipment pages, added
// 2026-07-27). Same rule as REKORDBOX above: thresholds and named fixes only,
// verified against AlphaTheta's own published firmware change-history PDFs.
// Do not add a model here until its page has been researched from a primary
// source. "newestKnown" fields are for internal reference and must never be
// rendered as "current" or "latest" in copy, exactly like REKORDBOX.newestKnown.
export const CDJ_2000NXS2 = {
  newestKnown: '1.86',                 // 27 Feb 2024, "minor bugs fixed". Reference only.
  beatJumpIntro: '1.70',               // 2/4/8/16-beat Beat Jump added, 21 Sep 2017.
  slipHotCueFix: '1.60',               // startup and SLIP HOT CUE issue fixed, 11 Jan 2017.
  waveformColorFix: '1.55',            // waveform color selection, briefly broken, restored, 13 Dec 2016.
  controlModeDropoutFix: '1.51',       // audio dropouts in Control Mode eliminated, 20 Oct 2016.
  source: 'https://downloads.support.alphatheta.com/firmwares/dj-players/CDJ-2000NXS2/CDJ-2000NXS2-Firmware-Change-History-Ver186-en.pdf',
};

export const CDJ_3000 = {
  newestKnown: '3.22',            // 15 Jan 2026, RMX-IGNITE link support. Reference only.
  onelibraryWithdrawn: '3.30',    // 2025: added OneLibrary, withdrawn after playlists failed to
                                  // display for users exporting from older rekordbox. Official
                                  // line: no music or data was deleted. Player reverted to
                                  // Device Library.
  linkDjm2000nxsFix: '3.20',      // 24 Apr 2025: PRO DJ LINK with DJM-2000NXS fixed.
  screenDeadFix: '3.19',          // 11 Dec 2024: rare screen-dead-on-power-on fixed.
  stabilityFix: '3.18',           // 3 Dec 2024: no-audio, display blackouts, freezes on some units fixed.
  ecoStandbyIntro: '3.16',        // 10 Oct 2024: EU Ecodesign auto power management, 20 minutes.
  browseWaitingFix: '3.14',       // 25 Jul 2024: "Waiting" popup could block the BROWSE screen.
  sixPlayersIntro: '2.03',        // 13 Oct 2022: up to 6 units over PRO DJ LINK.
  emergencyLoopHotCueFix: '1.09', // 16 Mar 2021: Emergency Loop wrongly triggering during Hot Cue pause.
  exfatIntro: '1.20',             // exFAT read support threshold (also in PLAYERS below).
  source: 'https://downloads.support.alphatheta.com/firmwares/dj-players/CDJ-3000/CDJ-3000-Firmware-Change-History-Ver322-en.pdf',
  sourceWithdrawal: 'https://www.pioneerdj.com/en/news/2026/cdj-3000-firmware-ver330-important-notice/',
};

export const CDJ_3000X = {
  newestKnown: '1.40',        // 14 Jul 2026. Reference only.
  darkModeIntro: '1.40',      // Dark and Light display modes.
  internetUpdateIntro: '1.40',// firmware updates over the internet.
  wifiDupIntro: '1.40',       // Wi-Fi Setting Duplication across units.
  djayHidIntro: '1.20',       // 21 Oct 2025: USB-HID for djay Pro.
  seratoHidIntro: '1.10',     // 9 Sep 2025: USB-HID for Serato DJ Pro.
  source: 'https://support.alphatheta.com/en-US/articles/50228449553049',
};

export const DJM_900NXS2 = {
  channels: 4,
  usbPorts: 2,
  sendReturn: true,          // independent send/return, internal + external FX at once
  beatFxCount: 14,
  soundColorFx: ['Sweep', 'Filter', 'Crush', 'Dub Echo', 'Noise', 'Space'],
  source: 'https://www.pioneerdj.com/en-us/product/mixer/archive/djm-900nxs2/black/specifications/',
};

export const DJM_A9 = {
  channels: 4,
  usbPorts: 'one USB-A, two USB-B/USB-C',  // official spec page wording
  bluetooth: true,            // wireless audio input from other devices
  wifi: true,                 // Stagehand remote monitoring
  dualHeadphones: true,       // two independent headphone outputs
  beatFxCount: 14,            // includes Mobius, Triplet Filter, Triplet Roll
  micPhantom: true,           // MIC1 accepts phantom-powered condensers
  newestKnown: '1.19',        // 15 Jan 2026, RMX-IGNITE support. Reference only.
  linkFreezeFix: '1.11',      // 26 Aug 2025: rare freeze under heavy PRO DJ LINK network load fixed.
  uaspFix: '1.07',            // 14 May 2025: UASP-compatible USB storage not recognized, fixed.
  ecoStandbyIntro: '1.05',    // 18 Jul 2024: EU Ecodesign power management, 20 minutes.
  multiIoInsertFix: '1.02',   // 14 Nov 2023: insert method intermittently disabled on Multi I/O
                              // switching; DVS phono input malfunction on USB-B when switching
                              // PC/Mac across the A/B ports. Both fixed.
  source: 'https://downloads.support.alphatheta.com/firmwares/dj-mixers/DJM-A9/DJM-A9-Firmware-Change-History-Ver119-en.pdf',
};

export const DJM_V10 = {
  channels: 6,
  eqBands: 4,                 // 4-band EQ per channel
  compressor: true,           // per-channel compressor
  dualHeadphones: true,       // dual headphone outputs, plus booth EQ
  boothEq: true,
  sendReturn: true,           // expanded send/return, external FX combinable with built-in
  newestKnown: '1.20',        // 15 Jan 2026, RMX-IGNITE support. Reference only.
  uaspFix: '1.16',            // 14 May 2025: UASP-compatible USB storage not recognized, fixed.
  ecoStandbyIntro: '1.13',    // 18 Jul 2024: EU Ecodesign power management, 20 minutes.
  cdj3000LinkAudioFix: '1.12',// 15 Dec 2022: potential audio cut-out when connected to CDJ-3000
                              // over the PRO DJ LINK network, fixed.
  midiFix: '1.07',            // 29 Sep 2020: incorrect MIDI output in certain operation, fixed.
  channelInputFix: '1.04',    // 4 Feb 2020: audio would sometimes fail to input to a channel, fixed.
  source: 'https://downloads.support.alphatheta.com/firmwares/dj-mixers/DJM-V10/DJM-V10-Firmware-Change-History-Ver120-en.pdf',
};

// DJM-REC (AlphaTheta's iPhone/iPad recording + live-streaming app).
// Facts verified 28 Jul 2026 against AlphaTheta's own support articles
// (URLs below). Same threshold discipline as everything else in this file.
export const DJM_REC = {
  checked: '28 July 2026',
  // Official compatibility list, quoted from the support article verbatim.
  compatibleMixers: ['DJM-V10', 'DJM-V10-LF', 'DJM-TOUR1', 'DJM-V5', 'DJM-A9', 'DJM-900NXS2', 'DJM-750MK2', 'DJM-450'],
  // Officially supported live-streaming services, plus a Custom option
  // (manual stream URL + key) for anything unlisted.
  streamServices: ['Twitch', 'YouTube', 'Facebook Live', 'Instagram', 'Snapchat', 'Mixcloud Live', 'Restream'],
  // Now Playing (track title + artist on the stream) works only on these.
  nowPlayingServices: ['Twitch', 'YouTube', 'Facebook Live', 'Mixcloud Live', 'Restream'],
  // DJM-900NXS2 firmware versions that fixed DJM-REC recording halts:
  // 2.06 (2020) and again 2.08 (Jun 2026, iOS/iPadOS audio). Old venue
  // firmware still bites; see mixer-fx-problems research doc.
  nxs2RecHaltFixes: ['2.06', '2.08'],
  source: 'https://support.alphatheta.com/en-US/products/4406500786329',
  compatSource: 'https://support.alphatheta.com/en-US/articles/4410027698457',
  streamSource: 'https://support.alphatheta.com/en-US/articles/27494335253145',
};

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

// ---------------------------------------------------------------------------
// FIRMWARE ISSUE MATRIX (2026-08-01)
//
// WHY THIS EXISTS: every fact below already lived in this file, but scattered
// across six separate model pages and buried inside collapsed accordions, so
// nobody could answer the one question a DJ actually has in a booth: "the deck
// says version X, what is broken on it?" AlphaTheta publishes this only as one
// change-history PDF per model. Nobody aggregates it. This array is the
// aggregation, and /knowledge/pioneer-dj/firmware renders it.
//
// FACT DISCIPLINE, unchanged: every entry restates a fix already recorded and
// sourced in the model constants above. Nothing new is invented here. If a
// symptom is not in AlphaTheta's own change history, it does not go in.
//
// `midSet` is the one editorial field: true when the documented symptom can
// interrupt a set in progress (audio, playback, browsing, link). It is our
// read of the vendor's own wording, not a vendor severity rating, and the page
// says so.
export const FIRMWARE_ISSUES = [
  {
    model: 'CDJ-3000X',
    href: '/knowledge/pioneer-dj/cdj-3000x',
    source: CDJ_3000X.source,
    issues: [],
    noneNote: 'A young unit. AlphaTheta has published no defect fix for it, so there is nothing to report here. This section stays empty until a documented one exists.',
  },
  {
    model: 'CDJ-3000',
    href: '/knowledge/pioneer-dj/cdj-3000',
    source: CDJ_3000.source,
    warning: {
      version: CDJ_3000.onelibraryWithdrawn,
      text: 'Withdrawn by AlphaTheta. It added OneLibrary, then playlists failed to display for people exporting from older rekordbox. No music or data was deleted, and the player reverted to Device Library. Do not install this version.',
      sourceUrl: CDJ_3000.sourceWithdrawal,
    },
    issues: [
      { fixedIn: CDJ_3000.linkDjm2000nxsFix, area: 'Link', midSet: true, symptom: 'PRO DJ LINK connection with a DJM-2000NXS could fail.' },
      { fixedIn: CDJ_3000.screenDeadFix, area: 'Display', midSet: true, symptom: 'Rare dead screen on power-on.' },
      { fixedIn: CDJ_3000.stabilityFix, area: 'Audio', midSet: true, symptom: 'Occasional no-audio, display blackouts and system freezes on some units.' },
      { fixedIn: CDJ_3000.browseWaitingFix, area: 'Browse', midSet: true, symptom: 'A "Waiting" popup could block the BROWSE screen entirely.' },
      { fixedIn: CDJ_3000.emergencyLoopHotCueFix, area: 'Playback', midSet: true, symptom: 'Emergency Loop triggering wrongly during a Hot Cue pause.' },
    ],
  },
  {
    model: 'CDJ-2000NXS2',
    href: '/knowledge/pioneer-dj/cdj-2000nxs2',
    source: CDJ_2000NXS2.source,
    issues: [
      { fixedIn: CDJ_2000NXS2.slipHotCueFix, area: 'Playback', midSet: false, symptom: 'A startup issue affecting SLIP HOT CUE behaviour.' },
      { fixedIn: CDJ_2000NXS2.waveformColorFix, area: 'Display', midSet: false, symptom: 'Waveform colour selection went missing, then was restored.' },
      { fixedIn: CDJ_2000NXS2.controlModeDropoutFix, area: 'Audio', midSet: true, symptom: 'Audio dropouts during Control Mode playback.' },
    ],
  },
  {
    model: 'DJM-V10 / V10-LF',
    href: '/knowledge/pioneer-dj/djm-v10',
    source: DJM_V10.source,
    issues: [
      { fixedIn: DJM_V10.uaspFix, area: 'USB', midSet: true, symptom: 'UASP-compatible USB drives not recognized.' },
      { fixedIn: DJM_V10.cdj3000LinkAudioFix, area: 'Audio', midSet: true, symptom: 'Potential audio cut-out when connected to CDJ-3000s over PRO DJ LINK.' },
      { fixedIn: DJM_V10.midiFix, area: 'MIDI', midSet: false, symptom: 'Incorrect MIDI output under certain operation.' },
      { fixedIn: DJM_V10.channelInputFix, area: 'Audio', midSet: true, symptom: 'Audio sometimes failing to input to a channel.' },
    ],
  },
  {
    model: 'DJM-A9',
    href: '/knowledge/pioneer-dj/djm-a9',
    source: DJM_A9.source,
    issues: [
      { fixedIn: DJM_A9.linkFreezeFix, area: 'Link', midSet: true, symptom: 'Rare freeze under heavy PRO DJ LINK network load.' },
      { fixedIn: DJM_A9.uaspFix, area: 'USB', midSet: true, symptom: 'UASP-compatible USB drives not recognized.' },
      { fixedIn: DJM_A9.multiIoInsertFix, area: 'Routing', midSet: true, symptom: 'Insert method intermittently disabling itself when switching the Multi I/O input selector, and DVS phono input malfunction on USB-B after swapping computers across ports.' },
    ],
  },
  {
    model: 'DJM-900NXS2',
    href: '/knowledge/pioneer-dj/djm-900nxs2',
    source: DJM_REC.source,
    issues: [
      { fixedIn: DJM_REC.nxs2RecHaltFixes[1], area: 'Recording', midSet: false, symptom: 'DJM-REC recording halts affecting iOS and iPadOS audio.' },
      { fixedIn: DJM_REC.nxs2RecHaltFixes[0], area: 'Recording', midSet: false, symptom: 'DJM-REC recording could halt part-way through a set.' },
    ],
    note: 'AlphaTheta has published no hardware defect fix for this mixer beyond the DJM-REC recording halts. The rest of its change history is feature work.',
  },
];
