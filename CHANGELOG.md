# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.3.0] - 2026-04-02

### Added
- Profile (`/profile`): modern white card UI redesign matching dashboard/documents/dayoff design language. Explicit avatar and signature change buttons replace hidden hover-only discovery. Password confirmation field with inline mismatch indicator prevents typo-lockouts. Skeleton loading state while user data loads. Signature fallback for users without uploaded signatures.
- Profile: new `profile` size variant (96px) for UserAvatar component with scaled fallback text.

### Changed
- Profile: error messages changed from placeholder jokes to professional Korean copy ("패스워드 변경에 실패했습니다", "아바타 변경에 실패했습니다").
- Profile: modal cancel button text "안할까?" → "취소", upload text translated to Korean.
- Profile: signature error state resets on modal close so re-uploaded signatures display immediately.

### Fixed
- Profile: signature image 404 now shows "서명이 등록되지 않았습니다" placeholder instead of broken image icon.

## [0.1.2.1] - 2026-03-31

### Added
- Dashboard (`/dashboard`): 목표 퇴근 시간 (target clock-out) column between clock-in and clock-out — the field was already in the data but never rendered.

### Changed
- Attendance view (`/attendance/view`): Firefox scrollbar eliminated — grid now fills the available space without triggering a second scrollbar in Firefox.
- Attendance view: table header and column names aligned to center; "이번 주" footer label corrected to "해당 주" (accurate for any selected week); "저번 주" button renamed to "지난 주".
- Attendance grid: WARNING status cells now highlight red on all days including today (previously today suppressed the warning color).
- Attendance grid: `users` and `dates` arrays wrapped in `useMemo` to prevent index drift during 60-second polling refetch cycles.
- Attendance grid: error state added — if the employee list fails to load, a clear error message is shown instead of an empty grid.
- Attendance grid: `lastUpdatedAt` timestamp now excludes errored queries from the max calculation.
- Manager vacation view (`/dayoff/users/vacations`): fixed broken table layout caused by invalid `x-max` Tailwind class — restored to `w-max`.

## [0.1.2.0] - 2026-03-31

### Added
- Attendance view (`/attendance/view`): all-employees 7-day grid — managers can now see every employee's weekly attendance on one screen without selecting individuals one by one. Rows = employees, columns = days, cells show clock-in/out times with color-coded status.
- Attendance grid: 1-minute auto-refresh with last-updated timestamp so managers always see current data without reloading.
- Attendance grid: per-cell loading shimmer, sticky employee column, WARNING cells highlighted in red, today's column highlighted in blue, day-off badges (연차/오전반차/오후반차).

### Changed
- Next.js 16 proxy migration: `src/middleware.ts` → `src/proxy.ts` with exported function renamed to `proxy` per Next.js 16 naming convention.
- Attendance view page simplified: removed single-employee dropdown selector; all employees load automatically.

### Removed
- `SelectUsers` dropdown and `SelectUserContextProvider` from attendance view — no longer needed.

## [0.1.1.0] - 2026-03-29

### Added
- Dashboard: weekly summary cards component with attendance stats
- Overtime requests: inline datetime entry (hour/minute selectors) replacing the modal — faster entry for multi-person batch submissions
- Overtime requests: add-row table for work time entries with delete capability
- dayoff/users/vacations (manager): card header with year navigation, sticky employee/month columns in `<table>` layout

### Changed
- Layout: new NavMenu with slate-800 sidebar, icon + label nav items, active state indicator
- Header: streamlined with search, notifications, and profile actions
- Dashboard: `WorkingRecordContents` redesigned — weekly table with work duration bar, category badges, clock-in/out display
- Documents list: pill filters (category + status), table layout with status badges and pagination
- Approval history list: pill filters, table layout, inline pagination — removed URL-state sync (local state only)
- dayoff/requests: pill filters, table layout, sticky columns for request entry
- dayoff/used (history): redesigned table with usage stats header
- dayoff/users/vacations: rewritten as proper `<table>` with `<tr>`/`<td>` — deleted `DayOffViewHeader.tsx`, `DayOffViewContents.tsx` is now a `<tr>` component
- Overnight overtime entries now correctly roll end date to next day when end time < start time

### Fixed
- Pagination ellipsis no longer shown between consecutive page numbers (ISSUE-001)
- Dashboard redirect fix
- Overnight overtime regression: end timestamp now advances to next calendar day for cross-midnight shifts

### Removed
- `SelectDatetimeModal.tsx` — replaced by inline time entry in overtime request form
- `DayOffViewHeader.tsx` — header inlined into `DayOffManageContents.tsx`
