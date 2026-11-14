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
      }
    }
  },
  meritz: {
    lines: {
      standard: {
        periods: {
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
