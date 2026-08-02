import { CITIES, CITY_KEYS } from '../data/cities.js';
import { PLATFORMS, PLATFORM_KEYS, defaultPlatform } from '../data/platforms.js';
import { shift, month, bestStrategy } from '../core/economics.js';
import { household, familyMultiplier } from '../core/household.js';

const FLAGS = 'https://flagcdn.com/';

const S = {
  sel: 'sofia',
  platform: 'taxime',
  commissionPct: 15, commissionFixed: 0,
  adults: 2, kids: 3,
  rent: 900, budget: 1040,
  hours: 8, commitHours: 12, workDays: 22,
  peakFocus: 0.70,
  maxKmDay: 250,
  strategy: 0.80,
  flow: 0.20,
  comfort: 0.50,
  carCost: 200,
  tips: 150
};

const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString('bg-BG');

function compute(over) {
  const p = Object.assign({}, S, over || {});
  const c = CITIES[p.sel];
  const m = month(c, p);
  const h = household(c, p, m);
  return { c, p, m, h };
}

function render() {
  const { c, m, h } = compute();

  $('vAdults').textContent   = S.adults;
  $('vKids').textContent     = S.kids;
  $('vRent').textContent     = '-' + fmt(S.rent) + '€';
  $('vBudget').textContent   = '-' + fmt(S.budget) + '€';
  $('vHours').textContent    = S.hours + 'ч';
  $('vCommit').textContent   = Math.max(S.commitHours, S.hours) + 'ч';
  $('vPeak').textContent     = Math.round(S.peakFocus * 100) + '%';
  $('vDays').textContent     = S.workDays;
  $('vKm').textContent       = S.maxKmDay + ' км';
  $('vCar').textContent      = '-' + fmt(S.carCost) + '€';
  $('vTips').textContent     = '+' + fmt(S.tips) + '€';
  $('vComfort').textContent  = Math.round(S.comfort * 100) + '%';
  $('vFlow').textContent     = Math.round(S.flow * 100) + '%';
  $('vStrategy').textContent = strategyLabel(S.strategy);
  $('vComm').textContent     = S.commissionPct + '%';

  const d = m.day;
  const callRow = d.callPart > 0
    ? `<div class="row sub2"><span>&nbsp;&nbsp;повикване</span><b>${fmt(d.callPart)}€</b></div>` : '';
  const kmWarn = d.kmLimited
    ? `<div class="row sub2"><span>&nbsp;&nbsp;⚠ опряло в тавана за км</span><b></b></div>` : '';
  const peakNote = S.peakFocus > d.peakShare + 0.02
    ? `<div class="row sub2"><span>&nbsp;&nbsp;⚠ смяната надхвърля пиковете — реално ${Math.round(d.peakShare*100)}%</span><b></b></div>` : '';

  $('shiftOut').innerHTML = `
    <div class="row"><span>Курсове</span><b>${d.jobs.toFixed(1)} · ${d.jobsPerHour.toFixed(2)}/ч</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;натовареност ${(d.util*100).toFixed(0)}% от таван ${d.ceiling.toFixed(1)}/ч</span><b></b></div>
    ${peakNote}
    <div class="row"><span>Среден курс</span><b>${c.avgTrip} км · ${d.avgFare.toFixed(2)}€</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;километри</span><b>${fmt(d.kmPart)}€</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;начална такса + престой</span><b>${fmt(d.basePart)}€</b></div>
    ${callRow}
    <div class="row"><span>Натоварени км</span><b>${fmt(d.loadedKm)}</b></div>
    <div class="row"><span>Празни км</span><b class="bad">${fmt(d.emptyKm)}</b></div>
    <div class="row"><span>Общо км/ден</span><b>${fmt(d.totalKm)}</b></div>
    ${kmWarn}
    <div class="row"><span>Заетост на км</span><b>${(d.occupancy*100).toFixed(0)}%</b></div>
    <div class="row"><span>Оборот на апарата</span><b>${fmt(d.gross)}€</b></div>
    <div class="row hi"><span>В джоба за смяна</span><b>${fmt(m.netPerShift)}€</b></div>
    <div class="row hi"><span>На час зад волана</span><b>${m.netPerHour.toFixed(2)}€</b></div>
    <div class="row hi"><span>На час извън дома</span><b>${m.netPerCommitHour.toFixed(2)}€</b></div>`;

  const best = bestStrategy(c, S);
  const diff = best.profit - m.profit;
  $('advice').innerHTML = diff > 30
    ? `<b>${strategyLabel(best.strategy)}</b> е по-добре тук — с ${fmt(diff)}€/мес.`
    : `Стратегията ти е близо до оптималната за ${c.name.bg}.`;

  const commLine = m.commission > 0
    ? `<div class="row"><span>Комисионна ${S.commissionPct}%</span><b class="bad">-${fmt(m.commission)}€</b></div>` : '';

  const cls = h.balance < -300 ? 'bad' : (h.balance < 300 ? 'warn' : 'good');
  $('monthOut').innerHTML = `
    <div class="row"><span>Оборот по апарата</span><b class="good">+${fmt(m.fares)}€</b></div>
    ${commLine}
    <div class="row"><span>Бакшиши</span><b class="good">+${fmt(m.tips)}€</b></div>
    <div class="row"><span>Кола (всичко)</span><b class="bad">-${fmt(m.carCost)}€</b></div>
    <div class="row"><span>Печалба</span><b>${fmt(m.profit)}€</b></div>
    <div class="row"><span>Осигуровки ${c.sc}%</span><b class="bad">-${fmt(h.social)}€</b></div>
    <div class="row"><span>Данък ${c.tr}%</span><b class="bad">-${fmt(h.tax)}€</b></div>
    <div class="row"><span>Детски</span><b class="good">+${fmt(h.benefits)}€</b></div>
    <div class="row"><span>Наем + бюджет</span><b class="bad">-${fmt(h.rent+h.budget)}€</b></div>
    ${h.health ? `<div class="row"><span>Здравно</span><b class="bad">-${fmt(h.health)}€</b></div>` : ''}
    <div class="row"><span>Основни</span><b class="bad">-${fmt(h.basic)}€</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;${fmt(m.monthHours)}ч зад волана · ${fmt(m.monthCommit)}ч извън дома</span><b></b></div>`;

  const vehLine = h.useKmRate
    ? `<div class="row"><span>Квота ${c.kmRate.toFixed(2)}€/км над реалните</span><b class="good">-${fmt(h.vehicleExtra)}€</b></div>
       <div class="row sub2"><span>&nbsp;&nbsp;квота ${fmt(h.kmDeduct)}€ вместо реални ${fmt(h.carYear)}€</span><b></b></div>`
    : `<div class="row"><span>Кола — реални разходи</span><b class="good">вече в печалбата</b></div>
       <div class="row sub2"><span>&nbsp;&nbsp;реални ${fmt(h.carYear)}€ &gt; квота ${fmt(h.kmDeduct)}€</span><b></b></div>`;

  $('taxOut').innerHTML = `
    <div class="row"><span>Пробег</span><b>${fmt(m.km)} км/мес · ${fmt(h.kmYear)} км/год</b></div>
    <div class="row"><span>Печалба преди квоти</span><b>${fmt(m.profit*12)}€/год</b></div>
    <div class="row"><span>Осигуровки</span><b class="good">-${fmt(h.social*12)}€</b></div>
    ${vehLine}
    <div class="row"><span>Квота ${S.kids} деца × ${fmt(c.cd)}€</span><b class="good">-${fmt(h.childDeduct)}€</b></div>
    <div class="row"><span>Облагаема основа</span><b>${fmt(h.taxableYear)}€/год</b></div>
    <div class="row hi"><span>Квотите спестяват</span><b class="good">${fmt(h.reliefYear)}€/год</b></div>
    <div class="row hi"><span>Ефективна ставка</span><b>${h.effectiveRate.toFixed(1)}%</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;ℹ наемът е личен разход и не намалява основата</span><b></b></div>
    ${h.taxableYear <= 0 ? '<div class="row sub2"><span>&nbsp;&nbsp;ℹ квотите надвишават печалбата — данъкът е нула</span><b></b></div>' : ''}
    ${c.kmRate === 0 ? '<div class="row sub2"><span>&nbsp;&nbsp;⚠ няма километрична квота в тази държава</span><b></b></div>' : ''}`;

  $('balance').className = 'balance ' + cls;
  $('balance').innerHTML =
    `<div class="lbl">Остава месечно</div>
     <div class="num">${h.balance >= 0 ? '+' : ''}${fmt(h.balance)} €</div>
     <div class="sub">Годишно ${fmt(h.balanceYear)}€<br>
     Праг на рентабилност: <b>${h.breakEvenKm} км/ден</b></div>`;

  renderGrid();
}

function strategyLabel(s) {
  if (s < 0.2) return 'Стоя на място';
  if (s < 0.45) return 'Предимно стоя';
  if (s < 0.7) return 'Смесено';
  if (s < 0.9) return 'Предимно се местя';
  return 'Местя се постоянно';
}

function sunClass(sun) {
  if (sun >= 2400) return 'sun-hi';
  if (sun >= 1750) return 'sun-mid';
  return 'sun-lo';
}

function renderGrid() {
  const g = $('grid');
  g.innerHTML = '';
  CITY_KEYS.map(k => {
    const c = CITIES[k];
    const pf = PLATFORMS[defaultPlatform(k)];
    const p = Object.assign({}, S, {
      sel: k, rent: c.rentAvg,
      commissionPct: pf.pct, commissionFixed: pf.fixed,
      budget: Math.round(c.budget * familyMultiplier(S.adults + S.kids))
    });
    const m = month(c, p);
    return { k, c, bal: household(c, p, m).balance };
  }).sort((a, b) => b.bal - a.bal).forEach(r => {
    const cls = r.bal < -300 ? 'bad' : (r.bal < 300 ? 'warn' : 'good');
    const d = document.createElement('div');
    d.className = 'city' + (S.sel === r.k ? ' sel' : '') + (r.c.note ? ' star' : '');
    d.innerHTML = `<img src="${FLAGS}${r.c.flag}.svg" alt="">
      <div class="cn">${r.c.name.bg}${r.c.src === 'D' ? '<i title="непроверено">~</i>' : ''}</div>
      <div class="cv ${cls}">${r.bal >= 0 ? '+' : ''}${fmt(r.bal)}€</div>
      <div class="cs ${sunClass(r.c.sun)}">☀ ${r.c.sun}ч</div>`;
    d.title = r.c.note || '';
    d.onclick = () => selectCity(r.k);
    g.appendChild(d);
  });
}

function setPlatform(key) {
  S.platform = key;
  S.commissionPct = PLATFORMS[key].pct;
  S.commissionFixed = PLATFORMS[key].fixed;
  $('sPlatform').value = key;
  $('sComm').value = S.commissionPct;
}

function selectCity(k) {
  const c = CITIES[k];
  S.sel = k;
  S.rent = c.rentAvg;
  S.budget = Math.round(c.budget * familyMultiplier(S.adults + S.kids));
  setPlatform(defaultPlatform(k));
  $('sRent').min = c.rentMin; $('sRent').max = c.rentMax; $('sRent').value = S.rent;
  $('sBudget').value = S.budget;
  $('cityName').innerHTML =
    `<img src="${FLAGS}${c.flag}.svg" alt=""> ${c.name.bg}
     <small>тарифа ${c.dt.toFixed(2)} €/км · таван ${c.maxJobsHour} курса/ч · ☀ ${c.sun}ч/год${c.src === 'D' ? ' · непроверено' : ''}</small>
     ${c.note ? `<small class="note">${c.note}</small>` : ''}`;
  render();
}

function bind(id, key, transform) {
  $(id).addEventListener('input', e => {
    S[key] = transform ? transform(+e.target.value) : +e.target.value;
    if (key === 'adults' || key === 'kids') {
      S.budget = Math.round(CITIES[S.sel].budget * familyMultiplier(S.adults + S.kids));
      $('sBudget').value = S.budget;
    }
    render();
  });
}

function initLock() {
  const btn = $('lockBtn');
  let locked = false;
  const apply = () => {
    document.body.classList.toggle('locked', locked);
    btn.textContent = locked ? '🔒 Заключено' : '🔓 Отключено';
    btn.classList.toggle('on', locked);
  };
  btn.addEventListener('click', () => { locked = !locked; apply(); });
  apply();
}

export function init() {
  const sel = $('sPlatform');
  PLATFORM_KEYS.forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = PLATFORMS[k].name + ' — ' + PLATFORMS[k].pct + '%';
    sel.appendChild(o);
  });
  sel.addEventListener('change', e => { setPlatform(e.target.value); render(); });

  bind('sAdults', 'adults');
  bind('sKids', 'kids');
  bind('sRent', 'rent');
  bind('sBudget', 'budget');
  bind('sHours', 'hours');
  bind('sCommit', 'commitHours');
  bind('sPeak', 'peakFocus', v => v / 100);
  bind('sDays', 'workDays');
  bind('sKm', 'maxKmDay');
  bind('sCar', 'carCost');
  bind('sTips', 'tips');
  bind('sComm', 'commissionPct');
  bind('sStrategy', 'strategy', v => v / 100);
  bind('sFlow', 'flow', v => v / 100);
  bind('sComfort', 'comfort', v => v / 100);

  initLock();
  selectCity(S.sel);
}
