# 셸 리디자인 + 버전 업데이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align dependencies with license-web, then replace OnTime's app shell with license-web's Sidebar / ⌘K CommandPalette / UserMenu / MobileTabBar.

**Architecture:** Shell stays in the root layout (`src/app/layout.tsx`) with sub-components in `src/app/_layouts/`. Components are ported from `/Users/hwpark/Documents/webstorm-workspace/license-web/src/app/(manager)/_layouts/` keeping markup/classes, swapping license-web's `@/shared/components/icons` for `react-icons/lu` and its nav for OnTime's `NAV_GROUPS`. Palette query parsing is a pure module with a `node:test` check.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4 + daisyUI 5, next-intl v4, React Query v5, ky, react-icons, overlay-kit, yarn 4.

**Spec:** `docs/superpowers/specs/2026-10-15-shell-redesign-version-update-design.md`

## Global Constraints

- Branch: `feature/shell-v4` (already created and checked out).
- Reference files are in license-web; port markup/classes verbatim unless a task says otherwise.
- Shared deps take license-web's version; keep `tailwindcss`/`@tailwindcss/postcss` at `^4.2.2`; don't add license-web-only packages or config.
- `react-day-picker` pinned `10.0.2`; `lottie-react` `^3.1.2`; `@types/node` `^26.6.5`; yarn `4.18.0`.
- No backend changes. Don't restyle page contents. Don't modify shared `UserAvatar`.
- Manager-only nav/menu entries render only for `ROLE_MANAGER` / `ROLE_ADMIN` (`MANAGER_ROLES` in `src/app/_layouts/nav.ts`).
- Keep `main`'s `pb-24 md:pb-10` so the mobile bar never covers page-bottom buttons.
- Follow `docs/agents/conventions/react-sections.md` section comments (`// hooks`, `// state`, `// handle` …) and `docs/agents/libs/*` patterns.
- All new UI copy goes in `messages/ko.json` (only locale).
- Commit prefix per `docs/agents/workflows/git.md` (`feat:`, `fix:`, `build:`, `docs:`, `refactor:`); every commit ends with
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01QdJTiynMGvnB3vYdPHcHVb
  ```
- Every task ends with `yarn lint` (0 errors) and `yarn build` passing.

## Review Focus

1. Korean IME: pressing Enter to finish composing "홍길동" in the palette must not navigate (`isComposing` guard ported verbatim) — manual check in Task 5.
2. Query with two type keywords ("휴가 휴일") → first keyword wins, second is ignored (not treated as a name) — test in Task 3.
3. Query that is only whitespace → no fetch, no sections, no "결과 없음" — test in Task 3 (`parsePaletteQuery('   ')`), `matchesLabel(_, '')` false.
4. Non-manager typing "임직원" → no 관리 menu results — manual check in Task 5.
5. Approval page where every row has the same drafter → exactly one user-summary call — manual check in Task 2.

---

### Task 1: 버전 업데이트

**Files:**
- Modify: `package.json`, `yarn.lock`, `.yarnrc.yml`, `Dockerfile` (both `corepack prepare` lines)
- Create: `.yarn/releases/yarn-4.18.0.cjs` (remove `yarn-4.17.0.cjs`)
- Modify if broken by v10: `src/app/(user)/dayoff/requests/_components/DayOffRequestContents.tsx`, `src/app/(user)/overtime/requests/_components/OvertimeRequestContents.tsx`, `src/app/(user)/@modal/(.)schedule/add/_components/AddScheduleModal.tsx`, `src/app/globals.css` (`/* react-day-picker */` block, ~line 229)
- Modify: `docs/agents/tech-stack.md`

**Interfaces:** none.

- [ ] **Step 1:** `yarn set version 4.18.0` — updates `packageManager`, `.yarnrc.yml` `yarnPath`, and `.yarn/releases/`. Then set `corepack prepare yarn@4.18.0 --activate` in both Dockerfile lines.
- [ ] **Step 2:** In `package.json`, set every package present in both projects to license-web's specifier (run `diff <(jq -S '{dependencies,devDependencies}' package.json) <(jq -S '{dependencies,devDependencies}' ../license-web/package.json)`), except keep `tailwindcss`/`@tailwindcss/postcss` at `^4.2.2`. Leave `@types/classnames` in `dependencies`. Then `yarn install`.
- [ ] **Step 3:** `yarn build`. If react-day-picker v10 breaks types/props/CSS class names, fetch the migration guide (`npx ctx7@latest library "React DayPicker" "v10 migration"` → `docs`) and fix the three call sites + the `globals.css` block. `lottie-react` has no usages in `src/` — nothing to fix.
- [ ] **Step 4:** Run `yarn lint` and `yarn build`. Expected: both pass. Then `yarn dev` and open `/dayoff/requests`, `/overtime/requests`, `/schedule/add`: the date picker renders with Kraken styling (selected range purple, Korean locale) and selecting a range still updates the 신청 요약.
- [ ] **Step 5:** Update versions in `docs/agents/tech-stack.md`. Commit: `build: license-web 기준으로 의존성 및 yarn 4.18.0 버전 업데이트`.

---

### Task 2: 결재함 BFF 사용자 요약 중복 제거

**Files:**
- Modify: `src/app/api/v1/documents/approval/route.ts`

**Interfaces:** response shape unchanged (`Page<ApprovalHistory>` with `document.user: User`).

- [ ] **Step 1:** Replace the per-row `users/{id}/summary` call: collect `new Set(page.content.map((item) => item.document.userUniqueId))`, fetch each summary once with `Promise.all`, build a `Map<string, User>`, then map rows to `{ ...item, document: { ...item.document, user: users.get(item.document.userUniqueId) } }`. `userUniqueId` is optional in the DTO: leave undefined ids out of the set; those rows get `user: undefined`.
- [ ] **Step 2:** `yarn dev`, open `/approvals` with DevTools/server log: the list renders with drafter names identical to before; with N rows from K distinct drafters the server makes K summary calls (add a temporary `console.count` locally to confirm, then remove it).
- [ ] **Step 3:** `yarn lint && yarn build` pass. Commit: `refactor: 결재함 조회 시 기안자 요약 조회 중복 제거`.

---

### Task 3: 팔레트 쿼리 파서 (pure) + test

**Files:**
- Create: `src/app/_layouts/paletteQuery.ts`
- Create: `src/app/_layouts/paletteQuery.test.ts`
- Modify: `package.json` (add `"test": "node --test 'src/**/*.test.ts'"`), `tsconfig.json` (add `"**/*.test.ts"` to `exclude` — the test imports `./paletteQuery.ts` with its extension, which Node's type stripping needs and `tsc` would reject)
- Modify: `CLAUDE.md` (실행 명령어: add `yarn test`, remove "테스트 스크립트는 현재 … 정의되어 있지 않다" paragraph), `docs/agents/tech-stack.md`, `docs/agents/workflows/dev-env.md` (mention `yarn test` = `node --test`, Node 24 type stripping, no runtime `@/` imports in tested modules)

**Interfaces:**
- Produces (in `paletteQuery.ts`; only `import type` from `@/…` allowed — runtime aliases don't resolve under `node --test`):
  - `export type PaletteQuery = { type?: DocumentsType; nameTokens: string[] }`
  - `export function parsePaletteQuery(input: string): PaletteQuery`
  - `export function matchesDrafter(username: string | undefined, nameTokens: string[]): boolean`
  - `export function matchesLabel(label: string, input: string): boolean`
  - `export const TYPE_KEYWORDS: Record<DocumentsType, string[]> = { VACATION: ['휴가', '연차', '반차'], OVERTIME_WORK: ['휴일', '연장', '근무'] }`

Rules: tokens = `input.trim().split(/\s+/)` minus empties. A token is a type token if it `includes` any keyword; the first type token sets `type`, later type tokens are dropped. All other tokens are `nameTokens`, lowercased. `matchesDrafter`: true if `nameTokens` empty, else every token is a substring of `username.toLowerCase()`; false if username undefined and tokens non-empty. `matchesLabel`: `label.toLowerCase().includes(input.trim().toLowerCase())`, false for empty input.

- [ ] **Step 1: Write the failing test** (`node:test` + `node:assert/strict`, import from `'./paletteQuery.ts'`):

```ts
test('parsePaletteQuery splits type and name', () => {
  assert.deepEqual(parsePaletteQuery('홍길동 연장'), { type: 'OVERTIME_WORK', nameTokens: ['홍길동'] });
  assert.deepEqual(parsePaletteQuery('휴가'), { type: 'VACATION', nameTokens: [] });
  assert.deepEqual(parsePaletteQuery('Kim'), { type: undefined, nameTokens: ['kim'] });
});
test('first type keyword wins, later ones dropped', () => {
  assert.deepEqual(parsePaletteQuery('휴가 휴일 홍'), { type: 'VACATION', nameTokens: ['홍'] });
});
test('blank input yields nothing', () => {
  assert.deepEqual(parsePaletteQuery('   '), { type: undefined, nameTokens: [] });
});
test('matchesDrafter', () => {
  assert.equal(matchesDrafter('홍길동', []), true);
  assert.equal(matchesDrafter('홍길동', ['길동']), true);
  assert.equal(matchesDrafter('Kim Minsu', ['kim', 'min']), true);
  assert.equal(matchesDrafter('홍길동', ['김']), false);
  assert.equal(matchesDrafter(undefined, ['홍']), false);
});
test('matchesLabel', () => {
  assert.equal(matchesLabel('휴가 사용 내역', '휴가'), true);
  assert.equal(matchesLabel('근무 일정', ''), false);
});
```

- [ ] **Step 2:** `yarn test` → FAIL (module not found).
- [ ] **Step 3:** Implement `paletteQuery.ts` per the Interfaces/Rules above.
- [ ] **Step 4:** `yarn test` → all pass; `yarn lint && yarn build` pass.
- [ ] **Step 5:** Commit: `feat: 커맨드 팔레트 검색어 파서 추가 및 node:test 도입`.

---

### Task 4: 데스크톱 셸 — Sidebar · UserMenu · ThemeSwitcher · Header

**Files:**
- Create: `src/app/_layouts/ShellAvatar.tsx`, `src/app/_layouts/UserMenu.tsx`
- Modify: `src/app/_layouts/Sidebar.tsx` (rewrite as port of license-web `Sidebar.tsx`), `src/app/_layouts/Header.tsx`, `src/app/layout.tsx`, `src/app/_layouts/nav.ts`
- Modify: `src/shared/components/theme/ThemeSwitcher.tsx` (replace with license-web version; icons `LuSun`/`LuMoon`)
- Modify: `messages/ko.json`

**Interfaces:**
- Consumes: `NAV_GROUPS`, `NavItem`, `isActive`, `MANAGER_ROLES` (`nav.ts`); `useUser()`, `useProceedingApprovalCount()` (`@/domain/users/queries/user`); `NotificationDialog`; `overlay` from `overlay-kit`; `setTheme` (`@/app/themeAction`).
- Produces:
  - `nav.ts`: `export const openCommandPalette = () => window.dispatchEvent(new Event('open-command-palette'))` and `export function useShortcutLabel(): string` (license-web's `useSyncExternalStore` platform check; `'⌘K'` on server). Add `icon` to the two `sub: true` items (`dayoffRequest`: `LuPlane`, `overtimeRequest`: `LuClockAlert` or similar from `react-icons/lu`) so collapsed mode can show them; the `신청하기` header row is hidden when collapsed.
  - `ShellAvatar({ user, size }: { user?: User; size?: 'sm' | 'md' })` — `sm` 30px, `md` 38px; `<img src={`/api/v1/users/${user.id}/avatar`}>` with `onError` → purple gradient initial (`from-primary to-secondary`, first char of `username`). No online dot.
  - `UserMenu({ theme, collapsed = false, placement = 'top' }: { theme: Theme; collapsed?: boolean; placement?: 'top' | 'bottom-end' })` — reads `useUser()` itself. Trigger: when `placement='top'` the license-web card (avatar + name + `팀 · 직급` line incl. `(팀장)` + chevron; icon-only when collapsed); when `'bottom-end'` just `ShellAvatar size="sm"` round button. Dropdown (`dropdown-top` vs `dropdown-bottom dropdown-end`): header (avatar md, name, role badge `role.type` minus `ROLE_`, `팀 · 직급`), `nav.theme` label + `ThemeSwitcher`, `hr`, 내 정보 `Link /profile`, 앱 설치 안내 button → `overlay.open(({ isOpen, close }) => <NotificationDialog open={isOpen} onClose={close} />)`, `hr`, 로그아웃 `<a href="/logout">` red row. Row style = license-web logout row (30px icon box) in neutral colors.
  - `Sidebar({ theme }: { theme: Theme })`.
  - `Header({ theme }: { theme: Theme })` — breadcrumb only (keep existing markup and `useBreadcrumbTitleValue`), height `h-11`, then on `md:hidden` the `<UserMenu theme={theme} placement="bottom-end" />`. Remove notification button, ThemeSwitcher, avatar dropdown.

Sidebar port details: width `w-64` expanded (OnTime nav labels are longer than license-web's; builder may adjust) / `w-16` collapsed; `localStorage` key `sidebar-collapsed` read in `useEffect`; header row = existing purple dot logo `Link /dashboard` + "OnTime" + `LuPanelLeft` toggle (`aria-pressed`); search button (`LuSearch`, `nav.search`, `<kbd>{useShortcutLabel()}</kbd>`) calling `openCommandPalette`; groups from `NAV_GROUPS` filtered by manager role, group label = license-web 10px uppercase style, `신청하기` header row kept when expanded; item = license-web active style (`bg-[rgba(133,91,251,.12)] text-accent` + 3px `before:` bar), `sub` items `pl-8`; 처리 대기 badge = `badge badge-soft badge-primary badge-xs ml-auto` hidden when collapsed; `title` tooltips when collapsed; `<UserMenu theme={theme} collapsed={collapsed} />` at `mt-auto`.

`layout.tsx`: `<Sidebar theme={theme} />`, keep `<Header theme={theme} />` and `<main className="flex-1 overflow-y-auto px-4 pb-24 md:px-7 md:pb-10">`.

`ko.json` adds under `nav`: `search: "검색"`, `collapse: "사이드바 접기"`, `theme: "테마"`, `themes: { light: "라이트", dark: "다크" }`, `appInstall: "앱 설치 안내"`, `newRequest: "신청"`. Remove top-level `theme.toLight/toDark` once unused.

- [ ] **Step 1:** Add `openCommandPalette`, `useShortcutLabel`, sub-item icons to `nav.ts`; add messages.
- [ ] **Step 2:** Replace `ThemeSwitcher.tsx`; create `ShellAvatar.tsx`, `UserMenu.tsx`.
- [ ] **Step 3:** Rewrite `Sidebar.tsx`; slim `Header.tsx`; wire `layout.tsx`.
- [ ] **Step 4:** `yarn lint && yarn build` pass. `yarn dev`, desktop width, as a manager then a regular user, check against mockup `.superpowers/brainstorm/85277-1792062276/content/shell-v2.html` ① and ③:
  - active item purple with left bar; 관리 group only for manager; 처리 대기 badge count.
  - collapse toggle → icons only incl. 휴가/휴일근무 sub-items; reload keeps state; no hydration warning in console.
  - user card → menu opens upward; theme switch flips `data-theme`; 내 정보 navigates; 앱 설치 안내 opens dialog; 로그아웃 goes to `/logout`.
  - broken/absent avatar image falls back to gradient initial.
  - Header shows breadcrumb only; `/approvals/{id}` shows the document title as last crumb.
  - mobile width: Header avatar opens same menu downward.
- [ ] **Step 5:** Commit: `feat: license-web 스타일 사이드바·사용자 메뉴 적용 및 헤더를 브레드크럼으로 축소`.

---

### Task 5: CommandPalette

**Files:**
- Create: `src/app/_layouts/CommandPalette.tsx` (port of license-web `CommandPalette.tsx`)
- Modify: `src/app/layout.tsx` (render `<CommandPalette />` after `MobileDock`/`MobileTabBar`), `messages/ko.json`

**Interfaces:**
- Consumes: `parsePaletteQuery`, `matchesDrafter`, `matchesLabel` (Task 3); `NAV_GROUPS`, `MANAGER_ROLES` (`nav.ts`); `useUser()`; `searchApprovalHistories` (`@/domain/approval/apis/approvalHistory`); `DocumentStatusBadge({ status })` (`@/domain/document/components/DocumentStatusBadge`); listens for `open-command-palette`.
- Produces: none.

Keep verbatim from license-web: modal markup/classes, ⌘K/Ctrl K toggle, event listener, focus/restore effect, 250 ms debounce into `q`, `activeIndex`/ARIA ids, ↑↓/↵(`!isComposing`)/esc handling, footer.

Differences:
- `PaletteItem.section: 'menu' | 'documents'`; no 'actions' section.
- 메뉴: from `NAV_GROUPS` (manager group only if `MANAGER_ROLES.includes(user.role.type)`), items where `matchesLabel(t(item.key), q)`; icon = `item.icon` or `LuPlus` for sub items; href = `item.href`. Computed client-side, no query.
- 결재 문서: `const { type, nameTokens } = parsePaletteQuery(q)`; `useQuery({ queryKey: ['palette', 'approvals', type ?? 'all'], queryFn: () => searchApprovalHistories({ type, page: 0, size: 50 }), enabled: open && (!!type || nameTokens.length > 0), staleTime: 10_000 })`; then `content.filter((h) => matchesDrafter(h.document.user?.username, nameTokens)).slice(0, 5)`. Item: icon `LuFileText`, label `` `${typeLabel} · ${username} · ${dayjs(h.document.createdDate).format('YYYY-MM-DD')}` `` where typeLabel = `t('nav.dayoffRequest')` for `VACATION`, `t('nav.overtimeRequest')` for `OVERTIME_WORK`; trailing `<DocumentStatusBadge status={h.document.status} />`; href `/approvals/${h.id}`.
- Empty state ("결과 없음") when `q` non-empty and both sections empty and not fetching.
- `ko.json` `palette`: `title: "검색"`, `placeholder: "메뉴 또는 기안자·문서 종류 검색"`, `menu: "메뉴"`, `documents: "결재 문서"`, `empty: "결과 없음"`, `loading: "검색 중"`, `move: "이동"`, `open: "열기"`, `hint: "⌘K 로 어디서나 열기"`.

- [ ] **Step 1:** Add messages; create `CommandPalette.tsx`; mount in `layout.tsx`.
- [ ] **Step 2:** `yarn lint && yarn build && yarn test` pass.
- [ ] **Step 3:** `yarn dev` manual check against mockup ②:
  - ⌘K (Ctrl K on non-Mac) opens; again closes; sidebar search button opens; esc and backdrop close; focus returns.
  - "휴가" → 메뉴 shows 휴가 / 휴가 사용 내역 (+ 임직원 휴가 현황 for managers only); 결재 문서 shows newest 5 휴가 approvals.
  - "<drafter name> 휴일" → only that drafter's 휴일근무 rows; Enter opens `/approvals/{id}`.
  - Typing a Korean name and pressing Enter to finish IME composition does not navigate.
  - Typing more name characters does not trigger new network requests (same type key); switching 휴가→휴일 triggers one.
  - Non-manager "임직원" → no results.
- [ ] **Step 4:** Commit: `feat: 메뉴·결재 문서 검색 커맨드 팔레트 추가`.

---

### Task 6: MobileTabBar (replaces MobileDock)

**Files:**
- Create: `src/app/_layouts/MobileTabBar.tsx` (port of license-web `MobileTabBar.tsx`)
- Delete: `src/app/_layouts/MobileDock.tsx`
- Modify: `src/app/layout.tsx`, `messages/ko.json`

**Interfaces:**
- Consumes: `openCommandPalette` (`nav.ts`), `useProceedingApprovalCount()`.
- Produces: none.

Tabs (license-web `TAB` class, active via `usePathname().startsWith(href)`): 홈 `/dashboard` (`LuHouse`, `nav.home`) · 근무 일정 `/schedule` (`LuCalendar`, `nav.schedule`) · center raised `btn btn-circle btn-primary -mt-5 shadow-lg` (`LuPlus`, `aria-label` `nav.newRequest`) inside a `dropdown dropdown-top dropdown-center` whose content lists 휴가 → `/dayoff/requests` and 휴일근무 보고 → `/overtime/requests` · 처리 대기 `/approvals` (`LuInbox`, `nav.approvals`, small primary count badge when > 0) · 검색 button (`LuSearch`, `nav.search`) → `openCommandPalette`. Keep license-web's `pb-[max(0.75rem,env(safe-area-inset-bottom))]`, `z-40`, `md:hidden`.

- [ ] **Step 1:** Create `MobileTabBar.tsx`, delete `MobileDock.tsx`, swap in `layout.tsx`.
- [ ] **Step 2:** `yarn lint && yarn build` pass.
- [ ] **Step 3:** `yarn dev` at 390px width, check against `mobile-choice.html` B: tabs navigate and highlight; ＋ opens the two-item menu; 검색 opens the palette; on `/dayoff/requests` the page's bottom submit button is fully visible above the bar after scrolling to the end.
- [ ] **Step 4:** Commit: `feat: 모바일 하단 바를 license-web TabBar 방식으로 교체`.

---

### Task 7: 문서 갱신 + 최종 검증

**Files:**
- Modify: `docs/agents/structure.md` (root shell `_layouts/` list: Sidebar, Header, UserMenu, ShellAvatar, CommandPalette, MobileTabBar, NotificationDialog, nav.ts, breadcrumb.ts, paletteQuery.ts; drop MobileDock, incl. the `MobileDock.tsx` filename example on line 62)
- Modify: `docs/agents/libs/theme.md` (ThemeSwitcher is now a light/dark segmented radiogroup in UserMenu)

- [ ] **Step 1:** Update both docs.
- [ ] **Step 2:** `yarn lint && yarn test && yarn build` pass; `grep -rn "MobileDock\|theme.toLight" src docs messages` returns nothing.
- [ ] **Step 3:** Commit: `docs: 셸 구조 및 테마 스위처 문서 갱신`.
