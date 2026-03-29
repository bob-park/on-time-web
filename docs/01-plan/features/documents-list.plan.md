# Feature Plan: documents-list

- **Feature**: documents-list
- **Pages**: `/documents`, `/approvals`
- **Date**: 2026-03-29
- **Phase**: Plan

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| 문제 | `/documents`, `/approvals` 페이지가 DaisyUI 카드 중첩 구조와 `«/»` 페이지네이션으로 정보 밀도가 낮고 UI가 노후화됨 |
| 해결 | `docs/documents-list.png` 디자인 기반으로 pill 필터 + structured table + 숫자 페이지네이션으로 재설계 |
| 기능 UX 효과 | 필터 한눈에 인식, 테이블로 항목 스캔 용이, 페이지 이동 직관성 향상 |
| 핵심 가치 | 결재 목록의 가독성과 조작 편의성 개선으로 업무 처리 속도 향상 |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| WHY | 기존 UI는 카드 중첩 + DaisyUI filter 버튼으로 정보 파악이 느리고 디자인이 통일되지 않음 |
| WHO | 자신의 결재 신청 목록을 조회하는 사용자(/documents), 결재를 처리하는 관리자(/approvals) |
| RISK | 두 페이지에 동일한 구조 적용 시 각 컴포넌트 간 타입 차이 주의 (Document vs ApprovalHistory) |
| SUCCESS | PNG 디자인과 시각적으로 일치, yarn build 통과 |
| SCOPE | 4개 파일 수정 (DocumentListContents, DocumentResult, DocumentApprovalContents, DocumentApprovalResult) |

---

## 1. 개요

`/documents`와 `/approvals` 페이지의 contents UI를 `docs/documents-list.png` 디자인에 맞게 재설계한다.
기존 DaisyUI 카드 중첩 구조를 제거하고, pill 버튼 필터 + structured table + 숫자 페이지네이션으로 교체한다.
이미지 하단의 요약 카드(REMAINING LEAVE, APPROVED THIS MONTH, AWAITING REVIEW)는 이번 작업 범위에서 제외한다.

---

## 2. 요구사항

### §2.1 필터 UI 재설계 (두 페이지 공통)

**기존**: DaisyUI card 안의 `filter` form + input[type=radio]
**변경**: 카드 없이 인라인 pill 버튼 두 줄

- **CATEGORY 줄**: `전체` | `휴가계` | `휴일근무보고서`
  - 전체(All)는 type 파라미터 없음 (undefined)
- **STATUS 줄**: `전체` | `초안` | `진행` | `승인` | `반려`
  - `/approvals`는 취소(CANCELLED) 제외 — 동일하게 `전체` | `진행` | `승인` | `반려`

**Pill 스타일 (확정):**
```
active:   bg-slate-800 text-white rounded-full px-3.5 py-1.5 text-[13px] font-medium
inactive: bg-slate-100 text-slate-600 rounded-full px-3.5 py-1.5 text-[13px] font-medium
hover:    hover:bg-slate-200 (inactive only)
pill gap: gap-2 (between pills in a row)
```

**필터 레이블 스타일 (확정):**
```
w-[72px] text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-none
```

**필터 섹션 레이아웃:**
```
<div role="group" aria-label="문서 구분 필터">  ← 접근성: 필터 그룹화
  <div className="flex flex-col gap-2.5">        ← 두 줄 사이 간격
    <div className="flex items-center gap-2">    ← 구분 줄
    <div className="flex items-center gap-2">    ← 상태 줄
```
필터 섹션과 테이블 사이: `pb-4 mb-5 border-b border-slate-100`

**섹션 컨테이너:** 필터+테이블+페이지네이션 전체를 단일 카드로 감싼다:
```
rounded-2xl border border-slate-200 bg-white p-5 shadow-sm
```
(기존 dayoff-history 카드 패턴과 동일)

### §2.2 테이블 재설계

**기존**: flex-row 리스트 + `rounded-2xl hover:bg-base-300`
**변경**: CSS grid 기반 structured table (border-b 구분선)

**`/documents` 테이블 컬럼 (5개):**

| 컬럼 | 데이터 | 너비 |
|------|--------|------|
| 문서번호 | document.id | w-32 |
| 구분 | DocumentsTypeBadge | w-28 |
| 상태 | DocumentStatusBadge | w-28 |
| 요청일 | dayjs(createdDate).format('MMM DD, YYYY') | flex-1 |
| Actions | 상세 이동 버튼(···) | w-16 |

**`/approvals` 테이블 컬럼 (6개):**

| 컬럼 | 데이터 | 너비 |
|------|--------|------|
| 문서번호 | item.id | w-32 |
| 구분 | DocumentsTypeBadge | w-28 |
| 상태 | DocumentStatusBadge | w-28 |
| 신청자 | username + position.name | w-36 |
| 요청일 | dayjs(createdDate).format('MMM DD, YYYY') | flex-1 |
| Actions | 상세 이동 버튼(···) | w-16 |

**테이블 스타일 (확정):**
```
헤더 행:   bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-[0.06em] h-10 border-b border-slate-200
데이터 행: h-[52px] border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors duration-100
문서번호:  font-semibold text-slate-500 text-[13px]
요청일:    text-slate-500 text-[13px]
신청자 이름: text-[13px] text-slate-800
신청자 직책: text-[11px] text-slate-400
```

**행 클릭 접근성 (확정):**
```tsx
<tr
  onClick={handleClick}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  aria-label={`문서 ${document.id} 상세 보기`}
>
```

**··· 버튼 접근성 (확정):**
```tsx
<button aria-label="문서 상세 보기" className="...">···</button>
```

### §2.3 페이지네이션 재설계

**기존**: `«/»` 버튼 join
**변경**: 숫자 버튼 + 이전/다음 화살표

**총 건수 텍스트:** `총 Z건 중 X~Y건 표시` (text-[13px] text-slate-500)

**버튼 스타일 (확정):**
```
base:     min-w-[32px] h-8 rounded-md text-[13px] border border-slate-200 bg-white text-slate-600
active:   bg-slate-800 text-white border-slate-800
hover:    hover:bg-slate-50 (inactive only)
disabled: text-slate-300 cursor-not-allowed border-slate-100
```

**페이지 윈도우 (확정):** 최대 5개 숫자 버튼 동시 표시
```
totalPages ≤ 5:  전체 표시, 말줄임표 없음
totalPages > 5:  [1] [...] [cur-1] [cur] [cur+1] [...] [last]
  - 1페이지일 때: [1] [2] [3] [...] [last]
  - 마지막 페이지: [1] [...] [last-2] [last-1] [last]
```

**단일 페이지 처리 (확정):** `totalPages <= 1`이면 페이지네이션 영역 전체 숨김 (disabled 버튼 표시 없음)

### §2.4 하단 카드 UI

- 이번 작업 범위 **제외** (사용자 요청)

### §2.5 페이지 헤더 (page.tsx 수정 포함)

두 page.tsx 파일에 subtitle 한 줄 추가. 기존 `h2 text-2xl font-bold` 아래:
```tsx
<p className="mt-1 text-[14px] text-slate-500">결재 신청 내역을 조회하고 상태를 확인합니다</p>
```
- `/documents` subtitle: `결재 신청 내역을 조회하고 상태를 확인합니다`
- `/approvals` subtitle: `결재 요청 목록을 조회하고 처리합니다`

> Note: page.tsx 수정이므로 변경 파일 목록에 2개 추가 (§4 참조).

### §2.6 UI 상태 명세 (확정)

| 상태 | 사용자가 보는 것 |
|------|----------------|
| **로딩** | 테이블 헤더 유지, 5개 skeleton 행. 각 셀은 실제 컬럼 크기에 맞는 placeholder (ID: `w-14 h-3.5 rounded`, 구분/상태: `w-16 h-5 rounded-full`, 요청일: `w-24 h-3.5 rounded`, ···: `w-7 h-7 rounded-md`). 행마다 너비를 ±10% 변화. `animate-pulse` 적용. |
| **빈 결과** | 테이블 없음. 중앙 정렬: `HiOutlineDocumentText` 아이콘 (react-icons/hi, `size-10 text-slate-300`) + `결재 문서가 없습니다` (text-[15px] font-semibold text-slate-500 mt-3) + `조건에 맞는 문서가 없습니다` (text-[13px] text-slate-400 mt-1). CTA 없음. |
| **오류** | 테이블 헤더 유지. 단일 colspan 행: `데이터를 불러오는 중 오류가 발생했습니다. 새로고침해 주세요.` (text-[13px] text-red-500 text-center py-5). |
| **단일 페이지** | totalPages ≤ 1이면 페이지네이션 영역 전체 숨김. |

---

## 3. 기술 스택 및 의존성

- 신규 패키지 설치 없음
- 기존: `dayjs`, `react-icons`, Tailwind CSS, TanStack Query
- 기존 `DocumentStatusBadge`, `DocumentsTypeBadge` 컴포넌트 그대로 활용

---

## 4. 변경 파일

| 파일 | 변경 유형 |
|------|---------|
| `src/app/(user)/documents/_components/DocumentListContents.tsx` | 수정 (필터+페이지네이션 재설계) |
| `src/app/(user)/documents/_components/DocumentResult.tsx` | 수정 (테이블 재설계) |
| `src/app/(user)/approvals/_components/DocumentApprovalContents.tsx` | 수정 (필터+페이지네이션 재설계) |
| `src/app/(user)/approvals/_components/DocumentApprovalResult.tsx` | 수정 (테이블 재설계) |
| `src/app/(user)/documents/page.tsx` | 수정 (subtitle 추가) |
| `src/app/(user)/approvals/page.tsx` | 수정 (subtitle 추가) |

신규 생성 파일 없음.

---

## 5. 성공 기준

1. PNG 디자인과 시각적으로 일치 (pill 필터 2줄 / structured table / 숫자 페이지네이션)
2. CATEGORY 필터: 전체/휴가계/휴일근무보고서 pill 버튼이 동작함
3. STATUS 필터: 상태 pill 버튼이 동작함
4. 테이블 행 클릭 시 기존 라우팅 동작 유지
5. `/documents`, `/approvals` 두 페이지 모두 적용
6. `yarn build` 통과 (TypeScript 에러 없음)

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Outside Voice | Codex | Independent plan challenge | 1 | issues_found | 7 findings, 5 fixed |
| Eng Review | `/gstack-plan-eng-review` | Architecture & tests (required) | 1 | CLEAR | 4 issues, 2 critical gaps |
| Design Review | `/gstack-plan-design-review` | UI/UX gaps | 1 | CLEAR | 9 gaps resolved |

**CRITICAL GAPS FIXED BEFORE IMPLEMENTATION:**
1. `isLoading` must be wired to skeleton rows in both Contents components
2. Korean dayjs locale (`import 'dayjs/locale/ko'`) must be loaded for date display

**ARCHITECTURE DECISIONS LOCKED:**
- Filter state: client-only (no URL sync). Both pages align.
- Page size: 10 per page both pages.
- Date format: `dayjs(date).locale('ko').format('YYYY년 MM월 DD일')`
- Date filters (createdDateFrom/createdDateTo): dropped from /approvals initial state
- CANCELLED rows on /approvals: visible in list, no filter pill (accepted)
- `···` button: keep alongside row click as visual affordance

**DESIGN DECISIONS LOCKED (from /gstack-plan-design-review):**
- Pill: `rounded-full px-3.5 py-1.5 text-[13px] font-medium`, gap-2 between pills
- Filter label: `w-[72px] text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex-none`
- Section container: `rounded-2xl border border-slate-200 bg-white p-5 shadow-sm` (single card for filter+table)
- Page subtitles: added to both page.tsx files (§2.5)
- Empty state: `HiOutlineDocumentText` size-10 text-slate-300, no CTA
- Skeleton: column-width-matched placeholders, badge-shape for type/status cols
- Pagination window: max 5 buttons, ellipsis pattern locked (§2.3)
- Single page: hide pagination entirely when totalPages ≤ 1
- Accessibility: `aria-pressed` on pills, `role=group` on filter sections, `aria-label` on ··· button, `role=button + tabIndex + onKeyDown` on table rows

**KNOWN DESIGN DEBT:**
- Back-nav resets filter state (client-state tradeoff, accepted)
- No DESIGN.md in repo — design system implicit, not documented

**VERDICT:** ENG + DESIGN CLEARED — ready to implement.
