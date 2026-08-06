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
    // BREADCRUMB HUB LABELS. `fixes` is the label for the /fix library in
    // the BreadcrumbList Base.astro builds. There is no /fix index page, so
    // the crumb points at /faq, which is where the visible breadcrumb on
    // /fix/format-usb-for-cdj has always sent it. Kept out of footer.* on
    // purpose: the footer has no such link, and a label that is only ever
    // read by a crawler should not be filed with the ones a human clicks.
    crumbs: { fixes: 'Fixes' },
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
      // The pair the nav toggle swaps between. The glyph becomes an X in CSS
      // and the label has to say the same thing to a screen reader; it was
      // hardcoded English inside the toggle script until 2026-08-05.
      closeMenu: 'Close menu',
      site: 'Site',
      toTop: 'Back to top',
      instagram: 'Save My Gig on Instagram',
      tiktok: 'Save My Gig on TikTok',
      x: 'Save My Gig on X',
      youtube: 'Save My Gig on YouTube',
      // The four footer share controls. English labels on a Portuguese page
      // are invisible to a sighted reader and the only thing a screen-reader
      // user gets.
      shareWhatsapp: 'Share on WhatsApp',
      shareTelegram: 'Share on Telegram',
      shareX: 'Share on X',
      copyLink: 'Copy link',
    },
    // The header search overlay. Until 2026-08-05 these lived hardcoded in
    // Search.astro and Base.astro, so every PT and ES page shipped an
    // English search box while the inline boxes (home, /faq) were localized
    // by hand. Error codes and file systems stay verbatim, they are what
    // DJs actually type.
    search: {
      placeholder: 'Search: USB not detected, FAT32, E-8302...',
      clear: 'Clear search',
      results: 'Search results',
      close: 'Close search',
      // THE ZERO STATE, in pieces (2026-08-05). It was one hardcoded English
      // sentence inside Search.astro with two unprefixed links in it, so a
      // Brazilian who searched for something we do not have was told
      // "Nothing matched" and then sent into the English FAQ. It is composed
      // rather than stored as one string because the two links have to carry
      // the reader's language prefix, which means the hrefs are built at
      // runtime and cannot live in a catalogue. Assembled in Search.astro as
      //   noneFor "query". noneTry <noneFaq>, noneOr <noneStart>.
      // so the pieces have to read as one sentence in each language.
      noneFor: 'Nothing matched',
      noneTry: 'Try the',
      noneFaq: 'FAQ',
      noneOr: 'or',
      // Same words as footer.emergencyMode in each language, lowercased into
      // the sentence. The reader should meet one name for the rescue flow.
      noneStart: 'start emergency mode',
    },
    // The desktop install banner on the homepage. It was hardcoded English
    // in InstallApp.astro until 2026-08-05, which put four English strings at
    // the top of the Portuguese and Spanish homepages. "Once you've opened
    // it" is load bearing and survives translation: a first-ever visit with
    // no signal has nothing cached, so the promise has to keep its condition.
    installBanner: {
      head: 'Keep this on your computer and your phone',
      body: 'Once you\'ve opened it, the rescue flow stays on this device, even with no signal.',
      more: 'More',
      install: 'Install',
      dismiss: 'Dismiss',
    },
    // THE INSTALL RECOMMENDATION (Antonio, 2026-08-05: "How about we recommend
    // them to install the site as an app? This way they will have it offline.
    // If you install as an app, you guarantee it.").
    // Rendered by src/components/InstallNudge.astro on /saved, /card and
    // /checklist. The reasoning and the placement argument are in that file.
    //
    // WHAT MAY AND MAY NOT BE PROMISED. "stays on your device" is the ceiling.
    // Not "forever", not "guaranteed", in any language: iOS can still evict
    // stored data under real storage pressure, and a home screen icon buys
    // durability, not immortality. `install` and `dismiss` are deliberately NOT
    // repeated here, they come from installBanner above, which is the same
    // vocabulary the homepage banner uses; two words for one button is how a
    // product starts sounding like two products.
    installNudge: {
      head: 'Keep the rescue on your phone',
      body: 'Install it as an app and every rescue screen stays on your device, ready with no signal, no data and no searching.',
      // iOS has no install API, so the only honest thing to render is the
      // gesture. The label names match the ones on /install exactly, because a
      // reader who follows one and then the other must not meet two wordings
      // for the same menu item.
      ios: 'Tap the Share icon, then Add to Home Screen.',
      done: 'Installed. The rescue is on your phone now.',
    },
    // THE ASK THAT COMES AFTER THE INSTALL, not before it.
    //
    // Antonio first proposed requiring registration IN ORDER to install as a
    // PWA. Rejected, and the reasoning is worth keeping because it will be
    // proposed again:
    //   1. TECHNICALLY IMPOSSIBLE. Install is a BROWSER function: Chrome's own
    //      menu, Safari's Share then Add to Home Screen. A site cannot gate it.
    //      And the offline precache already runs on a first visit with no
    //      account, so gating our own button would have hidden the
    //      recommendation without gating one byte of the benefit.
    //   2. WRONG PLACE. The recommendation lands on /saved, thirty seconds
    //      after a rescue worked, on a site whose homepage says "Free, no
    //      account". A form there converts a rescue into a transaction at the
    //      exact moment trust is highest, which is the most expensive possible
    //      moment to spend it.
    // So: install with zero friction, and THEN ask an already-committed user,
    // inside the installed app, where the ask is genuinely attractive rather
    // than a toll. Rendered by src/components/PostInstall.astro.
    //
    // It is framed as the payoff and not as a request: the heading states what
    // they have just gained, and the body names two things they get, both of
    // which are real and already built (the checklist syncs on registration,
    // the printable card is emailed).
    postInstall: {
      head: 'The rescue is on your phone',
      body: 'Register to sync your checklist across every device and get the printable Emergency Card.',
    },
    footer: {
      shareLead: 'Every DJ knows a DJ who needs this:',
      // WHAT ACTUALLY GETS SHARED. Until 2026-08-05 the WhatsApp, Telegram and
      // X links carried one hardcoded English sentence and the bare English
      // homepage, so a Brazilian pressing the button under a Portuguese
      // heading sent an English message pointing at the English site. It opens
      // with the same words as shareLead above on purpose: the reader has just
      // read that line, and the message they send should sound like they wrote
      // it. The URL is the reader's own language homepage, built in the layout.
      shareText: 'Every DJ knows a DJ who needs this: Save My Gig, DJ Booth Intelligence, for when your USB dies before a set.',
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
      // WORDED TO STAY TRUE THROUGH THE NEXT FEATURE (2026-08-05).
      // This line prints on 39 pages, so it is the site's most-repeated
      // promise about the emergency flow, and it used to say the flow "asks
      // how long you have". It does not: the five doors on /emergency ask
      // what FAILED, and the time question only appears inside some branches
      // where it changes the route. So the claim was false everywhere it
      // printed.
      // Deleting the promise was the other option and it was rejected:
      // time-based triage is on the roadmap. Instead this states only what is
      // verifiable today (it starts from the symptom, one decision per
      // screen) in wording that is STILL accurate the day the flow does start
      // asking about time, because "starts from what actually failed" stays
      // the entry point regardless of what the flow asks second. Do not
      // re-add a specific question to this sentence; name the starting point,
      // not the interrogation.
      stuckP: 'The step-by-step emergency flow starts from what actually failed and walks you to the fastest route, one decision per screen. Free, no account.',
      stuckBtn: 'Start Emergency Mode',
      // The secondary exit from the "playing soon" panel, printed only by the
      // articles that pass card to ArticleCTA. Emergency Mode needs a browser
      // and an open tab; a screenshot needs neither, which is the case the two
      // booth-failure articles actually have to cover.
      cardLink: 'Screenshot the Emergency Card',
      preventP: 'Never want to read this page again?',
      preventP2: 'Set up the prevention system once and this page becomes irrelevant.',
      // ONE NAME FOR ONE DESTINATION (2026-08-06). This button was "See the
      // prevention checklist" and it does not point at the checklist: it points
      // at /prepare, the prevention hub. The site already had the right name for
      // that destination, in `tunnel.rules` below and hardcoded in the tunnel's
      // closing note on /protocol/usb/moves, so this is that exact phrasing and
      // not a new one. A reader who taps this from a fix article and later reads
      // the tunnel note now meets the same words for the same page, and neither
      // of them promises a checklist that is somewhere else.
      // It also fixes the wrap the 2026-08-05 audit blamed on the emoji. That
      // was never the cause: at 390 the old label needed 293.9px of one-line
      // width against 266 available, so it was 4.8px too wide even with NO icon
      // at all. Shorter, and correct, is the fix. Widths remeasured at 360 and
      // 390 in all three languages.
      preventBtn: 'The prevention rules',
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
    tunnel: {
      back: 'Back one step',
      // Swapped in by script when there is no history to go back to, so a
      // deep link or a new tab gets a working button instead of a dead one.
      backToTriage: 'Back to triage',
      restart: 'Start over',
      exitLabel: 'Leave or restart',
      why: 'Why, and how',
      rules: 'The prevention rules',
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
    crumbs: { fixes: 'Soluções' },
    nav: {
      checklist: 'Checklist',
      emergency: 'Emergência',
      prepare: 'Prevenção',
      // Antonio, 2026-08-05: the noun forms (Recuperação, Conhecimento)
      // widened the nav and pushed the language picker and search icon out
      // of alignment. Verbs are shorter and read naturally in a nav. Top
      // navigation only, page titles and content keep the full nouns.
      recovery: 'Recuperar',
      knowledge: 'Aprender',
      gear: 'Equipamento',
      about: 'Sobre nós',
    },
    aria: {
      brandHome: 'Save My Gig, DJ Booth Intelligence, início',
      search: 'Buscar no Save My Gig',
      openMenu: 'Abrir menu',
      closeMenu: 'Fechar menu',
      site: 'Site',
      toTop: 'Voltar ao topo',
      instagram: 'Save My Gig no Instagram',
      tiktok: 'Save My Gig no TikTok',
      x: 'Save My Gig no X',
      youtube: 'Save My Gig no YouTube',
      shareWhatsapp: 'Compartilhar no WhatsApp',
      shareTelegram: 'Compartilhar no Telegram',
      shareX: 'Compartilhar no X',
      copyLink: 'Copiar link',
    },
    search: {
      placeholder: 'Busque: USB não reconhecido, FAT32, E-8302...',
      clear: 'Limpar busca',
      results: 'Resultados da busca',
      close: 'Fechar busca',
      noneFor: 'Nada encontrado para',
      noneTry: 'Tente o',
      noneFaq: 'FAQ',
      noneOr: 'ou',
      noneStart: 'abra o Modo emergência',
    },
    installBanner: {
      head: 'Deixe isto no seu computador e no seu celular',
      body: 'Depois que você abre uma vez, o fluxo de resgate fica salvo neste aparelho, mesmo sem sinal.',
      more: 'Saiba mais',
      install: 'Instalar',
      dismiss: 'Fechar',
    },
    // Nada de "para sempre" nem "garantido": o iOS ainda pode limpar dados
    // guardados se o aparelho ficar sem espaço. O ícone na tela de início dá
    // durabilidade, não eternidade. Os nomes dos itens do menu do iPhone são
    // exatamente os mesmos usados em /pt/install.
    installNudge: {
      head: 'Deixe o resgate no seu celular',
      body: 'Instale como app e todas as telas de resgate ficam salvas no seu aparelho, prontas sem sinal, sem dados e sem procurar nada.',
      ios: 'Toque em Compartilhar e depois em Adicionar à Tela de Início.',
      done: 'Instalado. O resgate está no seu celular agora.',
    },
    // O pedido vem DEPOIS da instalação, nunca antes. "Emergency Card" é nome
    // de produto e não se traduz. Ver o comentário na versão em inglês para o
    // porquê de não existir cadastro obrigatório para instalar.
    postInstall: {
      head: 'O resgate está no seu celular',
      body: 'Cadastre-se para sincronizar o seu checklist em todos os aparelhos e receber o Emergency Card para imprimir.',
    },
    footer: {
      // "Todo DJ conhece um DJ que precisa disso" keeps the English line's
      // shape and its wink. A literal "Cada DJ sabe de um DJ..." would be
      // correct and dead.
      shareLead: 'Todo DJ conhece um DJ que precisa disso:',
      shareText: 'Todo DJ conhece um DJ que precisa disso: Save My Gig, DJ Booth Intelligence, para quando o pen drive morre antes do set.',
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
      // Escrito para continuar verdadeiro depois da próxima feature: fala de
      // onde o fluxo COMEÇA (o que falhou), não de qual pergunta ele faz. Ver
      // o comentário na versão em inglês.
      stuckP: 'O fluxo de emergência passo a passo começa pelo que realmente falhou e te leva até o caminho mais rápido, uma decisão por tela. Grátis, sem cadastro.',
      stuckBtn: 'Abrir o Emergency Mode',
      // "Emergency Card" é nome de produto, não se traduz.
      cardLink: 'Tire um print do Emergency Card',
      preventP: 'Não quer ler esta página nunca mais?',
      preventP2: 'Monte o sistema de prevenção uma vez e esta página perde a razão de existir.',
      // Mesma frase de `tunnel.rules` abaixo: um nome por destino. Ver o
      // comentario completo na versao em ingles.
      preventBtn: 'As regras de prevenção',
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
      b1: 'Depois que o drive é formatado, a música que estava nele acabou, a não ser que você tenha outra cópia ou pague por uma recuperação profissional. Não existe desfazer.',
      b2s: 'Sempre que der tempo, copie os arquivos antes.',
      b2: 'Se você conseguir plugar o drive num computador e os arquivos aparecerem, copie tudo para um lugar seguro antes de formatar qualquer coisa.',
      b3s: 'Confirme que você está apagando o drive certo.',
      b3: 'Formatar o dispositivo errado, um backup externo, um segundo USB, o disco do sistema, é o erro mais caro de todo esse processo.',
      b4s: 'Isto é orientação geral, não é garantia.',
      b4: 'Cada drive, player, versão de firmware e biblioteca é diferente. A gente não consegue ver o seu setup e não pode prometer que algum passo vai funcionar para você.',
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
    tunnel: {
      back: 'Voltar um passo',
      backToTriage: 'Voltar para a triagem',
      restart: 'Começar de novo',
      exitLabel: 'Sair ou recomeçar',
      why: 'Por que, e como',
      rules: 'As regras de prevenção',
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
    crumbs: { fixes: 'Soluciones' },
    nav: {
      checklist: 'Checklist',
      emergency: 'Emergencia',
      prepare: 'Prevención',
      // Antonio, 2026-08-05: same nav-width fix as pt. Top navigation only.
      recovery: 'Recuperar',
      knowledge: 'Aprender',
      gear: 'Equipo',
      about: 'Nosotros',
    },
    aria: {
      brandHome: 'Save My Gig, DJ Booth Intelligence, inicio',
      search: 'Buscar en Save My Gig',
      openMenu: 'Abrir menú',
      closeMenu: 'Cerrar menú',
      site: 'Sitio',
      toTop: 'Volver arriba',
      instagram: 'Save My Gig en Instagram',
      tiktok: 'Save My Gig en TikTok',
      x: 'Save My Gig en X',
      youtube: 'Save My Gig en YouTube',
      shareWhatsapp: 'Compartir en WhatsApp',
      shareTelegram: 'Compartir en Telegram',
      shareX: 'Compartir en X',
      copyLink: 'Copiar enlace',
    },
    search: {
      placeholder: 'Busca: USB no reconocido, FAT32, E-8302...',
      clear: 'Borrar búsqueda',
      results: 'Resultados de búsqueda',
      close: 'Cerrar búsqueda',
      noneFor: 'Nada encontrado para',
      noneTry: 'Prueba el',
      noneFaq: 'FAQ',
      noneOr: 'o',
      noneStart: 'abre el Modo emergencia',
    },
    installBanner: {
      head: 'Llévalo en tu computadora y en tu celular',
      body: 'Una vez que lo abriste, el flujo de rescate se queda en este dispositivo, aunque no tengas señal.',
      more: 'Más',
      install: 'Instalar',
      dismiss: 'Cerrar',
    },
    // Nada de "para siempre" ni "garantizado": iOS todavía puede borrar datos
    // guardados si al dispositivo le falta espacio. El ícono en la pantalla de
    // inicio da durabilidad, no eternidad. Los nombres de los ítems del menú
    // del iPhone son los mismos que usa /es/install.
    installNudge: {
      head: 'Llévate el rescate en el celular',
      body: 'Instálalo como app y todas las pantallas de rescate se quedan en tu dispositivo, listas sin señal, sin datos y sin buscar nada.',
      ios: 'Toca Compartir y luego Agregar a inicio.',
      done: 'Instalado. El rescate ya está en tu celular.',
    },
    // El pedido va DESPUÉS de instalar, nunca antes. "Emergency Card" es
    // nombre de producto y no se traduce. Ver el comentario en la versión en
    // inglés para por qué no hay registro obligatorio para instalar.
    postInstall: {
      head: 'El rescate ya está en tu celular',
      body: 'Regístrate para sincronizar tu checklist en todos tus dispositivos y recibir la Emergency Card para imprimir.',
    },
    footer: {
      shareLead: 'Todo DJ conoce a un DJ que necesita esto:',
      shareText: 'Todo DJ conoce a un DJ que necesita esto: Save My Gig, DJ Booth Intelligence, para cuando el USB muere antes del set.',
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
      // Escrito para seguir siendo verdad después de la próxima feature: dice
      // de dónde ARRANCA el flujo (lo que falló), no qué pregunta hace. Ver el
      // comentario en la versión en inglés.
      stuckP: 'El flujo de emergencia paso a paso arranca por lo que falló de verdad y te lleva hasta la ruta más rápida, una decisión por pantalla. Gratis, sin cuenta.',
      stuckBtn: 'Abrir Emergency Mode',
      // "Emergency Card" es nombre de producto, no se traduce.
      cardLink: 'Toma una captura de la Emergency Card',
      preventP: '¿No quieres volver a leer esta página?',
      preventP2: 'Arma el sistema de prevención una vez y esta página deja de hacer falta.',
      // Misma frase que `tunnel.rules` abajo: un nombre por destino. Ver el
      // comentario completo en la version en ingles.
      preventBtn: 'Las reglas de prevención',
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
      b5: 'Save My Gig no acepta responsabilidad por pérdida de datos, daño de equipo, sets perdidos ni ningún otro perjuicio derivado de seguir este sitio. Si la música es irreemplazable, detente y habla con un profesional de recuperación de datos.',
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
    tunnel: {
      back: 'Volver un paso',
      backToTriage: 'Volver al triaje',
      restart: 'Empezar de nuevo',
      exitLabel: 'Salir o empezar de nuevo',
      why: 'Por qué, y cómo',
      rules: 'Las reglas de prevención',
    },
    lang: { label: 'Idioma' },
  },
};

export const t = (lang) => UI[lang] || UI.en;
