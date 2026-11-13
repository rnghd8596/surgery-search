/* 스캔·공시 자료에서 직접 읽은 내용만 수록한다.
   이미지와 문장이 다르면 이미지가 우선이다. 확인하지 못한 금액·종수·상품명은 넣지 않는다. */
window.CLAUSE_SOURCE_NOTES = {
  industryExample: {
    title: '수술의 정의 — 감독당국 안내 예시 (특정 회사 상품 아님)',
    source: '보험연구원 주간포커스(2024-12-23)에 인용된 금융감독원 소비자 안내의 약관 예시',
    url: 'https://kiri.or.kr/PDF/weeklytrend/20241223/trend20241223_7.pdf',
    text: '제O조(수술의 정의) 이 약관에서 “수술”이라 함은 의료기관에서 의사가 기구를 사용하여 생체에 절단, 절제 등의 조작을 가하는 것을 말하며, 흡인, 천자 등의 조치 및 신경 차단(Nerve Block)은 제외합니다.\n절단: 특정 부위를 잘라 내는 것. 절제: 특정 부위를 잘라 없애는 것. 흡인: 주사기 등으로 빨아들이는 것. 천자: 바늘 또는 관을 꽂아 체액·조직을 뽑아내거나 약물을 주입하는 것.\n같은 자료는 약관에 수술분류표가 있으면, 그 표에 없는 치료는 수술보험금 대상이 아닐 수 있다고 안내합니다. 개별 상품 약관이 이 예시와 다를 수 있습니다.'
  }
};

window.MERITZ_DISEASE_SURGERY_2210 = {
  scanTitle: '16. 갱신형 질병수술비보장 특별약관',
  pages: ['assets/clause_imgs/meritz_std_basic_inc_p245.png', 'assets/clause_imgs/meritz_std_basic_exc_p246.png', 'assets/clause_imgs/meritz_std_basic_exc_p247.png'],
  note: '저장소 스캔 제245~247쪽을 읽은 전사입니다. 상품 표지 상품명은 이 세 쪽에 인쇄되어 있지 않아 여기 적지 않습니다. 2024년 12월 분류표 개정과의 선후는 이 스캔만으로 확정하지 않습니다. 제247쪽은 시력교정 항목에서 이어지며 그 뒤 쪽은 이 전사에 없습니다.',
  inclusion: `제1조(보험금의 지급사유)
회사는 보험증권에 기재된 피보험자가 이 특별약관의 보험기간 중에 진단확정된 질병의 치료를 직접적인 목적으로 제3조(수술의 정의와 장소)에서 정한 수술을 받은 경우에는 보험수익자에게 이 특별약관의 보험가입금액을 질병수술비로 지급합니다.

제2조(보험금 지급에 관한 세부규정)
① 같은 질병으로 두 종류 이상의 질병수술을 받거나 같은 종류의 질병수술을 2회 이상 받은 경우에는 하나의 질병수술비만 지급합니다. 다만, 질병수술을 받고 365일이 경과한 후 같은 질병으로 새로운 수술을 받은 경우에는 다른 질병으로 보고 제1조에 따라 질병수술비를 지급합니다.
② 보험수익자와 회사가 제1조의 보험금 지급사유에 대해 합의하지 못할 때는 보험수익자와 회사가 함께 제3자를 정하고 그 제3자의 의견에 따를 수 있습니다. 제3자는 의료법 제3조(의료기관)에 규정된 종합병원 소속 전문의 중에 정하며, 보험금 지급사유 판정에 드는 의료비용은 회사가 전액 부담합니다.

제3조(수술의 정의와 장소)
① 이 특별약관에서 「수술」이라 함은 의사, 치과의사 또는 한의사의 면허를 가진 자(이하 「의사」라 합니다)가 치료가 필요하다고 인정한 경우로서 의사의 관리하에 치료를 직접적인 목적으로 기구를 사용하여 생체(生體)에 절단(切斷, 특정부위를 잘라 내는 것), 절제(切除, 특정부위를 잘라 없애는 것) 등의 조작을 가하는 것을 말합니다.
② 제1항의 「수술」은 자택 등에서의 치료가 곤란하여 의료법 제3조(의료기관) 제2항에 정한 국내의 병원, 의원 또는 국외의 의료관련법에 정한 의료기관에서 행한 것에 한합니다.
③ 제1항의 「수술」에는 보건복지부 산하 신의료기술평가위원회 또는 이에 준하는 기관으로부터 안전성과 치료효과를 인정받은 최신 수술기법으로 생체에 절단, 절제 등의 조작을 가하는 수술도 포함됩니다.
【신의료기술평가위원회】 의료법 제54조(신의료기술평가위원회의 설치 등)에 의거 설치된 위원회로서 신의료기술에 관한 최고의 심의기구를 말합니다.`,
  exclusion: `제3조 제4항·제5항 (스캔 제246쪽)
④ 제1항에도 불구하고 녹내장 및 당뇨병성 망막병증 등 눈 질환의 직접적인 치료를 목적으로 하는 경우 레이저(Laser) 수술을 포함합니다. 다만, 다래끼, 콩다래끼 또는 선천성 질환으로 인한 레이저 수술은 제외합니다.
⑤ 제1항의 수술에서 아래에 정한 사항은 제외합니다.
1. 흡인(吸引, 주사기 등으로 빨아들이는 것)
2. 천자(穿刺, 바늘 또는 관을 꽂아 체액·조직을 뽑아내거나 약물을 주입하는 것) 등의 조치
3. 신경(神經)차단(NERVE BLOCK)
4. 미용성형 목적의 수술
5. 피임(避妊) 목적의 수술, 피임(避妊) 및 불임술 후 가임 목적의 수술
6. 검사 및 진단을 위한 수술(생검(生檢), 복강경검사(腹腔鏡檢査) 등)
7. 기타 수술의 정의에 해당하지 않는 시술
【기타 수술의 정의에 해당하지 않는 시술(예시)】
- 체외 충격파 쇄석술
- 창상봉합술(단, 변연절제술을 포함한 창상봉합술은 보상)
- 절개 또는 배농술
- 도관삽입술
- 전기소작술 또는 냉동응고술, 고주파열응고술
- IPL(Intense Pulsed Light): 아이피엘 레이저 시술
- 치수절제술 등, 치, 치은, 치조골의 처치
- 기타 이와 유사한 시술

제4조(보험금을 지급하지 않는 사유) (스캔 제246~247쪽, 제247쪽은 앞부분이 잘린 채로 시작)
① 회사는 다음 중 어느 한 가지로 보험금 지급사유가 발생한 때에는 보험금을 지급하지 않습니다.
1. 피보험자가 고의로 자신을 해친 경우. 다만, 피보험자가 심신상실 등으로 자유로운 의사결정을 할 수 없는 상태에서 자신을 해친 경우에는 보험금을 지급합니다.
2. 보험수익자가 고의로 피보험자를 해친 경우. 다만, 그 보험수익자가 보험금의 일부 보험수익자인 경우에는 다른 보험수익자에 대한 보험금은 지급합니다.
3. 계약자가 고의로 피보험자를 해친 경우
4. 전쟁, 외국의 무력행사, 혁명, 내란, 사변, 폭동
② 회사는 제8차 한국표준질병사인분류에 있어서 아래의 질병수술비에 대하여는 보상하지 않습니다. (제247쪽에서 확인된 항목)
- 정신 및 행동장애(F04~F99)
- 여성생식기의 비염증성 장애로 인한 습관성 유산, 불임 및 인공수정관련 합병증(N96~N98)
- 피보험자가 임신, 출산(제왕절개를 포함합니다), 산후기로 수술한 경우(O00~O99)
- 선천기형, 변형 및 염색체이상(Q00~Q99)
- 비만(E66)
- 요실금(N39.3, N39.4, R32)
- 비뇨기계장애 및 직장 또는 항문관련질환, 치핵 및 항문주위정맥의 혈전증(K60~K62, K64)
- 치아우식증, 치아 및 치주질환 등의 치과질환(K00~K08)
③ 회사는 아래의 목적의 치료를 위한 질병수술비에 대하여는 보상하지 않습니다.
1. 건강검진, 예방접종, 인공유산
2. 영양제, 비타민제, 호르몬 투여, 보신용 투약, 친자 확인을 위한 진단, 불임검사, 불임수술, 불임복원술, 보조생식술(체내, 체외 인공수정을 포함합니다), 성장촉진과 관련된 수술
3. 단순한 피로 또는 권태
4. 주근깨, 다모, 무모, 백모증, 딸기코(주사비), 점(모반, 피보험자의 가입나이가 태아인 경우 화염상모반 등 선천성 비신생물성모반(Q82.5)은 보상합니다), 사마귀, 여드름, 노화현상으로 인한 탈모 등 피부질환
5. 발기부전(impotence)·불감증, 단순 코골음(수면무호흡증(G47.3)은 보상합니다), 치료를 동반하지 않는 단순 포경(phimosis), 「국민건강보험 요양급여의 기준에 관한 규칙」 제9조 제1항([별표2]비급여대상)에 따른 업무 또는 일상생활에 지장이 없는 검열반 등 안과질환
6. 신체의 필수 기능개선 목적이 아닌 외모개선 목적의 치료를 위한 수술
- 쌍꺼풀수술(이중검수술). 다만, 안검하수, 안검내반 등을 치료하기 위한 시력개선 목적의 이중검수술은 보상합니다. 코성형수술(융비술), 유방확대(다만, 유방암 환자의 유방재건술은 보상합니다)·축소술, 지방흡입술(다만, 「국민건강보험법」 및 관련 고시에 따라 요양급여에 해당하는 ‘여성형 유방증’은 수술하면서 그 일련의 과정으로 시행한 지방흡입술은 보상합니다), 주름살제거술 등
- 사시교정, 안와격리증(양쪽 눈을 감싸고 있는 뼈와 뼈 사이의 거리가 넓은 증상)의 교정 등 시력계 수술로서 시력개선 목적이 아닌 외모개선 목적의 수술
- 안경, 콘택트렌즈 등을 대체하기 위한 시력교정술`
};

window.applyClauseAudit = function applyClauseAudit() {
  if (window.__clauseAudited) return;
  window.__clauseAudited = true;
  const data = window.POLICY_CLAUSES_DATA;
  if (!data) return;
  const all = [...(data.nonLife || []), ...(data.life || [])];
  const buckets = new Map();

  function remember(text, coId, target) {
    const key = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 96);
    if (key.length < 24) return;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ coId, target });
  }

  all.forEach(co => {
    (co.periods || []).forEach(period => {
      const types = period.types || {};
      Object.keys(types).forEach(tk => {
        const riders = types[tk] && types[tk].riders;
        if (!riders) return;
        Object.keys(riders).forEach(rk => {
          const rider = riders[rk];
          ['inclusion', 'exclusion', 'clauseBody'].forEach(field => {
            if (rider[field] && rider[field].quote) {
              if (!rider[field].verification) rider[field].verification = 'unverified-summary';
              remember(rider[field].quote, co.id, rider[field]);
            }
          });
        });
      });
    });
  });

  buckets.forEach(list => {
    const cos = new Set(list.map(x => x.coId));
    if (cos.size >= 2) {
      list.forEach(x => {
        if (x.target.verification !== 'scan-transcript') x.target.verification = 'unverified-shared';
      });
    }
  });

  const meritz = all.find(c => c.id === 'meritz');
  const pack = window.MERITZ_DISEASE_SURGERY_2210;
  if (meritz && pack) {
    (meritz.periods || []).forEach(period => {
      const types = period.types || {};
      Object.keys(types).forEach(tk => {
        const basic = types[tk] && types[tk].riders && types[tk].riders.basic;
        if (!basic) return;
        const incSrc = basic.inclusion && basic.inclusion.imgSrc;
        const linked = incSrc === pack.pages[0]
          || period.id === 'meritz_2022_04'
          || period.id === 'meritz_2024_12';
        if (!linked || tk !== 'standard') return;
        basic.inclusion = basic.inclusion || {};
        basic.exclusion = basic.exclusion || {};
        basic.inclusion.officialTranscript = pack.inclusion;
        basic.exclusion.officialTranscript = pack.exclusion;
        basic.inclusion.verification = 'scan-transcript';
        basic.exclusion.verification = 'scan-transcript';
        basic.inclusion.transcriptSource = pack.pages[0] + ' · ' + pack.scanTitle;
        basic.exclusion.transcriptSource = pack.pages[1] + ', ' + pack.pages[2];
        basic.transcriptNote = pack.note;
        basic.verifiedConditions = [
          { kind: '지급', text: '진단확정된 질병의 직접 치료 목적 수술 시 보험가입금액을 질병수술비로 지급. 같은 질병은 365일 이내 1회.' },
          { kind: '정의', text: '절단·절제 조작. 신의료기술평가위원회가 안전성·치료효과를 인정한 최신 수술기법 포함. 자택 시술은 제외.' },
          { kind: '제외시술', text: '흡인, 천자, 신경차단, 미용성형, 피임·불임 후 가임, 검사·진단 수술(생검·복강경검사). 체외충격파쇄석술, 단순 창상봉합, 절개·배농, 도관삽입, 전기소작·냉동·고주파열응고, IPL, 치수·치은·치조골 처치.' },
          { kind: '레이저', text: '녹내장·당뇨병성 망막병증 등 눈 질환의 직접 치료 레이저는 포함. 다래끼·콩다래끼·선천성 질환 레이저는 제외.' },
          { kind: '코드면책', text: 'F04~F99, N96~N98, 임신·출산(제왕절개 포함)·산후기 O00~O99, Q00~Q99, 비만 E66, 요실금 N39.3·N39.4·R32, 치핵 등 K60~K62·K64, 치과 K00~K08.' },
          { kind: '목적면책', text: '건강검진·예방접종·인공유산, 불임·보조생식, 단순 피로, 점·사마귀·여드름 등. 태아 계약의 선천성 비신생물성모반(Q82.5)과 수면무호흡(G47.3)은 보상한다고 적혀 있음.' },
          { kind: '외모', text: '쌍꺼풀·융비·유방확대·축소·지방흡입·주름제거·시력교정술은 외모개선 목적이면 미보상. 안검하수·안검내반, 유방암 재건, 요양급여 대상 여성형 유방증 수술에 수반된 지방흡입은 예외로 적혀 있음.' }
        ];
      });
    });
  }

  const map = window.COMPANY_NDAI_PERIOD_MAP || {};
  const alias = {
    kyobolife: 'kyobo', shinhanlife: 'shinhan', miraelife: 'mirae',
    dongyang: 'donga', abllife: 'abl', linalife: 'lina'
  };
  all.forEach(co => {
    const key = map[co.id] ? co.id : alias[co.id];
    const bucket = key && map[key];
    if (!bucket) return;
    const found = new Set(co.ndaiKeywords || []);
    Object.keys(bucket).forEach(pid => {
      (bucket[pid] || []).forEach(label => {
        found.add(label);
        const num = String(label).replace(/[^0-9]/g, '');
        if (num) found.add(num);
      });
    });
    co.ndaiKeywords = [...found];
  });
};

window.ndaiOptionsForCompany = function ndaiOptionsForCompany(cid, pid, title) {
  const map = window.COMPANY_NDAI_PERIOD_MAP || {};
  const alias = {
    kyobolife: 'kyobo', shinhanlife: 'shinhan', miraelife: 'mirae',
    dongyang: 'donga', abllife: 'abl', linalife: 'lina'
  };
  const key = map[cid] ? cid : (alias[cid] && map[alias[cid]] ? alias[cid] : null);
  let options = (key && map[key] && map[key][pid]) ? map[key][pid].slice() : [];
  if (!options.length) {
    const titleMatch = String(title || '').match(/(\d+대)/g);
    if (titleMatch && titleMatch.length) options = [...new Set(titleMatch)];
  }
  return options;
};

window.clauseVerifyBadgeHTML = function clauseVerifyBadgeHTML(status) {
  if (status === 'scan-transcript') {
    return '<span class="vbadge ok">스캔 원문 전사</span>';
  }
  if (status === 'unverified-shared') {
    return '<span class="vbadge bad">여러 회사 동일 문구 · 미검증</span>';
  }
  if (status === 'missing') {
    return '<span class="vbadge bad">원문 미확보</span>';
  }
  return '<span class="vbadge warn">요약 · 원문 미검증</span>';
};
