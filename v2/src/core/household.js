// ABRP v2 — домакинство: разходи, надбавки, осигуровки, данък.
//
// Ред на смятане (важен и в Швейцария, и в Норвегия):
//   оборот → минус кола → печалба → минус осигуровки → минус данък → в джоба

export function familyMultiplier(size) {
  if (size <= 2) return 0.85;
  if (size === 3) return 1.00;
  if (size === 4) return 1.30;
  if (size === 5) return 1.60;
  return 2.00;
}

export function household(city, p, monthResult) {
  const adults = p.adults, kids = p.kids;
  const size   = adults + kids;

  // --- разходи ---
  const rent    = p.rent;
  const budget  = p.budget;
  const health  = adults * city.ha + kids * city.hc;
  const basic   = adults * 300;
  const expenses = rent + budget + health + basic;

  // --- надбавки ---
  const benefits = kids * city.cb;

  // --- осигуровки: върху печалбата СЛЕД разходите за колата ---
  const profit = Math.max(0, monthResult.profit);
  const social = Math.round(profit * (city.sc / 100));

  // --- данъчни облекчения (годишни, показват се отделно) ---
  const kmYear      = monthResult.km * 12;
  const kmRelief    = kmYear * city.kmRate * (city.tr / 100);
  const childRelief = kids * city.cd * (city.tr / 100);
  const reliefYear  = kmRelief + childRelief;

  const balance = monthResult.profit + benefits - expenses - social;

  return {
    size, rent, budget, health, basic, expenses,
    benefits, social, balance,
    reliefYear,
    reliefMonth: reliefYear / 12,
    balanceYear: balance * 12,
    // колко км на ден са нужни само за да се покрият разходите
    breakEvenKm: monthResult.day.perKm > 0
      ? Math.ceil((expenses + social - benefits + monthResult.carCost)
          / (monthResult.day.perKm * p.workDays))
      : 0
  };
}

/** Най-евтиният наем, при който балансът е поне `target`. */
export function affordableRent(city, p, computeFn, target) {
  const step = Math.max(50, Math.round((city.rentMax - city.rentMin) / 60));
  let best = null;
  for (let r = city.rentMin; r <= city.rentMax; r += step) {
    const h = computeFn(Object.assign({}, p, { rent: r }));
    if (h.balance >= target) { best = r; break; }
  }
  return best;
}
