/**
 * PROSE HELD IN facts.js, TRANSLATED.
 *
 * WHY THIS FILE EXISTS. facts.js is the single source of truth for every
 * specification on this site, and it is genuinely language neutral for the things
 * that matter most: versions, file systems, URLs, counts. It is NOT language
 * neutral for its prose fields, and there are around forty of them:
 * masterUnityPosition, soundcardSpec, channelsDetail, headshellWiring,
 * antiSkatingInstruction, reversePlaySetting, placementSpeakers and more.
 *
 * The /pt and /es pages interpolate those values, so English landed mid-sentence
 * inside translated paragraphs. A Portuguese booth briefing read "a unidade do
 * master fica around 3 o'clock, which is 8 on the dial", and on the Xone:92 master
 * level fix the corrective INSTRUCTION existed only in English. An audit measured
 * 176 fragments across 16 pages.
 *
 * IT WAS MY INSTRUCTION THAT CAUSED IT. When briefing the translation work I wrote
 * that the agents should leave every facts.js interpolation exactly as it was
 * because "those field values are English strings and that is expected". For a
 * version number that is correct. For a sentence it is the opposite of correct.
 *
 * THE PATTERN ALREADY EXISTED. The firmware matrix pages solve exactly this, with
 * per-language SYMPTOM and AREA maps and check-firmware-i18n to enforce them. This
 * is the same idea generalised: one dictionary keyed by the exact English string,
 * one helper, and scripts/check-prose-leak.mjs to prove nothing is left behind.
 *
 * WHAT IS DELIBERATELY NOT HERE. Pure measurements ("230 mm", "7 kg", "22
 * degrees"), product names, and control labels printed on hardware. Those read
 * correctly in all three languages and translating them would desync the page from
 * the object in front of the reader.
 *
 * FALLING BACK TO ENGLISH IS DELIBERATE AND SAFE ONLY BECAUSE IT IS MEASURED. A
 * missing key renders the English rather than an empty space, so a page never
 * breaks. The gate check is what stops that becoming a way to ship untranslated
 * copy, which is the same bargain the firmware maps make.
 */

export const PROSE = {
  // --- Allen & Heath Xone:92 -------------------------------------------------
  "around 3 o'clock, which is 8 on the dial": {
    pt: 'perto das 3 horas no relógio, o que é o 8 na escala',
    es: 'cerca de las 3 en punto, que es el 8 en la escala',
  },
  '+4dBu on the balanced XLR output': {
    pt: '+4dBu na saída XLR balanceada',
    es: '+4dBu en la salida XLR balanceada',
  },
  'four stereo music channels with switchable phono or line, plus two mic and return channels': {
    pt: 'quatro canais estéreo de música com phono ou line comutável, mais dois canais de mic e return',
    es: 'cuatro canales estéreo de música con phono o line conmutable, más dos canales de mic y return',
  },
  '100% analogue circuitry and mix bus summing': {
    pt: 'circuito 100% analógico e somatório do mix bus analógico',
    es: 'circuito 100% analógico y suma del mix bus analógica',
  },
  'MIDI out only, one 5-pin DIN': {
    pt: 'apenas MIDI out, um DIN de 5 pinos',
    es: 'solo MIDI out, un DIN de 5 pines',
  },
  'linear channel faders, with a global 3-position curve switch on the Mk2': {
    pt: 'faders de canal lineares, com uma chave global de curva de 3 posições no Mk2',
    es: 'faders de canal lineales, con un switch global de curva de 3 posiciones en el Mk2',
  },
  'mini innoFADER Pro, 45mm linear VCA': {
    pt: 'mini innoFADER Pro, VCA linear de 45mm',
    es: 'mini innoFADER Pro, VCA lineal de 45mm',
  },
  'a resonance control labelled MILD to WILD, which feeds the filter output back to its input': {
    pt: 'um controle de ressonância marcado MILD to WILD, que devolve a saída do filtro para a entrada dele',
    es: 'un control de resonancia marcado MILD to WILD, que devuelve la salida del filtro a su entrada',
  },
  '100 to 240V, 30W, internal switch mode supply, no voltage selector and no fuse change': {
    pt: '100 a 240V, 30W, fonte chaveada interna, sem seletor de tensão e sem troca de fusível',
    es: '100 a 240V, 30W, fuente conmutada interna, sin selector de voltaje y sin cambio de fusible',
  },
  'Mk1 and Mk2, plus a Limited Edition run of 920 units for the twentieth anniversary': {
    pt: 'Mk1 e Mk2, mais uma série Limited Edition de 920 unidades para o vigésimo aniversário',
    es: 'Mk1 y Mk2, más una serie Limited Edition de 920 unidades por el vigésimo aniversario',
  },

  // --- Allen & Heath Xone:96 -------------------------------------------------
  'four stereo channels with 4-band EQ, two stereo channels with 3-band parametric EQ, and two auxiliary stereo returns': {
    pt: 'quatro canais estéreo com EQ de 4 bandas, dois canais estéreo com EQ paramétrico de 3 bandas, e dois returns estéreo auxiliares',
    es: 'cuatro canales estéreo con EQ de 4 bandas, dos canales estéreo con EQ paramétrico de 3 bandas, y dos returns estéreo auxiliares',
  },
  'an analogue mixer with an interface, feeding what Allen & Heath call the analogue engine': {
    pt: 'um mixer analógico com interface, alimentando o que a Allen & Heath chama de analogue engine',
    es: 'un mixer analógico con interfaz, alimentando lo que Allen & Heath llama el analogue engine',
  },
  'two independent interfaces, each 6 stereo in and 6 stereo out at 32-bit / 96 kHz': {
    pt: 'duas interfaces independentes, cada uma com 6 entradas e 6 saídas estéreo a 32 bits / 96 kHz',
    es: 'dos interfaces independientes, cada una con 6 entradas y 6 salidas estéreo a 32 bits / 96 kHz',
  },
  'v4.67.0 on the resources page, v4.6.70 in the release note itself': {
    pt: 'v4.67.0 na página de recursos, v4.6.70 na própria nota de versão',
    es: 'v4.67.0 en la página de recursos, v4.6.70 en la propia nota de versión',
  },
  'December 2021': { pt: 'dezembro de 2021', es: 'diciembre de 2021' },
  '-2 dBu in and out': { pt: '-2 dBu na entrada e na saída', es: '-2 dBu en entrada y salida' },
  'between -6 and +6 with the average around 0, and the loudest peaks around +6': {
    pt: 'entre -6 e +6, com a média perto de 0 e os picos mais altos perto de +6',
    es: 'entre -6 y +6, con el promedio cerca de 0 y los picos más altos cerca de +6',
  },
  'mini innoFADER, with fader cut adjustment': {
    pt: 'mini innoFADER, com ajuste de fader cut',
    es: 'mini innoFADER, con ajuste de fader cut',
  },
  'SND 1 switchable pre or post fader, SND 2 fixed post fader': {
    pt: 'SND 1 comutável pre ou post fader, SND 2 fixo em post fader',
    es: 'SND 1 conmutable pre o post fader, SND 2 fijo en post fader',
  },
  'auto cancelling by default, switchable to latching by holding all three filter type buttons on both filters': {
    pt: 'auto cancelling por padrão, comutável para latching segurando os três botões de tipo de filtro nos dois filtros',
    es: 'auto cancelling por defecto, conmutable a latching manteniendo los tres botones de tipo de filtro en los dos filtros',
  },

  // --- Technics SL-1200MK2 --------------------------------------------------
  'Quartz direct drive, manual turntable': {
    pt: 'toca-discos manual com tração direta e quartz lock',
    es: 'tornamesa manual con tracción directa y quartz lock',
  },
  'Aluminium diecast, 33.2 cm diameter, 2 kg': {
    pt: 'alumínio fundido, 33,2 cm de diâmetro, 2 kg',
    es: 'aluminio fundido, 33,2 cm de diámetro, 2 kg',
  },
  '33-1/3 and 45 rpm': { pt: '33-1/3 e 45 rpm', es: '33-1/3 y 45 rpm' },
  '0.7 seconds from standstill to 33-1/3 rpm': {
    pt: '0,7 segundo da parada total até 33-1/3 rpm',
    es: '0,7 segundos desde parado hasta 33-1/3 rpm',
  },
  '0.01 % WRMS for the turntable assembly alone, 0.025 % WRMS to JIS C5521, and 0.035 % peak to IEC 98A weighted': {
    pt: '0,01 % WRMS só para o conjunto do prato, 0,025 % WRMS pela JIS C5521, e 0,035 % de pico pela IEC 98A ponderada',
    es: '0,01 % WRMS solo para el conjunto del plato, 0,025 % WRMS según JIS C5521, y 0,035 % de pico según IEC 98A ponderada',
  },
  'minus 56 dB unweighted and minus 78 dB weighted, both to IEC 98A': {
    pt: 'menos 56 dB sem ponderação e menos 78 dB com ponderação, ambos pela IEC 98A',
    es: 'menos 56 dB sin ponderación y menos 78 dB con ponderación, ambos según IEC 98A',
  },
  'about plus or minus 8 per cent': {
    pt: 'cerca de mais ou menos 8 por cento',
    es: 'cerca de más o menos 8 por ciento',
  },
  'plus 6, plus 3.3, zero and minus 3.3 per cent': {
    pt: 'mais 6, mais 3,3, zero e menos 3,3 por cento',
    es: 'más 6, más 3,3, cero y menos 3,3 por ciento',
  },
  '12 g without cartridge': { pt: '12 g sem a cápsula', es: '12 g sin la cápsula' },
  '0 to 6 mm': { pt: '0 a 6 mm', es: '0 a 6 mm' },
  '0 to 2.5 g': { pt: '0 a 2,5 g', es: '0 a 2,5 g' },
  'Set the anti-skating control knob to the same value as the stylus pressure.': {
    pt: 'Coloque o knob de anti-skating no mesmo valor do peso da agulha.',
    es: 'Pon el knob de anti-skating en el mismo valor que la presión de aguja.',
  },
  '6 to 10 g, or 13.5 to 17.5 g including the headshell': {
    pt: '6 a 10 g, ou 13,5 a 17,5 g com o headshell',
    es: '6 a 10 g, o 13,5 a 17,5 g con el headshell',
  },
  'White is left positive, blue is left negative, red is right positive, green is right negative': {
    pt: 'branco é o positivo da esquerda, azul é o negativo da esquerda, vermelho é o positivo da direita, verde é o negativo da direita',
    es: 'blanco es el positivo de la izquierda, azul es el negativo de la izquierda, rojo es el positivo de la derecha, verde es el negativo de la derecha',
  },
  'Left and right leads plus a separate spade-lug ground wire': {
    pt: 'cabos de esquerda e direita mais um fio de terra separado com terminal forquilha',
    es: 'cables de izquierda y derecha más un cable de tierra aparte con terminal de horquilla',
  },
  'AC 120 V, 60 Hz on the North American model': {
    pt: '120 V AC, 60 Hz no modelo norte-americano',
    es: '120 V AC, 60 Hz en el modelo norteamericano',
  },
  '45.3 cm wide, 36 cm deep, 16.2 cm high': {
    pt: '45,3 cm de largura, 36 cm de profundidade, 16,2 cm de altura',
    es: '45,3 cm de ancho, 36 cm de profundidad, 16,2 cm de alto',
  },
  'Locate the unit as far away from the speakers as possible and isolate the unit from sound radiation from them.': {
    pt: 'Coloque o aparelho o mais longe possível das caixas e isole o aparelho da radiação sonora delas.',
    es: 'Coloca el equipo lo más lejos posible de las cajas y aísla el equipo de la radiación sonora que emiten.',
  },
  'Place the unit in a stable and horizontal position, where there is little or no vibration.': {
    pt: 'Coloque o aparelho numa posição estável e horizontal, onde haja pouca ou nenhuma vibração.',
    es: 'Coloca el equipo en una posición estable y horizontal, donde haya poca o ninguna vibración.',
  },

  // --- Technics SL-1200MK7 --------------------------------------------------
  'January 2019, at CES': { pt: 'janeiro de 2019, na CES', es: 'enero de 2019, en CES' },
  'newly developed coreless direct drive motor': {
    pt: 'motor de tração direta sem núcleo, recém-desenvolvido',
    es: 'motor de tracción directa sin núcleo, recién desarrollado',
  },
  'Aluminium diecast, 332 mm diameter, approximately 1.8 kg including the slipmat and slip sheet': {
    pt: 'alumínio fundido, 332 mm de diâmetro, aproximadamente 1,8 kg incluindo o slipmat e a folha de deslize',
    es: 'aluminio fundido, 332 mm de diámetro, aproximadamente 1,8 kg incluyendo el slipmat y la hoja de deslizamiento',
  },
  '33-1/3 and 45 rpm, and 78 rpm by pressing the [33] and [45] buttons together': {
    pt: '33-1/3 e 45 rpm, e 78 rpm apertando os botões [33] e [45] juntos',
    es: '33-1/3 y 45 rpm, y 78 rpm presionando los botones [33] y [45] juntos',
  },
  '0.18 N-m, which is 1.8 kg-cm': { pt: '0,18 N-m, o que equivale a 1,8 kg-cm', es: '0,18 N-m, que equivale a 1,8 kg-cm' },
  '0.025 % WRMS': { pt: '0,025 % WRMS', es: '0,025 % WRMS' },
  'plus or minus 8 or plus or minus 16 per cent, selectable': {
    pt: 'mais ou menos 8 ou mais ou menos 16 por cento, selecionável',
    es: 'más o menos 8 o más o menos 16 por ciento, seleccionable',
  },
  'within 2 degrees 32 minutes at the outer groove and 0 degrees 32 minutes at the inner groove of a 30 cm record': {
    pt: 'dentro de 2 graus e 32 minutos no sulco externo e 0 grau e 32 minutos no sulco interno de um disco de 30 cm',
    es: 'dentro de 2 grados 32 minutos en el surco externo y 0 grados 32 minutos en el surco interno de un disco de 30 cm',
  },
  '0 to 4 g, direct reading': { pt: '0 a 4 g, com leitura direta', es: '0 a 4 g, con lectura directa' },
  'Turn the anti-skating control to adjust it to the same value as the stylus pressure control.': {
    pt: 'Gire o controle de anti-skating para deixá-lo no mesmo valor do controle de peso da agulha.',
    es: 'Gira el control de anti-skating para dejarlo en el mismo valor que el control de presión de aguja.',
  },
  'approximately 7.6 g': { pt: 'aproximadamente 7,6 g', es: 'aproximadamente 7,6 g' },
  '1.2 mm diameter four-pin terminal lug': {
    pt: 'terminal de quatro pinos com 1,2 mm de diâmetro',
    es: 'terminal de cuatro pines con 1,2 mm de diámetro',
  },
  '5.6 to 12.0 g, or 14.3 to 20.7 g including the headshell': {
    pt: '5,6 a 12,0 g, ou 14,3 a 20,7 g com o headshell',
    es: '5,6 a 12,0 g, o 14,3 a 20,7 g con el headshell',
  },
  'PHONO pin jacks and an earth terminal': {
    pt: 'conectores PHONO tipo pino e um terminal de terra',
    es: 'conectores PHONO tipo pin y un terminal de tierra',
  },
  'AC 120 V, 60 Hz on the North American model, and AC 110 to 240 V, 50/60 Hz on the export model': {
    pt: '120 V AC, 60 Hz no modelo norte-americano, e 110 a 240 V AC, 50/60 Hz no modelo de exportação',
    es: '120 V AC, 60 Hz en el modelo norteamericano, y 110 a 240 V AC, 50/60 Hz en el modelo de exportación',
  },
  '8.0 W switched on, and approximately 0.2 W switched off': {
    pt: '8,0 W ligado, e aproximadamente 0,2 W desligado',
    es: '8,0 W encendido, y aproximadamente 0,2 W apagado',
  },
  'approximately 9.6 kg': { pt: 'aproximadamente 9,6 kg', es: 'aproximadamente 9,6 kg' },
  'a REV switch on the rear panel, then the speed button and START-STOP together while the platter is turning': {
    pt: 'uma chave REV no painel traseiro, e depois o botão de rotação e o START-STOP juntos com o prato girando',
    es: 'un switch REV en el panel trasero, y luego el botón de velocidad y START-STOP juntos con el plato girando',
  },
  'rear panel switches, TQ1 and TQ2 for torque and BK1 and BK2 for brake': {
    pt: 'chaves no painel traseiro, TQ1 e TQ2 para o torque e BK1 e BK2 para o freio',
    es: 'switches en el panel trasero, TQ1 y TQ2 para el torque y BK1 y BK2 para el freno',
  },
  'a pop-up white LED': { pt: 'um LED branco retrátil', es: 'un LED blanco retráctil' },
  'Be sure to connect the PHONO earth lead. Otherwise mains hum may occur.': {
    pt: 'Conecte sempre o cabo de terra PHONO. Caso contrário pode aparecer zumbido da rede elétrica.',
    es: 'Conecta siempre el cable de tierra PHONO. De lo contrario puede aparecer zumbido de la red eléctrica.',
  },
  'Are there other appliances or their AC power supply cord near the stereo connection cable? Separate the appliances and their AC power supply cord from this unit.': {
    pt: 'Existem outros aparelhos ou cabos de alimentação AC perto do cabo de conexão estéreo? Afaste esses aparelhos e os cabos de alimentação AC deste aparelho.',
    es: '¿Hay otros equipos o sus cables de alimentación AC cerca del cable de conexión estéreo? Separa esos equipos y sus cables de alimentación AC de este equipo.',
  },
  'following SL-1200MK6 specifications such as dimensions, button layout, and inertial mass of the platter': {
    pt: 'seguindo as especificações do SL-1200MK6 como dimensões, disposição dos botões e massa inercial do prato',
    es: 'siguiendo las especificaciones del SL-1200MK6 como dimensiones, disposición de los botones y masa inercial del plato',
  },
  'SL-1200MK7 and the SL-1210MK7 export name, an SL-1200MK7-S silver finish for North America, the SL-1200M7L 50th anniversary edition of 12,000 units, and the SL-1200M7ALD collaboration edition': {
    pt: 'SL-1200MK7 e o nome de exportação SL-1210MK7, um acabamento prata SL-1200MK7-S para a América do Norte, a edição de 50 anos SL-1200M7L com 12.000 unidades, e a edição de colaboração SL-1200M7ALD',
    es: 'SL-1200MK7 y el nombre de exportación SL-1210MK7, un acabado plata SL-1200MK7-S para Norteamérica, la edición de 50 años SL-1200M7L de 12.000 unidades, y la edición de colaboración SL-1200M7ALD',
  },

  // --- Pioneer DJ ------------------------------------------------------------
  'USB only, with no SD card slot and no disc drive': {
    pt: 'apenas USB, sem slot de cartão SD e sem leitor de disco',
    es: 'solo USB, sin ranura de tarjeta SD y sin lector de disco',
  },
  '7 inch full colour LCD touch screen': {
    pt: 'tela LCD sensível ao toque de 7 polegadas, colorida',
    es: 'pantalla LCD táctil de 7 pulgadas, a color',
  },
  'one Type A on the top panel for a mobile device, one Type B on the rear for a computer': {
    pt: 'uma Type A no painel de cima para um aparelho móvel, uma Type B atrás para um computador',
    es: 'una Type A en el panel superior para un equipo móvil, una Type B atrás para una computadora',
  },
  'one 1/4 inch stereo jack and one 3.5 mm stereo mini jack': {
    pt: 'um jack estéreo de 1/4 de polegada e um mini jack estéreo de 3,5 mm',
    es: 'un jack estéreo de 1/4 de pulgada y un mini jack estéreo de 3,5 mm',
  },
  'October 2024': { pt: 'outubro de 2024', es: 'octubre de 2024' },
  'November 2019': { pt: 'novembro de 2019', es: 'noviembre de 2019' },
  '10.1 inch capacitive touch screen': {
    pt: 'tela sensível ao toque capacitiva de 10,1 polegadas',
    es: 'pantalla táctil capacitiva de 10,1 pulgadas',
  },
  '895 mm wide, 504 mm deep, 133 mm high': {
    pt: '895 mm de largura, 504 mm de profundidade, 133 mm de altura',
    es: '895 mm de ancho, 504 mm de profundidad, 133 mm de alto',
  },
  '878 mm wide, 466 mm deep, 118 mm high': {
    pt: '878 mm de largura, 466 mm de profundidade, 118 mm de altura',
    es: '878 mm de ancho, 466 mm de profundidad, 118 mm de alto',
  },
  '320mm wide, 106mm high': {
    pt: '320 mm de largura, 106 mm de altura',
    es: '320 mm de ancho, 106 mm de alto',
  },
  '336mm wide, 410mm deep, 109mm high': {
    pt: '336 mm de largura, 410 mm de profundidade, 109 mm de altura',
    es: '336 mm de ancho, 410 mm de profundidad, 109 mm de alto',
  },
  'XDJ-AZ in black, and the XDJ-AZ-N in gold': {
    pt: 'XDJ-AZ em preto, e o XDJ-AZ-N em dourado',
    es: 'XDJ-AZ en negro, y el XDJ-AZ-N en dorado',
  },
  'XDJ-XZ in black, the XDJ-XZ-N in gold, and the XDJ-XZ-W in white': {
    pt: 'XDJ-XZ em preto, o XDJ-XZ-N em dourado, e o XDJ-XZ-W em branco',
    es: 'XDJ-XZ en negro, el XDJ-XZ-N en dorado, y el XDJ-XZ-W en blanco',
  },
};

/**
 * Translate a prose value from facts.js. English passes through untouched, and a
 * key with no entry falls back to English rather than to nothing, so a page can
 * never render a blank where a specification belongs.
 */
export function prose(lang, s) {
  if (s == null || lang === 'en') return s;
  return PROSE[s]?.[lang] ?? s;
}
