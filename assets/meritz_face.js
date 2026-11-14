/* 메리츠 보험약관 화면. 원문에서 읽은 내용만 둔다. */
(function () {
  const P = 'assets/clause_pages/meritz/v/';
  const pg = (tag, nums) => nums.map(n => P + tag + '_' + n + '.png');
  const old = (name) => 'assets/clause_pages/meritz/' + name;

  const pay15 = '분류표에서 정한 수술을 받으면 수술 1회당 종별 보험가입금액. 동시에 두 가지 이상이면 높은 한 가지. 같은 부위가 아니고 치료 목적이 다른 수술은 각각.';
  const excl15 = '고의(심신상실 제외), 수익자·계약자의 고의. 수술에서 빼는 것: 흡인, 천자, 신경차단, 미용성형, 피임·불임, 검사·진단 목적(생검, 복강경검사), 분류표에 없는 시술.';

  const c32 = {
    '5대 심장': ['급성 류마티스열 I00∼I02', '만성 류마티스 심장 질환 I05∼I09', '허혈심장질환 I20∼I25', '폐성 심장병 및 폐순환의 질환 I26∼I28', '기타 형태의 심장병 I30∼I52', '수막구균성 심장질환 A39.5', '칸디다심내막염 B37.6'],
    '5대 뇌혈관': ['뇌혈관 질환 I60∼I69'],
    '5대 간': ['바이러스 간염 B15∼B19', '간의 질환 K70∼K77', '거대세포바이러스간염 B25.1'],
    '9대 호흡기': ['기관지염 J40', '만성 기관지염 J41', '상세불명의 만성 기관지염 J42', '천식 J45', '천식지속상태 J46'],
    '9대 궤양': ['위궤양 K25', '십이지장궤양 K26', '상세불명 부위의 소화성 궤양 K27'],
    '9대 결핵': ['결핵 A15-A19', '결핵의 후유증 B90', '결핵성복막염 K67.3', '결핵 관절염 M01.1', '척추의 결핵 M49.0', '뼈의 결핵 M90.0'],
    '9대 폐렴': ['바이러스 폐렴 J12', '폐렴연쇄구균에 의한 폐렴 J13', '세균성 폐렴 J15', '상세불명 병원체의 폐렴 J18', '재향군인병 A48.1'],
    '9대 췌장': ['급성 췌장염 K85', '췌장의 기타 질환 K86'],
    '14대 양성신생물': ['소화기계통의 양성신생물 D13', '중이 및 호흡계통의 양성 신생물 D14', '흉곽내 기관의 양성 신생물 D15', '비뇨기관의 양성신생물 D30', '수막의 양성 신생물 D32'],
    '14대 담석': ['담석증 K80', '담낭염 K81', '담낭의 기타질환 K82', '담도의 기타질환 K83'],
    '14대 뇌신경': ['삼차신경의 장애 G50', '안면신경장애 G51', '기타 뇌신경의 장애 G52'],
    '4대 생식기 종양': ['자궁의 평활근종 D25', '자궁의 기타 양성 신생물 D26', '난소의 양성 신생물 D27', '여성생식기관의 양성 신생물 D28', '남성생식기관의 양성 신생물 D29'],
    '4대 관절': ['감염성 관절병증 M00~M03', '염증성 다발관절병증 M05~M14', '관절증 M15~M19', '기타 관절장애 M20~M25']
  };

  function partsFrom(map, pages) {
    return Object.keys(map).map(name => ({ name, codes: map[name], pages }));
  }

  const p32 = partsFrom(c32, pg('A', [538, 539]).concat(pg('A', [1074, 1075, 1076, 1077, 1078, 1079, 1080])));
  const p64names = ['7대질병수술비', '특정15대질병수술비', '다빈도38대질병수술비', '관절염·생식기질환수술비', '치핵수술비', '백내장수술비'];
  const p64 = p64names.map(name => ({ name, codes: [], pages: pg('A', [528, 529, 530]) }));
  const p82names = ['심장질환수술비', '뇌혈관질환수술비', '특정27대질병수술비', '다빈도49대질병수술비', '관절염·생식기질환수술비', '치핵수술비', '백내장수술비'];
  const p82pages = pg('B', [510, 511, 512, 513, 514, 515]);
  const p82 = p82names.map(name => ({ name, codes: [], pages: p82pages }));
  const p131names = ['심장질환수술비', '뇌혈관질환수술비', '특정31대질병수술비', '다빈도64대질병수술비', '특정다빈도29대질병수술비', '후각특정질환수술비', '관절염·생식기질환수술비', '치핵수술비', '백내장수술비'];
  const p131clause = pg('D', [446, 447, 448, 449, 450, 451]);
  const p131table = pg('D', [1108, 1109, 1110, 1111, 1112, 1113, 1114]);
  const freq64 = ['주침샘의 양성 신생물 D11', '소화계통의 양성 신생물 D13', '중이 및 호흡계통의 양성 신생물 D14', '흉곽내 기관의 양성 신생물 D15', '수막의 양성 신생물 D32', '갑상선의 양성 신생물 D34', '내분비선의 양성 신생물 D35', '용혈-요독증후군 D59.3', '비장의 질환 D73', '급성 상기도감염 J00-J06', '상세불명의 급성 하기도감염 J22', '유방의 비대 N62', '양성 유방형성이상 N60', '담석증 K80', '담낭염 K81'];
  const p131 = p131names.map(name => ({
    name,
    codes: name.indexOf('다빈도64대') === 0 ? freq64 : [],
    pages: name.indexOf('다빈도64대') === 0 ? p131clause.concat(p131table) : p131clause
  }));
  const p128names = ['심장질환수술비', '뇌혈관질환수술비', '특정31대질병수술비', '다빈도63대질병수술비', '후각특정질환수술비', '관절염·생식기질환수술비', '백내장수술비', '특정다빈도28대질병수술비'];
  const p128 = p128names.map(name => ({ name, codes: [], pages: pg('P', [234, 235, 236]) }));
  const p130names = ['심장질환수술비', '뇌혈관질환수술비', '특정31대질병수술비', '다빈도61대질병수술비', '유방의장애수술비', '후각특정질환수술비', '관절염·생식기질환수술비', '편도염수술비', '백내장수술비', '특정다빈도29대질병수술비', '치핵수술비'];
  const p130 = p130names.map(name => ({ name, codes: [], pages: pg('U', [590, 591]) }));

  function face(o) { return o; }

  window.MERITZ_FACE = {
    meritz_201912: {
      standard: face({
        disease: { line: '질병수술비(백내장제외).', define: pg('A', [291, 292]), exclude: pg('A', [289, 290]) },
        tier: {
          line: '맘모톰 문장 있음. N62 1종 문장 없음.',
          pay: pay15, excl: excl15,
          clause: pg('A', [768, 769, 770]),
          table: pg('A', [961, 962, 963, 964, 965]),
          items: [
            { name: '맘모톰', tier: '문장 있음', pages: pg('A', [961]) },
            { name: '체외충격파', tier: '2종', pages: [old('mb2007_eswl_p456.png')] },
            { name: 'N62', tier: '1종 문장 없음', pages: pg('A', [961]) }
          ]
        },
        bundles: [
          { name: '32대', parts: p32 },
          { name: '64대', parts: p64 }
        ]
      }),
      simplified: face({
        disease: { line: '갱신형 질병수술비(간편가입).', define: pg('Q', [159, 160]), exclude: pg('Q', [158]) },
        tier: {
          line: '맘모톰 문장 있음.',
          pay: '', excl: '',
          clause: [],
          table: pg('Q', [571, 572, 573]),
          items: [{ name: '맘모톰', tier: '문장 있음', pages: pg('Q', [571]) }]
        },
        bundles: [{ name: '32대', parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('q_32.png')] }] }]
      })
    },
    meritz_202011: {
      standard: face({
        disease: { line: '질병수술비(백내장 및 대장용종 제외).', define: pg('B', [283, 284]), exclude: pg('B', [282, 283]) },
        tier: {
          line: '직전 기간과 동일',
          pay: '', excl: '',
          clause: pg('B', [792, 793, 794]),
          table: pg('B', [947, 948, 949]),
          items: [
            { name: '맘모톰', tier: '문장 있음', pages: pg('B', [947]) },
            { name: 'N62', tier: '1종 문장 없음', pages: pg('B', [947]) }
          ]
        },
        bundles: [
          { name: '82대', parts: p82 },
          { name: '32대', parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('b_32.png')] }] }
        ]
      }),
      simplified: face({
        disease: { line: '갱신형 질병수술비(간편가입).', define: pg('G', [179, 180]), exclude: pg('G', [178]) },
        tier: {
          line: '직전 기간과 동일',
          pay: '', excl: '',
          clause: [],
          table: pg('G', [653, 654, 655]),
          items: [{ name: '맘모톰', tier: '문장 있음', pages: pg('G', [653]) }]
        },
        bundles: [{ name: '32대', parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('s2011_32.png')] }] }]
      })
    },
    meritz_202101: {
      standard: face({
        disease: { line: '질병수술비(백내장 및 대장용종 제외).', define: pg('C', [284, 285]), exclude: pg('C', [283]) },
        tier: {
          line: '영문 Mammotomy 문장이 빠짐.',
          pay: '', excl: '',
          clause: [],
          table: [],
          items: [{ name: '맘모톰', tier: '문장 없음', pages: [] }]
        },
        bundles: [
          { name: '82대', parts: [{ name: '82대질병수술비', codes: [], pages: pg('C', [514, 515, 516]) }] },
          { name: '32대', parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('c_32.png')] }] }
        ]
      }),
      simplified: face({
        disease: { line: '갱신형 질병수술비(335간편가입).', define: pg('S', [175, 176]), exclude: pg('S', [174]) },
        tier: { line: '맘모톰 문장 없음.', pay: '', excl: '', clause: [], table: [], items: [] },
        bundles: [{ name: '32대', parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('c_g32.png')] }] }]
      })
    },
    meritz_202207: {
      standard: face({
        disease: { line: '질병수술비(특정5대질병 제외).', define: pg('D', [280, 281]), exclude: pg('D', [279, 280]) },
        tier: {
          line: '직전 기간과 동일',
          pay: '', excl: '',
          clause: [],
          table: [],
          items: [{ name: 'N62', tier: '1종 문장 없음', pages: [] }]
        },
        bundles: [
          { name: '131대', parts: p131 },
          { name: '32대', parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('d_32.png')] }] }
        ]
      }),
      simplified: face({
        disease: { line: '갱신형 질병수술비(355간편가입).', define: pg('P', [183, 184]), exclude: pg('P', [182]) },
        tier: { line: 'N62 1종 문장 없음.', pay: '', excl: '', clause: [], table: [], items: [] },
        bundles: [
          { name: '32대', parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('p_32.png')] }] },
          { name: '128대', parts: p128 }
        ]
      })
    },
    meritz_202501: {
      standard: face({
        disease: { line: '질병수술비(특정5대질병 제외).', define: [], exclude: pg('E', [855, 856]) },
        tier: {
          line: '유방의 비대(N62) 수술을 1종으로 적음. 유방절단은 3종.',
          pay: '', excl: '',
          clause: pg('E', [479, 480, 481]),
          table: pg('E', [592, 593, 594, 595]).concat([old('e_n62.png')]),
          items: [
            { name: 'N62', tier: '1종', pages: [old('e_n62.png')].concat(pg('E', [592])) },
            { name: '유방절단', tier: '3종', pages: [old('e_n62.png')] },
            { name: '맘모톰', tier: '1종', pages: [old('e_n62.png')] }
          ]
        },
        bundles: [
          { name: '131대', parts: ['심장질환수술비', '뇌혈관질환수술비', '특정31대질병수술비', '다빈도62대질병수술비', '유방의장애수술비', '편도염수술비', '특정다빈도29대질병수술비', '후각특정질환수술비', '관절염·생식기질환수술비', '치핵수술비', '백내장수술비'].map(name => ({ name, codes: [], pages: pg('E', [862, 863, 864]) })) },
          { name: '32대', parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('e_32.png')] }] }
        ]
      }),
      simplified: face({
        disease: { line: '갱신형 질병수술비.', define: pg('U', [587]), exclude: pg('U', [588]) },
        tier: {
          line: '유방의 비대(N62) 수술을 1종으로 적음. 유방절단은 3종.',
          pay: '', excl: '',
          clause: pg('U', [325, 326, 327]),
          table: pg('U', [443, 444, 445]).concat([old('g_n62.png')]),
          items: [
            { name: 'N62', tier: '1종', pages: [old('g_n62.png')] },
            { name: '유방절단', tier: '3종', pages: [old('g_n62.png')] }
          ]
        },
        bundles: [
          { name: '32대', parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('u_32.png')] }] },
          { name: '130대', parts: p130 }
        ]
      })
    }
  };
})();
