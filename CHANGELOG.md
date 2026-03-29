# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
