// ABRP v2 — модел на смяната.
//
// Плъзгачът за стратегия НЕ е "приложение срещу улица".
// И в двата края поръчката идва от приложението. Разликата е:
//   strategy = 0 → стоя където ме оставят;  1 → местя се към работата
//
// ЧАСОВЕТЕ СА ДВА ВИДА:
//   hours       — часове зад волана, генерират курсове
//   commitHours — часове извън дома; при разделена смяна са повече.
//
// ПИКОВЕ: city.maxJobsHour е УСРЕДНЕН за денонощието. Каране само в
// пиковете вдига тавана с до 50%. Но пиковете са ~7 часа общо —
// дълга смяна разрежда концентрацията.
//   Цюрих: 1.0 средно → 1.5 при пълна концентрация (полево усещане).
//
// ТРИ ОГРАНИЧЕНИЯ: търсене · време на курс · таван километри

const SEARCH_EFF   = 0.58; // каква част от тавана добира местенето при нулев поток
const CRUISE_KMH   = 29;   // км, изгорени на час активно местене
const PICKUP_KM    = 2.0;  // среден пробег до клиента
const SERVICE_MIN  = 5;    // мин/курс: качване, плащане, чакане
const COMFORT_MAX  = 0.30; // Model S / място за крака → +30% тарифен микс
const STREET_MAX   = 0.10; // дял качвания от улицата — рядкост
const PEAK_BONUS   = 0.50; // с колко пикът е над дневната средна
const PEAK_HOURS   = 7;    // общо часове пик на ден (сутрин + вечер)

export function shift(city, p) {
  const hours   = p.hours;
  const s       = clamp01(p.strategy);
  const flow    = clamp01(p.flow);
  const comfort = clamp01(p.comfort);

  const wantPeak  = clamp01(p.peakFocus);
  const peakShare = Math.min(wantPeak, PEAK_HOURS / Math.max(hours, 1));
  const ceiling   = city.maxJobsHour * (1 + peakShare * PEAK_BONUS);

  let jobsPerHour = ceiling * (flow + s * SEARCH_EFF * (1 - flow));

  const speed       = city.avgSpeed || 24;
  const hoursPerJob = (city.avgTrip + PICKUP_KM) / speed + SERVICE_MIN / 60;
  jobsPerHour = Math.min(jobsPerHour, 1 / hoursPerJob);

  let jobs     = jobsPerHour * hours;
  let loadedKm = jobs * city.avgTrip;
  const saturation = Math.min(1, jobsPerHour / ceiling);
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
    peakShare, ceiling,
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
