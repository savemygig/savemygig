/*
 * EL ARBOL DE EMERGENCIA, VERSION ESPANOL NEUTRO (LATAM).
 *
 * Spanish counterpart of src/data/emergency-tree.js. The STRUCTURE is locked
 * to the English file: same node ids, same option order, same `to` targets,
 * same `tone`, same `step`/`event`/`data`, same booleans. Only prose changes.
 * If you edit the English tree, edit this one in the same commit and re-check
 * the two files for structural parity.
 *
 * Language rules, binding (see the project brief, 2026-08-04):
 * neutral international Spanish, "tu" treatment, never vos, never usted,
 * never vosotros. Hardware labels, model names, file systems, error codes and
 * the industry English a Latin American DJ actually says (booth, deck, track,
 * playlist, set, cue, export, link, firmware) are NOT translated. No
 * exclamation marks, no emoji in prose, no em or en dashes: the build fails
 * on them. "Tonight" is the GIG, not the time of day, so it is "hoy" or
 * "ahora", never "esta noche".
 *
 * Anything inside <span class="mono"> is a literal machine string and stays in
 * English. Internal hrefs inside html strings are preserved exactly as in the
 * English tree; they still point at English pages until those pages have /es
 * counterparts.
 */

export const DOORS = ["usb/start","music/start","sound/start","frozen/start","export/start"];

export const TREE = {
  "music/start": {
    "title": "¿Ves tus playlists?",
    "status": "Ruta_Critica",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Es buena noticia. Descarta el peor caso. Ahora averiguamos qué es lo que el reproductor no puede leer."
      }
    ],
    "label": "Diagnóstico",
    "heading": "El USB sí se está leyendo",
    "question": "¿Ves tus playlists en el reproductor?",
    "step": "symptom",
    "options": [
      {
        "label": "NO, MIS PLAYLISTS NO ESTÁN",
        "to": "music/folder",
        "desc": "Vacías, ausentes o que no abren: todas cuentan. Casi siempre se arregla en 15 segundos.",
        // Symptom split, not a choice: neither branch is the safe one.
        "tone": "amber"
      },
      {
        "label": "SÍ, PERO NO SUENAN LOS TRACKS",
        "to": "music/other-track",
        "desc": "Códigos de error, o tracks que no arrancan.",
        // Same split: a symptom answer never earns green.
        "tone": "amber"
      }
    ]
  },
  "music/other-track": {
    "title": "Prueba otro track",
    "status": "Critico · Chequeo mas rapido",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Un archivo corrupto y un USB muriéndose se ven igual desde donde estás. Tres segundos los separan, y esa es la diferencia entre esquivar un track y reconstruir un USB sano sin necesidad."
      },
      {
        "t": "check",
        "items": [
          "Carga <strong>otro track</strong>, de <strong>otra playlist</strong>. Si suena, prueba uno más de otro lado."
        ]
      },
      {
        "t": "note",
        "html": "Si en un deck viejo no carga ningún track, también puede ser el formato: muchos reproductores anteriores a los NXS2 no leen FLAC ni ALAC. Los archivos están bien; ese deck no los puede decodificar, y ninguna reconstrucción cambia eso."
      }
    ],
    "label": "Antes que nada",
    "heading": "¿Un archivo, o todo el USB?",
    "question": "¿Ese sí suena?",
    "step": "music_other_track",
    "options": [
      {
        "label": "SÍ, SUENA",
        "to": "/saved?path=critical&branch=one_track",
        "desc": "Eran esos archivos, no tu USB. Esquívalos hoy; si falla otro, vuelve aquí.",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, NO CARGA NADA",
        "to": "shared/computer",
        "desc": "Entonces es el USB o la base de datos, y eso lo arreglamos."
      }
    ]
  },
  "music/folder": {
    "title": "Reproduce en vista FOLDER",
    "status": "Critico · Arreglo mas rapido",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Que falten las playlists casi nunca significa un USB dañado. Lo normal es que el reproductor no pueda leer la base de datos de playlists, mientras los archivos de música siguen intactos en el USB. La vista FOLDER ignora la base de datos por completo."
      },
      {
        "t": "check",
        "items": [
          "Presiona <strong>SOURCE</strong> y elige tu USB.",
          "Cambia la vista de búsqueda a <strong>FOLDER</strong>.",
          "Carga un track."
        ]
      },
      {
        "t": "alert",
        "emoji": "💡",
        "html": "Pierdes cues, grids, playlists, Sync y Quantize. Te quedas con el gig. La base de datos se arregla bien mañana, no ahora."
      },
      {
        "t": "note",
        "html": "¿Funciona en el otro reproductor pero no en este? Es la división de formatos de biblioteca, no un USB dañado. <a href=\"/es/knowledge/pioneer-dj/rekordbox#onelibrary\">Qué significa</a>, después del gig."
      }
    ],
    "label": "Prueba esto primero, 15 segundos",
    "heading": "Tus tracks casi seguro siguen ahí",
    "question": "¿Puedes cargar y reproducir un track así?",
    "step": "folder_view",
    "options": [
      {
        "label": "SÍ, YA SUENAN LOS TRACKS",
        "to": "/saved?path=critical&branch=folder_view",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, SIGUE SIN NADA",
        "to": "shared/computer",
        "desc": "Entonces revisamos el USB en sí."
      }
    ]
  },
  "shared/computer": {
    "title": "¿Tienes una computadora?",
    "status": "Ruta_Critica",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "No arreglar el USB. Eso viene después del gig."
      }
    ],
    "label": "Punto de decisión",
    "heading": "Objetivo ahora: tocar tu set.",
    "question": "¿Tienes una computadora ahora mismo?",
    "step": "critical_fork_computer",
    "options": [
      {
        "label": "SÍ, TENGO COMPUTADORA",
        "to": "shared/usb-check"
      },
      {
        "label": "NO HAY COMPUTADORA",
        "to": "usb/booth",
        // Resource NO with a live route: costs options, not the gig.
        "tone": "amber"
      }
    ]
  },
  "shared/usb-check": {
    "title": "Revisión del USB",
    "status": "Critico · Laptop",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Si la computadora te ofrece formatear o inicializar el USB, di que NO.</strong> En Mac no toques \"Initialize…\" (\"Inicializar…\"): abre Utilidad de Discos, a un paso de borrar el USB. Tus archivos siguen ahí. Elige Ignorar o Expulsar."
      }
    ],
    "label": "Diagnóstico",
    "heading": "Tienes una computadora",
    "question": "Conecta el USB a la computadora. ¿Qué pasa?",
    "step": "usb_check",
    "options": [
      {
        "label": "VEO MIS ARCHIVOS",
        "to": "rebuild/second-usb"
      },
      {
        "label": "NADA / MENSAJE DE ERROR",
        "to": "shared/usb-dead"
      }
    ]
  },
  "shared/usb-dead": {
    "title": "La computadora no lee el USB",
    "status": "Critico · Revision USB",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Dos minutos, en orden:"
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Si te ofrece formatear o inicializar el USB, di que NO.</strong> Formatear ahora puede borrar archivos que todavía se pueden recuperar."
      },
      {
        "t": "check",
        "items": [
          "Conecta <strong>directo</strong>, no por un hub ni una dock. Los hubs alimentados por bus hacen fallar a las unidades que ya vienen justas.",
          "Prueba en <strong>otra computadora</strong> si hay una cerca. Un adaptador de celular sirve para comprobar que el USB vive, pero la reconstrucción de hoy necesita una computadora."
        ]
      }
    ],
    "draft": true,
    "label": "Diagnóstico",
    "heading": "La computadora tampoco lo lee",
    "headingClass": "danger",
    "question": "¿Algún dispositivo ve el USB ahora?",
    "step": "usb_dead_check",
    "options": [
      {
        "label": "SÍ, YA SE VEN LOS ARCHIVOS",
        "to": "rebuild/second-usb"
      },
      {
        "label": "NO, EL USB ESTÁ MUERTO",
        "to": "shared/survival",
        "desc": "Te ponemos a tocar de otra forma. La recuperación de archivos viene después del gig."
      }
    ]
  },
  "usb/booth": {
    "title": "Sin computadora, revisiones en el reproductor",
    "status": "Critico · Sin laptop",
    "red": true,
    "blocks": [
      {
        "t": "assumed",
        "html": "Damos por hecho que ya lo reconectaste y que ya probaste la otra ranura, el otro reproductor y tu propio repuesto. Lo de abajo es justo lo que todos se saltan."
      },
      {
        "t": "check",
        "items": [
          "<strong>PRO DJ LINK.</strong> Si el booth está enlazado, busca y carga desde un USB que esté en otro reproductor. Tu USB muerto deja de importar.",
          "<strong>Dale treinta segundos.</strong> Una biblioteca grande monta lento y mientras tanto parece muerta. A la mayoría de los USB los sacan antes de que terminen.",
          "<strong>Vista FOLDER</strong>, si todavía no la probaste. Cuando el USB aparece pero tus playlists no, murió la base de datos, no el audio. Busca por carpeta y reproduce."
        ]
      },
      {
        "t": "note",
        "html": "Los reproductores viejos son quisquillosos con los USB nuevos: un USB 3.1/3.2 rápido o una unidad muy grande puede ser rechazada por un CDJ viejo que lee sin problema un USB común. Puede que tu USB no esté muerto, y por eso mismo funciona pedir uno prestado."
      }
    ],
    "draft": true,
    "label": "Paso 1 de 2",
    "heading": "Trabaja el booth",
    "question": "¿Puedes cargar y reproducir un track en algún reproductor?",
    "step": "no_laptop_1",
    "options": [
      {
        "label": "SÍ, YA LEE",
        "to": "/saved?path=critical&branch=no_laptop",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, SIGUE SIN NADA",
        "to": "usb/restart"
      }
    ]
  },
  "usb/restart": {
    "title": "Sin computadora, reinicia el reproductor",
    "status": "Critico · Sin laptop",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Solo si nadie está tocando en este reproductor ahora.</strong> Si otro DJ está al aire, no lo toques: responde NO abajo y sigue adelante."
      },
      {
        "t": "check",
        "items": [
          "Primero saca tu USB: presiona <span class=\"mono\">USB STOP</span> y espera a que la luz deje de parpadear.",
          "Apaga el reproductor. Espera 20 segundos.",
          "Enciéndelo de nuevo y deja que arranque por completo.",
          "Inserta el USB y espera, algunas unidades tardan más de 30 segundos en montar."
        ]
      }
    ],
    "draft": true,
    "label": "Paso 2 de 2",
    "heading": "Reinicia el reproductor",
    "question": "¿El reproductor ya lee el USB?",
    "step": "no_laptop_2",
    "options": [
      {
        "label": "SÍ, YA LEE",
        "to": "/saved?path=critical&branch=no_laptop",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, SIGUE MUERTO",
        "to": "shared/survival"
      }
    ]
  },
  "shared/survival": {
    "title": "Modo supervivencia",
    "status": "Critico · Supervivencia",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Deja de diagnosticar. Que salga sonido en la sala cuando sea tu turno."
      },
      {
        "t": "check",
        "items": [
          "<strong>Pídele el USB al DJ que va antes o después de ti.</strong> Su USB es un export de rekordbox como el tuyo, así que va a leer. Esto les ha pasado a todos.",
          "<strong>Fíjate si hay una laptop en el booth.</strong> Tu USB puede leerse en una computadora aunque los reproductores lo rechacen.",
          "<strong>Cambia de turno</strong> con el DJ que sigue y usa ese tiempo extra."
        ]
      },
      {
        "t": "details",
        "summary": "Si no hay ningún USB por ningún lado",
        "html": "<p> Un celular en un canal libre evita que la sala se quede en silencio. Ten claro qué es: no es que tu set siga, es que la sala no se detiene. Solo funciona si ya cargas un adaptador de USB-C a 3.5mm y un cable de 3.5mm a doble RCA. </p>"
      }
    ],
    "draft": true,
    "label": "Modo supervivencia",
    "heading": "Modo supervivencia: tocar sin tu USB",
    "question": "¿Encontraste una forma de tocar?",
    "step": "survival",
    "options": [
      {
        "label": "SÍ, ESTOY TOCANDO",
        "to": "/saved?path=critical&branch=survival",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, NADA FUNCIONÓ",
        "to": "/files-lost?path=critical&branch=survival",
        "event": "outcome_reached",
        "data": {
          "outcome": "lost",
          "path": "critical"
        }
      }
    ]
  },
  "rebuild/risk": {
    "title": "Un solo USB, una decisión",
    "status": "Critico · Laptop",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "La reconstrucción completa toma 15 minutos o más. ¿Entras en cinco? Pide un USB prestado primero y reconstruye después."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Vas a borrar este USB.</strong> Todo lo que no se copie bien antes queda perdido hasta que puedas trabajarlo con calma en tu casa."
      }
    ],
    "label": "Punto de decisión",
    "heading": "Un solo USB, una decisión",
    "question": "¿Aceptas copiar tus archivos a esta computadora de forma temporal y borrar tu USB para poder tocar?",
    "step": "risk_consent",
    "options": [
      {
        "label": "SÍ, COPIAR Y LUEGO BORRAR",
        "to": "rebuild/copy",
        // Consenting to an irreversible erase is never green. The card above
        // says this cannot be undone, so the pad cannot say "safe". Amber is
        // the honest reading: it costs you, and you have chosen it.
        "tone": "amber"
      },
      {
        "label": "NO, NO BORRAR ESTE USB",
        "to": "rebuild/no-erase",
        // Declining destruction is caution, never the red answer.
        "tone": "amber"
      }
    ]
  },
  "rebuild/second-usb": {
    "title": "¿Tienes un segundo USB?",
    "status": "Critico · Laptop",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Tus archivos se leen, así que primero va la ruta rápida y segura. Con un segundo USB, el original no se toca hoy."
      },
      {
        "t": "note",
        "html": "¿Esta computadora tiene rekordbox con <strong>tu</strong> biblioteca? Mejor toma el <a href=\"/es/protocol/export/backup\">rescate de export</a>: un export nuevo conserva tus cues y playlists, una copia cruda de archivos no."
      }
    ],
    "label": "Primero la ruta rápida",
    "heading": "LOS ARCHIVOS SE VEN",
    "headingClass": "accent",
    "question": "¿Tienes otro USB que puedas usar ahora mismo?",
    "step": "second_usb",
    "options": [
      {
        "label": "SÍ, TENGO OTRO USB",
        "to": "rebuild/second-format",
        "desc": "Armamos el gig de hoy en ese. Tu USB original queda intacto."
      },
      {
        "label": "NO, SOLO TENGO ESTE",
        "to": "rebuild/risk",
        "desc": "Entonces hay una decisión que tomar primero.",
        // Resource NO with a live route: costs options, not the gig. Same
        // shape as shared/computer NO, so the same colour.
        "tone": "amber"
      }
    ]
  },
  "rebuild/second-format": {
    "title": "Formatea el segundo USB",
    "status": "Critico · Segundo USB",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "El gig de hoy se arma en el segundo USB. Sea cual sea el estado del primero, de aquí en adelante no le pasa nada más."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Esto borra todo lo que haya en el SEGUNDO USB. Si te lo prestaron, detente y confirma con su dueño primero.</strong> La biblioteca de otra persona no es descartable, y puede que no sepa que estás por formatearla."
      },
      {
        "t": "check",
        "items": [
          "En Windows: el cuadro de diálogo del sistema solo ofrece FAT32 hasta 32GB. Un USB más grande necesita la herramienta gratuita <strong>guiformat</strong>.",
          "Conecta el <strong>segundo</strong> USB a la computadora.",
          "Clic derecho → <strong>Formatear</strong> (o Utilidad de Discos en Mac).",
          "Formato: <span class=\"mono\">FAT32</span> · Esquema: <span class=\"mono\">MBR</span> · Formato rápido: OK"
        ]
      }
    ],
    "draft": true,
    "label": "Paso 1 de 2",
    "heading": "Formatea el segundo USB",
    "question": "¿Ya está formateado el segundo USB?",
    "step": "second_usb_format",
    "options": [
      // All three carry an explicit tone. With more than two options the
      // renderer falls back to neutral, and this screen is too consequential
      // to say nothing with colour.
      {
        "label": "SÍ, FORMATEADO",
        "to": "rebuild/second-copy",
        // Green: the drive is ready and the fast route is open.
        "tone": "green"
      },
      {
        "label": "NO, NO SE DEJA FORMATEAR",
        "to": "shared/survival",
        "desc": "Modo supervivencia: otras formas de tocar hoy.",
        // Declining or failing to destroy is caution, never red. It costs
        // you the fast route, not the gig.
        "tone": "amber"
      },
      {
        "label": "NO PUEDO BORRAR ESTE USB",
        "to": "shared/survival",
        "desc": "Es prestado, o su dueño dijo que no. Es la decisión correcta, y hay otras formas de tocar hoy.",
        // The alert above tells a DJ to check with the owner. Until now the
        // only way to act on that answer was to claim a technical failure
        // that never happened. Honouring someone else's library is caution.
        "tone": "amber"
      }
    ]
  },
  "rebuild/second-copy": {
    "title": "Copia los tracks al segundo USB",
    "status": "Critico · Segundo USB",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>No saques ninguno de los dos USB mientras se copia.</strong>"
      },
      {
        "t": "check",
        "items": [
          "Copia al segundo USB <strong>solo los tracks que necesitas hoy</strong>: desde la carpeta que ya creaste en la computadora, o directo de tu USB original si todavía lee.",
          "Usa la búsqueda, por nombre de artista o por fecha de agregado, para encontrarlos rápido.",
          "Si un archivo se traba, sáltalo y sigue. Lo que llegue es tu set.",
          "Al terminar, expulsa los dos USB de forma segura."
        ]
      }
    ],
    "draft": true,
    "label": "Paso 2 de 2",
    "heading": "Pasa los tracks de hoy",
    "question": "¿Los tracks de hoy ya están en el segundo USB?",
    "step": "second_usb_copy",
    "options": [
      {
        "label": "SÍ, CARGARLO EN EL REPRODUCTOR",
        "to": "rebuild/load"
      },
      {
        "label": "NO, LA COPIA SIGUE FALLANDO",
        "to": "shared/survival",
        "desc": "El original no va a soltar los archivos hoy. Otras formas de tocar."
      }
    ]
  },
  "rebuild/no-erase": {
    "title": "Consigue otro USB",
    "status": "Critico · Ruta segura",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "El gig de hoy sale de otro USB. Sea cual sea el estado de tu unidad original, aquí no le pasa nada más: se revisa bien después del gig, en una computadora y con tiempo."
      },
      {
        "t": "check",
        "items": [
          "Pregúntale a los otros DJs, al promotor, a la barra. Alguien tiene un USB.",
          "Sirve incluso uno pequeño. Solo necesitas el set de hoy."
        ]
      }
    ],
    "draft": true,
    "label": "Ruta segura",
    "heading": "Necesitamos cualquier otro USB para hoy.",
    "question": "¿Conseguiste otro USB?",
    "step": "no_erase",
    "options": [
      {
        "label": "SÍ, CONSEGUÍ UNO",
        "to": "rebuild/second-format"
      },
      {
        "label": "NO, NO HAY OTRO USB AQUÍ",
        "to": "shared/survival",
        "desc": "Modo supervivencia: otras formas de tocar hoy."
      }
    ]
  },
  "rebuild/copy": {
    "title": "Paso 1: copiar archivos",
    "status": "Critico · Recuperacion",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>No saques el USB mientras se copia.</strong> Interrumpir este paso puede causar pérdida de datos."
      },
      {
        "t": "check",
        "items": [
          "Crea una carpeta nueva en el escritorio.",
          "Copia <strong>solo los tracks esenciales</strong> que necesitas para tocar.",
          "Abre el USB → usa la <strong>búsqueda</strong>. Busca por nombre de artista o por fecha de agregado.",
          "Si un archivo se traba, sáltalo y sigue. Lo que llegue es tu set."
        ]
      }
    ],
    "label": "Paso 1 de 5",
    "heading": "Copia tus archivos a esta computadora",
    "question": "¿Ya copiaste tracks suficientes para tocar tu set?",
    "step": "copy_files",
    "options": [
      {
        "label": "SÍ, COPIADOS",
        "to": "rebuild/erase"
      },
      {
        "label": "NO, LA COPIA SIGUE FALLANDO",
        "to": "shared/survival",
        "desc": "Este USB no va a soltar los archivos hoy. Te ponemos a tocar de otra forma; la recuperación viene después del gig."
      }
    ]
  },
  "rebuild/erase": {
    "title": "Paso 2: preparar el USB",
    "status": "Critico · Recuperacion",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Los tracks de hoy están a salvo en la computadora. Todo lo demás que haya en este USB muere en el siguiente paso."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>El siguiente paso BORRA tu USB.</strong> Es irreversible. Solo quedan los tracks que copiaste a la computadora."
      }
    ],
    "label": "Paso 2 de 5",
    "heading": "Prepara el USB",
    "question": "¿Confirmas borrar el USB y continuar?",
    "step": "erase_consent",
    "options": [
      {
        "label": "SÍ, BORRAR Y CONTINUAR",
        "to": "rebuild/format",
        // Same as rebuild/risk: green on the pad that erases the drive told
        // a DJ pattern-matching on colour that this was the safe answer.
        // Amber: it costs you, and you have chosen it.
        "tone": "amber"
      },
      {
        "label": "NO, PARAR AQUÍ",
        "to": "rebuild/no-erase",
        // Same: stopping before an erase is legitimate, not failure.
        "tone": "amber"
      }
    ]
  },
  "rebuild/format": {
    "title": "Paso 3: formatear el USB",
    "status": "Critico · Recuperacion",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Esto borra el USB por completo.</strong> Es la única excepción a la regla de nunca formatear, y es segura solo porque los tracks de hoy ya están en la computadora. Confirma el nombre y el tamaño del disco antes de tocar nada, formatear el disco equivocado no tiene vuelta atrás."
      },
      {
        "t": "check",
        "items": [
          "Clic derecho sobre el USB → <strong>Formatear</strong> (o Utilidad de Discos en Mac).",
          "En ese cuadro de diálogo Windows solo ofrece FAT32 hasta 32GB. ¿USB más grande? Usa la herramienta gratuita <strong>guiformat</strong>, dos minutos.",
          "Formato: <span class=\"mono\">FAT32</span>, no exFAT, no NTFS. Los CDJ viejos rechazan exFAT.",
          "Nombre: <span class=\"mono\">SAVEMYGIG</span> (o el que quieras)",
          "Formato rápido: OK",
          "Esquema: <span class=\"mono\">Master Boot Record (MBR)</span>"
        ]
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>No saques el USB mientras se formatea.</strong>"
      }
    ],
    "label": "Paso 3 de 5",
    "heading": "Formato del USB",
    "question": "¿El USB se formateó correctamente?",
    "step": "format",
    "options": [
      {
        "label": "SÍ, USB FORMATEADO",
        "to": "rebuild/copy-back"
      },
      {
        "label": "NO, EL FORMATEO FALLA",
        "to": "rebuild/no-erase",
        "desc": "Ese USB está acabado, y ya no importa: tu set está en la computadora. Cualquier otro USB termina el trabajo."
      }
    ]
  },
  "rebuild/copy-back": {
    "title": "Paso 4: copiar la música de vuelta",
    "status": "Critico · Recuperacion",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>No saques el USB mientras se copia.</strong> Interrumpir este paso puede causar pérdida de datos."
      },
      {
        "t": "dim",
        "html": "Solo lo que necesitas para tocar hoy."
      }
    ],
    "label": "Paso 4 de 5",
    "heading": "Copia la música de vuelta al USB",
    "question": "¿Los tracks ya están en el USB?",
    "step": "copy_back",
    "options": [
      {
        "label": "SÍ, YA ESTÁN EN EL USB",
        "to": "rebuild/load"
      },
      {
        "label": "NO, LA COPIA SIGUE FALLANDO",
        "to": "rebuild/fallback"
      }
    ]
  },
  "rebuild/load": {
    "title": "Paso 5: cargar en el reproductor",
    "status": "Critico · Recuperacion",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "En el CDJ/XDJ, presiona <span class=\"mono\">SOURCE</span>",
          "Selecciona <span class=\"mono\">USB</span>",
          "Ve a <span class=\"mono\">FOLDER</span>",
          "Carga los tracks desde la carpeta que copiaste."
        ]
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "Estos tracks <strong>no se exportaron con rekordbox</strong>, así que algunas funciones pueden estar limitadas (Quantize, Sync, Hot Cues). Es normal. <strong>Igual puedes tocar tu set.</strong>"
      }
    ],
    "label": "Paso 5 de 5",
    "heading": "Carga la música en el reproductor",
    "question": "¿Puedes cargar y reproducir los tracks en el CDJ?",
    "step": "load",
    "options": [
      {
        "label": "SÍ, ESTOY TOCANDO",
        "to": "/saved?path=critical&branch=laptop",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, SIGO SIN TOCAR",
        "to": "rebuild/fallback"
      }
    ]
  },
  "rebuild/fallback": {
    "title": "Últimas opciones",
    "status": "Critico · Ultimo recurso",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "<strong>Repite el formateo una vez</strong>, eligiendo <span class=\"mono\">FAT32</span> de forma explícita (no exFAT) y <span class=\"mono\">MBR</span>. Una unidad GPT es causa común de \"formateado pero ilegible\"."
        ]
      }
    ],
    "draft": true,
    "label": "Último recurso",
    "heading": "Queda una cosa antes del modo supervivencia",
    "question": "¿Ya lee?",
    "step": "fallback",
    "options": [
      {
        "label": "SÍ, YA LEE",
        "to": "/saved?path=critical&branch=fallback",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, MODO SUPERVIVENCIA",
        "to": "shared/survival"
      }
    ]
  },
  "sound/start": {
    "title": "Sin sonido",
    "status": "Sin_Sonido",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Tu USB no tiene nada roto. Algo no está dejando pasar la señal."
      }
    ],
    "heading": "Tu música está bien. Esto es ruteo.",
    "question": "¿Dónde falta el sonido?",
    "step": "ns_entry",
    // SEVERITY, NOT SYMMETRY (Antonio, 2026-08-03). These four were all grey,
    // which said the four are equally bad. They are not: exactly one of them
    // means the room is silent. Red is reserved for that one.
    "options": [
      {
        "label": "UN CANAL, EL RESTO BIEN",
        "to": "sound/channel",
        "desc": "Un deck en silencio, el resto del mixer vivo.",
        // You still have a working deck to mix on.
        "tone": "amber"
      },
      {
        "label": "TODO EN SILENCIO",
        "to": "sound/master",
        "desc": "Del mixer no sale nada.",
        // The only one where the room has no music. This is the red level.
        "tone": "red"
      },
      {
        "label": "SIN CUE EN LOS AUDÍFONOS",
        "to": "sound/phones",
        "desc": "La sala está bien, solo que no puedes preescuchar.",
        // Green under the time-pressure rule, not amber. Its own description
        // says the room is fine. The crowd cannot tell, nothing is at risk,
        // and the DJ can fix this between tracks. Colouring it amber would
        // have told a DJ to hurry over something nobody else can hear.
        "tone": "green"
      },
      {
        "label": "HAY SONIDO PERO SUENA MAL",
        "to": "sound/thin",
        "desc": "Delgado, bajo, distorsionado o de un solo lado.",
        "tone": "amber"
      }
    ]
  },
  // sound/thin facts are AlphaTheta's own, already sourced for the Dictionary
  // EQ trio (2026-08-02): -26 dB EQ-mode floor and EQ CURVE isolator mode from
  // the DJM-900NXS2 operating instructions; the separate 3-band master
  // isolator from the DJM-V10 specifications; booth EQ as monitor-path-only
  // from the same manuals.
  "sound/thin": {
    "title": "Deja el canal en cero",
    "status": "Sin_Sonido · Calidad",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "¿Delgado, sin graves, sin pegada? Casi siempre son los ajustes del DJ anterior que siguen en el mixer, no una falla. Cinco segundos."
      },
      {
        "t": "check",
        "items": [
          "Lleva las perillas de <strong>EQ</strong> del canal al centro, 12 en punto. Todo a la izquierda no es apagado, pero le falta poco: el DJM-900NXS2 corta a -26 dB en modo EQ.",
          "Ubica el <strong>isolator</strong> y déjalo plano. En el 900NXS2 es el selector EQ CURVE; el V10 tiene un isolator de master de 3 bandas aparte.",
          "¿Delgado en el booth pero bien en la pista? Es el <strong>EQ de booth</strong>, un segundo EQ que solo afecta el monitoreo. La sala nunca escuchó un problema."
        ]
      }
    ],
    "label": "El arreglo de cinco segundos",
    "heading": "El EQ de otra persona sigue en el mixer",
    "question": "¿Ya suena lleno y limpio?",
    "step": "ns_thin",
    "options": [
      {
        "label": "SÍ, SUENA BIEN",
        "to": "/saved?path=no_sound&branch=thin",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE MAL",
        "to": "sound/wrong",
        "desc": "Entonces lo perseguimos: conectores, trim, cable."
      }
    ]
  },
  "sound/channel": {
    "title": "Canal en silencio",
    "status": "Sin_Sonido · Canal",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Mueve el crossfader por completo al lado contrario de tu canal, y regrésalo.",
          "Ubica el <strong>ASSIGN</strong> de crossfader de ese canal (A / B / THRU). Déjalo en <strong>THRU</strong>."
        ]
      },
      {
        "t": "note",
        "html": "¿No hay selector ASSIGN por ningún lado? Algunos mixers no tienen crossfader (DJM-V10-LF, DJM-V5, mixers rotativos). En esos, cada canal ya se comporta como THRU, así que este no es tu problema. Sigue adelante."
      }
    ],
    "label": "Revisa esto primero",
    "heading": "Revisa el crossfader",
    "question": "¿Volvió el sonido?",
    "step": "ns_channel",
    "options": [
      {
        "label": "SÍ, YA SUENA",
        "to": "/saved?path=no_sound&branch=crossfader",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE EN SILENCIO",
        "to": "sound/channel-2"
      }
    ]
  },
  "sound/channel-2": {
    "title": "El canal completo",
    "status": "Sin_Sonido · Canal",
    "red": true,
    "blocks": [
      {
        "t": "assumed",
        "html": "Damos por hecho que el fader está arriba. Nadie llega al segundo paso de un canal muerto con el fader abajo."
      },
      {
        "t": "check",
        "items": [
          "<strong>TRIM / GAIN</strong> al centro, 12 en punto.",
          "<strong>COLOR FX apagado, perilla de FILTER al centro.</strong> Un filtro que el DJ anterior dejó en un extremo deja el canal mudo con todo lo demás viéndose bien."
        ]
      }
    ],
    "label": "De arriba a abajo",
    "heading": "Recorre el canal completo",
    "question": "¿Hay sonido ahora?",
    "step": "ns_channel2",
    "options": [
      {
        "label": "SÍ, YA SUENA",
        "to": "/saved?path=no_sound&branch=channel_strip",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE EN SILENCIO",
        "to": "sound/channel-3"
      }
    ]
  },
  "sound/channel-3": {
    "title": "Fuente de entrada",
    "status": "Sin_Sonido · Canal",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Ubica el <strong>selector de fuente</strong> arriba del canal (USB / DIGITAL / LINE / PHONO).",
          "Ponlo donde realmente viene tu música.",
          "¿Sigue sin nada? Pasa tu fuente a un canal que sí funcione y toca desde ahí."
        ]
      }
    ],
    "label": "La entrada",
    "heading": "Revisa la fuente de entrada",
    "question": "¿Ya suenas en algún canal?",
    "step": "ns_channel3",
    "options": [
      {
        "label": "SÍ, YA ESTOY AL AIRE",
        "to": "/saved?path=no_sound&branch=source",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE SIN NADA",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/master": {
    "title": "No sale nada",
    "status": "Sin_Sonido · Master",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Sube <strong>MASTER</strong> al centro, 12 en punto. Sube <strong>BOOTH</strong> también.",
          "Revisa que nada esté en mute y que no haya nada conectado al <strong>master insert</strong>."
        ]
      },
      {
        "t": "details",
        "summary": "Qué es el master insert",
        "html": "<p> Un punto de conexión en la parte trasera del mixer donde se inserta un procesador externo dentro de la señal de master. Si hay un cable conectado y nada devuelve audio, el master queda en silencio con todos los faders arriba. Si hay algo conectado, casi seguro es del lugar: pregunta antes de sacarlo. <br /><br /> Palabras para el técnico: <strong>\"Hay algo conectado en el master insert. ¿Está en uso, o es equipo muerto que puedo desconectar?\"</strong> </p>"
      }
    ],
    "label": "El master",
    "heading": "Revisa el master",
    "question": "¿Hay sonido en la sala?",
    "step": "ns_master",
    "options": [
      {
        "label": "SÍ, YA SUENA",
        "to": "/saved?path=no_sound&branch=master",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE EN SILENCIO",
        "to": "sound/master-2"
      }
    ]
  },
  "sound/master-2": {
    "title": "Sigue el cable",
    "status": "Sin_Sonido · Master",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "<strong>Baja el master antes de tocar un conector.</strong> Súbelo después. Conectar en caliente a un PA encendido manda un golpe a nivel máximo y puede quemar los drivers.",
          "Reconecta los cables de salida de master, en los dos extremos.",
          "Cambia el par de master por el par de <strong>salida de booth</strong> si los conectores calzan (en la mayoría de los DJM la salida de booth es un par de jack de 1/4 de pulgada, así que los cables XLR del lugar necesitan adaptadores).",
          "¿Los amplificadores están encendidos? En la mayoría de los lugares el rack no está en el booth, así que esto suele ser una pregunta para alguien más, no algo que revises tú."
        ]
      },
      {
        "t": "details",
        "summary": "Palabras para quien maneja el sonido de la sala",
        "html": "<p> <strong>\"Mi master está arriba y los medidores se mueven. ¿Alguien puede confirmar que los amplificadores están encendidos?\"</strong> <br /><br /> Nombrar los medidores importa. Es la diferencia entre un pedido que tienen que investigar y uno que pueden responder de inmediato. </p>"
      }
    ],
    "label": "A la salida del mixer",
    "heading": "Sigue el cable hacia afuera",
    "question": "¿Hay sonido ahora?",
    "step": "ns_master2",
    "options": [
      {
        "label": "SÍ, YA SUENA",
        "to": "/saved?path=no_sound&branch=cable",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE EN SILENCIO",
        "to": "sound/house"
      }
    ]
  },
  "sound/house": {
    "title": "Llama al técnico de la sala",
    "status": "Sin_Sonido · Sala",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "De aquí en adelante es la cadena de señal del lugar, no tu equipo.",
          "Díselo exacto: <strong>\"El master del mixer está arriba y los medidores se mueven. Después de la salida de booth no hay nada.\"</strong>",
          "Mientras trabajan: mantén tu set cueado y listo para arrancar."
        ]
      },
      {
        "t": "assumed",
        "html": "Si el que lee esto es el técnico: el DJ ya revisó canal, assign de crossfader, selector de fuente, trim, nivel de master, master insert y los cables de salida del lado del mixer. El mixer está pasando señal."
      },
      {
        "t": "note",
        "html": "Una sala en silencio por el lado del sonido de la casa no es tu falla. Mantente listo."
      }
    ],
    "label": "No es tu equipo",
    "heading": "Llama al técnico de la sala",
    "question": "¿Lo devolvieron al aire?",
    "step": "ns_house",
    "options": [
      {
        "label": "SÍ, YA ESTOY AL AIRE",
        "to": "/saved?path=no_sound&branch=house",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE SIN NADA",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/phones": {
    "title": "Sin cue en los audífonos",
    "status": "Sin_Sonido · Audifonos",
    "red": true,
    "blocks": [
      {
        "t": "assumed",
        "html": "El CUE está encendido. Por eso llegaste aquí."
      },
      {
        "t": "check",
        "items": [
          "Perilla <strong>MIX</strong> de audífonos todo hacia CUE, no hacia MASTER.",
          "<strong>LEVEL</strong> de audífonos hasta la mitad."
        ]
      }
    ],
    "label": "Primero el cue",
    "heading": "Revisa el cue, no el conector",
    "question": "¿Ya lo escuchas?",
    "step": "ns_phones",
    "options": [
      {
        "label": "SÍ, YA LO ESCUCHO",
        "to": "/saved?path=no_sound&branch=cue",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE SIN NADA",
        "to": "sound/phones-2"
      }
    ]
  },
  "sound/phones-2": {
    "title": "El conector de audífonos",
    "status": "Sin_Sonido · Audifonos",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Mete el plug a fondo. A medio entrar es el clásico.",
          "Prueba la otra entrada de audífonos si el mixer tiene más de una.",
          "Enrosca el adaptador hasta el final, o prueba con los audífonos de alguien más."
        ]
      },
      {
        "t": "note",
        "html": "Si te toca, puedes mezclar sin cue. Mezclas largas, tracks que conoces."
      }
    ],
    "label": "Ahora el conector",
    "heading": "Ahora el conector",
    "question": "¿Ya lo escuchas?",
    "step": "ns_phones2",
    "options": [
      {
        "label": "SÍ, YA LO ESCUCHO",
        "to": "/saved?path=no_sound&branch=jack",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE SIN NADA",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/wrong": {
    "title": "Hay sonido, pero mal",
    "status": "Sin_Sonido · Calidad",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "<strong>Baja el master antes de tocar un conector.</strong> Súbelo después. La sala está sonando, y conectar en caliente a un PA encendido puede quemar los drivers.",
          "Reconecta cada conector del camino. A medio entrar es lo que deja el sonido de un solo lado.",
          "Ajusta el <strong>TRIM</strong> para que el medidor del canal llegue a naranja, nunca a rojo.",
          "Cambia el cable sospechoso. Los cables fallan más seguido que los equipos."
        ]
      }
    ],
    "label": "Bajo, distorsionado o de un lado",
    "heading": "Bajo, distorsionado o de un solo lado",
    "question": "¿Ya suena limpio?",
    "step": "ns_wrong",
    "options": [
      {
        "label": "SÍ, SUENA BIEN",
        "to": "/saved?path=no_sound&branch=quality",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE MAL",
        "to": "sound/wrong-2"
      }
    ]
  },
  "sound/wrong-2": {
    "title": "Aíslalo",
    "status": "Sin_Sonido · Calidad",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Pasa tu fuente a otro canal. ¿Se arregló? Falla del canal, quédate ahí.",
          "Prueba otra salida, booth contra master. ¿Se arregló? Falla de salida, avísale al técnico.",
          "¿Sigue mal en todos lados? Falla de la fuente. Otro cable, otro dispositivo."
        ]
      }
    ],
    "label": "30 segundos",
    "heading": "Aíslalo en 30 segundos",
    "question": "¿Ya se puede tocar?",
    "step": "ns_wrong2",
    "options": [
      {
        "label": "SÍ, YA ESTOY AL AIRE",
        "to": "/saved?path=no_sound&branch=isolate",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NO, SIGUE MAL",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/fallback": {
    "title": "Modo supervivencia: sonido",
    "status": "Sin_Sonido · Supervivencia",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Deja de diagnosticar. Lo que sea que haga ruido cuando llegue tu turno."
      },
      {
        "t": "check",
        "items": [
          "Pasa todo a un canal que sepas que funciona, aunque lo compartas.",
          "Pregúntale al DJ que va antes o después de ti. Conocen las mañas de este mixer.",
          "Pídele al técnico de sonido cualquier entrada libre, un celular en un canal de línea cuenta.",
          "Mantén la sala andando con el reproductor que todavía funciona. Con un solo deck no se mezcla, así que esto te da tiempo, no un set.",
          "Con PRO DJ LINK, carga tus tracks desde el USB que sigue puesto en el reproductor muerto."
        ]
      }
    ],
    "label": "Deja de diagnosticar",
    "heading": "Que salga sonido en la sala",
    "question": "¿Encontraste una forma de tocar?",
    "step": "ns_fallback",
    "options": [
      {
        "label": "SÍ, TENGO CÓMO SEGUIR",
        "to": "/saved?path=no_sound&branch=survival",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        // ROUTE REVIEWED 2026-08-04 and deliberately KEPT. The obvious fix
        // was to send this to shared/survival, the critical path's safety
        // net. It does not fit a silent room: its heading is "play without
        // your USB", two of its three moves are about reading a drive on
        // another player or a laptop, and its own NO exits to /files-lost,
        // a file-recovery page, for a DJ whose files are fine. Sending a
        // no-sound failure there would tell them we lost track of their
        // problem. sound/fallback already carries the survival moves that
        // do apply. What was actually wrong was the LABEL: it promised
        // help and delivered a form. It now says so plainly instead.
        "label": "NO, ME QUEDÉ SIN OPCIONES",
        "to": "/feedback?from=no_sound",
        "desc": "Aquí termina el flujo de sin sonido. Lo que sigue es un formulario, no un arreglo: cuéntanos qué estaba haciendo el mixer y construimos la respuesta para el próximo DJ.",
        "event": "outcome_reached",
        "data": {
          "outcome": "handoff",
          "path": "no_sound"
        }
      }
    ]
  },
  "export/start": {
    "title": "Falló el export de rekordbox",
    "status": "Arreglo_Export",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "Un export fallido se arregla en una computadora, bien hecho, para que no vuelva a fallar en el booth. ¿Te faltan minutos para tocar y no hay computadora? Toma mejor las soluciones de booth."
      }
    ],
    "draft": true,
    "heading": "RESCATE DE <span class=\"accent\">EXPORT</span>",
    "question": "¿Tienes acceso a una computadora con rekordbox?",
    "step": "qf_computer",
    "options": [
      // Three options now, so every one carries an explicit tone: past two
      // the renderer falls back to neutral and the colour would say nothing.
      {
        "label": "SÍ, CON rekordbox",
        "to": "export/usb-check",
        // Green: a computer with rekordbox means you have the time and the
        // tools to fix this properly.
        "tone": "green"
      },
      {
        "label": "NO, AHORA NO",
        "to": "export/find",
        // No computer yet: slower path, still a path.
        "tone": "amber"
      },
      {
        "label": "ENTRO EN MINUTOS",
        "to": "usb/moves",
        "desc": "Sáltate la reparación. Directo a las soluciones de booth.",
        // Red: the paragraph above offered this route and no pad did it, so
        // a DJ read an instruction with no control. Red is the time reading,
        // not the severity one: you are on in minutes, so move now.
        "tone": "red"
      }
    ]
  },
  "export/find": {
    "title": "Consigue una computadora",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "Un arreglo de verdad necesita rekordbox. Tienes tiempo para conseguir una:"
      },
      {
        "t": "check",
        "items": [
          "¿Tu propia laptop en la casa o en el auto?",
          "Otro DJ del lineup con rekordbox instalado.",
          "La computadora de la oficina del lugar o del promotor (rekordbox es de descarga gratuita)."
        ]
      }
    ],
    "draft": true,
    "label": "Paso 0",
    "heading": "Tienes tiempo, úsalo para conseguir una computadora",
    "question": "¿Conseguiste acceso a una computadora?",
    "step": "qf_find_computer",
    "options": [
      {
        "label": "SÍ, CONSEGUÍ UNA",
        "to": "export/usb-check"
      },
      {
        "label": "NO, PASAR A LAS SOLUCIONES",
        "to": "usb/moves",
        "desc": "Sin computadora no hay reparación real. Usamos la ruta crítica para ponerte a tocar.",
        // Giving up the repair for workarounds is a trade, not a loss.
        "tone": "amber"
      }
    ]
  },
  "export/usb-check": {
    "title": "Rescate de export: revisión del USB",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Apenas monte el USB, la computadora puede ofrecerte formatearlo o inicializarlo. Di que NO.</strong> En Mac el botón dice \"Initialize…\" (\"Inicializar…\") y abre Utilidad de Discos, a un paso de borrar el USB. Todavía no se ha perdido nada. Elige Ignorar o Expulsar, y responde abajo."
      }
    ],
    "draft": true,
    "label": "Paso 1",
    "heading": "Revisa el USB en la computadora",
    "question": "Conecta el USB a la computadora. ¿Qué pasa?",
    "step": "qf_usb_check",
    "options": [
      {
        "label": "VEO MIS ARCHIVOS",
        "to": "export/backup"
      },
      {
        "label": "NADA / MENSAJE DE ERROR",
        "to": "export/dead-checks"
      }
    ]
  },
  "export/dead-checks": {
    "title": "Revisiones del USB",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Otro puerto USB, conectado <strong>directo</strong> (sin hub).",
          "Otra computadora si hay alguna cerca.",
          "Si pregunta \"¿quieres formatear?\" - <strong>di que NO.</strong> Tus archivos siguen ahí."
        ]
      }
    ],
    "draft": true,
    "label": "Paso 1b",
    "heading": "La computadora no lo ve. Revisiones rápidas:",
    "question": "¿Alguna computadora ve los archivos ahora?",
    "step": "qf_dead_checks",
    "options": [
      {
        "label": "SÍ, SE VEN LOS ARCHIVOS",
        "to": "export/backup"
      },
      {
        "label": "NO, EL USB SIGUE MUERTO",
        "to": "export/fresh",
        "desc": "Armamos el USB de hoy en otra unidad. La recuperación de este viene después del gig."
      }
    ]
  },
  "export/backup": {
    "title": "Primero el backup",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "Todo lo que sigue puede terminar en un formateo. <strong>Primero copia tu música del USB a la computadora.</strong>"
      },
      {
        "t": "check",
        "items": [
          "Copia el USB completo a la computadora. Como mínimo la carpeta <strong>Contents</strong>, que salva tu audio pero no tus playlists, cues ni grids: tendrías que escarbar entre carpetas de artista y álbum para encontrar un track.",
          "Si algunos archivos fallan, copia lo que se pueda y anota cuáles. Los archivos que se saltaron se pierden para siempre si después formateas este USB, así que si alguno te importa, toma mejor la ruta del USB nuevo y deja este intacto.",
          "Mientras copia: abre rekordbox y pon el selector de modo de arriba a la izquierda en <span class=\"mono\">EXPORT</span>. Si tu USB aparece en <strong>Devices</strong>, la siguiente pantalla lo refresca; si nunca aparece, dilo en la siguiente pantalla y reconstruimos desde cero."
        ]
      }
    ],
    "draft": true,
    "label": "Paso 2",
    "heading": "Copia de seguridad antes de reconstruir",
    "question": "¿La copia terminó?",
    "step": "qf_backup",
    "options": [
      {
        "label": "SÍ, LA MÚSICA ESTÁ A SALVO",
        "to": "export/repair"
      },
      {
        "label": "NO, LA COPIA SIGUE FALLANDO",
        "to": "export/fresh",
        "desc": "El USB está fallando. Armamos el gig de hoy en otro."
      }
    ]
  },
  "export/repair": {
    "title": "Repara el dispositivo",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Primero revisa tu Collection.</strong> Si esta computadora es prestada o del lugar y la Collection está vacía, NO borres nada. No habría nada que devolver. Usa mejor la música que acabas de respaldar."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Borrar las playlists del dispositivo borra con ellas los cues y grids de hoy.</strong> El backup de dos pasos atrás guardó solo el audio. Tu Collection en esta computadora todavía tiene los cues y grids, y el USB los recupera cuando termine el sync nuevo. Entre esos dos momentos existen en un solo lugar."
      },
      {
        "t": "check",
        "items": [
          "En rekordbox, sobre el <strong>dispositivo</strong>: borra las playlists de hoy.",
          "Arrastra otra vez las playlists de hoy desde tu collection al dispositivo (sync nuevo).",
          "Espera a que el sync termine por completo.",
          "Expulsa con el <strong>botón de expulsar de rekordbox</strong>, nunca saques el USB a la fuerza."
        ]
      }
    ],
    "draft": true,
    "label": "Paso 3",
    "heading": "Refresca el export",
    "question": "¿El sync terminó sin errores?",
    "step": "qf_repair",
    "options": [
      {
        "label": "SÍ, SYNC LISTO",
        "to": "export/verify"
      },
      {
        "label": "NO, HAY ERRORES O NO APARECE",
        "to": "export/errors"
      }
    ]
  },
  "export/errors": {
    "title": "Lee el error",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "Diez segundos aquí te ahorran un formateo inútil. Los errores de sync se dividen en dos familias y solo una es culpa del USB."
      }
    ],
    "draft": true,
    "label": "Paso 3b",
    "heading": "¿De qué se está quejando rekordbox?",
    "question": "¿Cómo son los errores?",
    "step": "qf_errors",
    "options": [
      {
        "label": "ARCHIVOS QUE NO APARECEN",
        "to": "export/export",
        "desc": "Es del lado de la biblioteca, no del USB. Importa la carpeta que respaldaste y exporta de nuevo. No hace falta formatear.",
        // Symptom split: both answers just name the problem.
        "tone": "amber"
      },
      {
        "label": "ERRORES DEL DISPOSITIVO",
        "to": "export/erase",
        "desc": "De dispositivo, de escritura o desconocidos: el sospechoso es el USB y lo reconstruimos desde cero.",
        // Same split, other family.
        "tone": "amber"
      }
    ]
  },
  "export/erase": {
    "title": "Prepararse para formatear",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "Tu copia de seguridad del paso de backup es lo que hace que esto no termine en pérdida."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>El siguiente paso BORRA este USB por completo.</strong> Todo lo que antes no se pudo copiar se pierde para siempre. Si alguno de esos archivos te importa, detente aquí y toma mejor la ruta del USB nuevo."
      }
    ],
    "draft": true,
    "label": "Paso 3c",
    "heading": "Prepara el USB",
    "question": "¿Confirmas borrar este USB y continuar?",
    "step": "qf_erase_consent",
    "options": [
      {
        "label": "SÍ, BORRAR Y CONTINUAR",
        "to": "export/format",
        // Third consent screen, same correction. The alert above says
        // anything that failed to copy is gone for good; a green pad under
        // that sentence contradicts it. Amber: chosen, and it costs you.
        "tone": "amber"
      },
      {
        "label": "NO, DEJAR ESTE USB COMO ESTÁ",
        "to": "export/fresh",
        "desc": "Armamos el gig de hoy en otro USB.",
        // Keeping the drive intact has a real route. Caution, not danger.
        "tone": "amber"
      }
    ]
  },
  "export/format": {
    "title": "Formateo limpio",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Esto borra el USB por completo.</strong> Todo lo que solo exista en este USB se pierde. Si algún archivo no se pudo copiar antes, después de este paso no vuelve."
      },
      {
        "t": "check",
        "items": [
          "Confirma que estás en el disco correcto: revisa el nombre y el tamaño antes de tocar nada.",
          "Formatea el <em>dispositivo</em>, no el volumen. En Mac: Utilidad de Discos, Visualización, Mostrar todos los dispositivos.",
          "¿El USB es de más de 32GB y estás en Windows? El cuadro de diálogo del sistema no ofrece FAT32. Usa la herramienta gratuita <strong>guiformat</strong> y vuelve aquí.",
          "Formato: <span class=\"mono\">FAT32</span> · Esquema: <span class=\"mono\">MBR</span> · Formato rápido OK."
        ]
      }
    ],
    "draft": true,
    "label": "Paso 4",
    "heading": "Formatea el USB desde cero",
    "question": "¿Se formateó bien?",
    "step": "qf_format",
    "options": [
      {
        "label": "SÍ, LIMPIO Y VACÍO",
        "to": "export/export"
      },
      {
        "label": "NO, EL FORMATEO FALLA",
        "to": "export/fresh",
        "desc": "Si el cuadro de diálogo no ofreció FAT32 en un USB grande, usa guiformat primero. Si el formateo en sí falla, el USB está acabado y armamos en otro."
      }
    ]
  },
  "export/export": {
    "title": "Export nuevo",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "rekordbox en modo <span class=\"mono\">EXPORT</span>, USB conectado.",
          "Arrastra <strong>solo las playlists de hoy</strong> al dispositivo. Export pequeño = rápido y confiable.",
          "¿No hay biblioteca de rekordbox en esta computadora? Primero importa la carpeta de música que respaldaste, y después expórtala.",
          "Espera a que el sync termine y expulsa con el botón de expulsar de rekordbox."
        ]
      }
    ],
    "draft": true,
    "label": "Paso 5",
    "heading": "Exporta la música de hoy con rekordbox",
    "question": "¿El export terminó sin errores?",
    "step": "qf_export",
    "options": [
      {
        "label": "SÍ, EXPORT LISTO",
        "to": "export/verify"
      },
      {
        "label": "NO, EL EXPORT FALLA",
        "to": "export/fresh"
      }
    ]
  },
  "export/fresh": {
    "title": "USB nuevo",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Consigue <strong>cualquier otro USB</strong>. El tuyo de repuesto, el de otro DJ, el del lugar."
        ]
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Si este USB te lo prestaron, detente y confirma con su dueño.</strong> El siguiente paso lo borra por completo. La biblioteca de otra persona no es descartable, y puede que no sepa que estás por formatearla."
      },
      {
        "t": "check",
        "items": [
          "Cuando sepas que el USB está vacío o es descartable, formatéalo: <span class=\"mono\">FAT32</span> + <span class=\"mono\">MBR</span>.",
          "Exporta las playlists de hoy desde rekordbox, o copia los archivos de música que respaldaste.",
          "Verifica: expulsa, vuelve a conectar, todo carga."
        ]
      }
    ],
    "draft": true,
    "label": "Plan B",
    "heading": "Arma el gig de hoy en otro USB",
    "question": "¿El USB nuevo funciona?",
    "step": "qf_fresh_usb",
    "options": [
      {
        "label": "SÍ, VOLVÍ AL AIRE",
        "to": "/saved?path=quick_fix&branch=fresh_usb",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "quick_fix"
        }
      },
      {
        "label": "NO, SE ACABÓ EL TIEMPO",
        "to": "usb/moves",
        "desc": "Cambia a la ruta crítica: soluciones de booth y modo supervivencia."
      }
    ]
  },
  "export/verify": {
    "title": "Verifica",
    "status": "Arreglo_Rapido",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Desconecta el USB, espera 5 segundos y vuelve a conectarlo.",
          "Ábrelo en rekordbox: el dispositivo carga, las playlists intactas.",
          "Si alcanzas un reproductor antes de tu set: pruébalo ahí también (<span class=\"mono\">SOURCE → USB</span>)."
        ]
      }
    ],
    "draft": true,
    "label": "Paso final",
    "heading": "Verifica antes de confiar",
    "question": "¿Todo carga bien?",
    "step": "qf_verify",
    "options": [
      {
        "label": "SÍ, TODO CARGA",
        "to": "/saved?path=quick_fix",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "quick_fix"
        }
      },
      {
        "label": "NO, SIGUE ROTO",
        "to": "export/fresh"
      }
    ]
  },
  "usb/start": {
    "title": "El USB no se reconoce",
    "status": "Ruta_Critica",
    "red": true,
    "label": "Diagnóstico",
    "heading": "El reproductor no ve el USB",
    "blocks": [
      {
        "t": "assumed",
        "html": "Ya lo reconectaste y ya probaste el otro deck."
      }
    ],
    "question": "¿Algún otro reproductor del booth lee el USB?",
    "step": "usb_start",
    "options": [
      {
        "label": "SÍ, OTRO REPRODUCTOR LO LEE",
        "to": "usb/link",
        "desc": "Entonces puedes estar tocando en menos de un minuto."
      },
      {
        "label": "NO, NINGUNO LO LEE",
        "to": "usb/moves",
        "desc": "Los cuatro movimientos. Una lista, no preguntas."
      }
    ]
  },
  "usb/link": {
    "title": "Toca por LINK",
    "status": "Critico · Arreglo mas rapido",
    "red": true,
    "label": "Prueba esto primero",
    "heading": "Carga desde el reproductor que sí lo ve",
    "blocks": [
      {
        "t": "dim",
        "html": "Si el booth está enlazado por PRO DJ LINK, cualquier reproductor puede buscar y cargar desde un USB que está físicamente en otro. Que tu puerto esté muerto deja de importar."
      },
      {
        "t": "check",
        "items": [
          "Presiona <strong>SOURCE</strong> en el reproductor donde quieres tocar.",
          "Selecciona el USB del otro reproductor (el dispositivo LINK / remoto).",
          "Busca y carga tu track desde ahí."
        ]
      }
    ],
    "question": "¿Cargó?",
    "step": "usb_link",
    "options": [
      {
        "label": "SÍ, ESTOY TOCANDO",
        "to": "/saved?path=critical&branch=link",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NO, SIGUE SIN NADA",
        "to": "usb/moves",
        "desc": "Los cuatro movimientos. Una lista, no preguntas."
      }
    ]
  },
  "usb/moves": {
    "title": "Los cuatro movimientos",
    "status": "Critico · Hazlo ahora",
    "red": true,
    "srHeading": "Cuatro movimientos, en orden, hasta que suene",
    "heading": "Cuatro movimientos que no has probado.",
    "moves": true,
    "blocks": [],
    "step": "runlist",
    "options": [
      {
        "label": "ESTOY TOCANDO",
        "to": "/saved?path=critical&branch=runlist",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NADA FUNCIONÓ, Y TENGO TIEMPO",
        "to": "usb/computer",
        "desc": "Diagnóstico paso a paso, una pregunta a la vez.",
        // GREEN, and Antonio overruled me to get here. I called it red on
        // the grounds that the four moves had all failed, which is severity
        // reasoning. He ruled the axis is TIME PRESSURE, not severity: "if
        // he has time, it's green, it's not urgent." The label says I HAVE
        // TIME in as many words, and the route it opens is a calm step by
        // step diagnosis. Nothing here has to happen in the next sixty
        // seconds, so nothing here is red.
        "tone": "green",
        "event": "step_completed",
        "data": {
          "step": "runlist_to_tree"
        }
      }
    ]
  },
  "usb/computer": {
    "title": "¿Tienes una computadora?",
    "status": "Ruta_Critica",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Ya hiciste los movimientos de booth, así que no los repetimos. Con una computadora arreglamos el USB; sin ella, te ponemos a tocar de otra forma."
      }
    ],
    "label": "Punto de decisión",
    "heading": "Objetivo ahora: tocar tu set.",
    "question": "¿Tienes una computadora ahora mismo?",
    "step": "usb_fork_computer",
    "options": [
      {
        "label": "SÍ, TENGO COMPUTADORA",
        "to": "shared/usb-check"
      },
      {
        "label": "NO HAY COMPUTADORA",
        "to": "shared/survival",
        "desc": "Los movimientos de booth ya están hechos. Directo a las otras formas de tocar."
      }
    ]
  },
  "frozen/start": {
    "title": "Reproductor congelado",
    "status": "Ruta_Critica",
    "red": true,
    "label": "Diagnóstico",
    "heading": "Una pantalla congelada no siempre es audio congelado",
    "blocks": [
      {
        "t": "dim",
        "html": "Si había un track sonando cuando se congeló, lo normal es que siga sonando. No se toca nada hasta que la sala esté cubierta."
      }
    ],
    "question": "¿El reproductor congelado está al aire en la mezcla ahora mismo?",
    "step": "frozen_start",
    "neutral": true,
    "options": [
      {
        "label": "ESTÁ SONANDO EN LA SALA",
        "to": "frozen/live",
        "desc": "Primero movemos la sala, después reiniciamos.",
        // Amber, not red: the room still HAS music. What you have lost is
        // your freedom to act, because the deck you would restart is the
        // one the crowd is hearing, and the track has an end.
        "tone": "amber"
      },
      {
        "label": "NO ESTÁ SONANDO, FUERA DE LA MEZCLA",
        "to": "frozen/restart",
        "desc": "Entonces se puede reiniciar sin riesgo.",
        // Green. Its own description says "without risk", which is the
        // definition of the green level.
        "tone": "green"
      }
    ]
  },
  "frozen/live": {
    "title": "Mantén la sala sonando",
    "status": "Critico · Deck al aire",
    "red": true,
    "label": "Paso 1 de 2",
    "heading": "Primero pasa la música a otro deck",
    "blocks": [
      {
        "t": "dim",
        "html": "El reproductor congelado sigue sonando por ahora. El reinicio ocurre solo cuando ya no esté cargando la sala."
      },
      {
        "t": "check",
        "items": [
          "No toques el reproductor congelado para nada. Ni botones, ni USB, ni corriente.",
          "Deja listo el siguiente track en otro reproductor: con su propio USB, o con el tuyo por <strong>PRO DJ LINK</strong> si la red todavía responde.",
          "Toma el control de la mezcla desde el deck que funciona."
        ]
      }
    ],
    "question": "¿Otro deck está cargando la sala?",
    "step": "frozen_live",
    "options": [
      {
        "label": "SÍ, YA ESTÁ CUBIERTO",
        "to": "frozen/restart",
        "desc": "Ahora el reproductor congelado se puede reiniciar sin riesgo."
      },
      {
        "label": "NO, NADA MÁS PUEDE SONAR",
        "to": "shared/survival",
        "desc": "Otras formas de mantener sonido en la sala."
      }
    ]
  },
  "frozen/restart": {
    "title": "Reinicia el reproductor",
    "status": "Critico · Reinicio",
    "red": true,
    "label": "El reinicio",
    "heading": "Apágalo y enciéndelo bien",
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "Reinicia solo un reproductor que no esté cargando la sala. Si todavía está sonando, vuelve atrás y entrégale la sala a otro deck primero."
      },
      {
        "t": "check",
        "items": [
          "Presiona <strong>USB STOP</strong> si responde, y espera a que la luz deje de parpadear.",
          "Apaga. Espera veinte segundos.",
          "Enciende y deja que arranque por completo antes de tocar nada.",
          "Vuelve a insertar el USB y dale treinta segundos. Las bibliotecas grandes montan lento. Si el reproductor se congeló mientras buscabas, prueba el USB en otro deck primero: una base de datos corrupta lo puede congelar de nuevo."
        ]
      }
    ],
    "question": "¿El reproductor volvió y lee tu USB?",
    "step": "frozen_restart",
    "options": [
      {
        "label": "SÍ, ESTOY TOCANDO",
        "to": "/saved?path=frozen&branch=restart",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "frozen"
        }
      },
      {
        "label": "NO, SIGUE CONGELADO O NO LEE",
        "to": "frozen/link"
      }
    ]
  },
  "frozen/link": {
    "title": "Sácalo de la red",
    "status": "Critico · Link",
    "red": true,
    "label": "Último aislamiento",
    "heading": "Aíslalo del booth",
    "blocks": [
      {
        "t": "dim",
        "html": "Cuando más de un reproductor se porta mal al mismo tiempo, la red LINK es sospechosa. Un reproductor que se congela en la red puede andar bien solo."
      },
      {
        "t": "check",
        "items": [
          "Desconecta el cable <strong>LINK</strong> solo del reproductor congelado. No toques el resto del booth.",
          "Reinícialo una vez más, ya sin red.",
          "Reproduce desde su propio puerto USB."
        ]
      }
    ],
    "question": "¿Ya suena en algún deck?",
    "step": "frozen_link",
    "options": [
      {
        "label": "SÍ, ESTOY TOCANDO",
        "to": "/saved?path=frozen&branch=isolate",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "frozen"
        }
      },
      {
        "label": "NO, SIGUE SIN NADA",
        "to": "shared/survival",
        "desc": "Te ponemos a tocar de otra forma."
      }
    ]
  }
};
