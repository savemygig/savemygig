/**
 * UI CHROME STRINGS. Nav, footer, and the labels the LAYOUT owns.
 *
 * WHY THIS FILE EXISTS BUT PAGE CONTENT DOES NOT LIVE IN ONE LIKE IT.
 * Chrome is a fixed vocabulary of short, repeated labels: the same eight nav
 * items on 55 pages. That is exactly what a key-value catalogue is for, and
 * duplicating the header markup three times would guarantee drift.
 *
 * Page PROSE is the opposite case and deliberately lives in per-language page
 * files instead. Antonio's brief: "Do not perform a literal translation.
 * Translate with intelligence. The goal is for each language to read as if it
 * were originally written in that language." A catalogue keyed to English
 * sentences quietly forbids that, because it forces one translated string per
 * English string: no merging two clumsy sentences into one good one, no
 * resequencing a paragraph that lands differently in Portuguese. The
 * catalogue is right for "Checklist" and wrong for the About page.
 *
 * RULE FOR ADDING: if the string is a label the site repeats, it belongs
 * here. If it is a sentence a reader reads, it belongs in the page.
 */

export const UI = {
  en: {
    skip: 'Skip to content',
    home: 'Home',
    nav: {
      checklist: 'Checklist',
      emergency: 'Emergency',
      prepare: 'Prevention',
      recovery: 'Recovery',
      knowledge: 'Knowledge',
      gear: 'Gear',
      about: 'About us',
    },
    aria: {
      brandHome: 'Save My Gig, DJ Booth Intelligence, home',
      search: 'Search Save My Gig',
      openMenu: 'Open menu',
      site: 'Site',
      toTop: 'Back to top',
      instagram: 'Save My Gig on Instagram',
      tiktok: 'Save My Gig on TikTok',
      x: 'Save My Gig on X',
      youtube: 'Save My Gig on YouTube',
    },
    footer: {
      shareLead: 'Every DJ knows a DJ who needs this:',
      copy: 'Copy to paste',
      copied: 'Copied',
      coffee: 'Buy us a coffee',
      colRescue: 'Rescue',
      colPrepare: 'Prepare',
      colMore: 'More',
      install: 'Install as an app',
      emergencyMode: 'Emergency mode',
      dataRecovery: 'Data recovery',
      faq: 'FAQ',
      checklist: 'Checklist',
      prevention: 'Prevention',
      dictionary: 'Dictionary',
      knowledgeBase: 'Knowledge base',
      about: 'About',
      partners: 'Partners',
      legal: 'Legal',
      feedback: 'Feedback',
      builtBy: "Built by DJs who've been there.",
      updated: 'Updated continuously with new gear and solutions.',
    },
    consent: {
      aria: 'Cookie choice',
      head: 'Before you dive in.',
      body: 'Analytics cookies only, so we see which pages help DJs most.',
      policy: 'Cookie policy',
      decline: 'Decline',
      accept: 'Accept',
    },
    cta: {
      stuckH: 'Playing soon and still stuck?',
      stuckP: 'The step-by-step emergency flow asks how long you have and walks you through the fastest route, one decision at a time. Free, no account.',
      stuckBtn: 'Start Emergency Mode',
      preventP: 'Never want to read this page again?',
      preventP2: 'Set up the prevention system once and this page becomes irrelevant.',
      preventBtn: 'See the prevention checklist',
      sticky: 'PLAYING SOON? START EMERGENCY MODE',
    },
    capture: {
      title: 'Keep the Emergency Card',
      blurb: 'We will email you the printable PDF so it is on your phone before the next dark booth. Occasional notes that save gigs. No spam, unsubscribe in one click.',
      emailLabel: 'Your email address',
      placeholder: 'you@email.com',
      submit: 'Register and send it',
      sendTo: 'Send it to ',
      legal: 'Registering is free and counts everywhere on Save My Gig. We send a confirmation email first. Your address is stored with Brevo, our email provider. Unsubscribe any time.',
      privacy: 'Privacy',
    },
    disclaimer: {
      quiet: 'You follow these steps at your own risk.',
      compact: 'You follow these steps at your own risk. Formatting or erasing a drive can permanently destroy data.',
      full: 'Full disclaimer',
      fullH: 'Before you erase anything, read this',
      b1s: 'Formatting and erasing permanently destroys data.',
      b1: 'Once a drive is formatted, the music on it is gone unless you have another copy or pay for professional recovery. There is no undo.',
      b2s: 'Copy the files off first whenever there is time.',
      b2: 'If you can plug the drive into a computer and the files are visible, copy them somewhere safe before you format anything.',
      b3s: 'Make sure you are erasing the right drive.',
      b3: 'Formatting the wrong device, an external backup, a second USB, your system disk, is the single most expensive mistake in this whole process.',
      b4s: 'This is general guidance, not a guarantee.',
      b4: 'Every drive, player, firmware version and library is different. We cannot see your setup and we cannot promise any step will work for you.',
      b5s: 'You act at your own risk.',
      b5: 'Save My Gig accepts no liability for data loss, hardware damage, missed sets or any other loss arising from following this site. If the music is irreplaceable, stop and speak to a data recovery professional instead.',
      foot: 'Full terms:',
      footDisclaimer: 'Disclaimer',
      footPrivacy: 'Privacy',
    },
    capmsg: {
      registered: 'You are registered. One tap and it is in your inbox.',
      bad: 'That email does not look right. Check it and try again.',
      sending: 'Sending...',
      almost: 'Almost there. Check your inbox and tap the confirm link to get the card.',
      server: 'Something went wrong on our side. Try again in a minute.',
      offline: 'No connection. Try again when you have signal.',
    },
    lang: { label: 'Language' },
  },

  /* --------------------------------------------------------------------
   * PORTUGUESE (pt-BR). Treatment: você. Brazilian forms throughout.
   * "Checklist", "Emergency Mode", "Gear", "FAQ" and "Backup" stay in
   * English: they are what Brazilian DJs actually say, and Emergency Mode
   * is a brand term. "Prevention" becomes "Prevenção" because that IS said
   * in Portuguese and the English adds nothing.
   * ------------------------------------------------------------------ */
  pt: {
    skip: 'Pular para o conteúdo',
    home: 'Início',
    nav: {
      checklist: 'Checklist',
      emergency: 'Emergência',
      prepare: 'Prevenção',
      recovery: 'Recuperação',
      knowledge: 'Conhecimento',
      gear: 'Equipamento',
      about: 'Sobre nós',
    },
    aria: {
      brandHome: 'Save My Gig, DJ Booth Intelligence, início',
      search: 'Buscar no Save My Gig',
      openMenu: 'Abrir menu',
      site: 'Site',
      toTop: 'Voltar ao topo',
      instagram: 'Save My Gig no Instagram',
      tiktok: 'Save My Gig no TikTok',
      x: 'Save My Gig no X',
      youtube: 'Save My Gig no YouTube',
    },
    footer: {
      // "Todo DJ conhece um DJ que precisa disso" keeps the English line's
      // shape and its wink. A literal "Cada DJ sabe de um DJ..." would be
      // correct and dead.
      shareLead: 'Todo DJ conhece um DJ que precisa disso:',
      copy: 'Copiar link',
      copied: 'Copiado',
      coffee: 'Pague um café pra gente',
      colRescue: 'Resgate',
      colPrepare: 'Preparação',
      colMore: 'Mais',
      install: 'Instalar como app',
      emergencyMode: 'Modo emergência',
      dataRecovery: 'Recuperação de dados',
      faq: 'FAQ',
      checklist: 'Checklist',
      prevention: 'Prevenção',
      dictionary: 'Dicionário',
      knowledgeBase: 'Base de conhecimento',
      about: 'Sobre',
      partners: 'Parceiros',
      legal: 'Jurídico',
      feedback: 'Feedback',
      builtBy: 'Feito por DJs que já passaram por isso.',
      updated: 'Atualizado continuamente com novos equipamentos e soluções.',
    },
    consent: {
      aria: 'Escolha de cookies',
      head: 'Antes de começar.',
      // "Analytics" stays: it is the word Brazilians use for this, and the
      // cookie policy it links to uses it too.
      body: 'Só cookies de analytics, para a gente saber quais páginas ajudam mais os DJs.',
      policy: 'Política de cookies',
      decline: 'Recusar',
      accept: 'Aceitar',
    },
    cta: {
      stuckH: 'Vai tocar logo e ainda está travado?',
      stuckP: 'O fluxo de emergência pergunta quanto tempo você tem e te leva pelo caminho mais rápido, uma decisão por vez. Grátis, sem cadastro.',
      stuckBtn: 'Abrir o Emergency Mode',
      preventP: 'Não quer ler esta página nunca mais?',
      preventP2: 'Monte o sistema de prevenção uma vez e esta página perde a razão de existir.',
      preventBtn: 'Ver o checklist de prevenção',
      sticky: 'VAI TOCAR LOGO? ABRA O EMERGENCY MODE',
    },
    capture: {
      title: 'Fique com o Emergency Card',
      blurb: 'A gente manda o PDF pronto para imprimir, para ele já estar no seu celular antes da próxima booth escura. De vez em quando, um aviso que salva gig. Sem spam, cancela em um clique.',
      emailLabel: 'Seu e-mail',
      placeholder: 'voce@email.com',
      submit: 'Cadastrar e enviar',
      sendTo: 'Enviar para ',
      legal: 'O cadastro é gratuito e vale em todo o Save My Gig. A gente manda um e-mail de confirmação primeiro. Seu endereço fica guardado na Brevo, nosso provedor de e-mail. Você pode cancelar quando quiser.',
      privacy: 'Privacidade',
    },
    disclaimer: {
      quiet: 'Você segue estes passos por sua conta e risco.',
      compact: 'Você segue estes passos por sua conta e risco. Formatar ou apagar um drive pode destruir dados para sempre.',
      full: 'Aviso legal completo',
      fullH: 'Antes de apagar qualquer coisa, leia isto',
      b1s: 'Formatar e apagar destrói os dados para sempre.',
      b1: 'Depois que o drive é formatado, a música que estava nele acabou, a nao ser que voce tenha outra cópia ou pague por uma recuperação profissional. Não existe desfazer.',
      b2s: 'Sempre que der tempo, copie os arquivos antes.',
      b2: 'Se voce conseguir plugar o drive num computador e os arquivos aparecerem, copie tudo para um lugar seguro antes de formatar qualquer coisa.',
      b3s: 'Confirme que você está apagando o drive certo.',
      b3: 'Formatar o dispositivo errado, um backup externo, um segundo USB, o disco do sistema, é o erro mais caro de todo esse processo.',
      b4s: 'Isto é orientação geral, não é garantia.',
      b4: 'Cada drive, player, versão de firmware e biblioteca é diferente. A gente não consegue ver o seu setup e não pode prometer que algum passo vai funcionar para voce.',
      b5s: 'Você age por sua conta e risco.',
      b5: 'O Save My Gig não se responsabiliza por perda de dados, dano em equipamento, sets perdidos ou qualquer outro prejuízo decorrente do uso deste site. Se a música for insubstituível, pare e procure um profissional de recuperação de dados.',
      foot: 'Termos completos:',
      footDisclaimer: 'Aviso legal',
      footPrivacy: 'Privacidade',
    },
    capmsg: {
      registered: 'Você já está cadastrado. Um toque e ele chega no seu e-mail.',
      bad: 'Esse e-mail não parece certo. Confere e tenta de novo.',
      sending: 'Enviando...',
      almost: 'Quase lá. Abra seu e-mail e toque no link de confirmação para receber o card.',
      server: 'Deu problema aqui do nosso lado. Tenta de novo em um minuto.',
      offline: 'Sem conexão. Tenta de novo quando tiver sinal.',
    },
    lang: { label: 'Idioma' },
  },

  /* --------------------------------------------------------------------
   * SPANISH (neutral Latin American). Treatment: tú. No vosotros, no
   * regionalisms. "Computadora" not "ordenador" is enforced in the page
   * copy; the chrome has no such term. "Equipo" for gear is understood
   * everywhere; "equipamiento" reads heavier for no gain.
   * ------------------------------------------------------------------ */
  es: {
    skip: 'Saltar al contenido',
    home: 'Inicio',
    nav: {
      checklist: 'Checklist',
      emergency: 'Emergencia',
      prepare: 'Prevención',
      recovery: 'Recuperación',
      knowledge: 'Conocimiento',
      gear: 'Equipo',
      about: 'Nosotros',
    },
    aria: {
      brandHome: 'Save My Gig, DJ Booth Intelligence, inicio',
      search: 'Buscar en Save My Gig',
      openMenu: 'Abrir menú',
      site: 'Sitio',
      toTop: 'Volver arriba',
      instagram: 'Save My Gig en Instagram',
      tiktok: 'Save My Gig en TikTok',
      x: 'Save My Gig en X',
      youtube: 'Save My Gig en YouTube',
    },
    footer: {
      shareLead: 'Todo DJ conoce a un DJ que necesita esto:',
      copy: 'Copiar enlace',
      // No opening or closing exclamation: the brand retired its own, and
      // this was the last one left anywhere on the Spanish site.
      copied: 'Copiado',
      coffee: 'Invítanos un café',
      colRescue: 'Rescate',
      colPrepare: 'Preparación',
      colMore: 'Más',
      install: 'Instalar como app',
      emergencyMode: 'Modo emergencia',
      dataRecovery: 'Recuperación de datos',
      faq: 'FAQ',
      checklist: 'Checklist',
      prevention: 'Prevención',
      dictionary: 'Diccionario',
      knowledgeBase: 'Base de conocimiento',
      about: 'Nosotros',
      partners: 'Socios',
      legal: 'Legal',
      feedback: 'Feedback',
      builtBy: 'Hecho por DJs que ya pasaron por esto.',
      updated: 'Actualizado continuamente con nuevos equipos y soluciones.',
    },
    consent: {
      aria: 'Preferencia de cookies',
      head: 'Antes de entrar.',
      body: 'Solo cookies de analytics, para saber qué páginas ayudan más a los DJs.',
      policy: 'Política de cookies',
      decline: 'Rechazar',
      accept: 'Aceptar',
    },
    cta: {
      stuckH: '¿Tocas pronto y sigues atascado?',
      stuckP: 'El flujo de emergencia te pregunta cuánto tiempo tienes y te lleva por la ruta más rápida, una decisión a la vez. Gratis, sin cuenta.',
      stuckBtn: 'Abrir Emergency Mode',
      preventP: '¿No quieres volver a leer esta página?',
      preventP2: 'Arma el sistema de prevención una vez y esta página deja de hacer falta.',
      preventBtn: 'Ver el checklist de prevención',
      sticky: '¿TOCAS PRONTO? ABRE EMERGENCY MODE',
    },
    capture: {
      title: 'Quédate con la Emergency Card',
      blurb: 'Te enviamos el PDF listo para imprimir, así lo tienes en el celular antes del próximo booth a oscuras. De vez en cuando, un aviso que salva gigs. Sin spam, te das de baja en un clic.',
      emailLabel: 'Tu correo',
      placeholder: 'tu@email.com',
      submit: 'Registrarme y enviar',
      sendTo: 'Enviar a ',
      legal: 'Registrarte es gratis y vale en todo Save My Gig. Primero te mandamos un correo de confirmación. Tu dirección se guarda en Brevo, nuestro proveedor de correo. Puedes darte de baja cuando quieras.',
      privacy: 'Privacidad',
    },
    disclaimer: {
      quiet: 'Sigues estos pasos bajo tu propio riesgo.',
      compact: 'Sigues estos pasos bajo tu propio riesgo. Formatear o borrar una unidad puede destruir datos para siempre.',
      full: 'Aviso legal completo',
      fullH: 'Antes de borrar cualquier cosa, lee esto',
      b1s: 'Formatear y borrar destruye los datos para siempre.',
      b1: 'Una vez que formateas una unidad, la música que tenía se fue, salvo que tengas otra copia o pagues una recuperación profesional. No hay deshacer.',
      b2s: 'Siempre que haya tiempo, copia los archivos primero.',
      b2: 'Si puedes conectar la unidad a una computadora y los archivos aparecen, cópialos a un lugar seguro antes de formatear nada.',
      b3s: 'Asegúrate de que estás borrando la unidad correcta.',
      b3: 'Formatear el dispositivo equivocado, un respaldo externo, un segundo USB, tu disco de sistema, es el error más caro de todo este proceso.',
      b4s: 'Esto es orientación general, no una garantía.',
      b4: 'Cada unidad, reproductor, versión de firmware y biblioteca es distinta. No podemos ver tu setup y no podemos prometerte que un paso vaya a funcionar.',
      b5s: 'Actúas bajo tu propio riesgo.',
      b5: 'Save My Gig no acepta responsabilidad por pérdida de datos, daño de equipo, sets perdidos ni ningún otro perjuicio derivado de seguir este sitio. Si la musica es irreemplazable, detente y habla con un profesional de recuperación de datos.',
      foot: 'Términos completos:',
      footDisclaimer: 'Aviso legal',
      footPrivacy: 'Privacidad',
    },
    capmsg: {
      registered: 'Ya estás registrado. Un toque y lo tienes en tu correo.',
      bad: 'Ese correo no se ve bien. Revísalo e intenta de nuevo.',
      sending: 'Enviando...',
      almost: 'Casi listo. Abre tu correo y toca el enlace de confirmación para recibir la card.',
      server: 'Algo falló de nuestro lado. Intenta de nuevo en un minuto.',
      offline: 'Sin conexión. Intenta de nuevo cuando tengas señal.',
    },
    lang: { label: 'Idioma' },
  },
};

export const t = (lang) => UI[lang] || UI.en;
