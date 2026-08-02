// ABRP v2 — единствен източник на истина за градовете.
// Всички суми в ЕВРО. Курс 1 CHF = 1.075 EUR, 1 NOK = 0.085 EUR.
//
// dt          дневна тарифа €/натоварен км
// baseFee     начална такса €/курс
// callFee     такса повикване €/курс — само при поръчка през приложение
// timeFee     средно перо за престой/време на курс, €
// avgTrip     средна дължина на курс, км
// maxJobsHour НАЙ-ДОБРИЯТ случай: топ партньор + пикове + активно местене
// avgSpeed    средна скорост в градски условия, км/ч
// sc          осигуровки самонаето лице, % (0 = непроверено)
// tr          пределна данъчна ставка %
// kmRate      данъчно признат разход €/км
// ha/hc       здравно осигуряване €/мес възрастен / дете
// cb          детски надбавки €/мес на дете
// cd          данъчна квота на дете €/год
// sun         слънчеви часа годишно — климатът НЕ е в сметката, но
//             при семейство от петима е реален фактор
// note        кратко защо градът е в списъка
//
// src:'V' проверена тарифа (авг. 2026) · src:'D' изведена, НЕПРОВЕРЕНА

export const CITIES = {
  // ---------- Швейцария: градове ----------
  zurich:{flag:'ch',name:{bg:'Цюрих',en:'Zurich'},dt:4.30,src:'V',baseFee:7.00,callFee:0,timeFee:4.00,avgTrip:8,maxJobsHour:1.5,avgSpeed:24,sun:1560,
    note:'най-голям пазар, най-скъп наем',
    rentAvg:4400,rentMin:2200,rentMax:8000,budget:1800,cb:231,cd:9000,tr:25,sc:11.5,kmRate:0.75,ha:490,hc:130},
  geneva:{flag:'ch',name:{bg:'Женева',en:'Geneva'},dt:4.30,src:'D',baseFee:7.00,callFee:0,timeFee:4.00,avgTrip:8,maxJobsHour:1.5,avgSpeed:24,sun:1830,
    note:'международни организации, летище',
    rentAvg:4600,rentMin:2300,rentMax:8200,budget:1900,cb:231,cd:9000,tr:25,sc:11.5,kmRate:0.75,ha:490,hc:130},
  basel:{flag:'ch',name:{bg:'Базел',en:'Basel'},dt:4.00,src:'D',baseFee:6.50,callFee:0,timeFee:3.60,avgTrip:7.5,maxJobsHour:1.5,avgSpeed:25,sun:1570,
    note:'триграничен, фарма',
    rentAvg:3800,rentMin:1900,rentMax:7500,budget:1600,cb:231,cd:9000,tr:24,sc:11.5,kmRate:0.75,ha:490,hc:130},
  bern:{flag:'ch',name:{bg:'Берн',en:'Bern'},dt:3.90,src:'D',baseFee:6.50,callFee:0,timeFee:3.60,avgTrip:7.5,maxJobsHour:1.4,avgSpeed:25,sun:1680,
    note:'столица, среден пазар',
    rentAvg:3600,rentMin:1800,rentMax:7000,budget:1500,cb:231,cd:9000,tr:23,sc:11.5,kmRate:0.75,ha:490,hc:130},

  // ---------- Швейцария: периферии за семейство ----------
  winterthur:{flag:'ch',name:{bg:'Винтертур',en:'Winterthur'},dt:4.30,src:'D',baseFee:7.00,callFee:0,timeFee:4.00,avgTrip:9,maxJobsHour:1.3,avgSpeed:27,sun:1560,
    note:'★ същият кантон като Цюрих, 15 км до летището, наем −30%',
    rentAvg:3100,rentMin:1600,rentMax:5500,budget:1700,cb:231,cd:9000,tr:23,sc:11.5,kmRate:0.75,ha:475,hc:127},
  koeniz:{flag:'ch',name:{bg:'Кьониц (Берн)',en:'Koeniz'},dt:3.90,src:'D',baseFee:6.50,callFee:0,timeFee:3.60,avgTrip:8,maxJobsHour:1.2,avgSpeed:27,sun:1680,
    note:'★ 42 хил. души, най-евтин швейцарски наем в списъка',
    rentAvg:2750,rentMin:1400,rentMax:5000,budget:1550,cb:231,cd:9000,tr:22,sc:11.5,kmRate:0.75,ha:465,hc:122},
  baden:{flag:'ch',name:{bg:'Баден (Аргау)',en:'Baden AG'},dt:4.00,src:'D',baseFee:6.50,callFee:0,timeFee:3.50,avgTrip:8.5,maxJobsHour:1.2,avgSpeed:28,sun:1600,
    note:'кантон Аргау — ниски данъци, 20 мин до Цюрих',
    rentAvg:2900,rentMin:1500,rentMax:5200,budget:1600,cb:220,cd:9000,tr:20,sc:11.5,kmRate:0.75,ha:455,hc:120},
  zug:{flag:'ch',name:{bg:'Цуг',en:'Zug'},dt:4.20,src:'D',baseFee:7.00,callFee:0,timeFee:3.80,avgTrip:8,maxJobsHour:1.2,avgSpeed:27,sun:1620,
    note:'★ най-ниски данъци в Швейцария, но и висок наем',
    rentAvg:3900,rentMin:2000,rentMax:7000,budget:1800,cb:250,cd:12000,tr:12,sc:11.5,kmRate:0.75,ha:450,hc:118},
  lugano:{flag:'ch',name:{bg:'Лугано',en:'Lugano'},dt:3.80,src:'D',baseFee:6.50,callFee:0,timeFee:3.40,avgTrip:7,maxJobsHour:1.3,avgSpeed:24,sun:2170,
    note:'★ швейцарски доход, средиземноморски климат, италиански',
    rentAvg:2600,rentMin:1300,rentMax:4800,budget:1500,cb:231,cd:11000,tr:24,sc:11.5,kmRate:0.75,ha:445,hc:118},

  // ---------- Германия ----------
  munich:{flag:'de',name:{bg:'Мюнхен',en:'Munich'},dt:2.30,src:'D',baseFee:5.90,callFee:0,timeFee:2.50,avgTrip:6.5,maxJobsHour:2.0,avgSpeed:23,sun:1710,
    rentAvg:3000,rentMin:1500,rentMax:5500,budget:1400,cb:259,cd:9756,tr:30,sc:0,kmRate:0.30,ha:450,hc:0},
  berlin:{flag:'de',name:{bg:'Берлин',en:'Berlin'},dt:2.30,src:'D',baseFee:4.30,callFee:0,timeFee:2.50,avgTrip:6.5,maxJobsHour:2.2,avgSpeed:23,sun:1630,
    rentAvg:2500,rentMin:1250,rentMax:4800,budget:1200,cb:259,cd:9756,tr:28,sc:0,kmRate:0.30,ha:450,hc:0},
  frankfurt:{flag:'de',name:{bg:'Франкфурт',en:'Frankfurt'},dt:2.40,src:'V',baseFee:4.00,callFee:0,timeFee:2.50,avgTrip:6.5,maxJobsHour:2.0,avgSpeed:24,sun:1670,
    rentAvg:2800,rentMin:1400,rentMax:5200,budget:1300,cb:259,cd:9756,tr:29,sc:0,kmRate:0.30,ha:450,hc:0},
  hamburg:{flag:'de',name:{bg:'Хамбург',en:'Hamburg'},dt:2.30,src:'D',baseFee:4.30,callFee:0,timeFee:2.50,avgTrip:6.5,maxJobsHour:2.0,avgSpeed:24,sun:1500,
    rentAvg:2600,rentMin:1300,rentMax:5000,budget:1250,cb:259,cd:9756,tr:28,sc:0,kmRate:0.30,ha:450,hc:0},

  // ---------- Австрия ----------
  vienna:{flag:'at',name:{bg:'Виена',en:'Vienna'},dt:1.25,src:'V',baseFee:3.80,callFee:0,timeFee:1.80,avgTrip:5.5,maxJobsHour:2.7,avgSpeed:22,sun:1880,
    rentAvg:2400,rentMin:1200,rentMax:4500,budget:1100,cb:236,cd:5000,tr:32,sc:26.8,kmRate:0.42,ha:200,hc:0},
  graz:{flag:'at',name:{bg:'Грац',en:'Graz'},dt:1.20,src:'D',baseFee:3.60,callFee:0,timeFee:1.70,avgTrip:5.5,maxJobsHour:2.4,avgSpeed:24,sun:1990,
    note:'★ втори град на Австрия, наем −45% спрямо Виена, слънчев',
    rentAvg:1350,rentMin:700,rentMax:2700,budget:950,cb:236,cd:5000,tr:30,sc:26.8,kmRate:0.42,ha:200,hc:0},
  salzburg:{flag:'at',name:{bg:'Залцбург',en:'Salzburg'},dt:1.25,src:'D',baseFee:3.80,callFee:0,timeFee:1.80,avgTrip:6,maxJobsHour:2.2,avgSpeed:23,sun:1740,
    note:'туризъм, фестивали, близо до Мюнхен',
    rentAvg:1700,rentMin:850,rentMax:3200,budget:1050,cb:236,cd:5000,tr:31,sc:26.8,kmRate:0.42,ha:200,hc:0},

  // ---------- Скандинавия ----------
  oslo:{flag:'no',name:{bg:'Осло',en:'Oslo'},dt:2.07,src:'D',baseFee:5.00,callFee:0,timeFee:2.80,avgTrip:7,maxJobsHour:1.8,avgSpeed:24,sun:1670,
    note:'добро съотношение доход/наем, но 3 месеца тъмнина',
    rentAvg:3400,rentMin:1700,rentMax:6200,budget:1700,cb:310,cd:11064,tr:30,sc:10.8,kmRate:0.31,ha:0,hc:0},
  stavanger:{flag:'no',name:{bg:'Ставангер',en:'Stavanger'},dt:2.20,src:'D',baseFee:5.50,callFee:0,timeFee:3.00,avgTrip:8,maxJobsHour:1.6,avgSpeed:28,sun:1400,
    note:'★ най-доброто съотношение доход/наем в списъка — но дъжд 200 дни',
    rentAvg:1900,rentMin:950,rentMax:3600,budget:1650,cb:310,cd:11064,tr:30,sc:10.8,kmRate:0.31,ha:0,hc:0},
  trondheim:{flag:'no',name:{bg:'Трондхайм',en:'Trondheim'},dt:2.15,src:'D',baseFee:5.50,callFee:0,timeFee:2.90,avgTrip:7.5,maxJobsHour:1.6,avgSpeed:28,sun:1420,
    note:'университетски, евтин за Норвегия, полярна нощ',
    rentAvg:1750,rentMin:900,rentMax:3400,budget:1600,cb:310,cd:11064,tr:29,sc:10.8,kmRate:0.31,ha:0,hc:0},
  copenhagen:{flag:'dk',name:{bg:'Копенхаген',en:'Copenhagen'},dt:1.96,src:'D',baseFee:5.00,callFee:0,timeFee:2.50,avgTrip:7,maxJobsHour:1.8,avgSpeed:23,sun:1780,
    rentAvg:3200,rentMin:1600,rentMax:5800,budget:1650,cb:290,cd:10872,tr:36,sc:0,kmRate:0.45,ha:0,hc:0},
  stockholm:{flag:'se',name:{bg:'Стокхолм',en:'Stockholm'},dt:1.95,src:'D',baseFee:4.50,callFee:0,timeFee:2.50,avgTrip:7,maxJobsHour:1.8,avgSpeed:24,sun:1820,
    rentAvg:3000,rentMin:1500,rentMax:5400,budget:1500,cb:250,cd:9576,tr:32,sc:0,kmRate:0.40,ha:0,hc:0},
  helsinki:{flag:'fi',name:{bg:'Хелзинки',en:'Helsinki'},dt:1.85,src:'D',baseFee:4.50,callFee:0,timeFee:2.40,avgTrip:7,maxJobsHour:1.8,avgSpeed:25,sun:1780,
    rentAvg:2800,rentMin:1400,rentMax:5000,budget:1450,cb:260,cd:9240,tr:31,sc:0,kmRate:0.40,ha:0,hc:0},
  reykjavik:{flag:'is',name:{bg:'Рейкявик',en:'Reykjavik'},dt:2.01,src:'D',baseFee:5.00,callFee:0,timeFee:2.40,avgTrip:7,maxJobsHour:1.5,avgSpeed:28,sun:1270,
    rentAvg:2800,rentMin:1400,rentMax:5200,budget:1600,cb:230,cd:9120,tr:33,sc:0,kmRate:0.35,ha:50,hc:0},

  // ---------- Западна Европа ----------
  amsterdam:{flag:'nl',name:{bg:'Амстердам',en:'Amsterdam'},dt:2.06,src:'D',baseFee:3.60,callFee:0,timeFee:2.20,avgTrip:6,maxJobsHour:2.2,avgSpeed:21,sun:1660,
    rentAvg:3200,rentMin:1600,rentMax:5800,budget:1500,cb:200,cd:7500,tr:37,sc:5.3,kmRate:0.23,ha:120,hc:0},
  brussels:{flag:'be',name:{bg:'Брюксел',en:'Brussels'},dt:2.01,src:'D',baseFee:3.50,callFee:0,timeFee:2.20,avgTrip:6,maxJobsHour:2.2,avgSpeed:21,sun:1550,
    rentAvg:2400,rentMin:1200,rentMax:4600,budget:1200,cb:130,cd:6000,tr:35,sc:0,kmRate:0.43,ha:80,hc:0},
  luxembourg:{flag:'lu',name:{bg:'Люксембург',en:'Luxembourg'},dt:2.15,src:'D',baseFee:3.50,callFee:0,timeFee:2.20,avgTrip:8,maxJobsHour:1.6,avgSpeed:26,sun:1560,
    rentAvg:3800,rentMin:1900,rentMax:6500,budget:1700,cb:200,cd:8500,tr:28,sc:0,kmRate:0.40,ha:140,hc:0},
  paris:{flag:'fr',name:{bg:'Париж',en:'Paris'},dt:1.54,src:'D',baseFee:3.00,callFee:0,timeFee:2.40,avgTrip:5,maxJobsHour:2.6,avgSpeed:18,sun:1660,
    rentAvg:3000,rentMin:1500,rentMax:5600,budget:1450,cb:140,cd:6000,tr:33,sc:0,kmRate:0.40,ha:0,hc:0},
  london:{flag:'gb',name:{bg:'Лондон',en:'London'},dt:2.15,src:'D',baseFee:3.80,callFee:0,timeFee:3.00,avgTrip:5,maxJobsHour:2.5,avgSpeed:17,sun:1480,
    rentAvg:3800,rentMin:1900,rentMax:6800,budget:1750,cb:180,cd:9000,tr:31,sc:0,kmRate:0.52,ha:0,hc:0},
  dublin:{flag:'ie',name:{bg:'Дъблин',en:'Dublin'},dt:1.96,src:'D',baseFee:4.00,callFee:0,timeFee:2.20,avgTrip:6,maxJobsHour:2.2,avgSpeed:20,sun:1450,
    rentAvg:3200,rentMin:1600,rentMax:6000,budget:1550,cb:220,cd:9360,tr:29,sc:0,kmRate:0.40,ha:60,hc:0},

  // ---------- Южна Европа ----------
  madrid:{flag:'es',name:{bg:'Мадрид',en:'Madrid'},dt:1.23,src:'D',baseFee:2.50,callFee:0,timeFee:1.60,avgTrip:5,maxJobsHour:2.7,avgSpeed:20,sun:2770,
    rentAvg:2000,rentMin:1000,rentMax:4000,budget:1100,cb:100,cd:3600,tr:27,sc:0,kmRate:0.19,ha:50,hc:0},
  barcelona:{flag:'es',name:{bg:'Барселона',en:'Barcelona'},dt:1.29,src:'D',baseFee:2.50,callFee:0,timeFee:1.60,avgTrip:5,maxJobsHour:2.7,avgSpeed:19,sun:2590,
    rentAvg:2200,rentMin:1100,rentMax:4200,budget:1150,cb:100,cd:3600,tr:27,sc:0,kmRate:0.19,ha:50,hc:0},
  valencia:{flag:'es',name:{bg:'Валенсия',en:'Valencia'},dt:1.20,src:'D',baseFee:2.50,callFee:0,timeFee:1.50,avgTrip:5,maxJobsHour:2.6,avgSpeed:21,sun:2700,
    note:'★ 2700 слънчеви часа, наем −40% спрямо Барселона',
    rentAvg:1350,rentMin:700,rentMax:2800,budget:950,cb:100,cd:3600,tr:26,sc:0,kmRate:0.19,ha:50,hc:0},
  malaga:{flag:'es',name:{bg:'Малага',en:'Malaga'},dt:1.18,src:'D',baseFee:2.40,callFee:0,timeFee:1.50,avgTrip:5.5,maxJobsHour:2.5,avgSpeed:22,sun:2900,
    note:'★ най-слънчевото място в списъка, туризъм целогодишно',
    rentAvg:1400,rentMin:700,rentMax:2900,budget:980,cb:100,cd:3600,tr:26,sc:0,kmRate:0.19,ha:50,hc:0},
  rome:{flag:'it',name:{bg:'Рим',en:'Rome'},dt:1.13,src:'D',baseFee:3.00,callFee:0,timeFee:1.80,avgTrip:5,maxJobsHour:2.6,avgSpeed:18,sun:2470,
    rentAvg:2100,rentMin:1050,rentMax:4100,budget:1200,cb:120,cd:4200,tr:30,sc:0,kmRate:0.20,ha:0,hc:0},
  milan:{flag:'it',name:{bg:'Милано',en:'Milan'},dt:1.23,src:'D',baseFee:3.30,callFee:0,timeFee:1.80,avgTrip:5,maxJobsHour:2.6,avgSpeed:19,sun:1980,
    rentAvg:2400,rentMin:1200,rentMax:4600,budget:1200,cb:120,cd:4200,tr:30,sc:0,kmRate:0.20,ha:0,hc:0},
  lisbon:{flag:'pt',name:{bg:'Лисабон',en:'Lisbon'},dt:0.97,src:'D',baseFee:3.25,callFee:0.80,timeFee:1.40,avgTrip:5,maxJobsHour:2.9,avgSpeed:20,sun:2800,
    rentAvg:1800,rentMin:900,rentMax:3800,budget:1050,cb:90,cd:3000,tr:28,sc:0,kmRate:0.20,ha:0,hc:0},
  athens:{flag:'gr',name:{bg:'Атина',en:'Athens'},dt:0.88,src:'D',baseFee:1.30,callFee:2.00,timeFee:1.20,avgTrip:5,maxJobsHour:3.0,avgSpeed:19,sun:2770,
    rentAvg:1600,rentMin:800,rentMax:3400,budget:950,cb:80,cd:2500,tr:29,sc:0,kmRate:0.00,ha:50,hc:0},

  // ---------- Централна и Източна ----------
  ljubljana:{flag:'si',name:{bg:'Любляна',en:'Ljubljana'},dt:1.10,src:'D',baseFee:2.00,callFee:0.50,timeFee:1.20,avgTrip:5,maxJobsHour:2.6,avgSpeed:22,sun:2000,
    note:'★ малък, безопасен, планини и море на час, близо до България',
    rentAvg:1250,rentMin:620,rentMax:2500,budget:900,cb:130,cd:3500,tr:27,sc:16,kmRate:0.43,ha:0,hc:0},
  warsaw:{flag:'pl',name:{bg:'Варшава',en:'Warsaw'},dt:1.03,src:'D',baseFee:2.00,callFee:0.50,timeFee:1.20,avgTrip:5,maxJobsHour:3.2,avgSpeed:21,sun:1570,
    rentAvg:1400,rentMin:700,rentMax:3000,budget:900,cb:110,cd:3500,tr:26,sc:0,kmRate:0.00,ha:0,hc:0},
  prague:{flag:'cz',name:{bg:'Прага',en:'Prague'},dt:1.08,src:'D',baseFee:2.00,callFee:0.50,timeFee:1.20,avgTrip:5,maxJobsHour:3.2,avgSpeed:21,sun:1670,
    rentAvg:1600,rentMin:800,rentMax:3200,budget:950,cb:105,cd:3200,tr:23,sc:0,kmRate:0.00,ha:0,hc:0},
  budapest:{flag:'hu',name:{bg:'Будапеща',en:'Budapest'},dt:0.97,src:'D',baseFee:2.00,callFee:0.50,timeFee:1.10,avgTrip:4.5,maxJobsHour:3.4,avgSpeed:21,sun:2000,
    rentAvg:1300,rentMin:650,rentMax:2800,budget:850,cb:100,cd:3000,tr:24,sc:0,kmRate:0.00,ha:0,hc:0},
  bucharest:{flag:'ro',name:{bg:'Букурещ',en:'Bucharest'},dt:0.93,src:'D',baseFee:1.50,callFee:0.40,timeFee:1.00,avgTrip:4.5,maxJobsHour:3.6,avgSpeed:20,sun:2120,
    rentAvg:1100,rentMin:550,rentMax:2500,budget:750,cb:90,cd:2800,tr:22,sc:0,kmRate:0.00,ha:0,hc:0},
  sofia:{flag:'bg',name:{bg:'София',en:'Sofia'},dt:0.75,src:'V',baseFee:1.00,callFee:0.60,timeFee:1.20,avgTrip:4,maxJobsHour:2.8,avgSpeed:22,sun:2100,
    note:'базата — жилище без наем, втори доход',
    rentAvg:900,rentMin:450,rentMax:2200,budget:650,cb:50,cd:2400,tr:20,sc:0,kmRate:0.00,ha:0,hc:0}
};

export const CITY_KEYS = Object.keys(CITIES);
