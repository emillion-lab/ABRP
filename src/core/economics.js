// ABRP v2 — модел на смяната.
//
// city.maxJobsHour е НАЙ-ДОБРИЯТ случай: топ партньор, каране само в
// пиковете, активно местене. Реалната стойност се получава чрез
// натовареност (utilization), която е претеглена комбинация от трите
// лоста и има ПОД — дори нов шофьор, който стои, взима някаква работа.
//
//   utilization = 0.28 + 0.68 × (0.45·поток + 0.30·пикове + 0.25·местене)
//
// Тежестите казват кое колко тежи: потокът (рангът в приложението) е
// най-силният лост, после часът на деня, накрая позиционирането.
//
// Стар вариант умножаваше тавана директно по потока и даваше 0.54 курса/час
// в Цюрих при бронз — един курс на два часа, което не е реалност.
//
// ТРИ ОГРАНИЧЕНИЯ: търсене · време на курс · таван километри

const SEARCH_EFF   = 0.58; // остатък: колко местенето компенсира слаб поток
const CRUISE_KMH   = 29;   // км, изгорени на час активно местене
const PICKUP_KM    = 2.0;  // среден пробег до клиента
const SERVICE_MIN  = 5;    // мин/курс: качване, плащане, чакане
const COMFORT_MAX  = 0.30; // Model S / място за крака → +30% тарифен микс
const STREET_MAX   = 0.10; // дял качвания от улицата — рядкост
const PEAK_HOURS   = 7;    // общо часове пик на ден (сутрин + вечер)

const UTIL_FLOOR   = 0.28; // под: работа има дори при нула поток и стоене
const UTIL_RANGE   = 0.68;
const W_FLOW       = 0.45; // тежест на ранга в приложението
const W_PEAK       = 0.30; // тежест на часа от деня
const W_MOVE       = 0.25; // тежест на позиционирането

export function shift(city, p) {
  const hours   = p.hours;
  const s       = clamp01(p.strategy);
  const flow    = clamp01(p.flow);
  const comfort = clamp01(p.comfort);

  // Пиковете не могат да са повече от 7 часа — дълга смяна ги разрежда
  const peakShare = Math.min(clamp01(p.peakFocus), PEAK_HOURS / Math.max(hours, 1));

  const drivers = W_FLOW * flow + W_PEAK * peakShare + W_MOVE * s;
  const util    = Math.min(1, UTIL_FLOOR + UTIL_RANGE * drivers);

  let jobsPerHour = city.maxJobsHour * util;

  // Време: един курс трае толкова, колкото трае
  const speed       = city.avgSpeed || 24;
  const hoursPerJob = (city.avgTrip + PICKUP_KM) / speed + SERVICE_MIN / 60;
  jobsPerHour = Math.min(jobsPerHour, 1 / hoursPerJob);

  let jobs     = jobsPerHour * hours;
  let loadedKm = jobs * city.avgTrip;
  const saturation = Math.min(1, jobsPerHour / city.maxJobsHour);
  let pickupKm = jobs * PICKUP_KM;
  let cruiseKm = s * CRUISE_KMH * hours * (1 - saturation);
  let totalKm  = loadedKm + pickupKm + cruiseKm;

  const capKm = p.maxKmDay || Infinity;
  let kmLimited = false;
  if (totalKm > capKm) {
    kmLimited = true;
    const need = loadedKm + pickupKm;
    if (need <= capKm) {
      cruiseKm = capKm - need;
    } else {
      cruiseKm = 0;
      const scale = capKm / need;
      jobs *= scale; loadedKm *= scale; pickupKm *= scale;
    }
    totalKm = loadedKm + pickupKm + cruiseKm;
  }

  const emptyKm        = pickupKm + cruiseKm;
  const streetShare    = s * STREET_MAX;
  const dispatchedJobs = jobs * (1 - streetShare);

  const mix      = 1 + comfort * COMFORT_MAX;
  const kmPart   = loadedKm * city.dt;
  const basePart = jobs * (city.baseFee + (city.timeFee || 0));
  const callPart = dispatchedJobs * (city.callFee || 0);
  const gross    = (kmPart + basePart + callPart) * mix;

  return {
    jobs, dispatchedJobs, streetShare, kmLimited,
    peakShare, util, ceiling: city.maxJobsHour,
    jobsPerHour: hours ? jobs / hours : 0,
    loadedKm, emptyKm, totalKm, gross,
    kmPart: kmPart * mix, basePart: basePart * mix, callPart: callPart * mix,
    avgFare:   jobs ? gross / jobs : 0,
    occupancy: totalKm ? loadedKm / totalKm : 0,
    perKm:     totalKm ? gross / totalKm : 0,
    tariffPct: totalKm ? gross / totalKm / city.dt : 0
  };
}

export function month(city, p) {
  const d     = shift(city, p);
  const fares = d.gross * p.workDays;
  const tips  = p.tips || 0;

  const commission = fares * ((p.commissionPct || 0) / 100)
                   + (p.commissionFixed || 0);

  const net      = fares - commission + tips;
  const perShift = (net - p.carCost) / p.workDays;
  const commit   = Math.max(p.commitHours || p.hours, p.hours);

  return {
    day: d, fares, tips, commission,
    revenue: net,
    km: d.totalKm * p.workDays,
    carCost: p.carCost,
    profit: net - p.carCost,
    netPerKm: d.totalKm ? (net / p.workDays) / d.totalKm : 0,
    netPerShift: perShift,
    netPerHour: p.hours ? perShift / p.hours : 0,
    netPerCommitHour: commit ? perShift / commit : 0,
    commitHours: commit,
    monthHours: p.hours * p.workDays,
    monthCommit: commit * p.workDays
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
