// ABRP v2 — сценарии: автоматично намества плъзгачите.
//
// Всеки сценарий кодира допусканията, до които стигнахме в анализа.
// Разликата между тях е реалната несигурност на плана — не козметика.

export const PRESETS = {
  sofia_now: {
    name: { bg:'София днес', en:'Sofia today' },
    desc: { bg:'Измерената реалност: бронз, местене, TaxiMe 15%, Tesla на ток',
            en:'Measured reality: bronze tier, repositioning, TaxiMe 15%, electric Tesla' },
    city: 'sofia',
    set: { hours:10, commitHours:12, workDays:26, peakFocus:0.6, flow:0.20,
           strategy:0.80, comfort:0.50, carCost:200, tips:150, maxKmDay:250,
           commissionPct:15 }
  },

  first_year: {
    name: { bg:'Първа година на ново място', en:'First year in a new place' },
    desc: { bg:'Нула репутация, нула ранг. Най-тежкият реалистичен сценарий.',
            en:'Zero reputation, zero rank. The hardest realistic case.' },
    set: { hours:9, commitHours:12, workDays:24, peakFocus:0.7, flow:0.05,
           strategy:0.90, comfort:0.60, carCost:400, tips:150, maxKmDay:250 }
  },

  established: {
    name: { bg:'След 2–3 години', en:'After 2–3 years' },
    desc: { bg:'Изграден ранг, познат град, постоянни клиенти в комфорт сегмента',
            en:'Established rank, known city, repeat comfort-segment clients' },
    set: { hours:9, commitHours:12, workDays:25, peakFocus:0.85, flow:0.70,
           strategy:0.60, comfort:0.90, carCost:350, tips:400, maxKmDay:280 }
  },

  optimised: {
    name: { bg:'Оптимизиран план', en:'Optimised plan' },
    desc: { bg:'Всички лостове от PLAN.md: комфорт 90%, ниска комисионна, периферен наем',
            en:'Every lever from PLAN.md: 90% comfort, low commission, peripheral rent' },
    set: { hours:10, commitHours:12, workDays:25, peakFocus:0.85, flow:0.80,
           strategy:0.70, comfort:0.90, carCost:300, tips:500, maxKmDay:260,
           commissionPct:22 }
  },

  part_time: {
    name: { bg:'Такси като допълнение', en:'Taxi as a side income' },
    desc: { bg:'Основен доход от ИТ, таксито само в пиковете',
            en:'Main income from IT, taxi only during peaks' },
    set: { hours:4, commitHours:5, workDays:16, peakFocus:1.0, flow:0.40,
           strategy:0.70, comfort:0.90, carCost:300, tips:200, maxKmDay:150 }
  },

  survival: {
    name: { bg:'Черен сценарий', en:'Worst case' },
    desc: { bg:'Слаб пазар, висока комисионна, скъпа кола. Проверка дали издържаш.',
            en:'Weak market, high commission, expensive car. A stress test.' },
    set: { hours:8, commitHours:11, workDays:22, peakFocus:0.5, flow:0.05,
           strategy:0.50, comfort:0.30, carCost:700, tips:80, maxKmDay:200,
           commissionPct:35 }
  }
};

export const PRESET_KEYS = Object.keys(PRESETS);
