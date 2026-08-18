/** content.json 의 타입 정의. 번역 데이터는 이 구조를 그대로 따른다. */

export interface KnowledgeGroup {
  /** 군 번호 — "1" ~ "4" */
  n: string
  /** 한국어 제목 */
  t: string
  /** 원문 제목 */
  en: string
  /** [코드, 진술문] — 예: ["1.1", "AI는 인간이 아니다. …"] */
  items: [string, string][]
}

export interface Skill {
  t: string
  en: string
  /** 기능 정의 한 문장 */
  stmt: string
  /** 안내 질문 */
  q: string[]
  body: string
}

export interface Attitude {
  t: string
  en: string
  body: string
}

/** [기대수준, 교실 사례] */
export type Level = [string, string]

export interface Competence {
  /** 영역 내 번호 — E1 의 1 */
  n: number
  t: string
  en: string
  /** 뿌리내린 지식 코드 — ["1.4", "4.1"] */
  k: string[]
  /** 기능 이름 */
  s: string[]
  /** 태도 이름 */
  a: string[]
  /** 기초 · 중급 · 심화 */
  lv: [Level, Level, Level]
}

export type DomainId = 'engage' | 'create' | 'manage' | 'shape'

export interface Domain {
  id: DomainId
  /** 역량 코드 접두사 — E · C · M · S */
  code: string
  /** 배경색 클래스 — d-engage 등 */
  cls: string
  color: string
  /** 정식 명칭 — "AI와 마주하기" (축약 금지) */
  name: string
  en: string
  tag: string
  intro: string
  /** [인용문, 출처] */
  quote: [string, string]
  comps: Competence[]
}

/** [한국어 표제어, 원어, 정의] */
export type GlossaryEntry = [string, string, string]

export interface Content {
  knowledge: KnowledgeGroup[]
  skills: Skill[]
  attitudes: Attitude[]
  domains: Domain[]
  glossary: GlossaryEntry[]
}
