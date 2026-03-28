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
  - 선택된 버튼: `bg-slate-800 text-white`, 미선택: `bg-gray-100 text-gray-600`
  - 전체(All)는 type 파라미터 없음 (undefined)
- **STATUS 줄**: `전체` | `초안` | `진행` | `승인` | `반려`
  - `/approvals`는 취소(CANCELLED) 제외 — 동일하게 `전체` | `진행` | `승인` | `반려`
  - 선택된 버튼: `bg-slate-800 text-white`, 미선택: `bg-gray-100 text-gray-600`

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

**테이블 스타일:**
- 헤더: `bg-gray-50 text-gray-500 text-sm font-medium uppercase tracking-wide`
- 행 hover: `hover:bg-gray-50`
- 구분선: `border-b border-gray-200`
- 행 클릭 시 기존 라우팅 유지

### §2.3 페이지네이션 재설계

**기존**: `«/»` 버튼 join
**변경**: 숫자 버튼 + 이전/다음 화살표

- 표시 형식: `< 1 2 3 ... N >`
- 현재 페이지: `bg-slate-800 text-white rounded`
- 비활성 버튼: `text-gray-400 cursor-not-allowed`
- 총 건수 텍스트: `Showing X to Y of Z entries` → 한글: `총 Z건 중 X~Y건 표시`

### §2.4 하단 카드 UI

- 이번 작업 범위 **제외** (사용자 요청)

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

신규 생성 파일 없음.

---

## 5. 성공 기준

1. PNG 디자인과 시각적으로 일치 (pill 필터 2줄 / structured table / 숫자 페이지네이션)
2. CATEGORY 필터: 전체/휴가계/휴일근무보고서 pill 버튼이 동작함
3. STATUS 필터: 상태 pill 버튼이 동작함
4. 테이블 행 클릭 시 기존 라우팅 동작 유지
5. `/documents`, `/approvals` 두 페이지 모두 적용
6. `yarn build` 통과 (TypeScript 에러 없음)
