# Plan: dayoff-requests

- **Feature**: dayoff-requests
- **Date**: 2026-03-28
- **Phase**: Plan

---

## Executive Summary

| 항목 | 내용 |
|------|------|
| **Feature** | dayoff-requests |
| **Started** | 2026-03-28 |
| **Status** | Plan |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 현재 `/dayoff/requests` 페이지는 단순 폼 스타일로, 잔여 휴가 현황과 신청 폼이 분리되어 있고 레이아웃이 직관적이지 않음 |
| **Solution** | `docs/request-dayoff.png` 기준으로 상단 잔여일수 카드 4개 + 2컬럼 레이아웃(좌: 휴가 구분 선택, 우: 달력) + 하단 신청 요약 패널로 재구성 |
| **Function UX Effect** | 잔여 휴가를 한눈에 확인하면서 날짜를 선택하고 신청까지 한 화면에서 완료할 수 있는 모던 휴가 신청 경험 |
| **Core Value** | `request-dayoff.png`와 동일한 모던 HR 휴가 신청 UI 구현 |

---

## Context Anchor

| | 내용 |
|---|------|
| **WHY** | 이미지(request-dayoff.png) 기준으로 `/dayoff/requests` 페이지의 콘텐츠 UI를 전면 개선 |
| **WHO** | 일반 사용자 (휴가 신청 및 잔여 일수 확인) |
| **RISK** | DayPicker, VacationType/SubType 상태 로직은 기존 유지 필요 / `createVacation` API 호출 로직 변경 없이 레이아웃만 변경 |
| **SUCCESS** | request-dayoff.png의 레이아웃과 시각적으로 동일한 페이지 구현, 빌드 에러 없음 |
| **SCOPE** | page.tsx, DayOffRequestContents.tsx, UserLeaveEntryContents.tsx |

---

## 1. 배경 및 목적

`docs/request-dayoff.png`를 기준으로 `/dayoff/requests` 페이지의 contents UI를 전면 재설계한다.

---

## 2. 요구사항

### 2.1 페이지 헤더 영역

- [ ] 브레드크럼: `Executive > 휴가 신청` (작은 회색 텍스트)
- [ ] 제목: `휴가 신청` + 영문 서브타이틀 `Leave Request`
- [ ] 우측 상단: `View History` 버튼 → `/dayoff/used` 링크

### 2.2 상단 잔여일수 카드 (4개)

이미지 기준 4개 수치 카드 (가로 나열):

| 카드 | 내용 | 스타일 |
|------|------|--------|
| 총 연차 | `leaveEntry.totalDays` 또는 유사 필드 | 기본 흰 카드 |
| 사용 연차 | `leaveEntry.usedDays` | 기본 흰 카드 |
| 잔여 연차 | `leaveEntry.remainingDays` | **강조 카드** (dark navy bg) |
| 보상 휴가 잔여 | `compLeaveEntries` 합산 | 기본 흰 카드 |

- [ ] 4개 카드 가로 배치 (`flex flex-row gap-4`)
- [ ] 각 카드: 수치(숫자 + Days) + 라벨 텍스트
- [ ] 잔여 연차 카드는 어두운 배경(강조) 스타일

> **참고**: `currentUser.leaveEntry` 의 필드명은 `UserLeaveEntry` 컴포넌트에서 확인 후 맞춤

### 2.3 2컬럼 레이아웃

```
[ 좌측: 휴가 구분 설정 (w-80~96) ] [ 우측: 날짜 선택 달력 (flex-1) ]
```

#### 좌측 — 휴가 구분 설정

- [ ] 섹션 타이틀: `휴가 구분 Settings`
- [ ] 휴가 타입 선택 (라디오 카드 형태):
  - 연차 구분 (`GENERAL`) — 카드 선택 UI (현재 선택 시 dark navy 배경)
  - 반일 휴가 (`GENERAL` + 반차 subtype) — 또는 별도 옵션
  - 보상 휴가 (`COMPENSATORY`)
  - 기존 DaisyUI `filter` 버튼 대신 **세로 나열 라디오 카드** 형태로 변경
- [ ] 부가 구분(subtype) 선택:
  - 종일 / 오전 반차 / 오후 반차
  - 현재 선택한 타입에 따라 표시 여부 결정 (기존 로직 유지)
- [ ] 보상 휴가 선택 버튼 (`COMPENSATORY` 선택 시에만 표시 — 기존 로직 유지)
- [ ] 사유 입력 필드 (기존 유지)

#### 우측 — 날짜 선택

- [ ] 섹션 타이틀: `날짜 선택 Select Dates`
- [ ] 월/연도 헤더 + 이전/다음 월 네비게이션
- [ ] DayPicker 달력 (기존 `react-day-picker` 유지, 스타일 커스텀)
- [ ] 선택된 날짜 범위 표시

### 2.4 하단 신청 요약 패널

- [ ] 패널 타이틀: `신청 요약 Summary`
- [ ] 표시 항목:
  - `선택 날짜 Selected Dates`: `YYYY.MM.DD - YYYY.MM.DD`
  - `사용 기간 Total Duration`: 계산된 일수 (영업일 기준 또는 단순 일수)
  - `사용 후 잔여 Remaining After Use`: 잔여 연차 - 사용 일수
  - `승인 예상 Approval Time`: `→ Immediate` (고정 텍스트 또는 실제 로직)
- [ ] 액션 버튼 3개:
  - `초안 생성 (Create Draft)` — 기존 `createVacation` 호출 (dark navy 버튼)
  - `취소 (Cancel)` — 폼 초기화 또는 이전 페이지

> **참고**: `DRAFT AUTO SAVE` 텍스트는 이미지에 보이지만 실제 기능 없으면 생략 가능

---

## 3. 범위

### 수정 파일

| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `src/app/(user)/dayoff/requests/page.tsx` | 수정 | 레이아웃 구조 전면 재구성, 브레드크럼, 헤더 |
| `src/app/(user)/dayoff/requests/_components/DayOffRequestContents.tsx` | 수정 | 2컬럼 레이아웃, 타입 선택 카드 UI, 하단 요약 패널 |
| `src/app/(user)/dayoff/requests/_components/UserLeaveEntryContents.tsx` | 수정 | 4개 가로 카드 형태로 변경 |

### 불변 항목
- `createVacation` API 호출 로직 및 파라미터
- `VacationType`, `VacationSubType` 상태 관리 로직
- `SelectUserCompLeaveEntriesModal` 컴포넌트
- `react-day-picker` 라이브러리 (스타일만 변경)
- 라우팅 및 인증

---

## 4. 성공 기준

- [ ] `request-dayoff.png`의 레이아웃과 시각적으로 동일
- [ ] 상단 4개 잔여일수 카드 정상 표시 (실제 API 데이터 연동)
- [ ] 2컬럼 레이아웃: 좌측 휴가 구분 + 우측 달력
- [ ] 하단 요약 패널: 선택 날짜 / 사용 기간 / 잔여일수 표시
- [ ] 기존 `createVacation` 제출 기능 정상 동작
- [ ] 빌드 에러 없음

---

## 5. 구현 우선순위

1. `page.tsx` — 레이아웃 골격 + 브레드크럼 + 헤더
2. `UserLeaveEntryContents.tsx` — 4개 잔여일수 카드
3. `DayOffRequestContents.tsx` — 2컬럼 + 타입 선택 카드 + 하단 요약 패널
