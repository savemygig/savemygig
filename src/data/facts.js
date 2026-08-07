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
  rekordboxMin: '7.2.16',
  deviceLibraryNeedsConversion: true,
  // 3. Only THREE of the ports take a drive, and one of the USB-C sockets is
  //    for a computer, not storage. In a dark booth they look identical.
  usbPorts: 'USB Type-A x1 (storage), USB Type-C x2 (storage x1, PC connection x1)',
  storagePorts: 2,
  formats: ['MP3', 'AAC', 'WAV', 'AIFF', 'Apple Lossless', 'FLAC'],
  // PRO DJ LINK caps at FOUR here, not the six an all-CDJ-3000 rig allows.
  maxLinkedUnits: 4,
  linkNote: 'Up to 4 units can be connected when using a switching hub',
  wirelessLan: 'IEEE 802.11 a/b/n/ac',
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
  crashHotCueFix: '1.06',        // 10 Dec 2012: player CRASHES on repeated HOT CUE with Master Tempo on.
  syncDropoutFix: '1.10',        // 25 Feb 2013: audio dropout on the slave deck when using SYNC.
  tagListFreezeFix: '1.11',      // 15 Apr 2013: freeze while editing the TAG LIST.
  browseSlowFix: '1.13',         // 17 Jun 2013: browse screen slows or STOPS after several hours of use,
                                 // plus a freeze holding HOT CUE over 1 second during auto hot cue loading,
                                 // plus playback failing after a large USB (20,000 tracks) is disconnected.
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
  // Media and library. FAT32 only: no exFAT on this generation, which is the
  // single most common reason a modern drive fails in an old booth.
  library: 'Device Library',
  exfat: false,
  media: 'USB and SD card',
  source: 'https://support.alphatheta.com/en-US/articles/21976886580633',
  sourceHistory: 'https://downloads.support.alphatheta.com/firmwares/dj-players/CDJ-2000NXS/CDJ-2000NXS-Firmware-Change-History-Ver144-en.pdf',
};

// CDJ-900NXS. The 2000NXS's smaller sibling, same era, same FAT32 limit, and a
// change history that stops in 2017: the newest firmware is 1.31 and there has
// been nothing since, so the floor is simply "be at 1.31".
// Source: downloads.support.alphatheta.com/firmwares/dj-players/CDJ-900NXS/CDJ-900NXS-Firmware-Change-History-Ver131-en.pdf
export const CDJ_900NXS = {
  checked: '7 August 2026',
  newestKnown: '1.31',           // 5 Oct 2017. Nothing published since.
  beatDivideFix: '1.20',         // 1 Apr 2014: playback sound STOPS while BEAT DIVIDE is active.
  hddFolderFix: '1.21',          // 17 Feb 2015: folder browsing on 2TB HDDs; slow track list in Serato DJ HID.
  hddRecognitionFix: '1.22',     // 20 Aug 2015: HDD recognition; noise when Master Tempo is activated.
  aiffLoadFix: '1.30',           // 24 Nov 2016: AIFF 24bit/48kHz playback stopped and tracks would not load.
  wavNoiseFix: '1.30',           // Same version: digitally distorted white noise on certain .WAV files.
  nxs2LinkFix: '1.30',           // Same version: PRO DJ LINK compatibility with CDJ-2000NXS2 and XDJ-1000MK2.
  syncBpmFix: '1.31',            // 5 Oct 2017: speed not returning to the displayed BPM with Sync enabled.
  library: 'Device Library',
  exfat: false,
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
  sendEffects: ['Delay', 'Tape Echo', 'Echo Verb', 'Reverb', 'Shimmer'],
  highPassFilter: true,
  externalFx: 'Send/Return plus a Master Insert',
  energyVisualizer: true,
  inputs: 'Digital (coaxial) x4, Line (RCA) x4, Phono (RCA) x4, Mic x1 (XLR / 1/4" TRS)',
  outputs: 'Master (XLR), Booth (1/4" TRS), REC (RCA), Phones (1/4" and 3.5mm)',
  usbPorts: 'USB Type-C x1',
  proDjLink: null,               // not stated by AlphaTheta, deliberately not guessed
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
  { m: 'CDJ-2000NXS2',   lib: 'Device Library', exfat: 'No',                 note: 'The workhorse in most club booths. FAT32 only.' },
  { m: 'CDJ-2000 / NXS', lib: 'Device Library', exfat: 'No',                 note: 'Still everywhere. FAT32 only.' },
  { m: 'CDJ-900 / 850',  lib: 'Device Library', exfat: 'No',                 note: 'FAT32 only.' },
  { m: 'XDJ-AZ',         lib: 'OneLibrary',     exfat: 'Yes',                note: '' },
  // XDJ-AN: added to rekordbox in 7.2.16 alongside the CDJ-1500X. Filesystems
  // (FAT16/FAT32/exFAT/HFS+) per official article
  // support.alphatheta.com/en-US/articles/53214453591009.
  { m: 'XDJ-AN',         lib: 'OneLibrary',     exfat: 'Yes',                note: 'Added in rekordbox 7.2.16.' },
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
    // THE LONGEST LIST HERE, and the reason this matrix exists. Eleven versions of
    // documented faults on a player still installed in an enormous number of
    // booths, most of which have never been updated. Every entry is AlphaTheta's
    // own wording, condensed, from the change history PDF read in full.
    model: 'CDJ-2000NXS',
    href: '/knowledge/pioneer-dj/cdj-2000nxs',
    source: CDJ_2000NXS.sourceHistory,
    issues: [
      { fixedIn: CDJ_2000NXS.crashHotCueFix, area: 'Playback', midSet: true, symptom: 'The player crashed on repeated HOT CUE presses with Master Tempo enabled.' },
      { fixedIn: CDJ_2000NXS.syncDropoutFix, area: 'Audio', midSet: true, symptom: 'Audio dropout on the slave deck when using SYNC.' },
      { fixedIn: CDJ_2000NXS.tagListFreezeFix, area: 'Browse', midSet: true, symptom: 'A freeze could occur while editing the TAG LIST.' },
      { fixedIn: CDJ_2000NXS.browseSlowFix, area: 'Browse', midSet: true, symptom: 'The browse screen slowed or stopped after several hours of use, and a freeze occurred holding HOT CUE over a second during auto hot cue loading.' },
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
    // The Ecodesign entry is a BEHAVIOUR, not a defect, so it rides as a warning
    // rather than an issue: a deck that switched itself off is obeying a setting,
    // and calling it a fault would send a DJ looking for a repair.
    model: 'XDJ-700',
    href: '/knowledge/pioneer-dj/xdj-700',
    source: XDJ_700.sourceHistory,
    warning: {
      version: XDJ_700.ecoStandbyIntro,
      text: 'Not a defect. From this version the unit automatically switches off after 20 minutes of no use when Power Management is on, following the EU Ecodesign Directive. A deck that powered down during a long changeover is obeying that setting, not failing.',
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
];
