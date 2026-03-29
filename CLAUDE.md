# on-time-web — CLAUDE.md

## Project Level: Dynamic

HR/근태 관리 웹 애플리케이션

## Tech Stack

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + DaisyUI v5
- **State**: Zustand v5
- **Data Fetching**: TanStack Query v5
- **HTTP Client**: ky
- **Auth**: OAuth2 (keyflow-auth) — 자체 백엔드 연동
- **Mocking**: MSW v2

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (user)/            # 일반 사용자 라우트
│   ├── (manager)/         # 관리자 라우트
│   └── _components/       # 공통 레이아웃 컴포넌트
├── domain/                 # 도메인별 분리
│   ├── attendance/        # 근태 도메인
│   ├── document/          # 문서/결재 도메인
│   ├── approval/          # 승인 도메인
│   ├── user/              # 사용자 도메인
│   └── ...
├── shared/                 # 공유 모듈
│   ├── api/               # HTTP 클라이언트 (ky 기반)
│   └── store/             # 공유 스토어
└── utils/                  # 유틸리티
```

## API Integration

- 백엔드: 자체 REST API (`/api/*` rewrites → `WEB_SERVICE_HOST`)
- 인증: OAuth2 via keyflow-auth (`/api/oauth2/authorization/keyflow-auth`)
- 401 응답 시 자동 로그인 페이지 리다이렉트

## Environment Variables

```
WEB_SERVICE_HOST=http://your-backend-server
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Commands

```bash
yarn dev          # 개발 서버 시작
yarn mock         # MSW mock 서버 시작
yarn build        # 프로덕션 빌드
yarn lint         # ESLint 검사
```

## PDCA Phase

현재: **DO** (구현 단계)

Active Features: dashboard, documents (pill filters + table + pagination), dayoff/requests, dayoff/used, approvals, layout (_components, NavMenu, Header)
