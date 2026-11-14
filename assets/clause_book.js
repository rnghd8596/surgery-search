/* 1차 재구축: 확인한 원문 쪽만.
   삼성화재 = 공시실 PDF ZPB250090_0_20240902 를 pdftoppm으로 렌더.
   파일 번호는 PDF 쪽, 인쇄 쪽수는 대체로 파일번호-1 (이미지 하단이 기준).
   메리츠 = 저장소 스캔 중 이 작업에서 직접 읽은 쪽만.
   없는 칸은 pages: [] 이라 다른 특약 쪽으로 대신 열리지 않는다. */
window.CLAUSE_BOOK = {
  samsungfire: {
    lines: {
      standard: {
        periods: {
          samsung_2024_01: {
            product: '무배당 삼성화재 건강보험 마이헬스 파트너(2404.10) 1종(납입면제형)·4종(일반형)',
            sale: '2024-09-02부터 적용',
            source: 'https://www.samsungfire.com/publication/pdf/ZPB250090_0_20240902_file1.pdf',
            riders: {
              basic: {
                inclusion: {
                  caption: '16-1-1. 질병 입원·통원 수술비Ⅱ. 이미지 하단 697쪽~698쪽',
                  pages: [
                    'assets/clause_pages/samsung/dis_surg-0698.png',
                    'assets/clause_pages/samsung/dis_surg-0699.png',
                    'assets/clause_pages/samsung/dis_surg-0700.png'
                  ]
                },
                exclusion: {
                  caption: '같은 특약 제5조~제6조가 이어지는 쪽. 이미지 하단 쪽수 기준',
                  pages: [
                    'assets/clause_pages/samsung/dis_surg-0699.png',
                    'assets/clause_pages/samsung/dis_surg-0700.png',
                    'assets/clause_pages/samsung/dis_surg-0701.png'
                  ]
                }
              },
              tier: {
                inclusion: {
                  caption: '16-1-11. 질병 1~5종 수술비. 이미지 하단 713쪽~',
                  pages: [
                    'assets/clause_pages/samsung/dis_15-0714.png',
                    'assets/clause_pages/samsung/dis_15-0715.png',
                    'assets/clause_pages/samsung/dis_15-0716.png'
                  ]
                },
                table: {
                  caption: '[별표-개별사항16-2] 1~5종 수술 분류표. 이미지 하단 1376쪽~1393쪽',
                  pages: [
                    'assets/clause_pages/samsung/t15-1377.png','assets/clause_pages/samsung/t15-1378.png','assets/clause_pages/samsung/t15-1379.png','assets/clause_pages/samsung/t15-1380.png',
                    'assets/clause_pages/samsung/t15-1381.png','assets/clause_pages/samsung/t15-1382.png','assets/clause_pages/samsung/t15-1383.png','assets/clause_pages/samsung/t15-1384.png',
                    'assets/clause_pages/samsung/t15-1385.png','assets/clause_pages/samsung/t15-1386.png','assets/clause_pages/samsung/t15-1387.png','assets/clause_pages/samsung/t15-1388.png',
                    'assets/clause_pages/samsung/t15-1389.png','assets/clause_pages/samsung/t15-1390.png','assets/clause_pages/samsung/t15-1391.png','assets/clause_pages/samsung/t15-1392.png',
                    'assets/clause_pages/samsung/t15-1393.png','assets/clause_pages/samsung/t15-1394.png'
                  ]
                }
              },
              injury: {
                inclusion: {
                  caption: '16-2-1. 상해 입원·통원 수술비. 이미지 하단 727쪽~',
                  pages: [
                    'assets/clause_pages/samsung/inj_surg-0728.png',
                    'assets/clause_pages/samsung/inj_surg-0729.png',
                    'assets/clause_pages/samsung/inj_surg-0730.png'
                  ]
                }
              },
              ndai: {
                '111대': {
                  clause: {
                    caption: '20-1-5. 111대질병 수술비(1년50%). 이미지 하단 847쪽대',
                    pages: [
                      'assets/clause_pages/samsung/ndai111-0848.png',
                      'assets/clause_pages/samsung/ndai111-0849.png',
                      'assets/clause_pages/samsung/ndai111-0850.png',
                      'assets/clause_pages/samsung/ndai111-0851.png',
                      'assets/clause_pages/samsung/ndai111-0852.png'
                    ]
                  },
                  groups: {
                    '5대주요기관': { caption: '[별표-개별사항20-5] 5대주요기관질병 분류표Ⅱ. 하단 1417쪽', pages: ['assets/clause_pages/samsung/n111-1418.png'] },
                    '22대주요': { caption: '[별표-개별사항20-6] 22대주요질병 분류표. 하단 1418~1419쪽', pages: ['assets/clause_pages/samsung/n111-1419.png','assets/clause_pages/samsung/n111-1420.png'] },
                    '3대주요': { caption: '[별표-개별사항20-7] 3대주요질병 분류표. 하단 1420쪽', pages: ['assets/clause_pages/samsung/n111-1421.png'] },
                    '19대생활': { caption: '[별표-개별사항20-8] 19대생활질병 분류표. 하단 1421쪽', pages: ['assets/clause_pages/samsung/n111-1422.png'] },
                    '62대생활': { caption: '[별표-개별사항20-9] 62대생활질병 분류표. 하단 1422~1425쪽', pages: ['assets/clause_pages/samsung/n111-1423.png','assets/clause_pages/samsung/n111-1424.png','assets/clause_pages/samsung/n111-1425.png','assets/clause_pages/samsung/n111-1426.png'] }
                  }
                }
              }
            }
          }
        }
      },
      simplified: {
        periods: {
          samsung_2026_07: {
            product: '무배당 삼성화재 간편보험 간편하게 건강하게(1601.1) 10년만기 재가입형 1종(간편심사형) 재가입계약용',
            sale: '2026-07-01부터 적용',
            source: 'https://www.samsungfire.com/publication/pdf/ZPY004010_0_20260701_file1.pdf',
            riders: {
              basic: {
                inclusion: {
                  caption: '2-8·2-9·2-10. 암 최초수술비, 암 수술비(3회한), 유사암 수술비. 인쇄 70~75쪽. 일반 질병수술비·1~5종·114대·116대 특약은 이 약관 목차에 없음',
                  pages: [
                    'assets/clause_pages/samsung_gp/can-071.png',
                    'assets/clause_pages/samsung_gp/can-072.png',
                    'assets/clause_pages/samsung_gp/can-073.png',
                    'assets/clause_pages/samsung_gp/can-074.png',
                    'assets/clause_pages/samsung_gp/can-075.png',
                    'assets/clause_pages/samsung_gp/can-076.png'
                  ]
                }
              },
              injury: {
                inclusion: {
                  caption: '1-2. [간편심사]상해 수술비 특별약관. 인쇄 49~50쪽',
                  pages: [
                    'assets/clause_pages/samsung_gp/inj-050.png',
                    'assets/clause_pages/samsung_gp/inj-051.png'
                  ]
                }
              }
            }
          }
        }
      }
    }
  },
  meritz: {
    lines: {
      simplified: {
        periods: {
          meritz_2024_12: {
            product: '무배당 메리츠 통합간편건강보험2501(일반심사형)',
            sale: '판매 2025-01-01~2025-01-12',
            source: '메리츠 공시실 약관. 저장소 insurer_pdfs',
            riders: {
              tier: {
                table: {
                  caption: '【별표38】 1-5종 수술분류표Ⅱ. 인쇄 442쪽. 제3항 유방절단 3종, 유방의 비대(N62)는 1종. 제4항 1종(맘모톰)',
                  pages: ['assets/clause_pages/meritz/gp2501_t38_p442.png']
                }
              }
            }
          }
        }
      },
      standard: {
        periods: {
          meritz_2020_04: {
            product: '무배당 The편한 케어프리보험 M-Basket2007',
            sale: '판매 2020-07-15~2020-11-03',
            source: '메리츠 공시실 약관. 저장소 insurer_pdfs',
            riders: {
              tier: {
                table: {
                  caption: '1-5종 제87항 체외충격파쇄석술 2종. 인쇄 456쪽. 체외충격파치료술은 제외',
                  pages: ['assets/clause_pages/meritz/mb2007_eswl_p456.png']
                }
              }
            }
          },
          meritz_2024_12: {
            product: '무배당 메리츠 케어프리보험 M-Basket2501',
            sale: '판매 2025-01-01~2025-01-12',
            source: '메리츠 공시실 약관. 저장소 insurer_pdfs',
            riders: {
              tier: {
                table: {
                  caption: '【별표7】 1-5종 수술분류표Ⅱ. 인쇄 591쪽. 제3항 유방절단 3종, 유방의 비대(N62)는 1종. 제4항 1종(맘모톰)',
                  pages: ['assets/clause_pages/meritz/mb2501_t7_p591.png']
                }
              }
            }
          },
          meritz_2022_04: {
            product: '스캔에 상품 표지는 없고, 32대 지급예시의 최초계약일이 2022.4.10으로 인쇄됨',
            sale: '2022-04-10 예시가 있는 책자. 2024.12 개정본인지는 미확정',
            source: '저장소 스캔 assets/clause_imgs/meritz_std_* (공시실 쪽 스캔)',
            riders: {
              basic: {
                inclusion: {
                  caption: '16. 갱신형 질병수술비보장 특별약관 제245쪽',
                  pages: ['assets/clause_imgs/meritz_std_basic_inc_p245.png']
                },
                exclusion: {
                  caption: '같은 특약 제246~247쪽',
                  pages: ['assets/clause_imgs/meritz_std_basic_exc_p246.png','assets/clause_imgs/meritz_std_basic_exc_p247.png']
                }
              },
              tier: {
                table: {
                  caption: '〈별표23〉 1~5종 수술분류표. 하단 “현재 661/665”부터. 개정일자는 이 스캔에 없음',
                  pages: [
                    'assets/clause_imgs/meritz_star23_tier_p1.png','assets/clause_imgs/meritz_star23_tier_p2.png','assets/clause_imgs/meritz_star23_tier_p3.png',
                    'assets/clause_imgs/meritz_star23_tier_p4.png','assets/clause_imgs/meritz_star23_tier_p5.png','assets/clause_imgs/meritz_star23_tier_p6.png','assets/clause_imgs/meritz_star23_tier_p7.png'
                  ]
                }
              },
              ndai: {
                '131대': {
                  clause: {
                    caption: '41. 갱신형 131대질병수술비보장 특별약관 제332쪽~',
                    pages: ['assets/clause_imgs/meritz_std_ndai_inc_p332.png','assets/clause_imgs/meritz_std_ndai_inc_p333.png','assets/clause_imgs/meritz_std_ndai_inc_p334.png','assets/clause_imgs/meritz_std_ndai_inc_p335.png','assets/clause_imgs/meritz_std_ndai_inc_p336.png']
                  },
                  exclusion: {
                    caption: '131대 제5조 수술의 정의. 제337쪽',
                    pages: ['assets/clause_imgs/meritz_std_ndai_exc_p337.png','assets/clause_imgs/meritz_std_ndai_exc_p338.png']
                  },
                  groups: {
                    '심장': { caption: '【별표23】 심장질환 분류표. 제664쪽', pages: ['assets/clause_imgs/meritz_std_ndai_heart_p664.png'] },
                    '31대': { caption: '【별표44】 특정31대질병 분류표. 제714쪽', pages: ['assets/clause_imgs/meritz_std_ndai_31_p714.png'] }
                  }
                },
                '32대': {
                  clause: {
                    caption: '42. 갱신형 32대질병관혈수술비 제339~341쪽',
                    pages: ['assets/clause_imgs/meritz_std_ndai_32_inc_p339.png','assets/clause_imgs/meritz_std_ndai_32_inc_p340.png','assets/clause_imgs/meritz_std_ndai_32_inc_p341.png']
                  },
                  groups: {
                    '5대': { caption: '【별표46】 [5대질병] 제728쪽', pages: ['assets/clause_imgs/meritz_std_ndai_32_table_p728.png'] },
                    '9대': { caption: '【별표46】 [9대질병] 제729~730쪽', pages: ['assets/clause_imgs/meritz_std_ndai_32_table_p729.png','assets/clause_imgs/meritz_std_ndai_32_table_p730.png'] },
                    '14대': { caption: '【별표46】 [14대질병] 제730~731쪽', pages: ['assets/clause_imgs/meritz_std_ndai_32_table_p730.png','assets/clause_imgs/meritz_std_ndai_32_table_p731.png'] },
                    '4대': { caption: '제3조⑤ 4대질병 정의. 제341쪽. 분류번호 표는 없음', pages: ['assets/clause_imgs/meritz_std_ndai_32_inc_p341.png'] }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  hyundai: {
    lines: {
      standard: {
        periods: {
          hyundai_hi2404: {
            product: '무배당 현대해상다이렉트 H건강보험(Hi2404)',
            sale: '약관 표지 상품코드 Hi2404. 파일 CM295G_20240401',
            source: 'https://direct.hi.co.kr/dhNAS/terms/CM295G_20240401.pdf',
            riders: {
              basic: {
                inclusion: {
                  caption: '2-19. 질병수술(건강등급)(갱신형). 인쇄 93쪽~',
                  pages: ['assets/clause_pages/hyundai/dis-093.png','assets/clause_pages/hyundai/dis-094.png','assets/clause_pages/hyundai/dis-095.png','assets/clause_pages/hyundai/dis-096.png','assets/clause_pages/hyundai/dis-097.png','assets/clause_pages/hyundai/dis-098.png']
                }
              },
              tier: {
                inclusion: {
                  caption: '1-7. 상해수술Ⅲ(1-5종)(수술회당지급). 인쇄 66쪽~. 왼쪽 단은 앞 특약의 끝',
                  pages: ['assets/clause_pages/hyundai/inj-066.png','assets/clause_pages/hyundai/inj-067.png','assets/clause_pages/hyundai/inj-068.png']
                },
                table: {
                  caption: '[별표11] 1-5종수술Ⅲ 분류표. 인쇄 126쪽~',
                  pages: ['assets/clause_pages/hyundai/tbl-126.png','assets/clause_pages/hyundai/tbl-127.png','assets/clause_pages/hyundai/tbl-128.png','assets/clause_pages/hyundai/tbl-129.png','assets/clause_pages/hyundai/tbl-130.png']
                }
              },
              injury: {
                inclusion: {
                  caption: '1-7. 상해수술Ⅲ(1-5종). 인쇄 66쪽~',
                  pages: ['assets/clause_pages/hyundai/inj-066.png','assets/clause_pages/hyundai/inj-067.png','assets/clause_pages/hyundai/inj-068.png']
                }
              },
              ndai: {
                '120대': {
                  clause: {
                    caption: '2-22. 120대질병수술. 26+58+24+치핵+갑상선관련+다발성10. 인쇄 99쪽 지급표',
                    pages: ['assets/clause_pages/hyundai/n120-099.png','assets/clause_pages/hyundai/n120-100.png','assets/clause_pages/hyundai/n120-101.png','assets/clause_pages/hyundai/n120-102.png','assets/clause_pages/hyundai/n120-103.png','assets/clause_pages/hyundai/n120-104.png']
                  },
                  groups: {
                    '26대질병': { caption: '[별표12] 26대질병 분류표. 인쇄 131쪽~', pages: ['assets/clause_pages/hyundai/tbl-131.png','assets/clause_pages/hyundai/tbl-132.png'] },
                    '58대질병': { caption: '[별표13] 58대질병 분류표. 인쇄 133쪽~', pages: ['assets/clause_pages/hyundai/tbl-133.png','assets/clause_pages/hyundai/tbl-134.png','assets/clause_pages/hyundai/tbl-135.png','assets/clause_pages/hyundai/tbl-136.png','assets/clause_pages/hyundai/tbl-137.png'] },
                    '24대질병': { caption: '24대질병 분류표. 인쇄 139쪽~', pages: ['assets/clause_pages/hyundai/tbl-139.png','assets/clause_pages/hyundai/tbl-140.png','assets/clause_pages/hyundai/tbl-141.png'] },
                    '치핵': { caption: '치핵 분류표. 인쇄 142쪽~', pages: ['assets/clause_pages/hyundai/tbl-142.png','assets/clause_pages/hyundai/tbl-143.png'] },
                    '다발성10대질병': { caption: '다발성10대질병 분류표. 인쇄 145쪽', pages: ['assets/clause_pages/hyundai/tbl-145.png'] },
                    '갑상선관련질병': { caption: '갑상선관련질병 분류표. 인쇄 146쪽', pages: ['assets/clause_pages/hyundai/tbl-146.png'] }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  kbinsure: {
    lines: {
      standard: {
        periods: {
          kb_2026_10: {
            product: 'KB 5.10.10 플러스 건강보험(세만기)(무배당)(26.09) 보종 25438',
            sale: '2026-10-01부터 적용',
            source: 'https://www.kbinsure.co.kr/CG802030003.ec?fileNm=25438_2_1.pdf',
            riders: {
              basic: {
                inclusion: {
                  caption: '68. 질병수술비(맞춤고지). 인쇄 350쪽~',
                  pages: [
                    'assets/clause_pages/kb/dis-0352.png',
                    'assets/clause_pages/kb/dis-0353.png',
                    'assets/clause_pages/kb/dis-0354.png',
                    'assets/clause_pages/kb/dis-0355.png',
                    'assets/clause_pages/kb/dis-0356.png'
                  ]
                },
                exclusion: {
                  caption: '같은 68. 질병수술비의 지급하지 않는 질병·목적. 인쇄 350쪽대',
                  pages: [
                    'assets/clause_pages/kb/dis-0352.png',
                    'assets/clause_pages/kb/dis-0353.png',
                    'assets/clause_pages/kb/dis-0354.png',
                    'assets/clause_pages/kb/dis-0356.png'
                  ]
                }
              },
              tier: {
                inclusion: {
                  caption: '75. 질병1~5종수술비Ⅱ(매회지급). 인쇄 369쪽~. 분류표는 【별표55-1】',
                  pages: [
                    'assets/clause_pages/kb/n116-0371.png',
                    'assets/clause_pages/kb/tier-0372.png',
                    'assets/clause_pages/kb/tier-0373.png'
                  ]
                },
                table: {
                  caption: '【별표55-1】 1~5종수술Ⅲ 분류표. 인쇄 1206쪽~. 첫 쪽 왼쪽은 별표55 Ⅱ의 끝',
                  pages: [
                    'assets/clause_pages/kb/t55-1208.png',
                    'assets/clause_pages/kb/t55-1209.png',
                    'assets/clause_pages/kb/t55-1210.png',
                    'assets/clause_pages/kb/t55-1211.png',
                    'assets/clause_pages/kb/t55-1212.png',
                    'assets/clause_pages/kb/t55-1213.png'
                  ]
                }
              },
              injury: {
                inclusion: {
                  caption: '13. 상해수술비(맞춤고지). 인쇄 153쪽~. 마지막 쪽 오른쪽에 15. 상급종합병원 상해수술비가 시작됨',
                  pages: [
                    'assets/clause_pages/kb/inj-0155.png',
                    'assets/clause_pages/kb/inj-0156.png',
                    'assets/clause_pages/kb/inj-0157.png',
                    'assets/clause_pages/kb/inj-0158.png'
                  ]
                }
              },
              ndai: {
                '116대': {
                  clause: {
                    caption: '74-1~74-6. 116대질병수술비 Ⅰ~Ⅵ. Ⅰ 15대, Ⅱ 23대, Ⅲ 22대, Ⅳ 49대, Ⅴ 백내장, Ⅵ 6대. 1년 미만 50%',
                    pages: [
                      'assets/clause_pages/kb/n116-0363.png',
                      'assets/clause_pages/kb/n116-0364.png',
                      'assets/clause_pages/kb/n116-0365.png',
                      'assets/clause_pages/kb/n116-0366.png',
                      'assets/clause_pages/kb/n116-0367.png',
                      'assets/clause_pages/kb/n116-0368.png',
                      'assets/clause_pages/kb/n116-0369.png',
                      'assets/clause_pages/kb/n116-0370.png'
                    ]
                  },
                  groups: {
                    '15대질병': { caption: '【별표17-1】 15대질병 분류표. 인쇄 1171쪽~', pages: ['assets/clause_pages/kb/t17-1173.png','assets/clause_pages/kb/t17-1174.png'] },
                    '23대질병': { caption: '【별표17-2】 23대질병 분류표', pages: ['assets/clause_pages/kb/t17-1174.png','assets/clause_pages/kb/t17-1175.png','assets/clause_pages/kb/t17-1176.png'] },
                    '22대질병': { caption: '【별표17-3】 22대질병 분류표', pages: ['assets/clause_pages/kb/t17-1177.png','assets/clause_pages/kb/t17-1178.png'] },
                    '49대질병': { caption: '【별표17-4】 49대질병 분류표', pages: ['assets/clause_pages/kb/t17-1178.png','assets/clause_pages/kb/t17-1179.png','assets/clause_pages/kb/t17-1180.png','assets/clause_pages/kb/t17-1181.png'] },
                    '백내장': { caption: '【별표17-5】 백내장 분류표', pages: ['assets/clause_pages/kb/t17-1181.png'] },
                    '6대질병': { caption: '【별표17-6】 6대질병 분류표. 인쇄 1180쪽', pages: ['assets/clause_pages/kb/t17-1182.png'] }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

function clauseBookPeriod(co, period, data) {
  const book = window.CLAUSE_BOOK;
  if (!book || !co || !book[co.id] || !period) return undefined;
  const simp = (data && data.pData && data.pData.name && data.pData.name.includes('간편')) || (data && data.ptype === 'simplified');
  const line = book[co.id].lines[simp ? 'simplified' : 'standard'];
  if (!line) return null;
  return line.periods[period.id] || null;
}

window.lookupClauseScan = function(co, period, data, riderKey, scanType, selectedNdai) {
  if (!window.CLAUSE_BOOK || !co || !window.CLAUSE_BOOK[co.id]) return null;
  const node = clauseBookPeriod(co, period, data);
  if (!node) return { pages: [], title: '', meta: { page: '이 가입시기·일반/간편 조합의 원문 쪽은 아직 연결되지 않았습니다.' } };
  const riders = node.riders || {};
  let slot = null;
  if (riderKey === 'ndai' || riderKey === 'adult') {
    const key = (selectedNdai || '').match(/\d+대/);
    const nd = key ? riders.ndai && riders.ndai[key[0]] : null;
    if (!nd) return { pages: [], title: '', meta: { page: (selectedNdai || 'N대') + ' 원문 쪽 미연결' } };
    slot = scanType === 'exclusion' ? nd.exclusion : (scanType === 'table' ? null : nd.clause);
    if (scanType === 'table') return { pages: [], title: '', meta: { page: '분류표는 질병군 버튼으로 엽니다.' } };
  } else if (riderKey === 'tier') {
    slot = scanType === 'table' ? riders.tier && riders.tier.table : riders.tier && riders.tier.inclusion;
  } else if (riderKey === 'injury') {
    slot = riders.injury && riders.injury.inclusion;
  } else {
    slot = scanType === 'exclusion' ? riders.basic && riders.basic.exclusion : riders.basic && riders.basic.inclusion;
  }
  if (!slot || !slot.pages || !slot.pages.length) {
    return { pages: [], title: '', meta: { page: '이 특약의 해당 원문 쪽은 아직 없습니다.' } };
  }
  return {
    pages: slot.pages,
    title: slot.caption,
    meta: { product: node.product, type: node.sale, page: slot.caption + ' · ' + node.source }
  };
};

window.lookupClauseGroup = function(co, period, data, grpName) {
  if (!window.CLAUSE_BOOK || !co || !window.CLAUSE_BOOK[co.id]) return null;
  const node = clauseBookPeriod(co, period, data);
  if (!node || !node.riders || !node.riders.ndai) return { pages: [], caption: '' };
  const grp = String(grpName || '');
  const ndai = node.riders.ndai;
  for (const key of Object.keys(ndai)) {
    const groups = ndai[key].groups || {};
    for (const g of Object.keys(groups)) {
      if (grp.includes(g)) {
        return groups[g];
      }
    }
  }
  return { pages: [], caption: '' };
};
