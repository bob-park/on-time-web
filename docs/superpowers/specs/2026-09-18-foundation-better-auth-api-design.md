# Foundation: 구조 재편 + better-auth + Next.js API 계층 — Design

- Date: 2026-09-18
- Branch: `feature/ui-v3`
- Status: approved in brainstorming, pending implementation plan
- Scope: project #1 of 2. Project #2 (Kraken 디자인 시스템 기반 UI 리디자인) is a separate spec.

## 1. Goal

Replace the Spring BFF (`on-time-web-service`) and Spring OAuth2 client with
**better-auth** and **Next.js route handlers**, and move `src/` to the
`template-nextjs-app` layout that `docs/agents/*` already describes. Pages keep
working throughout; UI is not redesigned here.

Non-goals: UI redesign, adding a test runner, new features, `en` locale.

## 2. Decisions (from brainstorming)

| Topic | Decision |
|---|---|
| Backend transport | Single API gateway at `API_HOST`. Paths forwarded as-is (`/api/v1/**`); the gateway resolves colliding `api/v1/users/*` paths across services. |
| BFF aggregation logic | Ported 1:1 into specific Next.js route handlers that shadow the generic passthrough. |
| Current user | Identity from the better-auth session (`getUserinfo()` server / `authClient.useSession()` client). Details via `useUser()` → `GET /api/v1/users/{sub}/summary`. **No `/users/me` route.** |
| Restructure | In place, on this repo. Pages carried over as-is. |
| 채팅 / WebSocket | Dropped (`/chat/**`, `CustomerSupport`, `useWebSocket`, STOMP/SockJS deps). |
| Placeholder pages | Dropped (경비 신청, 임직원 일정, 보상휴가 관리 — all `Preparing`). |
| Theme / locale | Template wiring adopted (theme cookie, cookie-based locale) but `ontime-dark` stays the only theme and `ko` the only locale until project #2. |

## 3. Auth

Copied from `template-nextjs-app` without modification:

- `src/shared/auth/index.ts` — `betterAuth` + `genericOAuth` (`providerId: keyflow-auth`, discovery URL, scopes `openid profile users:read:summary`, `mapProfileToUser` → `sub`, `userId`, `role`) + `nextCookies()`. DB-less, account stored in cookie (`useAccountCookie: true`), exactly as the template runs today.
- `src/shared/auth/auth-client.ts` — `createAuthClient` with `inferAdditionalFields`.
- `src/shared/auth/serverAction.ts` — `getAccessToken()`, `getUserinfo()`.
- `src/app/api/auth/[...all]/route.ts` — better-auth handler.
- `src/app/login/route.ts` — `signInSocial` redirect, honours `?callback=`.
- `src/app/logout/route.ts` — better-auth `signOut`, then redirect to KeyFlow `/connect/logout` with `id_token_hint` and `post_logout_redirect_uri=BETTER_AUTH_URL`.
- `src/proxy.ts` — session guard. Matcher excludes `api`, `_next/static`, `_next/image`, `favicon.ico`; `/login`, `/logout` bypass. No session → `302 /login?callback=<pathname+search>`.

Removed: `JSESSIONID` check in `proxy.ts`, `/users/me` fetch in root `layout.tsx`, `lastPage` cookie and `RedirectLastPageContents` / `lastPage.tsx`, `useSession` 60 s polling, `/api/logout` mutation (logout is `<a href="/logout">`).

`next.config.ts`: delete `rewrites()` and the CORS `headers()`. Env vars `WEB_SERVICE_HOST`, `WS_HOST`, `NEXT_PUBLIC_APP_URL` removed. `.env` keys used: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `KEYFLOW_AUTH_HOST`, `KEYFLOW_AUTH_CLIENT_ID`, `KEYFLOW_AUTH_CLIENT_SECRET`, `API_HOST` (already present).

Session `role` is a string (`ROLE_ADMIN | ROLE_MANAGER | ROLE_USER`). `src/utils/AuthUtils.ts` (`hasRole`, role hierarchy) is copied from the template. `(manager)/layout.tsx` calls `getUserinfo()` and `forbidden()` unless `hasRole(role, 'ROLE_MANAGER')`.

## 4. API layer

All handlers live under `src/app/api/`, run server-side, and attach
`Authorization: Bearer <getAccessToken()>`. A server-only helper
`src/shared/api/server.ts` exports a `ky` instance with `prefixUrl: API_HOST`
and a `beforeRequest` hook that sets the Bearer header. Handlers return the
gateway's status and body untouched on error (see §6).

### 4.1 Tier 1 — generic passthrough

`src/app/api/[...path]/route.ts`, copied from the template. Forwards
`/api/v1/**` to `${API_HOST}/api/v1/**` with method, query string, body
(`duplex: 'half'`) and the incoming `Content-Type` (multipart passes through).
Exports `GET POST PUT DELETE`. No `getAccessToken()` → `401 {error:'unauthorized'}`.

Covers, among others: `GET /users/{id}/avatar`, `GET /users/{id}/signature`,
`GET /users` (paged), `GET /users/{id}/summary`, `GET /users/{id}/leave/entries`,
`GET /attendance/gps`, `GET /attendance/records`, `POST /attendance/check/current`,
`POST /documents/{id}/request`, `DELETE /documents/{id}/cancel`,
`POST /documents/approval/{id}`, `POST /documents/approval/{id}/reject`.

### 4.2 Tier 2 — BFF-ported handlers

Specific routes take precedence over `[...path]` (Next.js prefers static and
`[id]` segments). Each is a 1:1 port of the Java service; `sub` =
`(await getUserinfo()).sub`.

| Route | Behaviour (ported from) |
|---|---|
| `GET /api/v1/users/leave/entries?year=` | `GET /users/employments?status=ACTIVE&size=100` → for each: `GET /users/{uid}/summary` + `GET /users/{uid}/leave/entries?year=`; 404 on leaveEntry skips the user. Returns `User[]` with `leaveEntry`, `employment`. (`UserLeaveEntryService`) |
| `GET /api/v1/users/used/vacations?year=` | `GET /users/employments?size=100` → for each: `GET /documents/vacations?userUniqueId=&startDateFrom=YYYY-01-01&endDateTo=YYYY-12-31&status=APPROVED&size=100` → group by `startDate` month, sum `usedDays` into `used` (GENERAL) / `usedComp` (COMPENSATORY). Returns `UserUsedVacation[]`. (`UserUsedVacationService`) |
| `GET /api/v1/users/comp/leave/entries` | → `GET /users/{sub}/comp/leave/entries` |
| `POST /api/v1/users/avatar`, `POST .../avatar/reset`, `POST .../signature`, `POST .../signature/reset`, `POST .../password` | → same path with `/users/{sub}/...` inserted; body/multipart forwarded |
| `GET /api/v1/documents` | query + `userUniqueId=sub` → `GET /documents` |
| `GET /api/v1/documents/vacations` | query + `userUniqueId=sub` → `GET /documents/vacations`, then each item replaced by `GET /documents/vacations/{id}` (`VacationDocumentService.search`) |
| `GET /api/v1/documents/approval` | query + `userUniqueId=sub` → `GET /documents/approval`, each `document.user` filled from `GET /users/{document.userUniqueId}/summary` (`DocumentApprovalService.search`) |
| `POST /api/v1/documents/vacations`, `POST /api/v1/documents/overtimes`, `POST /api/v1/attendance/records`, `POST /api/v1/attendance/schedules` | body + `userUniqueId: sub` → same path |
| `GET /api/v1/documents/vacations/{id}`, `GET /api/v1/documents/overtimes/{id}`, `GET /api/v1/documents/approval/{id}` | 결재 상세 enrichment, see below |
| `POST /api/v1/users/{id}/notification/send` | `POST /users/{id}/notification/send`, then return `GET /users/{id}/summary` |

**결재 상세 enrichment** (one shared helper `src/app/api/v1/documents/_lib/enrichApproval.ts`, since the three Java services are copies):

1. Load the document (`vacations/{id}` or `overtimes/{id}`; for `approval/{id}` load the approval first, then the document by `document.type` → `VACATION` | `OVERTIME_WORK`).
2. `user = GET /users/{uid}/summary` where `uid` is the document owner's `userUniqueId` for approval, `sub` for vacations/overtimes (matches Java).
3. `lines = GET /approval/lines?teamId={user.groups[0].group.id}&documentType={type}`; flatten the first tree depth-first (`parseApprovalLineList`).
4. `approvalHistories = lines.map(line => existing history with approvalLine.id === line.id ?? { approvalLine: line })`.
5. Return document with `user` and `approvalHistories` replaced (for `approval/{id}`, nested under `document`).

### 4.3 Browser client

`src/shared/api/index.ts` — `ky` instance, no retry. `afterResponse`: 401 →
`location.href = '/login'`, 403 → `/forbidden`. All `domain/*/apis` URLs renamed
`/api/<x>` → `/api/v1/<x>` (mechanical). Response types unchanged, except paged
responses: the gateway returns Spring `PagedModel` (`{ content, page: { size, number,
totalElements, totalPages } }`), not the BFF's `{ content, pageable, total }`. The
frontend adopts the template's `PagedModel<T>` (`shared/api/common.dto.ts`); the four
paged consumers (`useGetUsers`, `useDocuments`, `useApprovalHistories`,
`useVacationDocuments`) switch to `page.totalElements`.

Current-user hooks in `src/domain/users/queries/users.tsx`:

- `useUser()` — `sub` from `authClient.useSession()`, `queryKey ['users', sub, 'summary']`, `GET /api/v1/users/{sub}/summary`. Replaces `useGetCurrentUser`.
- `useUserLeaveEntry(year)` — `GET /api/v1/users/{sub}/leave/entries?year=`. Used by dashboard and 휴가 신청.
- `useProceedingApprovalCount()` — `GET /api/v1/documents/approval?userUniqueId={sub}&status=WAITING&size=1`, returns `page.totalElements`. Used by NavMenu badge.

## 5. `src/` restructure

Renames and deletions only; no logic changes.

- `domain/<name>/api` → `apis`, `query` → `queries`; `type/types.d.ts` → `apis/<name>.dto.ts` with `export`ed types (ambient globals removed). `domain/user` → `domain/users`.
- `app/_components/{Header,NavMenu,NowWorkingBar,NotificationDialog,CardPageTitle}` → `app/_layouts/`. `RQProvider` → `shared/components/queries/RQProvider.tsx`.
- Adopted from template: `shared/api/common.dto.ts` (`PagedModel`, `PageRequest`), `toSearchParams` / `getNextPageParams` in `shared/api/index.ts`, `shared/dayjs`, `shared/providers/theme` + `app/themeAction.ts`, `shared/i18n/{locale,localeAction,locale.type}`, `shared/queries/react-query.d.ts`, `utils/AuthUtils.ts`.
- Kept: `shared/components/{Pagination,PageHeader,StatCard,Dropdown,PillFilter,toast,date}`, `shared/hooks/useToast`, `domain/attendance` slice, route groups `(user)` / `(manager)`, `@modal` parallel route.
- Deleted: `domain/chat`, `domain/counter`, `shared/hooks/ws`, `app/_components/{CustomerSupport,RedirectLastPageContents,lastPage,Preparing}`, `app/(user)/expense/**`, `app/(manager)/attendance/people/**`, `app/(manager)/dayoff/users/compensatory/**`, `app/(manager)/chat/**`, `domain/user/{api,query}/session.*`. NavMenu entries for the removed routes go too.
- Deps removed: `@stomp/stompjs`, `sockjs-client`, `@types/sockjs-client`, `miragejs` (unused). Added: `better-auth`.

## 6. Error handling

- Passthrough and ported handlers forward the gateway's status code and body verbatim. Inside an aggregation, the first gateway error aborts and is returned as-is, except the documented 404-skip in `leave/entries`.
- Missing/expired token in any handler → `401 {error:'unauthorized'}`; browser `ky` then redirects to `/login`.
- Proxy: no session → `/login?callback=`. `app/error.tsx`, `forbidden.tsx`, `not-found.tsx` unchanged.

## 7. Verification

No test runner exists and none is added.

- `yarn lint` and `yarn build` must pass after every step below.
- Throwaway `scripts/check-api.ts` (not committed): with a dev session cookie, call `leave/entries`, `used/vacations`, and one 결재 상세 of each type; assert response keys match the old BFF's (`leaveEntry`, `employment`, `usedVacations[].{month,used,usedComp}`, `approvalHistories[].approvalLine`).
- Manual pass on `yarn dev` against the real gateway: login → dashboard → 근무 일정 → 휴가 신청 → 결재 문서 목록 → 결재 상세 승인/반려 → 휴가 사용 내역 → profile avatar/signature/password → 관리자 근무 현황 → 관리자 휴가 사용 현황 → QR → logout → KeyFlow logout redirect.

## 8. Order of work (one commit each)

1. Auth + proxy + passthrough; `rewrites()` removed. Login/logout round-trip works.
2. Browser URL rename to `/api/v1/**`; `useUser`, `useUserLeaveEntry`, `useProceedingApprovalCount`; passthrough-only pages work.
3. Ported handlers: `sub` injection → aggregations → 결재 상세 enrichment. Remaining pages work.
4. `src/` restructure, deletions, `(manager)` role guard, dependency cleanup.
5. Docs: `docs/agents/tech-stack.md` deps, `docs/agents/overview.md` product description (OnTime, not template).
