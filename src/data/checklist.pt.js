/**
 * THE PRE-GIG CHECKLIST, BRAZILIAN PORTUGUESE (pt-BR).
 *
 * Counterpart of src/data/checklist.js, which is the source of truth for the
 * STRUCTURE. Group ids, item keys, `level` and `icon` are IDENTICAL and in
 * the same order, because `key` and `id` are the localStorage identity of a
 * ticked item: a DJ who ticks eight items and switches language must find
 * eight items still ticked. Never translate a key, an id, a level or an icon.
 *
 * Translate ONLY: the group `title`, the group `blurb` (and `blurbBase`), and
 * each item `label`.
 *
 * LANGUAGE RULES THAT ARE LOAD BEARING HERE:
 *  - Treatment "voce". Brazilian forms only: arquivo, tela, celular,
 *    notebook, computador, pen drive. Never "unidade flash USB".
 *  - rekordbox is always lowercase. CDJ, XDJ, DJM, Pioneer DJ, AlphaTheta,
 *    FAT32, MBR, USB, My Settings, Pro DJ Link and the error strings are
 *    physical reality and are never translated. Neither is the industry
 *    English a working Brazilian DJ says natively: booth, set, track,
 *    playlist, export, backup, firmware, link, gig, setup, line-up.
 *  - No exclamation marks, no em or en dashes: the build rejects them.
 *  - Items are read fast, standing up, on a phone. They are re-authored to
 *    hold the English length, not translated word for word. A checklist item
 *    that wraps to three lines is a worse checklist.
 */
export const groups = [
  {
    id: 'music',
    title: 'Música',
    icon: 'disc',
    blurb: 'O set em si: drives, export e compatibilidade.',
    items: [
      { key: 'usb-two', level: 'basic', label: 'Dois pen drives idênticos com o mesmo export, marcados A e B' },
      { key: 'format', level: 'basic', label: 'Os dois formatados em FAT32 + MBR para máxima compatibilidade' },
      { key: 'reexport', level: 'basic', label: 'Export novo depois da última mudança na biblioteca' },
      { key: 'tested', level: 'basic', label: 'Os dois testados num CDJ ou conferidos no rekordbox' },
      { key: 'noupdates', level: 'basic', label: 'Nada de atualizar hoje (rekordbox, firmware ou sistema)' },
      { key: 'lib-format', level: 'advanced', label: 'Export conferido para o equipamento da casa' },
    ],
  },
  {
    id: 'backups',
    title: 'Backups da Música',
    icon: 'sync',
    blurb: 'Quando duas cópias não bastam.',
    items: [
      { key: 'third-backup', level: 'advanced', label: 'Terceira cópia da sua música guardada à parte' },
      { key: 'backup', level: 'advanced', label: 'Biblioteca do rekordbox com backup na nuvem' },
      { key: 'my-settings', level: 'advanced', label: 'My Settings exportado para os seus pen drives' },
      { key: 'backup-fresh', level: 'advanced', label: 'Mudanças mais recentes incluídas em todo backup' },
      { key: 'recovery-plan', level: 'advanced', label: 'Plano de resgate se todos os drives falharem' },
    ],
  },
  {
    id: 'gear',
    title: 'Equipamento',
    icon: 'sliders',
    blurb: 'Com o que você vai tocar, e o que pode salvar o seu set.',
    blurbBase: 'Com o que você vai tocar.',
    items: [
      { key: 'headphones', level: 'basic', label: 'Fone de ouvido' },
      { key: 'hp-adapter', level: 'basic', label: 'Adaptador de fone (3,5 mm para 6,3 mm, se precisar)' },
      { key: 'laptop', level: 'advanced', label: 'Notebook + carregador (para refazer pen drives, reexportar playlists ou resolver problemas)' },
    ],
  },
  {
    id: 'technical',
    title: 'Kit Técnico',
    icon: 'usb',
    blurb: 'As coisas pequenas que salvam gigs grandes.',
    items: [
      { key: 'adapters', level: 'advanced', label: 'Adaptadores USB-C e USB-A para aparelhos novos e emergências' },
      { key: 'cables', level: 'advanced', label: 'Cabos USB extras para notebook, celular e equipamento de DJ' },
      { key: 'ethernet', level: 'advanced', label: 'Cabo Ethernet (para Pro DJ Link e setups compatíveis)' },
      { key: 'rca', level: 'advanced', label: 'Um par de cabos RCA (serve também como coaxial digital)' },
      { key: 'tripod', level: 'advanced', label: 'Tripé de celular para gravar conteúdo ou fazer live' },
      { key: 'power-strip', level: 'advanced', label: 'Extensão ou régua de tomadas' },
    ],
  },
  {
    id: 'logistics',
    title: 'Logística',
    icon: 'pin',
    blurb: 'Tudo em volta da gig.',
    items: [
      { key: 'booth-setup', level: 'basic', label: 'Setup da booth confirmado (players, mixer e software)' },
      { key: 'settime', level: 'basic', label: 'Line-up e horário do set confirmados' },
      { key: 'address', level: 'basic', label: 'Endereço da casa confirmado' },
      { key: 'guestlist', level: 'basic', label: 'Acesso de artista confirmado' },
      { key: 'contact', level: 'basic', label: 'Contato do produtor ou da casa salvo' },
      { key: 'transport', level: 'basic', label: 'Transporte planejado (ida e volta)' },
      { key: 'hotel', level: 'advanced', label: 'Hotel ou hospedagem confirmados (se for o caso)' },
      { key: 'passport-valid', level: 'advanced', label: 'Passaporte válido para o destino (validade mínima exigida)' },
      { key: 'visa', level: 'advanced', label: 'Visto ou permissão de trabalho confirmados' },
      { key: 'vaccines', level: 'advanced', label: 'Vacinas ou certificados de saúde confirmados' },
      { key: 'adapter', level: 'advanced', label: 'Adaptador de tomada na bag (se precisar)' },
    ],
  },
  {
    id: 'personal',
    title: 'Kit Pessoal',
    icon: 'star',
    blurb: 'A conferida do bolso.',
    items: [
      { key: 'phone', level: 'basic', label: 'Celular carregado' },
      { key: 'charge-cable', level: 'basic', label: 'Cabo de carregar + fonte' },
      { key: 'powerbank', level: 'basic', label: 'Power bank (recomendado)' },
      { key: 'money', level: 'basic', label: 'Carteira (cartões + dinheiro)' },
      { key: 'docs', level: 'basic', label: 'RG / Passaporte / CNH (o que for o caso)' },
      { key: 'keys', level: 'basic', label: 'Chaves (casa, hotel ou carro)' },
      { key: 'earplugs', level: 'advanced', label: 'Protetor auricular' },
      { key: 'water', level: 'advanced', label: 'Garrafa de água' },
      { key: 'snacks', level: 'advanced', label: 'Lanche para gig longa' },
      { key: 'meds', level: 'advanced', label: 'Remédio que você usa' },
      { key: 'spare-shirt', level: 'advanced', label: 'Camiseta reserva' },
      { key: 'freshen', level: 'advanced', label: 'Desodorante' },
    ],
  },
  {
    id: 'recovery',
    title: 'Kit de Resgate',
    icon: 'shield',
    blurb: 'Os detalhes que podem salvar uma gig.',
    items: [
      { key: 'card', level: 'advanced', label: 'Save My Gig Emergency Card (impresso ou no celular)' },
      { key: 'flashlight', level: 'advanced', label: 'Lanterna LED pequena' },
      { key: 'multitool', level: 'advanced', label: 'Chave de fenda ou multiferramenta' },
      { key: 'cloth', level: 'advanced', label: 'Pano de microfibra' },
      { key: 'gaffer', level: 'advanced', label: 'Fita gaffer' },
    ],
  },
];
