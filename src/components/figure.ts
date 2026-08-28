import { FIGURES, type Figure } from '../data/figures'
import { assetUrl, sizeAttrs } from './asset'
import { $, esc } from './util'

/** <!--FIG:이름--> 마커를 실제 마크업으로 바꾼다. */
export function expandFigures(html: string): string {
  return html.replace(/<!--FIG:([a-z0-9-]+)-->/g, (_m, name: string) => {
    const fig = FIGURES[name]
    if (!fig) {
      console.warn('[figure] 정의되지 않은 삽화:', name)
      return ''
    }
    return render(name, fig)
  })
}

function render(name: string, fig: Figure): string {
  const src = assetUrl(fig.file)
  const size = sizeAttrs(fig.file)

  // 배지·썸네일·아이콘 — 시각 정보가 아니라 장식이다
  if (fig.kind === 'decoration') {
    return `<img src="${src}"${size} alt="" aria-hidden="true" loading="lazy" decoding="async">`
  }

  if (fig.kind === 'illustration') {
    return `<div class="illus${fig.portrait ? ' portrait' : ''}">` +
      `<img src="${src}"${size} alt="${esc(fig.alt ?? '')}" loading="lazy" decoding="async">` +
      `</div>`
  }

  // 도판 — 캡션, 확대, 그리고 영문 라벨이 있으면 대응표
  const labels = fig.labels
    ? `<div class="fig-labels"><table><caption>도판 안 영문 라벨</caption><tbody>` +
      fig.labels.map(([en, ko]) => `<tr><th scope="row">${esc(en)}</th><td>${esc(ko)}</td></tr>`).join('') +
      `</tbody></table></div>`
    : ''

  return `<figure class="fig" id="fig-${name}">` +
    `<button type="button" class="fig-btn" data-fig="${name}" aria-label="${esc(fig.caption ?? '도판')} 확대해서 보기">` +
    `<img src="${src}"${size} alt="${esc(fig.alt ?? '')}" loading="lazy" decoding="async">` +
    `</button>` +
    `<figcaption>${esc(fig.caption ?? '')}</figcaption>` +
    labels +
    `</figure>`
}

/** 도판 클릭 시 확대. 도판에만 붙고 삽화·장식에는 붙지 않는다. */
export function initLightbox(): void {
  const box = $('#lightbox') as HTMLElement | null
  const img = $('#lightboxImg') as HTMLImageElement | null
  const cap = $('#lightboxCap')
  const close = $('#lightboxClose')
  if (!box || !img || !cap || !close) return

  let lastFocus: HTMLElement | null = null

  const open = (name: string) => {
    const fig = FIGURES[name]
    if (!fig) return
    lastFocus = document.activeElement as HTMLElement
    img.src = assetUrl(fig.file)
    img.alt = fig.alt ?? ''
    cap.textContent = fig.caption ?? ''
    box.hidden = false
    close.focus()
  }

  const hide = () => {
    box.hidden = true
    img.removeAttribute('src')
    lastFocus?.focus()
  }

  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-fig]')
    if (btn) open(btn.dataset.fig!)
  })
  close.addEventListener('click', hide)
  box.addEventListener('click', (e) => { if (e.target === box) hide() })
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !box.hidden) hide()
  })
}
