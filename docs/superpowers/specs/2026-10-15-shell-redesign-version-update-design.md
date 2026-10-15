# 셸 리디자인 (license-web 사이드바 · 커맨드 팔레트 · 사용자 메뉴) + 버전 업데이트 — Design

- Date: 2026-10-15
- Branch: new branch off `master` (e.g. `feature/shell-v4`)
- Status: approved in brainstorming, pending implementation plan
- Reference project: `/Users/hwpark/Documents/webstorm-workspace/license-web`
- Design template: `docs/design/kraken-design.md` (tokens already applied — see `2026-09-18-ui-redesign-kraken-design.md`)
- Mockups: `.superpowers/brainstorm/85277-1792062276/content/` — `shell-v2.html` (sidebar / palette / user menu / collapsed), `header-choice.html` (B chosen), `mobile-choice.html` (B chosen)

## 1. Intent

on-time-web and license-web share the Kraken tokens, but license-web's app
shell (sidebar, ⌘K command palette, user menu card) is what the owner wants
OnTime to feel like. Bring that shell over **as-is** in structure and styling,
filled with OnTime's menus. Separately, align dependency versions with
license-web so both projects sit on the same stack.

Two independent parts, done in this order on one branch:

1. 버전 업데이트
2. 셸 리디자인

## 2. Goals / Non-goals / Anti-goals

Goals
- Sidebar, CommandPalette, UserMenu ported from `license-web/src/app/(manager)/_layouts/` with the same look and behaviour.
- Header reduced to a thin breadcrumb row (+ avatar on mobile).
- Mobile bottom bar replaced with license-web's TabBar pattern.
- Shared dependencies on license-web's versions.

Non-goals
- Restyling page contents (cards, tables, forms) — only the shell changes.
- Backend changes. Everything is frontend-only.
- Language switcher (`messages/` has only `ko.json`).
- Porting license-web-only libraries or config (codemirror, stomp, sockjs, miragejs, faker, CORS `headers()`, `test` script, `allowImportingTsExtensions`).

Anti-goals (failure even if it "works")
- Losing the breadcrumb or the 상세 문서 제목 on detail pages.
- Mobile users losing access to theme / 로그아웃 / 앱 설치 안내 / 내 정보.
- The mobile bottom bar covering page-bottom buttons again (fixed in `229a4b9`; keep `main`'s bottom padding).
- Manager-only menus or results visible to non-managers.

## 3. Part 1 — 버전 업데이트

- For every package present in **both** `package.json`s, take license-web's version. Notable: `next` 16.2.9→16.4.1, `react`/`react-dom` 19.2.7→19.3.1, `@types/react`/`@types/react-dom` →19.3.0, `better-auth` →^1.7.9, `@tanstack/react-query(-devtools)` →^5.104.3, `next-intl` →^4.14.9, `daisyui` →^5.7.50, `ky` →^2.2.0, `immer` →^11.1.21, `zustand` →^5.0.15, `dayjs`, `sharp`, `uuid`, `react-icons`, `postcss`, `autoprefixer`, `@types/lodash`.
- Major bumps (fix call sites if they break):
  - `react-day-picker` 9.14 → **10.0.2** (pinned, as in license-web). Used in `DayOffRequestContents.tsx`, `OvertimeRequestContents.tsx`, `AddScheduleModal.tsx`, and styles in `globals.css`.
  - `lottie-react` 2 → **^3.1.2**.
  - `@types/node` 24 → ^26.6.5.
- Where license-web's range is **looser** (`tailwindcss`, `@tailwindcss/postcss` are `^4` there), keep on-time-web's `^4.2.2`.
- `@types/classnames` stays where it is (license-web moved it to devDependencies; harmless either way — builder's call).
- on-time-web-only packages (`html2canvas-pro`, `jspdf`, `qrcode`, `qr-code-styling`, `@types/qrcode`) are left untouched.
- yarn 4.17.0 → **4.18.0**: `packageManager`, `.yarnrc.yml` `yarnPath` + `.yarn/releases/` file, both `corepack prepare` lines in `Dockerfile`. (`.mise.toml` is already 4.18.0.)
- Done when `yarn build` and `yarn lint` pass and the three date-picker screens + any lottie animation still work in `yarn dev`.

## 4. Part 2 — 셸 리디자인

### 4.1 Layout wiring (`src/app/layout.tsx`)

```
<div flex h-dvh>
  <Sidebar user theme />                 // md+ only
  <div flex-col>
    <Header theme />                     // breadcrumb row; avatar menu on mobile only
    <main ... pb-24 md:pb-10>{children}</main>
  </div>
</div>
<MobileTabBar />                         // md:hidden
<CommandPalette />
```

The shell stays in the root layout as today (not moved into a route group).
`theme` comes from the cookie as today. Sidebar user data comes from the
existing `useUser()` client query (as the current Sidebar does) — builder's
call whether to pass server `getUserinfo()` instead, as license-web does.

### 4.2 Sidebar (port of license-web `Sidebar.tsx`)

- Header row: OnTime logo mark (existing purple dot) + "OnTime" + collapse toggle.
- Collapse: `w-16` ↔ expanded width, state in `localStorage` (`sidebar-collapsed`), read after mount. Collapsed shows icons only with `title` tooltips; badges hidden.
- Search button under the header: "검색" + `⌘K` / `Ctrl K` kbd (via `useSyncExternalStore` platform check, as in license-web). Click dispatches `open-command-palette`.
- Nav items: keep `NAV_GROUPS` from `_layouts/nav.ts` (groups 근태 / 전자 결재 / 관리, `신청하기` header with sub-items, manager-only group, `처리 대기` count badge via `useProceedingApprovalCount`). Restyle to license-web: active item = `bg-[rgba(133,91,251,.12)] text-accent font-semibold` + 3px left primary bar; group labels = 10px uppercase tracked.
- Collapsed mode: the `신청하기` header row and sub-items need an icon or must collapse sensibly — builder's call (e.g. show sub-items with their own icons, or a single ＋ icon linking to 휴가 신청).
- `UserMenu` card pinned to the bottom (`mt-auto`).

### 4.3 UserMenu (port of license-web `UserMenu.tsx`)

- Trigger card: avatar + name + secondary line + chevron. Secondary line = `팀 · 직급` (current Sidebar's logic, incl. `(팀장)` marker), not email.
- Dropdown (opens upward from the sidebar): avatar + name + role badge (`ROLE_` stripped) + 팀 · 직급; then
  1. 테마 — license-web's segmented ThemeSwitcher (light / dark). Replace on-time's toggle `ThemeSwitcher` with license-web's version (needs `nav.themes.*` messages); Header no longer renders it.
  2. 내 정보 → `/profile`
  3. 앱 설치 안내 → opens existing `NotificationDialog` via `overlay.open`
  4. 로그아웃 → `<a href="/logout">` (route handler, no prefetch), red row as in license-web.
- Avatar (author's call): do **not** change the shared `UserAvatar` (profile page uses it). The shell keeps its own small avatar in `_layouts/` — profile image if the user has one, otherwise the current purple gradient initial (as in today's `Sidebar.tsx` / `Header.tsx`), ~30px, no online dot.
- The same component is reused on mobile from the Header avatar (dropdown opens downward, `dropdown-end`).

### 4.4 Header → breadcrumb row

- Keep `Header.tsx`'s breadcrumb exactly (group › item › detail title from `breadcrumb.ts` / `useBreadcrumbTitle`).
- Remove notification button, ThemeSwitcher and avatar dropdown on `md+`.
- On mobile only, show the avatar on the right that opens UserMenu (4.3).
- Make it thinner/quieter than today (license-web has no header; mockup shows a small muted line). Exact height is builder's call.

### 4.5 CommandPalette (port of license-web `CommandPalette.tsx`)

Keep license-web's mechanics verbatim: daisyUI `modal modal-top`, global ⌘K / Ctrl K toggle, `open-command-palette` event, 250ms debounce, combobox/listbox ARIA, ↑↓ / ↵ / esc, IME-safe Enter (`isComposing`), footer hints, focus restore.

Sections (only two):

1. **메뉴** — client-side match of the query against translated `nav.*` labels of every `NAV_GROUPS` item (manager group only for `ROLE_MANAGER` / `ROLE_ADMIN`). No network.
2. **결재 문서** — scope is **결재함** (documents the current user approves; same source as `/approvals`).
   - Tokenise the query on whitespace. Tokens matching a type keyword set the type filter: `휴가` → `VACATION`; `휴일`/`연장`/`근무` → `OVERTIME_WORK` (exact keyword list is builder's call; derive from the `nav`/`document` messages).
   - Remaining tokens are matched against the drafter name (`document.user.username`, substring, case-insensitive).
   - Fetch via existing `searchApprovalHistories({ type, page: 0, size: N })` (same call as `DocumentApprovalContents`, no `userUniqueId`) and filter by drafter name client-side; show the first 5 newest with a status badge. N = 50 suggested. `// ponytail:` note the ceiling — only the N most recent approvals are searchable; a server-side drafter-name filter is the upgrade path.
   - If no type token and no remaining tokens match → no 결재 문서 section, show "결과 없음" only when 메뉴 is also empty.
   - Row label: `문서 종류 · 기안자 · 날짜`. Selecting navigates to `/approvals/{approvalHistory.id}` (the existing 결재 상세 route — builder verifies which id it takes).
- New `palette.*` messages in `ko.json` (title, placeholder, menu, documents, empty, move, open, hint, loading).
- `@/domain/approval` query keys follow `libs/ky-react-query.md`. The 결재 문서 fetch is keyed by the **type filter only** (`all` / `VACATION` / `OVERTIME_WORK`), not by the raw text — at most 3 cached fetches per palette session; drafter-name filtering runs client-side over the cached result (author's call).
- Note: the BFF route `src/app/api/v1/documents/approval/route.ts` makes one `api/v1/users/{id}/summary` call per row to attach `document.user`, so each fetch costs 1 + N backend calls. **Decided: dedupe in that route** — collect the distinct `document.userUniqueId`s of the page, fetch each user summary once, then map back. Keep N = 50. (Applies to `/approvals` too; response shape unchanged.) A cross-request cache is out of scope.

### 4.6 MobileTabBar (replaces `MobileDock.tsx`)

license-web `MobileTabBar.tsx` pattern, 5 slots: **홈** (`/dashboard`) · **근무 일정** (`/schedule`) · **＋ 신청** (raised primary circle) · **처리 대기** (`/approvals`, with count badge) · **검색** (opens palette).

- ＋ opens a small menu with 휴가 (`/dayoff/requests`) and 휴일근무 보고 (`/overtime/requests`) — a daisyUI `dropdown dropdown-top` is enough; builder's call on exact form.
- Safe-area bottom padding as in license-web; keep `main`'s `pb-24` so page-bottom buttons aren't covered.
- 내 정보 leaves the bar; it lives in the Header avatar menu.

### 4.7 Icons

Keep using `react-icons` (already a dependency) rather than copying license-web's custom `icons` module. Choose icons that match license-web's line style (e.g. `react-icons/lu`).

## 5. Docs to update

- `docs/agents/structure.md` (`_layouts/` contents: CommandPalette, MobileTabBar, UserMenu; MobileDock removed).
- `docs/agents/tech-stack.md` (versions).
- `docs/agents/libs/theme.md` if ThemeSwitcher's API changes.

## 6. Left to the builder

- Branch name; commit split (one per part is enough).
- Expanded sidebar width (license-web uses `w-80`; current OnTime `248px`).
- Collapsed treatment of the 신청하기 group.
- Type keyword list, N for the approvals fetch.
- Whether Sidebar user data comes from `useUser()` or server `getUserinfo()`.
