import { CITIES, CITY_KEYS } from '../data/cities.js';
import { applyTax } from '../data/tax.js';
import { PLATFORMS, PLATFORM_KEYS, defaultPlatform } from '../data/platforms.js';
import { PRESETS, PRESET_KEYS } from '../data/presets.js';
import { TIPS, GENERIC_TIPS } from '../data/tips.js';
import { DIMS, DIM_KEYS, score, display, badgeMap } from '../data/scores.js';
import { t, tx, setLang, getLang } from '../data/i18n.js';
import { month, bestStrategy } from '../core/economics.js';
import { household, familyMultiplier } from '../core/household.js';

const FLAGS = 'https://flagcdn.com/';
applyTax(CITIES);

const S = {
  sel:'sofia', platform:'taxime', sortBy:'balance',
  commissionPct:15, commissionFixed:0,
  adults:2, kids:3, rent:900, budget:1040,
  hours:10, commitHours:12, workDays:26, peakFocus:0.60,
  maxKmDay:250, strategy:0.80, flow:0.20, comfort:0.50,
  carCost:200, tips:150
};

const $ = id => document.getElementById(id);
const fmt = n => Math.round(n).toLocaleString(getLang() === 'bg' ? 'bg-BG' : 'en-GB');

function compute(over) {
  const p = Object.assign({}, S, over || {});
  const c = CITIES[p.sel];
  const m = month(c, p);
  return { c, p, m, h: household(c, p, m) };
}

function syncSliders() {
  const map = { sAdults:'adults', sKids:'kids', sRent:'rent', sBudget:'budget',
    sHours:'hours', sCommit:'commitHours', sDays:'workDays', sKm:'maxKmDay',
    sCar:'carCost', sTips:'tips', sComm:'commissionPct' };
  Object.keys(map).forEach(id => { if ($(id)) $(id).value = S[map[id]]; });
  $('sPeak').value = Math.round(S.peakFocus*100);
  $('sStrategy').value = Math.round(S.strategy*100);
  $('sFlow').value = Math.round(S.flow*100);
  $('sComfort').value = Math.round(S.comfort*100);
}

function applyPreset(key) {
  const p = PRESETS[key];
  if (!p) return;
  if (p.city) selectCity(p.city, true);
  Object.assign(S, p.set);
  const c = CITIES[S.sel];
  if (!p.set.rent) S.rent = c.rentAvg;
  S.budget = Math.round(c.budget * familyMultiplier(S.adults + S.kids));
  $('presetDesc').textContent = tx(p.desc);
  syncSliders();
  render();
}

function strategyLabel(s) {
  if (s < 0.2) return t('stayPut');
  if (s < 0.45) return t('mostlyStay');
  if (s < 0.7) return t('mixed');
  if (s < 0.9) return t('mostlyMove');
  return t('alwaysMove');
}

function cityRows() {
  return CITY_KEYS.map(k => {
    const c = CITIES[k];
    const pf = PLATFORMS[defaultPlatform(k)];
    const p = Object.assign({}, S, {
      sel:k, rent:c.rentAvg,
      commissionPct:pf.pct, commissionFixed:pf.fixed,
      budget: Math.round(c.budget * familyMultiplier(S.adults + S.kids))
    });
    const m = month(c, p);
    const h = household(c, p, m);
    const scores = {};
    DIM_KEYS.forEach(d => { scores[d] = score(d, c, k, m, h); });
    return { k, c, m, h, scores };
  });
}

function renderFilters() {
  const bar = $('filters');
  bar.innerHTML = '';
  DIM_KEYS.forEach(d => {
    const b = document.createElement('button');
    b.className = 'fbtn' + (S.sortBy === d ? ' on' : '');
    b.innerHTML = `<span class="fi">${DIMS[d].icon}</span><span class="fl">${tx(DIMS[d].label)}</span>`;
    b.onclick = () => { S.sortBy = d; render(); };
    bar.appendChild(b);
  });
}

function renderGrid() {
  const rows = cityRows();
  const badges = badgeMap(rows);
  rows.sort((a, b) => b.scores[S.sortBy] - a.scores[S.sortBy]);

  const g = $('grid');
  g.innerHTML = '';
  rows.forEach(r => {
    const bal = r.h.balance;
    const cls = bal < -300 ? 'bad' : (bal < 300 ? 'warn' : 'good');
    const d = document.createElement('div');
    d.className = 'city' + (S.sel === r.k ? ' sel' : '');
    const main = display(S.sortBy, r.c, r.k, r.m, r.h);
    const sub = S.sortBy === 'balance'
      ? `<div class="cs">☀ ${r.c.sun}</div>`
      : `<div class="cs ${cls}">${bal >= 0 ? '+' : ''}${fmt(bal)}€</div>`;
    d.innerHTML = `<div class="cb">${badges[r.k].join('')}</div>
      <img src="${FLAGS}${r.c.flag}.svg" alt="">
      <div class="cn">${tx(r.c.name)}</div>
      <div class="cv ${S.sortBy === 'balance' ? cls : ''}">${main}</div>${sub}`;
    d.onclick = () => selectCity(r.k);
    g.appendChild(d);
  });
  $('gridUnit').textContent = tx(DIMS[S.sortBy].unit);
}

function renderTips() {
  const { c } = compute();
  const list = (TIPS[S.sel] || []).slice();
  let html = '';
  list.forEach((tip, i) => {
    const gain = tip.gain ? `<span class="${tip.gain>0?'good':'bad'}">${tip.gain>0?'+':''}${fmt(tip.gain)}€</span>` : '<span></span>';
    const btn = tip.apply ? `<button class="tipBtn" data-tip="${i}">${t('apply')}</button>` : '';
    html += `<div class="tip"><div class="tipTxt">${tx(tip)}</div><div class="tipFoot">${gain}${btn}</div></div>`;
  });
  if (!list.length) GENERIC_TIPS.forEach(g => {
    html += `<div class="tip"><div class="tipTxt">${tx(g)}</div></div>`;
  });
  const verKey = c.taxVer === 'V' ? 'taxVerV' : c.taxVer === 'P' ? 'taxVerP' : 'taxVerE';
  html += `<div class="tip ver-${c.taxVer}"><div class="tipTxt"><b>${t(verKey)}</b><br>
           <span class="src">${tx(c.taxSrc)}</span></div></div>`;
  const box = $('tipsOut');
  box.innerHTML = html;
  box.querySelectorAll('.tipBtn').forEach(b => {
    b.onclick = () => { Object.assign(S, list[+b.dataset.tip].apply); syncSliders(); render(); };
  });
}

function render() {
  const { c, m, h } = compute();

  $('vAdults').textContent = S.adults;
  $('vKids').textContent = S.kids;
  $('vRent').textContent = '-' + fmt(S.rent) + '€';
  $('vBudget').textContent = '-' + fmt(S.budget) + '€';
  $('vHours').textContent = S.hours + 'h';
  $('vCommit').textContent = Math.max(S.commitHours, S.hours) + 'h';
  $('vPeak').textContent = Math.round(S.peakFocus*100) + '%';
  $('vDays').textContent = S.workDays;
  $('vKm').textContent = S.maxKmDay + ' km';
  $('vCar').textContent = '-' + fmt(S.carCost) + '€';
  $('vTips').textContent = '+' + fmt(S.tips) + '€';
  $('vComfort').textContent = Math.round(S.comfort*100) + '%';
  $('vFlow').textContent = Math.round(S.flow*100) + '%';
  $('vStrategy').textContent = strategyLabel(S.strategy);
  $('vComm').textContent = S.commissionPct + '%';

  const d = m.day;
  const callRow = d.callPart > 0
    ? `<div class="row sub2"><span>&nbsp;&nbsp;${t('callPart')}</span><b>${fmt(d.callPart)}€</b></div>` : '';
  const kmWarn = d.kmLimited
    ? `<div class="row sub2"><span>&nbsp;&nbsp;⚠ ${t('warnKmCap')}</span><b></b></div>` : '';
  const peakNote = S.peakFocus > d.peakShare + 0.02
    ? `<div class="row sub2"><span>&nbsp;&nbsp;⚠ ${t('warnPeak')} ${Math.round(d.peakShare*100)}%</span><b></b></div>` : '';

  $('shiftOut').innerHTML = `
    <div class="row"><span>${t('jobs')}</span><b>${d.jobs.toFixed(1)} · ${d.jobsPerHour.toFixed(2)}/h</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;${t('util')} ${(d.util*100).toFixed(0)}% ${t('ofCeiling')} ${d.ceiling.toFixed(1)}</span><b></b></div>
    ${peakNote}
    <div class="row"><span>${t('avgFare')}</span><b>${c.avgTrip} km · ${d.avgFare.toFixed(2)}€</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;${t('kmPart')}</span><b>${fmt(d.kmPart)}€</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;${t('basePart')}</span><b>${fmt(d.basePart)}€</b></div>
    ${callRow}
    <div class="row"><span>${t('loadedKm')}</span><b>${fmt(d.loadedKm)}</b></div>
    <div class="row"><span>${t('emptyKm')}</span><b class="bad">${fmt(d.emptyKm)}</b></div>
    <div class="row"><span>${t('totalKm')}</span><b>${fmt(d.totalKm)}</b></div>
    ${kmWarn}
    <div class="row"><span>${t('occupancy')}</span><b>${(d.occupancy*100).toFixed(0)}%</b></div>
    <div class="row"><span>${t('meterGross')}</span><b>${fmt(d.gross)}€</b></div>
    <div class="row hi"><span>${t('perShift')}</span><b>${fmt(m.netPerShift)}€</b></div>
    <div class="row hi"><span>${t('perHour')}</span><b>${m.netPerHour.toFixed(2)}€</b></div>
    <div class="row hi"><span>${t('perAway')}</span><b>${m.netPerCommitHour.toFixed(2)}€</b></div>`;

  const best = bestStrategy(c, S);
  const diff = best.profit - m.profit;
  $('advice').innerHTML = diff > 30
    ? `<b>${strategyLabel(best.strategy)}</b> ${t('betterHere')} ${fmt(diff)}€/mo.`
    : `${t('nearOptimal')} ${tx(c.name)}.`;

  const commLine = m.commission > 0
    ? `<div class="row"><span>${t('commission')} ${S.commissionPct}%</span><b class="bad">-${fmt(m.commission)}€</b></div>` : '';
  const socLabel = (h.socialFixed > 0 && !c.sc)
    ? `${t('social')} (${fmt(h.socialFixed)}€/mo)` : `${t('social')} ${c.sc}%`;

  const cls = h.balance < -300 ? 'bad' : (h.balance < 300 ? 'warn' : 'good');
  $('monthOut').innerHTML = `
    <div class="row"><span>${t('fares')}</span><b class="good">+${fmt(m.fares)}€</b></div>
    ${commLine}
    <div class="row"><span>${t('tips')}</span><b class="good">+${fmt(m.tips)}€</b></div>
    <div class="row"><span>${t('car')}</span><b class="bad">-${fmt(m.carCost)}€</b></div>
    <div class="row"><span>${t('profit')}</span><b>${fmt(m.profit)}€</b></div>
    <div class="row"><span>${socLabel}</span><b class="bad">-${fmt(h.social)}€</b></div>
    <div class="row"><span>${t('tax')} ${c.tr}%</span><b class="bad">-${fmt(h.tax)}€</b></div>
    <div class="row"><span>${t('benefits')}</span><b class="good">+${fmt(h.benefits)}€</b></div>
    <div class="row"><span>${t('rentBudget')}</span><b class="bad">-${fmt(h.rent+h.budget)}€</b></div>
    ${h.health ? `<div class="row"><span>${t('health')}</span><b class="bad">-${fmt(h.health)}€</b></div>` : ''}
    <div class="row"><span>${t('basicExp')}</span><b class="bad">-${fmt(h.basic)}€</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;${fmt(m.monthHours)}${t('atWheel')} · ${fmt(m.monthCommit)}${t('away')}</span><b></b></div>`;

  const vehLine = h.useKmRate
    ? `<div class="row"><span>${t('kmQuota')} ${c.kmRate.toFixed(2)}€/km ${t('overActual')}</span><b class="good">-${fmt(h.vehicleExtra)}€</b></div>`
    : `<div class="row"><span>${t('carActual')}</span><b class="good">${t('alreadyIn')}</b></div>`;

  $('taxOut').innerHTML = `
    <div class="row"><span>${t('mileage')}</span><b>${fmt(m.km)} km/mo</b></div>
    <div class="row"><span>${t('profitPre')}</span><b>${fmt(m.profit*12)}€/yr</b></div>
    <div class="row"><span>${t('social')}</span><b class="good">-${fmt(h.social*12)}€</b></div>
    ${vehLine}
    <div class="row"><span>${t('childQuota')} ${S.kids} × ${fmt(c.cd)}€</span><b class="good">-${fmt(h.childDeduct)}€</b></div>
    <div class="row"><span>${t('taxable')}</span><b>${fmt(h.taxableYear)}€/yr</b></div>
    <div class="row hi"><span>${t('quotaSaves')}</span><b class="good">${fmt(h.reliefYear)}€/yr</b></div>
    <div class="row hi"><span>${t('effRate')}</span><b>${h.effectiveRate.toFixed(1)}%</b></div>
    <div class="row sub2"><span>&nbsp;&nbsp;ℹ ${t('rentNote')}</span><b></b></div>
    ${h.taxableYear <= 0 ? `<div class="row sub2"><span>&nbsp;&nbsp;ℹ ${t('zeroTax')}</span><b></b></div>` : ''}
    ${c.kmRate === 0 ? `<div class="row sub2"><span>&nbsp;&nbsp;⚠ ${t('noKmRate')}</span><b></b></div>` : ''}`;

  $('balance').className = 'balance ' + cls;
  $('balance').innerHTML =
    `<div class="lbl">${t('surplus')}</div>
     <div class="num">${h.balance >= 0 ? '+' : ''}${fmt(h.balance)} €</div>
     <div class="sub">${t('yearly')} ${fmt(h.balanceYear)}€<br>
     ${t('breakEven')}: <b>${h.breakEvenKm} ${t('perDay')}</b></div>`;

  renderFilters();
  renderGrid();
  renderTips();
}

function setPlatform(key) {
  S.platform = key;
  S.commissionPct = PLATFORMS[key].pct;
  S.commissionFixed = PLATFORMS[key].fixed;
  $('sPlatform').value = key;
  $('sComm').value = S.commissionPct;
}

function fillPlatforms() {
  const sel = $('sPlatform');
  const cur = sel.value;
  sel.innerHTML = '';
  PLATFORM_KEYS.forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = tx(PLATFORMS[k].name) + ' — ' + PLATFORMS[k].pct + '%';
    sel.appendChild(o);
  });
  if (cur) sel.value = cur;
}

function fillPresets() {
  const ps = $('sPreset');
  const cur = ps.value;
  ps.innerHTML = '';
  PRESET_KEYS.forEach(k => {
    const o = document.createElement('option');
    o.value = k; o.textContent = tx(PRESETS[k].name);
    ps.appendChild(o);
  });
  if (cur) ps.value = cur;
}

function selectCity(k, quiet) {
  const c = CITIES[k];
  S.sel = k;
  S.rent = c.rentAvg;
  S.budget = Math.round(c.budget * familyMultiplier(S.adults + S.kids));
  setPlatform(defaultPlatform(k));
  $('sRent').min = c.rentMin; $('sRent').max = c.rentMax; $('sRent').value = S.rent;
  $('sBudget').value = S.budget;
  $('cityName').innerHTML =
    `<img src="${FLAGS}${c.flag}.svg" alt=""> ${tx(c.name)}
     <small>${t('tariff')} ${c.dt.toFixed(2)} €/km · ${t('ceiling')} ${c.maxJobsHour} ${t('jobsPerH')} · ☀ ${c.sun}${t('sunYear')}</small>
     ${c.note ? `<small class="note">${c.note}</small>` : ''}`;
  if (!quiet) render();
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

function paintLabels() {
  document.querySelectorAll('[data-t]').forEach(el => {
    el.textContent = t(el.getAttribute('data-t'));
  });
  document.title = t('title');
}

export function init() {
  fillPlatforms();
  $('sPlatform').addEventListener('change', e => { setPlatform(e.target.value); render(); });

  fillPresets();
  $('sPreset').addEventListener('change', e => applyPreset(e.target.value));

  $('langBtn').addEventListener('click', () => {
    setLang(getLang() === 'bg' ? 'en' : 'bg');
    $('langBtn').textContent = getLang() === 'bg' ? '🇬🇧 EN' : '🇧🇬 BG';
    fillPlatforms(); fillPresets(); paintLabels();
    $('presetDesc').textContent = tx(PRESETS[$('sPreset').value].desc);
    selectCity(S.sel);
  });

  let locked = false;
  $('lockBtn').addEventListener('click', () => {
    locked = !locked;
    document.body.classList.toggle('locked', locked);
    $('lockBtn').textContent = locked ? '🔒' : '🔓';
    $('lockBtn').classList.toggle('on', locked);
  });

  bind('sAdults','adults'); bind('sKids','kids');
  bind('sRent','rent'); bind('sBudget','budget');
  bind('sHours','hours'); bind('sCommit','commitHours');
  bind('sPeak','peakFocus', v => v/100);
  bind('sDays','workDays'); bind('sKm','maxKmDay');
  bind('sCar','carCost'); bind('sTips','tips');
  bind('sComm','commissionPct');
  bind('sStrategy','strategy', v => v/100);
  bind('sFlow','flow', v => v/100);
  bind('sComfort','comfort', v => v/100);

  paintLabels();
  $('sPreset').value = 'sofia_now';
  applyPreset('sofia_now');
}
