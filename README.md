# AI 시대의 학습자 역량강화 — AILit 프레임워크 한국어판

OECD·유럽연합의 「Empowering Learners for the Age of AI: An AI Literacy Framework
for Primary and Secondary Education」을 한국어로 옮긴 웹 문서입니다.

지식 진술문 17개, 기능 7개, 태도 6개, 네 영역 19개 역량(각 기초·중급·심화 3단계와
교실 사례), 용어집 40개 항목, 그리고 1~3장 서술부와 부록을 담고 있습니다.

Vite + 순수 TypeScript로 만든 정적 사이트입니다. 프레임워크는 쓰지 않았습니다.

---

## 로컬에서 실행하기

Node 22 이상이 필요합니다.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 생성 (타입 검사 포함)
npm run preview  # 빌드 결과 확인
```

`npm run build`는 `tsc --noEmit`을 먼저 돌리므로 타입 오류가 있으면 빌드가 멈춥니다.

---

## 구조

```
index.html                진입점 — 상단바·좌측·본문·우측 목차의 3단 셸
vite.config.ts            base:'/' · assetsInlineLimit:0

public/
  assets/                 삽화 26장 + CREDITS.md
                          Vite가 dist/ 로 그대로 복사한다. 여기 두지 않으면
                          빌드에 포함되지 않아 배포 후 404가 난다.
  favicon.svg             네 영역 꽃잎 마크 — 원본
  favicon.ico             16·32·48·64 다중 해상도
  apple-touch-icon.png    180×180

src/
  main.ts                 데이터 로드 → 렌더 → 옵저버 배선
  data/
    content.json          번역 데이터 (들어가며·지식·기능·태도·역량·용어집)
    prose.ts              자동 생성 — 아래 "산문 다시 뽑기" 참조
    figures.ts            삽화 배치·캡션·영한 대응표·원본 크기
    theme.ts              UI 크롬에 쓰는 영역색
    types.ts
  styles/                 tokens · base · layout · components · toc · print
  components/             topbar·rail·toc·front·ksa·competence·glossary
                          ·search·figure·footer

scripts/build-prose.py    ailit-framework-kr.html → src/data/prose.ts
ailit-framework-kr.html   산문·BOX·부록·푸터의 원본
```

### 산문 다시 뽑기

1~3장 서술부, 각 BOX, 부록, 푸터 고지는 `ailit-framework-kr.html`에 들어 있고
`src/data/prose.ts`는 거기서 자동 생성됩니다. **`prose.ts`를 직접 고치지 마세요.**
원본을 고친 뒤 다시 뽑습니다.

```bash
python3 scripts/build-prose.py
```

삽화는 `assets/CREDITS.md`의 배치표대로 `<!--FIG:이름-->` 마커로 심습니다.
앵커 문자열이 안 걸리거나 두 번 걸리면 스크립트가 즉시 멈춥니다. 삽화가 조용히
빠진 채로 빌드되는 것보다 낫다는 판단입니다.

### 번역 데이터를 고칠 때

`content.json`의 문자열 일부에는 인라인 표기가 섞여 있습니다. 지식 진술문의
인용은 `Russell &amp; Norvig` 처럼 엔티티로, 들어가며의 문단에는 `<em>`이
들어 있습니다. 이것들은 `src/components/util.ts`의 `inline()`이 처리합니다.
허용 목록은 `<em>` · `<strong>` · `<br>`과 유효한 엔티티뿐이고 나머지는 전부
escape 되므로, 데이터에 스크립트가 섞여 들어와도 실행되지 않습니다.

---

## 배포

Railway에 Docker로 올립니다. 자세한 절차는 **[DEPLOY.md](DEPLOY.md)** 를 보세요.

```bash
npm run build          # dist/ 확인
railway login
railway init
railway up
railway domain         # 공개 URL 발급
```

GitHub 연동을 걸어 두면 이후에는 push만으로 자동 배포됩니다.

구성은 멀티스테이지 Docker입니다. `node:22-alpine`에서 빌드하고 `nginx:alpine`에
`dist/`만 복사하므로 최종 이미지에 `node_modules`가 남지 않습니다. Railway가
주입하는 `$PORT`는 `nginx.conf.template`을 `envsubst`로 치환해 씁니다.

캐시 정책은 해시가 붙은 번들 1년, 파일명이 고정인 삽화 PNG 7일, `index.html`은
`no-cache`입니다.

---

## 만들 때 지킨 것

- **localStorage / sessionStorage를 쓰지 않습니다.** 검색 색인은 메모리에만 둡니다.
- **번역문을 임의로 고치지 않습니다.** 산문은 원본 HTML에서 그대로 옮깁니다.
- 역량 코드(E1, M3)와 지식 코드(2.5)는 원문의 실제 참조 체계입니다. 장식이 아니라
  정보로 다루며 모노스페이스로 표기합니다.
- OECD·유럽집행위원회의 로고와 시각 정체성 요소, 표지 이미지는 CC BY 4.0의 적용
  대상이 아니므로 포함하지 않았습니다. **어떤 형태로도 추가하지 마세요.**
- 접근성: 키보드 포커스 링, `prefers-reduced-motion` 존중, 목차는
  `<nav aria-label="목차">`, 375px까지 가로 넘침 없음.
- 인쇄: 목차와 상단바를 감추고 역량 3단계를 세로로 펼칩니다.

---

## 출처와 라이선스

OECD / European Union (2026). *Empowering learners for the age of AI: An AI
literacy framework for primary and secondary education.* OECD Publishing, Paris.
<https://doi.org/10.1787/65cd27d4-en>

PDF ISBN 978-92-68-40754-7 · doi: 10.2766/5800975 · © OECD / European Union, 2026
원문 사이트 <https://ailiteracyframework.org/>

이 웹 문서는 위 원저작물의 **비공식 한국어 번역**이며 Creative Commons
Attribution 4.0 International(CC BY 4.0)에 따라 제작되었습니다.

삽화 Abiyasa Adiguna · © OECD / European Union, 2026 · CC BY 4.0

> 원저작물과 번역본 사이에 불일치가 있는 경우, 원저작물의 텍스트만이 유효한 것으로
> 간주됩니다. *(In the event of any discrepancy between the original work and the
> translation, only the text of the original work should be considered valid.)*

이 번역본은 OECD 또는 유럽집행위원회의 보증을 시사하지 않습니다.
참고문헌 목록(원문 pp.44–50)은 수록하지 않았으므로 원문을 참조하십시오.
