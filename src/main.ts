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
      <svg class="petals" viewBox="0 0 420 420" role="img" aria-label="AILit 프레임워크의 네 영역 탐색기">
        <g class="petal" data-go="shape" role="button" tabindex="0" aria-label="AI 만들어가기 영역으로 이동">
          <path d="M210,215 C150,160 148,80 210,52 C272,80 270,160 210,215 Z" fill="#5C74B8"/>
          <text class="petal-lab" x="210" y="120" text-anchor="middle">AI 만들어가기</text>
          <text class="petal-en" x="210" y="138" text-anchor="middle">SHAPE AI</text>
        </g>
        <g class="petal" data-go="create" role="button" tabindex="0" aria-label="AI와 창작하기 영역으로 이동">
          <path d="M205,210 C150,150 70,148 42,210 C70,272 150,270 205,210 Z" fill="#8FBF2B"/>
          <text class="petal-lab" x="115" y="207" text-anchor="middle">AI와 창작하기</text>
          <text class="petal-en" x="115" y="224" text-anchor="middle">CREATE WITH AI</text>
        </g>
        <g class="petal" data-go="manage" role="button" tabindex="0" aria-label="AI 관리하기 영역으로 이동">
          <path d="M215,210 C270,150 350,148 378,210 C350,272 270,270 215,210 Z" fill="#D8431F"/>
          <text class="petal-lab" x="305" y="207" text-anchor="middle">AI 관리하기</text>
          <text class="petal-en" x="305" y="224" text-anchor="middle">MANAGE AI</text>
        </g>
        <g class="petal" data-go="engage" role="button" tabindex="0" aria-label="AI와 마주하기 영역으로 이동">
          <path d="M210,205 C150,260 148,340 210,368 C272,340 270,260 210,205 Z" fill="#12428E"/>
          <text class="petal-lab" x="210" y="300" text-anchor="middle">AI와 마주하기</text>
          <text class="petal-en" x="210" y="318" text-anchor="middle">ENGAGE WITH AI</text>
        </g>
      </svg>
      <p style="text-align:center; font-family:var(--mono); font-size:11px; color:var(--ink-3); margin-top:10px">영역을 눌러 해당 절로 이동</p>
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

// 표제부 꽃잎 탐색기
doc.addEventListener('click', (e) => {
  const g = (e.target as HTMLElement).closest<SVGGElement>('.petal[data-go]')
  if (g) goTo(g.dataset.go!)
})
doc.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return
  const g = (e.target as HTMLElement).closest<SVGGElement>('.petal[data-go]')
  if (g) { goTo(g.dataset.go!); e.preventDefault() }
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
