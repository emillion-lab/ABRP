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
  hours: 10, workDays: 22,
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
  $('vDays').textContent     = S.workDays;
  $('vCar').textContent      = '-' + fmt(S.carCost) + '€';
  $('vTips').textContent     = '+' + fmt(S.tips) + '€';
  $('vComfort').textContent  = Math.round(S.comfort * 100) + '%';
  $('vFlow').textContent     = Math.round(S.flow * 100) + '%';
  $('vStrategy').textContent = strategyLabel(S.strategy);
  $('vComm').textContent     = S.commissionPct + '%';

  const d = m.day;
  const callRow = d.callPart > 0
    ? `<div class="row sub2"><span>&nbsp;&nbsp;повикване (${fmt(d.dispatchedJobs)} от ${fmt(d.jobs)})</span><b>${fmt(d.callPart)}€</b></div>`
    : '';

  $('shiftOut').innerHTML = `
    <div class="row"><span>Курсове</span><b>${d.jobs.toFixed(1)}</b></div>
    <div class="row"><span>Среден курс</span><b>${c.avgTrip} км · ${d.avgFare.toFixed(2)}€</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;километри</span><b>${fmt(d.kmPart)}€</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;начална такса + престой</span><b>${fmt(d.basePart)}€</b></div>
    ${callRow}
    <div class="row"><span>От улицата</span><b>${(d.streetShare*100).toFixed(0)}%</b></div>
    <div class="row"><span>Натоварени км</span><b>${fmt(d.loadedKm)}</b></div>
    <div class="row"><span>Празни км</span><b class="bad">${fmt(d.emptyKm)}</b></div>
    <div class="row"><span>Общо км/ден</span><b>${fmt(d.totalKm)}</b></div>
    <div class="row"><span>Натовареност</span><b>${(d.occupancy*100).toFixed(0)}%</b></div>
    <div class="row"><span>Оборот на апарата</span><b>${fmt(d.gross)}€</b></div>
    <div class="row hi"><span>В джоба за смяна</span><b>${fmt(m.netPerShift)}€</b></div>`;

  const best = bestStrategy(c, S);
  const diff = best.profit - m.profit;
  $('advice').innerHTML = diff > 30
    ? `<b>${strategyLabel(best.strategy)}</b> е по-добре тук — с ${fmt(diff)}€/мес.`
    : `Стратегията ти е близо до оптималната за ${c.name.bg}.`;

  const commLine = m.commission > 0
    ? `<div class="row"><span>Комисионна ${S.commissionPct}%</span><b class="bad">-${fmt(m.commission)}€</b></div>`
    : '';

  const cls = h.balance < -300 ? 'bad' : (h.balance < 300 ? 'warn' : 'good');
  $('monthOut').innerHTML = `
    <div class="row"><span>Оборот по апарата</span><b class="good">+${fmt(m.fares)}€</b></div>
    ${commLine}
    <div class="row"><span>Бакшиши</span><b class="good">+${fmt(m.tips)}€</b></div>
    <div class="row"><span>Кола (всичко)</span><b class="bad">-${fmt(m.carCost)}€</b></div>
    <div class="row"><span>Печалба</span><b>${fmt(m.profit)}€</b></div>
    <div class="row"><span>Осигуровки ${c.sc}%</span><b class="bad">-${fmt(h.social)}€</b></div>
    <div class="row"><span>Детски</span><b class="good">+${fmt(h.benefits)}€</b></div>
    <div class="row"><span>Наем + бюджет</span><b class="bad">-${fmt(h.rent+h.budget)}€</b></div>
    ${h.health ? `<div class="row"><span>Здравно</span><b class="bad">-${fmt(h.health)}€</b></div>` : ''}
    <div class="row"><span>Основни</span><b class="bad">-${fmt(h.basic)}€</b></div>`;

  $('balance').className = 'balance ' + cls;
  $('balance').innerHTML =
    `<div class="lbl">Остава месечно</div>
     <div class="num">${h.balance >= 0 ? '+' : ''}${fmt(h.balance)} €</div>
     <div class="sub">Годишно ${fmt(h.balanceYear)}€ · данъчни облекчения +${fmt(h.reliefYear)}€/год<br>
     Праг на рентабилност: <b>${h.breakEvenKm} км/ден</b></div>`;

  renderGrid();
}

function strategyLabel(s) {
  if (s < 0.2) return 'Чакам на място';
  if (s < 0.45) return 'Предимно чакам';
  if (s < 0.7) return 'Смесено';
  if (s < 0.9) return 'Предимно търся';
  return 'Търся активно';
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
    d.className = 'city' + (S.sel === r.k ? ' sel' : '');
    d.innerHTML = `<img src="${FLAGS}${r.c.flag}.svg" alt="">
      <div class="cn">${r.c.name.bg}${r.c.src === 'D' ? '<i title="тарифа непроверена">~</i>' : ''}</div>
      <div class="cv ${cls}">${r.bal >= 0 ? '+' : ''}${fmt(r.bal)}€</div>`;
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
     <small>тарифа ${c.dt.toFixed(2)} €/км${c.src === 'D' ? ' (непроверена)' : ''}</small>`;
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
  bind('sDays', 'workDays');
  bind('sCar', 'carCost');
  bind('sTips', 'tips');
  bind('sComm', 'commissionPct');
  bind('sStrategy', 'strategy', v => v / 100);
  bind('sFlow', 'flow', v => v / 100);
  bind('sComfort', 'comfort', v => v / 100);

  selectCity(S.sel);
}
