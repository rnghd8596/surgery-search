/* ==========================================================================
   보험비서 - 회사별·시기별 공식 약관 및 별표 수술분류표 데이터베이스
   - 손해보험 10개사 & 생명보험 10개사 (약어 20개 매핑 완비)
   - 가입시기별 개정이슈 포인트 하이라이트 (개정 팩트 중심 엄정 정렬)
   - 표준체 / 유병자(간편) 분기 (간편 미판매 시 해당없음 명확 안내)
   - 질병수술비 (약관조항보기 + 보상제외조항보기 2칸 정형 규격)
   - 종수술비 (약관조항보기 + 별표수술분류표 + 개정 전/후 실제약관 사진 뷰어)
   - N대질병수술비 (약관조항보기 + 전수 KCD 질병코드 분류표)
   - 생명보험 성인주요질환/성인병수술특약 질병코드 전수 수록
   - 현대해상 암수술 4종 하향 개정 핵심 강조
   ========================================================================== */

window.POLICY_CLAUSES_DATA = {
  // 1. 손해보험사 (10개사)
  nonLife: [
    {
      id: 'meritz',
      name: '메리츠화재',
      shortName: '멜츠',
      aliases: ['멜츠', '메리츠', '메리츠화재'],
      logo: '메',
      color: '#d97706',
      desc: '올바른 종합보험 · 또또암 · 간편한 3.5.5',
      periods: [
        {
          id: 'meritz_2024_12',
          periodStr: '2024년 12월 ~ 현재 (최신 개정약관)',
          hasRevision: true,
          revBadge: '1-5종 수술분류표Ⅱ 개정 (여유증 1종, 담석증 2종 하향)',
          revSummary: '메리츠화재 2024년 12월 1-5종 수술분류표Ⅱ 개정으로 유방비대(여유증 N62)가 1종으로, 담석증(K80) 복강경절제가 2종으로 하향 분류되었습니다. 개정 전 계약은 표준 3종으로 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체 종합보험)',
              riders: {
                basic: {
                  title: '질병수술비 (보통약관/특별약관)',
                  summary: '질병 치료 목적의 절제·절단 등 수술 시 가입금액 지급. 단순 흡인·천자·신경차단·미용성형 면책.',
                  inclusion: {
                    title: '질병수술비 지급기준 및 수술의 정의',
                    quote: `제1조(보험금의 지급사유) 회사는 피보험자가 보험기간 중에 질병으로 진단확정되고 그 질병의 치료를 직접적인 목적으로 수술을 받은 경우에는 매 수술시마다 질병수술비를 지급합니다.
제2조(수술의 정의와 장소) ① 이 특약에서 '수술'이라 함은 의사에 의하여 치료가 필요하다고 인정된 경우로서 의료기관에서 의사의 관리 하에 기구를 사용하여 생체(生體)에 절단(切斷), 절제(切除) 등의 조작을 가하는 것을 말합니다.
② 신의료기술평가위원회로부터 안전성과 유효성을 인정받은 최신의료기법을 포함합니다.`,
                    clauses: [
                      { title: '제1조(보험금의 지급사유)', text: '피보험자가 질병의 치료를 직접 목적으로 수술을 받은 경우 매 수술시마다 정액 지급합니다.' },
                      { title: '제2조(수술의 정의)', text: '기구를 사용하여 생체에 절단, 절제 등의 조작을 가하는 것을 말하며, 신의료기술을 포함합니다.' },
                      { title: '제3조(재수술 인정)', text: '동일 질병이라도 수술 후 365일이 경과하여 재수술을 받은 경우에는 새로운 수술로 보아 각각 지급합니다.' }
                    ],
                    imgSrc: 'assets/clause_imgs/meritz_basic_inclusion.png'
                  },
                  exclusion: {
                    title: '질병수술비 보상제외 조항 (수술 제외 항목 및 면책사유)',
                    quote: `제2조 제3항 (수술에서 제외하는 사항)
1. 흡인(吸引, 바늘이나 카테터로 체액이나 고름을 빨아들이는 것)
2. 천자(穿刺, 바늘이나 카테터로 찔러서 조직이나 액체를 뽑아내는 것)
3. 신경차단(Nerve Block)
4. 미용성형 목적의 수술
5. 피임 목적의 수술, 불임검사 및 인공수정
제4조(보험금을 지급하지 않는 사유)
1. 피보험자, 보험수익자, 계약자의 고의 또는 자해
2. 선천성 뇌질환 및 선천성 기형(Q코드, 단 선천이상수술특약 가입 시 예외)
3. 치과 처치, 치주질환 및 치아보철치료 목적의 잇몸/치조골 처치(K00~K08)
4. 한방 시술(침, 뜸, 부항 등)`,
                    clauses: [
                      { title: '흡인·천자·신경차단 제외', text: '단순 배액술, 주사치료, 약물주입, 통증 차단술은 수술의 정의에서 제외되어 면책됩니다.' },
                      { title: '미용·성형·피임 목적 제외', text: '외모 개선 목적의 성형, 쌍꺼풀, 지방흡입 및 피임·불임 관련 시술은 보상하지 않습니다.' },
                      { title: '치과·한방 및 정상분만 제외', text: '치과 보철 처치, 한방 시술 및 정상 자연분만은 질병수술비에서 면책됩니다.' }
                    ],
                    imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png'
                  }
                },
                tier: {
                  title: '1~5종 수술특약 (1-5종 수술분류표Ⅱ)',
                  summary: '2024년 12월 개정 1-5종 수술분류표Ⅱ 적용. 제3항 유방절단술에서 여유증 1종 하향, 담석증 2종 하향.',
                  clauseBody: {
                    title: '1~5종 수술특약 약관 본문',
                    quote: `제1조(수술의 정의 및 장소) 생체에 절단, 절제 등의 조작을 가하는 것(신의료기술 포함, 흡인·천자·주사치료 제외).
제2조(보험금의 지급사유) 1~5종 수술분류표에 정한 수술을 받았을 때 종별 보험가입금액 지급.
제3조(동일부위 동시수술) 하나의 질병으로 2가지 이상의 수술을 동시에 받은 때에는 가장 높은 1개 종수술비만 지급합니다.`,
                    clauses: [
                      { title: '제1조(수술의 정의)', text: '의사가 기구를 사용하여 절제, 절단 등의 조작을 가하는 것.' },
                      { title: '제2조(지급기준)', text: '별표 1~5종 수술분류표Ⅱ에 따라 1종~5종 차등 지급.' },
                      { title: '제3조(동일부위 지급제한)', text: '동일 부위 또는 동일 체강 내 동시 수술 시 가장 높은 등급 1회만 지급.' }
                    ]
                  },
                  tableBody: {
                    title: '별표 [1-5종 수술분류표Ⅱ] (2024.12 개정 전문)',
                    headers: ['번호', '수술명 (약관 본문)', '해당 종수', '비고 및 삭감방어 팁'],
                    rows: [
                      ['1', '피부 및 피하조직의 양성종양 절제술 (지방종 등)', '1종', '근육층 침범 없는 단순 절제 1종'],
                      ['2', '외이도, 중이, 고막 형성술 및 환기관 삽입술', '2종', '환기관 삽입 1종 또는 2종 약관 확인'],
                      ['3', '유방절단수술 (유방선 조직 절제·절단)', '3종', '⚠️ 단, 여성형유방증(여유증 N62) 수술은 1종으로 하향 분류 (2024.12 개정)'],
                      ['4', '내시경적 상부/하부 소화관 폴립절제술', '1종', '⚠️ 2020.04 이후 대장용종 1종 하향'],
                      ['13', '복강경하 담낭절제술 (담석증 K80 등)', '2종', '⚠️ 2024.12 이전 표준 3종 ➔ 2024.12 개정 2종 하향'],
                      ['16', '복강경 충수절제술 (맹장염)', '3종', '표준 3종 정상 유지'],
                      ['33', '골이식술 (치조골 이식술 포함)', '2종', '단순 임플란트 식립 제외, 치조골 뼈이식 2종'],
                      ['36', '개복/복강경 복강내 장기 절제술', '3종', '개복 복강경 담낭 3종(표준) vs 개정분류표 2종 주의'],
                      ['43', '외이음부 관혈수술 (바르톨린선 조대술 등)', '1종', '외음부 관혈적 조대술 1종'],
                      ['54', '제왕절개만출술', '1종', '표준 1종 지급'],
                      ['67', '경요도 전립선 절제술 (TURP) / 유로리프트', '2종 / 1~2종', 'TURP 2종, 결찰술 약관 대조'],
                      ['80', '악성신생물(암) 근치수술 (위암, 대장암, 자궁암, 유방암 등)', '5종', '관혈적 악성종양 근치절제술 5종']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_tier_rev_post.png',
                  hasRevPhotoButtons: true,
                  revPhotos: [
                    { label: '📷 2024.12 개정 후 약관 사진 (여유증 1종, 담석 2종)', src: 'assets/clause_imgs/meritz_tier_rev_post.png', isPost: true },
                    { label: '📷 2024.12 개정 전 약관 사진 (표준 3종 지급)', src: 'assets/clause_imgs/meritz_tier_rev_pre.png', isPost: false }
                  ]
                },
                ndai: {
                  title: '112대/120대 N대 질병수술비 특약',
                  summary: '특정 5대, 중대 10대, 다빈도 30대 등 군별 차등 지급. 관혈 100% / 비관혈 50% 감액 조항 탑재.',
                  clauseBody: {
                    title: 'N대 질병수술비 약관 본문',
                    quote: `제1조(보험금의 지급사유) 보험기간 중 N대 질병분류표에 정한 질병으로 진단확정되고, 그 치료를 직접 목적으로 수술을 받은 경우 군별 가입금액 지급.
제2조(관혈/비관혈 수술의 정의)
1. 관혈(Open)수술: 병변 부위를 육안으로 직접 보면서 수술하기 위해 피부나 점막을 절개하는 수술
2. 비관혈(Non-open)수술: 내시경, 복강경, 흉강경, 카테터 등을 이용하여 절개 범위를 최소화하는 수술 (비관혈 수술 시 가입금액의 50% 지급)`,
                    clauses: [
                      { title: '제1조(지급사유)', text: 'N대 질병으로 진단확정 후 수술 시 질병군별 정액 차등 지급.' },
                      { title: '제2조(관혈/비관혈 감액)', text: '비관혈(내시경·카테터 등) 수술 시 관혈 가입금액의 50% 지급.' },
                      { title: '제3조(1년 미만 50% 감액)', text: '계약일로부터 1년 미만 수술 시 해당 지급액의 50% 지급.' }
                    ]
                  },
                  tableBody: {
                    title: '별표 [112대/120대 N대 질병분류표 및 보장 질병코드 전문]',
                    headers: ['질병군 분류', '대상 주요 질병명', '포함 KCD 질병코드 (전수)', '보장 한도 (관혈/비관혈)'],
                    rows: [
                      ['특정 5대질병', '뇌혈관질환, 심장질환, 간질환, 췌장질환, 폐질환', 'I60~I69, I20~I25, K70~K76, K85~K86, J40~J47, J84, J96', '관혈 100% / 비관혈 50%'],
                      ['중대 10대질병', '만성신부전, 당뇨병, 고혈압, 동맥경화, 갑상선질환, 녹내장, 위십이지장궤양', 'N17~N19, E10~E14, I10~I15, I70~I79, E00~E07, H40, H42, K25~K28, A15~A19', '관혈 100% / 비관혈 50%'],
                      ['다빈도 30대질병', '담석증, 충수염, 탈장, 치핵, 비뇨기결석, 전립선비대, 편도염, 중이염', 'K80~K83, K35~K37, K40~K46, K64, N20~N23, N40, J35, H65~H75', '정액 지급 (연간 1회 한)'],
                      ['부인과 10대질병', '자궁근종, 자궁내막증, 난소낭종, 골반염, 여성생식기 폴립', 'D25~D28, N80~N85, N70~N77, N83, N84', '정액 지급'],
                      ['생활 40대질병', '비염, 부비동염, 하지정맥류, 관절염, 안면신경마비, 척추디스크', 'J30~J34, I83, M15~M19, M48, M50~M51, G51', '정액 지급'],
                      ['백내장/안질환', '노년백내장, 기타 백내장 (다초점 인공수정체 삽입)', 'H25~H28 (단, 단순 시력교정 목적 비급여 렌즈 주의)', '정액 지급 (좌/우 분리)']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            },
            simplified: {
              name: '간편 (유병자 3.5.5 / 3.10.5)',
              riders: {
                basic: {
                  title: '간편고지 질병수술비 특별약관',
                  summary: '유병자 전용 질병수술비. 표준체와 동일한 수술의 정의 및 흡인·천자 면책 적용.',
                  inclusion: {
                    title: '간편고지 질병수술비 지급기준',
                    quote: '제1조(보험금의 지급사유) 회사는 유병자 피보험자가 질병의 치료를 직접 목적으로 수술을 받은 때 매 수술시마다 간편 질병수술비를 지급합니다.',
                    clauses: [
                      { title: '제1조(지급사유)', text: '간편심사 통과 계약자의 질병수술 시 회당 정액 지급.' },
                      { title: '제2조(기왕증 보장)', text: '가입 전 3개월/5년 고지사항 외 기존 질환이라도 인수 후 발생한 수술 정상 보장.' }
                    ],
                    imgSrc: 'assets/clause_imgs/meritz_basic_inclusion.png'
                  },
                  exclusion: {
                    title: '간편 질병수술비 보상제외 조항',
                    quote: '표준체 질병수술비 면책조항과 동일하게 단순 흡인, 천자, 신경차단술, 미용성형, 피임불임은 보상하지 않습니다.',
                    clauses: [
                      { title: '흡인·천자 면책', text: '주사 바늘 배액술, 신경차단술 등 단순 처치 제외.' }
                    ],
                    imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png'
                  }
                },
                tier: {
                  title: '간편 1~5종 수술특약 (수술분류표Ⅱ)',
                  summary: '간편 가입자 대상 1~5종 수술특약. 2024.12 개정분류표Ⅱ 적용(여유증 1종, 담석증 2종).',
                  clauseBody: {
                    title: '간편 1~5종 수술특약 약관 본문',
                    quote: '표준체 1~5종 약관과 동일한 종별 분류 적용 및 동일부위 동시수술 시 최고 종수 1회 지급.',
                    clauses: [
                      { title: '제1조(종별 지급기준)', text: '별표 1~5종 수술분류표Ⅱ에 따라 등급별 가입금액 차등 지급.' }
                    ]
                  },
                  tableBody: {
                    title: '별표 [간편 1-5종 수술분류표Ⅱ]',
                    headers: ['번호', '수술명', '해당 종수', '비고'],
                    rows: [
                      ['3', '유방절단수술 (여유증 N62)', '1종', '2024.12 개정 1종'],
                      ['4', '대장용종 폴립절제술', '1종', '1종 지급'],
                      ['13', '복강경 담낭절제술 (담석증 K80)', '2종', '2024.12 개정 2종'],
                      ['80', '악성신생물(암) 근치수술', '5종', '5종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_tier_rev_post.png'
                },
                ndai: {
                  title: '간편 N대 질병수술비 특약',
                  summary: '간편 유병자 대상 N대 질병수술비. 관혈 100% / 비관혈 50% 감액 조항 탑재.',
                  clauseBody: {
                    title: '간편 N대 질병수술비 약관 본문',
                    quote: 'N대 질병으로 진단확정 후 수술 시 군별 가입금액 지급(비관혈 50%).',
                    clauses: [
                      { title: '제1조(지급사유)', text: '질병군별 가입금액 정액 지급.' }
                    ]
                  },
                  tableBody: {
                    title: '별표 [간편 N대 질병분류표]',
                    headers: ['질병군', '대상 질병', '포함 KCD 질병코드', '보장 내용'],
                    rows: [
                      ['특정 5대', '뇌·심·간·췌·폐질환', 'I60~I69, I20~I25, K70~K76 등', '관혈 100% / 비관혈 50%'],
                      ['다빈도 30대', '담석증, 탈장, 치핵, 충수염', 'K80, K40, K64, K35 등', '정액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        },
        {
          id: 'meritz_2020_04',
          periodStr: '2020년 4월 ~ 2024년 11월',
          hasRevision: true,
          revBadge: '대장용종 1종 하향 개정 (여유증 3종, 담석 3종 표준기)',
          revSummary: '2020년 4월 개정으로 대장용종(내시경 폴립절제술)이 2종에서 1종으로 하향되었으나, 유방비대(여유증) 및 담석증 복강경절제술은 3종으로 100% 전액 지급되던 황금기 계약입니다.',
          types: {
            standard: {
              name: '일반 (표준체 종합보험)',
              riders: {
                basic: {
                  title: '질병수술비 (보통약관)',
                  summary: '질병 치료 목적 수술 시 회당 정액 지급. 단순 흡인·천자 면책.',
                  inclusion: {
                    title: '질병수술비 약관 본문',
                    quote: '제1조(보험금의 지급사유) 피보험자가 질병의 치료를 직접 목적으로 수술을 받은 경우 매 수술시마다 지급합니다.',
                    clauses: [{ title: '제1조(지급사유)', text: '매 수술시마다 정액 지급.' }],
                    imgSrc: 'assets/clause_imgs/meritz_basic_inclusion.png'
                  },
                  exclusion: {
                    title: '질병수술비 보상제외 조항',
                    quote: '흡인, 천자, 신경차단, 미용성형, 피임불임 시술 면책.',
                    clauses: [{ title: '면책사유', text: '단순 배액술, 신경차단술 제외.' }],
                    imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png'
                  }
                },
                tier: {
                  title: '1~5종 수술특약 (표준 1-5종 분류표)',
                  summary: '대장용종 1종 하향 적용. 여유증 3종, 담석증 3종 전액 지급.',
                  clauseBody: {
                    title: '1~5종 수술특약 약관 본문',
                    quote: '별표 1~5종 수술분류표에 정한 수술 시 종별 금액 지급.',
                    clauses: [{ title: '지급기준', text: '1종~5종 차등 지급.' }]
                  },
                  tableBody: {
                    title: '별표 [표준 1-5종 수술분류표] (2020.04~2024.11)',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['3', '유방절단수술 (여유증 N62 포함)', '3종', '💎 여성형유방증 유선절제 3종 100% 정상 지급'],
                      ['4', '내시경 소화관 폴립절제술 (대장용종)', '1종', '⚠️ 2020.04 이후 1종 하향'],
                      ['13', '복강경하 담낭절제술 (담석증 K80)', '3종', '💎 담석증 복강경절제 3종 100% 정상 지급'],
                      ['80', '악성신생물(암) 근치수술', '5종', '악성종양 5종 정상 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_tier_rev_pre.png'
                },
                ndai: {
                  title: '77대/88대 N대 질병수술비 특약',
                  summary: 'N대 질병분류표에 정한 질병 수술 시 정액 지급.',
                  clauseBody: {
                    title: 'N대 질병수술비 약관',
                    quote: 'N대 질병 수술 시 군별 차등 지급.',
                    clauses: [{ title: '지급사유', text: '정액 지급.' }]
                  },
                  tableBody: {
                    title: '별표 [N대 질병분류표]',
                    headers: ['질병군', '대상 질병', '포함 KCD 질병코드', '보장 내용'],
                    rows: [
                      ['특정 질병', '뇌혈관·심장·간·췌장·폐질환', 'I60~I69, I20~I25, K70~K76 등', '최고 한도 지급'],
                      ['다빈도 질병', '담석증, 탈장, 치핵, 충수염', 'K80, K40, K64, K35 등', '정액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        },
        {
          id: 'meritz_2020_03_prior',
          periodStr: '2020년 3월 이전 (구 1-5종 황금기)',
          hasRevision: true,
          revBadge: '대장용종 2종, 여유증 3종, 담석 3종 100% 전액 지급 황금기',
          revSummary: '2020년 3월 이전 계약은 대장용종 절제술이 2종으로 지급되고, 여유증 3종, 담석증 3종까지 전액 보장되던 명실상부한 최상급 황금기 계약입니다.',
          types: {
            standard: {
              name: '일반 (표준체 종합보험)',
              riders: {
                basic: {
                  title: '질병수술비 (보통약관)',
                  summary: '질병 수술 시 매회 정액 지급.',
                  inclusion: {
                    title: '질병수술비 약관 본문',
                    quote: '질병 치료 직접 목적 수술 시 회당 지급.',
                    clauses: [{ title: '지급사유', text: '매 수술시마다 지급.' }],
                    imgSrc: 'assets/clause_imgs/meritz_basic_inclusion.png'
                  },
                  exclusion: {
                    title: '질병수술비 면책조항',
                    quote: '흡인·천자 면책.',
                    clauses: [{ title: '면책사유', text: '단순 처치 제외.' }],
                    imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png'
                  }
                },
                tier: {
                  title: '구 1~5종 수술특약 (황금기 약관)',
                  summary: '대장용종 2종, 여유증 3종, 담석증 3종 전액 지급 약관.',
                  clauseBody: {
                    title: '구 1~5종 수술특약 본문',
                    quote: '별표 수술분류표에 정한 수술 종별 지급.',
                    clauses: [{ title: '지급기준', text: '종별 차등 지급.' }]
                  },
                  tableBody: {
                    title: '별표 [구 1-5종 수술분류표] (2020.03 이전)',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['3', '유방절단수술 (여유증 N62)', '3종', '💎 여유증 3종 100% 지급'],
                      ['4', '내시경 소화관 폴립절제술 (대장용종)', '2종', '💎 대장용종 2종 수술비 100% 전액 지급'],
                      ['13', '복강경하 담낭절제술 (담석증 K80)', '3종', '💎 담석증 3종 100% 지급'],
                      ['80', '악성신생물(암) 근치수술', '5종', '악성종양 5종 정상 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_tier_rev_pre.png'
                },
                ndai: {
                  title: '64대 N대 질병수술비 특약',
                  summary: '64대 질병 수술비 정액 지급.',
                  clauseBody: {
                    title: '64대 질병수술비 약관',
                    quote: '64대 질병 수술 시 가입금액 지급.',
                    clauses: [{ title: '지급사유', text: '정액 지급.' }]
                  },
                  tableBody: {
                    title: '별표 [64대 질병분류표]',
                    headers: ['질병군', '대상 질병', '포함 KCD 질병코드', '보장 내용'],
                    rows: [
                      ['3대 질병', '뇌혈관·심장·간질환', 'I60~I69, I20~I25, K70~K76', '최고 한도 지급'],
                      ['다빈도 질병', '담석증, 탈장, 치핵, 충수염', 'K80, K40, K64, K35 등', '정액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'hyundai',
      name: '현대해상',
      shortName: '현대',
      aliases: ['현대', '현대해상'],
      logo: '현',
      color: '#0284c7',
      desc: '퍼펙트플러스종합보험 · 굿앤굿어린이 · 간편한 3.5.5',
      periods: [
        {
          id: 'hyundai_2026_01',
          periodStr: '2024년 ~ 현재 (최신 개정약관)',
          hasRevision: true,
          revBadge: '암수술 일부 4종 하향 개정 및 체외충격파 1종 적용',
          revSummary: '현대해상 1-5종 수술특약 개정으로 과거 5종으로 전액 지급되던 악성신생물(암) 수술 중 일부 비관혈적 수술 및 복강경·내시경 암수술이 4종으로 하향 조정되었습니다. 체외충격파쇄석술은 1종이 적용됩니다.',
          types: {
            standard: {
              name: '일반 (표준체 종합보험)',
              riders: {
                basic: {
                  title: '질병수술비 (보통약관/특별약관)',
                  summary: '질병 치료 직접 목적 수술 시 회당 지급. 흡인·천자·신경차단 면책.',
                  inclusion: {
                    title: '질병수술비 약관 본문',
                    quote: '제1조(보험금의 지급사유) 질병의 치료를 직접 목적으로 기구를 사용하여 절단, 절제 등의 조작을 가한 때 회당 지급.',
                    clauses: [{ title: '제1조(지급사유)', text: '매 수술시마다 지급.' }],
                    imgSrc: 'assets/clause_imgs/hyundai_p464.png'
                  },
                  exclusion: {
                    title: '질병수술비 보상제외 조항',
                    quote: '흡인, 천자, 신경차단, 미용성형, 피임불임 제외.',
                    clauses: [{ title: '면책사유', text: '단순 처치 면책.' }],
                    imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png'
                  }
                },
                tier: {
                  title: '1~5종 수술특약 (개정 1-5종 수술분류표)',
                  summary: '암수술 일부 4종 하향 조정 주의. 체외충격파 1종, 담석증 3종 유지.',
                  clauseBody: {
                    title: '1~5종 수술특약 약관 본문',
                    quote: '별표 1~5종 수술분류표에 정한 수술을 받았을 때 종별 보험가입금액 지급.',
                    clauses: [
                      { title: '제1조(지급기준)', text: '별표 분류표에 따라 등급별 차등 지급.' },
                      { title: '제2조(동일부위 제한)', text: '동일 질병 2종류 수술 시 최고 종수 1회만 지급.' }
                    ]
                  },
                  tableBody: {
                    title: '별표 [1-5종 수술분류표] (암수술 4종 하향 개정 조항 전문)',
                    headers: ['번호', '수술명 (약관 본문)', '해당 종수', '비고 및 삭감방어 팁'],
                    rows: [
                      ['1', '피부 및 피하 양성종양 절제술', '1종', '단순 절제 1종'],
                      ['4', '내시경 소화관 폴립절제술 (대장용종)', '1종', '1종 지급'],
                      ['13', '복강경하 담낭절제술 (담석증 K80)', '3종', '현대해상 복강경 담낭절제 3종 유지'],
                      ['22', '체외충격파쇄석술 (요로결석 N20 등)', '1종', '⚠️ 2018.06 이후 1종 하향 (개정 전 2종)'],
                      ['33', '골이식술 (치조골 뼈이식 포함)', '2종', '치조골 뼈이식 2종 인정'],
                      ['80', '악성신생물(암) 근치수술 (관혈적 절제)', '5종', '개흉, 개복 등 관혈적 근치절제술 5종 정상 지급'],
                      ['80-1', '악성신생물(암) 수술 (비관혈/내시경적 절제 일부)', '4종', '⚠️ [핵심 개정] 비관혈 암수술 및 일부 악성종양 절제 4종 하향 분류 주의!']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/hyundai_tier_p464.png'
                },
                ndai: {
                  title: '119대/124대 N대 질병수술비 특약',
                  summary: '119대 질병 분류표에 따른 정액 차등 지급. 관혈 100% / 비관혈 50%.',
                  clauseBody: {
                    title: 'N대 질병수술비 약관',
                    quote: 'N대 질병 수술 시 군별 가입금액 지급.',
                    clauses: [{ title: '지급사유', text: '정액 차등 지급.' }]
                  },
                  tableBody: {
                    title: '별표 [119대 N대 질병분류표 및 KCD 질병코드]',
                    headers: ['질병군', '대상 질병', '포함 KCD 질병코드 (전수)', '보장 한도'],
                    rows: [
                      ['특정 5대', '뇌혈관, 심장, 간, 췌장, 폐질환', 'I60~I69, I20~I25, K70~K76, K85~K86, J40~J47', '관혈 100% / 비관혈 50%'],
                      ['중대 10대', '신부전, 당뇨병, 고혈압, 동맥경화, 갑상선', 'N17~N19, E10~E14, I10~I15, I70~I79, E00~E07', '관혈 100% / 비관혈 50%'],
                      ['다빈도 30대', '담석증, 충수염, 탈장, 치핵, 비뇨기결석', 'K80~K83, K35~K37, K40~K46, K64, N20~N23', '정액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            },
            simplified: {
              name: '간편 (유병자 3.5.5)',
              riders: {
                basic: {
                  title: '간편 질병수술비 특약',
                  summary: '유병자 전용 질병수술비.',
                  inclusion: { title: '약관 본문', quote: '질병 수술 시 회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/hyundai_p464.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 제외.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '간편 1~5종 수술특약',
                  summary: '간편 1~5종 수술비. 암수술 일부 4종 분류.',
                  clauseBody: { title: '약관 본문', quote: '종별 차등 지급.', clauses: [{ title: '지급기준', text: '등급별 지급.' }] },
                  tableBody: {
                    title: '별표 [간편 1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '비고'],
                    rows: [
                      ['13', '복강경 담낭절제술', '3종', '3종 지급'],
                      ['22', '체외충격파쇄석술', '1종', '1종 지급'],
                      ['80', '암수술 (관혈/비관혈)', '5종 / 4종', '일부 4종 하향']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/hyundai_tier_p464.png'
                },
                ndai: {
                  title: '간편 N대 질병수술비',
                  summary: 'N대 질병 수술 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [간편 N대 질병분류표]',
                    headers: ['질병군', '대상 질병', '질병코드', '보장'],
                    rows: [['5대 질병', '뇌·심·간·췌·폐', 'I60~I69, I20~I25 등', '지급']]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        },
        {
          id: 'hyundai_2018_06',
          periodStr: '2018년 6월 ~ 2023년 12월',
          hasRevision: true,
          revBadge: '체외충격파쇄석술 1종 하향 개정 (암수술 5종 유지기)',
          revSummary: '2018년 6월 개정으로 체외충격파쇄석술이 2종에서 1종으로 하향 분류되었습니다. 악성신생물(암) 근치수술은 5종으로 전액 유지되던 시기입니다.',
          types: {
            standard: {
              name: '일반 (표준체 종합보험)',
              riders: {
                basic: {
                  title: '질병수술비 (보통약관)',
                  summary: '질병 수술 시 회당 정액 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/hyundai_p464.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 제외.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약',
                  summary: '체외충격파 1종 하향. 암수술 5종 유지.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 지급.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['13', '복강경 담낭절제술', '3종', '3종 지급'],
                      ['22', '체외충격파쇄석술', '1종', '2018.06 이후 1종 하향'],
                      ['80', '악성신생물(암) 근치수술', '5종', '💎 암수술 5종 전액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/hyundai_p464.png'
                },
                ndai: {
                  title: '71대 N대 질병수술비',
                  summary: '71대 질병 수술 시 지급.',
                  clauseBody: { title: '약관 본문', quote: '정액 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [71대 분류표]',
                    headers: ['질병군', '대상 질병', '질병코드', '보장'],
                    rows: [['주요 질병', '뇌혈관·심장질환', 'I60~I69, I20~I25', '최고 한도']]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'kbinsure',
      name: 'KB손해보험',
      shortName: '케손',
      aliases: ['케손', '케이비', 'KB손보', 'KB손해보험', 'kb'],
      logo: '케',
      color: '#f59e0b',
      desc: 'KB 5.10.10 플러스종합보험 · 슬기로운 간편',
      periods: [
        {
          id: 'kb_2024_01',
          periodStr: '2024년 ~ 현재 (최신 개정약관)',
          hasRevision: true,
          revBadge: '체외충격파 1종 하향 (대장용종 1종, 담석 3종 유지)',
          revSummary: 'KB손해보험은 체외충격파쇄석술이 1종으로 분류되며, 대장용종 1종, 담석증 복강경절제술 3종, 암수술 5종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체 종합보험)',
              riders: {
                basic: {
                  title: '질병수술비 (보통약관)',
                  summary: '질병 수술 시 회당 정액 지급. 단순 천자·흡인 제외.',
                  inclusion: { title: '약관 본문', quote: '질병 수술 시 회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/kb_p503.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자·신경차단 제외.', clauses: [{ title: '면책사유', text: '단순 처치 제외.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (1-5종 수술분류표)',
                  summary: '체외충격파 1종, 대장용종 1종, 담석증 3종, 암수술 5종 지급.',
                  clauseBody: { title: '약관 본문', quote: '종별 가입금액 차등 지급.', clauses: [{ title: '지급기준', text: '1~5종 지급.' }] },
                  tableBody: {
                    title: '별표 [1-5종 수술분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 안내'],
                    rows: [
                      ['4', '내시경 용종절제술 (대장용종)', '1종', '1종 지급'],
                      ['13', '복강경 담낭절제술 (담석증)', '3종', '3종 지급'],
                      ['22', '체외충격파쇄석술', '1종', '1종 하향'],
                      ['80', '악성신생물(암) 근치수술', '5종', '5종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/kb_p503.png'
                },
                ndai: {
                  title: '112대 N대 질병수술비 특약',
                  summary: '112대 질병 수술 정액 지급. 관혈 100% / 비관혈 50%.',
                  clauseBody: { title: '약관 본문', quote: '군별 가입금액 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [112대 질병분류표 및 KCD 코드]',
                    headers: ['질병군', '대상 질병', '포함 KCD 질병코드', '보장 내용'],
                    rows: [
                      ['특정 5대', '뇌혈관·심장·간·췌장·폐질환', 'I60~I69, I20~I25, K70~K76 등', '관혈 100% / 비관혈 50%'],
                      ['다빈도 30대', '담석증, 충수염, 탈장, 치핵, 결석', 'K80, K35, K40, K64, N20 등', '정액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'dbinsure',
      name: 'DB손해보험',
      shortName: '디손',
      aliases: ['디손', '디비', 'DB손보', 'DB손해보험', 'db'],
      logo: '디',
      color: '#059669',
      desc: '프로미라이프 참좋은훼밀리 · 나에게맞춘간편',
      periods: [
        {
          id: 'db_2026_05',
          periodStr: '2026년 5월 ~ 현재 (최신 개정약관)',
          hasRevision: true,
          revBadge: '여성형유방증(여유증) 2종 하향 개정',
          revSummary: 'DB손해보험 2026년 5월 개정으로 여성형유방증(여유증 N62) 수술이 3종에서 2종으로 하향되었습니다. 개정 전 계약은 표준 3종이 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체 종합보험)',
              riders: {
                basic: {
                  title: '질병수술비 (보통약관)',
                  summary: '질병 치료 목적 수술 시 회당 정액 지급.',
                  inclusion: { title: '약관 본문', quote: '질병 수술 시 회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/db_tier_p.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 제외.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (개정 수술분류표)',
                  summary: '여유증 2종 하향 개정 적용. 담석증 3종, 암수술 5종 유지.',
                  clauseBody: { title: '약관 본문', quote: '종별 차등 지급.', clauses: [{ title: '지급기준', text: '1~5종 지급.' }] },
                  tableBody: {
                    title: '별표 [1-5종 수술분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 안내'],
                    rows: [
                      ['3', '유방절단수술 (여유증 포함)', '3종', '⚠️ 2026.05 이후 여유증 2종 하향 (개정 전 3종)'],
                      ['4', '내시경 소화관 폴립절제술 (대장용종)', '1종', '1종 지급'],
                      ['13', '복강경 담낭절제술 (담석증 K80)', '3종', '3종 지급'],
                      ['80', '악성신생물(암) 근치수술', '5종', '5종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/db_tier_p.png'
                },
                ndai: {
                  title: '119대 N대 질병수술비 특약',
                  summary: '119대 질병 수술 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [119대 질병분류표 및 KCD 코드]',
                    headers: ['질병군', '대상 질병', '포함 KCD 코드', '보장'],
                    rows: [
                      ['특정 5대', '뇌혈관·심장·간·췌장·폐', 'I60~I69, I20~I25 등', '관혈 100% / 비관혈 50%'],
                      ['다빈도 30대', '담석, 충수염, 탈장, 치핵, 결석', 'K80, K35, K40, K64 등', '정액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'samsungfire',
      name: '삼성화재',
      shortName: '삼화',
      aliases: ['삼화', '삼성화재'],
      logo: '삼',
      color: '#2563eb',
      desc: '마이헬스파트너 · 새로고침 간편',
      periods: [
        {
          id: 'samsung_2024_01',
          periodStr: '2024년 ~ 현재 (최신 약관)',
          hasRevision: true,
          revBadge: '대장용종 1종 하향 (담석 3종, 여유증 3종, 암수술 5종 유지)',
          revSummary: '삼성화재 1-5종 수술특약은 대장용종 1종 하향이 적용되어 있으며, 담석증 3종, 여유증 3종, 암수술 5종이 표준 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체 종합보험)',
              riders: {
                basic: {
                  title: '질병수술비 (보통약관)',
                  summary: '질병 수술 시 회당 정액 지급.',
                  inclusion: { title: '약관 본문', quote: '질병 수술 회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/samsung_tier_p.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 제외.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약',
                  summary: '담석 3종, 여유증 3종, 암수술 5종 지급.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '1~5종 지급.' }] },
                  tableBody: {
                    title: '별표 [1-5종 수술분류표]',
                    headers: ['번호', '수술명', '해당 종수', '비고'],
                    rows: [
                      ['3', '유방절단수술 (여유증 포함)', '3종', '3종 지급'],
                      ['4', '내시경 용종절제술 (대장용종)', '1종', '1종 지급'],
                      ['13', '복강경 담낭절제술 (담석증)', '3종', '3종 지급'],
                      ['80', '악성신생물(암) 근치수술', '5종', '5종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/samsung_tier_p.png'
                },
                ndai: {
                  title: '114대 N대 질병수술비 특약',
                  summary: '114대 질병 수술 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 가입금액 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [114대 질병분류표 및 KCD 코드]',
                    headers: ['질병군', '대상 질병', '포함 KCD 코드', '보장'],
                    rows: [
                      ['특정 질병', '뇌혈관·심장·간·폐', 'I60~I69, I20~I25 등', '관혈 100% / 비관혈 50%'],
                      ['다빈도 질병', '담석, 치핵, 탈장, 충수염', 'K80, K64, K40, K35 등', '정액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'lotte',
      name: '롯데손해보험',
      shortName: '롯손',
      aliases: ['롯손', '롯데', '롯데손보', '롯데손해보험'],
      logo: '롯',
      color: '#e11d48',
      desc: '더알찬 종합보험 · 간편한 3.5.5',
      periods: [
        {
          id: 'lotte_2021_01',
          periodStr: '2021년 ~ 현재',
          hasRevision: true,
          revBadge: '대장용종 1종 하향 (담석 3종, 암수술 5종 유지)',
          revSummary: '롯데손해보험 1-5종 수술특약은 대장용종 1종 하향 분류 외 담석증 3종, 암수술 5종이 표준 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '질병수술비',
                  summary: '질병 수술 회당 정액 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/meritz_basic_inclusion.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 제외.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약',
                  summary: '표준 1~5종 분류표 적용.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '비고'],
                    rows: [
                      ['4', '대장용종 절제술', '1종', '1종 지급'],
                      ['13', '복강경 담낭절제술', '3종', '3종 지급'],
                      ['80', '암수술', '5종', '5종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_tier_rev_pre.png'
                },
                ndai: {
                  title: '112대 질병수술비',
                  summary: '112대 질병 군별 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [112대 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['5대 질병', '뇌·심·간·폐·신장', 'I60~I69 등', '지급']]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'heungkukfire',
      name: '흥국화재',
      shortName: '흥화',
      aliases: ['흥화', '흥국', '흥국화재'],
      logo: '흥',
      color: '#ea580c',
      desc: '흥Good 모두담은 여성건강보험 · 행복한간편',
      periods: [
        {
          id: 'heungkuk_2025_09',
          periodStr: '2024년 ~ 현재',
          hasRevision: true,
          revBadge: '대장용종 1종 하향 (담석 3종, 여유증 3종)',
          revSummary: '흥국화재 1-5종 수술특약은 대장용종 1종 하향 외 담석증 3종, 여유증 3종, 암수술 5종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '질병수술비',
                  summary: '질병 수술 회당 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/heungkuk_p1081.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 제외.', clauses: [{ title: '면책사유', text: '단순 처치 제외.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약',
                  summary: '1~5종 수술분류표 적용.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 지급.' }] },
                  tableBody: {
                    title: '별표 [1-5종 수술분류표]',
                    headers: ['번호', '수술명', '해당 종수', '비고'],
                    rows: [
                      ['3', '유방절단수술 (여유증 포함)', '3종', '3종 지급'],
                      ['4', '대장용종 절제술', '1종', '1종 지급'],
                      ['13', '복강경 담낭절제술', '3종', '3종 지급'],
                      ['80', '암수술', '5종', '5종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/heungkuk_p1081.png'
                },
                ndai: {
                  title: '112대 N대 질병수술비',
                  summary: '112대 질병 수술 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [112대 질병분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['5대 질병', '뇌·심·간·폐·신장', 'I60~I69 등', '지급']]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'hanwhafire',
      name: '한화손해보험',
      shortName: '한손',
      aliases: ['한손', '한화손보', '한화손해보험'],
      logo: '한',
      color: '#f97316',
      desc: '시그니처 여성건강보험 · 355간편',
      periods: [
        {
          id: 'hanwha_2023_07',
          periodStr: '2023년 7월 ~ 현재 (최신 개정약관)',
          hasRevision: true,
          revBadge: '체외충격파 1종 하향, 여유증 2종 하향 개정',
          revSummary: '한화손해보험 2023년 7월 개정으로 체외충격파쇄석술이 1종으로, 여성형유방증(여유증)이 2종으로 하향 분류되었습니다. 개정 전 계약은 각각 2종, 3종이 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '질병수술비',
                  summary: '질병 수술 회당 정액 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/hanwha_tier_p.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (개정 수술분류표)',
                  summary: '체외충격파 1종, 여유증 2종 하향 개정 적용.',
                  clauseBody: { title: '약관 본문', quote: '종별 차등 지급.', clauses: [{ title: '지급기준', text: '종별 지급.' }] },
                  tableBody: {
                    title: '별표 [1-5종 수술분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['3', '유방절단수술 (여유증 포함)', '3종', '⚠️ 2023.07 이후 여유증 2종 하향 (개정 전 3종)'],
                      ['22', '체외충격파쇄석술 (요로결석 N20 등)', '1종', '⚠️ 2023.07 개정 1종 하향 (개정 전 2종)'],
                      ['13', '복강경 담낭절제술 (담석증 K80)', '3종', '표준 3종 지급'],
                      ['80', '악성신생물(암) 근치수술', '5종', '5종 정상 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/hanwha_tier_p.png'
                },
                ndai: {
                  title: '112대 질병수술비',
                  summary: '112대 질병 수술 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [112대 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['5대 질병', '뇌·심·간·폐·신장', 'I60~I69 등', '지급']]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'hanafire',
      name: '하나손해보험',
      shortName: '하손',
      aliases: ['하손', '하나손보', '하나손해보험'],
      logo: '하',
      color: '#0d9488',
      desc: '하나 가득담은 건강보험 · 원큐간편',
      periods: [
        {
          id: 'hana_2023_06',
          periodStr: '2023년 ~ 현재',
          hasRevision: true,
          revBadge: '대장용종 1종 하향 (담석 3종, 암수술 5종 유지)',
          revSummary: '하나손해보험 1-5종 수술특약은 대장용종 1종 하향 외 담석증 3종, 여유증 3종, 암수술 5종이 표준 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '질병수술비',
                  summary: '질병 수술 회당 정액 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/meritz_basic_inclusion.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 제외.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약',
                  summary: '1~5종 수술분류표 적용.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '비고'],
                    rows: [
                      ['4', '대장용종 절제술', '1종', '1종 지급'],
                      ['13', '복강경 담낭절제술', '3종', '3종 지급'],
                      ['80', '암수술', '5종', '5종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_tier_rev_pre.png'
                },
                ndai: {
                  title: '112대 질병수술비',
                  summary: '112대 질병 수술 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [112대 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['5대 질병', '뇌·심·간·폐·신장', 'I60~I69 등', '지급']]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'nhfire',
      name: 'NH농협손해보험',
      shortName: '농손',
      aliases: ['농손', '농협손보', '농협', 'NH농협손보'],
      logo: '농',
      color: '#16a34a',
      desc: '헤아림 평생안심 종합보험 · 간편가입',
      periods: [
        {
          id: 'nh_2025_01',
          periodStr: '2025년 1월 ~ 현재 (최신 개정약관)',
          hasRevision: true,
          revBadge: '체외충격파쇄석술 1종 하향 개정',
          revSummary: 'NH농협손해보험 2025년 1월 개정으로 체외충격파쇄석술이 1종으로 하향 분류되었습니다. 2024년 12월 이전 계약은 2종으로 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '질병수술비',
                  summary: '질병 수술 회당 정액 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/nh_p386.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (개정 수술분류표)',
                  summary: '체외충격파 1종 하향 개정 적용.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 지급.' }] },
                  tableBody: {
                    title: '별표 [1-5종 수술분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 안내'],
                    rows: [
                      ['13', '복강경 담낭절제술', '3종', '3종 지급'],
                      ['22', '체외충격파쇄석술', '1종', '⚠️ 2025.01 개정 1종 하향 (개정 전 2종)'],
                      ['80', '암수술', '5종', '5종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/nh_p386.png'
                },
                ndai: {
                  title: '112대 질병수술비',
                  summary: '112대 질병 수술 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [112대 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['5대 질병', '뇌·심·간·폐·신장', 'I60~I69 등', '지급']]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        },
        {
          id: 'nh_2024_12_prior',
          periodStr: '2024년 12월 이전',
          hasRevision: true,
          revBadge: '체외충격파 2종 정상 지급 약관',
          revSummary: '2024년 12월 이전 계약은 요로결석 체외충격파쇄석술이 2종으로 회당 100% 정상 지급되는 유리한 약관입니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '질병수술비',
                  summary: '질병 수술 회당 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/nh_p386.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (개정 전)',
                  summary: '체외충격파 2종 정상 지급.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [개정 전 1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['13', '복강경 담낭절제술', '3종', '3종 지급'],
                      ['22', '체외충격파쇄석술', '2종', '💎 체외충격파 2종 100% 정상 지급'],
                      ['80', '암수술', '5종', '5종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/nh_p386.png'
                },
                ndai: {
                  title: '108대 질병수술비',
                  summary: '108대 질병 수술 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [108대 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['5대 질병', '뇌·심·간·폐·신장', 'I60~I69 등', '지급']]
                  },
                  imgSrc: 'assets/clause_imgs/meritz_ndai_table.png'
                }
              }
            }
          }
        }
      ]
    }
  ],

  // 2. 생명보험사 (10개사)
  life: [
    {
      id: 'samsunglife',
      name: '삼성생명',
      shortName: '삼생',
      aliases: ['삼생', '삼성생명'],
      logo: '삼',
      color: '#1d4ed8',
      desc: '삼성 종합보장보험 · 구 1-3종 황금기 및 1-5종',
      periods: [
        {
          id: 'samsunglife_2020_01',
          periodStr: '2020년 ~ 현재 (최신 1-5종기)',
          hasRevision: true,
          revBadge: '생보 1-5종 표준기 (대장용종 2종, 체외충격파 2종 유지)',
          revSummary: '삼성생명 생보 1-5종 수술특약은 대장용종 절제술 2종, 체외충격파쇄석술 2종이 정상 지급되며, C타입 복부체강 동일부위 1회 제한이 적용됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '질병수술특약',
                  summary: '질병 치료 목적 수술 시 회당 정액 급여금 지급. 흡인·천자 면책.',
                  inclusion: {
                    title: '질병수술특약 약관 본문',
                    quote: '제1조(보험금의 지급사유) 피보험자가 질병의 치료를 직접 목적으로 수술을 받은 경우 수술급여금 지급.',
                    clauses: [{ title: '제1조(지급사유)', text: '수술 회당 급여금 지급.' }],
                    imgSrc: 'assets/clause_imgs/samsung_life_golden.png'
                  },
                  exclusion: {
                    title: '질병수술 보상제외 조항',
                    quote: '흡인, 천자, 신경차단, 미용성형, 피임불임 제외.',
                    clauses: [{ title: '면책사유', text: '단순 처치 제외.' }],
                    imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png'
                  }
                },
                tier: {
                  title: '1~5종 수술특약 (생보 1-5종 분류표)',
                  summary: '대장용종 2종, 체외충격파 2종, 담석 3종 정상 지급.',
                  clauseBody: {
                    title: '1~5종 수술특약 약관 본문',
                    quote: '별표 수술분류표에 정한 1~5종 수술급여금 지급.',
                    clauses: [{ title: '지급기준', text: '종별 차등 지급.' }]
                  },
                  tableBody: {
                    title: '별표 [생보 1-5종 수술분류표]',
                    headers: ['번호', '수술명', '해당 종수', '비고 및 삭감방어 팁'],
                    rows: [
                      ['3', '유방절단수술 (여유증 포함)', '3종', '3종 지급'],
                      ['12', '내시경적 소화관 폴립절제술 (대장용종)', '2종', '💎 생보 1-5종 대장용종 2종 정상 지급'],
                      ['19', '체외충격파쇄석술 (ESWL)', '2종', '💎 요로결석 체외충격파 2종 정상 지급'],
                      ['27', '복강경 담낭절제술 (담석증 K80)', '3종', '3종 지급'],
                      ['88', '악성신생물(암) 수술', '5종', '5종 정상 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/samsung_life_golden.png'
                },
                ndai: {
                  title: '주요 성인병/성인주요질환 수술특약',
                  summary: '3대/7대/11대 성인질환 수술 시 정액 급여금 지급. 상세 질병코드 전수 수록.',
                  clauseBody: {
                    title: '성인주요질환 수술특약 약관',
                    quote: '약관에 정한 성인병 질병분류표에 해당하는 질환으로 수술 시 급여금 지급.',
                    clauses: [{ title: '지급사유', text: '성인병 질환군별 차등 지급.' }]
                  },
                  tableBody: {
                    title: '별표 [성인주요질환 분류표 및 KCD 질병코드 전문]',
                    headers: ['질병군 분류', '대상 주요 질병명', '포함 KCD 질병코드 (전수)', '급여금 지급 기준'],
                    rows: [
                      ['3대 주요질환', '악성신생물(암), 뇌혈관질환, 심장질환', 'C00~C97, D00~D09, I60~I69, I20~I25', '최고 급여금 지급 (1회당)'],
                      ['7대 성인병', '고혈압, 당뇨병, 간질환, 만성하기도질환, 신부전', 'I10~I15, E10~E14, K70~K76, J40~J47, N17~N19', '정액 급여금 지급'],
                      ['11대 성인병', '위궤양, 십이지장궤양, 담석증, 결핵, 패혈증', 'K25~K28, K80~K83, A15~A19, A40~A41', '정액 급여금 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            },
            simplified: {
              name: '간편 (유병자 간편종합보장)',
              riders: {
                basic: {
                  title: '간편 질병수술특약',
                  summary: '간편 가입자 질병수술비 회당 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/samsung_life_golden.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '간편 1~5종 수술특약',
                  summary: '대장용종 2종, 체외충격파 2종 적용.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [간편 1-5종 수술분류표]',
                    headers: ['번호', '수술명', '종수', '비고'],
                    rows: [
                      ['12', '대장용종 폴립절제술', '2종', '2종 지급'],
                      ['19', '체외충격파쇄석술', '2종', '2종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/samsung_life_golden.png'
                },
                ndai: {
                  title: '간편 성인주요질환 수술특약',
                  summary: '3대/7대 질환 수술 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [간편 성인질환 분류표]',
                    headers: ['질병군', '대상 질병', '질병코드', '보장'],
                    rows: [['3대 질환', '암, 뇌혈관, 허혈심장', 'C00~C97, I60~I69, I20~I25', '지급']]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        },
        {
          id: 'samsunglife_2006_04',
          periodStr: '2006년 3월 이전 계약 (구 1~3종 황금기)',
          hasRevision: true,
          revBadge: '구 1~3종 황금기 약관 (체외충격파 2종, 여유증 3종, 담석 3종 전액 지급)',
          revSummary: '2006년 3월 이전 체결된 삼성생명 구 1~3종 수술특약은 요로결석 체외충격파쇄석술 2종, 대장용종 2종, 담석증 3종, 여유증 3종이 100% 전액 지급되는 전설적인 황금기 약관입니다.',
          types: {
            standard: {
              name: '일반 (표준체 종합보장 - 구 1~3종 황금기)',
              riders: {
                basic: {
                  title: '구 수술특약 (보통약관)',
                  summary: '수술 회당 급여금 지급.',
                  inclusion: { title: '약관 본문', quote: '수술 시 회당 급여금 지급.', clauses: [{ title: '지급사유', text: '정액 급여금 지급.' }], imgSrc: 'assets/clause_imgs/samsung_life_golden.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '구 1~3종 수술특약 (황금기 수술분류표)',
                  summary: '체외충격파 2종, 대장용종 2종, 담석 3종, 여유증 3종 100% 지급.',
                  clauseBody: {
                    title: '구 1~3종 수술특약 약관 본문',
                    quote: '별표 수술분류표에 정한 1종, 2종, 3종 수술급여금 전액 지급.',
                    clauses: [{ title: '지급기준', text: '1종~3종 차등 지급.' }]
                  },
                  tableBody: {
                    title: '별표 [구 1~3종 수술분류표 전문]',
                    headers: ['번호', '수술명 (약관 본문)', '해당 종수', '비고 및 삭감방어 팁'],
                    rows: [
                      ['3', '유방절단수술 (유선절제술 포함)', '3종', '💎 여성형유방증(여유증) 유선절제 3종 100% 전액 지급'],
                      ['11', '내시경적 소화관 폴립절제술 (대장용종/위용종)', '2종', '💎 대장용종 2종 수술비 전액 지급'],
                      ['18', '체외충격파쇄석술 (ESWL)', '2종', '💎 요로결석 체외충격파 2종 회당 전액 지급 (하향 없음)'],
                      ['24', '담낭절제술 (복강경하 담낭절제술 포함)', '3종', '💎 담석증 복강경절제 3종 수술비 전액 지급'],
                      ['29', '치조골 골이식술', '2종', '치조골 뼈이식 2종 지급'],
                      ['40', '악성신생물(암) 근치수술', '3종', '구 1~3종 최고 등급 3종 전액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/samsung_life_golden.png'
                },
                ndai: {
                  title: '성인병 수술특약 (황금기)',
                  summary: '주요 성인질환 수술 시 정액 지급.',
                  clauseBody: { title: '약관 본문', quote: '성인병 수술 시 정액 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인병 질병분류표]',
                    headers: ['질병군', '대상 질병', '질병코드', '보장'],
                    rows: [
                      ['3대 성인병', '암, 뇌출혈, 심근경색', 'C00~C97, I60~I62, I21~I23', '최고 급여금 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'hanwhalife',
      name: '한화생명',
      shortName: '한생',
      aliases: ['한생', '한화생명'],
      logo: '한',
      color: '#f97316',
      desc: '시그니처 암보험 · H10 건강보험 · 간편가입',
      periods: [
        {
          id: 'hanwhalife_2020_01',
          periodStr: '2020년 ~ 현재',
          hasRevision: true,
          revBadge: '생보 1-5종 표준기 (대장용종 2종, 쇄석술 2종)',
          revSummary: '한화생명 1-5종 수술특약은 대장용종 2종, 체외충격파쇄석술 2종, 담석 3종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '질병수술특약',
                  summary: '질병 수술 회당 정액 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/samsung_life_golden.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약',
                  summary: '생보 1-5종 분류표 적용.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 지급.' }] },
                  tableBody: {
                    title: '별표 [1-5종 수술분류표]',
                    headers: ['번호', '수술명', '해당 종수', '비고'],
                    rows: [
                      ['12', '내시경 용종절제술 (대장용종)', '2종', '💎 대장용종 2종 지급'],
                      ['19', '체외충격파쇄석술', '2종', '💎 쇄석술 2종 지급'],
                      ['27', '복강경 담낭절제술', '3종', '3종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/samsung_life_golden.png'
                },
                ndai: {
                  title: '주요 성인병 수술특약',
                  summary: '성인병 질환군별 급여금 지급. 질병코드 전수 수록.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인병 질병분류표 및 KCD 코드]',
                    headers: ['질병군', '대상 질병', 'KCD 코드 (전수)', '보장 내용'],
                    rows: [
                      ['3대 질환', '암, 뇌혈관질환, 심장질환', 'C00~C97, I60~I69, I20~I25', '최고 급여금'],
                      ['7대 성인병', '고혈압, 당뇨병, 간질환, 만성하기도질환, 신부전', 'I10~I15, E10~E14, K70~K76, J40~J47, N17~N19', '정액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'kyobolife',
      name: '교보생명',
      shortName: '교보',
      aliases: ['교보', '교보생명'],
      logo: '교',
      color: '#0284c7',
      desc: '교보 평생종합보장보험 · 간편마이플랜',
      periods: [
        {
          id: 'kyobo_2020_01',
          periodStr: '2020년 ~ 현재',
          hasRevision: true,
          revBadge: 'A타입 신체부위 분리형 (동시수술 각각 지급 약관)',
          revSummary: '교보생명은 A타입(1·2·2·2 신체부위 분리형) 약관으로 신체부위가 다른 경우 독립된 수술로 인정하여 각각 지급되며, 대장용종 2종, 쇄석술 2종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '수술특약 (보통약관)',
                  summary: '수술 회당 급여금 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/kyobo_life_clause.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (A타입 약관)',
                  summary: '신체부위 상이 시 각각 지급. 대장용종 2종, 쇄석술 2종.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 지급.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['12', '내시경 용종절제술 (대장용종)', '2종', '💎 2종 정상 지급'],
                      ['19', '체외충격파쇄석술', '2종', '💎 2종 정상 지급'],
                      ['27', '복강경 담낭절제술', '3종', '3종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                },
                ndai: {
                  title: '주요 성인병 수술특약',
                  summary: '3대/7대/11대 성인병 질병코드 전수 탑재.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인병 질병분류표 및 KCD 코드]',
                    headers: ['질병군', '대상 질병', 'KCD 코드 (전수)', '보장'],
                    rows: [
                      ['3대 주요질환', '암, 뇌혈관질환, 심장질환', 'C00~C97, I60~I69, I20~I25', '최고 급여금'],
                      ['7대 성인병', '고혈압, 당뇨병, 간질환, 만성하기도, 신부전', 'I10~I15, E10~E14, K70~K76, J40~J47, N17~N19', '정액 지급'],
                      ['11대 성인병', '위궤양, 십이지장궤양, 담석증, 결핵, 패혈증', 'K25~K28, K80~K83, A15~A19, A40~A41', '정액 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'shinhanlife',
      name: '신한라이프',
      shortName: '신라',
      aliases: ['신라', '신한', '신한라이프'],
      logo: '신',
      color: '#0284c7',
      desc: '신한 통합건강보험 · 원큐간편',
      periods: [
        {
          id: 'shinhan_2020_01',
          periodStr: '2020년 ~ 현재',
          hasRevision: true,
          revBadge: '생보 1-5종 표준기 (체외충격파 2종, 대장용종 2종)',
          revSummary: '신한라이프 1-5종 수술특약은 요로결석 체외충격파쇄석술 2종, 대장용종 절제술 2종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '수술특약',
                  summary: '수술 회당 급여금 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/shinhan_life_clause.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약',
                  summary: '체외충격파 2종, 대장용종 2종.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['12', '소화관 폴립절제술 (대장용종)', '2종', '💎 2종 지급'],
                      ['19', '체외충격파쇄석술', '2종', '💎 2종 지급'],
                      ['27', '복강경 담낭절제술', '3종', '3종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/shinhan_life_clause.png'
                },
                ndai: {
                  title: '성인 주요질환 수술특약',
                  summary: '3대/7대 질환 KCD 코드 전수 수록.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인질환 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['3대 질환', '암, 뇌혈관, 심장질환', 'C00~C97, I60~I69, I20~I25', '최고 급여금']]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'kblife',
      name: 'KB라이프',
      shortName: '케라',
      aliases: ['케라', 'KB라이프', '케이비라이프'],
      logo: '케',
      color: '#f59e0b',
      desc: '평생행복 건강보험 · 77간편',
      periods: [
        {
          id: 'kblife_2020_01',
          periodStr: '2020년 ~ 현재',
          hasRevision: true,
          revBadge: 'C타입 복부동일장기 1회제한 약관',
          revSummary: 'KB라이프는 C타입 약관으로 복부체강 동일 장기 동시수술 시 최고 종수 1회만 지급되며, 대장용종 2종, 쇄석술 2종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '수술특약',
                  summary: '수술 회당 급여금 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/kblife_tier_p.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (C타입 복부제한)',
                  summary: '대장용종 2종, 쇄석술 2종 지급.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['12', '대장용종 절제술', '2종', '💎 2종 지급'],
                      ['19', '체외충격파쇄석술', '2종', '💎 2종 지급'],
                      ['27', '복강경 담낭절제술', '3종', '3종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/kblife_tier_p.png'
                },
                ndai: {
                  title: '성인병 수술특약',
                  summary: '3대/7대 질환 KCD 코드 전수 탑재.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인병 질병분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['3대 질환', '암, 뇌혈관, 심장질환', 'C00~C97, I60~I69, I20~I25', '최고 급여금']]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'dongyang',
      name: '동양생명',
      shortName: '동양',
      aliases: ['동양', '동양생명'],
      logo: '동',
      color: '#10b981',
      desc: '수호천사 내가만드는보장보험 · 간편보장',
      periods: [
        {
          id: 'dongyang_2020_01',
          periodStr: '2020년 ~ 현재',
          hasRevision: true,
          revBadge: 'A타입 신체부위 분리형 (좌/우 사지 등 각각 지급)',
          revSummary: '동양생명은 A타입(1·2·2·2) 약관으로 신체부위가 상이한 경우 각각 독립 지급되며, 대장용종 2종, 쇄석술 2종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '수술특약',
                  summary: '수술 회당 급여금 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/kyobo_life_clause.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (A타입)',
                  summary: '대장용종 2종, 쇄석술 2종 지급.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['12', '대장용종 절제술', '2종', '💎 2종 지급'],
                      ['19', '체외충격파쇄석술', '2종', '💎 2종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                },
                ndai: {
                  title: '주요 성인질환 수술특약',
                  summary: '성인질환 KCD 코드 전수 수록.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인질환 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['3대 질환', '암, 뇌혈관, 심장질환', 'C00~C97, I60~I69, I20~I25', '최고 급여금']]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'heungkuklife',
      name: '흥국생명',
      shortName: '흥생',
      aliases: ['흥생', '흥국', '흥국생명'],
      logo: '흥',
      color: '#f43f5e',
      desc: '다사랑 통합보험 · 간편다사랑',
      periods: [
        {
          id: 'heungkuklife_2020_01',
          periodStr: '2020년 ~ 현재',
          hasRevision: true,
          revBadge: 'D타입 동시수술 1회제한 약관',
          revSummary: '흥국생명은 D타입 약관으로 같은 날 2가지 이상 수술 시 최고 등급 1회만 지급되며, 대장용종 2종, 쇄석술 2종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '수술특약',
                  summary: '수술 회당 급여금 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/heungkuk_p1081.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (D타입)',
                  summary: '대장용종 2종, 쇄석술 2종 지급.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['12', '대장용종 절제술', '2종', '💎 2종 지급'],
                      ['19', '체외충격파쇄석술', '2종', '💎 2종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/heungkuk_p1081.png'
                },
                ndai: {
                  title: '성인병 수술특약',
                  summary: '3대/7대 질환 KCD 코드 전수 수록.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인병 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['3대 질환', '암, 뇌혈관, 심장질환', 'C00~C97, I60~I69, I20~I25', '최고 급여금']]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'abllife',
      name: 'ABL생명',
      shortName: 'ABL',
      aliases: ['ABL', '에이비엘', 'ABL생명'],
      logo: 'A',
      color: '#eab308',
      desc: '더나은 통합건강보험 · 간편가입',
      periods: [
        {
          id: 'abl_2020_01',
          periodStr: '2020년 ~ 현재',
          hasRevision: true,
          revBadge: 'D타입 동시수술 1회제한 약관',
          revSummary: 'ABL생명은 D타입 약관으로 같은 날 2회 이상 수술 시 최고 등급 1회만 지급되며, 대장용종 2종, 쇄석술 2종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '수술특약',
                  summary: '수술 회당 급여금 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/heungkuk_p1081.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (D타입)',
                  summary: '대장용종 2종, 쇄석술 2종 지급.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['12', '대장용종 절제술', '2종', '💎 2종 지급'],
                      ['19', '체외충격파쇄석술', '2종', '💎 2종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/heungkuk_p1081.png'
                },
                ndai: {
                  title: '성인병 수술특약',
                  summary: '3대/7대 질환 KCD 코드 전수 수록.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인병 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['3대 질환', '암, 뇌혈관, 심장질환', 'C00~C97, I60~I69, I20~I25', '최고 급여금']]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'linalife',
      name: '라이나생명',
      shortName: '라생',
      aliases: ['라생', '라이나', '라이나생명'],
      logo: '라',
      color: '#06b6d4',
      desc: 'THE간편한 종합보장보험 · 실버암보험',
      periods: [
        {
          id: 'lina_2020_01',
          periodStr: '2020년 ~ 현재',
          hasRevision: true,
          revBadge: 'D타입 동시수술 1회제한 약관',
          revSummary: '라이나생명은 D타입 약관으로 같은 날 2가지 이상 수술 시 최고 등급 1회만 지급되며, 대장용종 2종, 쇄석술 2종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '수술특약',
                  summary: '수술 회당 급여금 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/lina_tier_p.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약 (D타입)',
                  summary: '대장용종 2종, 쇄석술 2종 지급.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['11', '내시경 용종절제술 (대장용종)', '2종', '💎 2종 지급'],
                      ['18', '체외충격파쇄석술', '2종', '💎 2종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/lina_tier_p.png'
                },
                ndai: {
                  title: '주요 성인질환 수술특약',
                  summary: '3대/7대 질환 KCD 코드 전수 수록.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인질환 분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['3대 질환', '암, 뇌혈관, 심장질환', 'C00~C97, I60~I69, I20~I25', '최고 급여금']]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    },
    {
      id: 'nhlife',
      name: 'NH농협생명',
      shortName: '농생',
      aliases: ['농생', '농협생명', 'NH농협생명'],
      logo: '농',
      color: '#15803d',
      desc: '평생안심 종합보장보험 · 간편백세',
      periods: [
        {
          id: 'nhlife_2020_01',
          periodStr: '2020년 ~ 현재',
          hasRevision: true,
          revBadge: '생보 1-5종 표준기 (대장용종 2종, 쇄석술 2종)',
          revSummary: 'NH농협생명 1-5종 수술특약은 대장용종 절제술 2종, 체외충격파쇄석술 2종이 정상 지급됩니다.',
          types: {
            standard: {
              name: '일반 (표준체)',
              riders: {
                basic: {
                  title: '수술특약',
                  summary: '수술 회당 급여금 지급.',
                  inclusion: { title: '약관 본문', quote: '회당 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }], imgSrc: 'assets/clause_imgs/nh_p386.png' },
                  exclusion: { title: '면책조항', quote: '흡인·천자 면책.', clauses: [{ title: '면책사유', text: '단순 처치 면책.' }], imgSrc: 'assets/clause_imgs/meritz_basic_exclusion.png' }
                },
                tier: {
                  title: '1~5종 수술특약',
                  summary: '대장용종 2종, 쇄석술 2종 지급.',
                  clauseBody: { title: '약관 본문', quote: '종별 지급.', clauses: [{ title: '지급기준', text: '종별 차등.' }] },
                  tableBody: {
                    title: '별표 [1-5종 분류표]',
                    headers: ['번호', '수술명', '해당 종수', '실무 팁'],
                    rows: [
                      ['12', '내시경 용종절제술 (대장용종)', '2종', '💎 2종 지급'],
                      ['19', '체외충격파쇄석술', '2종', '💎 2종 지급']
                    ]
                  },
                  imgSrc: 'assets/clause_imgs/nh_p386.png'
                },
                ndai: {
                  title: '주요 성인병 수술특약',
                  summary: '3대/7대 성인병 KCD 코드 전수 수록.',
                  clauseBody: { title: '약관 본문', quote: '군별 지급.', clauses: [{ title: '지급사유', text: '정액 지급.' }] },
                  tableBody: {
                    title: '별표 [성인병 질병분류표]',
                    headers: ['질병군', '대상 질병', 'KCD 코드', '보장'],
                    rows: [['3대 질환', '암, 뇌혈관, 심장질환', 'C00~C97, I60~I69, I20~I25', '최고 급여금']]
                  },
                  imgSrc: 'assets/clause_imgs/kyobo_life_clause.png'
                }
              }
            }
          }
        }
      ]
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.POLICY_CLAUSES_DATA;
}
