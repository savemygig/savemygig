/*
 * THE SIX MOVES. One canonical list, rendered on every surface that shows it.
 *
 * Antonio's framing, and it is the correct one: this is not something a DJ
 * READS in the booth. It is something they learn at home and RECOGNISE in the
 * booth. The screen is a reminder, not a tutorial. That forces three rules:
 *
 *   1. Every step is ONE WORD you can recall without the screen. The sentence
 *      under it is a jog, not an explanation. Explanation is collapsed.
 *   2. The order is by (how often it works) x (how fast it is), with no
 *      branching, so nobody has to CHOOSE anything under adrenaline.
 *   3. The wording is identical on the emergency screen, the printable card
 *      and the prevention page. If the words drift, the memory never forms.
 *      That is why this file exists instead of three copies of the same list.
 *
 * Why SWAP is first: it is the only step that is both ten seconds AND close to
 * certain, but ONLY for a DJ who did the prevention work. That is deliberate.
 * The reward for carrying a cloned second drive should be that the emergency
 * ends at step one. A DJ who did not prepare reads six words and moves on, and
 * has lost about one second.
 */
export const RUNLIST = [
  {
    verb: 'SWAP',
    action: 'Load your second drive.',
    detail:
      'If you carry a clone, this is over in ten seconds and nothing else on ' +
      'this list matters. If you do not carry one yet, that is the single ' +
      'change that makes this whole page unnecessary next time.',
  },
  {
    verb: 'OTHER DECK',
    action: 'Try the other slot, then the other player.',
    detail:
      'A drive can fail on one deck and mount fine on the next: the fault is ' +
      'often the port, not the stick. If it reads there, play from there and ' +
      'sort the rest out later. Give it thirty seconds, big libraries are slow ' +
      'to mount.',
  },
  {
    verb: 'RESEAT',
    action: 'Pull it out, wipe the tip, push it back in hard.',
    detail:
      'Sweat, beer and booth dust on the contacts are real causes, not folklore. ' +
      'Count to ten with it out. Push until it seats properly, a half-inserted ' +
      'drive looks inserted.',
  },
  {
    verb: 'FOLDER',
    action: 'Drive reads but playlists are gone? Press FOLDER view.',
    detail:
      'SOURCE, select the USB, then the browse / FOLDER button. Your music is ' +
      'still on the stick, only the rekordbox database is missing. You lose ' +
      'cues, sync and playlists. You keep the gig.',
  },
  {
    verb: 'RESTART',
    action: 'Power-cycle the player. Only if nobody is playing on it.',
    detail:
      'USB STOP first, power off, twenty seconds, back on. Never do this to a ' +
      'deck that is live in the mix, and never to the deck the other DJ is on.',
  },
  {
    verb: 'BORROW',
    action: 'Take a drive off another DJ, or play off your phone.',
    detail:
      'Ask the DJ before or after you, or the resident. This has happened to ' +
      'every one of them. A phone into a spare channel is not a failure, it is ' +
      'a set that continued. Music first, pride later.',
  },
];

/* The one rule that overrides every step above. */
export const RUNLIST_NEVER =
  'Do not let anything format or initialise your drive tonight. Your music is ' +
  'still on it, and formatting is the one action you cannot undo.';
