import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components.css'
import './styles/toc.css'
import './styles/print.css'

import raw from './data/content.json'
import type { Content } from './data/types'
import * as prose from './data/prose'

import { $, $$, goTo, prefersReducedMotion } from './components/util'
import { assetUrl, sizeAttrs } from './components/asset'
import { expandFigures, initLightbox } from './components/figure'
import { renderKnowledge, renderSkills, renderAttitudes } from './components/ksa'
import { domainSectionsHtml, initCompetences } from './components/competence'
import { renderGlossary, initGlossaryFilter } from './components/glossary'
import { renderFront } from './components/front'
import { initToc } from './components/toc'
import { initSearch } from './components/search'
import { initRail } from './components/rail'
import { renderFooter } from './components/footer'

const content = raw as unknown as Content

// ---------------------------------------------------------------- 표제부
/** 도판 위 각 꽃잎의 무게중심(이미지 비율)과 한국어 이름.
 *  fig1-domains.png 의 화소를 직접 재서 얻은 값이라 도판을 갈면 다시 재야 한다. */
const DOMAIN_SPOTS = [
  // 순서는 프레임워크의 학습 경로대로 E → C → M → S. 좌측 영역 칩·목차와 같다.
  { id: 'engage', ko: 'AI와 마주하기', en: 'Engage with AI', color: '#12428E', x: 50.5, y: 74.6 },
  { id: 'create', ko: 'AI와 창작하기', en: 'Create with AI', color: '#6E9410', x: 22.4, y: 51.2 },
  { id: 'manage', ko: 'AI 관리하기',   en: 'Manage AI',      color: '#D8431F', x: 75.9, y: 50.6 },
  { id: 'shape',  ko: 'AI 만들어가기', en: 'Shape AI',       color: '#5C74B8', x: 50.1, y: 21.4 },
] as const

const hero = `
<header class="hero wrap reveal">
  <div class="hero-grid">
    <div>
      <div class="eyebrow">OECD · European Commission · 2026</div>
      <h1>AI 시대의<br>학습자 역량강화</h1>
      <p class="sub">초·중등 교육을 위한 AI 리터러시 프레임워크 — 한국어 번역</p>
      <p class="en">Empowering Learners for the Age of AI: An AI Literacy Framework for Primary and Secondary Education</p>
      <dl class="meta-row">
        <div><dt>발행</dt><dd>OECD / 유럽연합</dd></div>
        <div><dt>승인</dt><dd>PISA 운영이사회 2026.4.8.</dd></div>
        <div><dt>연계 평가</dt><dd>PISA 2029 MAIL</dd></div>
        <div><dt>라이선스</dt><dd>CC BY 4.0</dd></div>
      </dl>
    </div>
    <div>
      <figure class="hero-fig">
        <div class="hero-fig-img">
          <img src="${assetUrl('fig1-domains.png')}"${sizeAttrs('fig1-domains.png')}
               alt="AILit 프레임워크의 네 영역을 꽃잎처럼 배치한 도판. 위에서부터 시계 방향으로 AI 만들어가기, AI 관리하기, AI와 마주하기, AI와 창작하기."
               decoding="async" fetchpriority="high">
          ${DOMAIN_SPOTS.map((d) => `
            <button type="button" class="hero-spot" data-go="${d.id}"
                    style="left:${d.x}%; top:${d.y}%"
                    aria-label="${d.ko} 영역으로 이동"><span></span></button>`).join('')}
        </div>
        <figcaption>
          <p class="hero-fig-hint">영역을 눌러 해당 절로 이동</p>
          <ul class="hero-legend">
            ${DOMAIN_SPOTS.map((d) => `
              <li><button type="button" data-go="${d.id}" style="--c:${d.color}">
                <b>${d.ko}</b><span>${d.en}</span></button></li>`).join('')}
          </ul>
        </figcaption>
      </figure>
    </div>
  </div>
</header>`

// ---------------------------------------------------------------- 본문 조립
const doc = $('#doc')!
doc.innerHTML = expandFigures(
  hero +
  `<section id="front" class="wrap reveal">${renderFront(content)}</section>` +
  `<section id="intro" class="wrap reveal">${prose.intro}</section>` +
  `<section id="foundations" class="wrap reveal">${prose.foundations}</section>` +
  `<section id="process" class="wrap reveal">${prose.process}</section>` +
  `<section id="ksa" class="wrap reveal">${prose.ksa}</section>` +
  `<section id="competences" class="wrap reveal">${prose.competencesIntro}</section>` +
  domainSectionsHtml(content) +
  `<section id="glossary" class="wrap reveal">
     <div class="narrow">
       <h2><span class="num">05 / SUPPORTING MATERIALS</span>용어집</h2>
       <p class="h2-en">Glossary</p>
       <input class="search" id="glsearch" type="search" placeholder="용어 검색 (한국어 또는 영어)" aria-label="용어집 검색">
       <div class="gl" id="gl"></div>
       <p id="gl-none" style="display:none; color:var(--ink-3); padding-top:20px">검색어와 일치하는 용어가 없습니다. 다른 표현으로 찾아보세요.</p>
     </div>
   </section>` +
  `<section id="annex" class="wrap reveal">${prose.annex}</section>`
)

// 데이터에서 오는 부분을 각 자리에 채운다
;($('#knowledge') as HTMLElement).innerHTML = renderKnowledge(content)
;($('#skills') as HTMLElement).innerHTML = renderSkills(content)
;($('#attitudes') as HTMLElement).innerHTML = renderAttitudes(content)
;($('#gl') as HTMLElement).innerHTML = renderGlossary(content)
;($('#site-footer') as HTMLElement).innerHTML = renderFooter()

// ---------------------------------------------------------------- 배선
initLightbox()
initCompetences()
initGlossaryFilter()
initRail(content)
initToc(content)
initSearch(content)


// 표제부 도판과 범례에서 영역으로 이동
doc.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>('.hero-fig [data-go]')
  if (btn) goTo(btn.dataset.go!)
})

// 스크롤 진입 효과 — prefers-reduced-motion 이면 그냥 다 보여 준다
const reveals = $$('.reveal')
if (prefersReducedMotion()) {
  reveals.forEach((el) => el.classList.add('in'))
} else {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue
      en.target.classList.add('in')
      io.unobserve(en.target)
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.02 })
  reveals.forEach((el) => io.observe(el))
}

// 해시로 들어온 경우 렌더가 끝난 뒤 이동
if (location.hash.length > 1) {
  requestAnimationFrame(() => goTo(decodeURIComponent(location.hash.slice(1))))
}
