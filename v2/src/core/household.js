// ABRP v2 — домакинство: разходи, надбавки, осигуровки, данък.
//
// Ред на смятане (важен и в Швейцария, и в Норвегия):
//   оборот → минус кола → печалба → минус осигуровки
//          → минус квоти → облагаема основа → данък → в джоба
//
// ВАЖНО ЗА КОЛАТА — не се вади два пъти:
//   carCost е реалният паричен поток и вече е извадeн от печалбата.
//   Километричната квота е стандартен разход ВМЕСТО доказване на реалните.
//   В почти всички данъчни системи се избира ЕДНОТО, не и двете.
//   Затова тук се признава по-голямото от двете, а не сборът.
//
//   За професионален таксиметров шофьор обикновено важат реалните разходи;
//   плоската километрична ставка е по-скоро за служебно ползване на лична
//   кола. Ако при теб е приложима квотата, тя ще е по-голямата и ще се вземе.
//
// Наемът НЕ е бизнес разход. Вади се от остатъка, но не от основата.

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

  // --- лични разходи (не намаляват данъчната основа) ---
  const rent     = p.rent;
  const budget   = p.budget;
  const health   = adults * city.ha + kids * city.hc;
  const basic    = adults * 300;
  const expenses = rent + budget + health + basic;

  const benefits = kids * city.cb;

  // --- осигуровки: върху печалбата след разходите за колата ---
  const profit = Math.max(0, monthResult.profit);
  const social = Math.round(profit * (city.sc / 100));

  // --- данъчни квоти ---
  const profitYear  = monthResult.profit * 12;
  const socialYear  = social * 12;
  const kmYear      = monthResult.km * 12;

  const carYear     = monthResult.carCost * 12;   // реални разходи, вече в печалбата
  const kmDeduct    = kmYear * city.kmRate;       // алтернатива: плоска квота
  const useKmRate   = kmDeduct > carYear;
  // признава се по-голямото; реалните вече са отчетени, затова добавяме
  // само превишението на квотата над тях
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
    size, rent, budget, health, basic, expenses,
    benefits, social, tax, balance,
    kmYear, kmDeduct, carYear, useKmRate, vehicleExtra,
    childDeduct, deductions,
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
