# Phase 1: Framework Upgrade (template-nextjs-app 완전 동기화) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** on-time-web 의 툴체인/의존성을 `/Users/hwpark/Documents/webstorm-workspace/template-nextjs-app` 스택에 완전 동기화한다 — UI 변경 없음.

**Architecture:** 순차적 의존성 업그레이드. 각 태스크는 독립 커밋이며 `yarn build` 통과가 게이트다. 회귀 원인 분리를 위해 major 업그레이드(TS 6, ky 2)는 별도 태스크로 나눈다. UI/스타일 변경은 Phase 2 로 미룬다.

**Tech Stack:** Next.js 16.2.9, React 19.2.7(고정), TypeScript 6, ky 2, next-intl 4 (ko 단일), miragejs, yarn 4.17.0

**Spec:** `docs/superpowers/specs/2026-07-11-v3-upgrade-and-spotify-redesign-design.md`

## Global Constraints

- 이 Phase 에서 **화면/스타일/동작 변경 금지** — 기존 UI 그대로 렌더링되어야 한다.
- 테스트 스크립트 없음 (CLAUDE.md). 검증 = `yarn build` + `yarn lint` + 수동 스모크.
- 유지해야 하는 프로젝트 전용 deps (템플릿에 없어도 **삭제 금지**): `jspdf`, `html2canvas-pro`, `qr-code-styling`, `qrcode`, `@types/qrcode`, `react-day-picker`, `@stomp/stompjs`, `sockjs-client`, `@types/sockjs-client`, `timeago-react`, `timeago.js`, `autoprefixer`, `react-icons`, `classnames`, `@types/classnames`
- 커밋 메시지 prefix 는 저장소 관례 (`build:`, `feat:`, `chore:`, `refactor:`) 를 따른다.
- 각 커밋 전 `yarn build` 성공 필수.
- 참조 템플릿 절대 경로: `/Users/hwpark/Documents/webstorm-workspace/template-nextjs-app` (이하 `TEMPLATE`)

---

### Task 1: Yarn 4.17 + 전체 버전 동기화 (non-major)

**Files:**
- Modify: `package.json`
- Modify: `yarn.lock` (yarn install 산출물)

**Interfaces:**
- Produces: 이후 모든 태스크의 기반이 되는 lockfile 상태. React 19.2.7 고정 + `resolutions`.

- [ ] **Step 1: yarn 버전 업데이트**

```bash
cd /Users/hwpark/Documents/webstorm-workspace/on-time-web
yarn set version 4.17.0
```

Expected: `package.json` 의 `packageManager` 가 `yarn@4.17.0` 으로 변경됨.

- [ ] **Step 2: package.json 버전 필드 수정**

`package.json` 을 다음과 같이 수정 (**major 인 typescript/ky 는 이 태스크에서 건드리지 않는다**):

dependencies:
```json
"@tanstack/react-query": "^5.101.2",
"dayjs": "^1.11.21",
"immer": "^11.1.8",
"lodash": "^4.18.1",
"next": "16.2.9",
"react": "19.2.7",
"react-dom": "19.2.7",
"sharp": "^0.35.2",
"uuid": "^14.0.1",
"zustand": "^5.0.14"
```

devDependencies:
```json
"@faker-js/faker": "^10.5.0",
"@tanstack/react-query-devtools": "^5.101.2",
"@types/node": "^24.13.2",
"@types/react": "19.2.7",
"@types/react-dom": "19.2.3",
"daisyui": "^5.6.5"
```

최상위에 `resolutions` 필드 추가 (template 과 동일):
```json
"resolutions": {
  "@types/react": "19.2.7",
  "@types/react-dom": "19.2.3"
}
```

- [ ] **Step 3: 설치 및 빌드 확인**

```bash
yarn install
yarn build
```

Expected: 둘 다 성공. 실패 시 에러를 읽고 해당 버전 호환 문제를 수정 (uuid 14 는 `v4()` 등 named export API 동일 — 사용처는 `grep -rn "from 'uuid'" src` 로 확인, import 문 변경 불필요).

- [ ] **Step 4: Commit**

```bash
git add package.json yarn.lock .yarnrc.yml .yarn 2>/dev/null; git add -u
git commit -m "build: yarn 4.17 및 의존성 버전 template 동기화 (non-major)"
```

---

### Task 2: TypeScript 6 업그레이드

**Files:**
- Modify: `package.json` (`"typescript": "^6"`)
- Modify: `tsconfig.json`
- Modify: TS6 에서 컴파일 에러 나는 `src/**/*.ts(x)` (빌드 에러 기반으로 특정)

**Interfaces:**
- Consumes: Task 1 의 lockfile.
- Produces: TS6 로 컴파일되는 소스 트리.

- [ ] **Step 1: 버전 변경 및 설치**

```bash
yarn add -D typescript@^6
```

- [ ] **Step 2: tsconfig.json 을 template 과 동기화**

현재 프로젝트 `tsconfig.json` 을 열어 template (`TEMPLATE/tsconfig.json`) 과 비교하고, 다음 값으로 맞춘다 (기존 프로젝트에만 있는 옵션은 유지):

```json
{
  "compilerOptions": {
    "target": "es2024",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

(`"@/messages/*"` path 는 Task 6 next-intl 태스크에서 추가한다.)

- [ ] **Step 3: 타입 체크 실행, 에러 수정**

```bash
yarn tsc --noEmit
```

Expected: 에러 0 또는 TS6 강화된 검사로 인한 에러 목록. 에러가 나오면 **동작을 바꾸지 않는 최소 수정**으로 해결한다 (타입 표기 보강, 불가피한 서드파티 타입 충돌만 최소 범위 `as` 캐스팅). 수정 후 재실행하여 0 에러 확인.

- [ ] **Step 4: 빌드 확인 및 Commit**

```bash
yarn build
git add -u
git commit -m "build: TypeScript 6 업그레이드"
```

---

### Task 3: ky 2.x 마이그레이션

**Files:**
- Modify: `package.json` (`"ky": "^2.0.2"`)
- Modify: `src/shared/api/index.ts`

**Interfaces:**
- Consumes: Task 1–2 상태.
- Produces: `src/shared/api/index.ts` 의 default export `api` (ky 2 인스턴스). 11개 소비 파일의 호출 시그니처(`api.get(url).json<T>()` 등)는 변경 없음.

배경: ky 는 프로젝트에서 `src/shared/api/index.ts` **한 곳**에서만 import 된다. ky 2.x 의 주요 breaking change 중 이 프로젝트에 해당하는 것은 **hook 콜백 시그니처** — 1.x 의 positional `(request, options, response)` 가 2.x 에서 destructured object `({ request, options, response })` 로 바뀌었다 (template 의 `TEMPLATE/src/shared/api/index.ts` 가 2.x 스타일 참조 구현).

- [ ] **Step 1: 버전 변경**

```bash
yarn add ky@^2.0.2
```

- [ ] **Step 2: hook 시그니처 마이그레이션**

`src/shared/api/index.ts` 전체를 다음으로 교체:

```typescript
import ky from 'ky';

const index = ky.extend({
  retry: {
    limit: 2,
    statusCodes: [408, 500, 502, 503, 504],
  },
  hooks: {
    afterResponse: [
      ({ response }) => {
        // 401 Unauthorized 인 경우 로그인 페이지로 이동
        if (response.status === 401) {
          location.href = '/api/oauth2/authorization/keyflow-auth';
        }

        // 403 Forbidden 인 경우 forbidden 페이지로 이동
        if (response.status === 403) {
          location.href = '/forbidden';
        }
      },
    ],
  },
});

export default index;
```

- [ ] **Step 3: 타입/빌드 확인**

```bash
yarn tsc --noEmit && yarn build
```

Expected: 성공. 실패 시 ky 2 의 시그니처 변경으로 인한 에러만 수정 (호출부 `.json<T>()` 패턴은 2.x 에서 동일).

- [ ] **Step 4: 스모크 (개발 서버)**

```bash
yarn dev
```

브라우저에서 `http://localhost:3000/dashboard` 접속 → API 호출(주간 근태 데이터)이 정상 렌더링되는지, 401 시 로그인 리다이렉트가 동작하는지 확인 후 서버 종료.

- [ ] **Step 5: Commit**

```bash
git add -u
git commit -m "build: ky 2.x 마이그레이션 (hook 시그니처 변경)"
```

---

### Task 4: ESLint/Prettier 설정 동기화

**Files:**
- Modify: `package.json` (config 버전, `lint` 스크립트, `prettier: ^3` 명시, `eslint: ^9` 명시)
- Create: `eslint.config.mjs`

**Interfaces:**
- Produces: `yarn lint` = `eslint ./src`, flat config 기반.

- [ ] **Step 1: 버전 변경**

```bash
yarn add -D @bob-park/eslint-config-bobpark@0.3.0-RC4-20260630 @bob-park/prettier-config-bobpark@0.4.0-RC4-20260630 eslint@^9 prettier@^3
```

- [ ] **Step 2: lint 스크립트 교체**

`package.json` scripts:
```json
"lint": "eslint ./src"
```

- [ ] **Step 3: eslint.config.mjs 생성** (template 과 동일 내용)

```javascript
// eslint.config.mjs
import eslintConfig from '@bob-park/eslint-config-bobpark';

import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig } from 'eslint/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  {
    extends: [eslintConfig],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]);
```

- [ ] **Step 4: lint + prettier 실행, 위반 수정**

```bash
yarn lint
```

Expected: 새 config 의 규칙 위반 목록이 나올 수 있음. 자동 수정 가능한 것은 `yarn lint --fix`, 나머지는 수동 수정 (동작 변경 금지 — 스타일/import 순서 수준만).

```bash
yarn prettier
```

Expected: 새 prettier config 로 전체 포매팅. diff 가 클 수 있으나 전부 포맷 변경이어야 함.

- [ ] **Step 5: 빌드 확인 및 Commit**

```bash
yarn build
git add -A
git commit -m "build: eslint/prettier config 0.3/0.4 RC 동기화 및 flat config 전환"
```

---

### Task 5: msw 제거 + miragejs/lottie-react 추가

**Files:**
- Delete: `src/mocks/http.ts`, `src/mocks/browser.ts`, `src/mocks/handlers.ts`, `public/mockServiceWorker.js` (존재 시)
- Modify: `package.json` (deps 제거/추가, `mock` 스크립트 제거, `msw.workerDirectory` 필드 제거)
- Modify: `.env`, `.env.development.local` (`MOCK_SERVER_HOST` 제거)

**Interfaces:**
- Produces: mock 인프라 없는 클린 상태 + miragejs devDep (템플릿 패리티). `src` 어디서도 `src/mocks` 를 import 하지 않음이 전제 (사전 확인됨 — `handlers.ts` 는 빈 배열이고 소비처 없음).

- [ ] **Step 1: 소비처 재확인 (안전망)**

```bash
grep -rn "src/mocks\|mocks/browser\|mocks/handlers\|MOCK_SERVER_HOST" src --include="*.ts" --include="*.tsx"
```

Expected: 출력 없음 (mocks 디렉토리 내부 상호 참조 제외). 출력이 있으면 해당 참조를 먼저 제거.

- [ ] **Step 2: 파일/필드 삭제**

```bash
rm -rf src/mocks
rm -f public/mockServiceWorker.js
```

`package.json` 에서 제거:
- scripts: `"mock"`
- 최상위 `"msw"` 필드 (workerDirectory)

`.env`, `.env.development.local` 에서 `MOCK_SERVER_HOST` 라인 제거.

- [ ] **Step 3: deps 교체**

```bash
yarn remove msw @mswjs/http-middleware express cors @types/express @types/cors
yarn add -D miragejs@^0.1.48
yarn add lottie-react@^2.4.1
```

(miragejs 는 템플릿 패리티용 devDep. 실제 mock 서버 작성은 필요해질 때 — 현재 msw handlers 가 비어 있었으므로 재현할 mock 계약이 없다. lottie-react 는 Phase 2 에서 사용.)

- [ ] **Step 4: 빌드 확인 및 Commit**

```bash
yarn build
git add -A
git commit -m "build: msw 인프라 제거, miragejs/lottie-react 추가"
```

---

### Task 6: next-intl v4 도입 (ko 단일 locale)

**Files:**
- Create: `src/shared/i18n/config.ts`
- Create: `src/shared/i18n/locale.ts`
- Create: `src/shared/i18n/request.ts`
- Create: `messages/ko.json`
- Modify: `next.config.ts` (plugin wrap)
- Modify: `tsconfig.json` (`@/messages/*` path)
- Modify: `src/app/layout.tsx` (Provider + generateMetadata)
- Modify: `package.json` (`next-intl` 추가)

**Interfaces:**
- Produces:
  - `getUserLocale(): Promise<'ko'>` (`src/shared/i18n/locale.ts`)
  - `messages/ko.json` — 네임스페이스 구조 `{ "metadata": { "title", "description" } }`. Phase 2 의 각 페이지 태스크가 여기에 페이지 네임스페이스를 추가한다.
  - `src/app/layout.tsx` 가 `NextIntlClientProvider` 로 children 을 감싼다. 클라이언트 컴포넌트는 `useTranslations('<ns>')`, 서버는 `getTranslations('<ns>')` 사용 가능.

- [ ] **Step 1: 설치**

```bash
yarn add next-intl@^4.13.0
```

- [ ] **Step 2: i18n 설정 파일 생성** (template 기반, **ko 단일로 축소**)

`src/shared/i18n/config.ts`:
```typescript
export const SUPPORTED_LOCALES = ['ko'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ko';

export function isSupportedLocale(value: string | undefined): value is Locale {
  return value !== undefined && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
```

`src/shared/i18n/locale.ts`:
```typescript
import 'server-only';

import { DEFAULT_LOCALE, Locale } from './config';

export async function getUserLocale(): Promise<Locale> {
  return DEFAULT_LOCALE;
}
```

`src/shared/i18n/request.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server';

import { getUserLocale } from './locale';

export default getRequestConfig(async () => {
  const locale = await getUserLocale();

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return { locale, messages };
});
```

(template 의 `locale.type.ts` / `localeAction.ts` / `LanguageSwitcher` 는 다국어 전환용이므로 ko 단일에서는 만들지 않는다 — YAGNI.)

- [ ] **Step 3: messages/ko.json 시드 생성**

```json
{
  "metadata": {
    "title": "On Time",
    "description": "전자 근태 관리 시스템"
  }
}
```

- [ ] **Step 4: next.config.ts 에 plugin 적용**

기존 `next.config.ts` 의 마지막 줄 `export default nextConfig;` 를 다음으로 교체하고 최상단에 import 추가:

```typescript
import createNextIntlPlugin from 'next-intl/plugin';
// ... 기존 nextConfig 정의 그대로 ...
const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');
export default withNextIntl(nextConfig);
```

- [ ] **Step 5: tsconfig paths 추가**

`tsconfig.json` `compilerOptions.paths`:
```json
"paths": {
  "@/*": ["./src/*"],
  "@/messages/*": ["./messages/*"]
}
```

- [ ] **Step 6: 루트 레이아웃에 Provider 연결**

`src/app/layout.tsx` 수정 —

(a) import 추가:
```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
```

(b) 기존 정적 `export const metadata` 를 제거하고 교체:
```typescript
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');
  return {
    title: t('title'),
    description: t('description'),
  };
}
```

(c) body 최상위에서 기존 `<RQProvider>...` 트리 전체를 감싼다:
```tsx
const messages = await getMessages();
// ...
<NextIntlClientProvider locale="ko" messages={messages}>
  {/* 기존 RQProvider 트리 그대로 */}
</NextIntlClientProvider>
```

`<html lang="ko">` 는 이미 ko 이므로 유지. **다른 하드코딩 문자열은 이 Phase 에서 건드리지 않는다** (Phase 2 에서 페이지별 추출).

- [ ] **Step 7: 빌드/스모크 및 Commit**

```bash
yarn tsc --noEmit && yarn build
yarn dev
```

`http://localhost:3000/dashboard` 접속 — 탭 타이틀 "On Time" 확인, 화면 기존과 동일해야 함. 서버 종료 후:

```bash
git add -A
git commit -m "feat: next-intl v4 도입 (ko 단일 locale)"
```

---

### Task 7: Phase 1 최종 검증 게이트

**Files:** 없음 (검증 전용; 발견된 문제 수정 시 해당 파일)

- [ ] **Step 1: 클린 빌드 + lint**

```bash
rm -rf .next && yarn build && yarn lint
```

Expected: 둘 다 성공.

- [ ] **Step 2: package.json 최종 대조**

`package.json` 을 `TEMPLATE/package.json` 과 나란히 비교:
- 공통 패키지의 버전이 전부 템플릿 이상인지
- `resolutions`, `packageManager: yarn@4.17.0`, `lint: eslint ./src` 확인
- 프로젝트 전용 deps (Global Constraints 목록) 가 그대로 있는지

- [ ] **Step 3: 수동 스모크 체크리스트** (`yarn dev`)

| # | 플로우 | 기대 |
|---|---|---|
| 1 | `/` 접속 | `/dashboard` 리다이렉트, 주간 근태 렌더 |
| 2 | `/dayoff/requests` | 잔여 연차 카드 + 캘린더 렌더 |
| 3 | `/documents` 필터 클릭 | 목록 필터링 + pagination 동작 |
| 4 | `/approvals` | 결재 목록 렌더 |
| 5 | (관리자 계정) `/attendance/view` | 주간 그리드 렌더 |
| 6 | 헤더 알림 벨 / 프로필 드롭다운 | 오픈 동작 |

기존과 다른 화면/에러 발견 시 이 Phase 의 커밋 범위에서 원인 수정 후 재검증.

- [ ] **Step 4: 문서 갱신 커밋**

`CLAUDE.md` 의 실행 명령어 섹션에서 `yarn mock` 언급이 있으면 제거, `docs/agents/tech-stack.md` / `docs/agents/workflows/dev-env.md` 에 버전 변경 반영 (핀 버전 위치 문서이므로 실제 내용 확인 후 필요한 부분만):

```bash
git add -u docs CLAUDE.md
git commit -m "docs: Phase 1 스택 변경 반영"
```
