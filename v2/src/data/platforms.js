// ABRP v2 — платформи и комисионни.
//
// Комисионната е свойство на платформата, не на града.
//
// Реалната комисионна не е плоска: по-висока на къси курсове, по-ниска
// на дълги. Числата са средно претеглени за типичен микс.
//
// Uber: от 2017 г. няма фиксирана комисионна — пътникът плаща една цена,
// шофьорът получава отделно изчислена сума. Ефективно 20% на дълги,
// над 40% на къси; медиана 25–35% в нерегулирани градове, по-ниско в
// регулираните. Цюрих е регулиран от 2024 (PTLG) → долният край.
//
// TaxiMe София: ~18% на електронни плащания + ~2% при теглене; при кеш
// и дълги курсове значително по-добре → средно ~15%. Полево наблюдение.

export const PLATFORMS = {
  street:   { name:{ bg:'Улица / свои клиенти', en:'Street / own clients' }, pct:0,  fixed:0 },
  fishtaxi: { name:{ bg:'fish.taxi',            en:'fish.taxi' },            pct:0,  fixed:0 },
  taxime:   { name:{ bg:'TaxiMe (София)',       en:'TaxiMe (Sofia)' },       pct:15, fixed:0 },
  freenow:  { name:{ bg:'FreeNow',              en:'FreeNow' },              pct:16, fixed:0 },
  bolt:     { name:{ bg:'Bolt',                 en:'Bolt' },                 pct:20, fixed:0 },
  uber_reg: { name:{ bg:'Uber (регулиран пазар)', en:'Uber (regulated market)' }, pct:25, fixed:0 },
  uber:     { name:{ bg:'Uber (типично)',       en:'Uber (typical)' },       pct:30, fixed:0 },
  uber_bad: { name:{ bg:'Uber (къси курсове)',  en:'Uber (short trips)' },   pct:40, fixed:0 }
};

export const PLATFORM_KEYS = Object.keys(PLATFORMS);

const REGULATED = ['zurich','geneva','basel','bern','winterthur','koeniz','baden','zug','lugano'];

export function defaultPlatform(cityKey) {
  if (cityKey === 'sofia') return 'taxime';
  if (REGULATED.indexOf(cityKey) >= 0) return 'uber_reg';
  return 'uber';
}
