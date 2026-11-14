// 가입시기 옆 사족 문구(최신, 구, 황금기 등) 전면 생략 헬퍼 (#36954 #36959)
function cleanPeriodStr(str) {
  if (!str) return '';
  return str.replace(/\s*\([^)]*(?:최신|구|황금기|개정|표준|시기|계약)[^)]*\)/g, '').trim();
}

window.getNdaiDiseasesForGroup = function(coName, ndaiStr, grpName) {
  const st = (typeof state !== 'undefined' ? state : (window.__DEBUG && window.__DEBUG.state));
  const riders = st && st.D && st.D.riders;
  const groups = st && st.D && st.D.g;
  if (!riders || !groups) return [];

  const coShort = (coName || '').replace(/화재|해상|손해보험|생명|보험/g, '').trim();
  const ndaiNum = (ndaiStr || '').match(/\d+/)?.[0] || '';

  const grpMatches = (grpName || '').match(/(\d+)대/g);
  const targetGrpDigits = grpMatches ? grpMatches.map(m => m.replace('대', '')) : [];

  const candidateRiders = [];
  riders.forEach((r, ri) => {
    const rCo = (r.co || '').replace(/화재|해상|손해보험|생명|보험/g, '').trim();
    if (!rCo.includes(coShort) && !coShort.includes(rCo)) return;
    const rNum = (r.rider || '').match(/\d+/)?.[0] || '';
    if (ndaiNum && rNum && rNum !== ndaiNum) return;
    candidateRiders.push({ ri, r });
  });

  if (candidateRiders.length === 0) {
    riders.forEach((r, ri) => {
      const rCo = (r.co || '').replace(/화재|해상|손해보험|생명|보험/g, '').trim();
      if (rCo.includes(coShort) || coShort.includes(rCo)) candidateRiders.push({ ri, r });
    });
  }

  let bestMatchKey = null;
  for (const { ri, r } of candidateRiders) {
    if (!r.subs) continue;
    for (let si = 0; si < r.subs.length; si++) {
      const sub = r.subs[si];
      const subMatches = sub.match(/(\d+)대/g);
      const subDigits = subMatches ? subMatches.map(m => m.replace('대', '')) : [];

      if (targetGrpDigits.length > 0 && subDigits.length > 0) {
        if (targetGrpDigits.some(d => subDigits.includes(d))) {
          bestMatchKey = `${ri}.${si}`;
          break;
        }
      }

      const subClean = sub.replace(/[0-9\s()대질병수술보장특약Ⅰ-Ⅵ]/g, '');
      const grpClean = (grpName || '').replace(/[0-9\s()대질병수술보장특약Ⅰ-Ⅵ]/g, '');
      if (subClean && grpClean && (subClean.includes(grpClean) || grpClean.includes(subClean))) {
        bestMatchKey = `${ri}.${si}`;
        break;
      }
    }
    if (bestMatchKey) break;
  }

  if (bestMatchKey) {
    return groups.filter(g => g.m && g.m.includes(bestMatchKey));
  }
  return [];
};


window.DYNAMIC_NDAI_TABLES = {
  meritz: {
    '131대': {
      title: '별표41~48 [131대 질병분류표 및 보장 질병코드 전문]',
      rows: [
        ['심장질환 (1)', '급성 심근경색증, 허혈성 심장질환, 만성 류마티스성 심장질환 등 (별표23)', 'I00~I02, I05~I09, I20~I25, I26~I28, I30~I52', '지급 비율은 그 특약 원문'],
        ['뇌혈관질환 (1)', '지주막하출혈, 뇌내출혈, 뇌경색증, 뇌동맥류, 뇌혈관 기형 등 (별표41)', 'I60~I69 (10대 뇌혈관질환 전수)', '지급 비율은 그 특약 원문'],
        ['특정 31대질병 (31)', '결핵, 패혈증, 중추신경계 감염, 파킨슨병, 알츠하이머, 다발경화증, 급성 췌장염, 만성 간염, 간경변, 신부전, 폐렴, COPD 등 (별표44)', 'A15~A19, A40~A41, G00~G09, G20, G30, G35, K85, K70~K76, N17~N19, J12~J18, J40~J47', '지급 비율은 그 특약 원문'],
        ['다빈도 64대질병 (64)', '담석증, 충수염, 탈장, 요로결석, 전립선비대증, 고혈압, 당뇨병, 갑상선질환, 녹내장, 동맥경화, 궤양성대장염, 위십이지장궤양 등 (별표45)', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, I10~I15, E10~E14, E00~E07, H40, I70, K51, K25~K28', '정액 지급'],
        ['특정 다빈도 29대질병 (29)', '하지정맥류, 부비동염(축농증), 편도염, 중이염, 수근관증후군, 안면신경마비, 골수염, 척추디스크, 척추협착증, 비염 등 (별표47)', 'I83, J32, J35, H65~H75, G56.0, G51, M86, M50~M51, M48, J30~J34', '정액 지급'],
        ['후각 특정질환 (1)', '알레르기 비염, 혈관운동성 비염, 코폴립(비종양) 등 (별표48)', 'J30, J31, J33, J34', '정액 지급'],
        ['관절염·생식기 질환 (2)', '염증성 관절염, 여성 골반염, 난소염, 자궁염, 남성 생식기 장애 등 (별표24)', 'M05~M14, N70~N77, N41~N51', '정액 지급'],
        ['치핵 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루 (별표43)', 'K64', '정액 지급'],
        ['백내장 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장 (별표42)', 'H25~H28', '정액 지급']
      ]
    },
    '32대': {
      title: '별표46·제42조 [32대질병관혈수술비] (스캔 제339·728쪽)',
      rows: [
        ['5대질병 (5)', '심장질환, 뇌혈관질환, 간질환, 신부전, 폐질환 (별표46 제728쪽)', 'I00~I02·I05~I09·I20~I52, I60~I69, B15~B19·K70~K77, N17~N19, J43·J44·J47·J85~J86·J90~J94', '관혈. 1년 미만 50% / 이후 100% (제339쪽)'],
        ['9대질병 (9)', '만성하부호흡기, 위·십이지장궤양, 결핵, 갑상선, 동맥경화, 대동맥류, 폐렴, 급성췌장염, 췌장 (제729~730쪽)', 'J40~J42·J45~J46, K25~K27, A15~A19, E00~E07, I70, I71, J12~J18, K85, K86~K87', '관혈. 1년 미만 50% / 이후 100% (제339쪽)'],
        ['14대질병 (14)', '제341쪽 정의: 소화기·중이호흡·비뇨·수막·뇌·갑상선내분비 양성신생물, 사구체, 신세뇨관-간질, 신장요관 기타, 비뇨계통 기타, 특정 장질환, 담낭, 담낭담도, 안면신경. 코드는 제730~731쪽에 있는 것만 적음', 'D13~D15, D30, D32~D35, N00~N08, N10~N16, N25~N29. 나머지 코드는 이어지는 별표 쪽 미수록', '관혈. 1년 미만 50% / 이후 100% (제339쪽)'],
        ['4대질병 (4)', '제341쪽 제3조⑤: 여성생식기 양성종양, 남성생식기 양성종양, 관절염, 생식기질환. 분류번호 표는 이 저장소에 없음', '코드 미수록', '관혈. 1년 미만 50% / 이후 100% (제339쪽)']
      ]
    },
    '120대': {
      title: '별표 [120대 질병분류표 및 보장 질병코드 전문]',
      rows: [
        ['특정 5대질병 (5)', '뇌혈관, 심장질환, 간질환, 췌장질환, 만성 폐질환', 'I60~I69, I20~I25, K70~K76, K85~K86, J40~J47', '지급 비율은 그 특약 원문'],
        ['중대 10대질병 (10)', '신부전, 당뇨병, 고혈압, 동맥경화, 갑상선질환, 녹내장, 궤양 등', 'N17~N19, E10~E14, I10~I15, I70~I79, E00~E07, H40, K25~K28', '지급 비율은 그 특약 원문'],
        ['다발성 16대질병 (16)', '부정맥, 심부전, 동맥색전증, 수두증, 폐부종, 식도질환 등', 'I47~I49, I50, I74, G91, J81, K22', '정액 지급'],
        ['다빈도 30대질병 (30)', '담석증, 충수염, 탈장, 요로결석, 전립선비대증, 편도염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, J35', '정액 지급'],
        ['부인과 10대질병 (10)', '자궁근종, 자궁내막증, 난소낭종, 골반염, 여성생식기 폴립 등', 'D25, N80, D27, N83, N70~N77, N84', '정액 지급'],
        ['생활 48대질병 (48)', '비염, 부비동염(축농증), 하지정맥류, 관절염, 척추디스크 등', 'J30~J34, I83, M15~M19, M48, M50~M51, G51', '정액 지급'],
        ['치핵 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    },
    '82대': {
      title: '별표23~45 [82대 질병분류표 및 보장 질병코드 전문 (7개 세부보장)]',
      rows: [
        ['심장질환 (1)', '급성 류마티스열, 만성 류마티스심장질환, 허혈심장질환, 폐순환질환 등 (별표23)', 'I00~I02, I05~I09, I20~I25, I26~I28, I30~I52', '가입금액 100%'],
        ['뇌혈관질환 (1)', '거미막하출혈, 뇌내출혈, 뇌경색증, 뇌동맥류 등 10대 뇌혈관질환 전수 (별표41)', 'I60~I69', '가입금액 100%'],
        ['특정 27대질병 (27)', '간질환, 고혈압, 당뇨병, 만성하부호흡기, 위궤양, 결핵, 패혈증, 파킨슨, 뇌전증, 신부전 등 (별표44)', 'B15~B19, K70~K77, I10~I15, E10~E14, J40~J46, K25~K27, A15~A19, N17~N19 등', '정액 차등 지급'],
        ['다빈도 49대질병 (49)', '11대 양성종양, 내분비, 혈관, 급성상기도, 축농증, 편도염, 유방장애, 담석증, 디스크 등 (별표45)', 'D13~D35, E00~E07, J00~J06, J32, J35, N60~N64, K80, M50~M51 등', '정액 차등 지급'],
        ['관절염·생식기질환 (2)', '관절염, 여성골반염, 남성생식기질환 등 (별표24)', 'M00~M25, N40~N51, N70~N99', '정액 지급'],
        ['치핵 (1)', '치핵 및 항문주위정맥 혈전증 (별표25)', 'K64', '정액 지급'],
        ['백내장 (1)', '노년 백내장, 수정체 장애 (별표40)', 'H25~H27', '정액 지급']
      ]
    },
    '77대': {
      title: '별표 [77대 질병분류표 전문]',
      rows: [
        ['특정 18대질병 (18)', '심장질환, 뇌혈관질환, 간질환, 고혈압, 당뇨병, 만성호흡기, 위궤양, 신부전 등', 'I00~I52, I60~I69, K70~K76, I10~I15, E10~E14, J40~J46, K25~K27, N17~N19', '가입금액 100%'],
        ['다발성 19대질병 (19)', '담석증, 사타구니탈장, 편도염, 축농증, 급성상기도감염, 인후부위질환 등', 'K80, K40, J35, J32, J00~J06, J36~J39', '정액 지급'],
        ['생활 38대질병 (38)', '비염, 관절염, 척추디스크, 하지정맥류, 양성종양, 치핵, 백내장 등', 'J30~J31, M05~M14, M50~M51, I83, D12~D35, K64, H25~H27', '정액 지급'],
        ['치핵 (1)', '내치핵, 외치핵, 항문열창 및 치루', 'K64', '정액 지급'],
        ['백내장 (1)', '노년 백내장 및 수정체 질환', 'H25~H27', '정액 지급']
      ]
    }
  },
  hyundai: {
    '120대다이렉트': {
      title: '현대해상다이렉트 H건강보험(Hi2404) 120대질병수술. 분류번호는 별표 원문',
      rows: [
        ['26대질병 (26)', '중증근무력증, 안와장애, 유리체의 장애, 하지정맥류, 과민대장증후군, 전신결합조직장애Ⅱ, 치열 및 치루, 골수염, 골괴사증, 뼈의 파젯병, 뼈의 기타장애, 연골병증, 신장 및 요관의 결석, 요도결석증, 다한증, 눈 및 부속기관의 양성종양, 수면무호흡증, 결막장애, 외이의 질환, 림프절염, 대상포진, 급성 기관지염, 급성 세기관지염, 정맥염 및 혈전정맥염, 기타 정맥의 색전증 및 혈전증, 식도정맥류', '별표12', '비율은 인쇄 99쪽 표'],
        ['58대질병 (58)', '담석증, 사타구니 탈장, 편도 및 아데노이드의 만성 질환 외. 나머지 이름은 별표13', '별표13', '비율은 인쇄 99쪽 표'],
        ['24대질병 (24)', '질병명은 별표. 이 화면에 코드를 적지 않음', '24대 분류표', '비율은 인쇄 99쪽 표'],
        ['치핵 (1)', '치핵수술 세부보장. 질병명은 분류표', '치핵 분류표', '비율은 인쇄 99쪽 표'],
        ['갑상선관련질병 (1)', '갑상선관련질병수술 세부보장', '갑상선 분류표', '비율은 인쇄 99쪽 표'],
        ['다발성10대질병 (10)', '다발성10대질병수술 세부보장. 질병명은 분류표', '다발성10대 분류표', '비율은 인쇄 99쪽 표']
      ]
    },
    '120대': {
      title: '2-204 [120대 질병수술Ⅱ 분류표 전문]',
      rows: [
        ['26대질병Ⅱ (26)', '중증근무력증, 사르코이드증, 대동맥류, 폐렴, 신장결석, 유방의 비대 등 (1053~1054쪽)', 'G70, D86, I71, J12~J18, N20, N62 등', '지급 비율은 그 특약 원문'],
        ['58대질병Ⅱ (58)', '담석증, 충수염, 탈장, 치핵, 전립선비대증, 백내장, 녹내장, 당뇨병, 고혈압, 갑상선 등 (1093~1097쪽)', 'K80~K83, K35, K40, K64, N40, H25, H40, E10~E14, I10~I15, E00~E07', '정액 지급'],
        ['24대질병 (24)', '하지정맥류, 부비동염(축농증), 편도염, 중이염, 수근관증후군, 척추질환 등 (1089~1091쪽)', 'I83, J32, J35, H65~H75, G56.0, M50~M51', '정액 지급'],
        ['다발성 10대질병 (10)', '부정맥, 심부전, 폐부종, 만성 신장병, 뇌혈관 후유증 등 (1092쪽)', 'I47~I49, I50, J81, N18, I69', '정액 지급'],
        ['치핵 (1)', '내치핵, 외치핵, 항문열창 및 치루', 'K64', '정액 지급'],
        ['갑상선질환 (1)', '갑상선기능항진증, 갑상선염, 갑상선 양성종양', 'E05, E06, D34', '정액 지급']
      ]
    },
    '123대': {
      title: '별표 [123대 질병수술분류표 전문]',
      rows: [
        ['26대질병 (26)', '중증근무력증, 사르코이드증, 대동맥류, 폐렴, 신장결석, 유방의 비대 등', 'G70, D86, I71, J12~J18, N20, N62 등', '지급 비율은 그 특약 원문'],
        ['59대질병 (59)', '담석증, 충수염, 탈장, 치핵, 전립선비대증, 백내장, 녹내장, 당뇨병, 고혈압, 갑상선 등', 'K80~K83, K35, K40, K64, N40, H25, H40, E10~E14, I10~I15, E00~E07', '정액 지급'],
        ['24대질병 (24)', '하지정맥류, 부비동염(축농증), 편도염, 중이염, 수근관증후군, 척추질환 등', 'I83, J32, J35, H65~H75, G56.0, M50~M51', '정액 지급'],
        ['다발성 10대질병 (10)', '부정맥, 심부전, 폐부종, 만성 신장병, 뇌혈관 후유증 등', 'I47~I49, I50, J81, N18, I69', '정액 지급'],
        ['다발성 3대질병 (3)', '관절염, 백내장, 생식기질환', 'M00~M25, H25~H27, N40~N95', '정액 지급'],
        ['치핵 (1)', '내치핵, 외치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    },
    '71대': {
      title: '별표 [71대 질병수술분류표 전문]',
      rows: [
        ['22대 특정질병 (22)', '심장질환, 뇌혈관질환, 간질환, 고혈압, 당뇨병, 만성하부호흡기, 결핵 등', 'I00~I52, I60~I69, K70~K76, I10~I15, E10~E14, J40~J46, A15~A19', '가입금액 100%'],
        ['다발성 13대질병 (13)', '담석증, 충수염, 사타구니탈장, 편도염, 축농증, 중이염 등', 'K80, K35, K40, J35, J32, H65~H75', '정액 지급'],
        ['35대 생활질환 (35)', '관절염, 척추디스크, 골다공증, 비염, 안면신경마비, 양성종양 등', 'M05~M14, M50~M51, M80~M81, J30~J31, G51, D12~D35', '정액 지급'],
        ['치핵 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    }
  },
  kbinsure: {
    '116대': {
      title: '【별표17】 116대질병 분류표 (KB 5.10.10 플러스 26.09, 2026-10-01). 분류번호는 별표 원문',
      rows: [
        ['15대질병 (15)', '폐렴, 심장질환, 고혈압질환, 뇌혈관질환, 간질환, 동맥경화증, 만성하부호흡기질환, 신부전, 뇌·중추신경계 양성종양, 대동맥류, 간·담관·췌장 양성종양, 수막 양성종양, 기관지·폐의 특정질환, 급성췌장염, 버거씨병', '별표17-1', '1년 미만 50% / 1년 이상 100%'],
        ['23대질병 (23)', '결핵, 안면신경장애, 폐부종, 당뇨병질환, 특정호흡기질환, 폐질환, 위·십이지장궤양, 위공장궤양, 녹내장 외. 나머지 이름은 별표17-2', '별표17-2', '1년 미만 50% / 1년 이상 100%'],
        ['22대질병 (22)', '갑상선질환, 부갑상선질환, 간암, 기관지 및 폐암, 난소암, 특정 장질환, 췌장질환, 비감염성장염 및 결장염, 비장질환 외. 나머지 이름은 별표17-3', '별표17-3', '1년 미만 50% / 1년 이상 100%'],
        ['49대질병 (49)', '관절염 및 다발관절병증, 관절증, 관절장애, 누적외상성질환, 황반변성, 눈 및 눈부속기의 특정질환, 유리체의 장애 외. 나머지 이름은 별표17-4', '별표17-4', '1년 미만 50% / 1년 이상 100%'],
        ['백내장 (1)', '116대 Ⅴ는 백내장 수술보장. 질병명은 별표17-5', '별표17-5', '1년 미만 50% / 1년 이상 100%'],
        ['6대질병 (6)', '수면무호흡증, 식도정맥류, 요도결석증, 신장 및 요관의 결석, 치핵 및 항문주위 정맥혈전증, 치열 및 치루', '별표17-6', '1년 미만 50% / 1년 이상 100%']
      ]
    },
    '112대': {
      title: '【별표17】 [112대 질병분류표 전문]',
      rows: [
        ['15대질병수술 (15)', '패혈증, 폐렴, 기관지확장증, 폐농양, 식도정맥류, 크론병, 급성췌장염 등', 'A40~A41, J12~J18, J47, J85, I85, K50, K85, I73.1, I20~I25, I60~I69', '지급 비율은 그 특약 원문'],
        ['24대질병수술 (24)', '당뇨병, 고혈압, 간질환, 동맥경화증, 만성신부전, 결핵, 녹내장 등', 'E10~E14, I10~I15, K70~K76, I70~I79, N18, A15~A19, H40', '지급 비율은 그 특약 원문'],
        ['22대질병수술 (22)', '담석증, 담낭염, 담도질환, 충수염, 탈장, 요로결석, 전립선비대증, 방광염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, N30, G51, J35, M05~M14, I83', '정액 지급'],
        ['49대질병수술 (49)', '손발톱장애, 티눈, 사마귀, 지방종, 혈관종, 양성종양, 척추디스크, 척추협착증 등', 'L60, L84, B07, D17, D18, D12~D13, M50~M51, M48, G56.0', '정액 지급'],
        ['백내장 수술 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장', 'H25~H28', '정액 지급'],
        ['치핵 수술 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    }
  },
  samsungfire: {
    '111대': {
      title: '별표 [111대 질병분류표 전문]',
      rows: [
        ['5대주요기관질병 (5)', '약관 제4조 인쇄 문구: 뇌질환, 심질환, 간질환, 췌장질환, 폐질환. 코드표는 별표20-5', '코드는 별표20-5. 이 화면의 옛 I60·I20 범위는 그 별표와 대조 전', '1년 미만 50% / 이후 해당 세부보장 (약관 제847쪽대)'],
        ['22대주요질병 (22)', '별표-개별사항20-6. 질병명 전수는 그 별표', '별표20-6', '1년50% 세부보장'],
        ['3대주요질병 (3)', '별표-개별사항20-7. 급성상기도·폐렴·버거씨로 단정하지 않음', '별표20-7', '1년50% 세부보장'],
        ['19대생활질병 (19)', '별표-개별사항20-8', '별표20-8', '1년50% 세부보장'],
        ['62대생활질병 (62)', '별표-개별사항20-9', '별표20-9', '1년50% 세부보장']
      ]
    },
    '116대': {
      title: '별표 [116대 질병분류표 전문]',
      rows: [
        ['5대 주요질병 (5)', '뇌혈관질환, 허혈심장질환, 간질환, 췌장질환, 폐질환', 'I60~I69, I20~I25, K70~K76, K85~K86, J40~J47', '지급 비율은 그 특약 원문'],
        ['22대 주요질병 (22)', '신부전, 당뇨병, 고혈압, 동맥경화, 갑상선질환, 녹내장, 결핵 등', 'N17~N19, E10~E14, I10~I15, I70~I79, E00~E07, H40, A15~A19', '지급 비율은 그 특약 원문'],
        ['3대 특정질병 (3)', '급성 상기도감염, 폐렴, 버거씨병', 'J00~J06, J12~J18, I73.1', '정액 지급'],
        ['24대 생활질병 (24)', '담석증, 충수염, 탈장, 요로결석, 전립선비대증, 치핵, 편도염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, K64, J35', '정액 지급'],
        ['62대 생활질병 (62)', '비염, 부비동염(축농증), 하지정맥류, 관절염, 척추디스크, 백내장 등', 'J30~J34, I83, M15~M19, M48, M50~M51, H25~H28', '정액 지급']
      ]
    },
    '114대': {
      title: '별표 [114대 질병분류표 전문]',
      rows: [
        ['5대 주요질병 (5)', '뇌혈관질환, 허혈심장질환, 간질환, 췌장질환, 폐질환', 'I60~I69, I20~I25, K70~K76, K85~K86, J40~J47', '지급 비율은 그 특약 원문'],
        ['22대 주요질병 (22)', '신부전, 당뇨병, 고혈압, 동맥경화, 갑상선질환, 녹내장, 결핵 등', 'N17~N19, E10~E14, I10~I15, I70~I79, E00~E07, H40, A15~A19', '지급 비율은 그 특약 원문'],
        ['3대 특정질병 (3)', '급성 상기도감염, 폐렴, 버거씨병', 'J00~J06, J12~J18, I73.1', '정액 지급'],
        ['22대 생활질병 (22)', '담석증, 충수염, 탈장, 요로결석, 전립선비대증, 치핵, 편도염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, K64, J35', '정액 지급'],
        ['62대 생활질병 (62)', '비염, 부비동염(축농증), 하지정맥류, 관절염, 척추디스크, 백내장 등', 'J30~J34, I83, M15~M19, M48, M50~M51, H25~H28', '정액 지급']
      ]
    }
  },
  dbinsure: {
    '120대': {
      title: '별표 [120대 질병분류표 전문]',
      rows: [
        ['6대 질병 (6)', '뇌혈관질환, 허혈심장질환, 만성 류마티스 심장질환 등', 'I60~I69, I20~I25, I05~I09', '지급 비율은 그 특약 원문'],
        ['9대 질병 (9)', '만성 신부전, 간질환, 췌장질환, 폐질환, 당뇨병, 고혈압 등', 'N17~N19, K70~K76, K85~K86, J40~J47, E10~E14, I10~I15', '지급 비율은 그 특약 원문'],
        ['20대 질병 (20)', '동맥경화, 갑상선질환, 녹내장, 위십이지장궤양, 결핵 등', 'I70, E00~E07, H40, K25~K28, A15~A19', '정액 지급'],
        ['22대 질병 (22)', '담석증, 충수염, 탈장, 요로결석, 전립선비대증, 편도염 등', 'K80, K35, K40, N20, N40, J35', '정액 지급'],
        ['63대 생활질병 (63)', '비염, 부비동염(축농증), 하지정맥류, 관절염, 척추디스크, 치핵, 백내장 등', 'J30~J34, I83, M15~M19, M48, M50~M51, K64, H25', '정액 지급']
      ]
    }
  },
  hanwhafire: {
    '124대': {
      title: '별표 [124대 질병분류표 전문]',
      rows: [
        ['10대 중대질병 (10)', '뇌혈관질환, 허혈심장질환, 간질환, 췌장질환, 신부전 등', 'I60~I69, I20~I25, K70~K76, K85~K86, N17~N19', '지급 비율은 그 특약 원문'],
        ['26대 특정질병 (26)', '당뇨병, 고혈압, 동맥경화, 갑상선질환, 녹내장, 폐렴, 결핵 등', 'E10~E14, I10~I15, I70~I79, E00~E07, H40, J12~J18, A15~A19', '지급 비율은 그 특약 원문'],
        ['38대 다빈도질병 (38)', '담석증, 충수염, 탈장, 요로결석, 전립선비대증, 편도염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, J35', '정액 지급'],
        ['48대 생활질병 (48)', '비염, 부비동염, 하지정맥류, 관절염, 척추디스크, 수근관증후군 등', 'J30~J34, I83, M15~M19, M48, M50~M51, G56.0', '정액 지급'],
        ['백내장 수술 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장', 'H25~H28', '정액 지급'],
        ['치핵 수술 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    },
    '116대': {
      title: '별표 [116대 질병분류표 전문]',
      rows: [
        ['10대 중대질병 (10)', '뇌혈관질환, 허혈심장질환, 간질환, 췌장질환, 신부전 등', 'I60~I69, I20~I25, K70~K76, K85~K86, N17~N19', '지급 비율은 그 특약 원문'],
        ['26대 특정질병 (26)', '당뇨병, 고혈압, 동맥경화, 갑상선질환, 녹내장, 폐렴, 결핵 등', 'E10~E14, I10~I15, I70~I79, E00~E07, H40, J12~J18, A15~A19', '지급 비율은 그 특약 원문'],
        ['38대 다빈도질병 (38)', '담석증, 충수염, 탈장, 요로결석, 전립선비대증, 편도염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, J35', '정액 지급'],
        ['40대 생활질병 (40)', '비염, 부비동염, 하지정맥류, 관절염, 척추디스크, 수근관증후군 등', 'J30~J34, I83, M15~M19, M48, M50~M51, G56.0', '정액 지급'],
        ['백내장 수술 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장', 'H25~H28', '정액 지급'],
        ['치핵 수술 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    }
  },
  heungkukfire: {
    '신142대': {
      title: '별표 [신142대 질병분류표 전문]',
      rows: [
        ['15대질병수술 (15)', '패혈증, 폐렴, 기관지확장증, 폐농양, 식도정맥류, 크론병, 급성췌장염 등', 'A40~A41, J12~J18, J47, J85, I85, K50, K85, I73.1, I20~I25, I60~I69', '지급 비율은 그 특약 원문'],
        ['24대질병수술 (24)', '당뇨병, 고혈압, 간질환, 동맥경화증, 만성신부전, 결핵, 녹내장 등', 'E10~E14, I10~I15, K70~K76, I70~I79, N18, A15~A19, H40', '지급 비율은 그 특약 원문'],
        ['22대질병수술 (22)', '담석증, 담낭염, 담도질환, 충수염, 탈장, 요로결석, 전립선비대증, 방광염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, N30, G51, J35, M05~M14, I83', '정액 지급'],
        ['79대질병수술 (79)', '손발톱장애, 티눈, 사마귀, 지방종, 혈관종, 양성종양, 척추디스크, 척추협착증, 비염, 다발성 질환 등', 'L60, L84, B07, D17, D18, D12~D13, M50~M51, M48, G56.0, J30~J34', '정액 지급'],
        ['백내장 수술 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장', 'H25~H28', '정액 지급'],
        ['치핵 수술 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    },
    '신70대': {
      title: '별표 [신70대 질병분류표 전문]',
      rows: [
        ['10대 중대질병 (10)', '뇌혈관질환, 허혈심장질환, 간질환, 췌장질환, 신부전 등', 'I60~I69, I20~I25, K70~K76, K85~K86, N17~N19', '지급 비율은 그 특약 원문'],
        ['20대 특정질병 (20)', '당뇨병, 고혈압, 동맥경화, 갑상선질환, 녹내장, 폐렴, 결핵 등', 'E10~E14, I10~I15, I70~I79, E00~E07, H40, J12~J18, A15~A19', '지급 비율은 그 특약 원문'],
        ['38대 생활질병 (38)', '담석증, 충수염, 탈장, 요로결석, 전립선비대증, 척추질환, 관절염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, M50~M51, M15~M19', '정액 지급'],
        ['백내장 수술 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장', 'H25~H28', '정액 지급'],
        ['치핵 수술 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    },
    '112대': {
      title: '별표 [112대 질병분류표 전문]',
      rows: [
        ['15대질병수술 (15)', '패혈증, 폐렴, 기관지확장증, 폐농양, 식도정맥류, 크론병, 급성췌장염 등', 'A40~A41, J12~J18, J47, J85, I85, K50, K85, I73.1, I20~I25, I60~I69', '지급 비율은 그 특약 원문'],
        ['24대질병수술 (24)', '당뇨병, 고혈압, 간질환, 동맥경화증, 만성신부전, 결핵, 녹내장 등', 'E10~E14, I10~I15, K70~K76, I70~I79, N18, A15~A19, H40', '지급 비율은 그 특약 원문'],
        ['22대질병수술 (22)', '담석증, 담낭염, 담도질환, 충수염, 탈장, 요로결석, 전립선비대증, 방광염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, N30, G51, J35, M05~M14, I83', '정액 지급'],
        ['49대질병수술 (49)', '손발톱장애, 티눈, 사마귀, 지방종, 혈관종, 양성종양, 척추디스크, 척추협착증 등', 'L60, L84, B07, D17, D18, D12~D13, M50~M51, M48, G56.0', '정액 지급'],
        ['백내장 수술 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장', 'H25~H28', '정액 지급'],
        ['치핵 수술 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    }
  },
  lotte: {
    '112대': {
      title: '별표 [112대 질병분류표 전문]',
      rows: [
        ['15대질병수술 (15)', '패혈증, 폐렴, 기관지확장증, 폐농양, 식도정맥류, 크론병, 급성췌장염 등', 'A40~A41, J12~J18, J47, J85, I85, K50, K85, I73.1, I20~I25, I60~I69', '지급 비율은 그 특약 원문'],
        ['24대질병수술 (24)', '당뇨병, 고혈압, 간질환, 동맥경화증, 만성신부전, 결핵, 녹내장 등', 'E10~E14, I10~I15, K70~K76, I70~I79, N18, A15~A19, H40', '지급 비율은 그 특약 원문'],
        ['22대질병수술 (22)', '담석증, 담낭염, 담도질환, 충수염, 탈장, 요로결석, 전립선비대증, 방광염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, N30, G51, J35, M05~M14, I83', '정액 지급'],
        ['49대질병수술 (49)', '손발톱장애, 티눈, 사마귀, 지방종, 혈관종, 양성종양, 척추디스크, 척추협착증 등', 'L60, L84, B07, D17, D18, D12~D13, M50~M51, M48, G56.0', '정액 지급'],
        ['백내장 수술 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장', 'H25~H28', '정액 지급'],
        ['치핵 수술 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    }
  },
  nhfire: {
    '112대': {
      title: '별표 [112대 질병분류표 전문]',
      rows: [
        ['15대질병수술 (15)', '패혈증, 폐렴, 기관지확장증, 폐농양, 식도정맥류, 크론병, 급성췌장염 등', 'A40~A41, J12~J18, J47, J85, I85, K50, K85, I73.1, I20~I25, I60~I69', '지급 비율은 그 특약 원문'],
        ['24대질병수술 (24)', '당뇨병, 고혈압, 간질환, 동맥경화증, 만성신부전, 결핵, 녹내장 등', 'E10~E14, I10~I15, K70~K76, I70~I79, N18, A15~A19, H40', '지급 비율은 그 특약 원문'],
        ['22대질병수술 (22)', '담석증, 담낭염, 담도질환, 충수염, 탈장, 요로결석, 전립선비대증, 방광염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, N30, G51, J35, M05~M14, I83', '정액 지급'],
        ['49대질병수술 (49)', '손발톱장애, 티눈, 사마귀, 지방종, 혈관종, 양성종양, 척추디스크, 척추협착증 등', 'L60, L84, B07, D17, D18, D12~D13, M50~M51, M48, G56.0', '정액 지급'],
        ['백내장 수술 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장', 'H25~H28', '정액 지급'],
        ['치핵 수술 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    }
  },
  hanafire: {
    '112대': {
      title: '별표 [112대 질병분류표 전문]',
      rows: [
        ['15대질병수술 (15)', '패혈증, 폐렴, 기관지확장증, 폐농양, 식도정맥류, 크론병, 급성췌장염 등', 'A40~A41, J12~J18, J47, J85, I85, K50, K85, I73.1, I20~I25, I60~I69', '지급 비율은 그 특약 원문'],
        ['24대질병수술 (24)', '당뇨병, 고혈압, 간질환, 동맥경화증, 만성신부전, 결핵, 녹내장 등', 'E10~E14, I10~I15, K70~K76, I70~I79, N18, A15~A19, H40', '지급 비율은 그 특약 원문'],
        ['22대질병수술 (22)', '담석증, 담낭염, 담도질환, 충수염, 탈장, 요로결석, 전립선비대증, 방광염 등', 'K80~K83, K35~K37, K40~K46, N20~N23, N40, N30, G51, J35, M05~M14, I83', '정액 지급'],
        ['49대질병수술 (49)', '손발톱장애, 티눈, 사마귀, 지방종, 혈관종, 양성종양, 척추디스크, 척추협착증 등', 'L60, L84, B07, D17, D18, D12~D13, M50~M51, M48, G56.0', '정액 지급'],
        ['백내장 수술 (1)', '노년 백내장, 수정체 혼탁, 기타 백내장', 'H25~H28', '정액 지급'],
        ['치핵 수술 (1)', '내치핵, 외치핵, 혈전성 치핵, 항문열창 및 치루', 'K64', '정액 지급']
      ]
    }
  }
};

window.openNdaiGroupModal = function(co, grpName, period, data) {
  if (typeof window.lookupClauseGroup === 'function' && window.CLAUSE_BOOK && window.CLAUSE_BOOK[co.id]) {
    const hit = window.lookupClauseGroup(co, period, data, grpName);
    if (hit && hit.pages && hit.pages.length) {
      window.openRulesModal(hit.pages[0], `🏢 [${co.name}] ${grpName}`, period ? period.revSummary : '', hit.pages, { product: co.name, type: grpName, page: hit.caption || '' });
    } else if (typeof showToast === 'function') {
      showToast('이 질병군만의 약관 쪽이 연결되어 있지 않습니다.');
    }
    return;
  }
  const coKey = (co && co.id) ? (co.id.replace('fire', '').replace('life', '')) : '';
  const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[coKey]);
  const isSimp = (data && data.pData && data.pData.name && data.pData.name.includes('간편')) || (data && data.ptype === 'simplified');
  const v = (isSimp && coEntry && coEntry.simplified) ? coEntry.simplified : ((coEntry && coEntry.standard) || (coEntry && coEntry.simplified) || coEntry);

  let pages = null;
  let pageDesc = '';
  const grp = String(grpName || '');

  // 1. 메리츠화재
  if (co.id.includes('meritz')) {
    if (grp.includes('심장')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_heart_p664.png'];
      pageDesc = '공시실 원문 제664쪽 【별표23】 심장질환 분류표 전문 (I00~I02, I05~I09, I20~I25, I26~I28, I30~I52 전수)';
    } else if (grp.includes('뇌혈관')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_brain_p706.png'];
      pageDesc = '공시실 원문 제706쪽 【별표41】 뇌혈관질환 분류표 전문 (I60~I69 전수 10대 질환)';
    } else if (grp.includes('31대')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_31_p714.png', 'assets/clause_imgs/meritz_std_ndai_31_p715.png'];
      pageDesc = '공시실 별표44 제714쪽~제715쪽 【별표44】 특정31대질병 분류표 전문 (31개 질환 전수)';
    } else if (grp.includes('64대')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_64_p720.png', 'assets/clause_imgs/meritz_std_ndai_64_p721.png'];
      pageDesc = '공시실 별표45 제720쪽~제721쪽 【별표45】 다빈도64대질병 분류표 전문 (64개 질환 전수)';
    } else if (grp.includes('29대')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_29_p780.png', 'assets/clause_imgs/meritz_std_ndai_29_p781.png'];
      pageDesc = '공시실 별표65 제780쪽~제781쪽 【별표65】 특정다빈도29대질병 분류표 전문 (29개 질환 전수)';
    } else if (grp.includes('후각')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_smell_p779.png'];
      pageDesc = '공시실 별표64 제779쪽 【별표64】 후각특정질환 분류표 전문';
    } else if (grp.includes('관절염') || grp.includes('생식기')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_joint_p665.png'];
      pageDesc = '공시실 별표24 제665쪽 【별표24】 관절염ㆍ생식기질환 분류표 전문';
    } else if (grp.includes('치핵')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_hemorrhoid_p667.png'];
      pageDesc = '공시실 별표25 제667쪽 【별표25】 치핵 분류표 전문';
    } else if (grp.includes('백내장')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_cataract_p705.png'];
      pageDesc = '공시실 별표40 제705쪽 【별표40】 백내장 분류표 전문';
    } else if (grp.includes('5대')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_32_table_p728.png'];
      pageDesc = '【별표46】 32대질병 분류표 중 [5대질병]. 스캔 제728쪽';
    } else if (grp.includes('9대')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_32_table_p729.png', 'assets/clause_imgs/meritz_std_ndai_32_table_p730.png'];
      pageDesc = '【별표46】 [9대질병]. 스캔 제729쪽~제730쪽(9대 끝과 14대 시작이 같은 쪽)';
    } else if (grp.includes('14대')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_32_table_p730.png', 'assets/clause_imgs/meritz_std_ndai_32_table_p731.png'];
      pageDesc = '【별표46】 [14대질병] 시작. 스캔 제730쪽~제731쪽. 14대 끝 쪽은 미수록';
    } else if (grp.includes('4대')) {
      pages = ['assets/clause_imgs/meritz_std_ndai_32_inc_p341.png'];
      pageDesc = '42. 32대질병관혈수술비 제3조⑤ 4대질병의 정의. 스캔 제341쪽. 분류번호 표는 미수록';
    } else if (grp.includes('32대')) {
      pages = [
        'assets/clause_imgs/meritz_std_ndai_32_inc_p339.png',
        'assets/clause_imgs/meritz_std_ndai_32_table_p728.png'
      ];
      pageDesc = '42. 갱신형 32대질병관혈수술비 제339쪽과 별표46 제728쪽';
    } else if (grp.includes('131대')) {
      pages = [
        'assets/clause_imgs/meritz_std_ndai_inc_p332.png',
        'assets/clause_imgs/meritz_std_ndai_inc_p333.png'
      ];
      pageDesc = '41. 갱신형 131대질병수술비보장 특별약관. 스캔 제332쪽~';
    }
    // 이름이 안 맞으면 다른 특약 쪽을 열지 않는다.
  }
  // 2. 현대해상
  else if (co.id.includes('hyundai')) {
    if (grp.includes('26대')) {
      pages = [
        'assets/clause_imgs/hyundai_std_ndai_26_p1053.png',
        'assets/clause_imgs/hyundai_std_ndai_26_p1054.png'
      ];
      pageDesc = '공시실 원문 제1053쪽~제1054쪽 【별표13】 26대질병Ⅱ 분류표 전문 (총 2페이지, 26개 질병 전수)';
    } else if (grp.includes('58대')) {
      pages = [
        'assets/clause_imgs/hyundai_std_ndai_58_p1093.png',
        'assets/clause_imgs/hyundai_std_ndai_58_p1094.png',
        'assets/clause_imgs/hyundai_std_ndai_58_p1095.png',
        'assets/clause_imgs/hyundai_std_ndai_58_p1096.png',
        'assets/clause_imgs/hyundai_std_ndai_58_p1097.png'
      ];
      pageDesc = '공시실 원문 제1093쪽~제1097쪽 【별표56】 58대질병Ⅱ 분류표 전문 (총 5페이지, 58개 질병 전수)';
    } else if (grp.includes('24대')) {
      pages = [
        'assets/clause_imgs/hyundai_std_ndai_24_p1089.png',
        'assets/clause_imgs/hyundai_std_ndai_24_p1090.png',
        'assets/clause_imgs/hyundai_std_ndai_24_p1091.png'
      ];
      pageDesc = '공시실 원문 제1089쪽~제1091쪽 【별표54】 24대질병 분류표 전문 (총 3페이지, 24개 질병 전수)';
    } else if (grp.includes('10대') || grp.includes('다발성')) {
      pages = ['assets/clause_imgs/hyundai_std_ndai_10_p1092.png'];
      pageDesc = '공시실 원문 제1092쪽 【별표55】 다발성10대질병 분류표 전문 (10개 질병 전수)';
    } else if (grp.includes('3대')) {
      pages = ['assets/clause_imgs/hyundai_std_ndai_3_p1100.png'];
      pageDesc = '공시실 원문 제1100쪽 【별표58】 3대질병 분류표 전문 (3개 질병 전수)';
    } else {
      pages = [
        'assets/clause_imgs/hyundai_std_perf_ndai_inc_p733.png',
        'assets/clause_imgs/hyundai_std_perf_ndai_inc_p734.png'
      ];
      pageDesc = '공시실 원문 제733쪽~제734쪽 (2-204 120대질병수술Ⅱ 제1조 지급사유 · 제2조 120대질병의 정의)';
    }
  }
  // 3. 삼성화재
  else if (co.id.includes('samsung')) {
    if (grp.includes('5대')) {
      pages = ['assets/clause_imgs/samsung_std_ndai_5_p1415.png'];
      pageDesc = '공시실 별표20-5 제1415쪽 【별표20-5】 5대주요기관질병 분류표Ⅱ';
    } else if (grp.includes('22대')) {
      pages = ['assets/clause_imgs/samsung_std_ndai_22_p1416.png', 'assets/clause_imgs/samsung_std_ndai_22_p1417.png'];
      pageDesc = '공시실 별표20-6 제1416쪽~제1417쪽 【별표20-6】 22대주요질병 분류표';
    } else if (grp.includes('3대')) {
      pages = ['assets/clause_imgs/samsung_std_ndai_3_p1418.png'];
      pageDesc = '공시실 별표20-7 제1418쪽 【별표20-7】 3대질병 분류표';
    } else if (grp.includes('19대')) {
      pages = ['assets/clause_imgs/samsung_std_ndai_19_p1419.png'];
      pageDesc = '공시실 별표20-8 제1419쪽 【별표20-8】 19대생활질병 분류표';
    } else if (grp.includes('62대') || grp.includes('67대')) {
      pages = ['assets/clause_imgs/samsung_std_ndai_62_p1420.png', 'assets/clause_imgs/samsung_std_ndai_62_p1421.png'];
      pageDesc = '공시실 별표20-9 제1420쪽~제1421쪽 【별표20-9】 62대생활질병 분류표';
    }
  }
  // 4. DB손해보험
  else if (co.id.includes('db')) {
    pages = [
      'assets/clause_imgs/db_std_ndai_table_p1216.png',
      'assets/clause_imgs/db_std_ndai_table_p1217.png'
    ];
    pageDesc = '공시실 별표 제1216쪽~제1217쪽 【별표45】 120대/116대 대상질병분류표 전문';
  }
  // 5. KB손해보험
  else if (co.id.includes('kb')) {
    pages = [
      'assets/clause_imgs/kb_std_51010_ndai_table_p1173.png',
      'assets/clause_imgs/kb_std_51010_ndai_table_p1174.png'
    ];
    pageDesc = '공시실 별표17 제1173쪽~제1174쪽 【별표17】 116대/112대 질병 분류표 전문';
  }
  // 6. 한화손해보험
  else if (co.id.includes('hanwha')) {
    pages = ['assets/clause_imgs/hanwha_std_ndai_table_p1376.png'];
    pageDesc = '공시실 별표 제1376쪽 【별표】 124대 대상질병분류표 전문';
  }

  // Fallback: v.ndai_table
  if (!pages && v && v.ndai_table && v.ndai_table.pages) {
    pages = v.ndai_table.pages;
    pageDesc = v.ndai_table.pageStr || '';
  }

  if (pages && pages.length > 0) {
    const meta = { product: (v && v.product) || co.name, type: (v && v.type) || '공식 약관', page: pageDesc };
    window.openRulesModal(pages[0], `🏢 [${co.name}] ${grpName} 해당 쪽`, period ? period.revSummary : '', pages, meta);
  } else if (typeof showToast === 'function') {
    showToast('이 질병군만의 약관 쪽이 연결되어 있지 않습니다. 다른 특약 쪽으로 대신 열지 않습니다.');
  }
};

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
          if (arrow) {
            arrow.textContent = '접기 ▴';
            arrow.classList.add('on');
          }
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
              pArrow.classList.add('on');
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
        payout: '읽은 별표 제87항은 2종(KB 26.09, 현대 Hi2404·Hi2504, 삼성 2404.10). 회사별 1종 개정일은 그 별표에 없음.'
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
        badge: '⭕ 별표의 Mammotomy 행',
        badgeColor: '#fff',
        badgeBg: '#2563eb',
        borderColor: '#2563eb',
        boxBg: 'rgba(37, 99, 235, 0.06)',
        target: '유방 섬유선종·양성종양',
        nature: '진공 흡입 바늘로 종양 전체 절제',
        payout: '읽은 별표(KB 55-1, 현대 11, 메리츠 23)의 치료목적 Mammotomy는 1종. 모든 회사 2종으로 적지 않음.'
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

/* ───────────────────────── KCD 질병코드 범위 매칭 (예: N23 -> N20~N25, A17 -> A15~A19) ───────────────────────── */
function matchKcdRange(queryCode, targetRange) {
  if (!queryCode || !targetRange) return false;
  const qClean = queryCode.replace(/\s/g, '').toUpperCase();
  const tClean = targetRange.replace(/\s/g, '').toUpperCase();

  // 1. 직접 포함 (문자열 일치)
  if (tClean.includes(qClean) || qClean.includes(tClean)) return true;

  // 2. 쉼표로 구분된 다중 코드/범위인 경우 각각 검사
  if (tClean.includes(',')) {
    return tClean.split(',').some(part => matchKcdRange(qClean, part));
  }

  // 3. 단일 코드와 범위 매칭: A17 -> A15~A19
  const qm = qClean.match(/^([A-Z])(\d+)(?:\.(\d+))?$/);
  const rm = tClean.match(/^([A-Z])(\d+)\s*[~\-]\s*([A-Z])?(\d+)$/);

  if (qm && rm) {
    const qAlpha = qm[1];
    const qNum = parseInt(qm[2], 10);
    const rAlpha1 = rm[1];
    const rNum1 = parseInt(rm[2], 10);
    const rAlpha2 = rm[3] || rAlpha1;
    const rNum2 = parseInt(rm[4], 10);

    if (qAlpha >= rAlpha1 && qAlpha <= rAlpha2) {
      if (rAlpha1 === rAlpha2) {
        return qNum >= rNum1 && qNum <= rNum2;
      }
      return true;
    }
  }

  // 4. 거꾸로 범위 검색: A15~A19 검색 시 A17 대상 매칭
  const qrm = qClean.match(/^([A-Z])(\d+)\s*[~\-]\s*([A-Z])?(\d+)$/);
  const tm = tClean.match(/^([A-Z])(\d+)(?:\.(\d+))?$/);
  if (qrm && tm) {
    const tAlpha = tm[1];
    const tNum = parseInt(tm[2], 10);
    const qAlpha1 = qrm[1];
    const qNum1 = parseInt(qrm[2], 10);
    const qAlpha2 = qrm[3] || qAlpha1;
    const qNum2 = parseInt(qrm[4], 10);

    if (tAlpha >= qAlpha1 && tAlpha <= qAlpha2) {
      if (qAlpha1 === qAlpha2) {
        return tNum >= qNum1 && tNum <= qNum2;
      }
      return true;
    }
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
        <span class="fold-toggle edi-drawer-arrow">${looksEdi ? '접기 ▴' : '펼치기 ▾'}</span>
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
        <span style="font-size:11px;color:var(--text-3);font-weight:700;">종수는 표준 참고 · 약관 우선</span>
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

/* 카드 문장은 그 회사 약관에서 읽은 행만. 다른 회사 종수·개정일을 여기 넣지 않는다. */
function verifiedFactLines(topic, coName) {
  const n = String(coName || '');
  const kb = /KB손|케손|kbinsure/i.test(n) && !/라이프|생명/.test(n);
  const hyAgency = /퍼펙트|내삶|간편한3\.10\.10|대리점/.test(n);
  const hy = /현대해상|현대화재|^현대$|hyundai/i.test(n) && !/라이프|생명/.test(n) && !hyAgency;
  const sam = /삼성화재|삼화|samsungfire/i.test(n);
  const db = /DB손해|DB손보|동부화재|동부손보|dbinsure/i.test(n) && !/생명|라이프/.test(n);
  const hk = /흥국화재|흥국화|heungkukfire/i.test(n) && !/생명|라이프/.test(n);
  const mz = /메리츠|meritz/i.test(n);
  const hw = /한화손|한화손해|hanwhafire/i.test(n) && !/생명|라이프/.test(n);
  const nh = /농협|NH손|엔에이치손|nhfire/i.test(n) && !/생명|라이프/.test(n);
  const lt = /롯데손|롯데화|lotte/i.test(n) && !/생명|라이프/.test(n);
  const sl = /신한라이프|신한생명|shinhanlife/i.test(n);
  const lines = {
    eswl: {
      kb: 'KB 5.10.10 플러스. 23.04(보종 23939, 판매시작 2023-04-01, 인쇄 530쪽 제85항) 2종. 26.09(보종 25438, 2026-10-01 적용, 별표55-1 제87항)도 2종. 24.01·25.01·26.01 표본에서 다른 종수는 없음. 60일 이내 2회는 1회. 체외충격파치료술은 제외.',
      hy: '현대해상다이렉트 H건강보험만. Hi2310(파일 CM295F_20231001, 표지 상품명 Hi2310, 별표11 인쇄 126쪽 제85항)까지 체외충격파쇄석술 1종. 다음 책 Hi2404(CM295G_20240401, 인쇄 129쪽 제87항)부터 2종. Hi2504도 2종. 같은 파일 크기인 2024-01-01본은 Hi2310과 같아 1종. 대리점 상품은 이 책이 아님.',
      hyAgency: '대리점 퍼펙트플러스 Hi2301(판매 2023-01-01~2023-03-31, 인쇄 708쪽) 제85항 1종. 다이렉트 Hi2404의 2종과 같은 칸으로 적지 않음. 퍼펙트 Hi2404(판매 2024-04-01, 인쇄 755쪽)는 제87항으로 번호가 바뀌었고, 그 종수 칸은 같은 줄에서 안 읽힘.',
      sam: '삼성화재 마이헬스 파트너 2404.10, 2024-09-02 적용, 별표16-2 제87항 2종. 그 제87항이 바뀐 짝은 1910~2504 구간에서 잡지 못함. 1~8종 표의 담석 체외충격파 H143과 요로결석 체외충격파 L091·L092는 2104(판매 2021-04-01~2021-05-31)부터 2504.11(판매 2025-04-01~2025-04-30)까지 1종.',
      db: 'DB손보 청춘어람·청춘어람플러스(코드 31060). 1-5종 제88항 체외충격파쇄석술은 2309(판매시작 2023-09-01, 별표78 인쇄 625쪽) 2종이고 2607(판매시작 2026-07-01, 별표78 인쇄 1261쪽)도 2종. 2605에 들어온 별표169 제88항(인쇄 1440쪽)과 2607 별표169(인쇄 1360쪽)도 2종. 1~8종 별표76의 다른 행 “담석 제거를 위한 체외충격파쇄석술” H143은 2309 인쇄 612쪽과 2404의 2025-01-23 개정(인쇄 835쪽)에서 1종이고, 그 표는 청춘어람플러스 2504(판매시작 2025-04-01)부터 없다. 1-5종 제88항이 1종으로 바뀐 책은 이 구간에서 없다.',
      hk: '흥Good The건강한 종합보험·0545와 행복드림 THE 건강한 보장보험(21.08). 별표10 제85항 체외충격파쇄석술은 21.08 상품의 판매 2022-01-01~2022-03-31 약관 인쇄 308쪽 1종, 24.08 판매 2024-08-01~2024-08-20 인쇄 803쪽 1종, 25.07 판매 2025-07-07~2025-08-31 인쇄 1045쪽 1종, 25.09 판매 2025-09-01~2025-09-30 인쇄 1107쪽 1종, 0545 26.10 판매 2026-10-01~2026-10-31 인쇄 1227쪽 1종. 이 책들에서 제85항 종수는 바뀌지 않음.',
      mz: '메리츠 케어프리. The편한 M-Basket2007(판매 2020-07-15~2020-11-03, 인쇄 456쪽) 제87항 체외충격파쇄석술 2종. M-Basket2501에서 제87항 종수 칸은 같은 줄에서 읽히지 않아, 그 뒤로 바뀌었다고 적지 않음.',
      hw: '한화 더건강한 한아름·3N5·더경증·311. 1-5종 제88항 체외충격파쇄석술은 한아름2504(인쇄 754쪽 부근)부터 2606, 간편 책들도 1종. 케어밸런스 2204(인쇄 74쪽)부터 2604까지는 1-5종 표가 없고, 체외충격파쇄석술을 수술 정의에 해당하지 않는 시술 예로 둠.',
      nh: 'NH가성비굿. 2304(판매 2023-09-01~2023-10-03, 인쇄 642쪽) 제85항 1종. 2604(판매 2026-07-01~, 인쇄 1282쪽)도 1종. 이 구간에서 제85항 종수는 바뀌지 않음.',
      lt: '롯데 더끌림 포맨 2301(판매 2023-01-01~2023-03-12, 인쇄 766쪽) 제85항 1종. 3N5 2501(판매 2025-01-01~2025-03-31, 인쇄 1072쪽)도 제85항 옆에 1이 있음.',
      sl: '신한라이프 (간편)원(ONE) 판매 2024-04-01~2024-05-02, 인쇄 3026쪽 제87항 2종. 일반 원(ONE) 판매 2024-01-01 책과 260804 판매약관도 같은 제87항 자리. 이 구간에서 다른 종수는 없음.'
    },
    polyp: {
      kb: 'KB 5.10.10 플러스. 25.08 마지막 약관(보종 24876, 파일 24876_3_1.pdf, 판매 2025-11-01~2025-12-31)에는 그 주석이 없음. 26.01(보종 24999, 판매시작 2026-01-01, 파일 24999_1_1.pdf, 인쇄 884쪽)부터 "대장의 용종 또는 대장의 양성신생물의 내시경적 절제술은 1종".',
      hy: '다이렉트 Hi2204부터 Hi2504까지 별표11에 대장용종 내시경 절제 행이 없음. 종수 변경일을 적지 않음.',
      hyAgency: '퍼펙트플러스·내삶엔·간편한3.10.10 1-5종 표에서 대장용종 내시경 절제 종수 행은 없음.',
      sam: '마이헬스 파트너 2404.10의 일부 수술비 특약은 대장 용종·양성신생물의 내시경적 절제를 그 특약의 부지급 목록에 둠. 1~5종 표의 종수로 바꾸어 적지 않음.',
      db: '청춘어람·청춘어람플러스 2023-09-01~2026-07-01 약관에서 대장 용종은 질병분류와 급여 수가코드로만 보인다. 1-5종 표에 내시경 절제를 1종으로 적는 행은 없다.',
      hk: 'The건강한 별표10에서 대장용종 내시경 절제를 종수로 적는 행은 이번 대조에서 확인하지 못함. 변경일을 적지 않음.',
      mz: '케어프리·통합간편 1-5종 표에서 대장용종 내시경 절제의 종수 행은 이번 대조에서 확정하지 못함.',
      hw: '한아름·간편 책에 용종은 급여 수가 분류표로만 있고, 1-5종 종수 행은 없음.',
      nh: '가성비굿 1-5종 표에서 대장용종 내시경 절제 종수 행은 없음.',
      lt: '3N5·더끌림 1-5종 표에서 대장용종 내시경 절제 종수 행은 없음.',
      sl: '원(ONE) 1-5종 표에서 대장용종을 2종으로 적는 행은 없음. 종수를 2종으로 적지 않음.'
    },
    breast: {
      kb: 'KB 5.10.10 플러스 유방절단 제3항은 23.04~26.09 3종. 기타 유방 제4항은 1종. Mammotomy 문장은 24.03(보종 24353, 판매 2024-03-01~03-31, 인쇄 654쪽)까지 없고, 24.04(보종 24381, 판매시작 2024-04-01, 인쇄 664쪽)부터 제4항 1종에 "치료목적의 Mammotomy"가 추가. N62는 수술 종수 행이 아님.',
      hy: '다이렉트 Hi2310(별표11 인쇄 124쪽)까지 유방절단 제3항 3종, 기타 유방수술 제4항 1종(맘모톰이라는 말은 없음). Hi2404(인쇄 126–127쪽)부터 유방절단이 제자리암·경계성종양 3종 / 그 외 2종으로 나뉘고, 제4항에 치료목적 Mammotomy 1종이 적힘. N62 행은 없음.',
      hyAgency: '퍼펙트 Hi2301 인쇄 374쪽은 치료목적 Mammotomy를 수술 예로 적음. Hi2404 별표 인쇄 751쪽에 60일 문장이 있음. N62를 나눈 3-1항은 퍼펙트 Hi2301~Hi2607, 내삶엔, 간편한3.10.10에서 찾지 못함. 다이렉트의 제자리암 분할과 같은 칸으로 적지 않음.',
      sam: '마이헬스 파트너 유방절단 제3항은 2401.8(판매 2024-01-01~2024-01-31, 인쇄 818쪽)부터 2504.11(판매 2025-04-01~2025-04-30)까지 3종. N62 수술 행은 1910(판매 2019-10-01)부터 2504.11까지 없음. Mammotomy 문장은 2301.7(판매 2023-11-01~2023-12-31)까지 없고, 2401.8 인쇄 818쪽 기타 유방 행부터 있다. 유병장수 간편한 2008·2101과 325·1 2104·2204에는 그 문장과 N62 수술 행이 없다. 355·1 2304 파일은 텍스트를 열지 못함.',
      db: '별표78 제3항 유방절단은 2309(인쇄 623쪽)부터 2607(인쇄 1259쪽)까지 3종, 제4항은 1종. 별표133 제4항의 “치료목적의 Mammotomy”는 2024-04-01 책에는 없고, 같은 2404 상품의 2025-01-23 책(인쇄 911쪽)에는 1종으로 적혀 있다. 그 사이 개정본은 이번 배치에서 모두 대조하지 않았다. 별표169(1-5종수술Ⅳ)는 2604(판매시작 2026-04-01, 31060(07))까지 없고, 2605(판매시작 2026-05-01, 31060(08), 인쇄 1438쪽)부터 제3-1항 유방의 비대(N62) 2종, 제3-2항 그 외 유방절단 3종, 제4항 1종이다. 2607 별표169(인쇄 1358쪽)도 같다. 별표78 제3항은 그 뒤에도 단일 3종이다.',
      hk: '흥Good The건강한 종합보험 별표10. 25.07(판매 2025-07-07~2025-08-31, 인쇄 1042쪽)까지 유방절단 제3항은 단일 3종, 제4항 1종. 다음 책 25.09(판매 2025-09-01~2025-09-30, 【별표10】1~5종 수술분류표Ⅲ 인쇄 1104쪽)부터 제3항 3종(N62로 인한 유방절단은 제외), 제3-1항 유방의 비대(N62)로 인한 유방절단 1종, 제4항 1종. 0545 26.10(판매 2026-10-01~2026-10-31, 인쇄 1225쪽)도 같음. 21.08 상품(판매 2022-01-01~2022-03-31, 인쇄 306쪽)은 제3항 단일 3종.',
      mz: '케어프리 M-Basket2404(판매 2024-11-04~2024-12-31)에는 유방의 비대(N62)를 1종으로 적는 문장이 없고, N62는 질병분류(인쇄 1164쪽)에만 있다. M-Basket2501(판매 2025-01-01~2025-01-12, 【별표7】 인쇄 591쪽)부터 제3항 유방절단은 3종이고 “유방의 비대(N62)로 인한 수술은 1종”. 제4항은 1종이고 진공흡인(맘모톰) 문장이 있다. 통합간편2501 일반심사형(같은 판매기간, 【별표38】 인쇄 442쪽)도 같다. 간편355 2407(판매 2024-11-04~2024-12-31)에는 그 문장이 없다. Mammotomy 문장은 M-Basket2011(판매 2020-11-04~2020-12-31) 제4항에 있고, 2101(판매 2021-01-01부터)부터 2404까지는 그 단어가 없다.',
      hw: '한아름2504 【별표45】 인쇄 751쪽. 제3항 유방절단 3종(N62 제외), 제3-1항 유방의 비대(N62)로 인한 유방절단 1종, 제4항 1종. 2606까지 같은 문장. 맘모톰이라는 말은 한아름·3N5·311·더경증·케어밸런스 파일에 없음. 케어밸런스 2204~2604 파일에는 이 1-5종 표가 없음.',
      nh: '가성비굿 2304 인쇄 638쪽 제3항 유방절단 3종, 제4항 기타 유방 1종. 인쇄 642쪽 각주: 남성 유방의 장애(N60~N64) 피하 유방절단은 제4항을 적용. 2604(판매 2026-07-01~, 인쇄 1283쪽) 각주도 제4항. N62만 떼어 1종으로 적은 행은 없음. Mammotomy 문장도 없음.',
      lt: '3N5 2501(판매 2025-03-31까지)에는 Mammotomy 문장이 없음. 2504(판매 2025-04-01~2025-06-15, 〈별표25〉 인쇄 1151쪽)부터 제3항 유방절단 3종, 제4항 1종에 치료목적 Mammotomy. 더끌림 포맨 2504 인쇄 1084쪽도 같은 문장. N62를 나눈 3-1항은 없음.',
      sl: '원(ONE) 간편 판매 2024-04-01 책 제3항 유방절단 3종. 제4항에 치료목적 Mammotomy 60일 문장. N62 수술 행은 2024-01 원(ONE)부터 260804 판매약관까지 없음. 여유증을 3종으로 적지 않음.'
    },
    gall: {
      kb: 'KB 5.10.10 플러스 제36항 담낭·담도 관혈(개복)은 23.04부터 26.09까지 3종. 복강경 종수가 바뀐 행은 이 구간에서 찾지 못함.',
      hy: '다이렉트 Hi2204부터 Hi2504까지 별표11 제36항 담낭·담도 관혈수술은 개복 3종으로 같음. 복강경 종수가 바뀐 날짜는 이 책에 없음.',
      hyAgency: '내삶엔 Hi2607(판매 2026-07-01~2026-07-31, 인쇄 1294쪽) 제36항 개복 3종. 복강경 담낭 H101은 4종.',
      sam: '마이헬스 파트너 제36항 담낭·담도 관혈(개복)은 2401.8 인쇄 819쪽부터 2504.11까지 3종. 복강경을 3종으로 적지 않음.',
      db: '1-5종 제36항 담낭·담도 관혈(개복)은 2309(인쇄 624쪽)부터 2607까지 3종. 별표169 제36항도 3종(2605 인쇄 1439쪽, 2607 인쇄 1359쪽). 복강경 담낭절제는 1~8종 별표76 H101이 4종(2309 인쇄 612쪽, 2025-01-23 인쇄 835쪽)이고, 그 표는 플러스 2504(판매시작 2025-04-01)부터 없다.',
      hk: 'The건강한 별표10 제36항 담낭·담도 관혈(개복)은 25.07 인쇄 1043쪽, 25.09 인쇄 1105쪽, 0545 26.10 인쇄 1226쪽 모두 3종. 복강경 종수가 바뀐 행은 이 책에서 읽지 않음.',
      mz: '케어프리 제36항 담낭·담도 관혈(개복)은 M-Basket2011과 M-Basket2504 모두 3종. 복강경이 2종으로 바뀐 행은 이 책들에서 읽지 않음.',
      hw: '한아름·3N5·더경증 제36항 개복 담낭은 3종. 복강경 담낭절제 H101은 4종(한아름2504 인쇄 782쪽). 이 구간에서 종수 변경은 없음.',
      nh: '가성비굿 제36항 개복은 2304 인쇄 640쪽부터 2604 인쇄 1280쪽까지 3종. 복강경 H101 4종 행은 뒤 책의 1~8종 표에 있음.',
      lt: '더끌림 포맨 2301 인쇄 766쪽과 3N5 2504 인쇄 1152쪽 제36항 개복은 3종. 복강경 담낭을 2종으로 바꾼 행은 없음.',
      sl: '원(ONE) 제36항 개복 담낭은 판매 2024-01-01 책과 2024-04-01 간편 책(인쇄 3024쪽)과 260804 판매약관 모두 3종.'
    }
  };
  const bag = lines[topic] || {};
  if (kb && bag.kb) return bag.kb;
  if (hy && bag.hy) return bag.hy;
  if (sam && bag.sam) return bag.sam;
  if (db && bag.db) return bag.db;
  if (hk && bag.hk) return bag.hk;
  if (mz && bag.mz) return bag.mz;
  if (hyAgency && bag.hyAgency) return bag.hyAgency;
  if (hw && bag.hw) return bag.hw;
  if (nh && bag.nh) return bag.nh;
  if (lt && bag.lt) return bag.lt;
  if (sl && bag.sl) return bag.sl;
  return '이 회사의 해당 별표 행은 여기 붙인 원문에 없습니다. 다른 회사의 종수와 개정일을 대신 적지 않습니다.';
}

function verifiedFactBox(topic, title, cosList) {
  const names = (cosList && cosList.length) ? cosList : ['확인한 약관'];
  const body = (!cosList || !cosList.length)
    ? ['KB 5.10.10 플러스 26.09', '현대해상다이렉트 Hi2404·Hi2504', '삼성화재 마이헬스 파트너 2404.10', 'DB손해보험 청춘어람', '흥국화재 The건강한', '메리츠화재 케어프리'].map(n => verifiedFactLines(topic, n)).join('<br>')
    : names.map(n => `<b>${esc(n)}</b> ${verifiedFactLines(topic, n)}`).join('<br>');
  return {
    tier: '별표 행',
    hasDiff: false,
    diffBadge: '',
    note: body.replace(/<[^>]+>/g, ''),
    boxHTML: `<div class="rev-alert-box"><div class="rab-title">${title}</div><div class="rab-desc" style="color:var(--text-2);margin-top:4px;line-height:1.5;">${body}</div></div>`
  };
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
      return verifiedFactBox('eswl', '체외충격파쇄석술 — 읽은 별표 행', cosList);
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
      return verifiedFactBox('polyp', '대장용종 내시경 절제 — 읽은 별표 행', cosList);

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
      return verifiedFactBox('breast', '유방절단·맘모톰 — 읽은 별표 행', cosList);

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
      return verifiedFactBox('gall', '담낭·담도 관혈(개복) — 읽은 별표 행', cosList);

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
            if (arr) { arr.textContent = '접기 ▴'; arr.classList.add('on'); }
          } else {
            d.style.display = 'none';
            if (arr) { arr.textContent = '펼치기 ▾'; arr.classList.remove('on'); }
          }
        " style="width:100%;height:46px;min-height:46px;max-height:46px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;background:rgba(49,130,246,0.08);border:1.5px solid rgba(49,130,246,0.35);border-radius:10px;padding:0 14px;cursor:pointer;font-size:13px;font-weight:900;color:#1d4ed8;transition:all 0.15s ease;">
          <span>🔍 수술방식별 1~5종 지급 기준</span>
          <span class="fold-toggle arrow-ico">펼치기 ▾</span>
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
          <span class="fold-toggle qrev-arrow">펼치기 ▾</span>
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
          <span class="fold-toggle sub-disease-arrow">펼치기 ▾</span>
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
            if (arr) { arr.textContent = '접기 ▴'; arr.classList.add('on'); }
          } else {
            d.style.display = 'none';
            if (arr) { arr.textContent = '펼치기 ▾'; arr.classList.remove('on'); }
          }
        " style="width:100%;height:46px;min-height:46px;max-height:46px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;background:rgba(49,130,246,0.08);border:1.5px solid rgba(49,130,246,0.35);border-radius:10px;padding:0 14px;cursor:pointer;font-size:13px;font-weight:900;color:#1d4ed8;transition:all 0.15s ease;">
          <span>🔍 수술방식별 1~5종 지급 기준</span>
          <span class="fold-toggle arrow-ico">펼치기 ▾</span>
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
          <span class="fold-toggle qrev-arrow">펼치기 ▾</span>
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
          <span class="fold-toggle sub-disease-arrow">펼치기 ▾</span>
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
      if (arrow) { arrow.textContent = isHidden ? '접기 ▴' : '펼치기 ▾'; arrow.classList.toggle('on', isHidden); }
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
          <span class="fold-toggle sub-arrow">펼치기 ▾</span>
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
                  <span class="fold-toggle co-group-arrow">펼치기 ▾</span>
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
          <span class="fold-toggle sub-disease-arrow">펼치기 ▾</span>
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
        if (arrowEl) { arrowEl.textContent = isHidden ? '접기 ▴' : '펼치기 ▾'; arrowEl.classList.toggle('on', isHidden); }
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
      if (arrow) { arrow.textContent = isHidden ? '접기 ▴' : '펼치기 ▾'; arrow.classList.toggle('on', isHidden); }
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
      if (arrow) { arrow.textContent = isHidden ? '접기 ▴' : '펼치기 ▾'; arrow.classList.toggle('on', isHidden); }
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
      if (arrow) { arrow.textContent = isHidden ? '접기 ▴' : '펼치기 ▾'; arrow.classList.toggle('on', isHidden); }
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
      if (arrow) { arrow.textContent = isHidden ? '접기 ▴' : '펼치기 ▾'; arrow.classList.toggle('on', isHidden); }
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
      if (arrow) { arrow.textContent = isHidden ? '접기 ▴' : '펼치기 ▾'; arrow.classList.toggle('on', isHidden); }
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

  // 개별 사진 터치(클릭) 시 2배 확대 / 축소 토글 엔진 (#34791 #34792 #34807)
  window.toggleRulesPageZoom = function(imgEl) {
    if (!imgEl) return;
    const isZoomed = imgEl.classList.toggle('zoomed');
    const parentBox = imgEl.parentElement;
    if (isZoomed) {
      imgEl.style.width = '190%';
      imgEl.style.maxWidth = 'none';
      imgEl.style.cursor = 'zoom-out';
      if (parentBox) {
        parentBox.style.overflowX = 'auto';
        parentBox.style.webkitOverflowScrolling = 'touch';
      }
    } else {
      imgEl.style.width = '100%';
      imgEl.style.maxWidth = '100%';
      imgEl.style.cursor = 'zoom-in';
      if (parentBox) {
        parentBox.style.overflowX = 'hidden';
        parentBox.scrollLeft = 0;
      }
    }
    const allImgs = document.querySelectorAll('.rules-page-img');
    const anyZoomed = Array.from(allImgs).some(img => img.classList.contains('zoomed'));
    const globalBtn = document.getElementById('btnRulesGlobalZoomToggle');
    if (globalBtn) {
      globalBtn.textContent = anyZoomed ? '📱 화면 크기에 맞춤' : '🔍 전체 2배 확대';
    }
  };

  // 모달 상단 전체 2배 확대 / 화면 맞춤 일괄 토글 엔진 (#34791 #34792 #34807)
  window.toggleAllRulesPagesZoom = function() {
    const allImgs = document.querySelectorAll('.rules-page-img');
    if (!allImgs.length) return;
    const anyZoomed = Array.from(allImgs).some(img => img.classList.contains('zoomed'));
    allImgs.forEach(img => {
      const parentBox = img.parentElement;
      if (anyZoomed) {
        img.classList.remove('zoomed');
        img.style.width = '100%';
        img.style.maxWidth = '100%';
        img.style.cursor = 'zoom-in';
        if (parentBox) {
          parentBox.style.overflowX = 'hidden';
          parentBox.scrollLeft = 0;
        }
      } else {
        img.classList.add('zoomed');
        img.style.width = '190%';
        img.style.maxWidth = 'none';
        img.style.cursor = 'zoom-out';
        if (parentBox) {
          parentBox.style.overflowX = 'auto';
          parentBox.style.webkitOverflowScrolling = 'touch';
        }
      }
    });
    const globalBtn = document.getElementById('btnRulesGlobalZoomToggle');
    if (globalBtn) {
      globalBtn.textContent = anyZoomed ? '🔍 전체 2배 확대' : '📱 화면 크기에 맞춤';
    }
  };

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
      stack.style.alignItems = 'center';
      stack.innerHTML = rulesModalPages.map((p, idx) => {
        let pageDesc = '';
        if (p.includes('star23_tier')) pageDesc = `📄 제 ${idx + 1} 쪽: 【별표23】 1~5종 수술분류표 (${idx + 1}/${rulesModalPages.length}쪽)`;
        else if (p.includes('ndai_31')) pageDesc = `📄 제 ${idx + 1} 쪽: 【별표44】 특정 31대 질병분류표`;
        else if (p.includes('ndai_64_p720')) pageDesc = `📄 제 ${idx + 1} 쪽: 【별표45】 다빈도 64대 질병분류표 (1/2쪽)`;
        else if (p.includes('ndai_64_p721')) pageDesc = `📄 제 ${idx + 1} 쪽: 【별표45】 다빈도 64대 질병분류표 (2/2쪽: 12대 양성종양 등)`;
        else if (p.includes('ndai_32')) pageDesc = `📄 제 ${idx + 1} 쪽: 【별표46】 32대 질병분류표`;
        else if (p.includes('ndai_5')) pageDesc = `📄 제 ${idx + 1} 쪽: 【별표47】 5대 질병분류표`;
        else if (p.includes('tier_table')) pageDesc = `📄 제 ${idx + 1} 쪽: 【별표】 1~5종 수술분류표 (${idx + 1}/${rulesModalPages.length}쪽)`;

        return `
        <div class="rules-page-item" id="rulesPageItem_${idx}" style="width:100%;max-width:860px;margin:0 auto;text-align:left;">
          <div class="rules-page-img-box" style="position:relative;width:100%;overflow:hidden;background:#ffffff;border:1px solid var(--border);box-sizing:border-box;">
            <img src="${p}" alt="${pageDesc || '약관'}" class="rules-page-img" onclick="window.toggleRulesPageZoom(this)" style="width:100%;max-width:100%;height:auto;display:block;margin:0 auto;cursor:zoom-in;">
          </div>
        </div>
        `;
      }).join('');
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
    const validPages = (pages && Array.isArray(pages) ? pages : [src]).filter(p => typeof p === 'string' && p.trim().length > 0 && p !== 'undefined');
    if (!validPages.length) {
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

    rulesModalPages = validPages;
    rulesModalCurIndex = 0;

    const ctrl = $('#rulesModalControls');
    if (ctrl) ctrl.style.display = 'flex';

    renderRulesModalPages();
    updateRulesModalPage();

    if (modalTitle) modalTitle.textContent = title || '약관';
    if (modalQuote) {
      if (quote) {
        modalQuote.style.display = 'block';
        modalQuote.textContent = quote;
        modalQuote.style.textAlign = 'left';
      } else {
        modalQuote.style.display = 'none';
        modalQuote.textContent = '';
      }
    }

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
        showToast('이 회사는 공시실 스캔이 없어 원문 이미지를 열 수 없습니다');
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
            <div style="font-size:12px;color:var(--text-2);line-height:1.5;">${counter ? '• ' + esc(counter) + '<br>' : ''}• 읽은 별표의 Mammotomy 행은 1종입니다. 2종 전액으로 적지 않습니다.</div>
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
  // KB손해보험 112대/116대 세부 질환군
  '15대질병수술': [
    { code: 'A48.1', name: '재향군인병 (레지오넬라증)', desc: '레지오넬라균에 의한 급성 호흡기 감염증' },
    { code: 'J12~J18', name: '폐렴', desc: '바이러스폐렴, 세균성폐렴, 기타 감염성폐렴, 상세불명 폐렴' },
    { code: 'J43~J47', name: '기관지 및 폐의 특정질환', desc: '폐기종, 만성 폐쇄성 폐질환(COPD), 기관지확장증' },
    { code: 'K85', name: '급성 췌장염', desc: '급성 췌장염 및 췌장 괴사' },
    { code: 'I73.1', name: '버거씨병 (폐색성 혈전혈관염)', desc: '사지 말초동맥 및 정맥의 만성 혈전성 폐색' },
    { code: 'I20~I25', name: '심장질환', desc: '협심증, 급성 심근경색증, 허혈성 심장질환' },
    { code: 'I60~I69', name: '뇌혈관질환', desc: '뇌출혈, 뇌경색증, 뇌동맥류' }
  ],
  '24대질병수술': [
    { code: 'A15~A19', name: '결핵', desc: '호흡기 결핵, 신경계 결핵, 림프절 결핵 및 결핵 후유증' },
    { code: 'G50~G52', name: '안면신경장애 및 삼차신경통', desc: '삼차신경 장애, 안면신경 장애, 기타 뇌신경 장애' },
    { code: 'J81', name: '폐부종', desc: '급성 폐부종 및 만성 폐부종' },
    { code: 'E10~E14', name: '당뇨병 질환', desc: '1형/2형 당뇨병, 당뇨병성 신경병증/망막병증/신장병증' },
    { code: 'H40, H42', name: '녹내장', desc: '원발 녹내장, 기타 녹내장' },
    { code: 'G20, G21', name: '파킨슨병', desc: '파킨슨병 및 이차성 파킨슨증' },
    { code: 'A40, A41', name: '패혈증', desc: '연쇄알균패혈증 및 기타 중증 패혈증' },
    { code: 'G04~G09', name: '뇌 및 척수의 염증성 질환', desc: '뇌염, 척수염, 뇌수막염, 두개내 농양' },
    { code: 'G40, G41', name: '뇌전증 (간질)', desc: '뇌전증 및 뇌전증지속상태' },
    { code: 'G91', name: '수두증 (뇌수종)', desc: '교통성 수두증, 폐쇄성 수두증' },
    { code: 'N00~N08', name: '사구체질환', desc: '급성·만성 신염증후군, 신증후군' },
    { code: 'N10~N16', name: '신세뇨관-간질질환', desc: '급성·만성 세뇨관간질신장염, 폐색성 요로병증' }
  ],
  '22대질병수술': [
    { code: 'E00~E07', name: '갑상선질환', desc: '갑상선기능항진증/저하증, 갑상선염, 갑상선종' },
    { code: 'E20, E21', name: '부갑상선질환', desc: '부갑상선기능저하증 및 항진증' },
    { code: 'C22', name: '간암', desc: '간 및 간내 담관의 악성 신생물' },
    { code: 'C34', name: '기관지 및 폐암', desc: '기관지 및 폐의 악성 신생물' },
    { code: 'C56', name: '난소암', desc: '난소의 악성 신생물' },
    { code: 'K55~K57', name: '특정 장질환', desc: '장의 혈관장애, 마비성 장폐색증, 장의 게실병' },
    { code: 'K86, K87', name: '췌장질환', desc: '만성 췌장염, 췌장의 낭포' },
    { code: 'M45~M48', name: '척추병증', desc: '강직척추염, 척추증, 기타 염증성 척추병증' },
    { code: 'M50, M51', name: '추간판장애 (디스크)', desc: '경추간판장애, 요추간판장애' }
  ],
  '49대질병수술': [
    { code: 'M00~M14', name: '관절염 및 다발관절병증', desc: '감염성 관절병증, 염증성 다발관절병증, 류마티스 관절염' },
    { code: 'M15~M19', name: '관절증 (퇴행성 관절염)', desc: '다발관절증, 고관절증, 무릎관절증' },
    { code: 'H35.3', name: '황반변성', desc: '황반 및 후극부의 변성' },
    { code: 'H65~H75', name: '중이염 및 유돌의 질환', desc: '비화농성/화농성 중이염, 고막 천공, 진주종' },
    { code: 'K80~K83', name: '담낭·담도질환 및 담석증', desc: '담낭염, 담도염, 담낭결석, 담관결석' },
    { code: 'K40~K46', name: '탈장', desc: '사타구니탈장, 대퇴탈장, 배꼽탈장, 복벽탈장' },
    { code: 'J32', name: '축농증 (만성 부비동염)', desc: '만성 부비동염, 상악동염' },
    { code: 'J35', name: '편도염 및 아데노이드 질환', desc: '만성 편도염, 편도의 비대, 아데노이드 비대' },
    { code: 'N40', name: '전립선비대증', desc: '양성 전립선증식증 (유로리프트, TURP)' },
    { code: 'D25', name: '자궁근종', desc: '점막하 자궁근종, 벽내 자궁근종' },
    { code: 'D24', name: '유방의 양성종양', desc: '유방의 섬유선종, 관내유두종' },
    { code: 'C16', name: '위암', desc: '위의 악성 신생물' },
    { code: 'C73', name: '갑상선암', desc: '갑상선의 악성 신생물' }
  ],
  '백내장 수술': [
    { code: 'H25', name: '노년 백내장', desc: '노년성 백내장 (초음파유화술, 인공수정체 삽입술)' },
    { code: 'H26', name: '기타 백내장', desc: '선천성 백내장, 외상성 백내장' },
    { code: 'H27', name: '수정체의 기타 장애', desc: '무수정체증, 수정체 탈구' }
  ],
  '치핵 수술': [
    { code: 'K64', name: '치핵 및 항문주위 정맥혈전증', desc: '내치핵, 외치핵, 혈전성 치핵, 탈항' }
  ],
  '23대질병수술': [
    { code: 'A15~A19', name: '결핵', desc: '호흡기 결핵 및 결핵 후유증' },
    { code: 'G50~G52', name: '안면신경장애', desc: '삼차신경통, 안면신경마비' },
    { code: 'E10~E14', name: '당뇨병', desc: '당뇨병 및 만성 합병증' },
    { code: 'H40', name: '녹내장', desc: '녹내장 수술' }
  ],
  '52대질병수술': [
    { code: 'M00~M14', name: '관절염', desc: '류마티스 및 염증성 관절염' },
    { code: 'M15~M19', name: '관절증', desc: '무릎관절증, 고관절증' },
    { code: 'K80', name: '담석증', desc: '담낭담관 결석 복강경 절제술' },
    { code: 'K40~K46', name: '탈장', desc: '서혜부 탈장 복원술' },
    { code: 'D25', name: '자궁근종', desc: '자궁근종 절제술' },
    { code: 'D24', name: '유방선종', desc: '맘모톰 유방 양성종양 절제술' }
  ],

  // 현대해상 120대/124대/119대 세부 질환군
  '26대질병Ⅱ': [
    { code: 'I20~I25', name: '심장질환', desc: '협심증, 급성 심근경색증, 허혈성 심근병증' },
    { code: 'I60~I69', name: '뇌혈관질환', desc: '뇌출혈, 지주막하출혈, 뇌경색증' },
    { code: 'K70~K76', name: '간질환', desc: '만성 간염, 간경화증, 간부전' },
    { code: 'J40~J47', name: '만성하부호흡기질환', desc: '만성 기관지염, 폐기종, COPD' },
    { code: 'J12~J18', name: '폐렴', desc: '세균성 및 바이러스성 폐렴' },
    { code: 'N18', name: '만성 신부전증', desc: '만성 콩팥병, 투석 요법 대상' }
  ],
  '58대질병Ⅱ': [
    { code: 'E10~E14', name: '당뇨병', desc: '당뇨병 및 혈관 합병증' },
    { code: 'E00~E07', name: '갑상선질환', desc: '갑상선기능장애 및 갑상선염' },
    { code: 'H40', name: '녹내장', desc: '원발 녹내장' },
    { code: 'K25~K28', name: '위십이지장궤양', desc: '소화성 궤양 질환' },
    { code: 'G56.0', name: '손목터널증후군', desc: '수근관증후군 신경감압술' },
    { code: 'G20', name: '파킨슨병', desc: '파킨슨병' },
    { code: 'G04', name: '뇌염 및 척수염', desc: '중추신경계 염증성 질환' }
  ],
  '24대질병': [
    { code: 'J80~J84', name: '특정 호흡기질환', desc: '폐부종, 간질성 폐질환' },
    { code: 'A15~A19', name: '결핵', desc: '결핵균 감염 질환' },
    { code: 'K81~K83', name: '담낭·담도질환', desc: '담낭염 및 담관염' },
    { code: 'N17~N19', name: '신부전', desc: '신장기능 상실 질환' },
    { code: 'K20~K22', name: '식도질환', desc: '위식도역류병, 식도협착' }
  ],
  '다발성 10대질병': [
    { code: 'D24', name: '유방의 양성종양', desc: '섬유선종, 양성 유방 질환' },
    { code: 'D25', name: '자궁의 평활근종', desc: '자궁근종' },
    { code: 'H65~H67', name: '중이염', desc: '삼출성 및 화농성 중이염' },
    { code: 'K40~K46', name: '탈장', desc: '복부 및 서혜부 탈장' },
    { code: 'J35', name: '만성 편도염', desc: '편도 및 아데노이드 질환' },
    { code: 'J32', name: '축농증', desc: '만성 부비강염' },
    { code: 'M15~M19', name: '관절증', desc: '퇴행성 무릎·고관절 관절염' }
  ],
  '치핵': [
    { code: 'K64', name: '치핵', desc: '치핵 및 항문주위 정맥혈전증' }
  ],
  '갑상선관련질병': [
    { code: 'E00~E07', name: '갑상선의 장애', desc: '갑상선 질환 및 기능장애' }
  ],
  '특정 3대질병': [
    { code: 'I21~I23', name: '급성 심근경색증', desc: '급성 심근경색' },
    { code: 'I60~I62', name: '뇌출혈', desc: '지주막하출혈 및 뇌내출혈' },
    { code: 'I63', name: '뇌경색증', desc: '뇌경색증 (허혈성 뇌졸중)' }
  ],
  '특정 2대질병': [
    { code: 'J12~J18', name: '중증 폐렴', desc: '세균성 및 중증 합병증 동반 폐렴' },
    { code: 'N18', name: '만성 신부전증', desc: '만성 신장병 말기' }
  ],
  '22대질병': [
    { code: 'I20~I25', name: '심장질환', desc: '허혈심장질환' },
    { code: 'I60~I69', name: '뇌혈관질환', desc: '뇌혈관질환 전수' },
    { code: 'K70~K76', name: '간질환', desc: '간경변 및 만성 간부전' }
  ],
  '58대질병': [
    { code: 'E10~E14', name: '당뇨병', desc: '당뇨병' },
    { code: 'E00~E07', name: '갑상선질환', desc: '갑상선질환' },
    { code: 'H40', name: '녹내장', desc: '녹내장' }
  ],
  '특정 4대질병': [
    { code: 'J12~J18', name: '중증폐렴', desc: '중증 폐렴' },
    { code: 'K74', name: '간경변증', desc: '간의 섬유증 및 경화증' },
    { code: 'N18', name: '만성신부전', desc: '만성 콩팥병' },
    { code: 'K85', name: '급성췌장염', desc: '급성 췌장염' }
  ],

  // 삼성화재 111대 세부 질환군
  '5대주요기관 질병': [
    { code: 'I60~I69', name: '뇌혈관질환', desc: '뇌출혈, 뇌경색증, 뇌동맥류' },
    { code: 'I20~I25', name: '허혈성심장질환', desc: '협심증, 급성 심근경색증' },
    { code: 'K70~K76', name: '간질환', desc: '만성 간염, 간경변증, 간부전' },
    { code: 'J40~J47', name: '만성하부호흡기질환', desc: '만성 기관지염, 폐기종, COPD' },
    { code: 'N18', name: '신부전', desc: '만성 신장병, 만성 신부전증' }
  ],
  '22대주요 질병': [
    { code: 'E10~E14', name: '당뇨병', desc: '1형/2형 당뇨병 및 합병증' },
    { code: 'I10~I15', name: '고혈압성 질환', desc: '본태성 고혈압, 고혈압성 심신장질환' },
    { code: 'I70', name: '동맥경화증', desc: '죽상경화증 및 말초동맥질환' },
    { code: 'J12~J18', name: '폐렴', desc: '감염성 폐렴' },
    { code: 'A15~A19', name: '결핵', desc: '호흡기 및 기타 기관의 결핵' },
    { code: 'K25~K28', name: '위십이지장궤양', desc: '소화성 궤양 질환' },
    { code: 'H65~H67', name: '중이염', desc: '비화농성/화농성 중이염' },
    { code: 'H40', name: '녹내장', desc: '녹내장' }
  ],
  '3대특정 질병': [
    { code: 'I21~I23', name: '급성 심근경색증', desc: '급성 심근경색' },
    { code: 'I60~I62', name: '뇌출혈', desc: '지주막하출혈, 뇌내출혈' },
    { code: 'I63', name: '뇌경색증', desc: '뇌경색증' }
  ],
  '19대생활 질병': [
    { code: 'M05~M14', name: '관절염', desc: '류마티스 관절염' },
    { code: 'H25~H28', name: '백내장', desc: '백내장' },
    { code: 'K80~K83', name: '담석증 및 담낭염', desc: '담낭결석, 담관염' },
    { code: 'K40', name: '사타구니탈장', desc: '서혜부 탈장' },
    { code: 'J35', name: '편도염', desc: '만성 편도염' },
    { code: 'J32', name: '축농증', desc: '만성 부비동염' }
  ],
  '62대생활 질병': [
    { code: 'K64', name: '치핵', desc: '치핵 및 항문질환' },
    { code: 'D25', name: '자궁근종', desc: '자궁의 평활근종' },
    { code: 'D24', name: '유방선종', desc: '유방의 양성 신생물' },
    { code: 'G56.0', name: '손목터널증후군', desc: '수근관증후군' },
    { code: 'G51', name: '안면신경장애', desc: '안면신경마비' },
    { code: 'D12, D13', name: '위·대장 양성종양', desc: '위·대장 양성 신생물 (용종/폴립)' }
  ],

  // DB손해보험 120대 세부 질환군
  '6대질병': [
    { code: 'I20~I25', name: '심장질환', desc: '허혈심장질환' },
    { code: 'I60~I69', name: '뇌혈관질환', desc: '뇌혈관질환 전수' },
    { code: 'K70~K76', name: '간질환', desc: '간경변 및 만성 간부전' },
    { code: 'I10~I15', name: '고혈압', desc: '고혈압성 질환' },
    { code: 'E10~E14', name: '당뇨병', desc: '당뇨병' },
    { code: 'J40~J47', name: '만성호흡기질환', desc: 'COPD, 만성기관지염' }
  ],
  '9대질병': [
    { code: 'K25~K28', name: '위십이지장궤양', desc: '소화성 궤양 질환' },
    { code: 'N18', name: '신부전', desc: '만성 신장병' },
    { code: 'A15~A19', name: '결핵', desc: '결핵균 감염' },
    { code: 'A40~A41', name: '패혈증', desc: '중증 패혈증' },
    { code: 'G20', name: '파킨슨', desc: '파킨슨병' },
    { code: 'G04', name: '뇌염', desc: '뇌염 및 척수염' },
    { code: 'J12~J18', name: '중증폐렴', desc: '중증 폐렴' }
  ],
  '20대질병': [
    { code: 'E00~E07', name: '갑상선질환', desc: '갑상선 기능장애' },
    { code: 'H40', name: '녹내장', desc: '녹내장' },
    { code: 'I74', name: '동맥색전증', desc: '동맥 색전 및 혈전' },
    { code: 'K85~K86', name: '췌장질환', desc: '급성 및 만성 췌장염' },
    { code: 'M45~M48', name: '척추병증', desc: '척추 질환 및 척추증' }
  ],
  '22대질병': [
    { code: 'G56.0', name: '손목터널증후군', desc: '수근관증후군' },
    { code: 'G51', name: '안면신경장애', desc: '안면신경마비' },
    { code: 'K80', name: '담석증', desc: '담낭 및 담관 결석' },
    { code: 'K81~K83', name: '담낭염', desc: '담낭 질환' },
    { code: 'K20~K22', name: '식도질환', desc: '식도 질환' },
    { code: 'N83', name: '난소질환', desc: '난소 및 난관의 비염증성 장애' }
  ],
  '63대질병': [
    { code: 'M05~M14', name: '관절염', desc: '염증성 관절염' },
    { code: 'M15~M19', name: '관절증', desc: '퇴행성 관절염' },
    { code: 'K40~K46', name: '탈장', desc: '서혜부 및 복벽 탈장' },
    { code: 'J32', name: '축농증', desc: '만성 부비동염' },
    { code: 'J35', name: '편도염', desc: '만성 편도염' },
    { code: 'H25~H28', name: '백내장', desc: '백내장' },
    { code: 'K64', name: '치핵', desc: '치핵' },
    { code: 'D25', name: '자궁근종', desc: '자궁근종' },
    { code: 'D24', name: '유방선종', desc: '유방선종' }
  ],

  // 메리츠 131대 세부 질환군
  '심장질환': [
    { code: 'I20~I25', name: '허혈성 심장질환', desc: '협심증, 급성 심근경색증, 이차성 심근경색증' }
  ],
  '뇌혈관질환': [
    { code: 'I60~I69', name: '뇌혈관질환', desc: '지주막하출혈, 뇌내출혈, 뇌경색증, 뇌동맥류' }
  ],
  '특정 31대질병': [
    { code: 'K70~K76', name: '간질환', desc: '만성 간염, 간경변증, 간부전' },
    { code: 'K85', name: '췌장질환', desc: '급성 췌장염' },
    { code: 'J40~J47', name: '만성하부호흡기질환', desc: '만성 기관지염, 폐기종, COPD' },
    { code: 'J12~J18', name: '폐렴', desc: '세균성 및 바이러스성 폐렴' },
    { code: 'A15~A19', name: '결핵', desc: '호흡기 결핵 및 결핵 후유증' },
    { code: 'E10~E14', name: '당뇨병', desc: '당뇨병 및 혈관 합병증' },
    { code: 'G20', name: '파킨슨병', desc: '파킨슨병' },
    { code: 'N18', name: '만성 신부전증', desc: '만성 콩팥병' }
  ],
  '다빈도 64대질병': [
    { code: 'M05~M14', name: '관절염', desc: '염증성 다발관절병증' },
    { code: 'H40', name: '녹내장', desc: '원발 녹내장' },
    { code: 'K80', name: '담석증', desc: '담낭결석, 담관결석' },
    { code: 'K81~K83', name: '담낭염 및 담도질환', desc: '급성·만성 담낭염' },
    { code: 'K40~K46', name: '사타구니탈장 및 복부탈장', desc: '서혜부 탈장' },
    { code: 'J32', name: '축농증', desc: '만성 부비동염' },
    { code: 'J35', name: '편도염', desc: '만성 편도염' }
  ],
  '특정 다빈도 29대질병': [
    { code: 'G56.0', name: '손목터널증후군', desc: '수근관증후군' },
    { code: 'G51', name: '안면신경장애', desc: '안면신경마비' },
    { code: 'B02', name: '대상포진관련 질환', desc: '대상포진성 신경병증' },
    { code: 'M50, M51', name: '추간판장애', desc: '경추 및 요추 디스크' },
    { code: 'H65~H67', name: '중이염', desc: '중이염' }
  ],
  '후각 특정질환': [
    { code: 'J30~J34', name: '비염 및 코폴립', desc: '혈관운동성 및 알레르기 비염, 코폴립' }
  ],
  '관절염·생식기 질환': [
    { code: 'M05~M14', name: '염증성 다발관절병증', desc: '관절염' },
    { code: 'N70~N77', name: '여성 골반내 기관 염증성 질환', desc: '골반염, 난소염, 자궁염' }
  ],
  '백내장': [
    { code: 'H25~H28', name: '백내장 및 수정체 장애', desc: '노년 백내장, 기타 백내장' }
  ],
  '생활 48대질병': [
    { code: 'M05~M14', name: '관절염', desc: '염증성 다발관절병증' },
    { code: 'M15~M19', name: '관절증', desc: '퇴행성 관절염' },
    { code: 'K40~K46', name: '탈장', desc: '서혜부 탈장' },
    { code: 'J32', name: '축농증', desc: '만성 부비동염' },
    { code: 'J35', name: '편도염', desc: '만성 편도염' },
    { code: 'N40', name: '전립선증식증', desc: '양성 전립선비대증' },
    { code: 'D24', name: '유방선종', desc: '유방 양성종양' },
    { code: 'H15~H22', name: '안과질환', desc: '각막 및 공막 장애' }
  ],

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
  '다발성 16대질병': [
    { code: 'I47~I49', name: '부정맥 (빈맥·세동·조기탈분극)', desc: '발작성 빈맥, 심방세동 및 조동, 기타 심장부정맥' },
    { code: 'I50', name: '심부전', desc: '울혈성 심부전, 좌심실부전, 상세불명의 심부전' },
    { code: 'I74', name: '동맥색전증 및 혈전증', desc: '복부 대동맥 색전증, 사지 동맥 색전증' },
    { code: 'G91', name: '수두증 (뇌수종)', desc: '교통성 수두증, 폐쇄성 수두증' },
    { code: 'I69', name: '뇌혈관질환의 후유증', desc: '지주막하출혈 후유증, 뇌경색증 후유증' },
    { code: 'J81', name: '폐부종', desc: '급성 폐부종, 만성 폐부종' },
    { code: 'K22', name: '식도질환', desc: '위식도역류병, 식도궤양, 식도폐쇄' },
    { code: 'N18', name: '만성 콩팥(신장)병', desc: '만성 신장병 1~5기, 말기 신장병' }
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

  let clauseComposing = false;
  let commitAfterComposition = false;
  let clauseSubmitLock = 0;
  function syncClauseQueryLive() {
    const val = qInput ? qInput.value.trim() : '';
    state.clauseQ = val;
    if (clearBtn) clearBtn.hidden = !val;
    renderClausesCompanyList(val);
  }
  function submitClauseSearch() {
    if (!qInput) return;
    if (clauseComposing) {
      commitAfterComposition = true;
      return;
    }
    const now = Date.now();
    if (now - clauseSubmitLock < 300) return;
    clauseSubmitLock = now;
    const val = qInput.value.trim();
    state.clauseQ = val;
    if (clearBtn) clearBtn.hidden = !val;
    qInput.blur();
    const vv = window.visualViewport;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      if (vv) vv.removeEventListener('resize', onResize);
      renderClausesCompanyList(val, { commit: true });
    };
    const onResize = () => setTimeout(finish, 80);
    if (vv) vv.addEventListener('resize', onResize);
    setTimeout(finish, 320);
  }
  window.submitClauseSearch = submitClauseSearch;

  // 원터치 예시 칩 터치 시 검색 실행 (#30326)
  $$('.btn-clause-example-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const ex = chip.getAttribute('data-example');
      if (!qInput || !ex) return;
      clauseComposing = false;
      commitAfterComposition = false;
      qInput.value = ex;
      submitClauseSearch();
    });
  });

  const clauseForm = document.getElementById('clauseSearchForm');
  if (clauseForm) {
    clauseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitClauseSearch();
    });
  }

  if (qInput) {
    qInput.addEventListener('compositionstart', () => { clauseComposing = true; });
    qInput.addEventListener('compositionend', () => {
      clauseComposing = false;
      syncClauseQueryLive();
      if (commitAfterComposition) {
        commitAfterComposition = false;
        submitClauseSearch();
      }
    });
    qInput.addEventListener('input', () => {
      syncClauseQueryLive();
    });
    qInput.addEventListener('keydown', (e) => {
      const enter = e.key === 'Enter' || e.keyCode === 13;
      if (!enter) return;
      if (e.isComposing || e.keyCode === 229 || clauseComposing) {
        commitAfterComposition = true;
        return;
      }
      e.preventDefault();
      submitClauseSearch();
    });
    qInput.addEventListener('search', () => submitClauseSearch());
    qInput.addEventListener('focus', () => {
      const x = window.pageXOffset;
      const y = window.pageYOffset;
      requestAnimationFrame(() => window.scrollTo(x, y));
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (qInput) {
        qInput.value = '';
        qInput.focus({ preventScroll: true });
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

  // 모달 내부 실시간 검색 바인딩 (#36849)
  const innerSearch = $('#clauseInnerSearch');
  if (innerSearch) {
    innerSearch.addEventListener('input', () => {
      const q = innerSearch.value.trim();
      renderClauseModalContent(q, currentClauseModalData);
      const box = $('#clauseModalContent');
      if (box) box.scrollTop = 0;
      const modal = $('#clauseModal');
      if (modal) modal.scrollTop = 0;
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
  if (periodStr.trim().startsWith('~') || periodStr.includes('이전')) {
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
  const m2 = rawQ.match(/(?:^|[^\d])(19\d{2}|20\d{2})(?!\d)/);
  if (m2) return parseInt(m2[1], 10);
  return null;
}

function extractSearchedNdaiNum(rawQ) {
  const m = String(rawQ || '').match(/(\d{2,3})대/);
  return m ? parseInt(m[1], 10) : null;
}

function companyAliasKeys(co) {
  const keys = [co && co.name, co && co.shortName].concat((co && co.aliases) || []);
  const out = [];
  keys.forEach(a => {
    const n = norm(a).replace(/\s+/g, '');
    if (n.length >= 2 && out.indexOf(n) < 0) out.push(n);
  });
  return out.sort((a, b) => b.length - a.length);
}

function findCompaniesInQuery(rawQ, companies) {
  const q = norm(rawQ).replace(/\s+/g, '');
  if (!q) return [];
  return (companies || []).filter(co => companyAliasKeys(co).some(a => q.includes(a)));
}

function displayedPeriods(co) {
  const board = window.SCAN_BOARDS && window.SCAN_BOARDS[co.id];
  if (board && board.periods && board.periods.length) {
    return board.periods.map(p => ({ id: p.id, label: p.label || '' }));
  }
  return (co.periods || []).map(p => ({ id: p.id, label: p.periodStr || '' }));
}

function periodNdaiLabels(co, pid) {
  const face = window.MERITZ_FACE && window.MERITZ_FACE[pid] && window.MERITZ_FACE[pid].standard;
  if (face && Array.isArray(face.bundles) && face.bundles.length) {
    return face.bundles.map(b => b.name).filter(Boolean);
  }
  const opts = (typeof window.ndaiOptionsForCompany === 'function') ? window.ndaiOptionsForCompany(co.id, pid, '') : [];
  return (opts || []).filter(o => o && o !== '미확인');
}

function ndaiNumOf(label) {
  const m = String(label || '').match(/(\d{2,3})/);
  return m ? parseInt(m[1], 10) : null;
}

function buildPeriodPlan(co, year, ndaiNum) {
  const periods = displayedPeriods(co).map(p => {
    const range = parsePeriodYearRange(p.label);
    return {
      id: p.id,
      labels: periodNdaiLabels(co, p.id),
      yearHit: year != null && year >= range[0] && year <= range[1]
    };
  });
  const plan = {};
  if (year == null && ndaiNum == null) return plan;
  const exactLabel = (labels) => labels.find(l => ndaiNumOf(l) === ndaiNum) || null;
  if (ndaiNum == null) {
    periods.forEach(p => {
      if (p.yearHit) plan[p.id] = { tag: '검색한 시기', ndai: null, ndaiTag: '' };
    });
    return plan;
  }
  const pool = year != null ? periods.filter(p => p.yearHit) : periods;
  const exactPeriods = pool.filter(p => exactLabel(p.labels));
  if (exactPeriods.length) {
    exactPeriods.forEach(p => {
      plan[p.id] = { tag: '검색한 특약', ndai: exactLabel(p.labels), ndaiTag: '검색한 특약' };
    });
    return plan;
  }
  const searchPool = pool.length ? pool : periods;
  let bestD = Infinity;
  searchPool.forEach(p => {
    p.labels.forEach(l => {
      const n = ndaiNumOf(l);
      if (n == null) return;
      bestD = Math.min(bestD, Math.abs(n - ndaiNum));
    });
  });
  if (bestD === Infinity) return plan;
  searchPool.forEach(p => {
    const label = p.labels.find(l => {
      const n = ndaiNumOf(l);
      return n != null && Math.abs(n - ndaiNum) === bestD;
    });
    if (!label) return;
    plan[p.id] = { tag: '비슷한 항목', ndai: label, ndaiTag: '비슷한 항목' };
  });
  return plan;
}

function periodSearchHit(co, pid, matchContext) {
  const plan = matchContext && matchContext.periodPlan && matchContext.periodPlan[co.id];
  if (plan && plan[pid]) return plan[pid];
  return null;
}

function stickyCoverBottom() {
  const bar = document.querySelector('.topbar');
  let bottom = bar ? bar.getBoundingClientRect().bottom : 0;
  const search = document.querySelector('.search-wrap');
  if (search) {
    const rect = search.getBoundingClientRect();
    if (rect.height > 8 && rect.bottom > bottom && rect.top < bottom + 40) bottom = rect.bottom;
  }
  return bottom;
}

function scrollOpenedCard(el) {
  if (!el || !el.isConnected) return;
  const reserve = stickyCoverBottom() + 8;
  const y = el.getBoundingClientRect().top + window.pageYOffset - reserve;
  window.scrollTo(0, Math.max(0, y));
}

function resetPeriodBox(box) {
  if (!box) return;
  const host = box.classList.contains('period-accordion-box') ? box : box.closest('.period-accordion-box');
  const drawer = (host && host.querySelector('.period-drawer-content')) || (box.classList.contains('period-drawer-content') ? box : null);
  const headBtn = host && host.querySelector('.btn-toggle-period');
  const cid = headBtn && headBtn.getAttribute('data-co-id');
  const pid = (drawer && drawer.getAttribute('data-pid')) || (headBtn && headBtn.getAttribute('data-pid'));
  const scanBody = drawer && drawer.querySelector('.scan-body');
  if (scanBody && cid && pid && state.scanUi && state.scanUi[cid] && state.scanUi[cid][pid]) {
    const sel = state.scanUi[cid][pid];
    const face = window.MERITZ_FACE && window.MERITZ_FACE[pid] && window.MERITZ_FACE[pid].standard;
    const bundles = (face && face.bundles) || [];
    sel.open = {};
    sel.groups = false;
    sel.group = '';
    sel.disease = '';
    if (bundles.length) {
      const keep = sel.ndaiMatch && bundles.some(b => b.name === sel.ndaiMatch);
      sel.ndai = keep ? sel.ndaiMatch : bundles[0].name;
    }
    paintScanDrawer(drawer);
  } else if (drawer) {
    drawer.querySelectorAll('.cov-drawer').forEach(d => { d.style.display = 'none'; });
    drawer.querySelectorAll('.fold-toggle').forEach(b => {
      if (b.classList.contains('period-arrow-badge')) return;
      b.textContent = '펼치기 ▾';
      b.classList.remove('on');
    });
    drawer.querySelectorAll('.rider-card-ndai').forEach(card => {
      const tabs = [...card.querySelectorAll('.btn-ndai-tab-select')];
      if (!tabs.length) return;
      const marked = tabs.find(t => t.querySelector('.search-tab-note')) || tabs[0];
      tabs.forEach(b => {
        b.classList.remove('active', 'on');
        b.style.border = '1.5px solid var(--border)';
        b.style.background = 'var(--surface)';
        b.style.color = '#334155';
        b.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
      });
      marked.classList.add('active', 'on');
      marked.style.border = '1.5px solid var(--brand)';
      marked.style.background = 'var(--brand)';
      marked.style.color = '#fff';
      marked.style.boxShadow = 'none';
      const opt = marked.getAttribute('data-ndai-opt') || '';
      card.setAttribute('data-current-ndai', opt);
      card.querySelectorAll('.btn-open-clause-modal[data-target-rider="ndai"]').forEach(mb => mb.setAttribute('data-ndai', opt));
    });
  }
  if (drawer) drawer.style.display = 'none';
  const badge = host && host.querySelector('.period-arrow-badge');
  if (badge) {
    badge.textContent = '펼치기 ▾';
    badge.classList.remove('on');
  }
}

function collapseCompanyCard(card) {
  if (!card) return;
  const drawer = card.querySelector('.co-periods-drawer');
  if (drawer) drawer.style.display = 'none';
  const arrow = card.querySelector('.btn-co-toggle-arrow');
  if (arrow) {
    arrow.textContent = '펼치기 ▾';
    arrow.classList.remove('on');
  }
  card.querySelectorAll('.period-accordion-box').forEach(resetPeriodBox);
}

function primeScanSearch(matchContext) {
  if (!state.scanUi) state.scanUi = {};
  const plan = (matchContext && matchContext.periodPlan) || {};
  Object.keys(state.scanUi).forEach(cid => {
    const bucket = state.scanUi[cid] || {};
    Object.keys(bucket).forEach(pid => {
      const sel = bucket[pid];
      if (!sel) return;
      sel.ndaiMatch = '';
      sel.ndaiTag = '';
      const hit = plan[cid] && plan[cid][pid];
      if (!hit || !hit.ndai) return;
      if (!sel.open) sel.open = {};
      sel.ndai = hit.ndai;
      sel.ndaiMatch = hit.ndai;
      sel.ndaiTag = hit.ndaiTag || '';
    });
  });
  Object.keys(plan).forEach(cid => {
    if (!state.scanUi[cid]) state.scanUi[cid] = {};
    Object.keys(plan[cid] || {}).forEach(pid => {
      const hit = plan[cid][pid];
      if (!hit || !hit.ndai) return;
      if (!state.scanUi[cid][pid]) state.scanUi[cid][pid] = { ptype: 'standard', open: {}, ndai: '', groups: false, group: '' };
      const sel = state.scanUi[cid][pid];
      if (!sel.open) sel.open = {};
      sel.ndai = hit.ndai;
      sel.ndaiMatch = hit.ndai;
      sel.ndaiTag = hit.ndaiTag || '';
    });
  });
}

function periodStartKey(str) {
  const s = String(str || '');
  const y = s.match(/(\d{4})\s*년/);
  const mo = s.match(/(\d{1,2})\s*월/);
  const d = s.match(/(\d{1,2})\s*일/);
  let year = y ? +y[1] : 0;
  let month = mo ? +mo[1] : 1;
  let day = d ? +d[1] : 1;
  if (s.includes('이전')) {
    if (d) day = Math.max(0, day - 1);
    else if (mo) { month = Math.max(1, month - 1); day = 28; }
    else { year = Math.max(0, year - 1); month = 12; day = 31; }
  }
  return year * 10000 + month * 100 + day;
}

function periodsNewestFirst(periods) {
  return (periods || []).map((p, i) => ({ p, i })).sort((a, b) => {
    const diff = periodStartKey(b.p.periodStr || b.p.label) - periodStartKey(a.p.periodStr || a.p.label);
    return diff || (a.i - b.i);
  }).map(x => x.p);
}

function revChipPx(rows) {
  let max = 2;
  (rows || []).forEach(r => {
    max = Math.max(max, String(r.before || '').length, String(r.after || '').length);
  });
  return Math.max(56, max * 12 + 8);
}

function revRowsHTML(rows) {
  return (rows || []).map(r => `<div class="rev-row"><span class="rev-name">${esc(r.name)}</span><span class="rev-pill">${esc(r.before)}</span><span class="rev-arrow">→</span><span class="rev-pill after">${esc(r.after)}</span></div>`).join('');
}

function revisionKeyBoxHTML(cardLine, lines) {
  if (cardLine === '최초 기준') return '';
  const rows = (lines || []).filter(r => r && typeof r === 'object' && r.name && r.before && r.after);
  if (!rows.length) return '';
  const order = ['질병수술비', '1~5종 수술비', 'N대 질병수술비'];
  const groups = [];
  rows.forEach(r => {
    const cover = r.cover || '';
    let g = groups.find(x => x.cover === cover);
    if (!g) {
      g = { cover, rows: [] };
      groups.push(g);
    }
    g.rows.push(r);
  });
  groups.sort((a, b) => {
    const ia = order.indexOf(a.cover);
    const ib = order.indexOf(b.cover);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const body = groups.map(g => `${g.cover ? `<div class="rev-cover">${esc(g.cover)}</div>` : ''}<div class="rev-grid">${revRowsHTML(g.rows)}</div>`).join('');
  return `<div class="rev-key-box" style="--rev-chip:${revChipPx(rows)}px"><div class="rev-key-title">주요 개정내용</div>${body}</div>`;
}

function renderScanCompanyHTML(co, matchContext) {
  const board = window.SCAN_BOARDS && window.SCAN_BOARDS[co.id];
  if (!board || !board.periods || !board.periods.length) return '';
  const periods = periodsNewestFirst(board.periods);
  return `
    <div class="scan-board" data-cid="${esc(co.id)}">
      ${periods.map(p => {
        const hit = periodSearchHit(co, p.id, matchContext);
        const tag = hit && hit.tag ? hit.tag : '';
        return `
        <div class="period-accordion-box${tag ? ' search-hit' : ''}" style="background:var(--surface);border:${tag ? '2px solid var(--gold)' : '1.5px solid var(--border)'};border-radius:12px;overflow:hidden;">
          <div class="btn-toggle-period" data-co-id="${esc(co.id)}" data-pid="${esc(p.id)}" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:var(--surface);user-select:none;gap:8px;">
            <span style="min-width:0;flex:1;text-align:left;">
              <span style="display:block;font-size:14px;font-weight:900;color:var(--text);letter-spacing:-.01em;">${esc(p.label)}</span>
              ${tag ? `<span class="search-hit-label">${esc(tag)}</span>` : ''}
            </span>
            <span class="fold-toggle period-arrow-badge">펼치기 ▾</span>
          </div>
          <div id="period-drawer-${esc(co.id)}-${esc(p.id)}" class="period-drawer-content" data-pid="${esc(p.id)}" style="display:none;padding:12px 14px 14px;border-top:1px dashed var(--line);background:var(--surface-2);flex-direction:column;gap:10px;">
            ${revisionKeyBoxHTML(p.cardLine, p.revisionBullets)}
            <div class="scan-body"></div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function scanDateLabel(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d || ''));
  if (!m) return d || '';
  return m[1].slice(2) + '.' + m[2] + '.' + m[3];
}

function scanRowGroup(item) {
  const s = String(item || '');
  if (/맘모톰|N62|유방|체외충격파|1~5종|1-5종/.test(s)) return 'tier';
  if (/\d+대/.test(s)) return 'ndai';
  if (/질병수술|보상/.test(s)) return 'disease';
  return '';
}

function openScanPages(pages, title, note) {
  const list = (pages || []).filter(Boolean);
  if (!list.length || !window.openRulesModal) return;
  window.openRulesModal(list[0], title || '약관', note || '', list, null);
  const body = document.getElementById('rulesModalBody');
  if (body) {
    body.style.overflowX = 'auto';
    body.style.overflowY = 'auto';
  }
  document.querySelectorAll('#rulesModalPagesStack img').forEach(img => {
    img.style.width = '1100px';
    img.style.maxWidth = 'none';
    img.style.height = 'auto';
  });
  document.querySelectorAll('#rulesModalPagesStack .rules-page-img-box').forEach(box => {
    box.style.overflow = 'auto';
  });
}

function openScanSummary(title, pay, excl, pages) {
  const modal = $('#clauseModal');
  const box = $('#clauseModalContent');
  const titleEl = $('#clauseModalTitle');
  const searchWrap = $('#clauseModalSearchWrap');
  const alertEl = $('#clauseModalAlert');
  if (!modal || !box) {
    openScanPages(pages, title, '');
    return;
  }
  if (titleEl) titleEl.textContent = title || '약관';
  if (searchWrap) searchWrap.style.display = 'none';
  if (alertEl) alertEl.style.display = 'none';
  const blocks = [];
  if (pay) blocks.push(`<h3 class="scan-sec">보상하는 사항</h3><p class="scan-none">${esc(pay)}</p>`);
  if (excl) blocks.push(`<h3 class="scan-sec">보장 제외 사항</h3><p class="scan-none">${esc(excl)}</p>`);
  const ready = (pages || []).filter(Boolean);
  const originalBtn = ready.length ? `<button type="button" class="cov-btn point" id="scanSummaryOriginal" style="width:100%;margin:0 0 12px;">약관 원문보기</button>` : '';
  box.innerHTML = originalBtn + blocks.join('');
  const btn = box.querySelector('#scanSummaryOriginal');
  if (btn) btn.addEventListener('click', () => openScanPages(ready, title, ''));
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function mergeCodeRows(list) {
  const order = [];
  const map = new Map();
  (list || []).forEach(raw => {
    let code = '';
    let name = '';
    if (raw && typeof raw === 'object') {
      code = String(raw.code || '').trim();
      name = String(raw.name || '').trim();
    } else {
      code = String(raw || '').trim();
    }
    const key = code || name;
    if (!key) return;
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    const names = map.get(key);
    if (name && names.indexOf(name) < 0) names.push(name);
  });
  return order.map(key => ({ code: key, name: map.get(key).join(' · ') }));
}

function codeTableHTML(list) {
  const rows = mergeCodeRows(list);
  if (!rows.length) return '';
  return `<div class="code-table">${rows.map(r => `<div class="code-table-row"><span class="code-table-chip">${esc(r.code)}</span><span class="code-table-name">${esc(r.name)}</span></div>`).join('')}</div>`;
}

function diffBoxHTML(kc) {
  if (!kc || !kc.items || !kc.items.length) return '';
  const rows = kc.items.map((it, i) => {
    const chips = (it.codes || []).map(code => `<span class="kcd-badge">${esc(code)}</span>`).join('');
    const no = kc.numbered ? `<span class="five-no">${i + 1}</span>` : '';
    return `<div class="code-line">${no}<span class="name">${esc(it.name)}</span><span class="code-chips">${chips}</span></div>`;
  }).join('');
  const title = kc.title ? `<div class="diff-box-title">${esc(kc.title)}</div>` : '';
  return `<div class="diff-box">${title}${rows}</div>`;
}

function meritzCardsHTML(list) {
  return (list || []).map(c => `
    <div class="excl-card">
      <b>${esc(c.name)}</b>
      ${c.text ? `<p>${esc(c.text)}</p>` : ''}
      ${(c.codes && c.codes.length) ? `<div class="cov-codes">${c.codes.map(code => `<span class="kcd-badge">${esc(code)}</span>`).join('')}</div>` : ''}
    </div>`).join('');
}

function openMeritzClauseModal(pack, mode) {
  const modal = $('#clauseModal');
  const box = $('#clauseModalContent');
  const titleEl = $('#clauseModalTitle');
  const searchWrap = $('#clauseModalSearchWrap');
  const alertEl = $('#clauseModalAlert');
  if (!modal || !box || !pack) return;
  if (titleEl) titleEl.textContent = pack.label || '질병수술비';
  if (searchWrap) searchWrap.style.display = 'none';
  if (alertEl) alertEl.style.display = 'none';
  const imgBtn = (pages, title) => {
    const list = (pages || []).filter(Boolean);
    if (!list.length) return '';
    return `<button type="button" class="cov-btn point" id="meritzImgBtn" data-pages="${esc(list.join('|'))}" data-title="${esc(title)}" style="width:100%;margin:0 0 12px;">약관 원문보기</button>`;
  };
  function codeLinesHTML(rows) {
    return (rows || []).map((r, i) => {
      const codes = r.codes || [];
      const chips = codes.map(code => `<span class="kcd-badge">${esc(code)}</span>`).join('');
      if (codes.length > 4) {
        return `<div class="code-line"><button type="button" class="code-line-btn" data-code-fold="${i}"><span class="name">${esc(r.name)}</span><span class="fold-toggle">펼치기 ▾</span></button><div class="code-chips" data-code-body="${i}" style="display:none;width:100%;justify-content:flex-start;margin-top:6px;">${chips}</div></div>`;
      }
      return `<div class="code-line"><span class="name">${esc(r.name)}</span><span class="code-chips">${chips}</span></div>`;
    }).join('');
  }
  function bindImg() {
    const img = box.querySelector('#meritzImgBtn');
    if (img) img.addEventListener('click', () => openScanPages((img.getAttribute('data-pages') || '').split('|'), img.getAttribute('data-title'), ''));
    box.querySelectorAll('[data-code-fold]').forEach(b => {
      b.addEventListener('click', () => {
        const id = b.getAttribute('data-code-fold');
        const body = box.querySelector(`[data-code-body="${id}"]`);
        const tog = b.querySelector('.fold-toggle');
        if (!body) return;
        const open = body.style.display === 'none';
        body.style.display = open ? 'flex' : 'none';
        if (tog) {
          tog.textContent = open ? '접기 ▴' : '펼치기 ▾';
          tog.classList.toggle('on', open);
        }
      });
    });
  }
  function paint(tab) {
    const excl = tab === 'excl';
    const cards = excl ? pack.excl : pack.pay;
    const pages = excl ? pack.exclPages : pack.payPages;
    const tabs = `<div class="modal-tabs">
      <button type="button" class="modal-tab ${tab === 'pay' ? 'on' : ''}" data-mtab="pay">보상하는 사항</button>
      <button type="button" class="modal-tab ${tab === 'excl' ? 'on' : ''}" data-mtab="excl">보장제외 사항</button>
    </div>`;
    box.innerHTML = imgBtn(pages, (pack.label || '') + (excl ? ' 보장제외' : ' 보상')) + diffBoxHTML(pack.keyCheck) + tabs + meritzCardsHTML(cards);
    box.querySelectorAll('[data-mtab]').forEach(b => b.addEventListener('click', () => paint(b.getAttribute('data-mtab'))));
    bindImg();
  }
  if (mode === 'codes') {
    if (titleEl) titleEl.textContent = '제외 질병코드';
    box.innerHTML = imgBtn(pack.exclPages, (pack.label || '') + ' 제외 질병코드') + codeLinesHTML(pack.codeList || []) + diffBoxHTML(pack.keyCheck);
    bindImg();
  } else {
    paint('pay');
  }
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function scanPagesBtn(label, pages, title) {
  const ready = (pages || []).filter(Boolean);
  if (!ready.length) return '';
  return `<button type="button" class="scan-open" data-act="pages" data-pages="${esc(ready.join('|'))}" data-title="${esc(title || label)}">${esc(label)}</button>`;
}

function scanCovBtn(label, pages, title, filled) {
  const list = (pages || []).filter(Boolean);
  if (!list.length) return '';
  return `<button type="button" class="cov-btn" data-act="pages" data-pages="${esc(list.join('|'))}" data-title="${esc(title || label)}">${esc(label)}</button>`;
}

function scanCovRow(key, label, pill, inner, sel) {
  const on = !!(sel.open && sel.open[key]);
  return `<div class="cov-block">
    <button type="button" class="qvb-row scan-fold-btn" data-fold="${key}">
      <span class="qvb-left-label">${esc(label)}</span>
      <span class="fold-toggle${on ? ' on' : ''}">${on ? '접기 ▴' : '펼치기 ▾'}</span>
    </button>
    <div class="cov-drawer" style="display:${on ? 'flex' : 'none'};">${on ? inner : ''}</div>
  </div>`;
}

function paintScanDrawer(drawer) {
  const root = drawer.closest('.scan-board');
  const cid = root.getAttribute('data-cid');
  const pid = drawer.getAttribute('data-pid');
  if (!state.scanUi) state.scanUi = {};
  if (!state.scanUi[cid]) state.scanUi[cid] = {};
  if (!state.scanUi[cid][pid]) state.scanUi[cid][pid] = { ptype: 'standard', open: {}, ndai: '', groups: false, group: '' };
  const sel = state.scanUi[cid][pid];
  if (!sel.open) sel.open = {};
  const faceRoot = window.MERITZ_FACE && window.MERITZ_FACE[pid];
  const face = faceRoot && faceRoot.standard;
  const body = drawer.querySelector('.scan-body');
  if (!body || !face) {
    if (body) body.innerHTML = '';
    return;
  }
  const disease = face.disease || {};
  const tier = face.tier;
  const bundles = face.bundles || [];
  const showTier = !!(tier && ((tier.clause && tier.clause.length) || (tier.table && tier.table.length)));
  const diseasePages = (disease.define || []).concat(disease.exclude || []);
  const ndaiNames = bundles.map(b => String(b.name || '').replace(/대$/, ''));
  const ndaiPill = ndaiNames.length ? ndaiNames.join('·') + '대' : '없음';
  let ndaiHTML = '';
  if (bundles.length) {
    const current = bundles.find(b => b.name === sel.ndai) || bundles[0];
    sel.ndai = current.name;
    const segs = bundles.length > 1 ? `<div class="ndai-seg-row">${bundles.map(b => {
      const on = b.name === current.name;
      const note = sel.ndaiTag && b.name === sel.ndaiMatch ? `<span class="search-tab-note">${esc(sel.ndaiTag)}</span>` : '';
      return `<button type="button" class="btn-ndai-seg${on ? ' on' : ''}" data-act="ndai" data-name="${esc(b.name)}"><span>${esc(b.name)} 특약</span>${note}</button>`;
    }).join('')}</div>` : '';
    const clausePages = current.clause || ((current.parts && current.parts[0] && current.parts[0].pages) || []);
    const parts = current.parts || [];
    const tableBtn = parts.length
      ? `<button type="button" class="cov-btn" data-act="groups">분류표</button>`
      : scanCovBtn('분류표', current.table && current.table.length ? current.table : clausePages, current.name + ' 분류표', false);
    let groups = '';
    if (parts.length && sel.groups) {
      groups = `<div class="cov-groups">${parts.map(part => {
        const on = sel.group === part.name;
        const codes = codeTableHTML(part.codes || []);
        const pages = (part.pages || []).filter(Boolean);
        const pageAttrs = pages.length ? `data-act="pages" data-pages="${esc(pages.join('|'))}" data-title="${esc(part.name)}"` : 'disabled';
        return `<div class="cov-group">
          <div class="qvb-row cov-group-row">
            <span class="qvb-left-label">${esc(part.name)}</span>
            <span class="pair-actions">
              <button type="button" class="pair-btn" ${pageAttrs}>약관</button>
              <button type="button" class="pair-btn${on ? ' on' : ''}" data-act="group" data-name="${esc(part.name)}">${on ? '접기 ▴' : '펼치기 ▾'}</button>
            </span>
          </div>
          ${on && codes ? codes : ''}
        </div>`;
      }).join('')}</div>`;
    }
    const limitHTML = current.limit ? `<div class="key-limit"><div class="key-limit-kicker">핵심 체크</div><div class="key-limit-title">${esc(current.limit.title)}</div><p>${esc(current.limit.note)}</p></div>` : '';
    const loneNote = !segs && sel.ndaiTag && current.name === sel.ndaiMatch ? `<span class="search-hit-label">${esc(sel.ndaiTag)}</span>` : '';
    ndaiHTML = `<div class="ndai-stack">${segs}${loneNote}${limitHTML}<div class="cov-actions">${scanCovBtn('약관보기', clausePages, current.name + ' 질병수술비', false)}${tableBtn}</div>${groups}</div>`;
  }
  const options = (disease.options && disease.options.length) ? disease.options : [];
  const curD = options.find(o => o.id === sel.disease) || options[0];
  if (curD) sel.disease = curD.id;
  const dSegs = options.length > 1 ? `<div class="ndai-seg-row">${options.map(o => {
    const on = curD && o.id === curD.id;
    return `<button type="button" class="btn-ndai-seg${on ? ' on' : ''}" data-act="disease" data-name="${esc(o.id)}"><span>${esc(o.label)}</span></button>`;
  }).join('')}</div>` : '';
  const dActs = curD ? `<div class="cov-actions"><button type="button" class="cov-btn" data-act="clause-tabs" data-name="${esc(curD.id)}">약관보기</button><button type="button" class="cov-btn" data-act="excl-cards" data-name="${esc(curD.id)}">제외 질병코드</button></div>` : `<div class="cov-actions">${scanCovBtn('약관보기', diseasePages, '질병수술비', false)}</div>`;
  const rows = [
    scanCovRow('disease', '질병수술비', '', dSegs + dActs, sel)
  ];
  if (showTier) {
    const tierTableBtn = (tier.rev && tier.rev.rows && tier.rev.rows.length)
      ? `<button type="button" class="cov-btn" data-act="tier-rev">분류표</button>`
      : scanCovBtn('분류표', tier.table, '1~5종 분류표', false);
    rows.push(scanCovRow('tier', '1~5종 수술비', tier.pill || '1~5종', `<div class="cov-actions">${scanCovBtn('약관보기', tier.clause, '1~5종 수술비', false)}${tierTableBtn}</div>`, sel));
  }
  if (bundles.length) rows.push(scanCovRow('ndai', 'N대 질병수술비', ndaiPill, ndaiHTML, sel));
  body.innerHTML = rows.join('');
}

function openTierRevModal(tier) {
  const rev = tier && tier.rev;
  const modal = $('#clauseModal');
  const box = $('#clauseModalContent');
  const titleEl = $('#clauseModalTitle');
  const searchWrap = $('#clauseModalSearchWrap');
  const alertEl = $('#clauseModalAlert');
  if (!modal || !box || !rev || !rev.rows || !rev.rows.length) {
    if (tier && tier.table) openScanPages(tier.table, '1~5종 분류표', '');
    return;
  }
  if (titleEl) titleEl.textContent = '1~5종 분류표';
  if (searchWrap) searchWrap.style.display = 'none';
  if (alertEl) alertEl.style.display = 'none';
  const rows = revRowsHTML(rev.rows);
  const chip = revChipPx(rev.rows);
  const cards = (rev.shots || []).map((s, i) => {
    const row = (rev.rows || [])[i] || {};
    const beforeShot = s.before ? `<div class="tier-rev-block"><span class="tier-rev-tag">개정 전 p.${esc(s.before.page)}</span><img src="${esc(s.before.src)}" alt="${esc(s.label)} 개정 전"></div>` : '';
    const afterShot = s.after ? `<div class="tier-rev-block"><span class="tier-rev-tag after">개정 후 p.${esc(s.after.page)}</span><img src="${esc(s.after.src)}" alt="${esc(s.label)} 개정 후"></div>` : '';
    return `<div class="tier-rev-card">
      <button type="button" class="tier-rev-head">
        <span class="rev-name">${esc(s.label || row.name || '')}</span>
        <span class="rev-pill">${esc(row.before || '')}</span>
        <span class="rev-arrow">→</span>
        <span class="rev-pill after">${esc(row.after || '')}</span>
        <span class="fold-toggle">펼치기 ▾</span>
      </button>
      <div class="tier-rev-body">${beforeShot}${afterShot}</div>
    </div>`;
  }).join('');
  box.innerHTML = `<div class="rev-key-box" style="--rev-chip:${chip}px"><div class="rev-key-title">개정 포인트</div><div class="rev-grid">${rows}</div></div>
    <div class="cov-actions tier-rev-actions">
      <button type="button" class="cov-btn" id="tierRevBefore">개정 전 약관</button>
      <button type="button" class="cov-btn" id="tierRevAfter">개정 후 약관</button>
    </div>
    <div class="tier-rev-cards" style="--rev-chip:${chip}px">${cards}</div>`;
  const before = (rev.beforePages || []).filter(Boolean);
  const after = (rev.afterPages || []).filter(Boolean);
  const b1 = box.querySelector('#tierRevBefore');
  const b2 = box.querySelector('#tierRevAfter');
  if (b1) b1.addEventListener('click', () => openScanPages(before, '1~5종 분류표 개정 전', ''));
  if (b2) b2.addEventListener('click', () => openScanPages(after, '1~5종 분류표 개정 후', ''));
  box.querySelectorAll('.tier-rev-head').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.tier-rev-card');
      const wasOpen = card.classList.contains('open');
      box.querySelectorAll('.tier-rev-card').forEach(c => {
        c.classList.remove('open');
        const toggle = c.querySelector('.fold-toggle');
        if (toggle) { toggle.classList.remove('on'); toggle.textContent = '펼치기 ▾'; }
      });
      if (!wasOpen) {
        card.classList.add('open');
        const toggle = btn.querySelector('.fold-toggle');
        if (toggle) { toggle.classList.add('on'); toggle.textContent = '접기 ▴'; }
      }
    });
  });
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function paintScanBoard(root) {
  root.querySelectorAll('.period-drawer-content').forEach(paintScanDrawer);
}

function bindScanBoards(container) {
  container.querySelectorAll('.scan-board').forEach(root => {
    const cid = root.getAttribute('data-cid');
    paintScanBoard(root);
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn || !root.contains(btn)) return;
      const drawer = btn.closest('.period-drawer-content');
      if (!drawer) return;
      const pid = drawer.getAttribute('data-pid');
      if (!state.scanUi[cid][pid]) state.scanUi[cid][pid] = { ptype: 'standard', open: {}, drill: null };
      const sel = state.scanUi[cid][pid];
      if (btn.classList.contains('scan-type')) {
        e.stopPropagation();
        sel.ptype = btn.getAttribute('data-ptype');
        sel.ndai = '';
        sel.groups = false;
        sel.group = '';
        drawer.querySelectorAll('.scan-type').forEach(b => b.classList.toggle('on', b === btn));
        paintScanDrawer(drawer);
        return;
      }
      if (btn.classList.contains('scan-fold-btn')) {
        e.stopPropagation();
        const key = btn.getAttribute('data-fold');
        const was = !!(sel.open && sel.open[key]);
        sel.open = {};
        if (!was) sel.open[key] = true;
        if (was) { sel.groups = false; sel.group = ''; }
        paintScanDrawer(drawer);
        return;
      }
      const act = btn.getAttribute('data-act');
      if (!act) return;
      e.stopPropagation();
      if (act === 'ndai') {
        sel.ndai = btn.getAttribute('data-name');
        sel.groups = false;
        sel.group = '';
      } else if (act === 'disease') {
        sel.disease = btn.getAttribute('data-name');
      } else if (act === 'clause-tabs' || act === 'excl-cards') {
        const face = window.MERITZ_FACE && window.MERITZ_FACE[pid] && window.MERITZ_FACE[pid].standard;
        const opts = face && face.disease && face.disease.options;
        const pack = opts && opts.find(o => o.id === (btn.getAttribute('data-name') || sel.disease));
        if (pack) openMeritzClauseModal(pack, act === 'excl-cards' ? 'codes' : 'tabs');
      } else if (act === 'groups') {
        sel.groups = !sel.groups;
        sel.group = '';
      } else if (act === 'group') {
        const name = btn.getAttribute('data-name');
        sel.group = sel.group === name ? '' : name;
      } else if (act === 'tier-rev') {
        const face = window.MERITZ_FACE && window.MERITZ_FACE[pid] && window.MERITZ_FACE[pid].standard;
        if (face && face.tier) openTierRevModal(face.tier);
      } else if (act === 'pages') openScanPages((btn.getAttribute('data-pages') || '').split('|'), btn.getAttribute('data-title'), '');
      else if (act === 'summary') openScanSummary(btn.getAttribute('data-title'), btn.getAttribute('data-pay'), btn.getAttribute('data-excl'), (btn.getAttribute('data-pages') || '').split('|'));
      if (act === 'ndai' || act === 'disease' || act === 'groups' || act === 'group') paintScanDrawer(drawer);
    });
  });
}

function renderClausesCompanyList(searchQuery, opts) {
  const commitSearch = !!(opts && opts.commit);
  const scrollBefore = window.pageYOffset;
  if (typeof window.applyClauseAudit === 'function') window.applyClauseAudit();
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

    // 가입년도·N대·회사 별칭. '23년멜츠', '120대멜츠', '2023 메리츠'처럼 붙여 써도 같이 읽는다.
    const detectedYear = extractSearchedYear(rawQ);
    if (detectedYear) {
      matchContext.searchedYear = detectedYear;
    }
    const detectedNdaiNum = extractSearchedNdaiNum(rawQ);
    if (detectedNdaiNum) matchContext.ndaiNum = detectedNdaiNum;
    const companyHits = findCompaniesInQuery(rawQ, allCompanies);
    if (companyHits.length) matchContext.companyLocked = true;

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
      if (companyHits.length) return companyHits.some(h => h.id === co.id);
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
              if (r.verifiedConditions && r.verifiedConditions.some(c => norm(c.text).includes(nt))) return true;
              if (r.inclusion && r.inclusion.officialTranscript && norm(r.inclusion.officialTranscript).includes(nt)) return true;
              if (r.exclusion && r.exclusion.officialTranscript && norm(r.exclusion.officialTranscript).includes(nt)) return true;
              if (r.tableBody && Array.isArray(r.tableBody.rows) && r.tableBody.rows.some(row => Array.isArray(row) ? row.some(cell => norm(cell).includes(nt)) : (typeof row === 'string' && norm(row).includes(nt)))) return true;
              return false;
            });
          };
          if (!p.types) return false;
          return Object.keys(p.types).some(tk => p.types[tk] && checkR(p.types[tk].riders));
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
      { coName: '현대해상', cid: 'hyundai', pid: 'hyundai_2018_prior', ndai: '71대', period: '2018년 5월 31일 이전', label: '71대 질병수술비', jump: '현대 71대' },
      { coName: '삼성화재', cid: 'samsungfire', pid: 'samsung_2020_04', ndai: '68대', period: '2020년 4월 ~ 2023년 12월', label: '68대 질병수술비', jump: '삼성 68대' }
    ];

    if (exactNdaiNum <= 65) {
      closestNdaiStr = '64대 질병수술비';
      recommendations = [
        { coName: '메리츠화재', cid: 'meritz', pid: 'meritz_2020_03_prior', ndai: '64대', period: '2020년 3월 이전', label: '64대 질병수술비', jump: '멜츠 64대' },
        { coName: '삼성화재', cid: 'samsungfire', pid: 'samsung_2020_04', ndai: '68대', period: '2020년 4월 ~ 2023년 12월', label: '68대 질병수술비', jump: '삼성 68대' },
        { coName: '현대해상', cid: 'hyundai', pid: 'hyundai_2018_prior', ndai: '71대', period: '2018년 5월 31일 이전', label: '71대 질병수술비', jump: '현대 71대' }
      ];
    } else if (exactNdaiNum >= 125) {
      closestNdaiStr = '124대 질병수술비';
      recommendations = [
        { coName: '현대해상', cid: 'hyundai', pid: 'hyundai_2024_01', ndai: '124대', period: '2024년 1월 ~ 현재', label: '124대 질병수술비', jump: '현대 124대' },
        { coName: '메리츠화재', cid: 'meritz', pid: 'meritz_202501', ndai: '131대', period: '2022년 7월 1일 ~', label: '131대 질병수술비', jump: '멜츠 131대' },
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
          if (typeof window.submitClauseSearch === 'function') window.submitClauseSearch();
          else qInput.dispatchEvent(new Event('input'));
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

  if (matchContext.searchedYear != null || matchContext.ndaiNum != null) {
    matchContext.periodPlan = {};
    list.forEach(co => {
      matchContext.periodPlan[co.id] = buildPeriodPlan(co, matchContext.searchedYear, matchContext.ndaiNum);
    });
  }

  html += list.map(co => {
    const markCo = !!matchContext.companyLocked;

    // 극강의 심플 헤더: TMI 뱃지, 약칭 태그, 손보/생보 라벨, 작은 회색글씨 전면 삭제 (#29547 #29557 #29562 #29574)
    return `
    <div class="clause-co-card${markCo ? ' search-co' : ''}" style="background:var(--surface);border:${markCo ? '2px solid var(--gold)' : '1.5px solid var(--border)'};border-radius:14px;overflow:hidden;box-shadow:var(--shadow-1);transition:border-color .2s ease;">
      <!-- 회사 헤더: 로고 + 회사명 + 펼치기 ▾ (초간결 심플) -->
      <div class="btn-toggle-co" data-co-id="${co.id}" style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:var(--surface);user-select:none;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1;">
          <div style="width:38px;height:38px;border-radius:10px;background:${co.color || 'var(--brand)'};color:#fff;font-weight:900;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 5px rgba(0,0,0,0.12);">
            ${esc(co.logo || co.name[0])}
          </div>
          <div style="font-size:16px;font-weight:900;color:#0f172a;letter-spacing:-0.2px;white-space:nowrap;">
            ${esc(co.name)}
          </div>
        </div>
        <span class="fold-toggle btn-co-toggle-arrow">펼치기 ▾</span>
      </div>

      <!-- 시기별 아코디언 서랍 -->
      <div id="co-periods-${co.id}" class="co-periods-drawer" style="display:none;padding:12px 14px 14px;border-top:1px solid var(--border);background:var(--surface-2);flex-direction:column;gap:12px;">
        ${(window.SCAN_BOARDS && window.SCAN_BOARDS[co.id]) ? renderScanCompanyHTML(co, matchContext) : periodsNewestFirst(co.periods).map(p => renderPeriodBoxHTML(co, p, matchContext)).join('')}
      </div>
    </div>
    `;
  }).join('');

  container.innerHTML = html;
  primeScanSearch(matchContext);
  bindScanBoards(container);
  if (commitSearch && isUnifiedSearch && list.length === 1) {
    const card = container.querySelector('.clause-co-card');
    const drawer = card && card.querySelector('.co-periods-drawer');
    const arrowBtn = card && card.querySelector('.btn-co-toggle-arrow');
    if (drawer) {
      drawer.style.display = 'flex';
      if (arrowBtn) {
        arrowBtn.textContent = '접기 ▴';
        arrowBtn.classList.add('on');
      }
      container.style.paddingBottom = Math.max(160, window.innerHeight - stickyCoverBottom()) + 'px';
      const align = () => {
        const live = card.querySelector('.period-accordion-box.search-hit') || card;
        scrollOpenedCard(live);
      };
      requestAnimationFrame(() => requestAnimationFrame(align));
    }
  } else if (container) {
    container.style.paddingBottom = '';
    if (!commitSearch) window.scrollTo(0, scrollBefore);
  }

  // 이벤트 바인딩
  container.querySelectorAll('.btn-toggle-co').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const coId = btn.getAttribute('data-co-id');
      const drawer = container.querySelector(`#co-periods-${coId}`);
      const arrowBtn = btn.querySelector('.btn-co-toggle-arrow');
      if (drawer) {
        const isHidden = drawer.style.display === 'none';
        const card = btn.closest('.clause-co-card') || btn;
        if (isHidden) {
          container.querySelectorAll('.clause-co-card').forEach(other => {
            if (other !== card) collapseCompanyCard(other);
          });
        } else {
          collapseCompanyCard(card);
          return;
        }
        drawer.style.display = 'flex';
        if (arrowBtn) {
          arrowBtn.textContent = '접기 ▴';
          arrowBtn.classList.add('on');
        }
        requestAnimationFrame(() => scrollOpenedCard(card));
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
        b.classList.remove('on');
        b.style.border = '1.5px solid var(--border)';
        b.style.background = 'var(--surface)';
        b.style.color = '#334155';
        b.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)';
      });
      btn.classList.add('active');
      btn.classList.add('on');
      btn.style.border = '1.5px solid var(--brand)';
      btn.style.background = 'var(--brand)';
      btn.style.color = '#fff';
      btn.style.boxShadow = 'none';

      parent.setAttribute('data-current-ndai', opt);
      parent.querySelectorAll('.btn-open-clause-modal[data-target-rider="ndai"]').forEach(mb => {
        mb.setAttribute('data-ndai', opt);
      });
      const titleSpan = parent.querySelector('.ndai-title');
      if (titleSpan) titleSpan.textContent = `${opt} 질병수술비`;
    });
  });

  container.querySelectorAll('.btn-mz-page').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = btn.getAttribute('data-src');
      const title = btn.getAttribute('data-title') || '약관';
      if (src) window.openRulesModal(src, title, '', [src], { product: '메리츠화재', type: title, page: title });
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
        const card = btn.closest('.period-accordion-box') || btn;
        if (isHidden) {
          const scope = btn.closest('.co-periods-drawer') || container;
          scope.querySelectorAll('.period-accordion-box').forEach(other => {
            if (other !== card) resetPeriodBox(other);
          });
        } else {
          resetPeriodBox(card);
          return;
        }
        drawer.style.display = 'flex';
        if (arrowBadge) {
          arrowBadge.textContent = '접기 ▴';
          arrowBadge.classList.add('on');
        }
        requestAnimationFrame(() => scrollOpenedCard(card));
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

  container.querySelectorAll('.btn-cov-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const block = btn.closest('.cov-block');
      const drawer = block && block.querySelector('.cov-drawer');
      if (!drawer) return;
      const opening = drawer.style.display === 'none';
      const period = btn.closest('.period-drawer-content');
      if (opening && period) {
        period.querySelectorAll('.cov-block').forEach(other => {
          if (other === block) return;
          const d = other.querySelector('.cov-drawer');
          const b = other.querySelector('.btn-cov-toggle .fold-toggle');
          if (d) d.style.display = 'none';
          if (b) {
            b.textContent = '펼치기 ▾';
            b.classList.remove('on');
          }
        });
      }
      drawer.style.display = opening ? 'flex' : 'none';
      const badge = btn.querySelector('.fold-toggle');
      if (badge) {
        badge.textContent = opening ? '접기 ▴' : '펼치기 ▾';
        badge.classList.toggle('on', opening);
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
      
      if (viewMode === 'basic_exclusion' || (matchContext.isExclusion && viewMode === 'basic_clause')) {
        window.activeClauseTab = 'exclusion';
      } else if (viewMode === 'basic_clause') {
        window.activeClauseTab = 'inclusion';
      }
      openClauseModalFromIds(cid, pid, ptype, riderKey, viewMode, ndai);
    });
  });
}


const COMPANY_NDAI_PERIOD_MAP = {
  meritz: {
    'meritz_201912': ['32대'],
    'meritz_202011': ['82대', '32대'],
    'meritz_202101': ['82대', '32대'],
    'meritz_202207': ['131대', '32대'],
    'meritz_202501': ['131대', '32대']
  },
  hyundai: {
    'hyundai_hi2404': ['120대다이렉트'],
    'hyundai_2026_01': ['120대'],
    'hyundai_2018_06': ['123대', '71대'],
    'hyundai_2018_prior': ['71대', '16대', '7대']
  },
  dbinsure: {
    'db_2026_05': ['120대', '119대'],
    'db_2020_07': ['116대', '106대', '77대'],
    'db_2020_prior': ['21대', '18대', '16대']
  },
  kbinsure: {
    'kb_2026_10': ['116대'],
    'kb_2024_01': ['116대'],
    'kb_2020_10': ['112대'],
    'kb_2020_prior': ['21대', '7대']
  },
  samsungfire: {
    'samsung_2024_01': ['111대', '114대', '116대'],
    'samsung_2020_04': ['111대', '105대', '68대'],
    'samsung_2020_prior': ['21대', '15대']
  },
  lotte: {
    'lotte_2021_01': ['142대', '112대']
  },
  heungkukfire: {
    'heungkuk_2025_09': ['신142대', '신70대', '112대']
  },
  hanwhafire: {
    'hanwha_2023_07': ['124대', '116대']
  },
  hanafire: {
    'hana_2023_06': ['136대', '73대']
  },
  nhfire: {
    'nh_2025_01': ['144대', '112대'],
    'nh_2024_12_prior': ['144대', '112대']
  },
  samsunglife: {
    'samsunglife_2020_01': [],
    'samsunglife_2006_04': []
  },
  hanwhalife: {
    'hanwhalife_2020_01': []
  },
  kyobo: {
    'kyobolife_2020_01': []
  },
  shinhan: {
    'shinhanlife_2020_01': []
  },
  kblife: {
    'kblife_2020_01': []
  },
  mirae: {
    'mirae_2020': []
  },
  donga: {
    'dongyang_2020_01': []
  },
  heungkuklife: {
    'heungkuklife_2020_01': []
  },
  abl: {
    'abllife_2020_01': []
  },
  lina: {
    'linalife_2020_01': []
  },
  nhlife: {
    'nhlife_2020_01': []
  }
};
window.COMPANY_NDAI_PERIOD_MAP = COMPANY_NDAI_PERIOD_MAP;

function meritzRevisionTableHTML(p) {
  const rows = p.revisionRows || [];
  if (!rows.length) return '';
  const body = rows.map(r => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border);font-weight:800;text-align:left;vertical-align:top;">${esc(r.item)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top;">${esc(r.before)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top;">${esc(r.after)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top;white-space:nowrap;">${esc(r.date)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top;">
        <button type="button" class="btn-mz-page" data-src="${esc(r.src)}" data-title="${esc(r.item)}" style="height:32px;padding:0 10px;border-radius:6px;border:1px solid var(--brand);background:var(--surface);color:var(--brand);font-weight:850;cursor:pointer;">약관보기</button>
      </td>
    </tr>`).join('');
  return `
    <div style="overflow-x:auto;border:1px solid var(--border);border-radius:10px;background:var(--surface);">
      <table style="width:100%;border-collapse:collapse;font-size:12px;line-height:1.45;">
        <thead>
          <tr style="background:var(--surface-2);">
            <th style="text-align:left;padding:6px 8px;">항목</th>
            <th style="text-align:left;padding:6px 8px;">개정 전</th>
            <th style="text-align:left;padding:6px 8px;">개정 후</th>
            <th style="text-align:left;padding:6px 8px;">적용일</th>
            <th style="text-align:left;padding:6px 8px;"></th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
}

function renderPeriodBoxHTML(co, p, matchContext = {}) {
  const simpObj = (p.types && p.types.simplified) || (p.types && p.types.standard && p.types.standard.simplified) || p.simplified;
  const stdRiders = p.types && p.types.standard ? p.types.standard.riders : null;
  const hasSimp = !!(simpObj && simpObj.riders) || !!stdRiders;
  const simpRiders = (simpObj && simpObj.riders) ? simpObj.riders : stdRiders;

  const hit = periodSearchHit(co, p.id, matchContext);
  const tag = hit && hit.tag ? hit.tag : '';

  // 유병자/간편 자동 활성화 (#29041 #29042)
  const preferSimp = hasSimp && (matchContext.isSimplified || false);

  return `
  <div class="period-accordion-box${tag ? ' search-hit' : ''}" style="background:var(--surface);border:${tag ? '2px solid var(--gold)' : '1.5px solid var(--border)'};border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
    <!-- 가입시기 헤더 버튼 -->
    <div class="btn-toggle-period" data-co-id="${co.id}" data-pid="${p.id}" style="padding:12px 14px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;background:var(--surface);user-select:none;gap:8px;">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;min-width:0;flex:1;">
        <span style="min-width:0;flex:1;text-align:left;">
          <span style="display:block;font-size:14px;font-weight:900;color:var(--text);letter-spacing:-.01em;">${esc(cleanPeriodStr(p.periodStr))}</span>
          ${tag ? `<span class="search-hit-label">${esc(tag)}</span>` : ''}
        </span>
      </div>
      <span class="fold-toggle period-arrow-badge">펼치기 ▾</span>
    </div>

    <!-- 가입시기 세부 서랍 -->
    <div id="period-drawer-${co.id}-${p.id}" class="period-drawer-content" data-pid="${esc(p.id)}" style="display:none;padding:12px 14px 14px;border-top:1px dashed var(--line);background:var(--surface-2);flex-direction:column;gap:10px;">
      
      ${revisionKeyBoxHTML(p.cardLine, p.revisionBullets)}

      <div class="riders-std">
        ${renderRiderCardsHTML(co.id, p.id, 'standard', stdRiders, matchContext)}
      </div>

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
    html += `
    <div class="cov-block">
      <button type="button" class="qvb-row btn-cov-toggle">
        <span class="qvb-left-label">${esc(riders.basic.title || '질병수술비')}</span>
        <span class="fold-toggle">펼치기 ▾</span>
      </button>
      <div class="cov-drawer" style="display:none;">
      ${riders.basic.summary ? `<div style="font-size:12px;color:var(--text-2);line-height:1.4;font-weight:700;margin:6px 2px;">${esc(riders.basic.summary)}</div>` : ''}
      <div class="cov-actions">
        <button type="button" class="btn-open-clause-modal cov-btn" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="basic" data-view-mode="basic_clause">약관보기</button>
        <button type="button" class="btn-open-clause-modal cov-btn" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="basic" data-view-mode="basic_exclusion">제외 질병코드</button>
      </div>
      </div>
    </div>`;
  }

  // 2. 종수술비. 1~7종은 이 탭에서 빼 둔다.
  if (riders.tier && !(cid === 'meritz' && /1\s*[~-]\s*7종/.test(riders.tier.title || ''))) {
    const tierPill = riders.tier.pill || ((/1\s*[~-]\s*5종/.test(riders.tier.title || '')) ? '1~5종' : '종수술');
    html += `
    <div class="cov-block">
      <button type="button" class="qvb-row btn-cov-toggle">
        <span class="qvb-left-label">${esc(riders.tier.title || '1~5종 수술비')}</span>
        <span class="fold-toggle">펼치기 ▾</span>
      </button>
      <div class="cov-drawer" style="display:none;">
      ${riders.tier.summary ? `<div style="font-size:12px;color:var(--text-2);line-height:1.4;font-weight:700;margin:6px 2px;">${esc(riders.tier.summary)}</div>` : ''}
      <div class="cov-actions">
        <button type="button" class="btn-open-clause-modal cov-btn" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="tier" data-view-mode="clause">약관보기</button>
        <button type="button" class="btn-open-clause-modal cov-btn" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="tier" data-view-mode="table">분류표</button>
      </div>
      </div>
    </div>`;
  }

  // 3. N대 질병수술비 (112대/120대 섞지 않고 회사별 판매 N대별 분리 선택 탭 #29516)
  if (riders.ndai) {
    const isHigh = isMatchNdai;

    let nOptions = (typeof window.ndaiOptionsForCompany === 'function')
      ? window.ndaiOptionsForCompany(cid, pid, riders.ndai.title)
      : ((COMPANY_NDAI_PERIOD_MAP[cid] && COMPANY_NDAI_PERIOD_MAP[cid][pid]) ? [...COMPANY_NDAI_PERIOD_MAP[cid][pid]] : []);
    const ndaiUnknown = nOptions.length === 0;
    if (ndaiUnknown) nOptions = ['미확인'];

    const ndaiHit = matchContext.periodPlan && matchContext.periodPlan[cid] && matchContext.periodPlan[cid][pid];
    const wanted = ndaiHit && ndaiHit.ndai;
    const defaultN = wanted
      ? (nOptions.includes(wanted) ? wanted : (nOptions.find(o => ndaiNumOf(o) === ndaiNumOf(wanted)) || nOptions[0]))
      : ((matchContext.searchedNdai && nOptions.includes(matchContext.searchedNdai)) ? matchContext.searchedNdai : nOptions[0]);
    const ndaiNote = ndaiHit && ndaiHit.ndaiTag ? ndaiHit.ndaiTag : '';
    const saleOf = {};
    (riders.ndai.segments || []).forEach(s => { if (s && s.id) saleOf[s.id] = s.sale || ''; });
    const ndaiPill = riders.ndai.pill || (ndaiUnknown ? 'N대' : nOptions.map(o => String(o).replace(/대$/, '')).join('·') + '대');

    html += `
    <div class="cov-block rider-card-ndai" data-current-ndai="${esc(defaultN)}">
      <button type="button" class="qvb-row btn-cov-toggle">
        <span class="qvb-left-label">N대 질병수술비</span>
        <span class="fold-toggle">펼치기 ▾</span>
      </button>
      <div class="cov-drawer" style="display:none;">
      ${riders.ndai.summary ? `<div style="font-size:12px;color:var(--text-2);line-height:1.4;font-weight:700;margin:6px 2px;">${esc(riders.ndai.summary)}</div>` : ''}
      ${!ndaiUnknown && nOptions.length > 1 ? `
      <div class="ndai-seg-row">
        ${nOptions.map(opt => `
          <button type="button" class="btn-ndai-tab-select btn-ndai-seg ${opt === defaultN ? 'active on' : ''}" data-ndai-opt="${esc(opt)}">
            <span>${esc(opt)} 특약</span>
            ${ndaiNote && opt === defaultN ? `<span class="search-tab-note">${esc(ndaiNote)}</span>` : ''}
          </button>
        `).join('')}
      </div>` : (ndaiNote ? `<span class="search-hit-label">${esc(ndaiNote)}</span>` : '')}
      <div class="cov-actions">
        <button type="button" class="btn-open-clause-modal cov-btn" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="ndai" data-view-mode="clause" data-ndai="${esc(defaultN)}">약관보기</button>
        <button type="button" class="btn-open-clause-modal cov-btn" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="ndai" data-view-mode="table" data-ndai="${esc(defaultN)}">분류표</button>
      </div>
      </div>
    </div>`;
  }

  if (cid !== 'meritz' && riders.injury) {
    html += `
    <div class="cov-block">
      <button type="button" class="qvb-row btn-cov-toggle">
        <span class="qvb-left-label">${esc(riders.injury.title || '상해수술비')}</span>
        <span class="fold-toggle">펼치기 ▾</span>
      </button>
      <div class="cov-drawer" style="display:none;">
        ${riders.injury.summary ? `<div style="font-size:12px;color:var(--text-2);line-height:1.4;font-weight:700;margin:6px 2px;">${esc(riders.injury.summary)}</div>` : ''}
        <button type="button" class="btn-open-clause-modal cov-btn" data-cid="${cid}" data-pid="${pid}" data-ptype="${ptype}" data-target-rider="injury" data-view-mode="basic_clause" style="width:100%;">약관보기</button>
      </div>
    </div>`;
  } else if (cid !== 'meritz') {
    html += `
    <div class="cov-block">
      <button type="button" class="qvb-row btn-cov-toggle">
        <span class="qvb-left-label">상해수술비</span>
        <span class="fold-toggle">펼치기 ▾</span>
      </button>
      <div class="cov-drawer" style="display:none;">
        <div style="font-size:12px;color:var(--text-2);margin:6px 2px;line-height:1.45;font-weight:700;">이 시기 상해수술비 특약의 원문은 확인하지 못했습니다.</div>
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
  const pData = (period.types && period.types[ptype]) || (ptype === 'simplified' ? simpObj : null);
  if (!pData) return;
  const rider = (pData.riders && pData.riders[targetRider]) ? pData.riders[targetRider] : (period.types?.standard?.riders?.[targetRider] || { title: '질병수술비' });

  if (viewMode === 'basic_exclusion' && targetRider === 'basic') {
    const scan = getScanPagesForContext(co, period, pData, rider, 'basic', 'exclusion', null);
    openMeritzClauseModal({
      label: rider.title || '질병수술비',
      exclPages: (scan && scan.pages) || [],
      codeList: rider.exclusionCodes || [],
      keyCheck: null
    }, 'codes');
    return;
  }

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
    modalBadge.textContent = `🏢 [${co.name} (${co.shortName})] ${cleanPeriodStr(period.periodStr)} · ${typeName}`;
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


function getScanPagesForContext(co, period, data, rider, targetRider, scanType, selectedNdai) {
  if (!co || !period || !rider) return null;
  if (typeof window.lookupClauseScan === 'function' && window.CLAUSE_BOOK && window.CLAUSE_BOOK[co.id]) {
    const hit = window.lookupClauseScan(co, period, data, targetRider, scanType === 'table' ? 'table' : scanType, selectedNdai);
    if (!hit || !hit.pages || !hit.pages.length) return null;
    return hit;
  }
  const isLatestPeriod = co.periods && co.periods[0] && co.periods[0].id === period?.id;
  const cleanNdai = (selectedNdai || (rider && rider.title) || '').replace(/\d+대\/\d+대/, m => m.split('/')[0]);

  // 1. Meritz 32대 관혈수술비
  if (co.id.includes('meritz') && cleanNdai.includes('32대')) {
    if (scanType === 'exclusion') {
      return {
        pages: ['assets/clause_imgs/meritz_std_ndai_exc_p337.png', 'assets/clause_imgs/meritz_std_ndai_exc_p338.png'],
        title: `🚫 [${co.name}] 32대 질병관혈수술비 보상제외 약관`,
        meta: { product: '무배당 메리츠 The좋은 알파Plus보장보험2210', type: '32대 관혈 면책', page: '공시실 원문 제337쪽~제338쪽' }
      };
    } else {
      return {
        pages: [
          'assets/clause_imgs/meritz_std_ndai_32_inc_p339.png',
          'assets/clause_imgs/meritz_std_ndai_32_inc_p340.png',
          'assets/clause_imgs/meritz_std_ndai_32_inc_p341.png',
          'assets/clause_imgs/meritz_std_ndai_32_inc_p342.png'
        ],
        title: `🏢 [${co.name}] 32대 질병관혈수술비 보상기준 약관`,
        meta: { product: '무배당 메리츠 The좋은 알파Plus보장보험2210', type: '32대 관혈 조항', page: '공시실 원문 제339쪽~제342쪽' }
      };
    }
  }

  // 2. Direct rider image
  const pastImg = (scanType === 'exclusion') ? (rider?.exclusion && rider.exclusion.imgSrc) : (rider?.inclusion && rider.inclusion.imgSrc);
  const targetImg = pastImg || rider?.imgSrc;
  if (targetImg) {
    return {
      pages: [targetImg],
      title: `🏢 [${co.name}] ${period.periodStr} · ${rider.title || '수술특약'} 약관`,
      meta: { product: `${co.name} (${period.periodStr})`, type: (data?.pData && data.pData.name) || '해당 가입시기 공식 약관', page: `${period.periodStr} 공시실 공식 약관` }
    };
  }

  // 3. Check VERIFIED_CLAUSE_SCANS if matching period
  const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[co.id.replace('fire', '').replace('life', '')]);
  if (!coEntry) return null;

  const isPeriodWithScans = isLatestPeriod || 
    (co.id.includes('meritz') && (period?.id === 'meritz_2024_12' || period?.id === 'meritz_2022_04'));

  if (!isPeriodWithScans) return null;

  const isSimp = (data?.pData && data.pData.name && data.pData.name.includes('간편')) || (data?.ptype === 'simplified');
  const v = (isSimp && coEntry.simplified) ? coEntry.simplified : (coEntry.standard || coEntry.simplified || coEntry);
  if (!v) return null;

  const rKey = targetRider || data?.targetRider || 'basic';
  let targetScan = null;
  let modalTitle = '';

  if (rKey === 'tier') {
    if (scanType === 'exclusion') {
      targetScan = v.tier_exc || v.basic_exc;
      modalTitle = `🚫 [${co.name}] 1~5종 수술특약 보상제외 약관`;
    } else {
      targetScan = v.tier_inc || v.tier_table || v.basic_inc;
      modalTitle = `📋 [${co.name}] 1~5종 수술특약 보상기준 약관`;
    }
  } else if (rKey === 'ndai' || rKey === 'adult') {
    if (scanType === 'exclusion') {
      targetScan = v.ndai_exc || v.basic_exc;
      modalTitle = `🚫 [${co.name}] ${cleanNdai} 보상제외 약관`;
    } else {
      targetScan = v.ndai_inc || v.basic_inc;
      modalTitle = `🏢 [${co.name}] ${cleanNdai} 보상기준 약관`;
    }
  } else {
    if (scanType === 'exclusion') {
      targetScan = v.basic_exc;
      modalTitle = `🚫 [${co.name}] 질병수술비 보상제외 약관`;
    } else {
      targetScan = v.basic_inc;
      modalTitle = `💡 [${co.name}] 질병수술비 보상기준 약관`;
    }
  }

  if (targetScan && targetScan.pages && targetScan.pages.length > 0) {
    return {
      pages: targetScan.pages.filter(Boolean),
      title: modalTitle,
      meta: { product: v.product, type: v.type, page: targetScan.pageStr }
    };
  }

  return null;
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

    // 상단 원문 약관보기는 하단 군별 1:1 직결이 있으므로 사용자 지침(#34450)에 따라 전면 삭제하여 화면 슬림화
    const photoBtnHTML = '';

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
        const detailedList = NDAI_DETAILED_ITEMS[grpName] || NDAI_DETAILED_ITEMS[grpName.replace(/\s*\(\d+\)/, "").trim()] || [];
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
                const detailedList = NDAI_DETAILED_ITEMS[grpName] || NDAI_DETAILED_ITEMS[grpName.replace(/\s*\(\d+\)/, "").trim()] || [];
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
          const isLatestPeriod = co.periods && co.periods[0] && co.periods[0].id === period?.id;
          const numMatch = (selectedNdai || tableData.title || rider.title || '').match(/\d+대/);
          const ndaiKey = numMatch ? numMatch[0] : '';
          const cleanNdaiName = (selectedNdai ? `${selectedNdai} 질병분류표` : (tableData.title || rider.title || 'N대 질병분류표')).replace(/\d+대\/\d+대/, m => m.split('/')[0]).replace('별표 [', '').replace(']', '');
          if (!isLatestPeriod) {
            const pastImg = rider.imgSrc;
            if (pastImg) {
              window.openRulesModal(pastImg, `🏢 [${co.name}] ${period.periodStr} · ${cleanNdaiName} 공식 원문`, period.revSummary, [pastImg], { product: `${co.name} (${period.periodStr})`, type: '해당 시기 약관', page: `${period.periodStr} 공시실 분류표` });
            }
            return;
          }
          const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[co.id.replace('fire', '').replace('life', '')]);
          const v = (coEntry && (coEntry.standard || coEntry.simplified)) || coEntry;
          const targetTable = (v && v.ndai_table && (v.ndai_table.pages ? v.ndai_table : (v.ndai_table[ndaiKey] || Object.values(v.ndai_table)[0])));

          if (targetTable && targetTable.pages && targetTable.pages.length > 0) {
            const meta = { product: v.product, type: v.type, page: targetTable.pageStr };
            window.openRulesModal(targetTable.pages[0], `🏢 [${co.name}] ${cleanNdaiName} 공식 원문`, period.revSummary, targetTable.pages, meta);
          } else if (v && v.ndai_p1) {
            const pages = [v.ndai_p1];
            if (v.ndai_p2) pages.push(v.ndai_p2);
            const meta = { product: v.product, type: v.type, page: v.ndai_page };
            window.openRulesModal(v.ndai_p1, `🏢 [${co.name}] ${cleanNdaiName} 공식 원문`, period.revSummary, pages, meta);
          }
        });
      }
      return;
    }

    // 2) Idle 상태: 전체 질병군 아코디언 드릴다운 리스트 (N대별 동적 질병군 테이블 직결 #35064 #35077 #35118)
    const coKey = (co && co.id) ? co.id.replace('fire', '').replace('life', '') : '';
    const numMatch = (selectedNdai || rider.title || tableData.title || '').match(/\d+대/);
    const ndaiNum = numMatch ? numMatch[0] : '';
    const dynamicEntry = (window.DYNAMIC_NDAI_TABLES && (window.DYNAMIC_NDAI_TABLES[co.id] || window.DYNAMIC_NDAI_TABLES[coKey]));
    const dynamicTable = (dynamicEntry && (dynamicEntry[selectedNdai] || dynamicEntry[ndaiNum] || Object.values(dynamicEntry)[0])) || tableData;

    const rows = dynamicTable.rows || tableData.rows || [];
    const cleanTableTitle = dynamicTable.title || (selectedNdai ? `별표 [${selectedNdai} 질병분류표 및 보장 질병코드 전문]` : tableData.title).replace(/\d+대\/\d+대/, m => selectedNdai || m.split('/')[0]);
    box.innerHTML = photoBtnHTML + `
      <div style="margin-bottom:12px;padding:2px 0;">
        <div style="font-size:13.5px;font-weight:900;color:var(--text);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span>🏢</span>
          <span>${esc(cleanTableTitle)}</span>
          <span style="font-size:11.5px;color:#059669;font-weight:850;background:rgba(5,150,105,0.08);padding:2px 7px;border-radius:5px;border:1px solid rgba(5,150,105,0.2);">(총 ${rows.length}개 군)</span>
        </div>
      </div>

      <div class="ndai-group-list">
        ${rows.map((r, gi) => {
          const grpName = r[0];
          const summaryNames = r[1];
          const rawCodes = r[2];
          const benefit = r[3];
          const dynamicDiseases = (window.getNdaiDiseasesForGroup && window.getNdaiDiseasesForGroup(co.name, selectedNdai || rider.title, grpName)) || [];
          const detailedList = dynamicDiseases.length ? dynamicDiseases : (NDAI_DETAILED_ITEMS[grpName] || NDAI_DETAILED_ITEMS[grpName.replace(/\s*\(\d+\)/, "").trim()] || []);
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
              <div class="pair-actions">
                <button type="button" class="pair-btn btn-group-clause-scan" data-grp="${esc(grpName)}">약관</button>
                <button type="button" class="pair-btn ndai-arrow-badge${isAutoOpen ? ' on' : ''}">
                  ${isAutoOpen ? '접기 ▴' : '펼치기 ▾'}
                </button>
              </div>
            </div>

            <div class="ndai-group-body" style="display:${isAutoOpen ? 'block' : 'none'};padding:10px 12px;background:var(--surface-2);border-top:1px dashed var(--line);">
              <div style="font-size:11px;font-weight:850;color:#059669;margin-bottom:6px;">📋 수록 질병코드 (KCD 전수 분류표):</div>
              <div style="display:flex;flex-direction:column;gap:5px;">
                ${detailedList.length ? detailedList.map(item => {
                  const codeStr = item.code || (item.c && item.c[0]) || 'KCD';
                  const nameStr = item.name || item.n || '';
                  const subCodeStr = (item.c && item.c.length > 1) ? ('포함 KCD: ' + item.c.join(', ')) : '';
                  const descStr = item.desc || subCodeStr;
                  return `
                  <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface);border-radius:8px;border:1px solid var(--border);min-height:44px;box-shadow:0 1px 2px rgba(0,0,0,0.02);">
                    <span class="kcd-badge-fixed" style="font-size:11px;font-weight:900;color:#2563eb;background:rgba(37,99,235,0.08);padding:3px 0;border-radius:5px;border:1px solid rgba(37,99,235,0.2);white-space:nowrap;width:84px;min-width:84px;max-width:84px;text-align:center;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;flex-shrink:0;">${esc(codeStr)}</span>
                    <div style="min-width:0;flex:1;">
                      <div style="font-size:12.5px;font-weight:850;color:var(--text);word-break:keep-all;">${esc(nameStr)}</div>
                      ${descStr ? `<div style="font-size:11px;color:#334155;margin-top:2px;line-height:1.35;word-break:keep-all;">${esc(descStr)}</div>` : ''}
                    </div>
                  </div>`;
                }).join('') : `
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
      <!-- N대 대표질환 원터치 빠른 판정 칩 (하단 배치 #34084) -->
      <div style="margin-top:16px;">
        ${chipsHTML}
      </div>
    `;

    bindClauseChipEvents(box);

    // 군별 1:1 약관보기 버튼 바인딩 (#34099)
    box.querySelectorAll('.btn-group-clause-scan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const grp = btn.getAttribute('data-grp');
        window.openNdaiGroupModal(co, grp, period, data);
      });
    });

    const btnPhoto = box.querySelector('#btnOpenRulesNdai');
    if (btnPhoto) {
      btnPhoto.addEventListener('click', () => {
        const isLatestPeriod = co.periods && co.periods[0] && co.periods[0].id === period?.id;
        const numMatch = (selectedNdai || tableData.title || rider.title || '').match(/\d+대/);
        const ndaiKey = numMatch ? numMatch[0] : '';
        const cleanNdaiName = (selectedNdai ? `${selectedNdai} 질병분류표` : (tableData.title || rider.title || 'N대 질병분류표')).replace(/\d+대\/\d+대/, m => m.split('/')[0]).replace('별표 [', '').replace(']', '');
        if (!isLatestPeriod) {
          const pastImg = rider.imgSrc;
          if (pastImg) {
            window.openRulesModal(pastImg, `🏢 [${co.name}] ${period.periodStr} · ${cleanNdaiName} 공식 원문`, period.revSummary, [pastImg], { product: `${co.name} (${period.periodStr})`, type: '해당 시기 약관', page: `${period.periodStr} 공시실 분류표` });
          }
          return;
        }
        const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[co.id.replace('fire', '').replace('life', '')]);
        const v = (coEntry && (coEntry.standard || coEntry.simplified)) || coEntry;
        const targetTable = (v && v.ndai_table && (v.ndai_table.pages ? v.ndai_table : (v.ndai_table[ndaiKey] || Object.values(v.ndai_table)[0])));

        if (targetTable && targetTable.pages && targetTable.pages.length > 0) {
          const meta = { product: v.product, type: v.type, page: targetTable.pageStr };
          window.openRulesModal(targetTable.pages[0], `🏢 [${co.name}] ${cleanNdaiName} 공식 원문`, period.revSummary, targetTable.pages, meta);
        } else if (v && v.ndai_p1) {
          const pages = [v.ndai_p1];
          if (v.ndai_p2) pages.push(v.ndai_p2);
          const meta = { product: v.product, type: v.type, page: v.ndai_page };
          window.openRulesModal(v.ndai_p1, `🏢 [${co.name}] ${cleanNdaiName} 공식 원문`, period.revSummary, pages, meta);
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
          if (arrow) {
            arrow.textContent = isOpen ? '펼치기 ▾' : '접기 ▴';
            arrow.classList.toggle('on', !isOpen);
          }
        }
      });
    });

    const btnExpand = box.querySelector('#btnExpandAllNdai');
    const btnCollapse = box.querySelector('#btnCollapseAllNdai');
    if (btnExpand) {
      btnExpand.addEventListener('click', () => {
        box.querySelectorAll('.ndai-group-body').forEach(b => b.style.display = 'block');
        box.querySelectorAll('.ndai-arrow-badge').forEach(a => { a.textContent = '접기 ▴'; a.classList.add('on'); });
      });
    }
    if (btnCollapse) {
      btnCollapse.addEventListener('click', () => {
        box.querySelectorAll('.ndai-group-body').forEach(b => b.style.display = 'none');
        box.querySelectorAll('.ndai-arrow-badge').forEach(a => { a.textContent = '펼치기 ▾'; a.classList.remove('on'); });
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

    // 1~5종 개정 전 vs 개정 후 핵심 차이점 비교 카드 및 동시수술 통일감 버튼 (#34377 #34389 #34390 #34445)
    let photoHeaderHTML = co.id === 'meritz' ? meritzRevisionTableHTML(period) : `
      <!-- 개정 전후 핵심 비교 카드 -->
      <div style="background:var(--surface-2);border:1.5px solid #fde68a;border-radius:11px;padding:12px 14px;margin-bottom:12px;box-shadow:0 1px 3px rgba(217,119,6,0.05);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:12.5px;font-weight:900;color:#b45309;display:flex;align-items:center;gap:5px;">
            <span>⚡</span>
            <span>[1~5종 수술분류표] 개정 전 vs 개정 후 핵심 차이점 비교</span>
          </span>
          <span style="font-size:11px;font-weight:850;padding:2px 6px;border-radius:5px;background:#fef3c7;color:#b45309;">실무 필수 대조</span>
        </div>
        <div style="font-size:11.5px;color:var(--text-3);font-weight:700;margin-bottom:8px;line-height:1.45;">아래 두 칸은 이 회사 약관에서 읽은 행만 적습니다.</div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font-size:12px;">
          <div style="background:var(--surface);border:1.5px solid rgba(217,119,6,0.3);border-radius:8px;padding:8px 10px;">
            <div style="font-weight:900;color:#d97706;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
              <span>⚠️</span>
              <span>이 약관 별표</span>
            </div>
            <div style="color:var(--text-2);line-height:1.5;">${verifiedFactLines('polyp', co.name)}<br>${verifiedFactLines('gall', co.name)}<br>${verifiedFactLines('breast', co.name)}<br>${verifiedFactLines('eswl', co.name)}</div>
          </div>
          <div style="background:var(--surface);border:1.5px solid rgba(37,99,235,0.3);border-radius:8px;padding:8px 10px;">
            <div style="font-weight:900;color:#2563eb;margin-bottom:4px;display:flex;align-items:center;gap:4px;">
              <span>💎</span>
              <span>개정 전 별표</span>
            </div>
            <div style="color:var(--text-2);line-height:1.5;">같은 수술의 개정 전 별표와 적용일이 한 쌍으로 있는 원문은 이 칸에 없습니다. 다른 회사의 개정 전 종수를 적지 않습니다.</div>
          </div>
        </div>
      </div>
      ${co.id === 'meritz' ? '' : ''}

      <!-- 1~5종 개정 후 / 개정 전 약관보기 버튼 (모바일 글씨 잘림 0% 와이드 칼정렬 #34701 #34711) -->
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
        <button type="button" class="btn-co-clause btn-tier-rev-photo" data-rev="post" style="width:100%;height:44px;min-height:44px;border:1.5px solid rgba(217,119,6,0.4);border-radius:10px;background:var(--surface);padding:0 14px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span class="btn-co-name" style="font-size:13px;font-weight:850;color:var(--text);display:flex;align-items:center;gap:6px;">
            <span>📋</span>
            <span>1-5종수술 <strong style="color:#d97706;font-weight:900;">개정 후</strong> 약관</span>
          </span>
          <span class="btn-co-badge" style="font-size:11.5px;font-weight:850;color:#d97706;background:rgba(217,119,6,0.12);padding:4px 10px;border-radius:6px;white-space:nowrap;">
            약관보기 🔍
          </span>
        </button>
        <button type="button" class="btn-co-clause btn-tier-rev-photo" data-rev="pre" style="width:100%;height:44px;min-height:44px;border:1.5px solid rgba(37,99,235,0.35);border-radius:10px;background:var(--surface);padding:0 14px;box-sizing:border-box;display:flex;align-items:center;justify-content:space-between;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <span class="btn-co-name" style="font-size:13px;font-weight:850;color:var(--text);display:flex;align-items:center;gap:6px;">
            <span>📋</span>
            <span>1-5종수술 <strong style="color:#2563eb;font-weight:900;">개정 전</strong> 약관</span>
          </span>
          <span class="btn-co-badge" style="font-size:11.5px;font-weight:850;color:#2563eb;background:rgba(37,99,235,0.12);padding:4px 10px;border-radius:6px;white-space:nowrap;">
            약관보기 🔍
          </span>
        </button>
      </div>
    `;

    // 다빈도 및 신의료기술 12대 대표 태그 (카티스템/연골 포함 & 3열 대칭 그리드 칼정렬 #27519 지침 4)
    const quickChips = [
      { name: '대장용종', badge: '별표', q: '대장용종' },
      { name: '요로결석', badge: '별표', q: '요로결석' },
      { name: '백내장', badge: '별표', q: '백내장' },
      { name: '여유증', badge: '별표', q: '여유증' },
      { name: '담석증', badge: '별표', q: '담석증' },
      { name: '카티스템/연골', badge: '별표', q: '카티스템' },
      { name: '맘모톰', badge: '별표', q: '맘모톰' },
      { name: '하이푸', badge: '별표', q: '하이푸' },
      { name: '유로리프트', badge: '별표', q: '유로리프트' },
      { name: '베나실', badge: '별표', q: '베나실' },
      { name: '인공관절', badge: '별표', q: '인공관절' },
      { name: '자궁근종', badge: '별표', q: '자궁근종' }
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
        text: "회사는 다음 각 호의 사유로 생긴 수술비는 1~5종 수술비를 지급하지 않습니다:\n1. 피보험자, 보험수익자 또는 계약자의 고의 또는 자해로 인한 수술\n2. 임신·출산·제왕절개의 지급 여부는 특약마다 다릅니다. 손보 전부 부지급, 생보 전부 1종으로 적지 않습니다.\n3. 주근깨, 다모, 사마귀, 여드름, 노화현상 탈모 등 피부질환 및 미용성형 목적 수술\n4. 단순 코골음, 포경수술, 비뇨기계 장애(요실금 등) 및 피임·불임 복원 시술\n5. 치과질환(K00~K08, 치주·치조골보철 처치) 및 한방병원·한의원 한방 비급여 처치\n6. 건강검진, 종합검진, 생검(조직검사) 등 치료를 직접 목적으로 하지 않는 검사적 진료\n7. 무면허 운전, 음주운전 및 피보험자의 범죄행위로 생긴 사고"
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
        text: "관혈·비관혈 비율은 특약마다 다릅니다. 모든 손보 N대에 비관혈 50%가 있는 것으로 적지 않습니다. 그 특약의 지급표 원문을 봅니다."
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
        text: "회사는 다음 각 호의 사유로 생긴 수술비는 지급하지 않습니다:\n1. 피보험자, 보험수익자 또는 계약자의 고의 또는 자해\n2. 임신·출산·제왕절개의 지급 여부는 특약마다 다릅니다. 손보 전부 부지급, 생보 전부 1종으로 적지 않습니다.\n3. 주근깨, 다모, 사마귀, 여드름, 노화현상 탈모 등 피부질환 및 미용성형 목적 수술\n4. 단순 코골음, 포경수술, 비뇨기계 장애(요실금 등) 및 피임·불임 복원 시술\n5. 치과질환(K00~K08, 치주·치조골보철 처치) 및 한방병원·한의원 한방 비급여 처치\n6. 건강검진, 종합검진, 생검(조직검사) 등 치료를 직접 목적으로 하지 않는 검사적 진료\n7. 무면허 운전, 음주운전 및 피보험자의 범죄행위로 생긴 사고"
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
    return esc(rawText);
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
        t = t.replace(/(치핵[^\n\r]*|요실금[^\n\r]*)/g, '<mark style="background:#dcfce7;color:#15803d;padding:2px 6px;border-radius:5px;font-weight:900;border:1px solid #86efac;">생보 통념 · 미검증. 치핵·요실금 종수는 해당 별표 확인</mark>');
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

  const block = curTab === 'exclusion' ? rider.exclusion : (rider.inclusion || rider.clauseBody);
  const transcript = block && block.officialTranscript;
  const officialBlock = transcript ? `
    <div class="official-excerpt">
      <div class="official-excerpt-head">
        ${window.clauseVerifyBadgeHTML ? window.clauseVerifyBadgeHTML('scan-transcript') : ''}
        <span>스캔에 인쇄된 조항</span>
      </div>
      <div class="official-excerpt-src">${esc((block && block.transcriptSource) || '')}</div>
      ${rider.transcriptNote ? `<div class="official-excerpt-note">${esc(rider.transcriptNote)}</div>` : ''}
      ${(rider.verifiedConditions || []).map(c => `<div class="cond-row"><b>${esc(c.kind)}</b><span>${esc(c.text)}</span></div>`).join('')}
      <pre class="official-excerpt-body">${esc(transcript)}</pre>
    </div>` : '';

  // 상단 회사별 실무 메모. 회사별 원문으로 확인하지 않은 통념이라 단정하지 않는다.
  const isLifeCo = co._cat === 'life' || co.isLife || /생명|라이프/.test(co.name || '') || /life/i.test(co.id || '');
  const diffSummaryHTML = '';

  box.innerHTML = `
    <!-- 2대 탭 전환 버튼: [보상하는 사항] vs [보상제외 사항] (#28437 #28442 #33904) -->
    <div style="margin-bottom:12px;">
      <!-- 2대 탭 (박스 높이 44px, 반경 10px 칼정렬 #34648) -->
      <div style="margin-bottom:12px;">
        ${(() => {
          const scanObj = getScanPagesForContext(co, period, data, rider, targetRider, curTab, selectedNdai);
          if (scanObj && scanObj.pages && scanObj.pages.length > 0) {
            return `<button type="button" class="cov-btn point" id="btnScanAction" style="width:100%;margin:0 0 12px;">약관 원문보기</button>`;
          }
          return `<p class="scan-note">이 특약의 원문 쪽은 아직 연결되어 있지 않습니다.</p>`;
        })()}
      </div>
      <div class="modal-tabs" style="margin-bottom:12px;">
        <button type="button" id="tabClauseInclusion" class="modal-tab ${curTab === 'inclusion' ? 'on' : ''}">보상하는 사항</button>
        <button type="button" id="tabClauseExclusion" class="modal-tab ${curTab === 'exclusion' ? 'on' : ''}">보상제외 사항</button>
      </div>
    </div>

    ${officialBlock}
    ${diffSummaryHTML}

    <!-- 약관 조항 텍스트 리스트 -->
    <div class="clause-article-list" style="display:${co.id === 'meritz' ? 'none' : 'flex'};flex-direction:column;gap:10px;">
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

  // 탭 전환 이벤트 바인딩 (#28437 #33904)
  const btnTabInc = box.querySelector('#tabClauseInclusion');
  const btnTabExc = box.querySelector('#tabClauseExclusion');

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

  const btnScanAction = box.querySelector('#btnScanAction');
  if (btnScanAction) {
    btnScanAction.addEventListener('click', () => {
      const scanObj = getScanPagesForContext(co, period, data, rider, targetRider, curTab, selectedNdai);
      if (scanObj && scanObj.pages && scanObj.pages.length > 0) {
        window.openRulesModal(scanObj.pages[0], scanObj.title, period ? period.revSummary : '', scanObj.pages, scanObj.meta);
      }
    });
  }
}

function bindPhotoButtons(box, rider, co, period) {
  if (!box) return;
  const btnPost = box.querySelector('.btn-tier-rev-photo[data-rev="post"]');
  const btnPre = box.querySelector('.btn-tier-rev-photo[data-rev="pre"]');
  const btnSingle = box.querySelector('.btn-tier-single-photo');

  const blockedImage = (src) => !src || /meritz_tier_rev_/.test(src) || (co.id !== 'meritz' && /meritz_/.test(src)) || (co.id !== 'kbinsure' && /\/kb_/.test(src)) || (co.id !== 'samsungfire' && /samsung_/.test(src));
  if (btnPost) {
    btnPost.addEventListener('click', () => {
      if (co.id === 'meritz' && period && period.postTierPages && period.postTierPages.length) {
        window.openRulesModal(period.postTierPages[0], '1~5종 분류표', '', period.postTierPages, { product: '메리츠화재', type: period.periodStr, page: period.periodStr });
        return;
      }
      if (window.CLAUSE_BOOK && window.CLAUSE_BOOK[co.id] && typeof window.lookupClauseScan === 'function') {
        const hit = window.lookupClauseScan(co, period, {}, 'tier', 'table', null);
        if (hit && hit.pages && hit.pages.length) {
          window.openRulesModal(hit.pages[0], `📋 [${co.name}] 1~5종 분류표 원문`, '', hit.pages, hit.meta);
        } else if (typeof showToast === 'function') {
          showToast('이 시기의 1~5종 분류표 원문 쪽이 연결되어 있지 않습니다.');
        }
        return;
      }
      const isLatestPeriod = co.periods && co.periods[0] && co.periods[0].id === period?.id;
      if (!isLatestPeriod) {
        const postObj = (rider.revPhotos || []).find(p => p.isPost) || (rider.revPhotos || [])[0];
        const src = postObj ? postObj.src : rider.imgSrc;
        if (src && blockedImage(src)) { if (typeof showToast === 'function') showToast('다른 회사 약관 이미지는 열지 않습니다.'); return; }
        if (src) window.openRulesModal(src, `📋 [${co.name}] ${period.periodStr} · 1-5종 수술분류표 [개정 후 약관 사진]`, period.revSummary, [src], { product: `${co.name} (${period.periodStr})`, type: '해당 시기 약관', page: `${period.periodStr} 공시실 분류표` });
        
        return;
      }
      const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[co.id.replace('fire', '').replace('life', '')]);
      const v = (coEntry && (coEntry.standard || coEntry.simplified)) || coEntry;
      if (v && v.tier_table && v.tier_table.pages) {
        const meta = { product: v.product, type: v.type, page: v.tier_table.pageStr };
        window.openRulesModal(v.tier_table.pages[0], `📋 [${co.name}] 1~5종 수술분류표 공식 원문`, period.revSummary, v.tier_table.pages, meta);
      } else {
        const postObj = (rider.revPhotos || []).find(p => p.isPost) || (rider.revPhotos || [])[0];
        const src = postObj ? postObj.src : rider.imgSrc;
        if (src && blockedImage(src)) { if (typeof showToast === 'function') showToast('다른 회사 약관 이미지는 열지 않습니다.'); return; }
        if (src) window.openRulesModal(src, `📋 [${co.name}] 1-5종 수술분류표 [개정 후 약관 사진]`, period.revSummary);
        
      }
    });
  }
  if (btnPre) {
    btnPre.addEventListener('click', () => {
      if (co.id === 'meritz' && period && period.preTierPages && period.preTierPages.length) {
        window.openRulesModal(period.preTierPages[0], '1~5종 분류표 이전 구간', '', period.preTierPages, { product: '메리츠화재', type: period.periodStr, page: period.periodStr });
        return;
      }
      if (co.id === 'hyundai') {
        const pages = ['assets/clause_pages/hyundai/hi2310_t11_p124.png','assets/clause_pages/hyundai/hi2310_eswl_p126.png'];
        window.openRulesModal(pages[0], '현대해상다이렉트 Hi2310 별표11 (변경 전)', 'Hi2310까지 유방절단 3종, 체외충격파 제85항 1종. Hi2404부터 유방절단이 나뉘고 체외충격파는 제87항 2종.', pages, { product: '무배당 현대해상다이렉트 H건강보험(Hi2310)', type: 'CM295F_20231001', page: '별표11 인쇄 124쪽·126쪽' });
        return;
      }
      if (window.CLAUSE_BOOK && window.CLAUSE_BOOK[co.id]) {
        if (typeof showToast === 'function') showToast('개정 전 별표 원문 쪽이 한 쌍으로 없어 열지 않습니다.');
        return;
      }
      const isLatestPeriod = co.periods && co.periods[0] && co.periods[0].id === period?.id;
      if (!isLatestPeriod) {
        const preObj = (rider.revPhotos || []).find(p => !p.isPost) || (rider.revPhotos || [])[1];
        const src = preObj ? preObj.src : rider.imgSrc;
        if (src && blockedImage(src)) { if (typeof showToast === 'function') showToast('다른 회사 약관 이미지는 열지 않습니다.'); return; }
        if (src) window.openRulesModal(src, `📋 [${co.name}] ${period.periodStr} · 1-5종 수술분류표 [개정 전 약관 사진]`, period.revSummary, [src], { product: `${co.name} (${period.periodStr})`, type: '해당 시기 약관', page: `${period.periodStr} 공시실 분류표` });
        
        return;
      }
      const coEntry = window.VERIFIED_CLAUSE_SCANS && (window.VERIFIED_CLAUSE_SCANS[co.id] || window.VERIFIED_CLAUSE_SCANS[co.id.replace('fire', '').replace('life', '')]);
      const v = (coEntry && (coEntry.standard || coEntry.simplified)) || coEntry;
      if (v && v.tier_table && v.tier_table.pages) {
        const meta = { product: v.product, type: v.type, page: v.tier_table.pageStr };
        window.openRulesModal(v.tier_table.pages[0], `📋 [${co.name}] 1~5종 수술분류표 공식 원문`, period.revSummary, v.tier_table.pages, meta);
      } else {
        const preObj = (rider.revPhotos || []).find(p => !p.isPost) || (rider.revPhotos || [])[1];
        const src = preObj ? preObj.src : rider.imgSrc;
        if (src && blockedImage(src)) { if (typeof showToast === 'function') showToast('다른 회사 약관 이미지는 열지 않습니다.'); return; }
        if (src) window.openRulesModal(src, `📋 [${co.name}] 1-5종 수술분류표 [개정 전 약관 사진]`, period.revSummary);
        
      }
    });
  }
  if (btnSingle) {
    btnSingle.addEventListener('click', () => {
      const isLatestPeriod = co.periods && co.periods[0] && co.periods[0].id === period?.id;
      if (!isLatestPeriod) {
        if (rider.imgSrc) window.openRulesModal(rider.imgSrc, `📋 [${co.name}] ${period.periodStr} · 1-5종 수술분류표 원문`, period.revSummary, [rider.imgSrc], { product: `${co.name} (${period.periodStr})`, type: '해당 시기 약관', page: `${period.periodStr} 공시실 분류표` });
        
        return;
      }
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

window.start = start;
window.bindClausesTab = bindClausesTab;
window.renderClausesCompanyList = renderClausesCompanyList;


window.renderDisputesList = renderDisputesList;
window.__DEBUG = { state, search, runQuickSearch };

})();
