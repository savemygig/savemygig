/**
 * THE PRE-GIG CHECKLIST, NEUTRAL LATIN AMERICAN SPANISH.
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
 *  - Neutral international Spanish, "tu" treatment. No voseo, no formal
 *    treatment, no peninsular plural. Glossary is the one fixed in
 *    emergency-tree.es.js:
 *    computadora, archivo, carpeta, celular, audifonos, el auto, el lugar,
 *    memoria USB. The Brazilian word for a USB stick never appears here.
 *  - rekordbox is always lowercase. CDJ, XDJ, DJM, Pioneer DJ, AlphaTheta,
 *    FAT32, MBR, USB, My Settings, Pro DJ Link and the error strings are
 *    physical reality and are never translated. Neither is the industry
 *    English a working Latin American DJ says natively: booth, set, track,
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
    blurb: 'El set en sí: USB, export y compatibilidad.',
    items: [
      { key: 'usb-two', level: 'basic', label: 'Dos USB idénticos con el mismo export, marcados A y B' },
      { key: 'format', level: 'basic', label: 'Los dos formateados en FAT32 + MBR para máxima compatibilidad' },
      { key: 'reexport', level: 'basic', label: 'Export nuevo tras el último cambio en la biblioteca' },
      { key: 'tested', level: 'basic', label: 'Los dos probados en un CDJ o verificados en rekordbox' },
      { key: 'noupdates', level: 'basic', label: 'Nada de actualizar hoy (rekordbox, firmware o sistema)' },
      { key: 'lib-format', level: 'advanced', label: 'Export verificado para el equipo del lugar' },
    ],
  },
  {
    id: 'backups',
    title: 'Backups de la Música',
    icon: 'sync',
    blurb: 'Cuando dos copias no bastan.',
    items: [
      { key: 'third-backup', level: 'advanced', label: 'Tercera copia de tu música guardada aparte' },
      { key: 'backup', level: 'advanced', label: 'Biblioteca de rekordbox con backup en la nube' },
      { key: 'my-settings', level: 'advanced', label: 'My Settings exportado a tus USB' },
      { key: 'backup-fresh', level: 'advanced', label: 'Cambios más recientes incluidos en cada backup' },
      { key: 'recovery-plan', level: 'advanced', label: 'Plan de rescate si fallan todos los USB' },
    ],
  },
  {
    id: 'gear',
    title: 'Equipo de DJ',
    icon: 'sliders',
    blurb: 'Con lo que vas a tocar, y lo que puede salvar tu set.',
    blurbBase: 'Con lo que vas a tocar.',
    items: [
      { key: 'headphones', level: 'basic', label: 'Audífonos' },
      { key: 'hp-adapter', level: 'basic', label: 'Adaptador de audífonos (3,5 mm a 6,3 mm, si aplica)' },
      { key: 'laptop', level: 'advanced', label: 'Laptop + cargador (para rehacer USB, reexportar playlists o resolver problemas en el momento)' },
    ],
  },
  {
    id: 'technical',
    title: 'Kit Técnico',
    icon: 'usb',
    blurb: 'Las cosas pequeñas que salvan gigs grandes.',
    items: [
      { key: 'adapters', level: 'advanced', label: 'Adaptadores USB-C y USB-A para equipos nuevos y emergencias' },
      { key: 'cables', level: 'advanced', label: 'Cables USB extra para laptop, celular y equipo de DJ' },
      { key: 'ethernet', level: 'advanced', label: 'Cable Ethernet (para Pro DJ Link y setups compatibles)' },
      { key: 'rca', level: 'advanced', label: 'Un par de cables RCA (sirven también como coaxial digital)' },
      { key: 'tripod', level: 'advanced', label: 'Trípode de celular para grabar contenido o transmitir' },
      { key: 'power-strip', level: 'advanced', label: 'Extensión eléctrica con varias tomas' },
    ],
  },
  {
    id: 'logistics',
    title: 'Logística',
    icon: 'pin',
    blurb: 'Todo lo que rodea el gig.',
    items: [
      { key: 'booth-setup', level: 'basic', label: 'Setup del booth confirmado (reproductores, mixer, software)' },
      { key: 'settime', level: 'basic', label: 'Line-up y horario del set confirmados' },
      { key: 'address', level: 'basic', label: 'Dirección del lugar confirmada' },
      { key: 'guestlist', level: 'basic', label: 'Acceso de artista confirmado' },
      { key: 'contact', level: 'basic', label: 'Contacto del promotor o del lugar guardado' },
      { key: 'transport', level: 'basic', label: 'Transporte planeado (ida y vuelta)' },
      { key: 'hotel', level: 'advanced', label: 'Hotel u hospedaje confirmado (si aplica)' },
      { key: 'passport-valid', level: 'advanced', label: 'Pasaporte válido para el destino (vigencia mínima exigida)' },
      { key: 'visa', level: 'advanced', label: 'Visa o permiso de trabajo confirmados' },
      { key: 'vaccines', level: 'advanced', label: 'Vacunas o certificados de salud confirmados' },
      { key: 'adapter', level: 'advanced', label: 'Adaptador de enchufe de viaje (si aplica)' },
    ],
  },
  {
    id: 'personal',
    title: 'Kit Personal',
    icon: 'star',
    blurb: 'El chequeo de bolsillo.',
    items: [
      { key: 'phone', level: 'basic', label: 'Celular cargado' },
      { key: 'charge-cable', level: 'basic', label: 'Cable de carga + cargador' },
      { key: 'powerbank', level: 'basic', label: 'Power bank (recomendado)' },
      { key: 'money', level: 'basic', label: 'Billetera (tarjetas + efectivo)' },
      { key: 'docs', level: 'basic', label: 'ID / Pasaporte / Licencia de conducir (si aplica)' },
      { key: 'keys', level: 'basic', label: 'Llaves (casa, hotel o auto)' },
      { key: 'earplugs', level: 'advanced', label: 'Tapones para los oídos' },
      { key: 'water', level: 'advanced', label: 'Botella de agua' },
      { key: 'snacks', level: 'advanced', label: 'Snacks para un gig largo' },
      { key: 'meds', level: 'advanced', label: 'Medicamentos que tomes' },
      { key: 'spare-shirt', level: 'advanced', label: 'Camiseta de repuesto' },
      { key: 'freshen', level: 'advanced', label: 'Desodorante' },
    ],
  },
  {
    id: 'recovery',
    title: 'Kit de Rescate',
    icon: 'shield',
    blurb: 'Los detalles que pueden salvar un gig.',
    items: [
      { key: 'card', level: 'advanced', label: 'Save My Gig Emergency Card (impresa o en el celular)' },
      { key: 'flashlight', level: 'advanced', label: 'Linterna LED pequeña' },
      { key: 'multitool', level: 'advanced', label: 'Destornillador o multiherramienta' },
      { key: 'cloth', level: 'advanced', label: 'Paño de microfibra' },
      { key: 'gaffer', level: 'advanced', label: 'Cinta gaffer' },
    ],
  },
];
