# on-time-web

HR/근태 관리 웹 애플리케이션

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **State**: Zustand v5
- **Data Fetching**: TanStack Query v5
- **HTTP Client**: ky
- **Auth**: OAuth2 (keyflow-auth)
- **Mocking**: MSW v2

## Features

- **Dashboard** — weekly working record table with duration bar, category badges, weekly summary cards
- **Documents** — pill filters (category + status), table layout with status badges, pagination
- **Approvals** — approval history with pill filters, inline pagination
- **Day-off requests** — vacation request form supporting GENERAL / COMPENSATORY / OFFICIAL types
- **Day-off history** — year switcher, usage stats header
- **Overtime requests** — inline datetime entry (hour/minute selectors), add-row table
- **Manager: dayoff/users/vacations** — employee vacation matrix with sticky columns, year navigation

## Getting Started

```bash
yarn dev          # 개발 서버
yarn mock         # MSW mock 서버
yarn build        # 프로덕션 빌드
yarn lint         # ESLint
```

## Environment Variables

```
WEB_SERVICE_HOST=http://your-backend-server
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Auth

OAuth2 via keyflow-auth (`/api/oauth2/authorization/keyflow-auth`). 401 responses redirect to login automatically.
