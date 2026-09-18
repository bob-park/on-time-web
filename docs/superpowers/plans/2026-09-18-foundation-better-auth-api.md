# Foundation (better-auth + Next.js API 계층 + 구조 재편) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Spring BFF and Spring OAuth2 client with better-auth and Next.js route handlers, then move `src/` to the `template-nextjs-app` layout, keeping every remaining page working.

**Architecture:** better-auth (`genericOAuth` + PKCE against KeyFlow) owns the session and access token server-side. A generic `src/app/api/[...path]` passthrough forwards `/api/v1/**` to the API gateway with a Bearer header; a handful of specific route handlers under `src/app/api/v1/**` port the BFF's aggregation and `sub` injection 1:1. The browser talks only to same-origin `/api/v1/**`.

**Tech Stack:** Next.js 16 (App Router, route handlers, `proxy.ts`), better-auth ^1.7, ky, TanStack Query 5, next-intl 4, Tailwind 4 + daisyUI 5, yarn 4.

**Spec:** `docs/superpowers/specs/2026-09-18-foundation-better-auth-api-design.md`

## Global Constraints

- Work on branch `feature/ui-v3`. One commit per task, message prefix per `docs/agents/workflows/git.md` (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- `yarn lint` and `yarn build` must pass at the end of every task. There is no test runner; do not add one.
- Reference template: `/Users/hwpark/Documents/webstorm-workspace/template-nextjs-app` (read-only). Reference BFF: `/Users/hwpark/Documents/intellij-workspace/on-time-web-service` (read-only).
- Gateway base URL is `process.env.API_HOST`; backend paths are forwarded as-is under `/api/v1/**`. Env keys already in `.env`: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `KEYFLOW_AUTH_HOST`, `KEYFLOW_AUTH_CLIENT_ID`, `KEYFLOW_AUTH_CLIENT_SECRET`, `API_HOST`. Never print their values.
- Access token never reaches the browser. All gateway calls happen in route handlers or server components.
- Paged responses from the gateway have the shape `{ content: T[], page: { size, number, totalElements, totalPages } }` (`PagedModel<T>`), not the old BFF `{ content, pageable, total }`.
- No new dependencies beyond `better-auth`. Do not add `en.json`; `ko` stays the only locale. Theme stays `ontime-dark` only.
- Code style: `@bob-park/prettier-config-bobpark`; run `yarn prettier` before each commit. React section comments per `docs/agents/conventions/react-sections.md`.
- Ponytail: shortest working diff. No abstractions beyond the ones named in this plan.

---

## File map

| Path | Responsibility |
|---|---|
| `src/shared/auth/index.ts`, `auth-client.ts`, `serverAction.ts` | better-auth server/client config; `getAccessToken()`, `getUserinfo()` (copied from template) |
| `src/app/api/auth/[...all]/route.ts`, `src/app/login/route.ts`, `src/app/logout/route.ts` | better-auth handler, login redirect, logout + OIDC end-session (copied) |
| `src/proxy.ts` | session guard (copied) |
| `src/app/api/health/route.ts` | `{status:'UP'}` for Docker healthcheck (copied) |
| `src/shared/api/server.ts` | server-only helpers: `serverApi` (ky → gateway with Bearer), `forward(req, override)`, `handle(fn)`, `currentSub()`, `unauthorized()` |
| `src/app/api/[...path]/route.ts` | generic passthrough = `forward` |
| `src/app/api/v1/**/route.ts` | BFF-ported handlers (Tasks 5–7) |
| `src/app/api/v1/documents/_lib/enrichDocument.ts` | 결재선 merge helper shared by the 3 결재 상세 routes |
| `src/shared/api/index.ts` | browser ky (no retry; 401→`/login`, 403→`/forbidden`), `toSearchParams`, `getNextPageParams` |
| `src/shared/api/common.dto.ts` | `PagedModel`, `PageRequest`, `SearchPageParams`, `ProblemDetail` (copied) |
| `src/domain/users/queries/users.tsx` | `useUser`, `useUserLeaveEntry`, `useProceedingApprovalCount` + existing hooks |
| `src/utils/AuthUtils.ts` | `hasRole` (copied) |

---

### Task 1: better-auth + proxy + login/logout

**Files:**
- Modify: `package.json` (add `better-auth`)
- Create: `src/shared/auth/index.ts`, `src/shared/auth/auth-client.ts`, `src/shared/auth/serverAction.ts`
- Create: `src/app/api/auth/[...all]/route.ts`, `src/app/login/route.ts`, `src/app/logout/route.ts`, `src/app/api/health/route.ts`
- Modify: `src/proxy.ts` (replace whole file)
- Modify: `next.config.ts` (remove `rewrites`, `headers`)
- Modify: `src/app/layout.tsx` (remove `/users/me` fetch and redirect)
- Modify: `src/app/(manager)/layout.tsx` (temporary: remove fetch, keep children; role guard lands in Task 8)
- Modify: `src/shared/api/index.ts` (401 → `/login`)

**Interfaces:**
- Produces: `getAccessToken(): Promise<string>`, `getUserinfo(): Promise<SessionUser | undefined>` where `SessionUser` has `sub: string`, `userId: string`, `role: string`, `name`, `email`. `authClient.useSession()` on the client with the same `user` fields.

- [ ] **Step 1: Install better-auth**

```bash
cd /Users/hwpark/Documents/webstorm-workspace/on-time-web && yarn add better-auth@^1.7.2
```

- [ ] **Step 2: Copy the auth files from the template verbatim**

```bash
T=/Users/hwpark/Documents/webstorm-workspace/template-nextjs-app
mkdir -p src/shared/auth 'src/app/api/auth/[...all]' src/app/login src/app/logout src/app/api/health
cp $T/src/shared/auth/index.ts $T/src/shared/auth/auth-client.ts $T/src/shared/auth/serverAction.ts src/shared/auth/
cp "$T/src/app/api/auth/[...all]/route.ts" "src/app/api/auth/[...all]/route.ts"
cp $T/src/app/login/route.ts src/app/login/route.ts
cp $T/src/app/logout/route.ts src/app/logout/route.ts
cp $T/src/app/api/health/route.ts src/app/api/health/route.ts
cp $T/src/proxy.ts src/proxy.ts
```

Then open `src/shared/auth/serverAction.ts` and confirm it contains exactly:

```ts
'use server';

import { headers } from 'next/headers';

import { auth } from '@/shared/auth/index';

export async function getAccessToken() {
  const accessToken = await auth.api.getAccessToken({
    body: {
      useAccountCookie: true,
    },
    headers: await headers(),
  });

  return accessToken.accessToken;
}

export async function getUserinfo() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user;
}
```

- [ ] **Step 3: Replace `next.config.ts`**

```ts
import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  experimental: {
    authInterrupts: true,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    minimumCacheTTL: 3600,
    unoptimized: true,
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin('./src/shared/i18n/request.ts');

export default withNextIntl(nextConfig);
```

- [ ] **Step 4: Strip the session fetch from `src/app/layout.tsx`**

Remove the `const { WEB_SERVICE_HOST, WS_HOST } = process.env;` line, the `import { redirect } from 'next/navigation';` line, the `import CustomerSupport ...` line, the whole `const res = await fetch(...)` … `const user = (await res.json()) as User;` block, and the commented `{/*<CustomerSupport .../>*/}` line. Keep `cookieStore` only if still used; if not, remove `const cookieStore = await cookies();` and the `cookies` import. The body of the returned JSX is unchanged.

- [ ] **Step 5: Temporarily neutralise `src/app/(manager)/layout.tsx`**

Replace the file with:

```tsx
export default function ManagerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
```

- [ ] **Step 6: Point the browser 401 handler at `/login`**

In `src/shared/api/index.ts` change `location.href = '/api/oauth2/authorization/keyflow-auth';` to `location.href = '/login';`.

- [ ] **Step 7: Build and lint**

Run: `yarn lint && yarn build`
Expected: both exit 0. (Pages still call `/api/...` BFF URLs; that's expected until Task 3.)

- [ ] **Step 8: Manual login round-trip**

Run `yarn dev`, open `http://localhost:3000/dashboard` in a private window.
Expected: redirect to `/login?callback=%2Fdashboard` → KeyFlow login → back to `/dashboard` (page will show loading/empty data, that's fine). Then open `http://localhost:3000/logout`.
Expected: redirect to KeyFlow `/connect/logout`, then back to `BETTER_AUTH_URL`, and `/dashboard` redirects to `/login` again.

- [ ] **Step 9: Commit**

```bash
yarn prettier && git add -A && git commit -m "feat: better-auth 기반 로그인/로그아웃 및 세션 가드 적용"
```

---

### Task 2: Server API helpers + generic passthrough

**Files:**
- Create: `src/shared/api/server.ts`
- Create: `src/app/api/[...path]/route.ts`
- Create: `src/shared/api/common.dto.ts` (copy from template)

**Interfaces:**
- Produces (all `server-only`):
  - `serverApi: KyInstance` — `prefixUrl = API_HOST`, Bearer set in `beforeRequest`, no retry. Call with paths **without** leading slash: `serverApi.get('api/v1/users/x/summary')`.
  - `forward(req: NextRequest, override?: { path?: string; searchParams?: URLSearchParams; body?: BodyInit | null }): Promise<NextResponse>` — proxies `req` to the gateway; `path` defaults to `req.nextUrl.pathname`.
  - `handle(fn: (sub: string) => Promise<unknown>): Promise<NextResponse>` — resolves `sub`, returns 401 if no session, JSON-encodes `fn`'s result, converts a ky `HTTPError` into the gateway's status + body.
  - `currentSub(): Promise<string | undefined>`
  - `unauthorized(): NextResponse` — `401 {error:'unauthorized'}`
- Produces: `PagedModel<T>`, `PageRequest`, `SearchPageParams`, `ProblemDetail` from `@/shared/api/common.dto`.

- [ ] **Step 1: Copy `common.dto.ts`**

```bash
cp /Users/hwpark/Documents/webstorm-workspace/template-nextjs-app/src/shared/api/common.dto.ts src/shared/api/common.dto.ts
```

- [ ] **Step 2: Write `src/shared/api/server.ts`**

```ts
import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

import { getAccessToken, getUserinfo } from '@/shared/auth/serverAction';

import ky, { HTTPError } from 'ky';

const { API_HOST } = process.env;

export const serverApi = ky.create({
  prefixUrl: API_HOST,
  retry: 0,
  timeout: 30_000,
  hooks: {
    beforeRequest: [
      async (request) => {
        request.headers.set('Authorization', `Bearer ${await getAccessToken()}`);
      },
    ],
  },
});

export function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function currentSub() {
  const user = await getUserinfo();

  return user?.sub;
}

function passthroughResponse(res: Response) {
  return new NextResponse(res.body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  });
}

export async function forward(
  req: NextRequest,
  override: { path?: string; searchParams?: URLSearchParams; body?: BodyInit | null } = {},
) {
  let accessToken: string;

  try {
    accessToken = await getAccessToken();
  } catch {
    return unauthorized();
  }

  const url = new URL(`${API_HOST}${override.path ?? req.nextUrl.pathname}`);
  url.search = (override.searchParams ?? req.nextUrl.searchParams).toString();

  const hasBody = !['GET', 'HEAD'].includes(req.method);

  const res = await fetch(url, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': req.headers.get('Content-Type') ?? 'application/json',
    },
    body: hasBody ? (override.body ?? req.body) : undefined,
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });

  return passthroughResponse(res);
}

export async function handle(fn: (sub: string) => Promise<unknown>) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  try {
    return NextResponse.json(await fn(sub));
  } catch (e) {
    if (e instanceof HTTPError) {
      return passthroughResponse(e.response);
    }

    throw e;
  }
}
```

- [ ] **Step 3: Write `src/app/api/[...path]/route.ts`**

```ts
import { forward } from '@/shared/api/server';

export { forward as GET, forward as POST, forward as PUT, forward as DELETE };
```

- [ ] **Step 4: Build**

Run: `yarn lint && yarn build`
Expected: exit 0. If `server-only` import fails, `yarn add server-only` is **not** needed — Next 16 ships it; check the import spelling.

- [ ] **Step 5: Smoke test the passthrough**

With `yarn dev` running and a logged-in browser tab, open `http://localhost:3000/api/v1/attendance/gps`.
Expected: JSON array from the gateway (may be `[]`). Open the same URL in a private window: `{"error":"unauthorized"}` with status 401.

- [ ] **Step 6: Commit**

```bash
yarn prettier && git add -A && git commit -m "feat: API gateway passthrough 및 server API helper 추가"
```

---

### Task 3: Browser URLs → `/api/v1/**`, `PagedModel` shape

**Files:**
- Modify: `src/domain/user/api/users.ts`, `userCompLeaveEntry.ts`, `userNotification.ts`
- Modify: `src/domain/document/api/documents.ts`, `vacation.ts`, `overtime.ts`
- Modify: `src/domain/approval/api/approvalHistory.ts`
- Modify: `src/domain/attendance/api/attendanceRecord.ts`, `attendanceCheck.ts`, `attendanceGps.ts`
- Modify: `src/shared/api/index.ts` (add `toSearchParams`, `getNextPageParams`; drop retry)
- Modify: `src/shared/api/types.d.ts` (remove `Page`, `Pageable`, `PageRequest`; keep `SearchPageParams` for now)
- Modify: `src/domain/user/query/user.tsx` (`useGetUsers` → `PagedModel`)
- Modify: `src/domain/document/query/vacation.tsx`, `documents.tsx`, `src/domain/approval/query/approvalHistory.tsx`
- Modify: `src/app/(user)/approvals/_components/DocumentApprovalContents.tsx:47`, `src/app/(user)/documents/_components/DocumentListContents.tsx:48`
- Modify: every `src/**/*.tsx` that renders `/api/users/${id}/avatar` or `/api/users/${id}/signature` image URLs

**Interfaces:**
- Consumes: `PagedModel<T>` from Task 2.
- Produces: all browser calls hit `/api/v1/**`; `useGetUsers(params)` still returns `{ pages, isLoading, isError, fetchNextPage, reload }` with `pages: PagedModel<User>[]`; `useDocuments`/`useApprovalHistories` return `{ page: PagedModel<...> | undefined, isLoading }`; `useVacationDocuments` returns `{ vacationDocuments, total, isLoading }`.

- [ ] **Step 1: Rename every browser URL prefix**

```bash
grep -rl "'/api/\|\`/api/" src/domain src/app --include='*.ts' --include='*.tsx' | xargs sed -i '' -e "s#'/api/#'/api/v1/#g" -e 's#`/api/#`/api/v1/#g'
git diff --stat
```

This also rewrites image `src` URLs (`/api/v1/users/${id}/avatar`, `.../signature`) and the soon-deleted `session.ts` / `CustomerSupport.tsx`; that is intended. Confirm with `grep -rn "'/api/[a-z]" src | grep -v "/api/v1/"` → no output.

- [ ] **Step 2: Replace `src/shared/api/index.ts`**

```ts
import ky from 'ky';

import { PagedModel } from './common.dto';

const index = ky.extend({
  retry: 0,
  hooks: {
    afterResponse: [
      ({ response }) => {
        // 401 Unauthorized 인 경우 로그인 페이지로 이동
        if (response.status === 401) {
          location.href = '/login';
        }

        // 403 Forbidden 인 경우 forbidden 페이지로 이동
        if (response.status === 403) {
          location.href = '/forbidden';
        }
      },
    ],
  },
});

export function toSearchParams(req: Record<string, unknown>) {
  const searchParams = new URLSearchParams();

  Object.entries(req).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  return searchParams;
}

export function getNextPageParams<T>(lastPage: PagedModel<T>, sort?: string[]) {
  const { totalPages, number, size } = lastPage.page;

  const nextPage = number + 1;

  if (nextPage > totalPages - 1) {
    return null;
  }

  return {
    size,
    page: nextPage,
    sort,
  };
}

export default index;
```

- [ ] **Step 3: Trim `src/shared/api/types.d.ts`** to only:

```ts
type SearchPageParams = {
  page: number;
  size: number;
};
```

- [ ] **Step 4: Switch paged API functions to `PagedModel`**

In `src/domain/user/api/users.ts`, `src/domain/document/api/documents.ts`, `src/domain/document/api/vacation.ts`, `src/domain/approval/api/approvalHistory.ts`: add `import { PagedModel } from '@/shared/api/common.dto';` and replace every `Page<X>` with `PagedModel<X>`.

- [ ] **Step 5: Rewrite `useGetUsers` in `src/domain/user/query/user.tsx`**

Replace the whole `useGetUsers` function with:

```ts
export function useGetUsers(params: SearchPageParams) {
  const { data, fetchNextPage, isLoading, isError, refetch } = useInfiniteQuery<
    PagedModel<User>,
    unknown,
    InfiniteData<PagedModel<User>>,
    QueryKey,
    SearchPageParams
  >({
    queryKey: ['users', params],
    queryFn: async ({ pageParam }) => getUsers(pageParam),
    initialPageParam: {
      size: 100,
      page: 0,
    },
    getNextPageParam: (lastPage) => getNextPageParams<User>(lastPage),
    staleTime: 60 * 1_000,
    gcTime: 5 * 60 * 1_000,
  });

  return {
    pages: data?.pages || ([] as PagedModel<User>[]),
    isLoading,
    isError,
    fetchNextPage,
    reload: refetch,
  };
}
```

Add `import { getNextPageParams } from '@/shared/api';` and `import { PagedModel } from '@/shared/api/common.dto';`.

- [ ] **Step 6: Fix the other paged hooks and consumers**

- `src/domain/document/query/documents.tsx`: `useQuery<Page<Document>>` → `useQuery<PagedModel<Document>>` (+ import).
- `src/domain/approval/query/approvalHistory.tsx`: same for `ApprovalHistory`.
- `src/domain/document/query/vacation.tsx`: `useQuery<PagedModel<VacationDocument>>`, and `total: data?.total ?? 0` → `total: data?.page.totalElements ?? 0`.
- `DocumentApprovalContents.tsx:47` and `DocumentListContents.tsx:48`: `const total = page?.total ?? 0;` → `const total = page?.page.totalElements ?? 0;`.

- [ ] **Step 7: Build and lint**

Run: `yarn lint && yarn build`
Expected: exit 0. Fix any remaining `Page<` references the compiler reports.

- [ ] **Step 8: Manual check of passthrough-only pages**

`yarn dev`, logged in: `/schedule` (attendance records list loads), `/attendance/record/gps` (GPS list loads), `/dayoff/[id]` for any existing 휴가 document id (renders — approval line may be empty until Task 7). `/documents` and `/approvals` will 401/500 until Task 5 injects `userUniqueId`; that's expected.

- [ ] **Step 9: Commit**

```bash
yarn prettier && git add -A && git commit -m "refactor: 브라우저 API 경로를 /api/v1 로 변경하고 PagedModel 응답 형식 적용"
```

---

### Task 4: Current-user hooks (`useUser`, `useUserLeaveEntry`, `useProceedingApprovalCount`)

**Files:**
- Modify: `src/domain/user/api/users.ts` (add `getUser`, `getUserLeaveEntry`)
- Modify: `src/domain/approval/api/approvalHistory.ts` (reuse `searchApprovalHistories` with `userUniqueId`)
- Modify: `src/domain/approval/type/types.d.ts` (add `userUniqueId?: string` to `SearchDocumentApprovalHistoryRequest`)
- Modify: `src/domain/user/query/user.tsx` (add the three hooks, remove `useGetCurrentUser`)
- Delete: `src/domain/user/api/session.ts`, `src/domain/user/query/session.tsx`, `src/domain/user/store/slice.ts`, `src/domain/user/store/types.d.ts`
- Modify (consumers, `useGetCurrentUser` → `useUser`): `src/app/_components/NowWorkingBar.tsx`, `Header.tsx`, `NavMenu.tsx`, `src/app/(user)/attendance/record/[checkId]/_components/AttendanceRecordContents.tsx`, `src/app/(user)/attendance/record/gps/_components/AttendanceRecordGpsContents.tsx`, `src/app/(user)/dayoff/requests/_components/DayOffRequestContents.tsx`, `.../UserLeaveEntryContents.tsx`, `src/app/(user)/dayoff/[id]/_components/PressApprovalModal.tsx`, `src/app/(user)/dayoff/used/_components/DayOffHistoryContents.tsx`, `src/app/(user)/schedule/_components/ScheduleContents.tsx`, `src/app/(user)/dashboard/_componets/WeeklySummaryCards.tsx`, `.../WorkingRecordContents.tsx`, `src/app/(user)/profile/_components/UpdateUserSignatureContents.tsx`, `.../PersonalInfoContents.tsx`. (`CustomerSupport.tsx`, `ChatUserContents.tsx`, `ChatChannel.tsx` are deleted in Task 8 — leave them; they still compile against the old hook only if it exists, so add a one-line shim there: replace their `useGetCurrentUser()` with `useUser()` too.)

**Interfaces:**
- Consumes: `authClient` from `@/shared/auth/auth-client`.
- Produces:
  - `useUser(): { user: User | undefined; isLoading: boolean }`
  - `useUserLeaveEntry(year: number): { leaveEntry: UserLeaveEntry | undefined; isLoading: boolean }`
  - `useProceedingApprovalCount(): { count: number }`

- [ ] **Step 1: Add API functions to `src/domain/user/api/users.ts`**

```ts
export async function getUser(id: string) {
  return api.get(`/api/v1/users/${id}/summary`).json<User>();
}

export async function getUserLeaveEntry(id: string, year: number) {
  return api.get(`/api/v1/users/${id}/leave/entries`, { searchParams: { year } }).json<UserLeaveEntry>();
}
```

- [ ] **Step 2: Add `userUniqueId` to the approval search request type**

In `src/domain/approval/type/types.d.ts`, `SearchDocumentApprovalHistoryRequest` gains `userUniqueId?: string;`.

- [ ] **Step 3: Add the hooks to `src/domain/user/query/user.tsx`**

Delete `useGetCurrentUser` and the `currentUser` import. Add:

```ts
import { searchApprovalHistories } from '@/domain/approval/api/approvalHistory';
import { getUser, getUserLeaveEntry } from '@/domain/user/api/users';
import { authClient } from '@/shared/auth/auth-client';

export function useUser() {
  const { data: session } = authClient.useSession();
  const sub = session?.user.sub;

  const { data, isLoading } = useQuery<User>({
    queryKey: ['users', sub, 'summary'],
    queryFn: () => getUser(sub!),
    enabled: !!sub,
  });

  return { user: data, isLoading: isLoading || !sub };
}

export function useUserLeaveEntry(year: number) {
  const { data: session } = authClient.useSession();
  const sub = session?.user.sub;

  const { data, isLoading } = useQuery<UserLeaveEntry>({
    queryKey: ['users', sub, 'leave', 'entries', year],
    queryFn: () => getUserLeaveEntry(sub!, year),
    enabled: !!sub,
  });

  return { leaveEntry: data, isLoading };
}

export function useProceedingApprovalCount() {
  const { data: session } = authClient.useSession();
  const sub = session?.user.sub;

  const { data } = useQuery({
    queryKey: ['documents', 'approval', 'proceeding', sub],
    queryFn: () => searchApprovalHistories({ userUniqueId: sub, status: 'WAITING', page: 0, size: 1 }),
    enabled: !!sub,
  });

  return { count: data?.page.totalElements ?? 0 };
}
```

- [ ] **Step 4: Delete the session files**

```bash
git rm src/domain/user/api/session.ts src/domain/user/query/session.tsx src/domain/user/store/slice.ts src/domain/user/store/types.d.ts
```

- [ ] **Step 5: Update consumers**

In each consumer file listed above:
- `import { useGetCurrentUser } from '@/domain/user/query/user';` → `import { useUser } from '@/domain/user/query/user';`
- `const { currentUser } = useGetCurrentUser();` → `const { user: currentUser } = useUser();` (keeps the rest of the file unchanged).
- `Header.tsx`: also delete `import { useSession } from '@/domain/user/query/session';` and the `useSession();` call.
- `NavMenu.tsx`: delete `const proceedingCount = currentUser?.proceedingDocumentsCount || 0;`, add `const { count: proceedingCount } = useProceedingApprovalCount();` and import it. Role check: `currentUser?.role.type` stays (summary carries `role`).
- `UserLeaveEntryContents.tsx`, `DayOffRequestContents.tsx`, `DayOffHistoryContents.tsx`: replace `currentUser?.leaveEntry` with `leaveEntry` from `const { leaveEntry } = useUserLeaveEntry(year);` where `year` is the component's existing year state if it has one, else `new Date().getFullYear()`. If the file no longer uses `currentUser`, remove the `useUser()` line too.

- [ ] **Step 6: Adjust the `User` and `UserEmployment` types**

In `src/domain/user/type/types.d.ts`: delete `proceedingDocumentsCount?: number;` and make `leaveEntry?: UserLeaveEntry;` optional (only the `users/leave/entries` aggregation fills it; `summary` does not). In `src/app/(manager)/dayoff/users/vacations/_components/DayOffViewContents.tsx` change each `user.leaveEntry.X` read to `(user.leaveEntry?.X ?? 0)`. Extend `UserEmployment` to:

```ts
interface UserEmployment {
  id: number;
  userUniqueId: string;
  status: string;
  effectiveDate: Date;
}
```

- [ ] **Step 7: Build and lint**

Run: `yarn lint && yarn build`
Expected: exit 0.

- [ ] **Step 8: Manual check**

`yarn dev`, logged in: Header shows 이름/팀/직급 from summary; `/dashboard` renders; `/dayoff/requests` shows 연차 stat cards from `useUserLeaveEntry`; NavMenu 결재 badge count matches `/approvals` WAITING count (may be 0). `/profile` shows personal info.

- [ ] **Step 9: Commit**

```bash
yarn prettier && git add -A && git commit -m "feat: 세션 기반 useUser/useUserLeaveEntry/useProceedingApprovalCount 로 현재 사용자 조회 대체"
```

---

### Task 5: `sub` injection + user-scoped rewrite handlers

**Files:**
- Create: `src/app/api/v1/documents/route.ts` (GET)
- Create: `src/app/api/v1/documents/vacations/route.ts` (GET enrich list + POST inject) — GET part lands in Task 6; create with POST now and a plain forward GET
- Create: `src/app/api/v1/documents/overtimes/route.ts` (POST)
- Create: `src/app/api/v1/documents/approval/route.ts` (GET inject; enrichment added in Task 6)
- Create: `src/app/api/v1/attendance/records/route.ts` (GET forward + POST inject)
- Create: `src/app/api/v1/attendance/schedules/route.ts` (POST)
- Create: `src/app/api/v1/users/comp/leave/entries/route.ts` (GET)
- Create: `src/app/api/v1/users/avatar/route.ts`, `users/avatar/reset/route.ts`, `users/signature/route.ts`, `users/signature/reset/route.ts`, `users/password/route.ts` (POST)

**Interfaces:**
- Consumes: `forward`, `currentSub`, `unauthorized` from `@/shared/api/server`.

- [ ] **Step 1: Write the query-inject handler `src/app/api/v1/documents/route.ts`**

```ts
import { NextRequest } from 'next/server';

import { currentSub, forward, unauthorized } from '@/shared/api/server';

export async function GET(req: NextRequest) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  const searchParams = new URLSearchParams(req.nextUrl.searchParams);
  searchParams.set('userUniqueId', sub);

  return forward(req, { searchParams });
}
```

- [ ] **Step 2: Write `src/app/api/v1/documents/approval/route.ts`** — identical to Step 1 (same imports, same `GET` body). Enrichment replaces it in Task 6.

- [ ] **Step 3: Write the body-inject handlers**

`src/app/api/v1/documents/overtimes/route.ts`:

```ts
import { NextRequest } from 'next/server';

import { currentSub, forward, unauthorized } from '@/shared/api/server';

export async function POST(req: NextRequest) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  const body = await req.json();

  return forward(req, { body: JSON.stringify({ ...body, userUniqueId: sub }) });
}
```

`src/app/api/v1/attendance/schedules/route.ts`: same file content.

`src/app/api/v1/documents/vacations/route.ts`: same `POST`, plus for now:

```ts
export async function GET(req: NextRequest) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  const searchParams = new URLSearchParams(req.nextUrl.searchParams);
  searchParams.set('userUniqueId', sub);

  return forward(req, { searchParams });
}
```

`src/app/api/v1/attendance/records/route.ts`: same `POST`, plus a plain forward for `GET`. Do not `export { forward as GET }` — Next passes the route context as the second argument, which `forward` would read as `override`. Write it explicitly:

```ts
export async function GET(req: NextRequest) {
  return forward(req);
}
```

- [ ] **Step 4: Write the user-scoped rewrite handlers**

`src/app/api/v1/users/comp/leave/entries/route.ts`:

```ts
import { NextRequest } from 'next/server';

import { currentSub, forward, unauthorized } from '@/shared/api/server';

export async function GET(req: NextRequest) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  return forward(req, { path: `/api/v1/users/${sub}/comp/leave/entries` });
}
```

`src/app/api/v1/users/avatar/route.ts` (POST → `/api/v1/users/${sub}/avatar`), `users/avatar/reset/route.ts` (→ `.../avatar/reset`), `users/signature/route.ts` (→ `.../signature`), `users/signature/reset/route.ts` (→ `.../signature/reset`), `users/password/route.ts` (→ `.../password`): each is the file above with `GET` renamed to `POST` and the `path` string changed. Multipart bodies pass through `forward` untouched because `req.body` and the original `Content-Type` (with boundary) are reused.

- [ ] **Step 5: Build and lint**

Run: `yarn lint && yarn build`
Expected: exit 0; the build's route list shows `/api/v1/documents`, `/api/v1/users/avatar`, etc. as dynamic routes alongside `/api/[...path]`.

- [ ] **Step 6: Manual check**

`yarn dev`, logged in: `/documents` lists only my documents; `/dashboard` 보상휴가 card loads (`comp/leave/entries`); `/profile` avatar upload + reset and password change succeed; `/schedule` 일정 추가 creates a schedule; `/overtime/requests` submit creates a document.

- [ ] **Step 7: Commit**

```bash
yarn prettier && git add -A && git commit -m "feat: BFF 의 userUniqueId 주입 및 사용자 스코프 API 를 route handler 로 이전"
```

---

### Task 6: Aggregation handlers

**Files:**
- Create: `src/app/api/v1/users/leave/entries/route.ts`
- Create: `src/app/api/v1/users/used/vacations/route.ts`
- Create: `src/app/api/v1/users/[id]/notification/send/route.ts`
- Modify: `src/app/api/v1/documents/vacations/route.ts` (GET → enrich each item)
- Modify: `src/app/api/v1/documents/approval/route.ts` (GET → fill `document.user`)
- Modify: `src/domain/document/type/types.d.ts` (`Document` gains `userUniqueId?: string`)

**Interfaces:**
- Consumes: `serverApi`, `handle` from `@/shared/api/server`; `PagedModel` from `@/shared/api/common.dto`.
- Produces: JSON identical in shape to the old BFF endpoints (`User[]` with `leaveEntry`+`employment`; `UserUsedVacation[]`; `PagedModel<VacationDocument>`; `PagedModel<ApprovalHistory>` with `document.user`).

- [ ] **Step 1: Add `userUniqueId?: string;` to `interface Document`** in `src/domain/document/type/types.d.ts`.

- [ ] **Step 2: Write `src/app/api/v1/users/leave/entries/route.ts`**

```ts
import { NextRequest } from 'next/server';

import { PagedModel } from '@/shared/api/common.dto';
import { handle, serverApi } from '@/shared/api/server';

import { HTTPError } from 'ky';

export async function GET(req: NextRequest) {
  return handle(async () => {
    const year = req.nextUrl.searchParams.get('year') ?? String(new Date().getFullYear());

    const employments = await serverApi
      .get('api/v1/users/employments', { searchParams: { status: 'ACTIVE', page: 0, size: 100 } })
      .json<PagedModel<UserEmployment>>();

    const users = await Promise.all(
      employments.content.map(async (employment) => {
        const user = await serverApi.get(`api/v1/users/${employment.userUniqueId}/summary`).json<User>();

        try {
          const leaveEntry = await serverApi
            .get(`api/v1/users/${employment.userUniqueId}/leave/entries`, { searchParams: { year } })
            .json<UserLeaveEntry>();

          return { ...user, leaveEntry, employment };
        } catch (e) {
          if (e instanceof HTTPError && e.response.status === 404) {
            return null;
          }

          throw e;
        }
      }),
    );

    return users.filter((user) => user !== null);
  });
}
```

- [ ] **Step 3: Write `src/app/api/v1/users/used/vacations/route.ts`**

```ts
import { NextRequest } from 'next/server';

import { PagedModel } from '@/shared/api/common.dto';
import { handle, serverApi } from '@/shared/api/server';

export async function GET(req: NextRequest) {
  return handle(async () => {
    const year = Number(req.nextUrl.searchParams.get('year') ?? new Date().getFullYear());

    const employments = await serverApi
      .get('api/v1/users/employments', { searchParams: { page: 0, size: 100 } })
      .json<PagedModel<UserEmployment>>();

    return Promise.all(
      employments.content.map(async (employment) => {
        const vacations = await serverApi
          .get('api/v1/documents/vacations', {
            searchParams: {
              userUniqueId: employment.userUniqueId,
              startDateFrom: `${year}-01-01`,
              endDateTo: `${year}-12-31`,
              status: 'APPROVED',
              page: 0,
              size: 100,
            },
          })
          .json<PagedModel<VacationDocument>>();

        const byMonth = new Map<number, UsedVacation>();

        for (const vacation of vacations.content) {
          const month = Number(String(vacation.startDate).slice(5, 7));
          const item = byMonth.get(month) ?? { month, used: 0, usedComp: 0 };

          if (vacation.vacationType === 'GENERAL') item.used += vacation.usedDays;
          if (vacation.vacationType === 'COMPENSATORY') item.usedComp += vacation.usedDays;

          byMonth.set(month, item);
        }

        return { userUniqueId: employment.userUniqueId, year, usedVacations: [...byMonth.values()] };
      }),
    );
  });
}
```

- [ ] **Step 4: Write `src/app/api/v1/users/[id]/notification/send/route.ts`**

```ts
import { NextRequest } from 'next/server';

import { handle, serverApi } from '@/shared/api/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  return handle(async () => {
    const user = await serverApi.get(`api/v1/users/${id}/summary`).json<User>();

    await serverApi.post(`api/v1/users/${id}/notification/send`, { json: body });

    return user;
  });
}
```

- [ ] **Step 5: Enrich the vacation search in `src/app/api/v1/documents/vacations/route.ts`**

Replace `GET` with:

```ts
export async function GET(req: NextRequest) {
  return handle(async (sub) => {
    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    searchParams.set('userUniqueId', sub);

    const page = await serverApi
      .get('api/v1/documents/vacations', { searchParams })
      .json<PagedModel<VacationDocument>>();

    const content = await Promise.all(
      page.content.map((item) => serverApi.get(`api/v1/documents/vacations/${item.id}`).json<VacationDocument>()),
    );

    return { ...page, content };
  });
}
```

Update imports to `import { currentSub, forward, handle, serverApi, unauthorized } from '@/shared/api/server';` and `import { PagedModel } from '@/shared/api/common.dto';`.

- [ ] **Step 6: Enrich the approval search in `src/app/api/v1/documents/approval/route.ts`**

Replace `GET` with:

```ts
export async function GET(req: NextRequest) {
  return handle(async (sub) => {
    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    searchParams.set('userUniqueId', sub);

    const page = await serverApi
      .get('api/v1/documents/approval', { searchParams })
      .json<PagedModel<ApprovalHistory>>();

    const content = await Promise.all(
      page.content.map(async (item) => {
        const user = await serverApi.get(`api/v1/users/${item.document.userUniqueId}/summary`).json<User>();

        return { ...item, document: { ...item.document, user } };
      }),
    );

    return { ...page, content };
  });
}
```

- [ ] **Step 7: Build and lint**

Run: `yarn lint && yarn build`
Expected: exit 0.

- [ ] **Step 8: Shape check against the old BFF (throwaway script, not committed)**

Write `scripts/check-api.ts` in the scratchpad (not in the repo):

```ts
const BASE = 'http://localhost:3000';
const COOKIE = process.env.COOKIE!; // copy the better-auth cookies from the browser devtools

async function get(path: string) {
  const res = await fetch(BASE + path, { headers: { Cookie: COOKIE } });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

const year = new Date().getFullYear();

const users = await get(`/api/v1/users/leave/entries?year=${year}`);
console.assert(Array.isArray(users), 'leave/entries is array');
console.assert(users.every((u: any) => u.leaveEntry && u.employment && u.username), 'leave/entries keys');

const used = await get(`/api/v1/users/used/vacations?year=${year}`);
console.assert(used.every((u: any) => u.userUniqueId && Array.isArray(u.usedVacations)), 'used/vacations keys');
console.assert(
  used.flatMap((u: any) => u.usedVacations).every((v: any) => 'month' in v && 'used' in v && 'usedComp' in v),
  'usedVacations item keys',
);

const approvals = await get('/api/v1/documents/approval?page=0&size=5');
console.assert(approvals.page && Array.isArray(approvals.content), 'approval is PagedModel');
console.assert(approvals.content.every((a: any) => a.document.user?.username), 'approval document.user filled');

console.log('OK');
```

Run: `COOKIE='<paste>' node --experimental-strip-types scripts/check-api.ts` (Node 24).
Expected: `OK` with no assertion output.

- [ ] **Step 9: Manual check**

`/dayoff/users/vacations` (관리자) shows the matrix with per-user 연차 and monthly usage; `/approvals` shows requester names; `/dayoff/used` lists my vacations with details.

- [ ] **Step 10: Commit**

```bash
yarn prettier && git add -A && git commit -m "feat: BFF 집계 API (임직원 연차/휴가 사용 현황, 결재 목록, 알림) 를 route handler 로 이전"
```

---

### Task 7: 결재 상세 enrichment

**Files:**
- Create: `src/app/api/v1/documents/_lib/enrichDocument.ts`
- Create: `src/app/api/v1/documents/vacations/[id]/route.ts` (GET)
- Create: `src/app/api/v1/documents/overtimes/[id]/route.ts` (GET)
- Create: `src/app/api/v1/documents/approval/[id]/route.ts` (GET enrich + POST forward)

**Interfaces:**
- Produces: `enrichDocument<T extends Document>(document: T, userUniqueId: string): Promise<T>` — returns the document with `user` and `approvalHistories` replaced.

- [ ] **Step 1: Write `src/app/api/v1/documents/_lib/enrichDocument.ts`**

```ts
import { serverApi } from '@/shared/api/server';

function flatten(line: ApprovalLine): ApprovalLine[] {
  return [line, ...(line.children ?? []).flatMap(flatten)];
}

// 문서 소유자(또는 조회자) 의 팀 결재선 tree 를 평탄화하고, 기존 결재 이력을 결재선 순서대로 merge 한다.
export async function enrichDocument<T extends Document>(document: T, userUniqueId: string): Promise<T> {
  const user = await serverApi.get(`api/v1/users/${userUniqueId}/summary`).json<User>();

  const lines = await serverApi
    .get('api/v1/approval/lines', {
      searchParams: { teamId: user.groups[0].group.id, documentType: document.type },
    })
    .json<ApprovalLine[]>();

  const flat = lines.length > 0 ? flatten(lines[0]) : [];

  const approvalHistories = flat.map(
    (line) => document.approvalHistories.find((history) => history.approvalLine.id === line.id) ?? { approvalLine: line },
  );

  return { ...document, user, approvalHistories };
}
```

- [ ] **Step 2: Write `src/app/api/v1/documents/vacations/[id]/route.ts`**

```ts
import { NextRequest } from 'next/server';

import { handle, serverApi } from '@/shared/api/server';

import { enrichDocument } from '../../_lib/enrichDocument';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return handle(async (sub) => {
    const document = await serverApi.get(`api/v1/documents/vacations/${id}`).json<VacationDocument>();

    return enrichDocument(document, sub);
  });
}
```

- [ ] **Step 3: Write `src/app/api/v1/documents/overtimes/[id]/route.ts`** — same as Step 2 with `overtimes` in the path and `OverTimeWorkDocument` as the type.

- [ ] **Step 4: Write `src/app/api/v1/documents/approval/[id]/route.ts`**

```ts
import { NextRequest } from 'next/server';

import { forward, handle, serverApi } from '@/shared/api/server';

import { enrichDocument } from '../../_lib/enrichDocument';

const DETAIL_PATH: Record<DocumentsType, string> = {
  VACATION: 'vacations',
  OVERTIME_WORK: 'overtimes',
};

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return handle(async () => {
    const approval = await serverApi.get(`api/v1/documents/approval/${id}`).json<ApprovalHistory>();

    const document = await serverApi
      .get(`api/v1/documents/${DETAIL_PATH[approval.document.type]}/${approval.document.id}`)
      .json<Document>();

    return { ...approval, document: await enrichDocument(document, document.userUniqueId!) };
  });
}

// 승인 (POST /documents/approval/{id}) 은 그대로 gateway 로 전달
export async function POST(req: NextRequest) {
  return forward(req);
}
```

- [ ] **Step 5: Build and lint**

Run: `yarn lint && yarn build`
Expected: exit 0.

- [ ] **Step 6: Manual check**

`/dayoff/[id]` for a 휴가 document: 결재선 shows every line from the team's tree, with 승인/대기 states. `/overtime/[id]` same. `/approvals/[id]`: requester's name and 결재선; 승인 and 반려 buttons still work (POST to `/approval/{id}` and `/approval/{id}/reject`). `/documents` 상신/취소 still work (`/{id}/request`, `/{id}/cancel` go through the catch-all).

- [ ] **Step 7: Commit**

```bash
yarn prettier && git add -A && git commit -m "feat: 결재 상세 3종의 결재선 merge 로직을 route handler 로 이전"
```

---

### Task 8: Deletions, role guard, dependency cleanup

**Files:**
- Delete: `src/domain/chat/**`, `src/domain/counter/**`, `src/shared/hooks/ws/**`, `src/app/_components/CustomerSupport.tsx`, `RedirectLastPageContents.tsx`, `lastPage.tsx`, `Preparing.tsx`, `src/app/(user)/expense/**`, `src/app/(manager)/attendance/people/**`, `src/app/(manager)/dayoff/users/compensatory/**`, `src/app/(manager)/chat/**`
- Modify: `src/shared/store/rootStore.ts`, `src/app/_components/NavMenu.tsx`, `messages/ko.json`, `package.json`, `src/app/(manager)/layout.tsx`
- Create: `src/utils/AuthUtils.ts`

- [ ] **Step 1: Delete the files**

```bash
git rm -r src/domain/chat src/domain/counter src/shared/hooks/ws \
  src/app/_components/CustomerSupport.tsx src/app/_components/RedirectLastPageContents.tsx \
  src/app/_components/lastPage.tsx src/app/_components/Preparing.tsx \
  'src/app/(user)/expense' 'src/app/(manager)/attendance/people' \
  'src/app/(manager)/dayoff/users/compensatory' 'src/app/(manager)/chat'
```

- [ ] **Step 2: Remove the counter slice from `src/shared/store/rootStore.ts`**

Delete the `createCounterSlice` import and spread; `export type BoundState = AttendanceState;`.

- [ ] **Step 3: Remove nav entries** in `src/app/_components/NavMenu.tsx` for `/expense/reports/requests`, `/dayoff/users/compensatory`, `/attendance/people/schedules`, `/chat/users` (both sidebar and dock, and now-unused icon imports). In `messages/ko.json` delete `nav.expenseRequest`, `nav.managerCompensatory`, `nav.managerSchedules`, `nav.managerChat`, and the whole `chat` and `preparing` namespaces.

- [ ] **Step 4: Role guard**

```bash
cp /Users/hwpark/Documents/webstorm-workspace/template-nextjs-app/src/utils/AuthUtils.ts src/utils/AuthUtils.ts
```

Delete its `import { RoleType } ...` line — `RoleType` is a global ambient type until Task 9 converts it to a dto export. Then replace `src/app/(manager)/layout.tsx` with:

```tsx
import { forbidden } from 'next/navigation';

import { getUserinfo } from '@/shared/auth/serverAction';
import { hasRole } from '@/utils/AuthUtils';

export default async function ManagerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getUserinfo();

  if (!user || !hasRole(user.role as RoleType, 'ROLE_MANAGER')) {
    forbidden();
  }

  return <>{children}</>;
}
```

- [ ] **Step 5: Dependency cleanup**

```bash
yarn remove @stomp/stompjs sockjs-client @types/sockjs-client miragejs
grep -rn "miragejs\|sockjs\|stompjs" src || echo "clean"
```

- [ ] **Step 6: Build and lint**

Run: `yarn lint && yarn build`
Expected: exit 0. Fix any dangling imports the compiler reports (e.g. `useWebSocket`).

- [ ] **Step 7: Manual check**

As `ROLE_USER`: `/qr` and `/attendance/view` render the 403 page. As manager: they render. NavMenu shows no 경비/보상휴가/일정등록/채팅 entries.

- [ ] **Step 8: Commit**

```bash
yarn prettier && git add -A && git commit -m "chore: 채팅/WebSocket/준비중 페이지 제거, manager 권한 가드 및 의존성 정리"
```

---

### Task 9: `src/` restructure to the template layout

**Files:**
- Rename: `src/domain/user` → `src/domain/users`; every `src/domain/*/api` → `apis`, `query` → `queries`; `src/domain/*/type/types.d.ts` → `src/domain/*/apis/<domain>.dto.ts`
- Rename: `src/app/_components/*` → `src/app/_layouts/*` (Header, NavMenu, NowWorkingBar, NotificationDialog); `CardPageTitle.tsx` → `src/shared/components/CardPageTitle.tsx`; `RQProvider.tsx` → `src/shared/components/queries/RQProvider.tsx`
- Create (copied from template): `src/shared/dayjs/index.ts`, `src/shared/providers/theme/ThemeProvider.tsx`, `src/app/themeAction.ts`, `src/shared/i18n/locale.ts`, `localeAction.ts`, `locale.type.ts`, `src/shared/queries/react-query.d.ts`, `src/shared/queries/index.ts`
- Modify: `src/shared/i18n/config.ts` (template version with `SUPPORTED_LOCALES = ['ko']`), `src/app/layout.tsx` (locale from `getUserLocale()`, `htmlLang`)
- Delete: `src/shared/api/types.d.ts` (moved into `common.dto.ts`)

**Interfaces:**
- Produces: all domain types exported from `@/domain/<name>/apis/<name>.dto`; `SearchPageParams` from `@/shared/api/common.dto`.

- [ ] **Step 1: Move folders**

```bash
git mv src/domain/user src/domain/users
for d in src/domain/*; do
  [ -d "$d/api" ] && git mv "$d/api" "$d/apis"
  [ -d "$d/query" ] && git mv "$d/query" "$d/queries"
done
git mv src/app/_components src/app/_layouts
git mv src/app/_layouts/CardPageTitle.tsx src/shared/components/CardPageTitle.tsx
mkdir -p src/shared/components/queries && git mv src/app/_layouts/RQProvider.tsx src/shared/components/queries/RQProvider.tsx
```

- [ ] **Step 2: Rewrite import paths**

```bash
grep -rl "@/domain/user/" src | xargs sed -i '' 's#@/domain/user/#@/domain/users/#g'
grep -rlE "@/domain/[a-z]+/api/" src | xargs sed -i '' -E 's#(@/domain/[a-z]+)/api/#\1/apis/#g'
grep -rlE "@/domain/[a-z]+/query/" src | xargs sed -i '' -E 's#(@/domain/[a-z]+)/query/#\1/queries/#g'
grep -rl "@/app/_components/\|'./_components/" src/app/layout.tsx src/app/forbidden.tsx src/app/not-found.tsx src/app/error.tsx src/app/loading.tsx src/app/_layouts | xargs sed -i '' -e 's#@/app/_components/#@/app/_layouts/#g' -e "s#'./_components/#'./_layouts/#g"
grep -rl "_layouts/RQProvider\|_layouts/CardPageTitle" src | xargs sed -i '' -e 's#@/app/_layouts/RQProvider#@/shared/components/queries/RQProvider#g' -e "s#'./_layouts/RQProvider'#'@/shared/components/queries/RQProvider'#g" -e 's#@/app/_layouts/CardPageTitle#@/shared/components/CardPageTitle#g' -e "s#'./_layouts/CardPageTitle'#'@/shared/components/CardPageTitle'#g"
```

Page-level `_components/` folders (e.g. `src/app/(user)/dashboard/_componets`) are NOT touched — they are page sub-components and already follow the convention. (The `_componets` typo under dashboard: rename it to `_components` with `git mv` and fix its two imports.)

- [ ] **Step 3: Convert ambient types to exported dto files**

For each domain with a `type/types.d.ts` (`users`, `document`, `approval`, `attendance`, `team`, `position`, `notification`):

```bash
git mv src/domain/<d>/type/types.d.ts src/domain/<d>/apis/<d>.dto.ts && rmdir src/domain/<d>/type
```

Append to each new `.dto.ts` an `export type { ... };` listing every `type`/`interface` declared in it (e.g. for `users.dto.ts`: `export type { RoleType, Role, User, UserLeaveEntry, UserCompLeaveEntry, UpdateUserPasswordRequest, UserEmployment, SearchUserLeaveEntryRequest, UserUsedVacation, UsedVacation, UserGroup };`). Where a dto references another domain's type (`Position`, `Team`, `User`, `DocumentsType`, `DocumentStatus`, `ApprovalHistory`, `ApprovalLine`, `Document`, `UserCompLeaveEntry`, `SearchPageParams`), add the corresponding `import { X } from '@/domain/<d>/apis/<d>.dto';` or `from '@/shared/api/common.dto'` at the top. Move `SearchPageParams` into `common.dto.ts` (already there) and `git rm src/shared/api/types.d.ts`. Move the store state types (`src/domain/attendance/store/types.d.ts`) to `src/domain/attendance/store/attendance.state.ts` with `export type { AttendanceState };` and import it in `slice.ts` and `rootStore.ts`.

- [ ] **Step 4: Add the missing imports until tsc is clean**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "Cannot find name" | sed -E "s/.*Cannot find name '([A-Za-z]+)'.*/\1/" | sort | uniq -c`

For each file reported, add the import line for the named type from its dto module. Repeat until the command prints nothing. `src/utils/AuthUtils.ts` gets `import { RoleType } from '@/domain/users/apis/users.dto';` and `(manager)/layout.tsx` the same.

- [ ] **Step 5: Copy template extras**

```bash
T=/Users/hwpark/Documents/webstorm-workspace/template-nextjs-app
mkdir -p src/shared/dayjs src/shared/providers/theme src/shared/queries
cp $T/src/shared/dayjs/index.ts src/shared/dayjs/index.ts
cp $T/src/shared/providers/theme/ThemeProvider.tsx src/shared/providers/theme/ThemeProvider.tsx
cp $T/src/app/themeAction.ts src/app/themeAction.ts
cp $T/src/shared/i18n/locale.ts $T/src/shared/i18n/localeAction.ts $T/src/shared/i18n/locale.type.ts $T/src/shared/i18n/config.ts src/shared/i18n/
cp $T/src/shared/queries/react-query.d.ts $T/src/shared/queries/index.ts src/shared/queries/
```

Edit `src/shared/i18n/config.ts`: `SUPPORTED_LOCALES = ['ko'] as const;` and `LOCALE_META` with only the `ko` entry. In `src/app/layout.tsx` replace the hard-coded `lang="ko"` / `locale="ko"` with `const locale = await getUserLocale();` and `LOCALE_META[locale].htmlLang` as the template does (imports: `getUserLocale` from `@/shared/i18n/locale`, `LOCALE_META` from `@/shared/i18n/config`). Keep `data-theme="ontime-dark"`.

- [ ] **Step 6: Build and lint**

Run: `yarn lint && yarn build`
Expected: exit 0.

- [ ] **Step 7: Manual smoke**

`yarn dev`: login, `/dashboard`, `/documents`, `/approvals/[id]`, `/profile`, `/dayoff/users/vacations`, `/qr` all render as before Task 9.

- [ ] **Step 8: Commit**

```bash
yarn prettier && git add -A && git commit -m "refactor: template 디렉토리 구조로 src 재편 (apis/queries/dto, _layouts, shared extras)"
```

---

### Task 10: Docs and Docker alignment

**Files:**
- Modify: `docs/agents/tech-stack.md`, `docs/agents/overview.md`, `Dockerfile`, `.dockerignore`
- Modify: `AGENTS.md` (nothing to change — verify the Auth section already matches)

- [ ] **Step 1: `docs/agents/tech-stack.md`**

Change the HTTP line to `- **HTTP / Auth:** ky, better-auth (genericOAuth + PKCE against KeyFlow)` and drop `sockjs-client, @stomp/stompjs`. Add `- **PDF / QR:** html2canvas-pro, jspdf, qrcode, qr-code-styling` (present in `package.json`, undocumented).

- [ ] **Step 2: `docs/agents/overview.md`**

Replace the TL;DR blockquote and first paragraph with:

> OnTime — 전자 근태 관리 시스템 (근무 기록, 근무 일정, 휴가/휴일근무 전자 결재). Next.js App Router app authenticating against the **KeyFlow Authorization Server** via **better-auth** (`genericOAuth` + PKCE) and calling the API gateway (`API_HOST`) through server-side route handlers under `src/app/api/`.

Add a short section "API layer" with two bullets: generic passthrough `src/app/api/[...path]/route.ts`; BFF-ported aggregations under `src/app/api/v1/**` (list the handlers by path). Link to the spec file.

- [ ] **Step 3: Dockerfile**

Copy the template's `Dockerfile` and `.dockerignore` over the current ones (node 24 + corepack + `/api/health` healthcheck), keeping `docker-compose.yml` as is except `image: ghcr.io/bob-park/on-time-web`.

- [ ] **Step 4: Build**

Run: `yarn lint && yarn build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "docs: tech-stack/overview 를 better-auth + Next API 계층 기준으로 갱신, Dockerfile node 24 정렬"
```
