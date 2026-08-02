// ABRP v2 — домакинство: разходи, надбавки, осигуровки, данък.
//
// Ред на смятане (важен и в Швейцария, и в Норвегия):
//   оборот → минус кола → печалба → минус осигуровки
//          → минус данъчни квоти → облагаема основа → данък → в джоба
//
// Километричната квота (kmRate) е стандартно признат разход на изминат км.
// В повечето държави се ползва ВМЕСТО доказване на реалните разходи —
// затова е легитимно да съществува паралелно с carCost, който е
// реалният паричен поток. Квотата не е приход, а намалява данъка.

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
  const rent     = p.rent;
  const budget   = p.budget;
  const health   = adults * city.ha + kids * city.hc;
  const basic    = adults * 300;
  const expenses = rent + budget + health + basic;

  // --- надбавки ---
  const benefits = kids * city.cb;

  // --- осигуровки: върху печалбата СЛЕД разходите за колата ---
  const profit = Math.max(0, monthResult.profit);
  const social = Math.round(profit * (city.sc / 100));

  // --- данък върху дохода ---
  const profitYear   = monthResult.profit * 12;
  const socialYear   = social * 12;
  const kmYear       = monthResult.km * 12;
  const kmDeduct     = kmYear * city.kmRate;      // километрична квота
  const childDeduct  = kids * city.cd;            // квота на дете
  const deductions   = kmDeduct + childDeduct;

  const taxableYear  = Math.max(0, profitYear - socialYear - deductions);
  const taxYear      = taxableYear * (city.tr / 100);
  const tax          = Math.round(taxYear / 12);

  // колко данък пестят квотите — вече РЕАЛНО, не декоративно
  const taxNoDeduct  = Math.max(0, profitYear - socialYear) * (city.tr / 100);
  const reliefYear   = Math.max(0, taxNoDeduct - taxYear);

  const balance = monthResult.profit + benefits - expenses - social - tax;

  return {
    size, rent, budget, health, basic, expenses,
    benefits, social, tax, balance,
    kmYear, kmDeduct, childDeduct, deductions,
    taxableYear, taxYear,
    reliefYear, reliefMonth: reliefYear / 12,
    effectiveRate: profitYear > 0 ? taxYear / profitYear * 100 : 0,
    balanceYear: balance * 12,
    breakEvenKm: monthResult.day.perKm > 0
      ? Math.ceil((expenses + social + tax - benefits + monthResult.carCost)
          / (monthResult.day.perKm * p.workDays))
      : 0
  };
}
