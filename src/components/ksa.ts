import type { Content } from '../data/types'
import { esc, inline } from './util'

/** 지식 진술문 — 코드(1.1 등)는 원문의 실제 참조 체계라 id 로 박아 둔다. */
export function renderKnowledge(c: Content): string {
  return c.knowledge.map((g) => `
    <div class="k-group" id="k-group-${g.n}">
      <div class="k-head">
        <span class="n">${esc(g.n)}</span>
        <h3>${esc(g.t)}</h3>
        <span class="en">${esc(g.en)}</span>
      </div>
      ${g.items.map(([code, text]) => `
        <div class="k-item" id="k-${code}">
          <span class="code">${esc(code)}</span>
          <p>${inline(text)}</p>
        </div>`).join('')}
    </div>`).join('')
}

export function renderSkills(c: Content): string {
  return c.skills.map((s, i) => `
    <div class="ksa-card" id="skill-${i}">
      <div class="title"><b>${esc(s.t)}</b><span>${esc(s.en)}</span></div>
      <p class="stmt">${esc(s.stmt)}</p>
      <div class="q">${s.q.map((q) => `<em>${esc(q)}</em>`).join('')}</div>
      <p class="body">${esc(s.body)}</p>
    </div>`).join('')
}

export function renderAttitudes(c: Content): string {
  return c.attitudes.map((a, i) => `
    <div class="ksa-card" id="attitude-${i}">
      <div class="title"><b>${esc(a.t)}</b><span>${esc(a.en)}</span></div>
      <p class="body">${esc(a.body)}</p>
    </div>`).join('')
}
