// ABRP v2 — оценки, подредба и общ рейтинг.
//
// Всяко измерение поотделно подвежда: Ставангер печели по наем, губи по
// вятър; Цюрих печели по доход, губи по наем. Затова има ⭐ общ рейтинг,
// който ги нормализира и претегля.
//
// Нормализацията е min–max спрямо текущия списък градове, тоест
// рейтингът е ОТНОСИТЕЛЕН — 100 значи "най-добрият тук", не "идеален".

import { climateOf, CLIMATE_WEIGHTS } from './climate.js';

// Оценка за живот със семейство, 1–5. ПРЕЦЕНКА, НЕ ДАННИ.
export const FAMILY = {
  zurich:4, geneva:4, basel:4, bern:5,
  winterthur:5, koeniz:5, baden:5, zug:5, lugano:4,
  munich:5, berlin:3, frankfurt:3, hamburg:4,
  vienna:4, graz:5, salzburg:5,
  oslo:5, stavanger:5, trondheim:5, kristiansand:4,
  copenhagen:5, stockholm:5, helsinki:5, reykjavik:4,
  amsterdam:4, brussels:3, luxembourg:4, paris:2, london:2, dublin:3,
  madrid:3, barcelona:3, valencia:4, malaga:4,
  rome:2, milan:3, lisbon:3, athens:2,
  ljubljana:5, warsaw:3, prague:4, budapest:3, bucharest:2, sofia:3
};

export const OVERALL_WEIGHTS = {
  money:   0.28,
  balance: 0.17,
  rent:    0.13,
  family:  0.20,
  climate: 0.22
};

export const DIMS = {
  overall: { icon:'⭐', label:{ bg:'Общ рейтинг', en:'Overall' },
             unit:{ bg:'от 100', en:'of 100' }, badge:true },
  balance: { icon:'⚖', label:{ bg:'Остатък', en:'Surplus' },
             unit:{ bg:'€/мес', en:'€/mo' }, badge:false },
  money:   { icon:'💲', label:{ bg:'Доход', en:'Income' },
             unit:{ bg:'€/мес печалба', en:'€/mo profit' }, badge:true },
  taxi:    { icon:'🚕', label:{ bg:'Доход от такси', en:'Taxi income' },
             unit:{ bg:'€/ч зад волана', en:'€/h at the wheel' }, badge:true },
  rent:    { icon:'🏠', label:{ bg:'Нисък наем', en:'Low rent' },
             unit:{ bg:'€/мес', en:'€/mo' }, badge:true },
  family:  { icon:'👨‍👩‍👧‍👦', label:{ bg:'За семейство', en:'For family' },
             unit:{ bg:'от 5', en:'of 5' }, badge:true },
  climate: { icon:'☀', label:{ bg:'Климат', en:'Climate' },
             unit:{ bg:'от 100', en:'of 100' }, badge:true },
  wind:    { icon:'💨', label:{ bg:'Завет', en:'Shelter' },
             unit:{ bg:'м/с средно', en:'m/s average' }, badge:false }
};

export const DIM_KEYS = Object.keys(DIMS);

function norm(v, lo, hi) { return hi > lo ? (v - lo) / (hi - lo) : 0.5; }

export function computeScores(rows) {
  rows.forEach(r => {
    const cl = climateOf(r.k);
    r.raw = {
      money:   r.m.profit,
      balance: r.h.balance,
      rent:   -r.c.rentAvg,
      family:  FAMILY[r.k] || 3,
      taxi:    r.m.netPerHour,
      sun:     r.c.sun,
      wind:   -cl.wind,
      rain:   -cl.rain,
      dark:    cl.dark
    };
    r.climateData = cl;
  });

  const range = {};
  ['money','balance','rent','family','taxi','sun','wind','rain','dark'].forEach(k => {
    const vals = rows.map(r => r.raw[k]);
    range[k] = { lo: Math.min.apply(null, vals), hi: Math.max.apply(null, vals) };
  });

  rows.forEach(r => {
    const n = {};
    Object.keys(range).forEach(k => { n[k] = norm(r.raw[k], range[k].lo, range[k].hi); });

    const climate =
      CLIMATE_WEIGHTS.sun  * n.sun  +
      CLIMATE_WEIGHTS.wind * n.wind +
      CLIMATE_WEIGHTS.rain * n.rain +
      CLIMATE_WEIGHTS.dark * n.dark;

    const overall =
      OVERALL_WEIGHTS.money   * n.money   +
      OVERALL_WEIGHTS.balance * n.balance +
      OVERALL_WEIGHTS.rent    * n.rent    +
      OVERALL_WEIGHTS.family  * n.family  +
      OVERALL_WEIGHTS.climate * climate;

    r.scores = {
      overall: Math.round(overall * 100),
      balance: r.raw.balance,
      money:   r.raw.money,
      taxi:    r.raw.taxi,
      rent:    r.raw.rent,
      family:  r.raw.family,
      climate: Math.round(climate * 100),
      wind:    r.raw.wind
    };
    r.climatePct = Math.round(climate * 100);
  });

  return rows;
}

export function display(dim, r) {
  const s = r.scores;
  switch (dim) {
    case 'overall': return s.overall;
    case 'money':   return Math.round(s.money) + '€';
    case 'taxi':    return s.taxi.toFixed(1) + '€';
    case 'rent':    return Math.round(r.c.rentAvg) + '€';
    case 'family':  return s.family + '/5';
    case 'climate': return s.climate;
    case 'wind':    return r.climateData.wind.toFixed(1);
    default:        return (s.balance >= 0 ? '+' : '') + Math.round(s.balance) + '€';
  }
}

export function badgeMap(rows) {
  const out = {};
  rows.forEach(r => { out[r.k] = []; });
  DIM_KEYS.filter(d => DIMS[d].badge).forEach(dim => {
    const sorted = rows.slice().sort((a, b) => b.scores[dim] - a.scores[dim]);
    const cut = Math.max(3, Math.ceil(sorted.length / 3));
    sorted.slice(0, cut).forEach(r => out[r.k].push(DIMS[dim].icon));
  });
  return out;
}
