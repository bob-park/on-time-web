---
title: Directory Structure & Layout Rules
scope: src/**
applies_to: adding a new domain, placing layout/page sub-components, route groups, special files
related:
  - ./conventions/naming.md
  - ./conventions/module-aliases.md
  - ./libs/next-intl.md
---

# Directory Structure & Layout Rules

> `src/` 는 `app/`, `domain/<name>/{apis,queries,components,store}`, `shared/`, `utils/` 로 나뉜다. layout sub-component 는 같은 디렉토리의 `_layouts/` private folder, page sub-component 는 `_components/` private folder 에 둔다. route group `(name)/` 으로 URL 영향 없이 layout 을 분리한다.

## Directory tree

```text
src/
├── app/                # Next.js App Router (pages, layouts, api routes)
│   ├── _layouts/       # Root layout 의 sub-components (Sidebar, Header, MobileDock, ...) — see "App Router `_layouts/`" section below
│   └── api/            # Route handlers (e.g. /api/health)
├── domain/             # Business domains — each domain owns its full slice
│   └── <domain>/
│       ├── apis/       # ky-based fetch functions + *.dto.ts types
│       ├── queries/    # React Query hooks (useXxx) wrapping apis
│       ├── components/ # Domain-scoped components
│       └── store/      # Zustand slice + types
├── shared/             # Reusable across domains
│   ├── api/            # ky instance, common dto (PagedModel, PageRequest)
│   ├── components/     # Cross-cutting UI primitives (PageHeader, Card, Table, Badge, ...) + toast / theme / queries
│   ├── hooks/          # Reusable hooks (useModal, useWebSocket, ...)
│   ├── i18n/           # next-intl config, locale resolution, server action — see [next-intl](./libs/next-intl.md)
│   ├── providers/      # theme type (no React provider)
│   ├── queries/        # Shared React Query types/utilities
│   ├── store/          # Root Zustand store (combines domain slices)
│   └── dayjs/          # dayjs configuration / locale setup
├── utils/              # Pure utility functions (no React, no I/O)
└── proxy.ts            # Auth proxy logic — call from a Next.js middleware

messages/               # next-intl translation messages — messages/<locale>.json — see [next-intl](./libs/next-intl.md)
```

Rule: when adding a new domain, create all four sub-folders (`apis`, `queries`, `components`, `store`) even if some start empty. Predictable layout matters more than file count. 단, 타입만 가지는 도메인 (예: `team`, `position`, `notification`) 은 `apis/<name>.dto.ts` 만 두고, 나머지 폴더는 실제 코드가 생길 때 만든다.

## Adding a domain feature

When adding a feature, follow this order:

1. Define types in `src/domain/<name>/apis/<name>.dto.ts`.
2. Add fetchers in `src/domain/<name>/apis/<name>.ts`.
3. Wrap them with React Query hooks in `src/domain/<name>/queries/<name>.tsx`.
4. Build UI in `src/domain/<name>/components/`.
5. If client-only UI state is needed, add a Zustand slice in `src/domain/<name>/store/slice.ts` and register it in `rootStore.ts`.

Cross-domain reuse moves to `src/shared/`. `src/utils/` is for **pure functions only** — no React, no I/O.

## App Router `_layouts/`

### Core rule

- 어떤 디렉토리든 `layout.tsx` 가 sub-component 를 필요로 하면, **같은 디렉토리에 `_layouts/` private folder** 를 만들어 그 안에 sub-component 를 둔다. underscore prefix 는 Next.js 가 라우트에서 제외하는 [private folder](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders) 규약이다.
- 파일명은 [File Naming](./conventions/naming.md) 그대로 `PascalCase.tsx`. 예: `Header.tsx`, `Sidebar.tsx`, `MobileDock.tsx`.
- `layout.tsx` 에서 import 할 때는 같은 폴더이므로 **상대경로** (`./_layouts/Header`) 를 사용한다.
- 다른 layout 의 `_layouts/` 컴포넌트는 import 하지 않는다 — 각 `_layouts/` 은 그 layout 전용이다.
- Cross-layout 으로 재사용해야 하는 컴포넌트는 `_layouts/` 이 아니라 `src/shared/components/<area>/` 로 승격한다 (see "Directory tree" section above).
- 적용 범위: root (`src/app/_layouts/`) 와 nested layout (예: `src/app/admin/_layouts/`) **모두 동일 규칙**.

### Directory example

현재 root shell (`src/app/_layouts/`):

```text
src/app/
├── _layouts/
│   ├── Sidebar.tsx           # 데스크톱 좌측 네비게이션 (NAV_GROUPS 렌더링 + ClockCard)
│   ├── ClockCard.tsx         # Sidebar 하단 출퇴근 카드
│   ├── Header.tsx            # breadcrumb + ThemeSwitcher + 알림 + 아바타
│   ├── MobileDock.tsx        # 모바일 하단 도크
│   ├── NotificationDialog.tsx
│   ├── nav.ts                # NAV_GROUPS / NavItem / NavGroup / isActive / findNavItem — 네비게이션 테이블
│   └── breadcrumb.ts         # useBreadcrumbTitle — 상세 페이지가 breadcrumb 끝에 제목을 거는 모듈 store
├── layout.tsx
└── page.tsx
```

- `src/app/layout.tsx` 는 `./_layouts/Sidebar`, `./_layouts/Header`, `./_layouts/MobileDock` 를 사용한다.
- `_layouts/` 에는 `.tsx` sub-component 외에 그 layout 전용 데이터/훅 모듈 (`nav.ts`, `breadcrumb.ts`) 도 둘 수 있다. 파일명은 [File Naming](./conventions/naming.md) 대로 컴포넌트는 `PascalCase.tsx`, 모듈은 `camelCase.ts`.
- 네비게이션 항목을 추가/삭제할 때는 `nav.ts` 의 `NAV_GROUPS` 만 수정한다 — `Sidebar` 가 이 테이블을 렌더링하고, `Header` 는 같은 파일의 `findNavItem` 으로 현재 segment 의 breadcrumb 라벨을 찾는다. `MobileDock` 은 고정 4개 항목 + `ClockCard` 의 `ClockFab` 이라 이 테이블을 쓰지 않는다.
- 상세 페이지가 breadcrumb 끝에 문서 제목을 붙이려면 `breadcrumb.ts` 의 `useBreadcrumbTitle(title)` 을 호출한다 (provider 없는 모듈 단위 store, 언마운트 시 자동 해제).
- Nested layout 도 동일 규칙이다. 예시 — 실제 경로 아님: `src/app/admin/_layouts/Sidebar.tsx` 는 `src/app/admin/layout.tsx` 전용이며, root layout 에서 쓰고 싶다면 먼저 `src/shared/components/` 로 승격한다.

## Shared UI primitives — `src/shared/components/`

여러 도메인이 공유하는 UI 는 `src/shared/components/` 루트에 둔다. 새 페이지를 만들 때 아래를 먼저 재사용하고, 같은 모양을 다시 만들지 않는다.

- `PageHeader` — `eyebrow` / title / description / actions 페이지 상단
- `CardPageTitle` — 카드 안 제목 (placeholder 지원)
- `Card` / `CardSection` — 카드 컨테이너와 제목·링크 있는 섹션
- `StatCard` — 지표 카드 (label / value / unit / caption / ring)
- `Badge` — 상태 badge 의 단일 진입점 (variant `ok` / `wait` / `no` / `neutral` / `primary`)
- `Segment` — 세그먼트 토글
- `Pagination` — 목록 페이지네이션
- `Table` — `thClass` / `tdClass` / `rowClass` 클래스 상수 + `TableSkeletonRows`
- `FormSection` — 번호가 붙는 폼 단계 섹션

도메인 전용이지만 여러 페이지가 쓰는 것은 해당 도메인의 `components/` 에 둔다:
`ApprovalStepper` (+ `toApprovalSteps`, `toDocumentSteps`) — `src/domain/approval/components/`,
`DocumentPeriod` / `DocumentStatusBadge` / `DocumentTypeBadge` — `src/domain/document/components/`,
`AttendanceStatusBadge` — `src/domain/attendance/components/`.

스타일 토큰과 badge/버튼 규칙은 [Tailwind 4 + daisyUI 5](./libs/tailwind-daisyui.md).

## Page sub-components — `_components/`

`layout.tsx` 의 `_layouts/` 와 동일한 컨셉을 `page.tsx` 에 적용한다.

- `page.tsx` 가 sub-component 를 필요로 하면, **같은 디렉토리에 `_components/` private folder** 를 만든다. underscore prefix 는 동일한 [private folder](https://nextjs.org/docs/app/building-your-application/routing/colocation#private-folders) 규약.
- 파일명: `PascalCase.tsx`. 일반적으로 페이지의 client 본문을 `<RouteName>Contents.tsx` 같은 이름으로 둔다 (예: `ConferenceAddContents.tsx`, `RegistrationFileInput.tsx`).
- `page.tsx` 는 server component 로 두고, 인터랙티브 본문은 `_components/<Name>Contents.tsx` 로 분리하는 것이 일반 패턴.
- `_layouts/` 와 `_components/` 의 차이: 전자는 `layout.tsx` 전용, 후자는 `page.tsx` 전용. 둘 다 그 디렉토리 안에서만 사용한다.

예:

```text
src/app/admin/users/
├── _components/
│   ├── UsersContents.tsx     # client 본문
│   └── UserFilterBar.tsx
├── page.tsx                  # server component, _components 의 *Contents 를 렌더링
└── add/
    ├── _components/
    │   └── UserAddContents.tsx
    └── page.tsx
```

## Route groups — `(name)/`

URL segment 를 추가하지 않고 layout / page 만 그룹핑하고 싶을 때 [route group](https://nextjs.org/docs/app/building-your-application/routing/route-groups) 을 사용한다.

- 폴더명을 괄호로 감싸면 (`(noneSelected)`, `(selected)`) URL 에 반영되지 않는다.
- 그룹별로 자체 `layout.tsx` + `_layouts/` sub-component 를 둘 수 있다.
- 같은 URL prefix 를 공유하면서 권한/조건별로 다른 layout 이 필요할 때 가장 유용 (예: 컨퍼런스 선택 전후 다른 nav 노출).
- 그룹은 import 경로에 반영된다: `src/app/(noneSelected)/conferences/page.tsx` → URL `/conferences`, import 는 `@/app/(noneSelected)/...` 그대로 사용.

## Special files & co-located assets

Next.js 가 인식하는 특수 파일은 영향을 받는 segment 와 **같은 디렉토리** 에 둔다.

- `loading.tsx` — Suspense fallback.
- `not-found.tsx` — `notFound()` 호출 시 렌더링.
- `forbidden.tsx` — `forbidden()` 호출 시 렌더링.
- `error.tsx` — error boundary.
- 정적 데이터 (`*.json`, 예: Lottie animation) 는 사용 컴포넌트와 같은 디렉토리에 co-locate (예: `not-found.tsx` 옆에 `not-found.json`).

이 파일들은 `_layouts/` / `_components/` 가 아니라 segment 디렉토리 루트에 둔다 — Next.js convention 이 그 위치에서만 인식하기 때문.
