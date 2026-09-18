# on-time-web

HR/근태 관리 웹 애플리케이션

## Tech Stack

- **Framework**: Next.js 16 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + daisyUI v5
- **State**: Zustand v5
- **Data Fetching**: TanStack Query v5
- **HTTP Client**: ky
- **Auth**: better-auth (genericOAuth + PKCE, KeyFlow Authorization Server 연동)

## Features

- **Dashboard** — weekly working record table with duration bar, category badges, weekly summary cards
- **Documents** — pill filters (category + status), table layout with status badges, pagination
- **Approvals** — approval history with pill filters, inline pagination
- **Day-off requests** — vacation request form supporting GENERAL / COMPENSATORY / OFFICIAL types
- **Day-off history** — year switcher, usage stats header
- **Overtime requests** — inline datetime entry (hour/minute selectors), add-row table
- **Manager: dayoff/users/vacations** — employee vacation matrix with sticky columns, year navigation

## Getting Started

Node / yarn 버전은 `mise` 로 관리한다.

```bash
mise trust && mise ls   # Node / yarn 버전 동기화
```

```bash
yarn dev          # 개발 서버
yarn build        # 프로덕션 빌드
yarn start        # 프로덕션 빌드 실행
yarn lint         # ESLint (커밋 전 필수)
yarn prettier     # 전체 소스 포매팅
```

## Environment Variables

`.env` 에 다음 6개 키를 설정한다 (값은 예시 placeholder).

```
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-better-auth-secret

KEYFLOW_AUTH_HOST=https://your-keyflow-auth-server
KEYFLOW_AUTH_CLIENT_ID=your-client-id
KEYFLOW_AUTH_CLIENT_SECRET=your-client-secret

API_HOST=https://your-api-gateway
```

## Auth

KeyFlow Authorization Server 와 [better-auth](https://www.better-auth.com/) (genericOAuth
플러그인 + PKCE) 로 직접 연동한다.

- `/login`, `/logout` 은 page 가 아니라 **route handler** (`src/app/login/route.ts`,
  `src/app/logout/route.ts`) 로, React 렌더링 없이 즉시 redirect 한다.
- 세션은 better-auth 가 보관한다. 세션 가드는 `src/proxy.ts` 에 있으며, 세션이 없으면
  원래 경로를 `callback` 으로 붙여 `/login` 으로 보낸다.
- `/api/v1/**` 요청은 catch-all 프록시 (`src/app/api/[...path]/route.ts`) 가
  서버 사이드에서 access token 을 해석해 `Authorization: Bearer` 헤더로 `API_HOST` 에
  전달한다. **access token 은 브라우저로 노출되지 않는다.**
- 기존 BFF 에서 이관된 집계/머지 handler 는 `src/app/api/v1/**` 아래에 있다.
- 클라이언트 응답 처리: 401 → `/login`, 403 → `/forbidden`.

자세한 내용은 [docs/agents/overview.md](docs/agents/overview.md) 와
[AGENTS.md](AGENTS.md) 를 참고한다.
