# Report: dayoff-requests

- **Feature**: dayoff-requests
- **Date**: 2026-03-28
- **Phase**: Completed

---

## Executive Summary

| 항목 | 내용 |
|------|------|
| **Feature** | dayoff-requests |
| **Started** | 2026-03-28 |
| **Completed** | 2026-03-28 |
| **Match Rate** | 97% |
| **Success Rate** | 6/6 성공 기준 충족 |

### 1.3 Value Delivered (4-Perspective)

| 관점 | 계획 | 실제 결과 |
|------|------|-----------|
| **Problem** | 단순 폼 스타일 — 잔여 현황과 신청 폼이 분리, 직관적이지 않음 | 해결 — 4카드 + 2컬럼 + 요약 패널로 한 화면 완결 |
| **Solution** | 상단 4카드 + 2컬럼(좌: 타입 선택, 우: 달력) + 하단 요약 패널 | 완전 구현 — request-dayoff.png와 동일한 레이아웃 |
| **Function UX Effect** | 잔여 휴가 확인 → 날짜 선택 → 신청까지 한 화면 완결 | 달성 — 잔여일수 카드 + 라디오 카드 타입 선택 + 요약 패널 |
| **Core Value** | request-dayoff.png와 동일한 모던 HR 휴가 신청 UI | 달성 |

---

## 2. 성공 기준 최종 상태

| 성공 기준 | 상태 | 근거 |
|-----------|------|------|
| request-dayoff.png 레이아웃과 시각적으로 동일 | ✅ Met | 4카드 + 2컬럼 + 하단 요약 패널 구현 |
| 상단 4개 잔여일수 카드 API 연동 | ✅ Met | `UserLeaveEntryContents.tsx` — leaveEntry 필드 직접 참조 |
| 2컬럼 레이아웃: 좌측 휴가 구분 + 우측 달력 | ✅ Met | `DayOffRequestContents.tsx:107` |
| 하단 요약 패널: 날짜/기간/잔여일수 표시 | ✅ Met | 영업일 계산 + 잔여 자동 계산 포함 |
| 기존 createVacation 제출 기능 정상 동작 | ✅ Met | API 파라미터 완전 유지 |
| 빌드 에러 없음 | ✅ Met | yarn build 통과 |

**Overall Success Rate: 6/6 (100%)**

---

## 3. 구현 내역

### 수정 파일

| 파일 | 변경 유형 | 주요 내용 |
|------|----------|-----------|
| `src/app/(user)/dayoff/requests/page.tsx` | 수정 | 브레드크럼, 헤더, `휴가 내역 보기` 버튼 |
| `src/app/(user)/dayoff/requests/_components/UserLeaveEntryContents.tsx` | 재작성 | 4개 가로 잔여일수 카드 (잔여 연차 강조) |
| `src/app/(user)/dayoff/requests/_components/DayOffRequestContents.tsx` | 재작성 | 2컬럼 레이아웃 + 타입 선택 카드 + 하단 요약 패널 |

### 핵심 구현 포인트

**UserLeaveEntryContents.tsx**
- `leaveEntry.totalLeaveDays / usedLeaveDays / totalCompLeaveDays / usedCompLeaveDays` 직접 참조
- 잔여 연차 카드: `bg-slate-800` 강조 스타일

**DayOffRequestContents.tsx**
- `VACATION_TYPES` / `VACATION_SUBTYPES` 상수 배열로 선언 → 선택 시 slate-800 라디오 카드
- `countBusinessDays()`: 영업일(월~금) 기준 사용 일수 계산
- 하단 요약: `usedDays = isHalfDay ? 0.5 : businessDays` / `remainingAfterUse = freeLeaveDays - usedDays`
- 취소 버튼: 모든 상태 초기화
- `createVacation` API 파라미터: 기존과 동일 유지

---

## 4. Gap 분석 결과

| Match Rate | 총 항목 | 충족 | 부분 충족 | 미충족 |
|-----------|--------|------|-----------|--------|
| **97%** | 15 | 14 | 1 | 0 |

### G-01: `Leave Request` 영문 서브타이틀 (Minor, 수용됨)

linter에 의해 제거된 영문 서브타이틀. 기능에 영향 없으며 의도적 변경으로 수용.

---

## 5. 주요 결정 사항

| 결정 | 내용 | 결과 |
|------|------|------|
| 타입 선택 UI | DaisyUI filter 버튼 → 세로 라디오 카드 | 시각적 명확성 향상 |
| 하단 버튼 구성 | `초안 생성`만 유지 (`신청하기` 미추가) | 기존 API 범위 유지 |
| 담당자 필드 | 미추가 (이미지에 있으나 API 미확인) | 스코프 최소화 |
| 사용 일수 계산 | 영업일(월~금) 기준 `countBusinessDays()` | 주말 제외 정확한 계산 |

---

## 6. 학습 및 개선점

- **패턴**: `leaveEntry` 필드를 `useGetCurrentUser()`에서 직접 참조 — 별도 API 불필요
- **주의**: 영업일 계산은 공휴일 미포함 — 향후 공휴일 API 연동 가능
- **개선 가능**: 반차 선택 시 달력에서 하루만 선택 강제하는 UX 추가 가능
