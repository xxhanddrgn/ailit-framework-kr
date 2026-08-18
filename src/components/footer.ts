import { footer as footerHtml } from '../data/prose'

/**
 * 원문 푸터를 그대로 쓰되 삽화 크레딧을 덧붙인다.
 * CC BY 4.0 고지와 "원문과 번역본 사이에 불일치가 있는 경우 원문만 유효" 문구는
 * 원문 그대로 유지된다.
 */
const ART_CREDIT = `
    <div class="art-credit">
      <h4>삽화 크레딧</h4>
      <p>삽화 Abiyasa Adiguna · © OECD / European Union, 2026 · CC BY 4.0<br>
      도판과 삽화는 원저작물에서 추출하여 CC BY 4.0에 따라 출처를 밝히고 사용합니다.
      OECD·유럽집행위원회의 로고와 시각 정체성 요소, 표지 이미지는 이 라이선스의 적용 대상이 아니므로 포함하지 않았습니다.</p>
    </div>
  `

export function renderFooter(): string {
  const i = footerHtml.lastIndexOf('</div>')
  if (i < 0) return footerHtml + ART_CREDIT
  return footerHtml.slice(0, i) + ART_CREDIT + footerHtml.slice(i)
}
