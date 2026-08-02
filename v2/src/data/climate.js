// ABRP v2 — климатичен слой.
//
// Урок от Кристиансанд: градът изглеждаше добре по всичко, което гледахме,
// и лош по единственото, което не бяхме погледнали — вятъра.
// Затова тук климатът не е едно число, а четири.
//
// wind  средна скорост на вятъра, м/с
// storm дни годишно със силен вятър (над ~10.8 м/с, 6 по Бофорт)
// rain  дни с валеж годишно
// jan   средна температура през януари, °C
// dark  часове дневна светлина на 21 декември
//
// `dark` вероятно тежи повече от слънчевите часа за семейство с деца:
// три месеца по шест часа светлина се усещат всеки ден.
// Осло 6.0ч срещу Малага 9.5ч е разлика, която не се вижда в "слънчеви часа".
//
// ВСИЧКИ СТОЙНОСТИ СА ОЦЕНКИ по общи климатични данни. Не са проверени
// за 2026 и не идват от метеорологична служба.

export const CLIMATE = {
  zurich:{wind:3.0,storm:8,rain:133,jan:0.5,dark:8.3},
  geneva:{wind:3.2,storm:12,rain:120,jan:1.5,dark:8.5},
  basel:{wind:3.0,storm:8,rain:130,jan:1.5,dark:8.4},
  bern:{wind:2.8,storm:6,rain:130,jan:0,dark:8.4},
  winterthur:{wind:2.8,storm:6,rain:135,jan:0,dark:8.3},
  koeniz:{wind:2.8,storm:6,rain:130,jan:0,dark:8.4},
  baden:{wind:2.8,storm:6,rain:130,jan:0.5,dark:8.3},
  zug:{wind:2.7,storm:5,rain:135,jan:0,dark:8.4},
  lugano:{wind:2.2,storm:4,rain:95,jan:3,dark:8.7},

  munich:{wind:3.3,storm:10,rain:135,jan:-1,dark:8.3},
  berlin:{wind:3.8,storm:14,rain:106,jan:0.5,dark:7.7},
  frankfurt:{wind:3.5,storm:12,rain:120,jan:1,dark:8.0},
  hamburg:{wind:4.3,storm:25,rain:125,jan:1,dark:7.4},

  vienna:{wind:3.8,storm:18,rain:100,jan:0,dark:8.3},
  graz:{wind:2.5,storm:5,rain:110,jan:-1,dark:8.5},
  salzburg:{wind:2.8,storm:8,rain:130,jan:-1.5,dark:8.3},

  oslo:{wind:3.0,storm:10,rain:115,jan:-3,dark:6.0},
  stavanger:{wind:5.5,storm:55,rain:210,jan:2,dark:6.0},
  trondheim:{wind:4.5,storm:40,rain:190,jan:-2,dark:4.5},
  copenhagen:{wind:5.0,storm:35,rain:160,jan:1,dark:7.0},
  stockholm:{wind:3.5,storm:20,rain:165,jan:-2,dark:6.0},
  helsinki:{wind:4.0,storm:25,rain:175,jan:-4,dark:5.8},
  reykjavik:{wind:6.5,storm:80,rain:213,jan:0,dark:4.1},

  amsterdam:{wind:4.8,storm:30,rain:135,jan:3.5,dark:7.7},
  brussels:{wind:4.0,storm:22,rain:200,jan:3.5,dark:7.9},
  luxembourg:{wind:3.5,storm:15,rain:180,jan:1,dark:8.0},
  paris:{wind:3.6,storm:15,rain:111,jan:5,dark:8.2},
  london:{wind:4.2,storm:20,rain:156,jan:5,dark:7.9},
  dublin:{wind:5.2,storm:45,rain:200,jan:5,dark:7.4},

  madrid:{wind:2.5,storm:5,rain:63,jan:6,dark:9.3},
  barcelona:{wind:3.2,storm:8,rain:55,jan:9,dark:9.2},
  valencia:{wind:3.0,storm:6,rain:44,jan:11,dark:9.4},
  malaga:{wind:2.8,storm:5,rain:43,jan:12,dark:9.5},
  rome:{wind:2.8,storm:6,rain:80,jan:8,dark:9.1},
  milan:{wind:1.8,storm:3,rain:100,jan:2,dark:8.7},
  lisbon:{wind:3.5,storm:12,rain:80,jan:11,dark:9.4},
  athens:{wind:3.5,storm:12,rain:79,jan:10,dark:9.4},

  ljubljana:{wind:1.8,storm:3,rain:120,jan:0,dark:8.6},
  warsaw:{wind:3.5,storm:12,rain:160,jan:-2,dark:7.5},
  prague:{wind:3.0,storm:8,rain:130,jan:-1,dark:8.0},
  budapest:{wind:3.0,storm:8,rain:105,jan:0,dark:8.3},
  bucharest:{wind:3.0,storm:10,rain:100,jan:-2,dark:8.6},
  sofia:{wind:2.5,storm:6,rain:100,jan:-1,dark:8.7}
};

export const DEFAULT_CLIMATE = { wind:3.5, storm:15, rain:130, jan:2, dark:8.0 };

export function climateOf(key) { return CLIMATE[key] || DEFAULT_CLIMATE; }

// Тежести вътре в климатичната оценка. Зимната светлина и вятърът тежат
// нарочно много — това са нещата, които се пропускат и после боли.
export const CLIMATE_WEIGHTS = { sun:0.30, wind:0.25, rain:0.15, dark:0.30 };
