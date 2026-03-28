# Plan: new-layout

- **Feature**: new-layout
- **Date**: 2026-03-28
- **Phase**: Plan

---

## Executive Summary

| 항목 | 내용 |
|------|------|
| **Feature** | new-layout |
| **Started** | 2026-03-28 |
| **Status** | Plan |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 현재 Header에 로고와 네비게이션이 분리되어 있고, 사이드바가 흰 배경으로 콘텐츠 영역과 구분이 어려움 |
| **Solution** | 다크 네이비 사이드바에 로고 + 네비게이션 + 하단 액션을 통합하고, 헤더는 검색 + 사용자 정보 전용으로 분리 |
| **Function UX Effect** | 사이드바와 콘텐츠 영역이 시각적으로 명확히 구분되고, 검색 기능 추가로 탐색 효율 향상 |
| **Core Value** | 이미지(new-layout.png) 디자인과 동일한 모던 HR 대시보드 레이아웃 구현 |

---

## Context Anchor

| | 내용 |
|---|------|
| **WHY** | UI를 모던 HR 대시보드 스타일로 개선하여 가독성과 사용성 향상 |
| **WHO** | 일반 사용자 + 관리자 (기존 사용자 그대로) |
| **RISK** | 기존 Header/NavMenu 컴포넌트 변경 시 다른 페이지 레이아웃 영향 가능성 |
| **SUCCESS** | new-layout.png와 시각적으로 동일한 Header + Sidebar 구조 |
| **SCOPE** | Header.tsx, NavMenu.tsx, app/layout.tsx 수정 (페이지 콘텐츠 불변) |

---

## 1. 배경 및 목적

`docs/new-layout.png`를 기준으로 Header와 Nav 레이아웃을 개선한다.

현재 구조:
- Header: 좌측(햄버거 + 로고) + 우측(알림 + 사용자 정보)
- NavMenu: 흰 배경 사이드바, 텍스트/아이콘 메뉴

목표 구조 (이미지 기준):
- Header: 검색창(중앙) + 알림 + 사용자 정보(우측)
- Sidebar(NavMenu): 다크 네이비 배경, 상단에 로고(OnTime + ENTERPRISE CORE), 기존 메뉴 항목, 하단에 Support + Logout

---

## 2. 요구사항

### Header 변경사항
- [ ] 로고(OnTime) 제거 → 사이드바로 이동
- [ ] 햄버거 메뉴 버튼 제거
- [ ] 검색창 추가: `placeholder="Search tasks, schedules, or team..."`
- [ ] 알림 버튼 유지 (기존 NotificationDialog 연동)
- [ ] 사용자 아바타 + 이름 + 직책 유지

### NavMenu(Sidebar) 변경사항
- [ ] 배경색: 다크 네이비 (`bg-slate-900` 계열)
- [ ] 상단 로고 영역 추가:
  - "OnTime" (흰색, 굵은 폰트)
  - "ENTERPRISE CORE" (회색, 소문자, 작은 폰트) — 실제 표시는 부서/회사명 대체 가능
- [ ] 기존 메뉴 항목 유지 (아이콘 + 텍스트)
- [ ] 메뉴 아이템 스타일: 흰색 텍스트, hover 시 밝은 네이비, active 시 강조색
- [ ] 하단 고정 영역 추가:
  - Support 링크
  - Logout 링크

### 레이아웃 구조 변경 (app/layout.tsx)
- [ ] 사이드바가 전체 높이를 차지하도록 (`h-screen`, `fixed` 또는 `sticky`)
- [ ] Header는 사이드바 오른쪽 상단에 위치 (사이드바와 별도 영역)

---

## 3. 범위

### 수정 파일
| 파일 | 변경 내용 |
|------|----------|
| `src/app/_components/Header.tsx` | 로고/햄버거 제거, 검색창 추가 |
| `src/app/_components/NavMenu.tsx` | 다크 테마, 로고 영역 추가, 하단 버튼 추가 |
| `src/app/layout.tsx` | 사이드바 높이 및 레이아웃 구조 조정 |

### 불변 항목
- 각 페이지 콘텐츠 컴포넌트 (변경 없음)
- 인증/라우팅 로직 (변경 없음)
- 기존 NavMenu 메뉴 항목 (유지)

---

## 4. 성공 기준

- [ ] `new-layout.png`와 시각적으로 동일한 Header + Sidebar 레이아웃
- [ ] 기존 모든 메뉴 항목이 다크 사이드바에서 정상 동작
- [ ] 반응형 깨짐 없이 기존 min-w-max 유지
- [ ] 빌드 에러 없음 (TypeScript + ESLint)

---

## 5. 구현 우선순위

1. `NavMenu.tsx` — 다크 테마 + 로고 영역 + 하단 버튼
2. `Header.tsx` — 로고 제거 + 검색창 추가
3. `layout.tsx` — 사이드바/헤더 레이아웃 구조 조정
