import type { Content } from '../data/types'
import { $, $$, esc, goTo } from './util'
import { domainColor } from '../data/theme'

/** 좌측 영역 색상 칩. 1280px 미만에서는 CSS가 숨긴다. */
export function initRail(c: Content): void {
  const rail = $('#rail')
  if (!rail) return

  rail.innerHTML =
    `<p class="rail-lab">영역</p>` +
    c.domains.map((d) => `
      <button type="button" class="rail-chip" style="--c:${esc(domainColor(d.id))}"
              data-go="${esc(d.id)}" aria-current="false">
        <span class="code">${esc(d.code)}</span>
        <span>${esc(d.name)}</span>
      </button>`).join('')

  rail.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-go]')
    if (btn) goTo(btn.dataset.go!)
  })

  // 목차와 같은 기준으로 현재 영역을 표시한다
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue
      const id = en.target.id
      $$('.rail-chip', rail).forEach((b) =>
        b.setAttribute('aria-current', String(b.dataset.go === id)))
    }
  }, { rootMargin: '-64px 0px -62% 0px', threshold: 0 })

  for (const d of c.domains) {
    const el = document.getElementById(d.id)
    if (el) io.observe(el)
  }
}
