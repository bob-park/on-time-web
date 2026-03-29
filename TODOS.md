# TODOS

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

## WorkingRecordContents — Missing 퇴근 예정 시간 column
**What:** `WorkingRecordRow` receives `leaveWorkAt` in its props interface and the parent passes it, but `leaveWorkAt` is not rendered anywhere in the new table row. The expected clock-out time is silently gone from the weekly dashboard.
**Why:** Users rely on this to know when they can leave. Removing it without replacement is a regression disguised as a UI cleanup.
**Priority:** P1
**Found by:** adversarial review (0.1.1.0, 2026-03-29)
**Depends on / blocked by:** None. Add the column back to `WorkingRecordContents.tsx`.

---

## DayOffViewContents — Duplicate 사용가능/연차 columns
**What:** Both the "연차" and "사용가능" columns in the manager vacation view (`DayOffViewContents.tsx`) render the same `<DualValue value={user.leaveEntry.totalLeaveDays} ...>`. The "전년차감" column is hardcoded to `0`. So "사용가능" is meaningless — it just repeats the total.
**Why:** Managers use this page to see actual available leave. When 사용가능 equals 연차(total), the column adds no information and actively misleads when prior-year deductions exist.
**Priority:** P2
**Found by:** adversarial review (0.1.1.0, 2026-03-29)
**Depends on / blocked by:** Backend needs to expose `previousYearDeducted` in `UserLeaveEntry`, or the frontend needs to compute `totalLeaveDays - previousYearDeducted`.

---

## Completed

