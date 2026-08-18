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
