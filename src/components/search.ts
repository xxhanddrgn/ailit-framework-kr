import type { Content } from '../data/types'
import { $, esc, goTo } from './util'
import { compId } from './competence'
import { glossaryId } from './glossary'

interface Entry {
  kind: string
  title: string
  sub: string
  id: string
  /** 제목 + 본문을 소문자로 합쳐 둔 검색용 문자열 */
  hay: string
  flash?: boolean
}

const MAX_RESULTS = 40

/** 저장소를 쓰지 않는다. 색인은 메모리에만 둔다. */
function buildIndex(c: Content): Entry[] {
  const out: Entry[] = []

  for (const g of c.knowledge) {
    for (const [code, text] of g.items) {
      out.push({
        kind: `지식 ${code}`, title: text.slice(0, 70), sub: g.t,
        id: `k-${code}`, hay: (code + ' ' + g.t + ' ' + text).toLowerCase(), flash: true,
      })
    }
  }

  c.skills.forEach((s, i) => out.push({
    kind: '기능', title: s.t, sub: s.stmt,
    id: `skill-${i}`, hay: (s.t + ' ' + s.en + ' ' + s.stmt + ' ' + s.body).toLowerCase(),
  }))

  c.attitudes.forEach((a, i) => out.push({
    kind: '태도', title: a.t, sub: a.en,
    id: `attitude-${i}`, hay: (a.t + ' ' + a.en + ' ' + a.body).toLowerCase(),
  }))

  for (const d of c.domains) {
    for (const comp of d.comps) {
      const id = compId(d, comp)
      const levels = comp.lv.map(([e, cl]) => e + ' ' + cl).join(' ')
      out.push({
        kind: `역량 ${id}`, title: comp.t, sub: d.name,
        id, hay: (id + ' ' + comp.t + ' ' + comp.en + ' ' + levels).toLowerCase(),
      })
    }
  }

  c.glossary.forEach(([ko, en, def], i) => out.push({
    kind: '용어', title: ko, sub: en,
    id: glossaryId(i), hay: (ko + ' ' + en + ' ' + def).toLowerCase(),
  }))

  return out
}

export function initSearch(c: Content): void {
  const overlay = $('#searchOverlay')
  const input = $('#searchInput') as HTMLInputElement | null
  const results = $('#searchResults')
  const opener = $('#searchOpen')
  if (!overlay || !input || !results || !opener) return

  const index = buildIndex(c)
  let hits: Entry[] = []
  let cursor = 0

  const draw = () => {
    if (!input.value.trim()) {
      results.innerHTML = `<p class="sr-empty">역량 · 지식 · 용어를 제목과 본문에서 찾습니다.</p>`
      return
    }
    if (!hits.length) {
      results.innerHTML = `<p class="sr-empty">일치하는 항목이 없습니다.</p>`
      return
    }
    results.innerHTML = hits.map((h, i) => `
      <button type="button" class="sr-item" role="option" data-i="${i}" aria-selected="${i === cursor}">
        <span class="sr-kind">${esc(h.kind)}</span>
        <span class="sr-title">${esc(h.title)}</span>
        <span class="sr-sub">${esc(h.sub)}</span>
      </button>`).join('')
    results.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }

  const run = () => {
    const q = input.value.trim().toLowerCase()
    hits = q ? index.filter((e) => e.hay.includes(q)).slice(0, MAX_RESULTS) : []
    cursor = 0
    draw()
  }

  const open = () => {
    overlay.hidden = false
    input.value = ''
    hits = []
    cursor = 0
    draw()
    input.focus()
  }
  const close = () => { overlay.hidden = true; opener.focus() }

  const pick = (i: number) => {
    const h = hits[i]
    if (!h) return
    close()
    goTo(h.id, h.flash)
  }

  opener.addEventListener('click', open)
  input.addEventListener('input', run)

  overlay.addEventListener('click', (e) => { if (e.target === overlay) close() })
  results.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.sr-item')
    if (btn) pick(Number(btn.dataset.i))
  })

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!hits.length) return
      cursor = (cursor + (e.key === 'ArrowDown' ? 1 : -1) + hits.length) % hits.length
      draw()
      e.preventDefault()
    } else if (e.key === 'Enter') {
      pick(cursor)
    }
  })

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      overlay.hidden ? open() : close()
    } else if (e.key === 'Escape' && !overlay.hidden) {
      close()
    }
  })
}
