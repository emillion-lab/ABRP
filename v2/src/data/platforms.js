// ABRP v2 — платформи и комисионни.
//
// Комисионната е свойство на платформата, не на града.
//
// ВАЖНО: реалната комисионна не е плоска. Тя е по-висока на къси курсове
// (началната такса тежи повече) и по-ниска на дълги. Числата тук са
// СРЕДНО претеглени за типичен микс от курсове.
//
// Uber: от 2017 г. няма фиксирана комисионна — пътникът плаща една цена,
// шофьорът получава отделно изчислена сума. Ефективно 20% на дълги курсове,
// над 40% на къси; медиана 25–35% в нерегулирани градове, по-ниско в
// регулираните. Цюрих е регулиран от 2024 (PTLG) → долният край.
//
// TaxiMe София: ~18% на електронни плащания + ~2% при теглене;
// при кеш и дълги курсове значително по-добре → средно ~15%.
// (потвърдено от полево наблюдение, авг. 2026)

export const PLATFORMS = {
  street:   { name: 'Улица / свои клиенти', pct: 0,  fixed: 0 },
  fishtaxi: { name: 'fish.taxi',            pct: 0,  fixed: 0 },
  taxime:   { name: 'TaxiMe (София)',       pct: 15, fixed: 0 },
  freenow:  { name: 'FreeNow',              pct: 16, fixed: 0 },
  bolt:     { name: 'Bolt',                 pct: 20, fixed: 0 },
  uber_reg: { name: 'Uber (регулиран пазар)', pct: 25, fixed: 0 },
  uber:     { name: 'Uber (типично)',       pct: 30, fixed: 0 },
  uber_bad: { name: 'Uber (къси курсове)',  pct: 40, fixed: 0 }
};

export const PLATFORM_KEYS = Object.keys(PLATFORMS);

const REGULATED = ['zurich', 'geneva', 'basel', 'bern'];

export function defaultPlatform(cityKey) {
  if (cityKey === 'sofia') return 'taxime';
  if (REGULATED.indexOf(cityKey) >= 0) return 'uber_reg';
  return 'uber';
}
