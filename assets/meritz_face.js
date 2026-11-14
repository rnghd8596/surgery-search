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
  const pyo = (key) => (window.MERITZ_PYO && window.MERITZ_PYO[key]) || null;
  function limit32(file, pageLabel) {
    return {
      title: '관혈수술만 보장',
      note: '제외: 내시경·카테터·신의료수술. 복강경하·흉강경하·대뇌내시경은 보상.',
      pages: [P + file],
      pageLabel
    };
  }

  window.MERITZ_FACE = {
    meritz_201912: {
      standard: face({
        disease: { pill: '백내장 제외', line: '질병수술비(백내장제외).', define: pg('A', [291, 292]), exclude: pg('A', [289, 290]) },
        tier: {
          pill: '1~5종',
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
          { name: '64대', sale: '~2020.11.03', clause: pg('A', [528, 529, 530]), parts: pyo('A64') || p64 },
          { name: '32대', sale: '~2020.11.03', clause: pg('A', [538, 539]), parts: pyo('A32') || p32, limit: limit32('A_541.png', '541') }
        ]
      }),
      simplified: face({
        disease: { pill: '간편', line: '갱신형 질병수술비(간편가입).', define: pg('Q', [159, 160]), exclude: pg('Q', [158]) },
        tier: {
          pill: '1~5종',
          line: '맘모톰 문장 있음.',
          pay: '', excl: '',
          clause: [],
          table: pg('Q', [571, 572, 573]),
          items: [{ name: '맘모톰', tier: '문장 있음', pages: pg('Q', [571]) }]
        },
        bundles: [{ name: '32대', sale: '~2020.11.03', clause: [old('q_32.png')], parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('q_32.png')] }] }]
      })
    },
    meritz_202011: {
      standard: face({
        disease: { pill: '대장용종 제외', line: '질병수술비(백내장 및 대장용종 제외).', define: pg('B', [283, 284]), exclude: pg('B', [282, 283]) },
        tier: {
          pill: '1~5종',
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
          { name: '82대', sale: '2020.11~2020.12', clause: pg('B', [510, 511, 512, 513, 514, 515]), parts: pyo('B82') || p82 },
          { name: '32대', sale: '2020.11~2020.12', clause: [old('b_32.png')], parts: pyo('B32') || [{ name: '32대질병관혈수술비', codes: [], pages: [old('b_32.png')] }], limit: limit32('B_519.png', '519') }
        ]
      }),
      simplified: face({
        disease: { pill: '간편', line: '갱신형 질병수술비(간편가입).', define: pg('G', [179, 180]), exclude: pg('G', [178]) },
        tier: {
          pill: '1~5종',
          line: '직전 기간과 동일',
          pay: '', excl: '',
          clause: [],
          table: pg('G', [653, 654, 655]),
          items: [{ name: '맘모톰', tier: '문장 있음', pages: pg('G', [653]) }]
        },
        bundles: [{ name: '32대', sale: '2020.11~2020.12', clause: [old('s2011_32.png')], parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('s2011_32.png')] }] }]
      })
    },
    meritz_202101: {
      standard: face({
        disease: { pill: '대장용종 제외', line: '질병수술비(백내장 및 대장용종 제외).', define: pg('C', [284, 285]), exclude: pg('C', [283]) },
        tier: {
          line: '1~5종 분류표가 1~7종 분류표로 바뀜.',
          pay: '', excl: '',
          clause: [],
          table: [],
          items: [{ name: '맘모톰', tier: '문장 없음', pages: [] }]
        },
        bundles: [
          { name: '82대', sale: '2021.01~2021.09', clause: pg('C', [514, 515, 516]), parts: pyo('C82') || [{ name: '82대질병수술비', codes: [], pages: pg('C', [514, 515, 516]) }] },
          { name: '32대', sale: '2021.01~2021.09', clause: [old('c_32.png')], parts: pyo('C32') || [{ name: '32대질병관혈수술비', codes: [], pages: [old('c_32.png')] }], limit: limit32('C_523.png', '523') }
        ]
      }),
      simplified: face({
        disease: { line: '갱신형 질병수술비(335간편가입).', define: pg('S', [175, 176]), exclude: pg('S', [174]) },
        tier: { line: '1~5종 분류표가 1~7종 분류표로 바뀜.', pay: '', excl: '', clause: [], table: [], items: [] },
        bundles: [{ name: '32대', sale: '2021.01~2021.09', clause: [old('c_g32.png')], parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('c_g32.png')] }] }]
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
          { name: '131대', parts: pyo('D131') || p131 },
          { name: '32대', parts: pyo('D32') || [{ name: '32대질병관혈수술비', codes: [], pages: [old('d_32.png')] }], limit: limit32('D_456.png', '456') }
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
    meritz_202109: {
      standard: face({
        disease: { pill: '특정5대 제외', line: '질병수술비(특정5대질병 제외).', define: pg('H', [305, 306]), exclude: pg('H', [307, 308]) },
        tier: null,
        bundles: [
          { name: '82대', sale: '2021.09~2022.06', clause: pg('C', [514, 515, 516]), parts: pyo('H82') || [{ name: '82대질병수술비', codes: [], pages: pg('C', [514, 515, 516]) }] },
          { name: '131대', sale: '2022.07~2024.12', clause: pg('D', [446, 447, 448, 449, 450, 451]), parts: pyo('D131') || p131 },
          { name: '32대', sale: '2021.09~2024.12', clause: [old('d_32.png')], parts: pyo('H32') || [{ name: '32대질병관혈수술비', codes: [], pages: [old('d_32.png')] }], limit: limit32('H_544.png', '544') }
        ]
      }),
      simplified: face({
        disease: { pill: '간편', line: '갱신형 질병수술비.', define: pg('P', [183, 184]), exclude: pg('P', [182]) },
        tier: null,
        bundles: [
          { name: '32대', sale: '2021.09~2024.12', clause: [old('p_32.png')], parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('p_32.png')] }] },
          { name: '128대', sale: '2022.10~2024.12', clause: pg('P', [234, 235, 236]), parts: p128 }
        ]
      })
    },
    meritz_202501: {
      standard: face({
        disease: { pill: '특정5대 제외', line: '질병수술비(특정5대질병 제외).', define: [], exclude: pg('E', [855, 856]) },
        tier: {
          pill: 'N62 1종',
          line: '유방의 비대(N62) 수술을 1종으로 적음. 유방절단은 3종.',
          pay: '', excl: '',
          clause: pg('E', [479, 480, 481]),
          table: pg('E', [592, 593, 594, 595]).concat([old('e_n62.png')]),
          rev: {
            rows: [
              { name: '유방비대(N62) 유방절단', before: '3종', after: '1종' },
              { name: '담석증(K80)', before: '3종', after: '2종' },
              { name: '대장용종 내시경절제', before: '2종', after: '1종' }
            ],
            beforePages: pg('B', [947, 949, 951]),
            afterPages: pg('E', [592, 593, 594]),
            shots: [
              { label: '유방비대(N62) 유방절단', before: { src: 'assets/clause_pages/meritz/crops/n62_before.png', page: '947' }, after: { src: 'assets/clause_pages/meritz/crops/n62_after.png', page: '591' } },
              { label: '담석증(K80)', before: { src: 'assets/clause_pages/meritz/crops/k80_before.png', page: '949' }, after: { src: 'assets/clause_pages/meritz/crops/k80_after.png', page: '592' } },
              { label: '대장용종 내시경절제', before: { src: 'assets/clause_pages/meritz/crops/polyp_before.png', page: '951' }, after: { src: 'assets/clause_pages/meritz/crops/polyp_after.png', page: '593' } }
            ]
          },
          items: [
            { name: 'N62', tier: '1종', pages: [old('e_n62.png')].concat(pg('E', [592])) },
            { name: '유방절단', tier: '3종', pages: [old('e_n62.png')] },
            { name: '맘모톰', tier: '1종', pages: [old('e_n62.png')] }
          ]
        },
        bundles: [
          { name: '131대', sale: '2025.01~', clause: pg('E', [862, 863, 864]), parts: pyo('E131') || ['심장질환수술비', '뇌혈관질환수술비', '특정31대질병수술비', '다빈도62대질병수술비', '유방의장애수술비', '편도염수술비', '특정다빈도29대질병수술비', '후각특정질환수술비', '관절염·생식기질환수술비', '치핵수술비', '백내장수술비'].map(name => ({ name, codes: [], pages: pg('E', [862, 863, 864]) })) },
          { name: '32대', sale: '2025.01~', clause: [old('e_32.png')], parts: pyo('E32') || [{ name: '32대질병관혈수술비', codes: [], pages: [old('e_32.png')] }], limit: limit32('E_259.png', '258') }
        ]
      }),
      simplified: face({
        disease: { pill: '간편', line: '갱신형 질병수술비.', define: pg('U', [587]), exclude: pg('U', [588]) },
        tier: {
          pill: 'N62 1종',
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
          { name: '130대', sale: '2025.01~', clause: pg('U', [590, 591]), parts: p130 },
          { name: '32대', sale: '2025.01~', clause: [old('u_32.png')], parts: [{ name: '32대질병관혈수술비', codes: [], pages: [old('u_32.png')] }] }
        ]
      })
    }
  };

  function ex(name, text, codes) { return { name, text, codes: codes || [] }; }
  function pureExcl(edition, congenital, n96) {
    return [
      ex('고의', '피보험자가 고의로 자신을 해친 경우. 심신상실 등으로 자유로운 의사결정이 없으면 지급한다.'),
      ex('수익자의 고의', '보험수익자가 피보험자를 해친 경우. 일부 수익자이면 다른 수익자 분은 지급한다.'),
      ex('계약자의 고의', '계약자가 고의로 피보험자를 해친 경우.'),
      ex('전쟁·폭동', '전쟁, 외국의 무력행사, 혁명, 내란, 사변, 폭동.'),
      ex('정신 및 행동장애', edition + ' 한국표준질병사인분류에 해당하는 질병수술비는 지급하지 않는다.', ['F04~F99']),
      ex('습관성 유산·불임', '여성생식기의 비염증성 장애로 인한 습관성 유산, 불임 및 인공수정 관련 합병증.' + (n96 || ''), ['N96~N98']),
      ex('임신·출산·산후기', '제왕절개를 포함한다.', ['O00~O99']),
      ex(congenital, '변형 및 염색체이상을 포함한다.', ['Q00~Q99']),
      ex('비만', '', ['E66']),
      ex('요실금', '', ['N39.3', 'N39.4', 'R32']),
      ex('치핵 등', '비뇨기계 장애, 직장 또는 항문 관련 질환, 치핵, 항문주위정맥의 혈전증.', ['K60~K62', 'K64']),
      ex('치과질환', '치아우식증, 치아 및 치주질환.', ['K00~K08']),
      ex('건강검진·예방접종·인공유산', '그 목적의 치료는 지급하지 않는다.'),
      ex('불임·보신용 투약', '영양제, 비타민, 호르몬, 보신, 친자 확인, 불임검사·수술·복원, 보조생식, 성장촉진 수술.'),
      ex('단순 피로', '단순한 피로 또는 권태.'),
      ex('피부 미용', '주근깨, 다모, 무모, 백모증, 딸기코, 점, 사마귀, 여드름, 노화로 인한 탈모. 태아 계약의 선천성 비신생물성모반(Q82.5)은 보상한다.', ['Q82.5']),
      ex('발기부전·단순 포경 등', '발기부전, 불감증, 치료를 동반하지 않는 단순 포경, 업무에 지장 없는 검열반. 수면무호흡(G47.3)은 보상한다.', ['G47.3']),
      ex('외모개선 수술', '쌍꺼풀, 코성형, 유방확대·축소, 지방흡입, 주름제거, 시력교정, 외모 목적의 사시교정과 다리정맥류 수술. 안검하수·안검내반, 유방암 재건, 요양급여 대상 여성형 유방증 수술에 수반된 지방흡입은 예외.')
    ];
  }
  const payPure = [
    ex('보험금의 지급사유', '진단확정된 질병의 치료를 직접적인 목적으로 수술하면 보험가입금액을 질병수술비로 지급한다.'),
    ex('수술의 정의', '기구로 생체에 절단·절제 등 조작을 가하는 것. 흡인·천자 등 조치와 신경차단은 제외. 장소는 병원·의원 등.'),
    ex('같은 질병', '같은 질병의 수술은 365일 이내 한 번. 365일이 지난 뒤의 수술은 다시 지급한다.')
  ];
  function opt(id, label, pay, payPages, excl, exclPages, keyCheck, codeList) {
    return { id, label, pay, payPages, excl, exclPages, keyCheck: keyCheck || null, codeList: codeList || null };
  }
  const baseCodes = [
    { name: '정신·행동장애', codes: ['F04~F99'] },
    { name: '습관성 유산·불임', codes: ['N96~N98'] },
    { name: '임신·출산·산후기', codes: ['O00~O99'] },
    { name: '선천기형', codes: ['Q00~Q99'] },
    { name: '비만', codes: ['E66'] },
    { name: '요실금', codes: ['N39.3', 'N39.4', 'R32'] },
    { name: '치핵 등', codes: ['K60~K62', 'K64'] },
    { name: '치과', codes: ['K00~K08'] }
  ];
  const cataractCodes = baseCodes.concat([{ name: '백내장', codes: ['H25~H27'] }]);
  const polypCodes = baseCodes.concat([{ name: '백내장', codes: ['H25~H27'] }, { name: '대장용종', codes: [] }]);
  const cataractKey = { title: '추가 제외', items: [{ name: '백내장', codes: ['H25~H27'] }] };
  const polypKey = { title: '추가 제외', items: [
    { name: '백내장', codes: ['H25~H27'] },
    { name: '대장용종·양성신생물 내시경적 절제', codes: [] }
  ]};
  const fiveKey = { title: '특정5대 추가 제외', numbered: true, items: [
    { name: '대장용종·양성신생물 내시경적 절제', codes: [] },
    { name: '백내장', codes: ['H25~H27'] },
    { name: '후각특정질환', codes: ['J30', 'J31', 'J33', 'J34'] },
    { name: '특정피부질환', codes: ['L72', 'L84'] },
    { name: '혈관종·림프관종', codes: ['D18'] }
  ]};
  const five = [
    ex('대장 용종·양성신생물의 내시경 절제', '특정5대질병으로 이 수술비는 지급하지 않는다.'),
    ex('백내장', '노년백내장, 기타 백내장, 수정체의 기타 장애.', ['H25', 'H26', 'H27']),
    ex('혈관운동성 및 알레르기성 비염', '', ['J30']),
    ex('만성 비염·비인두염·인두염', '', ['J31']),
    ex('코폴립', '', ['J33']),
    ex('코 및 비동의 기타 장애', '', ['J34']),
    ex('모낭낭', '피부 및 피하조직의 모낭낭.', ['L72']),
    ex('티눈 및 굳은살', '', ['L84']),
    ex('혈관종 및 림프관종', '모든 부위의 혈관종 및 림프관종.', ['D18'])
  ];
  const F = window.MERITZ_FACE;
  const n96 = ' 보장개시일부터 2년이 지난 뒤에 생긴 경우는 보상한다.';
  F.meritz_201912.standard.disease.options = [
    opt('pure', '질병수술비', payPure, pg('A', [350, 351, 352]), pureExcl('제7차', '선천성기형', ''), pg('A', [350, 351, 352]), null, baseCodes),
    opt('cataract', '백내장 제외', [ex('지급 범위', '백내장을 뺀 질병의 치료 목적 수술에 보험가입금액을 지급한다.')], pg('A', [289, 290]), pureExcl('제7차', '선천성기형', '').concat([ex('백내장', '이 특약의 질병에서 백내장을 뺀다.', ['H25~H27'])]), pg('A', [289, 290]), cataractKey, baseCodes)
  ];
  F.meritz_202011.standard.disease.options = [
    opt('pure', '질병수술비', payPure, pg('B', [339, 340, 341]), pureExcl('제7차', '선천성기형', ''), pg('B', [339, 340, 341]), null, baseCodes),
    opt('polyp', '백내장·대장용종 제외', [ex('지급 범위', '백내장과 대장용종을 뺀 질병의 치료 목적 수술에 보험가입금액을 지급한다.')], pg('B', [282, 283]), pureExcl('제7차', '선천성기형', '').concat([ex('백내장', '', ['H25~H27']), ex('대장용종', '대장의 용종 또는 대장의 양성신생물의 내시경적 절제입니다.')]), pg('B', [282, 283]), polypKey, baseCodes)
  ];
  F.meritz_202101.standard.disease.options = [
    opt('pure', '질병수술비', payPure, pg('C', [340, 341, 342]), pureExcl('제8차', '선천기형', ''), pg('C', [340, 341, 342]), null, baseCodes),
    opt('polyp', '백내장·대장용종 제외', [ex('지급 범위', '백내장과 대장용종을 뺀 질병의 치료 목적 수술에 보험가입금액을 지급한다.')], pg('C', [283, 284, 285]), pureExcl('제8차', '선천기형', '').concat([ex('백내장', '', ['H25~H27']), ex('대장용종', '대장의 용종 또는 대장의 양성신생물의 내시경적 절제입니다.')]), pg('C', [283, 284, 285]), polypKey, baseCodes)
  ];
  F.meritz_202109.standard.disease.options = [
    opt('pure', '질병수술비', payPure, pg('H', [363, 364, 365]), pureExcl('제8차', '선천기형', ''), pg('H', [363, 364, 365]), null, baseCodes),
    opt('five', '특정5대 제외', [ex('지급 범위', '특정5대질병을 뺀 질병의 치료 목적 수술에 보험가입금액을 지급한다.')], pg('H', [305, 306, 307, 308]), pureExcl('제8차', '선천기형', '').concat(five), pg('H', [305, 306, 307, 308]), fiveKey, baseCodes)
  ];
  F.meritz_202501.standard.disease.options = [
    opt('pure', '질병수술비', payPure, pg('E', [859, 860]), pureExcl('제8차', '선천기형', n96), pg('E', [859, 860]), null, baseCodes),
    opt('five', '특정5대 제외', [ex('지급 범위', '특정5대질병을 뺀 질병의 치료 목적 수술에 보험가입금액을 지급한다.')], pg('E', [855, 856]), pureExcl('제8차', '선천기형', n96).concat(five), pg('E', [855, 856]), fiveKey, baseCodes)
  ];
})();
