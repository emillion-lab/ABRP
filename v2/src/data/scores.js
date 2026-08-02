// ABRP v2 — оценки и подредба по критерий.
//
// Пет измерения. Всяко има икона, начин на смятане и единица.
// Иконата се показва на картата само ако градът е в горната трета
// по това измерение — иначе иконите губят смисъл.
//
// Забележка: ☀ и 🏠 идват от данни. 💲 и 🚕 се смятат от модела и се
// менят с плъзгачите. 👨‍👩‍👧‍👦 е преценка, не измерване — виж FAMILY.

// Оценка за живот със семейство, 1–5.
// Критерии: безопасност, училища и извънкласни дейности, зелени площи,
// размер (пешеходност), здравеопазване, натиск на разходите.
// ТОВА Е ПРЕЦЕНКА, НЕ ДАННИ.
export const FAMILY = {
  zurich:4, geneva:4, basel:4, bern:5,
  winterthur:5, koeniz:5, baden:5, zug:5, lugano:4,
  munich:5, berlin:3, frankfurt:3, hamburg:4,
  vienna:4, graz:5, salzburg:5,
  oslo:5, stavanger:5, trondheim:5,
  copenhagen:5, stockholm:5, helsinki:5, reykjavik:4,
  amsterdam:4, brussels:3, luxembourg:4, paris:2, london:2, dublin:3,
  madrid:3, barcelona:3, valencia:4, malaga:4,
  rome:2, milan:3, lisbon:3, athens:2,
  ljubljana:5, warsaw:3, prague:4, budapest:3, bucharest:2, sofia:3
};

export const DIMS = {
  balance: { icon:'⚖', label:{ bg:'Остатък', en:'Surplus' },
             unit:{ bg:'€/мес', en:'€/mo' }, badge:false },
  sun:     { icon:'☀', label:{ bg:'Слънце', en:'Sunshine' },
             unit:{ bg:'ч/год', en:'h/yr' }, badge:true },
  money:   { icon:'💲', label:{ bg:'Доход', en:'Income' },
             unit:{ bg:'€/мес печалба', en:'€/mo profit' }, badge:true },
  rent:    { icon:'🏠', label:{ bg:'Нисък наем', en:'Low rent' },
             unit:{ bg:'€/мес', en:'€/mo' }, badge:true },
  family:  { icon:'👨‍👩‍👧‍👦', label:{ bg:'За семейство', en:'For family' },
             unit:{ bg:'от 5', en:'of 5' }, badge:true },
  taxi:    { icon:'🚕', label:{ bg:'Доход от такси', en:'Taxi income' },
             unit:{ bg:'€/ч зад волана', en:'€/h at the wheel' }, badge:true }
};

export const DIM_KEYS = Object.keys(DIMS);

/** Стойността на един град по едно измерение. По-високо = по-добре. */
export function score(dim, city, key, m, h) {
  switch (dim) {
    case 'sun':     return city.sun;
    case 'money':   return m.profit;
    case 'rent':    return -city.rentAvg;      // по-нисък наем = по-добре
    case 'family':  return FAMILY[key] || 3;
    case 'taxi':    return m.netPerHour;
    default:        return h.balance;
  }
}

/** Стойността както се показва на картата. */
export function display(dim, city, key, m, h) {
  switch (dim) {
    case 'sun':    return city.sun;
    case 'money':  return Math.round(m.profit) + '€';
    case 'rent':   return Math.round(city.rentAvg) + '€';
    case 'family': return (FAMILY[key] || 3) + '/5';
    case 'taxi':   return m.netPerHour.toFixed(1) + '€';
    default:       return (h.balance >= 0 ? '+' : '') + Math.round(h.balance) + '€';
  }
}

/**
 * Кои икони заслужава всеки град: горната трета по всяко измерение,
 * което подлежи на значка.
 */
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
