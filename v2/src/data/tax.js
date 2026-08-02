// ABRP v2 — данъчен слой.
//
// ver: 'V' проверено срещу източник, авг. 2026
//      'P' частично — структурата е проверена, числото е приблизително
//      'E' оценка, НЕ Е ПРОВЕРЕНО

export const TAX = {
  CH: { sc:11.5, scFixed:0, ver:'V', src:{
    bg:'AHV/IV/EO 10.0% за самонаети (пълна ставка над CHF 60 500, дегресивна от 5.371% под това, минимум CHF 530/год) + Familienausgleichskasse ~1.45%. ALV не е достъпна за самонаети.',
    en:'AHV/IV/EO 10.0% for self-employed (full rate above CHF 60,500, sliding from 5.371% below, minimum CHF 530/yr) + family compensation fund ~1.45%. Unemployment insurance is unavailable to the self-employed.' } },
  NO: { sc:10.8, scFixed:0, ver:'V', src:{
    bg:'Trygdeavgift за næringsinntekt 10.8% от 2026 (свалена от 10.9%). По-висока от 7.6% за заплата, защото няма arbeidsgiveravgift.',
    en:'Trygdeavgift on business income 10.8% from 2026 (down from 10.9%). Higher than the 7.6% wage rate because no employer contribution applies.' } },
  DE: { sc:0, scFixed:0, ver:'P', src:{
    bg:'Kindergeld 259€/мес и Kinderfreibetrag 9756€ са проверени за 2026. Самонаетите не са задължени за пенсионно; здравното е в ha.',
    en:'Kindergeld 259€/mo and the 9,756€ child allowance are verified for 2026. The self-employed are not required to contribute to state pension; health cover sits in the health field.' } },
  ES: { sc:0, scFixed:400, ver:'V', src:{
    bg:'Cuota de autónomos 2026: 15 групи, ~200–590€/мес според нетния доход. Вноските са замразени спрямо 2025. Tarifa plana 80€/мес първата година. Тук е взета средна група.',
    en:'Spanish self-employed quota 2026: 15 brackets, roughly 200–590€/mo by net income. Rates frozen versus 2025. Flat rate of 80€/mo in the first year. A mid bracket is used here.' } },

  AT: { sc:26.8, scFixed:0, ver:'P', src:{
    bg:'SVS за самонаети: пенсионно 18.5% + здравно 6.8% + Selbständigenvorsorge 1.53%. Структурата е сигурна, базата и таваните не са проверени за 2026.',
    en:'Austrian self-employed insurance: 18.5% pension + 6.8% health + 1.53% provision. The structure is solid; the base and caps are unverified for 2026.' } },
  NL: { sc:5.3, scFixed:0, ver:'P', src:{
    bg:'Zvw-bijdrage за ZZP. Няма задължително пенсионно. Ставката за 2026 не е проверена.',
    en:'Dutch health contribution for freelancers. No mandatory pension. The 2026 rate is unverified.' } },

  IT: { sc:25.7, scFixed:0, ver:'E', src:{ bg:'Gestione Separata INPS, приблизително', en:'INPS separate scheme, approximate' } },
  FR: { sc:22.0, scFixed:0, ver:'E', src:{ bg:'Micro-entrepreneur, приблизително', en:'Micro-entrepreneur regime, approximate' } },
  BE: { sc:20.5, scFixed:0, ver:'E', src:{ bg:'INASTI, приблизително', en:'Self-employed institute, approximate' } },
  PT: { sc:21.4, scFixed:0, ver:'E', src:{ bg:'Segurança Social, приблизително', en:'Social security, approximate' } },
  GR: { sc:0, scFixed:250, ver:'E', src:{ bg:'EFKA фиксирани класове, приблизително', en:'Fixed contribution classes, approximate' } },
  SI: { sc:16.0, scFixed:0, ver:'E', src:{ bg:'ZZZS + ZPIZ, приблизително', en:'Health and pension funds, approximate' } },
  PL: { sc:0, scFixed:380, ver:'E', src:{ bg:'ZUS фиксирана база, приблизително', en:'Fixed contribution base, approximate' } },
  CZ: { sc:0, scFixed:300, ver:'E', src:{ bg:'Минимални вноски за самонаети, приблизително', en:'Minimum self-employed contributions, approximate' } },
  HU: { sc:18.5, scFixed:0, ver:'E', src:{ bg:'приблизително', en:'approximate' } },
  RO: { sc:35.0, scFixed:0, ver:'E', src:{ bg:'CAS 25% + CASS 10% върху база, приблизително', en:'25% pension + 10% health on a set base, approximate' } },
  BG: { sc:27.8, scFixed:0, ver:'E', src:{
    bg:'Самоосигуряващо се лице: ДОО + ДЗПО + здравно върху избран доход. Не е проверено за 2026 след въвеждането на еврото.',
    en:'Bulgarian self-insured person: pension, supplementary pension and health on a chosen income base. Unverified for 2026 following euro adoption.' } },
  DK: { sc:8.0, scFixed:0, ver:'E', src:{ bg:'AM-bidrag, приблизително', en:'Labour market contribution, approximate' } },
  SE: { sc:28.97, scFixed:0, ver:'E', src:{ bg:'Egenavgifter, приблизително', en:'Self-employed contributions, approximate' } },
  FI: { sc:24.1, scFixed:0, ver:'E', src:{ bg:'YEL, приблизително', en:'Entrepreneur pension insurance, approximate' } },
  IS: { sc:12.0, scFixed:0, ver:'E', src:{ bg:'приблизително', en:'approximate' } },
  IE: { sc:4.1, scFixed:0, ver:'E', src:{ bg:'PRSI Class S, приблизително', en:'Class S social insurance, approximate' } },
  GB: { sc:6.0, scFixed:0, ver:'E', src:{ bg:'Class 2 + Class 4 NIC, приблизително', en:'Class 2 and 4 national insurance, approximate' } },
  LU: { sc:24.0, scFixed:0, ver:'E', src:{ bg:'CCSS, приблизително', en:'Joint social security centre, approximate' } }
};

export const CITY_TAX = {
  zurich:'CH', geneva:'CH', basel:'CH', bern:'CH',
  winterthur:'CH', koeniz:'CH', baden:'CH', zug:'CH', lugano:'CH',
  munich:'DE', berlin:'DE', frankfurt:'DE', hamburg:'DE',
  vienna:'AT', graz:'AT', salzburg:'AT',
  oslo:'NO', stavanger:'NO', trondheim:'NO', kristiansand:'NO',
  copenhagen:'DK', stockholm:'SE', helsinki:'FI', reykjavik:'IS',
  amsterdam:'NL', brussels:'BE', luxembourg:'LU', paris:'FR',
  london:'GB', dublin:'IE',
  madrid:'ES', barcelona:'ES', valencia:'ES', malaga:'ES',
  rome:'IT', milan:'IT', lisbon:'PT', athens:'GR',
  ljubljana:'SI', warsaw:'PL', prague:'CZ', budapest:'HU',
  bucharest:'RO', sofia:'BG'
};

export function applyTax(CITIES) {
  Object.keys(CITIES).forEach(k => {
    const t = TAX[CITY_TAX[k]];
    if (!t) { CITIES[k].taxVer = 'E'; CITIES[k].scFixed = 0; return; }
    CITIES[k].sc = t.sc;
    CITIES[k].scFixed = t.scFixed;
    CITIES[k].taxVer = t.ver;
    CITIES[k].taxSrc = t.src;
    CITIES[k].country = CITY_TAX[k];
  });
}
