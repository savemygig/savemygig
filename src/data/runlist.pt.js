/*
 * THE MOVES, BRAZILIAN PORTUGUESE (pt-BR).
 *
 * Counterpart of src/data/runlist.js. Read that file's header first: it
 * explains why there are four moves and not eight, and the filter that keeps
 * them there. DOES A COMPETENT DJ, MID-PANIC, PLAUSIBLY FAIL TO THINK OF THIS?
 * Everything a working DJ does on instinct in the first ten seconds was cut.
 * The Portuguese has to carry that respect or it becomes the patronising list
 * Antonio killed. Peer to peer, no hand holding, never "é só".
 *
 * Structure is a mirror and must stay one: same export names, same array
 * order, same `verb` values. ONLY the human readable strings differ.
 *
 * VERBS. FOLDER and LINK are printed on Pioneer DJ hardware (FOLDER browse
 * mode, PRO DJ LINK) and are never translated, in any language. REINICIAR and
 * PEDIR are instructions rather than labels, so they are Portuguese, and they
 * are the exact words src/pages/pt/card.astro prints. Verbs sit in a narrow
 * monospace column: keep them one short word.
 *
 * TRANSLATION RULES THAT ARE LOAD BEARING HERE:
 *  - Glossary follows src/data/emergency-tree.pt.js exactly: player, drive,
 *    pen drive, banco de dados, biblioteca, track, deck, set, gig, booth,
 *    a casa. Never ficheiro, ecrã, telemóvel.
 *  - Hardware labels and product names stay English: SOURCE, USB, USB STOP,
 *    FOLDER, LINK, PRO DJ LINK, rekordbox (lowercase), CDJ, Pioneer DJ.
 *  - No exclamation marks, no em or en dashes: the build rejects them.
 *  - `action` lines print beside the verb, so they are re authored short
 *    rather than translated long. Portuguese runs 15 to 25 percent longer
 *    than English and a wrapped action line is unreadable in a dark booth.
 *
 * Rendered by src/pages/pt/protocol/[...slug].astro (usb/moves) and by
 * src/pages/pt/card.astro. One source of truth per language: if the two
 * surfaces disagree the DJ never memorises the moves, which is the whole
 * point of the list being data instead of prose.
 */

/* What is true before the DJ does anything. Not a step, so it is not
   numbered. This is the line that lowers the heart rate, and short is the
   only way it does that. */
export const RUNLIST_HEAD =
  'Você tem mais tempo do que parece. Se uma track estava tocando quando o ' +
  'drive morreu, ela continua tocando, e uma biblioteca grande pode levar ' +
  'trinta segundos para aparecer. Não arranque nada.';

/* The line that says "we know who you are". */
export const RUNLIST_ASSUMED =
  'Você já recolocou o drive e já tentou o outro player.';

export const RUNLIST = [
  {
    verb: 'FOLDER',
    action: 'O banco de dados morreu. A música não.',
    detail:
      'Se o drive aparecer, mesmo sem as playlists: SOURCE, selecione o USB e ' +
      'navegue no modo FOLDER. O player lê os arquivos de áudio direto e ' +
      'ignora o banco de dados do rekordbox, que é a parte que costuma morrer. ' +
      'Você perde cues, playlists e sync. Você fica com a gig. É a coisa mais ' +
      'útil desta página e a que a maioria dos DJs nunca tentou.',
  },
  {
    verb: 'LINK',
    action: 'Toque pelo drive do outro player.',
    detail:
      'Se a booth está em rede pelo PRO DJ LINK, qualquer player pode navegar ' +
      'e carregar de um drive que está fisicamente em outro. O seu drive morto ' +
      'deixa de importar. Numa booth com os players ligados em rede, costuma ser a ' +
      'solução mais rápida que existe, e é a que se esquece quando a pista ' +
      'inteira está olhando.',
  },
  {
    verb: 'REINICIAR',
    action: 'Desligue e ligue o player morto.',
    detail:
      'USB STOP primeiro, desligue, vinte segundos, ligue de novo. Parece ' +
      'drástico demais no meio do set e por isso as pessoas pulam, mas num ' +
      'player que está fora da mixagem não custa nada. Nunca faça isso num ' +
      'deck que está no ar, e nunca no deck em que o outro DJ está.',
  },
  {
    verb: 'PEDIR',
    action: 'Pegue um drive emprestado do DJ do seu lado.',
    detail:
      'O drive dele é um export do rekordbox igual ao seu, então vai ler. Isso ' +
      'já aconteceu com todos eles e nenhum vai se importar. Você vai tocar ' +
      'música de outra pessoa, mas vai estar tocando. Música primeiro, orgulho ' +
      'depois.',
  },
];

/* The one rule that overrides every move above. */
export const RUNLIST_NEVER =
  'Não deixe nada formatar nem inicializar o seu drive hoje, e nunca diga sim ' +
  'para um computador que se oferecer para isso. A sua música continua lá, e ' +
  'formatar é a única ação que não dá para desfazer.';

/* NOT a move, for the reason the English file gives: it needs two cables
   almost nobody has in the bag at the moment they need them, and even when it
   works it is the room not stopping, not the set continuing. */
export const RUNLIST_LAST_RESORT = {
  title: 'Se não houver drive nenhum em lugar nenhum',
  body:
    'Um celular num canal livre impede a pista de ficar em silêncio. Seja ' +
    'honesto sobre o que isso é: não é o seu set continuando, é a pista não ' +
    'parando. E só funciona se você já carrega um adaptador USB-C para 3,5 mm ' +
    'e um cabo 3,5 mm para dois RCA. Não pesa, não custa nada, e não vale nada ' +
    'se estiver em casa.',
};
