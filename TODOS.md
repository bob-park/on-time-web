# TODOS

## Batch Attendance API — AllEmployeesGrid
**What:** Replace the per-employee `useQueries` fan-out in `AllEmployeesGrid` with a single batch endpoint `GET /api/attendance/records?userIds=...&startDate=...&endDate=...`.
**Why:** Current implementation fires one request per employee every 60 seconds. With 100 employees that's 100 simultaneous requests per minute — fine for now, but will become a backend bottleneck as headcount grows.
**Priority:** P2
**Found by:** /gstack-review adversarial pass (2026-03-31, feature/attendances-dashboard)
**Depends on / blocked by:** Backend batch endpoint (verify existence before planning). Frontend change is a one-query swap once the endpoint exists.

---

## Audit Trail — Document Activity Timeline
**What:** Add an activity timeline panel on the document detail page showing: who requested, who approved/rejected, when, and the reason for rejection.
**Why:** Turns the app into a system of record, not just a list view. When disputes happen (payroll, labor audits), users need to see the full history of a document. This is what makes the app sticky.
**Pros:** High differentiation vs. paper-based alternatives. Directly addresses the "no audit trail" pain that motivated building the product.
**Cons:** Requires a backend endpoint for document activity history (existence unconfirmed). Could expand scope significantly depending on API availability.
**Context:** Identified during /gstack-office-hours session 2026-03-29 as "Approach B" to the documents-list redesign. Deferred in favor of UI-only sprint (Approach A). Next natural sprint after documents-list ships.
**Depends on / blocked by:** Backend API for document activity history. Verify endpoint before planning the sprint.

---

## Date Range Filter UI — /approvals
**What:** Add a date range picker to the /approvals filter row for `createdDateFrom` and `createdDateTo` parameters.
**Why:** The API already supports date range filtering. The UI doesn't expose it. HR managers often need to review approvals for a specific period (e.g., "show me everything from last month"). Currently invisible capability.
**Pros:** Unlocks existing API functionality. High value for HR managers doing period-based reviews.
**Cons:** Adds complexity to the filter row. Date range pickers are tricky on mobile. Need to decide on a component (inline pickers, a modal, or free-text inputs).
**Context:** `createdDateFrom` and `createdDateTo` were dropped from initial state in the documents-list sprint (2026-03-29) because there's no UI to show or clear them. The params exist in the type definition (`SearchDocumentApprovalHistoryRequest`) and the API.
**Depends on / blocked by:** None. Pure frontend work once a date picker approach is decided.

---

## URL State Hydration — /documents list
**What:** The `params` prop passed to `DocumentListContents` is currently ignored. Opening `/documents?page=2&status=APPROVED` always loads page 1 with no filters.
**Why:** Deep links, browser back/refresh, and bookmarks don't restore the expected view. This is a regression from the pre-redesign behavior.
**Priority:** P1
**Deferred from plan:** hwpark-feature-modern-ui-v2-design-20260329-174323.md (shipped 0.1.1.0, 2026-03-29)
**Depends on / blocked by:** None. Read `params` into initial useState values and wire URL sync back up.

---

## URL State Hydration — /approvals list
**What:** Same issue as /documents — `DocumentApprovalContents` ignores its `params` prop. `/approvals?type=VACATION&status=APPROVED` always loads with blank filters.
**Why:** Same regression — shared links, bookmarks, refresh all lose filter state.
**Priority:** P1
**Deferred from plan:** hwpark-feature-modern-ui-v2-design-20260329-174323.md (shipped 0.1.1.0, 2026-03-29)
**Depends on / blocked by:** None. Same fix pattern as /documents.

---

## DayOffHistoryContents — size:1000 client-side aggregation
**What:** `DayOffHistoryContents.tsx` fetches `size: 1000` to compute `totalUsedDays` via `.reduce()` on the client. Should be server-side aggregation or a dedicated totals endpoint.
**Why:** An employee with many leave records sends a 1000-item API response on every year switch. Memory pressure grows with tenure. Correct fix: backend returns aggregated totals in the same endpoint, not a synthetic oversized page.
**Priority:** P1
**Found by:** adversarial review (0.1.1.0, 2026-03-29)
**Depends on / blocked by:** Backend API change to return totals alongside paginated results.

---

## DayOffViewContents — Duplicate 사용가능/연차 columns
**What:** Both the "연차" and "사용가능" columns in the manager vacation view (`DayOffViewContents.tsx`) render the same `<DualValue value={user.leaveEntry.totalLeaveDays} ...>`. The "전년차감" column is hardcoded to `0`. So "사용가능" is meaningless — it just repeats the total.
**Why:** Managers use this page to see actual available leave. When 사용가능 equals 연차(total), the column adds no information and actively misleads when prior-year deductions exist.
**Priority:** P2
**Found by:** adversarial review (0.1.1.0, 2026-03-29)
**Depends on / blocked by:** Backend needs to expose `previousYearDeducted` in `UserLeaveEntry`, or the frontend needs to compute `totalLeaveDays - previousYearDeducted`.

---

## OvertimeRequestContents — Zero-duration entry accepted
**What:** `startHour`, `startMinutes`, `endHour`, `endMinutes` all default to `0`. No guard against submitting an entry where start === end, creating a 0-minute work record.
**Why:** A user who never touches the time selectors adds a zero-duration entry that passes all validation. The API may silently accept it.
**Priority:** P1
**Fix:** Add `if (startHour === endHour && startMinutes === endMinutes) { push warning; return; }` in `handleAddWorkTime`.
**Found by:** adversarial review (0.1.1.0, 2026-03-29)
**Depends on / blocked by:** None.

---

## OvertimeRequestContents — Whitespace username bypasses validation
**What:** Free-text username input sets `username` to `e.target.value || undefined`. A string of spaces is truthy, so `"   "` passes the `!username` check and gets sent to the API.
**Why:** API receives a whitespace-only name — silent bad data.
**Priority:** P1
**Fix:** Trim in onChange: `e.target.value.trim() || undefined`.
**Found by:** adversarial review (0.1.1.0, 2026-03-29)
**Depends on / blocked by:** None.

---

## getPaginationPages — Duplicate page 0 when totalPages=3
**What:** When `totalPages=3` and `currentPage=1` (tail branch fires), the function returns `[0, '...', 0, 1, 2]` — page 0 appears twice. `totalPages-3=0` is pushed alongside the leading `0`.
**Why:** Two buttons both point to page 0. One of them is always active-styled. Confusing and broken.
**Priority:** P1
**Fix:** The tail branch should only push `'...'` when `totalPages-3 > 1`; otherwise fall through to the `<=5` rendering path. Applies to all 3 copies of `getPaginationPages` (documents, approvals, dayoff).
**Found by:** adversarial review (0.1.1.0, 2026-03-29)
**Depends on / blocked by:** None.

---

## DayOffRequestContents — Half-day subtype with multi-day range shows wrong balance
**What:** `usedDays = isHalfDay ? 0.5 : businessDays`. If the user picks AM_HALF_DAY_OFF but selects a multi-day calendar range, the summary shows 0.5 days consumed while the server counts the full range.
**Why:** User thinks they're using 0.5 days but the server will deduct more. Silent overconsumption.
**Priority:** P1
**Fix:** When `isHalfDay`, clamp `selectedDate.to = selectedDate.from` (single-day only), or show a warning when a multi-day range is selected with a half-day subtype.
**Found by:** adversarial review (0.1.1.0, 2026-03-29)
**Depends on / blocked by:** None.

---

## DayOffRequestContents — COMPENSATORY submit without comp-leave entries
**What:** `handleRequestClick` only checks `!selectedVacationType || !selectedVacationSubType || !reason`. When `COMPENSATORY` is selected but no comp-leave entries are chosen, the form submits with an empty `usedCompLeaveEntries` array.
**Why:** Silent or confusing failure at the API level. User expects their comp balance to be consumed but nothing is allocated.
**Priority:** P1
**Fix:** Add `if (selectedVacationType === 'COMPENSATORY' && usedCompLeaveEntries.length === 0) { push warning; return; }`.
**Found by:** adversarial review (0.1.1.0, 2026-03-29)
**Depends on / blocked by:** None.

---

## Completed

### WorkingRecordContents — Missing 퇴근 예정 시간 column
**What:** `WorkingRecordRow` receives `leaveWorkAt` in its props interface and the parent passes it, but `leaveWorkAt` was not rendered in the table row.
**Completed:** v0.1.2.1 (2026-03-31)

