/* ══════════════════════════════════════════════════════════
   보험비서 수술비 사전 — app.js (v20261109a)
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
  'R3221': { codes: ['N20', 'N21', 'N22', 'N23'], name: '체외충격파쇄석술(ESWL)', tier: '생보 2종 (손보 면책 다수)' },
  // 척추 및 치과 신의료기술/다빈도
  'O1441': { codes: ['J34.8', 'J34.2'], name: '비밸브재건술', tier: '2~3종' },
  'O1451': { codes: ['J32'], name: '풍선카테터부비동확장술', tier: '2종' },
  'N0321': { codes: ['M51', 'M50'], name: '경피적 척추디스크감압술(고주파/레이저)', tier: '3종' },
  'N0331': { codes: ['M80', 'S22', 'S32'], name: '경피적 척추체성형술(골시멘트)', tier: '3종' },
  'U1010': { codes: ['K08.1', 'K08'], name: '치조골이식술(골이식술)', tier: '2종 (표준 1~5종 33항)' }
};

/* ───────────────────────── 유사 명칭 직관 비교 (체외충격파 vs 쇄석술 등) ───────────────────────── */
const COMPARISON_PAIRS = [
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
  const [d, e, x, b, t] = await Promise.all([
    fetch('assets/data/diseases.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/edi.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/exc.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/bunri.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)),
    fetch('assets/data/tiers.dat').then(r => r.arrayBuffer()).then(buf => decryptBlob(buf, key)).catch(() => null),
  ]);
  return { d, e, x, b, t };
}

/* ───────────────────────── 인덱스 빌드 ───────────────────────── */
let idx = { name: [], syn: [], edi: [], tier: [], tierCode: new Map() };

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
function switchTab(tabKey, targetQ = '') {
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
    if (targetQ) {
      if ($('#q-quick')) $('#q-quick').value = targetQ;
      state.quickQ = targetQ;
      if ($('#clearBtn-quick')) $('#clearBtn-quick').hidden = false;
      runQuickSearch(targetQ);
    } else {
      // 다른 메뉴 갔다 오면 검색창 및 결과 리셋
      if ($('#q-quick')) $('#q-quick').value = '';
      state.quickQ = '';
      if ($('#clearBtn-quick')) $('#clearBtn-quick').hidden = true;
      renderIdleQuick();
    }
    $('#q-quick')?.focus();
  } else if (tabKey === 'tier') {
    if (targetQ) {
      if ($('#q-tier')) $('#q-tier').value = targetQ;
      state.tierQ = targetQ;
      if ($('#clearBtn-tier')) $('#clearBtn-tier').hidden = false;
      runTierSearch(targetQ);
    } else {
      // 다른 메뉴 갔다 오면 검색창 및 결과 리셋
      if ($('#q-tier')) $('#q-tier').value = '';
      state.tierQ = '';
      if ($('#clearBtn-tier')) $('#clearBtn-tier').hidden = true;
      renderTierEmptyExample();
    }
    $('#q-tier')?.focus();
  } else if (tabKey === 'ndai') {
    if (targetQ) {
      if ($('#q-ndai')) $('#q-ndai').value = targetQ;
      state.ndaiQ = targetQ;
      if ($('#clearBtn-ndai')) $('#clearBtn-ndai').hidden = false;
      runNdaiSearch(targetQ);
    } else {
      // 다른 메뉴 갔다 오면 검색창 및 결과 리셋
      if ($('#q-ndai')) $('#q-ndai').value = '';
      state.ndaiQ = '';
      if ($('#clearBtn-ndai')) $('#clearBtn-ndai').hidden = true;
      renderNdaiEmptyExample();
    }
    $('#q-ndai')?.focus();
  } else if (tabKey === 'ocr') {
    // 사진으로 검색 탭 리셋
    if ($('#ocrInput')) $('#ocrInput').value = '';
    if ($('#ocrPreviewBox')) $('#ocrPreviewBox').hidden = true;
    if ($('#ocrResults')) $('#ocrResults').innerHTML = '';
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

  // 암/악성 vs 양성 질환 의도 구분 (자궁암 검색 시 평활근종 배제 등)
  const isCancerQuery = /(암|악성|신생물|카르시노마|육종|림프종|백혈병)/.test(nq) || /^C\d/.test(up);
  const isBenignQuery = /(근종|양성|폴립|용종|결절|비대|낭종)/.test(nq);

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
    const targets = syn.main || syn.codes || [];
    targets.forEach((cp, rank) => {
      for (const code in state.D.codeIndex) {
        if (code === cp || code.startsWith(cp)) {
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
      ${raw ? `<span style="font-size:11px;font-weight:750;color:var(--text-3);">${esc(raw)}</span>` : ''}
    </div>`;
}

function renderTierMatchCards(ids, q) {
  if (!ids || !ids.length) return '';
  const rows = ids.map(i => idx.tier[i]).filter(Boolean);
  if (!rows.length) return '';

  const cards = rows.map(t => {
    const bothNone = (t.x3 === 0 && t.x5 === 0);
    const junNote = (t.j3 || t.j5)
      ? `<div style="font-size:11.5px;color:var(--text-2);font-weight:700;line-height:1.5;margin-top:6px;">‘준용’은 원문 분류표의 해당 항목 종수를 그대로 적용한다는 뜻입니다${t.r3 ? ' (3종 분류표 ' + esc(t.r3) + '번 항목)' : ''}${t.r5 ? ' (5종 분류표 ' + esc(t.r5) + '번 항목)' : ''}.</div>`
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

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
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
          근거: 3종·5종 수술특약 표준 분류표(32개 부위) · 수술확인서·진료비 세부산정내역서의 수술코드가 위 코드와 일치하면 이 종수로 청구됩니다.
        </div>
      </div>
    </article>`;
  }).join('');

  return `
    <div style="display:flex;align-items:center;gap:8px;margin:16px 3px 8px;">
      <span style="font-size:13px;font-weight:900;color:var(--text);">🔖 수술코드 분류표 판정</span>
      <span style="font-size:11px;font-weight:750;color:var(--text-3);">수술코드·수술명 직접 매칭</span>
    </div>` + cards;
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

  const compHTML = compPair ? renderComparisonPairHTML(compPair) : '';
  const exclHTML = exclProc ? renderExcludedProcedureHTML(exclProc) : '';
  const tierHTML = renderTierMatchCards(res.tiers, q);

  const head = `
    <div class="res-head">
      <div>
        <div class="res-title"><em>${esc(q)}</em> 빠른 판정 결과</div>
        ${subInfo}
      </div>
      <div class="res-count">${res.groups.length ? `분류 ${res.groups.length}건` : ""}${res.groups.length && (res.tiers||[]).length ? " · " : ""}${(res.tiers||[]).length ? `수술코드 ${res.tiers.length}건` : ""}</div>
    </div>`;

  if (!res.groups.length && !res.edi.length && !compPair && !exclProc && !tierHTML) {
    box.innerHTML = head + `
      <div class="empty">
        <span class="empty-emoji">🔍</span>
        <h3>“${esc(q)}”에 대한 결과가 없습니다</h3>
        <p>질병명 · 수술명 · 질병코드로 다시 검색해 보세요.</p>
      </div>`;
    return;
  }

  let html = head + tierHTML + compHTML + exclHTML;
  if (res.groups.length > 0) {
    if (exclProc && exclProc.relatedCodes && exclProc.relatedCodes.length > 0) {
      html += `<div style="font-size:12.5px;font-weight:900;color:var(--text);margin:14px 0 8px 4px;">💡 연관 질환 정식 수술비 보장 내역 (${esc(exclProc.relatedDisease)})</div>`;
    }
    html += res.groups.slice(0, 12).map(i => cardQuickHTML(i, q, res.matchedEdi, parsed)).join('');
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
      title: '유로리프트(결찰술) vs 절제술(TURP/홀렙) 종수 구분',
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
    id: 'eswl_hyundai_tier',
    name: '체외충격파쇄석술(ESWL) 보험사·특약별 종수',
    match: (g) => {
      const codes = g.c || [];
      const hasNCode = codes.some(c => ['N20', 'N21', 'N22', 'N23'].some(t => c.startsWith(t)));
      const hasName = (g.n || '').includes('결석') || (g.g || '').includes('결석');
      const hasVs = (g.vs || []).some(v => v.includes('쇄석') || v.includes('ESWL'));
      return hasNCode || hasName || hasVs;
    },
    standardTier: '2종',
    revisions: [
      { co: '현대해상', ym: 202208, label: '현대해상 일반형(1종) vs 질병수술Ⅱ(2종)', matchKeys: ['현대', '현해'] }
    ],
    evaluate: function(cosInput, year, month) {
      const cosList = parseCosList(cosInput);
      const isHyundai = cosList.some(co => ['현대', '현해'].some(k => co.toLowerCase().includes(k)));
      const isMeritz = cosList.some(co => ['메리츠', '멜츠'].some(k => co.toLowerCase().includes(k)));

      if (cosList.length === 1 && !isHyundai) {
        return {
          tier: '2종',
          hasDiff: false,
          note: `${cosList[0]} 체외충격파쇄석술 2종 지급 (60일 이내 1회 한)`,
          boxHTML: `
            <div class="rev-alert-box blue">
              <div class="rab-title">✓ ${cosList[0]} 체외충격파쇄석술 [2종 지급]</div>
              <div class="rab-desc" style="color:var(--text-2);margin-top:2px;">
                1~5종 수술분류표에 따라 <b>2종</b>으로 지급됩니다. (수술개시일부터 60일 이내 2회 이상 수술은 1회로 간주)<br>
                ※ 물리치료인 <b>체외충격파치료술(ESWT)은 전사 제외</b>입니다.
              </div>
            </div>`
        };
      }

      return {
        tier: isHyundai ? '1·2종' : '2종',
        hasDiff: true,
        diffBadge: '[특약별 상이]',
        note: '생보 2종 / 메리츠 87항 2종 / 현대해상 일반형 85항 1종 vs 질병Ⅱ 85항 2종 (정액수술비는 부지급)',
        boxHTML: `
          <div class="rev-alert-box">
            <div class="rab-title">⚠️ 체외충격파쇄석술(ESWL) 보험사·특약별 종수 확인 (필수)</div>
            <div class="rab-card">
              <div class="rab-row">
                <span class="rab-label">생명보험 전사 & 메리츠화재 (제87항)</span>
                <span class="rab-val blue">2종 지급 (60일 내 1회)</span>
              </div>
              <div class="rab-row">
                <span class="rab-label">현대해상 질병수술Ⅱ / 회당지급형</span>
                <span class="rab-val blue">제85항 2종 지급</span>
              </div>
              <div class="rab-row">
                <span class="rab-label">현대해상 일반형 1~5종 (과거 약관)</span>
                <span class="rab-val orange">제85항 1종 지급</span>
              </div>
              <div class="rab-row">
                <span class="rab-label">기본 정액 질병수술비 (손보 공통)</span>
                <span class="rab-val red">부지급 (수술정의 제외)</span>
              </div>
            </div>
            <div class="rab-desc">※ 약관 분류표 본문상 <b>체외충격파치료술(ESWT)은 전사 제외</b>이나, <b>체외충격파쇄석술(ESWL)</b>은 종수술비에서 1종 또는 2종으로 지급됩니다.</div>
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
              <div class="rev-alert-box">
                <div class="rab-title">⚠️ ${revItem.co} 가입시기별 종수 기준</div>
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
      badge: '❌ 정액 전사 보상제외 (면책)',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.25)',
      bg: 'rgba(239, 68, 68, 0.05)',
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
      badge: '❌ 정액 전사 보상제외 (면책)',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.25)',
      bg: 'rgba(239, 68, 68, 0.05)',
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
      badge: '❌ 정액 전사 보상제외 (면책)',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.25)',
      bg: 'rgba(239, 68, 68, 0.05)',
      title: '기본 질병수술비 (정액)',
      summary: '전사 면책: 임신·출산·제왕절개(O코드) 보상 제외',
      tierSummary: '1~5종: ⭕ 제54항 제왕절개만출술 1종 지급',
      hasDetail: true
    };
  }

  // 4. 체외충격파쇄석술 (ESWL / N20~N23)
  if (codes.some(c => ['N20', 'N21', 'N22', 'N23'].some(t => c.startsWith(t))) || name.includes('결석') || vs.some(v => v.includes('쇄석') || v.includes('ESWL'))) {
    return {
      status: 'no',
      badge: '❌ 원칙 부지급 (약관별 상이)',
      badgeColor: '#d97706',
      badgeBg: 'rgba(217, 119, 6, 0.1)',
      border: 'rgba(217, 119, 6, 0.25)',
      bg: 'rgba(217, 119, 6, 0.05)',
      title: '기본 질병수술비 (정액)',
      summary: '절단·절제 미충족: 삼성·KB·현대 등 제외 (DB 등 일부 증권 확인)',
      tierSummary: '1~5종: ⭕ 생보/메리츠/삼성/KB 제87항 2종 (현대 일반형 1종, 질병수술Ⅱ 2종)',
      hasDetail: true
    };
  }

  // 5. 백내장 (H25, H26)
  if (codes.some(c => c.startsWith('H25') || c.startsWith('H26')) || name.includes('백내장') || vs.some(v => v.includes('다초점') || v.includes('인공수정체'))) {
    return {
      status: 'warning',
      badge: '⚠️ 가입 특약명 확인 필수',
      badgeColor: '#d97706',
      badgeBg: 'rgba(217, 119, 6, 0.1)',
      border: 'rgba(217, 119, 6, 0.25)',
      bg: 'rgba(217, 119, 6, 0.05)',
      title: '기본 질병수술비 (정액)',
      summary: '삼성 질수Ⅳ 및 KB 질수(백내장제외) 등 제외형 특약 주의',
      tierSummary: '1~5종: ⭕ 제71항 백내장·수정체 관혈수술 1종 (다초점·단초점 무관)',
      hasDetail: true
    };
  }

  // 6. 통상 질환 (정상 지급)
  return {
    status: 'yes',
    badge: '⭕ 정상 보장 가능',
    badgeColor: '#d97706',
    badgeBg: 'rgba(217, 119, 6, 0.1)',
    border: 'rgba(217, 119, 6, 0.3)',
    bg: 'rgba(217, 119, 6, 0.05)',
    title: '기본 질병수술비 (정액)',
    summary: '표준약관상 기구를 사용한 생체 절단·절제 충족 시 정상 지급',
    tierSummary: '1~5종: ⭕ 수술분류표 기준 해당 종수 지급',
    hasDetail: false
  };
}

function getNdaiVerdictSummary(g) {
  if (!g) return { badge: '확인 필요', summary: 'N대 담보 확인', badgeColor: 'var(--text-3)', bg: 'var(--surface-2)', border: 'var(--border)' };
  const { cos } = matchInfo(g);
  if (cos && cos.size > 0) {
    const majorCos = ['현대해상', 'KB손해보험', '메리츠화재', '삼성화재', 'DB손해보험'];
    const matchedMajors = majorCos.filter(m => Array.from(cos.keys()).some(k => k.includes(m.slice(0, 2))));
    const count = cos.size;
    const majorText = matchedMajors.length >= 3 ? `주요 5대 손보사 및 ${count}개사 해당` : `${count}개 보험사 해당`;
    return {
      covered: true,
      badge: `⭕ ${count}개사 N대 해당`,
      badgeColor: '#059669',
      bg: 'rgba(16, 185, 129, 0.05)',
      border: 'rgba(16, 185, 129, 0.25)',
      summary: majorText
    };
  } else {
    return {
      covered: false,
      badge: '⚠️ N대 특약 미해당',
      badgeColor: 'var(--text-3)',
      bg: 'var(--surface-2)',
      border: 'var(--border)',
      summary: '주요 손보사 N대 특약 분류표 미포함 (종수술비 청구)'
    };
  }
}

function renderBasicSurgeryBox(info) {
  if (!info) return '';
  return `
    <div class="basic-surg-summary-card" style="background:${info.bg};border:1px solid ${info.border};border-radius:10px;padding:9px 12px;margin:8px 0 4px 0;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;flex-wrap:wrap;gap:4px;">
        <span style="font-size:12px;font-weight:900;color:var(--text);">💡 기본 질병수술비(정액) 판정</span>
        <span style="font-size:11px;font-weight:850;color:${info.badgeColor};background:var(--surface);padding:2px 7px;border-radius:5px;border:1px solid ${info.border};">${esc(info.badge)}</span>
      </div>
      <div style="font-size:11.5px;color:var(--text);font-weight:750;line-height:1.45;">${esc(info.summary)}</div>
      <div style="font-size:11px;color:var(--text-2);margin-top:3px;line-height:1.4;">${esc(info.tierSummary)}</div>
      ${info.hasDetail ? `<div style="font-size:10.5px;color:var(--brand);margin-top:4px;font-weight:750;">↳ 회사별 상세 약관 원문은 아래 [지급기준근거 ∨]에서 확인 가능</div>` : ''}
    </div>`;
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

  const diffPillHTML = evalRes.diffBadge
    ? `<span class="judge-diff-pill" style="font-size:10.5px;padding:2px 6px;">⚠️ ${esc(evalRes.diffBadge.replace(/[\[\]]/g, ''))}</span>`
    : '';

  const basicSurg = getBasicSurgerySummary(g);
  const ndaiVerdict = getNdaiVerdictSummary(g);

  return `
  <article class="card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <span class="kcd-badge-big">${g.c.slice(0, 3).join(', ')}</span>
        <h3 class="card-name">${hl(g.n, q)}</h3>
      </div>

      ${ediBanner}

      <!-- 빠른검색 3대 핵심 담보 판정 (질수 · 종수 · N대) -->
      <div class="quick-3verdict-box" style="display:flex;flex-direction:column;gap:6px;margin:8px 0 6px 0;">
        <!-- 1. 질수 (기본 질병수술비/정액) -->
        <div class="qvb-row" style="background:rgba(245,158,11,0.06);border:1.5px solid rgba(245,158,11,0.3);border-radius:10px;padding:9px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="display:flex;flex-direction:column;gap:2px;min-width:0;">
            <span style="font-size:12.5px;font-weight:900;color:#d97706;white-space:nowrap;">💡 질수 (기본질병수술)</span>
            <span style="font-size:11px;color:var(--text-2);line-height:1.35;">${esc(basicSurg.summary)}</span>
          </div>
          <span style="font-size:11px;font-weight:850;color:${basicSurg.badgeColor};background:var(--surface);padding:3px 7px;border-radius:5px;border:1px solid ${basicSurg.border};white-space:nowrap;flex-shrink:0;">${esc(basicSurg.badge)}</span>
        </div>

        <!-- 2. 종수 (1~5종 종수술비) -->
        <div class="qvb-row" style="background:rgba(49,130,246,0.05);border:1.5px solid rgba(49,130,246,0.25);border-radius:10px;padding:9px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="display:flex;flex-direction:column;gap:2px;min-width:0;">
            <span style="font-size:12.5px;font-weight:900;color:#2563eb;white-space:nowrap;">📋 종수 (1~5종 종수술)</span>
            <span style="font-size:11px;color:var(--text-2);line-height:1.35;">${esc(t.w || g.n + ' 수술')} <span style="color:var(--text-3);font-size:10.5px;">(${esc(evalRes.note)})</span></span>
          </div>
          <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
            ${diffPillHTML}
            <span class="proc-tag ${'t' + (parseInt(evalRes.tier) || 2)}" style="font-size:12px;font-weight:900;padding:3px 8px;border-radius:5px;">${esc(evalRes.tier)}</span>
          </div>
        </div>

        <!-- 3. N대 (N대 질병수술비) -->
        <div class="qvb-row" style="background:rgba(16,185,129,0.05);border:1.5px solid rgba(16,185,129,0.25);border-radius:10px;padding:9px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <div style="display:flex;flex-direction:column;gap:2px;min-width:0;">
            <span style="font-size:12.5px;font-weight:900;color:#059669;white-space:nowrap;">🏢 N대 (N대 질병수술)</span>
            <span style="font-size:11px;color:var(--text-2);line-height:1.35;">${esc(ndaiVerdict.summary)}</span>
          </div>
          <span style="font-size:11px;font-weight:850;color:${ndaiVerdict.badgeColor};background:var(--surface);padding:3px 7px;border-radius:5px;border:1px solid ${ndaiVerdict.border};white-space:nowrap;flex-shrink:0;">${esc(ndaiVerdict.badge)}</span>
        </div>
      </div>

      ${evalRes.boxHTML}
      ${procsHTML}

      <div style="font-size:11.5px;color:#db2777;font-weight:800;text-align:center;margin:8px 0;background:rgba(236,72,153,0.06);border:1px solid rgba(236,72,153,0.22);border-radius:9px;padding:7px 10px;">
        🔍 상세 내용은 지급기준근거 및 바로가기 확인
      </div>

      <!-- 정밀 진단 바로가기 버튼 2종 -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:8px;padding-top:8px;border-top:1px dashed var(--line);">
        <button type="button" class="btn-jump-action btn-jump-tier" data-q="${esc(g.n)}">
          <span>📋 종수술비 바로가기 →</span>
        </button>
        <button type="button" class="btn-jump-action btn-jump-ndai" data-q="${esc(g.n)}">
          <span>🏢 N대질병 바로가기 →</span>
        </button>
      </div>
    </div>

    <div class="card-actions">
      <button class="card-toggle">
        <span>지급기준근거 ∨</span>
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
        <button type="button" class="f-chip ex-btn" data-q="베나실" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">베나실</button>
        <button type="button" class="f-chip ex-btn" data-q="하이푸" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">하이푸</button>
        <button type="button" class="f-chip ex-btn" data-q="유로리프트" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">유로리프트</button>
        <button type="button" class="f-chip ex-btn" data-q="맘모톰" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">맘모톰</button>
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
    $$('#tierMonthGrid .m-chip').forEach(b => b.classList.remove('on'));
    const tierDateBody = $('#tierDateBody');
    const tierCoBody = $('#tierCoBody');
    if (tierDateBody) tierDateBody.style.display = 'none';
    if ($('#tierDateToggleIcon')) $('#tierDateToggleIcon').textContent = '펼치기 ∨';
    if (tierCoBody) tierCoBody.style.display = 'none';
    if ($('#tierCoToggleIcon')) $('#tierCoToggleIcon').textContent = '펼치기 ∨';
    updateTierBadges();
  }

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

  const compHTML = compPair ? renderComparisonPairHTML(compPair) : '';
  const exclHTML = exclProc ? renderExcludedProcedureHTML(exclProc) : '';
  const tierHTML = renderTierMatchCards(res.tiers, q);

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> 종수술비 정밀 결과 <span style="font-size:11.5px;color:var(--brand);font-weight:700;">[${esc(cLabel)} · ${esc(dtText)}]</span></div>
      <div class="res-count">${res.groups.length ? `분류 ${res.groups.length}건` : ""}${res.groups.length && (res.tiers||[]).length ? " · " : ""}${(res.tiers||[]).length ? `수술코드 ${res.tiers.length}건` : ""}</div>
    </div>
    ${familyBarHTML}`;

  if (!res.groups.length && !res.edi.length && !compPair && !exclProc && !tierHTML) {
    box.innerHTML = head + `
      <div class="empty">
        <span class="empty-emoji">🔍</span>
        <h3>“${esc(q)}”에 대한 결과가 없습니다</h3>
        <p>질병코드 · 수술코드 · 질병명으로 다시 검색해 보세요.</p>
      </div>`;
    return;
  }

  let html = head + tierHTML + compHTML + exclHTML;
  if (res.groups.length > 0) {
    if (exclProc && exclProc.relatedCodes && exclProc.relatedCodes.length > 0) {
      html += `<div style="font-size:12.5px;font-weight:900;color:var(--text);margin:14px 0 8px 4px;">💡 연관 질환 정식 종수술비 보장 내역 (${esc(exclProc.relatedDisease)})</div>`;
    }
    html += res.groups.slice(0, 15).map(i => cardTierHTML(i, q, res.matchedEdi)).join('');
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

  const diffPillHTML = evalRes.diffBadge
    ? `<span class="judge-diff-pill">⚠️ ${esc(evalRes.diffBadge.replace(/[\[\]]/g, ''))}</span>`
    : '';

  return `
  <article class="card" data-gi="${gi}">
    <div class="card-head">
      <div class="card-top">
        <span class="kcd-badge-big">${g.c.slice(0, 3).join(', ')}</span>
        <h3 class="card-name">${hl(g.n, q)}</h3>
      </div>

      ${ediBanner}

      <div class="judge-box">
        <div class="judge-head-meta">
          <span class="meta-type">1~5종 종수술비 정밀 판정</span>
          <span class="meta-co">${esc(co ? co : '전사 기준')}</span>
        </div>
        <div class="judge-main-row">
          <span class="proc-tag ${'t' + (parseInt(evalRes.tier) || 2)} judge-tier-badge">${esc(evalRes.tier)}</span>
          <div class="judge-main-info">
            <div class="judge-proc-title">${esc(g.n)} 수술</div>
            ${diffPillHTML}
            <div class="judge-sub-note">${esc(evalRes.note)}</div>
          </div>
        </div>
        ${evalRes.boxHTML}
        ${procsHTML}
      </div>

      <!-- 질병수술비 확인 및 N대질병 바로가기 버튼 2종 -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);">
        <button type="button" class="btn-toggle-basic-surg">
          <span>💡 질병수술비 요약 ▾</span>
        </button>
        <button type="button" class="btn-jump-action btn-jump-ndai" data-q="${esc(g.n)}">
          <span>🏢 N대질병 바로가기 →</span>
        </button>
      </div>
      <div class="basic-surg-drawer" style="display:none;margin-top:8px;">
        ${renderBasicSurgeryBox(getBasicSurgerySummary(g))}
      </div>
    </div>

    <div class="card-actions">
      <button class="card-toggle">
        <span>지급기준근거 ∨</span>
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
  if (!box) return;
  box.innerHTML = `
    <div style="margin-top:6px;border:1.5px dashed var(--line);border-radius:16px;padding:16px 14px;background:var(--surface);text-align:left;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <span style="font-size:12px;font-weight:900;color:#059669;background:rgba(16,185,129,0.1);padding:4px 9px;border-radius:6px;">💡 N대 질병수술비 검색 예시</span>
        <span style="font-size:11px;color:var(--text-3);font-weight:700;">검색어를 입력하면 N대 특약이 나와요</span>
      </div>

      <div style="background:var(--surface-2);border-radius:14px;padding:13px;border:1px solid var(--border);margin-bottom:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <div style="font-size:15px;font-weight:900;color:var(--text);">맘모톰 절제술 (D24)</div>
          <div style="background:#059669;color:#fff;padding:4px 10px;border-radius:8px;font-size:13px;font-weight:900;">N대 해당</div>
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
        <button type="button" class="f-chip ndai-ex-btn" data-q="베나실" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">베나실</button>
        <button type="button" class="f-chip ndai-ex-btn" data-q="하이푸" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">하이푸</button>
        <button type="button" class="f-chip ndai-ex-btn" data-q="유로리프트" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">유로리프트</button>
        <button type="button" class="f-chip ndai-ex-btn" data-q="맘모톰" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">맘모톰</button>
        <button type="button" class="f-chip ndai-ex-btn" data-q="대장용종" style="padding:6px 11px;font-size:12px;font-weight:850;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);">대장용종</button>
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
    if (ndaiTreeBody && ndaiTreeBody.style.display !== 'none') renderNdaiTree();
  }

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
  const tierHTML = renderTierMatchCards(res.tiers, q);

  const head = `
    <div class="res-head">
      <div class="res-title"><em>${esc(q)}</em> N대 수술비 판정 <span style="font-size:11.5px;color:#8b5cf6;font-weight:800;">[${esc(cLabel)}${esc(tLabel)}]</span></div>
      <div class="res-count">${res.groups.length ? `분류 ${res.groups.length}건` : ""}${res.groups.length && (res.tiers||[]).length ? " · " : ""}${(res.tiers||[]).length ? `수술코드 ${res.tiers.length}건` : ""}</div>
    </div>
    ${familyBarHTML}`;

  if (!res.groups.length && !compPair && !exclProc && !tierHTML) {
    box.innerHTML = head + `
      <div class="empty">
        <span class="empty-emoji">🔍</span>
        <h3>“${esc(q)}”에 대한 N대 수술비 결과가 없습니다</h3>
      </div>`;
    return;
  }

  let html = head + tierHTML + compHTML + exclHTML;
  if (res.groups.length > 0) {
    if (exclProc && exclProc.relatedCodes && exclProc.relatedCodes.length > 0) {
      html += `<div style="font-size:12.5px;font-weight:900;color:var(--text);margin:14px 0 8px 4px;">💡 연관 질환 정식 N대 질병수술비 보장 내역 (${esc(exclProc.relatedDisease)})</div>`;
    }
    html += res.groups.slice(0, 15).map(i => cardNdaiHTML(i, q)).join('');
  }
  box.innerHTML = html;
  bindCardActions(box);
  bindNdaiCodeExpand(box);

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

function cardNdaiHTML(gi, q) {
  const g = state.D.g[gi];
  const { cos } = matchInfo(g);
  const cosList = state.ndaiCos && state.ndaiCos.length ? state.ndaiCos : (state.ndaiCo ? [state.ndaiCo] : []);
  const nTier = state.ndaiTier;

  let contentHTML = '';

  if (cosList.length > 0) {
    const tierBadge = nTier ? ` ${nTier}` : '';
    const blocks = cosList.map(c => {
      const items = formatNdaItemsForCo(g, c, nTier);
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
              <span style="font-size:11px;background:rgba(16,185,129,0.12);color:#059669;padding:2px 7px;border-radius:6px;font-weight:800;">보장 해당</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;">
              ${items.map(it => `
                <div class="ndai-item-block">
                  <div class="ndai-item-row btn-expand-ndai-codes" data-ri="${it.ri}" data-si="${it.si}" data-co="${esc(it.co)}" data-sub="${esc(it.subClean)}">
                    <div class="nir-left">
                      <span class="nir-bullet">•</span>
                      <span class="nir-tier-text">${esc(it.tierText)}</span>
                      <span class="nir-sub-underline"><u>[${esc(it.subClean)}]</u></span>
                    </div>
                    <span class="nir-toggle-tag">질병코드 보기 ▾</span>
                  </div>
                  <div class="ndai-codes-drawer" style="display:none;"></div>
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

    contentHTML = `
      <div style="margin-top:4px;">
        <div style="font-size:11px;font-weight:800;color:var(--text-3);margin-bottom:6px;">🏢 선택하신 회사별 N대 보장 결과:</div>
        ${blocks}
        <div style="font-size:11px;color:var(--text-3);margin-top:4px;">각 회사별 증권에 기재된 가입금액 한도로 각각 지급됩니다.</div>
      </div>`;
  } else {
    const majorCos = ['현대해상', 'KB손해보험', '메리츠화재', '삼성화재', 'DB손해보험', 'NH농협손해보험'];
    const otherCos = Array.from(cos.keys()).filter(c => !majorCos.some(m => c.includes(m.slice(0, 2))));
    const previewCos = [...majorCos, ...otherCos];
    const previewItems = [];
    previewCos.forEach(c => {
      if (previewItems.length >= 8) return;
      const items = formatNdaItemsForCo(g, c, nTier);
      if (items.length > 0) previewItems.push(items[0]);
    });

    if (previewItems.length > 0) {
      contentHTML = `
        <div class="ndai-res-box covered" style="border-left:4px solid #059669;margin-top:8px;background:var(--surface);">
          <div class="ndai-res-status" style="color:#059669;font-size:13px;font-weight:850;margin-bottom:8px;">
            <span>✓ 주요 ${cos.size}개 보험사 N대 질병수술비 보장 해당</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:6px;">
            ${previewItems.map(it => `
              <div class="ndai-item-block">
                <div class="ndai-item-row btn-expand-ndai-codes" data-ri="${it.ri}" data-si="${it.si}" data-co="${esc(it.co)}" data-sub="${esc(it.subClean)}">
                  <div class="nir-left">
                    <span class="nir-bullet">•</span>
                    <b class="nir-co-name">${esc(it.co)}:</b>
                    <span class="nir-tier-text">${esc(it.tierText)}</span>
                    <span class="nir-sub-underline"><u>[${esc(it.subClean)}]</u></span>
                  </div>
                  <span class="nir-toggle-tag">질병코드 보기 ▾</span>
                </div>
                <div class="ndai-codes-drawer" style="display:none;"></div>
              </div>
            `).join('')}
          </div>
          <div style="font-size:11px;color:var(--text-3);padding-left:2px;">상단에서 보험사를 선택하시면 해당 회사의 증권 특약별 상세 판정을 비교할 수 있습니다.</div>
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
        <span class="kcd-badge-big">${g.c.slice(0, 3).join(', ')}</span>
        <h3 class="card-name">${hl(g.n, q)}</h3>
      </div>
      ${contentHTML}

      <!-- 질병수술비 확인 및 종수술비 바로가기 버튼 2종 -->
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--line);">
        <button type="button" class="btn-toggle-basic-surg">
          <span>💡 질병수술비 요약 ▾</span>
        </button>
        <button type="button" class="btn-jump-action btn-jump-tier" data-q="${esc(g.n)}">
          <span>📋 종수술비 바로가기 →</span>
        </button>
      </div>
      <div class="basic-surg-drawer" style="display:none;margin-top:8px;">
        ${renderBasicSurgeryBox(getBasicSurgerySummary(g))}
      </div>
    </div>

    <div class="card-actions">
      <button class="card-toggle">
        <span>지급기준근거 ∨</span>
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
        <div style="font-weight:850;color:#8b5cf6;font-size:13.5px;margin-bottom:8px;">
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
        label.textContent = isHidden ? '💡 질병수술비 요약 ▴' : '💡 질병수술비 요약 ▾';
      }
    });
  });

  // 빠른검색 카드에서 정밀진단으로 즉시 점프
  $$('.btn-jump-tier', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = btn.dataset.q;
      switchTab('tier', q);
    });
  });

  $$('.btn-jump-ndai', box).forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const q = btn.dataset.q;
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
         · 3종·5종 수술특약 표준 분류표 <b>${tr.toLocaleString()}건</b> (${trA}개 부위) — 부위별 EDI 수술코드 3종·5종 종수 즉시 판정<br>
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
      const toggleTag = btn.querySelector('.nir-toggle-tag');

      const isOpen = drawer.style.display === 'block';
      if (isOpen) {
        drawer.style.display = 'none';
        if (toggleTag) toggleTag.textContent = '질병코드 보기 ▾';
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
      if (toggleTag) toggleTag.textContent = '질병코드 닫기 ∧';

      const closeBtn = drawer.querySelector('.ncd-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          drawer.style.display = 'none';
          if (toggleTag) toggleTag.textContent = '질병코드 보기 ▾';
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

})();
