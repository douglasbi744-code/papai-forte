/* Papai Forte — Projeto 90 dias (PWA, dados no aparelho) */
(() => {
'use strict';
const P = window.PLAN;
const KEY = 'papaiforte.v1';
const $app = document.getElementById('app');

/* ---------- estado ---------- */
const blank = () => ({ config: { ...P.defaults }, food: {}, train: {}, weight: {} });
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === 'object') {
      const b = blank();
      return migrate({ config: { ...b.config, ...(s.config || {}) }, food: s.food || {}, train: s.train || {}, weight: s.weight || {} });
    }
  } catch (e) {}
  return blank();
}
// v1 contava copos de 250 ml em "water"; agora são garrafas de 500 ml em "bottles"
function migrate(s) {
  Object.values(s.food || {}).forEach(f => {
    if (!f) return;
    if (f.bottles == null && f.water != null) f.bottles = Math.floor(f.water / 2);
    delete f.water;
    Object.values(f.meals || {}).forEach(m => { if (m && m.ok == null && ((m.text && m.text.trim()) || m.kcal != null || m.prot != null)) m.ok = true; });
  });
  return s;
}
let S = load();
let saveT;
function save() { clearTimeout(saveT); saveT = setTimeout(saveNow, 120); }
function saveNow() { clearTimeout(saveT); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
window.addEventListener('pagehide', saveNow);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveNow(); });

/* ---------- utilidades ---------- */
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12); };
const today = () => iso(new Date());
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const diff = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const dow = s => parse(s).getDay();
const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const ddmm = s => s.slice(8, 10) + '/' + s.slice(5, 7);
const longDate = s => parse(s).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const shortDate = s => `${DOW[dow(s)]}, ${ddmm(s)}`;
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { if (v === null || v === undefined || v === '') return null; const n = Number(String(v).replace(',', '.').trim()); return Number.isFinite(n) ? n : null; };
const fmt = (n, d = 1) => n == null ? '—' : n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: d });
const inVal = v => v == null ? '' : String(v).replace('.', ',');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const vib = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
const ICON = {
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
};

/* ---------- regras do programa ---------- */
const dayN = s => diff(S.config.start, s) + 1;
const weekOf = s => Math.floor((dayN(s) - 1) / 7) + 1;
const inProgram = s => { const n = dayN(s); return n >= 1 && n <= 90; };
const sched = s => P.schedule[dow(s)] || null;
const kindOf = s => (S.train[s] && S.train[s].k) || sched(s);
const isWeigh = s => [1, 3, 5].includes(dow(s));
const isMeasure = s => { const n = dayN(s); return n >= 1 && n <= 90 && ((n - 1) % 14 === 0 || n === 90); };
const lean = () => S.config.w0 * (1 - S.config.bf0 / 100);
const target = bf => lean() / (1 - bf / 100);
const navyBF = (waist, neck) => {
  if (!(waist > neck)) return null;
  const v = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(P.heightCm)) - 450;
  return Number.isFinite(v) ? v : null;
};

function hasRec(e) {
  if (!e) return false;
  if (e.done) return true;
  if (Array.isArray(e.sets) && e.sets.some(x => x && (num(x.kg) != null || num(x.r) != null))) return true;
  if (num(e.min) != null) return true;
  return false;
}
function trainProgress(s) {
  const t = S.train[s]; const k = kindOf(s);
  if (!k) return { k: null, done: 0, total: 0 };
  const exs = P.workouts[k].ex;
  const done = t ? exs.filter(x => hasRec(t.ex && t.ex[x.id])).length : 0;
  return { k, done, total: exs.length };
}
function status(s) {
  const p = trainProgress(s);
  if (!p.total || !p.done) return '';
  return p.done / p.total >= 0.7 ? 'done' : 'partial';
}
const workoutsDone = () => Object.keys(S.train).filter(d => status(d) === 'done').length;

function maxKg(sets) { const v = (sets || []).map(x => x && num(x.kg)).filter(x => x != null); return v.length ? Math.max(...v) : null; }
function loadHistory(id) {
  return Object.keys(S.train).sort().map(d => {
    const e = S.train[d].ex && S.train[d].ex[id];
    const m = e && maxKg(e.sets);
    return m == null ? null : { d, kg: m, sets: e.sets };
  }).filter(Boolean);
}
function lastSession(id, before) {
  const h = loadHistory(id).filter(x => x.d < before);
  return h.length ? h[h.length - 1] : null;
}
function suggestion(ex, date) {
  if (dayN(date) <= 14) return 'Carga leve, foco em técnica e amplitude sem dor.';
  const l = lastSession(ex.id, date);
  if (!l) return 'Ache a carga em que a última repetição sai difícil, mas limpa.';
  const sets = (l.sets || []).filter(x => x && (num(x.kg) != null || num(x.r) != null));
  const allTop = sets.length >= 3 && sets.every(x => (num(x.r) || 0) >= ex.top);
  if (allTop) return `Suba para <b>~${fmt(Math.round(l.kg * 1.05 * 2) / 2)} kg</b>.`;
  return 'Mantenha a carga e busque mais repetições até o teto.';
}

function weekAvgs() {
  const m = {};
  Object.entries(S.weight).forEach(([d, w]) => { if (w && num(w.kg) != null) (m[weekOf(d)] = m[weekOf(d)] || []).push(num(w.kg)); });
  return Object.entries(m).map(([wk, a]) => ({ wk: +wk, avg: a.reduce((x, y) => x + y, 0) / a.length, n: a.length })).sort((a, b) => a.wk - b.wk);
}
function weightAlert() {
  const cur = weekOf(today());
  const c = weekAvgs().filter(x => x.wk < cur);
  const n = c.length;
  if (n >= 3 && c[n - 1].wk - c[n - 3].wk === 2 && c[n - 1].avg >= c[n - 2].avg - 0.1 && c[n - 2].avg >= c[n - 3].avg - 0.1)
    return { cls: 'warn', ic: '📉', t: '2 semanas seguidas sem cair. Tire ~150 kcal por dia (ex.: metade do arroz do jantar) ou some 2 mil passos.' };
  if (n >= 2 && c[n - 1].wk - c[n - 2].wk === 1) {
    const drop = c[n - 2].avg - c[n - 1].avg;
    if (drop > 1) return { cls: 'warn', ic: '⚡', t: `Caiu ${fmt(drop)} kg na última semana. Rápido demais: acrescente ~150 kcal.` };
    if (drop >= 0.4) return { cls: 'good', ic: '✅', t: `Caiu ${fmt(drop)} kg na última semana. Ritmo bom, continue igual.` };
  }
  return null;
}
function latestBF() {
  const d = Object.keys(S.weight).sort().reverse().find(k => num(S.weight[k].waist) != null && num(S.weight[k].neck) != null);
  return d ? { d, bf: navyBF(num(S.weight[d].waist), num(S.weight[d].neck)) } : null;
}
function nextWeigh(from) { let d = addDays(from, 1); while (!isWeigh(d)) d = addDays(d, 1); return d; }
function nextMeasure(from) {
  for (let i = 0; i < 120; i++) { const d = addDays(from, i); if (isMeasure(d)) return d; }
  return null;
}
function lastPain() {
  const t = today();
  const d = Object.keys(S.train).filter(k => k <= t && S.train[k].pain != null).sort().pop();
  return d ? { d, v: S.train[d].pain } : null;
}

const foodDay = (d, make) => { if (!S.food[d] && make) S.food[d] = { meals: {}, bottles: 0, hab: {} }; const f = S.food[d]; if (f) { f.meals = f.meals || {}; f.hab = f.hab || {}; f.bottles = f.bottles || 0; } return f; };
function foodTotals(d) {
  const f = S.food[d]; let kcal = 0, prot = 0, n = 0;
  if (f && f.meals) Object.values(f.meals).forEach(m => { if (m.skip) return; kcal += num(m.kcal) || 0; prot += num(m.prot) || 0; if (m.ok) n++; });
  return { kcal, prot, n };
}
function mealFilled(m) { return !!m && !!((m.text && m.text.trim()) || num(m.kcal) != null || num(m.prot) != null); }
const mealReg = m => !!m && !!(m.ok || m.skip);
const mins = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
const nowMins = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
// Refeição da vez: a primeira ainda não registrada cujo horário já chegou (libera 30 min antes)
function mealFocus(d) {
  const f = S.food[d], main = P.meals.filter(m => !m.opt), now = nowMins();
  const open = main.filter(m => !mealReg(f && f.meals[m.id]));
  const cur = open.find(m => now >= mins(m.time) - 30) || null;
  const next = open.find(m => m !== cur && mins(m.time) - 30 > now) || null;
  return { cur, next, left: open.length };
}
const inLabel = m => { const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h${r ? ' ' + r + ' min' : ''}` : `${r} min`; };
const trainDay = d => { if (!S.train[d]) S.train[d] = { k: kindOf(d), ex: {} }; S.train[d].ex = S.train[d].ex || {}; return S.train[d]; };

/* ---------- UI helpers ---------- */
const ui = { foodDate: today(), trainDate: today(), weightDate: today(), last: null };

function ring(pct, size, stroke, label, sub, cls = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(pct, 0, 1));
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}"><circle class="trk" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
    <circle class="val ${cls}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${off}"/></svg>
    <div class="lbl"><b>${label}</b><span>${sub}</span></div></div>`;
}
function animateRings() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $app.querySelectorAll('.ring .val[data-off]').forEach(el => { el.style.strokeDashoffset = el.dataset.off; });
  }));
}
function meter(label, val, goal, unit, cls = '') {
  const pct = goal ? val / goal : 0;
  return `<div class="meter"><div class="top"><span>${label}</span><span><b>${fmt(val, 0)}</b> <span class="muted">/ ${fmt(goal, 0)} ${unit}</span></span></div>
    <div class="bar ${cls} ${pct > 1.08 && cls !== 'g' ? 'over' : ''}"><span style="width:${clamp(pct * 100, 0, 100)}%"></span></div></div>`;
}
function dateNav(scr, d) {
  const t = today();
  const lbl = d === t ? 'Hoje' : (d === addDays(t, -1) ? 'Ontem' : (d === addDays(t, 1) ? 'Amanhã' : longDate(d)));
  const sub = inProgram(d) ? `Dia ${dayN(d)} · semana ${weekOf(d)}` : (dayN(d) < 1 ? `${1 - dayN(d)} dia(s) antes do início` : 'Fora dos 90 dias');
  return `<div class="datenav">
    <button class="iconbtn" data-act="nav-date" data-scr="${scr}" data-delta="-1" aria-label="Dia anterior">${ICON.left}</button>
    <div class="d"><b>${esc(lbl)}</b><span class="small muted">${d === t ? esc(longDate(d)) + ' · ' : ''}${sub}</span>
      ${d !== t ? `<br><button class="linkbtn" data-act="today-date" data-scr="${scr}">Voltar para hoje</button>` : ''}</div>
    <button class="iconbtn" data-act="nav-date" data-scr="${scr}" data-delta="1" aria-label="Próximo dia">${ICON.right}</button></div>`;
}
const BOTTLE = 'M15 2h10v9c0 3 9 6 9 14v55a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6V25c0-8 9-11 9-14z';
const waterLabel = w => `/${P.goals.water} · ${fmt(w * P.bottleMl / 1000, 1)} L`;
function waterBlock(d, withPush) {
  const f = S.food[d]; const w = f ? f.bottles || 0 : 0;
  let b = '';
  for (let i = 0; i < Math.max(P.goals.water, w); i++) b += `<button class="bottle ${i < w ? 'on' : ''}" data-act="water" data-d="${d}" data-i="${i}" aria-label="Garrafa ${i + 1} de 500 ml" aria-pressed="${i < w}">
    <svg viewBox="0 0 40 90"><g clip-path="url(#bottleClip)"><rect class="liq" x="0" y="0" width="40" height="90"/><path class="wave" d="M0 0q5-4 10 0t10 0 10 0 10 0v8H0z"/></g><path class="out" d="${BOTTLE}"/></svg><span>${i + 1}</span></button>`;
  const pushOn = pushState() === 'on';
  return `<div class="card-h"><h3>💧 Água <span class="small muted" style="font-family:Barlow,sans-serif;font-weight:500">meta 3 L</span></h3><span class="cond" style="font-size:1.2rem"><b data-water-n>${w}</b><span class="muted" data-water-l>${waterLabel(w)}</span></span></div>
    <div class="water">${b}</div>
    <p class="tiny muted" style="margin:8px 0 0">Cada garrafa = 500 ml. Toque nela quando terminar de beber.</p>
    ${withPush && !pushOn ? `<button class="btn sm" style="margin-top:10px" data-act="push-enable">🔔 Ativar lembretes de água</button>` : ''}`;
}
function updateWaterDom(w) {
  const bs = $app.querySelectorAll('.bottle');
  if (w > bs.length) { render(true); return; }
  bs.forEach((c, j) => { c.classList.toggle('on', j < w); c.setAttribute('aria-pressed', j < w); });
  $app.querySelectorAll('[data-water-n]').forEach(n => { n.textContent = w; });
  $app.querySelectorAll('[data-water-l]').forEach(n => { n.textContent = waterLabel(w); });
}
function appbar(title) {
  return `<header class="appbar"><a class="brand" href="#hoje"><img src="icons/icon-192.png" alt=""><span class="wordmark">Papai <b>Forte</b><small>Projeto 90 dias</small></span></a>
    ${title ? `<span class="eyebrow">${title}</span>` : ''}</header>`;
}
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; }

/* ---------- gráfico de linha ---------- */
function lineChart(pts, o = {}) {
  if (pts.length < 1) return `<div class="empty">${o.empty || 'Sem dados ainda.'}</div>`;
  const W = 320, H = 150, L = 34, R = 10, T = 12, B = 22;
  const ys = pts.map(p => p.y).concat(o.goal != null ? [o.goal] : []);
  let lo = Math.min(...ys), hi = Math.max(...ys);
  const padv = Math.max((hi - lo) * 0.15, o.minPad || 0.5); lo -= padv; hi += padv;
  const x = i => pts.length === 1 ? (L + W - R) / 2 : L + i * (W - L - R) / (pts.length - 1);
  const y = v => T + (hi - v) * (H - T - B) / (hi - lo);
  let g = '';
  for (let i = 0; i <= 3; i++) { const v = lo + (hi - lo) * i / 3; g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 5}" y="${y(v) + 3}" text-anchor="end">${fmt(v, 1)}</text>`; }
  const step = Math.ceil(pts.length / 6);
  pts.forEach((p, i) => { if (i % step === 0 || i === pts.length - 1) g += `<text class="ax" x="${x(i)}" y="${H - 6}" text-anchor="middle">${esc(p.x)}</text>`; });
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const area = pts.length > 1 ? `<path class="area" d="${d} L${x(pts.length - 1)},${H - B} L${x(0)},${H - B} Z"/>` : '';
  const goal = o.goal != null ? `<line class="goal" x1="${L}" x2="${W - R}" y1="${y(o.goal)}" y2="${y(o.goal)}"/><text class="goal-t" x="${W - R}" y="${y(o.goal) - 4}" text-anchor="end">${esc(o.goalLabel || '')}</text>` : '';
  const dots = pts.map((p, i) => `<circle class="dot" cx="${x(i)}" cy="${y(p.y)}" r="3.5"><title>${esc(p.x)}: ${fmt(p.y)}</title></circle>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'gráfico')}">${g}${goal}${area}<path class="ln draw" pathLength="1000" d="${d}"/>${dots}</svg>`;
}

/* ---------- telas ---------- */
const screens = {};

screens.hoje = () => {
  const t = today(), n = dayN(t), started = n >= 1, done = workoutsDone();
  const pct = clamp(n / 90, 0, 1);
  const st = S.config.start;
  const hero = `<section class="card hero">
    <div class="hero-top"><div>
      <div class="eyebrow">${greeting()}, papai</div>
      ${started && n <= 90 ? `<div class="bignum">${n}<span class="of">de 90</span></div>` :
        !started ? `<div class="bignum">${1 - n}<span class="of">dia${1 - n > 1 ? 's' : ''} para começar</span></div>` :
        `<div class="bignum">90<span class="of">concluído 🏆</span></div>`}
      <div class="pillrow">${started && n <= 90 ? `<span class="pill">Semana ${weekOf(t)} de 13</span>` : `<span class="pill">Início ${ddmm(st)}</span>`}<span class="pill sun">${done} treino${done === 1 ? '' : 's'} feito${done === 1 ? '' : 's'}</span></div>
    </div>${ring(pct, 92, 9, Math.round(pct * 100) + '%', 'jornada')}</div>
  </section>`;

  // alerta de dor
  const lp = lastPain();
  const pain = lp && lp.v >= 4 ? `<div class="alert warn"><span class="ic">🩻</span><div><b>Dor ${lp.v}/10 no último treino (${ddmm(lp.d)}).</b> Reduza a carga do exercício que doeu. Se irradiar, formigar ou adormecer: pare e procure o médico.</div></div>` : '';

  // treino
  const k = kindOf(t), pr = trainProgress(t);
  const train = k ? `<section class="card"><div class="card-h"><span class="eyebrow">Treino de hoje</span>${status(t) === 'done' ? '<span class="tag good">Feito</span>' : pr.done ? '<span class="tag sun">Em andamento</span>' : ''}</div>
      <div class="row" style="align-items:center"><div class="grow"><h2 style="margin:0">Treino ${k} · ${P.workouts[k].name}</h2>
      <p class="muted small" style="margin:4px 0 0">${pr.total} exercícios · 3 séries · descanso 60–90 s</p></div>
      ${ring(pr.total ? pr.done / pr.total : 0, 58, 6, `${pr.done}/${pr.total}`, '', status(t) === 'done' ? 'good' : '')}</div>
      <button class="btn primary block" style="margin-top:12px" data-act="open-train" data-d="${t}">${S.train[t] && S.train[t].finished ? 'Ver treino de hoje' : S.train[t] && S.train[t].started ? 'Continuar treino →' : '▶ Iniciar treino'}</button></section>`
    : `<section class="card"><span class="eyebrow">Hoje</span><h2 style="margin:6px 0">🚶 Descanso ativo</h2><p class="muted small">Caminhada 30–40 min ou bike leve + Big 3 de McGill (curl-up, prancha lateral, perdigueiro).</p>
      <button class="btn block" data-act="open-train" data-d="${t}">Ver opções / repor um treino</button></section>`;

  // comida
  const ft = foodTotals(t), fcs = mealFocus(t), nxt = fcs.cur || fcs.next;
  const food = `<section class="card ${fcs.cur ? 'meal-now' : ''}"><div class="card-h"><span class="eyebrow">Comida</span><span class="small muted">${ft.n} refeiç${ft.n === 1 ? 'ão' : 'ões'} registrada${ft.n === 1 ? '' : 's'}</span></div>
    <div class="row" style="gap:16px">${ring(ft.kcal / P.goals.kcal, 84, 8, fmt(ft.kcal, 0), 'kcal')}${ring(ft.prot / P.goals.prot, 84, 8, fmt(ft.prot, 0) + 'g', 'proteína', 'good')}
      <div class="grow small">${nxt ? `<span class="muted">${fcs.cur ? '🍽️ Hora de comer' : 'Próxima'}</span><br><b class="cond" style="font-size:1.25rem">${nxt.time} · ${nxt.name}</b><br><span class="muted">${fcs.cur ? 'esperando você registrar' : 'daqui a ' + inLabel(mins(nxt.time) - nowMins())}</span>` : '<span class="muted">Refeições do dia registradas ✅</span>'}</div></div>
    <a class="btn ${fcs.cur ? 'primary' : ''} block" style="margin-top:12px" href="#comida" data-act="food-today">${fcs.cur ? 'Registrar ' + fcs.cur.name.toLowerCase() : 'Abrir comida'}</a></section>`;

  // peso
  const wToday = S.weight[t] && num(S.weight[t].kg) != null;
  const nm = nextMeasure(t);
  const weigh = `<section class="card"><div class="card-h"><span class="eyebrow">Pesagem</span>${wToday ? `<span class="tag good">${fmt(num(S.weight[t].kg))} kg</span>` : ''}</div>
    ${isWeigh(t) && !wToday ? `<h3>⚖️ Hoje é dia de pesar</h3><p class="small muted" style="margin-top:4px">Em jejum, depois do banheiro, antes do treino.</p>`
      : `<h3>Próxima pesagem: ${shortDate(isWeigh(t) && !wToday ? t : nextWeigh(t))}</h3>`}
    ${nm === t ? `<div class="alert sun" style="margin:10px 0 0"><span class="ic">📏</span><div><b>Hoje é dia de medir</b> cintura e pescoço.</div></div>` : nm ? `<p class="small muted" style="margin:6px 0 0">Próximas medidas: ${shortDate(nm)}</p>` : ''}
    ${isWeigh(t) && !wToday ? `<a class="btn primary block" style="margin-top:12px;text-decoration:none" href="#peso">Registrar peso</a>` : ''}</section>`;

  // hábitos
  const f = S.food[t] || { hab: {} };
  const habits = `<section class="card"><div class="card-h"><span class="eyebrow">Hábitos do dia</span></div>
    <div class="habits">${P.habits.map(h => `<button class="habit" data-act="habit" data-d="${t}" data-h="${h.id}" aria-pressed="${!!(f.hab && f.hab[h.id])}"><span class="ck">${ICON.check}</span>${h.label}</button>`).join('')}</div>
    ${waterBlock(t, true)}</section>`;

  return `<div class="view stagger">${appbar()}${hero}${pain}${train}${food}${weigh}${habits}</div>`;
};

/* ---------- calendário ---------- */
screens.cal = () => {
  const t = today();
  const st = S.config.start, gs = addDays(st, -((dow(st) + 6) % 7));
  let grid = '<span></span>' + ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(x => `<span class="hd">${x}</span>`).join('');
  let idx = 0;
  for (let w = 0; w < 13; w++) {
    grid += `<span class="wk">${w + 1}</span>`;
    for (let i = 0; i < 7; i++) {
      const d = addDays(gs, w * 7 + i); idx++;
      if (!inProgram(d)) { grid += '<span class="cell none"></span>'; continue; }
      const s = status(d), cls = ['cell'];
      if (s) cls.push(s); else if (!kindOf(d)) cls.push('rest');
      if (d > t) cls.push('future');
      if (d === t) cls.push('today');
      if (S.weight[d] && num(S.weight[d].kg) != null) cls.push('w');
      grid += `<button class="${cls.join(' ')}" style="animation-delay:${idx * 6}ms" data-act="cell" data-d="${d}" aria-label="Dia ${dayN(d)}, ${shortDate(d)}${s === 'done' ? ', treino feito' : s === 'partial' ? ', incompleto' : ''}"><span>${+d.slice(8)}</span></button>`;
    }
  }
  const days = Object.keys(S.train).filter(d => inProgram(d));
  const done = days.filter(d => status(d) === 'done').length, part = days.filter(d => status(d) === 'partial').length;
  let planned = 0, missed = 0;
  for (let i = 0; i < 90; i++) { const d = addDays(st, i); if (d >= t) break; if (!kindOf(d)) continue; planned++; if (!status(d)) missed++; }
  const weighs = Object.keys(S.weight).filter(d => num(S.weight[d].kg) != null).length;
  const n = dayN(t);
  const stat = (v, l, c = '') => `<div class="calstat ${c}"><b>${v}</b><span>${l}</span></div>`;
  return `<div class="view stagger">${appbar('Calendário')}
    <section class="card hero"><span class="eyebrow">Os 90 dias</span>
      <h2 style="margin:4px 0 0">${n < 1 ? `Começa em ${ddmm(st)}` : n > 90 ? 'Projeto concluído 🏆' : `Dia ${n} · semana ${weekOf(t)} de 13`}</h2>
      <div class="grid90 big">${grid}</div>
      <div class="legend"><span><i style="background:var(--sunrise)"></i>Feito</span><span><i style="background:rgba(240,160,75,.35)"></i>Incompleto</span><span><i style="border:1.5px dashed rgba(255,255,255,.3)"></i>Descanso</span><span><i style="background:#4CBF88;border-radius:50%"></i>Pesagem</span></div>
      <p class="tiny" style="margin:10px 0 0;color:var(--night-muted)">Toque num dia para ver ou registrar o treino.</p></section>
    <section class="card"><div class="card-h"><span class="eyebrow">Resumo</span></div>
      <div class="calstats">${stat(done, 'treinos feitos', 'sun')}${stat(part, 'incompletos')}${stat(missed, `perdidos de ${planned}`)}${stat(weighs, 'pesagens', 'good')}</div></section>
  </div>`;
};

screens.comida = () => {
  const d = ui.foodDate, f = S.food[d], ft = foodTotals(d);
  const focus = d === today() && !ui.foodAll;
  const top = `${appbar('Comida')}${dateNav('food', d)}<section class="card" id="food-totals">${foodTotalsHTML(ft)}</section>`;
  const water = `<section class="card">${waterBlock(d, true)}</section>`;
  if (!focus) {
    const fc = d === today() ? mealFocus(d) : {};
    return `<div class="view">${top}
      ${d === today() ? `<p style="margin:-4px 0 12px;text-align:center"><button class="linkbtn" data-act="food-all">‹ Mostrar só a refeição da hora</button></p>` : ''}
      <div class="stagger">${P.meals.map(m => mealListCard(m, f && f.meals[m.id], fc.cur && fc.cur.id === m.id)).join('')}</div>${water}
      <p class="small muted" style="text-align:center">Sem álcool, refrigerante e fritura nos 90 dias.<br>Fim de semana conta e vai no “Fora do plano”.</p></div>`;
  }
  const fc = mealFocus(d);
  let main;
  if (fc.cur) main = mealNowCard(fc.cur, f && f.meals[fc.cur.id]);
  else if (fc.next) {
    const left = mins(fc.next.time) - nowMins();
    main = `<section class="card wait-card"><div class="clock">⏳</div><span class="eyebrow">Próxima refeição</span>
      <div class="cd">${fc.next.name} · ${fc.next.time}</div><p class="muted" style="margin:0">daqui a ${inLabel(left)}</p>
      <p class="small muted" style="margin:12px 0 0">${esc(fc.next.plan)}</p>
      <p class="tiny muted" style="margin:10px 0 0">Ela aparece aqui 30 min antes do horário.</p></section>`;
  } else {
    main = `<section class="card wait-card"><div class="clock">✅</div><h2 style="margin:6px 0 4px">Refeições do dia registradas</h2>
      <p class="small muted" style="margin:0">${ft.kcal >= P.goals.kcal * 0.9 && ft.prot >= P.goals.prot * 0.9 ? 'Metas do dia batidas. Amanhã tem mais! 💪' : 'Se beliscou algo fora do plano, anote abaixo.'}</p></section>`;
  }
  const regs = P.meals.filter(m => mealReg(f && f.meals[m.id]));
  const chips = regs.length ? `<section class="card flat"><span class="eyebrow">Já registradas hoje</span><div class="donechips" style="margin-top:8px">${regs.map(m => {
    const v = f.meals[m.id];
    return `<button class="donechip ${v.skip ? 'skip' : ''}" data-act="food-all">${v.skip ? '' : '✓ '}${m.name}${v.ts ? ' · ' + new Date(v.ts).toTimeString().slice(0, 5) : ''}</button>`;
  }).join('')}</div><p class="tiny muted" style="margin:8px 0 0">Toque para ver ou corrigir.</p></section>` : '';
  const ex = ui.foodExtra && P.meals.find(m => m.id === ui.foodExtra);
  const extras = `<div class="row" style="margin-bottom:12px">${P.meals.filter(m => m.opt).map(m => `<button class="btn sm grow" data-act="meal-extra" data-meal="${m.id}" aria-pressed="${ui.foodExtra === m.id}">${mealReg(f && f.meals[m.id]) ? '✓ ' : '+ '}${m.name}</button>`).join('')}</div>
    ${ex ? mealListCard(ex, f && f.meals[ex.id]) : ''}`;
  return `<div class="view">${top}<div class="stagger">${main}${extras}${chips}</div>${water}
    <p style="text-align:center;margin:0 0 8px"><button class="linkbtn" data-act="food-all">Ver todas as refeições do dia</button></p></div>`;
};

function mealNowCard(m, v) {
  v = v || {};
  const draft = mealFilled(v);
  return `<section class="card meal-now step-in" data-meal-card="${m.id}">
    <div class="row between"><span class="eyebrow">Hora de comer</span><span class="tag sun">${m.kcal} kcal · ${m.prot} g prot.</span></div>
    <div class="row" style="align-items:flex-end;gap:12px;margin-top:8px"><span class="bigtime">${m.time}</span><h2>${m.name}</h2></div>
    <p class="plan" style="font-size:.95rem">${esc(m.plan)}</p>
    <button class="btn good block go" data-act="meal-plan" data-meal="${m.id}">✓ Comi o plano</button>
    <details class="acc" style="margin-top:10px" ${draft ? 'open' : ''}><summary>Comi outra coisa</summary><div>
      <textarea rows="2" data-meal="${m.id}" data-f="text" placeholder="O que você comeu?">${esc(v.text || '')}</textarea>
      <div class="fields c2" style="margin-top:8px">
        <div><label class="lb">kcal (opcional)</label><input class="n" inputmode="decimal" data-meal="${m.id}" data-f="kcal" value="${inVal(v.kcal)}" placeholder="—"></div>
        <div><label class="lb">Proteína g (opcional)</label><input class="n" inputmode="decimal" data-meal="${m.id}" data-f="prot" value="${inVal(v.prot)}" placeholder="—"></div>
      </div>
      <button class="btn primary block" style="margin-top:10px" data-act="meal-reg" data-meal="${m.id}">Registrar</button></div></details>
    <p style="text-align:center;margin:6px 0 0"><button class="linkbtn" style="color:var(--muted)" data-act="meal-skip" data-meal="${m.id}">Não vou fazer esta refeição</button></p>
  </section>`;
}

function mealListCard(m, v, isNext) {
  v = v || {};
  return `<section class="card meal ${v.ok ? 'filled' : ''} ${isNext && !mealReg(v) ? 'next' : ''}" data-meal-card="${m.id}" data-list>
    <div class="row between"><div class="row"><span class="time">${m.time}</span><h3>${m.name}</h3></div>
      ${v.skip ? '<span class="tag">Pulada</span>' : m.opt ? '<span class="tag">Opcional</span>' : `<span class="tag sun">${m.kcal} kcal · ${m.prot} g</span>`}</div>
    <p class="plan">${esc(m.plan)}</p>
    <label class="lb" for="m-${m.id}">O que você comeu</label>
    <textarea id="m-${m.id}" rows="2" data-meal="${m.id}" data-f="text" placeholder="Ex.: ${esc(m.quick || 'descreva aqui')}">${esc(v.text || '')}</textarea>
    <div class="fields c2" style="margin-top:8px">
      <div><label class="lb">kcal</label><input class="n" inputmode="decimal" data-meal="${m.id}" data-f="kcal" value="${inVal(v.kcal)}" placeholder="—"></div>
      <div><label class="lb">Proteína (g)</label><input class="n" inputmode="decimal" data-meal="${m.id}" data-f="prot" value="${inVal(v.prot)}" placeholder="—"></div>
    </div>
    <div class="ex-actions">${m.quick ? `<button class="btn good sm" data-act="meal-plan" data-meal="${m.id}">✓ Comi o plano</button>` : ''}
      <button class="btn ghost sm" data-act="meal-clear" data-meal="${m.id}">Limpar</button></div></section>`;
}

function foodTotalsHTML(ft) {
  return `<div class="card-h" style="margin-bottom:2px"><span class="eyebrow">Total do dia</span><span class="small muted">${ft.n} anotada${ft.n === 1 ? '' : 's'}</span></div>
    ${meter('Calorias', ft.kcal, P.goals.kcal, 'kcal')}${meter('Proteína', ft.prot, P.goals.prot, 'g', 'g')}`;
}

screens.treino = () => {
  const d = ui.trainDate, k = kindOf(d), t = S.train[d];
  const started = !!(t && t.started), finished = !!(t && t.finished);
  const guided = !!k && d === today() && !ui.trainList;
  const running = guided && started && !finished;
  const seg = running ? '' : `<div class="seg" role="group" aria-label="Escolher treino">${['A', 'B', 'C'].map(x => `<button data-act="kind" data-k="${x}" aria-pressed="${k === x}"><span class="k">${x}</span><small>${P.workouts[x].name}</small></button>`).join('')}</div>`;
  let body;
  if (!k) {
    body = `<section class="card hero"><span class="eyebrow">Fim de semana</span><h2 style="margin:6px 0 4px">🚶 Descanso ativo</h2>
      <p style="color:var(--night-muted);margin:0">Caminhada 30–40 min ou bike leve + Big 3 de McGill: curl-up, prancha lateral e perdigueiro.</p>
      <p class="small" style="color:var(--night-muted);margin:10px 0 0">Perdeu um treino na semana? Escolha A, B ou C acima para repor.</p></section>`;
  } else if (running) body = guidedView(d, k, t);
  else if (guided && finished) body = summaryView(d, k, t);
  else if (guided) body = preStartView(d, k, t);
  else body = listView(d, k, t);
  return `<div class="view">${appbar('Treino')}${running ? '' : dateNav('train', d)}${seg}${body}${running ? '' : evolutionTable()}</div>`;
};

const adaptAlert = d => dayN(d) >= 1 && dayN(d) <= 14 ? `<div class="alert sun"><span class="ic">🌱</span><div><b>Semanas 1–2: adaptação.</b> Carga leve, foco em técnica. Pare 1–2 repetições antes da falha.</div></div>` : '';

function preStartView(d, k, t) {
  const w = P.workouts[k], pr = trainProgress(d);
  return `${adaptAlert(d)}<section class="card hero start-card">
    <span class="eyebrow">Treino de hoje</span>
    <h2 style="margin:6px 0 2px;font-size:2rem">Treino ${k} · ${w.name}</h2>
    <p class="small" style="color:var(--night-muted);margin:0">${w.ex.length} exercícios · 3 séries · descanso 60–90 s</p>
    <ol class="prelist">${w.ex.map(ex => `<li><span class="grow">${ex.name}${ex.spine ? ' <span title="Cuidado com a coluna">⚠️</span>' : ''}</span><span class="cond">${ex.scheme}</span></li>`).join('')}</ol>
    <button class="btn primary block go" data-act="start-train">▶ Iniciar treino</button>
  </section>
  <p style="text-align:center;margin:0 0 12px"><button class="linkbtn" data-act="list-mode">${pr.done ? 'Ver o que já foi registrado' : 'Registrar em lista, sem modo guiado'}</button></p>`;
}

function guidedView(d, k, t) {
  const exs = P.workouts[k].ex, N = exs.length, cur = clamp(t.cur || 0, 0, N);
  const dots = exs.map((ex, i) => `<button class="dot-step ${hasRec(t.ex && t.ex[ex.id]) ? 'ok' : ''} ${i === cur ? 'cur' : ''}" data-act="goto-ex" data-i="${i}" aria-label="Exercício ${i + 1}: ${esc(ex.name)}"></button>`).join('')
    + `<button class="dot-step end ${cur === N ? 'cur' : ''}" data-act="goto-ex" data-i="${N}" aria-label="Finalização">🏁</button>`;
  const head = `<section class="card run-head"><div class="row between">
      <div><span class="eyebrow">Treino ${k} · ${P.workouts[k].name}</span><div class="cond run-step">${cur < N ? `Exercício <b>${cur + 1}</b> de ${N}` : 'Finalização'}</div></div>
      <div class="elapsed"><span class="tiny muted">tempo</span><b class="cond" data-elapsed="${t.started}">0:00</b></div></div>
      <div class="dots">${dots}</div></section>`;
  if (cur === N) {
    const done = exs.filter(ex => hasRec(t.ex && t.ex[ex.id])).length;
    return `${head}<section class="card step-in"><h2 style="margin-bottom:4px">Quase lá! 🏁</h2>
      <p class="small muted" style="margin:0 0 6px">${done} de ${N} exercícios registrados. Antes de encerrar, anote como ficou a lombar.</p>
      ${painBlock(t)}
      <button class="btn primary block go" style="margin-top:14px" data-act="finish-train">🏁 Finalizar treino</button>
      <button class="btn ghost block" style="margin-top:8px" data-act="prev-ex">‹ Voltar ao último exercício</button></section>`;
  }
  const ex = exs[cur], nx = exs[cur + 1];
  return `${head}<div class="step-in">${exCard(ex, cur, d, t.ex && t.ex[ex.id], true)}</div>
    <div class="run-nav">
      ${cur > 0 ? `<button class="btn" data-act="prev-ex" aria-label="Exercício anterior">‹</button>` : ''}
      <button class="btn primary grow go" data-act="next-ex" data-ex="${ex.id}">${nx ? 'Concluir · próximo exercício →' : 'Concluir · ir para finalização →'}</button>
    </div>
    ${nx ? `<p class="small muted" style="text-align:center;margin:10px 0 0">A seguir: <b>${nx.name}</b> · ${nx.scheme}</p>` : ''}
    <p style="text-align:center;margin:8px 0 0"><button class="linkbtn" data-act="list-mode">Ver lista completa</button></p>`;
}

function summaryView(d, k, t) {
  const exs = P.workouts[k].ex, done = exs.filter(ex => hasRec(t.ex && t.ex[ex.id])).length;
  const dur = Math.max(0, Math.round((t.finished - t.started) / 60000));
  return `<section class="card hero"><span class="eyebrow">Treino ${k} · ${P.workouts[k].name}</span>
    <h2 style="margin:6px 0 10px;font-size:2rem">Treino concluído 🔥</h2>
    <div class="stats">
      <div class="stat hl" style="background:rgba(255,255,255,.07)"><div class="v">${inLabel(dur)}</div><div class="k">Duração</div></div>
      <div class="stat hl" style="background:rgba(255,255,255,.07)"><div class="v">${done}<small>/${exs.length}</small></div><div class="k">Exercícios</div></div>
    </div>
    ${t.pain != null ? `<p class="small" style="margin:10px 0 0;color:var(--night-muted)">Dor lombar: <b style="color:#fff">${t.pain}/10</b>${t.note ? ` · ${esc(t.note)}` : ''}</p>` : ''}
  </section>
  ${t.pain != null && t.pain >= 4 ? `<div class="alert warn"><span class="ic">🩻</span><div>Reduza a carga do exercício que doeu. Se irradiar, formigar ou adormecer: pare e procure o médico.</div></div>` : ''}
  <div class="row" style="margin-bottom:12px"><button class="btn grow" data-act="list-mode">Ver / editar registros</button><button class="btn ghost" data-act="resume-train">Reabrir</button></div>`;
}

function painBlock(t) {
  const pain = t && t.pain != null ? t.pain : null;
  const btns = Array.from({ length: 11 }, (_, v) => `<button data-act="pain" data-v="${v}" aria-pressed="${pain === v}" ${pain === v ? `style="background:hsl(${140 - v * 14} 60% 45%)"` : ''}>${v}</button>`).join('');
  return `<h3 style="margin-top:6px">Dor lombar hoje</h3><p class="small muted" style="margin:2px 0 0">0 = nada · 10 = máxima</p><div class="pain" role="group" aria-label="Dor de 0 a 10">${btns}</div>
    ${pain != null && pain >= 4 ? `<div class="alert warn" style="margin:8px 0 0"><span class="ic">🩻</span><div>Reduza a carga do exercício que doeu. Se irradiar, formigar ou adormecer: pare e procure o médico.</div></div>` : ''}
    <label class="lb" style="margin-top:12px" for="tnote">Observações do treino</label><textarea id="tnote" data-tnote rows="2" placeholder="Como foi? Algo incomodou?">${esc((t && t.note) || '')}</textarea>`;
}

function listView(d, k, t) {
  const w = P.workouts[k], pr = trainProgress(d);
  const head = `<section class="card" id="train-head"><div class="row between"><div><span class="eyebrow">Treino ${k}</span><h2 style="margin:2px 0 0">${w.name}</h2></div>
    <span class="cond" style="font-size:1.5rem;font-weight:700"><span data-prog>${pr.done}</span><span class="muted" style="font-size:1rem">/${pr.total}</span></span></div>
    <div class="bar g" style="margin-top:10px"><span data-progbar style="width:${pr.total ? pr.done / pr.total * 100 : 0}%"></span></div>
    ${d === today() ? `<p style="margin:10px 0 0"><button class="linkbtn" data-act="list-mode">‹ Voltar ao modo guiado</button></p>` : ''}</section>`;
  return `${adaptAlert(d)}${head}<div class="stagger">${w.ex.map((ex, i) => exCard(ex, i, d, t && t.ex && t.ex[ex.id])).join('')}</div>
    <section class="card">${painBlock(t)}</section>`;
}

function exCard(ex, i, d, e, guided) {
  e = e || {};
  const done = hasRec(e);
  let inner = '';
  if (ex.type === 'load') {
    const last = lastSession(ex.id, d);
    const rows = [0, 1, 2].map(s => {
      const v = (e.sets && e.sets[s]) || {}, lv = last && last.sets && last.sets[s] || {};
      return `<span class="sn">${s + 1}</span>
        <input class="n" inputmode="decimal" data-ex="${ex.id}" data-i="${s}" data-f="kg" value="${inVal(v.kg)}" placeholder="${lv.kg != null ? inVal(lv.kg) : 'kg'}" aria-label="Série ${s + 1} carga">
        <input class="n" inputmode="numeric" data-ex="${ex.id}" data-i="${s}" data-f="r" value="${inVal(v.r)}" placeholder="${lv.r != null ? inVal(lv.r) : 'reps'}" aria-label="Série ${s + 1} repetições">`;
    }).join('');
    const lastTxt = last ? `Última vez (${ddmm(last.d)}): ${last.sets.filter(x => x && (num(x.kg) != null || num(x.r) != null)).map(x => `${fmt(num(x.kg))} kg × ${x.r ?? '—'}`).join(' · ')}` : 'Primeira vez neste exercício.';
    inner = `<div class="sets"><span></span><span class="sh">Carga (kg)</span><span class="sh">Reps</span>${rows}</div>
      <div class="last">${lastTxt}</div><div class="sugg">💡 ${suggestion(ex, d)}</div>`;
  } else if (ex.type === 'core-r' || ex.type === 'core-s') {
    const unit = ex.type === 'core-s' ? 'Segundos' : 'Reps';
    inner = `<div class="sets one"><span></span><span class="sh">${unit}</span>${[0, 1, 2].map(s => `<span class="sn">${s + 1}</span><input class="n" inputmode="numeric" data-ex="${ex.id}" data-i="${s}" data-f="r" value="${inVal(e.sets && e.sets[s] && e.sets[s].r)}" placeholder="${unit.toLowerCase()}" aria-label="Série ${s + 1}">`).join('')}</div>`;
  } else if (ex.type === 'cardio') {
    inner = `<div class="fields c3" style="margin-top:12px">
      <div><label class="lb">Minutos</label><input class="n" inputmode="decimal" data-ex="${ex.id}" data-f="min" value="${inVal(e.min)}" placeholder="min"></div>
      <div><label class="lb">Inclinação %</label><input class="n" inputmode="decimal" data-ex="${ex.id}" data-f="incl" value="${inVal(e.incl)}" placeholder="%"></div>
      <div><label class="lb">Velocidade</label><input class="n" inputmode="decimal" data-ex="${ex.id}" data-f="vel" value="${inVal(e.vel)}" placeholder="km/h"></div></div>`;
  }
  const actions = `<div class="ex-actions">
    ${guided ? '' : `<button class="btn sm donebtn" data-act="ex-done" data-ex="${ex.id}" aria-pressed="${!!e.done}">${e.done ? '✓ Feito' : 'Marcar feito'}</button>`}
    ${ex.type === 'load' || ex.type.startsWith('core') ? `<button class="btn sm ghost" data-act="timer">⏱ Descanso</button>` : ''}
    ${ex.type === 'load' ? `<button class="btn sm ghost" data-act="ex-chart" data-ex="${ex.id}" data-name="${esc(ex.name)}">📈 Evolução</button>` : ''}</div>`;
  return `<section class="card ex ${done ? 'done' : ''}" data-ex-card="${ex.id}">
    <div class="ex-h"><span class="ex-n">${i + 1}</span><div class="grow"><h3>${ex.name}</h3><div class="ex-scheme">${ex.scheme}</div></div></div>
    ${ex.tip ? `<p class="tip ${ex.spine ? 'spine' : ''}">${esc(ex.tip)}</p>` : ''}${inner}${actions}</section>`;
}

function evolutionTable() {
  const seen = new Set(), rows = [];
  ['A', 'B'].forEach(k => P.workouts[k].ex.forEach(ex => {
    if (ex.type !== 'load' || seen.has(ex.id)) return; seen.add(ex.id);
    const h = loadHistory(ex.id); if (!h.length) return;
    const a = h[0].kg, b = h[h.length - 1].kg, g = a ? (b - a) / a * 100 : 0;
    rows.push(`<tr><td>${ex.name}</td><td class="r">${fmt(a)}</td><td class="r"><b>${fmt(b)}</b></td><td class="r ${g > 0 ? 'down' : ''}">${g > 0 ? '+' : ''}${fmt(g, 0)}%</td></tr>`);
  }));
  return `<section class="card"><h3 style="margin-bottom:8px">📊 Evolução de cargas</h3>${rows.length ? `<table><thead><tr><th>Exercício</th><th class="r">Inicial</th><th class="r">Atual</th><th class="r">Ganho</th></tr></thead><tbody>${rows.join('')}</tbody></table>` : '<div class="empty">Registre cargas nos treinos A e B para ver a evolução aqui.</div>'}</section>`;
}

screens.peso = () => {
  const t = today(), d = ui.weightDate, cur = S.weight[d] || {};
  const nw = isWeigh(t) && !(S.weight[t] && num(S.weight[t].kg) != null) ? t : nextWeigh(t);
  const nm = nextMeasure(t);
  const al = weightAlert();
  const avgs = weekAvgs(), cw = weekOf(t);
  const closed = avgs.filter(x => x.wk < cw);
  const lastAvg = closed.length ? closed[closed.length - 1] : avgs[avgs.length - 1];
  const delta = lastAvg ? lastAvg.avg - S.config.w0 : null;
  const bf = latestBF();
  const t15 = target(15), t12 = target(12);
  const hist = Object.keys(S.weight).sort().reverse();
  const waistPts = Object.keys(S.weight).sort().filter(k => num(S.weight[k].waist) != null).map(k => ({ x: ddmm(k), y: num(S.weight[k].waist) }));
  const toGo = lastAvg ? lastAvg.avg - t15 : null;
  return `<div class="view stagger">${appbar('Peso')}
    <section class="card hero"><span class="eyebrow">Quando pesar</span>
      <h2 style="margin:6px 0 2px">Próxima pesagem: ${nw === t ? 'hoje' : shortDate(nw)}</h2>
      <p style="color:var(--night-muted);margin:0" class="small">Seg, qua e sex · em jejum · depois do banheiro · antes do treino · mesma balança. Vale a <b style="color:#fff">média semanal</b>.</p>
      ${nm ? `<p class="small" style="margin:10px 0 0">📏 Medidas (cintura no umbigo, pescoço abaixo do pomo): <b>${nm === t ? 'hoje' : shortDate(nm)}</b></p>` : ''}</section>
    ${al ? `<div class="alert ${al.cls}"><span class="ic">${al.ic}</span><div>${al.t}</div></div>` : ''}
    <section class="card"><h3 style="margin-bottom:10px">Registrar</h3>
      <div class="fields">
        <div><label class="lb" for="w-date">Data</label><input type="date" id="w-date" value="${d}" max="${t}"></div>
        <div class="fields c3">
          <div><label class="lb">Peso (kg)</label><input class="n" id="w-kg" inputmode="decimal" value="${inVal(cur.kg)}" placeholder="74,0"></div>
          <div><label class="lb">Cintura (cm)</label><input class="n" id="w-waist" inputmode="decimal" value="${inVal(cur.waist)}" placeholder="${isMeasure(d) ? 'medir!' : 'opc.'}"></div>
          <div><label class="lb">Pescoço (cm)</label><input class="n" id="w-neck" inputmode="decimal" value="${inVal(cur.neck)}" placeholder="${isMeasure(d) ? 'medir!' : 'opc.'}"></div>
        </div>
        <button class="btn primary block" data-act="w-save">Salvar pesagem</button>
      </div></section>
    <section class="card"><h3 style="margin-bottom:10px">Painel</h3><div class="stats">
      <div class="stat"><div class="v">${fmt(S.config.w0)}<small> kg</small></div><div class="k">Peso inicial</div></div>
      <div class="stat"><div class="v">${lastAvg ? fmt(lastAvg.avg) : '—'}<small> kg</small></div><div class="k">${lastAvg && lastAvg.wk < cw ? `Média da semana ${lastAvg.wk}` : 'Média da semana atual'}</div></div>
      <div class="stat"><div class="v ${delta == null ? '' : delta < 0 ? 'down' : 'up'}">${delta == null ? '—' : (delta > 0 ? '+' : '') + fmt(delta)}<small> kg</small></div><div class="k">Variação desde o início</div></div>
      <div class="stat"><div class="v">${bf && bf.bf != null ? fmt(bf.bf) : '—'}<small> %</small></div><div class="k">Gordura estimada${bf ? ` (${ddmm(bf.d)})` : ` (inicial ${S.config.bf0}%)`}</div></div>
      <div class="stat hl"><div class="v">${fmt(t15)}<small> kg</small></div><div class="k">Meta 90 dias · ~15%${toGo != null && toGo > 0 ? ` · faltam ${fmt(toGo)} kg` : ''}</div></div>
      <div class="stat hl"><div class="v">${fmt(t12)}<small> kg</small></div><div class="k">Meta final · ~12%</div></div>
    </div></section>
    <section class="card"><h3 style="margin-bottom:6px">Média semanal</h3>${lineChart(avgs.map(a => ({ x: 'S' + a.wk, y: a.avg })), { goal: t15, goalLabel: 'meta 90d ' + fmt(t15), empty: 'Pese seg, qua e sex para ver a curva.', label: 'Média semanal de peso' })}</section>
    <section class="card"><h3 style="margin-bottom:6px">Cintura</h3>${lineChart(waistPts, { empty: 'Meça a cintura nos dias de medida.', label: 'Cintura em cm' })}</section>
    <section class="card"><h3 style="margin-bottom:4px">Histórico</h3>${hist.length ? `<ul class="clean">${hist.map(k => {
      const w = S.weight[k], b = navyBF(num(w.waist), num(w.neck));
      return `<li><div class="grow"><b>${shortDate(k)}</b><br><span class="small muted">${num(w.kg) != null ? fmt(num(w.kg)) + ' kg' : ''}${num(w.waist) != null ? ' · cintura ' + fmt(num(w.waist)) : ''}${num(w.neck) != null ? ' · pescoço ' + fmt(num(w.neck)) : ''}${b != null ? ' · ' + fmt(b) + '%' : ''}</span></div>
        <button class="btn sm ghost danger" data-act="w-del" data-d="${k}" aria-label="Apagar ${shortDate(k)}">Apagar</button></li>`;
    }).join('')}</ul>` : '<div class="empty">Nenhuma pesagem ainda.</div>'}</section></div>`;
};

screens.guia = () => {
  const c = S.config, theme = (() => { try { return localStorage.getItem('papaiforte.theme') || 'auto'; } catch (e) { return 'auto'; } })();
  return `<div class="view stagger">${appbar('Guia')}
  <section class="card hero"><span class="eyebrow">O plano em uma linha</span><h2 style="margin:6px 0 4px">1.900 kcal · 150 g de proteína · 3 L de água</h2>
    <p class="small" style="color:var(--night-muted);margin:0">Treino 5:30 · seg A · ter B · qua C · qui A · sex B · fim de semana descanso ativo. Perder 0,5–0,8 kg por semana.</p></section>
  <section class="card">
    <details class="acc" open><summary>⚠️ Proteção da coluna (L4–L5)</summary><div><ul class="dots small">
      <li><b>Proibidos nos 90 dias:</b> levantamento terra, agachamento livre com barra nas costas, stiff, bom-dia, remada curvada, abdominal tradicional, rotação com carga, qualquer exercício que arredonde a lombar com peso.</li>
      <li><b>Pare na hora</b> se a dor irradiar para a perna ou houver formigamento ou dormência. Mostre o treino ao ortopedista ou fisioterapeuta.</li>
      <li>Às 5:30 os discos estão mais hidratados e sensíveis à flexão: evite dobrar a coluna nos primeiros 30–45 min do dia.</li>
      <li>Registre a dor lombar de 0 a 10 em todo treino.</li></ul></div></details>
    <details class="acc"><summary>💊 Suplementos</summary><div><ul class="clean small">
      <li><b style="min-width:90px">Creatina</b><span>5 g por dia, todo dia, no café das 7:30</span></li>
      <li><b style="min-width:90px">Whey</b><span>1 dose no lanche das 16:00 (ou no café em dias corridos)</span></li>
      <li><b style="min-width:90px">Café preto</b><span>Ao acordar, antes do treino</span></li>
      <li><b style="min-width:90px">Vit. D, ômega 3</b><span>Só se exame mostrar deficiência</span></li>
      <li><b style="min-width:90px">❌ Termogênicos</b><span>Não usar: pouco efeito, atrapalham sono e pressão</span></li></ul></div></details>
    <details class="acc"><summary>⏰ Rotina diária</summary><div><ul class="clean small">
      ${[['05:00', 'Acordar, café preto'], ['05:30', 'Treino (até 07:00)'], ['07:30', 'Café da manhã + creatina'], ['11:30', 'Almoço'], ['16:00', 'Lanche'], ['20:00', 'Jantar'], ['22:00', 'Dormir (mínimo 7 h)']].map(([h, t]) => `<li><b class="cond" style="min-width:50px;color:var(--accent)">${h}</b><span>${t}</span></li>`).join('')}</ul></div></details>
    <details class="acc"><summary>🍽️ Regras da alimentação</summary><div><ul class="dots small">
      <li>Sem álcool, refrigerante e fritura nos 90 dias.</li><li>Fim de semana conta e vai no “Fora do plano”.</li><li>Anotar com honestidade é o que permite ajustar.</li></ul></div></details>
  </section>
  <section class="card"><h3 style="margin-bottom:10px">Ajustes</h3><div class="fields">
    <div><label class="lb" for="c-start">Data de início (dia 1)</label><input type="date" id="c-start" data-cfg="start" value="${c.start}"></div>
    <div class="fields c2"><div><label class="lb" for="c-w0">Peso inicial (kg)</label><input class="n" id="c-w0" data-cfg="w0" inputmode="decimal" value="${inVal(c.w0)}"></div>
    <div><label class="lb" for="c-bf0">Gordura inicial (%)</label><input class="n" id="c-bf0" data-cfg="bf0" inputmode="decimal" value="${inVal(c.bf0)}"></div></div>
    <p class="small muted" id="cfg-goals" style="margin:0">${goalsLine()}</p>
    <div><label class="lb" for="c-theme">Aparência</label><select id="c-theme" data-theme-sel><option value="auto" ${theme === 'auto' ? 'selected' : ''}>Automática (do celular)</option><option value="light" ${theme === 'light' ? 'selected' : ''}>Clara</option><option value="dark" ${theme === 'dark' ? 'selected' : ''}>Escura</option></select></div>
  </div></section>
  ${pushCard()}
  <section class="card"><h3>Backup</h3><p class="small muted" style="margin:4px 0 10px">Os dados ficam só neste celular. Exporte de vez em quando para não perder nada.</p>
    <div class="row wrap"><button class="btn" data-act="export">⬇️ Exportar dados</button><label class="btn" style="cursor:pointer">⬆️ Importar<input type="file" accept="application/json,.json" data-import hidden></label></div></section>
  <p class="tiny muted" style="text-align:center;padding:0 10px">Este plano não substitui acompanhamento profissional. Por causa do abaulamento em L4–L5, valide o treino com ortopedista ou fisioterapeuta.<br><br>Papai Forte · v1</p></div>`;
};
function pushCard() {
  const st = pushState();
  const txt = {
    on: `<span class="tag good">Ativos</span> Lembretes às ${P.waterTimes.join(', ')}. A garrafa só é marcada quando você confirma.`,
    pending: '<span class="tag sun">Falta 1 passo</span> Permissão dada, mas o celular ainda não foi cadastrado no GitHub.',
    off: 'Receba um lembrete para beber sua garrafa de 500 ml ao longo do dia e confirme direto na notificação.',
    denied: '<span class="tag warn">Bloqueado</span> As notificações estão bloqueadas nas configurações do celular.',
    unsupported: 'Este navegador não recebe notificações. No iPhone, instale o app na tela de início primeiro.'
  }[st];
  const btns = st === 'on' ? `<button class="btn sm" data-act="push-test">Testar notificação</button><button class="btn sm ghost" data-act="push-register">Cadastrar de novo</button>`
    : st === 'pending' ? `<button class="btn sm primary" data-act="push-register">Cadastrar o celular</button><button class="btn sm ghost" data-act="push-test">Testar</button>`
    : `<button class="btn sm primary" data-act="push-enable">🔔 Ativar lembretes</button>`;
  return `<section class="card"><h3>🔔 Lembretes de água</h3><p class="small muted" style="margin:6px 0 10px">${txt}</p><div class="row wrap">${btns}</div></section>`;
}
const goalsLine = () => `Massa magra ~${fmt(lean())} kg · meta 90 dias (15%) <b>${fmt(target(15))} kg</b> · meta final (12%) <b>${fmt(target(12))} kg</b>`;

/* ---------- roteamento ---------- */
const TABS = ['hoje', 'comida', 'treino', 'peso', 'cal', 'guia'];
function route() { const h = location.hash.replace('#', ''); return TABS.includes(h) ? h : 'hoje'; }
function render(keepScroll) {
  const r = route(), y = window.scrollY;
  $app.innerHTML = screens[r]();
  document.querySelectorAll('nav.tabs a').forEach(a => { if (a.dataset.tab === r) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  document.querySelector('nav.tabs .blob').style.transform = `translateX(${TABS.indexOf(r) * 100}%)`;
  if (keepScroll) { $app.querySelectorAll('.view,.stagger>*').forEach(el => el.style.animation = 'none'); window.scrollTo(0, y); }
  else if (ui.last !== r) window.scrollTo(0, 0);
  ui.last = r;
  animateRings();
}
window.addEventListener('hashchange', () => { document.querySelectorAll('.sheet-bg').forEach(s => s.remove()); render(false); });

/* ---------- feedback ---------- */
let toastT;
function toast(msg) {
  const el = document.getElementById('toast'); el.textContent = msg; el.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2400);
}
function celebrate(msg) {
  toast(msg); vib([30, 40, 60]);
  const cols = ['#FFD27A', '#F0A04B', '#E3892A', '#4CBF88', '#E5ECF2'];
  const cx = innerWidth / 2, cy = 70;
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('i'); p.className = 'burst';
    const a = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 120;
    p.style.cssText = `left:${cx}px;top:${cy}px;background:${cols[i % cols.length]};--dx:${Math.cos(a) * dist}px;--dy:${Math.sin(a) * dist + 60}px;--rot:${Math.random() * 540}deg`;
    document.body.appendChild(p); setTimeout(() => p.remove(), 1000);
  }
}

/* ---------- cronômetro de descanso ---------- */
const timer = { end: 0, iv: null };
const $timer = document.getElementById('timer'), $timerT = document.getElementById('timerT');
function timerStart(sec = 90) {
  timer.end = Date.now() + sec * 1000; $timer.classList.remove('end'); $timer.classList.add('on');
  clearInterval(timer.iv); timer.iv = setInterval(timerTick, 250); timerTick();
}
function timerTick() {
  const left = Math.max(0, Math.round((timer.end - Date.now()) / 1000));
  $timerT.textContent = `${Math.floor(left / 60)}:${pad(left % 60)}`;
  if (left <= 0) { clearInterval(timer.iv); $timer.classList.add('end'); vib([250, 120, 250]); toast('Bora, próxima série! 💪'); setTimeout(timerStop, 4000); }
}
function timerStop() { clearInterval(timer.iv); $timer.classList.remove('on', 'end'); }
$timer.addEventListener('click', e => {
  const b = e.target.closest('[data-timer]'); if (!b) return;
  if (b.dataset.timer === 'stop') timerStop(); else { timer.end += 15000; if (!timer.iv || !$timer.classList.contains('on')) timerStart(15); timerTick(); }
});

/* ---------- sheet (gráfico de carga) ---------- */
function sheet(html, onMount) {
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  const ownClose = html.includes('data-close');
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}${ownClose ? '' : '<button class="btn block" style="margin-top:14px" data-close>Fechar</button>'}</div>`;
  if (onMount) onMount(bg);
  document.body.appendChild(bg); requestAnimationFrame(() => bg.classList.add('on'));
  const close = () => { bg.classList.remove('on'); setTimeout(() => bg.remove(), 300); };
  bg.addEventListener('click', e => { if (e.target === bg || e.target.closest('[data-close]')) close(); });
}

/* ---------- ações ---------- */
function afterTrainInput(d, exId, wasStatus) {
  const card = $app.querySelector(`[data-ex-card="${exId}"]`);
  const e = S.train[d] && S.train[d].ex[exId];
  if (card) card.classList.toggle('done', hasRec(e));
  const pr = trainProgress(d);
  const p = $app.querySelector('[data-prog]'), pb = $app.querySelector('[data-progbar]');
  if (p) p.textContent = pr.done; if (pb) pb.style.width = (pr.total ? pr.done / pr.total * 100 : 0) + '%';
  const t = S.train[d], running = t && t.started && !t.finished;
  if (!running && wasStatus !== 'done' && status(d) === 'done') celebrate('Treino concluído! 🔥');
}
function trainAct(a, b) {
  const d = ui.trainDate, t = trainDay(d); t.k = t.k || kindOf(d);
  const exs = P.workouts[t.k].ex, N = exs.length;
  if (a === 'start-train') { t.started = Date.now(); t.cur = 0; delete t.finished; vib([20, 40, 20]); toast('Bora! 💪 Primeiro: ' + exs[0].name); }
  if (a === 'next-ex') {
    const e = t.ex[b.dataset.ex] = t.ex[b.dataset.ex] || {}; e.done = true;
    t.cur = Math.min(N, (t.cur || 0) + 1); vib(20);
    if (t.cur < N) toast(`✓ Próximo: ${exs[t.cur].name}`);
  }
  if (a === 'prev-ex') t.cur = Math.max(0, (t.cur || 0) - 1);
  if (a === 'goto-ex') t.cur = clamp(+b.dataset.i, 0, N);
  if (a === 'resume-train') { delete t.finished; t.cur = N; ui.trainList = false; }
  if (a === 'finish-train') { t.finished = Date.now(); timerStop(); }
  saveNow(); render(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  if (a === 'finish-train') celebrate('Treino finalizado! 🔥');
}
// a tela de comida troca sozinha quando chega a hora da próxima refeição
let foodSig = '';
setInterval(() => {
  if (route() !== 'comida' || ui.foodAll || ui.foodDate !== today()) return;
  const ae = document.activeElement; if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
  const fc = mealFocus(today()), sig = (fc.cur ? fc.cur.id : '') + '|' + (fc.next ? mins(fc.next.time) - nowMins() : '');
  if (foodSig && sig !== foodSig) render(true);
  foodSig = sig;
}, 30000);
// cronômetro do treino em andamento
setInterval(() => {
  document.querySelectorAll('[data-elapsed]').forEach(el => {
    const s = Math.max(0, Math.floor((Date.now() - +el.dataset.elapsed) / 1000));
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
    el.textContent = h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
  });
}, 1000);

$app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act;
  if (['start-train', 'next-ex', 'prev-ex', 'goto-ex', 'resume-train', 'finish-train'].includes(a)) { trainAct(a, b); return; }
  if (a === 'list-mode') { ui.trainList = !ui.trainList; render(true); window.scrollTo(0, 0); return; }
  if (a === 'nav-date' || a === 'today-date') {
    const key = b.dataset.scr === 'food' ? 'foodDate' : 'trainDate';
    ui[key] = a === 'today-date' ? today() : addDays(ui[key], +b.dataset.delta);
    render(true); return;
  }
  if (a === 'cell' || a === 'open-train') { ui.trainDate = b.dataset.d; if (location.hash === '#treino') render(false); else location.hash = '#treino'; return; }
  if (a === 'food-today') { ui.foodDate = today(); ui.foodAll = false; return; }
  if (a === 'push-enable') { enablePush(); return; }
  if (a === 'push-test') { testPush(); return; }
  if (a === 'push-register') { registerSheet(); return; }
  if (a === 'kind') {
    const d = ui.trainDate, t = trainDay(d); t.k = b.dataset.k; save(); vib(10); render(true); return;
  }
  if (a === 'ex-done') {
    const d = ui.trainDate, was = status(d), t = trainDay(d); t.k = t.k || kindOf(d);
    const ex = t.ex[b.dataset.ex] = t.ex[b.dataset.ex] || {};
    ex.done = !ex.done; save(); vib(15);
    b.setAttribute('aria-pressed', ex.done); b.textContent = ex.done ? '✓ Feito' : 'Marcar feito';
    afterTrainInput(d, b.dataset.ex, was); return;
  }
  if (a === 'timer') { timerStart(90); vib(10); return; }
  if (a === 'ex-chart') {
    const h = loadHistory(b.dataset.ex);
    sheet(`<h2>${esc(b.dataset.name)}</h2><p class="small muted">Maior carga de cada treino (kg)</p>${lineChart(h.map(x => ({ x: ddmm(x.d), y: x.kg })), { empty: 'Ainda não há cargas registradas neste exercício.', label: 'Evolução da carga' })}
      ${h.length ? `<ul class="clean small" style="margin-top:8px">${h.slice().reverse().slice(0, 8).map(x => `<li><b style="min-width:50px">${ddmm(x.d)}</b><span class="muted">${x.sets.filter(s => s && num(s.kg) != null).map(s => `${fmt(num(s.kg))}×${s.r ?? '—'}`).join(' · ')}</span></li>`).join('')}</ul>` : ''}`);
    return;
  }
  if (a === 'pain') {
    const d = ui.trainDate, t = trainDay(d); t.k = t.k || kindOf(d);
    const v = +b.dataset.v; t.pain = t.pain === v ? null : v; save(); vib(10); render(true); return;
  }
  if (a === 'food-all') { ui.foodAll = !ui.foodAll; render(true); window.scrollTo(0, 0); return; }
  if (a === 'meal-extra') { ui.foodExtra = ui.foodExtra === b.dataset.meal ? null : b.dataset.meal; render(true); return; }
  if (['meal-plan', 'meal-clear', 'meal-reg', 'meal-skip'].includes(a)) {
    const d = ui.foodDate, f = foodDay(d, true), m = P.meals.find(x => x.id === b.dataset.meal);
    const protBefore = foodTotals(d).prot;
    const cur = f.meals[m.id] || {};
    if (a === 'meal-plan') f.meals[m.id] = { text: m.quick || m.plan, kcal: m.kcal, prot: m.prot, ok: true, ts: Date.now() };
    else if (a === 'meal-reg') {
      if (!mealFilled(cur)) { toast('Escreva o que comeu ou toque em “Comi o plano”'); return; }
      Object.assign(cur, { ok: true, ts: Date.now() }); delete cur.skip; f.meals[m.id] = cur;
    } else if (a === 'meal-skip') f.meals[m.id] = { skip: true, ts: Date.now() };
    else delete f.meals[m.id];
    saveNow(); vib(a === 'meal-clear' ? 8 : 20);
    const protAfter = foodTotals(d).prot;
    const card = b.closest('.meal-now');
    const done = () => {
      render(true);
      if (protBefore < P.goals.prot && protAfter >= P.goals.prot) celebrate('Meta de proteína batida! 🥩');
      else if (card) { const n = mealFocus(d); toast(a === 'meal-skip' ? 'Ok, refeição pulada' : `${m.name} registrado ✅${n.cur ? '' : n.next ? ' · próximo: ' + n.next.name + ' ' + n.next.time : ''}`); }
    };
    if (card) { card.classList.add('leaving'); setTimeout(done, 420); } else done();
    return;
  }
  if (a === 'water') {
    const d = b.dataset.d, f = foodDay(d, true), i = +b.dataset.i;
    const prev = f.bottles; f.bottles = f.bottles === i + 1 ? i : i + 1; save(); vib(f.bottles > prev ? [15, 30, 15] : 8);
    updateWaterDom(f.bottles);
    if (f.bottles > prev && f.bottles < P.goals.water) toast(`+500 ml 💧 faltam ${P.goals.water - f.bottles} garrafa${P.goals.water - f.bottles > 1 ? 's' : ''}`);
    if (prev < P.goals.water && f.bottles >= P.goals.water) celebrate('3 litros! Hidratado 💧');
    return;
  }
  if (a === 'habit') {
    const f = foodDay(b.dataset.d, true); f.hab[b.dataset.h] = !f.hab[b.dataset.h]; save(); vib(12);
    b.setAttribute('aria-pressed', f.hab[b.dataset.h]);
    if (P.habits.every(h => f.hab[h.id])) celebrate('Hábitos do dia em dia! ✨');
    return;
  }
  if (a === 'w-save') {
    const d = document.getElementById('w-date').value || today();
    const kg = num(document.getElementById('w-kg').value), wa = num(document.getElementById('w-waist').value), ne = num(document.getElementById('w-neck').value);
    if (kg == null && wa == null && ne == null) { toast('Preencha pelo menos o peso'); return; }
    if (kg != null && (kg < 30 || kg > 250)) { toast('Peso parece errado — confira'); return; }
    const w = {}; if (kg != null) w.kg = kg; if (wa != null) w.waist = wa; if (ne != null) w.neck = ne;
    S.weight[d] = w; saveNow(); ui.weightDate = today();
    celebrate(`Pesagem salva: ${kg != null ? fmt(kg) + ' kg' : 'medidas'} ✅`); render(true); return;
  }
  if (a === 'w-del') {
    if (!confirm(`Apagar a pesagem de ${shortDate(b.dataset.d)}?`)) return;
    delete S.weight[b.dataset.d]; saveNow(); render(true); toast('Pesagem apagada'); return;
  }
  if (a === 'export') {
    saveNow();
    const blob = new Blob([JSON.stringify({ app: 'papai-forte', v: 1, exported: new Date().toISOString(), ...S }, null, 2)], { type: 'application/json' });
    const u = URL.createObjectURL(blob), l = document.createElement('a');
    l.href = u; l.download = `papai-forte-backup-${today()}.json`; document.body.appendChild(l); l.click(); l.remove();
    setTimeout(() => URL.revokeObjectURL(u), 2000); toast('Backup exportado'); return;
  }
});

$app.addEventListener('input', e => {
  const el = e.target;
  // comida
  if (el.dataset.meal) {
    const d = ui.foodDate, f = foodDay(d, true), id = el.dataset.meal;
    const m = f.meals[id] = f.meals[id] || {};
    if (el.dataset.f === 'text') m.text = el.value; else m[el.dataset.f] = num(el.value);
    // na lista completa, escrever já conta como registrado; na refeição da vez só com "Registrar"
    if (el.closest('[data-list]')) { delete m.skip; if (mealFilled(m)) { m.ok = true; m.ts = m.ts || Date.now(); } else delete m.ok; }
    if (!mealFilled(m) && !m.skip) delete f.meals[id];
    save();
    const card = $app.querySelector(`[data-meal-card="${id}"][data-list]`); if (card) card.classList.toggle('filled', !!(f.meals[id] && f.meals[id].ok));
    const tot = document.getElementById('food-totals'); if (tot) tot.innerHTML = foodTotalsHTML(foodTotals(d));
    return;
  }
  // treino
  if (el.dataset.ex) {
    const d = ui.trainDate, was = status(d), t = trainDay(d); t.k = t.k || kindOf(d);
    const ex = t.ex[el.dataset.ex] = t.ex[el.dataset.ex] || {};
    if (el.dataset.i != null) {
      ex.sets = ex.sets || [];
      const s = ex.sets[+el.dataset.i] = ex.sets[+el.dataset.i] || {};
      s[el.dataset.f] = num(el.value);
      if (s.kg == null) delete s.kg; if (s.r == null) delete s.r;
    } else { ex[el.dataset.f] = num(el.value); if (ex[el.dataset.f] == null) delete ex[el.dataset.f]; }
    save(); afterTrainInput(d, el.dataset.ex, was); return;
  }
  if (el.hasAttribute('data-tnote')) { const t = trainDay(ui.trainDate); t.k = t.k || kindOf(ui.trainDate); t.note = el.value; save(); return; }
  if (el.dataset.cfg && el.dataset.cfg !== 'start') {
    const v = num(el.value); if (v == null) return;
    if (el.dataset.cfg === 'w0' && (v < 30 || v > 250)) return;
    if (el.dataset.cfg === 'bf0' && (v < 3 || v > 60)) return;
    S.config[el.dataset.cfg] = v; save();
    const g = document.getElementById('cfg-goals'); if (g) g.innerHTML = goalsLine();
  }
});

$app.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'w-date') { ui.weightDate = el.value || today(); render(true); return; }
  if (el.dataset.cfg === 'start' && el.value) { S.config.start = el.value; saveNow(); toast('Data de início atualizada'); return; }
  if (el.hasAttribute('data-theme-sel')) { setTheme(el.value); return; }
  if (el.hasAttribute('data-import') && el.files && el.files[0]) {
    const r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        if (!j || typeof j !== 'object' || !('train' in j || 'food' in j || 'weight' in j)) throw new Error('formato');
        if (!confirm('Importar este backup? Os dados atuais deste celular serão substituídos.')) return;
        S = { config: { ...P.defaults, ...(j.config || {}) }, food: j.food || {}, train: j.train || {}, weight: j.weight || {} };
        saveNow(); toast('Backup importado ✅'); render(true);
      } catch (err) { toast('Arquivo inválido'); }
    };
    r.readAsText(el.files[0]); el.value = '';
  }
});

/* ---------- lembretes de água (Web Push) ----------
   O GitHub Actions envia uma notificação nos horários de P.waterTimes.
   A notificação só pergunta; a garrafa só é marcada quando você confirma ("Bebi 500 ml"). */
const PUSH_KEY = 'papaiforte.push';
function pushSaved() { try { return JSON.parse(localStorage.getItem(PUSH_KEY)); } catch (e) { return null; } }
function pushState() {
  if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const s = pushSaved();
  if (s && Notification.permission === 'granted') return s.registered ? 'on' : 'pending';
  return 'off';
}
const b64ToU8 = s => { const p = '='.repeat((4 - s.length % 4) % 4), b = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from(b, c => c.charCodeAt(0)); };
async function enablePush() {
  const st = pushState();
  if (st === 'unsupported') {
    sheet(`<h2>Notificações indisponíveis aqui</h2><p class="muted">No <b>iPhone</b>, primeiro instale o app: Safari → Compartilhar → <b>Adicionar à Tela de Início</b>, abra pelo ícone e ative de lá (iOS 16.4 ou mais novo).</p><p class="muted">No <b>Android</b>, use o Chrome.</p>`);
    return;
  }
  if (st === 'denied') { sheet(`<h2>Notificações bloqueadas</h2><p class="muted">Libere nas configurações do celular: Configurações → Apps → Papai Forte (ou Chrome) → Notificações → Permitir. Depois toque de novo em “Ativar lembretes”.</p>`); return; }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { toast('Sem permissão, sem lembretes 😕'); return; }
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(P.vapidPublic) });
    const old = pushSaved(), json = JSON.stringify(sub);
    localStorage.setItem(PUSH_KEY, JSON.stringify({ sub: json, registered: !!(old && old.registered && old.sub === json) }));
    render(true);
    if (!(old && old.registered && old.sub === json)) registerSheet(); else toast('Lembretes ativos 🔔');
  } catch (err) { toast('Não deu para ativar: ' + (err && err.message || err)); }
}
function registerSheet() {
  const s = pushSaved(); if (!s) return;
  const body = 'Cadastro do celular para os lembretes de água do Papai Forte. Não edite o texto abaixo.\n\n```json\n' + s.sub + '\n```';
  const url = `https://github.com/${P.repo}/issues/new?title=${encodeURIComponent('[lembretes] celular')}&body=${encodeURIComponent(body)}`;
  sheet(`<h2>Último passo: cadastrar o celular 📲</h2>
    <p class="muted small">Os lembretes saem do GitHub nos horários ${P.waterTimes.join(', ')}. Para ele saber para onde mandar, crie o cadastro (uma vez só):</p>
    <ol class="small" style="padding-left:18px;margin:0 0 12px"><li>Toque em <b>Abrir no GitHub</b> (entre na sua conta se pedir).</li><li>Toque em <b>Create / Submit new issue</b>.</li><li>Volte aqui e toque em <b>Já criei</b>.</li></ol>
    <a class="btn primary block" href="${url}" target="_blank" rel="noopener">Abrir no GitHub</a>
    <button class="btn block" style="margin-top:8px" data-act2="push-done">✓ Já criei</button>
    <button class="btn ghost block" style="margin-top:8px" data-act2="push-copy">Copiar código (para mandar pelo PC)</button>`, bg => {
    bg.addEventListener('click', async e => {
      const t = e.target.closest('[data-act2]'); if (!t) return;
      if (t.dataset.act2 === 'push-copy') { try { await navigator.clipboard.writeText(s.sub); toast('Código copiado'); } catch (err) { toast('Não consegui copiar'); } }
      if (t.dataset.act2 === 'push-done') { s.registered = true; localStorage.setItem(PUSH_KEY, JSON.stringify(s)); bg.querySelector('[data-close]').click(); render(true); celebrate('Lembretes de água ativados 🔔'); }
    });
  });
}
async function testPush() {
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification('💧 Hora da água (teste)', waterNotifOpts('Bebeu sua garrafa de 500 ml?'));
    toast('Notificação de teste enviada');
  } catch (err) { toast('Falhou: ' + (err && err.message || err)); }
}
function waterNotifOpts(body) {
  return { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'agua', renotify: true, vibrate: [200, 100, 200],
    actions: [{ action: 'bebi', title: '✅ Bebi 500 ml' }, { action: 'depois', title: 'Ainda não' }], data: { url: './?agua=1#hoje' } };
}
// confirmações feitas pelo botão da notificação (o service worker guarda numa "caixa de entrada")
async function applyInbox() {
  if (!('caches' in window)) return;
  try {
    const c = await caches.open('pf-inbox'), r = await c.match('inbox'); if (!r) return;
    const list = await r.json(); await c.delete('inbox');
    if (!Array.isArray(list) || !list.length) return;
    list.forEach(x => { const f = foodDay(x.d, true); f.bottles = (f.bottles || 0) + 1; });
    saveNow(); render(true);
    toast(`+${list.length * 500} ml marcados pela notificação 💧`);
  } catch (e) {}
}
function askWater() {
  const f = S.food[today()], w = f ? f.bottles || 0 : 0;
  sheet(`<div style="text-align:center"><div style="font-size:3rem">💧</div><h2>Bebeu sua garrafa de 500 ml?</h2>
    <p class="muted">Hoje: ${w} de ${P.goals.water} garrafas.</p>
    <button class="btn primary block go" data-act2="yes">✅ Bebi, marcar 500 ml</button>
    <button class="btn ghost block" style="margin-top:8px" data-close>Ainda não</button></div>`, bg => {
    bg.addEventListener('click', e => {
      if (!e.target.closest('[data-act2="yes"]')) return;
      const fd = foodDay(today(), true), prev = fd.bottles; fd.bottles++; saveNow();
      bg.querySelector('[data-close]').click(); render(true);
      if (prev < P.goals.water && fd.bottles >= P.goals.water) celebrate('3 litros! Hidratado 💧'); else toast(`+500 ml 💧 ${fd.bottles} de ${P.goals.water}`);
    });
  });
}
if ('serviceWorker' in navigator) navigator.serviceWorker.addEventListener('message', e => { if (e.data && e.data.type === 'inbox') applyInbox(); });

/* ---------- tema ---------- */
function setTheme(v) {
  try { localStorage.setItem('papaiforte.theme', v); } catch (e) {}
  if (v === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', v);
}
try { const th = localStorage.getItem('papaiforte.theme'); if (th && th !== 'auto') document.documentElement.setAttribute('data-theme', th); } catch (e) {}

/* ---------- início ---------- */
// ao voltar para o app num novo dia, as datas de navegação voltam para hoje
let lastDay = today();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) return;
  if (today() !== lastDay) { lastDay = today(); ui.foodDate = ui.trainDate = ui.weightDate = lastDay; render(false); }
  applyInbox();
});
render(false);
applyInbox();
// veio pelo toque na notificação de água: pergunta se bebeu (só marca se confirmar)
if (new URLSearchParams(location.search).get('agua') === '1') {
  history.replaceState(null, '', location.pathname + (location.hash || '#hoje'));
  setTimeout(askWater, 300);
}

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
})();
