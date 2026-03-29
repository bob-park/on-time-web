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
