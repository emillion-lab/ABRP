import { CITIES, CITY_KEYS } from '../data/cities.js';
import { shift, month, bestStrategy } from '../core/economics.js';
import { household, familyMultiplier, affordableRent } from '../core/household.js';

const FLAGS = 'https://flagcdn.com/';

const S = {
  sel: 'sofia',
  adults: 2, kids: 3,
  rent: 900, budget: 1040,
  hours: 10, workDays: 22,
  strategy: 0.80,   // 0 = чакам, 1 = търся
  flow: 0.20,       // бронзов партньор
  comfort: 0.50,
  carCost: 200,     // ток + гуми + застраховка, всичко
  tips: 150
};

const $ = id => document.getElementById(id);

function compute(over) {
  const p = Object.assign({}, S, over || {});
  const c = CITIES[p.sel];
  const m = month(c, p);
  const h = household(c, p, m);
  return { c, p, m, h };
}

function fmt(n) { return Math.round(n).toLocaleString('bg-BG'); }

function render() {
  const { c, m, h } = compute();

  // --- стойности до плъзгачите ---
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

  // --- смяната ---
  $('shiftOut').innerHTML = `
    <div class="row"><span>Курсове</span><b>${m.day.jobs.toFixed(1)}</b></div>
    <div class="row"><span>Натоварени км</span><b>${fmt(m.day.loadedKm)}</b></div>
    <div class="row"><span>Празни км</span><b class="bad">${fmt(m.day.emptyKm)}</b></div>
    <div class="row"><span>Общо км/ден</span><b>${fmt(m.day.totalKm)}</b></div>
    <div class="row"><span>Натовареност</span><b>${(m.day.occupancy*100).toFixed(0)}%</b></div>
    <div class="row"><span>€/изминат км</span><b>${m.day.perKm.toFixed(2)}</b></div>
    <div class="row hi"><span>% от тарифата</span><b>${(m.day.tariffPct*100).toFixed(0)}%</b></div>
    <div class="row"><span>Оборот/ден</span><b>${fmt(m.day.revenue)}€</b></div>`;

  // --- препоръка коя стратегия печели ---
  const best = bestStrategy(c, S);
  const diff = best.profit - m.profit;
  $('advice').innerHTML = diff > 30
    ? `<b>${strategyLabel(best.strategy)}</b> е по-добре тук — с ${fmt(diff)}€/мес.`
    : `Стратегията ти е близо до оптималната за ${c.name.bg}.`;

  // --- месечно ---
  const cls = h.balance < -300 ? 'bad' : (h.balance < 300 ? 'warn' : 'good');
  $('monthOut').innerHTML = `
    <div class="row"><span>Оборот</span><b class="good">+${fmt(m.revenue)}€</b></div>
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
  const rows = CITY_KEYS.map(k => {
    const c = CITIES[k];
    const p = Object.assign({}, S, { sel: k, rent: c.rentAvg,
      budget: Math.round(c.budget * familyMultiplier(S.adults + S.kids)) });
    const m = month(c, p);
    const h = household(c, p, m);
    return { k, c, bal: h.balance };
  }).sort((a, b) => b.bal - a.bal);

  rows.forEach(r => {
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

function selectCity(k) {
  const c = CITIES[k];
  S.sel = k;
  S.rent = c.rentAvg;
  S.budget = Math.round(c.budget * familyMultiplier(S.adults + S.kids));
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
  bind('sAdults', 'adults');
  bind('sKids', 'kids');
  bind('sRent', 'rent');
  bind('sBudget', 'budget');
  bind('sHours', 'hours');
  bind('sDays', 'workDays');
  bind('sCar', 'carCost');
  bind('sTips', 'tips');
  bind('sStrategy', 'strategy', v => v / 100);
  bind('sFlow', 'flow', v => v / 100);
  bind('sComfort', 'comfort', v => v / 100);
  selectCity(S.sel);
}
