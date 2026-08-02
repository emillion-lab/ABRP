// ABRP v2 — съвети за оптимизация по локация.
//
// Всеки съвет е конкретен: какво да пипнеш и приблизително колко носи.
// `apply` е незадължителна функция, която намества плъзгачите директно.
//
// Числата са оценки, не обещания. Целта е да покажат посоката и
// порядъка, а не да заместят проверка на място.

export const TIPS = {
  zurich: [
    { bg:'Наем 4400 е в града. На 15–20 км (Дитикон, Шлирен, Опфикон) същият метраж е 3300–3600.',
      en:'Rent 4400 is inner-city. 15–20 km out (Dietikon, Schlieren, Opfikon) the same size is 3300–3600.',
      gain:900, apply:{ rent:3500 } },
    { bg:'Uber е 30%. Регулираният режим в кантона е 25% — питай за Limousinen оператор.',
      en:'Uber takes 30%. The regulated cantonal rate is 25% — ask a Limousinen operator.',
      gain:790, apply:{ commissionPct:25 } },
    { bg:'Комфорт сегментът е единственото ти предимство. Model S с място за крака при нулев лизинг.',
      en:'The comfort segment is your only real edge: Model S legroom at zero lease cost.',
      gain:1480, apply:{ comfort:0.9 } },
    { bg:'Летището е основният генератор. Пиковете там са предвидими — това е за какво е BAK.',
      en:'The airport is the main generator. Its peaks are predictable — that is what BAK is for.',
      gain:0, apply:{ peakFocus:0.9 } }
  ],
  winterthur: [
    { bg:'Същият кантон като Цюрих — един Taxiausweis, пълна цюрихска тарифа.',
      en:'Same canton as Zurich — one permit, full Zurich tariff.', gain:0 },
    { bg:'15 км до летище Цюрих. Трансферите са по-дълги курсове и по-добър марж.',
      en:'15 km to Zurich airport. Transfers are longer trips with better margin.',
      gain:0, apply:{ peakFocus:0.85 } },
    { bg:'Свободни жилища 0.14% — седем пъти под националното. Търси месеци предварително.',
      en:'Vacancy 0.14%, seven times below national. Start searching months ahead.', gain:0 }
  ],
  koeniz: [
    { bg:'42 хил. души с Musikschule и спортни клубове в пешеходно разстояние.',
      en:'42k inhabitants with music school and sports clubs within walking distance.', gain:0 },
    { bg:'Наемът е най-ниският швейцарски тук, но пазарът е по-малък от цюрихския.',
      en:'Lowest Swiss rent here, but the market is smaller than Zurich.', gain:0 },
    { bg:'Няма голямо летище. Летищните трансфери отпадат като продукт.',
      en:'No major airport. Airport transfers drop out as a product.', gain:-400 }
  ],
  zug: [
    { bg:'Данък 12% срещу 25% в Цюрих. При печалба 130 хил. това е над 15 хил. годишно.',
      en:'12% tax vs 25% in Zurich. On 130k profit that is over 15k a year.', gain:1300 },
    { bg:'Наемът яде част от данъчното предимство. Провери двете заедно, не поотделно.',
      en:'Rent eats part of the tax advantage. Check both together, not separately.', gain:0 },
    { bg:'Малък пазар. Работи като база, ако караш в Цюрих — 25 мин с S-Bahn.',
      en:'Small market. Works as a base if you drive in Zurich — 25 min by S-Bahn.', gain:0 }
  ],
  lugano: [
    { bg:'Единственото място със швейцарски доход и 2170 слънчеви часа.',
      en:'The only place with Swiss income and 2170 hours of sunshine.', gain:0 },
    { bg:'Италиански, не немски. B1 изискването е за друг език — по-лесен за българин.',
      en:'Italian, not German. The B1 requirement is for a language closer to Bulgarian speakers.', gain:0 },
    { bg:'Наем −40% спрямо Цюрих при 88% от тарифата. Съотношението е по-добро.',
      en:'Rent 40% below Zurich at 88% of the tariff. Better ratio.', gain:0, apply:{ rent:2600 } }
  ],
  stavanger: [
    { bg:'Най-доброто съотношение доход/наем в списъка. Наем 1900 при почти швейцарски тарифи.',
      en:'Best income-to-rent ratio in the list. Rent 1900 at near-Swiss tariffs.', gain:0 },
    { bg:'Осигуровки 10.8% — по-ниски от швейцарските 11.5%. Проверено.',
      en:'Social contributions 10.8%, below the Swiss 11.5%. Verified.', gain:0 },
    { bg:'1400 слънчеви часа и дъжд около 200 дни. Това е цената.',
      en:'1400 sunshine hours and roughly 200 rainy days. That is the price.', gain:0 }
  ],
  oslo: [
    { bg:'Наемът в Осло е двойно над Ставангер при сходна тарифа. Ставангер е по-добрият избор.',
      en:'Oslo rent is double Stavanger at a similar tariff. Stavanger is the better pick.', gain:0 }
  ],
  vienna: [
    { bg:'Осигуровки 26.8% — най-високите в списъка. Изяждат тарифното предимство.',
      en:'26.8% contributions, the highest here. They eat the tariff advantage.', gain:0 },
    { bg:'Грац дава същата държава при наем −45%. Виж го преди Виена.',
      en:'Graz offers the same country at 45% lower rent. Look there first.', gain:0 }
  ],
  graz: [
    { bg:'Наем 1350 срещу 2400 във Виена, при 96% от тарифата. Второ по големина в Австрия.',
      en:'Rent 1350 vs 2400 in Vienna at 96% of the tariff. Austria second city.', gain:0 },
    { bg:'1990 слънчеви часа — над Виена и над Мюнхен.',
      en:'1990 sunshine hours, above Vienna and Munich.', gain:0 }
  ],
  ljubljana: [
    { bg:'Шест часа от София. Планини и море на един час. Наем 1250.',
      en:'Six hours from Sofia. Mountains and sea within an hour. Rent 1250.', gain:0 },
    { bg:'Малък пазар — таванът е 2.6 курса/час, но и разходите са ниски.',
      en:'Small market — 2.6 jobs/h ceiling, but costs are low too.', gain:0 }
  ],
  malaga: [
    { bg:'2900 слънчеви часа, най-много в списъка. Туризъм целогодишно.',
      en:'2900 sunshine hours, the most here. Year-round tourism.', gain:0 },
    { bg:'Осигуровките са ФИКСИРАНА сума 200–590€/мес, не процент. При висок оборот това е предимство.',
      en:'Contributions are a FIXED 200–590€/month, not a percentage. An advantage at high turnover.', gain:0 },
    { bg:'Първата година Tarifa plana е 80€/мес. Реален старт с нисък разход.',
      en:'First year Tarifa plana is 80€/month. A genuinely cheap start.', gain:320 }
  ],
  valencia: [
    { bg:'2700 слънчеви часа при наем −40% спрямо Барселона.',
      en:'2700 sunshine hours at 40% below Barcelona rent.', gain:0 },
    { bg:'Същият фиксиран режим на осигуровки като цяла Испания.',
      en:'Same fixed contribution regime as the rest of Spain.', gain:0 }
  ],
  sofia: [
    { bg:'Базата: жилище без наем и втори доход. Другите градове не го имат.',
      en:'The baseline: no rent and a second income. Other cities lack both.', gain:0 },
    { bg:'Комисионната е 15% — най-ниската извън fish.taxi. Пазарът обаче е свит.',
      en:'Commission is 15%, the lowest outside fish.taxi. But the market is thin.', gain:0 },
    { bg:'Няма километрична квота. Данъчното предимство от пробега отпада.',
      en:'No mileage allowance. The tax benefit from distance does not exist here.', gain:0 }
  ]
};

export const GENERIC_TIPS = [
  { bg:'Средният наем е за града. Периферията на 15–20 км обикновено е с 20–30% по-евтина.',
    en:'Average rent is for the city. The 15–20 km periphery is usually 20–30% cheaper.' },
  { bg:'Всеки процент комисионна струва около 1% от оборота. Преговорите са най-евтиният лост.',
    en:'Each commission point costs about 1% of turnover. Negotiation is the cheapest lever.' },
  { bg:'Пиковете са около 7 часа дневно. По-дълга смяна ги разрежда и сваля печалбата на час.',
    en:'Peaks last about 7 hours a day. A longer shift dilutes them and lowers hourly profit.' }
];
