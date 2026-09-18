# UI 리디자인 (Kraken 디자인 시스템) — Design

- Date: 2026-09-18
- Branch: `feature/ui-v3`
- Status: approved in brainstorming (mockup `.superpowers/brainstorm/*/content/renewal-v2.html`), pending implementation plan
- Depends on: `2026-09-18-foundation-better-auth-api-design.md` (project #1, done)
- Design template: `docs/design/kraken-design.md`

## 1. Goal

Replace the current Spotify-style dark UI with a Kraken-style system: white
surfaces, Kraken Purple, 12px radius, whisper shadows — **light by default,
with a dark variant** — and reorganise the app around what the user does most
(출퇴근, 처리할 결재, 신청). Every existing page is restyled; no page is
added or removed.

Non-goals: new backend data (신청자 잔여 연차 / 같은 기간 팀원 휴가 on 결재
상세 and 휴가 신청 are follow-ups), new features, `en` locale, changes to the
A4 document components.

## 2. Decisions (from brainstorming)

| Topic | Decision |
|---|---|
| App shell | Left sidebar kept (option A). 248px, white surface, purple active state. Utility header on top, mobile dock at the bottom. |
| Theme | Light default + dark variant (option B). Cookie-based `data-theme` via the template's `setTheme` action and a `ThemeSwitcher` icon button in the header. |
| Design system | `docs/design/kraken-design.md` tokens. Fonts: Pretendard for both display and UI roles (Kraken fonts are proprietary), with the doc's sizes/weights/tracking. |
| 결재 문서 (A4) | `VacationDocument`, `OverTimeWorkDocument`, `DocumentApprovalLine`, `UserSignature` **unchanged**. White background stays for PDF capture. Only the page around them changes. |
| Data | No new endpoints. Everything on the mockup that needs data uses existing queries. |
| Chat / 준비중 pages | Already deleted in project #1; not part of the nav. |

## 3. Design tokens

### 3.1 daisyUI themes (`src/app/globals.css`)

Two `@plugin 'daisyui/theme'` blocks replace `ontime-dark`:

`ontime-light` (`default: true`, `color-scheme: light`)

| daisyUI var | value | Kraken role |
|---|---|---|
| `--color-base-100` | `#ffffff` | surface (cards, sidebar, header) |
| `--color-base-200` | `#f5f5f8` | page canvas |
| `--color-base-300` | `#eeeef2` | hover rows, track backgrounds |
| `--color-base-content` | `#101114` | Near Black text |
| `--color-primary` | `#7132f5` | Kraken Purple |
| `--color-primary-content` | `#ffffff` | |
| `--color-secondary` | `#5741d8` | Purple Dark (outlined buttons, hover) |
| `--color-neutral` | `#686b82` | Cool Gray (secondary text, borders at 24%) |
| `--color-neutral-content` | `#ffffff` | |
| `--color-success` | `#149e61` | Green |
| `--color-success-content` | `#026b3f` (used on 16% bg badges) | |
| `--color-warning` | `#d97706` | |
| `--color-error` | `#dc2626` | |
| `--color-info` | `#5741d8` | |
| `--radius-box` | `0.75rem` (12px) | cards, inputs |
| `--radius-field` | `0.75rem` | buttons (12px max, no pill) |
| `--radius-selector` | `0.5rem` | badges, chips |
| `--border` | `1px` | |

`ontime-dark` (`prefersdark: true`, `color-scheme: dark`) — derived, since the doc defines no dark palette:
`base-100 #17181d`, `base-200 #0f1014`, `base-300 #22232a`, `base-content #f3f3f6`,
`primary #8b5cf6`, `secondary #7c4dff`, `neutral #a7a9b8`, `success #22c55e`,
`warning #f59e0b`, `error #ef4444`; same radii.

Additional CSS custom properties on `:root` / `[data-theme=dark]`:
`--border-soft` (`#eeeef2` / `#22232a`), `--text-2` (`#686b82` / `#a7a9b8`),
`--text-3` (`#9497a9` / `#7c7f91`), `--primary-subtle` (`rgba(133,91,251,.16)` /
`rgba(139,92,246,.2)`), `--primary-soft` (`#f3effe` / `#1e1a2e`),
`--shadow-whisper` (`rgba(0,0,0,.03) 0 4px 24px` / `rgba(0,0,0,.35) 0 4px 24px`),
`--shadow-micro` (`rgba(16,24,40,.04) 0 1px 4px` / `rgba(0,0,0,.3) 0 1px 4px`).
Exposed as Tailwind utilities via `@utility` (`shadow-whisper`, `shadow-micro`,
`text-2`, `text-3`, `bg-primary-subtle`, `bg-primary-soft`, `border-soft`).

`body` background becomes `var(--color-base-200)`. The `eyebrow` utility keeps
its size/tracking but uses `--text-3` colour. `fade-up` animation and
reduced-motion rules stay.

### 3.2 Typography

| Role | Size / weight / tracking | Use |
|---|---|---|
| Page title | 28px / 700 / -0.5px | `PageHeader` h1 |
| Section heading | 15px / 600 | card section headers |
| Stat value | 26px / 700 / -0.5px | `StatCard` |
| Body | 15px / 400 (14px in tables) | |
| Caption | 12–13px / 400–500, `--text-2`/`--text-3` | |
| Eyebrow / group label | 11px / 600 / 1.6px uppercase | nav groups, page eyebrow |

### 3.3 Components (daisyUI class conventions)

- Buttons: `btn btn-primary` (purple solid), `btn btn-outline btn-secondary`
  (white + purple-dark border), `btn-subtle` (custom: `bg-primary-subtle
  text-primary`), `btn-ghost`, `btn-sm`. Never `rounded-full` on buttons.
- Badges: 6px radius, 16% tinted backgrounds: `b-ok` (success), `b-wait`
  (warning), `b-no` (error), `b-n` (neutral 12%), `b-p` (primary-subtle).
  Always icon/text + colour, never colour alone.
- Cards: `bg-base-100 border border-base-300 rounded-box shadow-whisper`.
- Inputs: 42px height, 10px radius, `border-base-300`, focus ring `primary`.

## 4. App shell (`src/app/layout.tsx` + `src/app/_layouts/`)

```
html[data-theme=<cookie|light>]
└ body.bg-base-200
  ├ Sidebar (aside, 248px, md+)      _layouts/Sidebar.tsx  (replaces NavMenu desktop half)
  │  ├ Logo
  │  ├ ClockCard                     _layouts/ClockCard.tsx (replaces NowWorkingBar)
  │  ├ nav groups                    (see 4.2)
  │  └ UserMenu (avatar, name/team, profile, logout)
  ├ main
  │  ├ Header                        _layouts/Header.tsx: Breadcrumb · spacer · Notification · ThemeSwitcher · avatar
  │  └ .page (scroll, px-7 pb-10)    {children}
  └ MobileDock (fixed bottom, <md)   _layouts/MobileDock.tsx (replaces NavMenu dock half)
```

### 4.1 ClockCard (was NowWorkingBar)

Same three states and data (`useGetAttendanceRecord` for today): 근무 중 (green
dot, elapsed time, 퇴근하기 primary button), 출근 전 (gray dot, 출근하기 → link
to `/attendance/record/gps`), 퇴근 완료 (총 근무 시간, no button). Lives at the
top of the sidebar on every page; on mobile it is the dock's centre FAB
(same action as the button) plus the first card on 홈.

### 4.2 Navigation

| Group | Item | Route |
|---|---|---|
| — | 홈 | `/dashboard` |
| 근태 | 근무 일정 | `/schedule` |
| 근태 | 출퇴근 기록 | `/attendance/record/gps` |
| 전자 결재 | 신청하기 › 휴가 | `/dayoff/requests` |
| 전자 결재 | 신청하기 › 휴일근무 보고 | `/overtime/requests` |
| 전자 결재 | 휴가 사용 내역 | `/dayoff/used` |
| 전자 결재 | 내 결재 문서 | `/documents` |
| 전자 결재 | 처리 대기 (badge = `useProceedingApprovalCount`) | `/approvals` |
| 관리 (manager only) | 임직원 근무 현황 | `/attendance/view` |
| 관리 | 임직원 휴가 현황 | `/dayoff/users/vacations` |
| 관리 | 출근 QR | `/qr` |

"신청하기" is a group header row with two indented sub-items (always expanded).
Active state: `bg-primary-subtle text-primary font-semibold`, matched with
`useSelectedLayoutSegments` as today. `messages/ko.json` `nav.*` keys are
renamed to match (add `home`, `groupAttendance`, `attendanceRecord`,
`requestGroup`, `groupManage`; drop the obsolete ones).

Mobile dock (5 slots): 홈, 일정, FAB(출퇴근), 결재(`/approvals`), 내 정보(`/profile`).

### 4.3 Header

Breadcrumb built from the nav table (group › item; detail pages append the
document title), notification button (existing `NotificationDialog`),
`ThemeSwitcher` (icon button toggling light/dark via `setTheme`), avatar with
the existing dropdown (프로필, 로그아웃).

### 4.4 Theme plumbing

Copied from the template: `src/app/themeAction.ts` (`setTheme`),
`src/shared/providers/theme/ThemeProvider.tsx` (`Theme` type),
`src/shared/components/theme/ThemeSwitcher.tsx` (restyled as an icon button).
Root layout reads the `theme` cookie (default `light`) and sets
`data-theme`. No `prefers-color-scheme` auto-switch; the cookie decides.

## 5. Shared primitives (`src/shared/components/`)

| Component | Change |
|---|---|
| `PageHeader` | `title`, `description`, optional `eyebrow`, optional `actions` slot (right-aligned). 28px title. |
| `StatCard` | `label`, `value`, `unit`, `caption` (ReactNode — may hold a badge), optional `ring` (0–100 → conic ring). |
| `Badge` (new) | `variant: ok | wait | no | neutral | primary`, children. Replaces ad-hoc badge markup and `DocumentStatusBadge`/`DocumentTypeBadge` internals (those keep their names and map status → variant). |
| `Segment` (rename of `PillFilter`) | Same props; renders the boxed segmented control. |
| `Pagination` | Footer-row style: "총 N건 · a–b" left, ‹ 1 2 3 › right; square 32px buttons. Same props. |
| `Card`, `CardSection` (new) | Thin wrappers for the card + section-header pattern (`title`, `aside`, `link`). |
| `Stepper` (new, `src/domain/approval/components/ApprovalStepper.tsx`) | Vertical 결재 진행 from `approvalHistories`: ok / current / pending states. Used on 결재 상세 pages and the 휴가 신청 summary. |
| `Dropdown`, `MonthPicker`, toast | Restyled to tokens only. |

## 6. Pages

All pages: `PageHeader` at top, content in cards, `animate-fade-up` kept.
Page sub-components stay in their `_components/` folders; only markup/classes
change unless noted.

| Page | Layout |
|---|---|
| `/dashboard` | Greeting title ("안녕하세요, {name}님", date + "이번 주 N일째 출근"); actions: 휴가 신청 (outline), 휴일근무 보고 (primary). 4 stats: 이번 주 누적 근무 (`/40h`, 정상 badge), 오늘 근무 (출근·예상 퇴근), 잔여 연차 (ring from `useUserLeaveEntry`), 결재 처리 대기 (count). Two columns (2:1): 이번 주 근무 기록 (bar rows, 주/월 segment, "전체 보기 →" to `/schedule`) · 내가 처리할 결재 (top 3 WAITING from `useApprovalHistories`, 보기 + 승인 inline via `useApproveDocument`) + 빠른 신청 tiles (휴가, 휴일근무, 근무 일정 등록, 내 문서). |
| `/schedule`, `/schedule/add` (+ modal) | Calendar/timeline in a card; `AddScheduleButton` → primary. Modal restyled. |
| `/dayoff/requests` | Form card in 3 numbered sections (종류 chips with 잔여 count, 기간 two date fields + hint, 사유) and a sticky right summary card (종류/기간/사용, 신청 후 잔여 in primary, `ApprovalStepper`, 상신하기 / 임시 저장). `SelectUserCompLeaveEntriesModal` restyled. Uses existing `useCreateVacation`, `useUserLeaveEntry`, `useUserCompLeaveEntries`. |
| `/dayoff/used` | Year segment, stat header, table with status badges, footer pagination. |
| `/dayoff/[id]`, `/overtime/[id]` | Two columns: A4 document (unchanged component, white, existing width) · sticky right panel: `ApprovalStepper` + actions (`RequestConfirmModal`, `PressApprovalModal` restyled). |
| `/overtime/requests` | Same 3-section + summary pattern; inline datetime rows table keeps its behaviour. `SelectUserModal` restyled. |
| `/documents` | Segments (상태), 종류 segment, table (문서 / 종류 / 상태 / 날짜), row click → detail, footer pagination. `DocumentResult` restyled. |
| `/approvals` | Segments (대기 N / 승인됨 / 반려됨 / 전체), 종류 segment, table with 신청자 + 기간 + status badge + inline 승인/반려 (existing modals). |
| `/approvals/[id]` | Breadcrumb "처리 대기 › 문서명"; two columns: A4 (unchanged) · sticky panel with `ApprovalStepper`, 의견 textarea, 반려 (danger-subtle) / 승인 (primary). `ApproveModal`, `RejectModal`, `CancelConfirmModal` restyled. |
| `/profile` | Two cards: 개인 정보 (avatar upload) · 서명 / 비밀번호. Modals restyled. |
| `/attendance/record/gps`, `/attendance/record/[checkId]` | Centered card, map/GPS content unchanged, primary CTA. |
| `/attendance/view` (manager) | `AllEmployeesGrid` in a card, sticky header row, status badges. |
| `/dayoff/users/vacations` (manager) | Year segment, matrix card with sticky first column; `DualValue` cells use `text-2` for comp values. |
| `/qr` (manager) | Centered card with the QR and refresh button. |
| `error.tsx`, `not-found.tsx`, `forbidden.tsx`, `loading.tsx` | Same content, tokens applied; `CardPageTitle` restyled. |

## 7. Accessibility & responsive

- Base font 15px, body line-height 1.38; contrast ≥ 4.5:1 for text on both themes (Kraken neutrals meet this; dark palette chosen to match).
- Visible focus ring (`outline-2 outline-primary outline-offset-2`) on every interactive element.
- Breakpoints from the doc: sidebar hidden below `md` (768px), dock shown; two-column layouts collapse to one below `lg` (1024px); tables scroll horizontally below `md`.
- `prefers-reduced-motion` rule kept.

## 8. Verification

No test runner. Per page, in both themes, on `yarn dev` against the real
gateway: renders without console errors, all actions still work (the same
click-through list as project #1 §7), A4 PDF capture on 결재 상세 produces the
same document as before. `yarn lint` and `yarn build` green after each step.

## 9. Order of work (one commit each)

1. Tokens + two daisyUI themes + theme plumbing (`themeAction`, `ThemeSwitcher`, cookie in layout). App still renders with old markup on the new palette.
2. App shell: `Sidebar` (+ `ClockCard`), `Header`, `MobileDock`; delete `NavMenu`, `NowWorkingBar`; nav i18n keys.
3. Shared primitives (§5).
4. User pages, in nav order: dashboard, schedule, dayoff/*, overtime/*, documents, approvals/*, profile, attendance/record/*.
5. Manager pages + error/404/403/loading.
6. Docs: `docs/agents/libs/tailwind-daisyui.md` (themes, utilities), `docs/design/README.md` link check, `docs/agents/libs/theme.md` (already describes the cookie mechanism — verify).
