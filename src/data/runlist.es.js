/*
 * THE MOVES, NEUTRAL LATIN AMERICAN SPANISH.
 *
 * Counterpart of src/data/runlist.js. Read that file's header first: it
 * explains why there are four moves and not eight, and the filter that keeps
 * them there. DOES A COMPETENT DJ, MID-PANIC, PLAUSIBLY FAIL TO THINK OF THIS?
 * Anything a working DJ does on instinct in the first ten seconds was cut. The
 * Spanish has to carry that respect or it becomes the patronising list Antonio
 * killed. Peer to peer, no hand holding, never "solo tienes que".
 *
 * These five constants used to live inline at the top of
 * src/pages/es/protocol/[...slug].astro, with a copy of the four action lines
 * in src/pages/es/card.astro. They are lifted here WORD FOR WORD so there is
 * one source of truth per language. If the tunnel and the printed card say
 * different things the DJ never memorises the moves, which is exactly the
 * failure the English file calls the worst outcome.
 *
 * Structure is a mirror and must stay one: same export names, same array
 * order, same `verb` values. ONLY the human readable strings differ.
 *
 * VERBS. FOLDER and LINK are printed on Pioneer DJ hardware (FOLDER browse
 * mode, PRO DJ LINK) and are never translated, in any language. REINICIA and
 * PIDE are instructions rather than labels, so they are Spanish, and they are
 * the exact words src/pages/es/card.astro prints. Verbs sit in a narrow
 * monospace column: keep them one short word.
 *
 * TRANSLATION RULES THAT ARE LOAD BEARING HERE:
 *  - Glossary follows src/data/emergency-tree.es.js exactly: reproductor, USB,
 *    base de datos, librería, track, deck, set, gig, booth, sala. `tú`, never
 *    `vos`, never `usted`, never `vosotros`. `computadora`, never `ordenador`.
 *    `pen drive` is Brazilian usage and never appears in Spanish.
 *  - Hardware labels and product names stay English: SOURCE, USB, USB STOP,
 *    FOLDER, LINK, PRO DJ LINK, rekordbox (lowercase), CDJ, Pioneer DJ.
 *  - No exclamation marks, no em or en dashes: the build rejects them.
 *  - `action` lines print beside the verb, so they are re authored short
 *    rather than translated long. Spanish runs 15 to 25 percent longer than
 *    English and a wrapped action line is unreadable in a dark booth.
 *
 * Rendered by src/pages/es/protocol/[...slug].astro (usb/moves) and by
 * src/pages/es/card.astro.
 */

/* What is true before the DJ does anything. Not a step, so it is not
   numbered. This is the line that lowers the heart rate, and short is the
   only way it does that. */
export const RUNLIST_HEAD =
  'Tienes más tiempo del que parece. Si había un track sonando cuando murió el ' +
  'USB, sigue sonando, y una librería grande puede tardar treinta segundos en ' +
  'aparecer. No arranques nada.';

/* The line that says "we know who you are". */
export const RUNLIST_ASSUMED =
  'Ya lo reconectaste y ya probaste el otro deck.';

export const RUNLIST = [
  {
    verb: 'FOLDER',
    action: 'La base de datos murió. La música no.',
    detail:
      'Si el USB aparece, aunque sea sin playlists: SOURCE, elige el USB y navega ' +
      'en modo FOLDER. El reproductor lee los archivos de audio directo e ignora ' +
      'la base de datos de rekordbox, que es la parte que suele morir. Pierdes ' +
      'cues, playlists y sync. Te quedas con el gig. Esto es lo más útil de esta ' +
      'página y lo que la mayoría de los DJs nunca ha probado.',
  },
  {
    verb: 'LINK',
    action: 'Toca desde el USB del otro reproductor.',
    detail:
      'Si el booth está enlazado por PRO DJ LINK, cualquier reproductor puede ' +
      'buscar y cargar desde un USB que está físicamente en otro. Que tu USB esté ' +
      'muerto deja de importar. En un booth Pioneer DJ bien armado suele ser el ' +
      'arreglo más rápido que hay, y es el que se olvida cuando toda la sala te ' +
      'está mirando.',
  },
  {
    verb: 'REINICIA',
    action: 'Apaga y enciende el reproductor muerto.',
    detail:
      'Primero USB STOP, apaga, veinte segundos, enciende. Se siente demasiado ' +
      'drástico a mitad del set y por eso se salta, pero en un reproductor que no ' +
      'está en la mezcla no te cuesta nada. Nunca lo hagas en un deck que está al ' +
      'aire, y nunca en el deck del otro DJ.',
  },
  {
    verb: 'PIDE',
    action: 'Pídele el USB al DJ que va antes o después de ti.',
    detail:
      'Su USB es un export de rekordbox como el tuyo, así que va a leer. Esto les ' +
      'ha pasado a todos y a ninguno le va a molestar. Vas a estar tocando música ' +
      'de otra persona, pero vas a estar tocando. Primero la música, el orgullo ' +
      'después.',
  },
];

/* The one rule that overrides every move above. */
export const RUNLIST_NEVER =
  'No dejes que nada formatee ni inicialice tu USB hoy, y nunca le digas que sí ' +
  'a una computadora que se ofrece a hacerlo. Tu música sigue ahí, y formatear ' +
  'es la única acción que no se puede deshacer.';

/* NOT a move, for the reason the English file gives: it needs two cables
   almost nobody has in the bag at the moment they need them, and even when it
   works it is the room not stopping, not the set continuing. */
export const RUNLIST_LAST_RESORT = {
  title: 'Si no hay ningún USB por ningún lado',
  body:
    'Un celular en un canal libre evita que la sala se quede en silencio. Ten ' +
    'claro qué es: no es que tu set siga, es que la sala no se detiene. Y solo ' +
    'funciona si ya cargas un adaptador de USB-C a 3.5mm y un cable de 3.5mm a ' +
    'doble RCA. No pesa, no cuesta, y no sirve de nada si está en tu casa.',
};
