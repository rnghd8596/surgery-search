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
      standard: {
        periods: {
          meritz_201912: {
            product: '케어프리 M-Basket2007',
            sale: '판매 2019-12-18~2020-11-03',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/a_dis.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/a_exc.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/a_tier.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/a_tier.png'] } },
              injury: { inclusion: { caption: '상해수술비', pages: ['assets/clause_pages/meritz/a_inj.png'] } },
              ndai: { '32대': { clause: { caption: '32대', pages: ['assets/clause_pages/meritz/a_32.png'] }, table: { caption: '32대', pages: ['assets/clause_pages/meritz/a_32.png'] } } }
            }
          },
          meritz_202011: {
            product: '케어프리 M-Basket2011',
            sale: '판매 2020-11-04~2020-12-31',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/b_dis.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/b_exc.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/b_tier.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/b_tier.png'] } },
              injury: { inclusion: { caption: '상해수술비', pages: ['assets/clause_pages/meritz/b_inj.png'] } },
              ndai: { '82대': { clause: { caption: '82대', pages: ['assets/clause_pages/meritz/b_82.png'] }, table: { caption: '82대', pages: ['assets/clause_pages/meritz/b_82.png'] } }, '32대': { clause: { caption: '32대', pages: ['assets/clause_pages/meritz/b_32.png'] }, table: { caption: '32대', pages: ['assets/clause_pages/meritz/b_32.png'] } } }
            }
          },
          meritz_202101: {
            product: '케어프리 M-Basket2101',
            sale: '판매 2021-01-01~2022-03-31',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/c_dis.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/c_exc.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/c_tier.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/c_tier.png'] } },
              injury: { inclusion: { caption: '상해수술비', pages: ['assets/clause_pages/meritz/c_inj.png'] } },
              ndai: { '82대': { clause: { caption: '82대', pages: ['assets/clause_pages/meritz/c_82.png'] }, table: { caption: '82대', pages: ['assets/clause_pages/meritz/c_82.png'] } }, '32대': { clause: { caption: '32대', pages: ['assets/clause_pages/meritz/c_32.png'] }, table: { caption: '32대', pages: ['assets/clause_pages/meritz/c_32.png'] } } }
            }
          },
          meritz_202207: {
            product: '케어프리 M-Basket2204',
            sale: '판매 2022-07-01~2024-12-31',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/d_dis.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/d_exc.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/d_tier.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/d_tier.png'] } },
              injury: { inclusion: { caption: '상해수술비', pages: ['assets/clause_pages/meritz/d_inj.png'] } },
              ndai: { '131대': { clause: { caption: '131대', pages: ['assets/clause_pages/meritz/d_131.png'] }, table: { caption: '131대', pages: ['assets/clause_pages/meritz/d_131.png'] } }, '32대': { clause: { caption: '32대', pages: ['assets/clause_pages/meritz/d_32.png'] }, table: { caption: '32대', pages: ['assets/clause_pages/meritz/d_32.png'] } } }
            }
          },
          meritz_202501: {
            product: '케어프리 M-Basket2501',
            sale: '판매 2025-01-01~',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/e_dis.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/e_exc.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/e_tier.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/e_tier.png'] } },
              injury: { inclusion: { caption: '상해수술비', pages: ['assets/clause_pages/meritz/e_inj.png'] } },
              ndai: { '131대': { clause: { caption: '131대', pages: ['assets/clause_pages/meritz/e_131.png'] }, table: { caption: '131대', pages: ['assets/clause_pages/meritz/e_131.png'] } } }
            }
          }
        }
      },
      simplified: {
        periods: {
          meritz_201912: {
            product: 'The간편한 2004',
            sale: '판매 2020-04-01~2020-05-18',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/q_dis.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/q_dis.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/q_tier.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/q_tier.png'] } },
              injury: { inclusion: { caption: '상해수술비', pages: ['assets/clause_pages/meritz/q_inj.png'] } },
              ndai: { '32대': { clause: { caption: '32대', pages: ['assets/clause_pages/meritz/q_32.png'] }, table: { caption: '32대', pages: ['assets/clause_pages/meritz/q_32.png'] } } }
            }
          },
          meritz_202011: {
            product: 'The간편한 2011',
            sale: '판매 2020-11-04~2020-12-31',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/b_gtier.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/b_gtier.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/b_gtier.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/b_gtier.png'] } },
              ndai: { '32대': { clause: { caption: '32대', pages: ['assets/clause_pages/meritz/b_gtier.png'] }, table: { caption: '32대', pages: ['assets/clause_pages/meritz/b_gtier.png'] } } }
            }
          },
          meritz_202101: {
            product: '335오!간편 2101',
            sale: '판매 2021-02-18~2021-03-31',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/c_g32.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/c_g32.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/c_g32.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/c_g32.png'] } },
              ndai: { '32대': { clause: { caption: '32대', pages: ['assets/clause_pages/meritz/c_g32.png'] }, table: { caption: '32대', pages: ['assets/clause_pages/meritz/c_g32.png'] } } }
            }
          },
          meritz_202207: {
            product: '간편355 2210',
            sale: '판매 2022-10-17~2022-11-08',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/p_dis.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/p_dis.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/p_32.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/p_32.png'] } },
              injury: { inclusion: { caption: '상해수술비', pages: ['assets/clause_pages/meritz/p_inj.png'] } },
              ndai: { '32대': { clause: { caption: '32대', pages: ['assets/clause_pages/meritz/p_32.png'] }, table: { caption: '32대', pages: ['assets/clause_pages/meritz/p_32.png'] } } }
            }
          },
          meritz_202501: {
            product: '통합간편 2501 일반심사형',
            sale: '판매 2025-01-01~2025-01-12',
            source: '메리츠 공시실 약관',
            riders: {
              basic: { inclusion: { caption: '질병수술비', pages: ['assets/clause_pages/meritz/g_dis.png'] }, exclusion: { caption: '질병수술비 제외', pages: ['assets/clause_pages/meritz/g_dis.png'] } },
              tier: { inclusion: { caption: '1~5종', pages: ['assets/clause_pages/meritz/g_tier.png'] }, table: { caption: '1~5종 분류표', pages: ['assets/clause_pages/meritz/g_tier.png'] } },
              injury: { inclusion: { caption: '상해수술비', pages: ['assets/clause_pages/meritz/g_inj.png'] } },
              ndai: { '32대': { clause: { caption: '32대', pages: ['assets/clause_pages/meritz/g_tier.png'] }, table: { caption: '32대', pages: ['assets/clause_pages/meritz/g_tier.png'] } } }
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
          },
          hyundai_perfect_hi2301: {
            product: '무배당 퍼펙트플러스종합보험(세만기형) Hi2301. 다이렉트 H건강보험이 아님',
            sale: '판매 2023-01-01~2023-03-31',
            source: '현대해상 대리점 공시 약관',
            riders: {
              tier: {
                table: {
                  caption: '대리점 퍼펙트플러스 Hi2301. 제85항 체외충격파쇄석술 1종. 인쇄 708쪽',
                  pages: ['assets/clause_pages/hyundai/perfect_hi2301_p708.png']
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
  },
  hanwhafire: {
    lines: {
      standard: {
        periods: {
          hanwha_2023_07: {
            product: '한화 더건강한 한아름종합보험 무배당2504',
            sale: '저장소의 한아름 책 중 가장 앞. 상품코드 2504',
            source: '한화손보 공시실 약관',
            riders: {
              tier: {
                table: {
                  caption: '【별표45】 1-5종수술 분류표. 인쇄 751쪽. 제3항 유방절단 3종, 제3-1항 N62 유방절단 1종, 제4항 1종',
                  pages: ['assets/clause_pages/hanwha/hana2504_t45_p751.png']
                }
              }
            }
          }
        }
      }
    }
  },
  nhfire: {
    lines: {
      standard: {
        periods: {
          nh_2025_01: {
            product: '무배당 NH가성비굿건강보험 2304',
            sale: '판매 2023-09-01~2023-10-03',
            source: 'NH농협손해보험 공시실 약관',
            riders: {
              tier: {
                table: {
                  caption: '제85항 체외충격파쇄석술 1종. 인쇄 642쪽. 남성 N60~N64 피하 유방절단은 제4항',
                  pages: ['assets/clause_pages/nhfire/gasungbi2304_p642.png']
                }
              }
            }
          }
        }
      }
    }
  },
  lotte: {
    lines: {
      simplified: {
        periods: {
          lotte_2021_01: {
            product: '무배당 let:simple 3N5 간편맞춤 건강보험(세만기형) 2504',
            sale: '판매 2025-04-01~2025-06-15',
            source: '롯데손해보험 공시실 약관',
            riders: {
              tier: {
                table: {
                  caption: '〈별표25〉 1~5종 수술분류표Ⅲ. 인쇄 1151쪽. 제3항 유방절단 3종, 제4항 1종(맘모톰)',
                  pages: ['assets/clause_pages/lotte/n3_2504_t25_p1151.png']
                }
              }
            }
          }
        }
      }
    }
  },
  shinhanlife: {
    lines: {
      simplified: {
        periods: {
          shinhanlife_2020_01: {
            product: '(간편)신한통합건강보장보험 원(ONE)',
            sale: '판매 2024-04-01~2024-05-02',
            source: '신한라이프 공시실 약관',
            riders: {
              tier: {
                table: {
                  caption: '제87항 체외충격파쇄석술 2종. 인쇄 3026쪽. 체외충격파치료술은 제외',
                  pages: ['assets/clause_pages/shinhan/one_202404_eswl_p3026.png']
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
    let label = selectedNdai || '';
    if (!label && riders.ndai) label = Object.keys(riders.ndai)[0] || '';
    const key = String(label).match(/\d+대/);
    const nd = key ? riders.ndai && riders.ndai[key[0]] : null;
    if (!nd) return { pages: [], title: '', meta: { page: (selectedNdai || 'N대') + ' 원문 쪽 미연결' } };
    slot = scanType === 'exclusion' ? (nd.exclusion || nd.clause) : nd.clause;
    if (scanType === 'table') {
      const tbl = (nd.table && nd.table.pages && nd.table.pages.length) ? nd.table : nd.clause;
      if (tbl && tbl.pages && tbl.pages.length) {
        return { pages: tbl.pages, title: tbl.caption || '', meta: { page: tbl.caption || '' } };
      }
      return { pages: [], title: '', meta: { page: '분류표는 질병군 버튼으로 엽니다.' } };
    }
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
