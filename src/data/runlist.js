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
    action: 'Take a drive off the DJ before or after you.',
    detail:
      'Ask the DJ on either side of you, or the resident. This has happened to ' +
      'every one of them, and their drive is a rekordbox export like yours, so ' +
      'it will read. You will be playing someone else’s music, but you will ' +
      'be playing. Music first, pride later.',
  },
];

/*
 * NOT a move. Antonio killed "play off your phone" as move six and he is right
 * twice over: it needs a USB-C to 3.5mm female adapter AND a 3.5mm to twin RCA
 * cable, which almost nobody has in the bag at the moment they need it, so as
 * an in-booth instruction it is useless. And even when it works it is not a DJ
 * playing, it is a room that is not silent. Those are different outcomes and we
 * should not dress one up as the other.
 *
 * So it lives here, below the list, as the honest last resort, and the cable
 * itself belongs in PREVENTION where a DJ can act on it.
 */
export const RUNLIST_LAST_RESORT = {
  title: 'If there is no drive anywhere',
  body:
    'A phone into a spare channel keeps the room from going silent. Be clear ' +
    'with yourself about what it is: it is not your set continuing, it is the ' +
    'night not stopping. It also only works if you already carry a USB-C to ' +
    '3.5mm adapter and a 3.5mm to twin RCA cable. Six pounds, no weight, and it ' +
    'is worth nothing at all if it is at home.',
};

/* The one rule that overrides every step above. */
export const RUNLIST_NEVER =
  'Do not let anything format or initialise your drive tonight. Your music is ' +
  'still on it, and formatting is the one action you cannot undo.';
