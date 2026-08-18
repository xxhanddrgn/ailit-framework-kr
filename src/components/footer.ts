import { footer as footerHtml } from '../data/prose'

/**
 * 푸터는 원문 그대로 쓴다.
 *
 * 삽화 크레딧과 CC BY 4.0 고지, "원문과 번역본 사이에 불일치가 있는 경우
 * 원문만 유효" 문구는 모두 ailit-framework-kr.html 의 푸터 안에 들어 있다.
 * 여기서 따로 덧붙이면 크레딧이 두 번 나온다.
 */
export function renderFooter(): string {
  return footerHtml
}
