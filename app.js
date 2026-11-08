/* ══════════════════════════════════════════════════════════
   홍비서 PRO 수술비 사전 — app
   데이터는 AES-256-GCM + PBKDF2 로 암호화되어 있으며,
   비밀번호 없이는 원본 JSON을 열 수 없습니다.
   ══════════════════════════════════════════════════════════ */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s || '').replace(/[\s·,.\-()\[\]{}'"`~!@#$%^&*_+=|\\/:;?<>]/g, '').toLowerCase();
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

const state = {
  D: null, E: null, X: null, B: null, M: null,
  tab: 'search', q: '', tier: 0, ndaOnly: false, expanded: new Set(), cache: new Map(),
};

/* ───────────────────────── 테마 ───────────────────────── */
const THEME_KEY = 'hb.theme';
function applyTheme(t) {
  document.documentElement.dataset.theme = t;
  const m = document.querySelector('meta[name="theme-color"]');
  if (m) m.setAttribute('content', t === 'dark' ? '#0B0E14' : '#F7F8FA');
  try { localStorage.setItem(THEME_KEY, t); } catch (_) {}
}
(function initTheme() {
  let t = null;
  try { t = localStorage.getItem(THEME_KEY); } catch (_) {}
  if (!t) t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(t);
})();

/* ───────────────────────── 토스트 ───────────────────────── */
let toastTimer;
function toast(msg, ok = true) {
  const el = $('#toast');
  el.innerHTML = (ok ? '<span class="tick"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#0B3D2E" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6.5"/></svg></span>' : '') + '<span>' + esc(msg) + '</span>';
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ───────────────────────── 암호화 데이터 로드 ───────────────────────── */
const b64ToBytes = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
const bytesToB64 = (u8) => btoa(String.fromCharCode(...u8));

async function deriveKey(pw, saltB64, iter) {
  const enc = new TextEncoder();
  const base = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(saltB64), iterations: iter, hash: 'SHA-256' },
    base, { name: 'AES-GCM', length: 256 }, true, ['decrypt']
  );
}

let pakoLoaded = false;
async function gunzip(buf) {
  if ('DecompressionStream' in window) {
    const ds = new DecompressionStream('gzip');
    const stream = new Blob([buf]).stream().pipeThrough(ds);
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }
  if (!pakoLoaded) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js';
      s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });
    pakoLoaded = true;
  }
  return window.pako.inflate(new Uint8Array(buf));
}

async function decryptFile(key, file) {
  const res = await fetch('assets/data/' + file, { cache: 'no-store' });
  if (!res.ok) throw new Error('데이터 파일을 불러올 수 없습니다 (' + file + ')');
  const buf = new Uint8Array(await res.arrayBuffer());
  if (String.fromCharCode(...buf.slice(0, 4)) !== 'HBS1') throw new Error('BAD_MAGIC');
  const iv = buf.slice(4, 16);
  const ct = buf.slice(16);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct); // 비밀번호 오류 시 throw
  const inflated = await gunzip(plain);
  return JSON.parse(new TextDecoder().decode(inflated));
}

async function unlockWithKey(key) {
  const m = state.M;
  const [diseases, edi, exc, bunri] = await Promise.all(
    m.files.map(f => decryptFile(key, f.f))
  );
  return { diseases, edi, exc, bunri };
}

/* ───────────────────────── 부트스트랩 ───────────────────────── */
(async function boot() {
  try {
    const r = await fetch('assets/data/manifest.json', { cache: 'no-store' });
    state.M = await r.json();
  } catch (e) {
    $('#pwErr').textContent = '데이터 매니페스트를 불러오지 못했습니다. 웹서버 주소로 접속해 주세요.';
    $('#pwErr').classList.add('show');
    return;
  }

  const saved = (() => { try { return sessionStorage.getItem('hb.k'); } catch (_) { return null; } })();
  if (saved) {
    try {
      setLockBusy(true, '세션 복원 중');
      const raw = b64ToBytes(saved);
      const key = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, ['decrypt']);
      const data = await unlockWithKey(key);
      start(data);
      return;
    } catch (_) {
      try { sessionStorage.removeItem('hb.k'); } catch (_) {}
      setLockBusy(false);
    }
  }
})();

const LOCK_BTN_HTML = $('#unlockBtn').innerHTML;
function setLockBusy(busy, label) {
  const b = $('#unlockBtn');
  b.disabled = busy;
  b.innerHTML = busy
    ? '<span class="spin"></span><span>' + esc(label || '잠금 해제 중') + '…</span>'
    : LOCK_BTN_HTML;
}

$('#lockForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const pwEl = $('#pw');
  const pw = pwEl.value;
  if (!pw) { pwEl.focus(); return; }
  $('#pwErr').classList.remove('show');
  setLockBusy(true, '잠금 해제 중');
  await new Promise(r => setTimeout(r, 30));
  try {
    const key = await deriveKey(pw, state.M.salt, state.M.iter);
    const data = await unlockWithKey(key);
    try {
      const jwk = await crypto.subtle.exportKey('raw', key);
      sessionStorage.setItem('hb.k', bytesToB64(new Uint8Array(jwk)));
    } catch (_) {}
    $('#lock').style.transition = 'opacity .45s ease, transform .45s ease';
    start(data);
  } catch (err) {
    setLockBusy(false);
    const card = $('#lockCard');
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    $('#pwErr').classList.add('show');
    pwEl.select();
  }
});

$('#pwEye').addEventListener('click', () => {
  const i = $('#pw');
  i.type = i.type === 'password' ? 'text' : 'password';
  i.focus();
});

$('#lockBtn').addEventListener('click', () => {
  try { sessionStorage.removeItem('hb.k'); } catch (_) {}
  location.reload();
});

/* ───────────────────────── 시작 ───────────────────────── */
function start(data) {
  state.D = data.diseases;
  state.E = data.edi;
  state.X = data.exc;
  state.B = data.bunri;
  buildIndices();
  $('#lock').hidden = true;
  $('#app').hidden = false;
  document.body.style.overflow = '';
  renderChips();
  renderQuickStats();
  renderBunri();
  renderRiders();
  renderAbout();
  renderIdle();
  $('#q').focus({ preventScroll: true });
}

const idx = { name: [], nameLoose: [], edi: [], ediSurg: [], syn: [] };
function buildIndices() {
  const G = state.D.g;
  G.forEach((g, i) => {
    const nn = norm(g.n);
    idx.name.push({ i, nn, codes: g.c.map(c => c.toUpperCase()) });
  });
  (state.E.rows || []).forEach((r, i) => {
    const nn = norm(r[1] + ' ' + (r[4] || ''));
    const rec = { i, nn };
    idx.edi.push(rec);
    if (r[2] === 'S') idx.ediSurg.push(rec);
  });
  idx.syn = (window.CURATED?.synonyms || []).map(s => ({ ...s, nq: norm(s.k), keys: s.q.map(norm) }));
}

/* ───────────────────────── 검색 ───────────────────────── */
const MAX_NAME = 60, MAX_EDI = 40;

function search(qraw) {
  const q = qraw.trim();
  const nq = norm(q);
  if (!nq) return null;
  const scores = new Map();
  const add = (i, s) => { if (!scores.has(i) || scores.get(i) > s) scores.set(i, s); };

  const up = q.replace(/\s+/g, '').toUpperCase();
  const looksCode = /^[A-Z]/.test(up) && /\d/.test(up);

  if (looksCode) {
    (state.D.codeIndex[up] || []).forEach(i => add(i, 0));
    for (const code in state.D.codeIndex) {
      if (code !== up && code.startsWith(up)) state.D.codeIndex[code].forEach(i => add(i, 1));
    }
    // 코드가 질병명 안에 포함된 경우(범위 표기)
    state.D.g.forEach((g, i) => { if (g.c.some(c => c.replace(/\s/g, '').toUpperCase().includes(up))) add(i, 2); });
  }

  const syn = idx.syn.find(s => s.keys.some(k => k.includes(nq)) || nq.includes(s.nq) || s.nq.includes(nq));
  idx.name.forEach(({ i, nn }) => {
    if (nn === nq) add(i, 3);
    else if (nn.startsWith(nq)) add(i, 4);
    else if (nn.includes(nq)) add(i, 5);
  });

  // 별칭(실무 용어)의 핵심어가 질병명에 있으면 우선
  if (syn) {
    const terms = [...new Set([syn.k, ...syn.q])].map(norm).filter(t => t.length >= 2);
    idx.name.forEach(({ i, nn }) => { if (terms.some(t => nn.includes(t))) add(i, 6); });
  }
  // 별칭의 대표 코드(앞쪽 4개)는 최우선
  if (syn) {
    (syn.main || syn.codes.slice(0, 4)).forEach(cp => {
      for (const code in state.D.codeIndex) {
        if (code.startsWith(cp)) state.D.codeIndex[code].forEach(i => add(i, 5));
      }
    });
  }
  // 코드만 맞는 별칭 결과는 뒤로
  if (syn) {
    syn.codes.forEach(cp => {
      for (const code in state.D.codeIndex) {
        if (code.startsWith(cp)) state.D.codeIndex[code].forEach(i => add(i, 8));
      }
    });
  }

  const gi = [...scores.entries()].sort((a, b) => a[1] - b[1] || (state.D.g[b[0]].m.length - state.D.g[a[0]].m.length)).slice(0, MAX_NAME);

  const ediHits = [];
  for (const r of idx.edi) {
    if (r.nn.includes(nq)) {
      ediHits.push(r.i);
      if (ediHits.length >= MAX_EDI * 2) break;
    }
  }
  // 별칭 검색어로 수가 보강 (예: 대장용종 → 용종절제술)
  if (syn && ediHits.length < 5) {
    const terms = [...new Set([...syn.q, syn.k])].map(norm).filter(t => t.length >= 2).sort((a, b) => b.length - a.length);
    for (const t of terms) {
      for (const r of idx.edi) {
        if (r.nn.includes(t) && !ediHits.includes(r.i)) ediHits.push(r.i);
      }
      if (ediHits.length >= 20) break;
    }
  }
  ediHits.sort((a, b) => (state.E.rows[b][2] === 'S') - (state.E.rows[a][2] === 'S'));

  return { groups: gi.map(([i]) => i), edi: ediHits.slice(0, MAX_EDI), syn, q };
}

/* ───────────────────────── 칩 / 통계 ───────────────────────── */
const CHIP_TERMS = ['대장용종', '백내장', '비중격', '협심증', '인공관절', '치핵', '담낭', '편도', '자궁근종', '회전근개'];
function renderChips() {
  $('#chips').innerHTML = CHIP_TERMS.map(t => `<button class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join('');
  $$('#chips .chip').forEach(b => b.addEventListener('click', () => {
    $('#q').value = b.dataset.q;
    $('#q').dispatchEvent(new Event('input'));
    $('#q').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }));
}

function renderQuickStats() {
  const s = state.D.g.length, r = state.D.riders.length, e = state.E.rows.length;
  $('#quickstats').innerHTML = `
    <span class="qstat"><b>${r}</b>개 약관</span>
    <span class="qstat"><b>${s.toLocaleString()}</b>개 질병분류</span>
    <span class="qstat"><b>${e.toLocaleString()}</b>개 수가코드</span>
    <span class="qstat">기준 <b>${esc(state.D.asOf || '2026.11')}</b></span>`;
}

/* ───────────────────────── 검색 입력 ───────────────────────── */
const qEl = $('#q');
qEl.addEventListener('input', debounce(() => {
  const v = qEl.value;
  state.q = v;
  $('#clearBtn').hidden = !v;
  if (!v.trim()) { renderIdle(); return; }
  runSearch(v);
}, 70));
$('#clearBtn').addEventListener('click', () => {
  qEl.value = ''; state.q = ''; $('#clearBtn').hidden = true; renderIdle(); qEl.focus();
});
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== qEl && !$('#app').hidden) { e.preventDefault(); qEl.focus(); qEl.select(); }
  if (e.key === 'Escape' && document.activeElement === qEl) { qEl.value = ''; $('#clearBtn').hidden = true; renderIdle(); }
});

function runSearch(q) {
  $('#hero').classList.add('hide');
  const res = search(q);
  const box = $('#results');
  if (!res) { renderIdle(); return; }

  const tierCount = {};
  const pool = res.groups;
  const filtered = pool.filter(i => {
    const g = state.D.g[i];
    const t = g['5'] ? (g['5'].c === 'low' ? 0 : g['5'].t) : 0;
    if (state.tier && t !== state.tier) return false;
    if (state.ndaOnly && !g.m.length) return false;
    return true;
  });

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> 검색 결과</div>
      <div class="res-count">분류 ${filtered.length}건 · 수가 ${res.edi.length}건</div>
    </div>
    <div class="filters">
      <button class="f-chip ${state.tier === 0 ? 'on' : ''}" data-tier="0">전체</button>
      ${[1, 2, 3, 4, 5].map(n => `<button class="f-chip ${state.tier === n ? 'on' : ''}" data-tier="${n}">${n}종</button>`).join('')}
      <button class="f-chip ${state.ndaOnly ? 'on' : ''}" data-nda="1">N대 해당</button>
    </div>`;

  if (!filtered.length && !res.edi.length) {
    box.innerHTML = head + `
      <div class="empty">
        <span class="empty-emoji">🔍</span>
        <h3>“${esc(q)}”에 대한 결과가 없습니다</h3>
        <p>질병코드(J34, K63…) · 질병명(용종, 백내장…) ·<br>수술명(절제술, 성형술…)으로 다시 검색해 보세요.</p>
        <div class="sugg">${CHIP_TERMS.slice(0, 6).map(t => `<button class="chip" data-q="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      </div>`;
    bindResultEvents(box);
    return;
  }

  let html = head;

  if (res.syn && !filtered.length) {
    html += `<div class="panel" style="margin:6px 0;padding:14px 16px"><p style="font-size:12.5px">‘${esc(res.syn.k)}’ 로 묶어서 찾은 결과입니다.</p></div>`;
  }

  html += filtered.slice(0, 20).map(i => cardHTML(i, q)).join('');

  if (res.edi.length) {
    html += `<div class="res-head" style="margin-top:10px"><div class="res-title">수가코드(EDI) <em>${res.edi.length}</em></div></div>`;
    html += `<div class="card" style="padding:6px 4px"><div style="padding:0 16px">${res.edi.slice(0, 12).map(i => ediRowHTML(i)).join('')}</div></div>`;
  }

  box.innerHTML = html;
  bindResultEvents(box);
}

function bindResultEvents(box) {
  $$('.chip[data-q]', box).forEach(b => b.addEventListener('click', () => {
    qEl.value = b.dataset.q; $('#clearBtn').hidden = false;
    state.q = b.dataset.q; runSearch(b.dataset.q);
  }));
  $$('.f-chip', box).forEach(b => b.addEventListener('click', () => {
    if (b.dataset.nda) { state.ndaOnly = !state.ndaOnly; }
    else { state.tier = +b.dataset.tier; }
    runSearch(state.q);
  }));
  $$('.card[data-gi]', box).forEach(card => {
    const gi = +card.dataset.gi;
    card.querySelector('.card-head').addEventListener('click', () => openCard(card, gi));
    card.querySelector('.card-toggle').addEventListener('click', (e) => { e.stopPropagation(); openCard(card, gi); });
    card.querySelector('.btn-copy').addEventListener('click', (e) => { e.stopPropagation(); copyCard(gi); });
  });
}

function openCard(card, gi) {
  card.classList.toggle('open');
  const t = card.querySelector('.card-toggle');
  const open = card.classList.contains('open');
  t.innerHTML = open
    ? '접기 <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>'
    : '상세 보기 <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  if (open && !card.dataset.filled) {
    card.querySelector('.cb-pad').innerHTML = detailHTML(gi);
    card.dataset.filled = '1';
    bindDetail(card, gi);
  }
}

/* ───────────────────────── 카드 ───────────────────────── */
function tierOf(g) {
  const t = g['5'] || { t: 2, t2: 3, w: '', c: 'low' };
  return t;
}
function tierLabel(t) { return t.t === t.t2 ? `${t.t}종` : `${t.t}~${t.t2}종`; }

function matchInfo(g) {
  const riders = state.D.riders;
  const cos = new Map();
  const riderSet = new Set();
  for (const mstr of g.m) {
    const [ri, si] = mstr.split('.').map(Number);
    const r = riders[ri]; if (!r) continue;
    const key = r.co;
    if (!cos.has(key)) cos.set(key, []);
    const sub = r.subs[si] || '';
    const line = shortRider(r) + (sub ? ' · ' + sub : '');
    riderSet.add(ri + '.' + si);
    cos.get(key).push({ line, r });
  }
  return { cos, riderCount: riderSet.size };
}

function shortRider(r) {
  let s = (r.rider || '').replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*특별약관.*$/, '').replace(/\s*(보장|특약)$/, '').trim();
  return s.length > 34 ? s.slice(0, 34) + '…' : s;
}

function cardHTML(gi, q) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const { cos, riderCount } = matchInfo(g);
  const tclass = 't' + Math.min(5, Math.max(1, t.t));
  const est = t.c === 'low' ? '<span class="badge est">추정</span>' : '';
  return `
  <article class="card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <div style="min-width:0">
          <h3 class="card-name">${hl(g.n, q)}</h3>
          <div class="card-codes">${g.c.slice(0, 8).map(c => `<span class="code-pill">${esc(c)}</span>`).join('')}</div>
        </div>
      </div>
      <div class="card-badges">
        <span class="badge ${tclass}"><span class="b-dot"></span>${tierLabel(t)}</span>
        ${est}
        ${riderCount ? `<span class="badge nda">N대 ${cos.size}개사</span>` : ''}
        ${g.ch ? `<span class="badge ghost">${esc(g.ch)}</span>` : ''}
      </div>
      <div class="card-facts">
        <div class="fact"><dt>약관 분류</dt><dd>${riderCount}개</dd></div>
        <div class="fact"><dt>KCD</dt><dd>${g.c.length}개 코드</dd></div>
        <div class="fact"><dt>표준 종수</dt><dd>${tierLabel(t)}</dd></div>
      </div>
    </div>
    <div class="card-actions">
      <button class="card-toggle">상세 보기
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <button class="btn-copy">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.6"/><path d="M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V6"/></svg>
        고객 안내문 복사
      </button>
    </div>
    <div class="card-body"><div class="cb-inner"><div class="cb-pad"></div></div></div>
  </article>`;
}

function hl(text, q) {
  const nq = norm(q);
  if (!nq) return esc(text);
  // 원문에서 공백·기호를 제외한 문자열의 위치 → 원문 인덱스 매핑
  const map = [];
  let flat = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nch = norm(ch);
    if (!nch) continue;
    flat += nch;
    map.push(i);
  }
  const at = flat.indexOf(nq);
  if (at < 0) return esc(text);
  const start = map[at];
  const end = map[Math.min(at + nq.length - 1, map.length - 1)] + 1;
  return esc(text.slice(0, start)) +
    '<mark style="background:color-mix(in srgb,var(--brand) 20%,transparent);color:inherit;border-radius:4px">' + esc(text.slice(start, end)) + '</mark>' +
    esc(text.slice(end));
}

/* ───────────────────────── 카드 상세 ───────────────────────── */
function curatedFor(g, table) {
  if (!table) return null;
  for (const code of g.c) {
    const full = code.replace(/[†*+]/g, '').toUpperCase();
    const bare = full.split('~')[0];
    for (const c of [full, bare]) {
      if (table[c]) return { key: c, val: table[c] };
      for (const k in table) { if (c.startsWith(k)) return { key: k, val: table[k] }; }
    }
  }
  return null;
}

function detailHTML(gi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const { cos, riderCount } = matchInfo(g);
  const procs = curatedFor(g, window.CURATED?.procs);
  const tip = curatedFor(g, window.CURATED?.tips);
  let out = '';

  /* 1. 종수 */
  out += `<section class="sec">
    <h4 class="sec-title">1~5종 수술비 <span class="cnt">표준 참고</span><span class="dotline"></span></h4>
    <div class="tier-row">
      <div class="tier-big" style="color:var(--${'t' + Math.min(5, Math.max(1, t.t))})">${tierLabel(t)}</div>
      <div class="tier-why">${esc(t.w || '약관 분류표 기준 확인 필요')}</div>
    </div>
    ${procs ? `<table class="proc-table">${procs.val.map(p => `<tr><td>${esc(p.s)}</td><td><span class="tier-tag">${esc(p.t)}</span></td></tr>`).join('')}</table>` : ''}
  </section>`;

  /* 2. N대 */
  if (riderCount) {
    const list = [...cos.entries()].sort((a, b) => b[1].length - a[1].length);
    const show = list.slice(0, 6);
    out += `<section class="sec">
      <h4 class="sec-title">N대 질병수술비 <span class="cnt">${cos.size}개사</span><span class="dotline"></span></h4>
      <div class="nda-panel">
        <div class="nda-list" id="ndaList-${gi}">
          ${show.map(([co, arr]) => `
            <div class="nda-item">
              <span class="nda-flag"></span>
              <span class="nda-co">${esc(co)}</span>
              <span class="nda-desc">${esc(arr[0].line)}${arr.length > 1 ? ` <b style="color:var(--brand)">외 ${arr.length - 1}</b>` : ''}</span>
            </div>`).join('')}
        </div>
        ${list.length > 6 ? `<button class="more-btn" data-more="nda" data-gi="${gi}">전체 ${list.length}개사 보기</button>` : ''}
      </div>
    </section>`;
  }

  /* 3. EDI */
  const edi = relatedEdi(g, 6);
  if (edi.length) {
    out += `<section class="sec">
      <h4 class="sec-title">관련 수가코드(EDI) <span class="cnt">${edi.length}</span><span class="dotline"></span></h4>
      <div class="edi-list">${edi.map(r => ediRowHTML(r.i)).join('')}</div>
      <button class="more-btn" data-more="edi" data-gi="${gi}">수가 검색에서 더 보기</button>
    </section>`;
  }

  /* 4. 팁 */
  const items = tip ? tip.val.items : (window.CURATED?.genericTips || []).slice(0, 3);
  const title = tip ? tip.val.title : '실무 청구 · 삭감 방어 체크';
  out += `<section class="sec">
    <h4 class="sec-title">홍비서 실무 청구 팁<span class="dotline"></span></h4>
    <div class="tipbox">
      <div class="tip-head">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.6V17h5.6v-1.6c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z"/></svg>
        ${esc(title)}
      </div>
      <ul>${items.map(x => `<li>${mdBold(x)}</li>`).join('')}</ul>
    </div>
  </section>`;

  /* 5. 간편심사 */
  const ex = relatedExc(g, 6);
  if (ex.length) {
    out += `<section class="sec">
      <h4 class="sec-title">간편심사 예외질환 <span class="cnt">${ex.length}개사</span><span class="dotline"></span></h4>
      <div class="exc-wrap">${ex.map(e => `
        <div class="exc-row">
          <span class="exc-co">${esc(e.co)} · ${esc(e.title)}</span>
          <span class="exc-val ${e.cls}">${esc(e.v)}</span>
        </div>`).join('')}</div>
    </section>`;
  }

  out += `<p class="disclaim">· 종수·N대 매칭은 공개 약관 분류표를 정리한 <b>참고 자료</b>입니다. 실제 지급은 가입 약관(세대)·진단서·심사 결과로 확정됩니다.<br>· 같은 질병이라도 수술 방법(관혈/비관혈)에 따라 종수가 달라질 수 있습니다.</p>`;
  return out;
}

function mdBold(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

function relatedEdi(g, limit) {
  const stop = new Set(['및', '의', '기타', '상세불명', '달리', '분류된', '질환', '장애', '신생물', '양성', '악성', '동반', '포함', '주', '급성', '만성', '기타의', '에서의', '관련', '경우', '상세', '불명', '특정']);
  const tokens = g.n.split(/[^가-힣A-Za-z0-9]+/).filter(t => t.length >= 2 && !stop.has(t));
  const procs = curatedFor(g, window.CURATED?.procs);
  const extra = procs
    ? procs.val.flatMap(p => p.s.split(/[^가-힣A-Za-z0-9]+/)).filter(t => t.length >= 3 && !stop.has(t))
    : [];
  const all = [...new Set([...tokens, ...extra])];
  if (!all.length) return [];
  const hits = [];
  for (const r of idx.ediSurg) {
    for (const tk of all) {
      if (r.nn.includes(norm(tk))) { hits.push({ i: r.i, w: tk.length }); break; }
    }
  }
  hits.sort((a, b) => b.w - a.w);
  const seen = new Set(), out = [];
  for (const h of hits) {
    const code = state.E.rows[h.i][0];
    if (seen.has(code)) continue;
    seen.add(code); out.push({ i: h.i });
    if (out.length >= limit) break;
  }
  return out;
}

function relatedExc(g, limit) {
  const names = new Set([norm(g.n), ...(g.vs || []).map(norm)]);
  const tokens = g.n.split(/[^가-힣A-Za-z0-9]+/).filter(t => t.length >= 3);
  const rows = state.X.rows;
  const out = [];
  const seen = new Set();
  const OK = /인수|부담보|인수불가|거절|제한|할증|보류/;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const nq = norm(row[1]);
    const hit = names.has(nq) || tokens.some(t => nq.includes(norm(t)));
    if (!hit) continue;
    const v = (row[4] || row[5] || '').trim();
    if (!v || !OK.test(v)) continue;
    const doc = state.X.docs[row[0]] || {};
    const val = v.split('/')[0].trim().slice(0, 14);
    const key = (doc.co || '') + val;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ co: doc.co || '—', title: (doc.title || '').slice(0, 14), v: val,
               cls: val.includes('불가') || val.includes('거절') ? 'exc-no' : val.includes('부담보') || val.includes('제한') ? 'exc-db' : 'exc-ok' });
    if (out.length >= limit) break;
  }
  return out;
}

function ediRowHTML(i) {
  const r = state.E.rows[i];
  const kind = r[2] === 'S' ? '수술' : r[2] === 'T' ? '처치' : r[2] === 'U' ? '약국' : r[2] === 'D' ? '치과' : '';
  return `<div class="edi-item">
    <span class="edi-code">${esc(r[0])}</span>
    <span class="edi-name">${esc(r[1])}${kind ? ` <b style="color:var(--text-3);font-size:11px">［${kind}］</b>` : ''}</span>
  </div>`;
}

function bindDetail(card, gi) {
  $$('[data-more]', card).forEach(b => b.addEventListener('click', () => {
    if (b.dataset.more === 'nda') {
      const g = state.D.g[gi];
      const { cos } = matchInfo(g);
      const list = [...cos.entries()].sort((a, b) => b[1].length - a[1].length);
      card.querySelector(`#ndaList-${gi}`).innerHTML = list.map(([co, arr]) => `
        <div class="nda-item">
          <span class="nda-flag"></span>
          <span class="nda-co">${esc(co)}</span>
          <span class="nda-desc">${arr.map(x => esc(x.line)).join('<br>')}</span>
        </div>`).join('');
      b.remove();
    } else {
      const g = state.D.g[gi];
      const tk = g.n.split(/[^가-힣A-Za-z0-9]+/).filter(t => t.length >= 2)[0] || g.n;
      switchTab('search');
      qEl.value = tk; $('#clearBtn').hidden = false; state.q = tk;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      runSearch(tk);
    }
  }));
}

/* ───────────────────────── 복사 ───────────────────────── */
function copyCard(gi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const { cos, riderCount } = matchInfo(g);
  const procs = curatedFor(g, window.CURATED?.procs);
  const top = procs ? procs.val.slice(0, 2).map(p => `${p.s} → ${p.t}`).join('\n   · ') : '';
  const text =
`[홍비서] ${g.n}(${g.c.slice(0, 3).join(', ')}) 수술비 안내

안녕하세요, 고객님. 문의하신 질병·수술 건을 정리해 드립니다.

· 질병코드 : ${g.c.slice(0, 3).join(', ')} ${g.n}
· 5종 수술비 : ${tierLabel(t)} 해당 예상${t.c === 'low' ? ' (수술 방법 확인 필요)' : ''}
· N대 질병수술비 : ${cos.size}개 원수사 · ${riderCount}개 약관 분류 해당${top ? '\n· 주요 수술 : ' + top : ''}

필요 서류 : 진단서(KCD 코드·수술명 기재), 수술기록지, 입퇴원확인서
※ 정확한 지급 여부는 가입하신 약관과 진단서 내용에 따라 달라질 수 있습니다. 청구 전 서류를 함께 확인해 드리겠습니다.

- 홍비서 드림`;

  const done = () => toast('고객 안내문이 복사되었습니다');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}
function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (_) { toast('복사에 실패했습니다. 길게 눌러 복사해 주세요.', false); }
  document.body.removeChild(ta);
}

/* ───────────────────────── 초기 화면 ───────────────────────── */
function renderIdle() {
  $('#hero').classList.remove('hide');
  const box = $('#results');
  box.innerHTML = `
    <div class="res-head"><div class="res-title">자주 찾는 수술</div><div class="res-count">탭하면 바로 검색</div></div>
    <div class="card" style="padding:18px 18px 6px">
      ${(window.CURATED?.synonyms || []).slice(0, 8).map(s => `
        <div class="rider-row" data-q="${esc(s.q[0])}">
          <div class="rider-main"><div class="rider-name">${esc(s.k)}</div><div class="rider-meta">${esc(s.q.slice(0, 3).join(' · '))}</div></div>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-3)" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
        </div>`).join('')}
    </div>
    <p class="disclaim">질병코드(J34) · 질병명(용종) · 수술명(절제술) 무엇이든 입력해 보세요. 초성·띄어쓰기 없이도 찾아집니다.</p>`;
  $$('#results .rider-row[data-q]').forEach(r => r.addEventListener('click', () => {
    qEl.value = r.dataset.q; $('#clearBtn').hidden = false; state.q = r.dataset.q;
    runSearch(r.dataset.q);
  }));
}

/* ───────────────────────── 탭 ───────────────────────── */
function switchTab(tab) {
  state.tab = tab;
  $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $$('.pane').forEach(p => { p.hidden = p.id !== 'pane-' + tab; });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('.tab'); if (b) switchTab(b.dataset.tab);
});
$('#logoBtn').addEventListener('click', (e) => { e.preventDefault(); switchTab('search'); });
$('#themeBtn').addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
});
addEventListener('scroll', () => {
  $('.topbar').classList.toggle('scrolled', scrollY > 6);
}, { passive: true });

/* ───────────────────────── 분리심사 ───────────────────────── */
function renderBunri() {
  const B = state.B; if (!B) return;
  let html = `<div class="page-head">
    <h2>${esc(B.meta.title)}</h2>
    <p>기준일 ${esc(B.meta.asOf)} · ${esc(B.meta.range)}</p>
  </div>
  <div class="panel">
    <h3><span class="sec-dot"></span>분리심사란?</h3>
    <p>${esc(B.meta.def)}</p>
    <div class="warn">${esc(B.meta.warn)}</div>
  </div>`;

  B.groups.forEach(gp => {
    html += `<div class="group-label">${esc(gp.title)}</div>`;
    gp.items.forEach(it => {
      html += `<div class="ins-card">
        <div class="ins-top">
          <span class="ins-name">${esc(it.co)}</span>
          ${it.product ? `<span class="ins-prod">${esc(it.product)}</span>` : ''}
        </div>
        <ul>${(it.bullets || []).map(b => `<li>${esc(b)}</li>`).join('')}</ul>
        ${it.confirm ? `<div class="ins-confirm">근거 · ${esc(it.confirm)}</div>` : ''}
      </div>`;
    });
  });

  if (B.tips?.length) {
    html += `<div class="group-label">실무 체크</div><div class="tipbox"><div class="tip-head">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v2M4.9 6.9l1.4 1.4M19.1 6.9l-1.4 1.4M3 14h2M19 14h2M12 21a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"/></svg>
      분리심사 안내 시 꼭 말해야 할 것</div>
      <ul>${B.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
  }
  html += `<p class="disclaim">출처 · ${esc(B.meta.sources)} · 본 내용은 영업 참고용 요약이며, 실제 인수는 전산 고지 입력 후 결정됩니다.</p>`;
  $('#pane-bunri').innerHTML = html;
}

/* ───────────────────────── 약관 목록 ───────────────────────── */
function renderRiders() {
  const R = state.D.riders;
  const byCo = new Map();
  R.forEach((r, i) => {
    if (!byCo.has(r.co)) byCo.set(r.co, []);
    byCo.get(r.co).push({ r, i });
  });
  let html = `<div class="page-head">
    <h2>N대 질병수술비 약관 <span style="color:var(--brand)">${R.length}</span></h2>
    <p>${byCo.size}개 원수사 · 수술비 특별약관의 질병 분류표를 그대로 탑재했습니다. 행을 누르면 담보 구성이 열립니다.</p>
  </div>`;
  [...byCo.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([co, arr]) => {
    html += `<div class="panel" style="padding:8px 18px 6px">
      <h3 style="margin:14px 0 6px"><span class="sec-dot"></span>${esc(co)} <span style="color:var(--text-3);font-weight:700;font-size:12px">${arr.length}</span></h3>
      ${arr.map(({ r }) => `
        <div class="rider-row" data-rid="${esc(r.id)}">
          <div class="rider-main">
            <div class="rider-name">${esc(r.rider || r.product)}</div>
            <div class="rider-meta">${esc(r.product || '')}</div>
          </div>
          <span class="rider-ver">${esc(r.ver || '')}</span>
        </div>
        <div class="rider-subs">${(r.subs || []).map(s => `<span class="sub-pill">${esc(s)}</span>`).join('')}</div>`).join('')}
    </div>`;
  });
  const pane = $('#pane-riders');
  pane.innerHTML = html;
  $$('.rider-row[data-rid]', pane).forEach(row => row.addEventListener('click', () => row.classList.toggle('open')));
}

/* ───────────────────────── 안내 ───────────────────────── */
function renderAbout() {
  const s = state.D.g.length, e = state.E.rows.length, r = state.D.riders.length;
  $('#pane-about').innerHTML = `
    <div class="page-head"><h2>서비스 안내</h2><p>수술비 판단에 쓰인 데이터와 한계를 정확히 밝힙니다.</p></div>

    <div class="panel">
      <h3><span class="sec-dot"></span>탑재 데이터</h3>
      <p>· 질병·수술 분류 <b>${s.toLocaleString()}건</b> — ${r}개 원수사 N대 질병수술비 특별약관의 질병코드·담보 구성<br>
         · EDI 수가코드 <b>${e.toLocaleString()}건</b> — 심평원 의·치과 수가파일(2026.11.1 시행)<br>
         · 분리심사 지침 — GA소식지·월간프라임 2026.05~11 요약<br>
         · 간편심사 예외질환 — 21개 원수사 인수기준표</p>
    </div>

    <div class="panel">
      <h3><span class="sec-dot"></span>종수 분류 기준</h3>
      <p>1~5종 수술비는 표준 분류표를 기준으로 질병코드·수술명 키워드를 매칭한 <b>참고값</b>입니다. 같은 질병도 관혈/비관혈, 절제 범위, 가입 세대(구 3종·현행 5종·1~8종)에 따라 달라집니다. 카드의 “추정” 표시는 질환명만으로 확정이 어려운 건입니다.</p>
    </div>

    <div class="panel">
      <h3><span class="sec-dot"></span>보안</h3>
      <p>모든 데이터는 <b>AES-256-GCM</b>으로 암호화되어 저장되며, 비밀번호는 PBKDF2-SHA256(210,000회)로 키를 유도합니다. 비밀번호 없이는 데이터 파일을 열 수 없고, 검색엔진에는 노출되지 않습니다(noindex·robots).</p>
    </div>

    <div class="panel">
      <h3><span class="sec-dot"></span>면책</h3>
      <p>본 서비스는 보험 설계 실무를 돕는 참고 도구입니다. 지급 여부·금액은 가입 약관, 진단서, 손해사정 결과로 확정되며, 본 내용을 근거로 한 보상 판단의 최종 책임은 설계사·고객에게 있습니다.</p>
    </div>

    <p class="disclaim">데이터 기준 ${esc(state.D.asOf || '2026.11')} · © 홍비서 PRO</p>`;
}

/* 스피너 스타일 주입 */
const st = document.createElement('style');
st.textContent = `.spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;display:inline-block;animation:sp .7s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}`;
document.head.appendChild(st);

/* 오류 표시 (조용한 실패 방지) */
function fatal(msg) {
  let el = document.getElementById('errbox');
  if (!el) {
    el = document.createElement('div');
    el.id = 'errbox';
    el.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:200;background:#3A1C21;color:#FF9AA4;border:1px solid #6B2A32;border-radius:14px;padding:12px 14px;font-size:12px;line-height:1.5;font-family:ui-monospace,monospace;white-space:pre-wrap;max-height:40vh;overflow:auto';
    document.body.appendChild(el);
  }
  el.textContent = '오류: ' + msg;
}
addEventListener('error', (e) => fatal(e.message || 'script error'));
addEventListener('unhandledrejection', (e) => fatal((e.reason && (e.reason.message || e.reason)) || 'promise rejection'));

})();
