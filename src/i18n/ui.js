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
      copied: 'Copied!',
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
      copied: 'Copiado!',
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
      copied: '¡Copiado!',
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
    lang: { label: 'Idioma' },
  },
};

export const t = (lang) => UI[lang] || UI.en;
