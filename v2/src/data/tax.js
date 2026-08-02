// ABRP v2 — данъчен слой.
//
// Отделен файл нарочно: данъчните данни имат различен жизнен цикъл от
// тарифите и различна степен на достоверност. Тук се вижда какво е
// проверено и какво е оценка.
//
// ver: 'V' проверено срещу официален или професионален източник, авг. 2026
//      'P' частично — структурата е проверена, числото е приблизително
//      'E' оценка, НЕ Е ПРОВЕРЕНО
//
// sc      осигуровки като % от печалбата
// scFixed осигуровки като фиксирана сума €/мес (Испания работи така)
// tr      пределна данъчна ставка %
// kmRate  данъчно признат разход €/км
//
// Общо социалната тежест = печалба × sc% + scFixed

export const TAX = {
  // ---------- ПРОВЕРЕНИ ----------
  CH: { sc: 11.5, scFixed: 0, ver: 'V',
        src: 'AHV/IV/EO 10.0% за самонаети (пълна ставка над CHF 60 500, ' +
             'дегресивна скала от 5.371% под това, минимум CHF 530/год) ' +
             '+ Familienausgleichskasse ~1.45%. ALV не е достъпна за самонаети.' },
  NO: { sc: 10.8, scFixed: 0, ver: 'V',
        src: 'Trygdeavgift за næringsinntekt 10.8% от 2026 (свалена от 10.9%). ' +
             'По-висока от 7.6% за заплата, защото няма arbeidsgiveravgift.' },
  DE: { sc: 0, scFixed: 0, ver: 'P',
        src: 'Kindergeld 259€/мес и Kinderfreibetrag 9756€ са проверени за 2026. ' +
             'Самонаетите не са задължени за пенсионно; здравното е в ha. ' +
             'Реалната тежест зависи от доброволно осигуряване.' },
  ES: { sc: 0, scFixed: 400, ver: 'V',
        src: 'Cuota de autónomos 2026: 15 групи, ~200–590€/мес според нетния ' +
             'доход. Вноските са замразени спрямо 2025. Tarifa plana 80€/мес ' +
             'първата година. Тук е взета средна група.' },

  // ---------- ЧАСТИЧНО ----------
  AT: { sc: 26.8, scFixed: 0, ver: 'P',
        src: 'SVS за самонаети: пенсионно 18.5% + здравно 6.8% + ' +
             'Selbständigenvorsorge 1.53%. Структурата е сигурна, ' +
             'точната база и тавани не са проверени за 2026.' },
  NL: { sc: 5.3, scFixed: 0, ver: 'P',
        src: 'Zvw-bijdrage за ZZP. Няма задължително пенсионно. ' +
             'Ставката за 2026 не е проверена.' },

  // ---------- ОЦЕНКИ, НЕ СА ПРОВЕРЕНИ ----------
  IT: { sc: 25.7, scFixed: 0, ver: 'E', src: 'Gestione Separata INPS, приблизително' },
  FR: { sc: 22.0, scFixed: 0, ver: 'E', src: 'Micro-entrepreneur, приблизително' },
  BE: { sc: 20.5, scFixed: 0, ver: 'E', src: 'INASTI, приблизително' },
  PT: { sc: 21.4, scFixed: 0, ver: 'E', src: 'Segurança Social, приблизително' },
  GR: { sc: 0, scFixed: 250, ver: 'E', src: 'EFKA фиксирани класове, приблизително' },
  SI: { sc: 16.0, scFixed: 0, ver: 'E', src: 'ZZZS + ZPIZ, приблизително' },
  PL: { sc: 0, scFixed: 380, ver: 'E', src: 'ZUS фиксирана база, приблизително' },
  CZ: { sc: 0, scFixed: 300, ver: 'E', src: 'OSVČ минимални вноски, приблизително' },
  HU: { sc: 18.5, scFixed: 0, ver: 'E', src: 'приблизително' },
  RO: { sc: 35.0, scFixed: 0, ver: 'E', src: 'CAS 25% + CASS 10% върху база, приблизително' },
  BG: { sc: 27.8, scFixed: 0, ver: 'E',
        src: 'Самоосигуряващо се лице: ДОО + ДЗПО + здравно върху избран доход. ' +
             'Не е проверено за 2026 след въвеждането на еврото.' },
  DK: { sc: 8.0,  scFixed: 0, ver: 'E', src: 'AM-bidrag, приблизително' },
  SE: { sc: 28.97, scFixed: 0, ver: 'E', src: 'Egenavgifter, приблизително' },
  FI: { sc: 24.1, scFixed: 0, ver: 'E', src: 'YEL, приблизително' },
  IS: { sc: 12.0, scFixed: 0, ver: 'E', src: 'приблизително' },
  IE: { sc: 4.1,  scFixed: 0, ver: 'E', src: 'PRSI Class S, приблизително' },
  GB: { sc: 6.0,  scFixed: 0, ver: 'E', src: 'Class 2 + Class 4 NIC, приблизително' },
  LU: { sc: 24.0, scFixed: 0, ver: 'E', src: 'CCSS, приблизително' }
};

// кой град към коя данъчна юрисдикция
export const CITY_TAX = {
  zurich:'CH', geneva:'CH', basel:'CH', bern:'CH',
  winterthur:'CH', koeniz:'CH', baden:'CH', zug:'CH', lugano:'CH',
  munich:'DE', berlin:'DE', frankfurt:'DE', hamburg:'DE',
  vienna:'AT', graz:'AT', salzburg:'AT',
  oslo:'NO', stavanger:'NO', trondheim:'NO',
  copenhagen:'DK', stockholm:'SE', helsinki:'FI', reykjavik:'IS',
  amsterdam:'NL', brussels:'BE', luxembourg:'LU', paris:'FR',
  london:'GB', dublin:'IE',
  madrid:'ES', barcelona:'ES', valencia:'ES', malaga:'ES',
  rome:'IT', milan:'IT', lisbon:'PT', athens:'GR',
  ljubljana:'SI', warsaw:'PL', prague:'CZ', budapest:'HU',
  bucharest:'RO', sofia:'BG'
};

/** Прилага данъчния слой върху CITIES. Извиква се веднъж при старт. */
export function applyTax(CITIES) {
  Object.keys(CITIES).forEach(k => {
    const code = CITY_TAX[k];
    const t = code && TAX[code];
    if (!t) { CITIES[k].taxVer = 'E'; CITIES[k].scFixed = 0; return; }
    CITIES[k].sc      = t.sc;
    CITIES[k].scFixed = t.scFixed;
    CITIES[k].taxVer  = t.ver;
    CITIES[k].taxSrc  = t.src;
    CITIES[k].country = code;
  });
}
