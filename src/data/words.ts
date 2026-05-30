/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TOEICWord, Rank, RankInfo } from '../types';

export const RANK_INFOS: Record<Rank, RankInfo> = {
  '인턴': {
    title: '인턴',
    nextTitle: '사원',
    xpRequired: 300,
    unlockedCategories: ['인사/채용', '사무실 복지', '사내 공지'],
    color: 'text-slate-500 border-slate-300 bg-slate-50',
    bgGrad: 'from-slate-100 to-zinc-200',
    avatar: '🏃‍♂️',
    quote: '준비성은 만점! 복사기 작동법부터 완벽하게 마스터해보자!'
  },
  '사원': {
    title: '사원',
    nextTitle: '대리',
    xpRequired: 800,
    unlockedCategories: ['마케팅/광고', '고객 지원', '사무/운송'],
    color: 'text-blue-600 border-blue-200 bg-blue-50',
    bgGrad: 'from-blue-50 to-indigo-100',
    avatar: '🧑‍💻',
    quote: '이제 실전에 투입됩니다. 이메일과 기획서 초안 쓰기 마스터!'
  },
  '대리': {
    title: '대리',
    nextTitle: '과장',
    xpRequired: 1600,
    unlockedCategories: ['회의/협상', '금융/은행', '행사/전시'],
    color: 'text-emerald-600 border-emerald-200 bg-emerald-50',
    bgGrad: 'from-emerald-50 to-teal-100',
    avatar: '💼',
    quote: '실무의 주축! 계약 체결과 거래처 프레젠테이션을 이끄세요!'
  },
  '과장': {
    title: '과장',
    nextTitle: 'CEO',
    xpRequired: 2800,
    unlockedCategories: ['재무/정산', '기술/IT', 'M&A/투자'],
    color: 'text-violet-600 border-violet-200 bg-violet-50',
    bgGrad: 'from-violet-50 to-purple-100',
    avatar: '👔',
    quote: '의사결정의 핵심! 분기 예산 수립과 해외 전략 투자 지휘!'
  },
  'CEO': {
    title: 'CEO',
    nextTitle: null,
    xpRequired: Infinity,
    unlockedCategories: ['경영전략/리더십', '글로벌 경제', '대외 협력'],
    color: 'text-amber-600 border-amber-300 bg-amber-50',
    bgGrad: 'from-amber-50 to-yellow-100',
    avatar: '👑',
    quote: '토익 상사의 최종 보스! 글로벌 비즈니스계의 리더가 된 당신!'
  }
};

export const INSTANT_TOEIC_WORDS: TOEICWord[] = [
  // --- 인턴 단계 (기초 필수 단어) ---
  {
    id: 1,
    category: '인사/채용',
    rank_level: '인턴',
    word: 'recruit',
    meaning: '모집하다, 신입사원을 뽑다',
    collocation: 'recruit qualified candidates',
    example_en: 'The human resources department plans to recruit qualified candidates next month.',
    example_ko: '인사부는 다음 달에 자격을 갖춘 지원자들을 모집할 계획이다.'
  },
  {
    id: 2,
    category: '인사/채용',
    rank_level: '인턴',
    word: 'applicant',
    meaning: '지원자, 신청자',
    collocation: 'a qualified applicant',
    example_en: 'Each applicant is requested to submit two letters of recommendation.',
    example_ko: '각 지원자는 추천서 두 장을 제출하도록 요구받는다.'
  },
  {
    id: 3,
    category: '사무실 복지',
    rank_level: '인턴',
    word: 'submit',
    meaning: '제출하다',
    collocation: 'submit the business proposal',
    example_en: 'Please submit the monthly expense report to your immediate supervisor.',
    example_ko: '월간 지출 보고서를 직속 상관에게 제출해 주세요.'
  },
  {
    id: 4,
    category: '사내 공지',
    rank_level: '인턴',
    word: 'comply',
    meaning: '따르다, 준수하다 (with)',
    collocation: 'comply with company regulations',
    example_en: 'All personnel must comply with the strict safety guidelines at the site.',
    example_ko: '모든 직원은 현장의 엄격한 안전 수칙을 준수해야 한다.'
  },
  {
    id: 5,
    category: '사내 공지',
    rank_level: '인턴',
    word: 'refrain',
    meaning: '자제하다, 그만두다 (from)',
    collocation: 'refrain from using cell phones',
    example_en: 'Employees are requested to refrain from personal conversations during the training session.',
    example_ko: '직원들은 교육 과정 동안 개인적인 대화를 자제해 달라는 요청을 받는다.'
  },
  {
    id: 6,
    category: '사무실 복지',
    rank_level: '인턴',
    word: 'reimburse',
    meaning: '변제하다, 비용을 상환해 주다',
    collocation: 'reimburse travel expenses',
    example_en: 'The firm will reimburse you for any business-related travel expenses.',
    example_ko: '회사는 업무와 관련된 출장 경비를 상환해 줄 것이다.'
  },
  {
    id: 7,
    category: '인사/채용',
    rank_level: '인턴',
    word: 'eligible',
    meaning: '자격이 있는, ~할 자격이 되는',
    collocation: 'eligible for a promotion',
    example_en: 'Full-time employees who work here for over a year are eligible for health benefits.',
    example_ko: '이곳에서 1년 이상 근무한 정규직 직원들은 의료 혜택을 받을 자격이 있다.'
  },
  {
    id: 8,
    category: '사내 공지',
    rank_level: '인턴',
    word: 'postpone',
    meaning: '연기하다, 미루다',
    collocation: 'postpone the orientation session',
    example_en: 'Due to severe weather conditions, we had to postpone the outdoor workshop.',
    example_ko: '기상 악화로 인해 야외 워크숍을 연기해야만 했다.'
  },
  {
    id: 9,
    category: '사무실 복지',
    rank_level: '인턴',
    word: 'attendance',
    meaning: '출석, 참석',
    collocation: 'record-breaking attendance',
    example_en: 'The HR team keeps careful track of employee daily attendance.',
    example_ko: '인사팀은 직원들의 매일 출석 현황을 신중하게 기록하고 요약한다.'
  },
  {
    id: 10,
    category: '사내 공지',
    rank_level: '인턴',
    word: 'notify',
    meaning: '알리다, 통보하다',
    collocation: 'notify the manager of changes',
    example_en: 'In case of an emergency, please notify the security desk immediately.',
    example_ko: '비상시에는 즉시 보안 데스크에 통보해 주시기 바랍니다.'
  },

  // --- 사원 단계 (초급 핵심 단어) ---
  {
    id: 11,
    category: '마케팅/광고',
    rank_level: '사원',
    word: 'promote',
    meaning: '홍보하다, 승진시키다',
    collocation: 'promote a new product line',
    example_en: 'The agency spent thousands of dollars to promote the upcoming eco-friendly campaign.',
    example_ko: '대행사는 곧 있을 환경 친화적 캠페인을 홍보하기 위해 수천 달러를 지출했다.'
  },
  {
    id: 12,
    category: '고객 지원',
    rank_level: '사원',
    word: 'address',
    meaning: '다루다, 처리하다, 연설하다',
    collocation: 'address customer complaints',
    example_en: 'We will address all customer concerns as promptly as possible.',
    example_ko: '우리는 모든 고객 우려 사항을 가능한 한 신속하게 처리할 것이다.'
  },
  {
    id: 13,
    category: '사무/운송',
    rank_level: '사원',
    word: 'delay',
    meaning: '지연, 지연시키다',
    collocation: 'unforeseeable shipping delay',
    example_en: 'The unexpected storm caused a substantial delay in the delivery of office supplies.',
    example_ko: '예상치 못한 폭풍이 사무용품 배송에 상당한 지연을 초래했다.'
  },
  {
    id: 14,
    category: '마케팅/광고',
    rank_level: '사원',
    word: 'launch',
    meaning: '출시(하다), 시작(하다)',
    collocation: 'launch a promotional campaign',
    example_en: 'The technology start-up will launch its latest mobile application next Monday.',
    example_ko: '정보기술 기반 스타트업은 다음 주 월요일에 최신 모바일 애플리케이션을 출시할 예정이다.'
  },
  {
    id: 15,
    category: '마케팅/광고',
    rank_level: '사원',
    word: 'distribute',
    meaning: '배포하다, 유통하다',
    collocation: 'distribute marketing flyers',
    example_en: 'Please distribute copies of the revised schedule to all division heads.',
    example_ko: '개정된 일정표 사본을 모든 부서장에게 배포해 주십시오.'
  },
  {
    id: 16,
    category: '고객 지원',
    rank_level: '사원',
    word: 'satisfaction',
    meaning: '만족(도)',
    collocation: 'customer satisfaction survey',
    example_en: 'Our primary goal is to ensure highest level of satisfaction for all guests.',
    example_ko: '우리의 최우선 목표는 모든 투숙객에게 가장 높은 수준의 만족을 보장하는 것이다.'
  },
  {
    id: 17,
    category: '사무/운송',
    rank_level: '사원',
    word: 'inventory',
    meaning: '재고, 물품 목록',
    collocation: 'take physical inventory',
    example_en: 'The warehouse staff checks the inventory twice a week to avoid shortages.',
    example_ko: '창고 직원들은 부족 사태를 방지하기 위해 일주일에 두 번 재고를 점검한다.'
  },
  {
    id: 18,
    category: '마케팅/광고',
    rank_level: '사원',
    word: 'accumulate',
    meaning: '축적하다, 모으다',
    collocation: 'accumulate loyalty reward points',
    example_en: 'Subscribers can accumulate bonus miles every time they book a flight online.',
    example_ko: '구독자들은 온라인으로 항공편을 예약할 때마다 보너스 마일을 축적할 수 있다.'
  },
  {
    id: 19,
    category: '사무/운송',
    rank_level: '사원',
    word: 'outdated',
    meaning: '오래된, 시대에 뒤떨어진',
    collocation: 'outdated operating systems',
    example_en: 'The manager decided to replace the outdated printers with touch-screen models.',
    example_ko: '매니저는 오래된 프린터들을 터치스크린 탑재 모델로 교체하기로 결정했다.'
  },
  {
    id: 20,
    category: '사무/운송',
    rank_level: '사원',
    word: 'dispatch',
    meaning: '발송하다, 급파하다',
    collocation: 'dispatch a technician emergency',
    example_en: 'An experienced contractor will be dispatched to resolve the technical issue shortly.',
    example_ko: '기술적 문제를 즉시 해결하기 위해 숙련된 협력업체 직원이 곧 파견될 것이다.'
  },

  // --- 대리 단계 (중급 대비 단어) ---
  {
    id: 21,
    category: '회의/협상',
    rank_level: '대리',
    word: 'negotiate',
    meaning: '협상하다, 타결하다',
    collocation: 'negotiate a contract renewal',
    example_en: 'The legal department is working hard to negotiate favorable terms of the agreement.',
    example_ko: '법무팀은 계약 합의안에 대해 유리한 조건을 협상하기 위해 열심히 노력하고 있다.'
  },
  {
    id: 22,
    category: '회의/협상',
    rank_level: '대리',
    word: 'collaborate',
    meaning: '협력하다, 공동으로 일하다 (on)',
    collocation: 'collaborate with domestic developers',
    example_en: 'Designers and local marketing specialists will collaborate on the brand restructuring project.',
    example_ko: '디자이너들과 현지 마케팅 전문가들이 브랜드 구조 개편 프로젝트를 위해 협력할 것이다.'
  },
  {
    id: 23,
    category: '금융/은행',
    rank_level: '대리',
    word: 'transaction',
    meaning: '거래, 처리',
    collocation: 'process financial transactions',
    example_en: 'The bank uses a secure encryption network system to process online transactions.',
    example_ko: '그 은행은 온라인 거래를 처리하기 위해 보안 암호화 네트워크 시스템을 사용한다.'
  },
  {
    id: 24,
    category: '금융/은행',
    rank_level: '대리',
    word: 'fluctuate',
    meaning: '변동하다, 불규칙하게 움직이다',
    collocation: 'prices fluctuate seasonally',
    example_en: 'Fuel surcharge costs fluctuate dramatically depending on the global oil price indexes.',
    example_ko: '유류 할증료 요금은 글로벌 유가 지수에 따라 급격하게 변동한다.'
  },
  {
    id: 25,
    category: '행사/전시',
    rank_level: '대리',
    word: 'accommodate',
    meaning: '수용하다, 부응하다, 편의를 도모하다',
    collocation: 'accommodate high attendance',
    example_en: 'The grand ballroom is large enough to accommodate up to five hundred guests comfortably.',
    example_ko: '대연회장은 최대 500명의 하객을 편안하게 수용할 수 있을 만큼 넓다.'
  },
  {
    id: 26,
    category: '회의/협상',
    rank_level: '대리',
    word: 'unanimous',
    meaning: '만장일치의, 합의된',
    collocation: 'reached a unanimous decision',
    example_en: 'The executive committee reached a unanimous agreement in choosing the next CEO.',
    example_ko: '임원위원회는 차기 CEO 선출에 있어 만장일치 합의에 도달했다.'
  },
  {
    id: 27,
    category: '회의/협상',
    rank_level: '대리',
    word: 'procrastinate',
    meaning: '미루다, 미루고 시간을 끌다',
    collocation: 'procrastinate on task completion',
    example_en: 'To make sure you hit the key quarterly goals, you should not procrastinate on preparation.',
    example_ko: '주요 분기별 목표를 달성하려면 준비 작업을 미뤄서는 안 된다.'
  },
  {
    id: 28,
    category: '금융/은행',
    rank_level: '대리',
    word: 'default',
    meaning: '채무 불이행, 체납(하다)',
    collocation: 'default on a business loan',
    example_en: 'Failure to repay the mortgage on time will cause the borrower to default.',
    example_ko: '담보대출금을 제때 상환하지 않으면 상환인은 체납 상태에 이르게 된다.'
  },
  {
    id: 29,
    category: '행사/전시',
    rank_level: '대리',
    word: 'brochure',
    meaning: '안내 소책자, 브로셔',
    collocation: 'distribute promotional brochures',
    example_en: 'The detailed brochure contains essential safety reminders about using the complex machinery.',
    example_ko: '상세 안내 책자에는 복잡한 기계 장치 사용에 대한 필수 안전 수칙이 포함되어 있다.'
  },
  {
    id: 30,
    category: '금융/은행',
    rank_level: '대리',
    word: 'lucrative',
    meaning: '수익성 높은, 돈벌이가 잘되는',
    collocation: 'a lucrative contract deal',
    example_en: 'The merger turned out to be a highly lucrative transaction for both pharmaceutical corporations.',
    example_ko: '합병은 두 제약 기업 모두에게 매우 수익성이 좋은 고수익 거래로 판명되었다.'
  },

  // --- 과장 단계 (상급 수준 단어) ---
  {
    id: 31,
    category: '재무/정산',
    rank_level: '과장',
    word: 'allocate',
    meaning: '할당하다, 배분하다',
    collocation: 'allocate department budgets',
    example_en: 'The director decided to allocate additional funds to the engineering project team.',
    example_ko: '이사는 공학 프로젝트 팀에 추가 기금을 배당하기로 결정했다.'
  },
  {
    id: 32,
    category: '기술/IT',
    rank_level: '과장',
    word: 'implement',
    meaning: '실행하다, 이행하다, 시행하다',
    collocation: 'implement a cloud system policy',
    example_en: 'We will implement the state-of-the-art secure verification systems next Friday night.',
    example_ko: '우리는 다음 주 금요일 밤에 최첨단 보안 인증 시스템을 구축하여 시행할 예정이다.'
  },
  {
    id: 33,
    category: 'M&A/투자',
    rank_level: '과장',
    word: 'contingency',
    meaning: '비상사태, 우발 사태',
    collocation: 'contingency plan structure',
    example_en: 'A proper investment portfolio should include a contingency backup budget to withstand index dips.',
    example_ko: '적절한 투자 포트폴리오는 지수 하락에 견디기 위해 우발 비상 자금을 포함해야 한다.'
  },
  {
    id: 34,
    category: '재무/정산',
    rank_level: '과장',
    word: 'audit',
    meaning: '감사(하다), 심사(하다)',
    collocation: 'conduct a rigorous financial audit',
    example_en: 'An independent agency will conduct an annual financial audit next month.',
    example_ko: '독립적인 제3의 기관이 다음 달에 연례 재무 감사를 실시할 예정이다.'
  },
  {
    id: 35,
    category: '재무/정산',
    rank_level: '과장',
    word: 'revenue',
    meaning: '매출, 수익, 소득',
    collocation: 'generate steady sales revenue',
    example_en: 'The robust marketing campaign has successfully boosted the corporation quarterly revenue.',
    example_ko: '강력한 마케팅 캠페인은 회사의 분기별 총액 수익을 성공적으로 증가시켰다.'
  },
  {
    id: 36,
    category: '기술/IT',
    rank_level: '과장',
    word: 'redundancy',
    meaning: '불필요한 중복, 감원, 인원 정리',
    collocation: 'eliminate unnecessary redundancies',
    example_en: 'To optimize server loading processes, developers worked to eliminate database redundancy.',
    example_ko: '서버 로딩 절차를 최적화하기 위해, 개발자들은 불필요한 데이터베이스 중복 파일을 없앴다.'
  },
  {
    id: 37,
    category: 'M&A/투자',
    rank_level: '과장',
    word: 'acquisition',
    meaning: '인수, 획득',
    collocation: 'corporate merger and acquisition',
    example_en: 'The massive retail enterprise finalized its acquisition of a promising e-commerce provider.',
    example_ko: '거대 유통 대기업은 유망한 전자상거래 공급업체 인수를 마무리 지었다.'
  },
  {
    id: 38,
    category: '기술/IT',
    rank_level: '과장',
    word: 'obsolete',
    meaning: '쓸모없게 된, 중단된',
    collocation: 'render tech systems obsolete',
    example_en: 'The sudden system patch made older operating units entirely obsolete within days.',
    example_ko: '갑작스러운 시스템 패치로 인해 하위 사양 작동 장치들은 단 몇 일 만에 쓸모없게 사장되었다.'
  },
  {
    id: 39,
    category: '재무/정산',
    rank_level: '과장',
    word: 'deficit',
    meaning: '적자, 결손, 부족액',
    collocation: 'severe quarterly budget deficit',
    example_en: 'The manufacturing sector is facing a severe budget deficit due to high material rates.',
    example_ko: '제조 분야는 높은 원부자재 시세 비율로 인해 타격이 큰 예산 적자에 직면해 있다.'
  },
  {
    id: 40,
    category: 'M&A/투자',
    rank_level: '과장',
    word: 'lucrative',
    meaning: '수익성이 좋은, 고소득의',
    collocation: 'lucrative strategic partnerships',
    example_en: 'Forming strategic alliances in the Southeast Asian logistics sector has proven highly lucrative.',
    example_ko: '동남아시아 물류 부문에서 구성한 전략적 동맹은 대단한 고부가가치 수익성임이 진명되었다.'
  },

  // --- CEO 단계 (최종 만점 수준 단어) ---
  {
    id: 41,
    category: '경영전략/리더십',
    rank_level: 'CEO',
    word: 'predecessor',
    meaning: '전임자, 이전 모델',
    collocation: 'successor and retired predecessor',
    example_en: 'The newly appointed president thanked his predecessor for outstanding guidance for decade.',
    example_ko: '새로 부임한 총괄 사장은 지난 10년간 이룩한 대단한 영도력에 대해 그의 전임자에게 사의를 전했다.'
  },
  {
    id: 42,
    category: '글로벌 경제',
    rank_level: 'CEO',
    word: 'unprecedented',
    meaning: '전례 없는',
    collocation: 'unprecedented global market expansion',
    example_en: 'The company reported an unprecedented sales increase of forty percent in the European region.',
    example_ko: '사 측은 유럽 권역 내 전례 없는 대망의 40% 매출 증가 성장률을 통보했다.'
  },
  {
    id: 43,
    category: '대외 협력',
    rank_level: 'CEO',
    word: 'subsidiary',
    meaning: '자회사, 보조적인',
    collocation: 'oversee international subsidiaries',
    example_en: 'The board of trust voted to sell three weak subsidiaries to keep core businesses afloat.',
    example_ko: '신탁 이사회는 핵심 주력 부문의 자금 생존을 도모하고자 비인기 자회사 3곳의 매각 투표를 가결했다.'
  },
  {
    id: 44,
    category: '경영전략/리더십',
    rank_level: 'CEO',
    word: 'monopoly',
    meaning: '독점(권)',
    collocation: 'achieve complete absolute monopoly',
    example_en: 'Unfair regulations prevented any single network carrier from building an absolute monopoly.',
    example_ko: '불평등 규제는 어떠한 망 사업자 일방이 국보급 유통 구조 독점 체제를 점령하는 일을 불허했다.'
  },
  {
    id: 45,
    category: '글로벌 경제',
    rank_level: 'CEO',
    word: 'stringent',
    meaning: '엄격한, 긴박한',
    collocation: 'stringent environmental protections',
    example_en: 'All construction materials must pass stringent quality controls before getting deployed.',
    example_ko: '모든 건축 자재는 가설 시편 검용 전 엄격한 한도 공인 품질 감리 선을 완비해야만 한다.'
  },
  {
    id: 46,
    category: '대외 협력',
    rank_level: 'CEO',
    word: 'complimentary',
    meaning: '무료의, 칭찬하는',
    collocation: 'complimentary corporate lunch voucher',
    example_en: 'We are delighted to offer complimentary premium memberships to our diamond stakeholders.',
    example_ko: '우리는 다이아몬드 주주 일동에게 무료 프리미엄 계정 특전을 공여하게 됨을 대단히 기쁘게 여긴다.'
  },
  {
    id: 47,
    category: '경영전략/리더십',
    rank_level: 'CEO',
    word: 'scrutinize',
    meaning: '정밀하게 분석하다, 세밀히 검토하다',
    collocation: 'scrutinize commercial contracts thoroughly',
    example_en: 'Financial analysts was called to scrutinize every detail of the proposed multi-billion merger.',
    example_ko: '재무 분석 전문가들은 수십억 규모의 추진 합병 계약에 대한 세부 조항 일체를 정밀 분석하도록 촉구받았다.'
  },
  {
    id: 48,
    category: '경영전략/리더십',
    rank_level: 'CEO',
    word: 'consolidation',
    meaning: '합병, 강화, 통합',
    collocation: 'prompting structural warehouse consolidation',
    example_en: 'The sudden consolidation of logistical centers vastly reduced regional handling overhead cost limits.',
    example_ko: '전격적인 물류 지소 통합은 역내 처리에 소요되던 고정 하역 보전 제비용 한계를 크게 일소시켰다.'
  },
  {
    id: 49,
    category: '글로벌 경제',
    rank_level: 'CEO',
    word: 'detrimental',
    meaning: '해로운, 유해한 (to)',
    collocation: 'highly detrimental to development projects',
    example_en: 'Adopting highly volatile currency systems would be extremely detrimental to long term asset values.',
    example_ko: '변동이 지나치게 급격한 화폐 체제 편입을 획책하는 것은 장기 자산 가치 유지에 치명적으로 유해하다.'
  },
  {
    id: 50,
    category: '대외 협력',
    rank_level: 'CEO',
    word: 'reciprocity',
    meaning: '상호 의존, 호혜성',
    collocation: 'mutual trade reciprocity standard',
    example_en: 'International strategic treaties are built upon a legal code of strict trade reciprocity standard.',
    example_ko: '초국가적 상호 안보 무역 조약 체결의 기저는 호혜 주의의 엄격한 법률 기재 표준을 근저로 한다.'
  }
];
