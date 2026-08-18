import type { DomainId } from './types'

/**
 * UI 크롬(목차 세로 바, 좌측 칩, 역량 코드 칩)에 쓰는 영역색.
 * CLAUDE.md 의 디자인 토큰 값이며 ailit-framework-kr.html 의 :root 와 같다.
 *
 * content.json 의 domains[].color 는 창작하기가 #8FBF2B 로, 삽화에 쓰인 밝은
 * 채움색이다. 흰 글자를 얹으면 대비가 모자라고 지정된 토큰과도 어긋나므로
 * 크롬에는 쓰지 않는다. 번역 데이터는 그대로 둔다.
 */
export const DOMAIN_COLOR: Record<DomainId, string> = {
  engage: '#12428E',
  create: '#6E9410',
  manage: '#D8431F',
  shape: '#5C74B8',
}

export const domainColor = (id: string): string =>
  DOMAIN_COLOR[id as DomainId] ?? '#0B1B33'
