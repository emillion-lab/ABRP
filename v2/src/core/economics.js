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
// Настроени така, че при flow=0.20, strategy=0.80, 10ч в София
// смяната да дава ~150 км и ~83€ оборот — измерената реалност.

const FLOW_JOBS   = 2.4;  // курса/час при пълен пасивен поток
const SEARCH_JOBS = 1.6;  // допълнителни курсове/час от активно търсене
const CRUISE_KMH  = 14;   // км/час обикаляне на празно в градски условия
const PICKUP_KM   = 2.0;  // среден пробег до клиента
const SAT_JOBS    = 2.2;  // над този брой курсове/час обикалянето е излишно
const COMFORT_MAX = 0.30; // Model S / повече място за крака → +30% тарифен микс

/**
 * Една смяна.
 * @param {object} city  запис от CITIES
 * @param {object} p     {hours, strategy 0..1, flow 0..1, comfort 0..1}
 */
export function shift(city, p) {
  const hours    = p.hours;
  const s        = clamp01(p.strategy);
  const flow     = clamp01(p.flow);
  const comfort  = clamp01(p.comfort);

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

  // Приход: тарифа по натоварени км + начални такси, вдигнати от комфорт сегмента
  const mix     = 1 + comfort * COMFORT_MAX;
  const revenue = (loadedKm * city.dt + jobs * city.baseFee) * mix;

  return {
    jobs, loadedKm, emptyKm, totalKm, revenue,
    occupancy: totalKm ? loadedKm / totalKm : 0,   // дял платени км
    perKm:     totalKm ? revenue / totalKm : 0,    // €/изминат км, БРУТО
    perHour:   hours ? revenue / hours : 0,
    tariffPct: totalKm ? revenue / totalKm / city.dt : 0  // % от дневната тарифа
  };
}

/** Месечен оборот. carCost е ВСИЧКО за колата: ток/гориво, лизинг, застраховки, гуми. */
export function month(city, p) {
  const d = shift(city, p);
  const revenue = d.revenue * p.workDays + (p.tips || 0);
  return {
    day: d,
    revenue,
    km: d.totalKm * p.workDays,
    carCost: p.carCost,
    profit: revenue - p.carCost          // печалба преди осигуровки и данък
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
