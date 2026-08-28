import type { Content, Domain, Competence } from '../data/types'
import { DOMAIN_ART } from '../data/figures'
import { assetUrl, sizeAttrs } from './asset'
import { esc, goTo, $$ } from './util'
import { domainColor } from '../data/theme'

const LEVEL_NAMES = ['기초 BASIC', '중급 INTERMEDIATE', '심화 ADVANCED']
const LEVEL_SHORT = ['기초', '중급', '심화']

/** 역량 코드 — E1, C3 … 원문의 참조 체계이므로 장식이 아니라 정보다. */
export const compId = (d: Domain, c: Competence) => `${d.code}${c.n}`

export function renderDomain(d: Domain): string {
  const art = DOMAIN_ART[d.id]
  return `
    <div class="domain-hd ${esc(d.cls)}">
      <div>
        <h2><span class="num">${esc(d.code)} / ${esc(d.en.toUpperCase())}</span>${esc(d.name)}</h2>
        <p class="tagline">${esc(d.tag)}</p>
        <p>${esc(d.intro)}</p>
      </div>
      <img src="${assetUrl(art.opener)}"${sizeAttrs(art.opener)} alt="" aria-hidden="true" loading="lazy" decoding="async">
    </div>

    <blockquote class="domain-quote">${esc(d.quote[0])}<cite>${esc(d.quote[1])}</cite></blockquote>

    <div class="comp-list-hd">
      <img src="${assetUrl(art.badge)}"${sizeAttrs(art.badge)} alt="" aria-hidden="true" loading="lazy" decoding="async">
      <span>${esc(d.code)}1 – ${esc(d.code)}${d.comps.length} · 역량 ${d.comps.length}개</span>
    </div>

    ${d.comps.map((c) => renderCompetence(d, c)).join('')}`
}

function renderCompetence(d: Domain, c: Competence): string {
  const id = compId(d, c)

  // 지식 칩은 해당 진술문으로 데려간다. 기능·태도는 표시만.
  const kTags = c.k.map((k) =>
    `<button type="button" class="tag" data-goto-k="${esc(k)}" title="지식 ${esc(k)} 진술문으로 이동">${esc(k)}</button>`).join('')
  const sTags = c.s.map((s) => `<span class="tag s">${esc(s)}</span>`).join('')
  const aTags = c.a.map((a) => `<span class="tag a">${esc(a)}</span>`).join('')

  const levels = c.lv.map(([exp, cls], i) => `
    <div class="lvl lvl-${i + 1}${i === 0 ? ' show' : ''}" role="tabpanel"
         id="${id}-p${i}" aria-labelledby="${id}-t${i}">
      <span class="lvl-name">${esc(LEVEL_NAMES[i])}</span>
      <p class="exp">${esc(exp)}</p>
      <span class="cls-lab">교실에서</span>
      <p class="cls">${esc(cls)}</p>
    </div>`).join('')

  // 태블릿 이하에서만 보이는 탭. 데스크톱에서는 3열이 그대로 병렬로 선다.
  const tabs = LEVEL_SHORT.map((n, i) => `
    <button type="button" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}"
            aria-selected="${i === 0}">${esc(n)}</button>`).join('')

  return `
    <article class="comp" id="${id}">
      <div class="comp-hd">
        <span class="comp-code" style="background:${esc(domainColor(d.id))}">${esc(id)}</span>
        <div>
          <h3>${esc(c.t)}</h3>
          <p class="en">${esc(c.en)}</p>
          <div class="tags">
            <span class="tags-lab">지식</span>${kTags}
            <span class="tags-lab">기능</span>${sTags}
            <span class="tags-lab">태도</span>${aTags}
          </div>
        </div>
      </div>
      <div class="lvl-tabs" role="tablist" aria-label="${esc(id)} 학습자 기대수준">${tabs}</div>
      <div class="levels">${levels}</div>
    </article>`
}

/** 탭 전환과 지식 칩 이동을 문서 전체에 한 번만 건다. */
export function initCompetences(): void {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement

    const kBtn = target.closest<HTMLElement>('[data-goto-k]')
    if (kBtn) {
      goTo(`k-${kBtn.dataset.gotoK}`, true)
      return
    }

    const tab = target.closest<HTMLElement>('.lvl-tabs [role="tab"]')
    if (!tab) return
    const card = tab.closest('.comp')
    if (!card) return

    $$('[role="tab"]', card).forEach((t) =>
      t.setAttribute('aria-selected', String(t === tab)))
    $$('.lvl', card).forEach((p) =>
      p.classList.toggle('show', p.id === tab.getAttribute('aria-controls')))
  })

  // 탭 좌우 방향키
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const tab = (e.target as HTMLElement).closest<HTMLElement>('.lvl-tabs [role="tab"]')
    if (!tab) return
    const tabs = $$('[role="tab"]', tab.parentElement!)
    const next = tabs[(tabs.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]
    next.click()
    next.focus()
    e.preventDefault()
  })
}

export function domainSectionsHtml(c: Content): string {
  return c.domains.map((d) => `
    <section id="${esc(d.id)}" class="wrap reveal" data-sec="${esc(d.id)}">
      ${renderDomain(d)}
    </section>`).join('')
}
