# Report: dashboard

- **Feature**: dashboard
- **Date**: 2026-03-28
- **Phase**: Completed

---

## Executive Summary

| 항목 | 내용 |
|------|------|
| **Feature** | dashboard |
| **Started** | 2026-03-28 |
| **Completed** | 2026-03-28 |
| **Match Rate** | 97% |
| **Success Rate** | 6/6 성공 기준 충족 |

### 1.3 Value Delivered (4-Perspective)

| 관점 | 계획 | 실제 결과 |
|------|------|-----------|
| **Problem** | 단순 텍스트 목록 + 바차트 형태로 핵심 지표가 직관적으로 보이지 않음 | 해결 — 카드 기반 UI로 즉시 파악 가능한 대시보드 구현 |
| **Solution** | Weekly Progress 카드 + Overtime Balance 카드 상단 배치, 테이블 재설계 | 완전 구현 — 2개 카드 + 6컬럼 테이블 + 날짜 네비 |
| **Function UX Effect** | 주간 근무 진척도와 보상휴가 잔여를 한 눈에 파악, 날짜 네비 개선 | 달성 — 진척도 바, 보상휴가 시간, 오늘 행 강조, 주간 이동 |
| **Core Value** | new-layout.png와 동일한 모던 HR 대시보드 콘텐츠 레이아웃 | 달성 — 시각적으로 동일한 레이아웃 구현 |

---

## 2. 성공 기준 최종 상태

| 성공 기준 | 상태 | 근거 |
|-----------|------|------|
| 이미지(new-layout.png)와 시각적으로 동일 | ✅ Met | 브레드크럼, 카드, 6컬럼 테이블 모두 구현 |
| Weekly Progress 카드: 실제 근무시간 데이터 정상 표시 | ✅ Met | `WeeklySummaryCards.tsx` — attendanceRecord 연동, 누적시간 계산 |
| Overtime Balance 카드: getUserCompLeaveEntries API 연동 | ✅ Met | `useUserCompLeaveEntries()` 훅, `(leaveDays - usedDays) * 8h` 계산 |
| 테이블 6개 컬럼 정상 렌더링 | ✅ Met | DATE/CATEGORY/CLOCK-IN/CLOCK-OUT/DURATION/STATUS |
| 오늘 날짜 행 강조 표시 | ✅ Met | `bg-blue-50` + `근무 중...` 텍스트 |
| 빌드 에러 없음 | ✅ Met | `yarn build` 통과 확인 |

**Overall Success Rate: 6/6 (100%)**

---

## 3. 구현 내역

### 생성/수정 파일

| 파일 | 변경 유형 | 주요 내용 |
|------|----------|-----------|
| `src/app/(user)/dashboard/page.tsx` | 수정 | 브레드크럼 추가, WorkingTimeProvider 래핑, 레이아웃 조합 |
| `src/domain/attendance/components/WorkingTimeView.tsx` | 수정 | 아이콘 버튼 + `오늘` 버튼, 날짜 범위 표시 (`YYYY.MM.DD – MM.DD`) |
| `src/app/(user)/dashboard/_componets/WorkingRecordContents.tsx` | 재작성 | 6컬럼 테이블, 카테고리 뱃지, 상태 dot, 주간 이동 버튼 |
| `src/app/(user)/dashboard/_componets/WeeklySummaryCards.tsx` | 신규 | Weekly Progress + Overtime Balance 카드 |

### 핵심 구현 포인트

**WeeklySummaryCards.tsx**
- `calcCumulativeHours()`: 점심 시간(1h) 공제 로직 포함한 누적 근무시간 계산
- `isOnTrack`: 주간 40h의 50% 이상이면 `순조로움`, 미만이면 `지연`
- Overtime Balance: `compLeaveEntries.reduce((sum, e) => sum + (e.leaveDays - e.usedDays) * 8, 0)`

**WorkingRecordContents.tsx**
- `getCategory()`: `DAY_OFF` → 연차, `AM/PM_HALF_DAY_OFF` → 반차, 주말 → 휴일, 그 외 → Work
- `workDuration`: 8시간 초과 또는 점심 포함 시 1시간 공제
- `parseHours()`: 초(seconds) → `Xh XXm` 포맷 변환
- 오늘 행: `bg-blue-50` 강조 + 퇴근 미기록 시 `근무 중...` 표시

---

## 4. Gap 분석 결과

| Match Rate | 총 항목 | 충족 | 부분 충족 | 미충족 |
|-----------|--------|------|-----------|--------|
| **97%** | 18 | 17 | 1 | 0 |

### G-01: 요일 표시 언어 (Minor, 수용됨)

Plan에서는 `2026.03.23 Monday`(영문 요일) 예시를 제시했으나, 구현은 `월요일`(한글 요일)로 표시. 이는 "문구를 자연스럽게 한글로 바꿔줘" 요구사항과 일치하는 의도적 변경으로, 수정 불필요.

---

## 5. 주요 결정 사항

| 결정 | 내용 | 결과 |
|------|------|------|
| WeeklySummaryCards 데이터 방식 | Props 전달 대신 컴포넌트 내 자체 fetch (WorkingTimeContext 활용) | 코드 단순화, prop drilling 없음 |
| 한글화 범위 | 모든 UI 텍스트 한글화 (`On Track` → `순조로움`, `View History` → `사용 내역 보기`) | 한국어 사용자에 최적화 |
| 점심 공제 로직 | 기존 `WeeklySummaryCards` 로직 동일하게 `WorkingRecordContents`에도 적용 | 데이터 일관성 유지 |

---

## 6. 학습 및 개선점

- **패턴**: `useContext` + `useQuery`의 조합으로 날짜 범위에 반응하는 컴포넌트가 효과적으로 동작
- **주의**: `DayOffType` 타입 추가 시 기존 타입 정의 확인 필요 (`반차` 케이스)
- **개선 가능**: 주간 진척도 `isOnTrack` 기준(현재 50%)을 설정 가능하게 만들 수 있음
