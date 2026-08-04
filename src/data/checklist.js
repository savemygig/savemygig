/**
 * THE PRE-GIG CHECKLIST, as data.
 *
 * EXTRACTED FROM src/pages/checklist.astro 2026-08-04, for translation.
 * Every other page on this site is translated by writing a per-language page
 * file, because page prose deserves to be re-authored rather than mapped
 * one-to-one. The checklist is the one page where that is the wrong tool: it
 * is a 4000 line file that is almost entirely behaviour (drag and drop,
 * custom lists, sync, the print sheet, the account gate) wrapped around 48
 * short strings. Duplicating that three times would triple the maintenance
 * cost of every future fix to any of it, for no gain in translation quality:
 * a checklist item is a label, not a paragraph, and a label IS the case a
 * catalogue is right for.
 *
 * So the structure lives once in the page and the words live here, one file
 * per language: checklist.js, checklist.pt.js, checklist.es.js.
 *
 * KEYS ARE STORAGE, NOT COPY. `key` is the localStorage identity of a ticked
 * item and `id` is the group's. They must be IDENTICAL across all three
 * languages: a DJ who ticks eight items and then switches language must find
 * eight items still ticked. Never translate a key or an id. `level` and
 * `icon` are behaviour too and never change.
 *
 * Translate ONLY: the group `title`, the group `blurb`, and each item
 * `label`.
 */
export const groups = [
  {
    id: 'music',
    title: 'Music',
    icon: 'disc',
    blurb: 'The set itself: drives, export and compatibility.',
    items: [
      { key: 'usb-two', level: 'basic', label: 'Two identical USB drives with the same export, labelled A and B' },
      { key: 'format', level: 'basic', label: 'Both USB drives formatted as FAT32 + MBR for maximum compatibility' },
      { key: 'reexport', level: 'basic', label: 'Re-exported after the last library change' },
      { key: 'tested', level: 'basic', label: 'Both USB drives tested on a CDJ or verified in rekordbox' },
      // Antonio's rule, and the research backs it with names: AlphaTheta pulled
      // CDJ-3000 firmware 3.30 after it emptied browse screens live. A working
      // setup on gig day is a frozen setup.
      { key: 'noupdates', level: 'basic', label: 'No updates today (rekordbox, firmware or operating system)' },
      { key: 'lib-format', level: 'advanced', label: 'Export verified for the venue\u2019s equipment' },
    ],
  },
  {
    id: 'backups',
    title: 'Music Backups',
    icon: 'sync',
    blurb: 'When two copies aren\u2019t enough.',
    items: [
      { key: 'third-backup', level: 'advanced', label: 'Third copy of your music stored separately' },
      { key: 'backup', level: 'advanced', label: 'rekordbox library backed up to the cloud' },
      { key: 'my-settings', level: 'advanced', label: 'My Settings exported to your USB drives' },
      // "latest" is lint-banned (snapshot word); "most recent" says it.
      { key: 'backup-fresh', level: 'advanced', label: 'Most recent music changes included in every backup' },
      { key: 'recovery-plan', level: 'advanced', label: 'Recovery plan if all USB drives fail' },
    ],
  },
  {
    id: 'gear',
    title: 'DJ Gear',
    icon: 'sliders',
    blurb: 'What you\u2019ll perform with, and what can save your set.',
    blurbBase: 'What you\u2019ll perform with.',
    items: [
      { key: 'headphones', level: 'basic', label: 'Headphones' },
      { key: 'hp-adapter', level: 'basic', label: 'Headphone adapter (3.5 mm to 6.3 mm, if needed)' },
      { key: 'laptop', level: 'advanced', label: 'Laptop + charger (recommended for rebuilding USB drives, re-exporting playlists or emergency troubleshooting)' },
    ],
  },
  {
    // Reordered (Antonio, live review): Technical Kit now sits right after
    // DJ Gear instead of after Logistics \u2014 it's cable/adapter kit, closer
    // kin to Gear than to venue logistics. Personal Kit (below Logistics)
    // moved the opposite direction, to the end, for the same reason: it's
    // the pocket check, thematically last, not competing with Gear/Music
    // for attention right up top. Net effect on Basic mode (the only place
    // order is actually visible day-to-day, since Backups/Technical/Rescue
    // are all-advanced and hide there): Music, DJ Gear, Logistics, Personal
    // Kit \u2014 exactly the sequence Antonio asked for.
    id: 'technical',
    title: 'Technical Kit',
    icon: 'usb',
    blurb: 'The small things that save big gigs.',
    items: [
      { key: 'adapters', level: 'advanced', label: 'USB-C and USB-A adapters for modern devices and emergency connections' },
      { key: 'cables', level: 'advanced', label: 'Spare USB cables for your laptop, phone and compatible DJ equipment' },
      { key: 'ethernet', level: 'advanced', label: 'Ethernet cable (for Pro DJ Link and compatible setups)' },
      { key: 'rca', level: 'advanced', label: 'One pair of RCA cables (can also be used as digital coaxial cables when needed)' },
      { key: 'tripod', level: 'advanced', label: 'Phone tripod for recording content or streaming' },
      { key: 'power-strip', level: 'advanced', label: 'Extension lead or power strip' },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics',
    icon: 'pin',
    blurb: 'Everything around the gig.',
    items: [
      // Antonio's order, booth first: know the booth before anything else.
      { key: 'booth-setup', level: 'basic', label: 'DJ booth setup confirmed (players, mixer and software support)' },
      { key: 'settime', level: 'basic', label: 'Lineup and set times confirmed' },
      { key: 'address', level: 'basic', label: 'Venue address confirmed' },
      { key: 'guestlist', level: 'basic', label: 'Artist access confirmed' },
      { key: 'contact', level: 'basic', label: 'Promoter or venue contact saved' },
      { key: 'transport', level: 'basic', label: 'Transport planned (to and from the venue)' },
      // "Running order" retired (Antonio): "Lineup and set times confirmed"
      // says the same thing in DJ language, so the Advanced twin went.
      // Travel folded in here (Antonio deleted the Travel section; its
      // survivors keep their keys, so old ticks carry over).
      { key: 'hotel', level: 'advanced', label: 'Hotel or accommodation confirmed (if applicable)' },
      { key: 'passport-valid', level: 'advanced', label: 'Passport valid for the destination (minimum validity if required)' },
      { key: 'visa', level: 'advanced', label: 'Visa or work permit requirements confirmed' },
      { key: 'vaccines', level: 'advanced', label: 'Required vaccination or health certificates confirmed' },
      { key: 'adapter', level: 'advanced', label: 'Travel adapter packed (if required)' },
    ],
  },
  {
    id: 'personal',
    title: 'Personal Kit',
    icon: 'star',
    blurb: 'The pocket check.',
    items: [
      { key: 'phone', level: 'basic', label: 'Phone charged' },
      { key: 'charge-cable', level: 'basic', label: 'Charging cable + power adapter' },
      { key: 'powerbank', level: 'basic', label: 'Power bank (recommended)' },
      { key: 'money', level: 'basic', label: 'Wallet (cards + cash)' },
      { key: 'docs', level: 'basic', label: 'ID / Passport / Driver\u2019s Licence (as applicable)' },
      { key: 'keys', level: 'basic', label: 'Keys (home, hotel or car, as needed)' },
      { key: 'earplugs', level: 'advanced', label: 'Earplugs' },
      { key: 'water', level: 'advanced', label: 'Water bottle' },
      { key: 'snacks', level: 'advanced', label: 'Snacks for a long gig' },
      { key: 'meds', level: 'advanced', label: 'Any medicine you need' },
      { key: 'spare-shirt', level: 'advanced', label: 'Spare shirt' },
      { key: 'freshen', level: 'advanced', label: 'Deodorant' },
    ],
  },
  {
    id: 'recovery',
    title: 'Rescue Kit',
    icon: 'shield',
    blurb: 'The little things that can save a gig.',
    items: [
      { key: 'card', level: 'advanced', label: 'Save My Gig Emergency Card (printed or saved on your phone)' },
      { key: 'flashlight', level: 'advanced', label: 'Small LED flashlight' },
      { key: 'multitool', level: 'advanced', label: 'Compact screwdriver or multitool' },
      { key: 'cloth', level: 'advanced', label: 'Microfiber cloth' },
      { key: 'gaffer', level: 'advanced', label: 'Gaffer tape' },
    ],
  },
];
