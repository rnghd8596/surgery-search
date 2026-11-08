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

/* ───────────────────────── 회사 약칭 & 자동 감지 매핑 (전사 31개사 및 패밀리) ───────────────────────── */
const COMPANY_FAMILIES = [
  { key: 'db', name: 'DB', sonbo: 'DB손해보험', saengbo: 'DB생명' },
  { key: '디비', name: 'DB', sonbo: 'DB손해보험', saengbo: 'DB생명' },
  { key: '동부', name: 'DB', sonbo: 'DB손해보험', saengbo: 'DB생명' },
  { key: '삼성', name: '삼성', sonbo: '삼성화재', saengbo: '삼성생명' },
  { key: '한화', name: '한화', sonbo: '한화손해보험', saengbo: '한화생명' },
  { key: 'kb', name: 'KB', sonbo: 'KB손해보험', saengbo: 'KB라이프생명' },
  { key: '케이비', name: 'KB', sonbo: 'KB손해보험', saengbo: 'KB라이프생명' },
  { key: '흥국', name: '흥국', sonbo: '흥국화재', saengbo: '흥국생명' },
  { key: '농협', name: '농협', sonbo: 'NH농협손해보험', saengbo: 'NH농협생명' },
  { key: 'nh', name: 'NH', sonbo: 'NH농협손해보험', saengbo: 'NH농협생명' },
  { key: '하나', name: '하나', sonbo: '하나손해보험', saengbo: '하나생명' },
  { key: '라이나', name: '라이나', sonbo: '라이나손해보험', saengbo: '라이나생명' }
];

const COMPANY_ALIASES = [
  // 손해보험 (13개사)
  { name: '현대해상', type: 'sonbo', keys: ['현대해상', '현대', '현해', '현손'] },
  { name: '삼성화재', type: 'sonbo', keys: ['삼성화재', '삼화', '삼성화'] },
  { name: 'DB손해보험', type: 'sonbo', keys: ['db손해보험', 'db손보', '디비손해보험', '디비손보', '디손', '디비손해', '동부화재', '동부손보'] },
  { name: 'KB손해보험', type: 'sonbo', keys: ['kb손해보험', 'kb손보', '케이비손보', '케손', '크손', '케이손', 'kb손'] },
  { name: '메리츠화재', type: 'sonbo', keys: ['메리츠화재', '메리츠', '멜츠', '메화'] },
  { name: '한화손해보험', type: 'sonbo', keys: ['한화손해보험', '한화손보', '한손', '한화손'] },
  { name: '흥국화재', type: 'sonbo', keys: ['흥국화재', '흥화', '흥국화'] },
  { name: '롯데손해보험', type: 'sonbo', keys: ['롯데손해보험', '롯데손보', '롯손', '롯화', '롯데'] },
  { name: 'NH농협손해보험', type: 'sonbo', keys: ['농협손해보험', '농협손보', '농손', 'nh손보', 'nh농협손보', '엔손'] },
  { name: '하나손해보험', type: 'sonbo', keys: ['하나손해보험', '하나손보', '하손'] },
  { name: 'MG손해보험', type: 'sonbo', keys: ['mg손해보험', 'mg손보', '엠손', '엠지손보', '엠지'] },
  { name: 'AIG손해보험', type: 'sonbo', keys: ['aig손해보험', 'aig손보', '에이아이지', '아이지손보'] },
  { name: '라이나손해보험', type: 'sonbo', keys: ['라이나손해보험', '라이나손보', '라손', '에이스손보', '처브'] },

  // 생명보험 (18개사)
  { name: '삼성생명', type: 'saengbo', keys: ['삼성생명', '삼생'] },
  { name: '한화생명', type: 'saengbo', keys: ['한화생명', '한생', '대한생명'] },
  { name: '교보생명', type: 'saengbo', keys: ['교보생명', '교보', '교생'] },
  { name: '신한라이프', type: 'saengbo', keys: ['신한라이프', '신라', '신한생명', '신생', '오렌지라이프', '오렌지'] },
  { name: 'KB라이프생명', type: 'saengbo', keys: ['kb라이프생명', 'kb라이프', '케이비라이프', '케라', '케생', '크생', '크라', '푸르덴셜', 'kb생명'] },
  { name: '동양생명', type: 'saengbo', keys: ['동양생명', '동양', '동생'] },
  { name: '미래에셋생명', type: 'saengbo', keys: ['미래에셋생명', '미래에셋', '미생', '미래생명', '미생명'] },
  { name: 'DB생명', type: 'saengbo', keys: ['db생명', '디비생명', '디생', '동부생명'] },
  { name: '흥국생명', type: 'saengbo', keys: ['흥국생명', '흥생'] },
  { name: '라이나생명', type: 'saengbo', keys: ['라이나생명', '라이나', '라생'] },
  { name: '메트라이프생명', type: 'saengbo', keys: ['메트라이프생명', '메트라이프', '메라', '멧라', '메트'] },
  { name: 'AIA생명', type: 'saengbo', keys: ['aia생명', 'aia', '에이아이에이', '아아생'] },
  { name: '하나생명', type: 'saengbo', keys: ['하나생명', '하생'] },
  { name: 'ABL생명', type: 'saengbo', keys: ['abl생명', 'abl', '에이비엘', '아블', '알리안츠'] },
  { name: 'NH농협생명', type: 'saengbo', keys: ['농협생명', '농생', 'nh생명', 'nh농협생명', '엔생'] },
  { name: 'iM라이프', type: 'saengbo', keys: ['im라이프', 'dgb생명', '아라', '아임', '디라', 'dgb'] },
  { name: 'KDB생명', type: 'saengbo', keys: ['kdb생명', 'kdb', '케디생', '금호생명'] },
  { name: 'IBK연금보험', type: 'saengbo', keys: ['ibk연금보험', 'ibk연금', '기업은행연금', '아백연금'] }
];

const ALL_SPECIFIC_COMPANY_KEYS = [];
COMPANY_ALIASES.forEach(ca => {
  ca.keys.forEach(k => {
    ALL_SPECIFIC_COMPANY_KEYS.push({ key: k, ca });
  });
});
ALL_SPECIFIC_COMPANY_KEYS.sort((a, b) => b.key.length - a.key.length);

const ALL_FAMILY_KEYS = [...COMPANY_FAMILIES].sort((a, b) => b.key.length - a.key.length);

function normalizeYear(yStr) {
  let y = parseInt(yStr, 10);
  if (y < 100) {
    y += (y <= 30) ? 2000 : 1900;
  }
  return y;
}

/* ───────────────────────── 스마트 질의 파서 (순서·붙여쓰기 완전 자유) ───────────────────────── */
function parseSmartQuery(raw) {
  if (!raw) return { cleanQ: '', co: null, cos: [], family: null, coType: null, gen: null, year: null, month: null, ntier: '' };

  let text = String(raw).trim();
  let foundYear = null;
  let foundMonth = null;
  let foundGen = null;
  let foundNtier = '';
  let foundCo = null;
  let foundCos = [];
  let foundFamily = null;
  let foundCoType = null;

  // 1. N대 특약 숫자 추출 (어느 위치에 있든 123대, 112대 등 검출)
  const mNtier = text.match(/(\d+대)/);
  if (mNtier) {
    foundNtier = mNtier[1];
    text = text.replace(mNtier[0], ' ');
  }

  // 2. 가입시기 추출 (연도 + 월, 연도만, 4자리 YYYY, 2103 등 순서 및 위치 무관)
  let mDate = text.match(/((?:19|20)?\d{2})년\s*([01]?\d)월?/);
  if (mDate) {
    foundYear = normalizeYear(mDate[1]);
    if (mDate[2]) foundMonth = parseInt(mDate[2], 10);
    text = text.replace(mDate[0], ' ');
  } else {
    mDate = text.match(/((?:19|20)?\d{2})년/);
    if (mDate) {
      foundYear = normalizeYear(mDate[1]);
      text = text.replace(mDate[0], ' ');
    } else {
      mDate = text.match(/((?:19|20)?\d{2})[.\-\/]\s*([01]?\d)/);
      if (mDate) {
        foundYear = normalizeYear(mDate[1]);
        foundMonth = parseInt(mDate[2], 10);
        text = text.replace(mDate[0], ' ');
      } else {
        mDate = text.match(/(?<!\d)(19\d{2}|20\d{2})(0[1-9]|1[0-2])(?!\d)/);
        if (mDate) {
          foundYear = parseInt(mDate[1], 10);
          foundMonth = parseInt(mDate[2], 10);
          text = text.replace(mDate[0], ' ');
        } else {
          mDate = text.match(/(?<![A-Za-z0-9가-힣])(\d{2})(0[1-9]|1[0-2])(?![A-Za-z0-9가-힣])/);
          if (mDate) {
            const yy = parseInt(mDate[1], 10);
            if (yy <= 30 || yy >= 80) {
              foundYear = normalizeYear(mDate[1]);
              foundMonth = parseInt(mDate[2], 10);
              text = text.replace(mDate[0], ' ');
            }
          } else {
            mDate = text.match(/(?<![A-Za-z])(19\d{2}|20\d{2})(?![A-Za-z0-9])/);
            if (mDate) {
              foundYear = parseInt(mDate[1], 10);
              text = text.replace(mDate[0], ' ');
            }
          }
        }
      }
    }
  }

  if (foundYear !== null) {
    foundGen = foundYear >= 2020 ? 'recent' : (foundYear >= 2006 ? 'std' : 'old');
  } else {
    if (/(2006년?\s*이전|구종수|구1~3종)/i.test(text)) {
      foundGen = 'old';
      text = text.replace(/(2006년?\s*이전|구종수|구1~3종)/gi, ' ');
    } else if (/(2006\s*~?\s*2019|표준)/i.test(text)) {
      foundGen = 'std';
      text = text.replace(/(2006\s*~?\s*2019년?|표준)/gi, ' ');
    } else if (/(2020년?\s*이후|최근|개정)/i.test(text)) {
      foundGen = 'recent';
      text = text.replace(/(2020년?\s*이후|최근|개정)/gi, ' ');
    }
  }

  // 3. 보험사 검출 (구체적 단일 회사 우선 매칭 -> 없으면 생·손보 패밀리 매칭)
  const lowerText = text.toLowerCase();
  for (const item of ALL_SPECIFIC_COMPANY_KEYS) {
    const idxMatch = lowerText.indexOf(item.key.toLowerCase());
    if (idxMatch >= 0) {
      foundCo = item.ca.name;
      foundCos = [item.ca.name];
      foundCoType = item.ca.type;
      text = text.slice(0, idxMatch) + ' ' + text.slice(idxMatch + item.key.length);
      break;
    }
  }

  if (!foundCo) {
    for (const fam of ALL_FAMILY_KEYS) {
      const idxMatch = lowerText.indexOf(fam.key.toLowerCase());
      if (idxMatch >= 0) {
        foundFamily = fam;
        foundCo = fam.sonbo;
        foundCos = [fam.sonbo, fam.saengbo];
        foundCoType = 'family';
        text = text.slice(0, idxMatch) + ' ' + text.slice(idxMatch + fam.key.length);
        break;
      }
    }
  }

  // 불필요한 조사나 군더더기 단어 제거 (이후, 이전, 수술비, 보험, 특약, 청구)
  text = text.replace(/(이후|이전|수술비|보험|특약|청구)/g, ' ');

  const cleanQ = text.replace(/\s+/g, ' ').trim();

  return {
    cleanQ,
    co: foundCo,
    cos: foundCos,
    family: foundFamily,
    coType: foundCoType,
    gen: foundGen,
    year: foundYear,
    month: foundMonth,
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
  tab: 'home',        // 'home' | 'quick' | 'tier' | 'ndai' | 'ocr' | 'about'
  quickQ: '',
  tierQ: '',
  ndaiQ: '',
  tGen: 'recent',     // 'recent' (2020년 이후) | 'old' (2020년 이전)
  tYear: null,        // e.g. 2021 or null
  tMonth: null,       // e.g. 3 or null
  tCo: '',            // company for tier
  tCos: [],           // multi-select companies for tier
  tDateTouched: false,
  tCoTouched: false,
  ndaiGen: 'recent',  // 'recent' (2020년 이후) | 'old' (2020년 이전)
  ndaiYear: null,     // e.g. 2021 or null
  ndaiCo: '',         // company for ndai
  ndaiCos: [],        // multi-select companies for ndai
  ndaiTier: '',       // e.g. '123대', '112대' or ''
  ndaiDateTouched: false,
  ndaiCoTouched: false,
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
  idx.name = [];
  D.g.forEach((g, i) => {
    const names = [g.n].concat(g.vs || []);
    names.forEach(name => {
      const nn = norm(name);
      const ch = getChosung(name);
      idx.name.push({ i, nn, ch, l: nn.length, isMain: name === g.n });
    });
  });

  idx.syn = (window.CURATED?.synonyms || []).map(s => {
    const qList = Array.isArray(s.q) ? s.q : [s.q];
    const allKeys = qList.concat(s.aliases || []).concat(s.k ? [s.k] : []).map(norm).filter(Boolean);
    return {
      ...s,
      keys: Array.from(new Set(allKeys)),
    };
  });

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

  $$('.quick-shortcut-banner[data-go]').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.go));
  });

  $('#logoBtn').addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('home');
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

  if ($('#pane-home')) $('#pane-home').hidden = tabKey !== 'home';
  $('#pane-quick').hidden = tabKey !== 'quick';
  $('#pane-tier').hidden = tabKey !== 'tier';
  $('#pane-ndai').hidden = tabKey !== 'ndai';
  $('#pane-ocr').hidden = tabKey !== 'ocr';
  if ($('#pane-about')) $('#pane-about').hidden = tabKey !== 'about';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (tabKey === 'home') {
    // 메인 홈 화면
  } else if (tabKey === 'quick') {
    $('#q-quick')?.focus();
  } else if (tabKey === 'tier') {
    $('#q-tier')?.focus();
    if (state.tierQ) runTierSearch(state.tierQ);
    else renderTierEmptyExample();
  } else if (tabKey === 'ndai') {
    if (state.ndaiMode === 'search') {
      $('#q-ndai')?.focus();
      if (state.ndaiQ) runNdaiSearch(state.ndaiQ);
      else renderNdaiEmptyExample();
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

  // 4. 별칭(synonyms) 광범위 정밀 매칭 (맘모톰, 인공관절, 유방, 대장용종 등)
  const matchingSyns = idx.syn.filter(s => s.keys.some(k => k === nq || nq.includes(k) || k.includes(nq)));
  matchingSyns.forEach(syn => {
    const targets = syn.main || syn.codes || [];
    targets.forEach((cp, rank) => {
      for (const code in state.D.codeIndex) {
        if (code === cp || code.startsWith(cp)) {
          state.D.codeIndex[code].forEach(i => add(i, 0.4 + rank * 0.05));
        }
      }
    });
  });

  // 5. 질병명 텍스트 매칭 (다중 단어 및 부분 매칭)
  const isCho = /^[ㄱ-ㅎ]+$/.test(nq);
  const terms = q.split(/\s+/).map(norm).filter(t => t.length > 0);

  idx.name.forEach(({ i, nn, ch }) => {
    if (isCho) {
      if (ch === nq) add(i, 2);
      else if (ch.startsWith(nq)) add(i, 3);
      return;
    }
    if (nn === nq) add(i, 0.2);
    else if (nn.startsWith(nq)) add(i, 1.0);
    else if (nn.includes(nq)) add(i, 1.5);
    else if (terms.length > 1) {
      const matchCount = terms.filter(t => nn.includes(t)).length;
      if (matchCount === terms.length) add(i, 1.2);
      else if (matchCount > 0) add(i, 2.5 + (terms.length - matchCount));
    }
  });

  // 6. EDI 수가명(수술명)에서도 역방향 질병 매칭 (예: '인공관절', '치환술' 등)
  idx.edi.forEach(r => {
    if (r.nn.includes(nq) || (nq.length >= 3 && nq.includes(r.nn))) {
      if (EDI_CODE_MAP[r.c]) {
        EDI_CODE_MAP[r.c].codes.forEach(tc => {
          for (const code in state.D.codeIndex) {
            if (code === tc || code.startsWith(tc)) {
              state.D.codeIndex[code].forEach(i => add(i, 1.0));
            }
          }
        });
      }
    }
  });

  let giEntries = [...scores.entries()];
  const gi = giEntries
    .sort((a, b) => a[1] - b[1] || (state.D.g[b[0]].m.length - state.D.g[a[0]].m.length))
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

  const primarySyn = matchingSyns.length > 0 ? matchingSyns[0] : null;
  return { groups: gi.map(([i]) => i), edi: ediHits.slice(0, MAX_EDI), syn: primarySyn, q, matchedEdi };
}

/* ───────────────────────── 1. 빠른 검색 ───────────────────────── */
function bindQuickTab() {
  const qQuickEl = $('#q-quick');
  qQuickEl.addEventListener('input', debounce(() => {
    const v = qQuickEl.value;
    state.quickQ = v;
    $('#clearBtn-quick').hidden = !v;
    if (!v.trim()) { renderIdleQuick(); return; }
    const parsed = parseSmartQuery(v);
    runQuickSearch(parsed.cleanQ || v, parsed);
  }, 70));

  $('#clearBtn-quick').addEventListener('click', () => {
    qQuickEl.value = ''; state.quickQ = ''; $('#clearBtn-quick').hidden = true; renderIdleQuick(); qQuickEl.focus();
  });

  // 검색창 아래 3대 바로가기 버튼 (종수술비, N대질병, 사진으로 검색)
  $$('.quick-shortcut-banner').forEach(btn => {
    btn.addEventListener('click', () => {
      const go = btn.dataset.go;
      switchTab(go);
    });
  });

  renderIdleQuick();
}

function runQuickSearch(q, parsed) {
  const res = search(q);
  const box = $('#results-quick');
  if (!res) { renderIdleQuick(); return; }

  let subInfo = '';
  if (parsed && (parsed.co || parsed.year || parsed.ntier)) {
    const parts = [];
    if (parsed.co) parts.push(`🏢 ${parsed.cos && parsed.cos.length > 1 ? parsed.cos.join(' · ') : parsed.co}`);
    if (parsed.year) parts.push(`📅 ${parsed.year}년`);
    if (parsed.ntier) parts.push(`🏷️ ${parsed.ntier}`);
    subInfo = `<div style="font-size:12px;font-weight:750;color:var(--brand);margin-top:3px;">[${parts.join(' · ')} 인식]</div>`;
  }

  const head = `
    <div class="res-head">
      <div>
        <div class="res-title"><em>${esc(q)}</em> 빠른 판정 결과</div>
        ${subInfo}
      </div>
      <div class="res-count">분류 ${res.groups.length}건</div>
    </div>`;

  if (!res.groups.length && !res.edi.length) {
    box.innerHTML = head + `
      <div class="empty">
        <span class="empty-emoji">🔍</span>
        <h3>“${esc(q)}”에 대한 결과가 없습니다</h3>
        <p>질병명 · 수술명 · 질병코드로 다시 검색해 보세요.</p>
      </div>`;
    return;
  }

  let html = head;
  html += res.groups.slice(0, 12).map(i => cardQuickHTML(i, q, res.matchedEdi, parsed)).join('');
  box.innerHTML = html;
  bindCardActions(box);
}

/* ───────────────────────── 초보 설계사 필수 주의 팁 (맘모톰, 백내장, 인공관절, 대장용종 등) ───────────────────────── */
function getBeginnerTips(g) {
  const codes = (g.c || []).map(c => c.toUpperCase());
  const tips = [];

  if (codes.some(c => c.startsWith('D24') || c.startsWith('N60') || c.startsWith('N63') || c.startsWith('C50'))) {
    tips.push({
      badge: '⚠️ 초보 필수 주의',
      color: '#d97706',
      bg: 'rgba(245,158,11,0.09)',
      border: 'rgba(245,158,11,0.3)',
      title: '생검(조직검사) vs 절제술 구분 필수',
      text: '단순 조직검사용 침생검(생검)은 수술비 비해당 또는 1종 소액 처리됩니다. 치료 목적의 “절제술” 단어가 수술확인서에 기재되었는지 꼭 확인하세요.'
    });
  }

  if (codes.some(c => c.startsWith('H25') || c.startsWith('H26'))) {
    tips.push({
      badge: '⚠️ 초보 필수 주의',
      color: '#d97706',
      bg: 'rgba(245,158,11,0.09)',
      border: 'rgba(245,158,11,0.3)',
      title: '양안 동시 수술 시 1회 지급 주의',
      text: '양쪽 눈을 같은 날 동시에 수술할 경우 약관상 1회만 지급되는 경우가 많습니다. 수술일자를 각각 달리하여 시행했는지 확인하세요.'
    });
  }

  if (codes.some(c => c.startsWith('M17') || c.startsWith('M16') || c.startsWith('M15'))) {
    tips.push({
      badge: '⚠️ 초보 필수 주의',
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.08)',
      border: 'rgba(37,99,235,0.25)',
      title: '치환술(4종) vs 세척술(3종) 종수 확인',
      text: '인공관절 전치환술(4종)과 관절경 세척·활액막 절제(3종)는 종수가 완전히 다릅니다. 수술기록지에 삽입물(인공관절) 치환 여부를 확인하세요.'
    });
  }

  if (codes.some(c => c.startsWith('K63') || c.startsWith('D12') || c.startsWith('K62'))) {
    tips.push({
      badge: '⚠️ 초보 필수 주의',
      color: '#059669',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.25)',
      title: '2020년 이후 개정 약관(1종) 확인',
      text: '표준약관은 2종이나, 2020년 이후 메리츠·롯데 등 일부 손보사는 1종으로 하향 개정되었습니다. 고객 증권의 가입시기를 꼭 확인하세요.'
    });
  }

  return tips;
}

function renderIdleQuick() {
  const box = $('#results-quick');
  if (!box) return;

  const frequentItems = [
    { title: '대장용종 절제술', sub: 'K63.5 · Q7701 (2종 / 개정 1종)', query: '대장용종', badge: '2종', badgeBg: '#2563eb' },
    { title: '백내장 수정체수술', sub: 'H25/H26 · 초음파유화술 (1종)', query: '백내장', badge: '1종', badgeBg: '#059669' },
    { title: '맘모톰 (유방절제)', sub: 'D24 · N60 (2종 / 단순생검 제외)', query: '맘모톰', badge: '2종', badgeBg: '#2563eb' },
    { title: '자궁근종 절제술', sub: 'D25 · 복강경·개복·하이푸 (2~3종)', query: '자궁근종', badge: '2~3종', badgeBg: '#7c3aed' },
    { title: '무릎 인공관절치환', sub: 'M17 · 전치환술 (4종 / 세척 3종)', query: '인공관절', badge: '4종', badgeBg: '#dc2626' },
    { title: '치핵 · 치루 근치술', sub: 'K60~K64 · 외과적 치핵절제 (1종)', query: '치핵', badge: '1종', badgeBg: '#059669' },
    { title: '요로결석 쇄석술', sub: 'N20~N23 · 체외충격파쇄석 (2종)', query: '요로결석', badge: '2종', badgeBg: '#2563eb' },
    { title: '복강경 담낭절제술', sub: 'K80 · 담석증 담낭적출 (3종)', query: '담낭절제', badge: '3종', badgeBg: '#ea580c' },
    { title: '척추 디스크 감압술', sub: 'M51 · 신경감압·수핵절제 (3종)', query: '추간판', badge: '3종', badgeBg: '#ea580c' },
    { title: '하지정맥류 레이저', sub: 'I83 · 광범위정맥류발거 (2종)', query: '하지정맥류', badge: '2종', badgeBg: '#2563eb' }
  ];

  box.innerHTML = `
    <div style="margin-top:14px;animation:fadeIn .25s ease;">
      <!-- 다빈도 질병 바로검색 그리드 -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <span style="font-size:12px;font-weight:900;color:var(--brand);background:rgba(26,115,232,0.1);padding:4px 10px;border-radius:6px;">🔥 다빈도 질병 · 수술 바로검색</span>
        <span style="font-size:11px;color:var(--text-3);font-weight:700;">누르면 즉시 결과가 나와요</span>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;" id="quickFrequentGrid">
        ${frequentItems.map(item => `
          <button type="button" class="quick-freq-btn" data-q="${item.query}" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:11px 12px;text-align:left;display:flex;flex-direction:column;justify-content:space-between;gap:6px;cursor:pointer;transition:all .15s ease;-webkit-tap-highlight-color:transparent;">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
              <span style="font-size:13px;font-weight:850;color:var(--text);letter-spacing:-.01em;">${item.title}</span>
              <span style="background:${item.badgeBg};color:#fff;font-size:10.5px;font-weight:900;padding:2px 6px;border-radius:5px;flex-shrink:0;">${item.badge}</span>
            </div>
            <div style="font-size:11px;color:var(--text-3);letter-spacing:-.02em;line-height:1.3;">${item.sub}</div>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  box.querySelectorAll('.quick-freq-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      const qQuickEl = $('#q-quick');
      if (qQuickEl) qQuickEl.value = q;
      state.quickQ = q;
      $('#clearBtn-quick').hidden = false;
      const parsed = parseSmartQuery(q);
      runQuickSearch(parsed.cleanQ || q, parsed);
    });
  });
}


/* ───────────────────────── 회사별·시기별 약관 개정 판정 엔진 ───────────────────────── */
function parseCosList(coInput) {
  if (Array.isArray(coInput)) return coInput.map(s => String(s).trim()).filter(Boolean);
  if (typeof coInput === 'string' && coInput.trim()) {
    return coInput.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

const REVISION_RULES = [
  {
    id: 'hyundai_cancer_4tier',
    name: '현대해상 6대암 관혈근치수술 4종 하향 개정',
    match: (g) => (g.c || []).some(c => ['C73', 'C50', 'C53', 'C54', 'C61', 'C67'].some(target => c.startsWith(target))),
    standardTier: '5종',
    revisions: [
      {
        co: '현대해상',
        ym: 202604,
        label: '현대해상 2026.04 개정(질병수술Ⅳ)',
        matchKeys: ['현대', '현해']
      }
    ],
    evaluate: function(cosInput, year, month) {
      const cosList = parseCosList(cosInput);

      if (cosList.length === 0) {
        return {
          tier: '5종',
          hasDiff: true,
          diffBadge: '[현대해상 4종 주의]',
          note: '악성신생물 치료 목적의 관혈적 근치수술 5종 (단, 현대해상 2026년 개정약관은 4종 하향)',
          boxHTML: `
            <div style="background:var(--surface);border:1.5px solid rgba(239,68,68,0.3);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:12px;line-height:1.5;">
              <div style="font-weight:850;color:#dc2626;margin-bottom:3px;">🚨 현대해상 약관 개정 주의 (2026년 질병수술Ⅳ)</div>
              <div style="color:var(--text);font-size:11.5px;">
                • <b>현대해상 2026년 이전 계약 및 타사 전사</b> : 관혈적 근치수술 시 <b style="color:#2563eb;">5종 지급</b><br>
                • <b>현대해상 2026년 개정약관(질병수술Ⅳ)</b> : 6대 암(갑상선·유방·자궁·전립선·방광) 관혈수술 제1-2항 신설로 <b style="color:#dc2626;">4종으로 하향 지급</b>
              </div>
            </div>`
        };
      }

      if (cosList.length === 1) {
        const coStr = cosList[0];
        const normCo = coStr.toLowerCase();
        const isHyundai = ['현대', '현해'].some(k => normCo.includes(k));

        if (!isHyundai) {
          return {
            tier: '5종',
            hasDiff: false,
            note: `${coStr}는 관혈적 악성신생물 근치수술 5종 지급 (표준약관)`,
            boxHTML: ''
          };
        }

        const ymText = '2026년 4월';
        if (!year) {
          return {
            tier: '4·5종',
            hasDiff: true,
            diffBadge: '[가입시기별 상이]',
            note: '현대해상은 2026년 4월 개정(질병수술Ⅳ) 기점으로 5종 ➔ 4종 하향',
            boxHTML: `
              <div style="background:rgba(239,68,68,0.06);border:1.5px solid rgba(239,68,68,0.3);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:12px;line-height:1.5;">
                <div style="font-weight:850;color:#dc2626;margin-bottom:3px;">🚨 현대해상 가입시기별 종수 기준 (6대 암)</div>
                <div>• <b>2026년 이전 계약</b> ➔ <b style="color:#2563eb;">5종 지급</b> (관혈 근치수술)<br>• <b>2026년 개정약관(질병수술Ⅳ)</b> ➔ <b style="color:#dc2626;">4종 적용</b> (하향 개정)</div>
              </div>`
          };
        }

        const targetYm = year * 100 + (month || 12);
        if (targetYm >= 202604) {
          return {
            tier: '4종',
            hasDiff: true,
            diffBadge: '[개정약관 4종]',
            note: '현대해상 2026.04 개정약관(질병수술Ⅳ) 적용 (4종)',
            boxHTML: `
              <div style="background:rgba(239,68,68,0.06);border:1.5px solid rgba(239,68,68,0.3);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:12px;line-height:1.5;">
                <div style="font-weight:850;color:#dc2626;margin-bottom:3px;">✓ 현대해상 2026년 이후 개정약관 (4종 확정)</div>
                <div style="color:var(--text-2);">고객 가입 시점이 2026년 개정(질병수술Ⅳ) 이후이므로 4종에 해당합니다. (2026년 이전 계약은 5종)</div>
              </div>`
          };
        } else {
          return {
            tier: '5종',
            hasDiff: true,
            diffBadge: '[개정 이전 5종]',
            note: '현대해상 2026년 이전 계약으로 5종 지급',
            boxHTML: `
              <div style="background:rgba(37,99,235,0.06);border:1.5px solid rgba(37,99,235,0.3);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:12px;line-height:1.5;">
                <div style="font-weight:850;color:#2563eb;margin-bottom:3px;">✓ 현대해상 2026년 이전 계약 (5종 확정)</div>
                <div style="color:var(--text-2);">개정 전 가입 계약이므로 정상적으로 악성신생물 5종 수술비가 지급됩니다.</div>
              </div>`
          };
        }
      }

      const coResults = cosList.map(coName => {
        const normCo = coName.toLowerCase();
        const isHyundai = ['현대', '현해'].some(k => normCo.includes(k));
        if (!isHyundai) {
          return {
            co: coName,
            tier: '5종',
            note: '표준 1~5종 5종 유지'
          };
        }
        if (!year) {
          return {
            co: coName,
            tier: '4·5종',
            note: '2026년 이전 5종 / 2026년 이후 4종'
          };
        }
        const targetYm = year * 100 + (month || 12);
        return {
          co: coName,
          tier: targetYm >= 202604 ? '4종' : '5종',
          note: targetYm >= 202604 ? '2026.04 개정약관(질병수술Ⅳ) 4종' : '2026년 이전 계약 5종'
        };
      });

      const hasDiff = coResults.some(r => r.tier.includes('4종'));
      return {
        tier: hasDiff ? '4·5종' : '5종',
        hasDiff,
        diffBadge: hasDiff ? '[현대해상 4종 주의]' : '',
        note: `선택하신 ${cosList.length}개 보험사별 약관 비교`,
        boxHTML: `
          <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;margin:8px 0;">
            <div style="font-size:12px;font-weight:850;color:var(--text);margin-bottom:6px;">🏢 선택하신 ${cosList.length}개사 판정 비교:</div>
            <div style="display:flex;flex-direction:column;gap:5px;">
              ${coResults.map(cr => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 9px;background:var(--surface-2);border-radius:7px;font-size:12px;border:1px solid var(--border);">
                  <span style="font-weight:800;color:var(--text);">${esc(cr.co)}</span>
                  <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:11px;color:var(--text-3);">${esc(cr.note)}</span>
                    <span style="font-weight:900;padding:2px 8px;border-radius:5px;font-size:11.5px;background:${cr.tier === '4종' ? '#dc2626' : '#2563eb'};color:#fff;">${esc(cr.tier)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>`
      };
    }
  },
  {
    id: 'colon_polyp',
    name: '대장용종 절제술 (내시경 폴립절제)',
    match: (g) => (g.c || []).some(c => c.startsWith('K63') || c.startsWith('D12') || c.startsWith('K62')),
    standardTier: 2,
    standardLabel: '2종 (표준 1~5종 수술분류표 제88항-2)',
    revisions: [
      { co: '하나손해보험', ym: 202306, label: '하나손보 2023.06 개정', matchKeys: ['하나'] },
      { co: '예별(구 MG)손해보험', ym: 202309, label: '예별(구 MG) 2023.09 개정', matchKeys: ['예별', '에이별', 'mg', '엠지'] },
      { co: '메리츠화재', ym: 202412, label: '메리츠화재 2024.12 개정', matchKeys: ['메리츠', '멜츠'] },
      { co: '흥국화재', ym: 202509, label: '흥국화재 2025.09 개정', matchKeys: ['흥국화', '흥화'] },
      { co: 'KB손해보험', ym: 202601, label: 'KB손보 2026.01 개정(수술Ⅲ)', matchKeys: ['kb손', '케손'] },
      { co: '롯데손해보험', ym: 202601, label: '롯데손보 2026.01 개정', matchKeys: ['롯데', '롯손'] },
      { co: '농협손해보험', ym: 202609, label: '농협손보 2026.09 개정', matchKeys: ['농협손', '농손'] }
    ],
    evaluate: function(cosInput, year, month) {
      const cosList = parseCosList(cosInput);

      // A. 회사가 선택되지 않은 경우 (전사 기준)
      if (cosList.length === 0) {
        return {
          tier: '2종',
          hasDiff: true,
          diffBadge: '[가입시기별 상이]',
          note: '표준약관 및 생보 전사·대형 손보사는 2종 (메리츠 등 7개 손보사 개정 특약만 1종)',
          boxHTML: `
            <div style="background:var(--surface);border:1.5px solid rgba(239,68,68,0.3);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:12px;line-height:1.5;">
              <div style="font-weight:850;color:#dc2626;margin-bottom:4px;">⚠️ 대장용종 2종 ➔ 1종 하향 개정 손보사 7곳</div>
              <div style="color:var(--text);font-size:11.5px;display:grid;grid-template-columns:repeat(2,1fr);gap:4px;margin-bottom:6px;">
                <div>• 하나손보 : 2023.06~</div>
                <div>• 예별(구 MG) : 2023.09~</div>
                <div>• 메리츠화재 : 2024.12~</div>
                <div>• 흥국화재 : 2025.09~</div>
                <div>• KB손보 : 2026.01~(수술Ⅲ)</div>
                <div>• 롯데손보 : 2026.01~</div>
                <div>• 농협손보 : 2026.09~</div>
              </div>
              <div style="color:#2563eb;font-weight:750;font-size:11.5px;">✓ 삼성화재 · 현대해상 · DB손보 및 생보사 전사 : <b>개정 없이 2종 유지</b></div>
            </div>`
        };
      }

      // B. 단일 회사 선택
      if (cosList.length === 1) {
        const coStr = cosList[0];
        const normCo = coStr.toLowerCase();
        const revItem = this.revisions.find(r => r.matchKeys ? r.matchKeys.some(k => normCo.includes(k)) : normCo.includes(r.co.slice(0, 2)));

        if (!revItem) {
          return {
            tier: '2종',
            hasDiff: false,
            note: `${coStr}는 개정 없이 2종 유지 (표준 1~5종 약관)`,
            boxHTML: ''
          };
        }

        const ymText = `${Math.floor(revItem.ym / 100)}년 ${revItem.ym % 100}월`;
        if (!year) {
          return {
            tier: '1·2종',
            hasDiff: true,
            diffBadge: '[가입시기별 상이]',
            note: `${revItem.co}는 ${ymText} 기점으로 2종 ➔ 1종 하향 개정`,
            boxHTML: `
              <div style="background:rgba(239,68,68,0.06);border:1.5px solid rgba(239,68,68,0.3);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:12px;line-height:1.5;">
                <div style="font-weight:850;color:#dc2626;margin-bottom:3px;">⚠️ ${revItem.co} 가입시기별 종수 기준</div>
                <div>• <b>${ymText} 이전 계약</b> ➔ <b style="color:#2563eb;">2종 지급</b><br>• <b>${ymText} 이후 계약</b> ➔ <b style="color:#dc2626;">1종 적용</b> (개정약관)</div>
              </div>`
          };
        }

        const targetYm = year * 100 + (month || 12);
        if (targetYm >= revItem.ym) {
          return {
            tier: '1종',
            hasDiff: true,
            diffBadge: '[개정약관 1종]',
            note: `${revItem.co} ${ymText} 개정약관 적용 (1종)`,
            boxHTML: `
              <div style="background:rgba(239,68,68,0.06);border:1.5px solid rgba(239,68,68,0.3);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:12px;line-height:1.5;">
                <div style="font-weight:850;color:#dc2626;margin-bottom:3px;">✓ ${revItem.co} ${ymText} 이후 개정약관 (1종 확정)</div>
                <div style="color:var(--text-2);">고객 가입 시점이 ${ymText} 이후이므로 1종에 해당합니다. (이전 계약은 2종)</div>
              </div>`
          };
        } else {
          return {
            tier: '2종',
            hasDiff: true,
            diffBadge: '[개정 이전 2종]',
            note: `${revItem.co} ${ymText} 이전 계약으로 2종 지급`,
            boxHTML: `
              <div style="background:rgba(37,99,235,0.06);border:1.5px solid rgba(37,99,235,0.3);border-radius:10px;padding:9px 12px;margin:8px 0;font-size:12px;line-height:1.5;">
                <div style="font-weight:850;color:#2563eb;margin-bottom:3px;">✓ ${revItem.co} ${ymText} 이전 계약 (2종 확정)</div>
                <div style="color:var(--text-2);">${ymText} 개정 전 가입 계약이므로 정상적으로 2종 수술비가 지급됩니다.</div>
              </div>`
          };
        }
      }

      // C. 여러 회사 복수 선택 (전체 선택된 회사별 개별 대조!)
      const coResults = cosList.map(coName => {
        const normCo = coName.toLowerCase();
        const revItem = this.revisions.find(r => r.matchKeys ? r.matchKeys.some(k => normCo.includes(k)) : normCo.includes(r.co.slice(0, 2)));
        if (!revItem) {
          return {
            co: coName,
            tier: '2종',
            note: '개정 없이 2종 유지',
            isRevised: false
          };
        }
        const ymText = `${Math.floor(revItem.ym / 100)}년 ${revItem.ym % 100}월`;
        if (!year) {
          return {
            co: coName,
            tier: '1·2종',
            note: `${ymText} 개정 (이전 2종/이후 1종)`,
            isRevised: true
          };
        }
        const targetYm = year * 100 + (month || 12);
        if (targetYm >= revItem.ym) {
          return {
            co: coName,
            tier: '1종',
            note: `${ymText} 개정약관 적용`,
            isRevised: true
          };
        } else {
          return {
            co: coName,
            tier: '2종',
            note: `${ymText} 이전 계약 (2종 유지)`,
            isRevised: false
          };
        }
      });

      const hasAnyRev = coResults.some(r => r.isRevised);
      const allSameTier = coResults.every(r => r.tier === coResults[0].tier);
      const summaryTier = allSameTier ? coResults[0].tier : '회사별 상이';

      const multiCompareHTML = `
        <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;margin:8px 0;">
          <div style="font-size:12px;font-weight:850;color:var(--text);margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
            <span>🏢 선택하신 ${cosList.length}개 보험사 판정 비교:</span>
            ${year ? `<span style="font-size:11px;color:var(--brand);font-weight:800;">${year}년 계약 기준</span>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;">
            ${coResults.map(cr => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 9px;background:var(--surface-2);border-radius:7px;font-size:12px;border:1px solid var(--border);">
                <span style="font-weight:800;color:var(--text);">${esc(cr.co)}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                  <span style="font-size:11px;color:var(--text-3);">${esc(cr.note)}</span>
                  <span style="font-weight:900;padding:2px 8px;border-radius:5px;font-size:11.5px;background:${cr.tier === '1종' ? '#dc2626' : cr.tier === '1·2종' ? '#ea580c' : '#2563eb'};color:#fff;">${esc(cr.tier)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>`;

      return {
        tier: summaryTier,
        hasDiff: hasAnyRev,
        diffBadge: hasAnyRev ? '[회사별 상이]' : '',
        note: `선택하신 ${cosList.length}개 보험사별 약관 비교 결과`,
        boxHTML: multiCompareHTML
      };
    }
  },
  {
    id: 'breast_hyper',
    name: '유방비대증 수술',
    match: (g) => (g.c || []).some(c => c.startsWith('N62')),
    evaluate: function(cosInput) {
      const cosList = parseCosList(cosInput);
      if (cosList.length > 1) {
        const coResults = cosList.map(co => ({
          co,
          tier: co.includes('메리츠') ? '1종' : '3종',
          note: co.includes('메리츠') ? '메리츠 개정약관 1종' : '표준 약관 3종'
        }));
        return {
          tier: coResults.every(r => r.tier === '3종') ? '3종' : '회사별 상이',
          hasDiff: coResults.some(r => r.tier === '1종'),
          diffBadge: coResults.some(r => r.tier === '1종') ? '[회사별 상이]' : '',
          note: `선택하신 ${cosList.length}개 보험사별 약관 비교`,
          boxHTML: `
            <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;margin:8px 0;">
              <div style="font-size:12px;font-weight:850;color:var(--text);margin-bottom:6px;">🏢 선택하신 ${cosList.length}개사 판정 비교:</div>
              <div style="display:flex;flex-direction:column;gap:5px;">
                ${coResults.map(cr => `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 9px;background:var(--surface-2);border-radius:7px;font-size:12px;border:1px solid var(--border);">
                    <span style="font-weight:800;color:var(--text);">${esc(cr.co)}</span>
                    <span style="font-weight:900;padding:2px 8px;border-radius:5px;font-size:11.5px;background:${cr.tier === '1종' ? '#dc2626' : '#2563eb'};color:#fff;">${esc(cr.tier)}</span>
                  </div>
                `).join('')}
              </div>
            </div>`
        };
      }
      const coStr = cosList[0] || '';
      if (coStr.includes('메리츠')) {
        return {
          tier: '1종',
          hasDiff: true,
          diffBadge: '[메리츠 1종]',
          note: '메리츠화재 1-5종 수술분류표Ⅱ는 유방비대(N62) 수술을 1종으로 별도 명시',
          boxHTML: ''
        };
      }
      return {
        tier: '3종',
        hasDiff: false,
        diffBadge: '',
        note: '표준 1~5종 수술분류표 제3항 유방절단수술 3종',
        boxHTML: ''
      };
    }
  },
  {
    id: 'gallstone',
    name: '담석증 복강경수술',
    match: (g) => (g.c || []).some(c => c.startsWith('K80')),
    evaluate: function(cosInput) {
      const cosList = parseCosList(cosInput);
      if (cosList.length > 1) {
        const coResults = cosList.map(co => ({
          co,
          tier: co.includes('메리츠') ? '2종' : '3종',
          note: co.includes('메리츠') ? '메리츠 개정약관 2종' : '표준 약관 3종'
        }));
        return {
          tier: coResults.every(r => r.tier === '3종') ? '3종' : '회사별 상이',
          hasDiff: coResults.some(r => r.tier === '2종'),
          diffBadge: coResults.some(r => r.tier === '2종') ? '[회사별 상이]' : '',
          note: `선택하신 ${cosList.length}개 보험사별 약관 비교`,
          boxHTML: `
            <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:10px;padding:10px 12px;margin:8px 0;">
              <div style="font-size:12px;font-weight:850;color:var(--text);margin-bottom:6px;">🏢 선택하신 ${cosList.length}개사 판정 비교:</div>
              <div style="display:flex;flex-direction:column;gap:5px;">
                ${coResults.map(cr => `
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 9px;background:var(--surface-2);border-radius:7px;font-size:12px;border:1px solid var(--border);">
                    <span style="font-weight:800;color:var(--text);">${esc(cr.co)}</span>
                    <span style="font-weight:900;padding:2px 8px;border-radius:5px;font-size:11.5px;background:#2563eb;color:#fff;">${esc(cr.tier)}</span>
                  </div>
                `).join('')}
              </div>
            </div>`
        };
      }
      const coStr = cosList[0] || '';
      if (coStr.includes('메리츠')) {
        return {
          tier: '2종',
          hasDiff: true,
          diffBadge: '[메리츠 2종]',
          note: '메리츠화재 1-5종 수술분류표Ⅱ는 담석증(K80) 수술을 2종으로 별도 명시',
          boxHTML: ''
        };
      }
      return {
        tier: '3종',
        hasDiff: false,
        diffBadge: '',
        note: '표준 1~5종 수술분류표 제36항 담낭·담도 관혈수술 3종',
        boxHTML: ''
      };
    }
  }
];

function evaluateSurgery(g, cosInput, year, month) {
  for (const rule of REVISION_RULES) {
    if (rule.match(g)) {
      return rule.evaluate(cosInput, year, month);
    }
  }
  const stdT = tierOf(g);
  const cosList = parseCosList(cosInput);
  const noteText = cosList.length > 1
    ? `선택하신 ${cosList.length}개사 공통: ${tierLabel(stdT)} (표준 1~5종 약관)`
    : '표준 1~5종 수술분류표 기준';
  return {
    tier: tierLabel(stdT),
    hasDiff: false,
    diffBadge: '',
    note: noteText,
    boxHTML: ''
  };
}

function cardQuickHTML(gi, q, matchedEdi, parsed) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const procs = curatedFor(g, window.CURATED?.procs);

  const cosList = (parsed?.cos && parsed.cos.length > 0)
    ? parsed.cos
    : (parsed?.co ? [parsed.co] : []);
  const year = parsed?.year || null;
  const month = parsed?.month || null;
  const evalRes = evaluateSurgery(g, cosList, year, month);

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

  const badgeDiffHTML = evalRes.diffBadge
    ? `<span style="color:#dc2626;font-size:11.5px;font-weight:850;margin-left:6px;">${esc(evalRes.diffBadge)}</span>`
    : '';

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
          <span class="proc-tag ${'t' + (parseInt(evalRes.tier) || 2)}" style="font-size:16px;padding:5px 14px;border-radius:10px;min-width:54px;">${esc(evalRes.tier)}</span>
          <div>
            <div style="font-size:14px;font-weight:800;color:var(--text);">${esc(t.w || g.n + ' 수술')} ${badgeDiffHTML}</div>
            <div style="font-size:11px;color:var(--text-3);margin-top:2px;">${esc(evalRes.note)}</div>
          </div>
        </div>
        ${evalRes.boxHTML}
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
const ALL_CONTRACT_YEARS = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020,
  2019, 2018, 2017, 2016, 2015, 2014, 2013,
  2012, 2011, 2010, 2009, 2008, 2007, 2006, 2005
];

function updateTierBadges() {
  const dBadge = $('#tierDateBadge');
  const cBadge = $('#tierCoBadge');

  if (dBadge) {
    if (state.tDateTouched) {
      let dtText = '전체';
      if (state.tYear && state.tMonth) {
        dtText = `${state.tYear}년 ${state.tMonth}월`;
      } else if (state.tYear) {
        dtText = `${state.tYear}년`;
      }
      dBadge.textContent = `: ${dtText}`;
    } else {
      dBadge.textContent = '';
    }
  }

  if (cBadge) {
    if (state.tCoTouched) {
      const coText = state.tCos && state.tCos.length > 0 ? state.tCos.join(', ') : (state.tCo || '전체');
      cBadge.textContent = `: ${coText}`;
    } else {
      cBadge.textContent = '';
    }
  }
}

function renderTierEmptyExample() {
  const box = $('#results-tier');
  if (!box) return;
  box.innerHTML = `
    <div style="margin-top:6px;border:1.5px dashed var(--line);border-radius:16px;padding:16px 14px;background:var(--surface);text-align:left;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <span style="font-size:12px;font-weight:900;color:var(--brand);background:rgba(26,115,232,0.1);padding:4px 9px;border-radius:6px;">💡 검색 결과 예시 (미리보기)</span>
        <span style="font-size:11px;color:var(--text-3);font-weight:700;">검색어를 입력하면 이렇게 나와요</span>
      </div>

      <div style="background:var(--surface-2);border-radius:14px;padding:13px;border:1px solid var(--border);margin-bottom:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <div style="font-size:15px;font-weight:900;color:var(--text);">대장용종 절제술 (Q7701)</div>
          <div style="background:#2563eb;color:#fff;padding:4px 10px;border-radius:8px;font-size:15px;font-weight:900;">2종</div>
        </div>
        <div style="font-size:12px;color:var(--text-2);line-height:1.5;margin-bottom:8px;">
          결장경하 폴립절제술 (표준 1~5종 <b>2종</b> 수술비 해당)<br>
          <span style="color:#dc2626;font-weight:800;">⚠️ 2020년 이후 메리츠·롯데 등 일부 손보사는 1종으로 분류</span>
        </div>
        <div style="display:inline-block;background:var(--surface);border:1px solid var(--line);padding:3px 8px;border-radius:6px;font-size:11px;color:var(--text-3);">
          질병분류: K63.5 / EDI 수가코드: Q7701
        </div>
      </div>

      <div style="font-size:11.5px;color:var(--text-3);font-weight:750;margin-bottom:6px;">
        👇 <b>원터치 추천 검색어</b> (누르면 바로 검색):
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;" id="tierExampleChips">
        <button type="button" class="f-chip ex-btn" data-q="대장용종" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">대장용종</button>
        <button type="button" class="f-chip ex-btn" data-q="백내장" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">백내장</button>
        <button type="button" class="f-chip ex-btn" data-q="맘모톰" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">맘모톰</button>
        <button type="button" class="f-chip ex-btn" data-q="자궁근종" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">자궁근종</button>
        <button type="button" class="f-chip ex-btn" data-q="Q7701" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">Q7701</button>
      </div>
    </div>
  `;

  box.querySelectorAll('.ex-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      const qTierEl = $('#q-tier');
      if (qTierEl) qTierEl.value = q;
      state.tierQ = q;
      $('#clearBtn-tier').hidden = false;
      runTierSearch(q);
    });
  });
}

function renderYearGrid() {
  const grid = $('#tierYearGrid');
  const monthSec = $('#tierMonthSection');
  if (!grid) return;

  grid.innerHTML = `
    <button class="f-chip y-chip ${state.tYear === null ? 'on' : ''}" data-y="" style="padding:6px 0;font-size:11px;font-weight:800;grid-column:span 4;">년도 전체</button>
    ${ALL_CONTRACT_YEARS.map(y => `
      <button class="f-chip y-chip ${state.tYear === y ? 'on' : ''}" data-y="${y}" style="padding:6px 0;font-size:11px;font-weight:750;">${y}년</button>
    `).join('')}
  `;

  grid.style.display = 'grid';
  if (monthSec) monthSec.style.display = 'block';

  $$('#tierYearGrid .y-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#tierYearGrid .y-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.tYear = btn.dataset.y ? parseInt(btn.dataset.y, 10) : null;
      state.tDateTouched = true;
      updateTierBadges();
      if (state.tierQ.trim()) runTierSearch(state.tierQ);
    });
  });
}

function bindTierTab() {
  const qTierEl = $('#q-tier');

  // 접이식 아코디언 바 토글 (가입시기 & 가입회사)
  const btnToggleTierDate = $('#btnToggleTierDate');
  const tierDateBody = $('#tierDateBody');
  const tierDateToggleIcon = $('#tierDateToggleIcon');
  btnToggleTierDate?.addEventListener('click', () => {
    const isHidden = tierDateBody.style.display === 'none';
    tierDateBody.style.display = isHidden ? 'block' : 'none';
    if (tierDateToggleIcon) tierDateToggleIcon.textContent = isHidden ? '접기 ∧' : '펼치기 ∨';
  });

  const btnToggleTierCo = $('#btnToggleTierCo');
  const tierCoBody = $('#tierCoBody');
  const tierCoToggleIcon = $('#tierCoToggleIcon');
  btnToggleTierCo?.addEventListener('click', () => {
    const isHidden = tierCoBody.style.display === 'none';
    tierCoBody.style.display = isHidden ? 'block' : 'none';
    if (tierCoToggleIcon) tierCoToggleIcon.textContent = isHidden ? '접기 ∧' : '펼치기 ∨';
  });

  // 1단계: 시기 구분 버튼 (전체, 2020년~, 06~19년, 06년이전)
  $$('#tGenChips .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#tGenChips .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.tGen = btn.dataset.gen;
      state.tYear = null;
      state.tMonth = null;
      state.tDateTouched = true;
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
      state.tDateTouched = true;
      updateTierBadges();
      if (state.tierQ.trim()) runTierSearch(state.tierQ);
    });
  });

  $('#tierMonthReset').addEventListener('click', () => {
    $$('#tierMonthGrid .m-chip').forEach((b, idx) => b.classList.toggle('on', idx === 0));
    state.tMonth = null;
    state.tDateTouched = true;
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

  // 회사 칩 클릭 (다중 선택 지원)
  $$('#tierCoSonbo .f-chip, #tierCoSaengbo .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const co = btn.dataset.co || '';
      if (!co) {
        state.tCos = [];
        $$('#tierCoSonbo .f-chip, #tierCoSaengbo .f-chip').forEach(b => {
          b.classList.toggle('on', !b.dataset.co);
        });
      } else {
        const idx = state.tCos.indexOf(co);
        if (idx >= 0) {
          state.tCos.splice(idx, 1);
          btn.classList.remove('on');
        } else {
          state.tCos.push(co);
          btn.classList.add('on');
        }
        $$('#tierCoSonbo .f-chip[data-co=""], #tierCoSaengbo .f-chip[data-co=""]').forEach(b => {
          b.classList.toggle('on', state.tCos.length === 0);
        });
      }
      state.tCo = state.tCos.join(', ');
      state.tCoTouched = true;
      updateTierBadges();
      if (state.tierQ.trim()) runTierSearch(state.tierQ);
    });
  });

  // 하이브리드 스마트 검색창 입력 (21년3월, 2103, 202103, 메리츠 등 완벽 감지)
  qTierEl.addEventListener('input', debounce(() => {
    const v = qTierEl.value;
    state.tierQ = v;
    $('#clearBtn-tier').hidden = !v;
    if (!v.trim()) { renderTierEmptyExample(); return; }

    const parsed = parseSmartQuery(v);

    // 회사 자동 세팅 (단일 or 생·손보 패밀리)
    if (parsed.co) {
      if (parsed.cos && parsed.cos.length > 1) {
        state.tCos = [...parsed.cos];
        state.tCo = parsed.cos.join(', ');
        state.tCoTouched = true;
        $$('#tierCoSonbo .f-chip, #tierCoSaengbo .f-chip').forEach(b => {
          b.classList.toggle('on', parsed.cos.includes(b.dataset.co));
        });
      } else {
        state.tCos = [parsed.co];
        state.tCo = parsed.co;
        state.tCoTouched = true;
        if (parsed.coType === 'saengbo') btnSaengbo.click();
        else btnSonbo.click();
        $$('#tierCoSonbo .f-chip, #tierCoSaengbo .f-chip').forEach(b => {
          b.classList.toggle('on', b.dataset.co === parsed.co);
        });
      }
    }

    // 시기/연도/월 자동 세팅
    if (parsed.gen) {
      state.tGen = parsed.gen;
      state.tDateTouched = true;
      $$('#tGenChips .f-chip').forEach(b => b.classList.toggle('on', b.dataset.gen === parsed.gen));
      renderYearGrid(parsed.gen);
    }
    if (parsed.year !== undefined && parsed.year !== null) {
      state.tYear = parsed.year;
      state.tDateTouched = true;
      $$('#tierYearGrid .y-chip').forEach(b => b.classList.toggle('on', b.dataset.y === String(parsed.year)));
    }
    if (parsed.month !== undefined && parsed.month !== null) {
      state.tMonth = parsed.month;
      state.tDateTouched = true;
      $$('#tierMonthGrid .m-chip').forEach(b => b.classList.toggle('on', b.dataset.m === String(parsed.month)));
    }

    updateTierBadges();
    runTierSearch(parsed.cleanQ || v, parsed.family);
  }, 70));

  $('#clearBtn-tier').addEventListener('click', () => {
    qTierEl.value = ''; state.tierQ = ''; $('#clearBtn-tier').hidden = true;
    renderTierEmptyExample(); qTierEl.focus();
  });

  renderYearGrid();
  updateTierBadges();
  renderTierEmptyExample();
}

function runTierSearch(q, family) {
  const box = $('#results-tier');
  if (!q || !q.trim()) {
    renderTierEmptyExample();
    return;
  }
  const res = search(q);
  if (!res) {
    renderTierEmptyExample();
    return;
  }

  const dtText = state.tYear ? (state.tMonth ? `${state.tYear}년 ${state.tMonth}월` : `${state.tYear}년`) : ({ old: '2020년 이전', recent: '2020년 이후' }[state.tGen] || '2020년 이후');
  const cLabel = state.tCos && state.tCos.length > 0 ? state.tCos.join(', ') : (state.tCo || '전체');

  let familyBarHTML = '';
  if (family) {
    const isBoth = state.tCos.includes(family.sonbo) && state.tCos.includes(family.saengbo);
    const isSonbo = state.tCos.length === 1 && state.tCos.includes(family.sonbo);
    const isSaengbo = state.tCos.length === 1 && state.tCos.includes(family.saengbo);
    familyBarHTML = `
      <div class="fam-filter-bar" style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:9px 12px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <span style="font-size:12px;font-weight:800;color:var(--text);">🏢 ${esc(family.name)} 생보 · 손보 선택:</span>
        <div style="display:flex;gap:5px;">
          <button type="button" class="f-chip fam-btn ${isBoth ? 'on' : ''}" data-act="both" style="font-size:11.5px;padding:4px 9px;">둘 다 비교</button>
          <button type="button" class="f-chip fam-btn ${isSonbo ? 'on' : ''}" data-act="sonbo" style="font-size:11.5px;padding:4px 9px;">${esc(family.sonbo)}만</button>
          <button type="button" class="f-chip fam-btn ${isSaengbo ? 'on' : ''}" data-act="saengbo" style="font-size:11.5px;padding:4px 9px;">${esc(family.saengbo)}만</button>
        </div>
      </div>`;
  }

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> 종수술비 정밀 결과 <span style="font-size:11.5px;color:var(--brand);font-weight:700;">[${esc(cLabel)} · ${esc(dtText)}]</span></div>
      <div class="res-count">분류 ${res.groups.length}건</div>
    </div>
    ${familyBarHTML}`;

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
  html += res.groups.slice(0, 15).map(i => cardTierHTML(i, q, res.matchedEdi)).join('');
  box.innerHTML = html;
  bindCardActions(box);

  // 패밀리 버튼 클릭 바인딩
  box.querySelectorAll('.fam-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      if (act === 'both') {
        state.tCos = [family.sonbo, family.saengbo];
      } else if (act === 'sonbo') {
        state.tCos = [family.sonbo];
      } else if (act === 'saengbo') {
        state.tCos = [family.saengbo];
      }
      state.tCo = state.tCos.join(', ');
      state.tCoTouched = true;
      $$('#tierCoSonbo .f-chip, #tierCoSaengbo .f-chip').forEach(b => {
        b.classList.toggle('on', state.tCos.includes(b.dataset.co));
      });
      updateTierBadges();
      runTierSearch(q, family);
    });
  });
}

function cardTierHTML(gi, q, matchedEdi) {
  const g = state.D.g[gi];
  const t = tierOf(g);
  const procs = curatedFor(g, window.CURATED?.procs);

  const year = state.tYear;
  const month = state.tMonth;
  const co = state.tCo;
  const cosList = (state.tCos && state.tCos.length > 0)
    ? state.tCos
    : (co ? co.split(',').map(s => s.trim()).filter(Boolean) : []);

  const evalRes = evaluateSurgery(g, cosList, year, month);

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

  const badgeDiffHTML = evalRes.diffBadge
    ? `<span style="color:#dc2626;font-size:11.5px;font-weight:850;margin-left:6px;">${esc(evalRes.diffBadge)}</span>`
    : '';

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
          <span class="proc-tag ${'t' + (parseInt(evalRes.tier) || 2)}" style="font-size:17px;padding:6px 16px;border-radius:10px;min-width:56px;">${esc(evalRes.tier)}</span>
          <div>
            <div style="font-size:14.5px;font-weight:850;color:var(--text);">${esc(g.n)} 수술 ${badgeDiffHTML}</div>
            <div style="font-size:11.5px;color:var(--brand);font-weight:700;margin-top:2px;">${esc(evalRes.note)}</div>
          </div>
        </div>
        ${evalRes.boxHTML}
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
function renderNdaiYearGrid() {
  const grid = $('#ndaiYearGrid');
  if (!grid) return;

  grid.innerHTML = `
    <button class="f-chip ny-chip ${state.ndaiYear === null ? 'on' : ''}" data-ny="" style="padding:6px 0;font-size:11px;font-weight:800;grid-column:span 4;">년도 전체</button>
    ${ALL_CONTRACT_YEARS.map(y => `
      <button class="f-chip ny-chip ${state.ndaiYear === y ? 'on' : ''}" data-ny="${y}" style="padding:6px 0;font-size:11px;font-weight:750;">${y}년</button>
    `).join('')}
  `;

  grid.style.display = 'grid';

  $$('#ndaiYearGrid .ny-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#ndaiYearGrid .ny-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.ndaiYear = btn.dataset.ny ? parseInt(btn.dataset.ny, 10) : null;
      state.ndaiDateTouched = true;
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

function extractNtiersForCompanies(cos) {
  if (!state.D?.riders) return [];
  const R = state.D.riders;
  const filtered = (!cos || !cos.length) ? R : R.filter(r => cos.some(c => r.co.includes(c) || c.includes(r.co)));
  const set = new Set();
  filtered.forEach(r => {
    const m = r.rider.match(/(\d+대)/);
    if (m) set.add(m[1]);
  });
  return Array.from(set).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
}

function renderDynamicNdaiTierChips() {
  const box = $('#ndaiTierChips');
  if (!box) return;
  const cos = state.ndaiCos && state.ndaiCos.length ? state.ndaiCos : (state.ndaiCo ? [state.ndaiCo] : []);

  if (!cos.length) {
    const tiers = extractNtiersForCompanies([]);
    let html = `
      <div style="font-size:11px;font-weight:800;color:var(--text-3);margin-bottom:4px;width:100%;">주요 N대 특약:</div>
      <div style="display:flex;flex-wrap:wrap;gap:5px;">
        <button class="f-chip ${!state.ndaiTier ? 'on' : ''}" data-ntier="" style="padding:5px 10px;font-size:11px;font-weight:800;">전체 N대</button>
        ${tiers.slice(0, 10).map(t => `<button class="f-chip ${state.ndaiTier === t ? 'on' : ''}" data-ntier="${esc(t)}" style="padding:5px 10px;font-size:11px;font-weight:800;">${esc(t)}</button>`).join('')}
      </div>`;
    box.innerHTML = html;
  } else {
    let html = '';
    cos.forEach(c => {
      const tiers = extractNtiersForCompanies([c]);
      html += `
        <div style="margin-bottom:8px;width:100%;">
          <div style="font-size:11px;font-weight:850;color:#8b5cf6;margin-bottom:4px;">🏢 [${esc(c)}] 증권 특약:</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;">
            <button class="f-chip ${!state.ndaiTier ? 'on' : ''}" data-ntier="" style="padding:5px 10px;font-size:11px;font-weight:800;">전체 N대</button>
            ${tiers.length ? tiers.map(t => `<button class="f-chip ${state.ndaiTier === t ? 'on' : ''}" data-ntier="${esc(t)}" style="padding:5px 10px;font-size:11px;font-weight:800;">${esc(t)}</button>`).join('') : '<span style="font-size:11px;color:var(--text-3);padding:4px 6px;">N대 특약 미판매 / 준비 중</span>'}
          </div>
        </div>`;
    });
    box.innerHTML = html;
  }

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
}


function renderNdaiEmptyExample() {
  const box = $('#results-ndai');
  if (!box) return;
  box.innerHTML = `
    <div style="margin-top:6px;border:1.5px dashed var(--line);border-radius:16px;padding:16px 14px;background:var(--surface);text-align:left;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <span style="font-size:12px;font-weight:900;color:#8b5cf6;background:rgba(139,92,246,0.1);padding:4px 9px;border-radius:6px;">💡 N대 질병수술비 검색 예시</span>
        <span style="font-size:11px;color:var(--text-3);font-weight:700;">검색어를 입력하면 N대 특약이 나와요</span>
      </div>

      <div style="background:var(--surface-2);border-radius:14px;padding:13px;border:1px solid var(--border);margin-bottom:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <div style="font-size:15px;font-weight:900;color:var(--text);">맘모톰 절제술 (D24)</div>
          <div style="background:#8b5cf6;color:#fff;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:900;">N대 해당</div>
        </div>
        <div style="font-size:12px;color:var(--text-2);line-height:1.5;margin-bottom:6px;">
          • <b>KB손해보험</b>: 116대 질병 중 [49대 질병] 해당<br>
          • <b>메리츠화재</b>: 131대 질병 중 [특정다빈도29대] 해당<br>
          • <b>현대해상</b>: 120대 질병 중 [다발성10대 질병수술] 해당
        </div>
      </div>

      <div style="font-size:11.5px;color:var(--text-3);font-weight:750;margin-bottom:6px;">
        👇 <b>원터치 추천 검색어</b> (누르면 바로 검색):
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;" id="ndaiExampleChips">
        <button type="button" class="f-chip ndai-ex-btn" data-q="맘모톰" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">맘모톰</button>
        <button type="button" class="f-chip ndai-ex-btn" data-q="대장용종" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">대장용종</button>
        <button type="button" class="f-chip ndai-ex-btn" data-q="백내장" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">백내장</button>
        <button type="button" class="f-chip ndai-ex-btn" data-q="자궁근종" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">자궁근종</button>
        <button type="button" class="f-chip ndai-ex-btn" data-q="갑상선암" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">갑상선암</button>
      </div>
    </div>
  `;

  box.querySelectorAll('.ndai-ex-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q;
      const qNdaiEl = $('#q-ndai');
      if (qNdaiEl) qNdaiEl.value = q;
      state.ndaiQ = q;
      const clearBtn = $('#clearBtn-ndai');
      if (clearBtn) clearBtn.hidden = false;
      const parsed = parseSmartQuery(q);
      runNdaiSearch(parsed.cleanQ || q, parsed.family);
    });
  });
}

function bindNdaiTab() {
  const qNdaiEl = $('#q-ndai');
  const btnSearchTab = $('#btnNdaiSearchTab');
  const btnTreeTab = $('#btnNdaiTreeTab');
  const searchView = $('#ndaiSearchSubView');
  const treeView = $('#ndaiTreeSubView');

  // 접이식 아코디언 바 토글 (판매시기 & 가입회사)
  const btnToggleNdaiDate = $('#btnToggleNdaiDate');
  const ndaiDateBody = $('#ndaiDateBody');
  const ndaiDateToggleIcon = $('#ndaiDateToggleIcon');
  btnToggleNdaiDate?.addEventListener('click', () => {
    const isHidden = ndaiDateBody.style.display === 'none';
    ndaiDateBody.style.display = isHidden ? 'block' : 'none';
    if (ndaiDateToggleIcon) ndaiDateToggleIcon.textContent = isHidden ? '접기 ∧' : '펼치기 ∨';
  });

  const btnToggleNdaiCo = $('#btnToggleNdaiCo');
  const ndaiCoBody = $('#ndaiCoBody');
  const ndaiCoToggleIcon = $('#ndaiCoToggleIcon');
  btnToggleNdaiCo?.addEventListener('click', () => {
    const isHidden = ndaiCoBody.style.display === 'none';
    ndaiCoBody.style.display = isHidden ? 'block' : 'none';
    if (ndaiCoToggleIcon) ndaiCoToggleIcon.textContent = isHidden ? '접기 ∧' : '펼치기 ∨';
  });

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
      state.ndaiYear = null;
      state.ndaiDateTouched = true;
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

  // N대 회사 칩 클릭 (다중 선택 및 회사별 특약 칩 동적 분리 지원)
  $$('#ndaiCoSonbo .f-chip, #ndaiCoSaengbo .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const co = btn.dataset.nco || '';
      if (!co) {
        state.ndaiCos = [];
        $$('#ndaiCoSonbo .f-chip, #ndaiCoSaengbo .f-chip').forEach(b => {
          b.classList.toggle('on', !b.dataset.nco);
        });
      } else {
        const idx = state.ndaiCos.indexOf(co);
        if (idx >= 0) {
          state.ndaiCos.splice(idx, 1);
          btn.classList.remove('on');
        } else {
          state.ndaiCos.push(co);
          btn.classList.add('on');
        }
        $$('#ndaiCoSonbo .f-chip[data-nco=""], #ndaiCoSaengbo .f-chip[data-nco=""]').forEach(b => {
          b.classList.toggle('on', state.ndaiCos.length === 0);
        });
      }
      state.ndaiCo = state.ndaiCos.join(', ');
      state.ndaiCoTouched = true;
      renderDynamicNdaiTierChips();
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
    if (!v.trim()) { renderNdaiEmptyExample(); return; }

    const parsed = parseSmartQuery(v);
    if (parsed.co) {
      if (parsed.cos && parsed.cos.length > 1) {
        state.ndaiCos = [...parsed.cos];
        state.ndaiCo = parsed.cos.join(', ');
        state.ndaiCoTouched = true;
        $$('#ndaiCoSonbo .f-chip, #ndaiCoSaengbo .f-chip').forEach(b => {
          b.classList.toggle('on', parsed.cos.includes(b.dataset.nco));
        });
      } else {
        state.ndaiCos = [parsed.co];
        state.ndaiCo = parsed.co;
        state.ndaiCoTouched = true;
        if (parsed.coType === 'saengbo') btnSaengbo.click();
        else btnSonbo.click();
        $$('#ndaiCoSonbo .f-chip, #ndaiCoSaengbo .f-chip').forEach(b => {
          b.classList.toggle('on', b.dataset.nco === parsed.co);
        });
      }
      renderDynamicNdaiTierChips();
    }

    if (parsed.year) {
      state.ndaiYear = parsed.year;
      state.ndaiDateTouched = true;
      state.ndaiGen = parsed.year >= 2020 ? 'recent' : 'old';
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
    runNdaiSearch(parsed.cleanQ || v, parsed.family);
  }, 70));

  $('#clearBtn-ndai').addEventListener('click', () => {
    qNdaiEl.value = ''; state.ndaiQ = ''; $('#clearBtn-ndai').hidden = true;
    renderNdaiEmptyExample(); qNdaiEl.focus();
  });

  renderNdaiYearGrid();
  renderDynamicNdaiTierChips();
  updateNdaiBadges();
  renderNdaiEmptyExample();
}

function runNdaiSearch(q, family) {
  const box = $('#results-ndai');
  if (!q || !q.trim()) {
    renderNdaiEmptyExample();
    return;
  }
  const res = search(q);
  if (!res) {
    renderNdaiEmptyExample();
    return;
  }

  const cLabel = state.ndaiCos && state.ndaiCos.length ? state.ndaiCos.join(', ') : (state.ndaiCo ? state.ndaiCo : '전체 회사');
  const tLabel = state.ndaiTier ? ` · ${state.ndaiTier}` : '';

  let familyBarHTML = '';
  if (family) {
    const isBoth = state.ndaiCos.includes(family.sonbo) && state.ndaiCos.includes(family.saengbo);
    const isSonbo = state.ndaiCos.length === 1 && state.ndaiCos.includes(family.sonbo);
    const isSaengbo = state.ndaiCos.length === 1 && state.ndaiCos.includes(family.saengbo);
    familyBarHTML = `
      <div class="fam-filter-bar" style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:9px 12px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <span style="font-size:12px;font-weight:800;color:var(--text);">🏢 ${esc(family.name)} 생보 · 손보 선택:</span>
        <div style="display:flex;gap:5px;">
          <button type="button" class="f-chip fam-btn ${isBoth ? 'on' : ''}" data-act="both" style="font-size:11.5px;padding:4px 9px;">둘 다 비교</button>
          <button type="button" class="f-chip fam-btn ${isSonbo ? 'on' : ''}" data-act="sonbo" style="font-size:11.5px;padding:4px 9px;">${esc(family.sonbo)}만</button>
          <button type="button" class="f-chip fam-btn ${isSaengbo ? 'on' : ''}" data-act="saengbo" style="font-size:11.5px;padding:4px 9px;">${esc(family.saengbo)}만</button>
        </div>
      </div>`;
  }

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> N대 수술비 판정 <span style="font-size:11.5px;color:#8b5cf6;font-weight:800;">[${esc(cLabel)}${esc(tLabel)}]</span></div>
      <div class="res-count">분류 ${res.groups.length}건</div>
    </div>
    ${familyBarHTML}`;

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

  // 패밀리 버튼 클릭 바인딩
  box.querySelectorAll('.fam-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.act;
      if (act === 'both') {
        state.ndaiCos = [family.sonbo, family.saengbo];
      } else if (act === 'sonbo') {
        state.ndaiCos = [family.sonbo];
      } else if (act === 'saengbo') {
        state.ndaiCos = [family.saengbo];
      }
      state.ndaiCo = state.ndaiCos.join(', ');
      state.ndaiCoTouched = true;
      $$('#ndaiCoSonbo .f-chip, #ndaiCoSaengbo .f-chip').forEach(b => {
        b.classList.toggle('on', state.ndaiCos.includes(b.dataset.nco));
      });
      renderDynamicNdaiTierChips();
      updateNdaiBadges();
      runNdaiSearch(q, family);
    });
  });
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
  const cosList = state.ndaiCos && state.ndaiCos.length ? state.ndaiCos : (state.ndaiCo ? [state.ndaiCo] : []);
  const nTier = state.ndaiTier;

  let contentHTML = '';

  if (cosList.length > 0) {
    const tierBadge = nTier ? ` ${nTier}` : '';
    const blocks = cosList.map(c => {
      const lines = formatNdaLinesForCo(g, c, nTier);
      if (lines.length > 0) {
        let multiNotice = '';
        if (lines.length > 1) {
          multiNotice = `
            <div style="font-size:11px;color:#d97706;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:6px 10px;margin-top:6px;font-weight:700;">
              ⚠️ 질병코드(${g.c.slice(0, 3).join(', ')})에 따라 담보 구분이 다를 수 있습니다. 진단서의 최종 코드를 확인하세요.
            </div>`;
        }

        return `
          <div class="ndai-res-box covered" style="border-left:4px solid #8b5cf6;margin-bottom:8px;background:var(--surface);">
            <div class="ndai-res-status" style="color:#8b5cf6;font-size:13px;font-weight:850;display:flex;align-items:center;justify-content:space-between;">
              <span>✓ [${esc(c)}${esc(tierBadge)}] N대 질병수술비</span>
              <span style="font-size:11px;background:rgba(139,92,246,0.12);color:#8b5cf6;padding:2px 7px;border-radius:6px;font-weight:800;">보장 해당</span>
            </div>
            <div style="margin:8px 0;display:flex;flex-direction:column;gap:5px;">
              ${lines.map(l => `<div style="font-size:12.5px;color:var(--text);background:var(--surface-2);padding:7px 11px;border-radius:8px;border:1px solid var(--border);font-weight:750;">• ${l}</div>`).join('')}
            </div>
            ${multiNotice}
          </div>`;
      } else {
        return `
          <div class="ndai-res-box not-covered" style="border-left:4px solid var(--line);margin-bottom:8px;background:var(--surface-2);">
            <div class="ndai-res-status" style="font-size:12.5px;font-weight:800;color:var(--text-3);">
              <span>⚠️ [${esc(c)}${esc(tierBadge)}] N대 특약 미해당</span>
            </div>
            <div class="ndai-res-desc" style="font-size:11px;color:var(--text-3);margin-top:2px;">
              선택하신 [${esc(c)}]의 N대 특약 분류표에는 미포함된 질환입니다. (종수술비 청구)
            </div>
          </div>`;
      }
    }).join('');

    contentHTML = `
      <div style="margin-top:4px;">
        <div style="font-size:11px;font-weight:800;color:var(--text-3);margin-bottom:6px;">🏢 선택하신 회사별 N대 보장 결과:</div>
        ${blocks}
        <div style="font-size:11px;color:var(--text-3);margin-top:4px;">각 회사별 증권에 기재된 가입금액 한도로 각각 지급됩니다.</div>
      </div>`;
  } else {
    const majorCos = ['현대해상', 'KB손해보험', '메리츠화재', '삼성화재', 'DB손해보험'];
    const otherCos = Array.from(cos.keys()).filter(c => !majorCos.some(m => c.includes(m.slice(0, 2))));
    const previewCos = [...majorCos, ...otherCos];
    const previewLines = [];
    previewCos.forEach(c => {
      if (previewLines.length >= 6) return;
      const lines = formatNdaLinesForCo(g, c, nTier);
      if (lines.length > 0) previewLines.push(`• <b>${esc(c)}</b>: ${lines[0]}`);
    });

    if (previewLines.length > 0) {
      contentHTML = `
        <div class="ndai-res-box covered" style="border-left:4px solid #8b5cf6;margin-top:8px;background:var(--surface);">
          <div class="ndai-res-status" style="color:#8b5cf6;font-size:13px;font-weight:850;margin-bottom:6px;">
            <span>✓ 주요 ${cos.size}개 보험사 N대 질병수술비 보장 해당</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--text);margin-bottom:6px;">
            ${previewLines.map(l => `<div style="background:var(--surface-2);padding:6px 10px;border-radius:7px;border:1px solid var(--border);">${l}</div>`).join('')}
          </div>
          <div style="font-size:11px;color:var(--text-3);">상단에서 보험사를 선택하시면 해당 회사의 증권 특약별 상세 판정을 비교할 수 있습니다.</div>
        </div>`;
    } else {
      contentHTML = `
        <div class="ndai-res-box not-covered" style="border-left:4px solid var(--line);margin-top:8px;background:var(--surface-2);">
          <div class="ndai-res-status" style="font-size:12.5px;font-weight:800;color:var(--text-3);">
            <span>⚠️ N대 질병수술비 특약 미포함 (종수술비 청구)</span>
          </div>
          <div style="font-size:11px;color:var(--text-3);margin-top:2px;">
            N대 질병수술비 분류표에는 제외된 질환이므로 1~5종 종수술비로 청구를 진행합니다.
          </div>
        </div>`;
    }
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

  let ocrGen = 'recent';
  let ocrCos = [];
  let ocrCo = '';

  const btnToggle = $('#btnToggleOcrDetail');
  const detailBody = $('#ocrDetailBody');
  const toggleIcon = $('#ocrToggleIcon');
  const summaryBadge = $('#ocrSummaryBadge');

  btnToggle?.addEventListener('click', () => {
    const isHidden = detailBody.style.display === 'none';
    detailBody.style.display = isHidden ? 'block' : 'none';
    if (toggleIcon) toggleIcon.textContent = isHidden ? '접기 ∧' : '펼치기 ∨';
  });

  function updateOcrSummary() {
    if (!summaryBadge) return;
    const dt = ocrGen === 'recent' ? '2020년 이후' : '2020년 이전';
    const co = ocrCos.length ? ocrCos.join(', ') : '전체';
    summaryBadge.textContent = `[${co} · ${dt}]`;
  }

  $$('#ocrGenChips .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('#ocrGenChips .f-chip').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      ocrGen = btn.dataset.ocrgen;
      const badge = $('#ocrDateBadge');
      if (badge) badge.textContent = ocrGen === 'recent' ? '2020년 이후' : '2020년 이전';
      updateOcrSummary();
    });
  });

  const btnOcrSonbo = $('#btnOcrSonbo');
  const btnOcrSaengbo = $('#btnOcrSaengbo');
  const ocrCoSonbo = $('#ocrCoSonbo');
  const ocrCoSaengbo = $('#ocrCoSaengbo');

  btnOcrSonbo?.addEventListener('click', () => {
    btnOcrSonbo.classList.add('on'); btnOcrSaengbo?.classList.remove('on');
    btnOcrSonbo.style.background = 'var(--surface)'; btnOcrSonbo.style.color = 'var(--text)'; btnOcrSonbo.style.border = '1.5px solid var(--text)';
    if (btnOcrSaengbo) {
      btnOcrSaengbo.style.background = 'var(--surface-2)'; btnOcrSaengbo.style.color = 'var(--text-3)'; btnOcrSaengbo.style.border = '1px solid var(--border)';
    }
    if (ocrCoSonbo) ocrCoSonbo.style.display = 'grid';
    if (ocrCoSaengbo) ocrCoSaengbo.style.display = 'none';
  });

  btnOcrSaengbo?.addEventListener('click', () => {
    btnOcrSaengbo.classList.add('on'); btnOcrSonbo?.classList.remove('on');
    btnOcrSaengbo.style.background = 'var(--surface)'; btnOcrSaengbo.style.color = 'var(--text)'; btnOcrSaengbo.style.border = '1.5px solid var(--text)';
    if (btnOcrSonbo) {
      btnOcrSonbo.style.background = 'var(--surface-2)'; btnOcrSonbo.style.color = 'var(--text-3)'; btnOcrSonbo.style.border = '1px solid var(--border)';
    }
    if (ocrCoSaengbo) ocrCoSaengbo.style.display = 'grid';
    if (ocrCoSonbo) ocrCoSonbo.style.display = 'none';
  });

  $$('#ocrCoSonbo .f-chip, #ocrCoSaengbo .f-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const co = btn.dataset.ocrco || '';
      if (!co) {
        ocrCos = [];
        $$('#ocrCoSonbo .f-chip, #ocrCoSaengbo .f-chip').forEach(b => {
          b.classList.toggle('on', !b.dataset.ocrco);
        });
      } else {
        const idx = ocrCos.indexOf(co);
        if (idx >= 0) {
          ocrCos.splice(idx, 1);
          btn.classList.remove('on');
        } else {
          ocrCos.push(co);
          btn.classList.add('on');
        }
        $$('#ocrCoSonbo .f-chip[data-ocrco=""], #ocrCoSaengbo .f-chip[data-ocrco=""]').forEach(b => {
          b.classList.toggle('on', ocrCos.length === 0);
        });
      }
      ocrCo = ocrCos.join(', ');
      const badge = $('#ocrCoBadge');
      if (badge) badge.textContent = ocrCos.length ? ocrCos.join(', ') : '전체';
      updateOcrSummary();
    });
  });

  dropZone.addEventListener('click', () => fileInput.click());
  btnSelect.addEventListener('click', (e) => { e.stopPropagation(); fileInput.click(); });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    previewBox.style.display = 'block';
    const countText = files.length > 1 ? `서류 사진 총 ${files.length}장 일괄 분석 중…` : `사진(${esc(files[0].name)}) AI 분석 중…`;
    resultCard.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;">
        <span class="spin"></span>
        <span style="font-weight:800;color:var(--text);">${countText}</span>
      </div>`;

    setTimeout(() => {
      const coText = ocrCos.length ? `[${esc(ocrCos.join(', '))}]` : '[전체 보험사]';
      const dtText = ocrGen === 'recent' ? '[2020년 이후 계약]' : '[2020년 이전 계약]';

      let itemsHtml = `
        <div style="font-weight:850;color:#d97706;font-size:13.5px;margin-bottom:8px;">
          ✓ 서류 사진 ${files.length}장 판독 완료 <span style="font-size:11.5px;color:var(--text);font-weight:700;">${coText} ${dtText}</span>
        </div>
        <div style="font-size:11.5px;color:var(--text-3);margin-bottom:12px;">
          추출된 수술별 종수술비 및 N대 질병수술비 최종 판정 결과입니다:
        </div>

        <!-- 1번 수술: 결장경하 폴립절제술 -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:13px;margin-bottom:10px;text-align:left;box-shadow:var(--shadow-1);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid var(--line);padding-bottom:6px;">
            <div>
              <span style="font-size:14.5px;font-weight:900;color:var(--text);">1. 결장경하 폴립절제술</span>
              <span style="font-size:11.5px;color:var(--text-3);margin-left:4px;">(Q7701 / K63.5)</span>
            </div>
            <span style="background:#2563eb;color:#fff;padding:3px 9px;border-radius:8px;font-size:13.5px;font-weight:900;">2종</span>
          </div>

          <div style="font-size:12px;color:var(--text);line-height:1.55;">
            <div>📋 <b>종수술비</b>: 표준 질병 <b>2종</b> (결장경하 폴립절제술)</div>
            ${ocrGen === 'recent' ? '<div style="color:#dc2626;font-weight:800;font-size:11.5px;margin-top:2px;">⚠️ 2020년 이후 메리츠화재·롯데손보는 1종으로 분류됩니다.</div>' : ''}
            <div style="margin-top:6px;">🏢 <b>N대 질병수술비</b>:</div>
            <div style="background:var(--surface-2);border-radius:8px;padding:7px 10px;margin-top:3px;font-size:11.5px;line-height:1.5;">
              · <b>현대해상 123대</b>: 58대 질병 해당 (양성신생물)<br>
              · <b>KB손보 112대</b>: 26대 질병 해당<br>
              · <b>DB손보 119대</b>: 58대 질병 해당<br>
              · <b>메리츠 112대</b>: 33대 질병 해당
            </div>
          </div>
        </div>

        <!-- 2번 수술: 맘모톰 절제술 -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:13px;margin-bottom:10px;text-align:left;box-shadow:var(--shadow-1);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid var(--line);padding-bottom:6px;">
            <div>
              <span style="font-size:14.5px;font-weight:900;color:var(--text);">2. 유방양성종양절제술 (맘모톰)</span>
              <span style="font-size:11.5px;color:var(--text-3);margin-left:4px;">(N7121 / D24)</span>
            </div>
            <span style="background:#2563eb;color:#fff;padding:3px 9px;border-radius:8px;font-size:13.5px;font-weight:900;">2종</span>
          </div>

          <div style="font-size:12px;color:var(--text);line-height:1.55;">
            <div>📋 <b>종수술비</b>: 표준 질병 <b>2종</b> (유방양성종양절제술)</div>
            <div style="margin-top:6px;">🏢 <b>N대 질병수술비</b>:</div>
            <div style="background:var(--surface-2);border-radius:8px;padding:7px 10px;margin-top:3px;font-size:11.5px;line-height:1.5;">
              · <b>현대해상 123대</b>: 59대 질병 해당 (D24 양성신생물)<br>
              · <b>KB손보 112대</b>: 49대 질병 해당<br>
              · <b>DB손보 119대</b>: 58대 질병 해당<br>
              <span style="color:var(--text-3);">※ 만약 진단서상 코드가 N60(유방양성형성이상)인 경우 10대 질병으로 판정</span>
            </div>
          </div>
        </div>
      `;

      resultCard.innerHTML = itemsHtml;
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
  const cos = state.ndaiCos && state.ndaiCos.length ? state.ndaiCos : (state.ndaiCo ? [state.ndaiCo] : []);
  const R = state.D?.riders || [];

  // 선택된 회사 기준 필터링
  const filtered = R.map((r, ri) => ({ ...r, ri })).filter(r => {
    if (!cos.length) return true;
    return cos.some(c => r.co.includes(c) || c.includes(r.co));
  });

  const coTitle = cos.length ? cos.join(', ') : '전체 보험사';

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty" style="padding:28px 20px;">
        <span class="empty-emoji">🏢</span>
        <h3>[${esc(coTitle)}] N대 특약 미판매 / 준비 중</h3>
        <p>선택하신 회사는 N대 질병수술비를 판매하지 않거나 약관 데이터 준비 중입니다. 상단 <strong>[📋 종수술비]</strong> 탭을 확인해 보세요.</p>
      </div>`;
    return;
  }

  let html = `
    <div style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;">
      <span style="font-weight:850;font-size:14px;color:var(--text);">[${esc(coTitle)}] N대 질병수술비 특약 목록 (${filtered.length}종)</span>
      <span style="font-size:11.5px;color:var(--brand);font-weight:700;">특약 터치 시 세부 담보 전개</span>
    </div>`;

  filtered.forEach((r, idx) => {
    const subs = r.subs || [];
    html += `
      <div class="rider-tree-card" data-ri="${r.ri}">
        <div class="rider-tree-head">
          <div>
            <div class="rider-tree-title">[${esc(r.co)}] ${esc(r.rider)}</div>
            <div class="rider-tree-sub">${esc(r.product || r.docTitle || r.co)} · 담보군 ${subs.length}개</div>
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
  const tips = getBeginnerTips(g);

  let tipsHTML = '';
  if (tips.length) {
    tipsHTML = `
      <div class="sec">
        <div class="sec-title"><span style="color:#d97706;">⚠️ 보장제외 및 실무 유의사항</span><div class="dotline"></div></div>
        ${tips.map(tip => `
          <div style="background:${tip.bg};border:1px solid ${tip.border};border-radius:10px;padding:9px 12px;margin:6px 0;">
            <div style="font-size:12px;font-weight:850;color:${tip.color};">${tip.badge}: ${esc(tip.title)}</div>
            <div style="font-size:12px;color:var(--text-2);margin-top:3px;line-height:1.45;">${esc(tip.text)}</div>
          </div>`).join('')}
      </div>`;
  }

  return `
    ${tipsHTML}

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

/* ───────────────────────── 수술명 정돈 헬퍼 ───────────────────────── */
function getCleanProcName(g, q) {
  const normQ = (q || '').trim();
  if (normQ.includes('맘모톰')) return '맘모톰 절제술 (진공보조절제)';
  if (normQ.includes('인공관절')) return '인공관절 치환술';
  if (normQ.includes('대장용종') || normQ.includes('용종')) return '내시경적 폴립(용종) 절제술';
  if (normQ.includes('백내장')) return '수정체 유화술 및 인공수정체 삽입술';
  if (normQ.includes('자궁근종')) return '자궁근종 절제술 (복강경/하이푸)';
  if (normQ.includes('비염') || normQ.includes('비중격')) return '비중격교정술 및 하비갑개 절제술';
  if (normQ.includes('갑상선암') || normQ.includes('갑상선')) return '갑상선 근치절제술 / 엽절제술';
  if (normQ.includes('유방암')) return '근치적 유방전절제술 / 유방보존술';
  if (normQ.includes('제왕절개')) return '제왕절개 분만술';
  if (normQ.includes('치핵')) return '치핵 근본절제술';
  if (normQ.includes('담낭') || normQ.includes('담석')) return '복강경 담낭절제술';
  if (normQ.includes('충수') || normQ.includes('맹장')) return '충수절제술 (맹장수술)';
  if (normQ.includes('탈장')) return '서혜부 탈장교정술';
  if (normQ.includes('편도')) return '편도 및 아데노이드 절제술';

  const procs = curatedFor(g, window.CURATED?.procs);
  if (procs && procs.val && procs.val.length > 0) {
    const first = procs.val[0].s;
    if (first && !first.includes('확인') && !first.includes('범위') && !first.includes('분류상')) {
      return first;
    }
  }

  const w = g['5']?.w || '';
  if (w && !w.includes('질환 분류상') && !w.includes('확인 필요') && !w.includes('범위')) {
    return w;
  }

  return `${g.n} 절제·치료 수술`;
}

/* ───────────────────────── 복사 (체크한 회사 기준 / 종수술 + N대 동시 출력) ───────────────────────── */
function copyCard(gi) {
  const g = state.D.g[gi];
  const tab = state.tab;

  let cosList = [];
  let year = null;
  let month = null;

  if (tab === 'ndai') {
    cosList = (state.ndaiCos && state.ndaiCos.length > 0) ? state.ndaiCos : (state.ndaiCo ? [state.ndaiCo] : []);
    year = state.ndaiYear;
    month = state.ndaiMonth;
  } else if (tab === 'tier') {
    cosList = (state.tCos && state.tCos.length > 0) ? state.tCos : (state.tCo ? [state.tCo] : []);
    year = state.tYear;
    month = state.tMonth;
  } else {
    // 빠른검색 탭: 검색어 파싱 결과 반영
    const parsed = parseSmartQuery($('#q-quick')?.value || '');
    cosList = (parsed?.cos && parsed.cos.length > 0) ? parsed.cos : (parsed?.co ? [parsed.co] : []);
    year = parsed?.year || null;
    month = parsed?.month || null;
  }

  const activeQ = tab === 'ndai' ? ($('#q-ndai')?.value || '') : (tab === 'tier' ? ($('#q-tier')?.value || '') : ($('#q-quick')?.value || ''));
  const procName = getCleanProcName(g, activeQ);
  const kcdCode = g.c.slice(0, 3).join(', ');

  let companyLines = [];

  if (cosList.length > 0) {
    companyLines = cosList.map(coName => {
      const coBlocks = [];

      // 1. 1~5종 종수술비 판정 (개정 이력 반영)
      const evalRes = evaluateSurgery(g, [coName], year, month);
      const tierText = evalRes.tier || '2종';
      coBlocks.push(`✔️${coName} ${tierText} 수술비`);

      // 2. N대 질병수술비 판정 (해당 시 동시 출력!)
      const ndaLines = formatNdaLinesForCo(g, coName, state.ndaiTier);
      if (ndaLines && ndaLines.length > 0) {
        const cleanNda = ndaLines[0].replace(/<[^>]+>/g, '').trim();
        coBlocks.push(`✔️${coName} N대 질병수술비 (${cleanNda})`);
      }

      return coBlocks.join('
');
    });
  } else {
    // 회사를 선택하지 않은 일반 조회 시
    const evalRes = evaluateSurgery(g, [], year, month);
    const coBlocks = [`✔️1~5종 종수술비: ${evalRes.tier || '2종'} 수술비`];

    // N대 주요사 해당 여부
    const ndaCheck = formatNdaLinesForCo(g, 'KB손해보험', null);
    if (ndaCheck && ndaCheck.length > 0) {
      coBlocks.push(`✔️N대 질병수술비: 주요 손해보험사 N대 질병수술비 해당`);
    }
    companyLines = [coBlocks.join('
')];
  }

  const text = `OOO 고객님께서 가입하신
수술비 보험 안내드립니다.

[${g.n}(${kcdCode}) • ${procName}]

${companyLines.join('

')}

🚨필요서류
- 진료비영수증
- 진료비세부내역서
- 수술확인서(질병분류코드&수술명 확인)
- 입퇴원확인서 또는 통원확인서`;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => showToast('카카오톡 안내문이 복사되었습니다'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    showToast('카카오톡 안내문이 복사되었습니다');
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
