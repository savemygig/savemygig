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
  waveformColorFix: '1.55',            // waveform colour selection, briefly broken, restored, 13 Dec 2016.
  controlModeDropoutFix: '1.51',       // audio dropouts in Control Mode eliminated, 20 Oct 2016.
  // "FAT32 ONLY" WAS WRONG AND SHIPPED BOLD (corrected 2026-08-07, same error as
  // the CDJ-2000NXS and CDJ-900NXS pages). AlphaTheta's Operating Instructions,
  // document DRI1290A, "About USB devices", p. 6: "Supported file systems FAT16,
  // FAT32 and HFS+ (NTFS is not supported.)" So HFS+ IS read, and a Mac DJ with
  // a working HFS+ drive was being told a club booth could not read it. There is
  // no help-centre article covering this for the NXS2, the manual is the only
  // primary source, so sourceFileSystems points at the manual PDF.
  // The true and still-useful claim is the exFAT one: exFAT is what a DJ formats
  // by default today and this player does not read it, at any firmware version.
  // The same manual gives the card slot as SD FAT12/FAT16 and SDHC FAT32.
  exfat: false,
  fileSystems: ['FAT16', 'FAT32', 'HFS+'],
  ntfsSupported: false,
  sourceFileSystems: 'https://downloads.support.alphatheta.com/manuals/dj-players/CDJ-2000NXS2/CDJ-2000NXS2_DRI1290A_manual.pdf',
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

// CDJ-1500X. Announced 2 July 2026, so this page exists BEFORE any firmware
// history does: AlphaTheta has published no change history for it yet, and the
// model pages elsewhere in this file are built around exactly that. Nothing is
// invented to fill the gap. What the player DOES have is a set of documented
// traps that catch a DJ on the night, and those are what the page is written
// around.
// Sources, both official:
//   alphatheta.com/en/product/player/cdj-1500x/black/
//   alphatheta.com/en/information/introducing-the-cdj-1500x-new-dj-multi-player/
export const CDJ_1500X = {
  checked: '7 August 2026',
  announced: '2 July 2026',
  // THE THREE FACTS THAT END A SET, in the order they bite.
  // 1. NTFS is not supported, stated in as many words on the spec page. A
  //    Windows DJ formatting a drive gets NTFS by DEFAULT, so this is the most
  //    likely single cause of a drive that "works at home" and not in the booth.
  fileSystems: ['FAT16', 'FAT32', 'exFAT', 'HFS+'],
  ntfsSupported: false,
  // 2. OneLibrary. An existing Device Library export has to be converted with
  //    the latest rekordbox first. A DJ arriving with a drive that a CDJ-2000NXS2
  //    reads fine can find this player will not browse it.
  library: 'OneLibrary',
  // 7.2.16 IS CORRECT AND WAS WRONGLY SOURCED (corrected 2026-08-07). Neither
  // the product page nor the launch article states a version number: the product
  // page says only "the latest version of rekordbox" and the announcement says a
  // supporting update was scheduled for 9 July. The actual source is rekordbox's
  // own release notes, ver. 7.2.16, 9 July 2026, "CDJ-1500X compatibility added".
  // Recorded here because the number is identical to REKORDBOX.newestKnown, and
  // without this note it is indistinguishable from a forbidden snapshot copy.
  rekordboxMin: '7.2.16',
  sourceRekordbox: 'https://rekordbox.com/en/support/releasenote/',
  deviceLibraryNeedsConversion: true,
  // 3. Only TWO of the three ports take a drive: the second USB-C socket is for
  //    a computer, not storage. In a dark booth they look identical. (This
  //    comment said "THREE" until 2026-08-07, contradicting storagePorts below
  //    and every line of copy on the page.)
  usbPorts: 'USB Type-A x1 (storage), USB Type-C x2 (storage x1, PC connection x1)',
  storagePorts: 2,
  formats: ['MP3', 'AAC', 'WAV', 'AIFF', 'Apple Lossless', 'FLAC'],
  // PRO DJ LINK caps at FOUR here, not the six an all-CDJ-3000 rig allows.
  maxLinkedUnits: 4,
  linkNote: 'Up to 4 units can be connected when using a switching hub',
  wirelessLan: 'IEEE 802.11 a/b/g/n/ac',   // the g was missing until 2026-08-07
  screen: '10.1-inch capacitive full-color touchscreen',
  displayModes: ['Dark', 'Light'],
  hotCues: 8,
  // CLOUD FEATURES ARE A NETWORK DEPENDENCY, which is the honest way to read
  // them for this site's purpose: booth Wi-Fi is the least reliable thing in
  // most rooms, and a set that depends on it has a failure mode a USB does not.
  cloudPlay: ['rekordbox CloudDirectPlay', 'StreamingDirectPlay'],
  streamingServices: ['Apple Music', 'Beatport Streaming', 'Tidal'],
  nfcLogin: true,
  coBeat: true,
  software: ['rekordbox (Hardware Unlock)', 'djay Pro', 'Serato DJ Pro'],
  dimensions: '252.1 x 374.7 x 116.5 mm',
  weight: '3.6 kg',
  // No firmware change history published yet. Deliberately null rather than
  // absent, so a page that reaches for it renders nothing instead of undefined.
  newestKnown: null,
  source: 'https://alphatheta.com/en/product/player/cdj-1500x/black/',
  sourceAnnounce: 'https://alphatheta.com/en/information/introducing-the-cdj-1500x-new-dj-multi-player/',
};

// DJM-V5. Three channels, and the fact that matters most is a MISSING control.
// Sources:
//   alphatheta.com/en/product/dj-mixer/djm-v5/black/
//   downloads.support.alphatheta.com/manuals/dj-mixers/DJM-V5/DJM-V5_DRI1965A_manual.pdf
export const DJM_V5 = {
  checked: '7 August 2026',
  channels: 3,
  // NO CROSSFADER. Verified in the instruction manual, not inferred from the
  // spec page, which simply does not mention one either way. The manual's
  // channel section documents the channel fader and its three curve options and
  // there is no crossfader or fader-assign control anywhere in it.
  // This is the single most important line on the page. A DJ who plans a set
  // around cuts, or who reaches for a crossfader on instinct, has a problem
  // that no amount of preparation fixes once they are behind the desk.
  crossfader: false,
  samplingRate: '96 kHz',
  converters: '32-bit A/D and D/A',
  usbPorts: 'USB Type-C x2 (MULTI I/O x1, PC/Mac x1)',
  // PRO DJ LINK, and the cap is per the manual, not the marketing page.
  maxMultiPlayers: 3,
  maxComputers: 2,
  linkNote: 'Up to 3 multi players and up to 2 computers via a switching hub',
  linkNamedPlayers: ['CDJ-3000X', 'CDJ-3000'],
  inputs: 'PHONO x3 (RCA), LINE x3 (RCA), MIC x1 (XLR / 1/4" TRS)',
  outputs: 'MASTER x1 (XLR), BOOTH x1 (1/4" TRS), REC OUT x1 (RCA), PHONES x2',
  sendReturn: 'SEND x1, RETURN x1 (1/4" TS)',
  // SonicLink is a wireless monitoring transmitter built into the mixer. New
  // convenience, and a new thing that can be the reason you hear nothing.
  sonicLink: true,
  software: ['djay Pro', 'rekordbox (Mac/Windows)', 'Serato DJ Pro'],
  dvs: true,
  dimensions: '302.0 x 437.5 x 107.9 mm',
  weight: '8.0 kg',
  newestKnown: null,          // no published change history yet
  source: 'https://alphatheta.com/en/product/dj-mixer/djm-v5/black/',
  sourceManual: 'https://downloads.support.alphatheta.com/manuals/dj-mixers/DJM-V5/DJM-V5_DRI1965A_manual.pdf',
};

// CDJ-2000NXS. The workhorse still installed in a very large number of booths,
// and the model with the most useful change history on this whole site: the
// documented list includes crashes, freezes, audio dropouts and two separate
// file-loading failures, all fixed years ago, on units that are routinely still
// running 2013 firmware because nobody updates a club deck that "works".
// Source: AlphaTheta's own change history PDF, read in full.
//   downloads.support.alphatheta.com/firmwares/dj-players/CDJ-2000NXS/CDJ-2000NXS-Firmware-Change-History-Ver144-en.pdf
export const CDJ_2000NXS = {
  checked: '7 August 2026',
  newestKnown: '1.44',           // 27 Feb 2024, "minor bugs have been fixed"
  // THE ONES THAT END A SET, oldest fix first so the version reads as a floor.
  // FOUR VERSIONS WERE MISSING and the page claimed the history was "read in
  // full" (corrected 2026-08-07). 1.04, 1.20, 1.21 and 1.22 were omitted, so the
  // real total is 16 versions, not the eleven the prose claimed.
  bpmSyncFix: '1.04',            // 29 Oct 2012: BPM could fluctuate during playback using Sync.
                                 // Also the tempo of a track with Slip Mode engaged.
  crashHotCueFix: '1.06',        // 10 Dec 2012: player CRASHES on repeated HOT CUE with Master Tempo on.
  syncDropoutFix: '1.10',        // 25 Feb 2013: audio dropout on the slave deck when using SYNC.
  tagListFreezeFix: '1.11',      // 15 Apr 2013: freeze while editing the TAG LIST.
  browseSlowFix: '1.13',         // 17 Jun 2013: browse screen slows or STOPS after several hours of use,
                                 // plus a freeze holding HOT CUE over 1 second during auto hot cue loading,
                                 // plus playback failing after a large USB (20,000 tracks) is disconnected.
  loopDisplayFix: '1.20',        // 3 Sep 2013: loop beat display returning to WAVE after a loop ends,
                                 // and SYNC MASTER switching automatically when SYNC is disabled.
  needleSearchFix: '1.21',       // 19 Nov 2013: Needle Search pad issues, a sorted playlist not being
                                 // restored on return, and the Master Player switching when an Active
                                 // Loop starts.
  kuvoTagIntro: '1.22',          // 1 Apr 2014: MP3/AIFF tag analysis added for the KUVO service.
  wavHeaderFix: '1.23',          // 17 Feb 2015: an incompatible WAVE header leaves "Loading.." on screen forever.
                                 // Same version fixed folders not listing on a 2TB HDD.
  hddRecognitionFix: '1.24',     // 20 Aug 2015: some HDDs not recognized; noise with Master Tempo.
  aiffLoadFix: '1.25',           // 15 Dec 2015: AIFF 24bit/48kHz playback STOPPED and tracks would not load.
                                 // Same version fixed audio noise while scratching.
  nxs2FeatureFix: '1.30',        // 9 Mar 2016: linked to a CDJ-2000NXS, some CDJ-2000NXS2 features were disabled.
  wavNoiseFix: '1.40',           // 24 Nov 2016: digitally distorted white noise on certain .WAV files.
                                 // Same version fixed a very short active loop and needle-search jumping.
  slipHotCueFix: '1.41',         // 3 Apr 2017: issues during playback and track selection, and SLIP HOT CUE.
  syncBpmFix: '1.43',            // 19 Oct 2017: speed not returning to the displayed BPM with Sync on,
                                 // and a popping noise in a LOOP with QUANTIZE and MASTER TEMPO enabled.
  // Media and library.
  //
  // "FAT32 ONLY" WAS WRONG AND SHIPPED BOLD (corrected 2026-08-07 by an
  // independent fact-check). AlphaTheta's own support article says, verbatim:
  // "The CDJ-2000nexus does not support file systems other than FAT32, FAT or
  // HFS+." So HFS+ IS supported, and a Mac DJ with a working HFS+ drive was
  // being told by this site that their drive could not be read. The true and
  // still-useful claim is the exFAT one: exFAT is what a DJ formats today and
  // this generation cannot read it.
  library: 'Device Library',
  exfat: false,
  fileSystems: ['FAT32', 'FAT', 'HFS+'],
  sourceFileSystems: 'https://support.alphatheta.com/en-US/articles/4406137645977',
  media: 'USB and SD card',
  source: 'https://support.alphatheta.com/en-US/articles/21976886580633',
  sourceHistory: 'https://downloads.support.alphatheta.com/firmwares/dj-players/CDJ-2000NXS/CDJ-2000NXS-Firmware-Change-History-Ver144-en.pdf',
};

// CDJ-900NXS. The 2000NXS's smaller sibling, same era, same FAT32 limit, and a
// change history that stops in 2017: the newest firmware is 1.31 and there has
// been nothing since, so the floor is simply "be at 1.31".
// Source: downloads.support.alphatheta.com/firmwares/dj-players/CDJ-900NXS/CDJ-900NXS-Firmware-Change-History-Ver131-en.pdf
export const CDJ_900NXS = {
  // "ENDED" IS AN INFERENCE HERE TOO (added 2026-08-08 by an audit). The DJM-900NXS
  // and XDJ-1000MK2 constants carry this flag and this one did not, so its page was
  // the only one of the three that stated "there are no more firmware versions" as
  // FACT, and then refuted itself seventy lines later by citing the CDJ-2000NXS
  // shipping a version six years after its previous one. AlphaTheta publish no
  // end-of-support statement for this player either.
  firmwareEndedIsInference: true,
  checked: '7 August 2026',
  newestKnown: '1.31',           // 5 Oct 2017. Nothing published since.
  beatDivideFix: '1.20',         // 1 Apr 2014: playback sound STOPS while BEAT DIVIDE is active.
  hddFolderFix: '1.21',          // 17 Feb 2015: folder browsing on 2TB HDDs; slow track list in Serato DJ HID.
  hddRecognitionFix: '1.22',     // 20 Aug 2015: HDD recognition; noise when Master Tempo is activated.
  aiffLoadFix: '1.30',           // 24 Nov 2016: AIFF 24bit/48kHz playback stopped and tracks would not load.
  wavNoiseFix: '1.30',           // Same version: digitally distorted white noise on certain .WAV files.
  nxs2LinkFix: '1.30',           // Same version: PRO DJ LINK compatibility with CDJ-2000NXS2 and XDJ-1000MK2.
  syncBpmFix: '1.31',            // 5 Oct 2017: speed not returning to the displayed BPM with Sync enabled.
  // Same correction as the CDJ-2000NXS: "FAT32 only" was wrong. AlphaTheta:
  // "The CDJ-900NXS does not support file systems other than FAT32, FAT or HFS+."
  library: 'Device Library',
  exfat: false,
  fileSystems: ['FAT32', 'FAT', 'HFS+'],
  sourceFileSystems: 'https://support.alphatheta.com/en-US/articles/4406501395993',
  media: 'USB and SD card',
  source: 'https://support.alphatheta.com/en-US/articles/4404787206681',
  sourceHistory: 'https://downloads.support.alphatheta.com/firmwares/dj-players/CDJ-900NXS/CDJ-900NXS-Firmware-Change-History-Ver131-en.pdf',
};

// XDJ-700. The compact Device Library player, and the one with the tightest
// file-system limit of the lot: officially FAT32, FAT or HFS+ only, no exFAT.
// Still updated far more recently than the CDJ-900NXS, 1.15 in Nov 2024.
// Source: assets.pioneerdjhub.com/XDJ-700-Firmware-Change-History-ver115-en2.pdf
export const XDJ_700 = {
  checked: '7 August 2026',
  newestKnown: '1.15',           // 7 Nov 2024
  // VERSION 1.10 WAS MISSING, and it is the one with the set-enders (corrected
  // 2026-08-07). The page claimed the change history was "read in full" while
  // starting at 1.11, so the faults this site exists to warn about were absent
  // from the very model page that should carry them.
  aiffLoadFix: '1.10',           // 10 Nov 2016: AIFF 24bit/48kHz playback stopped and tracks could not
                                 // be loaded to a deck.
  wavNoiseFix: '1.10',           // Same version: digitally distorted white noise on certain .WAV files.
  nxs2LinkFix: '1.10',           // Same version: over PRO DJ LINK, some features of the CDJ-2000NXS2 or
                                 // XDJ-1000MK2 were disabled.
  controlModeFix: '1.10',        // Same version: problems in Control Mode, and an active loop activating
                                 // a very short loop.
  browserManyTracksFix: '1.11',  // 7 Mar 2017: categories and tracks not shown in the browser on a large database.
                                 // Same version fixed search results not appearing when moving the cursor.
  searchFix: '1.12',             // 25 Apr 2017: SEARCH worked incorrectly under certain conditions.
  syncBpmFix: '1.13',            // 19 Oct 2017: speed not returning to the displayed BPM with Sync enabled,
                                 // and a popping noise in a LOOP with QUANTIZE and MASTER TEMPO enabled.
  ecoStandbyIntro: '1.14',       // 22 Aug 2024: EU Ecodesign auto power off changed to 20 minutes.
  usbAudioControlFix: '1.15',    // 7 Nov 2024: USB audio did not work in DJ Software Control mode.
  library: 'Device Library',
  exfat: false,
  fileSystems: ['FAT32', 'FAT', 'HFS+'],
  media: 'USB only',
  source: 'https://support.alphatheta.com/en-US/articles/4404827627545',
  sourceHistory: 'https://assets.pioneerdjhub.com/XDJ-700-Firmware-Change-History-ver115-en2.pdf',
};

// euphonia. AlphaTheta's 4-channel rotary mixer. NO FIRMWARE CHANGE HISTORY IS
// PUBLISHED, checked 7 August 2026, so the Known issues section on its page says
// that and lists nothing, exactly as on the CDJ-1500X and DJM-V5 pages.
//
// PRO DJ LINK IS NOT STATED on the official product page, in either direction.
// That is recorded as null rather than guessed at: this mixer has no LAN
// terminal listed among its connections, and asserting either way without a
// source would be the kind of claim this file exists to prevent.
// Source: alphatheta.com/en/product/dj-mixer/euphonia/black/
export const EUPHONIA = {
  checked: '7 August 2026',
  channels: 4,
  rotary: true,
  // Rotary faders, and therefore no crossfader. Same practical consequence as
  // the DJM-V5 and the V10-LF: this is a blending desk, not a cutting desk.
  crossfader: false,
  converters: '32-bit A/D and D/A',
  dsp: '96 kHz / 64-bit floating point mixing in the DSP',
  // The headline of the whole product: a master transformer circuit co-designed
  // with Rupert Neve Designs, applied to all master output.
  transformer: 'Master transformer circuit co-designed by AlphaTheta and Rupert Neve Designs, applied to all master audio output',
  masterIsolator: '3-band (low, mid, high) with Boost Send and a Boost Level of +12dB, +6dB or 0dB',
  // THE HPF IS ONE OF THE SEND EFFECTS, not a separate channel filter, and
  // splitting it out here produced advice that does not work on the desk
  // (corrected 2026-08-07). AlphaTheta lists all six together: "5 built-in
  // spatial effects and a high-pass filter: Delay, Tape Echo, Echo Verb, Reverb,
  // Shimmer, and HPF", and the manual places HPF on the SEND FX selector, applied
  // through the send path rather than on a channel's direct output. The page had
  // told a DJ to "use the high-pass filter to pull a track out of the way",
  // which is a channel-filter move this mixer does not have.
  sendEffects: ['Delay', 'Tape Echo', 'Echo Verb', 'Reverb', 'Shimmer', 'HPF'],
  hpfIsSendFx: true,
  externalFx: 'Send/Return plus a Master Insert',
  energyVisualizer: true,
  inputs: 'Digital (coaxial) x4, Line (RCA) x4, Phono (RCA) x4, Mic x1 (XLR / 1/4" TRS)',
  outputs: 'Master (XLR), Booth (1/4" TRS), REC (RCA), Phones (1/4" and 3.5mm)',
  usbPorts: 'USB Type-C x1',
  // PRO DJ LINK: NOT SUPPORTED, AND THIS WAS RECORDED AS UNKNOWN BY MISTAKE.
  // Corrected 2026-08-07. AlphaTheta publishes a compatibility table, "What DJ
  // units support PRO DJ LINK?", and the euphonia row reads no for Wi-Fi, no for
  // USB and no for Ethernet. It is the only unit in that table with no support on
  // any connection. The manual also documents no LAN terminal.
  //
  // The earlier `null` was not caution, it was an incomplete search: this page
  // told a reader planning a rig to "confirm with AlphaTheta" about a question
  // AlphaTheta had already answered in public. Publishing "we do not know" is
  // only honest when nobody knows.
  proDjLink: false,
  sourceProDjLink: 'https://support.alphatheta.com/en-US/articles/8840691832985',
  software: ['rekordbox', 'Serato DJ Pro'],
  dvs: true,
  dimensions: '429.2 x 331.0 x 119.9 mm',
  weight: '9.5 kg',
  newestKnown: null,             // no published change history
  source: 'https://alphatheta.com/en/product/dj-mixer/euphonia/black/',
  sourceAnnounce: 'https://alphatheta.com/en/information/meet-the-euphonia-professional-rotary-mixer/',
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
  // "FAT32 only" SHIPPED ON THESE FOUR ROWS AND WAS WRONG (corrected 2026-08-07).
  // Every one of these players reads HFS+ as well, which means a Mac DJ with a
  // working HFS+ drive was being told by this table that it could not be read.
  // exFAT remains correctly No on all of them, and exFAT is the one a DJ formats
  // today, so the useful half of the claim survives. Verified per model against
  // AlphaTheta's own support articles and operating instructions:
  //   CDJ-2000NXS2  FAT16, FAT32, HFS+  manual DRI1290A, "About USB devices"
  //   CDJ-2000      FAT, FAT32, HFS+    support.alphatheta.com/en-US/articles/19501354615449
  //   CDJ-2000NXS   FAT32, FAT, HFS+    support.alphatheta.com/en-US/articles/4406137645977
  //   CDJ-900NXS    FAT32, FAT, HFS+    support.alphatheta.com/en-US/articles/4406501395993
  //   CDJ-900       FAT16, FAT32, HFS+  support.alphatheta.com/en-US/articles/19545915622937
  //   CDJ-850       FAT16, FAT32, HFS+  support.alphatheta.com/en-US/articles/19618126081561
  // AlphaTheta's docs disagree with themselves on FAT versus FAT16 for some of
  // these. They agree on FAT32 and HFS+, which is what the note claims.
  //
  // NTFS is separately unsupported everywhere and is stated in the caveat below
  // the table rather than repeated on every row.
  { m: 'CDJ-2000NXS2',   lib: 'Device Library', exfat: 'No',                 note: 'The workhorse in most club booths. FAT32, FAT16 or HFS+.' },
  { m: 'CDJ-2000 / NXS', lib: 'Device Library', exfat: 'No',                 note: 'Still everywhere. FAT32, FAT or HFS+.' },
  { m: 'CDJ-900NXS',     lib: 'Device Library', exfat: 'No',                 note: 'FAT32, FAT or HFS+. Nothing published since 1.31 in 2017.' },
  { m: 'CDJ-900 / 850',  lib: 'Device Library', exfat: 'No',                 note: 'FAT32, FAT16 or HFS+.' },
  { m: 'XDJ-AZ',         lib: 'OneLibrary',     exfat: 'Yes',                note: '' },
  // XDJ-AN: added to rekordbox in 7.2.16 alongside the CDJ-1500X. Filesystems
  // (FAT16/FAT32/exFAT/HFS+) per official article
  // support.alphatheta.com/en-US/articles/53214453591009.
  { m: 'XDJ-AN',         lib: 'OneLibrary',     exfat: 'Yes',                note: 'Added in rekordbox 7.2.16.' },
  { m: 'XDJ-RX3',        lib: 'Device Library', exfat: 'Yes, firmware 1.11+', note: '' },
  { m: 'XDJ-XZ',         lib: 'Device Library', exfat: 'Yes, firmware 1.23+', note: '' },
  // XDJ-1000MK2 ADDED 2026-08-07, having been DELIBERATELY EXCLUDED until now with
  // the note "no official filesystem article, we will not guess". The narrow claim
  // was true and the useful one was wrong: the formats are a spec-table row in the
  // Operating Instructions DRI1396-B and the Quick Start Guide DRH1671-C,
  // "Supported file systems FAT16, FAT32 and HFS+ (NTFS is not supported.)"
  // A support article is not the only place AlphaTheta documents a fact.
  { m: 'XDJ-1000MK2',    lib: 'Device Library', exfat: 'No',                 note: 'FAT16, FAT32 or HFS+. Only the first partition of a drive is read.' },
  { m: 'XDJ-700',        lib: 'Device Library', exfat: 'No',                 note: 'Officially FAT32, FAT or HFS+ only.' },
  { m: 'OPUS-QUAD',      lib: 'OneLibrary',     exfat: 'Yes',                note: 'First OneLibrary player.' },
  { m: 'OMNIS-DUO',      lib: 'OneLibrary',     exfat: 'Yes',                note: '' },
];


// XDJ-1000MK2. Added 2026-08-07, and it ARRIVES WITH A CORRECTION TO THIS SITE.
//
// The rekordbox page has been publishing this caveat: "There is no official
// AlphaTheta filesystem article for either the XDJ-1000MK2 or the XDJ-RX2, and we
// will not guess about a drive you are going to trust with a gig. Treat both as
// FAT32-only and you will be fine."
//
// The narrow claim was TRUE, there is no support-centre article. The useful claim
// was WRONG: the file systems are documented, as a specification-table row in the
// Operating Instructions and again in the Quick Start Guide. "FAT16, FAT32 and
// HFS+ (NTFS is not supported.)"
//
// THIS IS THE THIRD TIME TODAY the same failure has been found: refusing to answer
// a question the vendor HAD answered, because the answer was not where we looked.
// The euphonia PRO DJ LINK refusal was the first, the "FAT32 only" claim on six
// models was the second. The rule that keeps surviving: publishing "we do not
// know" is honest only AFTER looking properly, and a support article is not the
// only place AlphaTheta documents a fact. The manual counts. The spec table counts.
export const XDJ_1000MK2 = {
  checked: '7 August 2026',
  newestKnown: '1.45',              // 22 Aug 2024, Ecodesign. Reference only.
  ecoStandbyIntro: '1.45',          // 22 Aug 2024: EU Ecodesign, 20 minutes, renamed Power Management.
  alacPlayFix: '1.42',              // 4 Feb 2020: some Apple Lossless files would not play.
  catalinaAudioFix: '1.42',         // 4 Feb 2020: macOS Catalina 10.15 could not see it as an audio device.
  matchingFix: '1.41',              // 21 Aug 2018: inconsistencies in the matching function.
  loopPopFix: '1.30',               // 21 Sep 2017: popping noise during a LOOP with QUANTIZE and MASTER TEMPO on.
  hotCueLoopFix: '1.30',            // 21 Sep 2017: a HOT CUE fired after jumping to LOOP-IN when changing loop beat length with QUANTIZE on.
  ddjXp1Intro: '1.30',              // 21 Sep 2017: DDJ-XP1 added.
  syncBpmFix: '1.23',               // 13 Jul 2017: playback speed did not return to the displayed BPM with Sync on.
  apeTagLoopFix: '1.22',            // 3 Apr 2017: emergency loop on certain MP3s carrying APE tag data.
  controlModeDropoutFix: '1.20',    // 7 Feb 2017: audio dropouts in Control Mode.
  longSessionLoadFix: '1.20',       // 7 Feb 2017: track load time grew after several hours of use.
  slipHotCueFix: '1.20',            // 7 Feb 2017: issues using SLIP HOT CUE.
  tour1PlaybackFix: '1.10',         // 25 Aug 2016: some tracks would not play on a linked CDJ-TOUR1.
  hidIntro: '1.10',                 // 25 Aug 2016: rekordbox dj HID control.
  media: 'USB only, with no SD card slot and no disc drive',
  library: 'Device Library',
  // Spec-table row, Operating Instructions DRI1396-B and Quick Start Guide
  // DRH1671-C: "Supported file systems FAT16, FAT32 and HFS+ (NTFS is not
  // supported.)" Firmware UPDATE specifically requires FAT or FAT32, not HFS+.
  fileSystems: ['FAT16', 'FAT32', 'HFS+'],
  exfat: false,
  ntfsSupported: false,
  sourceFileSystems: 'https://downloads.support.alphatheta.com/manuals/dj-players/XDJ-1000MK2/XDJ-1000MK2_DRI1396B_manual.pdf',
  maxPlayers: 4,                    // PRO DJ LINK, over LAN
  hotCues: 8,
  folderLayers: 8,                  // files deeper than the 8th layer cannot be played
  cueLoopPointsPerTrack: 10,        // the 11th is refused with CUE/LOOP POINT FULL
  firstPartitionOnly: true,         // only the first partition of a multi-partition drive is usable
  usbHubs: false,
  ecoStandbyMinutes: 20,
  screen: '7 inch full colour LCD touch screen',
  // NO END-OF-SUPPORT STATEMENT IS PUBLISHED. 1.45 is the newest and it is two
  // years old, and the last release was regulatory rather than functional, but
  // "the firmware line has ended" is an INFERENCE from silence and the page must
  // say so rather than assert it. Same discipline as the CDJ-900NXS page.
  firmwareEndedIsInference: true,
  source: 'https://downloads.support.alphatheta.com/firmwares/dj-players/XDJ-1000MK2/XDJ-1000MK2-Firmware-Change-History-Ver145-en.pdf',
  sourceManual: 'https://downloads.support.alphatheta.com/manuals/dj-players/XDJ-1000MK2/XDJ-1000MK2_DRI1396B_manual.pdf',
  sourceFirmwarePage: 'https://support.alphatheta.com/en-US/articles/4404821857945',
};

// DJM-750MK2. Added 2026-08-07.
//
// THE HONEST FRAMING: this is a four-channel mixer with the DJM-900NXS2's EQ,
// fader curve, SOUND COLOR FX, BEAT FX and SEND/RETURN, and NO PRO DJ LINK. There
// is no LAN terminal in the specifications and no LAN item in the rear-panel list,
// and AlphaTheta defines PRO DJ LINK as a LAN-cable feature. In a booth with CDJs
// it is a standalone mixer: no linked BPM, no quantised sync from the players, no
// rekordbox over LAN. That is a booking-stage fact rather than a soundcheck one.
//
// The two capability limits below are the reason a DJ thinks it is broken when it
// is not, and they are the most useful thing on the page.
export const DJM_750MK2 = {
  checked: '7 August 2026',
  newestKnown: '1.07',              // 23 Jun 2026. Reference only.
  iosAudioFix: '1.07',              // 23 Jun 2026: audio communication with iOS/iPadOS devices.
  ecoStandbyIntro: '1.06',          // 18 Jul 2024: EU Ecodesign, 20 minutes, renamed Power Management.
  minorFix: '1.05',                 // 18 May 2021: "Minor issues", no detail published.
  recHaltFix: '1.04',               // 15 Jan 2020: DJM-REC recording or live streaming sometimes stopped.
  fxAssignPopFix: '1.03',           // 8 Aug 2017: popping noise via USB audio (FX SEND/RETURN) when switching FX assign with BEAT FX on.
  // The published history STARTS at 1.03. Versions 1.00 to 1.02 are not listed,
  // so their contents are not published. Do not describe the history as complete.
  historyStartsAt: '1.03',
  channels: 4,
  crossfader: true,                 // Magvel, with CROSS FADER ASSIGN A/THRU/B per channel
  sendReturn: true,                 // AUX or INSERT return, analogue jacks or digital USB for iOS
  beatFxCount: 11,
  beatFx: ['DELAY', 'ECHO', 'PING PONG', 'SPIRAL', 'REVERB', 'TRANS', 'FLANGER', 'PITCH', 'ROLL', 'VINYL BRAKE', 'HELIX'],
  soundColorFx: ['DUB ECHO', 'SWEEP', 'NOISE', 'FILTER'],
  usbPorts: 'one Type A on the top panel for a mobile device, one Type B on the rear for a computer',
  proDjLink: false,                 // no LAN terminal exists on this mixer
  sourceProDjLink: 'https://downloads.support.alphatheta.com/manuals/dj-mixers/DJM-750MK2/DJM-750MK2_DRI1470C_manual.pdf',
  dvs: true,                        // rekordbox dvs and TRAKTOR PRO 3
  seratoCertified: false,           // AlphaTheta: Serato DJ "may not work normally", not certified
  // ONE headphone output in two connector sizes, which AlphaTheta also markets as
  // usable by two DJs at once. Recorded as the spec states it, not as marketing.
  headphoneOutputs: 'one 1/4 inch stereo jack and one 3.5 mm stereo mini jack',
  micInputs: 1,                     // a single combo XLR / 1/4 inch TRS
  // TWO CAPABILITY LIMITS THAT LOOK LIKE FAULTS, both documented by AlphaTheta.
  // 1. Several effects never reach the RETURN AUX channel by design, so a DJ who
  //    patches an iOS or outboard effect in AUX mode hears nothing.
  // 2. Beat FX cannot be pre-listened on channels 1 to 4 with CUE.
  auxReturnSilentFx: ['DUB ECHO', 'DELAY', 'ECHO', 'PING PONG', 'SPIRAL', 'REVERB', 'TRANS', 'FLANGER', 'PITCH'],
  sourceAuxReturn: 'https://support.alphatheta.com/en-US/articles/4411086479897',
  cueNotMonitorableFx: ['DELAY', 'ECHO', 'PING PONG', 'SPIRAL', 'REVERB'],
  usbHubs: false,
  ecoStandbyMinutes: 20,
  // Firmware update reads a USB stick, and ONLY for that. There is no music
  // playback or recording to storage: DJM-REC records to an iPhone or iPad.
  updateFileSystems: ['FAT', 'FAT32'],
  sourceUpdate: 'https://support.alphatheta.com/en-US/articles/4413930690329',
  dimensions: '320.0 x 107.9 x 387.9 mm',
  weight: '6.6 kg',
  source: 'https://downloads.support.alphatheta.com/firmwares/dj-mixers/DJM-750MK2/DJM-750MK2-Firmware-Change-History-Ver107-en.pdf',
  sourceManual: 'https://downloads.support.alphatheta.com/manuals/dj-mixers/DJM-750MK2/DJM-750MK2_DRI1470C_manual.pdf',
  sourceSpecs: 'https://downloads.support.alphatheta.com/manuals/dj-mixers/DJM-750MK2/DJM-750MK2_DRH1650D_quickstart-manual.pdf',
};

// DJM-900NXS. Added 2026-08-07. The first nexus generation, NOT the NXS2.
//
// THE ONE FACT THAT MATTERS MOST: below firmware 1.28 this mixer is documented to
// SHUT ITSELF DOWN. AlphaTheta's own wording is "an infrequently-encountered issue
// where DJM-900NXS unexpectedly shuts down". That is the whole master output going
// away mid-set, in the mixer that was the club standard for years and is still
// installed in a lot of rooms nobody has updated.
//
// SECOND: below 1.32 it can refuse to LEAVE standby when the wake button is
// pressed. So a mixer that went to sleep between sets can look dead.
//
// NO USB STORAGE ROLE AT ALL, and this one is genuinely unusual. Firmware is
// updated FROM A COMPUTER OVER THE LAN CABLE into the LINK port, not from a USB
// stick like every other Pioneer unit on this site. So there is no file system
// question here: exFAT and NTFS are not unsupported, they are not applicable.
export const DJM_900NXS = {
  checked: '7 August 2026',
  newestKnown: '1.32',              // 15 Nov 2016. Reference only.
  wakeUpFix: '1.32',                // 15 Nov 2016: standby sometimes could not be cancelled with LFO FORM (WAKE UP).
  usbNoiseFix: '1.31',              // 27 Feb 2014: noise in USB audio in and out on some computers.
  effectsNotEngagingFix: '1.30',    // 16 Oct 2013: some effects did not work as expected when switched on.
  peakLimiterIntro: '1.30',         // 16 Oct 2013: Peak Limiter added, and it is ON by default after updating.
  kuvoIntro: '1.30',                // 16 Oct 2013
  shutdownFix: '1.28',              // 26 Nov 2012: the unit unexpectedly shutting down. THE BIG ONE.
  slipBpmDisplayFix: '1.28',        // 26 Nov 2012: BPM display fluctuating when SLIP was used on a linked CDJ-2000NXS or CDJ-900.
  mountainLionSupport: '1.26',      // 19 Nov 2012
  rollVolumeFix: '1.26',            // 26 Jun 2012: ROLL, REV ROLL and SLIP ROLL volume not always stable.
  revRollSilentFix: '1.26',         // 26 Jun 2012: no effect sound when REV ROLL followed ROLL immediately.
  xpadNoiseFix: '1.26',             // 26 Jun 2012: slight noise while operating the X-PAD.
  midiClockFix: '1.21',             // 5 Oct 2011
  channels: 4,
  crossfader: true,
  sendReturn: true,                 // discrete SEND and RETURN terminals for an outboard effector
  beatFxCount: 13,                  // 13 internal effects; the selector has a 14th position, SND/RTN
  beatFxSelectorPositions: 14,
  soundColorFx: ['FILTER', 'CRUSH', 'GATE/COMP', 'DUB ECHO', 'NOISE', 'SPACE'],
  eqBands: 3,                       // 3-band EQ isolator per channel
  proDjLink: true,
  maxPlayers: 4,                    // with a switching hub
  maxComputers: 2,
  hubRequired: true,                // 100Base-TX, and AlphaTheta warns some hubs do not work
  dvs: true,                        // rekordbox dvs (DVS Plus Pack), Serato DJ DVS (Club Kit), TRAKTOR SCRATCH certified
  traktorCertified: true,
  traktorFirmwareFloor: '1.28',     // AlphaTheta renders this as "1.280"
  seratoScratchLive: false,         // explicitly NOT supported, per the product page
  micInputs: 2,
  samplingRate: '96 kHz',
  // NO STORAGE ROLE. Firmware updates over LAN from a computer, so there is no
  // USB stick and no file system to get wrong.
  usbStorageRole: false,
  updateOverLan: true,
  // Quantize does NOT apply to four of the Beat FX, silently. A DJ expecting
  // beat-locked FX gets un-quantised FX and no error.
  quantizeExcludedFx: ['REVERB', 'ROBOT', 'MELODIC', 'SND/RTN'],
  // Peak Limiter is ON by default after a firmware update, in CLUB SETUP as
  // PKLIMIT. It is the answer to "why does the master sound squashed".
  peakLimiterDefaultOn: true,
  // NO END-OF-SUPPORT STATEMENT IS PUBLISHED. 1.32 is from November 2016 and is
  // still the offered download, which is nearly ten years. "Ended" is an
  // INFERENCE from silence, not a documented fact, and the page says so.
  firmwareEndedIsInference: true,
  // AlphaTheta names NO predecessor and NO successor for this mixer, and does not
  // describe the NXS2 as replacing it. It shipped firmware 1.32 ten months AFTER
  // the NXS2 was announced, so the two overlapped as supported products. Do not
  // write that the NXS2 replaced it, and do not write that it replaced a DJM-800:
  // that claim exists only on blogs.
  successorDocumented: false,
  archivedUrlPath: true,            // it lives on an /archive/ path, with no textual notice
  source: 'https://downloads.support.alphatheta.com/firmwares/dj-mixers/DJM-900NXS/DJM-900NXS-Windows-Firmware-Change-History-Ver132-en.pdf',
  sourceManual: 'https://downloads.support.alphatheta.com/manuals/dj-mixers/DJM-900NXS/DJM-900NXS_DRB1741_manual.pdf',
  sourceProduct: 'https://www.pioneerdj.com/en-us/product/mixer/archive/djm-900nxs/black/overview/',
  sourcePeakLimiter: 'https://downloads.support.alphatheta.com/firmwares/dj-mixers/DJM-900NXS/PEAK_LIMITER_DJM-900NXS_E.pdf',
};
// ---------------------------------------------------------------------------
// FIRMWARE ISSUE MATRIX (2026-08-01)
//
// POSITION IN THIS FILE IS LOAD ORDER, NOT TASTE (moved 2026-08-08). This array
// used to sit in the middle of the model constants, which worked only for as
// long as every model it referenced happened to be declared above it. Adding the
// XDJ-1000MK2, DJM-900NXS, DJM-750MK2 and euphonia rows broke the module
// outright with "Cannot access before initialization", because those four are
// declared further down. It now sits AFTER every model constant, so any model in
// this file can be referenced here. Keep it last.
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
/*
 * TWO STRINGS SHARED BY SEVERAL ENTRIES, named rather than repeated.
 *
 * They were copied by hand into each entry until 2026-08-08, when adding the
 * XDJ-1000MK2 and the DJM-750MK2 would have made the Ecodesign paragraph appear
 * three times. A sentence written out three times is three sentences that can
 * drift, and the /pt and /es pages translate these BY EXACT STRING MATCH, so a
 * one-word divergence in any copy silently drops that row back to English.
 * That is precisely the bug the firmware i18n gate check exists to catch, and
 * one constant removes the chance of creating it.
 */
const NO_HISTORY_PUBLISHED =
  'AlphaTheta has published no firmware change history for this unit, so there is no documented fix to report. This section stays empty until one exists.';
/*
 * WARNING KIND: 'withdrawn' OR 'behaviour', AND IT IS NOT COSMETIC.
 *
 * A warning was a single shape until 2026-08-08, because the only one was the
 * CDJ-3000's firmware 3.30, which AlphaTheta genuinely pulled. The page raises
 * the safe floor around it and prints "except 3.30 (withdrawn)", correctly: an
 * open-ended "3.20 or later" would otherwise recommend a release you must not
 * install.
 *
 * Then the Ecodesign standby warnings arrived, and the XDJ-1000MK2's sits at
 * 1.45, ABOVE its 1.42 floor. The page did what it was built to do and told
 * every reader that the XDJ-1000MK2's current, recommended, only firmware had
 * been WITHDRAWN. That is worse than the omission it replaced: it sends a DJ
 * away from the release they should be running. It shipped live and an audit of
 * the rendered page caught it within the hour.
 *
 * The XDJ-700 and DJM-750MK2 escaped only by luck, their Ecodesign versions
 * happen to sit below their floors. So the fix is the mechanism, not the
 * instance: only a 'withdrawn' warning moves the floor or earns that word.
 * 'behaviour' means the version changed how the unit acts and there is nothing
 * to avoid.
 *
 * This is the same lesson as rank() returning ORDER.length and FLOOR =
 * newestKnown. A generalisation that keeps working on new input while quietly
 * changing what it MEANS is more dangerous than one that throws.
 */
const ECODESIGN_STANDBY =
  'Not a defect. From this version the unit automatically switches off after 20 minutes of no use when Power Management is on, following the EU Ecodesign Directive. A deck that powered down during a long changeover is obeying that setting, not failing.';

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
      // See the WARNING KIND note above ECODESIGN_STANDBY. This one really was
      // pulled, so it is the only kind that raises the safe floor.
      kind: 'withdrawn',
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
    // THE LONGEST LIST HERE, and the reason this matrix exists. Eleven versions of
    // documented faults on a player still installed in an enormous number of
    // booths, most of which have never been updated. Every entry is AlphaTheta's
    // own wording, condensed, from the change history PDF read in full.
    model: 'CDJ-2000NXS',
    href: '/knowledge/pioneer-dj/cdj-2000nxs',
    source: CDJ_2000NXS.sourceHistory,
    issues: [
      // THREE ROWS THAT WERE MISSING UNTIL 2026-08-08. The constant above carries
      // fourteen defect fixes and this list carried eleven. 1.04, 1.20 and 1.21 were
      // absent, which is the same shape of error the constant's own comment records:
      // the page said the history had been read in full while four versions were
      // missing. Reading it in full and then transcribing part of it is the same
      // outcome for the reader. The audit named two of the three; counting the fix
      // fields found the third.
      { fixedIn: CDJ_2000NXS.bpmSyncFix, area: 'Playback', midSet: true, symptom: 'BPM could fluctuate during playback using Sync, and so could the tempo of a track with Slip Mode engaged.' },
      { fixedIn: CDJ_2000NXS.crashHotCueFix, area: 'Playback', midSet: true, symptom: 'The player crashed on repeated HOT CUE presses with Master Tempo enabled.' },
      { fixedIn: CDJ_2000NXS.syncDropoutFix, area: 'Audio', midSet: true, symptom: 'Audio dropout on the slave deck when using SYNC.' },
      { fixedIn: CDJ_2000NXS.tagListFreezeFix, area: 'Browse', midSet: true, symptom: 'A freeze could occur while editing the TAG LIST.' },
      { fixedIn: CDJ_2000NXS.browseSlowFix, area: 'Browse', midSet: true, symptom: 'The browse screen slowed or stopped after several hours of use, and a freeze occurred holding HOT CUE over a second during auto hot cue loading.' },
      { fixedIn: CDJ_2000NXS.loopDisplayFix, area: 'Display', midSet: false, symptom: 'The loop beat display returned to WAVE after a loop ended, and SYNC MASTER switched itself when SYNC was disabled.' },
      { fixedIn: CDJ_2000NXS.needleSearchFix, area: 'Playback', midSet: true, symptom: 'Needle Search pad faults, a sorted playlist not being restored on return, and the Master Player switching when an Active Loop started.' },
      { fixedIn: CDJ_2000NXS.wavHeaderFix, area: 'Playback', midSet: true, symptom: 'A WAVE file with an incompatible header left "Loading.." on screen indefinitely. Folders did not list on a 2TB HDD.' },
      { fixedIn: CDJ_2000NXS.hddRecognitionFix, area: 'USB', midSet: true, symptom: 'Some hard drives were not recognized. Noise when Master Tempo was activated.' },
      { fixedIn: CDJ_2000NXS.aiffLoadFix, area: 'Playback', midSet: true, symptom: 'AIFF at 24bit/48kHz stopped playing and could not be loaded to a deck. Audio noise while scratching.' },
      { fixedIn: CDJ_2000NXS.nxs2FeatureFix, area: 'Link', midSet: true, symptom: 'Linked to a CDJ-2000NXS, some CDJ-2000NXS2 features were disabled.' },
      { fixedIn: CDJ_2000NXS.wavNoiseFix, area: 'Audio', midSet: true, symptom: 'Digitally distorted white noise on certain WAV files. An active loop could activate a very short loop.' },
      { fixedIn: CDJ_2000NXS.slipHotCueFix, area: 'Playback', midSet: true, symptom: 'Issues during playback and track selection, and with SLIP HOT CUE.' },
      { fixedIn: CDJ_2000NXS.syncBpmFix, area: 'Playback', midSet: true, symptom: 'Speed did not return to the displayed BPM with Sync on. Popping noise in a loop with QUANTIZE and MASTER TEMPO enabled.' },
    ],
  },
  {
    /*
     * NO PUBLISHED CHANGE HISTORY, AND IT SAYS SO RATHER THAN BEING ABSENT.
     * Added 2026-08-08 with DJM-V5 and euphonia for one reason: a DJ who looks up
     * their own unit and finds NO ROW cannot tell "AlphaTheta has published no
     * fixes" from "this site has not got to it yet". Those are opposite answers
     * and the reader was being left to guess which one they had. An empty section
     * with a sentence in it answers the question; an omission does not.
     */
    model: 'CDJ-1500X',
    href: '/knowledge/pioneer-dj/cdj-1500x',
    source: CDJ_1500X.source,
    issues: [],
    noneNote: NO_HISTORY_PUBLISHED,
  },
  {
    // Its history ENDED at 1.31 in October 2017, so the floor and the ceiling are
    // the same number and no fix is coming for anything not listed here.
    model: 'CDJ-900NXS',
    href: '/knowledge/pioneer-dj/cdj-900nxs',
    source: CDJ_900NXS.sourceHistory,
    issues: [
      { fixedIn: CDJ_900NXS.beatDivideFix, area: 'Audio', midSet: true, symptom: 'Playback sound stopped while BEAT DIVIDE was activated.' },
      { fixedIn: CDJ_900NXS.hddFolderFix, area: 'Browse', midSet: true, symptom: 'Folder browsing failed on 2TB hard drives. Slow track list browsing in Serato DJ HID mode.' },
      { fixedIn: CDJ_900NXS.hddRecognitionFix, area: 'USB', midSet: true, symptom: 'Some hard drives were not recognized. Noise when Master Tempo was activated.' },
      { fixedIn: CDJ_900NXS.aiffLoadFix, area: 'Playback', midSet: true, symptom: 'AIFF at 24bit/48kHz stopped playing and could not be loaded. Digitally distorted white noise on certain WAV files.' },
      { fixedIn: CDJ_900NXS.nxs2LinkFix, area: 'Link', midSet: true, symptom: 'PRO DJ LINK compatibility with the CDJ-2000NXS2 and XDJ-1000MK2.' },
      { fixedIn: CDJ_900NXS.syncBpmFix, area: 'Playback', midSet: true, symptom: 'Speed did not return to the displayed BPM with Sync enabled.' },
    ],
  },
  {
    /*
     * ADDED 2026-08-08, and its absence was the second worst on this page. This
     * player is in an enormous number of installed booths, its own model page
     * carries the full fault list, and the link that brings a reader here says
     * "Every model". Eleven documented fixes across seven versions were sitting
     * one file away from the aggregation that exists to hold them.
     */
    model: 'XDJ-1000MK2',
    href: '/knowledge/pioneer-dj/xdj-1000mk2',
    source: XDJ_1000MK2.source,
    warning: {
      kind: 'behaviour',
      version: XDJ_1000MK2.ecoStandbyIntro,
      text: ECODESIGN_STANDBY,
      sourceUrl: XDJ_1000MK2.source,
    },
    issues: [
      { fixedIn: XDJ_1000MK2.alacPlayFix, area: 'Playback', midSet: true, symptom: 'Some Apple Lossless files would not play.' },
      { fixedIn: XDJ_1000MK2.catalinaAudioFix, area: 'Audio', midSet: true, symptom: 'macOS Catalina 10.15 could not see the unit as an audio device.' },
      { fixedIn: XDJ_1000MK2.matchingFix, area: 'Browse', midSet: false, symptom: 'Inconsistencies in the matching function.' },
      { fixedIn: XDJ_1000MK2.loopPopFix, area: 'Audio', midSet: true, symptom: 'Popping noise during a LOOP with QUANTIZE and MASTER TEMPO on.' },
      { fixedIn: XDJ_1000MK2.hotCueLoopFix, area: 'Playback', midSet: true, symptom: 'A HOT CUE fired after jumping to LOOP-IN when changing the loop beat length with QUANTIZE on.' },
      // Reuses the CDJ-900NXS wording deliberately. It is the same documented
      // symptom on a different unit, and one string means one translation rather
      // than two that drift apart.
      { fixedIn: XDJ_1000MK2.syncBpmFix, area: 'Playback', midSet: true, symptom: 'Speed did not return to the displayed BPM with Sync enabled.' },
      { fixedIn: XDJ_1000MK2.apeTagLoopFix, area: 'Playback', midSet: true, symptom: 'Emergency loop triggering on certain MP3 files carrying APE tag data.' },
      { fixedIn: XDJ_1000MK2.controlModeDropoutFix, area: 'Audio', midSet: true, symptom: 'Audio dropouts during Control Mode playback.' },
      { fixedIn: XDJ_1000MK2.longSessionLoadFix, area: 'Browse', midSet: true, symptom: 'Track load time grew after several hours of use.' },
      { fixedIn: XDJ_1000MK2.slipHotCueFix, area: 'Playback', midSet: false, symptom: 'Faults using SLIP HOT CUE.' },
      { fixedIn: XDJ_1000MK2.tour1PlaybackFix, area: 'Link', midSet: true, symptom: 'Some tracks would not play on a linked CDJ-TOUR1.' },
    ],
  },
  {
    // The Ecodesign entry is a BEHAVIOUR, not a defect, so it rides as a warning
    // rather than an issue: a deck that switched itself off is obeying a setting,
    // and calling it a fault would send a DJ looking for a repair.
    model: 'XDJ-700',
    href: '/knowledge/pioneer-dj/xdj-700',
    source: XDJ_700.sourceHistory,
    warning: {
      kind: 'behaviour',
      version: XDJ_700.ecoStandbyIntro,
      text: ECODESIGN_STANDBY,
      sourceUrl: XDJ_700.sourceHistory,
    },
    issues: [
      { fixedIn: XDJ_700.browserManyTracksFix, area: 'Browse', midSet: true, symptom: 'Categories and tracks were not shown in the browser when a database had many tracks. Search results did not appear when moving the cursor.' },
      { fixedIn: XDJ_700.searchFix, area: 'Browse', midSet: true, symptom: 'SEARCH worked incorrectly under certain conditions.' },
      { fixedIn: XDJ_700.syncBpmFix, area: 'Playback', midSet: true, symptom: 'Speed did not return to the displayed BPM with Sync on. Popping noise in a loop with QUANTIZE and MASTER TEMPO enabled.' },
      { fixedIn: XDJ_700.usbAudioControlFix, area: 'Audio', midSet: true, symptom: 'The USB audio function did not work in DJ Software Control mode.' },
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
    // No published change history. See the CDJ-1500X entry for why it is here
    // rather than absent.
    model: 'DJM-V5',
    href: '/knowledge/pioneer-dj/djm-v5',
    source: DJM_V5.source,
    issues: [],
    noneNote: NO_HISTORY_PUBLISHED,
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
    // Corrected 2026-08-04: this used DJM_REC.source, which is the DJM-REC APP
    // support page, so the firmware row cited the wrong document entirely.
    // Points at AlphaTheta's own DJM-900NXS2 support article instead.
    source: 'https://support.alphatheta.com/en-US/articles/4404624354969',
    issues: [
      { fixedIn: DJM_REC.nxs2RecHaltFixes[1], area: 'Recording', midSet: false, symptom: 'DJM-REC recording halts affecting iOS and iPadOS audio.' },
      { fixedIn: DJM_REC.nxs2RecHaltFixes[0], area: 'Recording', midSet: false, symptom: 'DJM-REC recording could halt part-way through a set.' },
    ],
    note: 'AlphaTheta has published no hardware defect fix for this mixer beyond the DJM-REC recording halts. The rest of its change history is feature work.',
  },

  {
    /*
     * ADDED 2026-08-08, and this was the worst omission on the page. The
     * DJM-900NXS model page calls "below 1.28 this mixer shuts itself down" its
     * headline fact, then links here under "Every model, by firmware version",
     * and a DJ following that link found no row at all. The one page whose
     * headline is a firmware number was the one page the firmware matrix did not
     * cover.
     */
    model: 'DJM-900NXS',
    href: '/knowledge/pioneer-dj/djm-900nxs',
    source: DJM_900NXS.source,
    issues: [
      { fixedIn: DJM_900NXS.wakeUpFix, area: 'Power', midSet: true, symptom: 'Standby could not always be cancelled with the LFO FORM (WAKE UP) control.' },
      { fixedIn: DJM_900NXS.usbNoiseFix, area: 'Audio', midSet: true, symptom: 'Noise in USB audio in and out on some computers.' },
      { fixedIn: DJM_900NXS.effectsNotEngagingFix, area: 'Audio', midSet: true, symptom: 'Some effects did not work as expected when switched on.' },
      // THE ONE PEOPLE ARRIVE LOOKING FOR. AlphaTheta's own wording is that the
      // unit could shut down unexpectedly, and on a mixer that means the room
      // goes silent, so it is the reason this model needed a row.
      { fixedIn: DJM_900NXS.shutdownFix, area: 'Power', midSet: true, symptom: 'The mixer shut itself down unexpectedly.' },
      { fixedIn: DJM_900NXS.slipBpmDisplayFix, area: 'Display', midSet: false, symptom: 'BPM display fluctuating when SLIP was used on a linked CDJ-2000NXS or CDJ-900.' },
      { fixedIn: DJM_900NXS.rollVolumeFix, area: 'Audio', midSet: true, symptom: 'ROLL, REV ROLL and SLIP ROLL volume was not always stable.' },
      { fixedIn: DJM_900NXS.revRollSilentFix, area: 'Audio', midSet: true, symptom: 'No effect sound when REV ROLL followed ROLL immediately.' },
      { fixedIn: DJM_900NXS.xpadNoiseFix, area: 'Audio', midSet: false, symptom: 'Slight noise while operating the X-PAD.' },
    ],
  },
  {
    model: 'DJM-750MK2',
    href: '/knowledge/pioneer-dj/djm-750mk2',
    source: DJM_750MK2.source,
    warning: {
      kind: 'behaviour',
      version: DJM_750MK2.ecoStandbyIntro,
      text: ECODESIGN_STANDBY,
      sourceUrl: DJM_750MK2.source,
    },
    issues: [
      { fixedIn: DJM_750MK2.iosAudioFix, area: 'Audio', midSet: false, symptom: 'Audio communication with iOS and iPadOS devices.' },
      { fixedIn: DJM_750MK2.recHaltFix, area: 'Recording', midSet: false, symptom: 'DJM-REC recording or live streaming sometimes stopped.' },
      { fixedIn: DJM_750MK2.fxAssignPopFix, area: 'Audio', midSet: true, symptom: 'Popping noise through USB audio when switching FX ASSIGN with BEAT FX on.' },
    ],
    // The published history starts at 1.03, and 1.05 lists only "Minor issues"
    // with no detail. So this is every DOCUMENTED fix, which is not the same as
    // every fix, and the note says which one it is.
    note: 'AlphaTheta published no detail for version 1.05 beyond "Minor issues", and versions 1.00 to 1.02 are not listed at all. What is above is every documented fix for this mixer, not necessarily every fix.',
  },
  {
    // No published change history. See the CDJ-1500X entry for why it is here
    // rather than absent.
    model: 'euphonia',
    href: '/knowledge/pioneer-dj/euphonia',
    source: EUPHONIA.source,
    issues: [],
    noneNote: NO_HISTORY_PUBLISHED,
  },
];

// ===========================================================================
// TECHNICS. The third manufacturer, and the first one that is not digital.
//
// WHY THIS BRAND IS DIFFERENT FROM THE OTHER TWO, and why the pages read
// differently. Every model on this site until now had firmware, storage, a file
// system and a library. A turntable has none of those. It cannot be bricked by a
// bad update, it cannot reject a drive, and there is no version number to check
// before a gig. What it has instead is a fault domain this site has never
// covered: mains hum and grounding, pitch and torque, skipping and acoustic
// feedback, and a cartridge and a phono lead that can silence one channel.
//
// SO THE FACT DISCIPLINE HAS TO WORK HARDER HERE, not less. There is more folk
// knowledge about the SL-1200 than about any other piece of DJ equipment ever
// made, almost none of it sourced, and a great deal of it wrong. Panasonic
// documents plenty. Where they do, it is quoted. Where they do not, the field is
// null and a sibling flag says the silence is Panasonic's, not ours.
//
// THE MK2 MANUAL IS A SCAN WITH NO TEXT LAYER, read page by page as images. That
// is worth recording because it explains why some fields here are thinner than
// their MK7 equivalents: the document is 10 pages from 1979 and it simply says
// less than a modern one. It also has NO troubleshooting section at all, which is
// itself a fact about the deck rather than a gap in the research.
// ===========================================================================

export const SL_1200MK2 = {
  checked: '8 August 2026',
  released: 1979,
  // END OF PRODUCTION IS NOT PUBLISHED BY PANASONIC. It is everywhere as 2010,
  // and it is probably right, but it appears in no Panasonic or Technics
  // document: their own heritage timeline steps from the MK5 era straight to the
  // 2015 revival without naming an end date. So the site does not state a year.
  // This is the same shape as DJM_900NXS.firmwareEndedIsInference: the honest
  // answer to "when did it stop" is that the maker never said.
  discontinued: null,
  discontinuedNotPublished: true,
  type: 'Quartz direct drive, manual turntable',
  motor: 'Brushless DC motor',
  platter: 'Aluminium diecast, 33.2 cm diameter, 2 kg',
  speeds: '33-1/3 and 45 rpm',
  startingTorque: '1.5 kg-cm',
  startUpTime: '0.7 seconds from standstill to 33-1/3 rpm',
  braking: 'Electronic brake',
  // THREE FIGURES FOR ONE MEASUREMENT, all in the same table, because they are
  // measured to different standards. Quoting one number without its standard is
  // how "0.01%" ends up on forums as though it were comparable to a modern spec.
  wowFlutter: '0.01 % WRMS for the turntable assembly alone, 0.025 % WRMS to JIS C5521, and 0.035 % peak to IEC 98A weighted',
  rumble: 'minus 56 dB unweighted and minus 78 dB weighted, both to IEC 98A',
  pitchRange: 'about plus or minus 8 per cent',
  quartzLock: true,
  // NO PITCH RESET BUTTON. The MK7 has one beside the fader. On an MK2 you find
  // zero by eye against the platter markings, which is why a booth MK2 is so
  // often running slightly off and nobody notices.
  pitchReset: false,
  platterMarkings: 'plus 6, plus 3.3, zero and minus 3.3 per cent',
  tonearm: 'Universal, static balance',
  tonearmEffectiveLength: '230 mm',
  tonearmEffectiveMass: '12 g without cartridge',
  overhang: '15 mm',
  offsetAngle: '22 degrees',
  armHeightRange: '0 to 6 mm',
  stylusPressureRange: '0 to 2.5 g',
  antiSkatingInstruction: 'Set the anti-skating control knob to the same value as the stylus pressure.',
  headshellWeight: '7.5 g',
  cartridgeWeightRange: '6 to 10 g, or 13.5 to 17.5 g including the headshell',
  headshellWiring: 'White is left positive, blue is left negative, red is right positive, green is right negative',
  output: 'Left and right leads plus a separate spade-lug ground wire',
  // THE FIELD THAT MATTERS MOST IN A BOOTH, and the one place the manual does
  // not answer in words. The phono leads are drawn in the connection figure as
  // cables already coming out of the deck, and they are absent from the parts
  // checklist that lists every other supplied item down to the 45 rpm adaptor.
  // Both point the same way, and the manual never uses the word "hard-wired".
  // Marked as an inference so the page can say "reads as" rather than "is".
  phonoCableDetachable: false,
  phonoCableDetachableIsInference: true,
  earthLeadSupplied: true,
  powerCordDetachable: false,
  voltage: 'AC 120 V, 60 Hz on the North American model',
  powerConsumption: '14 W',
  dimensions: '45.3 cm wide, 36 cm deep, 16.2 cm high',
  weight: '12.5 kg',
  // QUOTED, because it is the single most useful sentence in the document and
  // the manual puts HUM in capitals and quotation marks itself.
  earthWarning: 'Be sure to connect the ground terminal firmly to the amplifier or receiver. If this connection is not made or is loose, a power source "HUM" will result.',
  placementSpeakers: 'Locate the unit as far away from the speakers as possible and isolate the unit from sound radiation from them.',
  placementLevel: 'Place the unit in a stable and horizontal position, where there is little or no vibration.',
  // NO TROUBLESHOOTING SECTION EXISTS. All ten pages were read. This is a fact
  // about the document, not a hole in the research, and it is the reason the
  // fault sections on this page lean on the MK7 manual and on field practice
  // with both clearly labelled.
  troubleshootingSection: false,
  // NO PANASONIC DOCUMENT FOR THE SL-1210MK2 COULD BE FOUND AT ALL. The black
  // export twin certainly existed and was sold. Every specification and manual
  // hit for it is a third-party archive. So this site does not state the
  // silver-versus-black convention for this generation, even though Panasonic
  // does document exactly that convention for the modern Grand Class line.
  sl1210Documented: false,
  source: 'https://www.help.na.panasonic.com/wp-content/uploads/2023/02/SL1200MK2_SFNU122M06_ENG.pdf',
  sourceHeritage: 'https://www.technics.com/global/home/sl1200/heritage.html',
  sourceHistory: 'https://www.technics.com/global/home/60th-anniversary/technics-brand-story/history-of-the-sl-1200.html',
};

export const SL_1200MK7 = {
  checked: '8 August 2026',
  announced: 'January 2019, at CES',
  released: 2019,
  // TWO PANASONIC DOCUMENTS DESCRIBE THE MOTOR DIFFERENTLY. The press release
  // calls it a "newly developed coreless direct drive motor". The owner's manual
  // specification table calls it a "Brushless DC motor". Both are Panasonic, both
  // are current, and they are almost certainly describing the same part. The page
  // gives the manual's wording, because a specification table is where a spec
  // lives, and names the press release's term rather than choosing between them.
  motor: 'Brushless DC motor',
  motorPressReleaseTerm: 'newly developed coreless direct drive motor',
  type: 'Direct drive manual turntable',
  platter: 'Aluminium diecast, 332 mm diameter, approximately 1.8 kg including the slipmat and slip sheet',
  speeds: '33-1/3 and 45 rpm, and 78 rpm with a switch',
  startingTorque: '0.18 N-m, which is 1.8 kg-cm',
  startUpTime: '0.7 seconds from standstill to 33-1/3 rpm',
  wowFlutter: '0.025 % WRMS',
  // NOT PUBLISHED. Absent from the specification page, the specification PDF, the
  // owner's manual AND Technics own turntable comparison chart, which has no
  // rumble row for any model. The MK2 published both figures in 1979. Saying so
  // is more useful than leaving a blank the reader has to interpret.
  rumble: null,
  rumbleNotPublished: true,
  pitchRange: 'plus or minus 8 or plus or minus 16 per cent, selectable',
  // A REAL DISCREPANCY BETWEEN PANASONIC DOCUMENTS, recorded rather than
  // smoothed over. The pitch range is in the owner's manual specification table
  // and is missing entirely from both the UK product specification page and the
  // North American specification PDF, which list no pitch figure at all.
  pitchRangeSpecPageOmits: true,
  pitchReset: true,
  quartzLock: false,
  tonearm: 'Universal, static balance',
  tonearmEffectiveLength: '230 mm',
  overhang: '15 mm',
  offsetAngle: '22 degrees',
  trackingError: 'within 2 degrees 32 minutes at the outer groove and 0 degrees 32 minutes at the inner groove of a 30 cm record',
  armHeightRange: '0 to 6 mm',
  stylusPressureRange: '0 to 4 g, direct reading',
  antiSkatingInstruction: 'Turn the anti-skating control to adjust it to the same value as the stylus pressure control.',
  headshellWeight: 'approximately 7.6 g',
  headshellTerminal: '1.2 mm diameter four-pin terminal lug',
  // PANASONIC NEVER NAMES A STANDARD for that terminal, only its dimensions. The
  // internet calls it several things. This site gives the dimension Panasonic
  // gives and does not attach a name they did not use.
  headshellStandardNamed: false,
  cartridgeWeightRange: '5.6 to 12.0 g, or 14.3 to 20.7 g including the headshell',
  output: 'PHONO pin jacks and an earth terminal',
  // THE SINGLE BIGGEST PRACTICAL DIFFERENCE FROM AN MK2 in a booth, and it is
  // documented on both sides: Panasonic list the cable and the earth lead as
  // separate part-numbered accessories that connect to back-panel terminals.
  phonoCableDetachable: true,
  phonoCablePartNumber: 'K4EY4YY00003',
  earthLeadPartNumber: 'K4EY1YY00189',
  earthLeadSupplied: true,
  powerCordDetachable: true,
  powerCordPartNumber: 'K2CG3YY00219',
  voltage: 'AC 120 V, 60 Hz on the North American model, and AC 110 to 240 V, 50/60 Hz on the export model',
  powerConsumption: '8.0 W switched on, and approximately 0.2 W switched off',
  weight: 'approximately 9.6 kg',
  // DIMENSIONS ARE DELIBERATELY NOT RENDERED. Only height and depth, 169 mm and
  // 353 mm, were found in a Panasonic document. The press release says the MK7
  // "follow[s] SL-1200MK6 specifications such as dimensions", which makes the
  // width very likely the familiar 453 mm, but that is a chain of two inferences
  // about a number a reader might use to size a flight case. A partial dimension
  // is worse than none, so the page gives none.
  dimensionsIncomplete: true,
  reversePlay: true,
  reversePlaySetting: 'a REV switch on the rear panel, then the speed button and START-STOP together while the platter is turning',
  torqueLevels: 4,
  brakeLevels: 4,
  torqueBrakeSetting: 'rear panel switches, TQ1 and TQ2 for torque and BK1 and BK2 for brake',
  stylusLight: 'a pop-up white LED',
  earthWarning: 'Be sure to connect the PHONO earth lead. Otherwise mains hum may occur.',
  humTroubleshooting: 'Are there other appliances or their AC power supply cord near the stereo connection cable? Separate the appliances and their AC power supply cord from this unit.',
  troubleshootingSection: true,
  mk6Continuity: 'following SL-1200MK6 specifications such as dimensions, button layout, and inertial mass of the platter',
  variants: 'SL-1200MK7 and the SL-1210MK7 export name, an SL-1200MK7-S silver finish for North America, the SL-1200M7L 50th anniversary edition of 12,000 units, and the SL-1200M7ALD collaboration edition',
  source: 'https://help.na.panasonic.com/wp-content/uploads/2023/02/SL1200MK7_TQBM0410_ENG_FRE.pdf',
  sourceSpecs: 'https://www.technics.com/uk/products/dj-series/sl-1200mk7.specs.html',
  sourceSpecsPdf: 'https://help.na.panasonic.com/wp-content/uploads/2024/11/SL1200MK7_Specifications_US_1.pdf',
  sourceAnnounce: 'https://news.panasonic.com/global/press/data/2019/01/en190108-5/en190108-5.pdf',
  sourceFeatures: 'https://technics.com/global/sl1200/features',
  sourceHistory: 'https://www.technics.com/global/home/60th-anniversary/technics-brand-story/history-of-the-sl-1200.html',
};




// ===========================================================================
// ALLEN & HEATH. The second manufacturer, added 2026-08-07.
//
// READ THIS BEFORE ADDING A XONE FACT. These mixers break three assumptions the
// Pioneer half of this file is built on, and each one was verified independently
// for each model rather than carried across from the sibling:
//
//   1. THE XONE:92 HAS NO FIRMWARE. Not "none published", none. Allen & Heath
//      offer no firmware, no drivers and no release notes for it, and there is
//      no USB audio to need any. So the question this whole site asks a Pioneer
//      owner, "what version is the deck on", DOES NOT EXIST on that mixer. It is
//      deliberately not tagged `firmware` in the graph, because putting the
//      firmware matrix in its related guides would be actively misleading.
//   2. NEITHER USER GUIDE HAS A TROUBLESHOOTING SECTION. Checked in both. That
//      is itself a fact worth publishing: a DJ holding the manual in a booth has
//      nothing to work from, which is most of why these pages should exist.
//   3. ALLEN & HEATH CONTRADICT THEMSELVES ON THE XONE:92 CHANNEL COUNT. The
//      product page says 4+2, their own technical specification sheet says 6+2.
//      Both are official. The page publishes both and attributes each.
//
// AND THREE XONE:92 TRAITS THAT DO NOT CARRY TO THE XONE:96, each of which would
// have been an error: the 96 has NO LFO, phono shorting plugs are absent from its
// documentation and its box contents, and it has no documented internal option to
// disable the filters. Verified by their absence from the 96's own guide.
// ===========================================================================

export const XONE_92 = {
  checked: '7 August 2026',
  // TWO OFFICIAL CHANNEL COUNTS THAT DISAGREE. Do not pick one silently.
  channelsProductPage: '4 + 2',
  channelsSpecSheet: '6 + 2',
  channelsDetail: 'four stereo music channels with switchable phono or line, plus two mic and return channels',
  analogue: true,
  analogueClaim: '100% analogue circuitry and mix bus summing',
  // NO firmware, NO drivers, NO USB audio, NO soundcard. The absence is the fact.
  firmware: false,
  soundcard: false,
  usbAudio: false,
  digitalIo: 'MIDI out only, one 5-pin DIN',
  faderType: 'linear channel faders, with a global 3-position curve switch on the Mk2',
  crossfader: true,
  crossfaderModel: 'mini innoFADER Pro, 45mm linear VCA',
  crossfaderUserReplaceable: true,
  crossfaderPart: 'AI11470',
  // THE FILTERS ARE THE REASON THIS MIXER EXISTS.
  filters: 2,
  filterTypes: ['HPF', 'BPF', 'LPF'],
  filterResonance: 'a resonance control labelled MILD to WILD, which feeds the filter output back to its input',
  lfos: 2,                          // two independent LFOs, with tap tempo and an x2 speed
  filterAssignable: true,           // either filter to any of the four stereo channels
  // THE BOOTH TRAPS, all documented by Allen & Heath.
  micsToRecord: false,              // mics never reach Record
  micsToBoothByDefault: false,      // and not Booth either until a REAR PANEL switch is flipped
  sourceMicRouting: 'https://support.allen-heath.com/hc/en-gb/articles/4403303538449-Xone-92-No-mic-signals-getting-to-Record-Outputs',
  crossfaderAssignCentreIsOff: true, // centre takes the channel OUT of the crossfader
  filterAssignCentreIsDry: true,
  returnsThroughCrossfader: false,  // "sources which do not need to route through the crossfader"
  phonoShortingPlugs: true,
  phonoShortingPlugPart: 'AL4396',
  // Installer options that make a working mixer look broken.
  internalFilterDisable: true,
  internalResonanceLimit: true,
  // Master output is NOT unity at maximum.
  masterUnityPosition: 'around 3 o\'clock, which is 8 on the dial',
  masterAtMax: '+4dBu on the balanced XLR output',
  sourceMasterLevels: 'https://support.allen-heath.com/hc/en-gb/articles/24248474651153-Xone-PD-series-master-level-settings',
  // SAFETY, and it contradicts a common booth "fix" for hum.
  neverLiftMainsEarth: true,
  sourceEarth: 'https://support.allen-heath.com/hc/en-gb/articles/4403382371217-Xone-Laptop-hum-through-mixer',
  troubleshootingSection: false,
  micInputs: 2,
  auxSends: 2,                      // switchable pre or post fader
  mains: '100 to 240V, 30W, internal switch mode supply, no voltage selector and no fuse change',
  dimensions: '320mm wide, 106mm high',   // from the Limited Edition guide, NOT the Mk2 spec sheet
  weight: '7 kg',
  // Mk1 and Mk2 are documented as distinct, with different internals.
  revisions: 'Mk1 and Mk2, plus a Limited Edition run of 920 units for the twentieth anniversary',
  // DVS is NOT documented for this mixer by Allen & Heath. Do not claim it either
  // way, and do NOT carry the Xone:96's Traktor Scratch certification across.
  dvsDocumented: false,
  serviceManualPublished: false,
  blockDiagramPublished: true,
  source: 'https://www.allen-heath.com/hardware/xone-series/xone92/',
  sourceManual: 'https://www.allen-heath.com/content/uploads/2024/10/Xone92-Mk2-User-Guide.pdf',
  sourceSpecs: 'https://www.allen-heath.com/content/uploads/2024/10/Xone92-Mk2-Technical-Specifications.pdf',
  sourceBlockDiagram: 'https://www.allen-heath.com/content/uploads/2024/10/Xone92-Mk2-Block-Diagram.pdf',
};

export const XONE_96 = {
  checked: '7 August 2026',
  channels: '6 + 2',                // consistent everywhere, unlike the Xone:92
  channelsDetail: 'four stereo channels with 4-band EQ, two stereo channels with 3-band parametric EQ, and two auxiliary stereo returns',
  analogue: true,
  analogueClaim: 'an analogue mixer with an interface, feeding what Allen & Heath call the analogue engine',
  // Allen & Heath never state that SUMMING is analogue for this model, only for
  // the Xone:92. Do not upgrade "analogue mixer" into "analogue summing".
  analogueSummingClaimed: false,
  soundcard: true,
  soundcards: 2,
  soundcardSpec: 'two independent interfaces, each 6 stereo in and 6 stereo out at 32-bit / 96 kHz',
  macClassCompliant: true,          // no driver needed on macOS
  windowsDriverNeeded: true,
  // ALLEN & HEATH PRINT THIS VERSION TWO DIFFERENT WAYS for the same download.
  windowsDriver: 'v4.67.0 on the resources page, v4.6.70 in the release note itself',
  windowsDriverDate: 'December 2021',
  // NO firmware change history is published. The mixer HAS firmware, the guide
  // says so in boilerplate, but no version, date or change text exists publicly,
  // and the old v1.0.2 audio firmware pages now 404 on their own site.
  firmwarePublished: false,
  filters: 2,
  filterTypes: ['HPF', 'BPF', 'LPF'],
  filterRange: '20 Hz to 20 kHz',
  filterCrunch: true,               // harmonic distortion, inserted PRE-filter
  lfos: 0,                          // NO LFO. Absent from the guide entirely.
  filterAssignable: 'all six main channels to either filter, post gain, post EQ and post fader',
  // THE WORST DOCUMENTED TRAP ON THIS MIXER.
  masterInsertBreaksThru: true,
  sourceMasterInsert: 'https://support.allen-heath.com/hc/en-gb/articles/25826873884049-Xone-96-connecting-RMX1000-to-master-insert',
  insertLevel: '-2 dBu in and out',
  // The second way audio and meters can disagree here.
  masterControlsDoNotMoveMeters: true,
  meterTarget: 'between -6 and +6 with the average around 0, and the loudest peaks around +6',
  micsToBoothOrRecordByDefault: false,   // internal jumpers only, A&H will help
  micPhantomPower: false,                // dynamic low impedance mics only
  micsThroughMasterInsert: false,
  crossfader: true,
  crossfaderModel: 'mini innoFADER, with fader cut adjustment',
  crossfaderAssignCentreIsOff: true,
  // Documented limits on the aux returns and sends.
  returnsCdNoEqFilterOrCrossfader: true,
  sends: 'SND 1 switchable pre or post fader, SND 2 fixed post fader',
  headphoneSystems: 2,              // two independent cue systems, each TRS plus mini jack
  cueModeToggle: 'auto cancelling by default, switchable to latching by holding all three filter type buttons on both filters',
  sourceCueMode: 'https://support.allen-heath.com/hc/en-gb/articles/24944524347665-Xone-96-Cue-system-configuration',
  // X:LINK IS PROPRIETARY AND CAN DAMAGE HARDWARE. The only physical-damage
  // warning on either Xone page.
  xLink: true,
  xLinkThirdPartyWarning: true,
  sourceXLink: 'https://support.allen-heath.com/hc/en-gb/articles/24249679937297-Xone-96-X-link-with-K-series',
  midiOutOnly: true,                // 5-pin DIN is OUT only; MIDI in arrives over USB
  midiClockPassthroughOnly: true,   // the mixer does not generate a clock
  midiControls: 31,
  // DVS. Keep Allen & Heath's own two words apart: Traktor Scratch is CERTIFIED,
  // the wider list is SUPPORTED. Serato is not mentioned by them at all.
  dvsCertified: ['Traktor Scratch'],
  dvsSupported: ['Traktor Pro', 'djay Pro', 'Virtual DJ Pro', 'rekordbox'],
  seratoDocumented: false,
  troubleshootingSection: false,
  specSheetPublished: false,         // no technical specification document exists at all
  micInputs: 2,
  dimensions: '336mm wide, 410mm deep, 109mm high',
  weight: '7 kg',
  serviceManualPublished: false,
  source: 'https://www.allen-heath.com/hardware/xone-series/xone96/',
  sourceManual: 'https://support.allen-heath.com/hc/en-gb/articles/43053562464017-Xone-96-User-Guide',
  sourceResources: 'https://www.allen-heath.com/hardware/xone-series/xone96/resources/',
  sourceRouting: 'https://support.allen-heath.com/hc/en-gb/articles/24741954249233-Xone-96-Dual-Sound-Card-Routing',
  sourceMidi: 'https://support.allen-heath.com/hc/en-gb/articles/43084536824849-Xone-96-MIDI-Implementation',
};

// ---------------------------------------------------------------------------
// THE EQUIPMENT GRAPH (2026-08-07)
//
// WHY THIS EXISTS. Antonio asked every equipment page to link one newer model,
// one older model, and the gear it is genuinely found beside in a working booth.
// Written by hand that is 12 equipment pages times 3 languages, so 36 places
// where a relationship lives, and the CDJ-3000X arriving means editing all of
// them and missing some. That is exactly the failure that put "FAT32 only" on
// six models: a fact restated by hand in more places than anyone could count.
//
// So relationships are DATA and pages READ them. Adding a model here updates
// every page that should now point at it, in all three languages, with no page
// edit at all.
//
// THE THREE FIELDS, and they are not the same kind of claim.
//
//   newer / older   LINEAGE. Which model in the SAME family replaced this one
//                   or was replaced by it. This is a documented fact: release
//                   order within a product line. A model at the top of its line
//                   has no `newer`, one at the bottom has no `older`, and that
//                   is Antonio's rule rather than a gap to fill.
//
//   siblings        SAME CATEGORY, COMPARABLE TIER, DIFFERENT LINE. Needed
//                   because lineage alone leaves dead ends: the euphonia is
//                   rotary and outside the DJM line entirely, the DJM-V10 opens
//                   its own six channel line, and the XDJ-700's successor has no
//                   page here. Antonio's own worked example asks the DJM-V10 to
//                   show the DJM-A9 and DJM-900NXS2, which are siblings and not
//                   lineage. So the rule is: fill the related list from lineage
//                   FIRST, then top it up from siblings to two. Every page then
//                   has somewhere to go, which was the point of the brief.
//
//   paired          THE COUNTERPART CATEGORY. A player names mixers, a mixer
//                   names players. This is the useful link, because a DJ
//                   reading about a deck is standing in front of a whole booth.
//
//   tags            TOPICS the model actually raises, used to COMPUTE related
//                   guides instead of hand-listing them. See GUIDE_INDEX below.
//
// PAIRED IS NOT A SOURCED CLAIM, AND MUST NOT BE PRESENTED AS ONE. Every other
// hardware fact on this site cites AlphaTheta. No vendor publishes "these are
// usually installed together". This is field knowledge about club, festival and
// rental installs, and it is good, but it is a DIFFERENT KIND OF CLAIM and the
// component that renders it says so in its own words. The site's credibility
// comes from never blurring those two voices. Today's lesson, applied forward:
// an unsourced confident claim is how the FAT32 error happened.
//
// `null` means deliberately nothing. A model with no page yet is simply absent
// from `newer`/`older`/`paired` rather than listed and unlinkable, because a
// dead end labelled "coming soon" is a worse experience than a shorter list.
// The renderer resolves every slug against EQUIPMENT and drops anything unknown,
// so this file can never emit a broken link.
export const EQUIPMENT = [
  // ------------------------------------------- PIONEER DJ / ALPHATHETA
  {
    slug: 'cdj-3000x', name: 'CDJ-3000X', kind: 'player', brand: 'pioneer-dj', released: 2026,
    newer: null,                       // top of the CDJ line
    older: 'cdj-3000',
    paired: ['djm-a9', 'djm-v10'],     // flagship deck, flagship desks
    siblings: ['cdj-1500x'],
    tags: ['onelibrary', 'exfat', 'prodjlink', 'firmware', 'usb-prep', 'cloud'],
  },
  {
    slug: 'cdj-3000', name: 'CDJ-3000', kind: 'player', brand: 'pioneer-dj', released: 2020,
    newer: 'cdj-3000x',
    older: 'cdj-2000nxs2',
    paired: ['djm-a9', 'djm-v10', 'djm-900nxs2'],
    siblings: ['cdj-3000x'],
    // The 900NXS2 belongs here even though the A9 replaced it: a very large
    // number of installed booths still run a CDJ-3000 into a 900NXS2, because
    // clubs replace players and mixers on different budgets and cycles.
    tags: ['devicelibrary', 'exfat', 'prodjlink', 'firmware', 'usb-prep', 'ecodesign'],
  },
  {
    slug: 'cdj-2000nxs2', name: 'CDJ-2000NXS2', kind: 'player', brand: 'pioneer-dj', released: 2016,
    newer: 'cdj-3000',
    older: 'cdj-2000nxs',
    paired: ['djm-900nxs2'],           // the definitive booth pairing of its era
    siblings: ['cdj-3000'],
    tags: ['devicelibrary', 'no-exfat', 'filesystems', 'prodjlink', 'firmware', 'usb-prep'],
  },
  {
    slug: 'cdj-2000nxs', name: 'CDJ-2000NXS', kind: 'player', brand: 'pioneer-dj', released: 2012,
    newer: 'cdj-2000nxs2',
    older: null,                       // the CDJ-2000 has no page here
    paired: ['djm-900nxs2'],
    siblings: ['cdj-900nxs'],
    tags: ['devicelibrary', 'no-exfat', 'filesystems', 'prodjlink', 'firmware', 'usb-prep'],
  },
  {
    slug: 'cdj-1500x', name: 'CDJ-1500X', kind: 'player', brand: 'pioneer-dj', released: 2026,
    newer: null,                       // opens its own tier, nothing above it
    older: null,                       // and nothing below it yet
    paired: ['djm-v5', 'djm-a9'],
    siblings: ['cdj-3000x', 'cdj-3000'],
    // A mid-tier OneLibrary deck lands in rooms buying a V5, and in bigger
    // rooms as the spare beside an A9. Neither is a vendor statement.
    tags: ['onelibrary', 'exfat', 'prodjlink', 'firmware', 'usb-prep', 'cloud'],
  },
  {
    slug: 'cdj-900nxs', name: 'CDJ-900NXS', kind: 'player', brand: 'pioneer-dj', released: 2012,
    newer: null,                       // the 900 line ended here
    older: null,
    paired: ['djm-900nxs2'],
    siblings: ['cdj-2000nxs', 'xdj-700'],
    tags: ['devicelibrary', 'no-exfat', 'filesystems', 'prodjlink', 'firmware', 'usb-prep'],
  },
  {
    slug: 'xdj-1000mk2', name: 'XDJ-1000MK2', kind: 'player', brand: 'pioneer-dj', released: 2015,
    newer: null,                       // nothing officially named as its successor
    older: null,                       // the XDJ-1000 has no page here
    paired: ['djm-900nxs2', 'djm-900nxs'],
    siblings: ['xdj-700', 'cdj-2000nxs2'],
    tags: ['devicelibrary', 'no-exfat', 'filesystems', 'prodjlink', 'firmware', 'usb-prep', 'ecodesign'],
  },
  // ------------------------------------------------------------- MIXERS
  {
    slug: 'xdj-700', name: 'XDJ-700', kind: 'player', brand: 'pioneer-dj', released: 2015,
    newer: null,                       // the XDJ-1000MK2 has no page here
    older: null,
    paired: ['djm-900nxs2'],
    siblings: ['cdj-900nxs', 'cdj-2000nxs'],
    tags: ['devicelibrary', 'no-exfat', 'filesystems', 'prodjlink', 'firmware', 'usb-prep', 'ecodesign'],
  },
  {
    slug: 'djm-v10', name: 'DJM-V10 / V10-LF', kind: 'mixer', brand: 'pioneer-dj', released: 2019,
    newer: null,
    older: null,                       // the V series starts here, six channels
    paired: ['cdj-3000', 'cdj-3000x'],
    siblings: ['djm-a9', 'djm-900nxs2'],
    tags: ['prodjlink', 'firmware', 'dvs', 'link-network', 'long-blend'],
  },
  {
    slug: 'djm-v5', name: 'DJM-V5', kind: 'mixer', brand: 'pioneer-dj', released: 2024,
    newer: null,
    older: null,                       // four-channel V series, its own tier
    paired: ['cdj-3000', 'cdj-1500x'],
    siblings: ['djm-v10', 'djm-a9'],
    tags: ['prodjlink', 'firmware', 'dvs', 'link-network', 'long-blend', 'no-crossfader'],
  },
  {
    slug: 'djm-a9', name: 'DJM-A9', kind: 'mixer', brand: 'pioneer-dj', released: 2022,
    newer: null,                       // current top of the DJM-900 lineage
    older: 'djm-900nxs2',
    paired: ['cdj-3000', 'cdj-3000x'],
    siblings: ['djm-v10'],
    tags: ['prodjlink', 'firmware', 'dvs', 'link-network'],
  },
  {
    slug: 'djm-900nxs2', name: 'DJM-900NXS2', kind: 'mixer', brand: 'pioneer-dj', released: 2016,
    newer: 'djm-a9',
    older: null,                       // the DJM-900NXS has no page here
    paired: ['cdj-2000nxs2', 'cdj-3000'],
    siblings: ['djm-v10'],
    tags: ['prodjlink', 'firmware', 'dvs', 'link-network'],
  },
  {
    slug: 'djm-900nxs', name: 'DJM-900NXS', kind: 'mixer', brand: 'pioneer-dj', released: 2011,
    newer: 'djm-900nxs2',              // the next nexus generation, though AlphaTheta
                                       // never called it a replacement
    older: null,
    paired: ['cdj-2000nxs', 'xdj-1000mk2'],
    siblings: ['djm-900nxs2', 'djm-750mk2'],
    tags: ['prodjlink', 'firmware', 'dvs', 'link-network'],
  },
  {
    slug: 'djm-750mk2', name: 'DJM-750MK2', kind: 'mixer', brand: 'pioneer-dj', released: 2017,
    newer: null,
    older: null,                       // the DJM-750 original has no page here
    paired: ['cdj-2000nxs2', 'xdj-700'],
    // NO PRO DJ LINK, so it is paired on what shares a booth with it rather than
    // on what it links to. Nothing links to this mixer.
    siblings: ['djm-900nxs2', 'djm-v5'],
    tags: ['firmware', 'dvs', 'ecodesign'],
  },
  {
    slug: 'euphonia', name: 'euphonia', kind: 'mixer', brand: 'pioneer-dj', released: 2024,
    newer: null,
    older: null,                       // rotary, outside the DJM lineage entirely
    paired: ['cdj-3000', 'cdj-3000x'],
    siblings: ['djm-v10', 'djm-a9'],
    tags: ['firmware', 'dvs', 'long-blend', 'no-crossfader', 'rotary'],
  },
  // -------------------------------------------------------- ALLEN & HEATH
  // Added 2026-08-07, the second manufacturer, and the reason `brand` exists.
  //
  // These two are MIXERS ONLY and they are not in the DJM lineage, so `paired`
  // reaches across brands to the players a Xone actually sits beside. That is
  // the point of a booth: a Xone:92 with two CDJ-2000NXS2s on it is one of the
  // most common professional setups there is, and a graph that could not express
  // it would be modelling a catalogue rather than a booth.
  {
    slug: 'xone-96', name: 'Xone:96', kind: 'mixer', brand: 'allen-heath', released: 2018,
    newer: null,                       // top of the Xone line
    older: 'xone-92',
    // Allen & Heath say the Xone:96 "takes the legendary soul of the acclaimed
    // Xone:92 and redelivers it, enhanced". They never say REPLACES, and both
    // are sold concurrently, so lineage here means "the one before it" and not
    // "the one it killed".
    paired: ['cdj-3000', 'cdj-2000nxs2'],
    siblings: ['djm-a9', 'djm-v10'],
    tags: ['dvs', 'link-network', 'long-blend'],
  },
  {
    slug: 'xone-92', name: 'Xone:92', kind: 'mixer', brand: 'allen-heath', released: 2004,
    newer: 'xone-96',
    older: null,
    paired: ['cdj-2000nxs2', 'cdj-2000nxs'],
    siblings: ['djm-900nxs2', 'djm-750mk2'],
    // NO `firmware` TAG, and that is deliberate rather than an omission. This
    // mixer has no firmware at all: Allen & Heath publish no firmware, no
    // drivers and no release notes for it, and there is no USB audio to need
    // any. Tagging it `firmware` would put the firmware matrix in its related
    // guides, which would be actively misleading on the one mixer here where
    // the version question does not exist.
    tags: ['dvs', 'long-blend'],
  },
  /*
   * TURNTABLES, THE THIRD KIND (2026-08-08). `kind` had two values for as long as
   * every product here was digital, and two of the three things that consume it
   * branched on a boolean: RelatedEquipment did `isPlayer ? players : mixers`, so
   * a turntable would have been filed under "Related mixers" on its own page.
   * Adding a value to this field is therefore never only a data change.
   *
   * LINEAGE, CAREFULLY. The MK7's actual predecessor is the SL-1200MK6, which
   * this site does not cover. So `older` here means "the nearest model we
   * document", which is also the framing Technics themselves use: their own
   * history page calls the MK7 "a full revival of the feel of the SL-1200MK2".
   * The component renders this as "Related turntables", which is true. No page
   * says the MK7 replaced the MK2, because it did not.
   */
  {
    slug: 'sl-1200mk7', name: 'SL-1200MK7', kind: 'turntable', brand: 'technics', released: 2019,
    newer: null,
    older: 'sl-1200mk2',
    // A turntable is paired with a mixer that has phono inputs. The Xone:92 first
    // on purpose: it is the mixer this deck is most often found beside, and the
    // pairing is the reason the Xone:92 exists in the shape it does.
    paired: ['xone-92', 'djm-900nxs2'],
    siblings: ['sl-1200mk2'],
    // NO `firmware` TAG, and unlike the Xone entries this is not even a judgement
    // call: there is no firmware. There is also deliberately no `usb-prep`,
    // `filesystems` or `onelibrary` tag, because a deck with no storage would
    // otherwise pull in six guides about drives it cannot read.
    // `dvs` IS correct here, and for a better reason than it was on the Xone:92:
    // timecode vinyl runs on this deck, and rekordbox documents DVS.
    tags: ['dvs'],
  },
  {
    slug: 'sl-1200mk2', name: 'SL-1200MK2', kind: 'turntable', brand: 'technics', released: 1979,
    newer: 'sl-1200mk7',
    older: null,
    paired: ['xone-92', 'djm-900nxs2'],
    siblings: ['sl-1200mk7'],
    tags: ['dvs'],
  },
];

// THE MANUFACTURERS. Added 2026-08-07 with Allen & Heath, and it exists because
// EVERY path in this system used to be hardcoded as /knowledge/pioneer-dj/<slug>:
// in the RelatedEquipment component, in the /equipment landing page, and in the
// schema. One manufacturer looks like no assumption at all right up to the moment
// a second one arrives.
//
// A model now says which brand it belongs to and the brand says where it lives,
// so `modelPath()` is the ONLY place that knows how a model URL is built. Adding
// Denon DJ or RANE means one entry here and one hub page, and nothing else.
//
// `hub` is the ENGLISH canonical path. Language prefixing happens at the render
// site, exactly as it already does for every other internal link.
export const BRANDS = [
  {
    key: 'pioneer-dj',
    name: 'Pioneer DJ / AlphaTheta',
    hub: '/knowledge/pioneer-dj',
  },
  {
    key: 'allen-heath',
    // The ampersand is Allen & Heath's own styling of their name and it is what
    // their site uses, so it is what we use. It needs escaping in markup, not
    // replacing with "and".
    name: 'Allen & Heath',
    hub: '/knowledge/allen-heath',
  },
  {
    key: 'technics',
    // Technics is a Panasonic brand, and Panasonic's own pages carry both names.
    // The brand on the deck is the one a DJ searches for, so the label is
    // Technics and the pages name Panasonic where a document is Panasonic's.
    name: 'Technics',
    hub: '/knowledge/technics',
  },
];

/*
 * THE KINDS REGISTRY. Added 2026-08-08 with the third kind, and it exists because
 * of what the second brand taught: 'player' and 'mixer' were written out by hand
 * in the /equipment page and both of its translations, so a third kind meant
 * editing three files that nothing connected, and a fourth would have meant the
 * same again. That is the /equipment ORDER array all over, and it rotted in one
 * commit last time.
 *
 * Order is the order the groups appear under a brand. Labels are NOT here: they
 * are per language and live in ui.js under equipment.kinds, where every other
 * piece of reader-facing text lives. check-kinds asserts that this list, the
 * `kind` values actually used in EQUIPMENT, and the label sets in all three
 * languages agree, so adding a fourth kind fails the gate until it is complete
 * everywhere rather than shipping half done.
 */
export const KINDS = ['player', 'mixer', 'turntable'];

const BY_SLUG = new Map(EQUIPMENT.map((e) => [e.slug, e]));
const BY_BRAND = new Map(BRANDS.map((b) => [b.key, b]));

/** The manufacturer record for a brand key, or null. */
export function brandFor(key) {
  return BY_BRAND.get(key) ?? null;
}

/**
 * The canonical English path of a model page, built from its brand's hub.
 * Every caller uses this instead of concatenating a hub prefix itself, so a
 * manufacturer whose hub moves cannot leave a broken link behind.
 */
export function modelPath(slugOrModel) {
  const m = typeof slugOrModel === 'string' ? BY_SLUG.get(slugOrModel) : slugOrModel;
  if (!m) return null;
  const brand = BY_BRAND.get(m.brand);
  if (!brand) throw new Error(`facts.js: model "${m.slug}" has brand "${m.brand}", which is not in BRANDS.`);
  return `${brand.hub}/${m.slug}`;
}

/** Every model of one brand, in canonical order, optionally filtered by kind. */
export function modelsOfBrand(brandKey, kind = null) {
  return EQUIPMENT.filter((e) => e.brand === brandKey && (kind === null || e.kind === kind));
}

// GUIDE INDEX. Every guide worth reaching from an equipment page, tagged with
// the topics it answers. Related guides are the INTERSECTION of a model's tags
// with these, so a page never lists a guide that has nothing to do with it and
// a new guide reaches every relevant model the day it is tagged.
//
// `weight` IS THE PRIMARY SORT, and tag-hit count only breaks ties within a
// weight. That order was the other way round in the first version of this file
// and it was wrong, for a reason worth recording because it is a trap in any
// tag-scoring scheme:
//
//   RANKING BY NUMBER OF MATCHING TAGS SILENTLY RANKS BY HOW MANY TAGS A GUIDE
//   HAPPENS TO CARRY. The firmware table has exactly one tag, `firmware`, so it
//   could never score above one hit and it fell off the CDJ-2000NXS, CDJ-900NXS
//   and XDJ-700 pages, which are the three pages where firmware matters MOST.
//   The whole argument of the CDJ-2000NXS page is "look at the firmware version"
//   and the link to the firmware table was being dropped by an artifact of how
//   many topics its own guide entry listed. That is not relevance, it is
//   bookkeeping leaking into editorial.
//
// So: weight expresses EDITORIAL PRIORITY WHEN RELEVANT, hits only order guides
// of equal priority. A guide with one precise tag now competes properly with a
// guide carrying five loose ones.
//
//   weight 1  the reader is probably here because this is broken
//   weight 2  reference they will need next
//   weight 3  useful, take a slot if one is free
//   weight 4  last
export const GUIDE_INDEX = [
  // `dvs` added 2026-08-07: rekordbox IS the DVS software, and without that tag
  // this guide had ZERO intersection with all five mixer pages, so no mixer
  // linked the rekordbox reference at all.
  { key: 'rekordbox',   href: '/knowledge/pioneer-dj/rekordbox',        tags: ['onelibrary', 'devicelibrary', 'usb-prep', 'exfat', 'no-exfat', 'dvs'], weight: 2 },
  { key: 'onelibrary',  href: '/knowledge/pioneer-dj/rekordbox#onelibrary', tags: ['onelibrary', 'devicelibrary'], weight: 3 },
  { key: 'firmware',    href: '/knowledge/pioneer-dj/firmware',         tags: ['firmware'], weight: 1 },
  { key: 'exfatVsFat',  href: '/fix/exfat-vs-fat32-cdj',                tags: ['exfat', 'no-exfat', 'filesystems'], weight: 1 },
  { key: 'formatUsb',   href: '/fix/format-usb-for-cdj',                tags: ['filesystems', 'no-exfat', 'usb-prep'], weight: 1 },
  { key: 'usbNotRead',  href: '/fix/usb-not-recognized-cdj',            tags: ['usb-prep', 'filesystems'], weight: 1 },
  { key: 'playlists',   href: '/fix/playlists-not-showing-cdj',         tags: ['onelibrary', 'devicelibrary', 'usb-prep'], weight: 1 },
  { key: 'waveforms',   href: '/fix/waveforms-not-loading-cdj',         tags: ['usb-prep'], weight: 3 },
  { key: 'exportFail',  href: '/fix/rekordbox-export-failed',           tags: ['usb-prep'], weight: 3 },
  { key: 'backup',      href: '/fix/dj-usb-backup-strategy',            tags: ['usb-prep'], weight: 3 },
  { key: 'errorE8302',  href: '/fix/cdj-error-e-8302',                  tags: ['prodjlink', 'link-network'], weight: 2 },
  { key: 'emergencyLoop', href: '/fix/emergency-loop-mode',             tags: ['ecodesign', 'firmware'], weight: 3 },
  { key: 'checklist',   href: '/checklist',                             tags: ['usb-prep', 'prodjlink', 'link-network', 'firmware'], weight: 2 },
  { key: 'prepare',     href: '/prepare',                               tags: ['usb-prep', 'firmware', 'ecodesign'], weight: 3 },
  { key: 'dictionary',  href: '/knowledge/dictionary',                  tags: ['rotary', 'long-blend', 'no-crossfader', 'dvs', 'prodjlink'], weight: 3 },
  { key: 'gear',        href: '/gear',                                  tags: ['usb-prep', 'filesystems'], weight: 4 },
];

// Resolve helpers. Pages call these instead of reasoning about the graph, so
// the rules live in one place and every page and language behaves identically.

export function equipmentFor(slug) {
  return BY_SLUG.get(slug) ?? null;
}

// Lineage, nearest first, unknown slugs dropped so a broken link cannot ship.
export function relatedModels(slug, limit = 2) {
  const e = BY_SLUG.get(slug);
  if (!e) return [];
  const out = [];
  const push = (s) => {
    const m = BY_SLUG.get(s);
    if (m && m.slug !== slug && !out.some((x) => x.slug === m.slug)) out.push(m);
  };
  // Lineage first, newer before older, because "what replaced this" is the
  // question a DJ standing in an old booth is actually asking.
  push(e.newer);
  push(e.older);
  // Then top up from siblings, so a model at the end of its line still leads
  // somewhere instead of showing an empty heading.
  for (const s of e.siblings ?? []) {
    if (out.length >= limit) break;
    push(s);
  }
  return out.slice(0, limit);
}

// The counterpart category. Players get mixers, mixers get players.
export function pairedModels(slug) {
  const e = BY_SLUG.get(slug);
  if (!e) return [];
  return (e.paired ?? []).map((s) => BY_SLUG.get(s)).filter(Boolean);
}

// Guides whose tags intersect the model's, best first, capped. The cap is the
// point: "every page should lead somewhere useful" fails if it leads to
// fourteen places at once, which is a link farm rather than a next step.
// Six, not five. Five cost the legacy players their link to the firmware table
// even after the weights were fixed, and six is what the hand-written blocks
// these replaced already carried, so it is not a step up in link density.
export function relatedGuides(slug, limit = 6) {
  const e = BY_SLUG.get(slug);
  if (!e) return [];
  const tags = new Set(e.tags ?? []);
  return GUIDE_INDEX
    .map((g) => ({ g, hits: g.tags.filter((t) => tags.has(t)).length }))
    .filter((x) => x.hits > 0)
    // Weight first, hits second. See the note above GUIDE_INDEX: sorting by hits
    // first ranks guides by how many tags they happen to carry, not by how much
    // they help, and it dropped the firmware table off the three pages that are
    // ABOUT firmware.
    .sort((a, b) => a.g.weight - b.g.weight || b.hits - a.hits || a.g.key.localeCompare(b.g.key))
    .slice(0, limit)
    .map((x) => x.g);
}
