# Feature Plan: dayoff-history

- **Feature**: dayoff-history
- **Page**: `/dayoff/used`
- **Date**: 2026-03-28
- **Phase**: Plan

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| 문제 | `/dayoff/used` 페이지가 단순 flex 목록 UI로 정보 파악이 어렵고, 영어 텍스트가 혼재되어 있으며 요약 정보가 부족함 |
| 해결 | `docs/dayoff-history.png` 디자인 기반으로 요약 카드 + 구조화된 테이블 + 페이지네이션으로 재설계, 전체 한글화 |
| 기능 UX 효과 | 총 사용일/잔여 연차를 카드로 한눈에 파악, 상태 배지와 페이지네이션으로 내역 탐색 편의성 향상 |
| 핵심 가치 | 직관적인 휴가 현황 파악으로 사용자 의사결정 지원 |

---

## Context Anchor

| 항목 | 내용 |
|------|------|
| WHY | 기존 페이지의 낮은 정보 밀도와 영어 혼재로 사용성 저하 → 모던 카드+테이블 UI로 개선 |
| WHO | 자신의 휴가 사용 내역을 조회하는 일반 사용자 |
| RISK | API 페이지네이션 적용 시 기존 쿼리 파라미터 변경 필요 |
| SUCCESS | PNG 디자인과 시각적으로 일치, 한글화 완료, 빌드 통과 |
| SCOPE | `page.tsx` + `DayOffHistoryContents.tsx` 두 파일만 수정 |

---

## 1. 개요

`/dayoff/used` 페이지의 컨텐츠 UI를 `docs/dayoff-history.png` 디자인에 맞게 재설계한다.
영어로 된 모든 텍스트를 자연스러운 한글로 변경하고, 요약 카드와 구조화된 테이블을 도입한다.

---

## 2. 요구사항

### §2.1 페이지 헤더

- 브레드크럼: `전자 결재 > 휴가 내역` (소문자 tracking-widest 스타일)
- 제목: `휴가 내역` (h2, 2xl bold)
- 연도 네비게이터: `< 2026 >` (좌우 화살표 버튼, 제목 옆 또는 우측 배치)
- 우측 상단: `+ 휴가 신청` 버튼 (slate-800 배경, `/dayoff/requests`로 링크)

### §2.2 요약 카드 (2개)

**카드 1 — 총 사용일**
- 라벨: `총 사용일`
- 숫자: 전체 `usedDays` 합산 (소수점 1자리)
- 배지: `연차 N.0일` + `보상 N.0일` (각 타입별 합산)

**카드 2 — 잔여 연차**
- 라벨: `잔여 연차`
- 숫자: `totalLeaveDays - usedLeaveDays` (currentUser.leaveEntry 기반)
- 서브: `다음 만료일 {selectedYear}년 12월 31일`
- 카드 색상: `bg-slate-800 text-white` (강조)

### §2.3 상세 내역 테이블

헤더 컬럼 (7개):

| 컬럼 | 데이터 | 너비 |
|------|--------|------|
| 번호 | 페이지 내 1-based index | w-12 |
| 종류 | VacationTypeBadge (연차/보상휴가/공가) | w-28 |
| 구분 | 종일 / 오전반차 / 오후반차 (텍스트) | w-24 |
| 사용일 | YYYY.MM.DD ~ YYYY.MM.DD | w-40 |
| 사용일수 | usedDays + `일` | w-20 |
| 비고 | reason + (COMPENSATORY인 경우 보상휴가 사용 내역) | flex-1 |
| 상태 | DocumentStatus 배지 (승인됨/거절됨/대기 등) | w-20 |

**배지 스타일:**
- 연차: `bg-blue-100 text-blue-700`
- 보상휴가: `bg-orange-100 text-orange-700`
- 공가: `bg-gray-100 text-gray-700`
- 상태 승인됨: `bg-green-100 text-green-700`

**정렬**: `startDate` 오름차순

### §2.4 페이지네이션

- API 페이지네이션: `page`, `size=10` 파라미터 사용
- 하단: `총 N건 중 {start}~{end}건 표시` 텍스트
- 페이지 버튼: 이전/다음 화살표 + 페이지 번호

### §2.5 상태 필터 (현재 동작 유지)

- 현재 `status: 'APPROVED'`로 고정 조회
- 필터 UI는 PNG에 아이콘만 존재 → 이번 작업 범위에서 제외

---

## 3. 기술 스택 및 의존성

- 신규 패키지 설치 없음
- 기존: `react-icons`, `dayjs`, `TanStack Query`, Tailwind CSS
- `useGetCurrentUser` 훅으로 `leaveEntry` 데이터 조회
- `useVacationDocuments` 훅의 `page`, `size` 파라미터 활용

---

## 4. 변경 파일

| 파일 | 변경 유형 |
|------|---------|
| `src/app/(user)/dayoff/used/page.tsx` | 수정 (헤더 재설계) |
| `src/app/(user)/dayoff/used/_components/DayOffHistoryContents.tsx` | 수정 (전체 재설계) |

신규 생성 파일 없음.

---

## 5. 성공 기준

1. PNG 디자인과 시각적으로 일치 (헤더 / 카드 2개 / 테이블 구조)
2. 모든 영어 텍스트가 자연스러운 한글로 변경됨
3. 총 사용일 카드에 연차/보상 분류 배지가 표시됨
4. 테이블에 상태 배지(승인됨)가 표시됨
5. 페이지네이션(10건/페이지)이 동작함
6. `yarn build` 통과 (TypeScript 에러 없음)
