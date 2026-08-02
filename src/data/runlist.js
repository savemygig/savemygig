/*
 * THE MOVES. Written for a DJ WHO ALREADY KNOWS HOW TO DJ.
 *
 * Antonio killed the first version and he was right. It opened with "reseat the
 * drive" and "try the other deck". A working DJ has done both of those before
 * they ever think about pulling out a phone. Listing them is not help, it is a
 * page telling a professional it thinks they are an amateur, and it burns the
 * top of the screen, which is the only part that gets read.
 *
 * So the filter for this list is now brutal and single: DOES A COMPETENT DJ,
 * MID-PANIC, PLAUSIBLY FAIL TO THINK OF THIS? If they would have done it in the
 * first ten seconds on instinct, it does not belong here.
 *
 * That deletes reseat, other slot, other player, wipe the contacts, and swap in
 * your own clone, all of which are reflexes. What survives is the set of things
 * that are genuinely NOT obvious under pressure, and it is short:
 *
 *   FOLDER  - most DJs do not know the audio still plays with the database gone
 *   LINK    - forgotten under stress, and it is the fastest fix in a club booth
 *   RESTART - feels too drastic mid-set, so people skip it
 *   BORROW  - people are embarrassed to ask, and do not realise it will read
 *
 * Four moves. Fewer than before, and every one of them earns its line.
 *
 * The list is data, not prose, because it renders identically on the emergency
 * screen and the printable card. If the words drift between surfaces the DJ
 * never memorises them, and memorising them is the whole point.
 */

/* What is true before the DJ does anything. This is the part that actually
   lowers the heart rate, and it is not a step, so it is not numbered. */
export const RUNLIST_HEAD =
  'You have more time than it feels like. If a track was playing when the drive ' +
  'died it is still playing, and a big library can take thirty seconds to appear. ' +
  'Do not yank anything.';

/* The line that says "we know who you are". It replaces four patronising steps
   with one sentence and buys the rest of the page credibility. */
export const RUNLIST_ASSUMED =
  'You have already reseated it and tried the other deck.';

export const RUNLIST = [
  {
    verb: 'FOLDER',
    action: 'The database is gone. The music is not.',
    detail:
      'If the drive shows up at all, even with the playlists gone: SOURCE, select ' +
      'the USB, then browse in FOLDER mode. The player reads the ' +
      'audio files directly and ignores the rekordbox database, which is the part ' +
      'that usually died. You lose cues, playlists and sync. You keep the gig. ' +
      'This is the single most useful thing on this page and the one most DJs ' +
      'have never tried.',
  },
  {
    verb: 'LINK',
    action: 'Play off the other player’s drive.',
    detail:
      'If the booth is linked over PRO DJ LINK, any player can browse and load ' +
      'from a drive that is physically in another one. Your own drive being dead ' +
      'does not matter. In a club with a proper Pioneer setup this is often the ' +
      'fastest fix available, and it is the one people forget when the room is ' +
      'looking at them.',
  },
  {
    verb: 'RESTART',
    action: 'Power-cycle the dead player.',
    detail:
      'USB STOP first, power off, twenty seconds, back on. It feels too drastic ' +
      'mid-set so people skip it, but on a player that is not in the mix it costs ' +
      'you nothing. Never do this to a deck that is live, and never to the deck ' +
      'the other DJ is on.',
  },
  {
    verb: 'BORROW',
    action: 'Take a drive off the DJ either side of you.',
    detail:
      'Their drive is a rekordbox export like yours, so it will read. This has ' +
      'happened to every one of them and none of them will care. You will be ' +
      'playing someone else’s music, but you will be playing. Music first, pride ' +
      'later.',
  },
];

/* The one rule that overrides every move above. */
export const RUNLIST_NEVER =
  'Do not let anything format or initialise your drive tonight, and never say ' +
  'yes to a computer that offers to. Your music is still on it, and formatting ' +
  'is the one action you cannot undo.';

/*
 * NOT a move. Antonio killed "play off your phone" as a numbered step and he is
 * right twice over: it needs a USB-C to 3.5mm female adapter AND a 3.5mm to twin
 * RCA cable, which almost nobody has in the bag at the moment they need it, so
 * as an in-booth instruction it is useless. And even when it works it is not a
 * DJ playing, it is a room that is not silent. Those are different outcomes and
 * we should not dress one up as the other. The cable belongs in PREVENTION,
 * where someone can act on it.
 */
export const RUNLIST_LAST_RESORT = {
  title: 'If there is no drive anywhere',
  body:
    'A phone into a spare channel keeps the room from going silent. Be clear ' +
    'with yourself about what it is: not your set continuing, the night not ' +
    'stopping. It also only works if you already carry a USB-C to 3.5mm adapter ' +
    'and a 3.5mm to twin RCA cable. No weight, no money, and worth nothing at ' +
    'all if it is at home.',
};
