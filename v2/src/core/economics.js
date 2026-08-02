// ABRP v2 — модел на смяната.
//
// Плъзгачът за стратегия НЕ е "приложение срещу улица".
// И в двата края поръчката идва от приложението. Разликата е:
//
//   strategy = 0  → стоя където ме е оставил клиентът и чакам
//   strategy = 1  → местя се към зоната, в която има работа
//
// ТРИ ОГРАНИЧЕНИЯ, всяко от които може да е обвързващото:
//   1. ТЪРСЕНЕ  — city.maxJobsHour: колко курса пазарът изобщо дава
//   2. ВРЕМЕ    — колко трае един курс при местната скорост
//   3. КИЛОМЕТРИ— p.maxKmDay: колко си готов да изминеш
//
// Без (1) моделът произвежда безсмислици: софийските 2.4 курса/час,
// приложени към 8-километров цюрихски курс, дават 192 натоварени км
// и над 1200€ на смяна. Проверка: 30 CHF/час при ~43 CHF курс и 30%
// комисионна означава ОКОЛО ЕДИН курс на час в Цюрих.

const SEARCH_EFF   = 0.58; // каква част от тавана добира местенето при нулев поток
const CRUISE_KMH   = 29;   // км, изгорени на час активно местене
const PICKUP_KM    = 2.0;  // среден пробег до клиента
const SERVICE_MIN  = 5;    // мин/курс: качване, плащане, чакане на клиента
const COMFORT_MAX  = 0.30; // Model S / място за крака → +30% тарифен микс
const STREET_MAX   = 0.10; // дял качвания от улицата — рядкост, не стратегия

/**
 * Една смяна.
 * @param {object} city  запис от CITIES
 * @param {object} p     {hours, strategy, flow, comfort, maxKmDay}
 */
export function shift(city, p) {
  const hours   = p.hours;
  const s       = clamp01(p.strategy);
  const flow    = clamp01(p.flow);
  const comfort = clamp01(p.comfort);

  // (1) Търсене: таванът е свойство на града
  const ceiling  = city.maxJobsHour;
  let jobsPerHour = ceiling * (flow + s * SEARCH_EFF * (1 - flow));

  // (2) Време: един курс трае толкова, колкото трае
  const speed      = city.avgSpeed || 24;
  const hoursPerJob = (city.avgTrip + PICKUP_KM) / speed + SERVICE_MIN / 60;
  jobsPerHour = Math.min(jobsPerHour, 1 / hoursPerJob);

  let jobs       = jobsPerHour * hours;
  let loadedKm   = jobs * city.avgTrip;
  const saturation = Math.min(1, jobsPerHour / ceiling);
  let pickupKm   = jobs * PICKUP_KM;
  let cruiseKm   = s * CRUISE_KMH * hours * (1 - saturation);
  let totalKm    = loadedKm + pickupKm + cruiseKm;

  // (3) Километри: ако таванът е под нужното, реже се обикалянето първо,
  //     после и курсовете
  const capKm = p.maxKmDay || Infinity;
  let kmLimited = false;
  if (totalKm > capKm) {
    kmLimited = true;
    const need = loadedKm + pickupKm;
    if (need <= capKm) {
      cruiseKm = capKm - need;          // стига да режем празното обикаляне
    } else {
      cruiseKm = 0;                     // не стига — режем и курсове
      const scale = capKm / need;
      jobs *= scale; loadedKm *= scale; pickupKm *= scale;
    }
    totalKm = loadedKm + pickupKm + cruiseKm;
  }

  const emptyKm = pickupKm + cruiseKm;

  // Почти всички курсове са диспечирани → таксата повикване е почти винаги там.
  const streetShare    = s * STREET_MAX;
  const dispatchedJobs = jobs * (1 - streetShare);

  const mix      = 1 + comfort * COMFORT_MAX;
  const kmPart   = loadedKm * city.dt;
  const basePart = jobs * (city.baseFee + (city.timeFee || 0));
  const callPart = dispatchedJobs * (city.callFee || 0);
  const gross    = (kmPart + basePart + callPart) * mix;

  return {
    jobs, dispatchedJobs, streetShare, kmLimited,
    jobsPerHour: hours ? jobs / hours : 0,
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
    netPerShift: (net - p.carCost) / p.workDays,
    netPerHour: p.hours ? ((net - p.carCost) / p.workDays) / p.hours : 0
  };
}

export function bestStrategy(city, p) {
  let best = { strategy: 0, profit: -Infinity };
  for (let s = 0; s <= 1.0001; s += 0.05) {
    const m = month(city, Object.assign({}, p, { strategy: s }));
    if (m.profit > best.profit) best = { strategy: s, profit: m.profit };
  }
  return best;
}

function clamp01(x) { return Math.max(0, Math.min(1, x || 0)); }
