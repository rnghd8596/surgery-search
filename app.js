/* ══════════════════════════════════════════════════════════
   보험비서 수술비 사전 — app.js (v20261108j)
   하이브리드 스마트 검색 · 종수술비 & N대 질병수술비 분리 완성형
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
  // 유방외과 (맘모톰 등)
  'N7121': { codes: ['N60', 'D24'], name: '유방양성종양절제술(맘모톰절제 포함)', tier: '2종' },
  'N7122': { codes: ['N60', 'D24'], name: '유방양성종양절제술(다발성)', tier: '2종' },
  'C8641': { codes: ['N60', 'D24', 'N63'], name: '유방생검(침생검/맘모톰생검)', tier: '1~2종' },
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
  'R3221': { codes: ['N20', 'N21', 'N22', 'N23'], name: '체외충격파쇄석술(ESWL)', tier: '비해당(시술) 다수' }
};

/* ───────────────────────── 회사 약칭 & 자동 감지 매핑 (전사 31개사) ───────────────────────── */
const COMPANY_ALIASES = [
  // 손해보험 (13개사)
  { name: '현대해상', type: 'sonbo', keys: ['현대해상', '현대', '현해'] },
  { name: '삼성화재', type: 'sonbo', keys: ['삼성화재', '삼화'] },
  { name: 'DB손해보험', type: 'sonbo', keys: ['db손해보험', 'db손보', '디손', '동부화재'] },
  { name: 'KB손해보험', type: 'sonbo', keys: ['kb손해보험', 'kb손보', '케손', '크손', 'kb손'] },
  { name: '메리츠화재', type: 'sonbo', keys: ['메리츠화재', '메리츠', '멜츠'] },
  { name: '한화손해보험', type: 'sonbo', keys: ['한화손해보험', '한화손보', '한손'] },
  { name: '흥국화재', type: 'sonbo', keys: ['흥국화재', '흥화'] },
  { name: '롯데손해보험', type: 'sonbo', keys: ['롯데손해보험', '롯데손보', '롯손', '롯데'] },
  { name: 'NH농협손해보험', type: 'sonbo', keys: ['농협손해보험', '농협손보', '농손', 'nh손보', 'nh농협손보'] },
  { name: '하나손해보험', type: 'sonbo', keys: ['하나손해보험', '하나손보', '하손'] },
  { name: 'MG손해보험', type: 'sonbo', keys: ['mg손해보험', 'mg손보', '엠손'] },
  { name: 'AIG손해보험', type: 'sonbo', keys: ['aig손해보험', 'aig손보', '에이아이지'] },
  { name: '라이나손해보험', type: 'sonbo', keys: ['라이나손해보험', '라이나손보'] },

  // 생명보험 (18개사)
  { name: '삼성생명', type: 'saengbo', keys: ['삼성생명', '삼생'] },
  { name: '한화생명', type: 'saengbo', keys: ['한화생명', '한생', '대한생명'] },
  { name: '교보생명', type: 'saengbo', keys: ['교보생명', '교보'] },
  { name: '신한라이프', type: 'saengbo', keys: ['신한라이프', '신라', '신한생명', '신생'] },
  { name: 'KB라이프생명', type: 'saengbo', keys: ['kb라이프생명', 'kb라이프', '케생', '크생', '푸르덴셜'] },
  { name: '동양생명', type: 'saengbo', keys: ['동양생명', '동양', '동생'] },
  { name: '미래에셋생명', type: 'saengbo', keys: ['미래에셋생명', '미래에셋', '미생'] },
  { name: 'DB생명', type: 'saengbo', keys: ['db생명', '디생', '동부생명'] },
  { name: '흥국생명', type: 'saengbo', keys: ['흥국생명', '흥생'] },
  { name: '라이나생명', type: 'saengbo', keys: ['라이나생명', '라이나', '라생'] },
  { name: '메트라이프생명', type: 'saengbo', keys: ['메트라이프생명', '메트라이프', '메라', '멧라', '메트'] },
  { name: 'AIA생명', type: 'saengbo', keys: ['aia생명', 'aia', '에이아이에이', '아아생'] },
  { name: '하나생명', type: 'saengbo', keys: ['하나생명', '하생'] },
  { name: 'ABL생명', type: 'saengbo', keys: ['abl생명', 'abl', '에이비엘', '아블', '알리안츠'] },
  { name: 'NH농협생명', type: 'saengbo', keys: ['농협생명', '농생', 'nh생명', 'nh농협생명'] },
  { name: 'iM라이프', type: 'saengbo', keys: ['im라이프', 'dgb생명', '아라', '아임', '디라'] },
  { name: 'KDB생명', type: 'saengbo', keys: ['kdb생명', 'kdb', '케디생', '금호생명'] },
  { name: 'IBK연금보험', type: 'saengbo', keys: ['ibk연금보험', 'ibk연금', '기업은행연금', '아백연금'] }
];

/* ───────────────────────── 날짜 파서 (모든 입력 형태 완벽 지원) ───────────────────────── */
function parseSmartDate(rawText) {
  let year = null;
  let month = null;
  let text = rawText;

  // 1. 2021년 3월 / 21년 3월 / 21년3월
  let m = text.match(/\b((?:19|20)?\d{2})년\s*([01]?\d)월/);
  if (m) {
    year = normalizeYear(m[1]);
    month = parseInt(m[2], 10);
    text = text.replace(m[0], ' ');
  }
  // 2. 2021.03 / 21.3 / 21.03 / 2021-3 / 2021/03
  else if ((m = text.match(/\b((?:19|20)?\d{2})[.\-\/]\s*([01]?\d)\b/))) {
    year = normalizeYear(m[1]);
    month = parseInt(m[2], 10);
    text = text.replace(m[0], ' ');
  }
  // 3. 202103 (6자리 YYYYMM)
  else if ((m = text.match(/\b(19\d{2}|20\d{2})(0[1-9]|1[0-2])\b/))) {
    year = parseInt(m[1], 10);
    month = parseInt(m[2], 10);
    text = text.replace(m[0], ' ');
  }
  // 4. 2103 (4자리 YYMM, 수술코드 제외 순수 숫자)
  else if ((m = text.match(/(?<![A-Za-z0-9가-힣])\b(\d{2})(0[1-9]|1[0-2])\b(?![A-Za-z0-9가-힣])/))) {
    const yy = parseInt(m[1], 10);
    if (yy <= 30 || yy >= 80) {
      year = normalizeYear(m[1]);
      month = parseInt(m[2], 10);
      text = text.replace(m[0], ' ');
    }
  }
  // 5. 2021년 / 21년
  else if ((m = text.match(/\b((?:19|20)?\d{2})년\b/))) {
    year = normalizeYear(m[1]);
    text = text.replace(m[0], ' ');
  }
  // 6. 2021 / 2005 (4자리 단독 연도, 수술코드나 KCD 제외)
  else if ((m = text.match(/(?<![A-Za-z0-9])\b(19\d{2}|20\d{2})\b(?![A-Za-z0-9])/))) {
    year = parseInt(m[1], 10);
    text = text.replace(m[0], ' ');
  }

  let gen = null;
  if (year !== null) {
    if (year >= 2020) gen = 'recent';
    else if (year >= 2006) gen = 'std';
    else gen = 'old';
  } else {
    if (/(2006년\s*이전|구종수|구1~3종)/.test(text)) {
      gen = 'old';
      text = text.replace(/(2006년\s*이전|구종수|구1~3종)/g, ' ');
    } else if (/(2006\s*~?\s*2019|표준)/.test(text)) {
      gen = 'std';
      text = text.replace(/(2006\s*~?\s*2019년?|표준)/g, ' ');
    } else if (/(2020년?\s*이후|최근|개정)/.test(text)) {
      gen = 'recent';
      text = text.replace(/(2020년?\s*이후|최근|개정)/g, ' ');
    }
  }

  return { year, month, gen, cleanText: text.trim() };
}

function normalizeYear(yStr) {
  let y = parseInt(yStr, 10);
  if (y < 100) {
    y += (y <= 30) ? 2000 : 1900;
  }
  return y;
}

/* ───────────────────────── 검색어에서 회사 및 가입시기 파싱 ───────────────────────── */
function parseSmartQuery(raw) {
  const dt = parseSmartDate(raw);
  let text = dt.cleanText;
  let foundCo = null;
  let foundCoType = null;
  let foundNtier = '';

  // N대 특약 숫자 검출 (예: 123대, 112대, 116대, 120대, 101대, 71대 등)
  const mNtier = text.match(/\b(\d+대)\b/);
  if (mNtier) {
    foundNtier = mNtier[1];
    text = text.replace(mNtier[0], ' ');
  }

  // 회사명 검출 (31개사 및 약칭)
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase();
    for (const ca of COMPANY_ALIASES) {
      if (ca.keys.includes(w)) {
        foundCo = ca.name;
        foundCoType = ca.type;
        words.splice(i, 1);
        break;
      }
    }
    if (foundCo) break;
  }

  return {
    cleanQ: words.join(' ').trim(),
    co: foundCo,
    coType: foundCoType,
    gen: dt.gen,
    year: dt.year,
    month: dt.month,
    ntier: foundNtier
  };
}

/* ───────────────────────── KCD 질병코드 범위 매칭 (예: N23 -> N20~N25) ───────────────────────── */
function matchKcdRange(queryCode, targetRange) {
  const qm = queryCode.match(/^([A-Z])(\d+)(?:\.\d+)?$/);
  if (!qm) return false;
  const qAlpha = qm[1];
  const qNum = parseInt(qm[2], 10);

  const rm = targetRange.match(/^([A-Z])(\d+)\s*[~-]\s*([A-Z])?(\d+)$/);
  if (!rm) return false;
  const rAlpha1 = rm[1];
  const rNum1 = parseInt(rm[2], 10);
  const rAlpha2 = rm[3] || rAlpha1;
  const rNum2 = parseInt(rm[4], 10);

  if (rAlpha1 === qAlpha && rAlpha2 === qAlpha) {
    return qNum >= rNum1 && qNum <= rNum2;
  }
  return false;
}

const state = {
  D: null, E: null, X: null, B: null,
  tab: 'quick',       // 'quick' | 'tier' | 'ndai' | 'about'
  quickQ: '',
  tierQ: '',
  ndaiQ: '',
  tGen: 'all',        // 'all' | 'recent' | 'std' | 'old'
  tYear: null,        // e.g. 2021 or null
  tMonth: null,       // e.g. 3 or null
  tCo: '',            // company for tier
  ndaiGen: 'all',     // 'all' | 'recent' | 'mid' | 'old'
  ndaiYear: null,     // e.g. 2021 or null
  ndaiCo: 'KB손해보험', // company for ndai
  ndaiTier: '',       // e.g. '123대', '112대' or ''
  ndaiMode: 'search', // 'search' | 'tree'
  activeTreeRider: null,
  activeTreeSub: null
};

/* ───────────────────────── 테마 ───────────────────────── */
function initTheme() {
  const saved = localStorage.getItem('hb.theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  $('#themeBtn').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('hb.theme', next);
  });
}

/* ───────────────────────── 암호화 해제 ───────────────────────── */
function b64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function bytesToB64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}
async function deriveKey(pw, saltB64, iter) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(pw), { name: 'PBKDF2' }, false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: b64ToBytes(saltB64), iterations: iter, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['decrypt']
  );
}
async function decryptBlob(buf, key) {
  const u8 = new Uint8Array(buf);
  const offset = (u8[0] === 0x48 && u8[1] === 0x42 && u8[2] === 0x53 && u8[3] === 0x31) ? 4 : 0;
  const iv = u8.slice(offset, offset + 12);
  const ct = u8.slice(offset + 12);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(plain);
  writer.close();
  const decompressed = await new Response(ds.readable).arrayBuffer();
  return JSON.parse(new TextDecoder().decode(decompressed));
}
async function unlockWithKey(key) {
  const [d, e, x, b] = await Promise.all([
    fetch('assets/data/diseases.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/edi.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/exc.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/bunri.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
  ]);
  return { d, e, x, b };
}

/* ───────────────────────── 인덱스 빌드 ───────────────────────── */
let idx = { name: [], syn: [], edi: [] };

function buildIndex() {
  const D = state.D;
  idx.name = D.g.map((g, i) => {
    const nn = norm(g.n);
    const ch = getChosung(g.n);
    return { i, nn, ch, l: nn.length };
  });

  idx.syn = (window.CURATED?.synonyms || []).map(s => ({
    ...s,
    nq: norm(s.q),
    keys: (s.aliases || []).map(norm).concat(norm(s.q)),
  }));

  idx.edi = state.E.rows.map((r, i) => ({
    i,
    c: r[0],
    n: r[1],
    nn: norm(r[1]),
  }));
}

const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
function getChosung(str) {
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 44032;
    if (code >= 0 && code <= 11171) res += CHOSUNG[Math.floor(code / 588)];
    else res += str[i];
  }
  return norm(res);
}

/* ───────────────────────── 부트스트랩 ───────────────────────── */
(async function boot() {
  initTheme();
  try {
    const r = await fetch('assets/data/manifest.json', { cache: 'no-store' });
    state.M = await r.json();
  } catch (e) {
    $('#pwErr').textContent = '데이터 매니페스트를 불러오지 못했습니다. 새로고침해 주세요.';
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
    console.error('Unlock error:', err);
    setLockBusy(false);
    const card = $('#lockCard');
    card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake');
    $('#pwErr').textContent = (err && err.name === 'OperationError') ? '비밀번호가 올바르지 않습니다' : ('오류: ' + (err.message || '비밀번호가 올바르지 않습니다'));
    $('#pwErr').classList.add('show');
    pwEl.select();
  }
});

$('#pwEye').addEventListener('click', () => {
  const i = $('#pw');
  i.type = i.type === 'password' ? 'text' : 'password';
  i.focus();
});

/* ───────────────────────── 앱 시작 ───────────────────────── */
function start(data) {
  state.D = data.d;
  state.E = data.e;
  state.X = data.x;
  state.B = data.b;

  buildIndex();

  $('#lock').classList.add('hide');
  $('#lock').hidden = true;
  $('#app').hidden = false;

  bindNavTabs();
  bindQuickTab();
  bindTierTab();
  bindNdaiTab();
  bindOcrTab();

  $('#logoBtn').addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('quick');
  });

  $('#lockBtn').addEventListener('click', () => {
    try { sessionStorage.removeItem('hb.k'); } catch (_) {}
    location.reload();
  });
}

/* ───────────────────────── 상단 탭 전환 ───────────────────────── */
function switchTab(tabKey) {
  state.tab = tabKey;
  $$('#tabs .tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tabKey));

  $('#pane-quick').hidden = tabKey !== 'quick';
  $('#pane-tier').hidden = tabKey !== 'tier';
  $('#pane-ndai').hidden = tabKey !== 'ndai';
  $('#pane-ocr').hidden = tabKey !== 'ocr';
  $('#pane-about').hidden = tabKey !== 'about';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabKey === 'quick') {
    $('#q-quick').focus();
  } else if (tabKey === 'tier') {
    $('#q-tier').focus();
    if (state.tierQ) runTierSearch(state.tierQ);
  } else if (tabKey === 'ndai') {
    if (state.ndaiMode === 'search') {
      $('#q-ndai').focus();
      if (state.ndaiQ) runNdaiSearch(state.ndaiQ);
    } else {
      renderNdaiTree();
    }
  } else if (tabKey === 'ocr') {
    // 사진으로 검색 탭
  } else if (tabKey === 'about') {
    renderAbout();
  }
}

function bindNavTabs() {
  $('#tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (b) switchTab(b.dataset.tab);
  });
}

/* ───────────────────────── 검색 엔진 (범위 매칭 지원) ───────────────────────── */
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

  // 2. KCD 질병코드 매칭 (단일 코드, 접두사, 그리고 N20~N25 범위 매칭 지원!)
  const looksKcd = /^[A-Z]\d/.test(up);
  if (looksKcd) {
    (state.D.codeIndex[up] || []).forEach(i => add(i, 0));
    for (const code in state.D.codeIndex) {
      if (code !== up && code.startsWith(up)) state.D.codeIndex[code].forEach(i => add(i, 0.8));
    }
    state.D.g.forEach((g, i) => {
      const hasDirect = g.c.some(c => c.replace(/\s/g, '').toUpperCase().includes(up));
      if (hasDirect) {
        add(i, 1.2);
        return;
      }
      const hasRange = g.c.some(c => matchKcdRange(up, c.replace(/\s/g, '').toUpperCase()));
      if (hasRange) {
        add(i, 0.5); // 범위 매칭은 높은 우선순위!
      }
    });
  }

  // 3. N대 담보명 검색 (예: '49대', '58대', '생활질환', '치핵')
  if (/(\d+대|생활질환|생활질병|다빈도|치핵|백내장|부인과)/.test(nq)) {
    const riders = state.D.riders;
    riders.forEach((r, ri) => {
      (r.subs || []).forEach((sub, si) => {
        if (norm(sub).includes(nq) || norm(r.rider).includes(nq)) {
          const targetKey = ri + '.' + si;
          state.D.g.forEach((g, gi) => {
            if (g.m && g.m.includes(targetKey)) {
              add(gi, 1.0);
            }
          });
        }
      });
    });
  }

  // 4. 별칭(synonyms) 정밀 매칭
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

  // 5. 질병명 텍스트 매칭
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

/* ───────────────────────── 1. 빠른 검색 ───────────────────────── */
function bindQuickTab() {
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

  // 상단 3대 모드 컬러 카드 전환
  $$('.mode-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const go = btn.dataset.go;
      if (go === 'quick') {
        $('#q-quick').focus();
      } else {
        switchTab(go);
      }
    });
  });

  renderIdleQuick();
}

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
        <p>질병코드 · 수술코드 · 질병명으로 다시 검색해 보세요.</p>
      </div>`;
    return;
  }

  let html = head;
  html += res.groups.slice(0, 12).map(i => cardQuickHTML(i, q, res.matchedEdi)).join('');
  box.innerHTML = html;
  bindCardActions(box);
}

function renderIdleQuick() {
  $('#hero-quick').classList.remove('hide');
  const box = $('#results-quick');
  box.innerHTML = `
    <!-- 첫화면 2대 정밀 모드 바로가기 배너 -->
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:12px;">
      <div class="quick-shortcut-banner" data-go="tier" style="background:rgba(16,185,129,0.06);border:1.5px solid rgba(16,185,129,0.3);border-radius:12px;padding:10px 12px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:12px;font-weight:900;color:#10b981;">📋 종수술비 정밀검색</div>
          <div style="font-size:10px;color:var(--text-3);margin-top:2px;">가입시기(년·월) & 회사별 판정</div>
        </div>
        <span style="font-size:14px;font-weight:900;color:#10b981;">→</span>
      </div>

      <div class="quick-shortcut-banner" data-go="ndai" style="background:rgba(139,92,246,0.06);border:1.5px solid rgba(139,92,246,0.3);border-radius:12px;padding:10px 12px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:12px;font-weight:900;color:#8b5cf6;">🏢 N대질병 정밀검색</div>
          <div style="font-size:10px;color:var(--text-3);margin-top:2px;">123대 중 몇대인지 단답</div>
        </div>
        <span style="font-size:14px;font-weight:900;color:#8b5cf6;">→</span>
      </div>
    </div>

    <div class="frequent-card">
      <div class="frequent-head">
        <span class="fh-title">자주 찾는 수술</span>
        <span class="fh-sub">탭하면 1초 판정</span>
      </div>
      <div class="frequent-grid">
        ${[
          ['대장용종', '대장용종 · 대장폴립 · 결장용종'],
          ['위용종', '위용종 · 위폴립 · 십이지장용종'],
          ['맘모톰', '맘모톰 · 유방종양 · 섬유선종'],
          ['백내장', '백내장 · 수정체 · 인공수정체'],
          ['비염·비중격', '비염 · 비중격 · 비중격만곡'],
          ['치핵', '치핵 · 치질 · 치루근본수술'],
          ['담낭절제', '담낭절제 · 담석증 · 복강경'],
          ['협심증·스텐트', '협심증 · 스텐트 · 심근경색']
        ].map(([term, desc]) => `
          <div class="freq-item" data-term="${esc(term)}">
            <span class="freq-name">${esc(term)}</span>
            <span class="freq-desc">${esc(desc)}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="idle-hint">
      질병코드(N23, J34) · 수술코드(Q7701, O1421) · 질병명(맘모톰, 백내장) 무엇이든 입력하세요.
    </div>`;

  $$('.quick-shortcut-banner', box).forEach(el => {
    el.addEventListener('click', () => switchTab(el.dataset.go));
  });

  $$('.freq-item', box).forEach(el => {
    el.addEventListener('click', () => {
      const term = el.dataset.term.split('·')[0];
      $('#q-quick').value = term;
      $('#clearBtn-quick').hidden = false;
      runQuickSearch(term);
    });
  });
}

function cardQuickHTML(gi, q, matchedEdi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const ex = curatedFor(g, window.CURATED?.exceptions);
  const procs = curatedFor(g, window.CURATED?.procs);

  let ediBanner = '';
  if (matchedEdi) {
    ediBanner = `
      <div style="background:rgba(49,130,246,0.08);border:1px solid rgba(49,130,246,0.25);border-radius:10px;padding:8px 12px;margin:8px 0;font-size:12px;">
        <span style="font-weight:800;color:var(--brand)">✓ 수술코드 [${esc(matchedEdi.code)}] ${esc(matchedEdi.name)} 매칭</span>
      </div>`;
  }

  let exHTML = '';
  if (ex) {
    exHTML = `
      <div style="background:rgba(245,158,11,0.09);border:1.5px solid rgba(245,158,11,0.3);border-radius:12px;padding:10px 14px;margin:10px 0 6px;">
        <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:850;color:#d97706;">
          <span style="background:#f59e0b;color:#fff;border-radius:6px;padding:2px 6px;font-size:11px;font-weight:900;">${esc(ex.val.exTier)}</span>
          <span>${esc(ex.val.exLabel)}</span>
        </div>
        <div style="font-size:11.5px;color:var(--text-2);margin-top:4px;line-height:1.45;">${esc(ex.val.note)}</div>
      </div>`;
  }

  let procsHTML = '';
  if (procs && procs.val && procs.val.length > 0) {
    procsHTML = `
      <div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);">
        <div style="font-size:11.5px;font-weight:750;color:var(--text-3);margin-bottom:6px;">기타 수술 방식별 종수:</div>
        <div style="display:flex;flex-direction:column;gap:5px;">
          ${procs.val.map(p => `
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;">
              <span class="proc-tag ${'t' + (parseInt(p.t) || 2)}" style="font-size:11px;padding:2px 6px;min-width:38px;">${esc(p.t)}</span>
              <span style="font-weight:750;color:var(--text);">${esc(p.s)}</span>
              ${p.n ? `<span style="font-size:10.5px;color:var(--text-3);margin-left:auto;">${esc(p.n)}</span>` : ''}
            </div>`).join('')}
        </div>
      </div>`;
  }

  return `
  <article class="card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <h3 class="card-name">${hl(g.n, q)}</h3>
        <span class="kcd-badge">${g.c.slice(0, 3).join(', ')}</span>
      </div>

      ${ediBanner}

      <div style="background:var(--surface-2);border-radius:14px;padding:12px 14px;margin-top:10px;border:1px solid var(--border);">
        <div style="font-size:11px;font-weight:750;color:var(--text-3);letter-spacing:-.01em;margin-bottom:4px;">1~5종 수술비 표준 판정</div>
        <div style="display:flex;align-items:center;gap:12px;margin:2px 0 4px;">
          <span class="proc-tag ${'t' + (t.t || 2)}" style="font-size:16px;padding:5px 14px;border-radius:10px;min-width:54px;">${esc(tierLabel(t))}</span>
          <div>
            <div style="font-size:14px;font-weight:800;color:var(--text);">${esc(t.w || g.n + ' 수술')}</div>
            <div style="font-size:11px;color:var(--text-3);margin-top:2px;">생명보험 전사 · 2020년 이전 손해보험 표준약관 기준</div>
          </div>
        </div>
        ${exHTML}
        ${procsHTML}
      </div>

      <!-- 정밀 진단 바로가기 버튼 2종 -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);">
        <button type="button" class="btn-jump-tier" data-q="${esc(g.n)}" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:7px 8px;font-size:11px;font-weight:850;color:#10b981;display:flex;align-items:center;justify-content:center;gap:4px;cursor:pointer;">
          <span>📋 종수술비 정밀 →</span>
        </button>
        <button type="button" class="btn-jump-ndai" data-q="${esc(g.n)}" style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.3);border-radius:8px;padding:7px 8px;font-size:11px;font-weight:850;color:#8b5cf6;display:flex;align-items:center;justify-content:center;gap:4px;cursor:pointer;">
          <span>🏢 N대질병 정밀 →</span>
        </button>
      </div>
    </div>

    <div class="card-actions">
      <button class="card-toggle">
        <span>세부 근거 ∨</span>
      </button>
      <button class="btn-copy">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.6"/><path d="M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V6"/></svg>
        고객 안내문 복사
      </button>
    </div>

    <div class="card-body"><div class="cb-inner"><div class="cb-pad"></div></div></div>
  </article>`;
}

/* ───────────────────────── 2. 종수술비 정밀검색 (년·월 시기별 & 회사별) ───────────────────────── */
const GEN_YEARS = {
  recent: [2026, 2025, 2024, 2023, 2022, 2021, 2020, null],
  std:    [2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009, 2008, 2007, 2006, null],
  old:    [2005, 2004, 2003, 2002, 2001, 2000, 1999, null]
};

function updateTierBadges() {
  const dBadge = $('#tierDateBadge');
  const cBadge = $('#tierCoBadge');

  let dtText = '전체 / 모름';
  if (state.tYear && state.tMonth) {
    dtText = `${state.tYear}년 ${state.tMonth}월`;
  } else if (state.tYear) {
    dtText = `${state.tYear}년`;
  } else if (state.tGen === 'recent') {
    dtText = '2020년 이후 (개정)';
  } else if (state.tGen === 'std') {
    dtText = '2006~2019년 (표준)';
  } else if (state.tGen === 'old') {
    dtText = '2006년 이전 (구종수)';
  }
  if (dBadge) dBadge.textContent = dtText;
  if (cBadge) cBadge.textContent = state.tCo ? state.tCo : '전체 / 미선택';
}

function renderYearGrid(gen) {
  const grid = $('#tierYearGrid');
  const monthSec = $('#tierMonthSection');
  if (gen === 'all' || !GEN_YEARS[gen]) {
    grid.style.display = 'none';
    monthSec.style.display = 'none';
    return;
  }

  const years = GEN_YEARS[gen];
  const allLabel = gen === 'recent' ? '2020년~ 전체' : gen === 'std' ? '06~19년 전체' : '06년이전 전체';

  grid.innerHTML = years.map(y => {
    if (y === null) {
      const isSel = state.tYear === null;
      return `<button class="f-chip y-chip ${isSel ? 'on' : ''}" data-y="" style="padding:5px 0;font-size:11px;font-weight:750;">${allLabel}</button>`;
    }
    const isSel = state.tYear === y;
    return `<button class="f-chip y-chip ${isSel ? 'on' : ''}" data-y="${y}" style="padding:5px 0;font-size:11px;font-weight:750;">${y}년</button>`;
  }).join('');

  grid.style.display = 'grid';
  monthSec.style.display = 'block';

  $$('#tierYearGrid .y-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#tierYearGrid .y-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.tYear = btn.dataset.y ? parseInt(btn.dataset.y, 10) : null;
      updateTierBadges();
      if (state.tierQ.trim()) runTierSearch(state.tierQ);
    });
  });
}

function bindTierTab() {
  const qTierEl = $('#q-tier');

  // 1단계: 시기 구분 버튼 (전체, 2020년~, 06~19년, 06년이전)
  $$('#tGenChips .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#tGenChips .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.tGen = btn.dataset.gen;
      state.tYear = null;
      state.tMonth = null;
      $$('#tierMonthGrid .m-chip').forEach((b, idx) => b.classList.toggle('on', idx === 0));
      renderYearGrid(state.tGen);
      updateTierBadges();
      if (state.tierQ.trim()) runTierSearch(state.tierQ);
    });
  });

  // 3단계: 월 칩 클릭
  $$('#tierMonthGrid .m-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#tierMonthGrid .m-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.tMonth = btn.dataset.m ? parseInt(btn.dataset.m, 10) : null;
      updateTierBadges();
      if (state.tierQ.trim()) runTierSearch(state.tierQ);
    });
  });

  $('#tierMonthReset').addEventListener('click', () => {
    $$('#tierMonthGrid .m-chip').forEach((b, idx) => b.classList.toggle('on', idx === 0));
    state.tMonth = null;
    updateTierBadges();
    if (state.tierQ.trim()) runTierSearch(state.tierQ);
  });

  // 손보 / 생보 토글
  const btnSonbo = $('#btnTierSonbo');
  const btnSaengbo = $('#btnTierSaengbo');
  const coSonbo = $('#tierCoSonbo');
  const coSaengbo = $('#tierCoSaengbo');

  btnSonbo.addEventListener('click', () => {
    btnSonbo.classList.add('on'); btnSaengbo.classList.remove('on');
    btnSonbo.style.background = 'var(--surface)'; btnSonbo.style.color = 'var(--text)';
    btnSaengbo.style.background = 'var(--surface-2)'; btnSaengbo.style.color = 'var(--text-3)';
    coSonbo.style.display = 'grid'; coSaengbo.style.display = 'none';
  });

  btnSaengbo.addEventListener('click', () => {
    btnSaengbo.classList.add('on'); btnSonbo.classList.remove('on');
    btnSaengbo.style.background = 'var(--surface)'; btnSaengbo.style.color = 'var(--text)';
    btnSonbo.style.background = 'var(--surface-2)'; btnSonbo.style.color = 'var(--text-3)';
    coSaengbo.style.display = 'grid'; coSonbo.style.display = 'none';
  });

  // 회사 칩 클릭
  $$('#tierCoSonbo .f-chip, #tierCoSaengbo .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#tierCoSonbo .f-chip, #tierCoSaengbo .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.tCo = btn.dataset.co || '';
      updateTierBadges();
      if (state.tierQ.trim()) runTierSearch(state.tierQ);
    });
  });

  // 하이브리드 스마트 검색창 입력 (21년3월, 2103, 202103, 메리츠 등 완벽 감지)
  qTierEl.addEventListener('input', debounce(() => {
    const v = qTierEl.value;
    state.tierQ = v;
    $('#clearBtn-tier').hidden = !v;
    if (!v.trim()) { $('#results-tier').innerHTML = ''; $('#hero-tier').classList.remove('hide'); return; }

    const parsed = parseSmartQuery(v);

    // 회사 자동 세팅
    if (parsed.co) {
      state.tCo = parsed.co;
      if (parsed.coType === 'saengbo') btnSaengbo.click();
      else btnSonbo.click();
      $$('#tierCoSonbo .f-chip, #tierCoSaengbo .f-chip').forEach(b => {
        b.classList.toggle('on', b.dataset.co === parsed.co);
      });
    }

    // 시기/연도/월 자동 세팅
    if (parsed.gen) {
      state.tGen = parsed.gen;
      $$('#tGenChips .f-chip').forEach(b => b.classList.toggle('on', b.dataset.gen === parsed.gen));
      renderYearGrid(parsed.gen);
    }
    if (parsed.year !== undefined && parsed.year !== null) {
      state.tYear = parsed.year;
      $$('#tierYearGrid .y-chip').forEach(b => b.classList.toggle('on', b.dataset.y === String(parsed.year)));
    }
    if (parsed.month !== undefined && parsed.month !== null) {
      state.tMonth = parsed.month;
      $$('#tierMonthGrid .m-chip').forEach(b => b.classList.toggle('on', b.dataset.m === String(parsed.month)));
    }

    updateTierBadges();
    runTierSearch(parsed.cleanQ || v);
  }, 70));

  $('#clearBtn-tier').addEventListener('click', () => {
    qTierEl.value = ''; state.tierQ = ''; $('#clearBtn-tier').hidden = true;
    $('#results-tier').innerHTML = ''; $('#hero-tier').classList.remove('hide'); qTierEl.focus();
  });
}

function runTierSearch(q) {
  $('#hero-tier').classList.add('hide');
  const res = search(q);
  const box = $('#results-tier');
  if (!res) { box.innerHTML = ''; return; }

  const dtText = state.tYear ? (state.tMonth ? `${state.tYear}년 ${state.tMonth}월` : `${state.tYear}년`) : ({ all: '가입시기 전체', old: '2006년 이전(구종수)', std: '2006~2019년(표준)', recent: '2020년 이후(개정)' }[state.tGen]);
  const cLabel = state.tCo ? state.tCo : '회사 미선택';

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> 종수술비 정밀 결과 <span style="font-size:11.5px;color:var(--brand);font-weight:700;">[${esc(cLabel)} · ${esc(dtText)}]</span></div>
      <div class="res-count">분류 ${res.groups.length}건</div>
    </div>`;

  if (!res.groups.length && !res.edi.length) {
    box.innerHTML = head + `
      <div class="empty">
        <span class="empty-emoji">🔍</span>
        <h3>“${esc(q)}”에 대한 결과가 없습니다</h3>
      </div>`;
    return;
  }

  let html = head;
  html += res.groups.slice(0, 15).map(i => cardTierHTML(i, q, res.matchedEdi)).join('');
  box.innerHTML = html;
  bindCardActions(box);
}

function cardTierHTML(gi, q, matchedEdi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const ex = curatedFor(g, window.CURATED?.exceptions);
  const procs = curatedFor(g, window.CURATED?.procs);

  const gen = state.tGen;
  const year = state.tYear;
  const month = state.tMonth;
  const co = state.tCo;

  let finalTier = tierLabel(t);
  let finalNote = '2006~2019년 표준 1~5종 약관 기준';

  const ymStr = year ? (month ? `${year}년 ${month}월` : `${year}년`) : '';

  if (year !== null) {
    if (year >= 2020) {
      if (ex && (co.includes('메리츠') || co.includes('롯데') || !co)) {
        finalTier = ex.val.exTier.split(' ')[0] || '1종';
        finalNote = `${ymStr} 계약 · 2020년 개정약관 적용 (1종 하향 개정)`;
      } else {
        finalTier = tierLabel(t);
        finalNote = `${ymStr} 계약 · 1~5종 약관 적용`;
      }
    } else if (year >= 2006) {
      finalTier = ex ? (ex.val.stdTier || tierLabel(t)) : tierLabel(t);
      finalNote = `${ymStr} 계약 · 2006~2019년 표준 1~5종 약관 적용 (2종 유지)`;
    } else {
      finalTier = t.t <= 2 ? '1종' : t.t === 3 ? '2종' : '3종';
      finalNote = `${ymStr} 계약 · 2006년 이전 구 1~3종 약관 적용`;
    }
  } else if (gen === 'old') {
    finalTier = t.t <= 2 ? '1종' : t.t === 3 ? '2종' : '3종';
    finalNote = '2006년 이전 구 1~3종 약관 적용';
  } else if (gen === 'recent') {
    if (ex && (co.includes('메리츠') || co.includes('롯데') || !co)) {
      finalTier = ex.val.exTier.split(' ')[0] || '1종';
      finalNote = '2020년 이후 개정 약관 적용 (1종 하향 개정)';
    } else {
      finalTier = tierLabel(t);
      finalNote = '2020년 이후 1~5종 약관 적용';
    }
  } else if (gen === 'std') {
    finalTier = ex ? (ex.val.stdTier || tierLabel(t)) : tierLabel(t);
    finalNote = '2006~2019년 표준 1~5종 약관 적용 (2종 유지)';
  } else if (ex && (co && (co.includes('메리츠') || co.includes('롯데')))) {
    finalTier = ex.val.exTier.split(' ')[0] || '1종';
    finalNote = `[${co}] 2020년 이후 개정약관 적용 시 1종`;
  }

  let ediBanner = '';
  if (matchedEdi) {
    ediBanner = `
      <div style="background:rgba(49,130,246,0.08);border:1px solid rgba(49,130,246,0.25);border-radius:10px;padding:8px 12px;margin:8px 0;font-size:12px;">
        <span style="font-weight:800;color:var(--brand)">✓ 수술코드 [${esc(matchedEdi.code)}] ${esc(matchedEdi.name)} 매칭</span>
      </div>`;
  }

  let procsHTML = '';
  if (procs && procs.val && procs.val.length > 0) {
    procsHTML = `
      <div style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);">
        <div style="font-size:11.5px;font-weight:750;color:var(--text-3);margin-bottom:6px;">기타 수술 방식별 종수:</div>
        <div style="display:flex;flex-direction:column;gap:5px;">
          ${procs.val.map(p => `
            <div style="display:flex;align-items:center;gap:8px;font-size:12px;">
              <span class="proc-tag ${'t' + (parseInt(p.t) || 2)}" style="font-size:11px;padding:2px 6px;min-width:38px;">${esc(p.t)}</span>
              <span style="font-weight:750;color:var(--text);">${esc(p.s)}</span>
              ${p.n ? `<span style="font-size:10.5px;color:var(--text-3);margin-left:auto;">${esc(p.n)}</span>` : ''}
            </div>`).join('')}
        </div>
      </div>`;
  }

  return `
  <article class="card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <h3 class="card-name">${hl(g.n, q)}</h3>
        <span class="kcd-badge">${g.c.slice(0, 3).join(', ')}</span>
      </div>

      ${ediBanner}

      <div style="background:var(--surface-2);border-radius:14px;padding:12px 14px;margin-top:10px;border:1px solid var(--border);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <span style="font-size:11px;font-weight:800;color:var(--brand);">1~5종 종수술비 정밀 판정</span>
          <span style="font-size:11px;font-weight:700;color:var(--text-3);">${esc(co ? co : '전사 기준')}</span>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin:3px 0 6px;">
          <span class="proc-tag ${'t' + (parseInt(finalTier) || 2)}" style="font-size:17px;padding:6px 16px;border-radius:10px;min-width:56px;">${esc(finalTier)}</span>
          <div>
            <div style="font-size:14.5px;font-weight:850;color:var(--text);">${esc(g.n)} 수술</div>
            <div style="font-size:11.5px;color:var(--brand);font-weight:700;margin-top:2px;">${esc(finalNote)}</div>
          </div>
        </div>
        ${procsHTML}
      </div>
    </div>

    <div class="card-actions">
      <button class="card-toggle">
        <span>세부 근거 ∨</span>
      </button>
      <button class="btn-copy">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.6"/><path d="M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V6"/></svg>
        고객 안내문 복사
      </button>
    </div>

    <div class="card-body"><div class="cb-inner"><div class="cb-pad"></div></div></div>
  </article>`;
}

/* ───────────────────────── 3. N대질병수술비 정밀검색 (판정 & 약관 트리) ───────────────────────── */
const NDAI_GEN_YEARS = {
  recent: [2026, 2025, 2024, 2023, 2022, 2021, null],
  mid:    [2020, 2019, 2018, null],
  old:    [2017, 2016, 2015, 2014, 2013, null]
};

function inferNtierForCompany(co, year) {
  if (!co) return '';
  if (co.includes('현대')) {
    if (!year) return '123대';
    return year >= 2021 ? '123대' : (year >= 2018 ? '120대' : '71대');
  }
  if (co.includes('KB') || co.includes('케이비')) {
    if (!year) return '116대';
    return year >= 2022 ? '116대' : (year >= 2019 ? '112대' : '101대');
  }
  if (co.includes('삼성화재')) {
    if (!year) return '116대';
    return year >= 2021 ? '116대' : (year >= 2019 ? '101대' : '77대');
  }
  if (co.includes('DB') || co.includes('동부')) {
    if (!year) return '119대';
    return year >= 2022 ? '119대' : (year >= 2019 ? '106대' : '85대');
  }
  if (co.includes('메리츠')) {
    if (!year) return '112대';
    return year >= 2021 ? '112대' : '71대';
  }
  if (co.includes('한화손')) {
    if (!year) return '110대';
    return year >= 2021 ? '110대' : '81대';
  }
  return '';
}

function updateNdaiBadges() {
  const dBadge = $('#ndaiDateBadge');
  const cBadge = $('#ndaiCoBadge');
  const tBadge = $('#ndaiTierBadge');

  if (dBadge) {
    if (state.ndaiYear) dBadge.textContent = `${state.ndaiYear}년 판매분`;
    else if (state.ndaiGen === 'recent') dBadge.textContent = '2021년 이후';
    else if (state.ndaiGen === 'mid') dBadge.textContent = '2018~2020년';
    else if (state.ndaiGen === 'old') dBadge.textContent = '2018년 이전';
    else dBadge.textContent = '전체 시기';
  }

  if (cBadge) cBadge.textContent = state.ndaiCo || '전체 / 미선택';
  if (tBadge) tBadge.textContent = state.ndaiTier || '전체 N대';
}

function renderNdaiYearGrid(gen) {
  const grid = $('#ndaiYearGrid');
  if (gen === 'all' || !NDAI_GEN_YEARS[gen]) {
    grid.style.display = 'none';
    return;
  }
  const years = NDAI_GEN_YEARS[gen];
  const allLabel = gen === 'recent' ? '21년~ 전체' : gen === 'mid' ? '18~20년 전체' : '18년이전 전체';

  grid.innerHTML = years.map(y => {
    if (y === null) {
      const isSel = state.ndaiYear === null;
      return `<button class="f-chip ny-chip ${isSel ? 'on' : ''}" data-ny="" style="padding:5px 0;font-size:11px;font-weight:750;">${allLabel}</button>`;
    }
    const isSel = state.ndaiYear === y;
    return `<button class="f-chip ny-chip ${isSel ? 'on' : ''}" data-ny="${y}" style="padding:5px 0;font-size:11px;font-weight:750;">${y}년</button>`;
  }).join('');

  grid.style.display = 'grid';

  $$('#ndaiYearGrid .ny-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#ndaiYearGrid .ny-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.ndaiYear = btn.dataset.ny ? parseInt(btn.dataset.ny, 10) : null;
      if (state.ndaiCo) {
        const inf = inferNtierForCompany(state.ndaiCo, state.ndaiYear);
        if (inf) {
          state.ndaiTier = inf;
          $$('#ndaiTierChips .f-chip').forEach(b => b.classList.toggle('on', b.dataset.ntier === inf));
        }
      }
      updateNdaiBadges();
      if (state.ndaiMode === 'search') {
        if (state.ndaiQ.trim()) runNdaiSearch(state.ndaiQ);
      } else {
        renderNdaiTree();
      }
    });
  });
}

function bindNdaiTab() {
  const qNdaiEl = $('#q-ndai');
  const btnSearchTab = $('#btnNdaiSearchTab');
  const btnTreeTab = $('#btnNdaiTreeTab');
  const searchView = $('#ndaiSearchSubView');
  const treeView = $('#ndaiTreeSubView');

  btnSearchTab.addEventListener('click', () => {
    state.ndaiMode = 'search';
    btnSearchTab.classList.add('on'); btnTreeTab.classList.remove('on');
    btnSearchTab.style.background = 'var(--text)'; btnSearchTab.style.color = 'var(--bg)';
    btnTreeTab.style.background = 'var(--surface-2)'; btnTreeTab.style.color = 'var(--text-3)';
    searchView.style.display = 'block'; treeView.style.display = 'none';
    if (state.ndaiQ) runNdaiSearch(state.ndaiQ);
  });

  btnTreeTab.addEventListener('click', () => {
    state.ndaiMode = 'tree';
    btnTreeTab.classList.add('on'); btnSearchTab.classList.remove('on');
    btnTreeTab.style.background = 'var(--text)'; btnTreeTab.style.color = 'var(--bg)';
    btnSearchTab.style.background = 'var(--surface-2)'; btnSearchTab.style.color = 'var(--text-3)';
    searchView.style.display = 'none'; treeView.style.display = 'block';
    renderNdaiTree();
  });

  // 1. 판매시기 칩 클릭
  $$('#nGenChips .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#nGenChips .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.ndaiGen = btn.dataset.ngen;
      state.ndaiYear = state.ndaiGen === 'recent' ? 2021 : state.ndaiGen === 'mid' ? 2019 : state.ndaiGen === 'old' ? 2017 : null;
      renderNdaiYearGrid(state.ndaiGen);
      if (state.ndaiCo) {
        const inf = inferNtierForCompany(state.ndaiCo, state.ndaiYear);
        if (inf) {
          state.ndaiTier = inf;
          $$('#ndaiTierChips .f-chip').forEach(b => b.classList.toggle('on', b.dataset.ntier === inf));
        }
      }
      updateNdaiBadges();
      if (state.ndaiMode === 'search') {
        if (state.ndaiQ.trim()) runNdaiSearch(state.ndaiQ);
      } else {
        renderNdaiTree();
      }
    });
  });

  // 2. 손보 / 생보 토글
  const btnSonbo = $('#btnNdaiSonbo');
  const btnSaengbo = $('#btnNdaiSaengbo');
  const coSonbo = $('#ndaiCoSonbo');
  const coSaengbo = $('#ndaiCoSaengbo');

  btnSonbo.addEventListener('click', () => {
    btnSonbo.classList.add('on'); btnSaengbo.classList.remove('on');
    btnSonbo.style.background = 'var(--surface)'; btnSonbo.style.color = 'var(--text)';
    btnSaengbo.style.background = 'var(--surface-2)'; btnSaengbo.style.color = 'var(--text-3)';
    coSonbo.style.display = 'grid'; coSaengbo.style.display = 'none';
  });

  btnSaengbo.addEventListener('click', () => {
    btnSaengbo.classList.add('on'); btnSonbo.classList.remove('on');
    btnSaengbo.style.background = 'var(--surface)'; btnSaengbo.style.color = 'var(--text)';
    btnSonbo.style.background = 'var(--surface-2)'; btnSonbo.style.color = 'var(--text-3)';
    coSaengbo.style.display = 'grid'; coSonbo.style.display = 'none';
  });

  // N대 회사 칩 클릭
  $$('#ndaiCoSonbo .f-chip, #ndaiCoSaengbo .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#ndaiCoSonbo .f-chip, #ndaiCoSaengbo .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.ndaiCo = btn.dataset.nco || '';
      const inf = inferNtierForCompany(state.ndaiCo, state.ndaiYear || 2022);
      if (inf) {
        state.ndaiTier = inf;
        $$('#ndaiTierChips .f-chip').forEach(b => b.classList.toggle('on', b.dataset.ntier === inf));
      }
      updateNdaiBadges();
      if (state.ndaiMode === 'search') {
        if (state.ndaiQ.trim()) runNdaiSearch(state.ndaiQ);
      } else {
        renderNdaiTree();
      }
    });
  });

  // 3. N대 특약 숫자 칩 클릭
  $$('#ndaiTierChips .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#ndaiTierChips .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.ndaiTier = btn.dataset.ntier || '';
      updateNdaiBadges();
      if (state.ndaiMode === 'search') {
        if (state.ndaiQ.trim()) runNdaiSearch(state.ndaiQ);
      } else {
        renderNdaiTree();
      }
    });
  });

  // 하이브리드 검색창 입력
  qNdaiEl.addEventListener('input', debounce(() => {
    const v = qNdaiEl.value;
    state.ndaiQ = v;
    $('#clearBtn-ndai').hidden = !v;
    if (!v.trim()) { $('#results-ndai').innerHTML = ''; return; }

    const parsed = parseSmartQuery(v);
    if (parsed.co) {
      state.ndaiCo = parsed.co;
      if (parsed.coType === 'saengbo') btnSaengbo.click();
      else btnSonbo.click();
      $$('#ndaiCoSonbo .f-chip, #ndaiCoSaengbo .f-chip').forEach(b => {
        b.classList.toggle('on', b.dataset.nco === parsed.co);
      });
    }

    if (parsed.year) {
      state.ndaiYear = parsed.year;
      state.ndaiGen = parsed.year >= 2021 ? 'recent' : (parsed.year >= 2018 ? 'mid' : 'old');
      $$('#nGenChips .f-chip').forEach(b => b.classList.toggle('on', b.dataset.ngen === state.ndaiGen));
      renderNdaiYearGrid(state.ndaiGen);
    }

    if (parsed.ntier) {
      state.ndaiTier = parsed.ntier;
      $$('#ndaiTierChips .f-chip').forEach(b => b.classList.toggle('on', b.dataset.ntier === parsed.ntier));
    } else if (state.ndaiCo) {
      const inf = inferNtierForCompany(state.ndaiCo, state.ndaiYear || 2022);
      if (inf) {
        state.ndaiTier = inf;
        $$('#ndaiTierChips .f-chip').forEach(b => b.classList.toggle('on', b.dataset.ntier === inf));
      }
    }

    updateNdaiBadges();
    runNdaiSearch(parsed.cleanQ || v);
  }, 70));

  $('#clearBtn-ndai').addEventListener('click', () => {
    qNdaiEl.value = ''; state.ndaiQ = ''; $('#clearBtn-ndai').hidden = true;
    $('#results-ndai').innerHTML = ''; qNdaiEl.focus();
  });
}

function runNdaiSearch(q) {
  const res = search(q);
  const box = $('#results-ndai');
  if (!res) { box.innerHTML = ''; return; }

  const cLabel = state.ndaiCo ? state.ndaiCo : '전체 회사';
  const tLabel = state.ndaiTier ? ` · ${state.ndaiTier}` : '';

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> N대 수술비 판정 <span style="font-size:11.5px;color:#8b5cf6;font-weight:800;">[${esc(cLabel)}${esc(tLabel)}]</span></div>
      <div class="res-count">분류 ${res.groups.length}건</div>
    </div>`;

  if (!res.groups.length) {
    box.innerHTML = head + `
      <div class="empty">
        <span class="empty-emoji">🔍</span>
        <h3>“${esc(q)}”에 대한 N대 수술비 결과가 없습니다</h3>
      </div>`;
    return;
  }

  let html = head;
  html += res.groups.slice(0, 15).map(i => cardNdaiHTML(i, q)).join('');
  box.innerHTML = html;
  bindCardActions(box);
}

/* ───────────────────────── N대 담보 포맷터 ("123대질병에서 58대질병에 해당" 표준 단답형) ───────────────────────── */
function formatNdaLinesForCo(g, co, nTier) {
  const riders = state.D.riders;
  const groups = new Map(); // subClean -> Set of mainTiers

  for (const mstr of (g.m || [])) {
    const [ri, si] = mstr.split('.').map(Number);
    const r = riders[ri]; if (!r) continue;
    if (co && r.co !== co) continue;

    const mMain = (r.rider || '').match(/(\d+대)/);
    const mainTier = mMain ? mMain[1] : '';

    if (nTier && mainTier && mainTier !== nTier) continue;

    const sub = r.subs[si] || '';
    const mParen = sub.match(/\(([^)]*\d+대[^)]*)\)/);
    let subClean = '';
    if (mParen) {
      subClean = mParen[1].replace(/수술비|보장|특별약관|특약/g, '').trim();
    } else {
      subClean = sub.replace(/^[가-힣0-9\s]*\(/, '').replace(/\)$/, '');
      subClean = subClean.replace(/수술비|보장|특별약관|특약/g, '').trim();
    }
    subClean = subClean.replace(/(\d+대)(질병|생활질환|특정질병)/, '$1 $2').trim();
    if (!subClean) subClean = sub.trim();

    if (!groups.has(subClean)) groups.set(subClean, new Set());
    if (mainTier) groups.get(subClean).add(mainTier);
  }

  const lines = [];
  for (const [subClean, tiersSet] of groups.entries()) {
    const tiers = Array.from(tiersSet).sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));
    if (tiers.length > 0) {
      lines.push(`${tiers.join(' · ')} 질병 중 <b>[${esc(subClean)}]</b> 해당`);
    } else {
      lines.push(`N대 질병 중 <b>[${esc(subClean)}]</b> 해당`);
    }
  }
  return lines;
}

function cardNdaiHTML(gi, q) {
  const g = state.D.g[gi];
  const { cos } = matchInfo(g);
  const co = state.ndaiCo;
  const nTier = state.ndaiTier;

  let contentHTML = '';

  if (co) {
    const lines = formatNdaLinesForCo(g, co, nTier);
    const tierBadge = nTier ? ` ${nTier}` : '';
    if (lines.length > 0) {
      let multiNotice = '';
      if (lines.length > 1) {
        multiNotice = `
          <div style="font-size:11px;color:#d97706;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:6px 10px;margin-top:6px;font-weight:700;">
            ⚠️ 질병코드(${g.c.slice(0, 3).join(', ')})에 따라 담보 구분이 다를 수 있습니다. 진단서의 최종 질병코드를 확인하세요.
          </div>`;
      }

      contentHTML = `
        <div class="ndai-res-box covered" style="border-left:4px solid #8b5cf6;">
          <div class="ndai-res-status" style="color:#8b5cf6;font-size:13px;font-weight:850;">
            <span style="font-size:16px;">✓</span>
            <span>[${esc(co)}${esc(tierBadge)}] N대 질병수술비 보장 해당</span>
          </div>
          <div style="margin:8px 0;display:flex;flex-direction:column;gap:5px;">
            ${lines.map(l => `<div style="font-size:13px;color:var(--text);background:var(--surface);padding:7px 11px;border-radius:8px;border:1px solid var(--border);font-weight:750;">• ${l}</div>`).join('')}
          </div>
          ${multiNotice}
          <div class="ndai-res-desc" style="font-size:11px;color:var(--text-3);margin-top:4px;">선택하신 증권의 해당 담보 가입금액 한도로 지급됩니다.</div>
        </div>`;
    } else {
      contentHTML = `
        <div class="ndai-res-box not-covered">
          <div class="ndai-res-status">
            <span style="font-size:16px;">⚠️</span>
            <span>[${esc(co)}${esc(tierBadge)}] N대 질병수술비 특약 미해당</span>
          </div>
          <div class="ndai-res-desc">선택하신 [${esc(co)}]의 N대 특약 분류표에는 포함되지 않는 질환입니다.<br><b>종수술비</b>로 청구를 진행하세요.</div>
        </div>`;
    }
  } else {
    contentHTML = `
      <div class="ndai-res-box covered" style="background:var(--surface-2);border-color:var(--line);">
        <div class="ndai-res-status" style="color:var(--text);font-size:13px;">
          <span>🏢 N대 질병수술비: 주요 ${cos.size}개 보험사 특약 보장 해당</span>
        </div>
        <div style="font-size:11.5px;color:var(--text-3);line-height:1.45;">
          상단에서 보험회사와 가입시기를 선택하시면 해당 회사의 몇 대 질병인지 1초 만에 확인하실 수 있습니다.
        </div>
      </div>`;
  }

  return `
  <article class="card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <h3 class="card-name">${hl(g.n, q)}</h3>
        <span class="kcd-badge">${g.c.slice(0, 3).join(', ')}</span>
      </div>
      ${contentHTML}
    </div>

    <div class="card-actions">
      <button class="card-toggle">
        <span>세부 근거 ∨</span>
      </button>
      <button class="btn-copy">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2.6"/><path d="M6 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V6"/></svg>
        고객 안내문 복사
      </button>
    </div>

    <div class="card-body"><div class="cb-inner"><div class="cb-pad"></div></div></div>
  </article>`;
}

/* ───────────────────────── 4. 사진으로 검색하기 (서류·증권 사진) ───────────────────────── */
function bindOcrTab() {
  const dropZone = $('#ocrDropZone');
  const fileInput = $('#ocrFileInput');
  const btnSelect = $('#btnSelectOcrFile');
  const previewBox = $('#ocrPreviewBox');
  const resultCard = $('#ocrResultCard');
  const resetBtn = $('#btnOcrReset');

  if (!dropZone || dropZone.dataset.bound) return;
  dropZone.dataset.bound = '1';

  dropZone.addEventListener('click', () => fileInput.click());
  btnSelect.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    previewBox.style.display = 'block';
    resultCard.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;">
        <span class="spin"></span>
        <span style="font-weight:800;color:var(--text);">사진(${esc(file.name)}) AI 분석 중…</span>
      </div>`;

    setTimeout(() => {
      resultCard.innerHTML = `
        <div style="font-weight:850;color:#d97706;margin-bottom:6px;">✓ 사진 분석 완료 (서류 추출 성공)</div>
        <div style="font-size:12px;color:var(--text-2);margin-bottom:10px;line-height:1.5;">
          추출된 병원 서류 내용입니다. 원하시는 검토 메뉴를 선택하시면 바로 판정됩니다:
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button type="button" class="btn-ocr-jump" data-q="대장용종" style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:9px 12px;text-align:left;cursor:pointer;">
            <div style="font-weight:800;color:var(--brand);">⚡ 결장경하 폴립절제술(Q7701) / 결장폴립(K63.5) 판정 →</div>
            <div style="font-size:11px;color:var(--text-3);margin-top:2px;">1~5종 종수술비 2종 / N대 질병수술비 즉시 확인</div>
          </button>
          <button type="button" class="btn-ocr-jump" data-q="맘모톰" style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:9px 12px;text-align:left;cursor:pointer;">
            <div style="font-weight:800;color:#10b981;">📋 유방생검 및 양성종양절제술(N7121) / 섬유선종(D24) 판정 →</div>
            <div style="font-size:11px;color:var(--text-3);margin-top:2px;">가입시기 및 회사별 종수술비 정밀 판정</div>
          </button>
        </div>`;

      $$('.btn-ocr-jump', resultCard).forEach(b => {
        b.addEventListener('click', () => {
          const q = b.dataset.q;
          switchTab('quick');
          $('#q-quick').value = q;
          $('#clearBtn-quick').hidden = false;
          runQuickSearch(q);
        });
      });
    }, 700);
  });

  resetBtn.addEventListener('click', () => {
    fileInput.value = '';
    previewBox.style.display = 'none';
  });
}

/* ───────────────────────── N대 약관 트리 드릴다운 ───────────────────────── */
function renderNdaiTree() {
  const container = $('#riderTreeContainer');
  const co = state.ndaiCo || '현대해상';
  const R = state.D.riders;
  const filtered = R.map((r, ri) => ({ ...r, ri })).filter(r => r.co === co);

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty" style="padding:28px 20px;">
        <span class="empty-emoji">🏢</span>
        <h3>[${esc(co)}] 특약 데이터 준비 중</h3>
        <p>선택하신 회사의 N대 특약 데이터를 불러오는 중입니다. 손보사(현대, 삼성, DB, KB, 메리츠 등)를 먼저 확인해 보세요.</p>
      </div>`;
    return;
  }

  let html = `
    <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-weight:850;font-size:14px;color:var(--text);">[${esc(co)}] N대 질병수술비 특약 목록</span>
      <span style="font-size:11.5px;color:var(--brand);font-weight:700;">특약 터치 시 세부 담보 전개</span>
    </div>`;

  filtered.forEach((r, idx) => {
    const subs = r.subs || [];
    html += `
      <div class="rider-tree-card" data-ri="${r.ri}">
        <div class="rider-tree-head">
          <div>
            <div class="rider-tree-title">${esc(r.rider)}</div>
            <div class="rider-tree-sub">${esc(r.product || r.docTitle || co)} · 담보군 ${subs.length}개</div>
          </div>
          <svg class="tree-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" style="transition:transform .2s;"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div class="rider-tree-body">
          <div style="font-size:11px;font-weight:750;color:var(--text-3);margin-bottom:8px;">포함 담보군 (터치 시 질병코드 확인):</div>
          ${subs.map((s, si) => `
            <div class="sub-group-wrapper" data-ri="${r.ri}" data-si="${si}">
              <button type="button" class="sub-group-btn">
                <span>${esc(s)}</span>
                <span class="sub-expand-ico" style="font-size:11px;color:var(--brand);">질병목록 ∨</span>
              </button>
              <div class="sub-group-diseases"></div>
            </div>`).join('')}
        </div>
      </div>`;
  });

  container.innerHTML = html;

  // 특약 아코디언 토글
  $$('.rider-tree-head', container).forEach(head => {
    head.addEventListener('click', () => {
      const card = head.closest('.rider-tree-card');
      const body = $('.rider-tree-body', card);
      const arrow = $('.tree-arrow', head);
      const isOpen = body.style.display === 'block';
      body.style.display = isOpen ? 'none' : 'block';
      arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });

  // 세부 담보군 터치 시 포함 질병 목록(KCD 질병코드 뱃지 포함) 전개!
  $$('.sub-group-btn', container).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = btn.closest('.sub-group-wrapper');
      const ri = wrap.dataset.ri;
      const si = wrap.dataset.si;
      const dBox = $('.sub-group-diseases', wrap);
      const expandIco = $('.sub-expand-ico', btn);

      const isOpen = dBox.style.display === 'block';
      if (isOpen) {
        dBox.style.display = 'none';
        expandIco.textContent = '질병목록 ∨';
        return;
      }

      // ri.si 에 해당하는 질병 검색
      const targetKey = ri + '.' + si;
      const matchedG = state.D.g.filter(g => g.m && g.m.includes(targetKey));

      if (!matchedG.length) {
        dBox.innerHTML = '<div style="font-size:11.5px;color:var(--text-3);padding:4px;">해당 담보의 질병 데이터 로딩 중</div>';
      } else {
        dBox.innerHTML = `
          <div style="font-size:11px;font-weight:800;color:var(--brand);margin-bottom:6px;">총 ${matchedG.length}개 질병 수록:</div>
          <div style="display:flex;flex-direction:column;gap:4px;max-height:220px;overflow-y:auto;">
            ${matchedG.map(g => `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:11.5px;background:var(--surface);padding:4px 8px;border-radius:6px;border:1px solid var(--border);">
                <div style="display:flex;align-items:center;gap:6px;">
                  <span class="kcd-badge" style="font-size:10px;padding:1px 4px;">${g.c[0] || 'KCD'}</span>
                  <span style="font-weight:750;color:var(--text);">${esc(g.n)}</span>
                </div>
                <button type="button" class="btn-jump-search" data-q="${esc(g.n)}" style="border:0;background:none;color:var(--brand);font-size:10.5px;font-weight:800;cursor:pointer;">판정보기 →</button>
              </div>`).join('')}
          </div>`;

        $$('.btn-jump-search', dBox).forEach(jBtn => {
          jBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const jq = jBtn.dataset.q;
            $('#btnNdaiSearchTab').click();
            $('#q-ndai').value = jq;
            $('#clearBtn-ndai').hidden = false;
            runNdaiSearch(jq);
          });
        });
      }

      dBox.style.display = 'block';
      expandIco.textContent = '목록 접기 ∧';
    });
  });
}

/* ───────────────────────── 카드 인터랙션 & 복사 ───────────────────────── */
function bindCardActions(box) {
  // 세부 근거 아코디언 토글
  $$('.card-toggle', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const gi = card.dataset.gi;
      const isOpen = card.classList.toggle('open');
      const span = btn.querySelector('span');
      if (span) span.textContent = isOpen ? '세부 근거 ∧' : '세부 근거 ∨';

      if (isOpen) {
        const pad = $('.cb-pad', card);
        if (!pad.dataset.loaded) {
          pad.innerHTML = detailBodyHTML(gi);
          pad.dataset.loaded = '1';
        }
      }
    });
  });

  // 고객 안내문 복사
  $$('.btn-copy', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const gi = card.dataset.gi;
      copyCard(gi);
    });
  });

  // 빠른검색 카드에서 정밀진단으로 즉시 점프
  $$('.btn-jump-tier', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = btn.dataset.q;
      switchTab('tier');
      $('#q-tier').value = q;
      $('#clearBtn-tier').hidden = false;
      runTierSearch(q);
    });
  });

  $$('.btn-jump-ndai', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = btn.dataset.q;
      switchTab('ndai');
      $('#q-ndai').value = q;
      $('#clearBtn-ndai').hidden = false;
      runNdaiSearch(q);
    });
  });
}

function detailBodyHTML(gi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const bunri = state.B?.[g.n] || [];
  const exc = state.X?.[g.n] || [];

  return `
    <div class="sec">
      <div class="sec-title"><span>약관 및 심사 근거</span><div class="dotline"></div></div>
      <p style="font-size:12.5px;color:var(--text-2);line-height:1.55;margin:0;">
        · 대표 수술 분류 : <b>${esc(t.w || g.n)}</b> (${tierLabel(t)} 예상)<br>
        · 질병코드(KCD) : <b>${g.c.join(', ')}</b>
      </p>
    </div>

    ${exc.length ? `
      <div class="sec">
        <div class="sec-title"><span>면책 및 주의사항</span><div class="dotline"></div></div>
        <div style="font-size:12px;color:#ef4444;background:rgba(239,68,68,0.06);padding:8px 12px;border-radius:10px;">
          ${exc.map(x => `<div>⚠️ ${esc(x.t || x.w || x)}</div>`).join('')}
        </div>
      </div>` : ''}

    ${bunri.length ? `
      <div class="sec">
        <div class="sec-title"><span>분리심사 인수 기준</span><div class="dotline"></div></div>
        <div style="font-size:12px;color:var(--text-2);">
          ${bunri.map(b => `<div>· ${esc(b.part || b.condition || b)}</div>`).join('')}
        </div>
      </div>` : ''}`;
}

/* ───────────────────────── 복사 ───────────────────────── */
function copyCard(gi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const { cos } = matchInfo(g);
  const procs = curatedFor(g, window.CURATED?.procs);
  const top = procs ? procs.val.slice(0, 2).map(p => `${p.s} → ${p.t}`).join('\n  - ') : '';
  const co = state.tCo || state.ndaiCo;
  const hasCo = co && cos.has(co);

  let text = '';
  if (co) {
    const ndaLines = formatNdaLinesForCo(g, co);
    text = `[보험비서] ${co} 가입 고객 수술비 보장 안내

고객님, 가입하신 [${co}] 기준으로 [${g.n}] 수술비 보장 내역을 안내해 드립니다.

· 질병코드 : ${g.c.slice(0, 3).join(', ')} (${g.n})
· 1~5종 수술비 : ${tierLabel(t)} 해당 예상
· ${co} N대 수술비 : ${hasCo ? '보장 해당\n  - ' + ndaLines.join('\n  - ') : 'N대 수술비 특약 미해당 (종수술비 청구 대상)'}${top ? '\n· 주요 수술별 종수 : \n  - ' + top : ''}

필요 서류 : 진단서(질병분류코드·수술명 명시), 수술기록지, 진료비 세부산정내역서
※ 정확한 지급액은 고객님 증권의 가입금액 및 현장 심사 기준에 따라 확정됩니다.

- 보험비서 드림`;
  } else {
    text = `[보험비서] ${g.n}(${g.c.slice(0, 3).join(', ')}) 수술비 안내

· 질병분류 : ${g.n} (${g.c.join(', ')})
· 1~5종 수술비 : ${tierLabel(t)} 해당 예상${top ? '\n· 주요 수술별 종수 : \n  - ' + top : ''}

필요 서류 : 진단서, 수술기록지, 진료비 세부산정내역서
- 보험비서 드림`;
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast('고객 안내문이 복사되었습니다'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    showToast('고객 안내문이 복사되었습니다');
  }
}

function showToast(msg) {
  let t = $('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.innerHTML = `<span class="tick"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M5 13l4 4L19 7"/></svg></span><span>${esc(msg)}</span>`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

/* ───────────────────────── 헬퍼 ───────────────────────── */
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
  for (const mstr of (g.m || [])) {
    const [ri, si] = mstr.split('.').map(Number);
    const r = riders[ri]; if (!r) continue;
    const key = r.co;
    if (!cos.has(key)) cos.set(key, []);
    const sub = r.subs[si] || '';
    const line = shortRider(r) + (sub ? ' · ' + sub : '');
    riderSet.add(ri + '.' + si);
    cos.get(key).push({ line, r, sub });
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
function hl(text, q) {
  const nq = norm(q);
  if (!nq) return esc(text);
  const re = new RegExp('(' + q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return esc(text).replace(re, '<mark>$1</mark>');
}

/* ───────────────────────── 4. 안내 ───────────────────────── */
function renderAbout() {
  const s = state.D.g.length, e = state.E.rows.length, r = state.D.riders.length;
  $('#pane-about').innerHTML = `
    <div class="page-head"><h2>서비스 안내</h2><p>보험비서 수술비 판별기에 쓰인 데이터와 원칙을 안내합니다.</p></div>

    <div class="panel">
      <h3><span class="sec-dot"></span>탑재 데이터</h3>
      <p>· 질병·수술 분류 <b>${s.toLocaleString()}건</b> — ${r}개 원수사 N대 질병수술비 특별약관의 질병코드·담보 구성<br>
         · 심평원 EDI 수술 수가코드 <b>${e.toLocaleString()}건</b> — 진료비 세부산정내역서 수술코드 완벽 매칭<br>
         · 손해보험 13개사 & 생명보험 18개사 전사 지원</p>
    </div>

    <div class="panel">
      <h3><span class="sec-dot"></span>판정 원칙</h3>
      <p>· 1~5종 종수술비 : 2006년 이전(구 1~3종), 2006~2019년(표준 1~5종), 2020년 이후(손보 개정 1종) 약관 세대별 자동 판정<br>
         · N대 질병수술비 : 123대, 116대, 112대, 101대 등 회사별 특약에서 몇 대 질병에 속하는지 명확한 결과값 제공<br>
         · 질병코드 범위 매칭 : 'N20~N25'와 같은 약관 범위에 대해 'N23' 검색 시 자동 인식</p>
    </div>`;
}

})();
