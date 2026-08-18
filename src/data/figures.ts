/** assets/CREDITS.md 의 배치표를 그대로 옮긴 것. 캡션도 그 표의 문구다. */

export type FigureKind =
  /** 본문 도판 — <figure> + 캡션, 클릭하면 확대 */
  | 'figure'
  /** 본문 삽화 — 캡션 없이 흐름 안에 */
  | 'illustration'
  /** 장식용 — 배지·썸네일·아이콘. alt="" + aria-hidden */
  | 'decoration'

export interface Figure {
  file: string
  kind: FigureKind
  /** figure/illustration 에 필요. decoration 은 비운다. */
  alt?: string
  caption?: string
  /** 도판 안 영문 라벨의 한국어 대응. 그림 1·4·5 에 붙는다. */
  labels?: [string, string][]
  /** 세로로 긴 삽화 — 2단 배치 시 오른쪽 열로 */
  portrait?: boolean
}

export const FIGURES: Record<string, Figure> = {
  // ---------------------------------------------------------------- 도판 5장
  'fig1-domains': {
    file: 'fig1-domains.png',
    kind: 'figure',
    alt: '네 영역이 꽃잎처럼 맞물린 다이어그램. AI와 마주하기를 아래에 두고 AI와 창작하기·AI 관리하기가 좌우로, AI 만들어가기가 위에 놓여 있다.',
    caption: '그림 1. AILit 프레임워크의 네 영역',
    labels: [
      ['Engage with AI', 'AI와 마주하기'],
      ['Create with AI', 'AI와 창작하기'],
      ['Manage AI', 'AI 관리하기'],
      ['Shape AI', 'AI 만들어가기'],
    ],
  },
  'fig2-shared-effort': {
    file: 'fig2-shared-effort.png',
    kind: 'figure',
    alt: '여러 교육자가 함께 퍼즐 조각을 맞추는 삽화.',
    caption: '그림 2. AI 리터러시는 공동의 책임이며, 교육자 각자가 고유한 전문성을 보탠다',
  },
  'fig3-respondents': {
    file: 'fig3-respondents.png',
    kind: 'figure',
    alt: '피드백 설문 응답자의 직군 분포를 나타낸 원그래프. 교사가 41%로 가장 큰 비중을 차지한다.',
    caption: '그림 3. AILit 피드백 설문 응답자의 직군 분포',
  },
  'fig4-disciplines': {
    file: 'fig4-disciplines.png',
    kind: 'figure',
    alt: 'AI 리터러시를 가운데 두고 여섯 학문 분야가 원으로 둘러싼 다이어그램. 각 분야마다 세 개의 하위 개념이 달려 있다.',
    caption: '그림 4. AI 리터러시는 여러 분야의 학술적 성과에서 길어 올린 것이다',
    labels: [
      ['AI Literacy', 'AI 리터러시'],
      ['Computer Science', '컴퓨터과학'],
      ['Abstraction · Algorithmic Thinking · Decomposition', '추상화 · 알고리즘적 사고 · 분해'],
      ['Media Literacy', '미디어 리터러시'],
      ['Critical Thinking and Evaluation · Access and Inquiry · Creative Expression', '비판적 사고와 평가 · 접근과 탐구 · 창의적 표현'],
      ['Digital Literacy', '디지털 리터러시'],
      ['Intellectual Property · Digital Citizenship · Safety and Privacy', '지식재산 · 디지털 시민성 · 안전과 프라이버시'],
      ['Ethics', '윤리학'],
      ['Fairness · Benefits and Risks · Responsibility', '공정성 · 이익과 위험 · 책임'],
      ['Design Thinking', '디자인 씽킹'],
      ['Ideation · Problem Formulation · Iteration', '발상 · 문제 정식화 · 반복'],
      ['Data Science', '데이터과학'],
      ['Data Analysis · Bias · Inference', '데이터 분석 · 편향 · 추론'],
    ],
  },
  'fig5-domains': {
    file: 'fig5-domains.png',
    kind: 'figure',
    alt: '네 영역을 학습 경로로 배치한 도판. AI와 마주하기에서 출발해 AI와 창작하기·AI 관리하기를 거쳐 AI 만들어가기로 이어진다.',
    caption: '그림 5. AILit 프레임워크의 영역들',
    labels: [
      ['Engage with AI', 'AI와 마주하기'],
      ['Learners recognise AI, evaluate outputs and consider its role in daily life.',
        '학습자는 AI를 인식하고, 산출물을 평가하며, 일상 속 AI의 역할을 고려한다.'],
      ['Create with AI', 'AI와 창작하기'],
      ['Manage AI', 'AI 관리하기'],
      ['Learners use AI intentionally and reflectively to explore ideas and delegate tasks.',
        '학습자는 아이디어를 탐색하고 과제를 위임하기 위해 AI를 의도적이고 성찰적으로 사용한다.'],
      ['Shape AI', 'AI 만들어가기'],
      ['Learners apply their technical understanding to propose and improve AI systems that promote societal benefit',
        '학습자는 사회적 이익을 촉진하는 AI 시스템을 제안하고 개선하기 위해 자신의 기술적 이해를 적용한다'],
    ],
  },

  // ---------------------------------------------------------------- 본문 삽화 4장
  'illus-classroom': {
    file: 'illus-classroom.png',
    kind: 'illustration',
    alt: '교사가 두 학생 곁에 서서 태블릿 위의 작업을 함께 살펴보는 모습.',
  },
  'illus-teachers': {
    file: 'illus-teachers.png',
    kind: 'illustration',
    alt: '교사와 교육자들이 서로 이야기를 나누는 모습.',
    portrait: true,
  },
  'illus-ethics': {
    file: 'illus-ethics.png',
    kind: 'illustration',
    alt: 'AI 사용의 윤리적 판단을 저울질하는 장면을 담은 삽화.',
  },
  'illus-opportunities-risks': {
    file: 'illus-opportunities-risks.png',
    kind: 'illustration',
    alt: '교육에서 AI가 주는 기회와 위험을 나란히 놓고 견주는 삽화.',
  },

  // ---------------------------------------------------------------- 장식 8장
  'card-engage': { file: 'card-engage.png', kind: 'decoration' },
  'card-create': { file: 'card-create.png', kind: 'decoration' },
  'card-manage': { file: 'card-manage.png', kind: 'decoration' },
  'card-shape': { file: 'card-shape.png', kind: 'decoration' },
  'aud-teachers': { file: 'aud-teachers.png', kind: 'decoration' },
  'aud-designers': { file: 'aud-designers.png', kind: 'decoration' },
  'aud-leaders': { file: 'aud-leaders.png', kind: 'decoration' },
  'aud-policymakers': { file: 'aud-policymakers.png', kind: 'decoration' },
  'aud-families': { file: 'aud-families.png', kind: 'decoration' },
}

/** 영역별 오프너와 배지. 역량 절을 그릴 때 쓴다. */
export const DOMAIN_ART: Record<string, { opener: string; badge: string }> = {
  engage: { opener: 'domain-engage-opener.png', badge: 'badge-engage.png' },
  create: { opener: 'domain-create-opener.png', badge: 'badge-create.png' },
  manage: { opener: 'domain-manage-opener.png', badge: 'badge-manage.png' },
  shape: { opener: 'domain-shape-opener.png', badge: 'badge-shape.png' },
}

/** 파일별 원본 크기. width/height 속성으로 자리를 미리 잡아 두어야
 *  lazy 로딩된 삽화가 나중에 들어오면서 본문을 밀어내지 않는다. */
export const DIMS: Record<string, [number, number]> = {
  'aud-designers.png': [324, 293],
  'aud-families.png': [306, 328],
  'aud-leaders.png': [287, 328],
  'aud-policymakers.png': [287, 293],
  'aud-teachers.png': [287, 272],
  'badge-create.png': [708, 634],
  'badge-engage.png': [709, 631],
  'badge-manage.png': [704, 630],
  'badge-shape.png': [707, 639],
  'card-create.png': [370, 354],
  'card-engage.png': [369, 348],
  'card-manage.png': [368, 361],
  'card-shape.png': [390, 364],
  'domain-create-opener.png': [1328, 1400],
  'domain-engage-opener.png': [1240, 1400],
  'domain-manage-opener.png': [1263, 1400],
  'domain-shape-opener.png': [1400, 1394],
  'fig1-domains.png': [1159, 1146],
  'fig2-shared-effort.png': [1400, 698],
  'fig3-respondents.png': [1400, 1031],
  'fig4-disciplines.png': [1400, 842],
  'fig5-domains.png': [1364, 1400],
  'illus-classroom.png': [693, 534],
  'illus-ethics.png': [1400, 919],
  'illus-opportunities-risks.png': [332, 262],
  'illus-teachers.png': [1096, 1901],
}

export const ASSET_BASE = '/assets/'
