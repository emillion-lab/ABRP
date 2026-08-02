// ABRP v2 — платформи и комисионни.
//
// Комисионната е свойство на платформата, не на града. Един и същ шофьор
// в един и същ град изкарва различно в зависимост от това през кого работи.
//
// pct   процент от оборота (без бакшишите)
// fixed фиксирана месечна такса/абонамент, €
//
// ВНИМАНИЕ при калибровката: измерените софийски смени (70–160€) са
// СЛЕД каквото TaxiMe е удържал. Затова за София pct е нисък —
// иначе разходът се вади два пъти.

export const PLATFORMS = {
  street:   { name: 'Улица / свои клиенти', pct: 0,  fixed: 0 },
  fishtaxi: { name: 'fish.taxi',            pct: 0,  fixed: 0 },
  taxime:   { name: 'TaxiMe (абонамент)',   pct: 0,  fixed: 120 },
  freenow:  { name: 'FreeNow',              pct: 16, fixed: 0 },
  bolt:     { name: 'Bolt',                 pct: 20, fixed: 0 },
  uber:     { name: 'Uber',                 pct: 25, fixed: 0 }
};

export const PLATFORM_KEYS = Object.keys(PLATFORMS);

// Каква платформа е реалистична по подразбиране за даден град
export function defaultPlatform(cityKey) {
  if (cityKey === 'sofia') return 'taxime';
  return 'uber';
}
