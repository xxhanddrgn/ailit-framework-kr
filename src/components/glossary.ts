import type { Content } from '../data/types'
import { $, esc } from './util'

/** 용어 id — 한국어 표제어는 그대로 못 쓰니 순번으로 건다. */
export const glossaryId = (i: number) => `gl-${i}`

export function renderGlossary(c: Content): string {
  return c.glossary.map(([ko, en, def], i) => `
    <div class="gl-row" id="${glossaryId(i)}" data-term="${esc((ko + ' ' + en + ' ' + def).toLowerCase())}">
      <div><b>${esc(ko)}</b><span class="en">${esc(en)}</span></div>
      <p>${esc(def)}</p>
    </div>`).join('')
}

/** 용어집 자체 필터. 상단 바의 전역 검색과는 별개다. */
export function initGlossaryFilter(): void {
  const input = $('#glsearch') as HTMLInputElement | null
  const list = $('#gl')
  const none = $('#gl-none')
  if (!input || !list || !none) return

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase()
    let hits = 0
    for (const row of Array.from(list.children) as HTMLElement[]) {
      const on = !q || (row.dataset.term ?? '').includes(q)
      row.style.display = on ? '' : 'none'
      if (on) hits++
    }
    none.style.display = hits ? 'none' : ''
  })
}
