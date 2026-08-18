# Railway 배포 안내

AILit 프레임워크 한국어판 사이트를 Railway에 올리는 절차입니다.
Vite로 빌드한 정적 파일을 nginx로 서빙하는 구성입니다.

---

## 0. 핵심만 먼저

```bash
npm run build          # dist/ 생성 확인
railway login
railway init           # 프로젝트 생성
railway up             # 빌드 + 배포
railway domain         # 공개 URL 발급
```

처음 한 번만 위 순서를 거치고, 이후에는 GitHub 연동을 걸어 두면 `git push`만으로 자동 배포됩니다.

---

## 1. Railway가 정적 사이트를 다루는 방식

Railway는 **컨테이너를 띄우고 그 안의 프로세스가 `$PORT`를 듣기를 기대합니다.** 정적 파일만 있는 폴더를 그냥 올린다고 서비스가 되지 않습니다. 반드시 웹서버가 하나 떠 있어야 합니다.

여기서는 nginx를 씁니다. Node로 `serve`를 돌리는 방법보다 메모리를 적게 쓰고, 캐시 헤더와 gzip을 세밀하게 다룰 수 있습니다.

주의할 점 하나. nginx 기본 설정은 80번 포트를 듣는데 Railway가 주는 포트는 매번 다릅니다. `$PORT`를 실행 시점에 설정 파일에 밀어 넣어야 하고, 아래 `nginx.conf.template` + `envsubst` 조합이 그 일을 합니다.

---

## 2. 프로젝트에 필요한 파일

Claude Code가 아래 네 개를 만들어 줍니다. 직접 확인하실 때 참고하세요.

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',                     // Railway는 루트 경로. 하위 경로 아님
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,        // 삽화 PNG를 base64로 인라인하지 않게
  },
})
```

### `Dockerfile`

```dockerfile
# 1단계: 빌드
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2단계: 서빙
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
ENV PORT=8080
CMD ["/bin/sh", "-c", "envsubst '$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
```

멀티스테이지라 최종 이미지에 `node_modules`가 남지 않습니다. 30~40MB 수준으로 끝납니다.

### `nginx.conf.template`

```nginx
server {
    listen ${PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1024;

    # 해시가 붙은 정적 자산은 오래 캐시
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 삽화 PNG도 파일명이 고정이므로 하루 정도만
    location ~* \.(png|jpg|webp|woff2)$ {
        expires 7d;
        add_header Cache-Control "public";
    }

    # index.html은 캐시하지 않음 (배포 즉시 반영되도록)
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### `.dockerignore`

```
node_modules
dist
.git
.env*
*.md
```

### `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "Dockerfile" },
  "deploy": { "restartPolicyType": "ON_FAILURE", "restartPolicyMaxRetries": 3 }
}
```

이 파일이 없으면 Railway가 Nixpacks로 자동 감지를 시도하다가 정적 사이트를 Node 앱으로 오인할 수 있습니다. 명시해 두는 편이 안전합니다.

---

## 3. 배포 방법 A — CLI

한 번 띄워 보고 확인하기에 가장 빠릅니다.

```bash
# 설치 (한 번만)
npm i -g @railway/cli

# 로그인 — 브라우저가 열립니다
railway login

# 프로젝트 생성 및 연결
railway init
# → 프로젝트 이름 입력 (예: ailit-kr)

# 배포
railway up

# 공개 URL 발급
railway domain
# → https://ailit-kr-production.up.railway.app 형태로 나옵니다
```

로그를 보려면

```bash
railway logs
```

빌드가 실패하면 대부분 `npm ci` 단계입니다. `package-lock.json`이 커밋되어 있는지 확인하세요.

---

## 4. 배포 방법 B — GitHub 연동 (권장)

문서를 계속 고칠 예정이면 이쪽이 편합니다. `git push` 할 때마다 자동으로 다시 빌드됩니다.

1. GitHub에 리포지토리를 만들고 코드를 올립니다.

   ```bash
   git init
   git add .
   git commit -m "AILit 프레임워크 한국어판"
   gh repo create ailit-kr --private --source=. --push
   ```

2. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. 리포지토리를 선택하면 Railway가 `Dockerfile`을 감지해 자동으로 빌드합니다.
4. 서비스 카드 클릭 → **Settings** → **Networking** → **Generate Domain**

이후 main 브랜치에 푸시하면 자동 재배포됩니다. 다른 브랜치로 미리 확인하고 싶으면 Settings에서 배포 브랜치를 바꾸거나 PR 환경을 켜면 됩니다.

---

## 5. 커스텀 도메인 연결

Settings → Networking → **Custom Domain**에 도메인을 입력하면 CNAME 값을 알려 줍니다.

| 유형 | 이름 | 값 |
|---|---|---|
| CNAME | `ailit` (또는 `www`) | Railway가 알려 주는 `xxx.up.railway.app` |

루트 도메인(`example.com`)을 붙이려면 CNAME flattening이나 ALIAS 레코드를 지원하는 DNS가 필요합니다. Cloudflare, Route 53이 지원합니다. 그렇지 않은 등록기관을 쓰신다면 서브도메인으로 붙이는 편이 속 편합니다.

인증서는 Railway가 Let's Encrypt로 자동 발급합니다. DNS 전파 후 몇 분 걸립니다.

---

## 6. 비용에 관해

Railway는 사용량 과금이라 컨테이너가 계속 떠 있으면 유휴 상태에도 요금이 붙습니다. 정적 문서 사이트 하나면 무료 크레딧 범위에서 대체로 해결되지만, 예산을 정해 두시는 게 좋습니다.

Settings → **Usage Limits**에서 월 상한을 걸어 두세요.

메모리는 512MB로 충분합니다. nginx 정적 서빙은 그보다 훨씬 적게 씁니다.

---

## 7. 배포 전 점검

- [ ] `npm run build` 후 `npm run preview`로 빌드 결과가 정상인지 확인
- [ ] `dist/assets/`에 PNG 26장이 모두 들어갔는지 확인 (`ls dist/assets/*.png | wc -l`)
- [ ] `vite.config.ts`의 `base`가 `'/'`인지 확인
- [ ] `package-lock.json`이 커밋되어 있는지 확인
- [ ] 푸터의 CC BY 4.0 고지와 삽화 크레딧이 살아 있는지 확인
- [ ] 모바일 375px 폭에서 우측 목차가 드로어로 잘 전환되는지 확인

---

## 8. 자주 걸리는 문제

**배포는 됐는데 502가 뜬다**
컨테이너가 `$PORT`를 듣지 않는 경우입니다. `railway logs`로 nginx가 어느 포트로 떴는지 확인하세요. `envsubst` 치환이 실패하면 `listen ${PORT};`가 그대로 남아 nginx가 기동하지 못합니다.

**이미지가 404다**
`vite.config.ts`의 `base`가 `'/'`가 아니거나, `assets/`를 `public/` 밖에 두어 빌드에 포함되지 않은 경우입니다. Vite는 `public/` 폴더 내용을 `dist/` 루트로 그대로 복사합니다. 삽화는 `public/assets/`에 두는 편이 단순합니다.

**한글 폰트가 깨진다**
Pretendard와 Noto Serif KR을 CDN에서 불러오고 있다면 `<link rel="preconnect">`가 있는지 확인하세요. 폰트를 리포에 포함시키려면 `public/fonts/`에 woff2를 두고 `@font-face`로 직접 선언하는 편이 로딩이 안정적입니다. 문서가 길어서 폰트 지연이 눈에 띕니다.

**빌드가 타임아웃된다**
`.dockerignore`에 `node_modules`가 빠져 있으면 로컬 폴더를 통째로 업로드하느라 오래 걸립니다.

---

## 참고

- Railway 문서: https://docs.railway.app
- Railway CLI: https://docs.railway.app/develop/cli
