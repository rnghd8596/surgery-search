/* ══════════════════════════════════════════════════════════
   보험비서 수술비 사전 — app
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

/* ───────────────────────── 수술코드(EDI 수가코드) ↔ 질병/종수 매핑 ───────────────────────── */
const EDI_CODE_MAP = {
  // 대장·직장
  'Q7701': { codes: ['K63.5', 'D12'], name: '결장경하 폴립절제술', tier: '2종 (개정약관 1종)' },
  'Q7702': { codes: ['K63.5', 'D12'], name: '결장경하 종양절제술', tier: '2~3종' },
  'Q7703': { codes: ['K63.5', 'D12'], name: '내시경적 대장 점막절제술(EMR)', tier: '2~3종' },
  'Q7704': { codes: ['K63.5', 'D12'], name: '내시경적 대장 점막하박리술(ESD)', tier: '2~3종' },
  'Q7691': { codes: ['K62.1'], name: '에스결장경하 폴립절제술', tier: '2종' },
  // 위·십이지장
  'Q7651': { codes: ['K31.7', 'D13.1'], name: '위내시경하 폴립절제술', tier: '2종' },
  'Q7652': { codes: ['K31.7', 'D13.1'], name: '위내시경하 종양절제술(EMR)', tier: '2~3종' },
  'Q7653': { codes: ['K31.7', 'D13.1'], name: '위내시경하 점막하박리술(ESD)', tier: '2~3종' },
  // 이비인후과
  'O1421': { codes: ['J34.2', 'J34'], name: '비중격교정술(점막하절제술)', tier: '3종' },
  'O1422': { codes: ['J34.2'], name: '비중격성형술', tier: '3종' },
  'O1431': { codes: ['J34.3', 'J30'], name: '점막하하비갑개절제술', tier: '1~2종' },
  'O1432': { codes: ['J34.3', 'J30'], name: '하비갑개소작술·절제술', tier: '1~2종' },
  'O1411': { codes: ['J32', 'J33'], name: '내시경적 부비동수술(FESS-단측)', tier: '3종' },
  'O1412': { codes: ['J32', 'J33'], name: '내시경적 부비동수술(FESS-양측)', tier: '3종' },
  'O2111': { codes: ['J35.0', 'J35'], name: '편도적출술', tier: '3종' },
  'O2112': { codes: ['J35.2'], name: '아데노이드절제술', tier: '2~3종' },
  // 안과
  'S5111': { codes: ['H25', 'H26'], name: '수정체유화술 및 인공수정체삽입술(단안)', tier: '2종' },
  'S5112': { codes: ['H25', 'H26'], name: '수정체유화술 및 인공수정체삽입술(양안)', tier: '2종' },
  'S5119': { codes: ['H25'], name: '낭외적출술 및 인공수정체삽입술', tier: '2~3종' },
  // 항문외과
  'Q2761': { codes: ['K64'], name: '치핵절제술(근본수술)', tier: '3종' },
  'Q2762': { codes: ['K64'], name: '치핵결찰술', tier: '1~2종' },
  'Q2781': { codes: ['K60'], name: '치루근본수술', tier: '3종' },
  // 일반외과
  'Q7211': { codes: ['K80', 'K81'], name: '복강경하 담낭절제술', tier: '3종' },
  'Q7212': { codes: ['K80'], name: '개복 담낭절제술', tier: '3종' },
  'Q2861': { codes: ['K35', 'K37'], name: '충수절제술(복강경)', tier: '3종' },
  'Q2862': { codes: ['K35'], name: '충수절제술(개복)', tier: '3종' },
  'Q2911': { codes: ['K40'], name: '서혜부탈장교정술(단측)', tier: '3종' },
  'Q2912': { codes: ['K40'], name: '서혜부탈장교정술(양측)', tier: '3종' },
  // 정형외과
  'N0281': { codes: ['M17'], name: '인공관절 전치환술(슬관절-단측)', tier: '4종' },
  'N0282': { codes: ['M17'], name: '인공관절 전치환술(슬관절-양측)', tier: '4종' },
  'N0283': { codes: ['M16'], name: '인공관절 전치환술(고관절-단측)', tier: '4종' },
  'N0936': { codes: ['M75.1'], name: '관절경하 회전근개봉합술', tier: '3종' },
  'N0937': { codes: ['M75'], name: '관절경하 견봉성형술', tier: '3종' },
  // 산부인과
  'R4121': { codes: ['D25'], name: '자궁근종절제술(복강경)', tier: '3종' },
  'R4122': { codes: ['D25'], name: '자궁근종절제술(개복)', tier: '3종' },
  'R4331': { codes: ['O82'], name: '제왕절개만출술', tier: '3~4종' },
  // 순환기내과
  'M6551': { codes: ['I20', 'I21'], name: '경피적 관상동맥스텐트삽입술(1혈관)', tier: '3~4종' },
  'M6552': { codes: ['I20', 'I21'], name: '경피적 관상동맥스텐트삽입술(2혈관이상)', tier: '3~4종' },
  // 비뇨의학과
  'R3421': { codes: ['N40'], name: '경요도 전립선절제술(TURP)', tier: '3종' },
  'R3221': { codes: ['N20'], name: '체외충격파쇄석술(ESWL)', tier: '비해당(시술) 다수' }
};

const state = {
  D: null, E: null, X: null, B: null,
  tab: 'quick',       // 'quick' | 'detailed' | 'riders' | 'about'
  quickQ: '',
  detailedQ: '',
  dPeriod: 'all',     // 'all' | 'std' | 'recent' | 'old'
  dCo: '',            // '' (all) or company name
  dMode: 'all',       // 'all' | 'tier' | 'ndai'
  ridersCo: '',
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
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast'; el.className = 'toast';
    document.body.appendChild(el);
  }
  el.innerHTML = (ok ? '<span class="tick"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#0B3D2E" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6.5"/></svg></span>' : '') + '<span>' + esc(msg) + '</span>';
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ───────────────────────── 암호화 데이터 로드 ───────────────────────── */
const b64ToBytes = (b64) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

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
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  const decomp = await gunzip(plain);
  return JSON.parse(new TextDecoder().decode(decomp));
}

const bytesToB64 = (u8) => btoa(String.fromCharCode(...u8));

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
  bindDetailedFilterChips();
  renderRiders();
  renderAbout();
  renderIdleQuick();
  renderIdleDetailed();
  syncHeaderHeight();
  $('#q-quick').focus({ preventScroll: true });
}

function syncHeaderHeight() {
  const h = document.querySelector('.topbar')?.offsetHeight || 100;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
addEventListener('resize', syncHeaderHeight);
addEventListener('orientationchange', syncHeaderHeight);

const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function toCho(s) {
  let out = '';
  for (const ch of s) {
    const c = ch.charCodeAt(0);
    out += (c >= 0xAC00 && c <= 0xD7A3) ? CHO[Math.floor((c - 0xAC00) / 588)] : ch;
  }
  return out;
}

const idx = { name: [], edi: [], ediSurg: [], syn: [] };
function buildIndices() {
  const G = state.D.g;
  G.forEach((g, i) => {
    const nn = norm(g.n);
    idx.name.push({ i, nn, ch: toCho(nn), codes: g.c.map(c => c.toUpperCase()) });
  });
  (state.E.rows || []).forEach((r, i) => {
    const nn = norm(r[1] + ' ' + (r[4] || ''));
    const rec = { i, c: (r[0] || '').toUpperCase(), nn, n: r[1] };
    idx.edi.push(rec);
    if (r[2] === 'S') idx.ediSurg.push(rec);
  });
  idx.syn = (window.CURATED?.synonyms || []).map(s => ({ ...s, nq: norm(s.k), keys: s.q.map(norm) }));
}

/* ───────────────────────── 정밀 진단용 필터 칩 바인딩 ───────────────────────── */
function bindDetailedFilterChips() {
  $$('#dPeriodChips .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#dPeriodChips .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.dPeriod = btn.dataset.period;
      if (state.detailedQ.trim()) runDetailedSearch(state.detailedQ);
    });
  });

  $$('#dCompanyChips .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#dCompanyChips .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.dCo = btn.dataset.co;
      if (state.detailedQ.trim()) runDetailedSearch(state.detailedQ);
    });
  });

  $$('#dRiderModeChips .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#dRiderModeChips .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.dMode = btn.dataset.mode;
      if (state.detailedQ.trim()) runDetailedSearch(state.detailedQ);
    });
  });
}

/* ───────────────────────── 검색 엔진 (공통) ───────────────────────── */
const MAX_NAME = 12;
const MAX_EDI  = 8;

function search(rawQ) {
  const q = rawQ.trim();
  if (!q) return null;
  const nq = norm(q);
  const up = q.replace(/\s+/g, '').toUpperCase();
  const scores = new Map();
  const add = (i, s) => { if (!scores.has(i) || scores.get(i) > s) scores.set(i, s); };

  let matchedEdi = null;

  // 1. 수술코드(EDI 코드) 직접 매칭 (예: Q7701, O1421, S5111 등)
  const looksEdi = /^[A-Z]\d{4}/.test(up);
  if (looksEdi) {
    if (EDI_CODE_MAP[up]) {
      const em = EDI_CODE_MAP[up];
      matchedEdi = { code: up, name: em.name, tier: em.tier };
      em.codes.forEach(targetCode => {
        for (const code in state.D.codeIndex) {
          if (code === targetCode || code.startsWith(targetCode)) {
            state.D.codeIndex[code].forEach(i => add(i, 0));
          }
        }
      });
    } else {
      const foundEdi = idx.edi.find(r => r.c.startsWith(up));
      if (foundEdi) {
        matchedEdi = { code: foundEdi.c, name: foundEdi.n };
        const ediNorm = norm(foundEdi.n);
        idx.name.forEach(({ i, nn }) => {
          if (ediNorm.includes(nn) || nn.includes(ediNorm.slice(0, 4))) add(i, 0.2);
        });
      }
    }
  }

  // 2. KCD 질병코드 매칭
  const looksKcd = /^[A-Z]\d/.test(up);
  if (looksKcd) {
    (state.D.codeIndex[up] || []).forEach(i => add(i, 0));
    for (const code in state.D.codeIndex) {
      if (code !== up && code.startsWith(up)) state.D.codeIndex[code].forEach(i => add(i, 0.8));
    }
    state.D.g.forEach((g, i) => { if (g.c.some(c => c.replace(/\s/g, '').toUpperCase().includes(up))) add(i, 1.5); });
  }

  // 3. 별칭(synonyms) 정밀 매칭
  const synExact = idx.syn.find(s => s.keys.some(k => k === nq) || nq === s.nq);
  const synFuzzy = synExact || idx.syn.find(s => s.keys.some(k => k.includes(nq) || nq.includes(k)) || nq.includes(s.nq) || s.nq.includes(nq));
  const syn = synExact || synFuzzy;

  if (syn) {
    const targets = syn.exactCodes || syn.main || syn.codes;
    targets.forEach((cp, rank) => {
      for (const code in state.D.codeIndex) {
        if (code === cp || code.startsWith(cp)) {
          state.D.codeIndex[code].forEach(i => add(i, 0.4 + rank * 0.05));
        }
      }
    });
  }

  // 4. 질병명 텍스트 매칭
  const isCho = /^[ㄱ-ㅎ]+$/.test(nq);
  idx.name.forEach(({ i, nn, ch }) => {
    if (isCho) {
      if (ch === nq) add(i, 4);
      else if (ch.startsWith(nq)) add(i, 5);
      return;
    }
    if (nn === nq) add(i, 1);
    else if (nn.startsWith(nq)) add(i, 2.5);
    else if (nn.includes(nq)) add(i, 4);
  });

  // 고신뢰도 결과(score < 2.5)가 있으면 노이즈 제거
  let giEntries = [...scores.entries()];
  const hasHighConf = giEntries.some(([_, s]) => s < 2.5);
  if (hasHighConf) {
    giEntries = giEntries.filter(([_, s]) => s < 3.2);
  }

  const mainPrefixes = syn ? (syn.main || syn.codes.slice(0, 4)) : [];
  const mainHit = (i) => mainPrefixes.length && state.D.g[i].c.some(c => mainPrefixes.some(p => c.toUpperCase().startsWith(p)));
  const gi = giEntries
    .sort((a, b) => a[1] - b[1] || (mainHit(b[0]) - mainHit(a[0])) || (state.D.g[b[0]].m.length - state.D.g[a[0]].m.length))
    .slice(0, MAX_NAME);

  const ediHits = [];
  if (matchedEdi) {
    for (const r of idx.edi) {
      if (r.c.startsWith(matchedEdi.code)) ediHits.push(r.i);
    }
  }
  for (const r of idx.edi) {
    if (r.nn.includes(nq) && !ediHits.includes(r.i)) {
      ediHits.push(r.i);
      if (ediHits.length >= MAX_EDI * 2) break;
    }
  }

  return { groups: gi.map(([i]) => i), edi: ediHits.slice(0, MAX_EDI), syn, q, matchedEdi };
}

/* ───────────────────────── 1. 빠른 검색 핸들러 ───────────────────────── */
const qQuickEl = $('#q-quick');
qQuickEl.addEventListener('input', debounce(() => {
  const v = qQuickEl.value;
  state.quickQ = v;
  $('#clearBtn-quick').hidden = !v;
  if (!v.trim()) { renderIdleQuick(); return; }
  runQuickSearch(v);
}, 70));

$('#clearBtn-quick').addEventListener('click', () => {
  qQuickEl.value = ''; state.quickQ = ''; $('#clearBtn-quick').hidden = true; renderIdleQuick(); qQuickEl.focus();
});

function runQuickSearch(q) {
  $('#hero-quick').classList.add('hide');
  const res = search(q);
  const box = $('#results-quick');
  if (!res) { renderIdleQuick(); return; }

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> 빠른 판정 결과</div>
      <div class="res-count">분류 ${res.groups.length}건</div>
    </div>`;

  if (!res.groups.length && !res.edi.length) {
    box.innerHTML = head + `
      <div class="empty">
        <span class="empty-emoji">🔍</span>
        <h3>“${esc(q)}”에 대한 결과가 없습니다</h3>
        <p>질병코드(K63, J34) · 수술코드(Q7701, O1421) · 질병명(대장용종)으로 다시 검색해 보세요.</p>
      </div>`;
    return;
  }

  let html = head;
  html += res.groups.slice(0, 15).map(i => cardQuickHTML(i, q, res.matchedEdi)).join('');

  box.innerHTML = html;
  bindCardActions(box);
}

function renderIdleQuick() {
  $('#hero-quick').classList.remove('hide');
  const box = $('#results-quick');
  box.innerHTML = `
    <div class="res-head"><div class="res-title">자주 찾는 수술</div><div class="res-count">탭하면 1초 판정</div></div>
    <div class="card" style="padding:14px 18px 4px">
      ${(window.CURATED?.synonyms || []).slice(0, 8).map(s => `
        <div class="rider-row" data-q="${esc(s.q[0])}" style="cursor:pointer">
          <div class="rider-main"><div class="rider-name">${esc(s.k)}</div><div class="rider-meta">${esc(s.q.slice(0, 3).join(' · '))}</div></div>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-3)" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6 6-6"/></svg>
        </div>`).join('')}
    </div>
    <p class="disclaim">질병코드(J34, K63) · 수술코드(Q7701, O1421) · 질병명(대장용종, 백내장) 무엇이든 입력하세요.</p>`;

  $$('#results-quick .rider-row[data-q]').forEach(r => r.addEventListener('click', () => {
    qQuickEl.value = r.dataset.q; $('#clearBtn-quick').hidden = false; state.quickQ = r.dataset.q;
    runQuickSearch(r.dataset.q);
  }));
}

/* ───────────────────────── 2. 정밀 증권 진단 핸들러 ───────────────────────── */
const qDetailedEl = $('#q-detailed');
qDetailedEl.addEventListener('input', debounce(() => {
  const v = qDetailedEl.value;
  state.detailedQ = v;
  $('#clearBtn-detailed').hidden = !v;
  if (!v.trim()) { renderIdleDetailed(); return; }
  runDetailedSearch(v);
}, 70));

$('#clearBtn-detailed').addEventListener('click', () => {
  qDetailedEl.value = ''; state.detailedQ = ''; $('#clearBtn-detailed').hidden = true; renderIdleDetailed(); qDetailedEl.focus();
});

function runDetailedSearch(q) {
  $('#hero-detailed').classList.add('hide');
  const res = search(q);
  const box = $('#results-detailed');
  if (!res) { renderIdleDetailed(); return; }

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> 증권 정밀 진단 결과</div>
      <div class="res-count">분류 ${res.groups.length}건</div>
    </div>`;

  if (!res.groups.length && !res.edi.length) {
    box.innerHTML = head + `
      <div class="empty">
        <span class="empty-emoji">🔍</span>
        <h3>“${esc(q)}”에 대한 결과가 없습니다</h3>
        <p>질병코드 · 수술코드 · 질병명으로 다시 검색해 보세요.</p>
      </div>`;
    return;
  }

  let html = head;
  html += res.groups.slice(0, 15).map(i => cardDetailedHTML(i, q, res.matchedEdi)).join('');

  box.innerHTML = html;
  bindCardActions(box);
}

function renderIdleDetailed() {
  $('#hero-detailed').classList.remove('hide');
  const box = $('#results-detailed');
  box.innerHTML = `
    <div class="panel" style="padding:16px 18px;margin-top:12px;">
      <h3 style="font-size:14px;margin-bottom:6px;"><span class="sec-dot"></span>증권 맞춤 진단 방법</h3>
      <p style="font-size:12.5px;color:var(--text-2);line-height:1.55;">
        1. 상단에서 고객의 <b>가입시기(약관 세대)</b>와 <b>보험사</b>를 선택하세요.<br>
        2. 수술명이나 질병코드(K63.5, Q7701)를 검색창에 입력하세요.<br>
        3. 해당 증권 조건에 맞춰 <b>종수술비 몇 종</b>인지와 <b>N대 수술비 담보군</b>이 100% 확정 계산됩니다.
      </p>
    </div>`;
}

/* ───────────────────────── 카드 액션 공통 바인딩 ───────────────────────── */
function bindCardActions(box) {
  $$('.card-toggle', box).forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const gi = Number(card.dataset.gi);
      const isOpen = card.classList.toggle('open');
      btn.querySelector('span') && (btn.querySelector('span').textContent = isOpen ? '세부사항 접기' : '세부사항 펼치기 (근거 · 수가)');
      if (isOpen && !card.dataset.rendered) {
        card.querySelector('.cb-pad').innerHTML = detailHTML(gi);
        card.dataset.rendered = '1';
      }
    });
  });

  $$('.btn-copy', box).forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      copyCard(Number(card.dataset.gi));
    });
  });

  $$('.btn-goto-detailed', box).forEach(btn => {
    btn.addEventListener('click', () => {
      const targetQ = btn.dataset.q;
      switchTab('detailed');
      qDetailedEl.value = targetQ;
      $('#clearBtn-detailed').hidden = false;
      state.detailedQ = targetQ;
      runDetailedSearch(targetQ);
    });
  });
}

/* ───────────────────────── 1. 빠른 검색용 카드 HTML ───────────────────────── */
function tierOf(g) {
  return g['5'] || { t: 0, c: 'low', w: '약관 분류표 확인 필요' };
}
function tierLabel(t) {
  return t.t ? `${t.t}종` : '확인 필요';
}

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

function cardQuickHTML(gi, q, matchedEdi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const procs = curatedFor(g, window.CURATED?.procs);
  const ex = curatedFor(g, window.CURATED?.exceptions);

  let ediBanner = '';
  if (matchedEdi) {
    ediBanner = `
      <div style="background:rgba(49,130,246,0.08);border:1px solid rgba(49,130,246,0.25);border-radius:10px;padding:8px 12px;margin:8px 0;font-size:12px;">
        <span style="font-weight:800;color:var(--brand)">✓ 수술코드 [${esc(matchedEdi.code)}] ${esc(matchedEdi.name)} 매칭</span>
      </div>`;
  }

  // 메인 표준 종수 답변 (크고 선명하게!)
  let mainTierBadge = ex ? ex.val.stdTier : tierLabel(t);
  let mainTierTitle = ex ? ex.val.stdTitle : (procs ? procs.val[0].s : g.n + ' 관련 수술');
  let mainTierDesc  = ex ? ex.val.stdDesc : '생명보험 및 2020년 이전 손해보험 표준약관 기준';

  let exceptionBlock = '';
  if (ex) {
    exceptionBlock = `
      <div style="margin-top:10px;background:rgba(245,158,11,0.08);border:1.5px solid rgba(245,158,11,0.3);border-radius:11px;padding:10px 13px;">
        <div style="font-size:12.5px;font-weight:850;color:#d97706;margin-bottom:4px;display:flex;align-items:center;gap:6px;">
          <span class="proc-tag t1" style="font-size:11px;padding:2px 7px;border-radius:6px;">${esc(ex.val.exTier)}</span>
          <span>${esc(ex.val.exTitle)}</span>
        </div>
        <div style="font-size:11.5px;color:var(--text-2);line-height:1.45;">
          ${esc(ex.val.exDesc)}
        </div>
      </div>`;
  }

  // 기타 수술 방식 (복강경, 개복, ESD 등)
  let otherProcsHTML = '';
  if (procs && procs.val.length > 1) {
    const others = procs.val.slice(1);
    otherProcsHTML = `
      <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line);display:flex;flex-direction:column;gap:6px;">
        <div style="font-size:11px;font-weight:750;color:var(--text-3);margin-bottom:1px;">기타 수술 방식별 종수:</div>
        ${others.map(p => {
          const num = parseInt(p.t) || 3;
          const tagClass = 't' + Math.min(5, Math.max(1, num));
          return `
            <div class="proc-row">
              <span class="proc-tag ${tagClass}">${esc(p.t)}</span>
              <span class="proc-text">${esc(p.s)}</span>
              ${p.note ? `<span class="proc-note">${esc(p.note)}</span>` : ''}
            </div>`;
        }).join('')}
      </div>`;
  }

  return `
  <article class="card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <div>
          <h3 class="card-name">${hl(g.n, q)}</h3>
          <div class="card-codes">${g.c.slice(0, 8).map(c => `<span class="code-pill">${esc(c)}</span>`).join('')}</div>
        </div>
      </div>

      ${ediBanner}

      <!-- 빠른 판정 메인 박스 (결과는 간결하게 크게!) -->
      <div class="result-highlight-box">
        <div class="res-box-header">
          <span class="res-tag">1~5종 수술비 표준 판정</span>
          <span class="res-period-badge">표준 약관 기준</span>
        </div>
        
        <div style="display:flex;align-items:center;gap:12px;margin:4px 0 6px;">
          <span class="proc-tag ${'t' + (parseInt(mainTierBadge) || 2)}" style="font-size:16px;padding:6px 14px;border-radius:10px;min-width:54px;">${esc(mainTierBadge)}</span>
          <div>
            <div style="font-size:14.5px;font-weight:800;color:var(--text);letter-spacing:-.02em;">${esc(mainTierTitle)}</div>
            <div style="font-size:11.5px;color:var(--text-3);margin-top:2px;">${esc(mainTierDesc)}</div>
          </div>
        </div>

        ${exceptionBlock}
        ${otherProcsHTML}
      </div>
    </div>

    <div class="card-actions">
      <button class="card-toggle">
        <span>세부사항 펼치기 (근거 · 수가)</span>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <button class="btn-copy">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.6"/><path d="M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V6"/></svg>
        고객 안내문 복사
      </button>
      <button class="btn-goto-detailed" data-q="${esc(g.n)}" style="flex:0 0 auto;padding:0 12px;height:44px;border:1px solid var(--border);border-radius:14px;background:var(--surface);color:var(--brand);font-size:12.5px;font-weight:800;cursor:pointer;">
        정밀 진단 →
      </button>
    </div>

    <div class="card-body"><div class="cb-inner"><div class="cb-pad"></div></div></div>
  </article>`;
}

/* ───────────────────────── 2. 정밀 증권 진단용 카드 HTML ───────────────────────── */
function cardDetailedHTML(gi, q, matchedEdi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const { cos, riderCount } = matchInfo(g);
  const procs = curatedFor(g, window.CURATED?.procs);
  const ex = curatedFor(g, window.CURATED?.exceptions);

  const period = state.dPeriod;
  const co = state.dCo;
  const mode = state.dMode;

  let ediBanner = '';
  if (matchedEdi) {
    ediBanner = `
      <div style="background:rgba(49,130,246,0.08);border:1px solid rgba(49,130,246,0.25);border-radius:10px;padding:8px 12px;margin:8px 0;font-size:12px;">
        <span style="font-weight:800;color:var(--brand)">✓ 수술코드 [${esc(matchedEdi.code)}] ${esc(matchedEdi.name)} 매칭</span>
      </div>`;
  }

  // 1. 종수술비 정밀 판정 블록
  let tierBlockHTML = '';
  if (mode === 'all' || mode === 'tier') {
    let finalTier = tierLabel(t);
    let finalNote = '표준 1~5종 기준';

    if (ex && (period === 'recent' || co.includes('메리츠') || co.includes('롯데'))) {
      finalTier = ex.val.exTier.split(' ')[0] || '1종';
      finalNote = '2020년 이후 개정 약관 적용 (1종 하향 개정)';
    } else if (period === 'old') {
      finalTier = t.t <= 2 ? '1종' : t.t === 3 ? '2종' : '3종';
      finalNote = '2006년 이전 구 1~3종 약관 적용';
    } else if (period === 'std') {
      finalTier = ex ? ex.val.stdTier : tierLabel(t);
      finalNote = '2006~2019년 표준 1~5종 약관 적용';
    }

    tierBlockHTML = `
      <div class="result-highlight-box">
        <div class="res-box-header">
          <span class="res-tag">1~5종 수술비 정밀 판정</span>
          <span class="res-period-badge">${period === 'all' ? '가입시기 미선택' : period === 'std' ? '표준 1~5종' : period === 'recent' ? '최근 개정약관' : '구 1~3종'}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin:3px 0 6px;">
          <span class="proc-tag ${'t' + (parseInt(finalTier) || 2)}" style="font-size:16px;padding:5px 14px;border-radius:10px;min-width:54px;">${esc(finalTier)}</span>
          <div>
            <div style="font-size:14px;font-weight:800;color:var(--text);">${esc(g.n)} 수술</div>
            <div style="font-size:11.5px;color:var(--brand);font-weight:700;margin-top:2px;">${esc(finalNote)}</div>
          </div>
        </div>
      </div>`;
  }

  // 2. N대 질병수술비 정밀 판정 블록
  let ndaiBlockHTML = '';
  if (mode === 'all' || mode === 'ndai') {
    if (co) {
      if (cos.has(co)) {
        const arr = cos.get(co);
        ndaiBlockHTML = `
          <div class="ndai-res-box covered">
            <div class="ndai-res-status">
              <span style="font-size:16px;">✓</span>
              <span>[${esc(co)}] N대 질병수술비 보장 해당</span>
            </div>
            <div class="ndai-res-group">해당 담보군: <b>${arr.map(x => esc(x.line)).join(' · ')}</b></div>
            <div class="ndai-res-desc">선택하신 [${esc(co)}] 증권의 가입금액 한도로 전액 지급됩니다.</div>
          </div>`;
      } else {
        ndaiBlockHTML = `
          <div class="ndai-res-box not-covered">
            <div class="ndai-res-status">
              <span style="font-size:16px;">⚠️</span>
              <span>[${esc(co)}] N대 질병수술비 특약 미해당</span>
            </div>
            <div class="ndai-res-desc">선택하신 [${esc(co)}]의 N대 특약 분류표에는 포함되지 않는 질환입니다.<br><b>종수술비</b>로만 청구를 진행하세요.</div>
          </div>`;
      }
    } else {
      if (riderCount > 0) {
        ndaiBlockHTML = `
          <div class="ndai-res-box covered" style="background:var(--surface-2);border-color:var(--line);">
            <div class="ndai-res-status" style="color:var(--text);font-size:13px;">
              <span>🏢 N대 질병수술비: 주요 ${cos.size}개 보험사 특약 보장 해당</span>
            </div>
            <div style="font-size:11.5px;color:var(--text-3);line-height:1.45;">
              ⚠️ <b>회사 미선택</b>: 상단에서 회사를 지정하면 해당 회사의 N대 보장 여부가 1초 만에 확정됩니다.
            </div>
          </div>`;
      } else {
        ndaiBlockHTML = `
          <div class="ndai-res-box not-covered">
            <div class="ndai-res-status" style="font-size:13px;">
              <span>⚠️ N대 질병수술비 미해당</span>
            </div>
            <div class="ndai-res-desc">주요 보험사 N대 특약에는 포함되지 않는 질환입니다. 종수술비로 청구하세요.</div>
          </div>`;
      }
    }
  }

  return `
  <article class="card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <div>
          <h3 class="card-name">${hl(g.n, q)}</h3>
          <div class="card-codes">${g.c.slice(0, 8).map(c => `<span class="code-pill">${esc(c)}</span>`).join('')}</div>
        </div>
      </div>

      ${ediBanner}
      ${tierBlockHTML}
      ${ndaiBlockHTML}
    </div>

    <div class="card-actions">
      <button class="card-toggle">
        <span>세부사항 펼치기 (근거 · 수가)</span>
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

/* ───────────────────────── 세부사항 (펼쳤을 때만 노출) ───────────────────────── */
function detailHTML(gi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const { cos, riderCount } = matchInfo(g);
  const tip = curatedFor(g, window.CURATED?.tips);
  let out = '';

  /* 1. 실무 청구 꿀팁 */
  if (tip) {
    out += `<section class="sec">
      <div class="tip-box">
        <div class="tip-head">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          <b>${esc(tip.val.title)}</b>
        </div>
        <ul class="tip-list">${tip.val.items.map(it => `<li>${esc(it)}</li>`).join('')}</ul>
      </div>
    </section>`;
  }

  /* 2. 1~5종 약관 분류표 원문 근거 */
  out += `<section class="sec">
    <h4 class="sec-title">1~5종 수술비 약관 분류 근거<span class="dotline"></span></h4>
    <div style="background:var(--surface-2);border-radius:10px;padding:10px 12px;font-size:12px;line-height:1.5;">
      · <b>표준 약관 종수</b>: <b>${tierLabel(t)}</b> (${esc(t.w || '약관 분류표 세부 조항')})<br>
      · <b>구 1~3종 (2006년 이전)</b>: ${t.t <= 2 ? '1종' : t.t === 3 ? '2종' : '3종'} 해당<br>
      · <b>관혈 vs 비관혈</b>: 내시경·카테터 등 비관혈 수술은 통상 1~2종, 개복·개흉 등 관혈 수술은 3~5종 적용
    </div>
  </section>`;

  /* 3. N대 질병수술비 특별약관 원문 */
  if (riderCount) {
    const list = [...cos.entries()].sort((a, b) => b[1].length - a[1].length);
    out += `<section class="sec">
      <h4 class="sec-title">N대 질병수술비 약관 원문 매칭 (${cos.size}개사)<span class="dotline"></span></h4>
      <div class="nda-panel">
        <div class="nda-list">
          ${list.map(([co, arr]) => `
            <div class="nda-item">
              <span class="nda-flag"></span>
              <span class="nda-co">${esc(co)}</span>
              <span class="nda-desc">${arr.map(x => esc(x.line)).join('<br>')}</span>
            </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  /* 4. 심평원 EDI 수술 수가코드 */
  const ediList = relatedEdi(g, 6);
  if (ediList.length) {
    out += `<section class="sec">
      <h4 class="sec-title">심평원 EDI 수술 수가코드<span class="dotline"></span></h4>
      <div class="edi-grid">${ediList.map(h => ediRowHTML(h.i)).join('')}</div>
    </section>`;
  }

  /* 5. 청구 필요 서류 체크리스트 */
  out += `<section class="sec">
    <h4 class="sec-title">청구 필요 서류 체크리스트<span class="dotline"></span></h4>
    <div style="background:var(--surface-2);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--text-2);line-height:1.55;">
      ✓ <b>진단서</b> (질병분류코드 KCD, 확정진단명 명시)<br>
      ✓ <b>수술기록지</b> (수술명, 관혈/비관혈 수술 방식, 수술 부위 명시)<br>
      ✓ <b>진료비 세부산정내역서</b> (EDI 수가코드 기재된 영수증)<br>
      ✓ <b>조직검사 결과지</b> (용종·종양의 경우 선종/악성 여부 입증용)
    </div>
  </section>`;

  return out;
}

function relatedEdi(g, limit) {
  const pool = [];
  const seen = new Set();
  const names = new Set([norm(g.n), ...(g.vs || []).map(norm)]);
  const tokens = g.n.split(/[^가-힣A-Za-z0-9]+/).filter(t => t.length >= 2);

  for (let i = 0; i < idx.edi.length; i++) {
    const rec = idx.edi[i];
    let score = 0;
    if (names.has(rec.nn)) score = 10;
    else if (tokens.some(t => rec.nn.includes(norm(t)))) score = 5;
    if (score) pool.push({ i, score });
  }
  pool.sort((a, b) => b.score - a.score || (state.E.rows[b.i][2] === 'S') - (state.E.rows[a.i][2] === 'S'));

  const out = [];
  for (const h of pool) {
    const code = state.E.rows[h.i][0];
    if (seen.has(code)) continue;
    seen.add(code); out.push({ i: h.i });
    if (out.length >= limit) break;
  }
  return out;
}

function ediRowHTML(i) {
  const r = state.E.rows[i];
  const kind = r[2] === 'S' ? '수술' : r[2] === 'T' ? '처치' : '';
  return `<div class="edi-item">
    <span class="edi-code">${esc(r[0])}</span>
    <span class="edi-name">${esc(r[1])}${kind ? ` <b style="color:var(--text-3);font-size:11px">［${kind}］</b>` : ''}</span>
  </div>`;
}

/* ───────────────────────── 복사 ───────────────────────── */
function copyCard(gi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const { cos } = matchInfo(g);
  const procs = curatedFor(g, window.CURATED?.procs);
  const top = procs ? procs.val.slice(0, 2).map(p => `${p.s} → ${p.t}`).join('\n  - ') : '';
  const co = state.dCo;
  const hasCo = co && cos.has(co);

  let text = '';
  if (co) {
    text = `[보험비서] ${co} 가입 고객 수술비 보장 안내

고객님, 가입하신 [${co}] 기준으로 [${g.n}] 수술비 보장 내역을 안내해 드립니다.

· 질병코드 : ${g.c.slice(0, 3).join(', ')} (${g.n})
· 1~5종 수술비 : ${tierLabel(t)} 해당 예상
· ${co} N대 수술비 : ${hasCo ? '보장 해당\n  - ' + cos.get(co).map(x => x.line).join('\n  - ') : 'N대 수술비 특약 미해당 (종수술비 청구 대상)'}${top ? '\n· 주요 수술별 종수 : \n  - ' + top : ''}

필요 서류 : 진단서(질병분류코드·수술명 명시), 수술기록지, 진료비 세부산정내역서
※ 정확한 지급액은 가입 약관 세대 및 현장 심사 기준에 따라 달라질 수 있습니다.

- 보험비서 드림`;
  } else {
    text = `[보험비서] ${g.n}(${g.c.slice(0, 3).join(', ')}) 수술비 안내

고객님, 문의하신 [${g.n}] 수술비 보장 요약 안내입니다.

· 질병코드 : ${g.c.slice(0, 3).join(', ')} ${g.n}
· 1~5종 수술비 : ${tierLabel(t)} 해당 예상 (가입 세대별 확인 요망)
· N대 질병수술비 : 주요 보험사 N대 특약 보장 해당${top ? '\n· 주요 수술별 종수 :\n  - ' + top : ''}

필요 서류 : 진단서(KCD 코드·수술명 기재), 수술기록지, 진료비 영수증
※ 정확한 보상 여부는 가입하신 증권 약관에 따라 차이가 있을 수 있으니 청구 전 서류 확인을 도와드리겠습니다.

- 보험비서 드림`;
  }

  const done = () => toast('고객 안내문이 복사되었습니다');
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else fallbackCopy(text, done);
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (_) { toast('복사에 실패했습니다.', false); }
  document.body.removeChild(ta);
}

/* ───────────────────────── 탭 전환 ───────────────────────── */
function switchTab(tab) {
  state.tab = tab;
  $$('.tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  $$('.pane').forEach(p => { p.hidden = p.id !== 'pane-' + tab; });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('.tab'); if (b) switchTab(b.dataset.tab);
});

/* ───────────────────────── N대 질병수술비 약관 목록 ───────────────────────── */
function renderRiders() {
  const R = state.D.riders;
  const cos = [...new Set(R.map(r => r.co))];
  const cur = state.ridersCo || cos[0];

  let html = `
    <div class="page-head"><h2>N대 질병수술비 특별약관</h2><p>원수사별 N대 수술비 특약 목록과 세부 담보 구성을 확인합니다.</p></div>
    <div class="co-chips" style="display:flex;gap:6px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:6px;margin-bottom:14px;">
      ${cos.map(co => `<button class="chip ${co === cur ? 'on' : ''}" data-rco="${esc(co)}">${esc(co)}</button>`).join('')}
    </div>`;

  const filtered = R.filter(r => r.co === cur);
  html += `<div class="card" style="padding:14px 18px 4px">`;
  filtered.forEach(r => {
    html += `
      <div style="padding:12px 0;border-bottom:1px solid var(--line);">
        <div style="font-weight:800;font-size:14px;color:var(--text);margin-bottom:4px;">${esc(r.rider)}</div>
        <div style="font-size:12px;color:var(--text-3);margin-bottom:6px;">${esc(r.docTitle || '')} (${esc(r.co)})</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${(r.subs || []).map(s => `<span class="sub-pill" style="font-size:11px;padding:2px 7px;background:var(--surface-2);border-radius:6px;color:var(--text-2);">${esc(s)}</span>`).join('')}
        </div>
      </div>`;
  });
  html += `</div>`;

  const pane = $('#pane-riders');
  pane.innerHTML = html;

  $$('.co-chips .chip', pane).forEach(btn => {
    btn.addEventListener('click', () => {
      state.ridersCo = btn.dataset.rco;
      renderRiders();
    });
  });
}

/* ───────────────────────── 안내 ───────────────────────── */
function renderAbout() {
  const s = state.D.g.length, e = state.E.rows.length, r = state.D.riders.length;
  $('#pane-about').innerHTML = `
    <div class="page-head"><h2>서비스 안내</h2><p>보험비서 수술비 판별기에 쓰인 데이터와 원칙을 안내합니다.</p></div>

    <div class="panel">
      <h3><span class="sec-dot"></span>탑재 데이터</h3>
      <p>· 질병·수술 분류 <b>${s.toLocaleString()}건</b> — ${r}개 원수사 N대 질병수술비 특별약관의 질병코드·담보 구성<br>
         · 심평원 EDI 수술 수가코드 <b>${e.toLocaleString()}건</b> — 진료비 세부산정내역서 수술코드 완벽 매칭<br>
         · 원수사 <b>${r}개 특별약관</b> 질병분류표 전수 분석</p>
    </div>

    <div class="panel">
      <h3><span class="sec-dot"></span>판별 원칙</h3>
      <p>· <b>1~5종 수술비</b>: 표준 1~5종 분류표 및 2020년 이후 개정 약관(대장용종 1종 하향 등)을 정확히 분리하여 판정합니다.<br>
         · <b>수술코드 매칭</b>: Q7701, O1421 등 병원 영수증의 EDI 코드를 입력해도 해당 질환과 종수가 1초 만에 바로 도출됩니다.<br>
         · <b>면책 유의사항</b>: 본 도구는 영업 및 보상 청구 참고용 요약본이며, 실제 보험금 지급 여부는 가입 당시 약관과 보상과 최종 심사로 확정됩니다.</p>
    </div>`;
}

})();
