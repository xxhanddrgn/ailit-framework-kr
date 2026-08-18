import type { Content } from '../data/types'
import { $, $$, esc, goTo, prefersReducedMotion } from './util'
import { compId } from './competence'
import { domainColor } from '../data/theme'

interface Chip { label: string; id: string; wide?: boolean }
interface L2Node { key: string; id: string; label: string; code?: string; color?: string; chips?: Chip[] }
interface L1Node {
  key: string
  id: string
  label: string
  /** 프레임워크의 뼈대라 자동 접힘 대상이 아니다 — 언제나 펼쳐 둔다. */
  always?: boolean
  children?: L2Node[]
}

/** 사용자가 직접 접거나 펼친 뒤 스크롤 자동 전환을 멈춰 두는 시간. */
const MANUAL_PAUSE_MS = 12_000

const TOPBAR = 56

export function buildToc(c: Content): L1Node[] {
  const knowledgeChips: Chip[] = c.knowledge.flatMap((g) =>
    g.items.map(([code]) => ({ label: code, id: `k-${code}`, wide: true })))

  return [
    { key: 'intro', id: 'intro', label: '서론' },
    { key: 'foundations', id: 'foundations', label: '기초' },
    { key: 'process', id: 'process', label: '개발' },
    {
      key: 'ksa', id: 'ksa', label: '지식·기능·태도', always: true,
      children: [
        { key: 'knowledge', id: 'knowledge', label: '지식', chips: knowledgeChips },
        { key: 'skills', id: 'skills', label: '기능' },
        { key: 'attitudes', id: 'attitudes', label: '태도' },
      ],
    },
    {
      key: 'competences', id: 'competences', label: '역량',
      // 영역 이름은 정식 명칭 전체를 쓴다. 줄이지 않는다.
      children: c.domains.map((d) => ({
        key: d.id,
        id: d.id,
        label: d.name,
        code: d.code,
        color: domainColor(d.id),
        chips: d.comps.map((comp) => ({ label: compId(d, comp), id: compId(d, comp) })),
      })),
    },
    { key: 'glossary', id: 'glossary', label: '용어집' },
    { key: 'annex', id: 'annex', label: '부록' },
  ]
}

export function initToc(content: Content): void {
  const navEl = $('#toc')
  const wrapEl = $('#tocWrap')
  const toggle = $('#tocToggle')
  if (!navEl || !wrapEl) return
  const nav: HTMLElement = navEl
  const wrap: HTMLElement = wrapEl

  const tree = buildToc(content)

  // ---------------------------------------------------------------- 마크업
  nav.innerHTML =
    `<p class="toc-hd">목차</p>` +
    `<ul class="toc-l1">` +
    tree.map((n) => {
      const hasKids = !!n.children?.length
      const open = !!n.always
      const kids = hasKids
        ? `<ul class="toc-l2">` + n.children!.map((s) => {
            const chips = s.chips?.length
              ? `<div class="toc-chips">` + s.chips.map((ch) =>
                  `<button type="button" class="toc-chip${ch.wide ? ' wide' : ''}" data-jump="${esc(ch.id)}">${esc(ch.label)}</button>`
                ).join('') + `</div>`
              : ''
            const badge = s.code
              ? `<span class="dcode" style="background:${esc(s.color ?? '#0B1B33')}">${esc(s.code)}</span>`
              : ''
            return `<li class="toc-i2" data-key="${esc(s.key)}" data-open="false"` +
              (s.color ? ` style="--bar:${esc(s.color)}"` : '') + `>` +
              `<button type="button" class="toc-a2" data-sub="${esc(s.key)}" data-jump="${esc(s.id)}"` +
              (s.chips?.length ? ` aria-expanded="false"` : '') + `>` +
              badge + `<span>${esc(s.label)}</span></button>` +
              chips + `</li>`
          }).join('') + `</ul>`
        : ''
      return `<li class="toc-i1" data-key="${esc(n.key)}" data-open="${open}" data-on="false">` +
        `<button type="button" class="toc-a1" data-sec="${esc(n.key)}" data-jump="${esc(n.id)}"` +
        (hasKids ? ` aria-expanded="${open}"` : '') + `>` +
        `<span>${esc(n.label)}</span>` +
        (hasKids && !n.always ? `<span class="caret" aria-hidden="true">▾</span>` : '') +
        `</button>` + kids + `</li>`
    }).join('') +
    `</ul>`

  const bar = document.createElement('div')
  bar.className = 'toc-progress'
  bar.innerHTML = `<div class="bar"><i id="tocBar"></i></div><span class="pct" id="tocPct">0%</span>`
  wrap.appendChild(bar)

  const l1Items = $$('.toc-i1', nav)
  const alwaysOpen = new Set(tree.filter((n) => n.always).map((n) => n.key))

  // ---------------------------------------------------------------- 펼침 제어
  let manualUntil = 0
  const paused = () => Date.now() < manualUntil

  function setOpen(key: string, open: boolean): void {
    // 지식·기능·태도는 어떤 경우에도 접지 않는다.
    if (alwaysOpen.has(key)) open = true
    const li = l1Items.find((x) => x.dataset.key === key)
    if (!li) return
    li.dataset.open = String(open)
    li.querySelector('.toc-a1')?.setAttribute('aria-expanded', String(open))
  }

  /** 현재 절만 펼치고 나머지는 접는다. 상시 노출 항목은 건드리지 않는다. */
  function syncOpen(activeKey: string): void {
    for (const li of l1Items) {
      const key = li.dataset.key!
      if (alwaysOpen.has(key)) { setOpen(key, true); continue }
      setOpen(key, key === activeKey)
    }
  }

  function markActive(l1Key: string, l2Key: string | null, color: string | null): void {
    for (const li of l1Items) {
      const on = li.dataset.key === l1Key
      li.dataset.on = String(on)
      if (on && color) li.style.setProperty('--bar', color)
      else if (on) li.style.removeProperty('--bar')
    }
    for (const li of $$('.toc-i2', nav)) {
      const on = li.dataset.key === l2Key
      li.dataset.on = String(on)
      // 3단 코드 칩은 현재 영역/지식일 때만 펼친다
      const btn = li.querySelector('.toc-a2')
      if (btn?.hasAttribute('aria-expanded') && !paused()) {
        li.dataset.open = String(on)
        btn.setAttribute('aria-expanded', String(on))
      }
    }
  }

  // ---------------------------------------------------------------- 스크롤 스파이
  /* 감시 대상: [요소 id, 1단 키, 2단 키]
     문서 순서대로 늘어놓고, 서로 겹치지 않는 것만 넣는다.
     #ksa 는 #knowledge·#skills·#attitudes 를 품고 있어 넣지 않는다 — 넣으면
     기능·태도를 읽는 중에도 부모가 이겨서 2단 표시가 지식에 붙박인다. */
  const spy: [string, string, string | null][] = [
    ['intro', 'intro', null],
    ['foundations', 'foundations', null],
    ['process', 'process', null],
    ['knowledge', 'ksa', 'knowledge'],
    ['skills', 'ksa', 'skills'],
    ['attitudes', 'ksa', 'attitudes'],
    ['competences-intro', 'competences', null],
    ...content.domains.map((d) => [d.id, 'competences', d.id] as [string, string, string]),
    ['glossary', 'glossary', null],
    ['annex', 'annex', null],
  ]

  const colorOf = (l2Key: string | null) =>
    l2Key && content.domains.some((d) => d.id === l2Key) ? domainColor(l2Key) : null

  let current = ''

  /** 기준선을 마지막으로 넘어선 절이 현재 절이다. */
  function pick(): void {
    const line = TOPBAR + 100
    let id = spy[0][0]

    for (const [sid] of spy) {
      const el = document.getElementById(sid)
      if (el && el.getBoundingClientRect().top <= line) id = sid
    }
    // 문서 끝에 닿으면 마지막 절로 — 짧은 절이 기준선을 못 넘는 경우 대비
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
      id = spy[spy.length - 1][0]
    }
    if (id === current) return
    current = id

    const [, l1Key, l2Key] = spy.find(([sid]) => sid === id)!
    markActive(l1Key, l2Key, colorOf(l2Key))
    if (!paused()) syncOpen(l1Key)
  }

  /* 삽화가 늦게 로드되면서 높이가 바뀌는 경우까지 잡으려고 관측기를 함께 둔다.
     현재 절을 고르는 판단 자체는 위의 기준선 계산이 한다. */
  const io = new IntersectionObserver(() => pick(),
    { rootMargin: `-${TOPBAR}px 0px -62% 0px`, threshold: 0 })

  for (const [id] of spy) {
    const el = document.getElementById(id)
    if (el) io.observe(el)
  }

  // ---------------------------------------------------------------- 진행률
  const barFill = $('#tocBar')
  const pct = $('#tocPct')
  let ticking = false
  function onScroll(): void {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      ticking = false
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0
      if (barFill) barFill.style.width = p.toFixed(1) + '%'
      if (pct) pct.textContent = Math.round(p) + '%'
      pick()
    })
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })

  // ---------------------------------------------------------------- 조작
  nav.addEventListener('click', (e) => {
    const target = e.target as HTMLElement

    const chip = target.closest<HTMLElement>('.toc-chip')
    if (chip) {
      manualUntil = 0                       // 개별 항목으로 뛰면 자동 전환 재개
      goTo(chip.dataset.jump!, true)
      closeDrawer()
      return
    }

    const a2 = target.closest<HTMLElement>('.toc-a2')
    if (a2) {
      const li = a2.closest<HTMLElement>('.toc-i2')!
      if (a2.hasAttribute('aria-expanded')) {
        // 코드 칩을 직접 여닫은 것 — 잠시 자동 전환을 멈춘다
        const open = li.dataset.open !== 'true'
        li.dataset.open = String(open)
        a2.setAttribute('aria-expanded', String(open))
        manualUntil = Date.now() + MANUAL_PAUSE_MS
      }
      goTo(a2.dataset.jump!)
      closeDrawer()
      return
    }

    const a1 = target.closest<HTMLElement>('.toc-a1')
    if (!a1) return
    const li = a1.closest<HTMLElement>('.toc-i1')!
    const key = li.dataset.key!

    if (a1.hasAttribute('aria-expanded') && !alwaysOpen.has(key)) {
      const open = li.dataset.open !== 'true'
      setOpen(key, open)
      manualUntil = Date.now() + MANUAL_PAUSE_MS
    }
    goTo(a1.dataset.jump!)
    closeDrawer()
  })

  // ---------------------------------------------------------------- 드로어 (1024px 미만)
  function closeDrawer(): void {
    if (window.matchMedia('(min-width:1024px)').matches) return
    wrap.classList.remove('open')
    toggle?.setAttribute('aria-expanded', 'false')
  }
  toggle?.addEventListener('click', () => {
    const open = !wrap.classList.contains('open')
    wrap.classList.toggle('open', open)
    toggle.setAttribute('aria-expanded', String(open))
  })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer()
  })

  // 초기 상태
  syncOpen('intro')
  markActive('intro', null, null)
  onScroll()

  if (prefersReducedMotion()) nav.classList.add('no-anim')
}
