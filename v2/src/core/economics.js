// ABRP v2 — модел на смяната.
//
// Централната идея: празните километри НЕ се определят от наема,
// а от стратегията на шофьора и от това колко адреси му дава платформата.
//
//   strategy = 0  → стоя където ме е оставил клиентът, чакам поръчка
//   strategy = 1  → обикалям активно и търся клиенти от улицата
//
// Кое от двете печели зависи от FLOW — пасивния поток поръчки.
// Висок ранг в приложението = много адреси = няма смисъл да се движиш.
// Бронзов ранг = малко адреси = движението е единственият начин.

// --- калибровъчни константи -------------------------------------------
// Опорна точка: София, бронзов партньор (flow 0.20), активно търсене (0.80),
// 10ч смяна, комфорт 50%, TaxiMe 15%, кола 200€/мес, среден курс 4 км.
//
//   ~204 км/смяна · ~16 курса · оборот по апарата ~106€
//   след комисионна ~90€ · след колата ~81€ в джоба
//     ← измерената типична смяна, август 2026
//
// Ако реална смяна не съвпадне, тези числа се пипат ПЪРВИ.

const FLOW_JOBS   = 2.40; // курса/час при пълен пасивен поток
const SEARCH_JOBS = 1.80; // допълнителни курсове/час от активно търсене
const CRUISE_KMH  = 29;   // км, изгорени на час активно обикаляне
const PICKUP_KM   = 2.0;  // среден пробег до клиента
const SAT_JOBS    = 3.0;  // над този брой курсове/час обикалянето е излишно
const COMFORT_MAX = 0.30; // Model S / повече място за крака → +30% тарифен микс
const STREET_MAX  = 0.35; // максимален дял курсове от улицата при пълно търсене

/**
 * Една смяна.
 * @param {object} city  запис от CITIES
 * @param {object} p     {hours, strategy 0..1, flow 0..1, comfort 0..1}
 */
export function shift(city, p) {
  const hours   = p.hours;
  const s       = clamp01(p.strategy);
  const flow    = clamp01(p.flow);
  const comfort = clamp01(p.comfort);

  // Колко курса намираш на час.
  // Търсенето помага толкова повече, колкото по-слаб е пасивният поток.
  const jobsPerHour = flow * FLOW_JOBS + s * SEARCH_JOBS * (1 - flow);
  const jobs        = jobsPerHour * hours;

  const loadedKm = jobs * city.avgTrip;

  // Празни километри: отиване до клиента + обикаляне.
  // Обикалянето е безполезно, когато поръчките и без това валят.
  const saturation = Math.min(1, jobsPerHour / SAT_JOBS);
  const pickupKm   = jobs * PICKUP_KM;
  const cruiseKm   = s * CRUISE_KMH * hours * (1 - saturation);
  const emptyKm    = pickupKm + cruiseKm;

  const totalKm = loadedKm + emptyKm;

  // Колкото повече обикаляш, толкова повече хора те махват от улицата.
  // Такса повикване пада само на диспечираните курсове.
  const streetShare    = s * STREET_MAX;
  const dispatchedJobs = jobs * (1 - streetShare);

  // Оборот на апарата, ПРЕДИ комисионна. Четири пера:
  //   километрично + начална такса + престой + повикване
  const mix      = 1 + comfort * COMFORT_MAX;
  const kmPart   = loadedKm * city.dt;
  const basePart = jobs * (city.baseFee + (city.timeFee || 0));
  const callPart = dispatchedJobs * (city.callFee || 0);
  const gross    = (kmPart + basePart + callPart) * mix;

  return {
    jobs, dispatchedJobs, streetShare,
    loadedKm, emptyKm, totalKm, gross,
    kmPart:   kmPart * mix,
    basePart: basePart * mix,
    callPart: callPart * mix,
    avgFare:   jobs ? gross / jobs : 0,
    occupancy: totalKm ? loadedKm / totalKm : 0,
    perKm:     totalKm ? gross / totalKm : 0,
    perHour:   hours ? gross / hours : 0,
    tariffPct: totalKm ? gross / totalKm / city.dt : 0
  };
}

/**
 * Месечен резултат.
 * carCost е ВСИЧКО за колата: ток/гориво, лизинг, застраховки, гуми, ремонти.
 * Комисионната се удържа от оборота, но НЕ от бакшишите.
 */
export function month(city, p) {
  const d     = shift(city, p);
  const fares = d.gross * p.workDays;
  const tips  = p.tips || 0;

  const commission = fares * ((p.commissionPct || 0) / 100)
                   + (p.commissionFixed || 0);

  const net = fares - commission + tips;

  return {
    day: d,
    fares, tips, commission,
    revenue: net,
    km: d.totalKm * p.workDays,
    carCost: p.carCost,
    profit: net - p.carCost,
    netPerKm: d.totalKm ? (net / p.workDays) / d.totalKm : 0,
    netPerShift: (net - p.carCost) / p.workDays
  };
}

/**
 * Търси стратегията с най-висока печалба за дадения град и настройки.
 * Полезно, защото отговорът се обръща: при висок поток е по-добре да чакаш.
 */
export function bestStrategy(city, p) {
  let best = { strategy: 0, profit: -Infinity };
  for (let s = 0; s <= 1.0001; s += 0.05) {
    const m = month(city, Object.assign({}, p, { strategy: s }));
    if (m.profit > best.profit) best = { strategy: s, profit: m.profit };
  }
  return best;
}

function clamp01(x) { return Math.max(0, Math.min(1, x || 0)); }
