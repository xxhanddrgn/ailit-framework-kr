import type { Content } from '../data/types'
import { $, $$, esc, goTo, prefersReducedMotion } from './util'
import { compId } from './competence'
import { domainColor } from '../data/theme'

/**
 * 3단 코드 칩.
 * 지식(1.1)·역량(E1)은 원문의 참조 체계라 24px 정사각으로 둔다.
 * 기능·태도에는 그런 번호가 없어 이름을 그대로 쓰고, 칩 폭만 글자에 맞춘다.
 */
interface Chip { label: string; id: string; cls?: 'wide' | 'name' }
interface L2Node { key: string; id: string; label: string; code?: string; color?: string; chips?: Chip[] }
interface L1Node {
  key: string
  id: string
  label: string
  children?: L2Node[]
}

/** 사용자가 직접 접거나 펼친 뒤 스크롤 자동 전환을 멈춰 두는 시간. */
const MANUAL_PAUSE_MS = 12_000

const TOPBAR = 56

export function buildToc(c: Content): L1Node[] {
  const knowledgeChips: Chip[] = c.knowledge.flatMap((g) =>
    g.items.map(([code]) => ({ label: code, id: `k-${code}`, cls: 'wide' as const })))

  // 기능·태도는 원문에 번호가 없다. S1·A1 같은 코드를 새로 만들면 없는 참조
  // 체계를 지어내는 셈이고, S 는 이미 AI 만들어가기가 쓰고 있다. 이름을 쓴다.
  const skillChips: Chip[] = c.skills.map((sk, i) =>
    ({ label: sk.t, id: `skill-${i}`, cls: 'name' as const }))

  const attitudeChips: Chip[] = c.attitudes.map((a, i) =>
    ({ label: a.t, id: `attitude-${i}`, cls: 'name' as const }))

  return [
    { key: 'front', id: 'front', label: '들어가며' },
    { key: 'intro', id: 'intro', label: '서론' },
    { key: 'foundations', id: 'foundations', label: '기초' },
    { key: 'process', id: 'process', label: '개발' },
    {
      key: 'ksa', id: 'ksa', label: '지식·기능·태도',
      children: [
        { key: 'knowledge', id: 'knowledge', label: '지식', chips: knowledgeChips },
        { key: 'skills', id: 'skills', label: '기능', chips: skillChips },
        { key: 'attitudes', id: 'attitudes', label: '태도', chips: attitudeChips },
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
      const kids = hasKids
        ? `<ul class="toc-l2">` + n.children!.map((s) => {
            const chips = s.chips?.length
              ? `<div class="toc-chips">` + s.chips.map((ch) =>
                  `<button type="button" class="toc-chip${ch.cls ? ' ' + ch.cls : ''}" data-jump="${esc(ch.id)}">${esc(ch.label)}</button>`
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
      return `<li class="toc-i1" data-key="${esc(n.key)}" data-open="false" data-on="false">` +
        `<button type="button" class="toc-a1" data-sec="${esc(n.key)}" data-jump="${esc(n.id)}"` +
        (hasKids ? ` aria-expanded="false"` : '') + `>` +
        `<span>${esc(n.label)}</span>` +
        (hasKids ? `<span class="caret" aria-hidden="true">▾</span>` : '') +
        `</button>` + kids + `</li>`
    }).join('') +
    `</ul>`

  const bar = document.createElement('div')
  bar.className = 'toc-progress'
  bar.innerHTML = `<div class="bar"><i id="tocBar"></i></div><span class="pct" id="tocPct">0%</span>`
  wrap.appendChild(bar)

  const l1Items = $$('.toc-i1', nav)

  // 목차는 데이터에서 만들어진다. 가리키는 절이 실제로 없으면 클릭해도 아무 일이
  // 일어나지 않고 조용히 끝난다. 그런 항목은 눈에 띄게 알린다.
  for (const btn of $$('[data-jump]', nav)) {
    const id = btn.dataset.jump!
    if (!document.getElementById(id)) {
      console.warn('[toc] 갈 곳이 없는 항목:', id, '—', btn.textContent?.trim())
    }
  }

  // ---------------------------------------------------------------- 펼침 제어
  let manualUntil = 0
  const paused = () => Date.now() < manualUntil

  function setOpen(key: string, open: boolean): void {
    const li = l1Items.find((x) => x.dataset.key === key)
    if (!li) return
    li.dataset.open = String(open)
    li.querySelector('.toc-a1')?.setAttribute('aria-expanded', String(open))
  }

  /** 현재 절만 펼치고 나머지는 접는다. */
  function syncOpen(activeKey: string): void {
    for (const li of l1Items) {
      const key = li.dataset.key!
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
  /* 감시 대상: [요소 id, 1단 키, 2단 키] — 문서 순서대로.
     #ksa 는 #knowledge·#skills·#attitudes 를 품고 있지만, 아래 pick() 이
     기준선을 넘어선 것 중 '마지막' 을 고르므로 자식이 자연히 이긴다.
     #ksa 를 넣어 두어야 목차에서 '지식·기능·태도' 를 눌러 절 머리로 갔을 때
     앞 절이 계속 활성으로 남지 않는다. */
  const spy: [string, string, string | null][] = [
    ['front', 'front', null],
    ['intro', 'intro', null],
    ['foundations', 'foundations', null],
    ['process', 'process', null],
    ['ksa', 'ksa', null],
    ['knowledge', 'ksa', 'knowledge'],
    ['skills', 'ksa', 'skills'],
    ['attitudes', 'ksa', 'attitudes'],
    ['competences', 'competences', null],
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

    if (a1.hasAttribute('aria-expanded')) {
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
  syncOpen('front')
  markActive('front', null, null)
  onScroll()

  if (prefersReducedMotion()) nav.classList.add('no-anim')
}
