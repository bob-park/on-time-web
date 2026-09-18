# UI 리디자인 (Kraken 디자인 시스템) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every page of OnTime onto a Kraken-style light design system with a dark variant, and reorganise the shell around 출퇴근 / 처리할 결재 / 신청, without changing data flows or the A4 document components.

**Architecture:** Two daisyUI themes (`light` default, `dark`) plus a handful of token utilities in `globals.css`; a cookie-driven `data-theme`. The shell is rebuilt as `Sidebar` (with `ClockCard`), `Header`, `MobileDock`. Shared primitives (`PageHeader`, `StatCard`, `Badge`, `Segment`, `Pagination`, `Card`, `ApprovalStepper`) carry the look; pages are then swept with a class mapping and, where the spec changes structure (dashboard, lists, forms, detail pages), rebuilt around those primitives. Data hooks are untouched.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, daisyUI 5, next-intl 4, TanStack Query 5, overlay-kit, react-day-picker 9, Pretendard.

**Spec:** `docs/superpowers/specs/2026-09-18-ui-redesign-kraken-design.md` (design tokens §3, shell §4, primitives §5, pages §6). Design template: `docs/design/kraken-design.md`. Approved mockup: `.superpowers/brainstorm/*/content/renewal-v2.html`.

## Global Constraints

- Branch `feature/ui-v3`. One commit per task; commit messages `feat:`/`refactor:`/`docs:` in Korean as in the repo history, ending with the trailers `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01HLrmxQM9E3oAQbD8k7WPbG`.
- `yarn prettier`, `npx tsc --noEmit`, `yarn lint` (0 errors), `yarn build` must pass at the end of every task. No test runner; do not add one. Never start `yarn dev` inside a subagent; the controller does browser checks.
- **Frozen files (do not edit):** `src/domain/document/components/VacationDocument.tsx`, `OverTimeWorkDocument.tsx`, `DocumentApprovalLine.tsx`, `src/domain/users/components/UserSignature.tsx`. They stay white (`bg-white text-black`) for PDF capture.
- No new dependencies. No new API calls or hooks; every page uses the hooks it already uses (plus the shared ones named in this plan). `ko` remains the only locale.
- Kraken tokens (spec §3.1) are the only colours: no hex literals in components except inside `globals.css`. Buttons never `rounded-full` (max 12px). Badges are 6px radius with 16% tinted backgrounds and always carry text.
- `data-theme` on `<html>` comes from the `theme` cookie (`light` default); no `prefers-color-scheme` auto switch.
- Class-mapping sweep (Task 4) rules apply to every file touched later; pages must render correctly in **both** themes.
- Ponytail: shortest working diff; no abstractions beyond the ones this plan names.

---

## File map

| Path | Responsibility |
|---|---|
| `src/app/globals.css` | Pretendard import, two daisyUI themes, token custom properties + `@utility`s, animations, `.rdp-theme` calendar styles |
| `src/app/layout.tsx` | reads `theme` cookie → `data-theme`; renders `Sidebar`, `Header`, `MobileDock` |
| `src/app/_layouts/Sidebar.tsx` | desktop sidebar: logo, `ClockCard`, nav groups, user menu |
| `src/app/_layouts/ClockCard.tsx` | today's 출퇴근 state card (logic moved from `NowWorkingBar`) |
| `src/app/_layouts/Header.tsx` | breadcrumb, notification, `ThemeSwitcher`, avatar dropdown |
| `src/app/_layouts/MobileDock.tsx` | fixed bottom dock with centre FAB (<md) |
| `src/app/_layouts/nav.ts` | the nav table (groups → items → routes, i18n keys, icons, manager flag) shared by Sidebar / MobileDock / Header breadcrumb |
| `src/shared/components/theme/ThemeSwitcher.tsx` | icon button toggling light/dark via `setTheme` |
| `src/shared/components/{PageHeader,StatCard,Badge,Segment,Pagination,Card}.tsx` | primitives (spec §5) |
| `src/domain/approval/components/ApprovalStepper.tsx` | vertical 결재 진행 stepper |

---

### Task 1: Design tokens, two themes, theme plumbing

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx` (only the `data-theme` line and cookie read)
- Create: `src/shared/components/theme/ThemeSwitcher.tsx`
- Verify exist (from project #1): `src/app/themeAction.ts` (`setTheme(theme: Theme)`), `src/shared/providers/theme/ThemeProvider.tsx` (`export type Theme = 'light' | 'dark'`)

**Interfaces:**
- Produces: daisyUI themes named `light` / `dark` (custom themes that override the built-ins of the same name, so `data-theme` takes the cookie value directly); Tailwind utilities `shadow-whisper`, `shadow-micro`, `text-2`, `text-3`, `bg-primary-subtle`, `bg-primary-soft`, `border-soft`, `eyebrow`, `btn-subtle`; CSS vars `--text-2`, `--text-3`, `--border-soft`, `--primary-subtle`, `--primary-soft`, `--shadow-whisper`, `--shadow-micro`.
- Produces: `ThemeSwitcher({ current }: { current: Theme })` client component.

- [ ] **Step 1: Replace the theme block and body styles in `src/app/globals.css`**

Replace everything from `@plugin 'daisyui/theme' {` through the closing `}` of the `body { ... }` rule (i.e. the old `ontime-dark` theme, the `:root` shadow vars, and `body`) with:

```css
@plugin 'daisyui/theme' {
  name: 'light';
  default: true;
  color-scheme: 'light';
  --color-base-100: #ffffff;
  --color-base-200: #f5f5f8;
  --color-base-300: #eeeef2;
  --color-base-content: #101114;
  --color-primary: #7132f5;
  --color-primary-content: #ffffff;
  --color-secondary: #5741d8;
  --color-secondary-content: #ffffff;
  --color-accent: #7132f5;
  --color-accent-content: #ffffff;
  --color-neutral: #686b82;
  --color-neutral-content: #ffffff;
  --color-info: #5741d8;
  --color-info-content: #ffffff;
  --color-success: #149e61;
  --color-success-content: #ffffff;
  --color-warning: #d97706;
  --color-warning-content: #ffffff;
  --color-error: #dc2626;
  --color-error-content: #ffffff;
  --radius-selector: 0.5rem;
  --radius-field: 0.75rem;
  --radius-box: 0.75rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 0;
  --noise: 0;
}

@plugin 'daisyui/theme' {
  name: 'dark';
  prefersdark: false;
  color-scheme: 'dark';
  --color-base-100: #17181d;
  --color-base-200: #0f1014;
  --color-base-300: #22232a;
  --color-base-content: #f3f3f6;
  --color-primary: #8b5cf6;
  --color-primary-content: #ffffff;
  --color-secondary: #7c4dff;
  --color-secondary-content: #ffffff;
  --color-accent: #8b5cf6;
  --color-accent-content: #ffffff;
  --color-neutral: #a7a9b8;
  --color-neutral-content: #0f1014;
  --color-info: #7c4dff;
  --color-info-content: #ffffff;
  --color-success: #22c55e;
  --color-success-content: #0f1014;
  --color-warning: #f59e0b;
  --color-warning-content: #0f1014;
  --color-error: #ef4444;
  --color-error-content: #ffffff;
  --radius-selector: 0.5rem;
  --radius-field: 0.75rem;
  --radius-box: 0.75rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 0;
  --noise: 0;
}

/* 토큰 커스텀 프로퍼티 — daisyUI 변수 밖의 보조 색/그림자 */
:root,
[data-theme='light'] {
  color-scheme: light;
  --text-2: #686b82;
  --text-3: #9497a9;
  --border-soft: #eeeef2;
  --primary-subtle: rgba(133, 91, 251, 0.16);
  --primary-soft: #f3effe;
  --success-soft: rgba(20, 158, 97, 0.16);
  --success-text: #026b3f;
  --warning-soft: rgba(217, 119, 6, 0.14);
  --error-soft: rgba(220, 38, 38, 0.12);
  --neutral-soft: rgba(104, 107, 130, 0.12);
  --shadow-whisper: rgba(0, 0, 0, 0.03) 0px 4px 24px;
  --shadow-micro: rgba(16, 24, 40, 0.04) 0px 1px 4px;
}

[data-theme='dark'] {
  color-scheme: dark;
  --text-2: #a7a9b8;
  --text-3: #7c7f91;
  --border-soft: #22232a;
  --primary-subtle: rgba(139, 92, 246, 0.2);
  --primary-soft: #1e1a2e;
  --success-soft: rgba(34, 197, 94, 0.18);
  --success-text: #86efac;
  --warning-soft: rgba(245, 158, 11, 0.2);
  --error-soft: rgba(239, 68, 68, 0.2);
  --neutral-soft: rgba(167, 169, 184, 0.14);
  --shadow-whisper: rgba(0, 0, 0, 0.35) 0px 4px 24px;
  --shadow-micro: rgba(0, 0, 0, 0.3) 0px 1px 4px;
}

body {
  font-family:
    'Pretendard Variable',
    Pretendard,
    'IBM Plex Sans',
    -apple-system,
    system-ui,
    sans-serif;
  font-size: 15px;
  line-height: 1.38;
  background: var(--color-base-200);
  color: var(--color-base-content);
  -webkit-font-smoothing: antialiased;
}

@utility text-2 {
  color: var(--text-2);
}
@utility text-3 {
  color: var(--text-3);
}
@utility border-soft {
  border-color: var(--border-soft);
}
@utility bg-primary-subtle {
  background-color: var(--primary-subtle);
}
@utility bg-primary-soft {
  background-color: var(--primary-soft);
}
@utility shadow-whisper {
  box-shadow: var(--shadow-whisper);
}
@utility shadow-micro {
  box-shadow: var(--shadow-micro);
}
@utility btn-subtle {
  background-color: var(--primary-subtle);
  color: var(--color-primary);
  border-color: transparent;
}
@utility btn-subtle:hover {
  background-color: color-mix(in oklab, var(--primary-subtle) 80%, var(--color-primary));
}
```

The custom themes are deliberately named `light` and `dark`: daisyUI lets a custom theme override a built-in of the same name, and the cookie already holds `light`/`dark`, so `<html data-theme={theme}>` selects the theme with no mapping. (The spec calls them `ontime-light`/`ontime-dark`; this plan amends that — same palette, shorter names. The spec is updated in the same commit as this plan.)

- [ ] **Step 2: Update the `eyebrow` utility and the calendar theme**

Change `@utility eyebrow` to:

```css
@utility eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--text-3);
}
```

Rename every `.rdp-dark` selector in the file to `.rdp-theme` (keep the rules; they already use theme vars) and change the range band colour: `--rdp-range_middle-background-color: #000000;` → `--rdp-range_middle-background-color: var(--primary-subtle);`, and in `.rdp-theme .rdp-range_middle .rdp-day_button` set `color: var(--color-base-content)`. Then `grep -rl "rdp-dark" src` and rename the class in the one component that uses it (`src/app/(user)/@modal/(.)schedule/add/_components/AddScheduleModal.tsx` or wherever the grep hits) to `rdp-theme`. Delete the comment line that says "dark theme for schedule 일정 추가 modal".

- [ ] **Step 3: Read the theme cookie in `src/app/layout.tsx`**

Add `import { cookies } from 'next/headers';` and `import { Theme } from '@/shared/providers/theme/ThemeProvider';`. In `RootLayout` before the `return`:

```ts
const cookieStore = await cookies();
const theme = (cookieStore.get('theme')?.value ?? 'light') as Theme;
```

and change `<html lang={htmlLang} data-theme="ontime-dark">` to `<html lang={htmlLang} data-theme={theme}>`. Also change the body wrapper `className="bg-base-100 flex h-screen gap-2 overflow-hidden p-2"` to `className="bg-base-200 flex h-screen overflow-hidden"` and the main wrapper `"to-base-200 flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#1c1c1c]"` to `"flex min-w-0 flex-1 flex-col overflow-hidden"`. (Task 2 replaces this markup again; this step only stops the old gradient from rendering on the new palette.)

- [ ] **Step 4: Create `src/shared/components/theme/ThemeSwitcher.tsx`**

```tsx
'use client';

import { useTransition } from 'react';

import { IoMoonOutline, IoSunnyOutline } from 'react-icons/io5';

import { setTheme } from '@/app/themeAction';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';

interface ThemeSwitcherProps {
  current: Theme;
}

export default function ThemeSwitcher({ current }: ThemeSwitcherProps) {
  // hooks
  const [isPending, startTransition] = useTransition();

  const next: Theme = current === 'dark' ? 'light' : 'dark';

  // handle
  const handleToggle = () => {
    startTransition(async () => {
      await setTheme(next);
    });
  };

  return (
    <button
      type="button"
      aria-label={current === 'dark' ? '라이트 테마로 전환' : '다크 테마로 전환'}
      className={cx(
        'bg-base-100 border-base-300 text-2 hover:text-base-content flex size-9 items-center justify-center rounded-full border transition-colors',
        isPending && 'pointer-events-none opacity-60',
      )}
      onClick={handleToggle}
    >
      {current === 'dark' ? <IoSunnyOutline className="size-[18px]" /> : <IoMoonOutline className="size-[18px]" />}
    </button>
  );
}
```

Check `src/app/themeAction.ts` ends with `revalidatePath('/', 'layout');` after setting the cookie; if it does not (the template version does not), add `import { revalidatePath } from 'next/cache';` and that call so the new `data-theme` renders without a manual reload.

- [ ] **Step 5: Verify**

Run: `yarn prettier && npx tsc --noEmit && yarn lint && yarn build`
Expected: all green. The app renders on the light palette with the old markup (ugly but functional).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: Kraken 디자인 토큰 및 light/dark 테마, 테마 스위처 추가"
```

---

### Task 2: App shell — Sidebar, ClockCard, Header, MobileDock

**Files:**
- Create: `src/app/_layouts/nav.ts`, `src/app/_layouts/Sidebar.tsx`, `src/app/_layouts/ClockCard.tsx`, `src/app/_layouts/MobileDock.tsx`
- Modify: `src/app/_layouts/Header.tsx` (rewrite), `src/app/layout.tsx` (rewrite body)
- Delete: `src/app/_layouts/NavMenu.tsx`, `src/app/_layouts/NowWorkingBar.tsx`
- Modify: `messages/ko.json` (`nav`, `workingBar` namespaces)

**Interfaces:**
- Consumes: `ThemeSwitcher` (Task 1), `useUser()` → `{ user }` with `user.id`, `user.username`, `user.role.type`, `user.groups[0]`, `user.position`; `useProceedingApprovalCount()` → `{ count }`; `useGetAttendanceRecord({ userUniqueId, startDate, endDate })` → `{ attendanceRecords, isLoading }`; `getDuration(from, to)` from `@/utils/parse`.
- Produces: `NAV_GROUPS: NavGroup[]` and `findNavItem(segments: string[]): { group?: NavGroup; item?: NavItem }` from `nav.ts`.

- [ ] **Step 1: i18n keys**

In `messages/ko.json` replace the `nav` object with:

```json
"nav": {
  "home": "홈",
  "groupAttendance": "근태",
  "schedule": "근무 일정",
  "attendanceRecord": "출퇴근 기록",
  "groupApproval": "전자 결재",
  "requestGroup": "신청하기",
  "dayoffRequest": "휴가",
  "overtimeRequest": "휴일근무 보고",
  "dayoffUsed": "휴가 사용 내역",
  "documents": "내 결재 문서",
  "approvals": "처리 대기",
  "groupManage": "관리",
  "managerAttendance": "임직원 근무 현황",
  "managerVacations": "임직원 휴가 현황",
  "qr": "출근 QR",
  "profile": "내 정보",
  "logout": "로그아웃",
  "leader": "팀장"
}
```

Then `grep -rn "t('dashboard')\|nav.dashboard\|'groupManager'\|managerCompensatory" src` — replace `t('dashboard')` (from the `nav` namespace only) with `t('home')` wherever the deleted key was used; other namespaces are untouched. Add to `workingBar`: `"elapsed": "경과", "todayDone": "오늘 근무 완료"`.

- [ ] **Step 2: Write `src/app/_layouts/nav.ts`**

```ts
import type { IconType } from 'react-icons';
import { AiOutlineSchedule } from 'react-icons/ai';
import { FaUsersViewfinder } from 'react-icons/fa6';
import { HiDocumentPlus } from 'react-icons/hi2';
import { IoQrCodeOutline, IoTimeOutline } from 'react-icons/io5';
import { LuHistory } from 'react-icons/lu';
import { MdManageAccounts, MdOutlineApproval, MdOutlineInbox } from 'react-icons/md';
import { RiDashboardFill } from 'react-icons/ri';

export interface NavItem {
  key: string; // i18n key in `nav`
  href: string;
  segments: string[]; // useSelectedLayoutSegments() must include all of these
  icon?: IconType;
  sub?: boolean; // indented child of a group header row
  badge?: 'proceeding'; // show useProceedingApprovalCount()
}

export interface NavGroup {
  key?: string; // i18n key for the group label; undefined = no label
  manager?: boolean; // render only for ROLE_MANAGER / ROLE_ADMIN
  header?: string; // i18n key for a non-link header row (신청하기)
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  { items: [{ key: 'home', href: '/dashboard', segments: ['dashboard'], icon: RiDashboardFill }] },
  {
    key: 'groupAttendance',
    items: [
      { key: 'schedule', href: '/schedule', segments: ['schedule'], icon: AiOutlineSchedule },
      { key: 'attendanceRecord', href: '/attendance/record/gps', segments: ['attendance', 'record'], icon: IoTimeOutline },
    ],
  },
  {
    key: 'groupApproval',
    header: 'requestGroup',
    items: [
      { key: 'dayoffRequest', href: '/dayoff/requests', segments: ['dayoff', 'requests'], sub: true },
      { key: 'overtimeRequest', href: '/overtime/requests', segments: ['overtime', 'requests'], sub: true },
      { key: 'dayoffUsed', href: '/dayoff/used', segments: ['dayoff', 'used'], icon: LuHistory },
      { key: 'documents', href: '/documents', segments: ['documents'], icon: HiDocumentPlus },
      { key: 'approvals', href: '/approvals', segments: ['approvals'], icon: MdOutlineInbox, badge: 'proceeding' },
    ],
  },
  {
    key: 'groupManage',
    manager: true,
    items: [
      { key: 'managerAttendance', href: '/attendance/view', segments: ['attendance', 'view'], icon: FaUsersViewfinder },
      { key: 'managerVacations', href: '/dayoff/users/vacations', segments: ['dayoff', 'users', 'vacations'], icon: MdManageAccounts },
      { key: 'qr', href: '/qr', segments: ['qr'], icon: IoQrCodeOutline },
    ],
  },
];

export const MANAGER_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

export function isActive(segments: string[], item: NavItem) {
  return item.segments.every((s) => segments.includes(s));
}

// 현재 라우트 세그먼트에 해당하는 그룹/아이템 (breadcrumb 용). 가장 많은 세그먼트를 맞춘 아이템이 우선.
export function findNavItem(segments: string[]): { group?: NavGroup; item?: NavItem } {
  let best: { group?: NavGroup; item?: NavItem; score: number } = { score: 0 };

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isActive(segments, item) && item.segments.length > best.score) {
        best = { group, item, score: item.segments.length };
      }
    }
  }

  return { group: best.group, item: best.item };
}
```

(`MdOutlineInbox`, `IoQrCodeOutline`, `IoTimeOutline` exist in react-icons 5; if an icon name fails to resolve, pick the closest from the same pack and note it.)

- [ ] **Step 3: Write `src/app/_layouts/ClockCard.tsx`**

`parseHours` and the state logic are lifted from `NowWorkingBar.tsx` (which is deleted in Step 7).

```tsx
'use client';

// 오늘 근태 기록 → 출근 전 / 근무 중 / 퇴근 완료. 사이드바 카드(ClockCard)와 모바일 dock FAB(ClockFab)가 같은 훅을 쓴다.
import { useEffect, useState } from 'react';

import { IoTimeOutline } from 'react-icons/io5';

import Link from 'next/link';

import { useGetAttendanceRecord } from '@/domain/attendance/queries/attendanceRecord';
import { useUser } from '@/domain/users/queries/user';
import { getDuration } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import padStart from 'lodash/padStart';
import { useTranslations } from 'next-intl';

const ONE_HOUR = 3_600;

function parseHours(seconds: number): string {
  const hours = Math.floor(seconds / ONE_HOUR);
  const min = Math.floor((seconds / 60) % 60);
  return `${hours}h ${padStart(min + '', 2, '0')}m`;
}

function useTodayClock() {
  const t = useTranslations('workingBar');
  const [now, setNow] = useState<Date>(() => new Date());

  const { user } = useUser();
  const today = dayjs().format('YYYY-MM-DD');
  const { attendanceRecords, isLoading } = useGetAttendanceRecord({
    userUniqueId: user?.id || '',
    startDate: today,
    endDate: today,
  });

  const record = attendanceRecords.find((item) => dayjs(item.workingDate).format('YYYY-MM-DD') === today);
  const clockInTime = record?.clockInTime;
  const clockOutTime = record?.clockOutTime;
  const leaveWorkAt = record?.leaveWorkAt;

  const isDone = !!clockInTime && !!clockOutTime;
  const isWorking = !!clockInTime && !clockOutTime;

  // 근무 중일 때만 1분 틱
  useEffect(() => {
    if (!isWorking) return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [isWorking]);

  let label = t('beforeWork');
  let sub: string | undefined;
  let elapsedSeconds = 0;

  if (isWorking) {
    elapsedSeconds = getDuration(clockInTime, now);
    label = t('working', { time: dayjs(clockInTime).format('HH:mm') });
    sub = leaveWorkAt ? t('leaveTarget', { time: dayjs(leaveWorkAt).format('HH:mm') }) : undefined;
  } else if (isDone) {
    label = t('todayDone');
  }

  return {
    ready: !!user && !isLoading,
    isWorking,
    isDone,
    label,
    sub,
    elapsed: isWorking ? parseHours(elapsedSeconds) : isDone ? parseHours(getDuration(clockInTime, clockOutTime)) : '—',
    t,
  };
}

export default function ClockCard() {
  const { ready, isWorking, isDone, label, sub, elapsed, t } = useTodayClock();

  if (!ready) return null;

  return (
    <div className="bg-primary-soft rounded-box mx-4 mb-2 border p-3.5" style={{ borderColor: 'var(--primary-subtle)' }}>
      {/* status */}
      <div className="text-2 flex items-center gap-2 text-xs">
        {isWorking ? (
          <span className="relative flex size-2 flex-none">
            <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-60" />
            <span className="bg-success relative inline-flex size-2 rounded-full" />
          </span>
        ) : (
          <span className="bg-base-300 size-2 flex-none rounded-full" />
        )}
        <span className="truncate">{label}</span>
      </div>

      {/* elapsed */}
      <div className="mt-1 mb-2 text-xl font-bold tracking-tight">{elapsed}</div>
      {sub && <div className="text-3 -mt-1 mb-2 text-xs">{sub}</div>}

      {/* CTA */}
      {!isDone && (
        <Link href="/attendance/record/gps" className="btn btn-primary btn-sm w-full">
          {isWorking ? t('clockOut') : t('clockIn')}
        </Link>
      )}
    </div>
  );
}

// 모바일 dock 가운데 FAB — 같은 상태, 아이콘만
export function ClockFab() {
  const { ready, isWorking, isDone, t } = useTodayClock();

  if (!ready) return null;

  return (
    <Link
      href="/attendance/record/gps"
      aria-label={isWorking ? t('clockOut') : t('clockIn')}
      className={cx(
        'bg-primary text-primary-content border-base-100 -mt-7 flex size-14 items-center justify-center rounded-full border-4 shadow-[0_8px_20px_rgba(113,50,245,0.4)]',
        isDone && 'pointer-events-none opacity-50',
      )}
    >
      <IoTimeOutline className="size-6" />
    </Link>
  );
}
```

- [ ] **Step 4: Write `src/app/_layouts/Sidebar.tsx`**

```tsx
'use client';

import { IoLogOutOutline } from 'react-icons/io5';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import { useProceedingApprovalCount, useUser } from '@/domain/users/queries/user';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

import ClockCard from './ClockCard';
import { MANAGER_ROLES, NAV_GROUPS, NavItem, isActive } from './nav';

export default function Sidebar() {
  // segments
  const segments = useSelectedLayoutSegments();

  // i18n
  const t = useTranslations('nav');

  // query
  const { user } = useUser();
  const { count } = useProceedingApprovalCount();

  const isManager = MANAGER_ROLES.includes(user?.role.type || 'ROLE_USER');
  const initial = user?.username?.substring(0, 1)?.toUpperCase() || '';

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(segments, item);

    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm transition-colors',
          item.sub && 'pl-10 text-[13px]',
          active ? 'bg-primary-subtle text-primary font-semibold' : 'text-2 hover:bg-base-200 hover:text-base-content',
        )}
      >
        {Icon && <Icon className="size-[18px] flex-none" />}
        {t(item.key)}
        {item.badge === 'proceeding' && count > 0 && (
          <span className="bg-primary text-primary-content ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold">
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="bg-base-100 border-base-300 hidden w-[248px] flex-none flex-col border-r select-none md:flex">
      {/* logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 pt-5 pb-3 text-lg font-bold tracking-tight">
        <span className="bg-primary size-3 rounded-full" style={{ boxShadow: '0 0 0 4px var(--primary-subtle)' }} />
        OnTime
      </Link>

      {/* 오늘 출퇴근 상태 */}
      <ClockCard />

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-1">
        {NAV_GROUPS.filter((g) => !g.manager || isManager).map((group, gi) => (
          <div key={group.key ?? gi} className="flex flex-col gap-0.5">
            {group.key && <div className="eyebrow px-3 pt-4 pb-1.5">{t(group.key)}</div>}
            {group.header && (
              <div className="text-2 flex items-center gap-2.5 px-3 py-2 text-sm">
                <span className="text-3 text-lg leading-none">+</span>
                {t(group.header)}
              </div>
            )}
            {group.items.map(renderItem)}
          </div>
        ))}
      </nav>

      {/* user */}
      <div className="border-base-300 flex items-center gap-2.5 border-t px-4 py-3">
        <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="from-primary to-secondary text-primary-content flex size-[34px] flex-none items-center justify-center rounded-full bg-gradient-to-br text-[13px] font-bold">
            {initial}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px] font-semibold">
              {user?.username}
              {user?.groups?.[0]?.isLeader && <span className="text-3 ml-1 font-normal">({t('leader')})</span>}
            </span>
            <span className="text-3 block truncate text-[11px]">
              {[user?.groups?.[0]?.group.name, user?.position?.name || user?.groups?.[0]?.description].filter(Boolean).join(' · ')}
            </span>
          </span>
        </Link>
        <a href="/logout" aria-label={t('logout')} className="text-3 hover:text-base-content p-1">
          <IoLogOutOutline className="size-5" />
        </a>
      </div>
    </aside>
  );
}
```

- [ ] **Step 5: Write `src/app/_layouts/MobileDock.tsx`**

```tsx
'use client';

import { HiDocumentPlus } from 'react-icons/hi2';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { AiOutlineSchedule } from 'react-icons/ai';
import { RiDashboardFill } from 'react-icons/ri';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

import { ClockFab } from './ClockCard';

const ITEMS = [
  { key: 'home', href: '/dashboard', segments: ['dashboard'], icon: RiDashboardFill },
  { key: 'schedule', href: '/schedule', segments: ['schedule'], icon: AiOutlineSchedule },
  null, // FAB slot
  { key: 'approvals', href: '/approvals', segments: ['approvals'], icon: HiDocumentPlus },
  { key: 'profile', href: '/profile', segments: ['profile'], icon: IoPersonCircleOutline },
] as const;

export default function MobileDock() {
  const segments = useSelectedLayoutSegments();
  const t = useTranslations('nav');

  return (
    <nav className="bg-base-100 border-base-300 fixed inset-x-0 bottom-0 z-40 flex h-[72px] items-start justify-around border-t px-1.5 pt-2 md:hidden">
      {ITEMS.map((item, i) =>
        item === null ? (
          <ClockFab key="fab" />
        ) : (
          <Link
            key={item.key}
            href={item.href}
            className={cx(
              'flex w-16 flex-col items-center gap-1 text-[10px]',
              item.segments.every((s) => segments.includes(s)) ? 'text-primary font-semibold' : 'text-3',
            )}
          >
            <item.icon className="size-[22px]" />
            {t(item.key)}
          </Link>
        ),
      )}
    </nav>
  );
}
```

- [ ] **Step 6: Rewrite `src/app/_layouts/Header.tsx`**

Keep the existing notification button (with `NotificationDialog` via `overlay.open`) and the avatar dropdown (프로필 / 로그아웃). Replace the rest:

```tsx
'use client';

import { IoNotificationsOutline, IoLogOutOutline } from 'react-icons/io5';
import { CgProfile } from 'react-icons/cg';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import NotificationDialog from '@/app/_layouts/NotificationDialog';
import { useUser } from '@/domain/users/queries/user';
import ThemeSwitcher from '@/shared/components/theme/ThemeSwitcher';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { useTranslations } from 'next-intl';
import { overlay } from 'overlay-kit';

import { findNavItem } from './nav';

interface HeaderProps {
  theme: Theme;
}

export default function Header({ theme }: HeaderProps) {
  const segments = useSelectedLayoutSegments();
  const t = useTranslations('nav');
  const { user } = useUser();

  const { group, item } = findNavItem(segments);
  const initial = user?.username?.substring(0, 1)?.toUpperCase() || '';

  return (
    <header className="flex h-14 w-full flex-none items-center gap-3 px-7">
      {/* breadcrumb */}
      <div className="text-3 flex items-center gap-1.5 text-[13px]">
        {group?.key && (
          <>
            <span>{t(group.key)}</span>
            <span>›</span>
          </>
        )}
        {item && <span className="text-base-content font-semibold">{t(item.key)}</span>}
      </div>

      <span className="flex-1" />

      {/* notification */}
      <button
        type="button"
        aria-label="알림"
        className="bg-base-100 border-base-300 text-2 hover:text-base-content relative flex size-9 items-center justify-center rounded-full border transition-colors"
        onClick={() => overlay.open(({ isOpen, close }) => <NotificationDialog open={isOpen} onClose={close} />)}
      >
        <IoNotificationsOutline className="size-[18px]" />
      </button>

      <ThemeSwitcher current={theme} />

      {/* avatar dropdown */}
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="from-primary to-secondary text-primary-content flex size-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br text-[13px] font-bold select-none">
          {initial}
        </div>
        <ul tabIndex={0} className="menu dropdown-content bg-base-100 border-base-300 rounded-box shadow-whisper z-[1] mt-2 w-40 border p-2">
          <li><Link href="/profile"><CgProfile className="size-4" />{t('profile')}</Link></li>
          <li><a href="/logout"><IoLogOutOutline className="size-4" />{t('logout')}</a></li>
        </ul>
      </div>
    </header>
  );
}
```

- [ ] **Step 7: Rewrite the body of `src/app/layout.tsx`**

Imports: replace `NavMenu`/`NowWorkingBar` with `Sidebar`, `MobileDock` (relative `./_layouts/...`). JSX inside `ToastProvider`:

```tsx
<div className="bg-base-200 flex h-screen overflow-hidden">
  <Sidebar />
  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    <Header theme={theme} />
    <main className="flex-1 overflow-y-auto px-4 pb-24 md:px-7 md:pb-10">{children}</main>
  </div>
</div>
<MobileDock />
```

Then `git rm src/app/_layouts/NavMenu.tsx src/app/_layouts/NowWorkingBar.tsx`.

- [ ] **Step 8: Verify**

Run: `yarn prettier && npx tsc --noEmit && yarn lint && yarn build`
Expected: green. `grep -rn "NavMenu\|NowWorkingBar" src` → nothing.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: 앱 셸 리디자인 - 사이드바(출퇴근 카드), 브레드크럼 헤더, 모바일 dock"
```

---

### Task 3: Shared primitives

**Files:**
- Modify: `src/shared/components/PageHeader.tsx`, `StatCard.tsx`, `Pagination.tsx`
- Create: `src/shared/components/Badge.tsx`, `src/shared/components/Card.tsx`, `src/shared/components/Segment.tsx`
- Delete: `src/shared/components/PillFilter.tsx` (consumers switch to `Segment`: `DocumentListContents.tsx`, `DocumentApprovalContents.tsx`, and any other `grep -rl PillFilter src`)
- Modify: `src/domain/document/components/DocumentStatusBadge.tsx`, `DocumentTypeBadge.tsx` (render `Badge`)
- Create: `src/domain/approval/components/ApprovalStepper.tsx`

**Interfaces (produces):**
- `PageHeader({ eyebrow?, title, description?, actions? })`
- `StatCard({ label, value, unit?, caption?: ReactNode, ring?: number, children? })`
- `Badge({ variant: 'ok' | 'wait' | 'no' | 'neutral' | 'primary'; children; className? })`
- `Segment<T>({ options: { label: string; value: T }[], value: T, onChange, ariaLabel })` (no `label` prop; callers put a label outside if needed)
- `Card({ className?, children })`, `CardSection({ title, aside?, link?: { href, label }, children? })`
- `Pagination` props unchanged
- `ApprovalStepper({ steps: { id: number; name: string; role: string; status: 'ok' | 'current' | 'pending' | 'rejected'; caption?: string }[] })`

- [ ] **Step 1: `PageHeader.tsx`**

```tsx
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="my-2 mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="mt-0.5 text-[28px] leading-[1.29] font-bold tracking-[-0.5px]">{title}</h1>
        {description && <p className="text-2 mt-1 text-sm">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

Rename the prop at every call site: `grep -rn "subtitle=" src/app | grep PageHeader` → `description=`.

- [ ] **Step 2: `StatCard.tsx`**

```tsx
interface StatCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  caption?: React.ReactNode;
  ring?: number; // 0–100
  children?: React.ReactNode;
}

export default function StatCard({ label, value, unit, caption, ring, children }: StatCardProps) {
  return (
    <div className="bg-base-100 border-base-300 rounded-box shadow-whisper flex items-center gap-3.5 border px-[18px] py-4">
      <div className="min-w-0 flex-1">
        <div className="text-3 text-xs font-medium">{label}</div>
        <div className="mt-0.5 text-[26px] leading-tight font-bold tracking-[-0.5px]">
          {value}
          {unit && <span className="text-2 ml-1 text-[13px] font-medium">{unit}</span>}
        </div>
        {caption && <div className="text-2 mt-1.5 flex items-center gap-1.5 text-xs">{caption}</div>}
        {children}
      </div>
      {ring !== undefined && (
        <div
          className="flex size-14 flex-none items-center justify-center rounded-full"
          style={{ background: `conic-gradient(var(--color-primary) 0 ${ring}%, var(--border-soft) ${ring}% 100%)` }}
        >
          <span className="bg-base-100 flex size-[42px] items-center justify-center rounded-full text-xs font-bold">{ring}%</span>
        </div>
      )}
    </div>
  );
}
```

`grep -rn "highlight" src/app | grep StatCard` — remove the `highlight` prop at call sites (it no longer exists).

- [ ] **Step 3: `Badge.tsx`**

```tsx
import cx from 'classnames';

export type BadgeVariant = 'ok' | 'wait' | 'no' | 'neutral' | 'primary';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const STYLES: Record<BadgeVariant, React.CSSProperties> = {
  ok: { background: 'var(--success-soft)', color: 'var(--success-text)' },
  wait: { background: 'var(--warning-soft)', color: 'var(--color-warning)' },
  no: { background: 'var(--error-soft)', color: 'var(--color-error)' },
  neutral: { background: 'var(--neutral-soft)', color: 'var(--text-2)' },
  primary: { background: 'var(--primary-subtle)', color: 'var(--color-primary)' },
};

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cx('inline-flex items-center gap-1.5 rounded-md px-2 py-[3px] text-xs font-semibold', className)}
      style={STYLES[variant]}
    >
      {children}
    </span>
  );
}
```

`DocumentStatusBadge`: map `DRAFT|CANCELLED → neutral`, `WAITING → wait`, `APPROVED → ok`, `REJECTED → no`, keep the Korean labels, render `<Badge variant={...}>`. `DocumentTypeBadge`: `VACATION → primary`, `OVERTIME_WORK → wait`, keep labels.

- [ ] **Step 4: `Segment.tsx`** (replaces `PillFilter`)

```tsx
'use client';

import cx from 'classnames';

interface SegmentOption<T> {
  label: string;
  value: T;
}

interface SegmentProps<T> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export default function Segment<T>({ options, value, onChange, ariaLabel }: SegmentProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="bg-base-100 border-base-300 inline-flex rounded-[10px] border p-[3px]">
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          aria-pressed={value === opt.value}
          className={cx(
            'rounded-lg px-3 py-1.5 text-[13px] transition-colors',
            value === opt.value ? 'bg-primary-subtle text-primary font-semibold' : 'text-2 hover:text-base-content font-medium',
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

In every consumer: `import Segment from '@/shared/components/Segment'`, drop the `label` prop (put `<span className="text-3 text-xs font-semibold">{label}</span>` before the control only if the page has room and the label adds meaning; the 문서 lists do not need it), and wrap the filter row in `<div className="mb-3.5 flex flex-wrap items-center gap-2">`. Then `git rm src/shared/components/PillFilter.tsx`.

- [ ] **Step 5: `Pagination.tsx`**

Keep `getPaginationPages` and props. Replace `pageBtnClass` and the JSX:

```tsx
const pageBtnClass = (active: boolean, isDisabled: boolean) =>
  cx('flex size-8 items-center justify-center rounded-lg border text-[13px] transition-colors', {
    'border-base-300 bg-base-100 text-3 cursor-not-allowed': isDisabled,
    'border-primary bg-primary text-primary-content font-bold': active && !isDisabled,
    'border-base-300 bg-base-100 text-2 hover:bg-base-200': !active && !isDisabled,
  });

// ...
return (
  <div className="border-base-300 text-2 flex items-center gap-1.5 border-t px-4 py-3 text-[13px]">
    <span>{t('total', { count: total })} · {startItem}–{endItem}</span>
    <span className="flex-1" />
    {/* prev / pages / next as before, with the new pageBtnClass */}
  </div>
);
```

Add `import cx from 'classnames';`. The early `if (totalPages <= 1) return null;` becomes `if (total === 0) return null;` so single-page lists still show the count.

- [ ] **Step 6: `Card.tsx`**

```tsx
import Link from 'next/link';

import cx from 'classnames';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return <div className={cx('bg-base-100 border-base-300 rounded-box shadow-whisper border', className)}>{children}</div>;
}

interface CardSectionProps {
  title: string;
  aside?: React.ReactNode;
  link?: { href: string; label: string };
  children?: React.ReactNode;
}

export function CardSection({ title, aside, link, children }: CardSectionProps) {
  return (
    <div className="border-soft flex items-center gap-2.5 border-b px-[18px] py-4">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {aside}
      <span className="flex-1" />
      {children}
      {link && (
        <Link href={link.href} className="text-primary text-[13px] font-medium">
          {link.label} →
        </Link>
      )}
    </div>
  );
}

export default Card;
```

- [ ] **Step 7: `ApprovalStepper.tsx`**

```tsx
import cx from 'classnames';

export interface ApprovalStep {
  id: number;
  name: string;
  role: string;
  status: 'ok' | 'current' | 'pending' | 'rejected';
  caption?: string;
}

interface ApprovalStepperProps {
  steps: ApprovalStep[];
}

export default function ApprovalStepper({ steps }: ApprovalStepperProps) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.id} className="relative flex gap-3 py-3">
          {i < steps.length - 1 && <span className="absolute top-11 bottom-[-4px] left-[15px] w-0.5" style={{ background: 'var(--border-soft)' }} />}
          <span
            className={cx('z-[1] flex size-8 flex-none items-center justify-center rounded-full border-2 text-xs font-bold', {
              'border-success text-success-content': step.status === 'ok',
              'border-primary bg-primary text-primary-content': step.status === 'current',
              'border-error bg-error text-error-content': step.status === 'rejected',
              'border-base-300 bg-base-100 text-3': step.status === 'pending',
            })}
            style={step.status === 'ok' ? { background: 'var(--success-soft)', color: 'var(--success-text)' } : step.status === 'current' ? { boxShadow: '0 0 0 4px var(--primary-subtle)' } : undefined}
          >
            {step.status === 'ok' ? '✓' : step.status === 'rejected' ? '✕' : i + 1}
          </span>
          <span className="min-w-0">
            {/* 승인자 이름이 없으면(결재선 contents 만 있는 경우) 역할을 제목으로 */}
            <span className="block text-sm font-semibold">{step.name || step.role}</span>
            <span className="text-3 block text-xs">{[step.name ? step.role : undefined, step.caption].filter(Boolean).join(' · ')}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
```

Also add to `src/domain/approval/components/` a pure helper in the same file:

```ts
import { ApprovalHistory } from '@/domain/approval/apis/approval.dto';

// approvalHistories → stepper steps. 첫 미결(status 없음) 항목이 current.
export function toApprovalSteps(histories: ApprovalHistory[], names: (userUniqueId: string) => string): ApprovalStep[] {
  let currentFound = false;

  return histories.map((h) => {
    let status: ApprovalStep['status'] = 'pending';

    if (h.status === 'APPROVED') status = 'ok';
    else if (h.status === 'REJECTED') status = 'rejected';
    else if (!currentFound) {
      status = 'current';
      currentFound = true;
    }

    return {
      id: h.approvalLine.id,
      name: names(h.approvalLine.userUniqueId),
      role: h.approvalLine.contents,
      status,
      caption: h.status === 'REJECTED' ? h.reason : undefined,
    };
  });
}
```

Detail pages (Task 8) pass `names` from the users they already have (`document.user` for the requester; approver names come from `approvalLine.contents` when no user object is available — pass `() => ''` and the stepper shows role only; do not add a users lookup).

- [ ] **Step 8: Verify**

Run: `yarn prettier && npx tsc --noEmit && yarn lint && yarn build`
Expected: green; `grep -rn "PillFilter\|subtitle=\|highlight" src` → nothing relevant.

- [ ] **Step 9: Commit**

```bash
git add -A && git commit -m "feat: 공용 프리미티브 리디자인 (PageHeader/StatCard/Badge/Segment/Pagination/Card/ApprovalStepper)"
```

---

### Task 4: Class-mapping sweep across all pages, modals, and domain components

**Files:** every `.tsx` under `src/app/**/_components`, `src/app/**/page.tsx`, `src/app/{error,not-found,forbidden,loading}.tsx`, `src/app/(user)/@modal/**`, `src/domain/*/components/*.tsx` **except the frozen A4 files**, `src/shared/components/{Dropdown,toast/*,date/*,CardPageTitle}.tsx`.

**Interfaces:** consumes the Task 1 utilities and Task 3 primitives; produces nothing new. Structural rebuilds happen in Tasks 5–9; this task only makes every page look right on the new palette.

- [ ] **Step 1: Apply the mapping** (search each pattern with `grep -rn`; edit by hand — `sed` is fine for the exact-string rows):

| Old | New |
|---|---|
| `bg-base-300 rounded-lg p-5` / `p-6` (card containers) | `bg-base-100 border-base-300 rounded-box shadow-whisper border p-5` (same padding) |
| `bg-base-300` on non-card chips/buttons | `bg-base-200` |
| `rounded-full` on `<button>`, `<a class="btn">`, `.btn` | `rounded-[10px]` (badges handled by `Badge`; avatars keep `rounded-full`) |
| `text-base-content/60`, `/70` | `text-2` |
| `text-base-content/50`, `/40`, `/30` | `text-3` |
| `border-white/10`, `border-white/5`, `border-white/15` | `border-soft` (use `border` + `border-soft`) |
| `bg-white/10`, `bg-white/5`, `bg-[#4d4d4d]` (tracks) | `bg-base-300` |
| `shadow-[0_8px_24px_rgba(0,0,0,0.5)]`, `shadow-[0_8px_8px_rgba(0,0,0,0.3)]` | `shadow-whisper` — **except** the A4 wrapper `div` on `/dayoff/[id]`, `/overtime/[id]`, `/approvals/[id]` which becomes `shadow-[0_8px_32px_rgba(0,0,0,0.08)]` |
| `bg-gradient-to-br from-[#14371f]`, `from-[#1c1c1c] to-base-200` | remove the gradient classes; use the card classes |
| `bg-primary/15 text-primary`, `bg-warning/15 text-warning`, `bg-error/15 text-error`, `bg-info/15 text-info` inline chips | `<Badge variant="primary|wait|no|primary">` |
| `text-[32px]` stat values | `text-[26px]` |
| `.modal-box` containers | add `bg-base-100 border-base-300 rounded-box border` |
| any `#1ed760`, `#121212`, `#181818`, `#1f1f1f`, `rgba(30,215,96,…)` literal | the matching token (`var(--color-primary)`, `bg-base-100/200/300`, `var(--primary-subtle)`) |

- [ ] **Step 2: Inputs and selects**

`.input`, `.select`, `.textarea` daisyUI classes get `bg-base-100 border-base-300` added where the old code passed `bg-base-200`/`bg-base-300`; height stays daisyUI default.

- [ ] **Step 3: Grep for leftovers**

Run: `grep -rnE "#[0-9a-fA-F]{6}|rgba\(|/60|/50|/40|/30|white/|rounded-full" src/app src/domain src/shared --include='*.tsx' | grep -v "VacationDocument.tsx\|OverTimeWorkDocument.tsx\|DocumentApprovalLine.tsx\|UserSignature.tsx"`
Expected: only avatars (`rounded-full` on user initials / `ClockFab`), the ping dots, and the `ApprovalLines`/`ApprovalStepper` circles remain. List anything else in the report with a reason.

- [ ] **Step 4: Verify**

Run: `yarn prettier && npx tsc --noEmit && yarn lint && yarn build`
Expected: green.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "refactor: 전 페이지 Kraken 토큰 클래스 매핑 적용 (구조 변경 없음)"
```

---

### Task 5: Dashboard

**Files:**
- Modify: `src/app/(user)/dashboard/page.tsx`, `_components/WeeklySummaryCards.tsx` (rewrite), `_components/WorkingRecordContents.tsx` (restyle to bar rows)
- Create: `src/app/(user)/dashboard/_components/ProceedingApprovals.tsx`, `_components/QuickActions.tsx`
- Modify: `messages/ko.json` (`dashboard` namespace: add `greeting`, `dateLine`, `statWeekly`, `statWeeklyTarget`, `statToday`, `statTodayCaption`, `statLeave`, `statLeaveCaption`, `statProceeding`, `sectionWeek`, `sectionProceeding`, `sectionQuick`, `viewAll`, `approve`, `view`, `quickDayoff`, `quickDayoffSub`, `quickOvertime`, `quickOvertimeSub`, `quickSchedule`, `quickScheduleSub`, `quickDocuments`, `quickDocumentsSub`, `actionDayoff`, `actionOvertime`)

**Interfaces:** consumes `useUser`, `useUserLeaveEntry(year)`, `useProceedingApprovalCount`, `useApprovalHistories({ userUniqueId, status: 'WAITING', page: 0, size: 3 })` (needs the `sub` from `authClient.useSession()` exactly as `useProceedingApprovalCount` does — copy that 3-line pattern), `useApproveDocument`, `useGetAttendanceRecord` + `WorkingTimeProvider` (existing), `StatCard`, `Card`, `CardSection`, `Badge`.

- [ ] **Step 1: `page.tsx`**

```tsx
export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const user = await getUserinfo(); // from '@/shared/auth/serverAction'

  return (
    <div className="animate-fade-up w-full">
      <WorkingTimeProvider>
        <PageHeader
          title={t('greeting', { name: user?.name ?? '' })}
          description={t('dateLine', { date: dayjs().format('M월 D일 dddd') })}
          actions={
            <>
              <Link href="/dayoff/requests" className="btn btn-outline btn-secondary">{t('actionDayoff')}</Link>
              <Link href="/overtime/requests" className="btn btn-primary">{t('actionOvertime')}</Link>
            </>
          }
        />
        <WeeklySummaryCards />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <WorkingRecordContents />
          <div className="flex flex-col gap-4">
            <ProceedingApprovals />
            <QuickActions />
          </div>
        </div>
      </WorkingTimeProvider>
    </div>
  );
}
```

(`dayjs` locale `ko` must be loaded for `dddd`; import `@/shared/dayjs` — the template's configured instance — instead of raw `dayjs` here.) `WorkingTimeView` (week navigator) moves into `WorkingRecordContents`' `CardSection` `children`.

- [ ] **Step 2: `WeeklySummaryCards.tsx`** — keep `calcCumulativeHours` and the data hooks; render four `StatCard`s in `grid grid-cols-2 gap-4 lg:grid-cols-4`:

1. `label=t('statWeekly')`, `value={cumulativeHours}h`, `unit="/ 40h"`, `caption={<Badge variant={isOnTrack ? 'ok' : 'wait'}>{isOnTrack ? t('statusOnTrack') : t('statusBehind')}</Badge>}`.
2. `label=t('statToday')`, value = today's elapsed (reuse today's record from `attendanceRecords` for `dayjs().format('YYYY-MM-DD')`; show `parseHours` of clockIn→now or clockIn→clockOut; `—` if none), caption `t('statTodayCaption', { in: HH:mm, out: leaveWorkAt HH:mm })`.
3. `label=t('statLeave')`, `value={remaining}` where `remaining = (leaveEntry?.totalLeaveDays ?? 0) - (leaveEntry?.usedLeaveDays ?? 0)`, `unit="일"`, `ring={total ? Math.round(remaining / total * 100) : 0}`, caption `t('statLeaveCaption', { comp: overtimeBalanceHours / 8 })`.
4. `label=t('statProceeding')`, `value={count}`, `unit="건"`.

- [ ] **Step 3: `WorkingRecordContents.tsx`** — wrap in `<Card>` with `<CardSection title={t('sectionWeek')} link={{ href: '/schedule', label: t('viewAll') }}><WorkingTimeView /></CardSection>`. Replace the table rows with bar rows: for each day of the selected week render

```tsx
<div className="hover:bg-base-200 flex items-center gap-3 rounded-[10px] px-2.5 py-2.5">
  <div className="w-16 text-[13px] font-semibold">{요일}<span className="text-3 block text-[11px] font-normal">{MM/DD}</span></div>
  <div className="bg-base-300 relative h-2 flex-1 overflow-hidden rounded-full">
    <div className={cx('absolute inset-y-0 left-0 rounded-full', over8h ? 'bg-warning' : 'bg-primary')} style={{ width: `${percent}%` }} />
  </div>
  <div className="w-16 text-right text-[13px] font-semibold tabular-nums">{duration}</div>
  <div className="text-3 w-[110px] text-right text-xs">{HH:mm – HH:mm | 근무 중 | <Badge variant="primary">연차</Badge>}</div>
</div>
```

keeping the existing per-day computation (category, clock in/out, duration) from the current file; `percent = min(duration / 8h, 1) * 100`. Days off keep their `Badge` (연차/반차/휴일) in the last column and an empty bar.

- [ ] **Step 4: `ProceedingApprovals.tsx`**

```tsx
'use client';
// 내가 처리할 결재 상위 3건 — 보기(상세 링크) / 승인(인라인)
export default function ProceedingApprovals() {
  const t = useTranslations('dashboard');
  const { data: session } = authClient.useSession();
  const sub = session?.user.sub;
  const { page } = useApprovalHistories({ userUniqueId: sub, status: 'WAITING', page: 0, size: 3 });
  const { count } = useProceedingApprovalCount();
  const { approve, isLoading } = useApproveDocument();

  return (
    <Card>
      <CardSection title={t('sectionProceeding')} aside={<Badge variant="primary">{count}</Badge>} link={{ href: '/approvals', label: t('viewAll') }} />
      <div className="p-2">
        {(page?.content ?? []).map((h) => (
          <div key={h.id} className="hover:bg-base-200 flex items-center gap-3 rounded-[10px] px-2.5 py-3">
            <span className="bg-base-200 border-base-300 text-2 flex size-[34px] flex-none items-center justify-center rounded-full border text-xs font-bold">{h.document.user.username.substring(0, 1)}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{h.document.user.username} · <DocumentTypeBadge type={h.document.type} /></div>
              <div className="text-3 text-xs">{dayjs(h.createdDate).fromNow()} 요청</div>
            </div>
            <Link href={`/approvals/${h.id}`} className="btn btn-ghost btn-sm">{t('view')}</Link>
            <button type="button" className="btn btn-subtle btn-sm" disabled={isLoading} onClick={() => approve({ id: h.id! })}>{t('approve')}</button>
          </div>
        ))}
        {page && page.content.length === 0 && <p className="text-3 px-3 py-6 text-center text-sm">처리할 결재가 없어요</p>}
      </div>
    </Card>
  );
}
```

`dayjs.fromNow` needs the `relativeTime` plugin → import `dayjs` from `@/shared/dayjs`. `useApproveDocument` already invalidates `['documents']`; also invalidate `['documents','approval','proceeding']` is covered by that prefix.

- [ ] **Step 5: `QuickActions.tsx`** — `<Card><CardSection title={t('sectionQuick')} /><div className="grid grid-cols-2 gap-2.5 p-4">` with four `<Link>` tiles (`/dayoff/requests`, `/overtime/requests`, `/schedule/add`, `/documents`), each `className="bg-base-200 border-base-300 hover:bg-primary-soft hover:border-secondary flex flex-col items-start gap-2 rounded-box border p-3.5 text-left transition-colors"` with an icon in a `bg-primary-subtle text-primary size-8 rounded-[10px]` box, a `text-sm font-semibold` title and a `text-3 text-xs` sub line from the i18n keys.

- [ ] **Step 6: Verify** — `yarn prettier && npx tsc --noEmit && yarn lint && yarn build` green.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: 대시보드 리디자인 - 인사/4 스탯/주간 바 차트/처리할 결재/빠른 신청"
```

---

### Task 6: Lists — 내 결재 문서, 처리 대기, 휴가 사용 내역

**Files:**
- Modify: `src/app/(user)/documents/page.tsx`, `_components/DocumentListContents.tsx`, `_components/DocumentResult.tsx`
- Modify: `src/app/(user)/approvals/page.tsx`, `_components/DocumentApprovalContents.tsx`, `_components/DocumentApprovalResult.tsx`
- Modify: `src/app/(user)/dayoff/used/page.tsx`, `_components/DayOffHistoryContents.tsx`
- Modify: `messages/ko.json` (`documents`, `approvals`, `dayoff` namespaces as needed: `description`, `colDocument`, `colRequester`, `colPeriod`, `colStatus`, `colAction`, `empty`)

**Interfaces:** consumes `Segment`, `Badge`, `Card`, `Pagination`, `DocumentStatusBadge`, `DocumentTypeBadge`, existing hooks and modals (`ApproveModal`, `RejectModal` from `approvals/[id]/_components` may be imported for inline actions; if importing across page folders violates `structure.md`, move those two modals to `src/domain/document/components/` in this task and update both import sites).

- [ ] **Step 1: Common list shape** for all three pages:

```tsx
<PageHeader title=... description=... />
<div className="mb-3.5 flex flex-wrap items-center gap-2">
  <Segment options={statusOptions} value={selectedStatus} onChange={handleStatusChange} ariaLabel=... />
  <Segment options={typeOptions} value={selectedType} onChange={handleTypeChange} ariaLabel=... />
</div>
<Card>
  <table className="w-full text-sm">
    <thead><tr>{/* th: text-3 text-xs font-semibold text-left px-4 py-3 border-b border-base-300 */}</tr></thead>
    <tbody>{/* tr: cursor-pointer hover:bg-base-200; td: px-4 py-3.5 border-b border-soft; last row no border */}</tbody>
  </table>
  <Pagination ... />
</Card>
```

- [ ] **Step 2: `/documents`** — columns 문서 (title line: `DocumentTypeBadge` + short description if the item has one; sub line `text-3 text-xs`: 신청일), 상태 (`DocumentStatusBadge`), 기간/일수 (vacation: start–end; overtime: count of times), 처리 (`상신` button for DRAFT → existing `useRequestDocument`; `취소` for WAITING → existing `useCancelDocument`; both `btn btn-sm btn-ghost`). Row click → the existing detail route (`/dayoff/{documentId}` or `/overtime/{documentId}`) as `DocumentResult` does today. Status segment: 전체 / 초안 / 진행 / 승인 / 반려 (values as today).

- [ ] **Step 3: `/approvals`** — first segment shows the WAITING count: `{ label: \`${t('statusWaiting')} ${count}\`, value: 'WAITING' }` using `useProceedingApprovalCount`; columns 문서 / 신청자 (username + `text-3` team) / 기간 / 상태 (`Badge variant="wait"` "내 결재 대기" when `h.status === 'WAITING'`, else `DocumentStatusBadge`) / 처리 (inline `반려` ghost + `승인` primary `btn-sm`, opening the existing modals with the history id; hidden unless WAITING). Row click → `/approvals/{h.id}`.

- [ ] **Step 4: `/dayoff/used`** — year `Segment` (existing `selectedYear` state; options = current year and the two previous), stat header via three `StatCard`s (총 연차 / 사용 / 잔여 from `useUserLeaveEntry(selectedYear)`), then the table (종류 badge, 기간, 일수, 상태, 사유) with the existing data.

- [ ] **Step 5: Verify** — green build; both themes.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: 결재 문서/처리 대기/휴가 사용 내역 목록 리디자인 (세그먼트 필터, 테이블, 인라인 처리)"
```

---

### Task 7: Forms — 휴가 신청, 휴일근무 보고

**Files:**
- Modify: `src/app/(user)/dayoff/requests/page.tsx`, `_components/DayOffRequestContents.tsx` (rewrite layout, keep state/validation/submit), `_components/UserLeaveEntryContents.tsx` (delete; its stats move into the summary card), `_components/SelectUserCompLeaveEntriesModal.tsx` (restyle only)
- Modify: `src/app/(user)/overtime/requests/page.tsx`, `_components/OvertimeRequestContents.tsx` (same layout), `_components/SelectUserModal.tsx` (restyle only)
- Modify: `messages/ko.json` (`dayoff.request.*`, `overtime.request.*`: `step1`, `step1Desc`, `step2`, `step2Desc`, `step3`, `summaryTitle`, `summaryType`, `summaryPeriod`, `summaryUsed`, `summaryRemaining`, `submit`, `draft`)

**Interfaces:** consumes `Card`, `ApprovalStepper` (steps derived from the user's team 결재선 are **not** available before submit — render the stepper only if the page already has line data; otherwise omit it from the summary card and note it), `useUserLeaveEntry`, `useUserCompLeaveEntries`, `useCreateVacation`, `useCreateOverTimeWorkDocument`.

- [ ] **Step 1: Layout for both forms**

```tsx
<PageHeader title=... description=... />
<div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
  <Card>
    <section className="border-soft border-b px-[22px] py-5">
      <h3 className="flex items-center gap-2.5 text-[15px] font-semibold"><span className="bg-primary text-primary-content inline-flex size-[22px] items-center justify-center rounded-full text-xs">1</span>{t('step1')}</h3>
      <p className="text-2 mt-1 mb-3.5 text-[13px]">{t('step1Desc')}</p>
      {/* chips: <button className={cx('flex items-center gap-2 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium', selected ? 'border-primary bg-primary-soft text-primary font-semibold' : 'border-base-300 bg-base-100 text-2')}>연차 <small className="text-3 font-normal">7.5일 남음</small></button> */}
    </section>
    <section ...>2 기간 — two date inputs in `grid grid-cols-2 gap-3`, hint line `text-3 text-xs pt-3`: "✓ N일 사용"</section>
    <section ...>3 사유 — textarea</section>
  </Card>
  <Card className="p-5 lg:sticky lg:top-0">
    <h3 className="text-[15px] font-semibold">{t('summaryTitle')}</h3>
    {/* kv rows: flex justify-between py-2.5 border-b border-soft text-sm */}
    <div className="flex items-baseline justify-between pt-3.5 pb-1 text-sm">{t('summaryRemaining')}<b className="text-primary text-[22px] font-bold">{remainingAfter}일</b></div>
    <button className="btn btn-primary mt-3.5 w-full" onClick={submit} disabled={!valid || isLoading}>{t('submit')}</button>
  </Card>
</div>
```

- [ ] **Step 2: 휴가 신청** — chips = 연차 (`remaining` from `useUserLeaveEntry`), 오전 반차, 오후 반차, 보상휴가 (remaining from comp entries; selecting opens the existing `SelectUserCompLeaveEntriesModal`), 공가 — mapping to the existing `vacationType`/`vacationSubType` state. `usedDays` and `remainingAfter` reuse the existing calculation in the file. Keep the existing submit handler and toasts.

- [ ] **Step 3: 휴일근무 보고** — step 1 인원 (existing `SelectUserModal` trigger + selected chips), step 2 근무 시간 (existing inline datetime rows table, restyled: header `text-3 text-xs`, rows `border-soft`), step 3 내용; summary card lists 인원 수 / 총 시간 and the submit button.

- [ ] **Step 4: Verify** — green build.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: 휴가 신청/휴일근무 보고 폼 리디자인 (3단계 + 고정 요약 카드)"
```

---

### Task 8: Detail pages — 결재 상세, 휴가/휴일근무 문서

**Files:**
- Modify: `src/app/(user)/approvals/[id]/page.tsx`, `_components/ApprovalProceedContents.tsx` (rewrite as the right panel), `_components/{ApproveModal,RejectModal,CancelConfirmModal}.tsx` (restyle only)
- Modify: `src/app/(user)/dayoff/[id]/page.tsx`, `_components/DayOffDetailContents.tsx`, `_components/{PressApprovalModal,RequestConfirmModal}.tsx`
- Modify: `src/app/(user)/overtime/[id]/page.tsx`, `_components/OvertimeWorkDocumentContents.tsx`
- Delete: `src/domain/approval/components/ApprovalLines.tsx` (replaced by `ApprovalStepper`)

**Interfaces:** consumes `ApprovalStepper`, `toApprovalSteps`, `Card`, `Badge`; the A4 components are rendered exactly as today (same `id` props, same `aspect-[1/1.414] w-[1000px]` wrapper, white background) — **only the wrapper's shadow class changes** (Task 4 rule).

- [ ] **Step 1: Two-column layout on all three pages**

```tsx
<PageHeader eyebrow={breadcrumb-like eyebrow, e.g. "처리 대기"} title={문서 제목} description={`${requester} · ${type label} · ${dayjs(createdDate).format('YYYY-MM-DD')} 상신`} actions={pdf button if the page has one today} />
<div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px] xl:items-start">
  <div className="overflow-x-auto">
    <div className="aspect-[1/1.414] w-[1000px] shadow-[0_8px_32px_rgba(0,0,0,0.08)]">{/* A4 component unchanged */}</div>
  </div>
  <div className="flex flex-col gap-4 xl:sticky xl:top-0">
    <Card className="p-5"><h3 className="mb-2.5 text-[15px] font-semibold">결재 진행</h3><ApprovalStepper steps={steps} /></Card>
    <Card className="p-5">{/* actions */}</Card>
  </div>
</div>
```

`steps = toApprovalSteps(document.approvalHistories, () => '')` prefixed with the requester step `{ id: 0, name: document.user.username, role: '상신', status: 'ok', caption: dayjs(document.createdDate).format('MM/DD HH:mm') }`.

- [ ] **Step 2: `/approvals/[id]` actions card** — 의견 textarea (`.textarea w-full`) + row `<button className="btn btn-error btn-soft flex-1">반려</button><button className="btn btn-primary flex-[2]">승인</button>` opening the existing modals; `CancelConfirmModal` trigger stays as a ghost button below when the current user is the requester (existing condition). If daisyUI 5 has no `btn-soft` in this version, use `style={{ background: 'var(--error-soft)', color: 'var(--color-error)' }}` on a `btn btn-ghost`.

- [ ] **Step 3: `/dayoff/[id]`, `/overtime/[id]` actions card** — the existing 상신 / 취소 / 결재 재촉(`PressApprovalModal`) buttons, same conditions, `btn-primary` / `btn-ghost` / `btn-subtle`.

- [ ] **Step 4:** `git rm src/domain/approval/components/ApprovalLines.tsx`; `grep -rn ApprovalLines src` → nothing.

- [ ] **Step 5: Verify** — green build; confirm the PDF capture (`html2canvas-pro` target ids) still points at the A4 `id`s.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: 결재 상세/휴가/휴일근무 문서 페이지 2단 레이아웃 + 결재 진행 스테퍼"
```

---

### Task 9: Remaining pages — schedule, profile, attendance record, manager pages, QR, error pages

**Files:**
- Modify: `src/app/(user)/schedule/page.tsx`, `_components/{ScheduleContents,AddScheduleButton}.tsx`, `src/app/(user)/@modal/(.)schedule/add/_components/AddScheduleModal.tsx`, `src/app/(user)/schedule/add/page.tsx`
- Modify: `src/app/(user)/profile/page.tsx`, `_components/*.tsx`
- Modify: `src/app/(user)/attendance/record/gps/_components/AttendanceRecordGpsContents.tsx`, `.../[checkId]/_components/AttendanceRecordContents.tsx`
- Modify: `src/app/(manager)/attendance/view/_components/AllEmployeesGrid.tsx`, `src/app/(manager)/dayoff/users/vacations/_components/{DayOffManageContents,DayOffViewContents}.tsx`, `src/app/(manager)/qr/_components/QRContents.tsx`
- Modify: `src/app/{error,not-found,forbidden,loading}.tsx`, `src/app/(user)/error.tsx`, `src/app/(manager)/error.tsx`, `src/shared/components/CardPageTitle.tsx`

**Interfaces:** consumes `PageHeader`, `Card`, `CardSection`, `Segment`, `StatCard`, `Badge`; no data changes.

- [ ] **Step 1: schedule** — `PageHeader` with `actions={<AddScheduleButton />}` (`btn btn-primary`); calendar/timeline inside `<Card className="p-4">`; `AddScheduleModal` uses `.rdp-theme` (Task 1) and `modal-box` card classes; day-off type choices become chips (same markup as Task 7 step 1 chips).
- [ ] **Step 2: profile** — two cards in `grid gap-4 lg:grid-cols-2`: `CardSection title="개인 정보"` + `PersonalInfoContents` (avatar with `btn btn-subtle btn-sm` upload trigger), and a card with `UpdateUserSignatureContents` + `UpdatePasswordContents` separated by `border-soft`. Modals restyled.
- [ ] **Step 3: attendance record (GPS / checkId)** — centered `<Card className="mx-auto w-full max-w-[520px] p-6">`; primary CTA `btn btn-primary btn-block`; status via `Badge` (`ok` SUCCESS, `wait` WAITING, `no` WARNING).
- [ ] **Step 4: manager** — `AllEmployeesGrid` inside `<Card>` with a sticky `thead` (`sticky top-0 bg-base-100`) and `Badge`s; `DayOffManageContents` year `Segment` + matrix in `<Card className="overflow-x-auto">` with sticky first column (`sticky left-0 bg-base-100`), comp values `text-2`; `QRContents` centered card, refresh `btn btn-outline btn-secondary`.
- [ ] **Step 5: error / 404 / 403 / loading** — content unchanged; `CardPageTitle` uses `bg-base-100 border-base-300 rounded-box border`; the big numerals use `text-3`; 돌아가기 links `btn btn-primary`.
- [ ] **Step 6: Verify** — green build; every route in `find src/app -name page.tsx` opened once in each theme by the controller.
- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: 근무 일정/프로필/근태 처리/관리자/QR/에러 페이지 리디자인"
```

---

### Task 10: Docs

**Files:**
- Modify: `docs/agents/libs/tailwind-daisyui.md`, `docs/agents/libs/theme.md`, `docs/design/README.md`, `docs/agents/structure.md` (`_layouts/` list)

- [ ] **Step 1:** `tailwind-daisyui.md` — document the two themes (names, `data-theme` mapping in `layout.tsx`), the token utilities (`text-2`, `text-3`, `border-soft`, `bg-primary-subtle`, `bg-primary-soft`, `shadow-whisper`, `shadow-micro`, `btn-subtle`, `eyebrow`), the "no hex literals outside globals.css" and "buttons ≤ 12px radius, badges 6px with text" rules, and the frozen A4 components.
- [ ] **Step 2:** `theme.md` — confirm it describes the `theme` cookie + `setTheme` + `ThemeSwitcher` flow with `revalidatePath`; adjust if it still mentions `prefers-color-scheme`.
- [ ] **Step 3:** `docs/design/README.md` — fix the link text (`kraken-design.md` currently links to `spotify-design.md`) and add one line: "적용 결과: `docs/superpowers/specs/2026-09-18-ui-redesign-kraken-design.md`".
- [ ] **Step 4:** `structure.md` — in the `_layouts/` example list `Sidebar.tsx`, `ClockCard.tsx`, `Header.tsx`, `MobileDock.tsx`, `nav.ts`.
- [ ] **Step 5: Verify** — `yarn lint && yarn build` green.
- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "docs: Kraken 테마/토큰 유틸리티/셸 구조 문서 갱신"
```
