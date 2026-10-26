// ABRP v2 — домакинство: разходи, надбавки, осигуровки, данък.
//
// Ред: оборот → минус кола → печалба → минус осигуровки
//      → минус квоти → облагаема основа → данък → в джоба
//
// Осигуровките имат две форми:
//   sc      процент от печалбата (Швейцария, Норвегия, Австрия…)
//   scFixed фиксирана сума на месец (Испания: 200–590€ според група)
// Общата тежест е сборът — държавите ползват едната или другата.
//
// Колата не се вади два пъти: carCost вече е в печалбата, затова от
// километричната квота се признава само превишението над реалните.
//
// Наемът НЕ е бизнес разход и не намалява основата.

export function familyMultiplier(size) {
  if (size <= 2) return 0.85;
  if (size === 3) return 1.00;
  if (size === 4) return 1.30;
  if (size === 5) return 1.60;
  return 2.00;
}

export function household(city, p, monthResult) {
  const adults = p.adults, kids = p.kids;

  const rent     = p.rent;
  const budget   = p.budget;
  const health   = adults * city.ha + kids * city.hc;
  const basic    = adults * 300;
  const expenses = rent + budget + health + basic;

  const benefits = kids * city.cb;

  const profit      = Math.max(0, monthResult.profit);
  const socialPct   = profit * ((city.sc || 0) / 100);
  const socialFixed = profit > 0 ? (city.scFixed || 0) : 0;
  const social      = Math.round(socialPct + socialFixed);

  const profitYear  = monthResult.profit * 12;
  const socialYear  = social * 12;
  const kmYear      = monthResult.km * 12;

  const carYear      = monthResult.carCost * 12;
  const kmDeduct     = kmYear * city.kmRate;
  const useKmRate    = kmDeduct > carYear;
  const vehicleExtra = useKmRate ? (kmDeduct - carYear) : 0;

  const childDeduct = kids * city.cd;
  const deductions  = vehicleExtra + childDeduct;

  const taxableYear = Math.max(0, profitYear - socialYear - deductions);
  const taxYear     = taxableYear * (city.tr / 100);
  const tax         = Math.round(taxYear / 12);

  const taxNoDeduct = Math.max(0, profitYear - socialYear) * (city.tr / 100);
  const reliefYear  = Math.max(0, taxNoDeduct - taxYear);

  const balance = monthResult.profit + benefits - expenses - social - tax;

  return {
    rent, budget, health, basic, expenses,
    benefits, social, socialPct, socialFixed, tax, balance,
    kmYear, kmDeduct, carYear, useKmRate, vehicleExtra,
    childDeduct, deductions,
    taxableYear, taxYear,
    reliefYear,
    effectiveRate: profitYear > 0 ? taxYear / profitYear * 100 : 0,
    balanceYear: balance * 12,
    breakEvenKm: monthResult.day.perKm > 0
      ? Math.ceil((expenses + social + tax - benefits + monthResult.carCost)
          / (monthResult.day.perKm * p.workDays))
      : 0
  };
}
