/*
 * THE EMERGENCY TREE, BRAZILIAN PORTUGUESE (pt-BR).
 *
 * Counterpart of src/data/emergency-tree.js. Structure is a mirror and must
 * stay one: identical node ids, identical `to` targets, identical `tone`
 * values, identical `step`/`event`/`data` payloads, identical `red`/`draft`/
 * `neutral` flags, identical option order. ONLY the human readable strings
 * differ. If you change the flow, change the English file and mirror it here
 * in the same commit, never the other way round.
 *
 * Rendered by src/pages/pt/protocol/[...slug].astro.
 *
 * TRANSLATION RULES THAT ARE LOAD BEARING HERE:
 *  - Hardware labels (USB STOP, SOURCE, FOLDER, TRIM, MASTER, BOOTH, LINK,
 *    ASSIGN, THRU, CUE, MIX, LEVEL, EQ CURVE, COLOR FX, FILTER), model names,
 *    file systems (FAT32, exFAT, NTFS, MBR) and error strings are physical
 *    reality. They are NEVER translated.
 *  - "rekordbox" is always lowercase, including inside option labels, which
 *    global.css uppercases anyway (.pad-title { text-transform: uppercase }).
 *  - "pen drive", never "unidade flash USB". Brazilian forms only: arquivo,
 *    tela, celular, notebook, mouse.
 *  - The English "tonight" means THIS GIG, NOW. It is rendered "hoje",
 *    "agora" or "nesta gig", never "hoje a noite".
 *  - No exclamation marks, no em or en dashes anywhere: the build rejects
 *    them. Commas, colons and full stops only.
 *  - Option labels are re authored to stay short and parallel. Portuguese
 *    runs longer than English and a three line pad is unreadable in a dark
 *    booth. Shorten the wording, never the warning.
 *  - `status` strings are code styled UI chrome, so they carry no accents.
 */

export const DOORS = ["usb/start","music/start","sound/start","frozen/start","export/start"];

export const TREE = {
  "music/start": {
    "title": "Você vê suas playlists?",
    "status": "Rota_Critica",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Boa notícia. Isso já descarta o pior cenário. Agora descobrimos o que o player não consegue ler."
      }
    ],
    "label": "Diagnóstico",
    "heading": "O drive está sendo lido",
    "question": "Você vê suas playlists no player?",
    "step": "symptom",
    "options": [
      {
        "label": "NÃO, AS PLAYLISTS SUMIRAM",
        "to": "music/folder",
        "desc": "Sumiram, vazias ou não abrem: tudo conta. Costuma se resolver em 15 segundos.",
        // Symptom split, not a choice: neither branch is the safe one.
        "tone": "amber"
      },
      {
        "label": "SIM, MAS NÃO TOCA",
        "to": "music/other-track",
        "desc": "Códigos de erro, ou tracks que não tocam.",
        // Same split: a symptom answer never earns green.
        "tone": "amber"
      }
    ]
  },
  "music/other-track": {
    "title": "Teste outra track",
    "status": "Critico · Checagem mais rapida",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Um arquivo corrompido e um drive morrendo parecem a mesma coisa de onde você está. Três segundos separam os dois, e essa é a diferença entre contornar uma track e reconstruir um drive saudável à toa."
      },
      {
        "t": "check",
        "items": [
          "Carregue uma <strong>track diferente</strong>, de uma <strong>playlist diferente</strong>. Se tocar, teste mais uma de outro lugar."
        ]
      },
      {
        "t": "note",
        "html": "Nenhuma track tocando num deck mais antigo também pode ser o formato do arquivo: muitos players anteriores ao NXS2 não leem FLAC nem ALAC. Os arquivos estão íntegros; aquele deck não consegue decodificar, e nenhuma reconstrução muda isso."
      }
    ],
    "label": "Antes de qualquer coisa",
    "heading": "Um arquivo, ou o drive inteiro?",
    "question": "Essa toca?",
    "step": "music_other_track",
    "options": [
      {
        "label": "SIM, ESSA TOCA",
        "to": "/saved?path=critical&branch=one_track",
        "desc": "Eram aqueles arquivos, não o seu drive. Contorne eles hoje; se outra falhar, volte aqui.",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NÃO, NADA CARREGA",
        "to": "shared/computer",
        "desc": "Então é o drive ou o banco de dados, e isso a gente resolve."
      }
    ]
  },
  "music/folder": {
    "title": "Toque pela visão FOLDER",
    "status": "Critico · Solucao mais rapida",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Playlist sumida quase nunca significa drive quebrado. Em geral o player só não consegue ler o banco de dados das playlists, enquanto os arquivos de música seguem intactos no pen drive. A visão FOLDER ignora o banco de dados por completo."
      },
      {
        "t": "check",
        "items": [
          "Pressione <strong>SOURCE</strong> e selecione o seu USB.",
          "Mude a visão de navegação para <strong>FOLDER</strong>.",
          "Carregue uma track."
        ]
      },
      {
        "t": "alert",
        "emoji": "💡",
        "html": "Você perde cues, grids, playlists, Sync e Quantize. Você mantém a gig. O banco de dados se conserta direito amanhã, não agora."
      },
      {
        "t": "note",
        "html": "Funciona no outro player mas não neste? É a divisão de formato de biblioteca, não um drive quebrado. <a href=\"/pt/knowledge/pioneer-dj/rekordbox#onelibrary\">O que isso significa</a>, depois da gig."
      }
    ],
    "label": "Tente isto primeiro, 15 segundos",
    "heading": "Suas tracks provavelmente ainda estão lá",
    "question": "Você consegue carregar e tocar uma track assim?",
    "step": "folder_view",
    "options": [
      {
        "label": "SIM, ESTÁ TOCANDO",
        "to": "/saved?path=critical&branch=folder_view",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NÃO, NADA AINDA",
        "to": "shared/computer",
        "desc": "Então olhamos o drive em si."
      }
    ]
  },
  "shared/computer": {
    "title": "Você tem um computador?",
    "status": "Rota_Critica",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Não é consertar o USB. Isso fica para depois da gig."
      }
    ],
    "label": "Ponto de decisão",
    "heading": "Objetivo agora: tocar o set.",
    "question": "Você tem um computador agora?",
    "step": "critical_fork_computer",
    "options": [
      {
        "label": "SIM, TENHO COMPUTADOR",
        "to": "shared/usb-check"
      },
      {
        "label": "SEM COMPUTADOR",
        "to": "usb/booth",
        // Resource NO with a live route: costs options, not the gig.
        "tone": "amber"
      }
    ]
  },
  "shared/usb-check": {
    "title": "Teste do USB",
    "status": "Critico · Notebook",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Se o computador oferecer formatar ou inicializar o drive, diga NÃO.</strong> No Mac, não toque em \"Inicializar…\" (\"Initialize…\"): isso abre o Utilitário de Disco, a um passo de apagar o drive. Seus arquivos continuam lá. Escolha Ignorar ou Ejetar."
      }
    ],
    "label": "Diagnóstico",
    "heading": "Você tem um computador",
    "question": "Conecte o USB no computador. O que acontece?",
    "step": "usb_check",
    "options": [
      {
        "label": "VEJO MEUS ARQUIVOS",
        "to": "rebuild/second-usb"
      },
      {
        "label": "NADA / MENSAGEM DE ERRO",
        "to": "shared/usb-dead"
      }
    ]
  },
  "shared/usb-dead": {
    "title": "O computador não lê o USB",
    "status": "Critico · Teste do USB",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Dois minutos, nesta ordem:"
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Se oferecer formatar ou inicializar o drive, diga NÃO.</strong> Formatar agora destrói arquivos que ainda são recuperáveis."
      },
      {
        "t": "check",
        "items": [
          "Conecte <strong>direto</strong>, sem hub e sem dock. Hub alimentado pela porta derruba drive no limite.",
          "Teste <strong>outro computador</strong> se houver um por perto. Um adaptador de celular prova que o drive está vivo, mas a reconstrução de hoje precisa de um computador."
        ]
      }
    ],
    "draft": true,
    "label": "Diagnóstico",
    "heading": "O computador também não lê",
    "headingClass": "danger",
    "question": "Algum aparelho enxerga o USB agora?",
    "step": "usb_dead_check",
    "options": [
      {
        "label": "SIM, OS ARQUIVOS APARECEM",
        "to": "rebuild/second-usb"
      },
      {
        "label": "NÃO, O USB MORREU",
        "to": "shared/survival",
        "desc": "Colocamos você para tocar de outro jeito. Recuperar arquivos fica para depois da gig."
      }
    ]
  },
  "usb/booth": {
    "title": "Sem computador: testes no player",
    "status": "Critico · Sem notebook",
    "red": true,
    "blocks": [
      {
        "t": "assumed",
        "html": "Reencaixar, o outro slot, o outro player e o seu drive reserva já contam como feitos. Estes aqui embaixo são os que todo mundo esquece."
      },
      {
        "t": "check",
        "items": [
          "<strong>PRO DJ LINK.</strong> Se a booth está em rede, navegue e carregue de um drive que está em outro player. O seu drive morto deixa de importar.",
          "<strong>Dê trinta segundos.</strong> Biblioteca grande monta devagar e parece morta enquanto monta. A maioria dos drives é arrancada antes de terminar.",
          "<strong>Visão FOLDER</strong>, se ainda não tentou. Quando o drive aparece mas as playlists não, o banco de dados morreu e o áudio não. Navegue por pasta e toque."
        ]
      },
      {
        "t": "note",
        "html": "Player antigo implica com drive novo: um pen drive USB 3.1/3.2 rápido ou um drive muito grande pode ser recusado por um CDJ mais velho que lê um pen drive simples sem problema. Seu drive pode nem estar morto, e é exatamente por isso que pedir emprestado funciona."
      }
    ],
    "draft": true,
    "label": "Passo 1 de 2",
    "heading": "Trabalhe a booth",
    "question": "Você consegue carregar e tocar uma track em algum player agora?",
    "step": "no_laptop_1",
    "options": [
      {
        "label": "SIM, ESTÁ LENDO",
        "to": "/saved?path=critical&branch=no_laptop",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NÃO, NADA AINDA",
        "to": "usb/restart"
      }
    ]
  },
  "usb/restart": {
    "title": "Sem computador: reiniciar o player",
    "status": "Critico · Sem notebook",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Só se ninguém estiver tocando neste player agora.</strong> Se outro DJ está no ar, não encoste: responda NÃO abaixo e siga em frente."
      },
      {
        "t": "check",
        "items": [
          "Tire o seu USB primeiro, pressione <span class=\"mono\">USB STOP</span>, espere a luz parar de piscar.",
          "Desligue o player. Espere 20 segundos.",
          "Ligue de novo e deixe iniciar por completo.",
          "Insira o USB e espere, alguns drives levam mais de 30 segundos para montar."
        ]
      }
    ],
    "draft": true,
    "label": "Passo 2 de 2",
    "heading": "Reinicie o player",
    "question": "O player lê o USB agora?",
    "step": "no_laptop_2",
    "options": [
      {
        "label": "SIM, ESTÁ LENDO",
        "to": "/saved?path=critical&branch=no_laptop",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NÃO, CONTINUA MORTO",
        "to": "shared/survival"
      }
    ]
  },
  "shared/survival": {
    "title": "Modo sobrevivência",
    "status": "Critico · Sobrevivencia",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Pare de diagnosticar. Só tire som das caixas quando for a sua vez."
      },
      {
        "t": "check",
        "items": [
          "<strong>Peça ao DJ antes ou depois de você.</strong> O drive dele é um export do rekordbox como o seu, então vai ler. Isso já aconteceu com todos eles.",
          "<strong>Procure um notebook na booth.</strong> Seu USB pode ler num computador mesmo que os players recusem.",
          "<strong>Troque de horário</strong> com o próximo DJ e use o tempo extra."
        ]
      },
      {
        "t": "details",
        "summary": "Se não houver drive nenhum",
        "html": "<p> Um celular num canal livre impede a pista de ficar em silêncio. Seja honesto com você mesmo sobre o que isso é: não é o seu set continuando, é a pista não parando. Só funciona se você já carrega um adaptador USB-C para 3,5 mm e um cabo 3,5 mm para dois RCA. </p>"
      }
    ],
    "draft": true,
    "label": "Modo sobrevivência",
    "heading": "Modo sobrevivência: tocar sem o seu USB",
    "question": "Você achou um jeito de tocar?",
    "step": "survival",
    "options": [
      {
        "label": "SIM, ESTOU TOCANDO",
        "to": "/saved?path=critical&branch=survival",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NÃO, NADA FUNCIONOU",
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
    "title": "Um drive, uma decisão",
    "status": "Critico · Notebook",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "A reconstrução completa leva 15 minutos ou mais. Você entra em cinco? Peça um drive emprestado primeiro, reconstrua depois."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Você vai apagar este drive.</strong> Tudo que não for copiado por completo antes some até você conseguir trabalhar nele com calma em casa."
      }
    ],
    "label": "Ponto de decisão",
    "heading": "Um drive, uma decisão",
    "question": "Você aceita copiar seus arquivos para este computador e apagar o seu USB para conseguir tocar?",
    "step": "risk_consent",
    "options": [
      {
        "label": "SIM, COPIAR E APAGAR",
        "to": "rebuild/copy",
        // Consenting to an irreversible erase is never green. The card above
        // says this cannot be undone, so the pad cannot say "safe". Amber is
        // the honest reading: it costs you, and you have chosen it.
        "tone": "amber"
      },
      {
        "label": "NÃO, NÃO APAGAR",
        "to": "rebuild/no-erase",
        // Declining destruction is caution, never the red answer.
        "tone": "amber"
      }
    ]
  },
  "rebuild/second-usb": {
    "title": "Segundo USB?",
    "status": "Critico · Notebook",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Seus arquivos estão legíveis, então a rota rápida e segura vem primeiro. Com um segundo drive, o original não é tocado hoje."
      },
      {
        "t": "note",
        "html": "Este computador tem rekordbox com a <strong>sua</strong> biblioteca? Vá pelo <a href=\"/pt/protocol/export/backup\">resgate do export</a>: um export novo preserva seus cues e playlists, uma cópia crua de arquivos não."
      }
    ],
    "label": "A rota rápida primeiro",
    "heading": "OS ARQUIVOS APARECEM",
    "headingClass": "accent",
    "question": "Você tem outro USB para usar agora?",
    "step": "second_usb",
    "options": [
      {
        "label": "SIM, TENHO OUTRO USB",
        "to": "rebuild/second-format",
        "desc": "Montamos a gig de hoje nele. O original fica intocado."
      },
      {
        "label": "NÃO, SÓ TENHO ESTE",
        "to": "rebuild/risk",
        "desc": "Então há uma decisão a tomar antes.",
        // Resource NO with a live route: costs options, not the gig. Same
        // shape as shared/computer NO, so the same colour.
        "tone": "amber"
      }
    ]
  },
  "rebuild/second-format": {
    "title": "Formate o segundo USB",
    "status": "Critico · Segundo USB",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "A gig de hoje é montada no segundo drive. Seja qual for o estado do primeiro, nada mais acontece com ele daqui em diante."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Isto apaga tudo do SEGUNDO drive. Se ele é emprestado, pare e confirme com o dono antes.</strong> A biblioteca de outra pessoa não é descartável, e ela pode não saber que você está prestes a formatar."
      },
      {
        "t": "check",
        "items": [
          "No Windows: a janela padrão só oferece FAT32 até 32GB. Pen drive maior precisa da ferramenta gratuita <strong>guiformat</strong>.",
          "Conecte o <strong>segundo</strong> USB no computador.",
          "Botão direito → <strong>Formatar</strong> (ou Utilitário de Disco no Mac).",
          "Formato: <span class=\"mono\">FAT32</span> · Esquema: <span class=\"mono\">MBR</span> · Formatação rápida: OK"
        ]
      }
    ],
    "draft": true,
    "label": "Passo 1 de 2",
    "heading": "Formate o segundo USB",
    "question": "O segundo USB está formatado?",
    "step": "second_usb_format",
    "options": [
      // All three carry an explicit tone. With more than two options the
      // renderer falls back to neutral, and this screen is too consequential
      // to say nothing with colour.
      {
        "label": "SIM, FORMATADO",
        "to": "rebuild/second-copy",
        // Green: the drive is ready and the fast route is open.
        "tone": "green"
      },
      {
        "label": "NÃO, NÃO FORMATA",
        "to": "shared/survival",
        "desc": "Modo sobrevivência: outros jeitos de tocar hoje.",
        // Declining or failing to destroy is caution, never red. It costs
        // you the fast route, not the gig.
        "tone": "amber"
      },
      {
        "label": "NÃO POSSO APAGAR ESTE DRIVE",
        "to": "shared/survival",
        "desc": "É emprestado, ou o dono disse não. A decisão está certa, e há outros jeitos de tocar hoje.",
        // The alert above tells a DJ to check with the owner. Until now the
        // only way to act on that answer was to claim a technical failure
        // that never happened. Honouring someone else's library is caution.
        "tone": "amber"
      }
    ]
  },
  "rebuild/second-copy": {
    "title": "Copie as tracks para o segundo USB",
    "status": "Critico · Segundo USB",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Não tire nenhum dos dois USB durante a cópia.</strong>"
      },
      {
        "t": "check",
        "items": [
          "Copie <strong>só as tracks que você precisa hoje</strong> para o segundo drive: da pasta que você já criou no computador, ou direto do USB original se ele ainda ler.",
          "Use a busca, por nome do artista ou data de inclusão, para achar rápido.",
          "Se um arquivo travar, pule e siga. O que chegar é o seu set.",
          "Ejete os dois drives com segurança ao terminar."
        ]
      }
    ],
    "draft": true,
    "label": "Passo 2 de 2",
    "heading": "Copie as tracks de hoje",
    "question": "As tracks de hoje estão no segundo USB?",
    "step": "second_usb_copy",
    "options": [
      {
        "label": "SIM, LEVAR PARA O PLAYER",
        "to": "rebuild/load"
      },
      {
        "label": "NÃO, A CÓPIA FALHA",
        "to": "shared/survival",
        "desc": "O original não entrega os arquivos hoje. Outros jeitos de tocar."
      }
    ]
  },
  "rebuild/no-erase": {
    "title": "Ache outro USB",
    "status": "Critico · Rota segura",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "A gig de hoje passa a rodar de outro pen drive. Seja qual for o estado do seu drive original, nada mais acontece com ele aqui: ele é examinado direito depois da gig, num computador, com tempo."
      },
      {
        "t": "check",
        "items": [
          "Peça aos outros DJs, ao produtor, ao bar. Alguém tem um USB.",
          "Até um pequeno serve. Você só precisa do set de hoje."
        ]
      }
    ],
    "draft": true,
    "label": "Rota segura",
    "heading": "Precisamos de qualquer outro USB para hoje.",
    "question": "Você achou outro USB?",
    "step": "no_erase",
    "options": [
      {
        "label": "SIM, CONSEGUI UM",
        "to": "rebuild/second-format"
      },
      {
        "label": "NÃO, NÃO HÁ OUTRO USB",
        "to": "shared/survival",
        "desc": "Modo sobrevivência: outros jeitos de tocar hoje."
      }
    ]
  },
  "rebuild/copy": {
    "title": "Passo 1: copie os arquivos",
    "status": "Critico · Recuperacao",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Não tire o USB durante a cópia.</strong> Interromper este passo pode causar perda de dados."
      },
      {
        "t": "check",
        "items": [
          "Crie uma pasta nova na área de trabalho.",
          "Copie <strong>só as tracks essenciais</strong> para tocar.",
          "Abra o USB → use a <strong>busca</strong>. Busque por nome do artista ou data de inclusão.",
          "Se um arquivo travar, pule e siga. O que chegar é o seu set."
        ]
      }
    ],
    "label": "Passo 1 de 5",
    "heading": "Copie seus arquivos para este computador",
    "question": "Você copiou tracks suficientes para tocar o set?",
    "step": "copy_files",
    "options": [
      {
        "label": "SIM, COPIADO",
        "to": "rebuild/erase"
      },
      {
        "label": "NÃO, A CÓPIA FALHA",
        "to": "shared/survival",
        "desc": "Este drive não entrega os arquivos hoje. Colocamos você para tocar de outro jeito; a recuperação fica para depois da gig."
      }
    ]
  },
  "rebuild/erase": {
    "title": "Passo 2: prepare o USB",
    "status": "Critico · Recuperacao",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "As tracks de hoje estão seguras no computador. Todo o resto deste pen drive morre no próximo passo."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>O próximo passo vai APAGAR o seu USB.</strong> Isto é irreversível. Só restam as tracks que você copiou para o computador."
      }
    ],
    "label": "Passo 2 de 5",
    "heading": "Prepare o USB",
    "question": "Você está pronto para apagar o USB e continuar?",
    "step": "erase_consent",
    "options": [
      {
        "label": "SIM, APAGAR E CONTINUAR",
        "to": "rebuild/format",
        // Same as rebuild/risk: green on the pad that erases the drive told
        // a DJ pattern-matching on colour that this was the safe answer.
        // Amber: it costs you, and you have chosen it.
        "tone": "amber"
      },
      {
        "label": "NÃO, PARAR AQUI",
        "to": "rebuild/no-erase",
        // Same: stopping before an erase is legitimate, not failure.
        "tone": "amber"
      }
    ]
  },
  "rebuild/format": {
    "title": "Passo 3: formate o USB",
    "status": "Critico · Recuperacao",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Isto apaga o drive por completo.</strong> É a única exceção à regra de nunca formatar, e só é seguro porque as tracks de hoje já estão no computador. Confirme o nome e o tamanho do disco antes de tocar em qualquer coisa, formatar o disco errado não tem volta."
      },
      {
        "t": "check",
        "items": [
          "Botão direito no drive USB → <strong>Formatar</strong> (ou Utilitário de Disco no Mac).",
          "O Windows só oferece FAT32 até 32GB nessa janela. Pen drive maior: use a ferramenta gratuita <strong>guiformat</strong>, dois minutos.",
          "Formato: <span class=\"mono\">FAT32</span>, não exFAT, não NTFS. CDJs mais antigos recusam exFAT.",
          "Nome: <span class=\"mono\">SAVEMYGIG</span> (ou o que você preferir)",
          "Formatação rápida: OK",
          "Esquema: <span class=\"mono\">Master Boot Record (MBR)</span>"
        ]
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Não tire o USB durante a formatação.</strong>"
      }
    ],
    "label": "Passo 3 de 5",
    "heading": "Formatação do USB",
    "question": "O USB foi formatado com sucesso?",
    "step": "format",
    "options": [
      {
        "label": "SIM, USB FORMATADO",
        "to": "rebuild/copy-back"
      },
      {
        "label": "NÃO, A FORMATAÇÃO FALHA",
        "to": "rebuild/no-erase",
        "desc": "O drive acabou, e isso já não importa: seu set está no computador. Qualquer outro pen drive termina o serviço."
      }
    ]
  },
  "rebuild/copy-back": {
    "title": "Passo 4: copie a música de volta",
    "status": "Critico · Recuperacao",
    "red": true,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Não tire o USB durante a cópia.</strong> Interromper este passo pode causar perda de dados."
      },
      {
        "t": "dim",
        "html": "Só o que você precisa para tocar hoje."
      }
    ],
    "label": "Passo 4 de 5",
    "heading": "Copie a música de volta para o USB",
    "question": "As tracks já estão no USB?",
    "step": "copy_back",
    "options": [
      {
        "label": "SIM, TRACKS NO USB",
        "to": "rebuild/load"
      },
      {
        "label": "NÃO, A CÓPIA FALHA",
        "to": "rebuild/fallback"
      }
    ]
  },
  "rebuild/load": {
    "title": "Passo 5: carregue no player",
    "status": "Critico · Recuperacao",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "No CDJ/XDJ, pressione <span class=\"mono\">SOURCE</span>",
          "Selecione <span class=\"mono\">USB</span>",
          "Vá em <span class=\"mono\">FOLDER</span>",
          "Carregue as tracks da pasta que você copiou."
        ]
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "Estas tracks <strong>não foram exportadas pelo rekordbox</strong>, então alguns recursos podem ficar limitados (Quantize, Sync, Hot Cues). Isso é normal. <strong>Você ainda toca o seu set.</strong>"
      }
    ],
    "label": "Passo 5 de 5",
    "heading": "Carregue a música no player",
    "question": "Você consegue carregar e tocar as tracks no CDJ?",
    "step": "load",
    "options": [
      {
        "label": "SIM, ESTOU TOCANDO",
        "to": "/saved?path=critical&branch=laptop",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NÃO, AINDA NÃO TOCA",
        "to": "rebuild/fallback"
      }
    ]
  },
  "rebuild/fallback": {
    "title": "Últimas opções",
    "status": "Critico · Ultimo recurso",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "<strong>Refaça a formatação uma vez</strong>, escolhendo <span class=\"mono\">FAT32</span> explicitamente (não exFAT) e <span class=\"mono\">MBR</span>. Drive em GPT é causa comum de \"formatado mas ilegível\"."
        ]
      }
    ],
    "draft": true,
    "label": "Último recurso",
    "heading": "Falta uma coisa antes do modo sobrevivência",
    "question": "Está lendo agora?",
    "step": "fallback",
    "options": [
      {
        "label": "SIM, ESTÁ LENDO",
        "to": "/saved?path=critical&branch=fallback",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NÃO, MODO SOBREVIVÊNCIA",
        "to": "shared/survival"
      }
    ]
  },
  "sound/start": {
    "title": "Sem som",
    "status": "Sem_Som",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Não há nada quebrado no seu drive. Algo não está passando o sinal."
      }
    ],
    "heading": "Sua música está bem. Isto é roteamento.",
    "question": "Onde está faltando som?",
    "step": "ns_entry",
    // SEVERITY, NOT SYMMETRY (Antonio, 2026-08-03). These four were all grey,
    // which said the four are equally bad. They are not: exactly one of them
    // means the room is silent. Red is reserved for that one.
    "options": [
      {
        "label": "UM CANAL, OS OUTROS OK",
        "to": "sound/channel",
        "desc": "Um deck mudo, o resto do mixer vivo.",
        // You still have a working deck to mix on.
        "tone": "amber"
      },
      {
        "label": "SILÊNCIO TOTAL",
        "to": "sound/master",
        "desc": "Não sai nada do mixer.",
        // The only one where the room has no music. This is the red level.
        "tone": "red"
      },
      {
        "label": "SEM CUE NO FONE",
        "to": "sound/phones",
        "desc": "A pista está bem, você só não consegue pré-escutar.",
        // Green under the time-pressure rule, not amber. Its own description
        // says the room is fine. The crowd cannot tell, nothing is at risk,
        // and the DJ can fix this between tracks. Colouring it amber would
        // have told a DJ to hurry over something nobody else can hear.
        "tone": "green"
      },
      {
        "label": "TEM SOM, MAS ERRADO",
        "to": "sound/thin",
        "desc": "Fino, baixo, distorcido ou de um lado só.",
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
    "title": "Zere o canal",
    "status": "Sem_Som · Qualidade",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Fino, sem grave, sem peso? Quase sempre são os ajustes do DJ anterior ainda na mesa, não um defeito. Cinco segundos."
      },
      {
        "t": "check",
        "items": [
          "Gire os <strong>EQ</strong> do canal para o meio. Todo à esquerda não é mudo, mas chega perto: o DJM-900NXS2 corta até -26 dB no modo EQ.",
          "Ache o <strong>isolator</strong> e deixe ele reto. No 900NXS2 é a chave EQ CURVE; o V10 tem um isolator master de 3 bandas separado.",
          "Fino na booth mas certo na pista? É o <strong>booth EQ</strong>, um segundo EQ só no caminho do monitor. A pista nunca ouviu problema nenhum."
        ]
      }
    ],
    "label": "A correção de cinco segundos",
    "heading": "O EQ de outra pessoa ainda está na mesa",
    "question": "Cheio e limpo agora?",
    "step": "ns_thin",
    "options": [
      {
        "label": "SIM, SOA CERTO",
        "to": "/saved?path=no_sound&branch=thin",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, AINDA ERRADO",
        "to": "sound/wrong",
        "desc": "Então vamos atrás: conectores, trim, cabo."
      }
    ]
  },
  "sound/channel": {
    "title": "Canal mudo",
    "status": "Sem_Som · Canal",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Leve o crossfader todo para o lado oposto ao seu canal, e volte.",
          "Ache o <strong>ASSIGN</strong> do crossfader daquele canal (A / B / THRU). Coloque em <strong>THRU</strong>."
        ]
      },
      {
        "t": "note",
        "html": "Não acha chave ASSIGN nenhuma? Alguns mixers não têm crossfader (DJM-V10-LF, DJM-V5, mixers rotativos). Neles todo canal já se comporta como THRU, então não é isso. Siga em frente."
      }
    ],
    "label": "Verifique isto primeiro",
    "heading": "Verifique o crossfader",
    "question": "O som voltou?",
    "step": "ns_channel",
    "options": [
      {
        "label": "SIM, ESTÁ TOCANDO",
        "to": "/saved?path=no_sound&branch=crossfader",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, AINDA MUDO",
        "to": "sound/channel-2"
      }
    ]
  },
  "sound/channel-2": {
    "title": "O canal inteiro",
    "status": "Sem_Som · Canal",
    "red": true,
    "blocks": [
      {
        "t": "assumed",
        "html": "Fader levantado é dado como feito. Ninguém chega ao passo dois de um canal mudo com o fader abaixado."
      },
      {
        "t": "check",
        "items": [
          "<strong>TRIM / GAIN</strong> no meio.",
          "<strong>COLOR FX desligado, FILTER no meio.</strong> Um filtro deixado em qualquer extremo pelo DJ anterior emudece o canal com todo o resto parecendo certo."
        ]
      }
    ],
    "label": "De cima a baixo",
    "heading": "Percorra o canal inteiro",
    "question": "Tem som agora?",
    "step": "ns_channel2",
    "options": [
      {
        "label": "SIM, ESTÁ TOCANDO",
        "to": "/saved?path=no_sound&branch=channel_strip",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, AINDA MUDO",
        "to": "sound/channel-3"
      }
    ]
  },
  "sound/channel-3": {
    "title": "Fonte de entrada",
    "status": "Sem_Som · Canal",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Ache o <strong>seletor de fonte</strong> no topo do canal (USB / DIGITAL / LINE / PHONO).",
          "Coloque na entrada de onde a sua música realmente vem.",
          "Ainda nada? Passe sua fonte para um canal que funciona e toque de lá."
        ]
      }
    ],
    "label": "A entrada",
    "heading": "Verifique a fonte de entrada",
    "question": "Você está tocando em algum canal agora?",
    "step": "ns_channel3",
    "options": [
      {
        "label": "SIM, ESTOU NO AR",
        "to": "/saved?path=no_sound&branch=source",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, NADA AINDA",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/master": {
    "title": "Não sai nada",
    "status": "Sem_Som · Master",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Suba o <strong>MASTER</strong> até o meio. Suba o <strong>BOOTH</strong> também.",
          "Confirme que nada está mudo e que nada está plugado no <strong>master insert</strong>."
        ]
      },
      {
        "t": "details",
        "summary": "O que é o master insert",
        "html": "<p> Um ponto de conexão na traseira do mixer onde um processador externo entra no sinal do master. Se há um cabo plugado e nada devolve áudio, o master fica mudo com todos os faders levantados. Se tem algo plugado ali, quase certamente é da casa: pergunte antes de tirar. <br /><br /> O que dizer para o técnico: <strong>\"Tem algo plugado no master insert. Está em uso, ou é equipamento morto que eu posso tirar?\"</strong> </p>"
      }
    ],
    "label": "O master",
    "heading": "Verifique o master",
    "question": "Tem som na pista?",
    "step": "ns_master",
    "options": [
      {
        "label": "SIM, ESTÁ TOCANDO",
        "to": "/saved?path=no_sound&branch=master",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, AINDA MUDO",
        "to": "sound/master-2"
      }
    ]
  },
  "sound/master-2": {
    "title": "Siga o cabo",
    "status": "Sem_Som · Master",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "<strong>Abaixe o fader master antes de encostar em qualquer conector.</strong> Suba depois. Plugar com o PA ligado manda um estouro em volume cheio e pode queimar alto-falantes.",
          "Reencaixe os cabos de saída do master, nas duas pontas.",
          "Troque o par do master pelo par da <strong>saída booth</strong> se os plugues encaixarem (na maioria dos DJMs a booth out é um par de P10, então cabos XLR da casa precisam de adaptador).",
          "Amplificadores ligados? Na maioria das casas o rack não fica na booth, então isso costuma ser pergunta para outra pessoa, não algo que você verifica."
        ]
      },
      {
        "t": "details",
        "summary": "O que dizer para quem opera o som",
        "html": "<p> <strong>\"Meu master está aberto e os medidores estão se mexendo. Alguém confirma se os amplificadores estão ligados?\"</strong> <br /><br /> Citar os medidores faz diferença. É o que separa um pedido que eles precisam investigar de um que eles respondem na hora. </p>"
      }
    ],
    "label": "Saindo do mixer",
    "heading": "Siga o cabo para fora",
    "question": "Tem som agora?",
    "step": "ns_master2",
    "options": [
      {
        "label": "SIM, ESTÁ TOCANDO",
        "to": "/saved?path=no_sound&branch=cable",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, AINDA MUDO",
        "to": "sound/house"
      }
    ]
  },
  "sound/house": {
    "title": "Chame o técnico da casa",
    "status": "Sem_Som · Casa",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Agora é a cadeia de sinal da casa, não o seu equipamento.",
          "Fale exatamente isto: <strong>\"O master do mixer está aberto e os medidores estão se mexendo. Não sai nada depois da saída da booth.\"</strong>",
          "Enquanto eles trabalham: mantenha seu set cueado e pronto para entrar."
        ]
      },
      {
        "t": "assumed",
        "html": "Se quem lê isto é o técnico: o DJ já passou por canal, assign do crossfader, seleção de fonte, trim, nível de master, master insert e os cabos de saída do lado do mixer. O mixer está passando sinal."
      },
      {
        "t": "note",
        "html": "Uma pista em silêncio pelo lado da casa não é falha sua. Fique pronto."
      }
    ],
    "label": "Não é o seu equipamento",
    "heading": "Chame o técnico da casa",
    "question": "A casa trouxe o som de volta?",
    "step": "ns_house",
    "options": [
      {
        "label": "SIM, ESTOU NO AR",
        "to": "/saved?path=no_sound&branch=house",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, NADA AINDA",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/phones": {
    "title": "Sem cue no fone",
    "status": "Sem_Som · Fone",
    "red": true,
    "blocks": [
      {
        "t": "assumed",
        "html": "O CUE está aceso. Foi assim que você chegou aqui."
      },
      {
        "t": "check",
        "items": [
          "<strong>MIX</strong> do fone todo em CUE, não em MASTER.",
          "<strong>LEVEL</strong> do fone na metade."
        ]
      }
    ],
    "label": "Primeiro o cue",
    "heading": "Verifique o cue, não o conector",
    "question": "Está ouvindo agora?",
    "step": "ns_phones",
    "options": [
      {
        "label": "SIM, ESTOU OUVINDO",
        "to": "/saved?path=no_sound&branch=cue",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, NADA AINDA",
        "to": "sound/phones-2"
      }
    ]
  },
  "sound/phones-2": {
    "title": "O conector do fone",
    "status": "Sem_Som · Fone",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Empurre o plugue até o fim. Meio encaixado é o clássico.",
          "Use a outra entrada de fone, se o mixer tiver mais de uma.",
          "Rosqueie o adaptador por completo, ou teste o fone de outra pessoa."
        ]
      },
      {
        "t": "note",
        "html": "Dá para mixar sem cue se precisar. Transições longas, tracks que você conhece."
      }
    ],
    "label": "Agora o conector",
    "heading": "Agora o conector",
    "question": "Está ouvindo agora?",
    "step": "ns_phones2",
    "options": [
      {
        "label": "SIM, ESTOU OUVINDO",
        "to": "/saved?path=no_sound&branch=jack",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, NADA AINDA",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/wrong": {
    "title": "Tem som, mas errado",
    "status": "Sem_Som · Qualidade",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "<strong>Abaixe o fader master antes de encostar em qualquer conector.</strong> Suba depois. A pista está tocando, e plugar com o PA ligado pode queimar alto-falantes.",
          "Reencaixe todos os conectores do caminho. Meio encaixado causa som de um lado só.",
          "Ajuste o <strong>TRIM</strong> para o medidor do canal picar no laranja, nunca no vermelho.",
          "Troque o cabo suspeito. Cabo falha mais do que equipamento."
        ]
      }
    ],
    "label": "Baixo, distorcido ou de um lado só",
    "heading": "Baixo, distorcido ou só de um lado",
    "question": "Limpo agora?",
    "step": "ns_wrong",
    "options": [
      {
        "label": "SIM, SOA CERTO",
        "to": "/saved?path=no_sound&branch=quality",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, AINDA ERRADO",
        "to": "sound/wrong-2"
      }
    ]
  },
  "sound/wrong-2": {
    "title": "Isole o problema",
    "status": "Sem_Som · Qualidade",
    "red": true,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Passe sua fonte para outro canal. Resolveu? Defeito no canal, fique no novo.",
          "Teste outra saída, booth contra master. Resolveu? Defeito na saída, avise a casa.",
          "Errado em tudo? Defeito na fonte. Outro cabo, outro aparelho."
        ]
      }
    ],
    "label": "30 segundos",
    "heading": "Isole o problema em 30 segundos",
    "question": "Dá para tocar agora?",
    "step": "ns_wrong2",
    "options": [
      {
        "label": "SIM, ESTOU NO AR",
        "to": "/saved?path=no_sound&branch=isolate",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "no_sound"
        }
      },
      {
        "label": "NÃO, AINDA ERRADO",
        "to": "sound/fallback"
      }
    ]
  },
  "sound/fallback": {
    "title": "Modo sobrevivência: som",
    "status": "Sem_Som · Sobrevivencia",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Pare de diagnosticar. Qualquer coisa que faça som quando for a sua vez."
      },
      {
        "t": "check",
        "items": [
          "Passe tudo para um canal que você sabe que funciona, mesmo dividindo com alguém.",
          "Pergunte ao DJ antes ou depois de você. Ele conhece as manias deste mixer.",
          "Peça ao técnico de som qualquer entrada livre, um celular num canal de linha já conta.",
          "Mantenha a pista no player que ainda funciona. Um deck só não mixa, então isso ganha tempo, não entrega um set.",
          "No PRO DJ LINK, carregue suas tracks do USB que ainda está no player morto."
        ]
      }
    ],
    "label": "Pare de diagnosticar",
    "heading": "Tire som das caixas",
    "question": "Você achou um jeito de tocar?",
    "step": "ns_fallback",
    "options": [
      {
        "label": "SIM, ESTOU COBERTO",
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
        "label": "NÃO, ACABARAM AS OPÇÕES",
        "to": "/feedback?from=no_sound",
        "desc": "Este é o fim do fluxo de falta de som. O que vem a seguir é um formulário, não uma solução: conte o que o mixer estava fazendo e nós construímos a resposta para o próximo DJ.",
        "event": "outcome_reached",
        "data": {
          "outcome": "handoff",
          "path": "no_sound"
        }
      }
    ]
  },
  "export/start": {
    "title": "O export do rekordbox falhou",
    "status": "Correcao_Export",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "Um export que falhou se conserta no computador, direito, para não falhar de novo na booth. Faltam minutos para tocar e não há computador? Vá pelas soluções de contorno da booth."
      }
    ],
    "draft": true,
    "heading": "RESGATE DO <span class=\"accent\">EXPORT</span>",
    "question": "Você tem acesso a um computador com rekordbox?",
    "step": "qf_computer",
    "options": [
      // Three options now, so every one carries an explicit tone: past two
      // the renderer falls back to neutral and the colour would say nothing.
      {
        "label": "SIM, COM rekordbox",
        "to": "export/usb-check",
        // Green: a computer with rekordbox means you have the time and the
        // tools to fix this properly.
        "tone": "green"
      },
      {
        "label": "NÃO, AGORA NÃO",
        "to": "export/find",
        // No computer yet: slower path, still a path.
        "tone": "amber"
      },
      {
        "label": "ENTRO EM MINUTOS",
        "to": "usb/moves",
        "desc": "Pule o reparo. Direto para as soluções de contorno da booth.",
        // Red: the paragraph above offered this route and no pad did it, so
        // a DJ read an instruction with no control. Red is the time reading,
        // not the severity one: you are on in minutes, so move now.
        "tone": "red"
      }
    ]
  },
  "export/find": {
    "title": "Ache um computador",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "Um conserto de verdade precisa do rekordbox. Você tem tempo para achar um:"
      },
      {
        "t": "check",
        "items": [
          "Seu próprio notebook em casa ou no carro?",
          "Outro DJ do line-up com rekordbox instalado.",
          "O computador do escritório da casa ou do produtor (o rekordbox é download gratuito)."
        ]
      }
    ],
    "draft": true,
    "label": "Passo 0",
    "heading": "Você tem tempo, use para achar um computador",
    "question": "Você conseguiu um computador?",
    "step": "qf_find_computer",
    "options": [
      {
        "label": "SIM, CONSEGUI",
        "to": "export/usb-check"
      },
      {
        "label": "NÃO, IR PARA OS CONTORNOS",
        "to": "usb/moves",
        "desc": "Sem computador não há conserto de verdade. Usamos a rota crítica para colocar você tocando.",
        // Giving up the repair for workarounds is a trade, not a loss.
        "tone": "amber"
      }
    ]
  },
  "export/usb-check": {
    "title": "Resgate do export: teste do USB",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Assim que o drive montar, o computador pode oferecer formatar ou inicializar. Diga NÃO.</strong> No Mac o botão se chama \"Inicializar…\" (\"Initialize…\") e abre o Utilitário de Disco, a um passo de apagar o drive. Nada foi perdido ainda. Escolha Ignorar ou Ejetar, e responda abaixo."
      }
    ],
    "draft": true,
    "label": "Passo 1",
    "heading": "Teste o USB no computador",
    "question": "Conecte o USB no computador. O que acontece?",
    "step": "qf_usb_check",
    "options": [
      {
        "label": "VEJO MEUS ARQUIVOS",
        "to": "export/backup"
      },
      {
        "label": "NADA / MENSAGEM DE ERRO",
        "to": "export/dead-checks"
      }
    ]
  },
  "export/dead-checks": {
    "title": "Testes no drive",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Outra porta USB, conectado <strong>direto</strong> (sem hub).",
          "Outro computador, se houver um por perto.",
          "Se perguntar \"deseja formatar?\", <strong>diga NÃO.</strong> Seus arquivos continuam lá."
        ]
      }
    ],
    "draft": true,
    "label": "Passo 1b",
    "heading": "O computador não enxerga. Testes rápidos:",
    "question": "Algum computador enxerga os arquivos agora?",
    "step": "qf_dead_checks",
    "options": [
      {
        "label": "SIM, ARQUIVOS VISÍVEIS",
        "to": "export/backup"
      },
      {
        "label": "NÃO, O DRIVE SEGUE MORTO",
        "to": "export/fresh",
        "desc": "Montamos o USB de hoje em outro drive. A recuperação deste fica para depois da gig."
      }
    ]
  },
  "export/backup": {
    "title": "Backup primeiro",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "Tudo daqui para frente pode terminar em formatação. <strong>Copie sua música para fora antes.</strong>"
      },
      {
        "t": "check",
        "items": [
          "Copie o drive inteiro para o computador. No mínimo a pasta <strong>Contents</strong>, que salva o áudio mas não as playlists, cues ou grids: você acabaria garimpando pastas de artista e álbum para achar uma track.",
          "Se alguns arquivos falharem, copie o que der e anote quais foram. Arquivo pulado some de vez se este drive for formatado depois, então se algum deles importa, vá pela rota do drive novo e mantenha este intacto.",
          "Enquanto copia: abra o rekordbox, seletor de modo no canto superior esquerdo em <span class=\"mono\">EXPORT</span>. Se o seu USB aparecer em <strong>Devices</strong>, a próxima tela o atualiza; se nunca aparecer, diga isso na próxima tela e reconstruímos do zero."
        ]
      }
    ],
    "draft": true,
    "label": "Passo 2",
    "heading": "Cópia de segurança antes da reconstrução",
    "question": "A cópia terminou?",
    "step": "qf_backup",
    "options": [
      {
        "label": "SIM, MÚSICA SEGURA",
        "to": "export/repair"
      },
      {
        "label": "NÃO, A CÓPIA FALHA",
        "to": "export/fresh",
        "desc": "O drive está falhando. Montamos a gig de hoje em outro."
      }
    ]
  },
  "export/repair": {
    "title": "Repare o dispositivo",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Confira sua Collection antes.</strong> Se este computador é emprestado ou da casa e a Collection está vazia, NÃO apague nada. Não haveria o que repor. Use a música que você acabou de copiar."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Apagar as playlists do dispositivo apaga junto os cues e grids de hoje.</strong> O backup de dois passos atrás salvou só o áudio. A sua Collection neste computador ainda guarda os cues e grids, e o drive recebe eles de volta quando o novo sync terminar. Entre esses dois momentos, eles existem em um lugar só."
      },
      {
        "t": "check",
        "items": [
          "No rekordbox, no <strong>dispositivo</strong>: apague as playlists de hoje.",
          "Arraste as playlists de hoje da sua collection para o dispositivo de novo (sync do zero).",
          "Espere o sync terminar por completo.",
          "Ejete pelo <strong>botão de ejetar do rekordbox</strong>, nunca arranque o drive."
        ]
      }
    ],
    "draft": true,
    "label": "Passo 3",
    "heading": "Refaça o export",
    "question": "O sync terminou sem erros?",
    "step": "qf_repair",
    "options": [
      {
        "label": "SIM, SYNC CONCLUÍDO",
        "to": "export/verify"
      },
      {
        "label": "NÃO, ERROS OU SEM DISPOSITIVO",
        "to": "export/errors"
      }
    ]
  },
  "export/errors": {
    "title": "Leia o erro",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "Dez segundos aqui evitam uma formatação inútil. Os erros de sync se dividem em duas famílias e só uma delas é culpa do drive."
      }
    ],
    "draft": true,
    "label": "Passo 3b",
    "heading": "Do que o rekordbox está reclamando?",
    "question": "Como são os erros?",
    "step": "qf_errors",
    "options": [
      {
        "label": "ARQUIVOS NÃO ENCONTRADOS",
        "to": "export/export",
        "desc": "É a biblioteca, não o drive. Importe a pasta do backup e exporte de novo. Sem formatar.",
        // Symptom split: both answers just name the problem.
        "tone": "amber"
      },
      {
        "label": "ERROS DE DISPOSITIVO OU ESCRITA",
        "to": "export/erase",
        "desc": "Então o suspeito é o drive, e reconstruímos ele do zero.",
        // Same split, other family.
        "tone": "amber"
      }
    ]
  },
  "export/erase": {
    "title": "Prepare para formatar",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "dim",
        "html": "A cópia de segurança do passo de backup é o que torna isto sobrevivível."
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>O próximo passo APAGA este USB por completo.</strong> Tudo que não copiou antes some de vez. Se algum desses arquivos importa, pare aqui e vá pela rota do drive novo."
      }
    ],
    "draft": true,
    "label": "Passo 3c",
    "heading": "Prepare o USB",
    "question": "Você está pronto para apagar este USB e continuar?",
    "step": "qf_erase_consent",
    "options": [
      {
        "label": "SIM, APAGAR E CONTINUAR",
        "to": "export/format",
        // Third consent screen, same correction. The alert above says
        // anything that failed to copy is gone for good; a green pad under
        // that sentence contradicts it. Amber: chosen, and it costs you.
        "tone": "amber"
      },
      {
        "label": "NÃO, MANTER ESTE DRIVE",
        "to": "export/fresh",
        "desc": "Montamos a gig de hoje em outro drive.",
        // Keeping the drive intact has a real route. Caution, not danger.
        "tone": "amber"
      }
    ]
  },
  "export/format": {
    "title": "Formatação limpa",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Isto apaga o drive por completo.</strong> Tudo que só existe neste drive some. Se algum arquivo falhou na cópia antes, ele não volta depois deste passo."
      },
      {
        "t": "check",
        "items": [
          "Confirme que está no disco certo: veja o nome e o tamanho antes de tocar em qualquer coisa.",
          "Formate o <em>dispositivo</em>, não o volume. No Mac: Utilitário de Disco, Visualizar, Mostrar Todos os Dispositivos.",
          "Drive maior que 32GB no Windows? A janela padrão não oferece FAT32. Use a ferramenta gratuita <strong>guiformat</strong> e volte para cá.",
          "Formato: <span class=\"mono\">FAT32</span> · Esquema: <span class=\"mono\">MBR</span> · Formatação rápida OK."
        ]
      }
    ],
    "draft": true,
    "label": "Passo 4",
    "heading": "Formate o USB do zero",
    "question": "Formatou com sucesso?",
    "step": "qf_format",
    "options": [
      {
        "label": "SIM, LIMPO E VAZIO",
        "to": "export/export"
      },
      {
        "label": "NÃO, A FORMATAÇÃO FALHA",
        "to": "export/fresh",
        "desc": "Se a janela não ofereceu FAT32 num drive grande, use o guiformat primeiro. Se a formatação em si falha, o drive acabou e a gente monta em outro."
      }
    ]
  },
  "export/export": {
    "title": "Export novo",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "rekordbox em modo <span class=\"mono\">EXPORT</span>, USB conectado.",
          "Arraste <strong>só as playlists de hoje</strong> para o dispositivo. Export pequeno = rápido e confiável.",
          "Sem biblioteca do rekordbox neste computador? Importe primeiro a pasta de música do backup, depois exporte.",
          "Espere o sync completo, depois ejete pelo botão de ejetar do rekordbox."
        ]
      }
    ],
    "draft": true,
    "label": "Passo 5",
    "heading": "Exporte a música de hoje pelo rekordbox",
    "question": "O export terminou sem erros?",
    "step": "qf_export",
    "options": [
      {
        "label": "SIM, EXPORT CONCLUÍDO",
        "to": "export/verify"
      },
      {
        "label": "NÃO, O EXPORT FALHA",
        "to": "export/fresh"
      }
    ]
  },
  "export/fresh": {
    "title": "Drive novo",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Consiga <strong>qualquer outro drive USB</strong>. O seu reserva, o de outro DJ, o da casa."
        ]
      },
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "<strong>Se este drive é emprestado, pare e confirme com o dono.</strong> O próximo passo apaga tudo. A biblioteca de outra pessoa não é descartável, e ela pode não saber que você está prestes a formatar."
      },
      {
        "t": "check",
        "items": [
          "Quando tiver certeza de que o drive está vazio ou é descartável, formate: <span class=\"mono\">FAT32</span> + <span class=\"mono\">MBR</span>.",
          "Exporte as playlists de hoje pelo rekordbox, ou copie os arquivos de música do backup.",
          "Verifique: ejete, conecte de novo, tudo carrega."
        ]
      }
    ],
    "draft": true,
    "label": "Plano B",
    "heading": "Monte a gig de hoje em outro drive",
    "question": "O drive novo está funcionando?",
    "step": "qf_fresh_usb",
    "options": [
      {
        "label": "SIM, ESTOU DE VOLTA",
        "to": "/saved?path=quick_fix&branch=fresh_usb",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "quick_fix"
        }
      },
      {
        "label": "NÃO, ACABOU O TEMPO",
        "to": "usb/moves",
        "desc": "Mude para a rota crítica: contornos e modo sobrevivência."
      }
    ]
  },
  "export/verify": {
    "title": "Verifique",
    "status": "Correcao_Rapida",
    "red": false,
    "blocks": [
      {
        "t": "check",
        "items": [
          "Tire o USB, espere 5 segundos, conecte de novo.",
          "Abra no rekordbox: o dispositivo carrega, as playlists estão intactas.",
          "Se der para chegar em um player antes do seu set: teste lá também (<span class=\"mono\">SOURCE → USB</span>)."
        ]
      }
    ],
    "draft": true,
    "label": "Passo final",
    "heading": "Verifique antes de confiar",
    "question": "Tudo carrega corretamente?",
    "step": "qf_verify",
    "options": [
      {
        "label": "SIM, TUDO CARREGA",
        "to": "/saved?path=quick_fix",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "quick_fix"
        }
      },
      {
        "label": "NÃO, AINDA QUEBRADO",
        "to": "export/fresh"
      }
    ]
  },
  "usb/start": {
    "title": "USB não reconhecido",
    "status": "Rota_Critica",
    "red": true,
    "label": "Diagnóstico",
    "heading": "O player não enxerga o drive",
    "blocks": [
      {
        "t": "assumed",
        "html": "Você já reencaixou e já testou o outro deck."
      }
    ],
    "question": "Algum outro player da booth lê o drive?",
    "step": "usb_start",
    "options": [
      {
        "label": "SIM, OUTRO PLAYER LÊ",
        "to": "usb/link",
        "desc": "Então você pode estar tocando em menos de um minuto."
      },
      {
        "label": "NÃO, NENHUM LÊ",
        "to": "usb/moves",
        "desc": "As quatro jogadas. Uma lista, não perguntas."
      }
    ]
  },
  "usb/link": {
    "title": "Toque pelo LINK",
    "status": "Critico · Solucao mais rapida",
    "red": true,
    "label": "Tente isto primeiro",
    "heading": "Carregue do player que enxerga",
    "blocks": [
      {
        "t": "dim",
        "html": "Se a booth está em rede pelo PRO DJ LINK, qualquer player pode navegar e carregar de um drive que está fisicamente em outro. A sua porta morta deixa de importar."
      },
      {
        "t": "check",
        "items": [
          "Pressione <strong>SOURCE</strong> no player em que você quer tocar.",
          "Selecione o USB do outro player (o dispositivo LINK / remoto).",
          "Navegue e carregue sua track de lá."
        ]
      }
    ],
    "question": "Carregou?",
    "step": "usb_link",
    "options": [
      {
        "label": "SIM, ESTOU TOCANDO",
        "to": "/saved?path=critical&branch=link",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NÃO, NADA AINDA",
        "to": "usb/moves",
        "desc": "As quatro jogadas. Uma lista, não perguntas."
      }
    ]
  },
  "usb/moves": {
    "title": "As quatro jogadas",
    "status": "Critico · Faca agora",
    "red": true,
    "srHeading": "Quatro jogadas, em ordem, até tocar",
    "heading": "Quatro jogadas que você não tentou.",
    "moves": true,
    "blocks": [],
    "step": "runlist",
    "options": [
      {
        "label": "ESTOU TOCANDO",
        "to": "/saved?path=critical&branch=runlist",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "critical"
        }
      },
      {
        "label": "NADA FUNCIONOU, E TENHO TEMPO",
        "to": "usb/computer",
        "desc": "Diagnóstico passo a passo, uma pergunta por vez.",
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
    "title": "Você tem um computador?",
    "status": "Rota_Critica",
    "red": true,
    "blocks": [
      {
        "t": "dim",
        "html": "Você já fez as jogadas da booth, então não repetimos. Com um computador consertamos o drive; sem ele, colocamos você tocando de outro jeito."
      }
    ],
    "label": "Ponto de decisão",
    "heading": "Objetivo agora: tocar o set.",
    "question": "Você tem um computador agora?",
    "step": "usb_fork_computer",
    "options": [
      {
        "label": "SIM, TENHO COMPUTADOR",
        "to": "shared/usb-check"
      },
      {
        "label": "SEM COMPUTADOR",
        "to": "shared/survival",
        "desc": "As jogadas da booth já foram. Direto para os outros jeitos de tocar."
      }
    ]
  },
  "frozen/start": {
    "title": "Player travado",
    "status": "Rota_Critica",
    "red": true,
    "label": "Diagnóstico",
    "heading": "Tela travada nem sempre é áudio travado",
    "blocks": [
      {
        "t": "dim",
        "html": "Se uma track estava tocando quando ele travou, ela costuma seguir tocando. Não se mexe em nada até a pista estar coberta."
      }
    ],
    "question": "O player travado está no ar na mixagem agora?",
    "step": "frozen_start",
    "neutral": true,
    "options": [
      {
        "label": "ELE ESTÁ TOCANDO NA PISTA",
        "to": "frozen/live",
        "desc": "Primeiro passamos a pista, depois reiniciamos.",
        // Amber, not red: the room still HAS music. What you have lost is
        // your freedom to act, because the deck you would restart is the
        // one the crowd is hearing, and the track has an end.
        "tone": "amber"
      },
      {
        "label": "ESTÁ PARADO, FORA DA MIX",
        "to": "frozen/restart",
        "desc": "Então dá para reiniciar sem risco.",
        // Green. Its own description says "without risk", which is the
        // definition of the green level.
        "tone": "green"
      }
    ]
  },
  "frozen/live": {
    "title": "Mantenha a pista tocando",
    "status": "Critico · Deck no ar",
    "red": true,
    "label": "Passo 1 de 2",
    "heading": "Passe a música para outro deck primeiro",
    "blocks": [
      {
        "t": "dim",
        "html": "O player travado segue tocando por enquanto. O reinício só acontece quando ele não estiver mais sustentando a pista."
      },
      {
        "t": "check",
        "items": [
          "Não encoste no player travado. Nenhum botão, nenhum USB, nenhuma tomada.",
          "Prepare a próxima track em outro player: com o drive dele, ou com o seu drive pelo <strong>PRO DJ LINK</strong> se a rede ainda responder.",
          "Assuma a mixagem pelo deck que funciona."
        ]
      }
    ],
    "question": "Outro deck está sustentando a pista?",
    "step": "frozen_live",
    "options": [
      {
        "label": "SIM, ESTOU COBERTO",
        "to": "frozen/restart",
        "desc": "Agora o player travado pode ser reiniciado com segurança."
      },
      {
        "label": "NÃO, NADA MAIS TOCA",
        "to": "shared/survival",
        "desc": "Outros jeitos de manter som na pista."
      }
    ]
  },
  "frozen/restart": {
    "title": "Reinicie o player",
    "status": "Critico · Reinicio",
    "red": true,
    "label": "O reinício",
    "heading": "Desligue e ligue direito",
    "blocks": [
      {
        "t": "alert",
        "emoji": "⚠️",
        "html": "Só reinicie um player que não está sustentando a pista. Se ele ainda está tocando, volte e passe a pista para outro deck primeiro."
      },
      {
        "t": "check",
        "items": [
          "Pressione <strong>USB STOP</strong> se ele responder, e espere a luz parar de piscar.",
          "Desligue. Espere vinte segundos.",
          "Ligue e deixe iniciar por completo antes de encostar em nada.",
          "Recoloque o drive e dê trinta segundos. Biblioteca grande monta devagar. Se o player travou enquanto você navegava, teste o drive em outro deck antes: um banco de dados corrompido pode travar ele de novo."
        ]
      }
    ],
    "question": "O player voltou e está lendo o seu drive?",
    "step": "frozen_restart",
    "options": [
      {
        "label": "SIM, ESTOU TOCANDO",
        "to": "/saved?path=frozen&branch=restart",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "frozen"
        }
      },
      {
        "label": "NÃO, TRAVADO OU SEM LER",
        "to": "frozen/link"
      }
    ]
  },
  "frozen/link": {
    "title": "Tire ele da rede",
    "status": "Critico · Link",
    "red": true,
    "label": "Último isolamento",
    "heading": "Isole ele da booth",
    "blocks": [
      {
        "t": "dim",
        "html": "Quando mais de um player dá problema ao mesmo tempo, a rede LINK é suspeita. Um player que trava na rede pode rodar bem sozinho."
      },
      {
        "t": "check",
        "items": [
          "Desconecte o cabo <strong>LINK</strong> só do player travado. Não mexa no resto da booth.",
          "Reinicie mais uma vez, fora da rede.",
          "Toque pela porta USB dele mesmo."
        ]
      }
    ],
    "question": "Está tocando em algum deck agora?",
    "step": "frozen_link",
    "options": [
      {
        "label": "SIM, ESTOU TOCANDO",
        "to": "/saved?path=frozen&branch=isolate",
        "event": "outcome_reached",
        "data": {
          "outcome": "saved",
          "path": "frozen"
        }
      },
      {
        "label": "NÃO, NADA AINDA",
        "to": "shared/survival",
        "desc": "Colocamos você para tocar de outro jeito."
      }
    ]
  }
};
