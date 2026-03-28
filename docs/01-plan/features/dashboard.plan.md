# Plan: dashboard

- **Feature**: dashboard
- **Date**: 2026-03-28
- **Phase**: Plan

---

## Executive Summary

| 항목 | 내용 |
|------|------|
| **Feature** | dashboard |
| **Started** | 2026-03-28 |
| **Status** | Plan |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 현재 dashboard는 단순 텍스트 목록 + 바차트 형태로, 핵심 지표(진척도, 초과근무 잔여)가 직관적으로 보이지 않음 |
| **Solution** | Weekly Progress 카드 + Overtime Balance 카드를 상단에 배치하고, 테이블을 이미지 디자인에 맞게 재설계 |
| **Function UX Effect** | 한 눈에 주간 근무 진척도와 보상휴가 잔여를 파악하고, 날짜 네비게이션이 직관적으로 개선됨 |
| **Core Value** | new-layout.png와 동일한 모던 HR 대시보드 콘텐츠 레이아웃 구현 |

---

## Context Anchor

| | 내용 |
|---|------|
| **WHY** | 이미지(new-layout.png) 기준으로 dashboard 콘텐츠 UI를 모던 스타일로 개선 |
| **WHO** | 일반 사용자 (근무 기록 조회 및 진척도 확인) |
| **RISK** | WorkingRecordContents, WorkingTimeView 컴포넌트 변경 시 데이터 로직 유지 필요 |
| **SUCCESS** | new-layout.png의 콘텐츠 영역과 시각적으로 동일한 dashboard 구현 |
| **SCOPE** | dashboard/page.tsx, WorkingTimeView.tsx, WorkingRecordContents.tsx, 신규 카드 컴포넌트 |

---

## 1. 배경 및 목적

`docs/new-layout.png`를 기준으로 dashboard 페이지의 콘텐츠 영역을 전면 재설계한다.

---

## 2. 요구사항

### 2.1 페이지 상단 영역

- [ ] 브레드크럼 추가: `EXECUTIVE > WORK HOURS` (작은 회색 텍스트)
- [ ] 제목: `근로 시간` 유지 (스타일만 이미지에 맞게)
- [ ] 날짜 네비게이션 우측 정렬: `< 날짜범위 >` + `오늘` 버튼

### 2.2 Summary 카드 (신규, 상단)

**Weekly Progress 카드 (좌측)**
- [ ] 현재 주 누적 근무시간 표시: `{currentHours}/{totalHours}:00`
- [ ] 진척 상태 뱃지: 목표 달성 시 `On Track` (초록), 미달 시 `Behind` (주황)
- [ ] Progress bars:
  - CUMULATIVE WORK HOURS: 누적근무/40h 비율
  - EXPECTED WORK HOURS: 100% TARGET (고정)

**Overtime Balance 카드 (우측)**
- [ ] 현재 월 보상휴가 잔여 시간 표시 (getUserCompLeaveEntries API 연동)
- [ ] 잔여 없으면 `0h` 표시
- [ ] `View History` 버튼 → `/dayoff/used` 링크

### 2.3 테이블 재설계

**헤더 변경:**
현재: 근무일 / 구분 / 출근시간 / 퇴근예정 / 퇴근시간 / 휴식 / 연장근로 / 근무시간
변경: DATE/DAY | CATEGORY | CLOCK-IN | CLOCK-OUT | DURATION | STATUS

**컬럼 상세:**
- [ ] `DATE/DAY`: 날짜 + 요일 (이미지 형식: `2026.03.23 Monday`)
- [ ] `CATEGORY`: `Work` / `연차` / `휴일` 뱃지 형태
- [ ] `CLOCK-IN`: 출근 시간 (HH:mm)
- [ ] `CLOCK-OUT`: 퇴근 시간 (HH:mm)
- [ ] `DURATION`: 근무 시간 + 소형 progress bar
- [ ] `STATUS`: 상태 컬러 dot (SUCCESS=초록, WARNING=빨강, 미완료=회색)

**테이블 스타일:**
- [ ] 오늘 행 강조 (연한 파란 배경 또는 테두리)
- [ ] 진행 중(In Progress) 행 표시

### 2.4 하단 영역

- [ ] `Showing N entries for the current week` 텍스트
- [ ] Previous Week / Next Week 버튼 (우측 하단)

---

## 3. 범위

### 수정/생성 파일

| 파일 | 변경 유형 | 내용 |
|------|----------|------|
| `src/app/(user)/dashboard/page.tsx` | 수정 | 브레드크럼, 레이아웃 구조 |
| `src/domain/attendance/components/WorkingTimeView.tsx` | 수정 | 날짜 네비 우측 정렬, 스타일 |
| `src/app/(user)/dashboard/_componets/WorkingRecordContents.tsx` | 수정 | 테이블 재설계, 카드 추가 |
| `src/app/(user)/dashboard/_componets/WeeklySummaryCards.tsx` | 신규 | Weekly Progress + Overtime Balance 카드 |

### 불변 항목
- 데이터 fetch 로직 (attendanceRecord, compLeaveEntries API)
- WorkingTimeProvider context 구조
- 라우팅 및 인증

---

## 4. 성공 기준

- [ ] 이미지(new-layout.png)의 콘텐츠 영역과 시각적으로 동일
- [ ] Weekly Progress 카드: 실제 근무시간 데이터 정상 표시
- [ ] Overtime Balance 카드: getUserCompLeaveEntries API 연동 정상
- [ ] 테이블 6개 컬럼(DATE/CATEGORY/CLOCK-IN/CLOCK-OUT/DURATION/STATUS) 정상 렌더링
- [ ] 오늘 날짜 행 강조 표시
- [ ] 빌드 에러 없음

---

## 5. 구현 우선순위

1. `WeeklySummaryCards.tsx` — 신규 카드 컴포넌트 (Weekly Progress + Overtime Balance)
2. `WorkingRecordContents.tsx` — 테이블 컬럼 재설계
3. `WorkingTimeView.tsx` — 날짜 네비 스타일 변경
4. `dashboard/page.tsx` — 레이아웃 조합 및 브레드크럼 추가
