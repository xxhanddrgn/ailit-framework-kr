export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  root.querySelector(sel) as T | null

export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll(sel)) as T[]

/** 데이터에서 온 문자열을 마크업에 넣기 전에 반드시 통과시킬 것. */
export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * 번역 데이터 안에 들어 있는 인라인 마크업만 살려서 내보낸다.
 *
 * content.json 의 일부 문자열에는 편집 과정에서 들어온 표기가 섞여 있다.
 * 지식 진술문의 인용은 `Russell &amp; Norvig` 처럼 엔티티로 적혀 있고,
 * 들어가며의 문단에는 원제를 감싸는 <em> 이 들어 있다. 이것들을 esc() 로
 * 그냥 밀어 버리면 화면에 `&amp;` 와 `<em>` 이 글자 그대로 나온다.
 *
 * 그렇다고 통째로 innerHTML 에 태우면, 나중에 데이터에 <script> 한 줄이
 * 섞여 들어와도 그대로 실행된다. 그래서 허용 목록 방식으로 좁힌다.
 * 아래 세 태그 외에는 전부 문자로 escape 되고, 유효한 엔티티만 통과한다.
 */
const ALLOWED = ['em', 'strong', 'br'] as const

export function inline(s: string): string {
  let out = s
    // 엔티티로 볼 수 없는 & 만 escape 한다 (&amp; 가 &amp;amp; 로 겹치는 것을 막는다)
    .replace(/&(?!#?\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  for (const tag of ALLOWED) {
    out = out
      .replace(new RegExp(`&lt;${tag}&gt;`, 'g'), `<${tag}>`)
      .replace(new RegExp(`&lt;/${tag}&gt;`, 'g'), `</${tag}>`)
      .replace(new RegExp(`&lt;${tag} /&gt;`, 'g'), `<${tag}>`)
  }
  return out
}

/** 검색 색인용 — 태그를 걷어내고 엔티티를 글자로 되돌린다. */
export function plain(s: string): string {
  return s
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 목차·검색·태그 칩에서 공통으로 쓰는 이동 동작.
 *
 * 부드러운 스크롤이 도는 동안 위쪽 삽화가 뒤늦게 로드되면 문서가 길어지면서
 * 목표를 지나치거나 못 미친 자리에 멈춘다. 크기 속성으로 자리를 잡아 두었지만
 * 폰트 교체 같은 변수가 남아 있어, 멈춘 뒤 위치를 확인하고 어긋났으면 한 번 더 맞춘다.
 */
export function goTo(id: string, flash = false): void {
  const el = document.getElementById(id)
  if (!el) return

  const smooth = !prefersReducedMotion()
  el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' })

  if (smooth) {
    let tries = 0
    const settle = () => {
      if (++tries > 4) return
      const before = window.scrollY
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
      if (Math.abs(window.scrollY - before) < 4) return    // 이미 제자리
      window.setTimeout(settle, 120)
    }
    window.setTimeout(settle, 700)
  }

  if (flash) {
    el.classList.add('flash')
    window.setTimeout(() => el.classList.remove('flash'), 1600)
  }
}
