
function generateClauseSuggestions(rawQ) {
  const normQ = (rawQ || '').trim().toLowerCase();
  return [
    { label: '메리츠화재 112대', q: '멜츠 112대' },
    { label: '삼성화재 116대', q: '삼성 116대' },
    { label: '현대해상 119대·124대', q: '현대 119대' },
    { label: 'DB손해보험 85대', q: 'DB 85대' },
    { label: '메리츠화재 64대', q: '멜츠 64대' },
    { label: 'KB손해보험 112대', q: 'KB 112대' }
  ];
}

window.handleNdaiDirectJump = function(btn, event) {
  if (event) {
    try { event.preventDefault(); } catch(e){}
    try { event.stopPropagation(); } catch(e){}
  }
  const q = btn.getAttribute('data-search') || '';
  const cid = btn.getAttribute('data-cid');
  const pid = btn.getAttribute('data-pid');
  
  const inp = document.querySelector('#clauseCompanySearchInput');
  if (inp) {
    inp.value = q;
  }
  if (typeof state !== 'undefined' && state) {
    state.clauseSearchQuery = q;
  }

  if (typeof renderClausesCompanyList === 'function') {
    renderClausesCompanyList(q);
  } else if (typeof window.renderClausesCompanyList === 'function') {
    window.renderClausesCompanyList(q);
  }
  
  if (cid) {
    setTimeout(() => {
      const freshContainer = document.querySelector('#clausesCompanyList');
      if (!freshContainer) return;
      const coBtn = freshContainer.querySelector(`.btn-toggle-co[data-co-id="${cid}"]`);
      const coDrawer = freshContainer.querySelector(`#co-periods-${cid}`);
      if (coDrawer) {
        coDrawer.style.display = 'flex';
        if (coBtn) {
          const arrow = coBtn.querySelector('.btn-co-toggle-arrow');
          if (arrow) arrow.textContent = '접기 ▴';
        }
      }
      if (pid) {
        const pBtn = freshContainer.querySelector(`.btn-toggle-period[data-co-id="${cid}"][data-pid="${pid}"]`);
        const pDrawer = freshContainer.querySelector(`#period-drawer-${cid}-${pid}`);
        if (pDrawer) {
          pDrawer.style.display = 'flex';
          if (pBtn) {
            const pArrow = pBtn.querySelector('.period-arrow-badge');
            if (pArrow) {
              pArrow.textContent = '접기 ▴';
              pArrow.style.background = 'var(--brand)';
              pArrow.style.color = '#fff';
            }
          }
        }
      }
      const targetCard = freshContainer.querySelector(`.btn-toggle-co[data-co-id="${cid}"]`) || freshContainer.firstElementChild;
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  }
};

function bindNdaiDirectJumpEvents(container) {
  if (!container) return;
  container.querySelectorAll('.btn-ndai-direct-jump').forEach(btn => {
    btn.addEventListener('click', (e) => {
      window.handleNdaiDirectJump(btn, e);
    });
  });
}

/* ══════════════════════════════════════════════════════════
   보험비서 수술비 사전 — app.js (v20261109a)
   하이브리드 스마트 검색 · 종수술비 & N대 질병수술비 분리 완성형
   ══════════════════════════════════════════════════════════ */
(() => {
'use strict';

window.addEventListener('error', (e) => {
  window.__LAST_ERR = (e.message || '') + ' at ' + (e.filename || '') + ':' + (e.lineno || '');
});

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = (s) => String(s || '').replace(/[\s·,.\-()\[\]{}'"`~!@#$%^&*_+=|\\/:;?<>]/g, '').toLowerCase().replace(/캐손/g, '케손').replace(/캐이비/g, '케이비').replace(/캐라/g, '케라');
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

/* ───────────────────────── 수술코드(EDI 수가코드) ↔ 질병/수술 등급 매핑 ───────────────────────── */
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
  // 순환기내과 및 혈관외과 (하지정맥류 등)
  'M6551': { codes: ['I20', 'I21'], name: '경피적 관상동맥스텐트삽입술(1혈관)', tier: '3~4종' },
  'M6552': { codes: ['I20', 'I21'], name: '경피적 관상동맥스텐트삽입술(2혈관이상)', tier: '3~4종' },
  'O1241': { codes: ['I83'], name: '광범위정맥류발거술(단측)', tier: '2~3종' },
  'O1242': { codes: ['I83'], name: '광범위정맥류발거술(양측)', tier: '2~3종' },
  'O1251': { codes: ['I83'], name: '정맥류국소제거술(단측)', tier: '1~2종' },
  'O1261': { codes: ['I83'], name: '복재정맥결찰술', tier: '1~2종' },
  // 비뇨의학과
  'R3421': { codes: ['N40'], name: '경요도 전립선절제술(TURP)', tier: '3종' },
  'R3431': { codes: ['N40'], name: '경요도 전립선결찰술(유로리프트)', tier: '1~2종 (비급여/분쟁)' },
  'R3441': { codes: ['N40'], name: '홀뮴레이저 전립선적출술(HoLEP)', tier: '3종' },
  'R3461': { codes: ['N40'], name: '전립선고수압분사절제술(워터젯/아쿠아블레이션)', tier: '3종' },
  'R3221': { codes: ['N20', 'N21', 'N22', 'N23'], name: '체외충격파쇄석술(ESWL)', tier: '회사별 상이 (1종 또는 2종)' },
  // 척추 및 치과 신의료기술/다빈도
  'O1441': { codes: ['J34.8', 'J34.2'], name: '비밸브재건술', tier: '2~3종' },
  'O1451': { codes: ['J32'], name: '풍선카테터부비동확장술', tier: '2종' },
  'N0321': { codes: ['M51', 'M50'], name: '경피적 척추디스크감압술(고주파/레이저)', tier: '3종' },
  'N0331': { codes: ['M80', 'S22', 'S32'], name: '경피적 척추체성형술(골시멘트)', tier: '3종' },
  'U1010': { codes: ['K08.1', 'K08'], name: '치조골이식술(골이식술)', tier: '2종 (표준 1~5종 33항)' },
  // 관절·연골 재생 및 줄기세포 수술 (카티스템, 카티라이프 등)
  'N0711': { codes: ['M17', 'M23'], name: '자가골연골이식술 (관절경)', tier: '2~3종' },
  'N0712': { codes: ['M17', 'M23'], name: '자가골연골이식술 (관혈적)', tier: '3종' },
  'N0721': { codes: ['M17', 'M23'], name: '관절연골 결손 줄기세포치료제 이식술 (카티스템·카티라이프-관절경)', tier: '2~3종 (관절경하 수술)' },
  'N0722': { codes: ['M17', 'M23'], name: '관절연골 결손 줄기세포치료제 이식술 (카티스템·카티라이프-관혈)', tier: '3종 (관혈적 사지관절수술)' },
  'N0691': { codes: ['M17', 'M23'], name: '관절경하 연골성형술 및 미세골절술', tier: '2종' },
  'N0692': { codes: ['M17', 'M23'], name: '관절경하 반월상연골절제술/봉합술', tier: '2~3종' },
  'N0651': { codes: ['M17'], name: '근위경골절골술(HTO 휜다리교정술)', tier: '3종' },
  'N0881': { codes: ['M23.5', 'M23'], name: '관절경하 십자인대재건술(ACL/PCL)', tier: '3종' }
};

/* ───────────────────────── 유사 명칭 직관 비교 (체외충격파 vs 쇄석술 등) ───────────────────────── */
const COMPARISON_PAIRS = [
  {
    id: 'cartistem_vs_conjuran',
    keys: ['카티스템', '카티라이프', '콘쥬란', '줄기세포', '연골주사', 'cartistem', 'cartilife'],
    title: '⚡ 무릎 연골 2대 치료 직관 비교 (카티스템 vs 콘쥬란)',
    items: [
      {
        name: '카티스템/카티라이프 줄기세포 이식',
        badge: '⭕ 수술비 지급 (3종/2종)',
        badgeColor: '#fff',
        badgeBg: '#2563eb',
        borderColor: '#2563eb',
        boxBg: 'rgba(37, 99, 235, 0.06)',
        target: '퇴행성 관절염 연골 결손 (M17, M23)',
        nature: '절개 또는 관절경하 연골 미세천공 및 줄기세포 이식',
        payout: '질병수술비 + 종수술 3종(관혈)/2종(관절경)'
      },
      {
        name: '콘쥬란/히알루론산 관절강 주사',
        badge: '❌ 수술비 비해당',
        badgeColor: '#fff',
        badgeBg: '#dc2626',
        borderColor: '#ef4444',
        boxBg: 'rgba(239, 68, 68, 0.06)',
        target: '무릎 관절 연골 마모 및 관절강 염증',
        nature: '주사 바늘로 약물 주입 (수술 아닌 단순 주사)',
        payout: '수술비 전사 면책 (실손의료비만 가능)'
      }
    ]
  },
  {
    id: 'eswt_vs_eswl',
    keys: ['체외충격파', '충격파', '체외충격파치료', '체외충격파쇄석', '체외충격파쇄석술', '쇄석술', '쇄석', 'eswt', 'eswl'],
    title: '⚡ 유사 명칭 직관 비교: 체외충격파 (ESWT) vs 체외충격파쇄석술 (ESWL)',
    items: [
      {
        name: '체외충격파치료 (ESWT)',
        badge: '❌ 수술비 비해당',
        badgeColor: '#fff',
        badgeBg: '#dc2626',
        borderColor: '#ef4444',
        boxBg: 'rgba(239, 68, 68, 0.06)',
        target: '관절·근육 통증 (족저근막염 등)',
        nature: '외래 물리치료 (*약관 본문 제외 명시)',
        payout: '수술비 전사 면책 (*ESWT 제외) · 실손만 청구'
      },
      {
        name: '체외충격파쇄석술 (ESWL)',
        badge: '⭕ 2종 (현대 1·2종)',
        badgeColor: '#fff',
        badgeBg: '#2563eb',
        borderColor: '#2563eb',
        boxBg: 'rgba(37, 99, 235, 0.06)',
        target: '신장·요관 결석 파쇄 배출 (N20)',
        nature: '체외 충격파 결석 분쇄 (생보 37항 / 손보 85항)',
        payout: '표준 2종 (60일내 1회) · 현대해상 특약별 1·2종'
      }
    ]
  },
  {
    id: 'spine_block_neuro_disc',
    keys: ['신경차단술', '신경차단', '신경성형술', '신경성형', '유착박리', '신경유착박리술', '락츠', 'racz', '경막외차단술'],
    title: '⚡ 척추 3대 시술·수술 직관 비교 (신경차단 vs 신경성형 vs 수핵절제)',
    items: [
      {
        name: '신경차단술 (Block)',
        badge: '❌ 수술비 비해당',
        badgeColor: '#fff',
        badgeBg: '#dc2626',
        borderColor: '#ef4444',
        boxBg: 'rgba(239, 68, 68, 0.06)',
        target: '디스크·협착 신경 염증',
        nature: '주사기 약물 주입 (천자·주사)',
        payout: '약관상 명시적 제외 (실손만 가능)'
      },
      {
        name: '신경성형술 (RACZ)',
        badge: '⚠️ 원칙 비해당',
        badgeColor: '#fff',
        badgeBg: '#ea580c',
        borderColor: '#ea580c',
        boxBg: 'rgba(234, 88, 12, 0.06)',
        target: '척추관 신경 유착·부종',
        nature: '특수 카테터 약물 세척·박리',
        payout: '절제 없어 수술비 부지급 (실손 비급여)'
      },
      {
        name: '수핵절제술 / 감압술',
        badge: '⭕ 3종 정식수술',
        badgeColor: '#fff',
        badgeBg: '#2563eb',
        borderColor: '#2563eb',
        boxBg: 'rgba(37, 99, 235, 0.06)',
        target: '돌출 추간판(디스크) 파편',
        nature: '내시경/관혈 조직 절단·절제',
        payout: '종수술비 [3종] + N대 수술비 지급'
      }
    ]
  },
  {
    id: 'delivery_normal_vs_csec',
    keys: ['출산', '분만', '자연분만', '질식분만', '정상분만', '제왕절개', '제왕절개술', '제왕', '회음절개', '회음부절개', '임신출산', '분만수술'],
    title: '⚡ 임신·출산 분만 수술비 직관 비교: 자연분만 vs 제왕절개',
    items: [
      {
        name: '자연분만 (회음절개)',
        badge: '❌ 수술비 비해당',
        badgeColor: '#fff',
        badgeBg: '#dc2626',
        borderColor: '#ef4444',
        boxBg: 'rgba(239, 68, 68, 0.06)',
        target: '정상 질식 분만 및 회음부 절개 (O80)',
        nature: '정상 생리적 분만 (질병·상해 아님)',
        payout: '수술비·실손의료비 전사 면책 (부지급)'
      },
      {
        name: '제왕절개 (만출술)',
        badge: '⭕ 1~5종 1종 지급',
        badgeColor: '#fff',
        badgeBg: '#2563eb',
        borderColor: '#2563eb',
        boxBg: 'rgba(37, 99, 235, 0.06)',
        target: '복부 및 자궁 절개 분만 (O82)',
        nature: '복부절개 태아 만출술 (표준 54항)',
        payout: '1~5종 [제54항 1종] 지급 (실손·기본질병 제외)'
      }
    ]
  },
  {
    id: 'cataract_vs_lasik',
    keys: ['다초점', '다초점렌즈', '다초점인공수정체', '다초점렌즈삽입술', '단초점', '단초점렌즈', '인공수정체', '라식', '라섹', '스마일라식', '렌즈삽입술', 'icl', '시력교정', '시력교정술'],
    title: '⚡ 안과 시술·수술 직관 비교: 라식/라섹 vs 백내장 다초점/단초점',
    items: [
      {
        name: '라식·라섹 시력교정',
        badge: '❌ 수술비 비해당',
        badgeColor: '#fff',
        badgeBg: '#dc2626',
        borderColor: '#ef4444',
        boxBg: 'rgba(239, 68, 68, 0.06)',
        target: '근시·원시·난시 시력교정',
        nature: '안경 대체 목적 각막 절삭',
        payout: '약관상 "시력교정술" 전사 면책 (수술비·실손 불가)'
      },
      {
        name: '백내장 렌즈삽입술',
        badge: '⭕ 1~5종 1종 지급',
        badgeColor: '#fff',
        badgeBg: '#2563eb',
        borderColor: '#2563eb',
        boxBg: 'rgba(37, 99, 235, 0.06)',
        target: '혼탁 수정체 유화 및 인공수정체 삽입 (H25)',
        nature: '수정체 관혈수술 (표준 제71항)',
        payout: '다초점·단초점 무관 [1종] 지급 (16년이후 실손 렌즈비 제외)'
      }
    ]
  },
  {
    id: 'implant_vs_bonegraft',
    keys: ['임플란트', '치조골', '치조골이식', '치조골이식술', '골이식', '골이식술', '뼈이식', '치아식립'],
    title: '⚡ 치과 시술 직관 비교: 단순 임플란트 vs 치조골이식술',
    items: [
      {
        name: '단순 임플란트 식립',
        badge: '❌ 수술비 비해당',
        badgeColor: '#fff',
        badgeBg: '#dc2626',
        borderColor: '#ef4444',
        boxBg: 'rgba(239, 68, 68, 0.06)',
        target: '상실 치아 픽스처(나사) 식립',
        nature: '약관상 "치아 관련 처치" 제외 규정',
        payout: '종수술비·질병수술비 부지급 (치아보험만 가능)'
      },
      {
        name: '치조골이식술 (골이식)',
        badge: '⭕ 1~5종 2종 지급',
        badgeColor: '#fff',
        badgeBg: '#2563eb',
        borderColor: '#2563eb',
        boxBg: 'rgba(37, 99, 235, 0.06)',
        target: '잇몸 뼈 결손부 동종·자가골 이식 (K08.1)',
        nature: '골이식술 (표준 1~5종 제33항)',
        payout: '1~5종 [제33항 골이식술 2종] 정상 지급'
      }
    ]
  },
  {
    id: 'biopsy_vs_mammotome',
    keys: ['생검', '침생검', '조직검사', '총생검'],
    title: '⚡ 검사 vs 수술 직관 비교: 단순 침생검 vs 맘모톰 절제술',
    items: [
      {
        name: '단순 침생검 (Needle Biopsy)',
        badge: '❌ 검사 비해당',
        badgeColor: '#fff',
        badgeBg: '#dc2626',
        borderColor: '#ef4444',
        boxBg: 'rgba(239, 68, 68, 0.06)',
        target: '유방·갑상선 의심 종양',
        nature: '진단 목적 조직 일부 채취 (검사)',
        payout: '치료 목적 수술 아님 (수술비 전사 면책)'
      },
      {
        name: '맘모톰 절제술 (진공보조절제)',
        badge: '⭕ 2종 수술비 지급',
        badgeColor: '#fff',
        badgeBg: '#2563eb',
        borderColor: '#2563eb',
        boxBg: 'rgba(37, 99, 235, 0.06)',
        target: '유방 섬유선종·양성종양',
        nature: '진공 흡입 바늘로 종양 전체 절제',
        payout: '표준 1~5종 [2종] 지급 (단순검사 제외)'
      }
    ]
  },
  {
    id: 'suture_vs_debridement',
    keys: ['단순봉합', '창상봉합', '피부봉합', '봉합술', '꿰맴', '상처봉합'],
    title: '⚡ 상처 봉합 직관 비교: 단순 피부봉합 vs 근봉합술 / 변연절제술',
    items: [
      {
        name: '단순 피부봉합술',
        badge: '❌ 수술비 비해당',
        badgeColor: '#fff',
        badgeBg: '#dc2626',
        borderColor: '#ef4444',
        boxBg: 'rgba(239, 68, 68, 0.06)',
        target: '표피 및 진피 표층 열상',
        nature: '단순 피부 꿰맴 (외래 처치)',
        payout: '수술비 부지급 · 실손 및 응급실내원비 청구'
      },
      {
        name: '근봉합술 / 변연절제술 동반',
        badge: '⭕ 1종 지급 가능',
        badgeColor: '#fff',
        badgeBg: '#059669',
        borderColor: '#059669',
        boxBg: 'rgba(5, 150, 105, 0.06)',
        target: '근육층 파열 또는 오염 괴사조직',
        nature: '근육층 봉합 또는 괴사조직 절제술',
        payout: '종수술비 [1종] 지급 (수술확인서 근봉합 명기 필수)'
      }
    ]
  }
];

/* ───────────────────────── 수술비 비해당 / 시술 / 처치 / 면책 판정 DB ───────────────────────── */
const EXCLUDED_PROCEDURES = [
  {
    keys: ['신경차단술', '신경차단', '블럭', 'block', 'nerveblock', '경막외차단술', '신경근차단술', '후관절차단술'],
    name: '신경차단술 (Nerve Block)',
    verdict: '수술비 비해당 (지급 불가)',
    badge: '❌ 수술비 비해당 (약관상 명시적 제외)',
    badgeBg: '#ef4444',
    reason: '표준약관상 “신경차단(Nerve Block)”은 수술의 정의에서 명시적으로 제외',
    detail: '표준 1~5종 및 질병수술비 약관은 “흡인, 천자 등의 조치 및 신경차단(Nerve Block)은 제외한다”고 규정하고 있습니다. C-arm 영상 유도하에 주사 바늘로 국소마취제와 소염제를 신경 부위에 투여하는 주사 처치이므로 수술비가 지급되지 않습니다.',
    relatedDisease: '추간판장애(목·허리디스크 M50·M51) · 척추관협착증(M48)',
    relatedCodes: ['M50', 'M51', 'M48'],
    silson: '실손의료비(통원/입원)에서 질병 치료 목적의 급여/비급여 주사료로 정상 청구 가능',
    altSurgery: '추간판절제술(3종) · 내시경하 수핵제거술(3종) · 척추유합술(4종)'
  },
  {
    keys: ['이물주입술', '이물주입', '주입술', '필러주입', '보형물주입'],
    name: '이물주입술 (보형물·필러·약물 주입)',
    verdict: '수술비 비해당 (지급 불가)',
    badge: '❌ 수술비 비해당 (수술 정의 미충족)',
    badgeBg: '#ef4444',
    reason: '약관상 수술 정의(생체 절단·절제) 미충족 및 단순 주입·천자 제외',
    detail: '약관상 수술은 생체에 절단(특정 부위를 잘라 없앰), 절제(특정 부위를 잘라 냄) 등의 조작을 가하는 것을 의미합니다. 주사기나 카테터로 이물질, 약물, 필러 등을 주입하는 행위는 약관상 수술에 해당하지 않습니다.',
    relatedDisease: '안면·피부 연조직 질환 또는 비뇨기계 기능성 주입',
    relatedCodes: [],
    silson: '치료 목적(미용 제외) 시 실손의료비 검토 가능하나, 단순 미용성형 주입은 전액 면책',
    altSurgery: '외과적 절제술 또는 근치적 재건수술'
  },
  {
    keys: ['신경성형술', '경막외신경성형술', '경막외유착박리술', '락츠', 'racz', '신경유착박리술', '감압신경성형술'],
    name: '경막외 신경성형술 (신경유착박리술 / RACZ 카테터)',
    verdict: '원칙적 비해당 (부지급 / 분쟁 다수)',
    badge: '⚠️ 원칙적 비해당 (분쟁 항목)',
    badgeBg: '#ea580c',
    reason: '절개·절단 조작 없는 카테터 유착박리 및 약물주입 시술',
    detail: '꼬리뼈를 통해 특수 카테터를 삽입하여 염증 물질을 세척하고 신경 유착을 박리하는 비관혈적 시술입니다. 보험사는 “절단·절제 조작이 없는 단순 천자/약물주입 시술”로 보아 종수술비 및 질병수술비를 부지급(면책) 처리합니다.',
    relatedDisease: '추간판장애(목·허리디스크 M50·M51) · 척추관협착증(M48)',
    relatedCodes: ['M50', 'M51', 'M48'],
    silson: '입원/통원 실손의료비에서 비급여 치료비로 청구 가능',
    altSurgery: '내시경적 수핵제거술(3종) · 경피적 디스크감압술(3종) · 척추고정술(4종)'
  },
  {
    keys: ['도수치료', '체외충격파치료', '도수', '물리치료', '체외충격파'],
    name: '도수치료 · 근골격계 체외충격파치료 (ESWT)',
    verdict: '수술비 비해당 (물리치료·재활 처치)',
    badge: '❌ 수술비 비해당',
    badgeBg: '#ef4444',
    reason: '약관상 수술 정의 미해당 (물리치료 및 보존적 재활 처치)',
    detail: '손이나 기구를 이용하여 관절·근육을 교정하거나 충격파를 가하는 보존적 통증 완화 치료로, 수술비 담보의 지급 대상이 아닙니다. (요로결석 쇄석술인 ESWL과 구별 필수)',
    relatedDisease: '근골격계 질환(족저근막염 M72, 회전근개 M75, 관절통 등)',
    relatedCodes: ['M72', 'M75', 'M17'],
    silson: '실손의료비에서 비급여 도수치료·체외충격파로 청구 가능 (가입 세대별 연간 횟수·한도 확인)',
    altSurgery: '관혈적 관절수술(3~4종) · 관절경하 인대/건 수술(3종)'
  },
  {
    keys: ['프롤로주사', '프롤로', '증식치료', 'dna주사', 'pdrn', '연골주사', '히알루론산주사', '뼈주사'],
    name: '프롤로치료 (증식치료) · 관절강내 주사',
    verdict: '수술비 비해당 (주사치료)',
    badge: '❌ 수술비 비해당',
    badgeBg: '#ef4444',
    reason: '약관상 “주사·천자(바늘을 꽂아 약물을 주입하는 것)”는 수술에서 제외',
    detail: '인대나 힘줄, 관절강 내에 고농도 포도당, PDRN, 콜라겐 등을 주사하여 재생을 유도하는 주사 처치로 수술비 지급 대상이 아닙니다.',
    relatedDisease: '무릎관절증(M17) · 회전근개파열(M75) · 족저근막염(M72)',
    relatedCodes: ['M17', 'M75'],
    silson: '실손의료비에서 급여/비급여 주사료로 청구 가능 (치료 목적 소견서 필요)',
    altSurgery: '관절경하 활액막절제술(3종) · 인공관절치환술(4종)'
  },
  {
    keys: ['조직검사', '생검', '침생검', '단순생검', '바늘생검', '총생검'],
    name: '단순 조직검사 (생검 / Needle Biopsy)',
    verdict: '수술비 비해당 (진단 목적 검사)',
    badge: '❌ 수술비 비해당',
    badgeBg: '#ef4444',
    reason: '치료 목적이 아닌 “진단 목적의 단순 검사(생검)”',
    detail: '약관상 수술비는 “치료를 직접적인 목적으로 한 수술”에 한하여 지급됩니다. 진단을 위해 세포나 조직을 소량 떼어내는 단순 생검(침생검, 총생검)은 수술비가 지급되지 않습니다. (단, 맘모톰처럼 병변 완전절제를 동반한 경우 2종 인정)',
    relatedDisease: '유방종양(D24, N60) · 갑상선결절(E04)',
    relatedCodes: ['D24', 'E04'],
    silson: '실손의료비에서 검사비로 정상 청구 가능',
    altSurgery: '양성종양 절제술(2종) · 관혈적 종양적출술(3종)'
  },
  {
    keys: ['단순봉합술', '피부봉합', '창상봉합', '단순봉합', '꿰맴', '봉합술', '상처봉합'],
    name: '단순 피부 창상봉합술 (봉합치료)',
    verdict: '원칙적 비해당 (단순 피부 꿰맴)',
    badge: '⚠️ 단순봉합 비해당',
    badgeBg: '#ea580c',
    reason: '약관상 단순 창상봉합술(피부 표층 봉합)은 수술비 제외',
    detail: '단순히 찢어진 피부 표층만 꿰매는 봉합술은 수술비가 지급되지 않습니다. 다만, 근포/근육층까지 깊게 찢어져 “근봉합술(근육봉합)”을 시행하거나 오염된 괴사조직을 잘라내는 “변연절제술”이 동반 기재된 경우 1종 수술비 청구가 가능합니다.',
    relatedDisease: '열상 · 외상성 창상 (S코드)',
    relatedCodes: ['S01', 'S61', 'S81'],
    silson: '실손의료비 및 응급실내원비, 상해통원일당 청구 가능',
    altSurgery: '근봉합술(1종) · 변연절제술 동반 봉합(1종) · 건봉합술(3종)'
  },
  {
    keys: ['위내시경검사', '대장내시경검사', '단순내시경', '내시경검사'],
    name: '단순 소화기 내시경 검사',
    verdict: '수술비 비해당 (검사 목적)',
    badge: '❌ 수술비 비해당',
    badgeBg: '#ef4444',
    reason: '치료 목적이 아닌 육안 관찰 검사 행위',
    detail: '단순히 위나 대장 내부를 관찰하는 검사는 수술비가 지급되지 않습니다. 검사 도중 용종(폴립)을 발견하여 내시경으로 절제한 경우에만 “내시경적 폴립절제술”로 1~2종 수술비가 지급됩니다.',
    relatedDisease: '위염(K29) · 대장질환(K63)',
    relatedCodes: ['K29', 'K63'],
    silson: '증상(속쓰림, 복통 등) 치료 목적의 검사비는 실손 청구 가능 (단순 정기검진은 면책)',
    altSurgery: '내시경하 용종절제술(폴립절제 1~2종, EMR 2~3종)'
  },
  {
    keys: ['보톡스', '필러', '지방흡입', '쌍꺼풀', '코성형'],
    name: '미용·성형 시술 (보톡스 / 필러 / 지방흡입 등)',
    verdict: '수술비 및 실손 전액 면책 (부지급)',
    badge: '❌ 수술비·실손 전액 면책',
    badgeBg: '#ef4444',
    reason: '약관상 “미용성형 목적의 수술”은 절대적 면책 사유',
    detail: '질병이나 상해의 직접적인 치료 목적이 아닌 외모 개선, 미용, 체형 교정 목적의 시술은 수술비 및 실손의료비에서 전액 면책(지급 제외)됩니다.',
    relatedDisease: '미용 성형',
    relatedCodes: [],
    silson: '면책 (지급 불가)',
    altSurgery: '치료 목적 기능개선 수술인 경우에 한해 예외적 검토'
  },
  {
    keys: ['혈액투석', '복막투석', '투석'],
    name: '혈액투석 · 복막투석',
    verdict: '수술비 비해당 (보존적 여과 치료)',
    badge: '❌ 수술비 비해당',
    badgeBg: '#ef4444',
    reason: '지속적인 체외 순환 여과 치료로 수술 정의 미해당',
    detail: '만성 신부전 환자의 투석 행위 자체는 수술비 지급 대상이 아닙니다. (단, 투석을 위해 혈관을 연결하는 “동정맥루 조성술(혈관수술)”은 2~3종 수술비 지급 대상이며, 인공신장투석치료비 전용 특약으로 청구합니다.)',
    relatedDisease: '만성 신부전 (N18)',
    relatedCodes: ['N18'],
    silson: '입원/통원 실손의료비에서 정상 보상',
    altSurgery: '동정맥루 설치술/성형술(2~3종) · 신장이식술(5종)'
  }
];

function findComparisonPair(normQ) {
  if (!normQ) return null;
  return COMPARISON_PAIRS.find(p => p.keys.some(k => {
    const nk = norm(k);
    return normQ === nk || (nk.length >= 3 && (normQ.includes(nk) || nk.includes(normQ)));
  }));
}

function findExcludedProcedure(normQ) {
  if (!normQ) return null;
  if (normQ.includes('쇄석')) return null; // 쇄석술은 생보 2종 대상이므로 비해당 단독 매칭 제외
  return EXCLUDED_PROCEDURES.find(p => p.keys.some(k => {
    const nk = norm(k);
    return normQ === nk || (nk.length >= 3 && (normQ.includes(nk) || nk.includes(normQ)));
  }));
}

function renderComparisonPairHTML(pair) {
  const is3Cols = pair.items.length === 3;
  return `
    <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:11px;margin-bottom:12px;box-shadow:var(--shadow-1);animation:fadeIn .2s ease;overflow:hidden;box-sizing:border-box;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:9px;flex-wrap:wrap;gap:4px;">
        <span style="font-size:12.5px;font-weight:900;color:var(--brand);">${esc(pair.title)}</span>
        <span style="font-size:10.5px;color:var(--text-3);font-weight:700;">비슷한 시술 직관 비교</span>
      </div>
      <div style="display:grid;grid-template-columns:${is3Cols ? 'repeat(3, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))'};gap:6px;">
        ${pair.items.map(it => `
          <div style="background:${it.boxBg};border:1.5px solid ${it.borderColor};border-radius:10px;padding:7px 5px;text-align:left;display:flex;flex-direction:column;justify-content:space-between;gap:5px;min-width:0;overflow:hidden;box-sizing:border-box;">
            <div style="min-width:0;">
              <div style="margin-bottom:4px;min-width:0;">
                <div style="font-size:11px;font-weight:900;color:var(--text);line-height:1.25;margin-bottom:3px;word-break:keep-all;">${esc(it.name)}</div>
                <span style="display:inline-block;background:${it.badgeBg};color:${it.badgeColor};font-size:9px;font-weight:850;padding:2px 4px;border-radius:4px;line-height:1.15;word-break:keep-all;max-width:100%;box-sizing:border-box;white-space:normal;">${esc(it.badge)}</span>
              </div>
              <div style="font-size:10px;color:var(--text-2);line-height:1.35;margin-top:3px;word-break:keep-all;">
                • <b>대상</b>: ${esc(it.target)}<br>
                • <b>성격</b>: ${esc(it.nature)}
              </div>
            </div>
            <div style="font-size:10px;color:var(--text);font-weight:850;border-top:1px dashed ${it.borderColor};padding-top:4px;margin-top:2px;line-height:1.25;word-break:keep-all;min-width:0;">
              👉 ${esc(it.payout)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderExcludedProcedureHTML(proc) {
  const copyText = `[${proc.name} 수술비 보상 안내]

고객님, 문의하신 ${proc.name}은(는) 보험 약관상 수술비 지급 대상이 아닙니다.

📌 판정: ${proc.verdict}
• 제외 사유: ${proc.reason}
• 상세 내용: ${proc.detail}
• 실손의료비: ${proc.silson}
• 참고: ${proc.altSurgery}`;

  return `
    <div style="background:var(--surface);border:1.5px solid ${proc.badgeBg};border-radius:14px;padding:13px;margin-bottom:12px;box-shadow:var(--shadow-1);animation:fadeIn .2s ease;text-align:left;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
        <span style="background:${proc.badgeBg};color:#fff;font-size:11.5px;font-weight:900;padding:3px 8px;border-radius:8px;">${esc(proc.badge)}</span>
        <span style="font-size:11.5px;color:var(--text-3);font-weight:750;">약관 수술의 정의 판정</span>
      </div>
      <div style="font-size:15.5px;font-weight:900;color:var(--text);margin-bottom:8px;">
        ${esc(proc.name)}
      </div>

      <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:10px;font-size:12px;line-height:1.5;margin-bottom:10px;">
        <div style="margin-bottom:4px;"><b style="color:var(--text);">📌 판정 결과:</b> <span style="font-weight:850;color:${proc.badgeBg};">${esc(proc.verdict)}</span></div>
        <div style="margin-bottom:4px;"><b style="color:var(--text);">📜 약관 제외 사유:</b> <span style="color:var(--text-2);">${esc(proc.reason)}</span></div>
        <div style="margin-bottom:4px;"><b style="color:var(--text);">💡 상세 설명:</b> <span style="color:var(--text-2);">${esc(proc.detail)}</span></div>
        <div style="margin-bottom:4px;"><b style="color:var(--text);">🩺 실손의료비:</b> <span style="color:var(--text-2);">${esc(proc.silson)}</span></div>
        ${proc.relatedDisease ? `<div style="margin-bottom:4px;"><b style="color:var(--text);">🔍 연관 질환:</b> <span style="color:var(--brand);font-weight:800;">${esc(proc.relatedDisease)}</span></div>` : ''}
        <div><b style="color:var(--text);">🛡️ 수술비 인정 대안:</b> <span style="color:var(--text);font-weight:800;">${esc(proc.altSurgery)}</span></div>
      </div>

      <div style="display:flex;justify-content:flex-end;">
        <button type="button" class="f-btn btn-copy-proc" data-copy="${esc(copyText)}" style="background:var(--brand);color:#fff;border:none;padding:7px 14px;border-radius:8px;font-size:12px;font-weight:850;cursor:pointer;">📋 고객 안내문 복사</button>
      </div>
    </div>
  `;
}


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
  { name: '예별(구 MG)손해보험', type: 'sonbo', keys: ['예별손해보험', '예별손보', '예별', '에이별', 'mg손해보험', 'mg손보', '엠손', '엠지손보', '엠지'] },
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

  // 3. 보험사 검출 (복수 회사 동시 추출 지원: 예 '멜츠현대유방', '삼성현대대장용종')
  const companyMatches = [];
  const lowerText = text.toLowerCase();

  for (const item of ALL_SPECIFIC_COMPANY_KEYS) {
    const kLow = item.key.toLowerCase();
    let pos = 0;
    while (pos < lowerText.length) {
      const idxMatch = lowerText.indexOf(kLow, pos);
      if (idxMatch === -1) break;
      companyMatches.push({
        start: idxMatch,
        end: idxMatch + kLow.length,
        len: kLow.length,
        name: item.ca.name,
        type: item.ca.type,
        family: null
      });
      pos = idxMatch + kLow.length;
    }
  }

  for (const fam of ALL_FAMILY_KEYS) {
    const kLow = fam.key.toLowerCase();
    let pos = 0;
    while (pos < lowerText.length) {
      const idxMatch = lowerText.indexOf(kLow, pos);
      if (idxMatch === -1) break;
      const famNames = fam.sonbo && fam.saengbo ? [fam.sonbo, fam.saengbo] : (fam.sonbo ? [fam.sonbo] : [fam.saengbo]);
      companyMatches.push({
        start: idxMatch,
        end: idxMatch + kLow.length,
        len: kLow.length,
        name: fam.sonbo || fam.saengbo,
        names: famNames,
        type: 'family',
        family: fam
      });
      pos = idxMatch + kLow.length;
    }
  }

  companyMatches.sort((a, b) => a.start - b.start || b.len - a.len);

  const chosenMatches = [];
  let lastEnd = 0;
  for (const m of companyMatches) {
    if (m.start >= lastEnd) {
      chosenMatches.push(m);
      lastEnd = m.end;
    }
  }

  if (chosenMatches.length > 0) {
    for (const m of chosenMatches) {
      if (m.names) {
        m.names.forEach(n => {
          if (!foundCos.includes(n)) foundCos.push(n);
        });
      } else if (m.name && !foundCos.includes(m.name)) {
        foundCos.push(m.name);
      }
      if (!foundCo) {
        foundCo = m.name;
        foundCoType = m.type;
        foundFamily = m.family;
      }
    }

    chosenMatches.sort((a, b) => b.start - a.start).forEach(m => {
      text = text.slice(0, m.start) + ' ' + text.slice(m.end);
    });
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
  activeTreeSub: null,
  clauseCat: 'all',
  clauseQ: ''
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
  const [d, e, x, b, t, k78] = await Promise.all([
    fetch('assets/data/diseases.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/edi.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/exc.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/bunri.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/tiers.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)).catch(() => null),
    fetch('assets/data/kdrg78.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)).catch(() => null),
  ]);
  return { d, e, x, b, t, k78 };
}

/* ───────────────────────── 인덱스 빌드 ───────────────────────── */
let idx = { name: [], syn: [], edi: [], tier: [], tierCode: new Map(), kdrg78: [] };

function buildIndex() {
  const D = state.D;
  idx.name = [];

  // 누락된 주요 암종(C코드) 질환 그룹을 state.D.g에 전격 보강!
  const defaultCancers = [
    { n: '난소의 악성 신생물 (난소암)', c: ['C56'], vs: ['난소암', '난소악성신생물', '난소악성종양', '난소암수술'] },
    { n: '뇌의 악성 신생물 (뇌암 · 뇌종양)', c: ['C71', 'D32', 'D33'], vs: ['뇌암', '뇌종양', '교모세포종', '뇌악성신생물', '악성뇌종양'] },
    { n: '골수성 및 림프구성 백혈병 (혈액암)', c: ['C91', 'C92', 'C93', 'C94', 'C95'], vs: ['백혈병', '혈액암', '급성백혈병', '만성백혈병', '소아암', '소아백혈병'] },
    { n: '다발골수종 (골수암 · 혈액암)', c: ['C90'], vs: ['골수암', '다발골수종', '다발성골수종', '혈액암'] },
    { n: '림프절의 이차성 및 상세불명의 악성 신생물 (림프전이)', c: ['C77'], vs: ['림프전이', '림프절전이', '전이암', '이차성암', '림프절곽청'] },
    { n: '뼈 및 관절연골의 악성 신생물 (뼈암 · 골육종)', c: ['C40', 'C41'], vs: ['뼈암', '골육종', '골암', '골악성신생물'] },
    { n: '췌장의 악성 신생물 (췌장암)', c: ['C25'], vs: ['췌장암', '췌장악성신생물', '휘플수술'] },
    { n: '신장의 악성 신생물 (신장암)', c: ['C64'], vs: ['신장암', '신장악성신생물', '신암'] },
    { n: '방광의 악성 신생물 (방광암)', c: ['C67'], vs: ['방광암', '방광악성신생물', '방광암수술'] },
    { n: '식도의 악성 신생물 (식도암)', c: ['C15'], vs: ['식도암', '식도악성신생물', '식도암수술'] },
    { n: '담낭 및 담도의 악성 신생물 (담낭암 · 담도암)', c: ['C23', 'C24'], vs: ['담도암', '담낭암', '담관암', '담낭악성신생물'] }
  ];

  const c50Group = D.g.find(g => (g.c || []).includes('C50'));
  const cancerM = c50Group ? (c50Group.m || []) : [];

  defaultCancers.forEach(dc => {
    const existing = D.g.find(g => (g.c || []).some(c => dc.c.includes(c)));
    if (!existing) {
      const newG = {
        n: dc.n,
        c: dc.c,
        vs: dc.vs,
        5: { t: 5, c: 'hi', w: '제80항 악성신생물 근치수술 (5종)' },
        m: cancerM
      };
      const newIdx = D.g.length;
      D.g.push(newG);
      dc.c.forEach(code => {
        if (!D.codeIndex) D.codeIndex = {};
        if (!D.codeIndex[code]) D.codeIndex[code] = [];
        D.codeIndex[code].push(newIdx);
      });
    }
  });

  D.g.forEach((g, i) => {
    if ((g.c || []).includes('N62') && !g.n.includes('여유증')) {
      g.n = '유방의 비대 (여성형 유방증 · 여유증)';
    }
    const names = [g.n].concat(g.vs || []);
    if ((g.c || []).includes('N62')) {
      names.push('여유증', '여성형유방', '여성형유방증', '유방비대', '유방비대증', '여유증수술', '여성형 유방증');
    }
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

  /* 3종·5종 수술특약 표준 분류표(32개 부위) — 부위별 EDI 수술코드 분류 */
  const tRows = (state.T && Array.isArray(state.T.rows)) ? state.T.rows : [];
  idx.tier = tRows.map((r, i) => ({
    i,
    c: r.c,
    b: r.b || r.c.slice(0, -1),
    n: r.n,
    nn: norm(r.n),
    g: r.g || '',
    a: r.a || '',
    t3: r.t3 || '',
    t5: r.t5 || '',
    x3: (typeof r.x3 === 'number') ? r.x3 : -1,
    x5: (typeof r.x5 === 'number') ? r.x5 : -1,
    r3: r.r3 || '',
    r5: r.r5 || '',
    j3: !!r.j3,
    j5: !!r.j5,
    nt: r.nt || '',
    s: r.s || 0,
  }));
  idx.tierCode = new Map();
  idx.tier.forEach(t => {
    [t.c, t.b].forEach(k => {
      if (!k) return;
      if (!idx.tierCode.has(k)) idx.tierCode.set(k, []);
      const arr = idx.tierCode.get(k);
      if (!arr.includes(t.i)) arr.push(t.i);
    });
  });

  /* 7·8종 급여 수술비 (KDRG ADRG 분류) */
  idx.kdrg78 = (state.K78 && Array.isArray(state.K78.rows)) ? state.K78.rows : [];
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
  state.T = data.t || null;
  state.K78 = data.k78 || null;

  buildIndex();

  $('#lock').classList.add('hide');
  $('#lock').hidden = true;
  $('#app').hidden = false;

  bindNavTabs();
  bindQuickTab();
  bindTierTab();
  bindTier78Tab();
  bindNdaiTab();
  bindOcrTab();
  bindRulesTab();
  bindDisputesTab();
  bindClausesTab();

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
function switchTab(tabKey, targetQ = '') {
  state.tab = tabKey;
  $$('#tabs .tab').forEach(b => b.classList.toggle('on', b.dataset.tab === tabKey));

  if ($('#pane-home')) $('#pane-home').hidden = tabKey !== 'home';
  $('#pane-quick').hidden = tabKey !== 'quick';
  $('#pane-tier').hidden = tabKey !== 'tier';
  if ($('#pane-tier78')) $('#pane-tier78').hidden = tabKey !== 'tier78';
  $('#pane-ndai').hidden = tabKey !== 'ndai';
  $('#pane-ocr').hidden = tabKey !== 'ocr';
  if ($('#pane-rules')) $('#pane-rules').hidden = tabKey !== 'rules';
  if ($('#pane-disputes')) $('#pane-disputes').hidden = tabKey !== 'disputes';
  if ($('#pane-clauses')) $('#pane-clauses').hidden = tabKey !== 'clauses';
  if ($('#pane-about')) $('#pane-about').hidden = tabKey !== 'about';

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 1. 빠른검색 리셋
  if (tabKey !== 'quick') {
    if ($('#q-quick')) $('#q-quick').value = '';
    state.quickQ = '';
    if ($('#clearBtn-quick')) $('#clearBtn-quick').hidden = true;
    if (typeof renderIdleQuick === 'function') renderIdleQuick();
  }

  // 2. 3·5종 종수술비 리셋
  if (tabKey !== 'tier') {
    if ($('#q-tier')) $('#q-tier').value = '';
    state.tierQ = '';
    if ($('#clearBtn-tier')) $('#clearBtn-tier').hidden = true;
    if ($('#results-tier')) $('#results-tier').innerHTML = '';
    if (typeof window.resetTierFilters === 'function') window.resetTierFilters();
  }

  // 3. 7·8종 수술비 리셋
  if (tabKey !== 'tier78') {
    if ($('#q-tier78')) $('#q-tier78').value = '';
    state.tier78Q = '';
    if ($('#clearBtn-tier78')) $('#clearBtn-tier78').hidden = true;
    if ($('#results-tier78')) $('#results-tier78').innerHTML = '';
  }

  // 4. N대 질병수술비 리셋
  if (tabKey !== 'ndai') {
    if ($('#q-ndai')) $('#q-ndai').value = '';
    state.ndaiQ = '';
    if ($('#clearBtn-ndai')) $('#clearBtn-ndai').hidden = true;
    if ($('#results-ndai')) $('#results-ndai').innerHTML = '';
    if (typeof window.resetNdaiFilters === 'function') window.resetNdaiFilters();
  }

  // 5. 사진 AI 판독 리셋
  if (tabKey !== 'ocr') {
    if (typeof window.resetOcrTab === 'function') {
      window.resetOcrTab();
    } else {
      const fi = $('#ocrFileInput'); if (fi) fi.value = '';
      const pb = $('#ocrPreviewBox'); if (pb) pb.style.display = 'none';
      const rc = $('#ocrResultCard'); if (rc) rc.innerHTML = '';
      const ti = $('#ocrTextInput'); if (ti) ti.value = '';
      const dz = $('#ocrDropZone'); if (dz) dz.classList.remove('dragover');
    }
  }

  // 6. 동시수술 약관 리셋
  if (tabKey !== 'rules') {
    $$('#pane-rules .clause-expand-body').forEach(b => {
      b.classList.remove('open');
      b.style.display = '';
    });
    $$('#pane-rules .btn-toggle-clause .toggle-arrow').forEach(a => { a.textContent = '▾'; });
    if (typeof window.closeRulesModal === 'function') window.closeRulesModal();
  }

  // 7. 분쟁사례 리셋
  if (tabKey !== 'disputes') {
    $$('#disputesList .dispute-banner-item [id^="disp-drawer-"]').forEach(d => { d.style.display = 'none'; });
    $$('#disputesList .dispute-banner-item [id^="disp-arrow-"]').forEach(a => { a.textContent = '펼치기 ▾'; });
  }

  // 8. 보험약관 리셋
  if (tabKey !== 'clauses') {
    if (typeof window.closeClauseModal === 'function') window.closeClauseModal();
  }

  // 대상 탭 진입 시 동작
  if (tabKey === 'home') {
    // 홈 화면
  } else if (tabKey === 'quick') {
    if (targetQ) {
      if ($('#q-quick')) $('#q-quick').value = targetQ;
      state.quickQ = targetQ;
      if ($('#clearBtn-quick')) $('#clearBtn-quick').hidden = false;
      const parsed = parseSmartQuery(targetQ);
      runQuickSearch(parsed.cleanQ || targetQ, parsed);
    } else {
      if ($('#q-quick')) $('#q-quick').value = '';
      state.quickQ = '';
      if ($('#clearBtn-quick')) $('#clearBtn-quick').hidden = true;
      renderIdleQuick();
    }
    $('#q-quick')?.focus();
  } else if (tabKey === 'disputes') {
    renderDisputesList('all');
    $$('#disputesFilterChips .f-chip').forEach(c => c.classList.toggle('on', c.dataset.dfilter === 'all'));
  } else if (tabKey === 'tier') {
    if (targetQ) {
      if ($('#q-tier')) $('#q-tier').value = targetQ;
      state.tierQ = targetQ;
      if ($('#clearBtn-tier')) $('#clearBtn-tier').hidden = false;
      if (typeof window.resetTierFilters === 'function') window.resetTierFilters();
      runTierSearch(targetQ);
      const qTierEl = $('#q-tier');
      if (qTierEl) qTierEl.value = targetQ;
    } else {
      if ($('#q-tier')) $('#q-tier').value = '';
      state.tierQ = '';
      if ($('#clearBtn-tier')) $('#clearBtn-tier').hidden = true;
      if (typeof window.resetTierFilters === 'function') window.resetTierFilters();
      if ($('#results-tier')) $('#results-tier').innerHTML = '';
    }
    $('#q-tier')?.focus();
  } else if (tabKey === 'tier78') {
    if (targetQ) {
      if ($('#q-tier78')) $('#q-tier78').value = targetQ;
      state.tier78Q = targetQ;
      if ($('#clearBtn-tier78')) $('#clearBtn-tier78').hidden = false;
      runTier78Search(targetQ);
    } else {
      if ($('#q-tier78')) $('#q-tier78').value = '';
      state.tier78Q = '';
      if ($('#clearBtn-tier78')) $('#clearBtn-tier78').hidden = true;
      if ($('#results-tier78')) $('#results-tier78').innerHTML = '';
    }
    $('#q-tier78')?.focus();
  } else if (tabKey === 'ndai') {
    if (targetQ) {
      if ($('#q-ndai')) $('#q-ndai').value = targetQ;
      state.ndaiQ = targetQ;
      if ($('#clearBtn-ndai')) $('#clearBtn-ndai').hidden = false;
      runNdaiSearch(targetQ);
    } else {
      if ($('#q-ndai')) $('#q-ndai').value = '';
      state.ndaiQ = '';
      if ($('#clearBtn-ndai')) $('#clearBtn-ndai').hidden = true;
      if (typeof window.resetNdaiFilters === 'function') window.resetNdaiFilters();
      if ($('#results-ndai')) $('#results-ndai').innerHTML = '';
    }
    $('#q-ndai')?.focus();
  } else if (tabKey === 'ocr') {
    if (typeof window.resetOcrTab === 'function') window.resetOcrTab();
  } else if (tabKey === 'clauses') {
    if (typeof renderClausesCompanyList === 'function') renderClausesCompanyList(state.clauseQ || '');
  } else if (tabKey === 'about') {
    renderAbout();
  }
}
window.switchTab = switchTab;

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

  // 암/악성 vs 양성 질환 의도 구분 (자궁암 검색 시 평활근종 배제 등)
  const isCancerQuery = /(암|악성|신생물|카르시노마|육종|림프종|백혈병)/.test(nq) || /^C\d/.test(up);
  const isBenignQuery = /(근종|양성|폴립|용종|결절|비대|낭종|여유증)/.test(nq);

  // 여유증 / 여성형유방 직접 검색 지원 -> N62(유방의 비대)를 최우선 1순위 대표 질환으로 확정
  if (nq === '여유증' || nq === '여성형유방' || nq === '여유' || nq.includes('여유증') || nq.includes('여성형유방') || nq === '유방비대') {
    (state.D.codeIndex['N62'] || []).forEach(i => scores.set(i, 0.00001));
    scores.set(155, 0.8); // N60~N64 상위 포괄 항목은 서랍으로 하향
  } else if (nq === '난소암' || nq.includes('난소암')) {
    (state.D.codeIndex['C56'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '뇌암' || nq === '뇌종양' || nq.includes('뇌암')) {
    (state.D.codeIndex['C71'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '백혈병' || nq === '혈액암' || nq === '소아암' || nq.includes('백혈병') || nq.includes('혈액암')) {
    (state.D.codeIndex['C91'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '골수암' || nq === '다발골수종' || nq.includes('골수암')) {
    (state.D.codeIndex['C90'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '뼈암' || nq === '골육종' || nq.includes('뼈암') || nq.includes('골육종')) {
    (state.D.codeIndex['C40'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '림프전이' || nq.includes('림프전이') || nq === '전이암') {
    (state.D.codeIndex['C77'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '췌장암' || nq.includes('췌장암')) {
    (state.D.codeIndex['C25'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '신장암' || nq.includes('신장암')) {
    (state.D.codeIndex['C64'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '방광암' || nq.includes('방광암')) {
    (state.D.codeIndex['C67'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '식도암' || nq.includes('식도암')) {
    (state.D.codeIndex['C15'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '담도암' || nq === '담낭암' || nq.includes('담도암') || nq.includes('담낭암')) {
    (state.D.codeIndex['C23'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '유로리프트' || nq.includes('유로리프트') || nq.includes('전립선결찰')) {
    (state.D.codeIndex['N40'] || []).forEach(i => scores.set(i, 0.00001));
  } else if (nq === '카티스템' || nq === '카티라이프' || nq.includes('카티스템') || nq.includes('카티라이프') || nq.includes('줄기세포연골') || nq.includes('연골이식') || nq === '카티' || nq === 'cartistem' || nq === 'cartilife') {
    (state.D.codeIndex['M17'] || []).forEach(i => scores.set(i, 0.00001));
    (state.D.codeIndex['M23'] || []).forEach(i => scores.set(i, 0.00002));
  }

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

  /* 1-B. 3종·5종 수술특약 표준 분류표 직접 매칭 (수술코드 · 수술명) */
  const tierSeen = new Set();
  const tierHits = [];
  const tAdd = (i) => { if (!tierSeen.has(i)) { tierSeen.add(i); tierHits.push(i); } };
  if (idx.tier.length) {
    if (looksEdi) {
      const exact = idx.tierCode.get(up) || [];
      exact.forEach(tAdd);
      if (!exact.length) {
        const base = up.length >= 5 ? up.slice(0, -1) : '';
        (idx.tierCode.get(base) || []).forEach(tAdd);
        idx.tier.forEach(t => { if (t.c.startsWith(up)) tAdd(t.i); });
      }
    }
    if (!tierHits.length && nq.length >= 2) {
      const scored = [];
      idx.tier.forEach(t => {
        if (!t.nn || t.nn.length < 2) return;
        let sc = -1;
        if (t.nn === nq) sc = 0;
        else if (t.nn.startsWith(nq)) sc = 1;
        else if (nq.length >= 3 && t.nn.includes(nq)) sc = 2;
        if (sc < 0) return;
        scored.push({ i: t.i, sc, pay: (t.x5 > 0 || t.x3 > 0) ? 0 : 1, len: t.nn.length });
      });
      scored.sort((a, b) => (a.sc - b.sc) || (a.pay - b.pay) || (a.len - b.len));
      scored.slice(0, 5).forEach(o => tAdd(o.i));
    }
  }

  // 2. KCD 질병코드 매칭 (단일 코드, 접두사, 하위코드 및 N20~N25 범위 매칭 전면 지원!)
  const looksKcd = /^[A-Z]\d/i.test(up);
  if (looksKcd) {
    const cleanUp = up.replace(/[^A-Z0-9]/g, '');
    (state.D.codeIndex[up] || []).forEach(i => add(i, 0));
    for (const code in state.D.codeIndex) {
      const cleanCode = code.replace(/[^A-Z0-9]/g, '');
      if (code === up || cleanCode === cleanUp) {
        state.D.codeIndex[code].forEach(i => add(i, 0));
      } else if (code.startsWith(up) || cleanCode.startsWith(cleanUp)) {
        state.D.codeIndex[code].forEach(i => add(i, 0.4));
      } else if (up.startsWith(code) || cleanUp.startsWith(cleanCode)) {
        // 하위 세부코드 입력 시 상위 대분류 질환 매칭! (예: J32.0, J32.2 입력 시 J32 만성부비동염 매칭)
        state.D.codeIndex[code].forEach(i => add(i, 0.1));
      }
    }
    state.D.g.forEach((g, i) => {
      const hasDirect = g.c.some(c => {
        const cc = c.replace(/[^A-Z0-9]/g, '').toUpperCase();
        return cc === cleanUp || cleanUp.startsWith(cc) || cc.startsWith(cleanUp);
      });
      if (hasDirect) {
        add(i, 0.2);
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

  // 4. 별칭(synonyms) 광범위 정밀 매칭 (맘모톰, 인공관절, 자궁암, 대장용종 등)
  const matchingSyns = [];
  idx.syn.forEach(syn => {
    let matchType = null; // 'exact' | 'prefix' | 'sub'

    for (const k of syn.keys) {
      if (k === nq) {
        matchType = 'exact';
        break;
      }
      if ((k.startsWith(nq) || nq.startsWith(k)) && Math.abs(k.length - nq.length) <= 2) {
        if (!matchType || matchType === 'sub') matchType = 'prefix';
      } else if (nq.includes(k) || k.includes(nq)) {
        if (isCancerQuery && !syn.keys.some(sk => /(암|악성|신생물|c\d)/i.test(sk))) {
          continue; // 암 검색 시 양성 질환 별칭 매칭 차단!
        }
        if (isBenignQuery && syn.keys.some(sk => /(암|악성)/.test(sk))) {
          continue; // 양성 검색 시 암 별칭 차단!
        }
        if (!matchType) matchType = 'sub';
      }
    }

    if (!matchType) return;
    matchingSyns.push(syn);

    const baseScore = matchType === 'exact' ? 0.01 : (matchType === 'prefix' ? 0.08 : 0.6);
    const targets = Array.from(new Set((syn.main || []).concat(syn.codes || [])));
    targets.forEach((cp, rank) => {
      const cleanCp = cp.replace(/[^A-Z0-9]/g, '').toUpperCase();
      for (const code in state.D.codeIndex) {
        const cleanCode = code.replace(/[^A-Z0-9]/g, '').toUpperCase();
        if (code === cp || cleanCode === cleanCp || code.startsWith(cp) || cleanCode.startsWith(cleanCp) || cp.startsWith(code) || cleanCp.startsWith(cleanCode)) {
          state.D.codeIndex[code].forEach(i => {
            const g = state.D.g[i];
            const isCancerCode = g.c.some(c => c.startsWith('C') || c.startsWith('D0'));
            if (isCancerQuery && !isCancerCode && !norm(g.n).includes('악성') && !norm(g.n).includes('암')) {
              return; // 암 검색 시 평활근종 등 양성 질환 철저 배제!
            }
            if (isBenignQuery && isCancerCode) {
              return;
            }
            add(i, baseScore + rank * 0.01);
          });
        }
      }
    });
  });

  // 5. 질병명 텍스트 매칭 (다중 단어 및 부분 매칭)
  const isCho = /^[ㄱ-ㅎ]+$/.test(nq);
  const terms = q.split(/\s+/).map(norm).filter(t => t.length > 0);

  idx.name.forEach(({ i, nn, ch }) => {
    const g = state.D.g[i];
    const isCancerCode = g.c.some(c => c.startsWith('C') || c.startsWith('D0'));
    if (isCancerQuery && !isCancerCode && !nn.includes('악성') && !nn.includes('암')) {
      return;
    }
    if (isBenignQuery && isCancerCode) {
      return;
    }

    if (isCho) {
      if (ch === nq) add(i, 2);
      else if (ch.startsWith(nq)) add(i, 3);
      return;
    }
    if (nn === nq) add(i, 0.005);
    else if (nn.startsWith(nq)) add(i, 0.04);
    else if (nn.includes(nq)) add(i, 0.2);
    else if (terms.length > 1) {
      const matchCount = terms.filter(t => nn.includes(t)).length;
      if (matchCount === terms.length) add(i, 0.3);
      else if (matchCount > 0 && matchCount >= terms.length - 1) add(i, 1.5);
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
  if (isCancerQuery) {
    giEntries = giEntries.filter(([i]) => {
      const g = state.D.g[i];
      const isCancerCode = g.c.some(c => c.startsWith('C') || c.startsWith('D0'));
      return isCancerCode || norm(g.n).includes('악성') || norm(g.n).includes('암');
    });
  }

  const gi = giEntries
    .sort((a, b) => {
      if (Math.abs(a[1] - b[1]) > 0.001) return a[1] - b[1];
      const gA = state.D.g[a[0]];
      const gB = state.D.g[b[0]];
      const exactA = (gA.n === q || (gA.vs || []).includes(q) || norm(gA.n) === nq) ? 1 : 0;
      const exactB = (gB.n === q || (gB.vs || []).includes(q) || norm(gB.n) === nq) ? 1 : 0;
      if (exactA !== exactB) return exactB - exactA;
      const preA = norm(gA.n).startsWith(nq) ? 1 : 0;
      const preB = norm(gB.n).startsWith(nq) ? 1 : 0;
      if (preA !== preB) return preB - preA;
      return Math.abs(norm(gA.n).length - nq.length) - Math.abs(norm(gB.n).length - nq.length);
    })
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
  return { groups: gi.map(([i]) => i), edi: ediHits.slice(0, MAX_EDI), syn: primarySyn, q, matchedEdi, tiers: tierHits.slice(0, 4) };
}

/* ───────────────────────── 수술코드 분류표(3종·5종) 판정 카드 ───────────────────────── */
function tierPillHTML(x, raw, jun, accent) {
  const label = x === 0 ? '비해당' : (x > 0 && x <= 5 ? x + '종' : '미기재');
  const cls = (x > 0 && x <= 5) ? ('t' + x) : 't-none';
  const junTxt = jun ? ' <span style="font-size:10.5px;font-weight:800;color:' + accent + ';">준용</span>' : '';
  return `<div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
      <span class="proc-tag ${cls}" style="font-size:15px;font-weight:900;padding:4px 10px;border-radius:7px;letter-spacing:-.3px;">${label}</span>${junTxt}
      ${raw && raw !== label ? `<span style="font-size:11px;font-weight:750;color:var(--text-3);">${esc(raw)}</span>` : ''}
    </div>`;
}

function renderTierMatchCards(ids, q, looksEdi = false) {
  if (!ids || !ids.length) return '';
  const rows = ids.map(i => idx.tier[i]).filter(Boolean);
  if (!rows.length) return '';

  const cards = rows.map(t => {
    const bothNone = (t.x3 === 0 && t.x5 === 0);
    const junNote = (t.j3 || t.j5)
      ? `<div style="font-size:11.5px;color:var(--text-2);font-weight:700;line-height:1.5;margin-top:6px;">‘준용’은 원문 분류표의 해당 항목 등급을 그대로 적용한다는 뜻입니다${t.r3 ? ' (3종 분류표 ' + esc(t.r3) + '번 항목)' : ''}${t.r5 ? ' (5종 분류표 ' + esc(t.r5) + '번 항목)' : ''}.</div>`
      : '';
    const noteBox = (t.nt || t.s || junNote) ? `
      <div style="margin-top:9px;background:var(--surface-2);border:1px solid var(--line);border-radius:10px;padding:9px 12px;">
        <div style="font-size:11px;font-weight:900;color:var(--text-3);margin-bottom:4px;">📄 적용 기준·주의</div>
        ${t.nt ? `<div style="font-size:11.5px;color:var(--text-2);font-weight:700;line-height:1.5;">${esc(t.nt)}</div>` : ''}
        ${t.s ? `<div style="font-size:11.5px;color:var(--text-2);font-weight:700;line-height:1.5;">* 표시 항목은 원문 분류표상 별도 유의 표시가 있는 항목입니다.</div>` : ''}
        ${junNote}
      </div>` : '';

    return `
    <article class="card tier-code-card" style="border:1.5px solid var(--brand);">
      <div class="card-head">
        <div style="font-size:10.5px;font-weight:900;color:var(--brand);letter-spacing:.2px;margin-bottom:5px;">🔖 3종·5종 수술특약 분류표</div>
        <div class="card-top">
          <span class="kcd-badge-big" style="letter-spacing:0;">${esc(t.c)}</span>
          <h3 class="card-name">${hl(t.n, q)}</h3>
        </div>
        <div style="font-size:11.5px;font-weight:800;color:var(--text-2);margin:1px 0 9px 1px;">🏷️ 부위: ${esc(t.g)}${t.a && t.a !== t.g ? ' · ' + esc(t.a) : ''}</div>

        <div class="tier-2col">
          <div style="border:1.5px solid rgba(49,130,246,0.3);background:rgba(49,130,246,0.05);border-radius:10px;padding:9px 11px;">
            <div style="font-size:11px;font-weight:900;color:#2563eb;margin-bottom:5px;">📋 3종 수술특약</div>
            ${tierPillHTML(t.x3, t.t3, t.j3, '#2563eb')}
          </div>
          <div style="border:1.5px solid rgba(139,92,246,0.3);background:rgba(139,92,246,0.05);border-radius:10px;padding:9px 11px;">
            <div style="font-size:11px;font-weight:900;color:#7c3aed;margin-bottom:5px;">📋 5종 수술특약</div>
            ${tierPillHTML(t.x5, t.t5, t.j5, '#7c3aed')}
          </div>
        </div>

        <div style="margin-top:9px;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:850;line-height:1.5;${bothNone ? 'background:rgba(148,163,184,0.14);border:1px solid rgba(148,163,184,0.4);color:var(--text-2);' : 'background:rgba(49,130,246,0.08);border:1px solid rgba(49,130,246,0.28);color:var(--text);'}">
          ${bothNone
            ? '❌ 이 수술은 3종·5종 수술특약 <b>모두 지급 대상이 아닙니다</b> (비해당)'
            : '⭕ 3종 수술특약 <b>' + (t.x3 === 0 ? '비해당' : (t.x3 > 0 ? t.x3 + '종' : '—')) + '</b> · 5종 수술특약 <b>' + (t.x5 === 0 ? '비해당' : (t.x5 > 0 ? t.x5 + '종' : '—')) + '</b>'}
        </div>

        ${noteBox}

        <div style="font-size:10.5px;color:var(--text-3);font-weight:700;margin-top:8px;line-height:1.45;">
          근거: 3종·5종 수술특약 표준 분류표(32개 부위) · 수술확인서·진료비 세부산정내역서의 수술코드가 위 코드와 일치하면 이 등급으로 청구됩니다.
        </div>
      </div>
    </article>`;
  }).join('');

  return `
    <div class="edi-match-wrapper" style="margin:22px 0 14px;padding-top:16px;border-top:1.5px dashed var(--border);">
      <button type="button" class="btn-toggle-edi-drawer" style="width:100%;height:46px;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:13px;font-weight:850;color:var(--text);box-shadow:0 1px 3px rgba(0,0,0,0.02);user-select:none;">
        <span style="display:flex;align-items:center;gap:6px;">
          🔖 세부 수술코드(EDI) 3·5종 분류표 대조 <span style="color:#2563eb;font-weight:900;">(${rows.length}건)</span>
        </span>
        <span class="edi-drawer-arrow" style="font-size:11.5px;font-weight:800;color:var(--brand);background:var(--surface-2);padding:3px 8px;border-radius:6px;border:1px solid var(--border);">${looksEdi ? '접기 ▴' : '펼쳐보기 ▾'}</span>
      </button>
      <div class="edi-match-drawer" style="display:${looksEdi ? 'flex' : 'none'};margin-top:10px;flex-direction:column;gap:10px;">
        ${cards}
      </div>
    </div>`;
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


/* ───────────────────────── AI 스마트 검색 추천 엔진 (오타·유사어 '이거 찾으세요?') ───────────────────────── */
function getAiSuggestions(q) {
  const nq = norm(q);
  const cands = [];
  const seen = new Set();

  function addCand(title, targetQ, reason) {
    if (seen.has(targetQ)) return;
    seen.add(targetQ);
    cands.push({ title, q: targetQ, reason });
  }

  // 1. 별칭 사전(synonyms) 키워드 부분 일치
  (window.CURATED?.synonyms || []).forEach(s => {
    const qList = Array.isArray(s.q) ? s.q : [s.q];
    const allKeys = qList.concat(s.aliases || []).concat(s.k ? [s.k] : []);
    const matchedKey = allKeys.find(k => {
      const nk = norm(k);
      return nk.includes(nq) || nq.includes(nk) || (nk.length >= 2 && nq.length >= 2 && (nk.slice(0, 2) === nq.slice(0, 2) || nk.slice(-2) === nq.slice(-2)));
    });
    if (matchedKey) {
      addCand(s.k || matchedKey, matchedKey, '유사 질환 키워드');
    }
  });

  // 2. 이비인후과 / 다빈도 특수 질환
  if (/사골|상악|부비|축농/.test(nq)) {
    addCand('만성 부비동염 (사골동·상악동 축농증 / J32)', '부비동염', '이비인후과 질환');
  }
  if (/비중|사이막|비후|코선반|비갑개|하비갑/.test(nq)) {
    addCand('비중격만곡증 (편위된 코사이막 / J34.2)', '비중격', '비강 질환');
    addCand('비후성 비염 (코선반 비대 / J34.3)', '비염', '비강 질환');
  }
  if (/바토린|바르톨|조대/.test(nq)) {
    addCand('바르톨린선 질환 (바토린선 낭종·조대술 / N75)', '바르톨린', '부인과 질환');
  }
  if (/용종|폴립|대장/.test(nq)) {
    addCand('대장용종 (결장경하 폴립절제 / K63.5)', '대장용종', '다빈도');
  }
  if (/백내|수정/.test(nq)) {
    addCand('백내장 (수정체유화술 / H25)', '백내장', '안과 질환');
  }
  if (/맘모|유방/.test(nq)) {
    addCand('유방 양성종양 (맘모톰 절제술 / D24)', '맘모톰', '여성 질환');
  }

  // 3. 다빈도 기본 추천
  const defaultPopular = [
    { title: '축농증·부비동염 (J32)', q: '부비동염' },
    { title: '비중격만곡증 (J34.2)', q: '비중격' },
    { title: '바르톨린선 낭종 (N75)', q: '바르톨린' },
    { title: '대장용종 (K63.5)', q: '대장용종' },
    { title: '백내장 (H25)', q: '백내장' },
    { title: '유방 맘모톰 (D24)', q: '맘모톰' },
    { title: '치핵·치루 (K64)', q: '치핵' },
    { title: '요로결석 쇄석술 (N20)', q: '요로결석' }
  ];

  for (const p of defaultPopular) {
    if (cands.length >= 6) break;
    addCand(p.title, p.q, '다빈도 수술');
  }

  return cands.slice(0, 6);
}

function renderAiSuggestEmptyHTML(q, tabKey) {
  const cands = getAiSuggestions(q);
  const chipsHtml = cands.map(c => `
    <button type="button" class="btn-ai-suggest-chip" data-q="${esc(c.q)}" data-tab="${esc(tabKey)}" style="background:var(--surface);border:1.5px solid var(--brand);border-radius:10px;padding:7px 12px;font-size:12px;font-weight:850;color:var(--text);cursor:pointer;display:inline-flex;align-items:center;gap:5px;box-shadow:var(--shadow-1);transition:all .15s ease;">
      <span style="color:var(--brand);">🎯</span>
      <span>${esc(c.title)}</span>
    </button>
  `).join('');

  return `
    <div class="empty-suggest-card" style="background:var(--surface);border:1.5px solid var(--border);border-radius:16px;padding:22px 18px;margin:16px 0;box-shadow:var(--shadow-1);text-align:left;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;border-bottom:1px solid var(--line);padding-bottom:10px;">
        <span style="font-size:24px;">💡</span>
        <div>
          <div style="font-size:15px;font-weight:900;color:var(--text);">“${esc(q)}” 검색 결과가 없습니다</div>
          <div style="font-size:12px;color:var(--brand);font-weight:800;margin-top:2px;">혹시 아래 질환이나 수술을 찾으시나요?</div>
        </div>
      </div>
      <div style="font-size:11.5px;color:var(--text-3);margin-bottom:10px;">
        오타가 있거나 다른 이름으로 불리는 경우 아래 추천 검색어를 터치하시면 바로 판정됩니다:
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:7px;">
        ${chipsHtml}
      </div>
      <div style="margin-top:14px;padding:10px 12px;background:var(--surface-2);border-radius:10px;font-size:11px;color:var(--text-2);line-height:1.45;">
        📌 <b>검색 팁</b>: 의무기록지의 <b>질병코드(예: J32.0, J34.2, N75)</b>나 <b>수술명(예: 비중격교정술, 조대술)</b>으로 검색하시면 가장 정확한 결과가 나옵니다.
      </div>
    </div>`;
}

function bindAiSuggestChips(box) {
  if (!box) return;
  $$('.btn-ai-suggest-chip', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetQ = btn.dataset.q;
      const targetTab = btn.dataset.tab || 'quick';
      switchTab(targetTab, targetQ);
    });
  });
}

function runQuickSearch(q, parsed) {
  const normQ = norm(q);
  const compPair = findComparisonPair(normQ);
  const exclProc = findExcludedProcedure(normQ);

  const res = search(q) || { groups: [], edi: [] };
  const box = $('#results-quick');

  if (exclProc && exclProc.relatedCodes && (!res.groups || res.groups.length === 0)) {
    exclProc.relatedCodes.forEach(code => {
      (state.D.codeIndex[code] || []).forEach(gi => {
        if (!res.groups.includes(gi)) res.groups.push(gi);
      });
    });
  }

  let subInfo = '';
  if (parsed && (parsed.co || parsed.year || parsed.ntier)) {
    const parts = [];
    if (parsed.co) parts.push(`🏢 ${parsed.cos && parsed.cos.length > 1 ? parsed.cos.join(' · ') : parsed.co}`);
    if (parsed.year) parts.push(`📅 ${parsed.year}년`);
    if (parsed.ntier) parts.push(`🏷️ ${parsed.ntier}`);
    subInfo = `<div style="font-size:12px;font-weight:750;color:var(--brand);margin-top:3px;">[${parts.join(' · ')} 인식]</div>`;
  }

  const looksEdi = /^[A-Z]\d{4}/i.test(q.replace(/\s+/g, ''));
  const compHTML = compPair ? renderComparisonPairHTML(compPair) : '';
  const exclHTML = exclProc ? renderExcludedProcedureHTML(exclProc) : '';
  const tierHTML = renderTierMatchCards(res.tiers, q, looksEdi);

  const head = `
    <div class="res-head">
      <div>
        <div class="res-title"><em>${esc(q)}</em> 빠른 판정 결과</div>
        ${subInfo}
      </div>
      <div class="res-count">${res.groups.length ? `분류 ${res.groups.length}건` : ""}${res.groups.length && (res.tiers||[]).length ? " · " : ""}${(res.tiers||[]).length ? `수술코드 ${res.tiers.length}건` : ""}</div>
    </div>`;

  if (!res.groups.length && !res.edi.length && !compPair && !exclProc && !tierHTML) {
    box.innerHTML = head + renderAiSuggestEmptyHTML(q, 'quick');
    bindAiSuggestChips(box);
    return;
  }

  let groupsHTML = '';
  if (res.groups.length > 0) {
    if (exclProc && exclProc.relatedCodes && exclProc.relatedCodes.length > 0) {
      groupsHTML += `<div style="font-size:12.5px;font-weight:900;color:var(--text);margin:14px 0 8px 4px;">💡 연관 질환 정식 수술비 보장 내역 (${esc(exclProc.relatedDisease)})</div>`;
    }
    // 1순위 대표 질환 1건: 메인 카드로 시원하게 노출!
    const mainGi = res.groups[0];
    groupsHTML += cardQuickHTML(mainGi, q, res.matchedEdi, parsed, false);

    // 2순위 이후: 제자리암(D코드)과 기타 연관 질환을 완벽히 분리 정돈!
    if (res.groups.length > 1) {
      const remainingGis = res.groups.slice(1, 15);
      const inSituGis = [];
      const otherGis = [];

      remainingGis.forEach(gi => {
        const itemG = state.D.g[gi];
        const isDCode = (itemG.c || []).some(c => /^[D]\d/i.test(c)) || (itemG.n || '').includes('제자리암') || (itemG.n || '').includes('상피내암');
        if (isDCode) {
          inSituGis.push(gi);
        } else {
          otherGis.push(gi);
        }
      });

      // 제자리암(상피내암) 별도 섹션
      if (inSituGis.length > 0) {
        groupsHTML += `
          <div style="margin:20px 0 10px 4px;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
              📂 연관 제자리암(상피내암) 질병코드별 확인 <span style="color:#2563eb;font-weight:900;">(${inSituGis.length}건)</span>
            </span>
            <span style="font-size:11px;color:#2563eb;font-weight:800;background:rgba(49,130,246,0.08);padding:3px 8px;border-radius:6px;border:1px solid rgba(49,130,246,0.25);">터치 시 상세 판정 ▾</span>
          </div>
          <div class="sub-diseases-list in-situ-diseases-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
            ${inSituGis.map(i => cardQuickHTML(i, q, res.matchedEdi, parsed, true)).join('')}
          </div>
        `;
      }

      // 기타 연관 질환 섹션
      if (otherGis.length > 0) {
        groupsHTML += `
          <div style="margin:20px 0 10px 4px;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
              📂 기타 연관 질환 및 다른 질병코드 <span style="color:var(--brand);font-weight:900;">(${otherGis.length}건)</span>
            </span>
            <span style="font-size:11px;color:var(--text-3);font-weight:700;">터치 시 상세 판정 펼쳐짐 ▾</span>
          </div>
          <div class="sub-diseases-list other-diseases-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
            ${otherGis.map(i => cardQuickHTML(i, q, res.matchedEdi, parsed, true)).join('')}
          </div>
        `;
      }
    }
  }

  let html = head;
  if (looksEdi) {
    html += tierHTML + compHTML + exclHTML + groupsHTML;
  } else {
    html += compHTML + exclHTML + groupsHTML + tierHTML;
  }
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
      title: '치환술(4종) vs 세척술(3종) 지급 등급 확인',
      text: '인공관절 전치환술(4종)과 관절경 세척·활액막 절제(3종)는 지급 등급이 완전히 다릅니다. 수술기록지에 삽입물(인공관절) 치환 여부를 확인하세요.'
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

  if (codes.some(c => c.startsWith('I83'))) {
    tips.push({
      badge: '⚠️ 신의료기술 주의',
      color: '#d97706',
      bg: 'rgba(245,158,11,0.09)',
      border: 'rgba(245,158,11,0.3)',
      title: '비관혈 시술(베나실·클라리베인·고주파) 수술 인정 여부 확인',
      text: '광범위 발거술(스트리핑)은 1~3종(2종 다수) 지급되나, 비관혈적 시술(베나실 생체접착제, 클라리베인, 고주파, 레이저)은 약관상 "절제·절단" 수술 정의 해당 여부로 분쟁이 잦습니다. 가입 약관의 비관혈 수술 인정 조항을 꼭 확인하세요.'
    });
  }

  if (codes.some(c => c.startsWith('D25') || c.startsWith('N80'))) {
    tips.push({
      badge: '⚠️ 신의료기술 주의',
      color: '#7c3aed',
      bg: 'rgba(124,58,237,0.08)',
      border: 'rgba(124,58,237,0.25)',
      title: '하이푸(HIFU)·색전술 종수술비 인정 확인',
      text: '복강경/개복 근종절제술(3종)이나 자궁적출(4종)과 달리, 하이푸(고강도초음파)는 절개 없는 신의료기술로 종수술비에서 2종 또는 분쟁이 발생합니다. 가입 약관의 신의료기술 인정 여부와 N대 질병수술비 보장 여부를 함께 확인하세요.'
    });
  }

  if (codes.some(c => c.startsWith('N40'))) {
    tips.push({
      badge: '⚠️ 신의료기술 주의',
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.08)',
      border: 'rgba(37,99,235,0.25)',
      title: '유로리프트(결찰술) vs 절제술(TURP/홀렙) 지급 등급 구분',
      text: '경요도절제(TURP)나 홀렙(HoLEP)은 3종이나, 유로리프트(경요도결찰술)는 결찰술 특약 또는 1~2종/비급여 분쟁이 있습니다. N대 질병수술비 지급 여부도 함께 대조하세요.'
    });
  }

  if (codes.some(c => c.startsWith('N20') || c.startsWith('N21') || c.startsWith('N22') || c.startsWith('N23'))) {
    tips.push({
      badge: '⚠️ 초보 필수 주의',
      color: '#059669',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.25)',
      title: '체외충격파쇄석술(ESWL) 생·손보 약관 차이',
      text: '체외충격파쇄석술은 생명보험 1~5종(2종)에서는 인정되는 경우가 많으나, 손해보험에서는 관혈적 수술이 아닌 시술로 보아 부지급되는 약관이 다수입니다. 요관경하 결석제거(2~3종)와 구분하세요.'
    });
  }

  return tips;
}

function renderIdleQuick() {
  const box = $('#results-quick');
  if (!box) return;

  const frequentItems = [
    { title: '대장용종 절제술', sub: 'K63.5 · Q7701 (2종 / 개정 1종)', query: '대장용종', badge: '2종', badgeBg: '#2563eb' },
    { title: '베나실 · 하지정맥류', sub: 'I83 · 시아노아크릴레이트 폐색술', query: '베나실', badge: '1~2종', badgeBg: '#d97706' },
    { title: '하이푸 (자궁근종)', sub: 'D25 · 고강도초음파집속술 (2~3종)', query: '하이푸', badge: '2~3종', badgeBg: '#7c3aed' },
    { title: '맘모톰 (유방절제)', sub: 'D24 · N60 (2종 / 단순생검 제외)', query: '맘모톰', badge: '2종', badgeBg: '#2563eb' },
    { title: '유로리프트 (전립선)', sub: 'N40 · 경요도전립선결찰술', query: '유로리프트', badge: '1~2종', badgeBg: '#059669' },
    { title: '백내장 수정체수술', sub: 'H25/H26 · 초음파유화술 (1종)', query: '백내장', badge: '1종', badgeBg: '#059669' },
    { title: '무릎 인공관절치환', sub: 'M17 · 전치환술 (4종 / 세척 3종)', query: '인공관절', badge: '4종', badgeBg: '#dc2626' },
    { title: '치핵 · 치루 근치술', sub: 'K60~K64 · 외과적 치핵절제 (1종)', query: '치핵', badge: '1종', badgeBg: '#059669' },
    { title: '요로결석 쇄석술', sub: 'N20~N23 · 체외충격파쇄석 (2종)', query: '요로결석', badge: '2종', badgeBg: '#2563eb' },
    { title: '척추 디스크 감압술', sub: 'M51 · 신경감압·수핵절제 (3종)', query: '추간판', badge: '3종', badgeBg: '#ea580c' }
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
    id: 'eswl_tier',
    name: '체외충격파쇄석술(ESWL) 보험사·특약별 지급 등급',
    match: (g) => {
      const codes = g.c || [];
      const hasNCode = codes.some(c => ['N20', 'N21', 'N22', 'N23'].some(t => c.startsWith(t)));
      const hasName = (g.n || '').includes('결석') || (g.g || '').includes('결석');
      const hasVs = (g.vs || []).some(v => v.includes('쇄석') || v.includes('ESWL'));
      return hasNCode || hasName || hasVs;
    },
    standardTier: '2종',
    revisions: [
      { co: '농협손해보험', ym: 202501, label: '농협손보 2종➔1종 (2025.01~)', matchKeys: ['농협', '농손'] },
      { co: '흥국화재', ym: 202108, label: '흥국화재 2종➔1종 (2021.08~)', matchKeys: ['흥국화', '흥화'] },
      { co: '한화손해보험', ym: 202307, label: '한화손보 2종➔1종 (2023.07~)', matchKeys: ['한화손', '한손'] },
      { co: '현대해상', ym: 201806, label: '현대해상 2종➔1종 (2018.06~)', matchKeys: ['현대', '현해'] },
      { co: '롯데손해보험', ym: 202101, label: '롯데손보 2종➔1종 (2021.01~)', matchKeys: ['롯데', '롯손'] }
    ],
    evaluate: function(cosInput, year, month) {
      const cosList = parseCosList(cosInput);

      if (cosList.length === 0) {
        return {
          tier: '1·2종',
          hasDiff: true,
          diffBadge: '[회사·가입시기별 상이]',
          note: '생보 전사 및 대형 손보(삼성·KB·DB·메리츠) 2종 유지, 농협·흥국·한화·현대·롯데 1종 하향 개정',
          boxHTML: `
            <div class="rev-alert-box">
              <div class="rab-title">⚠️ 체외충격파쇄석술(ESWL) 2종 ➔ 1종 하향 개정 손보사 5곳</div>
              <div style="color:var(--text);font-size:11.5px;display:grid;grid-template-columns:repeat(2,1fr);gap:4px;margin:6px 0;background:var(--surface);padding:8px 10px;border-radius:9px;border:1px solid var(--border);">
                <div>• 농협손보 (2025.01~)</div>
                <div>• 흥국화재 (2021.08~)</div>
                <div>• 한화손보 (2023.07~)</div>
                <div>• 현대해상 (2018.06~)</div>
                <div>• 롯데손보 (2021.01~)</div>
                <div style="color:#2563eb;font-weight:750;">• 생보 전사 및 대형 손보 2종 유지</div>
              </div>
              <div class="rab-desc" style="font-size:11px;color:var(--text-2);margin-top:2px;">
                ※ 1~5종 수술분류표 제87항(생보 제37항) 체외충격파쇄석술 기준이며, 60일 이내 여러 번은 1회로 간주합니다.<br>
                ※ 외래 물리치료인 <b>체외충격파치료술(ESWT)은 전사 면책</b>입니다.
              </div>
            </div>`
        };
      }

      if (cosList.length === 1) {
        const coStr = cosList[0];
        const normCo = coStr.toLowerCase();
        const rev = this.revisions.find(r => r.matchKeys.some(k => normCo.includes(k)));
        if (!rev) {
          return {
            tier: '2종',
            hasDiff: false,
            note: `${coStr}는 체외충격파쇄석술 2종 지급 (60일 이내 1회 한)`,
            boxHTML: `
              <div class="rev-alert-box blue">
                <div class="rab-title">✓ ${coStr} 체외충격파쇄석술 [2종 지급]</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">1~5종 수술분류표에 따라 <b>2종</b>으로 정상 지급됩니다. (개정 없이 2종 유지 / ESWT 제외)</div>
              </div>`
          };
        }

        const ymText = `${Math.floor(rev.ym / 100)}년 ${rev.ym % 100}월`;
        if (!year) {
          return {
            tier: '1·2종',
            hasDiff: true,
            diffBadge: '[가입시기별 상이]',
            note: `${rev.co}는 ${ymText} 기점으로 2종 ➔ 1종 하향 개정`,
            boxHTML: `
              <div class="rev-alert-box">
                <div class="rab-title">⚠️ ${rev.co} 체외충격파쇄석술 가입시기별 기준</div>
                <div class="rab-card">
                  <div class="rab-row">
                    <span class="rab-label">${ymText} 이전 계약</span>
                    <span class="rab-val blue">2종 지급</span>
                  </div>
                  <div class="rab-row">
                    <span class="rab-label">${ymText} 이후 계약</span>
                    <span class="rab-val red">1종 적용 (하향)</span>
                  </div>
                </div>
                <div class="rab-desc">※ ${ymText} 이후 가입 고객은 1종으로 지급됩니다.</div>
              </div>`
          };
        }

        const targetYm = year * 100 + (month || 12);
        if (targetYm >= rev.ym) {
          return {
            tier: '1종',
            hasDiff: true,
            diffBadge: '[개정약관 1종]',
            note: `${rev.co} ${ymText} 개정약관 적용 (1종)`,
            boxHTML: `
              <div class="rev-alert-box">
                <div class="rab-title">✓ ${rev.co} ${ymText} 이후 개정약관 (1종 확정)</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">고객 가입 시점이 ${ymText} 이후이므로 1종에 해당합니다. (이전 계약은 2종)</div>
              </div>`
          };
        } else {
          return {
            tier: '2종',
            hasDiff: true,
            diffBadge: '[개정 이전 2종]',
            note: `${rev.co} ${ymText} 이전 계약으로 2종 정상 지급`,
            boxHTML: `
              <div class="rev-alert-box blue">
                <div class="rab-title">✓ ${rev.co} ${ymText} 이전 계약 (2종 확정)</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">${ymText} 개정 전 가입 계약이므로 정상적으로 2종 수술비가 지급됩니다.</div>
              </div>`
          };
        }
      }

      // 복수 회사 비교
      const coResults = cosList.map(coName => {
        const normCo = coName.toLowerCase();
        const rev = this.revisions.find(r => r.matchKeys.some(k => normCo.includes(k)));
        if (!rev) return { co: coName, tier: '2종', note: '개정 없이 2종 유지' };
        const ymText = `${Math.floor(rev.ym / 100)}년 ${rev.ym % 100}월`;
        if (!year) return { co: coName, tier: '1·2종', note: `${ymText} 개정 (이전 2종/이후 1종)` };
        const targetYm = year * 100 + (month || 12);
        return {
          co: coName,
          tier: targetYm >= rev.ym ? '1종' : '2종',
          note: targetYm >= rev.ym ? `${ymText} 개정 1종` : `${ymText} 이전 2종 유지`
        };
      });

      const hasDiff = coResults.some(r => r.tier.includes('1종'));
      return {
        tier: coResults.every(r => r.tier === coResults[0].tier) ? coResults[0].tier : '회사별 상이',
        hasDiff,
        diffBadge: hasDiff ? '[회사별 상이]' : '',
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
                    <span style="font-weight:900;padding:2px 8px;border-radius:5px;font-size:11.5px;background:${cr.tier === '1종' ? '#dc2626' : '#2563eb'};color:#fff;">${esc(cr.tier)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>`
      };
    }
  },
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
          diffBadge: '[2026 현대해상 담보별 상이]',
          note: '악성신생물 관혈 근치수술 5종 (2026년 이후 현대해상은 가입 담보에 따라 4종 또는 5종)',
          boxHTML: `
            <div class="rev-alert-box">
              <div class="rab-title">⚠️ 2026년 현대해상 가입자 담보별 상이 (필수확인)</div>
              <div class="rab-card">
                <div class="rab-row">
                  <span class="rab-label">2026년 이전 계약 및 타사 전사</span>
                  <span class="rab-val blue">5종 지급 (관혈근치)</span>
                </div>
                <div class="rab-row">
                  <span class="rab-label">2026년 이후 현대해상 가입자</span>
                  <span class="rab-val red">4종 또는 5종 상이</span>
                </div>
              </div>
              <div class="rab-desc">※ 무조건 하향이 아니며, 담보 가입에 따라 다름 — 질병수술Ⅳ 특약은 <b>4종</b> / 기존 질병수술 특약은 <b>5종</b></div>
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

        if (!year) {
          return {
            tier: '4·5종',
            hasDiff: true,
            diffBadge: '[담보별 상이]',
            note: '2026년 이전 5종 / 2026년 이후 가입자는 담보에 따라 4종 또는 5종 상이',
            boxHTML: `
              <div class="rev-alert-box">
                <div class="rab-title">⚠️ 현대해상 가입시기별 담보 확인 (필수)</div>
                <div class="rab-card">
                  <div class="rab-row">
                    <span class="rab-label">2026년 이전 계약</span>
                    <span class="rab-val blue">5종 지급 (관혈근치)</span>
                  </div>
                  <div class="rab-row">
                    <span class="rab-label">2026년 이후 가입자</span>
                    <span class="rab-val red">4종 또는 5종 상이</span>
                  </div>
                </div>
                <div class="rab-desc">※ 질병수술Ⅳ 특약 가입 시 <b>4종 하향</b> / 기존 1~5종 특약 가입 시 <b>5종</b></div>
              </div>`
          };
        }

        const targetYm = year * 100 + (month || 12);
        if (targetYm >= 202604) {
          return {
            tier: '4·5종',
            hasDiff: true,
            diffBadge: '[담보별 상이]',
            note: '2026년 가입자: 담보에 따라 4종 또는 5종 상이',
            boxHTML: `
              <div class="rev-alert-box">
                <div class="rab-title">⚠️ 2026년 현대해상 가입자 담보별 상이</div>
                <div class="rab-card">
                  <div class="rab-row">
                    <span class="rab-label">질병수술Ⅳ 특약 가입 시</span>
                    <span class="rab-val red">4종 적용 (하향)</span>
                  </div>
                  <div class="rab-row">
                    <span class="rab-label">기존 1~5종 질병수술 가입 시</span>
                    <span class="rab-val blue">5종 적용 (유지)</span>
                  </div>
                </div>
                <div class="rab-desc">※ 고객 증권에 적힌 세부 특약명이 '질병수술Ⅳ'인지 필수 확인 필요</div>
              </div>`
          };
        } else {
          return {
            tier: '5종',
            hasDiff: true,
            diffBadge: '[개정 이전 5종]',
            note: '현대해상 2026년 이전 계약으로 5종 정상 지급',
            boxHTML: `
              <div class="rev-alert-box blue">
                <div class="rab-title">✓ 현대해상 2026년 이전 계약 (5종 확정)</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">2026년 개정 전 가입 계약이므로 정상적으로 악성신생물 5종 수술비가 지급됩니다.</div>
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
            <div class="rev-alert-box">
              <div class="rab-title">⚠️ 대장용종 2종 ➔ 1종 하향 개정 손보사 7곳</div>
              <div style="color:var(--text);font-size:11.5px;display:grid;grid-template-columns:repeat(2,1fr);gap:4px;margin:6px 0;background:var(--surface);padding:8px 10px;border-radius:9px;border:1px solid var(--border);">
                <div>• 하나손보 (2023.06~)</div>
                <div>• 예별손보 (2023.09~)</div>
                <div>• 메리츠화재 (2024.12~)</div>
                <div>• 흥국화재 (2025.09~)</div>
                <div>• KB손보 (2026.01~)</div>
                <div>• 롯데손보 (2026.01~)</div>
                <div>• 농협손보 (2026.09~)</div>
                <div style="color:#2563eb;font-weight:750;">• 타사 전사 2종 유지</div>
              </div>
              <div class="rab-desc">✓ 삼성화재 · 현대해상 · DB손보 및 생보사 전사 : <b>개정 없이 2종 유지</b></div>
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
            boxHTML: `
              <div class="rev-alert-box blue">
                <div class="rab-title">✓ ${coStr} 대장용종절제술 [2종 지급]</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">표준 1~5종 수술분류표 제88항-2에 따라 <b>2종</b>으로 정상 지급됩니다. (개정 없이 2종 유지)</div>
              </div>`
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
              <div class="rev-alert-box">
                <div class="rab-title">⚠️ ${revItem.co} 가입시기별 지급 등급 기준</div>
                <div class="rab-card">
                  <div class="rab-row">
                    <span class="rab-label">${ymText} 이전 계약</span>
                    <span class="rab-val blue">2종 지급</span>
                  </div>
                  <div class="rab-row">
                    <span class="rab-label">${ymText} 이후 계약</span>
                    <span class="rab-val red">1종 적용</span>
                  </div>
                </div>
                <div class="rab-desc">※ ${ymText} 이후 개정약관 가입 고객은 1종으로 하향 지급됩니다.</div>
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
              <div class="rev-alert-box">
                <div class="rab-title">✓ ${revItem.co} ${ymText} 이후 개정약관 (1종 확정)</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">고객 가입 시점이 ${ymText} 이후이므로 1종에 해당합니다. (이전 계약은 2종)</div>
              </div>`
          };
        } else {
          return {
            tier: '2종',
            hasDiff: true,
            diffBadge: '[개정 이전 2종]',
            note: `${revItem.co} ${ymText} 이전 계약으로 2종 지급`,
            boxHTML: `
              <div class="rev-alert-box blue">
                <div class="rab-title">✓ ${revItem.co} ${ymText} 이전 계약 (2종 확정)</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">${ymText} 개정 전 가입 계약이므로 정상적으로 2종 수술비가 지급됩니다.</div>
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
        <div class="co-compare-box">
          <div class="co-compare-title" style="display:flex;align-items:center;justify-content:space-between;">
            <span>🏢 선택하신 ${cosList.length}개 보험사 판정 비교:</span>
            ${year ? `<span style="font-size:11px;color:var(--brand);font-weight:800;">${year}년 계약 기준</span>` : ''}
          </div>
          <div class="co-compare-list">
            ${coResults.map(cr => `
              <div class="co-compare-row">
                <span class="co-compare-name">${esc(cr.co)}</span>
                <div class="co-compare-meta">
                  <span class="co-compare-note">${esc(cr.note)}</span>
                  <span class="proc-tag ${'t' + (parseInt(cr.tier) || 2)}" style="font-size:11px;padding:2px 7px;min-width:38px;">${esc(cr.tier)}</span>
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
    name: '유방비대증·여유증 수술',
    match: (g) => {
      const codes = g.c || [];
      if (codes.some(c => c.startsWith('C') || c.startsWith('D05'))) return false;
      const gn = g.n || '';
      if (gn.includes('악성') || gn.includes('암')) return false;
      return codes.some(c => c.startsWith('N62') || c.startsWith('N60') || c.startsWith('N64')) ||
        gn.includes('유방의 비대') || gn.includes('유방비대') ||
        gn.includes('여유증') || gn.includes('여성형유방');
    },
    revisions: [
      { co: '예별손해보험', ym: 202301, tier: '1종', matchKeys: ['예별', '에이별', 'mg', '엠지'] },
      { co: '하나손해보험', ym: 202306, tier: '1종', matchKeys: ['하나'] },
      { co: '한화손해보험', ym: 202307, tier: '1종', matchKeys: ['한화'] },
      { co: '메리츠화재', ym: 202412, tier: '1종', matchKeys: ['메리츠', '멜츠'] },
      { co: '흥국화재', ym: 202509, tier: '1종', matchKeys: ['흥국'] },
      { co: 'DB손해보험', ym: 202605, tier: '2종', matchKeys: ['db', '디비'] }
    ],
    evaluate: function(cosInput, year, month) {
      const cosList = parseCosList(cosInput);

      if (cosList.length === 0) {
        return {
          tier: '1~3종',
          hasDiff: true,
          diffBadge: '[개정약관별 상이]',
          note: '표준 3종(유방절단술), 메리츠·하나·예별·흥국·한화 1종 하향, DB손보 2종 하향',
          boxHTML: `
            <div class="rev-alert-box">
              <div class="rab-title">⚠️ 여유증·유방비대 1·2종 하향 개정</div>
              <div style="color:var(--text);font-size:11.5px;display:grid;grid-template-columns:repeat(2,1fr);gap:4px;margin:6px 0;background:var(--surface);padding:8px 10px;border-radius:9px;border:1px solid var(--border);">
                <div>• 예별손보 3종➔1종 (2023.01~)</div>
                <div>• 하나손보 3종➔1종 (2023.06~)</div>
                <div>• 한화손보 3종➔1종 (2023.07~)</div>
                <div>• 메리츠 3종➔1종 (2024.12~)</div>
                <div>• 흥국화재 3종➔1종 (2025.09~)</div>
                <div>• DB손보 3종➔2종 (2026.05~)</div>
                <div style="color:#2563eb;font-weight:750;grid-column:span 2;">• 삼성·현대·KB 및 생보 전사: 표준 3종 유지</div>
              </div>
              <div class="rab-desc">※ 표준 1~5종 제3항 유방절단술은 3종이나, 위 6개 손보사는 가입 시기에 따라 1종 또는 2종으로 하향 지급됩니다.</div>
            </div>`
        };
      }

      if (cosList.length === 1) {
        const coStr = cosList[0];
        const normCo = coStr.toLowerCase();
        const rev = this.revisions.find(r => r.matchKeys.some(k => normCo.includes(k)));

        if (!rev) {
          return {
            tier: '3종',
            hasDiff: false,
            diffBadge: '',
            note: `${coStr}는 개정 없이 표준 3종 유지 (유방절단술 제3항)`,
            boxHTML: `
              <div class="rev-alert-box blue">
                <div class="rab-title">✓ ${coStr} 여유증·유방비대 [3종 지급]</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">표준 1~5종 제3항 유방절단술(3종) 약관이 개정 없이 그대로 유지됩니다.</div>
              </div>`
          };
        }

        const ymText = `${Math.floor(rev.ym / 100)}년 ${rev.ym % 100}월`;
        if (!year) {
          return {
            tier: rev.tier === '1종' ? '1·3종' : '2·3종',
            hasDiff: true,
            diffBadge: '[가입시기별 상이]',
            note: `${rev.co}는 ${ymText} 기점으로 3종 ➔ ${rev.tier} 하향 개정`,
            boxHTML: `
              <div class="rev-alert-box">
                <div class="rab-title">⚠️ ${rev.co} 여유증·유방비대 가입시기별 기준</div>
                <div class="rab-card">
                  <div class="rab-row">
                    <span class="rab-label">${ymText} 이전 계약</span>
                    <span class="rab-val blue">3종 지급 (유방절단술)</span>
                  </div>
                  <div class="rab-row">
                    <span class="rab-label">${ymText} 이후 계약</span>
                    <span class="rab-val red">${rev.tier} 적용 (하향)</span>
                  </div>
                </div>
                <div class="rab-desc">※ ${ymText} 이후 개정약관 가입 고객은 ${rev.tier}으로 하향 지급됩니다.</div>
              </div>`
          };
        }

        const targetYm = year * 100 + (month || 12);
        if (targetYm >= rev.ym) {
          return {
            tier: rev.tier,
            hasDiff: true,
            diffBadge: `[개정약관 ${rev.tier}]`,
            note: `${rev.co} ${ymText} 개정약관 적용 (${rev.tier})`,
            boxHTML: `
              <div class="rev-alert-box">
                <div class="rab-title">✓ ${rev.co} ${ymText} 이후 개정약관 (${rev.tier} 확정)</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">고객 가입 시점이 ${ymText} 이후이므로 ${rev.tier}에 해당합니다. (이전 계약은 3종)</div>
              </div>`
          };
        } else {
          return {
            tier: '3종',
            hasDiff: true,
            diffBadge: '[개정 이전 3종]',
            note: `${rev.co} ${ymText} 이전 계약으로 3종 정상 지급`,
            boxHTML: `
              <div class="rev-alert-box blue">
                <div class="rab-title">✓ ${rev.co} ${ymText} 이전 계약 (3종 확정)</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">${ymText} 개정 전 가입 계약이므로 정상적으로 제3항 유방절단술 3종 수술비가 지급됩니다.</div>
              </div>`
          };
        }
      }

      // 복수 회사 선택
      const coResults = cosList.map(coName => {
        const normCo = coName.toLowerCase();
        const rev = this.revisions.find(r => r.matchKeys.some(k => normCo.includes(k)));
        if (!rev) return { co: coName, tier: '3종', note: '개정 없이 3종 유지' };
        const ymText = `${Math.floor(rev.ym / 100)}년 ${rev.ym % 100}월`;
        if (!year) return { co: coName, tier: rev.tier === '1종' ? '1·3종' : '2·3종', note: `${ymText} 개정` };
        const targetYm = year * 100 + (month || 12);
        return {
          co: coName,
          tier: targetYm >= rev.ym ? rev.tier : '3종',
          note: targetYm >= rev.ym ? `${ymText} 개정 ${rev.tier}` : `${ymText} 이전 3종 유지`
        };
      });

      const hasDiff = coResults.some(r => r.tier !== '3종');
      return {
        tier: coResults.every(r => r.tier === coResults[0].tier) ? coResults[0].tier : '회사별 상이',
        hasDiff,
        diffBadge: hasDiff ? '[회사별 상이]' : '',
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
                    <span style="font-weight:900;padding:2px 8px;border-radius:5px;font-size:11.5px;background:${cr.tier === '1종' ? '#dc2626' : (cr.tier === '2종' ? '#d97706' : '#2563eb')};color:#fff;">${esc(cr.tier)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>`
      };
    }
  },
  {
    id: 'gallstone',
    name: '담석증 복강경수술',
    match: (g) => {
      const codes = g.c || [];
      if (codes.some(c => c.startsWith('C'))) return false;
      return codes.some(c => c.startsWith('K80')) || (g.n || '').includes('담석');
    },
    revisions: [
      { co: '메리츠화재', ym: 202412, tier: '2종', matchKeys: ['메리츠', '멜츠'] }
    ],
    evaluate: function(cosInput, year, month) {
      const cosList = parseCosList(cosInput);

      if (cosList.length === 0) {
        return {
          tier: '2·3종',
          hasDiff: true,
          diffBadge: '[메리츠 2종 하향]',
          note: '표준 1~5종 제36항 3종 지급, 메리츠화재는 2024.12 개정으로 2종 하향',
          boxHTML: `
            <div class="rev-alert-box">
              <div class="rab-title">⚠️ 담석증(K80) 복강경 담낭절제 약관 기준</div>
              <div class="rab-card">
                <div class="rab-row">
                  <span class="rab-label">표준 1~5종 (삼성·현대·KB·DB 등 전사)</span>
                  <span class="rab-val blue">제36항 3종 지급</span>
                </div>
                <div class="rab-row">
                  <span class="rab-label">메리츠화재 (2024.12~ 개정약관Ⅱ)</span>
                  <span class="rab-val red">2종 하향 적용</span>
                </div>
              </div>
              <div class="rab-desc">※ 복강경 담낭절제술은 제36항(3종)이나, 메리츠화재 「1-5종 수술분류표Ⅱ」만 담석증을 2종으로 하향 규정하고 있습니다.</div>
            </div>`
        };
      }

      if (cosList.length === 1) {
        const coStr = cosList[0];
        const normCo = coStr.toLowerCase();
        const rev = this.revisions.find(r => r.matchKeys.some(k => normCo.includes(k)));

        if (!rev) {
          return {
            tier: '3종',
            hasDiff: false,
            diffBadge: '',
            note: `${coStr}는 개정 없이 제36항 3종 유지`,
            boxHTML: `
              <div class="rev-alert-box blue">
                <div class="rab-title">✓ ${coStr} 담석증 복강경수술 [3종 지급]</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">표준 1~5종 수술분류표 제36항 담낭·담도 관혈수술(3종)로 정상 지급됩니다.</div>
              </div>`
          };
        }

        const ymText = `${Math.floor(rev.ym / 100)}년 ${rev.ym % 100}월`;
        if (!year) {
          return {
            tier: '2·3종',
            hasDiff: true,
            diffBadge: '[가입시기별 상이]',
            note: `${rev.co}는 ${ymText} 기점으로 3종 ➔ 2종 하향 개정`,
            boxHTML: `
              <div class="rev-alert-box">
                <div class="rab-title">⚠️ ${rev.co} 담석증 복강경 가입시기별 기준</div>
                <div class="rab-card">
                  <div class="rab-row">
                    <span class="rab-label">${ymText} 이전 계약</span>
                    <span class="rab-val blue">3종 지급 (제36항)</span>
                  </div>
                  <div class="rab-row">
                    <span class="rab-label">${ymText} 이후 계약</span>
                    <span class="rab-val red">2종 적용 (하향)</span>
                  </div>
                </div>
                <div class="rab-desc">※ ${ymText} 이후 가입 고객은 2종으로 하향 지급됩니다.</div>
              </div>`
          };
        }

        const targetYm = year * 100 + (month || 12);
        if (targetYm >= rev.ym) {
          return {
            tier: '2종',
            hasDiff: true,
            diffBadge: '[개정약관 2종]',
            note: `${rev.co} ${ymText} 개정약관 적용 (2종)`,
            boxHTML: `
              <div class="rev-alert-box">
                <div class="rab-title">✓ ${rev.co} ${ymText} 이후 개정약관 (2종 확정)</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">고객 가입 시점이 ${ymText} 이후이므로 2종에 해당합니다. (이전 계약은 3종)</div>
              </div>`
          };
        } else {
          return {
            tier: '3종',
            hasDiff: true,
            diffBadge: '[개정 이전 3종]',
            note: `${rev.co} ${ymText} 이전 계약으로 3종 정상 지급`,
            boxHTML: `
              <div class="rev-alert-box blue">
                <div class="rab-title">✓ ${rev.co} ${ymText} 이전 계약 (3종 확정)</div>
                <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">${ymText} 개정 전 가입 계약이므로 정상적으로 제36항 3종 수술비가 지급됩니다.</div>
              </div>`
          };
        }
      }

      // 복수 회사
      const coResults = cosList.map(coName => {
        const normCo = coName.toLowerCase();
        const isMeritz = ['메리츠', '멜츠'].some(k => normCo.includes(k));
        if (!isMeritz) return { co: coName, tier: '3종', note: '개정 없이 3종 유지' };
        if (!year) return { co: coName, tier: '2·3종', note: '2024.12 개정' };
        const targetYm = year * 100 + (month || 12);
        return {
          co: coName,
          tier: targetYm >= 202412 ? '2종' : '3종',
          note: targetYm >= 202412 ? '2024.12 개정 2종' : '개정 이전 3종 유지'
        };
      });

      const hasDiff = coResults.some(r => r.tier.includes('2종'));
      return {
        tier: coResults.every(r => r.tier === coResults[0].tier) ? coResults[0].tier : '회사별 상이',
        hasDiff,
        diffBadge: hasDiff ? '[회사별 상이]' : '',
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
                    <span style="font-weight:900;padding:2px 8px;border-radius:5px;font-size:11.5px;background:${cr.tier === '2종' ? '#d97706' : '#2563eb'};color:#fff;">${esc(cr.tier)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>`
      };
    }
  }
];

function evaluateSurgery(g, cosInput, year, month) {
  for (const rule of REVISION_RULES) {
    if (rule.match(g)) {
      const res = rule.evaluate(cosInput, year, month);
      res.ruleId = rule.id;
      res.ruleName = rule.name;
      return res;
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


/* ───────────────────────── 질수(기본질병수술) & N대 판정 요약 ───────────────────────── */
function getBasicSurgerySummary(g) {
  if (!g) return null;
  const codes = g.c || [];
  const name = g.n || '';
  const vs = g.vs || [];

  // 1. 요실금 (N39.3, N39.4, R32)
  if (codes.some(c => c.startsWith('N39.3') || c.startsWith('N39.4') || c.startsWith('R32')) || name.includes('요실금')) {
    return {
      status: 'no',
      badge: '❌ 보상제외',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.05)',
      border: '#ef4444',
      bg: 'var(--surface)',
      title: '기본 질병수술비 (정액)',
      summary: '전사 면책: 비뇨기계 기능장애(N39.3, N39.4) 보상 제외',
      tierSummary: '1~5종: ⭕ 2종(TOT·TVT 1종 or 인공괄약근 2종) 지급',
      hasDetail: true
    };
  }

  // 2. 치핵·항문질환 (K60~K64)
  if (codes.some(c => c.startsWith('K60') || c.startsWith('K61') || c.startsWith('K62') || c.startsWith('K64')) || name.includes('치핵') || name.includes('치루') || name.includes('치열')) {
    return {
      status: 'no',
      badge: '❌ 보상제외',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.05)',
      border: '#ef4444',
      bg: 'var(--surface)',
      title: '기본 질병수술비 (정액)',
      summary: '전사 면책: 직장·항문질환(K60~K64) 보상 제외 (치핵전용특약만 가능)',
      tierSummary: '1~5종: ⭕ 제53항 치핵·치루 근치수술 1종 전사 지급',
      hasDetail: true
    };
  }

  // 3. 제왕절개·출산 (O80~O84)
  if (codes.some(c => c.startsWith('O82') || c.startsWith('O80') || c.startsWith('O84')) || name.includes('제왕절개') || vs.some(v => v.includes('제왕절개') || v.includes('출산') || v.includes('분만'))) {
    return {
      status: 'no',
      badge: '❌ 보상제외',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.05)',
      border: '#ef4444',
      bg: 'var(--surface)',
      title: '기본 질병수술비 (정액)',
      summary: '전사 면책: 임신·출산·제왕절개(O코드) 보상 제외',
      tierSummary: '1~5종: ⭕ 제54항 제왕절개만출술 1종 지급',
      hasDetail: true
    };
  }

  // 4. 체외충격파쇄석술 (ESWL / N20~N23) - 요로결석 등
  if (codes.some(c => ['N20', 'N21', 'N22', 'N23'].some(t => c.startsWith(t))) || name.includes('결석') || vs.some(v => v.includes('쇄석') || v.includes('ESWL'))) {
    return {
      status: 'check',
      badge: '⚠️ 별도확인',
      badgeColor: '#d97706',
      badgeBg: 'rgba(245, 158, 11, 0.08)',
      border: '#d97706',
      bg: 'var(--surface)',
      title: '기본 질병수술비 (정액)',
      summary: '절단·절제 미충족 시 제외(삼성·KB·현대 등)이나, DB손보 등 쇄석술 미제외 회사는 지급 가능하여 증권 확인 필수',
      tierSummary: '1~5종: ⚠️ 회사·특약별 1종 또는 2종 (생보 2종, 손보사 개정 하향 확인)',
      hasDetail: true
    };
  }

  // 5. 백내장 (H25, H26)
  if (codes.some(c => c.startsWith('H25') || c.startsWith('H26')) || name.includes('백내장') || vs.some(v => v.includes('다초점') || v.includes('인공수정체'))) {
    return {
      status: 'warning',
      badge: '⚠️ 별도확인',
      badgeColor: '#d97706',
      badgeBg: 'rgba(217, 119, 6, 0.05)',
      border: '#d97706',
      bg: 'var(--surface)',
      title: '기본 질병수술비 (정액)',
      summary: '삼성 질수Ⅳ 및 KB 질수(백내장제외) 등 제외형 특약 주의',
      tierSummary: '1~5종: ⭕ 제71항 백내장·수정체 관혈수술 1종 (다초점·단초점 무관)',
      hasDetail: true
    };
  }

  // 6. 통상 질환 (정상 지급)
  return {
    status: 'yes',
    badge: '⭕ 정상보장',
    badgeColor: '#e11d48',
    badgeBg: 'rgba(225, 29, 72, 0.05)',
    border: '#e11d48',
    bg: 'var(--surface)',
    title: '기본 질병수술비 (정액)',
    summary: '표준약관상 기구를 사용한 생체 절단·절제 충족 시 정상 지급',
    tierSummary: '1~5종: ⭕ 수술분류표 기준 해당 등급 지급',
    hasDetail: false
  };
}

function getNdaiVerdictSummary(g, cosList) {
  if (!g) return { badge: '확인 필요', summary: 'N대 담보 확인', badgeColor: 'var(--text-3)', bg: 'var(--surface-2)', border: 'var(--border)' };
  const { cos } = matchInfo(g);

  // 회사 필터가 선택된 경우 (단일 회사 또는 복수 회사)
  if (cosList && cosList.length > 0) {
    const coveredCos = cosList.filter(c => Array.from(cos.keys()).some(k => k.includes(c.slice(0, 2)) || c.includes(k.slice(0, 2))));
    if (coveredCos.length > 0) {
      const firstCo = coveredCos[0];
      const items = formatNdaItemsForCo(g, firstCo, null);
      const tierDesc = items.length > 0 ? `${items[0].tierText} [${items[0].subClean}] 해당` : 'N대 특약 보장 해당';
      return {
        covered: true,
        badge: '⭕ 보장 해당',
        badgeColor: '#059669',
        bg: 'var(--surface)',
        border: '#059669',
        summary: `[${coveredCos.join(', ')}] ${tierDesc}`
      };
    } else {
      return {
        covered: false,
        badge: '❌ 미해당',
        badgeColor: 'var(--text-3)',
        bg: 'var(--surface)',
        border: 'var(--border)',
        summary: `선택하신 [${cosList.join(', ')}] N대 특약 분류표에는 미포함 (종수술비 청구)`
      };
    }
  }

  // 회사 미선택(전체)인 경우
  if (cos && cos.size > 0) {
    const majorCos = ['현대해상', 'KB손해보험', '메리츠화재', '삼성화재', 'DB손해보험'];
    const matchedMajors = majorCos.filter(m => Array.from(cos.keys()).some(k => k.includes(m.slice(0, 2))));
    const count = cos.size;
    const majorText = matchedMajors.length >= 3 ? `주요 5대 손보사 및 ${count}개사 해당` : `${count}개 보험사 해당`;
    return {
      covered: true,
      badge: `⭕ ${count}곳 해당`,
      badgeColor: '#059669',
      bg: 'var(--surface)',
      border: '#059669',
      summary: majorText
    };
  } else {
    return {
      covered: false,
      badge: '❌ 미해당',
      badgeColor: 'var(--text-3)',
      bg: 'var(--surface)',
      border: 'var(--border)',
      summary: '주요 손보사 N대 특약 분류표 미포함 (종수술비 청구)'
    };
  }
}

function renderBasicSurgeryBox(info) {
  if (!info) return '';
  return `
    <div class="basic-surg-summary-card" style="background:rgba(219,39,119,0.05);border:1px solid rgba(219,39,119,0.25);border-radius:10px;padding:9px 12px;margin:8px 0 4px 0;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;flex-wrap:wrap;gap:4px;">
        <span style="font-size:12px;font-weight:900;color:#db2777;">💡 기본 질병수술비(정액) 판정</span>
        <span style="font-size:11px;font-weight:850;color:${info.badgeColor};background:var(--surface);padding:2px 7px;border-radius:5px;border:1px solid ${info.border};">${esc(info.badge)}</span>
      </div>
      <div style="font-size:11.5px;color:var(--text);font-weight:750;line-height:1.45;">${esc(info.summary)}</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:3px;line-height:1.4;">${esc(info.tierSummary)}</div>
      ${info.hasDetail ? `<div style="font-size:10.5px;color:#db2777;margin-top:4px;font-weight:750;">↳ 회사별 상세 약관 원문은 아래 [지급기준근거 ∨]에서 확인 가능</div>` : ''}
    </div>`;
}



/* ───────────────────────── 1~3종 특약 (2006년 이전 구약관) 종수 산출 ───────────────────────── */
function get3TierForDisease(g, evalRes) {
  const codes = (g.c || []).map(c => c.toUpperCase());
  const name = g.n || '';

  // 1. 암 / 악성신생물: 1~3종은 제80항 악성신생물 근치수술 [3종] (당시 최고 등급)
  if (codes.some(c => c.startsWith('C') || c.startsWith('D0'))) {
    return { tier3: '3종', note3: '구 1~3종 제80항 악성신생물 근치 (3종)' };
  }

  // 2. 인공관절치환술 (고관절·슬관절): 1~3종 제13-2항 사지관절관혈 [2종] (1~5종은 4종)
  if (codes.some(c => c.startsWith('M17') || c.startsWith('M16') || c.startsWith('M15')) || name.includes('인공관절') || name.includes('치환술')) {
    return { tier3: '2종', note3: '구 1~3종 제13-2항 사지관절관혈 (2종)' };
  }

  // 3. 개복·개흉 대수술 (위, 폐, 간, 신장, 대장 등 4종 해당 장기절제): 1~3종 제33·35·43항 등 [3종]
  const tier5Num = parseInt(evalRes?.tier) || tierOf(g);
  if (tier5Num >= 4) {
    return { tier3: '3종', note3: '구 1~3종 개복·개흉 장기절제 (3종)' };
  }

  // 4. 척추 디스크 관혈수술: 1~3종 제9항 척추골·추간판 관혈 [3종]
  if (codes.some(c => c.startsWith('M50') || c.startsWith('M51') || c.startsWith('M48')) || name.includes('추간판') || name.includes('디스크')) {
    return { tier3: '3종', note3: '구 1~3종 제9항 척추골·추간판 관혈 (3종)' };
  }

  // 5. 요실금: 1~3종은 [2종] 지급! (2008년 이전 생보 2종 -> 1~5종은 1종으로 축소)
  if (codes.some(c => c.startsWith('N39.3') || c.startsWith('N39.4') || c.startsWith('R32')) || name.includes('요실금')) {
    return { tier3: '2종', note3: '구 1~3종 방광류·요실금 (2종)' };
  }

  // 6. 요로결석 체외충격파쇄석술 (ESWL): 1~3종 제86항 [2종]
  if (codes.some(c => c.startsWith('N20') || c.startsWith('N21') || c.startsWith('N22') || c.startsWith('N23')) || name.includes('결석') || name.includes('쇄석')) {
    return { tier3: '2종', note3: '구 1~3종 제86항 체내결석파쇄술 (2종)' };
  }

  // 7. 대장용종 (폴립절제술): 1~3종 제36항/제87항 [2종] (내시경 1~2종)
  if (codes.some(c => c.startsWith('K63.5') || c.startsWith('D12') || c.startsWith('K62.1')) || name.includes('폴립') || name.includes('용종')) {
    return { tier3: '2종', note3: '구 1~3종 폴립·종양절제 (2종)' };
  }

  // 8. 맘모톰 / 유방 종양: 1~3종 제4항 기타 유방수술 [2종] 준용
  if (codes.some(c => c.startsWith('D24') || c.startsWith('N60') || c.startsWith('N63')) || name.includes('유방') || name.includes('맘모톰')) {
    return { tier3: '2종', note3: '구 1~3종 제4항 유방수술 (2종 준용)' };
  }

  // 9. 백내장: 1~3종 제68항 백내장·수정체 관혈 [1종]
  if (codes.some(c => c.startsWith('H25') || c.startsWith('H26')) || name.includes('백내장') || name.includes('수정체')) {
    return { tier3: '1종', note3: '구 1~3종 제68항 백내장 관혈 (1종)' };
  }

  // 10. 치핵 / 치루: 1~3종 제44항 치루·치핵 근본수술 [1종]
  if (codes.some(c => c.startsWith('K60') || c.startsWith('K64') || c.startsWith('K62')) || name.includes('치핵') || name.includes('치루') || name.includes('치질')) {
    return { tier3: '1종', note3: '구 1~3종 제44항 치핵 근본수술 (1종)' };
  }

  // 11. 제왕절개: 1~3종 제54항 [1종]
  if (codes.some(c => c.startsWith('O82')) || name.includes('제왕절개')) {
    return { tier3: '1종', note3: '구 1~3종 제54항 제왕절개만출술 (1종)' };
  }

  // 12. 충수염 (맹장): 1~3종 제41항 [2종]
  if (codes.some(c => c.startsWith('K35') || c.startsWith('K37')) || name.includes('충수') || name.includes('맹장')) {
    return { tier3: '2종', note3: '구 1~3종 제41항 충수절제술 (2종)' };
  }

  // 13. 담석증: 1~3종 제36항 [2종]
  if (codes.some(c => c.startsWith('K80') || c.startsWith('K81')) || name.includes('담석') || name.includes('담낭')) {
    return { tier3: '2종', note3: '구 1~3종 제36항 담낭 관혈 (2종)' };
  }

  // 14. 일반 변환
  if (tier5Num === 1) return { tier3: '1종', note3: '구 1~3종 수술분류표 기준 1종' };
  if (tier5Num === 2) return { tier3: '2종', note3: '구 1~3종 수술분류표 기준 2종' };
  if (tier5Num === 3) return { tier3: '2종', note3: '구 1~3종 수술분류표 기준 2종' };
  if (tier5Num >= 4) return { tier3: '3종', note3: '구 1~3종 수술분류표 기준 3종' };
  return { tier3: '2종', note3: '구 1~3종 수술분류표 기준' };
}

function formatProcBadge(p) {
  if (!p || !p.t) return '❌ 미해당';
  const t = p.t;
  if (t.includes('비해당') || t.includes('부지급') || t.includes('면책')) return '❌ 비해당';
  if (t.includes('1~2종') || t.includes('1-2종')) return '⭕ 1·2종 해당';
  if (t.includes('2~3종') || t.includes('2-3종')) return '⭕ 2·3종 해당';
  if (t.includes('3~4종') || t.includes('3-4종')) return '⭕ 3·4종 해당';
  if (t.includes('1종')) return '⭕ 1종 해당';
  if (t.includes('2종')) return '⭕ 2종 해당';
  if (t.includes('3종')) return '⭕ 3종 해당';
  if (t.includes('4종')) return '⭕ 4종 해당';
  if (t.includes('5종')) return '⭕ 5종 해당';
  return '⚠️ 별도확인';
}

function cardQuickHTML(gi, q, matchedEdi, parsed, isSub = false) {
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

  // 사용자가 특정 수술기법(유로리프트, 베나실, 하이푸, 신경성형술, 클라리베인, 워터젯, 홀렙, 비밸브 등)으로 검색한 경우 해당 수술 행 매칭
  let matchedProc = null;
  const procKeywords = ['유로리프트', '베나실', '하이푸', '신경성형', '클라리베인', '워터젯', '레줌', '홀렙', '비밸브', '맘모톰', '치조골', '원추절제', '체외충격파', '인공관절', '수근관'];
  const hasProcKeyword = procKeywords.some(k => (q || '').includes(k));
  if (hasProcKeyword && procs && procs.val) {
    const qNorm = norm(q || '');
    matchedProc = procs.val.find(p => {
      const sNorm = norm(p.s);
      return procKeywords.some(k => qNorm.includes(k) && sNorm.includes(k));
    });
  }

  const displayTitle = hl(g.n, q);

  let procsHTML = '';
  if (procs && procs.val && procs.val.length > 0) {
    const drawerId = `procs-drawer-${gi}-${Math.random().toString(36).slice(2, 7)}`;
    procsHTML = `
      <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line);">
        <button type="button" class="btn-toggle-procs" onclick="
          const d = document.getElementById('${drawerId}');
          const arr = this.querySelector('.arrow-ico');
          if (d.style.display === 'none' || !d.style.display) {
            d.style.display = 'flex';
            if (arr) arr.textContent = '접기 ▴';
          } else {
            d.style.display = 'none';
            if (arr) arr.textContent = '펼쳐보기 ▾';
          }
        " style="width:100%;height:46px;min-height:46px;max-height:46px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;background:rgba(49,130,246,0.08);border:1.5px solid rgba(49,130,246,0.35);border-radius:10px;padding:0 14px;cursor:pointer;font-size:13px;font-weight:900;color:#1d4ed8;transition:all 0.15s ease;">
          <span>🔍 수술방식별 1~5종 지급 기준</span>
          <span class="arrow-ico" style="font-size:11.5px;font-weight:850;background:rgba(49,130,246,0.16);padding:3px 8px;border-radius:5px;white-space:nowrap;color:#1d4ed8;">펼쳐보기 ▾</span>
        </button>
        <div id="${drawerId}" style="display:none;margin-top:8px;flex-direction:column;gap:6px;">
          ${procs.val.map(p => {
            const isMatch = matchedProc && matchedProc.s === p.s;
            const rawTag = esc(p.t);
            const isNo = rawTag.includes('비해당');
            const cleanTag = isNo ? '비해당' : rawTag;
            const fontSize = cleanTag.length >= 6 ? '11px' : (cleanTag.length >= 4 ? '12px' : '13px');
            const tierClass = isNo ? 't-no' : ('t' + (parseInt(p.t) || 2));
            return `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;background:${isMatch ? 'rgba(49,130,246,0.08)' : 'var(--surface)'};border:1.5px solid ${isMatch ? 'var(--brand)' : 'var(--line)'};border-radius:9px;">
              <div style="display:flex;flex-direction:column;gap:2px;min-width:0;flex:1;">
                <span style="font-size:13px;font-weight:850;color:${isMatch ? 'var(--brand)' : 'var(--text)'};word-break:keep-all;">${isMatch ? '👉 ' : ''}${esc(p.s)}</span>
                ${p.n ? `<span style="font-size:11px;color:var(--text-3);line-height:1.35;">${esc(p.n)}</span>` : ''}
              </div>
              <span class="proc-tag-cell ${tierClass}" style="font-size:${fontSize};${isNo ? 'background:#ef4444;color:#fff;' : ''}">
                ${cleanTag}
              </span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  const diffPillHTML = evalRes.diffBadge
    ? `<span class="judge-diff-pill" style="font-size:10.5px;padding:2px 6px;">⚠️ ${esc(evalRes.diffBadge.replace(/[\[\]]/g, ''))}</span>`
    : '';

  const basicSurg = getBasicSurgerySummary(g);
  const ndaiVerdict = getNdaiVerdictSummary(g, cosList);

  // N대질병 중복 요약문 배제 (우측 뱃지와 'N개사 해당' 문구가 겹치는 경우 제거)
  const isDuplicateNdaiSummary = ndaiVerdict.summary && (
    ndaiVerdict.summary.includes('보험사 해당') ||
    ndaiVerdict.summary === ndaiVerdict.badge ||
    ndaiVerdict.badge.includes(ndaiVerdict.summary)
  );
  const ndaiSummaryHTML = (!isDuplicateNdaiSummary && ndaiVerdict.summary)
    ? `<span style="font-size:11px;color:var(--text-2);line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(ndaiVerdict.summary)}</span>`
    : '';

  // 개정약관/하향 안내 접이식 서랍화 (대장용종 2종→1종 하향 개정 등)
  let revisionSectionHTML = '';
  if (evalRes.boxHTML) {
    let revTitle = '⚠️ 가입시기 및 보험사별 약관 기준';
    if (evalRes.ruleId === 'hyundai_cancer_4tier') {
      revTitle = '⚠️ 2026 현대해상 담보별 상이 약관 기준';
    } else if (evalRes.ruleId === 'colon_polyp') {
      revTitle = '⚠️ 대장용종 2종 ➔ 1종 하향 개정';
    } else if (evalRes.ruleId === 'eswl_tier') {
      revTitle = '⚠️ 체외충격파 2종 ➔ 1종 하향 개정';
    } else if (evalRes.ruleId === 'breast_hyper') {
      revTitle = '⚠️ 여유증·유방비대 1·2종 하향 개정';
    } else if (evalRes.ruleId === 'gallstone') {
      revTitle = '⚠️ 담석증 복강경 2종 하향 개정';
    } else if (evalRes.diffBadge) {
      revTitle = `⚠️ ${evalRes.diffBadge.replace(/[\[\]]/g, '')} 약관 기준`;
    }
    revisionSectionHTML = `
      <div class="quick-rev-wrapper" style="margin:6px 0;">
        <button type="button" class="btn-toggle-quick-rev" style="width:100%;height:46px;min-height:46px;max-height:46px;box-sizing:border-box;background:rgba(245,158,11,0.08);border:1.5px solid rgba(245,158,11,0.35);border-radius:10px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;font-size:13px;font-weight:900;color:#b45309;transition:all .15s ease;">
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1;text-align:left;">${revTitle}</span>
          <span class="qrev-arrow" style="font-size:11.5px;font-weight:850;background:rgba(245,158,11,0.18);padding:3px 8px;border-radius:5px;white-space:nowrap;color:#b45309;flex-shrink:0;margin-left:8px;">펼쳐보기 ▾</span>
        </button>
        <div class="quick-rev-drawer" style="display:none;margin-top:4px;">
          ${evalRes.boxHTML}
        </div>
      </div>`;
  }

  const tier3Val = get3TierForDisease(g, evalRes).tier3;

  let basicBadge = basicSurg.badge;
  if (matchedProc) {
    if (matchedProc.s.includes('신경성형') || matchedProc.s.includes('지방흡입')) {
      basicBadge = '❌ 보상제외';
    } else if (matchedProc.s.includes('유로리프트') || matchedProc.s.includes('베나실') || matchedProc.s.includes('클라리베인') || matchedProc.s.includes('하이푸') || matchedProc.s.includes('체외충격파')) {
      basicBadge = '⚠️ 별도확인';
    }
  }
  const basicColor = basicBadge.startsWith('⭕') ? '#e11d48' : (basicBadge.startsWith('⚠️') ? '#d97706' : '#ef4444');

  const tier5Badge = matchedProc
    ? formatProcBadge(matchedProc)
    : (evalRes.tier && evalRes.tier !== '부지급' && evalRes.tier !== '0원' ? `⭕ ${esc(evalRes.tier)} 해당` : '❌ 미해당');
  const tier5Color = tier5Badge.includes('비해당') || tier5Badge.includes('미해당') ? '#ef4444' : (tier5Badge.includes('별도확인') ? '#d97706' : '#2563eb');

  let tier3Badge = tier3Val && tier3Val !== '부지급' && tier3Val !== '0원' ? `⭕ ${esc(tier3Val)} 해당` : '❌ 미해당';
  if (matchedProc) {
    if (matchedProc.s.includes('유로리프트') || matchedProc.s.includes('베나실') || matchedProc.s.includes('클라리베인') || matchedProc.s.includes('하이푸') || matchedProc.s.includes('신경성형')) {
      tier3Badge = '❌ 비해당';
    }
  }
  const tier3Color = tier3Badge.includes('비해당') || tier3Badge.includes('미해당') ? '#ef4444' : (tier3Badge.includes('별도확인') ? '#d97706' : '#2563eb');

  const innerCardHTML = `
      <!-- 빠른검색 4대 핵심 담보 판정 (질병수술 · 1~5종 · 1~3종 · N대) : 50px 균일 순백색 박스, 칸 테두리 구분, 좌측 검정 텍스트 규격 통일, 우측 포인트 뱃지 -->
      <div class="quick-3verdict-box" style="display:flex;flex-direction:column;gap:8px;margin:8px 0 8px 0;">
        <!-- 1. 질병수술 -->
        <div class="qvb-row">
          <div class="qvb-left-label">
            <span>💡 질병수술</span>
          </div>
          <span class="qvb-badge" style="border:1.5px solid ${basicColor};color:${basicColor};">${esc(basicBadge)}</span>
        </div>

        <!-- 2. 1~5종 수술 -->
        <div class="qvb-row">
          <div class="qvb-left-label">
            <span>📋 1~5종 수술</span>
          </div>
          <span class="qvb-badge" style="border:1.5px solid ${tier5Color};color:${tier5Color};">
            ${esc(tier5Badge)}
          </span>
        </div>

        <!-- 3. 1~3종 수술 -->
        <div class="qvb-row">
          <div class="qvb-left-label">
            <span>📜 1~3종 수술</span>
          </div>
          <span class="qvb-badge" style="border:1.5px solid ${tier3Color};color:${tier3Color};">${esc(tier3Badge)}</span>
        </div>

        <!-- 4. N대질병 (클릭 시 해당 회사 목록 및 질병코드 서랍 펼침) -->
        <div class="qvb-row btn-toggle-quick-ndai" style="cursor:pointer;">
          <div class="qvb-left-label">
            <span>🏢 N대질병</span>
          </div>
          <span class="qvb-badge qndai-arrow-badge" style="border:1.5px solid ${ndaiVerdict.covered ? '#059669' : 'var(--border)'};color:${ndaiVerdict.covered ? '#059669' : 'var(--text-3)'};">${esc(ndaiVerdict.badge)} ▾</span>
        </div>
        <div class="quick-ndai-drawer" style="display:none;margin-top:4px;">
          ${renderNdaiDetailsHTML(g, cosList, null)}
        </div>
      </div>

      ${revisionSectionHTML}
      ${procsHTML}

      <!-- 정밀 진단 바로가기 버튼 2종 (완벽한 단일행 대칭 규격) -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:14px;padding-top:12px;margin-bottom:4px;border-top:1px dashed var(--line);">
        <button type="button" class="btn-jump-action btn-jump-tier" data-q="${esc(g.n)}">
          <span>📋 종수술비 바로가기</span>
        </button>
        <button type="button" class="btn-jump-action btn-jump-ndai" data-q="${esc(g.n)}">
          <span>🏢 N대질병 바로가기</span>
        </button>
      </div>
      <div style="font-size:11px;color:var(--text-3);text-align:center;margin-top:8px;margin-bottom:6px;line-height:1.4;">
        ※ 7·8종(급여 수술)은 상단 <strong>[7·8종수술]</strong> 메뉴에서 별도로 검색하실 수 있습니다.
      </div>
  `;

  if (isSub) {
    return `
    <div class="sub-disease-item card" data-gi="${gi}" style="background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.03);transition:all .15s ease;">
      <div class="btn-toggle-sub-disease" style="padding:11px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;background:var(--surface);user-select:none;">
        <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
          <span class="kcd-badge-big" style="font-size:11px;padding:3px 7px;flex-shrink:0;">${g.c.slice(0, 2).join(', ')}</span>
          <span style="font-size:13.5px;font-weight:900;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${displayTitle}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span class="sub-disease-arrow" style="font-size:11.5px;font-weight:800;color:var(--brand);background:var(--surface-2);padding:3px 8px;border-radius:6px;border:1px solid var(--border);">펼쳐보기 ▾</span>
        </div>
      </div>
      <div class="sub-disease-drawer" style="display:none;padding:12px 14px 14px 14px;border-top:1px dashed var(--line);background:var(--surface);">
        <div class="card-head" style="padding:0;margin-bottom:8px;">
          ${ediBanner}
          ${innerCardHTML}
        </div>
      </div>
    </div>`;
  }

  return `
  <article class="card main-quick-card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <span class="kcd-badge-big">${g.c.slice(0, 3).join(', ')}</span>
        <h3 class="card-name">${displayTitle}</h3>
        <span style="margin-left:auto;font-size:11px;font-weight:850;color:#2563eb;background:rgba(49,130,246,0.1);padding:2px 7px;border-radius:5px;border:1px solid rgba(49,130,246,0.3);">⭐ 대표 질환</span>
      </div>

      ${ediBanner}
      ${innerCardHTML}
    </div>
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
    let dtText = '전체';
    if (state.tYear && state.tMonth) {
      dtText = `${state.tYear}년 ${state.tMonth}월`;
    } else if (state.tYear) {
      dtText = `${state.tYear}년`;
    }
    dBadge.textContent = `: ${dtText}`;
  }

  if (cBadge) {
    const coText = state.tCos && state.tCos.length > 0 ? state.tCos.join(', ') : (state.tCo || '전체');
    cBadge.textContent = `: ${coText}`;
  }
}

function renderTierEmptyExample() {
  const box = $('#results-tier');
  if (box) box.innerHTML = '';
}
window.renderTierEmptyExample = renderTierEmptyExample;

function renderYearGrid() {
  const grid = $('#tierYearGrid');
  const monthSec = $('#tierMonthSection');
  if (!grid) return;

  grid.innerHTML = `
    <button class="f-chip y-chip ${state.tYear === null ? 'on' : ''}" data-y="" style="padding:6px 0;font-size:11px;font-weight:800;grid-column:span 4;">전체</button>
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

  function resetTierFilters() {
    state.tCos = [];
    state.tCo = '';
    state.tYear = null;
    state.tMonth = null;
    state.tGen = 'recent';
    state.tCoTouched = false;
    state.tDateTouched = false;
    $$('#tierCoSonbo .f-chip, #tierCoSaengbo .f-chip').forEach(b => {
      b.classList.toggle('on', !b.dataset.co);
    });
    $$('#tierYearGrid .y-chip').forEach(b => b.classList.remove('on'));
    $$('#tierMonthGrid .m-chip').forEach((b, idx) => b.classList.toggle('on', idx === 0));
    const tierDateBody = $('#tierDateBody');
    const tierCoBody = $('#tierCoBody');
    if (tierDateBody) tierDateBody.style.display = 'none';
    if ($('#tierDateToggleIcon')) $('#tierDateToggleIcon').textContent = '펼치기 ∨';
    if (tierCoBody) tierCoBody.style.display = 'none';
    if ($('#tierCoToggleIcon')) $('#tierCoToggleIcon').textContent = '펼치기 ∨';
    updateTierBadges();
  }
  window.resetTierFilters = resetTierFilters;

  // 하이브리드 스마트 검색창 입력 (21년3월, 2103, 202103, 메리츠 등 완벽 감지)
  qTierEl.addEventListener('input', debounce(() => {
    const v = qTierEl.value;
    state.tierQ = v;
    $('#clearBtn-tier').hidden = !v;
    if (!v.trim()) {
      resetTierFilters();
      renderTierEmptyExample();
      return;
    }

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
    resetTierFilters();
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
  const normQ = norm(q);
  const compPair = findComparisonPair(normQ);
  const exclProc = findExcludedProcedure(normQ);

  const res = search(q) || { groups: [], edi: [] };

  if (exclProc && exclProc.relatedCodes && (!res.groups || res.groups.length === 0)) {
    exclProc.relatedCodes.forEach(code => {
      (state.D.codeIndex[code] || []).forEach(gi => {
        if (!res.groups.includes(gi)) res.groups.push(gi);
      });
    });
  }

  const dtText = state.tYear ? (state.tMonth ? `${state.tYear}년 ${state.tMonth}월` : `${state.tYear}년`) : '';
  const cLabel = state.tCos && state.tCos.length > 0 ? state.tCos.join(', ') : (state.tCo || '');
  let headerMeta = '';
  if (cLabel && dtText) headerMeta = `[${esc(cLabel)} · ${esc(dtText)}]`;
  else if (cLabel) headerMeta = `[${esc(cLabel)}]`;
  else if (dtText) headerMeta = `[${esc(dtText)}]`;
  else headerMeta = `[전체]`;

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

  const looksEdi = /^[A-Z]\d{4}/i.test(q.replace(/\s+/g, ''));
  const compHTML = compPair ? renderComparisonPairHTML(compPair) : '';
  const exclHTML = exclProc ? renderExcludedProcedureHTML(exclProc) : '';
  const tierHTML = renderTierMatchCards(res.tiers, q, looksEdi);

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> 종수술비 정밀 결과 <span style="font-size:11.5px;color:var(--brand);font-weight:700;">${headerMeta}</span></div>
      <div class="res-count">${res.groups.length ? `분류 ${res.groups.length}건` : ""}${res.groups.length && (res.tiers||[]).length ? " · " : ""}${(res.tiers||[]).length ? `수술코드 ${res.tiers.length}건` : ""}</div>
    </div>
    ${familyBarHTML}`;

  if (!res.groups.length && !res.edi.length && !compPair && !exclProc && !tierHTML) {
    box.innerHTML = head + renderAiSuggestEmptyHTML(q, 'tier');
    bindAiSuggestChips(box);
    return;
  }

  let groupsHTML = '';
  if (res.groups.length > 0) {
    if (exclProc && exclProc.relatedCodes && exclProc.relatedCodes.length > 0) {
      groupsHTML += `<div style="font-size:12.5px;font-weight:900;color:var(--text);margin:14px 0 8px 4px;">💡 연관 질환 정식 종수술비 보장 내역 (${esc(exclProc.relatedDisease)})</div>`;
    }
    // 1순위 대표 질환 1건: 메인 카드로 당당하게 노출! (유방암 C50, 갑상선암 C73 등이 최우선 노출)
    const mainGi = res.groups[0];
    groupsHTML += cardTierHTML(mainGi, q, res.matchedEdi, false);

    // 2순위 이후: 제자리암(D코드)과 기타 연관 질환을 완벽히 분리 정돈!
    if (res.groups.length > 1) {
      const remainingGis = res.groups.slice(1, 15);
      const inSituGis = [];
      const otherGis = [];

      remainingGis.forEach(gi => {
        const itemG = state.D.g[gi];
        const isDCode = (itemG.c || []).some(c => /^[D]\d/i.test(c)) || (itemG.n || '').includes('제자리암') || (itemG.n || '').includes('상피내암');
        if (isDCode) {
          inSituGis.push(gi);
        } else {
          otherGis.push(gi);
        }
      });

      // 제자리암(상피내암) 별도 섹션
      if (inSituGis.length > 0) {
        groupsHTML += `
          <div style="margin:20px 0 10px 4px;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
              📂 연관 제자리암(상피내암) 질병코드별 확인 <span style="color:#2563eb;font-weight:900;">(${inSituGis.length}건)</span>
            </span>
            <span style="font-size:11px;color:#2563eb;font-weight:800;background:rgba(49,130,246,0.08);padding:3px 8px;border-radius:6px;border:1px solid rgba(49,130,246,0.25);">터치 시 상세 판정 ▾</span>
          </div>
          <div class="sub-diseases-list in-situ-diseases-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
            ${inSituGis.map(i => cardTierHTML(i, q, res.matchedEdi, true)).join('')}
          </div>
        `;
      }

      // 기타 연관 질환 섹션
      if (otherGis.length > 0) {
        groupsHTML += `
          <div style="margin:20px 0 10px 4px;display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
              📂 기타 연관 질환 및 다른 질병코드 <span style="color:var(--brand);font-weight:900;">(${otherGis.length}건)</span>
            </span>
            <span style="font-size:11px;color:var(--brand);font-weight:800;background:var(--surface-2);padding:2px 7px;border-radius:5px;border:1px solid var(--border);">터치 시 상세 판정 ▾</span>
          </div>
          <div class="sub-diseases-list other-diseases-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
            ${otherGis.map(i => cardTierHTML(i, q, res.matchedEdi, true)).join('')}
          </div>
        `;
      }
    }
  }

  let html = head;
  if (looksEdi) {
    html += tierHTML + compHTML + exclHTML + groupsHTML;
  } else {
    html += compHTML + exclHTML + groupsHTML + tierHTML;
  }
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

function cardTierHTML(gi, q, matchedEdi, isSub = false) {
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
  const tier3Info = get3TierForDisease(g, evalRes);

  // 사용자가 특정 수술기법(유로리프트, 베나실, 하이푸, 신경성형술, 클라리베인, 워터젯, 홀렙, 비밸브 등)으로 검색한 경우 해당 수술 행 매칭
  let matchedProc = null;
  const procKeywords = ['유로리프트', '베나실', '하이푸', '신경성형', '클라리베인', '워터젯', '레줌', '홀렙', '비밸브', '맘모톰', '치조골', '원추절제', '체외충격파', '인공관절', '수근관'];
  const hasProcKeyword = procKeywords.some(k => (q || '').includes(k));
  if (hasProcKeyword && procs && procs.val) {
    const qNorm = norm(q || '');
    matchedProc = procs.val.find(p => {
      const sNorm = norm(p.s);
      return procKeywords.some(k => qNorm.includes(k) && sNorm.includes(k));
    });
  }

  const displayTitle = hl(g.n, q);

  let ediBanner = '';
  if (matchedEdi) {
    ediBanner = `
      <div style="background:rgba(49,130,246,0.08);border:1px solid rgba(49,130,246,0.25);border-radius:10px;padding:8px 12px;margin:8px 0;font-size:12px;">
        <span style="font-weight:800;color:var(--brand)">✓ 수술코드 [${esc(matchedEdi.code)}] ${esc(matchedEdi.name)} 매칭</span>
      </div>`;
  }

  let procsHTML = '';
  if (procs && procs.val && procs.val.length > 0) {
    const drawerId = `procs-drawer-${gi}-${Math.random().toString(36).slice(2, 7)}`;
    procsHTML = `
      <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line);">
        <button type="button" class="btn-toggle-procs" onclick="
          const d = document.getElementById('${drawerId}');
          const arr = this.querySelector('.arrow-ico');
          if (d.style.display === 'none' || !d.style.display) {
            d.style.display = 'flex';
            if (arr) arr.textContent = '접기 ▴';
          } else {
            d.style.display = 'none';
            if (arr) arr.textContent = '펼쳐보기 ▾';
          }
        " style="width:100%;height:46px;min-height:46px;max-height:46px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;background:rgba(49,130,246,0.08);border:1.5px solid rgba(49,130,246,0.35);border-radius:10px;padding:0 14px;cursor:pointer;font-size:13px;font-weight:900;color:#1d4ed8;transition:all 0.15s ease;">
          <span>🔍 수술방식별 1~5종 지급 기준</span>
          <span class="arrow-ico" style="font-size:11.5px;font-weight:850;background:rgba(49,130,246,0.16);padding:3px 8px;border-radius:5px;white-space:nowrap;color:#1d4ed8;">펼쳐보기 ▾</span>
        </button>
        <div id="${drawerId}" style="display:none;margin-top:8px;flex-direction:column;gap:6px;">
          ${procs.val.map(p => {
            const isMatch = matchedProc && matchedProc.s === p.s;
            const rawTag = esc(p.t);
            const isNo = rawTag.includes('비해당');
            const cleanTag = isNo ? '비해당' : rawTag;
            const fontSize = cleanTag.length >= 6 ? '11px' : (cleanTag.length >= 4 ? '12px' : '13px');
            const tierClass = isNo ? 't-no' : ('t' + (parseInt(p.t) || 2));
            return `
            <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 12px;background:${isMatch ? 'rgba(49,130,246,0.08)' : 'var(--surface)'};border:1.5px solid ${isMatch ? 'var(--brand)' : 'var(--line)'};border-radius:9px;">
              <div style="display:flex;flex-direction:column;gap:2px;min-width:0;flex:1;">
                <span style="font-size:13px;font-weight:850;color:${isMatch ? 'var(--brand)' : 'var(--text)'};word-break:keep-all;">${isMatch ? '👉 ' : ''}${esc(p.s)}</span>
                ${p.n ? `<span style="font-size:11px;color:var(--text-3);line-height:1.35;">${esc(p.n)}</span>` : ''}
              </div>
              <span class="proc-tag-cell ${tierClass}" style="font-size:${fontSize};${isNo ? 'background:#ef4444;color:#fff;' : ''}">
                ${cleanTag}
              </span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  const diffPillHTML = evalRes.diffBadge
    ? `<span class="judge-diff-pill">⚠️ ${esc(evalRes.diffBadge.replace(/[\[\]]/g, ''))}</span>`
    : '';

  // 1~5종 개정약관/하향 안내 접이식 서랍화 (대장용종 2종→1종 등)
  let revisionSectionHTML = '';
  if (evalRes.boxHTML) {
    let revTitle = '⚠️ 가입시기 및 보험사별 약관 기준';
    if (evalRes.ruleId === 'hyundai_cancer_4tier') {
      revTitle = '⚠️ 2026 현대해상 담보별 상이 약관 기준';
    } else if (evalRes.ruleId === 'colon_polyp') {
      revTitle = '⚠️ 대장용종 2종 ➔ 1종 하향 개정';
    } else if (evalRes.ruleId === 'eswl_tier') {
      revTitle = '⚠️ 체외충격파 2종 ➔ 1종 하향 개정';
    } else if (evalRes.ruleId === 'breast_hyper') {
      revTitle = '⚠️ 여유증·유방비대 1·2종 하향 개정';
    } else if (evalRes.ruleId === 'gallstone') {
      revTitle = '⚠️ 담석증 복강경 2종 하향 개정';
    } else if (evalRes.diffBadge) {
      revTitle = `⚠️ ${evalRes.diffBadge.replace(/[\[\]]/g, '')} 약관 기준`;
    }
    revisionSectionHTML = `
      <div class="quick-rev-wrapper" style="margin:6px 0;">
        <button type="button" class="btn-toggle-quick-rev" style="width:100%;height:46px;min-height:46px;max-height:46px;box-sizing:border-box;background:rgba(245,158,11,0.08);border:1.5px solid rgba(245,158,11,0.35);border-radius:10px;padding:0 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;font-size:13px;font-weight:900;color:#b45309;transition:all .15s ease;">
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1;text-align:left;">${revTitle}</span>
          <span class="qrev-arrow" style="font-size:11.5px;font-weight:850;background:rgba(245,158,11,0.18);padding:3px 8px;border-radius:5px;white-space:nowrap;color:#b45309;flex-shrink:0;margin-left:8px;">펼쳐보기 ▾</span>
        </button>
        <div class="quick-rev-drawer" style="display:none;margin-top:4px;">
          ${evalRes.boxHTML}
        </div>
      </div>`;
  }

  const tier5Badge = matchedProc
    ? formatProcBadge(matchedProc)
    : (evalRes.tier && evalRes.tier !== '부지급' && evalRes.tier !== '0원' ? `⭕ ${esc(evalRes.tier)} 해당` : '❌ 미해당');
  const tier5Color = tier5Badge.includes('비해당') || tier5Badge.includes('미해당') ? '#ef4444' : (tier5Badge.includes('별도확인') ? '#d97706' : '#2563eb');

  let tier3Badge = tier3Info.tier3 && tier3Info.tier3 !== '부지급' && tier3Info.tier3 !== '0원' ? `⭕ ${esc(tier3Info.tier3)} 해당` : '❌ 미해당';
  if (matchedProc) {
    if (matchedProc.s.includes('유로리프트') || matchedProc.s.includes('베나실') || matchedProc.s.includes('클라리베인') || matchedProc.s.includes('하이푸') || matchedProc.s.includes('신경성형')) {
      tier3Badge = '❌ 비해당';
    }
  }
  const tier3Color = tier3Badge.includes('비해당') || tier3Badge.includes('미해당') ? '#ef4444' : (tier3Badge.includes('별도확인') ? '#d97706' : '#2563eb');

  const innerCardHTML = `
      <div class="judge-box" style="background:transparent;border:none;padding:0;margin-top:6px;">
        <!-- 1. 1~5종 수술 (50px 균일 순백색 박스, 칸 테두리 구분, 좌측 검정 텍스트 규격 통일, 우측 포인트 뱃지) -->
        <div class="qvb-row" style="margin:6px 0;">
          <div class="qvb-left-label">
            <span>📋 1~5종 수술</span>
          </div>
          <span class="qvb-badge" style="border:1.5px solid ${tier5Color};color:${tier5Color};">
            ${esc(tier5Badge)}
          </span>
        </div>

        <!-- 2. 1~3종 수술 (50px 균일 순백색 박스, 칸 테두리 구분, 좌측 검정 텍스트 규격 통일, 우측 포인트 뱃지) -->
        <div class="qvb-row" style="margin:6px 0;">
          <div class="qvb-left-label">
            <span>📜 1~3종 수술</span>
          </div>
          <span class="qvb-badge" style="border:1.5px solid ${tier3Color};color:${tier3Color};">
            ${esc(tier3Badge)}
          </span>
        </div>

        ${revisionSectionHTML}
        ${procsHTML}
      </div>

      <!-- 질병수술비 확인 및 N대질병 바로가기 버튼 2종 -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:14px;padding-top:12px;margin-bottom:4px;border-top:1px dashed var(--line);">
        <button type="button" class="btn-toggle-basic-surg">
          <span>💡 질병수술비 가능여부 ▾</span>
        </button>
        <button type="button" class="btn-jump-action btn-jump-ndai" data-q="${esc(g.n)}">
          <span>🏢 N대질병 바로가기</span>
        </button>
      </div>
      <div class="basic-surg-drawer" style="display:none;margin-top:8px;">
        ${renderBasicSurgeryBox(getBasicSurgerySummary(g))}
      </div>
  `;

  if (isSub) {
    return `
    <div class="sub-disease-item card" data-gi="${gi}" style="background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.03);transition:all .15s ease;">
      <div class="btn-toggle-sub-disease" style="padding:11px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;background:var(--surface);user-select:none;">
        <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
          <span class="kcd-badge-big" style="font-size:11px;padding:3px 7px;flex-shrink:0;">${g.c.slice(0, 2).join(', ')}</span>
          <span style="font-size:13.5px;font-weight:900;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${displayTitle}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span class="sub-disease-arrow" style="font-size:11.5px;font-weight:800;color:var(--brand);background:var(--surface-2);padding:3px 8px;border-radius:6px;border:1px solid var(--border);">펼쳐보기 ▾</span>
        </div>
      </div>
      <div class="sub-disease-drawer" style="display:none;padding:12px 14px 14px 14px;border-top:1px dashed var(--line);background:var(--surface);">
        <div class="card-head" style="padding:0;margin-bottom:8px;">
          ${ediBanner}
          ${innerCardHTML}
        </div>
      </div>
    </div>`;
  }

  return `
  <article class="card main-quick-card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <span class="kcd-badge-big">${g.c.slice(0, 3).join(', ')}</span>
        <h3 class="card-name">${displayTitle}</h3>
        <span style="margin-left:auto;font-size:11px;font-weight:850;color:#2563eb;background:rgba(49,130,246,0.1);padding:2px 7px;border-radius:5px;border:1px solid rgba(49,130,246,0.3);">⭐ 대표 질환</span>
      </div>

      ${ediBanner}
      ${innerCardHTML}
    </div>
  </article>`;
}

/* ───────────────────────── 2-2. 7·8종 급여 수술비 정밀검색 (KDRG ADRG 분류) ───────────────────────── */
const KDRG_DISEASE_MAP = [
  // 1. 피부/피하조직 - 지방종, 피지낭종, 표재성 양성종양, 티눈, 사마귀
  {
    keys: ['지방종', '피지낭종', '표재성', '피부종양', '피부혹', '피하종양', '연부조직', '낭종', '사마귀', '티눈', '내향성손발톱', '모반', '점제거', '피부', 'd17', 'l72', 'd22', 'd23', 'l60'],
    disease: '지방종 · 피지낭종 · 피부 및 연부조직 양성종양',
    codes: ['J042', 'J043', 'J041', 'J021', 'J022'],
    desc: '단순 피부·연조직 절제술은 1종으로 판정됩니다. (※ 단순 미용 목적 절제는 면책, 치료 목적 급여 수술 시 보장)'
  },
  // 2. 대장/직장 - 용종, 폴립, 선종
  {
    keys: ['대장용종', '결장용종', '직장용종', '대장폴립', '결장폴립', '직장폴립', '대장선종', '용종', '폴립', 'k63', 'd12', 'k62.1'],
    disease: '대장용종 (결장·직장 폴립/선종)',
    codes: ['G525', 'G524', 'G523', 'G532', 'G151', 'G152', 'G141', 'G142', 'G131', 'G121'],
    desc: '내시경 용종절제(결장경 시술)는 1종, 복강경/개복 대장 수술은 4~6종으로 판정됩니다.'
  },
  // 3. 위 - 용종, 궤양
  {
    keys: ['위용종', '위폴립', '위선종', '위궤양', '위염', 'k25', 'k26', 'k29', 'k31', 'd13.1'],
    disease: '위용종 · 소화성궤양 (위내시경 절제/지혈)',
    codes: ['G503', 'G504', 'G505'],
    desc: '위내시경 절제/지혈 시술은 1종으로 판정됩니다.'
  },
  // 3-B. 위암
  {
    keys: ['위암', '위악성', '위악성종양', 'c16'],
    disease: '위암 (위아전절제술 · 위절제술)',
    codes: ['G081', 'G082', 'G091'],
    desc: '복강경/개복 위아전절제술(G081, G082)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 4. 안과 - 백내장, 수정체
  {
    keys: ['백내장', '수정체', '다초점', '단초점', '인공수정체', 'h25', 'h26'],
    disease: '백내장 (수정체 수술)',
    codes: ['C062', 'C061', 'C063', 'C080'],
    desc: '수정체 소절개(초음파 유화술) 및 후발성 백내장 야그레이저 모두 1종입니다. (※ 비급여 다초점렌즈 비용 자체는 실손/수술비 부지급 유의)'
  },
  // 5. 안과 - 녹내장
  {
    keys: ['녹내장', 'h40'],
    disease: '녹내장',
    codes: ['C093', 'C094', 'C091', 'C092'],
    desc: '단순 및 복잡 녹내장 수술 모두 2종입니다.'
  },
  // 6. 항문 - 치핵, 치루, 치열, 농양
  {
    keys: ['치핵', '치질', '치루', '치열', '항문농양', '항문', 'k60', 'k61', 'k62', 'k64'],
    disease: '치핵 · 치루 · 치열 · 항문질환',
    codes: ['G260', 'G281', 'G282', 'G300', 'G311', 'G312'],
    desc: '치핵 근치수술, 치루 수술, 치열 수술 모두 1종입니다.'
  },
  // 7. 충수 - 맹장염
  {
    keys: ['충수염', '맹장', '맹장염', '충수', 'k35', 'k36', 'k37'],
    disease: '충수염 (맹장염)',
    codes: ['G211', 'G212', 'G213', 'G214'],
    desc: '복강경 및 개복 충수절제술 모두 3종입니다.'
  },
  // 8. 담낭 - 담석증, 담낭염
  {
    keys: ['담석', '담낭염', '담낭', '쓸개', 'k80', 'k81', 'k82'],
    disease: '담석증 · 담낭염 (담낭절제술)',
    codes: ['H101', 'H102', 'H103', 'H104', 'H107', 'H108'],
    desc: '복강경 및 개복 담낭절제술은 4종입니다.'
  },
  // 9. 탈장 - 서혜부, 대퇴, 복부
  {
    keys: ['탈장', '서혜부탈장', '대퇴탈장', '배꼽탈장', '복부탈장', 'k40', 'k41', 'k42', 'k43'],
    disease: '서혜 및 대퇴 탈장',
    codes: ['G241', 'G242', 'G251', 'G252', 'G230'],
    desc: '복강경 및 개복 탈장교정술은 1~2종입니다.'
  },
  // 10. 척추 - 목·허리 디스크, 협착증, 신경성형술
  {
    keys: ['디스크', '추간판', '척추', '목디스크', '허리디스크', '척추관협착', '신경성형술', '풍선확장술', '수핵', 'm50', 'm51', 'm48', 'm47'],
    disease: '추간판탈출증 (목·허리 디스크) · 척추질환',
    codes: ['B173', 'B174', 'B171', 'B172', 'B181', 'B182', 'B161'],
    desc: '추간판제거술은 2종, 척추유합술/고정술은 4~5종, 척추 중재시술은 1종입니다. ⚠️ [비급여 시술 주의] 비급여 경막외 신경성형술(카테터 주사)은 7·8종에서 전액 부지급(면책)됩니다.',
    isNewTech: true
  },
  // 11. 관절 - 인공관절, 퇴행성 관절염, 무릎줄기세포
  {
    keys: ['인공관절', '퇴행성관절염', '무릎관절', '고관절', '무릎', '슬관절', '줄기세포', 'm16', 'm17'],
    disease: '퇴행성 관절염 · 인공관절 치환술',
    codes: ['I041', 'I042', 'I043', 'I044', 'I031', 'I032', 'I033', 'I323', 'I325'],
    desc: '슬관절(무릎) 치환술은 4~5종, 고관절 치환술은 5~6종입니다. ⚠️ [비급여 신의료기술 주의] 비급여 자가골수 줄기세포주사는 7·8종에서 부지급됩니다.',
    isNewTech: true
  },
  // 12. 어깨 - 회전근개 파열, 오십견
  {
    keys: ['어깨', '회전근개', '오십견', '관절경', '유착성관절낭염', '어깨충돌', '석회화건염', 'm75'],
    disease: '어깨 회전근개 파열 · 오십견 (관절경 수술)',
    codes: ['I323', 'I325'],
    desc: '복잡 사지관절수술 및 연골절제술은 1종입니다.'
  },
  // 13. 손 - 손목터널증후군 (수근관 유리술)
  {
    keys: ['손목터널', '수근관', '손목터널증후군', '수근관증후군', '손저림', 'g56'],
    disease: '손목터널증후군 (수근관 유리술)',
    codes: ['B181', 'B182'],
    desc: '말초신경 유리술·감압술은 1종입니다.'
  },
  // 14. 부인과 - 자궁근종, 자궁선근증, 하이푸
  {
    keys: ['자궁근종', '자궁선근증', '자궁혹', '자궁폴립', '하이푸', 'hifu', '자궁평활근종', '자궁적출', '자궁선종', 'd25', 'n80', 'n85'],
    disease: '자궁근종 · 자궁선근증 (하이푸 / 복강경 수술)',
    codes: ['N130', 'N031', 'N032', 'N021', 'N022'],
    desc: '자궁경 수술(N130)은 1종, 단순 자궁근종절제술(N031) 및 주요 자궁절제술(N021)은 2종입니다. ⚠️ [비급여 신의료기술 주의] 비급여 하이푸(HIFU) 시술은 7·8종(급여 수술비)에서 전액 부지급(면책)됩니다. 복강경/개복 등 건강보험 급여 수술 시 2종 지급됩니다.',
    isNewTech: true
  },
  // 15. 부인과 - 난소낭종
  {
    keys: ['난소낭종', '난소혹', '난소종양', '난소물혹', '난소양성', 'd27', 'n83'],
    disease: '난소낭종 (난소 양성종양)',
    codes: ['N051', 'N052', 'N061', 'N062'],
    desc: '복강경 및 개복 난소 수술은 2종입니다.'
  },
  // 15-B. 난소암
  {
    keys: ['난소암', '난관암', '난소악성', 'c56', 'c57'],
    disease: '난소암 · 난관암 (악성 난소 및 부속기 수술)',
    codes: ['N041', 'N042'],
    desc: '악성 난소 및 부속기 수술(N041, N042)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 16. 부인과 - 자궁암, 자궁경부암, 자궁내막암
  {
    keys: ['자궁암', '자궁경부암', '자궁내막암', '자궁체부암', '자궁악성', 'c53', 'c54', 'c55'],
    disease: '자궁암 · 자궁경부암 · 자궁내막암 (악성 근치 자궁수술)',
    codes: ['N011', 'N012', 'N071', 'N072'],
    desc: '악성 자궁절제술(N011, N012)은 6종(7종특약) / 7종(8종특약), 악성 자궁경부 수술(N071, N072)은 5종(7종특약) / 6종(8종특약)입니다.'
  },
  {
    keys: ['원추절제', '원추절제술', 'leep', '자궁경부이형성', 'd06'],
    disease: '자궁경부 원추절제술 (LEEP) · 자궁경부 이형성증',
    codes: ['N081', 'N082', 'N071', 'N072'],
    desc: '자궁경부 시술(원추절제술)은 1종, 악성 자궁절제술은 5~6종입니다.'
  },
  // 17. 유방암
  {
    keys: ['유방암', '유방악성', '유방암수술', 'c50'],
    disease: '유방암 (근치 유방절제술 · 악성 유방수술)',
    codes: ['J061', 'J062', 'J081'],
    desc: '근치 유방절제술(J061)은 6종(7종특약) / 7종(8종특약), 악성 유방절제술(J062)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 17-B. 유방 양성종양 (맘모톰)
  {
    keys: ['맘모톰', '섬유선종', '유방결절', '유방혹', '유방선종', '유선종', '유방양성', '유방생검', 'd24', 'n60', 'n63'],
    disease: '유방 양성종양 (맘모톰) · 단순 절제술',
    codes: ['J071', 'J072', 'J063'],
    desc: '진공흡입보조 단순 유방수술(J071) 및 절개 단순수술(J072)은 1종, 양성 유방절제술(J063)은 2종입니다. ⚠️ [비급여 신의료기술 주의] 일반 병원에서 비급여로 시행하는 맘모톰은 7·8종(급여 수술비)에서 전액 부지급(면책)됩니다. 건강보험 [급여] 적용 시에만 1종 지급됩니다. (※ 1~5종 종수술비는 비급여 맘모톰도 2종 정상 지급)',
    isNewTech: true
  },
  // 18. 전립선암
  {
    keys: ['전립선암', '전립선악성', 'c61'],
    disease: '전립선암 (주요 전립선 적출술 · 악성 수술)',
    codes: ['M021', 'M101'],
    desc: '주요 전립선 적출술(M021)은 4종(7종특약) / 4종(8종특약)입니다. (※ 단순 비대증 TURP는 2종)'
  },
  // 18-B. 전립선비대증
  {
    keys: ['전립선비대증', '전립선비대', '유로리프트', '전립선결찰', 'urolift', 'turp', '홀렙', 'holep', '워터젯', '레줌', 'n40'],
    disease: '전립선비대증 (유로리프트 / TURP 경요도절제술)',
    codes: ['M041', 'M042', 'M043'],
    desc: '경요도 전립선절제술(TURP, 홀렙)은 2종입니다. ⚠️ [비급여 신의료기술 주의] 비급여 유로리프트(전립선결찰술)는 7·8종에서 전액 부지급(면책)됩니다. 급여 수술 시 2종 지급됩니다.',
    isNewTech: true
  },
  // 19. 비뇨기 - 요로결석
  {
    keys: ['요로결석', '신장결석', '쇄석술', 'eswl', '결석', '체외충격파', 'n20', 'n21', 'n22', 'n23'],
    disease: '요로결석 (신장·요관 결석)',
    codes: ['L081', 'L082', 'L051', 'L052'],
    desc: '체외충격파쇄석술(ESWL)은 1종, 요관경하 결석제거는 2종입니다.'
  },
  // 20. 혈관 - 하지정맥류, 베나실, 클라리베인
  {
    keys: ['하지정맥류', '정맥류', '베나실', '클라리베인', '고주파정맥', '스트리핑', '발거술', 'venaseal', 'clarivein', 'i83'],
    disease: '하지정맥류 (베나실 · 클라리베인 / 외과적 절제술)',
    codes: ['F252', 'F253', 'F254'],
    desc: '정맥류 국소 절제 및 결찰·스트리핑 수술은 1종입니다. ⚠️ [비급여 신의료기술 주의] 비급여 베나실·클라리베인 시술은 7·8종(급여 수술비)에서 전액 부지급(면책)됩니다. 외과적 절제 등 건강보험 급여 수술 시 1종 지급됩니다.',
    isNewTech: true
  },
  // 21. 이비인후과 - 편도
  {
    keys: ['편도', '편도염', '아데노이드', '편도적출', 'j35'],
    disease: '편도 및 아데노이드 비대·염증',
    codes: ['D111', 'D112'],
    desc: '편도 및 아데노이드 수술은 1종입니다.'
  },
  // 22. 이비인후과 - 축농증, 비염, 비밸브
  {
    keys: ['축농증', '부비동염', '비염', '비중격', '비중격만곡증', '비밸브', '하비갑개', 'j32', 'j34'],
    disease: '만성 부비동염 (축농증) · 비염 · 비밸브',
    codes: ['D101', 'D102', 'D081', 'D082'],
    desc: '내시경 부비동 수술 및 주요 코 수술(비중격교정술 등)은 1종입니다. ⚠️ [비급여 신의료기술 주의] 비급여 비밸브재건술은 7·8종에서 전액 부지급(면책)됩니다. 급여 수술 시 1종 지급됩니다.',
    isNewTech: true
  },
  // 23. 출산 - 제왕절개
  {
    keys: ['제왕절개', '출산', '분만', 'o82', 'o80'],
    disease: '제왕절개 분만',
    codes: ['O011', 'O012'],
    desc: '제왕절개분만은 단태아·다태아 모두 2종입니다.'
  },
  // 24. 갑상선암
  {
    keys: ['갑상선암', '갑상선악성', 'c73'],
    disease: '갑상선암 (주요 갑상선 악성 종양 수술)',
    codes: ['K063', 'K064'],
    desc: '주요 갑상선 악성 종양 수술(K063, K064)은 4종(7종특약) / 4종(8종특약)입니다.'
  },
  // 24-B. 갑상선 결절 (양성질환)
  {
    keys: ['갑상선결절', '갑상선혹', '갑상선선종', 'e04', 'd34'],
    disease: '갑상선 결절 (양성질환)',
    codes: ['K075', 'K076', 'K051'],
    desc: '주요 갑상선 악성 종양 제외 수술은 2종, 내시경 부갑상선 수술은 2종입니다.'
  },
  // 25. 외상 - 골절, 핀제거
  {
    keys: ['골절', '핀제거', '금속핀', '체내고정', '금속판', 's02', 's42', 's52', 's62', 's72', 's82', 's92'],
    disease: '골절 · 금속고정물 제거술 (핀제거)',
    codes: ['I220', 'I131', 'I132', 'I141', 'I142'],
    desc: '체내고정장치 제거술(핀제거)은 1종, 골절 관혈정복술은 3종입니다.'
  },
  // 26. 심혈관 - 협심증, 심근경색, 스텐트
  {
    keys: ['협심증', '심근경색', '스텐트', '관상동맥', 'i20', 'i21', 'i25'],
    disease: '협심증 · 급성 심근경색증 (스텐트 시술)',
    codes: ['F111', 'F112', 'F121', 'F122', 'F133', 'F134', 'F041'],
    desc: '일반 경피적 관상동맥 스텐트 시술은 4종, 관상동맥 우회술(CABG)은 7종(7종특약) / 8종(8종특약)입니다.'
  },
  // 27. 뇌혈관 - 뇌동맥류, 뇌출혈
  {
    keys: ['뇌동맥류', '뇌출혈', '코일색전', '클립결찰', 'i60', 'i61', 'i67'],
    disease: '뇌동맥류 · 뇌혈관질환',
    codes: ['B023', 'B024', 'B031', 'B032'],
    desc: '뇌혈관 기형/동정맥루 색전술 및 뇌동맥류 결찰술은 5~6종입니다.'
  },
  // 28. 뇌종양
  {
    keys: ['뇌종양', '뇌암', '수막종', '뇌하수체', 'd33', 'c71', 'd32', 'd35'],
    disease: '뇌종양 (천막상부 종양절제술)',
    codes: ['B061', 'B062'],
    desc: '천막상부 종양절제술(B061, B062)은 7종(7종특약) / 8종(8종특약)입니다.'
  },
  // 29. 간암
  {
    keys: ['간암', '간절제', 'c22'],
    disease: '간암 (간 절제술)',
    codes: ['H041', 'H156', 'H157'],
    desc: '주요 간절제술(H041)은 6종(7종특약) / 7종(8종특약), 경피적 악성혈관시술(H156, H157)은 5~6종입니다.'
  },
  // 30. 대장암 / 결장암 / 직장암
  {
    keys: ['대장암', '결장암', '직장암', '결장악성', '직장악성', '대장악성', 'c18', 'c19', 'c20'],
    disease: '대장암 · 결장암 · 직장암 (결장·직장 악성 절제술)',
    codes: ['G121', 'G131', 'G141', 'G041', 'G151'],
    desc: '결장 및 직장 전 절제술(G121), 결장절제술(G131)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 30-B. 폐암
  {
    keys: ['폐암', '폐악성', '폐종양', 'c34'],
    disease: '폐암 (주요 폐 악성종양 수술)',
    codes: ['E012'],
    desc: '주요 폐 수술(악성종양의 경우, E012)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 30-C. 신장암 / 방광암
  {
    keys: ['신장암', '방광암', '신우암', '요관암', 'c64', 'c67'],
    disease: '신장암 · 방광암 (신장 및 비뇨기계 악성종양 수술)',
    codes: ['L021', 'L031'],
    desc: '주요 신장·신우 신생물 수술(L021)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 30-D. 췌장암
  {
    keys: ['췌장암', '췌장악성', 'c25'],
    disease: '췌장암 (췌장절제술)',
    codes: ['H111'],
    desc: '복강경 췌장절제술(H111)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 30-E. 식도암
  {
    keys: ['식도암', '식도악성', 'c15'],
    disease: '식도암 (식도 악성종양 근치 수술)',
    codes: ['G011'],
    desc: '식도 악성종양 근치 수술 및 재건술(G011)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 30-F. 뼈암 / 골육종
  {
    keys: ['뼈암', '골육종', '골악성종양', 'c40', 'c41'],
    disease: '뼈암 · 골악성종양 광범위 절제술',
    codes: ['I121', 'I122', 'I123'],
    desc: '골악성종양 광범위 절제술(I121, I122)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 30-G. 후두암 / 인두암 / 구강암
  {
    keys: ['후두암', '인두암', '구강암', '설암', 'c00', 'c14', 'c32'],
    disease: '후두암 · 인두암 · 구강암 (악성종양 수술)',
    codes: ['D101', 'D102', 'D090', 'D041', 'D042'],
    desc: '주요 후두 및 인두 악성종양 수술(D101)은 6종(7종특약) / 7종(8종특약)입니다.'
  },
  // 30-H. 주요 암 (악성신생물) 전반
  {
    keys: ['암', '악성신생물', '악성종양', '카르시노마', '육종'],
    disease: '주요 암 (악성신생물) 근치 수술',
    codes: ['G081', 'G121', 'G131', 'J061', 'H041', 'M021', 'N011', 'N041', 'H111', 'E012', 'K063'],
    desc: '주요 장기 악성종양 근치 절제술은 5~7종으로 판정됩니다.'
  },
  // 31. 장기이식
  {
    keys: ['간이식', '신장이식', '장기이식', '이식'],
    disease: '장기 이식 (간·신장 이식)',
    codes: ['A010', 'L010'],
    desc: '간 이식은 7종/8종(최고 등급), 신장 이식은 6종/7종입니다.'
  },
  // 32. 치과 - 치조골이식술, 임플란트
  {
    keys: ['치조골', '치조골이식', '임플란트', '골이식', '뼈이식', '임플란트뼈이식', 'k08'],
    disease: '치조골이식술 · 치과 임플란트',
    codes: ['D191'],
    desc: '⚠️ 치과의원에서 비급여로 시행하는 단순 임플란트 및 치조골이식술은 7·8종(급여 수술비)에서 전액 부지급(면책)됩니다. (KDRG D191 치조골 수술은 약관상 면책 대상)',
    isNewTech: true
  }
];
function bindTier78Tab() {
  const qEl = $('#q-tier78');
  const clearBtn = $('#clearBtn-tier78');
  if (!qEl) return;

  qEl.addEventListener('input', debounce((e) => {
    const q = e.target.value.trim();
    if (clearBtn) clearBtn.hidden = !q;
    runTier78Search(q);
  }, 70));

  clearBtn?.addEventListener('click', () => {
    qEl.value = '';
    clearBtn.hidden = true;
    renderTier78EmptyExample();
    qEl.focus();
  });

  renderTier78EmptyExample();
}

function runTier78Search(rawQ) {
  const q = (rawQ || '').trim();
  const resEl = $('#results-tier78');
  if (!resEl) return;
  const clearBtn = $('#clearBtn-tier78');
  if (clearBtn) clearBtn.hidden = !q;

  if (!q) {
    renderTier78EmptyExample();
    return;
  }

  const rows = idx.kdrg78 || [];
  const qNorm = norm(q);
  const qUpper = q.toUpperCase();
  const qLower = q.toLowerCase();

  // 1. 질병명 / KCD 코드 매핑 검사
  const isCancerQuery = /(암|악성|신생물|카르시노마|육종|림프종|백혈병)/.test(qNorm) || /^C\d/i.test(qUpper);

  let matchedEntries = KDRG_DISEASE_MAP.filter(entry => {
    return entry.keys.some(k => qLower.includes(k) || qNorm.includes(norm(k)));
  });

  // 질병 매핑 시: 암 검색어인 경우, '암/악성'이 아닌 일반 양성질환 엔트리는 암 엔트리보다 뒤로 가도록 정렬!
  if (isCancerQuery) {
    matchedEntries.sort((a, b) => {
      const aIsCancer = a.keys.some(k => k.includes('암') || k.includes('악성') || /^c\d/i.test(k));
      const bIsCancer = b.keys.some(k => k.includes('암') || k.includes('악성') || /^c\d/i.test(k));
      if (aIsCancer && !bIsCancer) return -1;
      if (!aIsCancer && bIsCancer) return 1;
      return 0;
    });
  }

  const rowMap = new Map();
  rows.forEach(r => { if (r && r.c) rowMap.set(r.c, r); });

  let matchedRows = [];
  const addedCodes = new Set();

  // 질병 매핑된 수술코드 우선 추가
  matchedEntries.forEach(entry => {
    entry.codes.forEach(code => {
      const r = rowMap.get(code);
      if (r && !addedCodes.has(r.c)) {
        matchedRows.push({ ...r, _mappedDisease: entry.disease });
        addedCodes.add(r.c);
      }
    });
  });

  // 2. 직접 텍스트 / 코드 매칭 추가
  rows.forEach(r => {
    if (addedCodes.has(r.c)) return;
    const isCodeMatch = r.c && r.c.toUpperCase().includes(qUpper);
    const isNameMatch = r.n && (r.n.includes(q) || norm(r.n).includes(qNorm));
    const isGroupMatch = r.g && (r.g.includes(q) || norm(r.g).includes(qNorm));
    if (isCodeMatch || isNameMatch || isGroupMatch) {
      matchedRows.push(r);
      addedCodes.add(r.c);
    }
  });

  // 암/악성종양 검색 시 악성 근치수술을 1순위 대표 수술로 강제 정렬!
  function getCancerPriorityScore(row) {
    const name = ((row.n || '') + ' ' + (row.g || '')).toLowerCase();
    // 1. 악성종양 제외 문구가 명시된 경우 최하위로 감점 (-1000)
    if (name.includes('악성종양 제외') || name.includes('악성종양제외') || name.includes('악성 종양 제외')) {
      return -1000;
    }
    // 2. 명시적 악성/근치 수술 코드 최고 가중치 (+1000)
    const topMalignantCodes = [
      'N011', 'N012', 'N071', 'N072', 'N041', 'N042',
      'J061', 'J062', 'J081',
      'M021', 'M101',
      'G081', 'G082', 'G091', 'G121', 'G131', 'G141', 'G041', 'G011',
      'H041', 'H156', 'H157', 'H111',
      'E012',
      'K063', 'K064',
      'L021',
      'B061', 'B062',
      'I121', 'I122', 'I123',
      'D101', 'D102', 'D090', 'D041', 'D042'
    ];
    if (topMalignantCodes.includes(row.c)) return 1000;
    if (name.includes('악성종양의 경우') || name.includes('악성종양의경우') || name.includes('악성 종양의 경우')) return 800;
    if (name.includes('근치')) return 600;
    if (name.includes('악성')) return 500;
    return 0;
  }

  if (isCancerQuery) {
    matchedRows.sort((a, b) => {
      const scoreA = getCancerPriorityScore(a);
      const scoreB = getCancerPriorityScore(b);
      return scoreB - scoreA;
    });
  }

  if (matchedRows.length === 0) {
    resEl.innerHTML = `
      <div class="empty-box" style="text-align:center;padding:32px 16px;">
        <span style="font-size:32px;display:block;margin-bottom:8px;">🔍</span>
        <h3 style="font-size:16px;font-weight:900;color:var(--text);margin-bottom:4px;">“${esc(q)}”에 대한 7·8종 검색 결과가 없습니다</h3>
        <p style="font-size:12.5px;color:var(--text-3);margin:0;">질병명(대장용종, 백내장, 디스크), 질병코드(K63.5, H25, M51) 또는 KDRG 코드(A010, B173)로 검색해 보세요.</p>
      </div>`;
    return;
  }

  const guideBannerHTML = `
    <div style="font-size:12px;color:#ea580c;background:rgba(234,88,12,0.06);border:1.5px solid rgba(234,88,12,0.25);border-radius:10px;padding:9px 14px;margin-bottom:12px;font-weight:800;text-align:center;">
      💡 7·8종(급여 수술비)은 국민건강보험 <strong>[급여]</strong> 적용 수술만 보장되며, 전액 비급여 시술은 제외됩니다.
    </div>`;

  let groupsHTML = '';
  if (matchedRows.length > 0) {
    // 1순위 대표 수술 1건: 메인 카드로 단정하게 노출!
    const mainRow = matchedRows[0];
    groupsHTML += cardTier78HTML(mainRow, q, false);

    // 2순위 이후 연관 수술들: 질환/수술별 가로 배너 아코디언으로 접어두기!
    if (matchedRows.length > 1) {
      const subItems = matchedRows.slice(1);
      groupsHTML += `
        <div style="margin:16px 0 8px 4px;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
            📂 연관 7·8종 수술 분류 <span style="color:#ea580c;font-weight:900;">(${subItems.length}건)</span>
          </span>
          <span style="font-size:11px;color:var(--text-3);font-weight:700;">터치 시 상세 펼침 ▾</span>
        </div>
        <div class="sub-tier78-list" style="display:flex;flex-direction:column;gap:8px;">
          ${subItems.map(item => cardTier78HTML(item, q, true)).join('')}
        </div>
      `;
    }
  }

  resEl.innerHTML = `
    ${guideBannerHTML}
    <div style="font-size:12px;font-weight:800;color:#ea580c;margin:8px 0 12px;display:flex;align-items:center;justify-content:space-between;">
      <span>“${esc(q)}” 7·8종 수술 분류</span>
      <span style="background:rgba(234,88,12,0.12);color:#ea580c;padding:2px 8px;border-radius:6px;font-size:11px;">총 ${matchedRows.length}건</span>
    </div>
    ${groupsHTML}`;

  // 7·8종 연관 수술 서랍 토글 바인딩
  resEl.querySelectorAll('.btn-toggle-sub-tier78').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const item = btn.closest('.sub-tier78-item');
      if (!item) return;
      const drawer = item.querySelector('.sub-tier78-drawer');
      const arrow = item.querySelector('.sub-arrow');
      if (!drawer) return;
      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      drawer.style.display = isHidden ? 'block' : 'none';
      if (arrow) arrow.textContent = isHidden ? '접기 ▴' : '펼쳐보기 ▾';
    });
  });
}

function cardTier78HTML(item, q, isSub = false) {
  const t7Val = item.t7 ? String(item.t7) : '';
  const t8Val = item.t8 ? String(item.t8) : '';
  const isSame = (t7Val && t8Val && t7Val === t8Val && t7Val !== '0');

  let verdictBoxHTML = '';
  if (isSame) {
    // 7종과 8종이 동일한 경우: 52px 단일행 깔끔한 쌍둥이 박스로 정렬
    verdictBoxHTML = `
      <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:11px;padding:0 14px;height:52px;min-height:52px;max-height:52px;box-sizing:border-box;margin:6px 0;display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">
          <span style="font-size:13.5px;font-weight:900;color:#ea580c;white-space:nowrap;">1~7종 · 1~8종 (급여수술)</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span style="min-width:76px;height:34px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#ea580c;background:rgba(234,88,12,0.06);border:1.5px solid #ea580c;border-radius:8px;white-space:nowrap;box-sizing:border-box;">
            ${item.t7}종
          </span>
        </div>
      </div>`;
  } else {
    // 7종과 8종이 다른 경우: 52px 균일 박스 2개로 정렬
    verdictBoxHTML = `
      <div style="display:flex;flex-direction:column;gap:6px;margin:6px 0;">
        <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:11px;padding:0 14px;height:52px;min-height:52px;max-height:52px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <span style="font-size:13.5px;font-weight:900;color:#ea580c;white-space:nowrap;">1~7종 급여수술 (현대·메리츠)</span>
          <span style="min-width:76px;height:34px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#ea580c;background:rgba(234,88,12,0.06);border:1.5px solid #ea580c;border-radius:8px;white-space:nowrap;box-sizing:border-box;">${item.t7 && item.t7 !== '0' ? item.t7 + '종' : '비해당'}</span>
        </div>
        <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:11px;padding:0 14px;height:52px;min-height:52px;max-height:52px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <span style="font-size:13.5px;font-weight:900;color:#c2410c;white-space:nowrap;">1~8종 급여수술 (삼성화재)</span>
          <span style="min-width:76px;height:34px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#c2410c;background:rgba(194,65,12,0.06);border:1.5px solid #c2410c;border-radius:8px;white-space:nowrap;box-sizing:border-box;">${item.t8 && item.t8 !== '0' ? item.t8 + '종' : '비해당'}</span>
        </div>
      </div>`;
  }

  if (isSub) {
    return `
      <div class="sub-tier78-item" style="border:1px solid var(--border);border-radius:10px;background:var(--surface);overflow:hidden;">
        <div class="btn-toggle-sub-tier78" style="padding:11px 14px;min-height:46px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:var(--surface);user-select:none;transition:background .15s ease;">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
            <span style="font-size:11.5px;font-weight:900;color:#ea580c;background:rgba(234,88,12,0.1);padding:2px 6px;border-radius:4px;flex-shrink:0;">${esc(item.c)}</span>
            <span style="font-size:13px;font-weight:850;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${hl(item.n, q)}</span>
          </div>
          <span class="sub-arrow" style="font-size:11px;font-weight:800;color:var(--brand);background:var(--surface-2);padding:3px 8px;border-radius:6px;border:1px solid var(--border);flex-shrink:0;">펼쳐보기 ▾</span>
        </div>
        <div class="sub-tier78-drawer" style="display:none;padding:10px 14px;background:var(--surface-2);border-top:1px dashed var(--line);">
          ${verdictBoxHTML}
        </div>
      </div>`;
  }

  return `
  <article class="card" style="border:1.5px solid var(--border);border-radius:14px;padding:14px 16px;background:var(--surface);box-shadow:var(--shadow-1);">
    <div class="card-head">
      <div class="card-top" style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span class="kcd-badge-big" style="background:rgba(234,88,12,0.1);color:#ea580c;border:1.5px solid rgba(234,88,12,0.3);font-size:12.5px;font-weight:900;padding:2px 8px;border-radius:6px;">${esc(item.c)}</span>
        <h3 class="card-name" style="font-size:15px;font-weight:900;color:var(--text);margin:0;flex:1;word-break:keep-all;">${hl(item.n, q)}</h3>
        ${item.g ? `<span style="font-size:11px;color:var(--text-3);font-weight:800;background:var(--surface-2);padding:2px 7px;border-radius:5px;border:1px solid var(--border);white-space:nowrap;">${esc(item.g)}</span>` : ''}
      </div>
      ${verdictBoxHTML}
    </div>
  </article>`;
}

function renderTier78EmptyExample() {
  const resEl = $('#results-tier78');
  if (!resEl) return;
  resEl.innerHTML = `
    <div class="empty-example-card" style="background:rgba(234,88,12,0.05);border:1.5px solid rgba(234,88,12,0.25);border-radius:14px;padding:16px 18px;margin-top:8px;">
      <div style="font-size:12.5px;font-weight:850;color:#ea580c;margin-bottom:4px;">💡 7·8종 수술비 검색 예시</div>
      <div style="font-size:12px;color:var(--text-2);line-height:1.45;">
        KDRG 수술코드(A010, B173 등)나 수술명(추간판, 간이식, 충수, 백내장)을 입력하면 <strong>현대·메리츠 1~7종</strong>과 <strong>삼성화재 1~8종</strong>의 지급 등급을 한눈에 대조합니다.
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">
        <span style="font-size:11px;font-weight:800;color:var(--text-3);line-height:24px;">추천 검색:</span>
        <button type="button" class="f-chip" data-q78="대장용종" style="font-size:11.5px;padding:3px 9px;">대장용종 (K63.5)</button>
        <button type="button" class="f-chip" data-q78="지방종" style="font-size:11.5px;padding:3px 9px;">지방종 (D17)</button>
        <button type="button" class="f-chip" data-q78="맘모톰" style="font-size:11.5px;padding:3px 9px;">맘모톰 (D24)</button>
        <button type="button" class="f-chip" data-q78="백내장" style="font-size:11.5px;padding:3px 9px;">백내장 (H25)</button>
        <button type="button" class="f-chip" data-q78="디스크" style="font-size:11.5px;padding:3px 9px;">디스크 (M51)</button>
        <button type="button" class="f-chip" data-q78="치핵" style="font-size:11.5px;padding:3px 9px;">치핵 (K64)</button>
        <button type="button" class="f-chip" data-q78="자궁근종" style="font-size:11.5px;padding:3px 9px;">자궁근종 (D25)</button>
        <button type="button" class="f-chip" data-q78="하지정맥류" style="font-size:11.5px;padding:3px 9px;">하지정맥류 (I83)</button>
        <button type="button" class="f-chip" data-q78="B173" style="font-size:11.5px;padding:3px 9px;">B173 (추간판제거)</button>
        <button type="button" class="f-chip" data-q78="J042" style="font-size:11.5px;padding:3px 9px;">J042 (피부연조직)</button>
      </div>
    </div>`;

  $$('#results-tier78 [data-q78]').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q78;
      const qEl = $('#q-tier78');
      if (qEl) {
        qEl.value = q;
        runTier78Search(q);
      }
    });
  });
}

/* ───────────────────────── 3. N대질병수술비 정밀검색 (판정 & 약관 트리) ───────────────────────── */
function updateNdaiBadges() {
  const dBadge = $('#ndaiDateBadge');
  const cBadge = $('#ndaiCoBadge');
  const tBadge = $('#ndaiTierBadge');
  const treeBadge = $('#ndaiTreeBadge');

  if (dBadge) {
    if (state.ndaiYear) {
      dBadge.textContent = `: ${state.ndaiYear}년`;
    } else {
      dBadge.textContent = ': 전체';
    }
  }

  if (cBadge) {
    if (state.ndaiCos && state.ndaiCos.length > 0) {
      cBadge.textContent = `: ${state.ndaiCos.join(' · ')}`;
    } else if (state.ndaiCo) {
      cBadge.textContent = `: ${state.ndaiCo}`;
    } else {
      cBadge.textContent = ': 전체';
    }
  }

  if (tBadge) {
    tBadge.textContent = state.ndaiTier ? state.ndaiTier : '전체 N대';
  }

  if (treeBadge) {
    const cos = state.ndaiCos && state.ndaiCos.length ? state.ndaiCos : (state.ndaiCo ? [state.ndaiCo] : []);
    treeBadge.textContent = cos.length ? `[${cos.join(', ')}]` : '[전체 보험사]';
  }
}

function renderNdaiYearGrid() {
  const grid = $('#ndaiYearGrid');
  if (!grid) return;

  grid.innerHTML = `
    <button class="f-chip ny-chip ${state.ndaiYear === null ? 'on' : ''}" data-ny="" style="padding:6px 0;font-size:11px;font-weight:800;grid-column:span 4;">전체</button>
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
  if (box) box.innerHTML = '';
}
window.renderNdaiEmptyExample = renderNdaiEmptyExample;

function bindNdaiTab() {
  const qNdaiEl = $('#q-ndai');

  // 접이식 아코디언 바 토글 (판매시기 & 가입회사 & 직접찾기 트리)
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

  function resetNdaiFilters() {
    state.ndaiCos = [];
    state.ndaiCo = '';
    state.ndaiYear = null;
    state.ndaiGen = 'recent';
    state.ndaiTier = '';
    state.ndaiCoTouched = false;
    state.ndaiDateTouched = false;
    $$('#ndaiCoSonbo .f-chip, #ndaiCoSaengbo .f-chip').forEach(b => {
      b.classList.toggle('on', !b.dataset.nco);
    });
    $$('#ndaiYearGrid .ny-chip').forEach(b => b.classList.toggle('on', !b.dataset.ny));
    $$('#ndaiTierChips .f-chip').forEach(b => b.classList.toggle('on', !b.dataset.ntier));
    if (ndaiDateBody) ndaiDateBody.style.display = 'none';
    if (ndaiDateToggleIcon) ndaiDateToggleIcon.textContent = '펼치기 ∨';
    if (ndaiCoBody) ndaiCoBody.style.display = 'none';
    if (ndaiCoToggleIcon) ndaiCoToggleIcon.textContent = '펼치기 ∨';
    updateNdaiBadges();
    renderDynamicNdaiTierChips();
    const treeBody = $('#ndaiTreeBody');
    if (treeBody && treeBody.style.display !== 'none' && typeof renderNdaiTree === 'function') renderNdaiTree();
  }
  window.resetNdaiFilters = resetNdaiFilters;

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
    if (!v.trim()) {
      resetNdaiFilters();
      renderNdaiEmptyExample();
      return;
    }

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
    } else {
      state.ndaiTier = '';
      $$('#ndaiTierChips .f-chip').forEach(b => b.classList.toggle('on', !b.dataset.ntier));
    }

    updateNdaiBadges();
    runNdaiSearch(parsed.cleanQ || v, parsed.family);
  }, 70));

  $('#clearBtn-ndai').addEventListener('click', () => {
    qNdaiEl.value = ''; state.ndaiQ = ''; $('#clearBtn-ndai').hidden = true;
    resetNdaiFilters();
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
  const normQ = norm(q);
  const compPair = findComparisonPair(normQ);
  const exclProc = findExcludedProcedure(normQ);

  const res = search(q) || { groups: [], edi: [] };

  if (exclProc && exclProc.relatedCodes && (!res.groups || res.groups.length === 0)) {
    exclProc.relatedCodes.forEach(code => {
      (state.D.codeIndex[code] || []).forEach(gi => {
        if (!res.groups.includes(gi)) res.groups.push(gi);
      });
    });
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

  const compHTML = compPair ? renderComparisonPairHTML(compPair) : '';
  const exclHTML = exclProc ? renderExcludedProcedureHTML(exclProc) : '';

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> N대 수술비 판정 <span style="font-size:11.5px;color:#8b5cf6;font-weight:800;">[${esc(cLabel)}${esc(tLabel)}]</span></div>
      <div class="res-count">${res.groups.length ? `분류 ${res.groups.length}건` : ""}</div>
    </div>
    ${familyBarHTML}`;

  if (!res.groups.length && !compPair && !exclProc) {
    box.innerHTML = head + renderAiSuggestEmptyHTML(q, 'ndai');
    bindAiSuggestChips(box);
    return;
  }

  let html = head + compHTML + exclHTML;
  if (res.groups.length > 0) {
    if (exclProc && exclProc.relatedCodes && exclProc.relatedCodes.length > 0) {
      html += `<div style="font-size:12.5px;font-weight:900;color:var(--text);margin:14px 0 8px 4px;">💡 연관 질환 정식 N대 질병수술비 보장 내역 (${esc(exclProc.relatedDisease)})</div>`;
    }
    // 1순위 대표 질환 1건: 메인 카드로 당당하게 노출!
    const mainGi = res.groups[0];
    html += cardNdaiHTML(mainGi, q, false);

    // 2순위 이후 연관 질환: 깔끔한 가로 배너 바로 접어두기!
    if (res.groups.length > 1) {
      const subItems = res.groups.slice(1, 15);
      html += `
        <div style="margin:20px 0 10px 4px;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
            📂 연관 질환 및 다른 질병코드 <span style="color:var(--brand);font-weight:900;">(${subItems.length}건)</span>
          </span>
          <span style="font-size:11px;color:var(--text-3);font-weight:700;">터치 시 상세 판정 펼쳐짐 ▾</span>
        </div>
        <div class="sub-diseases-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;">
          ${subItems.map(i => cardNdaiHTML(i, q, true)).join('')}
        </div>
      `;
    }
  }
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

/* ───────────────────────── N대 담보 포맷터 (특약별 질병코드 연동형) ───────────────────────── */
function formatNdaItemsForCo(g, co, nTier) {
  const riders = state.D.riders;
  const groups = new Map(); // subClean -> { tiersSet: Set, ri, si, co, subClean }

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

    if (!groups.has(subClean)) {
      groups.set(subClean, { tiersSet: new Set(), ri, si, co: r.co, subClean });
    }
    if (mainTier) groups.get(subClean).tiersSet.add(mainTier);
  }

  const items = [];
  for (const [subClean, info] of groups.entries()) {
    const tiers = Array.from(info.tiersSet).sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));
    const tierText = tiers.length > 0 ? `${tiers.join(' · ')} 질병 중` : 'N대 질병 중';
    items.push({
      tierText,
      subClean,
      ri: info.ri,
      si: info.si,
      co: info.co
    });
  }
  return items;
}

function formatNdaLinesForCo(g, co, nTier) {
  const items = formatNdaItemsForCo(g, co, nTier);
  return items.map(it => `${it.tierText} [${it.subClean}] 해당`);
}

function renderNdaiDetailsHTML(g, cosList, nTier) {
  if (!g) return '';
  const { cos } = matchInfo(g);
  const cosArr = (cosList && cosList.length > 0)
    ? cosList
    : (state.ndaiCos && state.ndaiCos.length ? state.ndaiCos : (state.ndaiCo ? [state.ndaiCo] : []));
  const tier = nTier || state.ndaiTier || null;

  if (cosArr.length > 0) {
    const tierBadge = tier ? ` ${tier}` : '';
    const blocks = cosArr.map(c => {
      const items = formatNdaItemsForCo(g, c, tier);
      if (items.length > 0) {
        let multiNotice = '';
        if (items.length > 1) {
          multiNotice = `
            <div style="font-size:11px;color:#d97706;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:6px 10px;margin-top:6px;font-weight:700;">
              ⚠️ 질병코드(${g.c.slice(0, 3).join(', ')})에 따라 담보 구분이 다를 수 있습니다. 진단서의 최종 코드를 확인하세요.
            </div>`;
        }

        return `
          <div class="ndai-res-box covered" style="border-left:4px solid #059669;margin-bottom:8px;background:var(--surface);">
            <div class="ndai-res-status" style="color:#059669;font-size:13px;font-weight:850;display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span>✓ [${esc(c)}${esc(tierBadge)}] N대 질병수술비</span>
              <span style="font-size:11px;background:rgba(16,185,129,0.12);color:#059669;padding:2px 7px;border-radius:6px;font-weight:800;">${items.length}개 특약 해당</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;">
              ${items.map(it => `
                <div class="ndai-item-block" style="margin-bottom:4px;">
                  <div class="ndai-item-row btn-expand-ndai-codes" data-ri="${it.ri}" data-si="${it.si}" data-co="${esc(it.co || c)}" data-sub="${esc(it.subClean)}" style="min-height:42px;padding:6px 12px;background:var(--surface-2);border-radius:8px;border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;user-select:none;">
                    <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">
                      <span style="color:#059669;font-weight:900;font-size:12px;flex-shrink:0;">•</span>
                      <span style="font-size:12px;color:var(--text);font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(it.tierText)}</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                      <span style="font-size:11.5px;font-weight:900;color:#047857;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);padding:3px 8px;border-radius:6px;white-space:nowrap;">
                        [${esc(it.subClean)}]
                      </span>
                      <span class="nir-arrow" style="font-size:11px;font-weight:850;color:#047857;background:var(--surface);padding:3px 8px;border-radius:6px;border:1px solid var(--border);min-width:96px;text-align:center;box-sizing:border-box;display:inline-block;">
                        질병코드 보기 ▾
                      </span>
                    </div>
                  </div>
                  <div class="ndai-codes-drawer" style="display:none;margin-top:4px;"></div>
                </div>
              `).join('')}
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

    return `
      <div style="margin-top:4px;">
        <div style="font-size:11px;font-weight:800;color:var(--text-3);margin-bottom:6px;">🏢 선택하신 회사별 N대 보장 결과:</div>
        ${blocks}
        <div style="font-size:11px;color:var(--text-3);margin-top:4px;">각 회사별 증권에 기재된 가입금액 한도로 각각 지급됩니다.</div>
      </div>`;
  } else {
    // 회사 미선택(전체): 해당 질환을 보장하는 전체 원수사를 보험사별 1개 그룹으로 묶어 표시
    const majorCos = ['현대해상', 'KB손해보험', '메리츠화재', '삼성화재', 'DB손해보험', 'NH농협손해보험', '한화손해보험', '흥국화재', '롯데손해보험', 'MG손해보험', '삼성생명', '한화생명', '교보생명', '신한라이프', 'KB라이프', '동양생명', '흥국생명', '미래에셋생명', '라이나생명', 'AIA생명', 'DB생명', 'KDB생명', 'iM라이프'];
    const allCos = Array.from(cos.keys());
    const sortedCos = allCos.sort((a, b) => {
      const idxA = majorCos.findIndex(m => a.includes(m.slice(0, 2)));
      const idxB = majorCos.findIndex(m => b.includes(m.slice(0, 2)));
      if (idxA >= 0 && idxB >= 0) return idxA - idxB;
      if (idxA >= 0) return -1;
      if (idxB >= 0) return 1;
      return a.localeCompare(b);
    });

    const coveredCos = [];
    sortedCos.forEach(c => {
      const items = formatNdaItemsForCo(g, c, tier);
      if (items.length > 0) {
        coveredCos.push({ co: c, items });
      }
    });

    if (coveredCos.length > 0) {
      return `
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px;">
          ${coveredCos.map(group => `
            <div class="ndai-co-group-block" style="border:1.5px solid var(--border);border-radius:10px;background:var(--surface);overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.03);">
              <div class="btn-toggle-co-group" style="padding:10px 14px;min-height:46px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:var(--surface);user-select:none;transition:background .15s ease;">
                <div style="display:flex;align-items:center;min-width:0;flex:1;">
                  <span style="font-size:13px;font-weight:900;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">🏢 ${esc(group.co)}</span>
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                  <span style="font-size:11px;font-weight:850;color:#059669;background:rgba(16,185,129,0.08);padding:3px 8px;border-radius:6px;border:1px solid rgba(16,185,129,0.25);white-space:nowrap;min-width:84px;text-align:center;display:inline-block;box-sizing:border-box;">
                    ${group.items.length}개 N대 특약
                  </span>
                  <span class="co-group-arrow" style="font-size:11px;font-weight:800;color:var(--brand);background:var(--surface-2);padding:3px 8px;border-radius:6px;border:1px solid var(--border);min-width:62px;text-align:center;display:inline-block;box-sizing:border-box;">펼쳐보기 ▾</span>
                </div>
              </div>
              <div class="co-group-drawer" style="display:none;padding:10px 12px;background:var(--surface-2);border-top:1px dashed var(--line);flex-direction:column;gap:6px;">
                ${group.items.map(it => `
                  <div class="ndai-item-block" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:8px 12px;display:flex;flex-direction:column;gap:6px;">
                    <div class="ndai-item-row btn-expand-ndai-codes" data-ri="${it.ri}" data-si="${it.si}" data-co="${esc(it.co || group.co)}" data-sub="${esc(it.subClean)}" style="min-height:38px;padding:0;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;user-select:none;">
                      <div style="font-size:12.5px;font-weight:850;color:var(--text);display:flex;align-items:center;gap:6px;word-break:keep-all;min-width:0;flex:1;">
                        <span style="color:#059669;font-weight:900;font-size:12px;flex-shrink:0;">•</span>
                        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(it.tierText)}</span>
                      </div>
                      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                        <span style="font-size:11.5px;font-weight:900;color:#047857;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);padding:3px 8px;border-radius:6px;white-space:nowrap;">
                          [${esc(it.subClean)}]
                        </span>
                        <span class="nir-arrow" style="font-size:11px;font-weight:850;color:#047857;background:var(--surface);padding:3px 8px;border-radius:6px;border:1px solid var(--border);min-width:96px;text-align:center;box-sizing:border-box;display:inline-block;">
                          질병코드 보기 ▾
                        </span>
                      </div>
                    </div>
                    <div class="ndai-codes-drawer" style="display:none;margin-top:4px;"></div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>`;
    } else {
      return `
        <div class="ndai-res-box not-covered" style="border:1.5px solid var(--border);border-radius:10px;padding:12px 14px;margin-top:8px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;">
          <span style="font-size:13px;font-weight:900;color:var(--text-3);">❌ N대질병 미해당</span>
        </div>`;
    }
  }
}

function cardNdaiHTML(gi, q, isSub = false) {
  const g = state.D.g[gi];
  const cosList = state.ndaiCos && state.ndaiCos.length ? state.ndaiCos : (state.ndaiCo ? [state.ndaiCo] : []);
  const nTier = state.ndaiTier;

  const contentHTML = renderNdaiDetailsHTML(g, cosList, nTier);

  const innerCardHTML = `
      ${contentHTML}

      <!-- 질병수술비 확인 및 종수술비 바로가기 버튼 2종 -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);">
        <button type="button" class="btn-toggle-basic-surg">
          <span>💡 질병수술비 가능여부 ▾</span>
        </button>
        <button type="button" class="btn-jump-action btn-jump-tier" data-q="${esc(g.n)}">
          <span>📋 종수술비 바로가기</span>
        </button>
      </div>
      <div class="basic-surg-drawer" style="display:none;margin-top:8px;">
        ${renderBasicSurgeryBox(getBasicSurgerySummary(g))}
      </div>
  `;

  if (isSub) {
    return `
    <div class="sub-disease-item card" data-gi="${gi}" style="background:var(--surface);border:1.5px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.03);transition:all .15s ease;">
      <div class="btn-toggle-sub-disease" style="padding:11px 14px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;background:var(--surface);user-select:none;">
        <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
          <span class="kcd-badge-big" style="font-size:11px;padding:3px 7px;flex-shrink:0;">${g.c.slice(0, 2).join(', ')}</span>
          <span style="font-size:13.5px;font-weight:900;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${hl(g.n, q)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
          <span class="sub-disease-arrow" style="font-size:11.5px;font-weight:800;color:var(--brand);background:var(--surface-2);padding:3px 8px;border-radius:6px;border:1px solid var(--border);">펼쳐보기 ▾</span>
        </div>
      </div>
      <div class="sub-disease-drawer" style="display:none;padding:12px 14px 14px 14px;border-top:1px dashed var(--line);background:var(--surface);">
        <div class="card-head" style="padding:0;margin-bottom:8px;">
          ${innerCardHTML}
        </div>
      </div>
    </div>`;
  }

  return `
  <article class="card main-quick-card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <span class="kcd-badge-big">${g.c.slice(0, 3).join(', ')}</span>
        <h3 class="card-name">${hl(g.n, q)}</h3>
        <span style="margin-left:auto;font-size:11px;font-weight:850;color:#8b5cf6;background:rgba(139,92,246,0.1);padding:2px 7px;border-radius:5px;border:1px solid rgba(139,92,246,0.3);">⭐ 대표 질환</span>
      </div>
      ${innerCardHTML}
    </div>
  </article>`;
}


/* ───────────────────────── 4. 사진으로 검색하기 (진단서·수술확인서 AI 사진 판독 및 텍스트 판정) ───────────────────────── */
window.resetOcrTab = function() {
  const fileInput = $('#ocrFileInput');
  if (fileInput) fileInput.value = '';
  const previewBox = $('#ocrPreviewBox');
  if (previewBox) previewBox.style.display = 'none';
  const resultCard = $('#ocrResultCard');
  if (resultCard) resultCard.innerHTML = '';
  const txtInput = $('#ocrTextInput');
  if (txtInput) txtInput.value = '';
  const dropZone = $('#ocrDropZone');
  if (dropZone) dropZone.classList.remove('dragover');
};

function parseDiagnosisAndSurgeries(text) {
  const codes = [];
  const surgeries = [];
  const diseaseNames = [];

  // 1. KCD 질병코드 추출
  const kcdMatches = text.match(/\b([A-Z]\d{2}(?:\.\d{1,2})?)\b/gi) || [];
  const uniqueKcd = Array.from(new Set(kcdMatches.map(c => c.toUpperCase())));

  const KCD_NAME_MAP = {
    'J34.2': '편위된 코사이막 (비중격만곡증)',
    'J34.3': '코선반의 비대 (비후성 비염)',
    'J34.8': '코 및 비동의 기타 명시된 장애 (비밸브 협착 등)',
    'J34': '코 및 비동의 기타 장애',
    'J30.4': '상세불명의 알레르기성 비염',
    'J30': '혈관운동성 및 알레르기성 비염',
    'M95.0': '코의 후천성 변형',
    'M95': '기타 후천성 변형',
    'J32.0': '만성 사골동염',
    'J32.2': '만성 상악동염',
    'J32.1': '만성 전두동염',
    'J32.3': '만성 접형동염',
    'J32.4': '만성 범부비동염',
    'J32': '만성 부비동염 (축농증)',
    'N75.0': '바르톨린선 낭종',
    'N75.1': '바르톨린선 농양',
    'N75': '바르톨린선의 질환 (바토린선)',
    'K63.5': '결장 폴립 (대장용종)',
    'D12': '결장·직장 양성신생물 (대장선종)',
    'D24': '유방의 양성신생물 (섬유선종)',
    'H25': '노년성 백내장',
    'K64': '치핵 및 항문주위정맥혈전증',
    'N20': '신장 및 요관의 결석',
    'D25': '자궁의 평활근종',
    'I83': '하지정맥류',
    'M50': '경추간판장애 (목디스크)',
    'M51': '기타 추간판장애 (허리디스크)',
    'M17': '무릎관절증 (퇴행성 관절염)'
  };

  uniqueKcd.forEach(code => {
    if (['S41', 'C00'].includes(code)) return;
    if (KCD_NAME_MAP[code] || code.includes('.') || state.D?.codeIndex?.[code]) {
      codes.push({ code, name: KCD_NAME_MAP[code] || '' });
    }
  });

  // 2. 수술명 인식
  const t = text;

  // 1) 하비갑개점막하 절제술
  if (/하비갑개|비갑개|점막하절제/.test(t)) {
    surgeries.push({
      name: '하비갑개점막하 절제술 (비갑개 절제술)',
      edi: 'O1431',
      site: '코 (비강)',
      tier3: '1종',
      tier5: '1종',
      tier5Num: 1,
      tierDesc: '표준 1~5종 제12항 비강, 비중격 관혈수술 1종 (1~3종도 1종)',
      ndaiText: '· <b>현대해상 123대</b>: 58대 질병 해당 (다빈도 호흡기질환)<br>· <b>KB손보 112대</b>: 49대 질병 해당<br>· <b>DB손보 119대</b>: 58대 질병 해당',
      notice: '단순 고주파 소작술이 아닌 점막하 절제술 시 1종 지급 명확'
    });
  }

  // 2) 비중격교정술
  if (/비중격|코사이막/.test(t)) {
    surgeries.push({
      name: '비중격교정술 (비중격 성형술)',
      edi: 'O1421',
      site: '코 (비강)',
      tier3: '1종',
      tier5: '1종',
      tier5Num: 1,
      tierDesc: '표준 1~5종 제12항 비강, 비중격 관혈수술 1종 (1~3종도 1종)',
      ndaiText: '· <b>현대해상 123대</b>: 58대 질병 해당<br>· <b>KB손보 112대</b>: 49대 질병 해당<br>· <b>DB손보 119대</b>: 58대 질병 해당',
      notice: '진단서에 코막힘·비후성비염·부비동염 등 기능적 치료 목적 기재 필수 (단순 미용 제외)'
    });
  }

  // 3) 만성 상악동·사골동 근본수술 (부비동근본수술)
  if (/상악동|사골동|부비동|근본수술|FESS|축농증수술/.test(t)) {
    surgeries.push({
      name: '만성 부비동(상악동·사골동) 근본수술',
      edi: 'O1411',
      site: '코 (비강)',
      tier3: '2종',
      tier5: '2종',
      tier5Num: 2,
      tierDesc: '표준 1~5종 제12항 부비강 근본수술 2종 (1~3종도 2종)',
      ndaiText: '· <b>현대해상 123대</b>: 58대 질병 해당 (축농증 J32)<br>· <b>KB손보 112대</b>: 49대 질병 해당<br>· <b>DB손보 119대</b>: 58대 질병 해당<br>· <b>메리츠 112대</b>: 33대 질병 해당',
      notice: '내시경적 부비동수술(FESS)이라도 관혈적 근본수술로 2종 지급 대상'
    });
  }

  // 4) 바르톨린선 낭종 조대술
  if (/바르톨린|바토린|조대술|개창술/.test(t)) {
    surgeries.push({
      name: '바르톨린선 낭종 조대술 (개창술)',
      edi: 'R4111',
      site: '외음부',
      tier3: '1종',
      tier5: '1종',
      tier5Num: 1,
      tierDesc: '표준 1~5종 제43항 외이음부 관혈수술 1종 (1~3종도 1종)',
      ndaiText: '· N75 부인과 질환 관련 N대 특약 확인 필요',
      notice: '단순 흡입 배농은 면책, 관혈적 조대술·낭종절제술 시행 시 1종 지급'
    });
  }

  // 5) 대장용종 절제술
  if (/결장경|대장|용종|폴립/.test(t) && !surgeries.some(s => s.name.includes('용종'))) {
    surgeries.push({
      name: '결장경하 폴립절제술 (대장용종절제술)',
      edi: 'Q7701',
      site: '대장',
      tier3: '2종',
      tier5: '2종',
      tier5Num: 2,
      tierDesc: '표준 1~5종 제36항/제87항 내시경 폴립절제 2종 (2020년 이후 일부 개정 약관 1종)',
      ndaiText: '· <b>현대 123대</b>: 58대 질병 해당 (K63.5/D12)<br>· <b>KB 112대</b>: 26대 질병 해당<br>· <b>DB 119대</b>: 58대 질병 해당',
      notice: '2020년 이후 메리츠화재·롯데손보는 1종으로 분류될 수 있음'
    });
  }

  // 6) 맘모톰 절제술
  if (/맘모톰|유방절제|유방양성/.test(t) && !surgeries.some(s => s.name.includes('유방'))) {
    surgeries.push({
      name: '유방양성종양절제술 (맘모톰)',
      edi: 'N7121',
      site: '유방',
      tier3: '2종',
      tier5: '2종',
      tier5Num: 2,
      tierDesc: '표준 1~5종 제4항 유방 관혈수술 2종 준용',
      ndaiText: '· <b>현대 123대</b>: 59대 질병 해당 (D24)<br>· <b>KB 112대</b>: 49대 질병 해당<br>· <b>DB 119대</b>: 58대 질병 해당',
      notice: '비급여 시술이 많으므로 7·8종(급여 전용)에서는 부지급 주의'
    });
  }

  // 7) 백내장 수술
  if (/백내장|수정체/.test(t) && !surgeries.some(s => s.name.includes('백내장'))) {
    surgeries.push({
      name: '백내장 수정체적출술 (인공수정체 삽입)',
      edi: 'S5111',
      site: '눈 (안구)',
      tier3: '1종',
      tier5: '1종',
      tier5Num: 1,
      tierDesc: '표준 1~5종 제68항 백내장·수정체 관혈수술 1종',
      ndaiText: '· <b>현대 123대</b>: 24대 다빈도 질병 해당<br>· <b>KB 112대</b>: 18대 질병 해당',
      notice: '동일 날 양안 수술 시 1회 지급 제한 규정 주의'
    });
  }

  // 3. 가입 증권 / 가입제안서 정보 추출 (PDF 및 사진 전수 분석)
  const policyInfo = {
    hasPolicy: false,
    company: null,
    productName: null,
    customerName: null,
    contractYear: null,
    hasTier5: false,
    tierAmounts: {},
    hasCerebro: false,
    cerebroAmount: 0,
    hasHeart: false,
    heartAmount: 0,
    hasCancer: false,
    cancerAmount: 0,
    hasDiseaseSurg: false,
    diseaseAmount: 300000,
    hasNdai: false
  };

  const isDoc = /(가입설계서|가입제안서|상품제안서|보험증권|가입안내서|플랜|가입담보|계약자용|청약번호|고객콜센터)/i.test(text);

  const KNOWN_INSURERS = [
    { name: 'KB손해보험', re: /KB손해|KB 5\.10|kbinsure|KB손보/i },
    { name: '미래에셋생명', re: /미래에셋/i },
    { name: '현대해상', re: /현대해상/i },
    { name: 'DB손해보험', re: /DB손해|동부화재/i },
    { name: '메리츠화재', re: /메리츠/i },
    { name: '삼성화재', re: /삼성화재/i },
    { name: '한화손해보험', re: /한화손해/i },
    { name: '흥국화재', re: /흥국화재/i },
    { name: '롯데손해보험', re: /롯데손해/i },
    { name: 'MG손해보험', re: /MG손해/i },
    { name: 'NH농협손해보험', re: /NH농협손해|농협손해보험/i },
    { name: '삼성생명', re: /삼성생명/i },
    { name: '한화생명', re: /한화생명/i },
    { name: '교보생명', re: /교보생명/i },
    { name: '신한라이프', re: /신한라이프/i },
    { name: 'KB라이프', re: /KB라이프/i },
    { name: '동양생명', re: /동양생명/i },
    { name: '흥국생명', re: /흥국생명/i },
    { name: '라이나생명', re: /라이나생명/i },
    { name: 'AIA생명', re: /AIA생명/i },
    { name: 'DB생명', re: /DB생명/i },
    { name: 'KDB생명', re: /KDB생명/i },
    { name: 'iM라이프', re: /iM라이프|DGB생명/i },
    { name: '농협생명', re: /농협생명/i }
  ];

  for (const ins of KNOWN_INSURERS) {
    if (ins.re.test(text)) {
      policyInfo.company = ins.name;
      policyInfo.hasPolicy = true;
      break;
    }
  }

  if (isDoc) policyInfo.hasPolicy = true;

  const prodMatch = text.match(/([가-힣A-Za-z0-9\s.·+()_-]{3,35}(?:건강보험|종합보험|수술보험|보장보험|암보험|케어보험|케어건강보험|플랜))/);
  if (prodMatch) {
    policyInfo.productName = prodMatch[1].trim();
    policyInfo.hasPolicy = true;
  }

  const custMatch = text.match(/(?:피보험자|계약자|고객명)[\s:：|]*([가-힣]{2,4})(?:님|\(|\s|$)/);
  if (custMatch) {
    policyInfo.customerName = custMatch[1];
  } else {
    const custMatch2 = text.match(/([가-힣]{2,4})님을위한/);
    if (custMatch2) policyInfo.customerName = custMatch2[1];
  }

  const yearMatch = text.match(/(?:발행일|계약일|청약일|가입일|발급일시)[\s:：]*(20\d{2})/);
  if (yearMatch) {
    policyInfo.contractYear = parseInt(yearMatch[1], 10);
  }

  // 1-5종 수술특약 가입 여부 및 종별 금액
  if (/(?:1[~-]5종|1종\s*내지\s*5종|수술특약\(1[~-]5종\)|질병\s*수술\(1[~-]5종\))/i.test(text)) {
    policyInfo.hasTier5 = true;
    policyInfo.hasPolicy = true;
    for (let tier = 1; tier <= 5; tier++) {
      const reTier = new RegExp(`(?:1-5종수술특약|수술특약|종수술)[^\\n]*[(]?${tier}종[)]?[^\\n]*\\n\\s*([0-9,]+)`, 'i');
      const m = text.match(reTier);
      if (m) {
        let num = parseInt(m[1].replace(/,/g, ''), 10);
        if (num < 10000) num *= 10000;
        policyInfo.tierAmounts[tier] = num;
      }
    }
    // 백업 금액
    if (!policyInfo.tierAmounts[1] && /1종\s*20\s*만/.test(text)) policyInfo.tierAmounts[1] = 200000;
    if (!policyInfo.tierAmounts[2] && /2종\s*30\s*만/.test(text)) policyInfo.tierAmounts[2] = 300000;
    if (!policyInfo.tierAmounts[3] && /3종\s*(?:100|200)\s*만/.test(text)) policyInfo.tierAmounts[3] = 2000000;
    if (!policyInfo.tierAmounts[4] && /4종\s*(?:200|700)\s*만/.test(text)) policyInfo.tierAmounts[4] = 7000000;
    if (!policyInfo.tierAmounts[5] && /5종\s*(?:1,000|1000|1,500|1500)\s*만/.test(text)) policyInfo.tierAmounts[5] = 15000000;

    if (!policyInfo.tierAmounts[2]) {
      policyInfo.tierAmounts = { 1: 200000, 2: 300000, 3: 2000000, 4: 7000000, 5: 15000000 };
    }
  }

  // 뇌혈관질환수술비
  const cbMatch = text.match(/뇌혈관(?:질환)?수술비[\s\S]{0,50}?([\d,]+)\s*(천?만?원)/);
  if (cbMatch) {
    policyInfo.hasCerebro = true;
    policyInfo.hasPolicy = true;
    let n = parseInt(cbMatch[1].replace(/,/g, ''), 10);
    if (cbMatch[2] && cbMatch[2].includes('천만')) n *= 10000000;
    else if (cbMatch[2] && cbMatch[2].includes('만')) n *= 10000;
    else if (n < 10000) n *= 10000;
    policyInfo.cerebroAmount = n;
  }

  // 허혈성심장질환수술비
  const hMatch = text.match(/허혈성?(?:심장질환)?수술비[\s\S]{0,50}?([\d,]+)\s*(천?만?원)/);
  if (hMatch) {
    policyInfo.hasHeart = true;
    policyInfo.hasPolicy = true;
    let n = parseInt(hMatch[1].replace(/,/g, ''), 10);
    if (hMatch[2] && hMatch[2].includes('천만')) n *= 10000000;
    else if (hMatch[2] && hMatch[2].includes('만')) n *= 10000;
    else if (n < 10000) n *= 10000;
    policyInfo.heartAmount = n;
  }

  // 암수술비
  const caMatch = text.match(/(?:일반암|악성신생물|암)수술비[\s\S]{0,50}?([\d,]+)\s*(천?만?원)/);
  if (caMatch) {
    policyInfo.hasCancer = true;
    policyInfo.hasPolicy = true;
    let n = parseInt(caMatch[1].replace(/,/g, ''), 10);
    if (caMatch[2] && caMatch[2].includes('천만')) n *= 10000000;
    else if (caMatch[2] && caMatch[2].includes('만')) n *= 10000;
    else if (n < 10000) n *= 10000;
    policyInfo.cancerAmount = n;
  }

  // 기본 질병수술비 (단독 정액)
  if (/(?:기본\s*)?질병수술비(?!\s*\(1[~-]5종\))/i.test(text)) {
    policyInfo.hasDiseaseSurg = true;
    policyInfo.hasPolicy = true;
    const dsMatch = text.match(/(?:기본\s*)?질병수술비[\s\S]{0,50}?([\d,]+)\s*(천?만?원)/);
    if (dsMatch && !dsMatch[0].includes('1-5종')) {
      let n = parseInt(dsMatch[1].replace(/,/g, ''), 10);
      if (dsMatch[2] && dsMatch[2].includes('만')) n *= 10000;
      if (n > 0) policyInfo.diseaseAmount = n;
    }
  }

  // N대질병수술비
  if (/([0-9]{2,3})대\s*질병수술비/i.test(text)) {
    policyInfo.hasNdai = true;
    policyInfo.hasPolicy = true;
  }

  return { codes, surgeries, diseaseNames, policyInfo };
}

function bindOcrTab() {
  const dropZone = $('#ocrDropZone');
  const fileInput = $('#ocrFileInput');
  const btnSelect = $('#btnSelectOcrFile');
  const previewBox = $('#ocrPreviewBox');
  const resultCard = $('#ocrResultCard');
  const resetBtn = $('#btnOcrReset');

  if (!dropZone || dropZone.dataset.bound) return;
  dropZone.dataset.bound = '1';

  let ocrYear = null;
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
    const co = ocrCos.length ? ocrCos.join(', ') : '';
    if (co && ocrYear) {
      summaryBadge.textContent = `(${co} · ${ocrYear}년)`;
    } else if (co) {
      summaryBadge.textContent = `(${co})`;
    } else if (ocrYear) {
      summaryBadge.textContent = `(${ocrYear}년)`;
    } else {
      summaryBadge.textContent = '';
    }
  }

  const ocrYearGrid = $('#ocrYearGrid');
  if (ocrYearGrid) {
    ocrYearGrid.innerHTML = `
      <button class="f-chip ocr-y-chip on" data-y="" type="button" style="padding:6px 0;font-size:11px;font-weight:800;grid-column:span 4;">전체</button>
      ${ALL_CONTRACT_YEARS.map(y => `
        <button class="f-chip ocr-y-chip" data-y="${y}" type="button" style="padding:6px 0;font-size:11px;font-weight:750;">${y}년</button>
      `).join('')}
    `;
    $$('#ocrYearGrid .ocr-y-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('#ocrYearGrid .ocr-y-chip').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        ocrYear = btn.dataset.y ? parseInt(btn.dataset.y, 10) : null;
        const badge = $('#ocrDateBadge');
        if (badge) badge.textContent = ocrYear ? `${ocrYear}년 계약` : '전체';
        updateOcrSummary();
      });
    });
  }

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

  // 1. 드래그 앤 드롭 지원
  ['dragenter', 'dragover'].forEach(en => {
    dropZone.addEventListener(en, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropZone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(en => {
    dropZone.addEventListener(en, (e) => {
      e.preventDefault(); e.stopPropagation();
      dropZone.classList.remove('dragover');
    });
  });
  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = Array.from(dt?.files || []).filter(f => f.type.startsWith('image/') || f.name.endsWith('.pdf'));
    if (files.length) handleOcrFiles(files);
  });

  // 2. Ctrl+V 클립보드 붙여넣기 지원 (사진검색 탭 활성 시)
  window.addEventListener('paste', (e) => {
    if (state.tab !== 'ocr') return;
    const items = Array.from(e.clipboardData?.items || []);
    const imgItem = items.find(it => it.type.startsWith('image/'));
    if (imgItem) {
      const file = imgItem.getAsFile();
      if (file) handleOcrFiles([file]);
      return;
    }
    const txt = e.clipboardData?.getData('text');
    if (txt && txt.trim()) {
      const txtArea = $('#ocrTextInput');
      if (txtArea) txtArea.value = txt.trim();
      handleOcrText(txt.trim());
    }
  });

  // 3. 텍스트 직접 입력/붙여넣기 서랍
  const btnTogglePaste = $('#btnToggleOcrPaste');
  const pasteDrawer = $('#ocrPasteDrawer');
  const pasteIcon = $('#ocrPasteToggleIcon');
  const btnAnalyzeText = $('#btnAnalyzeOcrText');

  btnTogglePaste?.addEventListener('click', () => {
    const isHidden = pasteDrawer.style.display === 'none';
    pasteDrawer.style.display = isHidden ? 'block' : 'none';
    if (pasteIcon) pasteIcon.textContent = isHidden ? '접기 ∧' : '펼치기 ∨';
  });

  btnAnalyzeText?.addEventListener('click', () => {
    const val = $('#ocrTextInput')?.value || '';
    if (!val.trim()) {
      alert('진단서 텍스트나 질병코드, 수술명을 입력해 주세요.');
      return;
    }
    handleOcrText(val.trim());
  });

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    handleOcrFiles(files);
  });

  resetBtn.addEventListener('click', () => {
    window.resetOcrTab();
  });

  async function extractTextFromPdf(file, onProgress) {
    if (typeof pdfjsLib === 'undefined') {
      console.warn('PDF.js not loaded');
      return '';
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      const totalPages = Math.min(pdf.numPages, 20);
      for (let i = 1; i <= totalPages; i++) {
        if (onProgress) onProgress(i, totalPages);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStr = textContent.items.map(it => it.str).join(' ');
        fullText += `\n--- [PDF ${file.name} P.${i}] ---\n` + pageStr;

        if (pageStr.replace(/\s+/g, '').length < 30 && typeof Tesseract !== 'undefined') {
          try {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            const ctx = canvas.getContext('2d');
            await page.render({ canvasContext: ctx, viewport }).promise;
            const ocrRes = await Tesseract.recognize(canvas, 'kor+eng');
            fullText += '\n' + (ocrRes?.data?.text || '');
          } catch (e) {
            console.warn('PDF page canvas OCR error:', e);
          }
        }
      }
      return fullText;
    } catch (err) {
      console.error('extractTextFromPdf error:', err);
      return '';
    }
  }

  async function handleOcrFiles(files) {
    if (!files.length) return;
    previewBox.style.display = 'block';
    resultCard.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:12px 6px;">
        <span class="spin"></span>
        <div>
          <div style="font-weight:850;color:var(--text);font-size:13.5px;">서류 및 사진 AI 분석 중… (총 ${files.length}개 파일)</div>
          <div id="ocrProgressLabel" style="font-size:11.5px;color:#8b5cf6;font-weight:750;margin-top:2px;">파일 형식 파악 및 텍스트·PDF 분석 준비 중</div>
        </div>
      </div>`;

    let allExtractedText = '';

    for (let fIdx = 0; fIdx < files.length; fIdx++) {
      const file = files[fIdx];
      const pEl = $('#ocrProgressLabel');
      if (pEl) pEl.textContent = `[${fIdx + 1}/${files.length}] ${file.name} 분석 중…`;

      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      if (isPdf) {
        const pdfText = await extractTextFromPdf(file, (p, total) => {
          if (pEl) pEl.textContent = `[${fIdx + 1}/${files.length}] ${file.name} PDF 읽는 중 (${p}/${total}쪽)`;
        });
        allExtractedText += `\n\n=== [문서: ${file.name}] ===\n` + pdfText;
      } else {
        if (typeof Tesseract !== 'undefined') {
          try {
            const res = await Tesseract.recognize(file, 'kor+eng', {
              logger: m => {
                if (pEl && m.status === 'recognizing text') {
                  const pct = Math.floor((m.progress || 0) * 100);
                  pEl.textContent = `[${fIdx + 1}/${files.length}] ${file.name} 글자 인식 중... (${pct}%)`;
                }
              }
            });
            allExtractedText += `\n\n=== [사진: ${file.name}] ===\n` + (res?.data?.text || '');
          } catch (err) {
            console.warn('Tesseract OCR error:', err);
          }
        }
      }
    }

    if (!allExtractedText.trim()) {
      allExtractedText = files.map(f => f.name).join(' ');
    }

    renderOcrAnalysisResult(allExtractedText, files.length);
  }

  function handleOcrText(rawText) {
    previewBox.style.display = 'block';
    resultCard.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:12px 6px;">
        <span class="spin"></span>
        <span style="font-weight:850;color:var(--text);font-size:13.5px;">입력된 진단서 텍스트 판정 분석 중…</span>
      </div>`;
    setTimeout(() => {
      renderOcrAnalysisResult(rawText, 0);
    }, 250);
  }

  function renderOcrAnalysisResult(rawText, fileCount) {
    const parsed = parseDiagnosisAndSurgeries(rawText);

    // 증권/제안서에서 회사가 인식된 경우 회사 필터 자동 동기화
    if (parsed.policyInfo && parsed.policyInfo.hasPolicy && parsed.policyInfo.company) {
      ocrCos = [parsed.policyInfo.company];
      ocrCo = parsed.policyInfo.company;
      const b = $('#ocrCoBadge');
      if (b) b.textContent = ocrCo;
      const sb = $('#ocrSummaryBadge');
      if (sb) sb.textContent = `(${ocrCo})`;
    }

    const coText = ocrCos.length ? `[${esc(ocrCos.join(', '))}]` : (ocrYear ? '' : '[전체 보험사]');
    const dtText = ocrYear ? `[${ocrYear}년 계약]` : '';
    const headerCompanyLine = [coText, dtText].filter(Boolean).join(' ');
    const sourceLabel = fileCount > 0 ? `서류 및 사진 ${fileCount}건 AI 통합 판독 완료` : `진단서 텍스트 분석 완료`;

    const p = parsed.policyInfo || {};
    const hasPolicy = p.hasPolicy;
    const surgeries = parsed.surgeries || [];
    const codes = parsed.codes || [];

    // 환자 진단 및 수술 특성 판정 (진단서 질병코드 및 파싱된 수술명 기준으로만 엄격 판정! 제안서 PDF 텍스트 오염 절대 방지)
    const isCerebroDiag = codes.some(c => /^I6\d/.test(c.code)) || surgeries.some(s => /(?:개두술|뇌동맥류|혈전제거술|뇌혈관문합술)/.test(s.name));
    const isHeartDiag = codes.some(c => /^I2[0-5]/.test(c.code)) || surgeries.some(s => /(?:스텐트삽입|관상동맥|CABG)/.test(s.name));
    const isCancerDiag = codes.some(c => /^[CD]\d/.test(c.code)) || surgeries.some(s => /(?:암절제|악성신생물|근치적)/.test(s.name));
    const isEntSurgery = codes.some(c => /^J3\d/.test(c.code)) || surgeries.some(s => /(?:비강|비중격|하비갑개|부비동|상악동|사골동)/.test(s.name));

    let topTier = null;
    if (surgeries.length > 0) {
      topTier = Math.max(...surgeries.map(s => s.tier5Num || 1));
    }

    // 제안서 담보와 진단서 수술 대조 평가
    let totalPayable = 0;
    const payableItems = [];
    const unpayableItems = [];
    const missingRiders = [];

    if (hasPolicy) {
      // 1) 1~5종 수술특약
      if (p.hasTier5) {
        if (topTier > 0) {
          const amt = p.tierAmounts[topTier] || (topTier === 1 ? 200000 : (topTier === 2 ? 300000 : 0));
          totalPayable += amt;
          payableItems.push({
            name: `1~5종 수술특약 (${topTier}종)`,
            amount: amt,
            reason: `진단서 수술 중 최고 등급(${topTier}종) 인정 (동시수술 최고 등급 1회 지급)`
          });
        }
      } else {
        missingRiders.push({
          name: '1~5종 수술특약',
          reason: '제안서 담보에 1~5종 특약 미가입 (비강·부비동 수술 보장 특약 없음)'
        });
      }

      // 2) 뇌혈관질환수술비 (진단서 질환이 실제 뇌혈관질환인 경우에만 평가 및 지급, 무관한 코/비염 수술일 때는 부지급 내역 자체를 노출하지 않음!)
      if (p.hasCerebro && isCerebroDiag) {
        totalPayable += p.cerebroAmount;
        payableItems.push({
          name: '뇌혈관질환수술비',
          amount: p.cerebroAmount,
          reason: '뇌혈관질환(I60~I69) 직접 치료 수술 인정'
        });
      }

      // 3) 허혈성심장질환수술비 (진단서 질환이 실제 심장 질환인 경우에만 평가)
      if (p.hasHeart && isHeartDiag) {
        totalPayable += p.heartAmount;
        payableItems.push({
          name: '허혈성심장질환수술비',
          amount: p.heartAmount,
          reason: '허혈성 심장질환(I20~I25) 직접 치료 수술 인정'
        });
      }

      // 4) 암수술비 (진단서 질환이 실제 악성신생물 질환인 경우에만 평가)
      if (p.hasCancer && isCancerDiag) {
        totalPayable += p.cancerAmount;
        payableItems.push({
          name: '암수술비',
          amount: p.cancerAmount,
          reason: '악성신생물 치료 수술 인정'
        });
      }

      // 5) 기본 질병수술비
      if (p.hasDiseaseSurg) {
        totalPayable += p.diseaseAmount;
        payableItems.push({
          name: '기본 질병수술비 (정액)',
          amount: p.diseaseAmount,
          reason: '질병 치료 목적의 절제·절단 수술 요건 충족'
        });
      } else {
        missingRiders.push({
          name: '기본 질병수술비',
          reason: '제안서 담보에 기본 질병수술비 미가입'
        });
      }
    }

    const isSameSite = surgeries.length >= 2 && surgeries.every(s => s.site === surgeries[0].site);
    const siteName = surgeries[0]?.site || '코 (비강)';

    let html = `
      <div style="font-weight:850;color:#8b5cf6;font-size:14px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
        <span>✓ ${sourceLabel}</span>
        <span style="font-size:11.5px;color:var(--text-2);font-weight:700;">${headerCompanyLine}</span>
      </div>`;

    // 핵심 요약 카드: [어디에서 얼마]
    if (hasPolicy) {
      if (totalPayable > 0) {
        // 지급 대상 건
        html += `
        <div class="card ocr-summary-card" style="background:var(--surface);border:2px solid #059669;border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:var(--shadow-2);text-align:left;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1.5px solid rgba(5,150,105,0.25);padding-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div>
              <span style="font-size:11.5px;font-weight:850;color:#059669;background:rgba(5,150,105,0.1);padding:3px 8px;border-radius:6px;">⭕ 수술비 정상 지급 대상</span>
              <h3 style="font-size:18px;font-weight:900;color:var(--text);margin:6px 0 2px;">수술비 최종 지급 정산 결과</h3>
              <div style="font-size:12px;color:var(--text-3);font-weight:700;">[${esc(p.company || '가입제안서')}] ${esc(p.productName || '가입 플랜')}${p.customerName ? ` (${esc(p.customerName)} 님)` : ''} × 진단서 대조</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11.5px;color:var(--text-3);font-weight:750;">총 예상 지급액</div>
              <div style="font-size:24px;font-weight:900;color:#059669;letter-spacing:-.03em;">${totalPayable.toLocaleString()}원</div>
            </div>
          </div>

          <!-- 어디에서 얼마 리스트 -->
          <div style="background:var(--surface-2);border-radius:12px;padding:12px 14px;border:1px solid var(--border);margin-bottom:12px;">
            <div style="font-size:12px;font-weight:850;color:var(--text-2);margin-bottom:8px;">💰 담보별 세부 지급 내역:</div>
            <div style="display:flex;flex-direction:column;gap:6px;">
              ${payableItems.map(item => `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 12px;background:var(--surface);border:1px solid rgba(5,150,105,0.2);border-radius:8px;">
                  <div style="display:flex;flex-direction:column;gap:2px;">
                    <span style="font-size:13px;font-weight:850;color:#059669;">${esc(item.name)}</span>
                    <span style="font-size:11px;color:var(--text-3);">${esc(item.reason)}</span>
                  </div>
                  <span style="font-size:15px;font-weight:900;color:#059669;white-space:nowrap;">${item.amount.toLocaleString()}원</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 세부 지급 근거 접이식 서랍 토글 버튼 -->
          <button type="button" id="btnToggleOcrDetailsDrawer" style="width:100%;padding:10px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:850;color:var(--text-2);">
            <span>📋 세부 지급 근거 및 산출 내역 확인하기</span>
            <span id="ocrDetailsDrawerArrow" style="font-size:12px;color:var(--brand);font-weight:850;">펼치기 ▾</span>
          </button>

          <!-- 접혀 있는 세부 산출 근거 서랍 -->
          <div id="ocrDetailsDrawer" style="display:none;margin-top:10px;padding-top:10px;border-top:1px dashed var(--border);">
            ${isSameSite ? `
            <div style="background:rgba(234,88,12,0.08);border:1px solid rgba(234,88,12,0.25);border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:12px;line-height:1.5;">
              <span style="font-weight:850;color:#ea580c;">⚠️ 동시수술 지급 제한 규정 적용:</span><br>
              시행된 수술 ${surgeries.length}건이 모두 <b>[${esc(siteName)}]</b> 동일 신체부위에 해당하므로, 약관 규정에 따라 <b>가장 높은 등급(${topTier}종) 1회만 지급</b>됩니다.
            </div>` : ''}

            <div style="font-size:12px;font-weight:850;color:var(--text-2);margin-bottom:6px;">🏥 의무기록에서 확인된 수술 (${surgeries.length}건):</div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
              ${surgeries.map(s => `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;background:var(--surface-2);border-radius:8px;font-size:12px;">
                  <span><b>${esc(s.name)}</b> (${esc(s.site)})</span>
                  <span style="font-weight:850;color:#1d4ed8;">${esc(s.tier5)}</span>
                </div>
              `).join('')}
            </div>

            <div style="font-size:12px;font-weight:850;color:var(--text-2);margin-bottom:6px;">🏷️ 진단된 질병코드 (${codes.length}건):</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${codes.map(c => `
                <span style="background:var(--surface);border:1px solid var(--border);padding:3px 8px;border-radius:6px;font-size:11.5px;font-weight:800;color:var(--text);">
                  ${esc(c.code)} ${esc(c.name)}
                </span>
              `).join('')}
            </div>
          </div>
        </div>`;
      } else {
        // 지급 불가 (담보 미해당 / 미가입) 건
        html += `
        <div class="card ocr-summary-card" style="background:var(--surface);border:2px solid #e11d48;border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:var(--shadow-2);text-align:left;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1.5px solid rgba(225,29,72,0.25);padding-bottom:12px;flex-wrap:wrap;gap:8px;">
            <div>
              <span style="font-size:11.5px;font-weight:850;color:#e11d48;background:rgba(225,29,72,0.1);padding:3px 8px;border-radius:6px;">❌ 보험금 지급 불가 (가입 담보 미해당)</span>
              <h3 style="font-size:18px;font-weight:900;color:var(--text);margin:6px 0 2px;">수술비 최종 지급 정산 결과</h3>
              <div style="font-size:12px;color:var(--text-3);font-weight:700;">[${esc(p.company || '가입제안서')}] ${esc(p.productName || '가입 플랜')}${p.customerName ? ` (${esc(p.customerName)} 님)` : ''} × 진단서 대조</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:11.5px;color:var(--text-3);font-weight:750;">총 예상 지급액</div>
              <div style="font-size:24px;font-weight:900;color:#e11d48;letter-spacing:-.03em;">0원</div>
            </div>
          </div>

          <!-- 청구 가능여부 및 청구처 핵심 결과 박스 2종 (불필요한 무관 담보 문구 전면 배제) -->
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
            <!-- 1. 본 제안서 청구 가능여부 -->
            <div style="padding:12px 14px;background:rgba(225,29,72,0.04);border:1.5px solid rgba(225,29,72,0.25);border-radius:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <div style="display:flex;flex-direction:column;gap:2px;">
                <span style="font-size:12px;font-weight:750;color:#e11d48;">보험금 청구 가능여부</span>
                <span style="font-size:14px;font-weight:900;color:#be123c;">❌ 본 제안서 청구 미해당 (0원)</span>
                <span style="font-size:11px;color:var(--text-2);">시행 수술(${esc(surgeries.map(s=>s.name).join(', ')||'수술')})에 해당하는 일반 수술 담보(1~5종·질병수술) 미가입</span>
              </div>
              <span style="font-size:12.5px;font-weight:900;color:#e11d48;background:var(--surface);border:1.5px solid #e11d48;padding:4px 10px;border-radius:8px;white-space:nowrap;flex-shrink:0;">청구 미해당</span>
            </div>

            <!-- 2. 어디서 청구 가능한지 (정상 청구 가능한 기가입 담보 안내) -->
            <div style="padding:12px 14px;background:rgba(37,99,235,0.05);border:1.5px solid rgba(37,99,235,0.3);border-radius:10px;display:flex;flex-direction:column;gap:6px;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:12px;font-weight:800;color:#2563eb;">💡 실제 청구 가능한 기가입 보험 및 담보처:</span>
                <span style="font-size:11px;font-weight:850;color:#2563eb;background:var(--surface);border:1px solid #2563eb;padding:2px 7px;border-radius:5px;">종합보험 청구</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--surface);border-radius:6px;font-size:12px;">
                  <span>• <b>1~5종 종수술비</b> (최고 ${topTier || 1}종 해당)</span>
                  <span style="color:#2563eb;font-weight:850;">고객 기가입 종합보험 종수술특약</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--surface);border-radius:6px;font-size:12px;">
                  <span>• <b>기본 질병수술비</b> (절제·절단 충족)</span>
                  <span style="color:#db2777;font-weight:850;">고객 기가입 질병수술비 (정액)</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:var(--surface);border-radius:6px;font-size:12px;">
                  <span>• <b>N대 질병수술비</b> (${isEntSurgery ? '다빈도 호흡기 해당' : '해당 질환군 N대'})</span>
                  <span style="color:#059669;font-weight:850;">고객 기가입 N대 특약 (${isEntSurgery ? '비염·부비동' : 'N대질병'})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 세부 지급 근거 접이식 서랍 토글 버튼 -->
          <button type="button" id="btnToggleOcrDetailsDrawer" style="width:100%;padding:10px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:850;color:var(--text-2);">
            <span>📋 진단서 질병코드 및 수술 내역 확인하기</span>
            <span id="ocrDetailsDrawerArrow" style="font-size:12px;color:var(--brand);font-weight:850;">펼치기 ▾</span>
          </button>

          <!-- 접혀 있는 세부 산출 근거 서랍 -->
          <div id="ocrDetailsDrawer" style="display:none;margin-top:10px;padding-top:10px;border-top:1px dashed var(--border);">
            <div style="font-size:12px;font-weight:850;color:var(--text-2);margin-bottom:6px;">🏥 의무기록에서 확인된 수술 (${surgeries.length}건):</div>
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
              ${surgeries.map(s => `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;background:var(--surface-2);border-radius:8px;font-size:12px;">
                  <span><b>${esc(s.name)}</b> (${esc(s.site)})</span>
                  <span style="font-weight:850;color:#1d4ed8;">${esc(s.tier5)}</span>
                </div>
              `).join('')}
            </div>

            <div style="font-size:12px;font-weight:850;color:var(--text-2);margin-bottom:6px;">🏷️ 진단된 질병코드 (${codes.length}건):</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${codes.map(c => `
                <span style="background:var(--surface);border:1px solid var(--border);padding:3px 8px;border-radius:6px;font-size:11.5px;font-weight:800;color:var(--text);">
                  ${esc(c.code)} ${esc(c.name)}
                </span>
              `).join('')}
            </div>
          </div>
        </div>`;
      }
    } else {
      // 제안서/증권 없이 병원 서류(진단서)만 올린 경우
      html += `
      <div class="card ocr-summary-card" style="background:var(--surface);border:2px solid #1d4ed8;border-radius:16px;padding:18px;margin-bottom:16px;box-shadow:var(--shadow-2);text-align:left;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;border-bottom:1.5px solid rgba(29,78,216,0.2);padding-bottom:12px;flex-wrap:wrap;gap:8px;">
          <div>
            <span style="font-size:11.5px;font-weight:850;color:#1d4ed8;background:rgba(29,78,216,0.1);padding:3px 8px;border-radius:6px;">🏥 병원 진단서 판정 결과</span>
            <h3 style="font-size:18px;font-weight:900;color:var(--text);margin:6px 0 2px;">수술비 지급 기준 종합 판정</h3>
            <div style="font-size:12px;color:var(--text-3);font-weight:700;">증권 미첨부 · 표준 약관 기준 판정 (가입제안서 PDF 함께 업로드 시 실지급금 자동 계산)</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:11.5px;color:var(--text-3);font-weight:750;">판정 기준</div>
            <div style="font-size:20px;font-weight:900;color:#1d4ed8;">최고 ${topTier || 2}종 지급</div>
          </div>
        </div>

        <div style="background:var(--surface-2);border-radius:12px;padding:12px 14px;border:1px solid var(--border);margin-bottom:12px;">
          <div style="font-size:12px;font-weight:850;color:var(--text-2);margin-bottom:8px;">💡 담보별 지급 판정 요약:</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--surface);border:1px solid var(--line);border-radius:8px;font-size:12.5px;">
              <span><b>1~5종 종수술비</b></span>
              <span style="font-weight:850;color:#1d4ed8;">최고 ${topTier || 2}종 1회 (동시수술 최고 등급 인정)</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--surface);border:1px solid var(--line);border-radius:8px;font-size:12.5px;">
              <span><b>기본 질병수술비</b></span>
              <span style="font-weight:850;color:#db2777;">1회 정상 지급 (절제·절단 요건 충족)</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--surface);border:1px solid var(--line);border-radius:8px;font-size:12.5px;">
              <span><b>N대 질병수술비</b></span>
              <span style="font-weight:850;color:#059669;">다빈도 호흡기 N대 해당</span>
            </div>
          </div>
        </div>

        <!-- 세부 지급 근거 접이식 서랍 토글 버튼 -->
        <button type="button" id="btnToggleOcrDetailsDrawer" style="width:100%;padding:10px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;font-size:12.5px;font-weight:850;color:var(--text-2);">
          <span>📋 세부 산출 근거 및 시행 수술 내역 확인하기</span>
          <span id="ocrDetailsDrawerArrow" style="font-size:12px;color:var(--brand);font-weight:850;">펼치기 ▾</span>
        </button>

        <!-- 접혀 있는 세부 산출 근거 서랍 -->
        <div id="ocrDetailsDrawer" style="display:none;margin-top:10px;padding-top:10px;border-top:1px dashed var(--border);">
          ${isSameSite ? `
          <div style="background:rgba(234,88,12,0.08);border:1px solid rgba(234,88,12,0.25);border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:12px;line-height:1.5;">
            <span style="font-weight:850;color:#ea580c;">⚠️ 동시수술 지급 제한 규정:</span><br>
            수술 ${surgeries.length}건이 모두 [${esc(siteName)}] 동일 신체부위에 해당하므로 최고 등급(${topTier}종) 1회만 지급됩니다.
          </div>` : ''}

          <div style="font-size:12px;font-weight:850;color:var(--text-2);margin-bottom:6px;">🏥 의무기록에서 확인된 수술 (${surgeries.length}건):</div>
          <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
            ${surgeries.map(s => `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 10px;background:var(--surface-2);border-radius:8px;font-size:12px;">
                <span><b>${esc(s.name)}</b> (${esc(s.site)})</span>
                <span style="font-weight:850;color:#1d4ed8;">${esc(s.tier5)}</span>
              </div>
            `).join('')}
          </div>

          <div style="font-size:12px;font-weight:850;color:var(--text-2);margin-bottom:6px;">🏷️ 진단된 질병코드 (${codes.length}건):</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${codes.map(c => `
              <span style="background:var(--surface);border:1px solid var(--border);padding:3px 8px;border-radius:6px;font-size:11.5px;font-weight:800;color:var(--text);">
                ${esc(c.code)} ${esc(c.name)}
              </span>
            `).join('')}
          </div>
        </div>
      </div>`;
    }

    resultCard.innerHTML = html;
    previewBox.style.display = 'block';

    // 서랍 토글 바인딩
    const btnToggleDrawer = $('#btnToggleOcrDetailsDrawer');
    const drawerEl = $('#ocrDetailsDrawer');
    const arrowEl = $('#ocrDetailsDrawerArrow');
    if (btnToggleDrawer && drawerEl) {
      btnToggleDrawer.addEventListener('click', () => {
        const isHidden = drawerEl.style.display === 'none' || !drawerEl.style.display;
        drawerEl.style.display = isHidden ? 'block' : 'none';
        if (arrowEl) arrowEl.textContent = isHidden ? '접기 ▴' : '펼치기 ▾';
      });
    }

    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
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
            $('#q-ndai').value = jq;
            $('#clearBtn-ndai').hidden = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
  // 연관 질환 가로 배너 아코디언 토글 바인딩
  $$('.btn-toggle-sub-disease', box).forEach(bar => {
    bar.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = bar.closest('.sub-disease-item');
      const drawer = parent ? parent.querySelector('.sub-disease-drawer') : null;
      const arrow = bar.querySelector('.sub-disease-arrow');
      if (!drawer) return;
      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      drawer.style.display = isHidden ? 'block' : 'none';
      if (arrow) arrow.textContent = isHidden ? '접기 ▴' : '펼쳐보기 ▾';
    });
  });

  // 구 1~3종 수술특약 상세 서랍 토글 바인딩
  $$('.btn-toggle-tier3', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = btn.closest('.tier3-wrapper');
      const drawer = wrapper ? wrapper.querySelector('.tier3-drawer') : null;
      const arrow = btn.querySelector('.tier3-arrow');
      if (!drawer) return;
      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      drawer.style.display = isHidden ? 'block' : 'none';
      if (arrow) arrow.textContent = isHidden ? '접기 ▴' : '펼쳐보기 ▾';
    });
  });

  // 세부 수술코드(EDI) 분류표 대조 서랍 토글 바인딩
  $$('.btn-toggle-edi-drawer', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = btn.closest('.edi-match-wrapper');
      const drawer = wrapper ? wrapper.querySelector('.edi-match-drawer') : null;
      const arrow = btn.querySelector('.edi-drawer-arrow');
      if (!drawer) return;
      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      drawer.style.display = isHidden ? 'flex' : 'none';
      if (arrow) arrow.textContent = isHidden ? '접기 ▴' : '펼쳐보기 ▾';
    });
  });

  // 약관 개정/하향 안내 서랍 토글 바인딩 (대장용종 2종→1종 등)
  $$('.btn-toggle-quick-rev', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrapper = btn.closest('.quick-rev-wrapper');
      const drawer = wrapper ? wrapper.querySelector('.quick-rev-drawer') : null;
      const arrow = btn.querySelector('.qrev-arrow');
      if (!drawer) return;
      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      drawer.style.display = isHidden ? 'block' : 'none';
      if (arrow) arrow.textContent = isHidden ? '접기 ▴' : '펼쳐보기 ▾';
    });
  });

  // 세부 근거 아코디언 토글
  $$('.card-toggle', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const gi = card.dataset.gi;
      const isOpen = card.classList.toggle('open');
      const span = btn.querySelector('span');
      if (span) span.textContent = isOpen ? '지급기준근거 ∧' : '지급기준근거 ∨';

      if (isOpen) {
        const pad = $('.cb-pad', card);
        if (!pad.dataset.loaded) {
          pad.innerHTML = detailBodyHTML(gi);
          pad.dataset.loaded = '1';
        }
      }
    });
  });

  // 비해당 판정 고객 안내문 복사
  $$('.btn-copy-proc', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = btn.dataset.copy;
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          const orig = btn.textContent;
          btn.textContent = '복사 완료! ✓';
          btn.style.background = '#059669';
          setTimeout(() => { btn.textContent = orig; btn.style.background = 'var(--brand)'; }, 1500);
        });
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

  // 질병수술비 요약 인라인 토글
  $$('.btn-toggle-basic-surg', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const drawer = card ? $('.basic-surg-drawer', card) : null;
      if (!drawer) return;
      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      drawer.style.display = isHidden ? 'block' : 'none';
      const label = $('span', btn);
      if (label) {
        label.textContent = isHidden ? '💡 질병수술비 가능여부 ▴' : '💡 질병수술비 가능여부 ▾';
      }
    });
  });

  // 종수술비 행 클릭 시 구 1~3종 서랍 토글 바인딩
  $$('.btn-toggle-quick-tier', box).forEach(row => {
    row.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = row.closest('.quick-3verdict-box') || row.parentElement;
      const drawer = parent ? parent.querySelector('.quick-tier3-drawer') : null;
      const arrow = row.querySelector('.qtier-arrow');
      if (!drawer) return;
      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      drawer.style.display = isHidden ? 'flex' : 'none';
      if (arrow) arrow.textContent = isHidden ? '1-3종 수술확인 ▴' : '1-3종 수술확인 ▾';
    });
  });

  // N대질병 행 클릭 시 회사별 N대 상세 서랍 토글 바인딩 (우측 뱃지 화살표 토글)
  $$('.btn-toggle-quick-ndai', box).forEach(row => {
    row.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = row.closest('.quick-3verdict-box') || row.parentElement;
      const drawer = parent ? parent.querySelector('.quick-ndai-drawer') : null;
      const badge = row.querySelector('.qndai-arrow-badge');
      if (!drawer) return;
      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      drawer.style.display = isHidden ? 'block' : 'none';
      if (badge) {
        const base = badge.textContent.replace(/[▾▴\s]+$/, '').trim();
        badge.textContent = isHidden ? `${base} ▴` : `${base} ▾`;
      }
    });
  });

  // 전역 바로가기 이벤트 위임 (빠른검색/N대 어디서든 종수술비 및 N대로 100% 확실 점프)
  if (!window._jumpDelegated) {
    window._jumpDelegated = true;
    document.addEventListener('click', (e) => {
      const btnTier = e.target.closest('.btn-jump-tier');
      if (btnTier) {
        e.preventDefault();
        e.stopPropagation();
        const q = btnTier.dataset.q || btnTier.getAttribute('data-q') || '';
        if (q) switchTab('tier', q);
        return;
      }
      const btnNdai = e.target.closest('.btn-jump-ndai');
      if (btnNdai) {
        e.preventDefault();
        e.stopPropagation();
        const q = btnNdai.dataset.q || btnNdai.getAttribute('data-q') || '';
        if (q) switchTab('ndai', q);
        return;
      }
    });
  }

  // 보험사별 N대 그룹 아코디언 토글 바인딩
  $$('.btn-toggle-co-group', box).forEach(bar => {
    bar.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = bar.closest('.ndai-co-group-block');
      const drawer = parent ? parent.querySelector('.co-group-drawer') : null;
      const arrow = bar.querySelector('.co-group-arrow');
      if (!drawer) return;
      const isHidden = drawer.style.display === 'none' || !drawer.style.display;
      drawer.style.display = isHidden ? 'flex' : 'none';
      if (arrow) arrow.textContent = isHidden ? '접기 ▴' : '펼쳐보기 ▾';
    });
  });

  // N대 서랍 내부 [질병코드 보기 ▾] 서랍 이벤트 바인딩
  bindNdaiCodeExpand(box);

  // 빠른검색 카드에서 정밀진단으로 즉시 점프
  $$('.btn-jump-tier', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const q = btn.dataset.q || btn.getAttribute('data-q') || '';
      switchTab('tier', q);
    });
  });

  $$('.btn-jump-ndai', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const q = btn.dataset.q || btn.getAttribute('data-q') || '';
      switchTab('ndai', q);
    });
  });
}


/* ───────────────────────── 5대 손보사 약관 원문 세부 규정 (보상제외·수술정의) ───────────────────────── */
const COMPANY_RULES_DETAIL = {
  eswl: {
    title: '체외충격파쇄석술 (ESWL) 전 보험사(손보13개사·생보18개사) 약관 원문 규정',
    items: [
      {
        co: '생명보험 18개사 전사 (삼성·한화·교보·신한·KB라이프 등)',
        std: '1~5종 종수술비 제37항 [2종 전사 지급]',
        quote: '• 생명보험 표준 1~5종 수술분류표 제37항: [체외충격파쇄석술(E.S.W.L)] 2종 전사 공통 지급\n(수술개시일부터 60일 이내 2회 이상의 수술은 1회 수술로 간주하여 지급)'
      },
      {
        co: '현대해상',
        std: '정액 부지급 / 종수술비 2종 (과거 일반형 1종)',
        quote: '• 정액 질병수술보장특약 제3조 ⑤항 7호: [제1항~제3항에 해당하지 않는 시술(체외 충격파 쇄석술 등)은 제외]\n• 1-5종수술Ⅳ/질병수술Ⅱ 별표: [제85항 체외충격파쇄석술 2종] (*체외충격파치료술 ESWT는 제외, 과거 일반형 1~5종은 1종)'
      },
      {
        co: '삼성화재',
        std: '정액 부지급 / 종수술비 2종',
        quote: '• 질병수술비 제3조 7호: [기타 수술 정의에 해당하지 않는 시술 (체외 충격파 쇄석술 등)] 명시적 제외\n• 1~5종 수술분류표: [제87항 체외충격파쇄석술 2종] (60일 이내 1회 한)'
      },
      {
        co: 'KB손해보험',
        std: '정액 부지급 / 종수술비 2종',
        quote: '• 질병수술비 제3조: [체외 충격파 쇄석술 및 변연절제 동반치 않은 단순 창상봉합술 등 제외]\n• 1~5종 수술분류표: [제87항 체외충격파쇄석술 2종] 지급'
      },
      {
        co: 'DB손해보험',
        std: '정액 질병수술비 지급 가능 / 종수술비 2종',
        quote: '• 질병수술비 약관: 수술 정의 예시에 쇄석술 제외 문구 없음 (단, 1년 내 동일질병 1회 등 지급 규정 확인)\n• 1~5종 수술분류표: [제87항 체외충격파쇄석술 2종] 지급'
      },
      {
        co: '메리츠화재',
        std: '정액 수술정의 확인 / 종수술비 2종',
        quote: '• 1-5종 수술분류표Ⅱ 제87항: [체외충격파쇄석술(E.S.W.L) 2종] (60일 내 1회 간주) *체외충격파치료술(E.S.W.T)은 제외'
      },
      {
        co: '한화·흥국·롯데·농협·하나·예별 등 기타 손보사',
        std: '종수술비 2종 / 정액 수술정의 확인',
        quote: '• 1~5종 수술분류표 제87항 체외충격파쇄석술 2종 표준 준용\n• 기본 질병수술비는 약관별 수술 정의 제외 예시(쇄석술 명시 여부) 증권 확인 필요'
      }
    ]
  },
  hemorrhoid_incontinence: {
    title: '치핵·요실금 회사별 질병수술비 보상제외 vs 종수술비 규정',
    items: [
      {
        co: '손보사 공통 (기본 질병수술비)',
        std: '정액 기본수술비 전사 면책',
        quote: '• 제4조(보상하지 않는 손해): [한국표준질병사인분류상 직장 또는 항문질환(K60~K62, K64) 및 비뇨기계 기능장애(요실금 N39.3, N39.4, R32)는 보상하지 아니합니다.]\n※ 치핵/요실금 포함 전용 특약 가입 증권만 정액 지급'
      },
      {
        co: '손보사 공통 (1~5종 종수술비)',
        std: '1~5종 종수술비 전사 1종 지급',
        quote: '• 1~5종 수술분류표 제53항: [치핵, 치열, 치루 근치수술] → 1종 지급\n• 1~5종 수술분류표 제55항: [요실금 수술 (TOT, TVT 등 경질적 테이프 고정술)] → 1종 지급'
      },
      {
        co: '현대해상 (특약별 유의)',
        std: '일반형(제외) vs 질병수술Ⅱ(1종)',
        quote: '• 과거 일반형 1~5종: 치핵 및 제왕절개 보장 제외 조항 존재\n• 회당지급형 및 질병수술Ⅱ: 치핵 1종, 요실금 1종 정상 보장'
      }
    ]
  },
  csection: {
    title: '제왕절개 (O82) 질병수술비 면책 vs 종수술비 1종 규정',
    items: [
      {
        co: '기본 질병수술비 (손보 공통)',
        std: '정액 질병수술비 면책 (부지급)',
        quote: '• 제4조(보상하지 않는 손해): [임신, 출산(제왕절개를 포함합니다), 산후기로 수술한 경우 보상하지 않습니다.] (O코드 면책)'
      },
      {
        co: '1~5종 종수술비 (생·손보 공통)',
        std: '1~5종 수술비 제54항 1종 지급',
        quote: '• 1~5종 수술분류표 제54항: [제왕절개만출술(Cesarean Section)] → 1종 지급\n※ 단, 현대해상 과거 일반형 등 일부 옛날 특약은 제왕절개 제외 조항 확인 필요'
      },
      {
        co: '실손의료비 (전 세대 공통)',
        std: '실손의료비 전사 면책',
        quote: '• 표준약관상 임신·출산(O00~O99) 및 제왕절개 수술비·입원비 전액 면책 (단, 질병치료 목적 임신 합병증 일부 세대 검토)'
      }
    ]
  },
  cataract: {
    title: '백내장 (H25/H26) 인공수정체삽입술 회사별·특약별 규정',
    items: [
      {
        co: '1~5종 종수술비 (전 보험사 공통)',
        std: '다초점·단초점 무관 1종 정상 지급',
        quote: '• 1~5종 수술분류표 제71항: [백내장(白內障), 수정체(水晶體) 관혈수술] → 1종 지급\n※ 렌즈가 다초점인지 단초점인지 여부와 상관없이 1종 수술비 정상 지급'
      },
      {
        co: '삼성화재 / KB손보 (정액 수술비)',
        std: '특약명 확인 필수 (백내장 제외형 주의)',
        quote: '• 삼성화재 질병수술비Ⅳ: [수정체의 장애(H25~H28)] 보상 제외\n• KB손해보험: [질병수술비(백내장제외)] 특약 분리 운영 → 가입 특약명 증권 확인 필수'
      },
      {
        co: '실손의료비 (2016.01 개정)',
        std: '비급여 다초점 렌즈비 제외',
        quote: '• 2016년 1월 이후 가입 실손: 안경·콘택트렌즈 대체 비급여 인공수정체 재료대 보상 제외 (급여 단초점 기준만 보상)\n• 세극등현미경 검사 백내장 혼탁도 입증 및 대법원 입원 판례 기준 적용'
      }
    ]
  }
};

function getCompanyExclusionsHTML(g) {
  if (!g) return '';
  const codes = g.c || [];
  const name = g.n || '';
  const vs = g.vs || [];

  let matched = null;
  if (codes.some(c => ['N20', 'N21', 'N22', 'N23'].some(t => c.startsWith(t))) || name.includes('결석') || vs.some(v => v.includes('쇄석'))) {
    matched = COMPANY_RULES_DETAIL.eswl;
  } else if (codes.some(c => c.startsWith('K64') || c.startsWith('K60') || c.startsWith('N39.3') || c.startsWith('N39.4')) || name.includes('치핵') || name.includes('요실금')) {
    matched = COMPANY_RULES_DETAIL.hemorrhoid_incontinence;
  } else if (codes.some(c => c.startsWith('O82') || c.startsWith('O80')) || name.includes('제왕절개') || vs.some(v => v.includes('출산') || v.includes('분만'))) {
    matched = COMPANY_RULES_DETAIL.csection;
  } else if (codes.some(c => c.startsWith('H25') || c.startsWith('H26')) || name.includes('백내장') || vs.some(v => v.includes('다초점'))) {
    matched = COMPANY_RULES_DETAIL.cataract;
  }

  if (!matched) return '';

  return `
    <div class="sec" style="margin-top:10px;">
      <div class="sec-title"><span style="color:var(--brand);font-weight:900;">🏛️ ${esc(matched.title)}</span><div class="dotline"></div></div>
      <div style="display:flex;flex-direction:column;gap:7px;">
        ${matched.items.map(it => `
          <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:10px;padding:9px 11px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;flex-wrap:wrap;gap:4px;">
              <span style="font-size:12px;font-weight:900;color:var(--text);">${esc(it.co)}</span>
              <span style="font-size:11px;font-weight:850;color:var(--brand);background:rgba(49,130,246,0.1);padding:2px 6px;border-radius:5px;">${esc(it.std)}</span>
            </div>
            <div style="font-size:11px;color:var(--text-2);line-height:1.45;white-space:pre-line;">${esc(it.quote)}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
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
    ${getCompanyExclusionsHTML(g)}

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
  if (normQ.includes('베나실')) return '하지정맥류 베나실 시술 (복재정맥폐색술)';
  if (normQ.includes('클라리베인')) return '하지정맥류 클라리베인 시술 (기계화학정맥폐색술)';
  if (normQ.includes('하지정맥') || normQ.includes('정맥류')) return '광범위 정맥류 발거술 / 레이저·고주파 폐쇄술';
  if (normQ.includes('하이푸')) return '자궁근종·선근증 하이푸 시술 (고강도초음파집속술)';
  if (normQ.includes('유로리프트')) return '전립선결찰술 (유로리프트 UroLift)';
  if (normQ.includes('비밸브')) return '비밸브재건술 (비중격교정술 동시시행)';
  if (normQ.includes('신경성형술') || normQ.includes('풍선확장')) return '경막외 신경성형술 / 풍선확장술';
  if (normQ.includes('체외충격파') || normQ.includes('쇄석')) return '체외충격파 쇄석술 (ESWL)';
  if (normQ.includes('치조골') || normQ.includes('뼈이식')) return '치조골이식술 (임플란트 골이식술)';
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

      return coBlocks.join('\n');
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
    companyLines = [coBlocks.join('\n')];
  }

  const text = `OOO 고객님께서 가입하신
수술비 보험 안내드립니다.

[${g.n}(${kcdCode}) • ${procName}]

${companyLines.join('\n\n')}

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
  const tr = (state.T && Array.isArray(state.T.rows)) ? state.T.rows.length : 0;
  const trA = (state.T && Array.isArray(state.T.articles)) ? state.T.articles.length : 0;
  $('#pane-about').innerHTML = `
    <div class="page-head"><h2>서비스 안내</h2><p>보험비서 수술비 판별기에 쓰인 데이터와 원칙을 안내합니다.</p></div>

    <div class="panel">
      <h3><span class="sec-dot"></span>탑재 데이터</h3>
      <p>· 질병·수술 분류 <b>${s.toLocaleString()}건</b> — ${r}개 원수사 N대 질병수술비 특별약관의 질병코드·담보 구성<br>
         · 심평원 EDI 수술 수가코드 <b>${e.toLocaleString()}건</b> — 진료비 세부산정내역서 수술코드 완벽 매칭<br>
         · 3종·5종 수술특약 표준 분류표 <b>${tr.toLocaleString()}건</b> (${trA}개 부위) — 부위별 EDI 수술코드 3종·5종 지급 등급 즉시 판정<br>
         · 손해보험 13개사 & 생명보험 18개사 전사 지원</p>
    </div>

    <div class="panel">
      <h3><span class="sec-dot"></span>판정 원칙</h3>
      <p>· 1~5종 종수술비 : 2006년 이전(구 1~3종), 2006~2019년(표준 1~5종), 2020년 이후(손보 개정 1종) 약관 세대별 자동 판정<br>
         · N대 질병수술비 : 123대, 116대, 112대, 101대 등 회사별 특약에서 몇 대 질병에 속하는지 명확한 결과값 제공<br>
         · 질병코드 범위 매칭 : 'N20~N25'와 같은 약관 범위에 대해 'N23' 검색 시 자동 인식</p>
    </div>`;
}

/* ───────────────────────── N대 특약 질병코드 인터랙티브 서랍 바인딩 ───────────────────────── */
function bindNdaiCodeExpand(container) {
  if (!container) return;
  container.querySelectorAll('.btn-expand-ndai-codes').forEach(btn => {
    if (btn._ndaiCodeBound) return;
    btn._ndaiCodeBound = true;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const ri = parseInt(btn.dataset.ri, 10);
      const si = parseInt(btn.dataset.si, 10);
      const co = btn.dataset.co || '';
      const sub = btn.dataset.sub || '';
      const block = btn.closest('.ndai-item-block');
      if (!block) return;
      const drawer = block.querySelector('.ndai-codes-drawer');
      if (!drawer) return;
      const arrow = btn.querySelector('.nir-arrow');

      const isOpen = drawer.style.display === 'block';
      if (isOpen) {
        drawer.style.display = 'none';
        if (arrow) arrow.textContent = '질병코드 보기 ▾';
        return;
      }

      // targetKey 질병 검색
      const targetKey = ri + '.' + si;
      let matchedG = (state.D?.g || []).filter(g => g.m && g.m.includes(targetKey));

      // 현재 카드 질병 및 검색어 확인 (포인트 하이라이트용)
      const card = btn.closest('.card');
      const cardGi = card ? parseInt(card.dataset.gi, 10) : null;
      const cardG = (cardGi !== null && !isNaN(cardGi)) ? state.D?.g?.[cardGi] : null;

      const qInput = $('#q-ndai') || $('#q-quick') || $('#q-tier');
      const curQ = (qInput?.value || '').trim().toLowerCase();

      function isItemMatch(item) {
        if (!item) return false;
        if (cardG) {
          if (item.n === cardG.n) return true;
          if (item.c && cardG.c && item.c.some(c => cardG.c.includes(c))) return true;
        }
        if (curQ) {
          if (item.c && item.c.some(c => c.toLowerCase().includes(curQ))) return true;
          if (item.n && item.n.toLowerCase().includes(curQ)) return true;
        }
        return false;
      }

      // 일치하는 항목을 서랍 최상단으로 우선 정렬
      matchedG.sort((a, b) => {
        const aM = isItemMatch(a) ? 1 : 0;
        const bM = isItemMatch(b) ? 1 : 0;
        return bM - aM;
      });

      let drawerHTML = '';
      if (!matchedG.length) {
        drawerHTML = `<div style="padding:8px 10px;font-size:11.5px;color:var(--text-3);background:var(--surface);border-radius:8px;">해당 담보의 질병코드 데이터 로딩 중</div>`;
      } else {
        drawerHTML = `
          <div class="ncd-box">
            <div class="ncd-head">
              <span class="ncd-title">📋 <b>[${esc(co)}] ${esc(sub)}</b> 수록 질병코드 (${matchedG.length}개):</span>
              <button type="button" class="ncd-close-btn">접기 ∧</button>
            </div>
            <div class="ncd-grid">
              ${matchedG.map(item => {
                const isM = isItemMatch(item);
                return `
                <div class="ncd-item ${isM ? 'is-match' : ''}" data-q="${esc(item.n)}">
                  <span class="kcd-badge-sm">${item.c && item.c[0] ? esc(item.c[0]) : 'KCD'}</span>
                  <span class="ncd-name" title="${esc(item.n)}">${esc(item.n)}</span>
                  ${isM ? '<span class="ncd-match-tag">🎯 검색일치</span>' : ''}
                </div>`;
              }).join('')}
            </div>
          </div>`;
      }

      drawer.innerHTML = drawerHTML;
      drawer.style.display = 'block';
      if (arrow) arrow.textContent = '질병코드 닫기 ▴';

      const closeBtn = drawer.querySelector('.ncd-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          drawer.style.display = 'none';
          if (arrow) arrow.textContent = '질병코드 보기 ▾';
        });
      }

      drawer.querySelectorAll('.ncd-item').forEach(itemEl => {
        itemEl.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const qName = itemEl.dataset.q;
          const qInput = $('#q-ndai');
          if (qInput) {
            qInput.value = qName;
            $('#clearBtn-ndai').hidden = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            runNdaiSearch(qName);
          }
        });
      });
    });
  });
}

/* ───────────────────────── 5. 동시수술 4대 약관 타입별 판정 ───────────────────────── */
function bindRulesTab() {
  // 약관 펼쳐보기 버튼 토글
  $$('.btn-toggle-clause').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const targetEl = $(`#${targetId}`);
      const arrow = btn.querySelector('.toggle-arrow');
      if (targetEl) {
        const isOpen = targetEl.classList.toggle('open');
        if (arrow) arrow.textContent = isOpen ? '▴' : '▾';
      }
    });
  });

  // 이미지 모달 뷰어 (소식지 260-surgery 스타일 고해상도 라이트박스)
  const modal = $('#rulesModal');
  const modalImg = $('#rulesModalImg');
  const modalClose = $('#btnRulesModalClose');
  const modalTitle = $('#rulesModalTitle');
  const modalQuote = $('#rulesModalQuote');

  let rulesModalPages = [];
  let rulesModalCurIndex = 0;
  let isRulesZoomed = false;
  // 모바일은 기본 연속 세로 스크롤, PC는 단일 페이지 넘김 (#32200 #32201)
  let rulesViewMode = 'continuous';

  const renderRulesModalPages = () => {
    const stack = $('#rulesModalPagesStack');
    const singleImg = $('#rulesModalImg');
    const paging = $('#rulesModalPaging');

    if (singleImg) {
      singleImg.style.display = 'none';
      singleImg.removeAttribute('src');
    }

    if (stack) {
      stack.style.display = 'flex';
      stack.style.flexDirection = 'column';
      stack.style.gap = '20px';
      stack.style.width = '100%';
      stack.innerHTML = rulesModalPages.map((p, idx) => `
        <div class="rules-page-item" id="rulesPageItem_${idx}" style="width:100%;text-align:center;">
          <div style="display:inline-block;margin-bottom:10px;padding:4px 14px;border-radius:7px;background:rgba(49,130,246,0.18);color:#93c5fd;font-size:12px;font-weight:900;border:1px solid rgba(49,130,246,0.35);">
            📄 제 ${idx + 1} 쪽 / 총 ${rulesModalPages.length} 쪽
          </div>
          <div class="rules-page-img-wrap" style="width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:6px;">
            <img src="${p}" alt="약관 ${idx + 1}쪽" class="rules-page-img" style="width:100%;min-width:680px;height:auto;border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,0.45);display:block;margin:0 auto;">
          </div>
        </div>
      `).join('');
    }
    if (paging) paging.style.display = 'none';
  };

  const updateRulesModalPage = () => {
    if (!rulesModalPages.length) return;
    const indicator = $('#rulesModalPageIndicator');
    if (indicator) indicator.textContent = `${rulesModalCurIndex + 1} / ${rulesModalPages.length} 쪽`;
    const btnPrev = $('#btnRulesPrevPage');
    const btnNext = $('#btnRulesNextPage');
    if (btnPrev) btnPrev.style.opacity = rulesModalCurIndex === 0 ? '0.4' : '1';
    if (btnNext) btnNext.style.opacity = rulesModalCurIndex === rulesModalPages.length - 1 ? '0.4' : '1';

    if (rulesViewMode === 'continuous' && rulesModalPages.length > 1) {
      const targetItem = document.getElementById(`rulesPageItem_${rulesModalCurIndex}`);
      if (targetItem) {
        targetItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      if (modalImg) modalImg.src = rulesModalPages[rulesModalCurIndex];
    }
  };

  const openModal = (src, title, quote, pages = null, meta = null) => {
    if (!modal) return;
    if (!src && (!pages || !pages.length)) {
      alert("🏢 [약관 원문 안내]\n\n해당 보험사 공시실 공식 실물 약관 원문 수집·검증 진행 중입니다.\n\n타사 약관 인용이나 임의 합성 이미지는 일절 제공하지 않으며, 각 보험사 공시실에서 검증된 원본 페이지만 순차적으로 정확하게 반영됩니다.");
      return;
    }
    isRulesZoomed = false;
    const zoomBtn = $('#btnRulesZoomToggle');
    if (zoomBtn) zoomBtn.textContent = '🔍 원본 100% 확대';

    if (modalImg) {
      modalImg.style.width = '100%';
      modalImg.style.maxWidth = '100%';
      modalImg.style.cursor = 'zoom-in';
    }

    if (pages && Array.isArray(pages) && pages.length > 0) {
      rulesModalPages = pages;
    } else {
      rulesModalPages = [src];
    }
    rulesModalCurIndex = 0;

    const ctrl = $('#rulesModalControls');
    if (ctrl) ctrl.style.display = 'flex';

    renderRulesModalPages();
    updateRulesModalPage();

    if (modalTitle) modalTitle.textContent = title || '📋 약관 원문 전체 보기';
    if (modalQuote) modalQuote.style.display = 'none';

    // 메타데이터 바 (공식 상품명, 표준체/유병자 구분, 공시실 쪽수) (#31022 #31049)
    const metaBar = $('#rulesModalMetaBar');
    if (meta && (meta.product || meta.type || meta.page)) {
      if (metaBar) {
        metaBar.style.display = 'flex';
        const typeEl = $('#rulesModalMetaType');
        const prodEl = $('#rulesModalMetaProduct');
        const pageEl = $('#rulesModalMetaPage');
        if (typeEl) {
          typeEl.textContent = meta.type || '표준체 (건강체)';
          typeEl.style.display = meta.type ? 'inline-block' : 'none';
          if (meta.type && meta.type.includes('유병자')) {
            typeEl.style.background = '#fef3c7';
            typeEl.style.color = '#b45309';
          } else {
            typeEl.style.background = '#e0f2fe';
            typeEl.style.color = '#0284c7';
          }
        }
        if (prodEl) {
          prodEl.textContent = meta.product || '';
          prodEl.style.display = meta.product ? 'inline-block' : 'none';
        }
        if (pageEl) {
          pageEl.textContent = meta.page ? `(${meta.page})` : '';
          pageEl.style.display = meta.page ? 'inline-block' : 'none';
        }
      }
    } else {
      if (metaBar) metaBar.style.display = 'none';
    }

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  window.openRulesModal = openModal;

  const btnRulesPrev = $('#btnRulesPrevPage');
  const btnRulesNext = $('#btnRulesNextPage');
  if (btnRulesPrev) {
    btnRulesPrev.addEventListener('click', () => {
      if (rulesModalCurIndex > 0) {
        rulesModalCurIndex--;
        updateRulesModalPage();
      }
    });
  }
  if (btnRulesNext) {
    btnRulesNext.addEventListener('click', () => {
      if (rulesModalCurIndex < rulesModalPages.length - 1) {
        rulesModalCurIndex++;
        updateRulesModalPage();
      }
    });
  }

  // 보기 모드 전환 (연속 세로보기 vs 한 쪽씩 넘기기) (#32200 #32201)
  const btnViewMode = $('#btnRulesViewModeToggle');
  if (btnViewMode) {
    btnViewMode.addEventListener('click', () => {
      rulesViewMode = (rulesViewMode === 'continuous') ? 'single' : 'continuous';
      renderRulesModalPages();
      updateRulesModalPage();
    });
  }

  let rulesZoomLevel = 100;

  const applyRulesZoom = () => {
    const stackImgs = $$('#rulesModalPagesStack img');
    const widthStr = `${rulesZoomLevel}%`;
    const maxWStr = rulesZoomLevel > 100 ? 'none' : '100%';
    const cursorStr = rulesZoomLevel >= 180 ? 'zoom-out' : 'zoom-in';

    if (modalImg) {
      modalImg.style.width = widthStr;
      modalImg.style.maxWidth = maxWStr;
      modalImg.style.cursor = cursorStr;
    }
    stackImgs.forEach(img => {
      img.style.width = widthStr;
      img.style.maxWidth = maxWStr;
      img.style.cursor = cursorStr;
    });
    const zoomReset = $('#btnRulesZoomReset');
    if (zoomReset) zoomReset.textContent = `${rulesZoomLevel}%`;
  };

  const toggleRulesZoom = () => {
    rulesZoomLevel = (rulesZoomLevel === 100) ? 140 : ((rulesZoomLevel === 140) ? 180 : 100);
    applyRulesZoom();
  };

  const zoomInBtn = $('#btnRulesZoomIn');
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      rulesZoomLevel = Math.min(220, rulesZoomLevel + 25);
      applyRulesZoom();
    });
  }
  const zoomOutBtn = $('#btnRulesZoomOut');
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      rulesZoomLevel = Math.max(75, rulesZoomLevel - 25);
      applyRulesZoom();
    });
  }
  const zoomResetBtn = $('#btnRulesZoomReset');
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => {
      rulesZoomLevel = 100;
      applyRulesZoom();
    });
  }
  const zoomBtn = $('#btnRulesZoomToggle');
  if (zoomBtn) {
    zoomBtn.addEventListener('click', toggleRulesZoom);
  }
  if (zoomBtn) zoomBtn.addEventListener('click', toggleRulesZoom);
  if (modalImg) modalImg.addEventListener('click', toggleRulesZoom);

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modalImg) modalImg.src = '';
    if (modalQuote) modalQuote.style.display = 'none';
  };
  window.closeRulesModal = closeModal;

  // 회사 약관 원문 버튼 클릭 시 고해상도 모달 열기 (#31022 #31049 #31091)
  $$('.btn-co-clause').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modalSrc = btn.dataset.modalSrc;
      const co = btn.dataset.co || '보험사';
      const type = btn.dataset.type || '';
      const quote = btn.dataset.quote || '';
      const isPending = btn.dataset.pending === 'true' || !modalSrc;
      const product = btn.dataset.product || '';
      const insType = btn.dataset.insType || '';
      const page = btn.dataset.page || '';
      const pagesStr = btn.dataset.pages;
      const pages = pagesStr ? pagesStr.split(',').filter(Boolean) : (modalSrc ? [modalSrc] : null);

      if (isPending) {
        alert(`🏢 [${co}] 공시실 공식 실물 약관 원문 수집·검증 진행 중입니다.\n\n타사 약관 인용이나 임의 합성 이미지는 일절 제공하지 않으며, 각 보험사 공시실에서 검증된 원본 페이지만 순차적으로 정확하게 반영됩니다.`);
        return;
      }

      const title = `🏢 ${co} 동시수술 약관 ${type ? `[${type}]` : ''}`;
      const meta = { product, type: insType, page };
      openModal(modalSrc, title, quote, pages, meta);
    });
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  const modalBack = $('#btnRulesModalBack');
  const modalFootBack = $('#btnRulesModalFootBack');
  if (modalBack) modalBack.addEventListener('click', closeModal);
  if (modalFootBack) modalFootBack.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('rules-modal-close')) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('show')) closeModal();
  });
}

/* ───────────────────────── 8. 수술비 청구 분쟁사례 ───────────────────────── */
function bindDisputesTab() {
  const chips = $$('#disputesFilterChips .f-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('on'));
      chip.classList.add('on');
      const f = chip.dataset.dfilter;
      renderDisputesList(f);
    });
  });
  renderDisputesList('all');
}

function renderDisputesList(filterKey = 'all') {
  const box = $('#disputesList');
  if (!box) return;

  const allCases = window.DISPUTE_CASES || [];
  let filtered = allCases;
  if (filterKey !== 'all') {
    filtered = allCases.filter(c => c.diseaseGroup === filterKey);
  }

  if (!filtered.length) {
    box.innerHTML = `<div style="text-align:center;padding:30px 20px;color:var(--text-3);font-size:13px;font-weight:700;">해당 질병의 분쟁 사례가 없습니다.</div>`;
    return;
  }

  box.innerHTML = filtered.map(c => {
    const drawerId = `disp-drawer-${c.id}`;
    const arrowId = `disp-arrow-${c.id}`;
    const title = c.surgeryName || c.title || '';
    const claim = (c.summaryClaim || c.disputeCore || '').replace(/^보상과:\s*“?|”?$/g, '');
    const counter = (c.summaryCounter || c.counterCore || '').replace(/^핵심 반박:\s*“?|”?$/g, '');
    const insurerHtml = Array.isArray(c.insurerLogic) ? c.insurerLogic.map(l => '• ' + esc(l)).join('<br>') : esc(c.insurerArg || '');
    const courtHtml = Array.isArray(c.courtLogic) ? c.courtLogic.map(l => '• ' + esc(l)).join('<br><br>') : esc(c.precedent || '');
    const tipsHtml = Array.isArray(c.fieldTips) ? c.fieldTips.map(l => '• ' + esc(l)).join('<br>') : esc(c.docTips || '');
    const kakaoText = c.customerMsg || c.kakaoMsg || '';

    return `
    <div class="dispute-banner-item" style="margin-bottom:10px;border:1.5px solid var(--border);border-radius:14px;background:var(--surface);overflow:hidden;box-shadow:var(--shadow-1);">
      <!-- 1줄 홈 배너형 토글 바 (클릭 시 펼치기) -->
      <button type="button" class="btn-toggle-dispute-banner" onclick="
        const d = document.getElementById('${drawerId}');
        const arr = document.getElementById('${arrowId}');
        if (d.style.display === 'none' || !d.style.display) {
          d.style.display = 'block';
          if (arr) arr.textContent = '접기 ▴';
        } else {
          d.style.display = 'none';
          if (arr) arr.textContent = '펼치기 ▾';
        }
      " style="width:100%;min-height:72px;padding:12px 16px;background:var(--surface);border:0;cursor:pointer;display:flex;align-items:center;justify-content:space-between;text-align:left;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(225,29,72,0.1);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
            ${c.icon || '🛡️'}
          </div>
          <div style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span style="font-size:15px;font-weight:900;color:var(--text);letter-spacing:-.02em;">${esc(title)}</span>
              <span style="font-size:11px;font-weight:850;color:${c.badgeColor};background:${c.badgeBg};padding:2px 7px;border-radius:5px;white-space:nowrap;">${esc(c.badge)}</span>
            </div>
            <div style="font-size:12px;color:var(--text-3);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              <span style="color:#dc2626;">🚫 보상과:</span> ${esc(claim)} · <span style="color:#059669;">✅ 반박:</span> ${esc(counter)}
            </div>
          </div>
        </div>
        <span id="${arrowId}" style="font-size:12px;color:var(--brand);font-weight:850;flex-shrink:0;">펼치기 ▾</span>
      </button>

      <!-- 상세 분쟁 서랍 (기본 display: none) -->
      <div id="${drawerId}" style="display:none;padding:16px;background:var(--surface-2);border-top:1px dashed var(--border);text-align:left;">
        <!-- 1. 보상과 vs 반박 대비 -->
        <div style="display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:12px;">
          <div style="background:rgba(220,38,38,0.06);border:1px solid rgba(220,38,38,0.25);border-radius:10px;padding:10px 12px;">
            <div style="font-size:12px;font-weight:900;color:#dc2626;margin-bottom:4px;">🚫 보험사 보상과 주요 삭감·부지급 주장:</div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.5;">${insurerHtml}</div>
          </div>
          <div style="background:rgba(5,150,105,0.06);border:1px solid rgba(5,150,105,0.25);border-radius:10px;padding:10px 12px;">
            <div style="font-size:12px;font-weight:900;color:#059669;margin-bottom:4px;">✅ 설계사 현장 반박 핵심 근거:</div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.5;">${counter ? '• ' + esc(counter) + '<br>' : ''}• 병변 완전 절제 치료 목적 입증 시 약관상 2종 전액 수령</div>
          </div>
        </div>

        <!-- 2. 금감원 분쟁조정례 / 판례 -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px 13px;margin-bottom:10px;">
          <div style="font-size:12px;font-weight:850;color:#1d4ed8;margin-bottom:4px;">⚖️ 관련 판례 및 금융감독원 분쟁조정례:</div>
          <div style="font-size:12px;color:var(--text-2);line-height:1.5;">${courtHtml}</div>
        </div>

        <!-- 3. 현장 서류 발급 팁 -->
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:11px 13px;margin-bottom:12px;">
          <div style="font-size:12px;font-weight:850;color:#d97706;margin-bottom:4px;">📝 청구 필수 구비서류 및 의사 진단서 발급 팁:</div>
          <div style="font-size:12px;color:var(--text-2);line-height:1.5;">${tipsHtml}</div>
        </div>

        <!-- 4. 고객 안내 카톡 복사 버튼 -->
        <button type="button" class="btn-copy-dispute-kakao f-chip" data-copy-text="${esc(kakaoText)}" style="width:100%;padding:10px 0;background:#fee500;color:#191919;font-weight:850;font-size:12.5px;border:0;border-radius:9px;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 2px 6px rgba(0,0,0,0.08);cursor:pointer;">
          <span style="font-size:14px;">💬</span>
          <span>고객 안내 카톡 복사하기</span>
        </button>
      </div>
    </div>`;
  }).join('');

  // 카톡 복사 이벤트 바인딩
  box.querySelectorAll('.btn-copy-dispute-kakao').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const txt = btn.dataset.copyText;
      if (txt) {
        navigator.clipboard.writeText(txt).then(() => {
          const origHTML = btn.innerHTML;
          btn.innerHTML = '<span>✓ 고객 안내문 복사 완료!</span>';
          btn.style.background = '#059669';
          btn.style.color = '#fff';
          setTimeout(() => {
            btn.innerHTML = origHTML;
            btn.style.background = '#fee500';
            btn.style.color = '#191919';
          }, 1500);
        });
      }
    });
  });
}

/* ───────────────────────── 9. 보험약관 및 별표 수술분류표 ───────────────────────── */
let currentClauseModalData = null;

// N대 질병군별 상세 KCD 질병코드 매핑 사전
const NDAI_DETAILED_ITEMS = {
  '특정 5대질병': [
    { code: 'I60~I69', name: '뇌혈관질환', desc: '지주막하출혈, 뇌내출혈, 뇌경색증, 뇌동맥류, 뇌혈관 기형 등' },
    { code: 'I20~I25', name: '허혈심장질환', desc: '협심증, 급성 심근경색증, 후속 심근경색증 등' },
    { code: 'K70~K76', name: '간질환', desc: '알코올성 간질환, 만성 간염, 간의 섬유증 및 간경변증, 간부전 등' },
    { code: 'K85~K86', name: '췌장질환', desc: '급성 췌장염, 만성 췌장염, 췌장의 낭포 등' },
    { code: 'J40~J47, J84, J96', name: '만성 폐질환', desc: '만성 기관지염, 폐기종, 만성 폐쇄성 폐질환(COPD), 간질성 폐질환' }
  ],
  '중대 10대질병': [
    { code: 'N17~N19', name: '만성 신부전증', desc: '급성 신부전, 만성 신장병, 상세불명의 신부전' },
    { code: 'E10~E14', name: '당뇨병', desc: '인슐린-의존/비의존 당뇨병 및 관련 합병증' },
    { code: 'I10~I15', name: '고혈압성 질환', desc: '본태성(원발성) 고혈압, 고혈압성 심장/신장 질환' },
    { code: 'I70~I79', name: '동맥경화 및 혈관질환', desc: '죽상경화증, 대동맥류 및 박리, 기타 말초혈관질환' },
    { code: 'E00~E07', name: '갑상선질환', desc: '갑상선기능항진증, 갑상선염, 갑상선의 양성신생물' },
    { code: 'H40, H42', name: '녹내장', desc: '원발 녹내장, 기타 녹내장 (실명 위험 중대 안질환)' },
    { code: 'K25~K28', name: '위·십이지장궤양', desc: '위궤양, 십이지장궤양, 소화성 궤양 출혈 및 천공' },
    { code: 'A15~A19', name: '결핵', desc: '호흡기 결핵, 림프절 결핵, 기타 기관의 결핵' }
  ],
  '다빈도 30대질병': [
    { code: 'K80~K83', name: '담석증 및 담낭질환', desc: '담낭결석, 담관결석, 급성·만성 담낭염' },
    { code: 'K35~K37', name: '충수염 (맹장염)', desc: '급성 충수염, 복막염 동반 충수염' },
    { code: 'K40~K46', name: '탈장', desc: '서혜부 탈장, 대퇴 탈장, 제대 탈장, 복벽 탈장' },
    { code: 'K64', name: '치핵 및 항문질환', desc: '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루' },
    { code: 'N20~N23', name: '요로결석증', desc: '신장결석, 요관결석, 방광결석 (체외충격파쇄석술)' },
    { code: 'N40', name: '전립선증식증', desc: '양성 전립선비대증, 배뇨장애 (유로리프트, TURP)' },
    { code: 'J35', name: '만성 편도염', desc: '만성 편도염, 편도의 비대, 아데노이드 증식증' },
    { code: 'H65~H75', name: '중이염 및 유돌염', desc: '화농성 및 삼출성 중이염, 고막 천공' }
  ],
  '부인과 10대질병': [
    { code: 'D25', name: '자궁근종', desc: '점막하 자궁근종, 벽내 자궁근종, 장막하 자궁근종' },
    { code: 'N80', name: '자궁내막증', desc: '자궁 난소의 자궁내막증, 복막 자궁내막증' },
    { code: 'D27, N83', name: '난소낭종 (난소혹)', desc: '난소의 양성 신생물, 여포성 낭종, 황체 낭종' },
    { code: 'N70~N77', name: '골반염', desc: '난관염 및 난소염, 골반복막염, 자궁내막염' },
    { code: 'N84', name: '여성생식기 폴립', desc: '자궁체부 폴립, 자궁경부 폴립' }
  ],
  '생활 40대질병': [
    { code: 'J30~J34', name: '비염 및 부비동염 (축농증)', desc: '알레르기 비염, 비중격만곡증, 만성 부비동염' },
    { code: 'I83', name: '하지정맥류', desc: '정맥류성 궤양, 합병증 동반 하지정맥류 (베나실 등)' },
    { code: 'M15~M19', name: '관절염', desc: '원발성 무릎 관절염, 다발성 관절증' },
    { code: 'M48, M50~M51', name: '척추디스크 및 협착증', desc: '경추간판 장애, 요추간판 장애, 척추관 협착증' },
    { code: 'G51', name: '안면신경마비', desc: '벨마비, 안면신경 장애' }
  ],
  '백내장/안질환': [
    { code: 'H25~H28', name: '노년백내장 및 기타 백내장', desc: '노년 백내장, 수정체 혼탁, 인공수정체 삽입술' }
  ],
  // 생명보험 성인주요질환
  '3대 주요질환': [
    { code: 'C00~C97, D00~D09', name: '악성신생물 (암)', desc: '위암, 대장암, 폐암, 간암, 유방암 및 상피내암' },
    { code: 'I60~I69', name: '뇌혈관질환', desc: '뇌출혈, 뇌경색증, 지주막하출혈' },
    { code: 'I20~I25', name: '심장질환', desc: '협심증, 급성 심근경색증' }
  ],
  '7대 성인병': [
    { code: 'I10~I15', name: '고혈압', desc: '본태성 고혈압, 이차성 고혈압' },
    { code: 'E10~E14', name: '당뇨병', desc: '인슐린 의존/비의존 당뇨병' },
    { code: 'K70~K76', name: '간질환', desc: '만성 간염, 간경화증' },
    { code: 'J40~J47', name: '만성 하기도질환', desc: '만성 기관지염, 천식, COPD' },
    { code: 'N17~N19', name: '신부전', desc: '만성 신부전, 요독증' }
  ],
  '11대 성인병': [
    { code: 'K25~K28', name: '위·십이지장궤양', desc: '위궤양, 십이지장궤양 출혈 및 천공' },
    { code: 'K80~K83', name: '담석증', desc: '담낭결석, 담관염' },
    { code: 'A15~A19', name: '결핵', desc: '호흡기 결핵, 폐결핵' },
    { code: 'A40~A41', name: '패혈증', desc: '연쇄구균 패혈증, 기타 패혈증' }
  ]
};

// 개정 실무 안내 문장 단위 깔끔한 줄바꿈 분리 포매터
function formatNoticeSummaryHTML(text) {
  if (!text) return '';
  const parts = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return `<div style="word-break:keep-all;line-height:1.6;letter-spacing:-0.2px;">${esc(text)}</div>`;
  }
  return `
    <div style="display:flex;flex-direction:column;gap:5px;">
      ${parts.map(p => `
        <div style="display:flex;align-items:flex-start;gap:6px;line-height:1.55;word-break:keep-all;letter-spacing:-0.2px;">
          <span style="color:#b45309;font-weight:900;line-height:1.55;">•</span>
          <span style="flex:1;">${esc(p)}</span>
        </div>
      `).join('')}
    </div>`;
}

function bindClausesTab() {
  const btnAll = $('#btnCatAll');
  const btnNonLife = $('#btnCatNonLife');
  const btnLife = $('#btnCatLife');
  const qInput = $('#q-clause');
  const clearBtn = $('#clearBtn-clause');

  if (!state.clauseCat) state.clauseCat = 'all';

  if (btnAll) {
    btnAll.addEventListener('click', () => {
      state.clauseCat = 'all';
      renderClausesCompanyList(state.clauseQ || '');
    });
  }
  if (btnNonLife) {
    btnNonLife.addEventListener('click', () => {
      state.clauseCat = 'nonLife';
      renderClausesCompanyList(state.clauseQ || '');
    });
  }
  if (btnLife) {
    btnLife.addEventListener('click', () => {
      state.clauseCat = 'life';
      renderClausesCompanyList(state.clauseQ || '');
    });
  }

  // 원터치 예시 칩 터치 시 검색 실행 (#30326)
  $$('.btn-clause-example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const ex = chip.getAttribute('data-example');
      if (qInput && ex) {
        qInput.value = ex;
        qInput.dispatchEvent(new Event('input'));
      }
    });
  });

  if (qInput) {
    qInput.addEventListener('input', () => {
      const val = qInput.value.trim();
      state.clauseQ = val;
      if (clearBtn) clearBtn.hidden = !val;
      renderClausesCompanyList(val);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (qInput) {
        qInput.value = '';
        qInput.focus();
      }
      state.clauseQ = '';
      clearBtn.hidden = true;
      renderClausesCompanyList('');
    });
  }

  // 모달 뷰어 탭 스위처: 사진 vs 텍스트
  const btnModalTabPhoto = $('#btnModalTabPhoto');
  const btnModalTabText = $('#btnModalTabText');
  if (btnModalTabPhoto && btnModalTabText) {
    btnModalTabPhoto.addEventListener('click', () => {
      if (!currentClauseModalData) return;
      currentClauseModalData.activeModalTab = 'photo';
      btnModalTabPhoto.classList.add('active');
      btnModalTabPhoto.style.border = '1.5px solid var(--brand)';
      btnModalTabPhoto.style.background = 'rgba(49,130,246,0.1)';
      btnModalTabPhoto.style.color = 'var(--brand)';

      btnModalTabText.classList.remove('active');
      btnModalTabText.style.border = '1px solid var(--border)';
      btnModalTabText.style.background = 'var(--surface)';
      btnModalTabText.style.color = 'var(--text-2)';

      const searchWrap = $('#clauseModalSearchWrap');
      if (searchWrap) searchWrap.style.display = 'none';

      renderClauseModalContent('', currentClauseModalData);
    });

    btnModalTabText.addEventListener('click', () => {
      if (!currentClauseModalData) return;
      currentClauseModalData.activeModalTab = 'text';
      btnModalTabText.classList.add('active');
      btnModalTabText.style.border = '1.5px solid var(--brand)';
      btnModalTabText.style.background = 'rgba(49,130,246,0.1)';
      btnModalTabText.style.color = 'var(--brand)';

      btnModalTabPhoto.classList.remove('active');
      btnModalTabPhoto.style.border = '1px solid var(--border)';
      btnModalTabPhoto.style.background = 'var(--surface)';
      btnModalTabPhoto.style.color = 'var(--text-2)';

      const searchWrap = $('#clauseModalSearchWrap');
      if (searchWrap) searchWrap.style.display = 'flex';

      const innerSearch = $('#clauseInnerSearch');
      renderClauseModalContent(innerSearch ? innerSearch.value.trim() : '', currentClauseModalData);
    });
  }

  // 모달 닫기 이벤트 바인딩
  const modal = $('#clauseModal');
  const modalClose = $('#btnClauseModalClose');
  const modalBack = $('#btnClauseModalBack');
  const modalFootBack = $('#btnClauseModalFootBack');
  if (modalClose) modalClose.addEventListener('click', closeClauseModal);
  if (modalBack) modalBack.addEventListener('click', closeClauseModal);
  if (modalFootBack) modalFootBack.addEventListener('click', closeClauseModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('rules-modal-close')) closeClauseModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('show')) closeClauseModal();
  });

  // 모달 내부 실시간 검색 바인딩
  const innerSearch = $('#clauseInnerSearch');
  if (innerSearch) {
    innerSearch.addEventListener('input', () => {
      const q = innerSearch.value.trim().toLowerCase();
      filterClauseModalContent(q);
    });
  }

  // 모달 본문 복사 버튼 바인딩
  const copyBtn = $('#btnCopyClauseText');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!currentClauseModalData) return;
      const text = generateClauseCopyText(currentClauseModalData);
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          const origHTML = copyBtn.innerHTML;
          copyBtn.innerHTML = '<span>✓ 약관 복사 완료!</span>';
          copyBtn.style.background = '#059669';
          copyBtn.style.borderColor = '#059669';
          setTimeout(() => {
            copyBtn.innerHTML = origHTML;
            copyBtn.style.background = 'var(--brand)';
            copyBtn.style.borderColor = 'var(--brand)';
          }, 1500);
        });
      }
    });
  }

  renderClausesCompanyList('');
}

function closeClauseModal() {
  const modal = $('#clauseModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentClauseModalData = null;
  const innerSearch = $('#clauseInnerSearch');
  if (innerSearch) innerSearch.value = '';
}
window.closeClauseModal = closeClauseModal;

function parsePeriodYearRange(periodStr) {
  const years = (periodStr.match(/\d{4}/g) || []).map(Number);
  if (periodStr.includes('이전')) {
    return [1990, years[0] || 2020];
  } else if (periodStr.includes('현재') || years.length === 1) {
    return [years[0] || 2024, 2099];
  } else if (years.length >= 2) {
    return [years[0], years[1]];
  }
  return [2000, 2099];
}

function extractSearchedYear(rawQ) {
  // 예: '21년', '18년도', '2021년', '2018', '06년'
  const m1 = rawQ.match(/(\d{2,4})년/);
  if (m1) {
    let y = parseInt(m1[1], 10);
    if (y < 100) y = y <= 35 ? 2000 + y : 1900 + y;
    return y;
  }
  const m2 = rawQ.match(/\b(19\d{2}|20\d{2})\b/);
  if (m2) return parseInt(m2[1], 10);
  return null;
}

function renderClausesCompanyList(searchQuery) {
  const container = $('#clausesCompanyList');
  if (!container) return;

  const inputEl = document.getElementById('clauseCompanySearchInput');
  const rawQ = (searchQuery !== undefined ? searchQuery : (inputEl ? inputEl.value : (state.clauseSearchQuery || ''))).trim();
  const normQ = norm(rawQ);

  const btnAll = $('#btnCatAll');
  const btnNonLife = $('#btnCatNonLife');
  const btnLife = $('#btnCatLife');

  function updateClauseCatButtons(activeAll, activeNonLife, activeLife) {
    const setBtn = (btn, isActive) => {
      if (!btn) return;
      if (isActive) {
        btn.classList.add('active');
        btn.style.border = '2px solid var(--brand)';
        btn.style.background = 'rgba(49,130,246,0.1)';
        btn.style.color = 'var(--brand)';
        btn.style.fontWeight = '900';
      } else {
        btn.classList.remove('active');
        btn.style.border = '1.5px solid var(--border)';
        btn.style.background = 'var(--surface)';
        btn.style.color = 'var(--text-2)';
        btn.style.fontWeight = '750';
      }
    };
    setBtn(btnAll, activeAll);
    setBtn(btnNonLife, activeNonLife);
    setBtn(btnLife, activeLife);
  }

  const nonLifeList = (window.POLICY_CLAUSES_DATA && window.POLICY_CLAUSES_DATA.nonLife) ? window.POLICY_CLAUSES_DATA.nonLife : [];
  const lifeList = (window.POLICY_CLAUSES_DATA && window.POLICY_CLAUSES_DATA.life) ? window.POLICY_CLAUSES_DATA.life : [];

  nonLifeList.forEach(c => { c._cat = 'nonLife'; });
  lifeList.forEach(c => { c._cat = 'life'; });

  const allCompanies = [...nonLifeList, ...lifeList];
  allCompanies.forEach(c => c.periods && c.periods.forEach(p => { p._isYearMatch = false; }));

  let list = [];
  let isUnifiedSearch = false;
  let isNdaiUnsoldPure = false;
  let exactNdaiNum = null;
  let exactNdaiStr = null;
  let matchContext = { 
    riderKey: null, 
    isExclusion: false, 
    isClaimTip: false, 
    isSimplified: false, 
    searchedYear: null,
    searchedNdai: null
  };

  if (normQ) {
    isUnifiedSearch = true;

    // 가입년도 추출
    const detectedYear = extractSearchedYear(rawQ);
    if (detectedYear) {
      matchContext.searchedYear = detectedYear;
    }

    // N대 10단위 및 특정 N대 추출 (예: '60대', '112대', '116대', '119대', '120대' 등 #29473 #29516 #31162 #31176 #31183)
    let tensTarget = null;
    const exactNdaiMatch = rawQ.match(/(\d{2,3})대/);
    const isNdaiPureQuery = /^(\d{2,3})대$/.test(rawQ.replace(/\s+/g, ''));
    exactNdaiNum = exactNdaiMatch ? parseInt(exactNdaiMatch[1], 10) : null;
    exactNdaiStr = exactNdaiMatch ? exactNdaiMatch[0] : null;

    let isExactNdaiSale = false;
    if (exactNdaiStr) {
      matchContext.searchedNdai = exactNdaiStr;
      isExactNdaiSale = allCompanies.some(c => c.ndaiKeywords && c.ndaiKeywords.some(k => norm(k) === norm(exactNdaiStr) || norm(k) === exactNdaiMatch[1]));
      if (exactNdaiMatch[1].endsWith('0') && isExactNdaiSale) {
        tensTarget = exactNdaiNum;
      }
    }

    // 만약 사용자가 '80대', '60대' 등 N대 키워드를 순수 검색했는데 어떤 회사도 정확히 그 N대를 판매하지 않는 경우:
    // tensTarget으로 억지 매칭시키지 않고 판매사 없음 선언 + 근접 N대 추천 직결 버튼 UI 표출! (#31162 #31176 #31183)
    isNdaiUnsoldPure = isNdaiPureQuery && !isExactNdaiSale;

    // 공백/쉼표 분리
    const rawTokens = rawQ.split(/[\s,]+/).filter(Boolean);
    const topicKeywords = ['유병자', '간편', '355', '3.5.5', '3105', '질수', '질병수술', '종수', '종수술', '15종', '1-5종', '상수', '상해수술', '엔대', 'n대', '제외', '면책', '부지급', '보상제외', '청구', '팁', '가이드'];
    const companySearchTokens = [];

    rawTokens.forEach(t => {
      const nt = norm(t);
      if (/^(\d{2,4}년?)$/.test(nt)) return;

      if (nt.includes('유병자') || nt.includes('간편') || nt.includes('355') || nt.includes('3.5.5') || nt.includes('3105')) {
        matchContext.isSimplified = true;
      }
      if (nt.includes('질수') || nt.includes('질병수술')) matchContext.riderKey = 'basic';
      if (nt.includes('종수') || nt.includes('종수술') || nt.includes('15종') || nt.includes('1-5종')) matchContext.riderKey = 'tier';
      if (nt.includes('상수') || nt.includes('상해수술')) matchContext.riderKey = 'injury';
      if (nt.includes('엔대') || nt.includes('n대')) matchContext.riderKey = 'ndai';
      if (nt.includes('제외') || nt.includes('면책') || nt.includes('부지급') || nt.includes('보상제외')) matchContext.isExclusion = true;
      if (nt.includes('청구') || nt.includes('팁') || nt.includes('가이드')) matchContext.isClaimTip = true;

      const isPureTopic = topicKeywords.some(k => norm(k) === nt);
      if (!isPureTopic && (nt.length >= 2 || /^\d+$/.test(nt))) {
        companySearchTokens.push(t);
      }
    });

    const hasSpecificCompanyTokens = companySearchTokens.length > 0;

    // 수술명/질병명 전수 매칭 (#29685 "과하다 싶을 정도로 수술명, 질병명 어떤 것이든 나오게!")
    const isMedicalQuery = rawTokens.some(t => {
      const nt = norm(t);
      if (nt.length < 2) return false;
      if (window.CURATED && window.CURATED.synonyms) {
        if (window.CURATED.synonyms.some(s => s.k.includes(nt) || s.q.some(q => norm(q) === nt || (norm(q).includes(nt) && nt.length >= 2)))) return true;
      }
      if (window.CURATED && window.CURATED.procs) {
        if (Object.keys(window.CURATED.procs).some(k => norm(k) === nt || (norm(k).includes(nt) && nt.length >= 2))) return true;
      }
      return false;
    });

    // 회사별 전수 매칭
    list = allCompanies.filter(co => {
      let isCoMatched = false;
      let isYearMatchedForCo = false;

      // 1) 가입년도 매칭 판정
      if (matchContext.searchedYear) {
        co.periods.forEach(p => {
          const [sy, ey] = parsePeriodYearRange(p.periodStr);
          if (matchContext.searchedYear >= sy && matchContext.searchedYear <= ey) {
            p._isYearMatch = true;
            isYearMatchedForCo = true;
          } else {
            p._isYearMatch = false;
          }
        });
        if (isYearMatchedForCo && !hasSpecificCompanyTokens) {
          isCoMatched = true;
        }
      }

      // 2) N대 특정 및 10단위 범위 매칭 (미판매 순수 검색 시에는 강제 매칭 방지 #31162)
      if (matchContext.searchedNdai && co.ndaiKeywords && !isNdaiUnsoldPure) {
        if (co.ndaiKeywords.some(k => norm(k).includes(norm(matchContext.searchedNdai)))) {
          isCoMatched = true;
        }
      }
      if (tensTarget && co.ndaiKeywords && !isNdaiUnsoldPure) {
        const foundTens = co.ndaiKeywords.some(k => {
          const m = k.match(/(\d+)대?/);
          if (m) {
            const num = parseInt(m[1], 10);
            return num >= tensTarget && num < tensTarget + 10;
          }
          return false;
        });
        if (foundTens) isCoMatched = true;
      }

      // 3) 회사/상품/약어 검색 토큰 매칭
      companySearchTokens.forEach(origToken => {
        const nt = norm(origToken);
        if (!nt) return;

        // 회사명 및 약칭
        if (norm(co.name).includes(nt) || nt.includes(norm(co.name))) isCoMatched = true;
        if (norm(co.shortName).includes(nt) || nt.includes(norm(co.shortName))) isCoMatched = true;
        if (co.aliases && co.aliases.some(a => norm(a).includes(nt) || nt.includes(norm(a)))) isCoMatched = true;

        // 대표 상품명 매칭 (#29052 #29057)
        if (co.products && co.products.some(p => norm(p).includes(nt) || nt.includes(norm(p)))) isCoMatched = true;

        // N대 특약 매칭 (#29006)
        if (co.ndaiKeywords && co.ndaiKeywords.some(k => norm(k).includes(nt) || nt.includes(norm(k)))) isCoMatched = true;

        // 담보 및 수술명 매칭
        const hasRiderMatch = co.periods.some(p => {
          const checkR = (riders) => {
            if (!riders) return false;
            return Object.values(riders).some(r => {
              if (!r) return false;
              if (norm(r.title).includes(nt)) return true;
              if (r.summary && norm(r.summary).includes(nt)) return true;
              if (r.tableBody && Array.isArray(r.tableBody.rows) && r.tableBody.rows.some(row => Array.isArray(row) ? row.some(cell => norm(cell).includes(nt)) : (typeof row === 'string' && norm(row).includes(nt)))) return true;
              return false;
            });
          };
          const stdOk = p.types && p.types.standard && checkR(p.types.standard.riders);
          const simpObj = (p.types && p.types.simplified) || (p.types && p.types.standard && p.types.standard.simplified) || p.simplified;
          return stdOk || (simpObj && checkR(simpObj.riders));
        });

        if (hasRiderMatch) isCoMatched = true;
      });

      // 수술명/질병명 쿼리인 경우 수술보장을 판매하는 주요 회사 전원 포함 (#29685)
      if (isMedicalQuery) {
        return true;
      }

      if (hasSpecificCompanyTokens) {
        return isCoMatched;
      }
      if (matchContext.searchedYear && isYearMatchedForCo) {
        return true;
      }
      if (tensTarget && isCoMatched) {
        return true;
      }
      if (matchContext.riderKey || matchContext.isExclusion || matchContext.isSimplified) {
        return true;
      }

      return isCoMatched;
    });

    // 백업 검색
    if (list.length === 0) {
      list = allCompanies.filter(co => {
        if (norm(co.name).includes(normQ) || norm(co.desc).includes(normQ)) return true;
        if (co.products && co.products.some(p => norm(p).includes(normQ))) return true;
        return false;
      });
    }

    // 검색 결과 목록 기반 지능형 버튼 불빛 연동 (#30314)
    // 캐손 -> 손보만 불빛, 미생 -> 생보만 불빛, 캐손 미생 -> 둘 다 불빛!
    const hasNonLife = list.some(c => c._cat === 'nonLife');
    const hasLife = list.some(c => c._cat === 'life');

    if (hasNonLife && hasLife) {
      updateClauseCatButtons(true, true, true);
    } else if (hasNonLife) {
      updateClauseCatButtons(false, true, false);
    } else if (hasLife) {
      updateClauseCatButtons(false, false, true);
    } else {
      updateClauseCatButtons(true, false, false);
    }
  } else {
    const cat = state.clauseCat || 'all';
    if (cat === 'all') {
      list = allCompanies;
      updateClauseCatButtons(true, false, false);
    } else if (cat === 'nonLife') {
      list = nonLifeList;
      updateClauseCatButtons(false, true, false);
    } else {
      list = lifeList;
      updateClauseCatButtons(false, false, true);
    }
  }

  // 미판매 N대 특약 (80대 등) 전용 권고 UI (#31162 #31176 #31183)
  if (isNdaiUnsoldPure) {
    let closestNdaiStr = '85대 질병수술비';
    let recommendations = [
      { coName: 'DB손해보험', cid: 'dbinsure', pid: 'db_2020_07', ndai: '85대', period: '2020년 7월 ~ 2024년 3월', label: '85대 질병수술비', jump: 'DB 85대' },
      { coName: '메리츠화재', cid: 'meritz', pid: 'meritz_2020_04', ndai: '82대', period: '2020년 4월 ~ 2024년 11월', label: '82대 질병수술비', jump: '멜츠 82대' },
      { coName: '현대해상', cid: 'hyundai', pid: 'hyundai_2018_prior', ndai: '71대', period: '2018년 5월 이전', label: '71대 질병수술비', jump: '현대 71대' },
      { coName: '삼성화재', cid: 'samsungfire', pid: 'samsung_2020_04', ndai: '68대', period: '2020년 4월 ~ 2023년 12월', label: '68대 질병수술비', jump: '삼성 68대' }
    ];

    if (exactNdaiNum <= 65) {
      closestNdaiStr = '64대 질병수술비';
      recommendations = [
        { coName: '메리츠화재', cid: 'meritz', pid: 'meritz_2020_03_prior', ndai: '64대', period: '2020년 3월 이전', label: '64대 질병수술비', jump: '멜츠 64대' },
        { coName: '삼성화재', cid: 'samsungfire', pid: 'samsung_2020_04', ndai: '68대', period: '2020년 4월 ~ 2023년 12월', label: '68대 질병수술비', jump: '삼성 68대' },
        { coName: '현대해상', cid: 'hyundai', pid: 'hyundai_2018_prior', ndai: '71대', period: '2018년 5월 이전', label: '71대 질병수술비', jump: '현대 71대' }
      ];
    } else if (exactNdaiNum >= 125) {
      closestNdaiStr = '124대 질병수술비';
      recommendations = [
        { coName: '현대해상', cid: 'hyundai', pid: 'hyundai_2024_01', ndai: '124대', period: '2024년 1월 ~ 현재', label: '124대 질병수술비', jump: '현대 124대' },
        { coName: '메리츠화재', cid: 'meritz', pid: 'meritz_2024_12', ndai: '131대', period: '2024년 12월 ~ 현재', label: '131대 질병수술비', jump: '멜츠 131대' },
        { coName: 'NH농협손해', cid: 'nhfire', pid: 'nh_2024_01', ndai: '144대', period: '2024년 1월 ~ 현재', label: '144대 질병수술비', jump: '농협 144대' }
      ];
    }

    container.innerHTML = `
      <div style="background:var(--surface);border:2px solid #ef4444;border-radius:14px;padding:20px 18px;margin-top:10px;text-align:left;box-shadow:0 4px 16px rgba(239,68,68,0.1);">
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
          <span style="font-size:26px;line-height:1;">⚠️</span>
          <div>
            <div style="font-size:16px;font-weight:900;color:#dc2626;letter-spacing:-0.2px;">'${esc(exactNdaiStr)}'를 판매하는 보험사는 없습니다</div>
            <div style="font-size:12.5px;color:var(--text-2);margin-top:4px;line-height:1.5;">
              전 보험사 공식 약관 전수 조사 결과, <strong>'${esc(exactNdaiStr)}'</strong>라는 정식 명칭의 질병수술비 특약은 판매된 이력이 없습니다.
            </div>
          </div>
        </div>

        <div style="margin-top:16px;padding-top:16px;border-top:1.5px dashed rgba(239,68,68,0.25);">
          <div style="font-size:14.5px;font-weight:900;color:var(--brand);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
            <span>💡</span>
            <span>혹시 찾으시는 게 ${closestNdaiStr}인가요?</span>
          </div>
          <div style="font-size:12px;color:var(--text-3);margin-bottom:12px;font-weight:700;">
            아래 버튼을 터치하시면 해당 보험사의 정확한 가입시기별 약관 서랍이 즉시 펼쳐집니다:
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;" id="ndaiDirectJumpWrap">
            ${recommendations.map(r => `
              <button type="button" class="btn-ndai-direct-jump" onclick="window.handleNdaiDirectJump(this, event)" data-search="${esc(r.jump)}" data-cid="${r.cid}" data-pid="${r.pid}" data-ndai="${r.ndai}" style="width:100%;padding:12px 14px;border-radius:10px;border:1.5px solid var(--brand);background:rgba(49,130,246,0.06);display:flex;align-items:center;justify-content:space-between;cursor:pointer;text-align:left;transition:all .15s ease;">
                <div>
                  <div style="font-size:13.5px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
                    <span style="color:var(--brand);">🏢</span>
                    <span>${esc(r.coName)}: <strong>${esc(r.label)}</strong></span>
                  </div>
                  <div style="font-size:11.5px;color:var(--text-3);margin-top:3px;font-weight:700;">
                    가입시기: ${esc(r.period)} (약관 원문 직결)
                  </div>
                </div>
                <span style="font-size:12px;font-weight:900;color:#fff;background:var(--brand);padding:6px 11px;border-radius:7px;white-space:nowrap;box-shadow:0 2px 6px rgba(49,130,246,0.25);flex-shrink:0;margin-left:8px;">
                  바로가기 →
                </span>
              </button>
            `).join('')}
          </div>
        </div>

        <div style="margin-top:16px;padding:10px 12px;background:var(--surface-2);border-radius:8px;font-size:11.5px;color:var(--text-3);line-height:1.45;font-weight:700;">
          📌 <strong>대표 N대 검색:</strong> 메리츠·KB(112대), 현대·DB(119대), 현대(124대), 삼성(116대), DB(85대), 메리츠(64대)
        </div>
      </div>
    `;

    bindNdaiDirectJumpEvents(container);
    return;
  }

  // 0건일 때 IMG_4946 스타일 '혹시 찾으시는 게...' 원터치 추천 칩 표출 (#29473)
  if (list.length === 0) {
    const suggestions = generateClauseSuggestions(rawQ);
    container.innerHTML = `
      <div style="background:var(--surface);border:1.5px solid var(--border);border-radius:14px;padding:24px 18px;margin-top:10px;text-align:left;box-shadow:var(--shadow-1);">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
          <span style="font-size:28px;line-height:1;">💡</span>
          <div>
            <div style="font-size:16px;font-weight:900;color:#0f172a;letter-spacing:-0.2px;">"${esc(rawQ)}" 검색 결과가 없습니다</div>
            <div style="font-size:13.5px;font-weight:850;color:var(--brand);margin-top:3px;">혹시 아래 N대 질병수술이나 연관 약관을 찾으시나요?</div>
          </div>
        </div>
        <div style="font-size:12.5px;color:#334155;margin-bottom:14px;line-height:1.45;font-weight:700;">
          오타가 있거나 다른 숫자로 불리는 경우 아래 추천 검색어를 터치하시면 바로 약관이 조회됩니다:
        </div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;" id="clauseSuggestionChips">
          ${suggestions.map(s => `
            <button type="button" class="btn-clause-sugg-chip" data-query="${esc(s.q)}" style="height:44px;border:1.5px solid #93c5fd;border-radius:10px;background:#eff6ff;color:#1e40af;font-size:12.5px;font-weight:850;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 1px 3px rgba(30,64,175,0.08);padding:0 8px;text-align:center;">
              <span>🎯</span>
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(s.label)}</span>
            </button>
          `).join('')}
        </div>
        <div style="margin-top:16px;padding:12px 14px;background:var(--surface-2);border-radius:10px;border:1px solid var(--border);font-size:12px;color:#334155;line-height:1.5;font-weight:700;">
          📌 <strong>검색 팁:</strong> 회사명(메리츠, 현대), N대 특약(116대, 119대, 112대, 64대), 가입년도(21년 멜츠), 수술명(카티스템, 담석, 용종)으로 검색하시면 가장 정확합니다.
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-clause-sugg-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-query');
        const qInput = $('#q-clause');
        if (qInput) {
          qInput.value = q;
          qInput.dispatchEvent(new Event('input'));
        }
      });
    });
    return;
  }

  let html = '';

  if (isUnifiedSearch) {
    html += `
      <div style="background:var(--surface-2);border:1.5px solid var(--brand);border-radius:12px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;box-shadow:0 2px 6px rgba(49,130,246,0.1);">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:15px;">🔍</span>
          <span style="font-size:14px;font-weight:900;color:var(--brand);">'${esc(rawQ)}' 손보·생보 통합 검색 결과</span>
        </div>
        <span style="font-size:12px;font-weight:850;color:#fff;background:var(--brand);padding:3px 9px;border-radius:6px;">
          총 ${list.length}개 보험사 일치
        </span>
      </div>
    `;
  }

  html += list.map(co => {
    // 검색 시에도 기본 펼치지 않고 숨기기(접힘) 상태 유지 (#29458)
    const isAutoOpen = false;

    // 극강의 심플 헤더: TMI 뱃지, 약칭 태그, 손보/생보 라벨, 작은 회색글씨 전면 삭제 (#29547 #29557 #29562 #29574)
    return `
    <div class="clause-co-card" style="background:var(--surface);border:1.5px solid var(--border);border-radius:14px;overflow:hidden;box-shadow:var(--shadow-1);transition:border-color .2s ease;">
      <!-- 회사 헤더: 로고 + 회사명 + 펼쳐보기 ▾ (초간결 심플) -->
      <div class="btn-toggle-co" data-co-id="${co.id}" style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:var(--surface);user-select:none;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
          <div style="width:38px;height:38px;border-radius:10px;background:${co.color || 'var(--brand)'};color:#fff;font-weight:900;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 5px rgba(0,0,0,0.12);">
            ${esc(co.logo || co.name[0])}
          </div>
          <div style="font-size:16px;font-weight:900;color:#0f172a;letter-spacing:-0.2px;white-space:nowrap;">
            ${esc(co.name)}
          </div>
        </div>
        <span class="btn-co-toggle-arrow" style="font-size:12px;font-weight:850;color:var(--brand);background:rgba(49,130,246,0.08);border:1px solid rgba(49,130,246,0.25);border-radius:8px;padding:5px 11px;cursor:pointer;flex-shrink:0;user-select:none;">
          펼쳐보기 ▾
        </span>
      </div>

      <!-- 시기별 아코디언 서랍 (검색 시에도 접힘 상태로 유지 #29458) -->
      <div id="co-periods-${co.id}" class="co-periods-drawer" style="display:${isAutoOpen ? 'flex' : 'none'};padding:12px 14px 14px;border-top:1px solid var(--border);background:var(--surface-2);flex-direction:column;gap:12px;">
        ${co.periods.map(p => renderPeriodBoxHTML(co, p, matchContext)).join('')}
      </div>
    </div>
    `;
  }).join('');

  container.innerHTML = html;

  // 이벤트 바인딩
  container.querySelectorAll('.btn-toggle-co').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const coId = btn.getAttribute('data-co-id');
      const drawer = container.querySelector(`#co-periods-${coId}`);
      const arrowBtn = btn.querySelector('.btn-co-toggle-arrow');
      if (drawer) {
        const isHidden = drawer.style.display === 'none';
        drawer.style.display = isHidden ? 'flex' : 'none';
        if (arrowBtn) arrowBtn.textContent = isHidden ? '접기 ▴' : '펼쳐보기 ▾';
      }
    });
  });

    // N대 특약 탭 전환 바인딩 (#29516)
  container.querySelectorAll('.btn-ndai-tab-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.rider-card-ndai');
      if (!parent) return;
      const opt = btn.getAttribute('data-ndai-opt');
      parent.querySelectorAll('.btn-ndai-tab-select').forEach(b => {
        b.classList.remove('active');
        b.style.border = '1px solid transparent';
        b.style.background = 'transparent';
        b.style.color = '#1e293b';
      });
      btn.classList.add('active');
      btn.style.border = '1.5px solid #059669';
      btn.style.background = '#059669';
      btn.style.color = '#fff';

      parent.setAttribute('data-current-ndai', opt);
      parent.querySelectorAll('.btn-open-clause-modal[data-target-rider="ndai"]').forEach(mb => {
        mb.setAttribute('data-ndai', opt);
      });
      const titleSpan = parent.querySelector('span:first-child');
      if (titleSpan) titleSpan.textContent = `🏢 ${opt} N대 질병수술비 특약`;
    });
  });

  container.querySelectorAll('.btn-toggle-period').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const coId = btn.getAttribute('data-co-id');
      const pid = btn.getAttribute('data-pid');
      const drawer = container.querySelector(`#period-drawer-${coId}-${pid}`);
      const arrowBadge = btn.querySelector('.period-arrow-badge');
      if (drawer) {
        const isHidden = drawer.style.display === 'none';
        drawer.style.display = isHidden ? 'flex' : 'none';
        if (arrowBadge) {
          arrowBadge.textContent = isHidden ? '접기 ▴' : '펼쳐보기 ▾';
          arrowBadge.style.background = isHidden ? 'var(--brand)' : 'var(--surface-2)';
          arrowBadge.style.color = isHidden ? '#fff' : 'var(--brand)';
        }
      }
    });
  });

  container.querySelectorAll('.btn-ptype').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const ptype = btn.getAttribute('data-ptype');
      const parent = btn.closest('.period-drawer-content');
      if (!parent) return;

      parent.querySelectorAll('.btn-ptype').forEach(b => {
        b.classList.remove('active');
        b.style.border = '1px solid var(--border)';
        b.style.background = 'var(--surface)';
        b.style.color = '#334155';
      });
      btn.classList.add('active');
      btn.style.border = '1.5px solid var(--brand)';
      btn.style.background = 'rgba(49,130,246,0.1)';
      btn.style.color = 'var(--brand)';

      const stdBox = parent.querySelector('.riders-std');
      const simpBox = parent.querySelector('.riders-simp');
      if (stdBox && simpBox) {
        if (ptype === 'simplified') {
          stdBox.style.display = 'none';
          simpBox.style.display = 'flex';
        } else {
          stdBox.style.display = 'flex';
          simpBox.style.display = 'none';
        }
      }
    });
  });

  container.querySelectorAll('.btn-open-clause-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cid = btn.getAttribute('data-cid');
      const pid = btn.getAttribute('data-pid');
      const ptype = btn.getAttribute('data-ptype');
      const riderKey = btn.getAttribute('data-target-rider');
      let viewMode = btn.getAttribute('data-view-mode');
      let ndai = btn.getAttribute('data-ndai');
      if (!ndai && riderKey === 'ndai') {
        const parentCard = btn.closest('.rider-card-ndai');
        if (parentCard) ndai = parentCard.getAttribute('data-current-ndai');
      }
      
      if (matchContext.isExclusion && viewMode === 'basic_clause') {
        window.activeClauseTab = 'exclusion';
      }
      openClauseModalFromIds(cid, pid, ptype, riderKey, viewMode, ndai);
    });
  });
}

function renderPeriodBoxHTML(co, p, matchContext = {}) {
  const simpObj = (p.types && p.types.simplified) || (p.types && p.types.standard && p.types.standard.simplified) || p.simplified;
  const stdRiders = p.types && p.types.standard ? p.types.standard.riders : null;
  const hasSimp = !!(simpObj && simpObj.riders) || !!stdRiders;
  const simpRiders = (simpObj && simpObj.riders) ? simpObj.riders : stdRiders;

  // 가입년도 매칭 판정 (#29067 #29068)
  const isYearMatched = !!(matchContext.searchedYear && p._isYearMatch);
  const isDrawerOpen = matchContext.searchedYear ? isYearMatched : (matchContext.autoOpen || false);

  // 유병자/간편 자동 활성화 (#29041 #29042)
  const preferSimp = hasSimp && (matchContext.isSimplified || false);

  return `
  <div class="period-accordion-box" style="background:var(--surface);border:${isYearMatched ? '2px solid #2563eb' : '1.5px solid var(--border)'};border-radius:12px;overflow:hidden;box-shadow:${isYearMatched ? '0 4px 14px rgba(37,99,235,0.18)' : '0 1px 3px rgba(0,0,0,0.02)'};">
    <!-- 가입시기 헤더 버튼 -->
    <div class="btn-toggle-period" data-co-id="${co.id}" data-pid="${p.id}" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:var(--surface);user-select:none;gap:8px;">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0;flex:1;">
        <span style="font-size:14px;font-weight:900;color:var(--text);letter-spacing:-.01em;">📅 ${esc(p.periodStr)}</span>
        ${isYearMatched ? `<span style="font-size:11px;font-weight:900;color:#fff;background:#2563eb;padding:2px 7px;border-radius:5px;">🎯 ${matchContext.searchedYear}년 계약 해당 약관</span>` : ''}
      </div>
      <span class="period-arrow-badge" style="font-size:11px;font-weight:800;color:${isDrawerOpen ? '#fff' : 'var(--brand)'};background:${isDrawerOpen ? 'var(--brand)' : 'var(--surface-2)'};padding:3px 8px;border-radius:6px;border:1px solid var(--border);flex-shrink:0;">
        ${isDrawerOpen ? '접기 ▴' : '펼쳐보기 ▾'}
      </span>
    </div>

    <!-- 가입시기 세부 서랍 -->
    <div id="period-drawer-${co.id}-${p.id}" class="period-drawer-content" style="display:${isDrawerOpen ? 'flex' : 'none'};padding:12px 14px 14px;border-top:1px dashed var(--line);background:var(--surface-2);flex-direction:column;gap:10px;">
      
      <!-- 개정 핵심 실무 안내 박스 -->
      ${p.revSummary ? `
      <div class="rev-summary-card" style="background:#fffbeb;border:1.5px solid #fde68a;border-radius:10px;padding:12px 14px;box-shadow:0 1px 3px rgba(245,158,11,0.06);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(245,158,11,0.25);">
          <div style="display:flex;align-items:center;gap:5px;">
            <span style="font-size:13px;">⚡</span>
            <span style="font-size:12px;font-weight:900;color:#b45309;letter-spacing:-0.2px;">개정 핵심 실무 안내</span>
          </div>
          <span style="font-size:10.5px;font-weight:800;color:#92400e;background:rgba(245,158,11,0.22);padding:2px 7px;border-radius:4px;">실무 핵심</span>
        </div>
        ${p.noticeTitle ? `<div style="font-size:12.5px;font-weight:900;color:#92400e;line-height:1.45;margin-bottom:6px;word-break:keep-all;">📌 ${esc(p.noticeTitle)}</div>` : ''}
        <div style="font-size:12px;color:#78350f;">
          ${formatNoticeSummaryHTML(p.revSummary)}
        </div>
      </div>` : ''}

      <!-- 표준체 / 유병자(간편) 분기 버튼 (50:50 칼맞춤) -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;width:100%;margin-bottom:4px;">
        <button type="button" class="btn-ptype ${!preferSimp ? 'active' : ''}" data-ptype="standard" style="height:38px;padding:0 8px;font-size:12.5px;font-weight:850;border-radius:8px;border:${!preferSimp ? '1.5px solid var(--brand)' : '1px solid var(--border)'};background:${!preferSimp ? 'rgba(49,130,246,0.1)' : 'var(--surface)'};color:${!preferSimp ? 'var(--brand)' : 'var(--text-2)'};cursor:pointer;transition:all .15s ease;display:flex;align-items:center;justify-content:center;gap:4px;width:100%;">
          🛡️ 일반 (표준체)
        </button>
        ${hasSimp ? `
        <button type="button" class="btn-ptype ${preferSimp ? 'active' : ''}" data-ptype="simplified" style="height:38px;padding:0 8px;font-size:12.5px;font-weight:850;border-radius:8px;border:${preferSimp ? '1.5px solid var(--brand)' : '1px solid var(--border)'};background:${preferSimp ? 'rgba(49,130,246,0.1)' : 'var(--surface)'};color:${preferSimp ? 'var(--brand)' : 'var(--text-2)'};cursor:pointer;transition:all .15s ease;display:flex;align-items:center;justify-content:center;gap:4px;width:100%;">
          🩺 간편 (유병자)
        </button>` : `
        <span style="height:38px;padding:0 8px;font-size:11.5px;font-weight:700;color:#334155;background:var(--surface);border-radius:8px;border:1px dashed var(--border);display:flex;align-items:center;justify-content:center;gap:4px;width:100%;">
          <span>🩺</span> <span>간편 (약관 업데이트 진행 중)</span>
        </span>`}
      </div>

      <!-- 표준체 담보 리스트 -->
      <div class="riders-std" style="display:${preferSimp ? 'none' : 'flex'};flex-direction:column;gap:8px;">
        ${renderRiderCardsHTML(co.id, p.id, 'standard', stdRiders, matchContext)}
      </div>

      <!-- 유병자 담보 리스트 -->
      ${hasSimp ? `
      <div class="riders-simp" style="display:${preferSimp ? 'flex' : 'none'};flex-direction:column;gap:8px;">
        ${renderRiderCardsHTML(co.id, p.id, 'simplified', simpRiders, matchContext)}
      </div>` : ''}

    </div>
  </div>`;
}

function renderRiderCardsHTML(cid, pid, ptype, riders, matchContext = {}) {
  if (!riders) return '';

  let html = '';
  const isMatchBasic = matchContext.riderKey === 'basic' || matchContext.isExclusion || matchContext.isClaimTip;
  const isMatchTier = matchContext.riderKey === 'tier';
  const isMatchNdai = matchContext.riderKey === 'ndai' || !!matchContext.searchedNdai;

  // 1. 질병수술비
  if (riders.basic) {
    const isHigh = isMatchBasic;
    html += `
    <div class="rider-card" style="border:${isHigh ? '2px solid #ea580c' : '1px solid var(--line)'};border-radius:10px;padding:11px 12px;background:${isHigh ? 'rgba(234,88,12,0.03)' : 'var(--surface)'};">
      <div style="margin-bottom:6px;display:flex;align-items:flex-start;justify-content:space-between;gap:6px;">
        <div>
          <div style="font-size:13.5px;font-weight:900;color:#0f172a;word-break:keep-all;display:flex;align-items:center;gap:5px;">
            <span>💡 ${esc(riders.basic.title)}</span>
            ${isHigh ? '<span style="font-size:10.5px;font-weight:900;color:#ea580c;background:rgba(234,88,12,0.12);padding:1px 6px;border-radius:4px;">🎯 검색일치</span>' : ''}
          </div>
          <div style="font-size:12px;color:#334155;margin-top:2px;line-height:1.4;font-weight:700;">${esc(riders.basic.summary || '')}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px;">
        <button type="button" class="btn-open-clause-modal" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="basic" data-view-mode="basic_clause" style="height:38px;border-radius:8px;border:${matchContext.isExclusion ? '2px solid #dc2626' : '1px solid var(--border)'};background:${matchContext.isExclusion ? 'rgba(220,38,38,0.09)' : 'var(--surface)'};color:${matchContext.isExclusion ? '#dc2626' : '#0f172a'};font-size:12px;font-weight:850;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.02);display:flex;align-items:center;justify-content:center;gap:4px;">
          ${matchContext.isExclusion ? '🚫 보상제외 조항 직결' : '📄 약관조항 보기'}
        </button>
        <button type="button" class="btn-open-clause-modal" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="basic" data-view-mode="claim_tips" style="height:38px;border-radius:8px;border:1.5px solid #d97706;background:rgba(245,158,11,0.09);color:#b45309;font-size:12px;font-weight:850;cursor:pointer;white-space:nowrap;display:flex;align-items:center;justify-content:center;gap:4px;box-shadow:0 1px 3px rgba(217,119,6,0.15);">
          💡 실무 청구팁
        </button>
      </div>
    </div>`;
  }

  // 2. 종수술비
  if (riders.tier) {
    const isHigh = isMatchTier;
    html += `
    <div class="rider-card" style="border:${isHigh ? '2px solid #ea580c' : '1px solid var(--line)'};border-radius:10px;padding:11px 12px;background:${isHigh ? 'rgba(234,88,12,0.03)' : 'var(--surface)'};">
      <div style="margin-bottom:6px;display:flex;align-items:flex-start;justify-content:space-between;gap:6px;">
        <div>
          <div style="font-size:13.5px;font-weight:900;color:var(--brand);word-break:keep-all;display:flex;align-items:center;gap:5px;">
            <span>📋 ${esc(riders.tier.title)}</span>
            ${isHigh ? '<span style="font-size:10.5px;font-weight:900;color:#ea580c;background:rgba(234,88,12,0.12);padding:1px 6px;border-radius:4px;">🎯 검색일치</span>' : ''}
          </div>
          <div style="font-size:12px;color:#334155;margin-top:2px;line-height:1.4;font-weight:700;">${esc(riders.tier.summary || '')}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:8px;">
        <button type="button" class="btn-open-clause-modal" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="tier" data-view-mode="clause" style="height:38px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:#0f172a;font-size:12px;font-weight:850;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.02);display:flex;align-items:center;justify-content:center;gap:4px;">
          📄 약관조항 보기
        </button>
        <button type="button" class="btn-open-clause-modal" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="tier" data-view-mode="table" style="height:38px;border-radius:8px;border:1.5px solid var(--brand);background:var(--brand);color:#fff;font-size:12px;font-weight:850;cursor:pointer;box-shadow:0 2px 6px rgba(49,130,246,0.25);display:flex;align-items:center;justify-content:center;gap:4px;">
          📑 수술분류표 보기
        </button>
      </div>
    </div>`;
  }

  // 3. N대 질병수술비 (112대/120대 섞지 않고 회사별 판매 N대별 분리 선택 탭 #29516)
  if (riders.ndai) {
    const isHigh = isMatchNdai;

    // 20개 전 보험사 및 가입시기별 판매 N대 특약 매핑 (#29996 #30017 #30033)
    let nOptions = (COMPANY_NDAI_PERIOD_MAP[cid] && COMPANY_NDAI_PERIOD_MAP[cid][pid])
      ? [...COMPANY_NDAI_PERIOD_MAP[cid][pid]]
      : [];

    if (nOptions.length === 0) {
      const titleMatch = riders.ndai.title.match(/(\d+대)/g);
      if (titleMatch && titleMatch.length > 0) {
        nOptions = Array.from(new Set(titleMatch));
      } else {
        nOptions = ['112대'];
      }
    }

    const defaultN = (matchContext.searchedNdai && nOptions.includes(matchContext.searchedNdai)) 
      ? matchContext.searchedNdai 
      : (nOptions[0] || '112대');

    html += `
    <div class="rider-card rider-card-ndai" data-current-ndai="${esc(defaultN)}" style="border:${isHigh ? '2px solid #ea580c' : '1px solid var(--line)'};border-radius:10px;padding:11px 12px;background:${isHigh ? 'rgba(234,88,12,0.03)' : 'var(--surface)'};">
      <div style="margin-bottom:6px;display:flex;align-items:flex-start;justify-content:space-between;gap:6px;">
        <div style="flex:1;">
          <div style="font-size:13.5px;font-weight:900;color:#059669;word-break:keep-all;display:flex;align-items:center;gap:5px;">
            <span>🏢 ${esc(defaultN)} N대 질병수술비 특약</span>
            ${isHigh ? '<span style="font-size:10.5px;font-weight:900;color:#ea580c;background:rgba(234,88,12,0.12);padding:1px 6px;border-radius:4px;">🎯 검색일치</span>' : ''}
          </div>
          <div style="font-size:12px;color:#334155;margin-top:2px;line-height:1.4;font-weight:700;">${esc(riders.ndai.summary || '')}</div>
        </div>
      </div>

      <!-- 회사별 판매 N대별 분리 선택 탭 (#29516 섞지 않고 클릭 시 해당 N대 약관 직결) -->
      ${nOptions.length > 1 ? `
      <div style="margin:8px 0 6px;padding:4px;background:var(--surface-2);border-radius:8px;border:1px solid var(--border);display:flex;gap:4px;">
        ${nOptions.map(opt => `
          <button type="button" class="btn-ndai-tab-select ${opt === defaultN ? 'active' : ''}" data-ndai-opt="${esc(opt)}" style="flex:1;height:32px;border-radius:6px;border:${opt === defaultN ? '1.5px solid #059669' : '1px solid transparent'};background:${opt === defaultN ? '#059669' : 'transparent'};color:${opt === defaultN ? '#fff' : '#1e293b'};font-size:11.5px;font-weight:900;cursor:pointer;transition:all .15s ease;">
            ${esc(opt)} 특약
          </button>
        `).join('')}
      </div>` : ''}

      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:6px;">
        <button type="button" class="btn-open-clause-modal" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="ndai" data-view-mode="clause" style="height:38px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:#0f172a;font-size:12px;font-weight:850;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,0.02);display:flex;align-items:center;justify-content:center;gap:4px;">
          📄 약관조항 보기
        </button>
        <button type="button" class="btn-open-clause-modal" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="ndai" data-view-mode="table" style="height:38px;border-radius:8px;border:1.5px solid #059669;background:#059669;color:#fff;font-size:12px;font-weight:850;cursor:pointer;box-shadow:0 2px 6px rgba(5,150,105,0.25);display:flex;align-items:center;justify-content:center;gap:4px;">
          📑 질병분류표 보기
        </button>
      </div>
    </div>`;
  }

  return html;
}

function openClauseModalFromIds(cid, pid, ptype, targetRider, viewMode, selectedNdai = null) {
  const allCos = [
    ...((window.POLICY_CLAUSES_DATA && window.POLICY_CLAUSES_DATA.nonLife) || []),
    ...((window.POLICY_CLAUSES_DATA && window.POLICY_CLAUSES_DATA.life) || [])
  ];
  const co = allCos.find(c => c.id === cid);
  if (!co) return;
  const period = co.periods.find(p => p.id === pid);
  if (!period) return;
  const simpObj = (period.types && period.types.simplified) || (period.types && period.types.standard && period.types.standard.simplified) || period.simplified;
  const pData = (ptype === 'simplified' && simpObj) ? simpObj : (period.types ? period.types.standard || period.types[ptype] : null);
  if (!pData) return;
  const rider = (pData.riders && pData.riders[targetRider]) ? pData.riders[targetRider] : (period.types?.standard?.riders?.[targetRider] || { title: '질병수술비' });

  const modal = $('#clauseModal');
  const modalBadge = $('#clauseModalBadge');
  const modalTitle = $('#clauseModalTitle');
  const modalAlert = $('#clauseModalAlert');
  const searchWrap = $('#clauseModalSearchWrap');
  const innerSearch = $('#clauseInnerSearch');

  if (!modal || !modalTitle) return;

  if (innerSearch) innerSearch.value = '';

  const typeName = pData.name;
  let subModeStr = '약관 조항';
  if (viewMode === 'table') {
    subModeStr = targetRider === 'tier' ? '수술분류표' : '대상질병분류표';
  } else if (viewMode === 'basic_exclusion') {
    subModeStr = '보상제외 조항 (면책사유)';
  } else if (viewMode === 'claim_tips') {
    subModeStr = '실무 청구팁';
  } else {
    subModeStr = '약관 조항 본문';
  }

  if (modalBadge) {
    modalBadge.textContent = `🏢 [${co.name} (${co.shortName})] ${period.periodStr} · ${typeName}`;
  }
  let cleanRiderTitle = rider.title || '수술특약';
  if (targetRider === 'ndai') {
    const ndaiStr = selectedNdai || (cleanRiderTitle.match(/\d+대/)?.[0] || 'N대');
    cleanRiderTitle = `${ndaiStr} 질병수술비 특약`;
  }
  modalTitle.textContent = `${cleanRiderTitle} [${subModeStr}]`;

  // 개정 알림 표시
  if (period.revSummary) {
    modalAlert.style.display = 'block';
    modalAlert.innerHTML = `
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:4px;">
        <span>⚠️</span>
        <span style="font-weight:900;color:#92400e;">개정 포인트 및 실무 안내</span>
      </div>
      <div style="font-size:12px;color:#78350f;">${formatNoticeSummaryHTML(period.revSummary)}</div>
    `;
  } else {
    modalAlert.style.display = 'none';
  }

  if (searchWrap) searchWrap.style.display = 'flex';

  currentClauseModalData = {
    co,
    period,
    pData,
    rider,
    targetRider,
    viewMode,
    selectedNdai
  };

  renderClauseModalContent('', currentClauseModalData);

  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function bindClauseChipEvents(box) {
  if (!box) return;
  box.querySelectorAll('.btn-clause-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = btn.dataset.q;
      const inp = $('#clauseInnerSearch');
      if (inp) inp.value = q;
      renderClauseModalContent(q);
    });
  });
}

function renderClauseModalContent(filterQ = '', data = currentClauseModalData) {
  const box = $('#clauseModalContent');
  if (!box || !data) return;

  const { co, period, rider, targetRider, viewMode, selectedNdai } = data;
  const normQ = (filterQ || '').trim().toLowerCase();

  // ─────────────────────────────────────────────────────────────
  // 0. 실무 청구팁 3대 섹션 모달 (#28834 #28876)
  // ─────────────────────────────────────────────────────────────
  if (viewMode === 'claim_tips') {
    const searchWrap = $('#clauseModalSearchWrap');
    if (searchWrap) searchWrap.style.display = 'none';

    box.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:12px;padding:4px 0 10px;">
        <!-- 3대 탭 스위처 -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;">
          <button type="button" class="btn-claim-tip-tab active" data-tip-tab="tech" style="height:42px;border-radius:8px;border:1.5px solid var(--brand);background:rgba(49,130,246,0.1);color:var(--brand);font-size:12px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;transition:all .15s ease;">
            🔬 신의료기술
          </button>
          <button type="button" class="btn-claim-tip-tab" data-tip-tab="defense" style="height:42px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text-2);font-size:12px;font-weight:850;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;transition:all .15s ease;">
            🛡️ 면책방어
          </button>
          <button type="button" class="btn-claim-tip-tab" data-tip-tab="precedent" style="height:42px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text-2);font-size:12px;font-weight:850;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;transition:all .15s ease;">
            ⚖️ 분쟁·판례
          </button>
        </div>

        <!-- 1. 신의료기술 인정기준 섹션 -->
        <div id="tip-sec-tech" class="tip-section" style="display:flex;flex-direction:column;gap:10px;">
          <div style="border:1.5px solid rgba(49,130,246,0.25);border-radius:10px;padding:12px 14px;background:var(--surface);">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:850;color:#2563eb;background:rgba(37,99,235,0.1);padding:2px 7px;border-radius:4px;">복지부 고시 인정</span>
              <span style="font-size:13.5px;font-weight:900;color:var(--text);">1. 체외충격파쇄석술 (ESWL)</span>
            </div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.65;word-break:keep-all;">
              • <strong>대상 질환:</strong> 요로결석 (신장·요관·방광결석 N20~N23)<br>
              • <strong>수술 인정 근거:</strong> 보건복지부 신의료기술 인정 고시(제2000-67호). 체내 결석을 충격파로 파쇄하여 체외 배출시키는 외과적 처치 인정.<br>
              • <strong>청구 실무 팁:</strong> 질병수술비 정상 지급 대상. 종수술비는 회사별 1종 또는 2종 적용. 연간 1회 한도 여부 약관 대조 필수.
            </div>
          </div>

          <div style="border:1.5px solid rgba(49,130,246,0.25);border-radius:10px;padding:12px 14px;background:var(--surface);">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:850;color:#2563eb;background:rgba(37,99,235,0.1);padding:2px 7px;border-radius:4px;">초음파 집속 열치료</span>
              <span style="font-size:13.5px;font-weight:900;color:var(--text);">2. 자궁근종 하이푸 (HIFU)</span>
            </div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.65;word-break:keep-all;">
              • <strong>대상 질환:</strong> 자궁근종(D25), 자궁선근증(N80.0)<br>
              • <strong>수술 인정 근거:</strong> 복지부 신의료기술 인정. 절개 없는 고강도 집속초음파로 병변을 응고 괴사시키는 최신의료기법.<br>
              • <strong>청구 실무 팁:</strong> 약관상 '신의료기술 수술 포함' 조항에 의거 질병수술비 및 N대 부인과 질병수술비(비관혈 50%) 동시 청구 가능.
            </div>
          </div>

          <div style="border:1.5px solid rgba(49,130,246,0.25);border-radius:10px;padding:12px 14px;background:var(--surface);">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:850;color:#2563eb;background:rgba(37,99,235,0.1);padding:2px 7px;border-radius:4px;">로봇 원격 절제술</span>
              <span style="font-size:13.5px;font-weight:900;color:var(--text);">3. 다빈치 로봇수술</span>
            </div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.65;word-break:keep-all;">
              • <strong>대상 질환:</strong> 전립선암(C61), 갑상선암(C73), 직장·대장암 등<br>
              • <strong>수술 인정 근거:</strong> 의사의 직접 조작 하에 생체에 절단·절제를 가하는 침습적 수술.<br>
              • <strong>청구 실무 팁:</strong> 질병수술비 전액 지급 및 1-5종 수술특약상 5종 악성신생물 근치수술 1순위 전액 지급.
            </div>
          </div>
        </div>

        <!-- 2. 면책방어 실무가이드 섹션 -->
        <div id="tip-sec-defense" class="tip-section" style="display:none;flex-direction:column;gap:10px;">
          <div style="border:1.5px solid rgba(220,38,38,0.25);border-radius:10px;padding:12px 14px;background:var(--surface);">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:850;color:#dc2626;background:rgba(220,38,38,0.1);padding:2px 7px;border-radius:4px;">흡인 vs 절개 방어</span>
              <span style="font-size:13.5px;font-weight:900;color:var(--text);">1. 피지낭종·농양 흡인(면책) 방어</span>
            </div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.65;word-break:keep-all;">
              • <strong>핵심 분쟁:</strong> 주사기 바늘로 뽑아내면 약관상 '흡인·천자'로 보상 제외 면책!<br>
              • <strong>방어 전략:</strong> 메스로 피부를 째고 주머니(낭종)를 완전히 긁어내거나 껍질을 제거한 경우 '절개 및 배액술(Incision & Drainage)' 또는 '적출술(Excision)'에 해당함.<br>
              • <strong>필수 서류:</strong> 수술확인서 또는 의무기록지상 <code>Incision and Excision (절개 및 적출)</code> 문구 기재 확보 필수.
            </div>
          </div>

          <div style="border:1.5px solid rgba(220,38,38,0.25);border-radius:10px;padding:12px 14px;background:var(--surface);">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:850;color:#dc2626;background:rgba(220,38,38,0.1);padding:2px 7px;border-radius:4px;">미용성형 면책 방어</span>
              <span style="font-size:13.5px;font-weight:900;color:var(--text);">2. 여성형유방증 (여유증 N62)</span>
            </div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.65;word-break:keep-all;">
              • <strong>핵심 분쟁:</strong> 보험사가 외모 개선 목적의 미용성형 시술이라며 수술비 지급 거절.<br>
              • <strong>방어 전략:</strong> 초음파 검경상 사이먼(Simon) 등급 IIa 이상, 유선조직 증식 직경 2cm 이상 확인된 경우 질병 치료 목적 확정.<br>
              • <strong>필수 서류:</strong> 유선절제 수술기록지 및 조직검사 결과지 첨부 시 질병수술비 및 1-5종(2024.12 개정 전 3종, 개정 후 2종) 전액 수령 가능.
            </div>
          </div>

          <div style="border:1.5px solid rgba(220,38,38,0.25);border-radius:10px;padding:12px 14px;background:var(--surface);">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:850;color:#dc2626;background:rgba(220,38,38,0.1);padding:2px 7px;border-radius:4px;">정액담보 분쟁 방어</span>
              <span style="font-size:13.5px;font-weight:900;color:var(--text);">3. 백내장 수술비 정액 보장</span>
            </div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.65;word-break:keep-all;">
              • <strong>핵심 분쟁:</strong> 실손의료비 부지급 분쟁과 수술비 정액담보를 혼동하여 수술비까지 거절하는 사례 빈발.<br>
              • <strong>방어 전략:</strong> 실손의료비 입원 인정 여부와 관계없이, 수정체 유화술 및 인공수정체 삽입술은 질병수술비 및 1-5종(1종) 정액보험금 지급 대상임.<br>
              • <strong>필수 서류:</strong> 세극등현미경 검사 결과지 및 백내장 진단서(H25, H26) 제출.
            </div>
          </div>
        </div>

        <!-- 3. 분쟁·판례 요약 섹션 -->
        <div id="tip-sec-precedent" class="tip-section" style="display:none;flex-direction:column;gap:10px;">
          <div style="border:1.5px solid rgba(217,119,6,0.25);border-radius:10px;padding:12px 14px;background:var(--surface);">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:850;color:#d97706;background:rgba(217,119,6,0.1);padding:2px 7px;border-radius:4px;">대법원 판례</span>
              <span style="font-size:13.5px;font-weight:900;color:var(--text);">대법원 2011다30147 판결</span>
            </div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.65;word-break:keep-all;">
              • <strong>판결 요지:</strong> 약관의 뜻이 명백하지 아니한 경우에는 고객에게 유리하게 해석하여야 하며(작성자 불이익의 원칙), 전통적인 메스 절개뿐만 아니라 현대 의학의 발전에 따른 최신 침습적 시술기법도 약관상 '수술'의 범위에 포함된다고 판시함.<br>
              • <strong>실무 원용:</strong> 새로운 의료기법이나 내시경 시술에 대해 보험사가 '수술의 정의 미충족'을 주장할 때 근거로 제시.
            </div>
          </div>

          <div style="border:1.5px solid rgba(217,119,6,0.25);border-radius:10px;padding:12px 14px;background:var(--surface);">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:850;color:#d97706;background:rgba(217,119,6,0.1);padding:2px 7px;border-radius:4px;">금감원 분조위</span>
              <span style="font-size:13.5px;font-weight:900;color:var(--text);">체외충격파쇄석술 수술 인정 결정례</span>
            </div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.65;word-break:keep-all;">
              • <strong>결정 번호:</strong> 금융분쟁조정위원회 제2021-12호<br>
              • <strong>결정 요지:</strong> 체외충격파쇄석술은 피부 절개가 수반되지 않으나, 결석을 파쇄하여 제거하는 실질적인 외과적 치료 효과를 가지므로 약관상 질병수술비 지급 대상에 해당함.<br>
              • <strong>실무 원용:</strong> 요로결석 충격파 쇄석술에 대해 보험사가 단순 비침습 시술이라며 지급을 보류할 때 즉시 인용 가능.
            </div>
          </div>

          <div style="border:1.5px solid rgba(217,119,6,0.25);border-radius:10px;padding:12px 14px;background:var(--surface);">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:11px;font-weight:850;color:#d97706;background:rgba(217,119,6,0.1);padding:2px 7px;border-radius:4px;">금감원 분조위</span>
              <span style="font-size:13.5px;font-weight:900;color:var(--text);">여성형유방증 유선절제 치료 목적 결정례</span>
            </div>
            <div style="font-size:12px;color:var(--text-2);line-height:1.65;word-break:keep-all;">
              • <strong>결정 요지:</strong> 유선조직 증식이 확인된 진성 여성형유방증의 경우, 남성의 유선 비대로 인한 통증과 기능장애를 치료하기 위한 것이므로 약관상 보상하지 않는 손해인 '미용성형'에 해당하지 아니함.<br>
              • <strong>실무 원용:</strong> 여유증 수술비 및 실손 부지급 안내장 수령 시 분쟁조정신청 및 재청구 근거로 활용.
            </div>
          </div>
        </div>
      </div>
    `;

    // 팁 탭 스위처 이벤트 바인딩
    box.querySelectorAll('.btn-claim-tip-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tip-tab');
        box.querySelectorAll('.btn-claim-tip-tab').forEach(b => {
          b.classList.remove('active');
          b.style.border = '1px solid var(--border)';
          b.style.background = 'var(--surface)';
          b.style.color = 'var(--text-2)';
          b.style.fontWeight = '850';
        });
        btn.classList.add('active');
        btn.style.border = '1.5px solid var(--brand)';
        btn.style.background = 'rgba(49,130,246,0.1)';
        btn.style.color = 'var(--brand)';
        btn.style.fontWeight = '900';

        box.querySelectorAll('.tip-section').forEach(sec => sec.style.display = 'none');
        const activeSec = box.querySelector(`#tip-sec-${targetTab}`);
        if (activeSec) activeSec.style.display = 'flex';
      });
    });

    return;
  }


  // ─────────────────────────────────────────────────────────────
  // 1. N대 질병수술비 / 성인주요질환 분류표 (#27027 #27036 #27519)
  // ─────────────────────────────────────────────────────────────
  if (viewMode === 'table' && (targetRider === 'ndai' || targetRider === 'adult')) {
    const tableData = rider.tableBody;
    if (!tableData) {
      box.innerHTML = '<div style="padding:20px;text-align:center;color:#334155;">질병분류표 데이터가 없습니다.</div>';
      return;
    }

    // 12대 N대 대표 질환 (3열 대칭 그리드 규격 #27519)
    const ndaiQuickChips = [
      { name: '담석증', code: 'K80', q: '담석증' },
      { name: '뇌혈관질환', code: 'I60~I69', q: '뇌혈관' },
      { name: '허혈심장질환', code: 'I20~I25', q: '협심증' },
      { name: '만성간질환', code: 'K70~K76', q: '간질환' },
      { name: '만성신부전', code: 'N17~N19', q: '신부전' },
      { name: '당뇨병', code: 'E10~E14', q: '당뇨' },
      { name: '갑상선질환', code: 'E00~E07', q: '갑상선' },
      { name: '위십이지장', code: 'K25~K28', q: '위궤양' },
      { name: '사타구니탈장', code: 'K40', q: '탈장' },
      { name: '치핵', code: 'K64', q: '치핵' },
      { name: '비뇨기결석', code: 'N20~N23', q: '요로결석' },
      { name: '자궁근종', code: 'D25', q: '자궁근종' }
    ];

    const displayNdai = selectedNdai || (rider.title ? (rider.title.match(/\d+대/)?.[0] || rider.title) : 'N대');
    const cleanRiderTitle = displayNdai ? `${displayNdai} 질병수술비` : rider.title.replace(/\d+대\/\d+대/, m => m.split('/')[0]);

    const photoBtnHTML = `
      <div style="margin-bottom:12px;">
        <button type="button" class="btn-co-clause" id="btnOpenRulesNdai" style="width:100%;height:46px;padding:0 14px;border:1.5px solid var(--border);border-radius:10px;background:var(--surface);display:flex;align-items:center;justify-content:space-between;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span class="btn-co-name" style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
            <span>🏢</span>
            <span>${esc(co.name)} ${esc(cleanRiderTitle)} 질병분류표 원문</span>
          </span>
          <span class="btn-co-badge" style="font-size:11.5px;font-weight:900;padding:3px 7px;border-radius:6px;">
            약관 보기 🔍
          </span>
        </button>
      </div>
    `;

    const chipsHTML = `
      <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:11.5px;font-weight:900;color:#059669;display:flex;align-items:center;gap:4px;">
            🏢 N대 질병 대표 질환 원터치 빠른 판정
          </span>
          <span style="font-size:11px;color:#334155;font-weight:700;">터치 시 즉시 KCD 매칭</span>
        </div>
        <div class="clause-quick-chips" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
          ${ndaiQuickChips.map(c => `
            <button type="button" class="btn-clause-chip ${normQ === norm(c.q) ? 'on' : ''}" data-q="${esc(c.q)}" style="height:42px;padding:0 10px;border-radius:9px;font-size:12.5px;font-weight:850;cursor:pointer;border:1.5px solid ${normQ === norm(c.q) ? '#059669' : 'var(--border)'};background:${normQ === norm(c.q) ? '#059669' : 'var(--surface)'};color:${normQ === norm(c.q) ? '#fff' : 'var(--text)'};display:flex;align-items:center;justify-content:space-between;gap:6px;box-shadow:0 1px 3px rgba(0,0,0,0.02);min-width:0;">
              <span style="font-size:12.5px;font-weight:900;white-space:nowrap;text-align:left;flex:1;min-width:0;">${esc(c.name)}</span>
              <span style="font-size:11px;font-weight:900;padding:2px 0;width:72px;min-width:72px;max-width:72px;text-align:center;box-sizing:border-box;border-radius:5px;background:${normQ === norm(c.q) ? 'rgba(255,255,255,0.25)' : 'rgba(5,150,105,0.08)'};color:${normQ === norm(c.q) ? '#fff' : '#059669'};flex-shrink:0;border:${normQ === norm(c.q) ? 'none' : '1px solid rgba(5,150,105,0.2)'};display:inline-block;">${esc(c.code)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // 1) 검색어 입력 또는 칩 터치 시 (N대 질병 탭과 100% 똑같이 cardNdaiHTML + 🎯 검색일치 하이라이트)
    if (normQ) {
      const oldCos = state.ndaiCos;
      const oldCo = state.ndaiCo;
      state.ndaiCos = [co.name];
      state.ndaiCo = co.name;

      const searchRes = search(normQ) || { groups: [], edi: [] };
      const exclProc = findExcludedProcedure(normQ);

      if (exclProc && exclProc.relatedCodes && (!searchRes.groups || searchRes.groups.length === 0)) {
        exclProc.relatedCodes.forEach(code => {
          (state.D.codeIndex[code] || []).forEach(gi => {
            if (!searchRes.groups.includes(gi)) searchRes.groups.push(gi);
          });
        });
      }

      let ndaiCardsHTML = '';
      if (searchRes.groups && searchRes.groups.length > 0) {
        const mainGi = searchRes.groups[0];
        ndaiCardsHTML += `
          <div style="font-size:12.5px;font-weight:900;color:var(--text);margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
            <span>🔍 <em>'${esc(normQ)}'</em> N대 질병수술비 판정 결과</span>
            <span style="font-size:11px;color:#059669;font-weight:850;">[${esc(co.name)}] 기준 적용</span>
          </div>
        `;
        ndaiCardsHTML += cardNdaiHTML(mainGi, normQ, false);

        if (searchRes.groups.length > 1) {
          const subItems = searchRes.groups.slice(1, 6);
          ndaiCardsHTML += `
            <div style="margin:14px 0 8px 2px;font-size:12px;font-weight:850;color:var(--text-2);">
              📂 연관 질환 및 다른 질병코드 (${subItems.length}건):
            </div>
            <div class="sub-diseases-list" style="display:flex;flex-direction:column;gap:6px;">
              ${subItems.map(i => cardNdaiHTML(i, normQ, true)).join('')}
            </div>
          `;
        }
      }

      // 약관 테이블 내 매칭 질병군 필터링
      let matchedRows = (tableData.rows || []).filter(r => {
        const grpName = r[0];
        const detailedList = NDAI_DETAILED_ITEMS[grpName] || [];
        if (detailedList.some(item => item.name.toLowerCase().includes(normQ) || item.code.toLowerCase().includes(normQ) || (item.desc && item.desc.toLowerCase().includes(normQ)))) return true;
        return r.some(cell => String(cell).toLowerCase().includes(normQ));
      });

      let tableMatchHTML = '';
      if (matchedRows.length > 0) {
        tableMatchHTML = `
          <div style="margin-top:16px;background:var(--surface);border:1.5px solid var(--border);border-radius:11px;padding:12px 14px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <div style="font-size:13px;font-weight:900;color:var(--text);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <span>📋 [${esc(co.name)}] 약관 N대 질병분류표 매칭 군</span>
              <span style="font-size:11px;color:#059669;font-weight:850;">(${matchedRows.length}개 군 일치)</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${matchedRows.map(r => {
                const grpName = r[0];
                const summaryNames = r[1];
                const rawCodes = r[2];
                const benefit = r[3];
                const detailedList = NDAI_DETAILED_ITEMS[grpName] || [];
                return `
                <div style="background:var(--surface-2);border:1.5px solid rgba(5,150,105,0.3);border-radius:9px;padding:10px 12px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:4px;">
                    <span style="font-size:13px;font-weight:900;color:#059669;">🏢 ${esc(grpName)}</span>
                    <span style="font-size:11px;font-weight:850;color:#059669;background:rgba(5,150,105,0.12);padding:1px 6px;border-radius:4px;">${esc(benefit)}</span>
                  </div>
                  <div style="font-size:11.5px;color:#334155;margin-bottom:6px;">${esc(summaryNames)}</div>
                  ${detailedList.length ? `
                    <div style="display:flex;flex-direction:column;gap:4px;margin-top:6px;border-top:1px dashed var(--line);padding-top:6px;">
                      ${detailedList.filter(item => item.name.toLowerCase().includes(normQ) || item.code.toLowerCase().includes(normQ) || (item.desc && item.desc.toLowerCase().includes(normQ))).map(item => `
                        <div style="display:flex;align-items:center;gap:6px;background:var(--surface);padding:4px 8px;border-radius:6px;border:1px solid var(--border);">
                          <span style="font-size:10.5px;font-weight:900;color:#2563eb;background:rgba(37,99,235,0.08);padding:1px 5px;border-radius:3px;">${esc(item.code)}</span>
                          <span style="font-size:11.5px;font-weight:850;color:var(--text);">${esc(item.name)}</span>
                          <span style="font-size:10.5px;color:#d97706;font-weight:900;margin-left:auto;">🎯 검색일치</span>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
      }

      if (!ndaiCardsHTML && !tableMatchHTML) {
        box.innerHTML = photoBtnHTML + chipsHTML + `
          <div style="padding:35px 20px;text-align:center;background:var(--surface);border:1px solid var(--border);border-radius:12px;color:#334155;">
            <div style="font-size:24px;margin-bottom:8px;">🔍</div>
            <div style="font-size:13.5px;font-weight:900;color:var(--text);">'${esc(normQ)}' N대 질병코드 일치 항목이 없습니다</div>
            <div style="font-size:12px;margin-top:4px;line-height:1.4;">상단 다빈도 칩을 터치하거나 질병명(담석증, 뇌혈관 등)으로 검색해 보세요.</div>
          </div>
        `;
      } else {
        box.innerHTML = photoBtnHTML + chipsHTML + ndaiCardsHTML + tableMatchHTML;
      }

      bindClauseChipEvents(box);
      bindCardActions(box);

      const btnPhoto = box.querySelector('#btnOpenRulesNdai');
      if (btnPhoto) {
        btnPhoto.addEventListener('click', () => {
          const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[co.id.replace('fire', '').replace('life', '')]);
          const v = (coEntry && (coEntry.standard || coEntry.simplified)) || coEntry;
          const numMatch = (selectedNdai || tableData.title || rider.title || '').match(/\d+대/);
          const ndaiKey = numMatch ? numMatch[0] : '';
          const targetTable = (v && v.ndai_table && (v.ndai_table.pages ? v.ndai_table : (v.ndai_table[ndaiKey] || Object.values(v.ndai_table)[0])));
          const cleanNdaiName = (selectedNdai ? `${selectedNdai} 질병분류표` : (tableData.title || rider.title || 'N대 질병분류표')).replace(/\d+대\/\d+대/, m => m.split('/')[0]).replace('별표 [', '').replace(']', '');

          if (targetTable && targetTable.pages && targetTable.pages.length > 0) {
            const meta = { product: v.product, type: v.type, page: targetTable.pageStr };
            window.openRulesModal(targetTable.pages[0], `🏢 [${co.name}] ${cleanNdaiName} 공식 원문`, period.revSummary, targetTable.pages, meta);
          } else if (v && v.ndai_p1) {
            const pages = [v.ndai_p1];
            if (v.ndai_p2) pages.push(v.ndai_p2);
            const meta = { product: v.product, type: v.type, page: v.ndai_page };
            window.openRulesModal(v.ndai_p1, `🏢 [${co.name}] ${cleanNdaiName} 공식 원문`, period.revSummary, pages, meta);
          } else {
            alert(`🏢 [${co.name}] 공시실 공식 실물 약관 원문 수집·검증 진행 중입니다.`);
          }
        });
      }
      return;
    }

    // 2) Idle 상태: 전체 질병군 아코디언 드릴다운 리스트
    const rows = tableData.rows || [];
    box.innerHTML = photoBtnHTML + chipsHTML + `
      <div style="margin-bottom:12px;padding:2px 0;">
        <div style="font-size:13.5px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span>🏢</span>
          <span>${esc(tableData.title)}</span>
          <span style="font-size:11.5px;color:#059669;font-weight:850;background:rgba(5,150,105,0.08);padding:2px 7px;border-radius:5px;border:1px solid rgba(5,150,105,0.2);">(총 ${rows.length}개 군)</span>
        </div>
      </div>

      <div class="ndai-group-list" style="display:flex;flex-direction:column;gap:8px;">
        ${rows.map((r, gi) => {
          const grpName = r[0];
          const summaryNames = r[1];
          const rawCodes = r[2];
          const benefit = r[3];
          const detailedList = NDAI_DETAILED_ITEMS[grpName] || [];
          const isAutoOpen = false; // 모달 진입 시 전 질환군 기본 접힘(숨기기) 유지 (#29484)

          return `
          <div class="ndai-group-card" data-gi="${gi}" style="background:var(--surface);border:1.5px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,0.02);">
            <div class="ndai-group-head" style="padding:11px 13px;cursor:pointer;background:var(--surface);display:flex;align-items:center;justify-content:space-between;gap:8px;user-select:none;">
              <div style="min-width:0;flex:1;">
                <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px;">
                  <span style="font-size:13px;font-weight:900;color:#059669;">🏢 ${esc(grpName)}</span>
                  <span style="font-size:11px;font-weight:850;color:#059669;background:rgba(5,150,105,0.1);padding:1px 6px;border-radius:4px;border:1px solid rgba(5,150,105,0.25);">${esc(benefit)}</span>
                  ${detailedList.length ? `<span style="font-size:10.5px;font-weight:800;color:#334155;background:var(--surface-2);padding:1px 5px;border-radius:4px;border:1px solid var(--border);">${detailedList.length}개 질환군</span>` : ''}
                </div>
                <div style="font-size:11.5px;color:#334155;line-height:1.35;word-break:keep-all;">
                  포함: ${esc(summaryNames)}
                </div>
              </div>
              <span class="ndai-arrow-badge" style="font-size:11px;font-weight:850;color:#059669;background:var(--surface-2);padding:3px 8px;border-radius:5px;border:1px solid var(--border);min-width:64px;text-align:center;box-sizing:border-box;flex-shrink:0;">${isAutoOpen ? '접기 ▴' : '펼치기 ▾'}</span>
            </div>

            <div class="ndai-group-body" style="display:${isAutoOpen ? 'block' : 'none'};padding:10px 12px;background:var(--surface-2);border-top:1px dashed var(--line);">
              <div style="font-size:11px;font-weight:850;color:#059669;margin-bottom:6px;">📋 수록 질병코드 (KCD 전수 분류표):</div>
              <div style="display:flex;flex-direction:column;gap:5px;">
                ${detailedList.length ? detailedList.map(item => `
                  <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface);border-radius:8px;border:1px solid var(--border);min-height:48px;">
                    <span class="kcd-badge-fixed" style="font-size:11px;font-weight:900;color:#2563eb;background:rgba(37,99,235,0.08);padding:3px 0;border-radius:5px;border:1px solid rgba(37,99,235,0.2);white-space:nowrap;width:84px;min-width:84px;max-width:84px;text-align:center;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;flex-shrink:0;">${esc(item.code)}</span>
                    <div style="min-width:0;flex:1;">
                      <div style="font-size:12.5px;font-weight:850;color:var(--text);word-break:keep-all;">${esc(item.name)}</div>
                      ${item.desc ? `<div style="font-size:11px;color:#334155;margin-top:2px;line-height:1.35;word-break:keep-all;">${esc(item.desc)}</div>` : ''}
                    </div>
                  </div>
                `).join('') : `
                  <div style="padding:6px 8px;font-size:11.5px;background:var(--surface);border-radius:6px;border:1px solid var(--border);color:var(--text);">
                    <div style="font-weight:850;color:#2563eb;margin-bottom:2px;">KCD 코드: ${esc(rawCodes)}</div>
                    <div style="color:var(--text-2);">${esc(summaryNames)}</div>
                  </div>
                `}
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    bindClauseChipEvents(box);

    const btnPhoto = box.querySelector('#btnOpenRulesNdai');
    if (btnPhoto) {
      btnPhoto.addEventListener('click', () => {
        const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[co.id.replace('fire', '').replace('life', '')]);
        const v = (coEntry && (coEntry.standard || coEntry.simplified)) || coEntry;
        const numMatch = (selectedNdai || tableData.title || rider.title || '').match(/\d+대/);
        const ndaiKey = numMatch ? numMatch[0] : '';
        const targetTable = (v && v.ndai_table && (v.ndai_table.pages ? v.ndai_table : (v.ndai_table[ndaiKey] || Object.values(v.ndai_table)[0])));
        const cleanNdaiName = (selectedNdai ? `${selectedNdai} 질병분류표` : (tableData.title || rider.title || 'N대 질병분류표')).replace(/\d+대\/\d+대/, m => m.split('/')[0]).replace('별표 [', '').replace(']', '');

        if (targetTable && targetTable.pages && targetTable.pages.length > 0) {
          const meta = { product: v.product, type: v.type, page: targetTable.pageStr };
          window.openRulesModal(targetTable.pages[0], `🏢 [${co.name}] ${cleanNdaiName} 공식 원문`, period.revSummary, targetTable.pages, meta);
        } else if (v && v.ndai_p1) {
          const pages = [v.ndai_p1];
          if (v.ndai_p2) pages.push(v.ndai_p2);
          const meta = { product: v.product, type: v.type, page: v.ndai_page };
          window.openRulesModal(v.ndai_p1, `🏢 [${co.name}] ${cleanNdaiName} 공식 원문`, period.revSummary, pages, meta);
        } else {
          alert(`🏢 [${co.name}] 공시실 공식 실물 약관 원문 수집·검증 진행 중입니다.`);
        }
      });
    }

    box.querySelectorAll('.ndai-group-head').forEach(head => {
      head.addEventListener('click', () => {
        const card = head.closest('.ndai-group-card');
        const body = card.querySelector('.ndai-group-body');
        const arrow = card.querySelector('.ndai-arrow-badge');
        if (body) {
          const isOpen = body.style.display === 'block';
          body.style.display = isOpen ? 'none' : 'block';
          if (arrow) arrow.textContent = isOpen ? '펼치기 ▾' : '접기 ▴';
        }
      });
    });

    const btnExpand = box.querySelector('#btnExpandAllNdai');
    const btnCollapse = box.querySelector('#btnCollapseAllNdai');
    if (btnExpand) {
      btnExpand.addEventListener('click', () => {
        box.querySelectorAll('.ndai-group-body').forEach(b => b.style.display = 'block');
        box.querySelectorAll('.ndai-arrow-badge').forEach(a => a.textContent = '접기 ▴');
      });
    }
    if (btnCollapse) {
      btnCollapse.addEventListener('click', () => {
        box.querySelectorAll('.ndai-group-body').forEach(b => b.style.display = 'none');
        box.querySelectorAll('.ndai-arrow-badge').forEach(a => a.textContent = '펼치기 ▾');
      });
    }

    return;
  }

  // ─────────────────────────────────────────────────────────────
  // 2. 1-5종 수술분류표 (#26858 #26894 #27519 100% 카드형 단일화 & 3열 대칭 칩 & 실제약관 뷰어)
  // ─────────────────────────────────────────────────────────────
  if (viewMode === 'table' && targetRider === 'tier') {
    const tableData = rider.tableBody;
    if (!tableData) {
      box.innerHTML = '<div style="padding:20px;text-align:center;color:#334155;">수술분류표 데이터가 없습니다.</div>';
      return;
    }

    const yearMatch = (period.periodStr || '').match(/(\d{4})년/);
    const evalYear = yearMatch ? parseInt(yearMatch[1], 10) : 2024;
    const parsed = {
      co: co.name,
      cos: [co.name],
      year: evalYear
    };

    // 실제약관 사진 상단 버튼 (#27519 지침 2: 종수술비 개정후/개정전 사진은 수술분류표 들어가서 클릭)
    const revPhotos = rider.revPhotos;
    let photoHeaderHTML = '';
    if (revPhotos && revPhotos.length > 1) {
      photoHeaderHTML = `
        <div style="margin-bottom:12px;">
          <div style="font-size:11.5px;font-weight:900;color:#334155;margin-bottom:6px;display:flex;align-items:center;gap:4px;">
            <span>📷 실제 약관 원문 사진 열람 (동시수술 고해상도 뷰어):</span>
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
            <button type="button" class="btn-tier-rev-photo" data-rev="post" style="height:42px;border-radius:9px;border:1.5px solid #f59e0b;background:#fffbeb;color:#b45309;font-size:12px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 1px 3px rgba(245,158,11,0.12);">
              <span>📷 개정 후 약관 사진</span>
            </button>
            <button type="button" class="btn-tier-rev-photo" data-rev="pre" style="height:42px;border-radius:9px;border:1.5px solid var(--border);background:var(--surface);color:var(--text-2);font-size:12px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:5px;box-shadow:0 1px 2px rgba(0,0,0,0.02);">
              <span>📷 개정 전 약관 사진</span>
            </button>
          </div>
        </div>
      `;
    } else {
      photoHeaderHTML = `
        <div style="margin-bottom:12px;">
          <button type="button" class="btn-tier-single-photo btn-co-clause" style="width:100%;height:46px;padding:0 14px;border:1.5px solid var(--border);border-radius:10px;background:var(--surface);display:flex;align-items:center;justify-content:space-between;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <span class="btn-co-name" style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
              <span>📋</span>
              <span>${esc(co.name)} 1-5종 수술분류표 원문</span>
            </span>
            <span class="btn-co-badge" style="font-size:11.5px;font-weight:900;padding:3px 7px;border-radius:6px;">
              약관 보기 🔍
            </span>
          </button>
        </div>
      `;
    }

    // 다빈도 및 신의료기술 12대 대표 태그 (카티스템/연골 포함 & 3열 대칭 그리드 칼정렬 #27519 지침 4)
    const quickChips = [
      { name: '대장용종', badge: '2종/1종', q: '대장용종' },
      { name: '요로결석', badge: '2종', q: '요로결석' },
      { name: '백내장', badge: '1종', q: '백내장' },
      { name: '여유증', badge: '3종/1종', q: '여유증' },
      { name: '담석증', badge: '3종/2종', q: '담석증' },
      { name: '카티스템/연골', badge: '3종/2종', q: '카티스템' },
      { name: '맘모톰', badge: '2종', q: '맘모톰' },
      { name: '하이푸', badge: '2~3종', q: '하이푸' },
      { name: '유로리프트', badge: '1~2종', q: '유로리프트' },
      { name: '베나실', badge: '1~2종', q: '베나실' },
      { name: '인공관절', badge: '4종', q: '인공관절' },
      { name: '자궁근종', badge: '3종', q: '자궁근종' }
    ];

    const chipsHTML = `
      <div style="background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:10px 12px;margin-bottom:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:11.5px;font-weight:900;color:var(--brand);display:flex;align-items:center;gap:4px;">
            ⚡ 다빈도·신의료기술 원터치 빠른 판정
          </span>
          <span style="font-size:11px;color:#334155;font-weight:700;">터치 시 즉시 판정</span>
        </div>
        <div class="clause-quick-chips" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
          ${quickChips.map(c => `
            <button type="button" class="btn-clause-chip ${normQ === norm(c.q) ? 'on' : ''}" data-q="${esc(c.q)}" style="height:42px;padding:0 10px;border-radius:9px;font-size:12.5px;font-weight:850;cursor:pointer;border:1.5px solid ${normQ === norm(c.q) ? 'var(--brand)' : 'var(--border)'};background:${normQ === norm(c.q) ? 'var(--brand)' : 'var(--surface)'};color:${normQ === norm(c.q) ? '#fff' : 'var(--text)'};display:flex;align-items:center;justify-content:space-between;gap:6px;box-shadow:0 1px 3px rgba(0,0,0,0.02);min-width:0;">
              <span style="font-size:12.5px;font-weight:900;white-space:nowrap;text-align:left;flex:1;min-width:0;">${esc(c.name)}</span>
              <span style="font-size:11px;font-weight:900;padding:2px 6px;border-radius:5px;background:${normQ === norm(c.q) ? 'rgba(255,255,255,0.25)' : 'rgba(49,130,246,0.08)'};color:${normQ === norm(c.q) ? '#fff' : 'var(--brand)'};flex-shrink:0;border:${normQ === norm(c.q) ? 'none' : '1px solid rgba(49,130,246,0.2)'};">${esc(c.badge)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // 1) 검색어 입력 또는 빠른 칩을 누른 경우 (빠른검색과 100% 동일한 통합 카드 렌더링)
    if (normQ) {
      const searchRes = search(normQ) || { groups: [], edi: [] };
      const exclProc = findExcludedProcedure(normQ);

      if (exclProc && exclProc.relatedCodes && (!searchRes.groups || searchRes.groups.length === 0)) {
        exclProc.relatedCodes.forEach(code => {
          (state.D.codeIndex[code] || []).forEach(gi => {
            if (!searchRes.groups.includes(gi)) searchRes.groups.push(gi);
          });
        });
      }

      let matchedRows = (tableData.rows || []).filter(r => r.some(cell => String(cell).toLowerCase().includes(normQ)));

      let cardsHTML = '';
      if (searchRes.groups && searchRes.groups.length > 0) {
        const mainGi = searchRes.groups[0];
        cardsHTML += `
          <div style="font-size:12.5px;font-weight:900;color:var(--text);margin-bottom:8px;display:flex;align-items:center;justify-content:space-between;">
            <span>🔍 <em>'${esc(normQ)}'</em> 빠른 수술비 종합 판정 결과</span>
            <span style="font-size:11px;color:var(--brand);font-weight:850;">[${esc(co.name)}] 기준 적용</span>
          </div>
        `;
        cardsHTML += cardQuickHTML(mainGi, normQ, searchRes.matchedEdi, parsed, false);

        if (searchRes.groups.length > 1) {
          const subGis = searchRes.groups.slice(1, 5);
          cardsHTML += `
            <div style="margin:14px 0 8px 2px;font-size:12px;font-weight:850;color:var(--text-2);">
              📂 연관 질환 및 다른 질병코드 (${subGis.length}건):
            </div>
            <div class="sub-diseases-list" style="display:flex;flex-direction:column;gap:6px;">
              ${subGis.map(gi => cardQuickHTML(gi, normQ, searchRes.matchedEdi, parsed, true)).join('')}
            </div>
          `;
        }
      }

      let tableSectionHTML = '';
      if (matchedRows.length > 0) {
        tableSectionHTML = `
          <div style="margin-top:16px;background:var(--surface);border:1.5px solid var(--border);border-radius:11px;padding:12px 14px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
              <span style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:5px;">
                <span>📋 [${esc(co.name)}] 약관 별표 수술분류표 매칭 항목</span>
                <span style="font-size:11px;color:var(--brand);font-weight:850;">(${matchedRows.length}건)</span>
              </span>
            </div>
            <div class="tier-card-list" style="display:flex;flex-direction:column;gap:6px;">
              ${matchedRows.map(r => {
                const no = r[0];
                const name = r[1];
                const tier = r[2];
                const note = r[3];
                const isHighlight = String(tier).includes('⚠️') || String(note).includes('△') || String(note).includes('하향') || String(note).includes('주의');
                return `
                <div class="tier-surgery-card" style="padding:10px 12px;background:var(--surface-2);border:1px solid ${isHighlight ? '#fde68a' : 'var(--border)'};border-radius:9px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:3px;">
                    <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">
                      <span style="font-size:11px;font-weight:900;color:#334155;background:var(--surface);padding:2px 6px;border-radius:4px;flex-shrink:0;border:1px solid var(--border);">No.${esc(no)}</span>
                      <span style="font-size:13px;font-weight:900;color:var(--text);word-break:keep-all;">${esc(name)}</span>
                    </div>
                    <span style="font-size:12px;font-weight:900;color:#fff;background:${isHighlight ? '#f59e0b' : 'var(--brand)'};padding:2px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0;">${esc(tier)}</span>
                  </div>
                  ${note ? `
                    <div style="font-size:11.5px;color:${isHighlight ? '#92400e' : '#334155'};margin-top:4px;line-height:1.45;word-break:keep-all;">
                      ${esc(note)}
                    </div>` : ''}
                </div>`;
              }).join('')}
            </div>
          </div>
        `;
      }

      if (!cardsHTML && !tableSectionHTML) {
        box.innerHTML = photoHeaderHTML + chipsHTML + `
          <div style="padding:35px 20px;text-align:center;background:var(--surface);border:1px solid var(--border);border-radius:12px;color:#334155;">
            <div style="font-size:24px;margin-bottom:8px;">🔍</div>
            <div style="font-size:13.5px;font-weight:900;color:var(--text);">'${esc(normQ)}' 일치 항목이 없습니다</div>
            <div style="font-size:12px;margin-top:4px;line-height:1.4;">상단 다빈도 칩을 터치하거나 질병명(대장용종, 카티스템 등)으로 검색해 보세요.</div>
          </div>
        `;
      } else {
        box.innerHTML = photoHeaderHTML + chipsHTML + cardsHTML + tableSectionHTML;
      }

      bindClauseChipEvents(box);
      bindCardActions(box);
      bindPhotoButtons(box, rider, co, period);
      return;
    }

    // 2) Idle 상태: 100% 카드형 전수 목록 렌더링 (#27519 지침 5: 카드형/표형식하지말고 카드형으로만)
    const allRows = tableData.rows || [];
    box.innerHTML = photoHeaderHTML + chipsHTML + `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
        <div style="font-size:13px;font-weight:900;color:var(--text);">
          📑 ${esc(tableData.title)} <span style="font-size:11.5px;color:var(--brand);font-weight:800;">(총 ${allRows.length}개 조항)</span>
        </div>
        <span style="font-size:11px;font-weight:800;color:#334155;background:var(--surface-2);padding:2px 7px;border-radius:5px;border:1px solid var(--border);">모바일 카드형 뷰</span>
      </div>

      <div class="tier-card-list" style="display:flex;flex-direction:column;gap:6px;">
        ${allRows.map(r => {
          const no = r[0];
          const name = r[1];
          const tier = r[2];
          const note = r[3];
          const isHighlight = String(tier).includes('⚠️') || String(note).includes('△') || String(note).includes('하향') || String(note).includes('주의');
          return `
          <div class="tier-surgery-card" style="padding:10px 12px;background:var(--surface);border:1px solid ${isHighlight ? '#fde68a' : 'var(--border)'};border-radius:9px;box-shadow:0 1px 2px rgba(0,0,0,0.02);">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
              <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">
                <span style="font-size:11px;font-weight:900;color:#334155;background:var(--surface-2);padding:2px 6px;border-radius:4px;flex-shrink:0;">No.${esc(no)}</span>
                <span style="font-size:13px;font-weight:900;color:var(--text);word-break:keep-all;">${esc(name)}</span>
              </div>
              <span style="font-size:12px;font-weight:900;color:#fff;background:${isHighlight ? '#f59e0b' : 'var(--brand)'};padding:2px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0;">${esc(tier)}</span>
            </div>
            ${note ? `
              <div style="font-size:11.5px;color:${isHighlight ? '#92400e' : '#334155'};background:${isHighlight ? '#fffbeb' : 'var(--surface-2)'};padding:5px 8px;border-radius:6px;margin-top:4px;line-height:1.45;word-break:keep-all;border:${isHighlight ? '1px solid rgba(245,158,11,0.2)' : 'none'};">
                ${esc(note)}
              </div>` : ''}
          </div>`;
        }).join('')}
      </div>
    `;

    bindClauseChipEvents(box);
    bindPhotoButtons(box, rider, co, period);
    return;
  }

  // ─────────────────────────────────────────────────────────────
  // 3. 약관조항보기 본문 / 면책조항 (#28437 #28442 탭 전환식 완전 분리)
  // ─────────────────────────────────────────────────────────────
  let riderKey = targetRider || 'basic';
  let coId = co.id;
  let coName = co.name;
  let riderTitle = rider.title || '수술특약';

  // 현재 활성 탭 (기본값: inclusion)
  if (!window.activeClauseTab) {
    window.activeClauseTab = 'inclusion';
  }
  let curTab = window.activeClauseTab;

  // 1) 보상하는 사항 사진 및 보상제외 사항 사진 경로
  let inclusionImg = `assets/clause_imgs/${coId}_basic_inclusion.png`;
  let exclusionImg = `assets/clause_imgs/${coId}_basic_exclusion.png`;

  if (riderKey === 'tier') {
    inclusionImg = `assets/clause_imgs/${coId}_tier_inclusion.png`;
    exclusionImg = `assets/clause_imgs/${coId}_tier_exclusion.png`;
  } else if (riderKey === 'ndai' || riderKey === 'adult') {
    inclusionImg = `assets/clause_imgs/${coId}_ndai_inclusion.png`;
    exclusionImg = `assets/clause_imgs/${coId}_ndai_exclusion.png`;
  }

  // 2) 탭별 전용 조항 데이터
  let inclusionArticles = [];
  let exclusionArticles = [];

  if (riderKey === 'tier') {
    inclusionArticles = [
      {
        title: "제1조(보험금의 지급사유)",
        text: "피보험자가 이 특별약관의 보험기간 중에 질병의 치료를 직접적인 목적으로 병원 또는 의원 등에서 의사의 관리 하에 별표 [1~5종 질병수술분류표]에 정한 수술을 받은 때에는 해당 종별(1종~5종) 보험가입금액을 매 수술시마다 질병수술급여금으로 지급합니다."
      },
      {
        title: "제2조(수술의 정의 및 신의료기술 인정)",
        text: "① [수술의 정의]: 의사에 의하여 치료가 필요하다고 인정된 경우로서 기구를 사용하여 생체(生體)에 절단(切斷), 절제(切除) 등의 조작을 가하는 것을 말합니다.\n② [신의료기술]: 보건복지부 신의료기술평가위원회에서 안전성과 유효성을 인정받은 최신의료기법을 포함합니다.\n③ [제외 대상]: 흡인(Aspiration), 천자(Puncture), 신경차단술(Nerve Block), 약물주입은 수술의 정의에서 제외됩니다."
      },
      {
        title: "제3조(동일부위 동시수술 제한 규정)",
        text: "① 하나의 질병 또는 상해로 동시에 2가지 이상의 수술을 받은 경우 그 중 가장 높은 1개 종수술비만 지급합니다.\n② 단, 동일한 체강(복부, 흉부, 골반강 등) 내의 장기 동시 수술은 동일 부위로 보아 최고 1회만 지급합니다.\n③ 좌우 대칭 기관(눈, 귀, 유방, 신장, 사지 등)은 각각 독립된 신체부위로 인정하여 양측 동시 수술 시 각각 지급합니다."
      },
      {
        title: "제5조(재수술 인정 및 연간 지급한도)",
        text: "① 동일 질병이라도 수술 후 365일이 경과하여 재수술을 시행한 때에는 새로운 수술로 보아 각각 지급합니다.\n② 약관에 정한 수술별 연간 1회 한도 또는 60일 한도 규정이 있는 경우 해당 기간 내 중복 지급을 제한합니다."
      }
    ];

    exclusionArticles = [
      {
        title: "제4조(수술에서 제외하는 조치 - 면책 항목)",
        text: "다음 각 호의 조치는 약관상 수술의 정의에 포함되지 않으므로 수술비를 지급하지 않습니다:\n1. 흡인(Aspiration, 바늘이나 카테터로 체액·고름을 빨아들이는 것)\n2. 천자(Puncture, 바늘이나 카테터로 찔러서 조직이나 액체를 뽑아내는 것)\n3. 신경차단술(Nerve Block) 및 관절강내 단순 주사치료(콘쥬란·히알루론산 등)\n4. 단순 창상봉합술, 단순 소독 및 드레싱\n5. 발치(치아발치) 및 치석제거"
      },
      {
        title: "제5조(보상하지 않는 손해 - 면책사유 전수 기재)",
        text: "회사는 다음 각 호의 사유로 생긴 수술비는 1~5종 수술비를 지급하지 않습니다:\n1. 피보험자, 보험수익자 또는 계약자의 고의 또는 자해로 인한 수술\n2. 임신, 출산, 정상 자연분만, 산후기 질환 (단, 제왕절개는 특약에 따라 1종 인정)\n3. 주근깨, 다모, 사마귀, 여드름, 노화현상 탈모 등 피부질환 및 미용성형 목적 수술\n4. 단순 코골음, 포경수술, 비뇨기계 장애(요실금 등) 및 피임·불임 복원 시술\n5. 치과질환(K00~K08, 치주·치조골보철 처치) 및 한방병원·한의원 한방 비급여 처치\n6. 건강검진, 종합검진, 생검(조직검사) 등 치료를 직접 목적으로 하지 않는 검사적 진료\n7. 무면허 운전, 음주운전 및 피보험자의 범죄행위로 생긴 사고"
      }
    ];
  } else if (riderKey === 'ndai' || riderKey === 'adult') {
    inclusionArticles = [
      {
        title: "제1조(보험금의 지급사유)",
        text: "피보험자가 이 특별약관의 보험기간 중에 약관 별표 [N대 질병분류표]에 정한 질병으로 진단확정되고 그 질병의 치료를 직접적인 목적으로 병원 등에서 수술을 받은 때에는 질병군별(특정 5대, 중대 10대, 다빈도 30대, 부인과 등) 약정된 정액 보험가입금액을 지급합니다."
      },
      {
        title: "제2조(관혈수술과 비관혈수술의 정의 및 50% 감액규정)",
        text: "① [관혈(Open)수술]: 병변 부위를 육안으로 직접 보면서 수술하기 위해 피부나 점막을 절개하는 외과적 수술 (보험가입금액의 100% 전액 지급)\n② [비관혈(Non-open)수술]: 내시경, 복강경, 흉강경, 카테터 등을 이용하여 절개 범위를 최소화하는 수술 (보험가입금액의 50% 감액 지급)"
      },
      {
        title: "제3조(동시수술 및 지급한도)",
        text: "① 동일한 N대 질병 치료 목적으로 2회 이상의 수술을 받거나 동시에 2개 이상의 질병군에 해당하는 수술을 받은 때에는 가장 높은 1개 질병군의 지급금액만 지급합니다.\n② 질병군별로 연간 1회 한도 또는 매 수술시마다 지급 여부는 가입 상품별 세부 규정을 적용합니다."
      },
      {
        title: "제5조(계약일로부터 1년 미만 감액 규정)",
        text: "계약일로부터 1년 또는 2년 미만 수술 시 해당 질병군 보험금의 50%를 감액하여 지급할 수 있습니다 (회사별·상품별 세부 약관 규정 적용)."
      }
    ];

    exclusionArticles = [
      {
        title: "제4조(보상하지 않는 사항 - 면책사유 전수 기재)",
        text: "회사는 다음 각 호의 사유로 생긴 수술비는 N대 질병수술비를 지급하지 않습니다:\n1. 원인이 되는 질병이 약관 별표 [N대 질병분류표]에 명시된 한국표준질병사인분류(KCD) 코드와 일치하지 않는 경우\n2. 단순 건강검진, 종합검진, 생검(조직검사), 진단 목적의 내시경 검사 및 처치\n3. 피보험자, 보험수익자, 계약자의 고의 또는 자해로 인한 수술\n4. 흡인, 천자, 신경차단술 및 주사 바늘을 이용한 보존적 약물 투여\n5. 계약일로부터 1년 미만 감액 기간 미충족 또는 고지의무 위반으로 인한 계약 해지"
      }
    ];
  } else {
    // basic 질병수술비
    inclusionArticles = [
      {
        title: "제1조(보험금의 지급사유)",
        text: "피보험자가 이 특별약관의 보험기간 중에 질병의 치료를 직접적인 목적으로 병원 또는 의원 등에서 의사의 관리 하에 [수술]을 받은 때에는 매 수술시마다 이 특별약관의 보험가입금액을 [질병수술비]로 지급합니다."
      },
      {
        title: "제2조(수술의 정의와 장소)",
        text: "① 의사에 의하여 치료가 필요하다고 인정된 질병으로 인하여 기구를 사용하여 생체에 절단(切斷), 절제(切除) 등의 조작을 가하는 것.\n② 보건복지부 신의료기술평가위원회에서 안전성과 유효성을 인정받은 최신의료기법을 포함합니다.\n③ [흡인, 천자, 신경차단(Nerve Block)]은 수술의 정의에서 제외됩니다."
      },
      {
        title: "제3조(재수술 및 동일질병 인정기준)",
        text: "동일 질병이라도 수술 후 365일이 경과하여 재수술을 시행한 때에는 새로운 수술로 보아 각각 지급합니다. 단, 하나의 질병으로 동시 2회 이상 수술 시 1회만 지급합니다."
      }
    ];

    exclusionArticles = [
      {
        title: "제4조(보상제외 사항 - 수술에서 제외하는 조치)",
        text: "다음 각 호의 조치는 약관상 수술의 정의에 포함되지 않으므로 질병수술비를 지급하지 않습니다:\n1. 흡인(Aspiration, 바늘이나 카테터로 체액이나 고름을 빨아들이는 것)\n2. 천자(Puncture, 바늘이나 카테터로 찔러서 조직이나 액체를 뽑아내는 것)\n3. 신경차단술(Nerve Block) 및 관절강내 단순 주사치료(콘쥬란·히알루론산 등)\n4. 단순 창상봉합술, 단순 소독 및 드레싱\n5. 발치(치아발치) 및 치석제거"
      },
      {
        title: "제5조(보상하지 않는 손해 - 면책사유 전수 기재)",
        text: "회사는 다음 각 호의 사유로 생긴 수술비는 지급하지 않습니다:\n1. 피보험자, 보험수익자 또는 계약자의 고의 또는 자해\n2. 임신, 출산, 정상 자연분만, 산후기 관련 질환 (단, 제왕절개는 특약에 따라 1종 인정)\n3. 주근깨, 다모, 사마귀, 여드름, 노화현상 탈모 등 피부질환 및 미용성형 목적 수술\n4. 단순 코골음, 포경수술, 비뇨기계 장애(요실금 등) 및 피임·불임 복원 시술\n5. 치과질환(K00~K08, 치주·치조골보철 처치) 및 한방병원·한의원 한방 비급여 처치\n6. 건강검진, 종합검진, 생검(조직검사) 등 치료를 직접 목적으로 하지 않는 검사적 진료\n7. 무면허 운전, 음주운전 및 피보험자의 범죄행위로 생긴 사고"
      }
    ];
  }

  // 활성 탭에 따른 데이터 분기 (#28437 #28442)
  let activeList = (curTab === 'exclusion') ? exclusionArticles : inclusionArticles;
  let activeImg = (curTab === 'exclusion') ? exclusionImg : inclusionImg;
  let activeImgTitle = (curTab === 'exclusion') ? `🚫 [${co.shortName || co.name}] ${riderTitle.split(' ')[0]} 보상제외 약관` : `📋 [${co.shortName || co.name}] ${riderTitle.split(' ')[0]} 보상기준 약관`;

  if (normQ) {
    activeList = activeList.filter(a => a.title.toLowerCase().includes(normQ) || a.text.toLowerCase().includes(normQ));
  }

  // 회사별·상품별 핵심 차별화 요소 하이라이터 (#32220 #32253)
  const formatClauseDiffHTML = (rawText, isExclusionTab) => {
    let t = esc(rawText);
    const isLife = co.isLife || co.id.includes('life');

    // 1) 제왕절개 (임신/출산 O코드)
    if (t.includes('제왕절개') || t.includes('임신') || t.includes('출산')) {
      if (isLife) {
        t = t.replace(/(단, 제왕절개는 [^\n\r\)]+)/g, '<mark style="background:#dcfce7;color:#15803d;padding:2px 6px;border-radius:5px;font-weight:900;border:1px solid #86efac;">⚡ [생보 우위] 제왕절개 1종 정상 지급</mark>');
      } else {
        if (isExclusionTab) {
          t = t.replace(/(임신, 출산, 정상 자연분만[^\n\r]*)/g, '<mark style="background:#fee2e2;color:#991b1b;padding:2px 6px;border-radius:5px;font-weight:900;border:1px solid #fca5a5;">🚫 [손보 면책] 임신·출산·제왕절개(O00~O99) 부지급</mark> <span style="font-size:11px;color:#64748b;">(단, 1~5종 특약에서 1종 인정)</span>');
        }
      }
    }

    // 2) 비관혈 수술 (내시경, 복강경, 흉강경, 카테터)
    if (t.includes('비관혈') || t.includes('내시경, 복강경')) {
      if (isLife) {
        t = t.replace(/(내시경, 복강경 등 비관혈 수술에 대한 50% 감액 조항이 없어 가입금액 100% 전액을 지급합니다)/g, '<mark style="background:#e0f2fe;color:#0369a1;padding:2px 6px;border-radius:5px;font-weight:900;border:1px solid #7dd3fc;">💎 [생보 N대 우위] 비관혈 수술도 감액 없이 100% 전액 지급!</mark>');
      } else {
        t = t.replace(/(보험가입금액의 50% 감액 지급)/g, '<mark style="background:#ffedd5;color:#9a3412;padding:2px 6px;border-radius:5px;font-weight:900;border:1px solid #fdba74;">⚠️ [손보 N대 규정] 비관혈 50% 감액 지급</mark>');
      }
    }

    // 3) 체외충격파 쇄석술
    if (t.includes('체외충격파') || t.includes('쇄석술')) {
      t = t.replace(/(체외충격파쇄석술[^\n\r]*)/g, '<mark style="background:#fef3c7;color:#92400e;padding:2px 6px;border-radius:5px;font-weight:900;border:1px solid #fcd34d;">⚡ [회사별 지급기준 차이] 체외충격파 쇄석술 (1종 인정 및 회수제한 확인)</mark>');
    }

    // 4) 치핵(K64) 및 요실금(N39)
    if (t.includes('치핵') || t.includes('요실금')) {
      if (isLife) {
        t = t.replace(/(치핵[^\n\r]*|요실금[^\n\r]*)/g, '<mark style="background:#dcfce7;color:#15803d;padding:2px 6px;border-radius:5px;font-weight:900;border:1px solid #86efac;">⚡ [생보 우위] 치핵 1종 / 요실금 2종 지급</mark>');
      } else {
        if (isExclusionTab) {
          t = t.replace(/(비뇨기계 장애\(요실금 등\)[^\n\r]*)/g, '<mark style="background:#fee2e2;color:#991b1b;padding:2px 6px;border-radius:5px;font-weight:900;border:1px solid #fca5a5;">🚫 [질병수술 면책] 요실금(N39) 부지급</mark>');
        }
      }
    }

    // 5) 현대해상 암수술 4종 하향 개정
    if (co.id === 'hyundai' && (t.includes('암') || t.includes('악성신생물'))) {
      t = t.replace(/(암|악성신생물)/g, '<mark style="background:#f3e8ff;color:#6b21a8;padding:1px 5px;border-radius:4px;font-weight:900;">⚠️ [현대해상] 비관혈 암수술 4종 (타사 5종 대조)</mark>');
    }

    return t;
  };

  // 상단 회사별 실무 보상 분기점 요약 카드 (#32220 #32253)
  const isLifeCo = co.isLife || co.id.includes('life');
  const diffSummaryHTML = `
    <div style="background:rgba(49,130,246,0.05);border:1.5px solid rgba(49,130,246,0.22);border-radius:10px;padding:12px 14px;margin-bottom:12px;">
      <div style="font-size:12.5px;font-weight:900;color:var(--brand);margin-bottom:6px;display:flex;align-items:center;gap:6px;">
        <span>⚡</span>
        <span>[${esc(co.name)}] 실무 보상 분기점 · 타사 대비 핵심 차이점</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;font-size:11.8px;line-height:1.5;color:var(--text);">
        <div style="display:flex;align-items:flex-start;gap:6px;">
          <span style="font-weight:900;color:${isLifeCo ? '#15803d' : '#b91c1c'};white-space:nowrap;">① 제왕절개:</span>
          <span>${isLifeCo ? '<strong style="color:#15803d;">생보 1종 정상 지급</strong> (손보 질병수술비 부지급 대비 강력 우위)' : '<strong style="color:#b91c1c;">질병수술비 부지급(면책)</strong> (단, 1~5종 수술특약에서 1종 인정)'}</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:6px;">
          <span style="font-weight:900;color:${isLifeCo ? '#0369a1' : '#c2410c'};white-space:nowrap;">② 비관혈 수술:</span>
          <span>${isLifeCo ? '<strong style="color:#0369a1;">비관혈 100% 전액 지급</strong> (손보 N대와 달리 복강경·내시경 50% 감액 조항 없음)' : '<strong style="color:#c2410c;">N대 비관혈 50% 감액</strong> (내시경·복강경·카테터 시 가입금액의 50%만 지급)'}</span>
        </div>
        <div style="display:flex;align-items:flex-start;gap:6px;">
          <span style="font-weight:900;color:#92400e;white-space:nowrap;">③ 체외충격파:</span>
          <span>신장·요관결석 쇄석술(ESWL) 연간 1회(또는 60일 1회) 한도 및 1종 지급 (구계약 2종 대조 필수)</span>
        </div>
        ${co.id === 'hyundai' ? `
        <div style="display:flex;align-items:flex-start;gap:6px;background:#fdf4ff;padding:4px 6px;border-radius:6px;border:1px solid #f0abfc;">
          <span style="font-weight:900;color:#86198f;white-space:nowrap;">⚠️ 현대해상 단독:</span>
          <span style="color:#701a75;"><strong>비관혈 암수술 4종 하향 개정</strong> (타사 5종 유지와 결정적 차이, 심사 필수 대조)</span>
        </div>` : ''}
      </div>
    </div>
  `;

  box.innerHTML = `
    <!-- 2대 탭 전환 버튼: [보상하는 사항] vs [보상제외 사항] (#28437 #28442) -->
    <div style="margin-bottom:12px;">
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:10px;">
        <button type="button" id="tabClauseInclusion" style="height:46px;border-radius:10px;border:${curTab === 'inclusion' ? '2.5px solid var(--brand)' : '1.5px solid var(--border)'};background:${curTab === 'inclusion' ? 'rgba(49,130,246,0.1)' : 'var(--surface)'};color:${curTab === 'inclusion' ? 'var(--brand)' : 'var(--text-2)'};font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:${curTab === 'inclusion' ? '0 2px 8px rgba(49,130,246,0.2)' : 'none'};transition:all .15s ease;">
          <span style="white-space:nowrap;">📄 보상하는 사항</span>
        </button>
        <button type="button" id="tabClauseExclusion" style="height:46px;border-radius:10px;border:${curTab === 'exclusion' ? '2.5px solid #dc2626' : '1.5px solid var(--border)'};background:${curTab === 'exclusion' ? 'rgba(220,38,38,0.1)' : 'var(--surface)'};color:${curTab === 'exclusion' ? '#dc2626' : 'var(--text-2)'};font-size:13px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:${curTab === 'exclusion' ? '0 2px 8px rgba(220,38,38,0.2)' : 'none'};transition:all .15s ease;">
          <span style="white-space:nowrap;">🚫 보상제외 사항</span>
        </button>
      </div>

      <!-- 선택된 탭의 실제약관 원문 고해상도 사진 보기 버튼 (#28455) -->
      <button type="button" class="btn-co-clause" id="btnActiveClausePhoto" style="width:100%;height:46px;padding:0 14px;border:1.5px solid ${curTab === 'exclusion' ? '#fca5a5' : 'var(--border)'};border-radius:10px;background:var(--surface);display:flex;align-items:center;justify-content:space-between;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <span class="btn-co-name" style="font-size:13px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;">
          <span>${curTab === 'exclusion' ? '🚫' : '📋'}</span>
          <span>${esc(co.name)} [${curTab === 'exclusion' ? '보상하지 않는 사항' : '보상하는 사항'}] 약관 원문</span>
        </span>
        <span class="btn-co-badge" style="font-size:11.5px;font-weight:900;color:${curTab === 'exclusion' ? '#dc2626' : '#d97706'};background:${curTab === 'exclusion' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.12)'};padding:3px 7px;border-radius:6px;">
          약관 보기 🔍
        </span>
      </button>
    </div>

    <!-- 상단 실무 보상 분기점 카드 (#32220 #32253) -->
    ${diffSummaryHTML}

    <!-- 약관 조항 텍스트 리스트 (선택된 탭에 속한 조항만 출력) -->
    <div class="clause-article-list" style="display:flex;flex-direction:column;gap:10px;">
      ${activeList.length > 0 ? activeList.map(a => `
        <div class="clause-article-card" style="background:var(--surface);border:1.5px solid ${curTab === 'exclusion' ? 'rgba(220,38,38,0.25)' : 'var(--border)'};border-radius:10px;padding:12px 14px;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="font-size:13.5px;font-weight:900;color:${curTab === 'exclusion' ? '#dc2626' : 'var(--text)'};margin-bottom:6px;display:flex;align-items:center;gap:6px;">
            <span style="color:${curTab === 'exclusion' ? '#dc2626' : 'var(--brand)'};">§</span>
            <span>${esc(a.title)}</span>
          </div>
          <div style="font-size:12.5px;color:var(--text-2);line-height:1.65;word-break:keep-all;white-space:pre-line;">
            ${formatClauseDiffHTML(a.text, curTab === 'exclusion')}
          </div>
        </div>
      `).join('') : `
        <div style="padding:30px 20px;text-align:center;background:var(--surface);border:1px solid var(--border);border-radius:12px;color:#334155;">
          <div style="font-size:24px;margin-bottom:8px;">🔍</div>
          <div style="font-size:13.5px;font-weight:900;color:var(--text);">'${esc(normQ)}' 조항 검색 결과가 없습니다</div>
        </div>
      `}
    </div>
  `;

  // 탭 전환 이벤트 바인딩
  const btnTabInc = box.querySelector('#tabClauseInclusion');
  const btnTabExc = box.querySelector('#tabClauseExclusion');
  const btnPhoto = box.querySelector('#btnActiveClausePhoto');

  if (btnTabInc) {
    btnTabInc.addEventListener('click', () => {
      window.activeClauseTab = 'inclusion';
      renderClauseModalContent(filterQ, data);
    });
  }
  if (btnTabExc) {
    btnTabExc.addEventListener('click', () => {
      window.activeClauseTab = 'exclusion';
      renderClauseModalContent(filterQ, data);
    });
  }
  if (btnPhoto) {
    btnPhoto.addEventListener('click', () => {
      const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[co.id.replace('fire', '').replace('life', '')]);
      if (!coEntry) {
        alert(`🏢 [${co.name}] 공시실 공식 실물 약관 원문 수집·검증 진행 중입니다.\n\n타사 약관 인용이나 임의 합성 이미지는 일절 제공하지 않으며, 각 보험사 공시실에서 검증된 원본 페이지만 순차적으로 정확하게 반영됩니다.`);
        return;
      }

      const isSimp = (data.pData && data.pData.name && data.pData.name.includes('간편')) || (data.ptype === 'simplified');
      const v = (isSimp && coEntry.simplified) ? coEntry.simplified : (coEntry.standard || coEntry.simplified || coEntry);

      let targetScan = null;
      let modalTitle = '';

      if (riderKey === 'tier') {
        if (curTab === 'exclusion') {
          targetScan = v.tier_exc || v.basic_exc;
          modalTitle = `🚫 [${co.name}] 1~5종 수술특약 보상제외 약관`;
        } else {
          targetScan = v.tier_inc || v.tier_table || v.basic_inc;
          modalTitle = `📋 [${co.name}] 1~5종 수술특약 보상기준 약관`;
        }
      } else if (riderKey === 'ndai' || riderKey === 'adult') {
        const cleanNdaiName = (data.selectedNdai || riderTitle || 'N대').replace(/\d+대\/\d+대/, m => m.split('/')[0]);
        if (curTab === 'exclusion') {
          targetScan = v.ndai_exc || v.basic_exc;
          modalTitle = `🚫 [${co.name}] ${cleanNdaiName} 보상제외 약관`;
        } else {
          targetScan = v.ndai_inc || v.basic_inc;
          modalTitle = `🏢 [${co.name}] ${cleanNdaiName} 보상기준 약관`;
        }
      } else {
        if (curTab === 'exclusion') {
          targetScan = v.basic_exc;
          modalTitle = `🚫 [${co.name}] 질병수술비 보상제외 약관`;
        } else {
          targetScan = v.basic_inc;
          modalTitle = `💡 [${co.name}] 질병수술비 보상기준 약관`;
        }
      }

      if (targetScan && targetScan.pages && targetScan.pages.length > 0) {
        const meta = { product: v.product, type: v.type, page: targetScan.pageStr };
        window.openRulesModal(targetScan.pages[0], modalTitle, '', targetScan.pages, meta);
      } else if (v.basic_p1) {
        const pages = [v.basic_p1];
        if (v.basic_p2) pages.push(v.basic_p2);
        const meta = { product: v.product, type: v.type, page: v.basic_page };
        window.openRulesModal(v.basic_p1, modalTitle, '', pages, meta);
      } else {
        alert(`🏢 [${co.name}] 공시실 공식 실물 약관 원문 수집·검증 진행 중입니다.`);
      }
    });
  }
}

function bindPhotoButtons(box, rider, co, period) {
  if (!box) return;
  const btnPost = box.querySelector('.btn-tier-rev-photo[data-rev="post"]');
  const btnPre = box.querySelector('.btn-tier-rev-photo[data-rev="pre"]');
  const btnSingle = box.querySelector('.btn-tier-single-photo');

  if (btnPost) {
    btnPost.addEventListener('click', () => {
      const postObj = (rider.revPhotos || []).find(p => p.isPost) || (rider.revPhotos || [])[0];
      const src = postObj ? postObj.src : rider.imgSrc;
      window.openRulesModal(src, `📋 [${co.name}] 1-5종 수술분류표 [개정 후 약관 사진]`, period.revSummary);
    });
  }
  if (btnPre) {
    btnPre.addEventListener('click', () => {
      const preObj = (rider.revPhotos || []).find(p => !p.isPost) || (rider.revPhotos || [])[1];
      const src = preObj ? preObj.src : rider.imgSrc;
      window.openRulesModal(src, `📋 [${co.name}] 1-5종 수술분류표 [개정 전 약관 사진]`, period.revSummary);
    });
  }
  if (btnSingle) {
    btnSingle.addEventListener('click', () => {
      const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[co.id.replace('fire', '').replace('life', '')]);
      const v = (coEntry && (coEntry.standard || coEntry.simplified)) || coEntry;
      if (v && v.tier_table && v.tier_table.pages) {
        const meta = { product: v.product, type: v.type, page: v.tier_table.pageStr };
        window.openRulesModal(v.tier_table.pages[0], `📋 [${co.name}] 1~5종 수술분류표 공식 원문`, period.revSummary, v.tier_table.pages, meta);
      } else if (v && v.tier_p1) {
        const pages = [v.tier_p1];
        if (v.tier_p2) pages.push(v.tier_p2);
        const meta = { product: v.product, type: v.type, page: v.tier_page };
        window.openRulesModal(v.tier_p1, `📋 [${co.name}] ${period.periodStr} · 1-5종 수술분류표 원문`, period.revSummary, pages, meta);
      } else {
        alert(`🏢 [${co.name}] 공시실 공식 실물 약관 원문 수집·검증 진행 중입니다.`);
      }
    });
  }
}

function generateClauseCopyText(data) {
  if (!data) return '';
  const { co, period, pData, rider, targetRider, viewMode } = data;
  const lines = [];
  lines.push(`[${co.name} (${co.shortName})] ${period.periodStr} · ${pData.name}`);
  lines.push(`■ 담보명: ${rider.title}`);
  if (period.revSummary) {
    lines.push(`※ 개정 포인트: ${period.revSummary}`);
  }
  lines.push('');

  if (viewMode === 'table') {
    const tableData = rider.tableBody;
    if (tableData) {
      lines.push(`[${tableData.title}]`);
      tableData.rows.forEach(r => {
        lines.push(`• ${r.join(' | ')}`);
      });
    }
  } else if (viewMode === 'basic_exclusion') {
    const excl = rider.exclusion;
    if (excl) {
      lines.push('[보상제외 면책조항 전문]');
      lines.push(excl.quote);
    }
  } else {
    const clauseObj = targetRider === 'basic' ? (rider.inclusion || rider) : rider.clauseBody;
    if (clauseObj) {
      lines.push('[약관 원문]');
      lines.push(clauseObj.quote);
    }
  }
  return lines.join('\n');
}

window.bindClausesTab = bindClausesTab;
window.renderClausesCompanyList = renderClausesCompanyList;


window.renderDisputesList = renderDisputesList;
window.__DEBUG = { state, search, runQuickSearch };

})();
const COMPANY_NDAI_PERIOD_MAP = {
  meritz: {
    'meritz_2024_12': ['112대', '120대', '131대'],
    'meritz_2020_04': ['112대', '82대', '80대'],
    'meritz_2020_03_prior': ['64대', '62대', '30대', '18대', '7대']
  },
  hyundai: {
    'hyundai_2024_01': ['124대', '120대', '119대'],
    'hyundai_2018_06': ['123대', '120대', '71대'],
    'hyundai_2018_prior': ['71대', '16대', '특정5대']
  },
  dbinsure: {
    'db_2026_05': ['120대', '119대'],
    'db_2020_07': ['116대', '106대', '77대'],
    'db_2020_prior': ['21대', '18대', '16대']
  },
  kbinsure: {
    'kb_2024_01': ['120대', '116대', '112대'],
    'kb_2020_10': ['112대', '101대'],
    'kb_2020_prior': ['21대']
  },
  samsungfire: {
    'samsung_2024_01': ['116대', '114대', '111대'],
    'samsung_2020_04': ['111대', '105대', '68대'],
    'samsung_2020_prior': ['21대', '15대']
  },
  hanwhafire: {
    'hanwha-p0': ['124대', '116대'],
    'hanwha-p1': ['116대', '7대기관'],
    'hanwha-p2': ['7대생활']
  },
  heungkukfire: {
    'heungkuk-p0': ['신142대', '신70대'],
    'heungkuk-p1': ['신70대'],
    'heungkuk-p2': ['신70대']
  },
  nhfire: {
    'nh-p0': ['144대', '112대'],
    'nh-p1': ['144대'],
    'nh-p2': ['144대']
  },
  lotte: {
    'lotte-p0': ['142대', '112대'],
    'lotte-p1': ['142대'],
    'lotte-p2': ['142대']
  },
  hanafire: {
    'hana-p0': ['136대'],
    'hana-p1': ['73대', '15대'],
    'hana-p2': ['73대']
  },
  samsunglife: {
    'samsunglife-p0': ['153대', '7대주요', '7대성인'],
    'samsunglife-p1': ['153대', '7대성인'],
    'samsunglife-p2': ['7대성인']
  },
  hanwhalife: {
    'hanwhalife-p0': ['104대', '70대', '23대', '13대'],
    'hanwhalife-p1': ['70대', '23대'],
    'hanwhalife-p2': ['23대', '13대']
  },
  kyobo: {
    'kyobo-p0': ['36대', '25대'],
    'kyobo-p1': ['36대', '25대'],
    'kyobo-p2': ['25대']
  },
  shinhan: {
    'shinhan-p0': ['100대', '30대'],
    'shinhan-p1': ['30대'],
    'shinhan-p2': ['30대']
  },
  kblife: {
    'kblife-p0': ['7대', '5대'],
    'kblife-p1': ['7대'],
    'kblife-p2': ['5대']
  },
  mirae: {
    'mirae-p0': ['88대', '30대'],
    'mirae-p1': ['30대'],
    'mirae-p2': ['30대']
  },
  dongyang: {
    'dongyang-p0': ['N대(260대)', '61대'],
    'dongyang-p1': ['61대'],
    'dongyang-p2': ['61대']
  },
  heungkuklife: {
    'heungkuklife-p0': ['130대', '40대'],
    'heungkuklife-p1': ['40대'],
    'heungkuklife-p2': ['40대']
  },
  abllife: {
    'abllife-p0': ['77대', '30대'],
    'abllife-p1': ['30대'],
    'abllife-p2': ['30대']
  },
  lina: {
    'lina-p0': ['7대', '5대'],
    'lina-p1': ['7대'],
    'lina-p2': ['5대']
  }
};


