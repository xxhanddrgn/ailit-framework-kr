import type { Content } from '../data/types'
import { esc, inline } from './util'

/**
 * 들어가며 — 원문의 Welcome 과 개발팀·전문가 명단.
 * 본문 맨 앞, 서론 앞에 놓인다.
 */
export function renderFront(c: Content): string {
  const { welcome, credits } = c.front

  const people = (label: string, list: [string, string][]) => `
    <h4>${esc(label)}</h4>
    <ul class="people">
      ${list.map(([name, org]) =>
        `<li><b>${esc(name)}</b><span>${esc(org)}</span></li>`).join('')}
    </ul>`

  return `
    <div class="narrow">
      <h2><span class="num">00 / WELCOME</span>${esc(welcome.title)}</h2>
      <p class="h2-en">${esc(welcome.en)} · ${esc(credits.en)}</p>

      ${welcome.paras.map((t) => `<p>${inline(t)}</p>`).join('')}

      <div class="credits" id="credits">
        <h3>${esc(credits.title)}</h3>
        <p>${inline(credits.intro)}</p>
        ${people(credits.team_label, credits.team)}
        ${people(credits.experts_label, credits.experts)}
        <p class="outro">${inline(credits.outro)}</p>
      </div>
    </div>`
}
