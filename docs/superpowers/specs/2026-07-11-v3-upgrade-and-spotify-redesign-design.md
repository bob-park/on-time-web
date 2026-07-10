# On Time v3 — Framework Upgrade + Spotify Dark UI Redesign

- **Date:** 2026-07-11
- **Branch:** `feature/v3-ui`
- **Status:** Approved (mockups reviewed and confirmed by user)
- **Mockups:** [`docs/design/mockups/index.html`](../../design/mockups/index.html)
  (정적 HTML — `npx serve docs/design/mockups` 로 로컬 확인)
- **Design system source:** [`docs/design/spotify-degin.md`](../../design/spotify-degin.md)

## Goal

두 단계로 진행한다. 순서 고정 — 업그레이드가 끝나고 검증된 뒤에만 UI 작업을
시작한다 (회귀 원인 분리).

1. **Phase 1 — Framework Upgrade:** `template-nextjs-app` 스택에 완전 동기화
2. **Phase 2 — UI Redesign:** 전 페이지(24개)에 Spotify 다크 디자인 시스템 적용

## Confirmed Decisions

| 결정 | 내용 |
|---|---|
| 테마 | **다크 온리.** light/dark theme cookie 전환 제거, `data-theme` 고정 |
| 업그레이드 범위 | **템플릿 완전 동기화** — 버전 + next-intl + lottie-react + msw→miragejs 교체 |
| locale | **ko 단일.** next-intl 인프라는 템플릿대로, `messages/ko.json` 하나. 문자열 추출은 Phase 2 에서 페이지 손댈 때 수행 |
| 목업 | 전 페이지 목업 제작 완료(22종 — redirect 뿐인 root 제외), 사용자 승인됨 |
| 결재 문서(A4) | 다크 UI 위에 **흰 종이 그대로 유지** (인쇄물/PDF 정체성 보존) |

## Phase 1 — Framework Upgrade

### 버전 동기화 (template-nextjs-app 기준)

| 패키지 | 현재 | 목표 | 비고 |
|---|---|---|---|
| next | 16.2.1 | 16.2.9 | patch |
| react / react-dom | ^19.2.4 | **19.2.7 고정** | `resolutions` 에 `@types/react` 19.2.7 / `@types/react-dom` 19.2.3 추가 |
| ky | ^1.14.3 | **^2.0.2** | **major** — `src/shared/api` 공유 인스턴스 및 호출부 마이그레이션 |
| typescript | ^5 | **^6** | **major** — 컴파일 에러 정리 |
| uuid | ^13 | ^14 | major, API 변화 미미 |
| @tanstack/react-query (+devtools) | ^5.95.2 | ^5.101.2 | minor |
| zustand | ^5.0.12 | ^5.0.14 | patch |
| immer | ^11.1.4 | ^11.1.8 | patch |
| dayjs | ^1.11.20 | ^1.11.21 | patch |
| lodash | ^4.17.23 | ^4.18.1 | minor |
| sharp | ^0.34.5 | ^0.35.2 | minor |
| @faker-js/faker | ^10.4.0 | ^10.5.0 | minor |
| daisyui | ^5.5.19 | ^5.6.5 | minor |
| @bob-park/eslint-config-bobpark | 0.2.4-RC1 | 0.3.0-RC4-20260630 | lint 스크립트 `next lint` → `eslint ./src` |
| @bob-park/prettier-config-bobpark | 0.3.1-RC1 | 0.4.0-RC4-20260630 | devDeps 에 `prettier: ^3` 명시 추가 |
| @types/node | ^20 | ^24.13.2 | |
| eslint | (transitive) | ^9 명시 | 템플릿과 동일하게 direct dep 로 |
| packageManager | yarn@4.9.0 | yarn@4.17.0 | |

### 스택 교체·추가

- **msw → miragejs ^0.1.48**: 독립 mock 서버(`yarn mock`, `src/mocks/http.ts`,
  express + cors + @mswjs/http-middleware) 제거. miragejs 인앱 mock 으로 재작성.
  제거 대상 deps: `msw`, `@mswjs/http-middleware`, `express`, `cors`,
  `@types/express`, `@types/cors`. `package.json` 의 `msw.workerDirectory` 필드,
  `public/mockServiceWorker.js`, `mock` 스크립트도 제거.
  (`@types/sockjs-client` 는 mock 과 무관하므로 유지.)
- **next-intl ^4.13.0 도입**: 템플릿 wiring 그대로 (`src/i18n/` request config,
  provider, `docs/agents/libs/next-intl.md` 참조). `messages/ko.json` 단일 locale.
- **lottie-react ^2.4.1 추가**: Phase 2 의 로딩/빈 상태 애니메이션용.
- **유지 (프로젝트 전용, 템플릿에 없어도 삭제 금지)**: jspdf, html2canvas-pro,
  qr-code-styling, qrcode(@types 포함), react-day-picker, @stomp/stompjs,
  sockjs-client, timeago-react/timeago.js, autoprefixer, react-icons, classnames.

### 검증 기준 (Phase 1 완료 조건)

- `yarn build` / `yarn lint` 통과
- miragejs mock 으로 로컬 개발(`yarn dev`) 동작
- 주요 플로우 수동 스모크: 로그인 리다이렉트 → 대시보드 → 휴가 신청 →
  결재 목록 → 관리자 근무 현황
- UI 변경 없음 (기존 화면 그대로)

## Phase 2 — UI Redesign

### 디자인 시스템 (tokens)

`docs/design/mockups/tokens.css` 가 시각 기준. 구현은 Tailwind 4 + daisyUI 5
커스텀 테마 `ontime-dark` 로 옮긴다 (`globals.css` 의 `@plugin "daisyui/theme"`).

| daisyUI 토큰 | 값 | 용도 |
|---|---|---|
| base-100 | `#121212` | 페이지 배경 |
| base-200 | `#181818` | 카드·사이드바·메인 surface |
| base-300 | `#1f1f1f` | 버튼·인풋·인터랙티브 표면 |
| primary | `#1ed760` (content `#000`) | 기능적 액센트: CTA, 출근, 승인, 활성 |
| error / warning / info | `#f3727f` / `#ffa42b` / `#539df5` | 반려·경고 / 대기·보상 / 정보·연차 |
| base-content | `#ffffff` (보조 `#b3b3b3`) | 텍스트 |

- **타이포:** Pretendard 유지. weight 700/400 이분법(600은 절제), 10–24px
  컴팩트 스케일, 버튼 라벨 letter-spacing 확대. uppercase 는 영문 eyebrow 에만.
- **지오메트리:** 버튼 전부 pill(rounded-full), 아이콘 버튼 원형, 카드 radius
  6–8px, 인풋 pill + inset border-shadow.
- **그림자:** 모달/드롭다운 `rgba(0,0,0,0.5) 0 8px 24px`, 카드 hover
  `rgba(0,0,0,0.3) 0 8px 8px`.
- **Green 사용 규칙:** 기능적으로만 (CTA·출근·승인·활성·new badge). 배경
  장식·큰 면적 금지.
- **상태 시맨틱:** 승인/출근/정상=green, 대기/보상=orange, 반려/경고=red,
  연차/정보=blue. 배지·칩·dot 에만.

### 레이아웃 셸 (전 페이지 공통)

목업 `dashboard.html` 이 기준:

- 뷰포트 전체 `#121212`, 8px gutter 안에 **사이드바(256px) + 메인 카드** 부유
- 사이드바: 로고(green dot) / nav (pill active, 전자 결재·관리자 그룹 헤더,
  결재 대기 green count 배지) / 하단 로그아웃
- 메인: 상단 그라데이션(`#1c1c1c → #181818`) 라운드 카드, sticky 헤더(알림
  원형 버튼 + 프로필 pill chip), 스크롤 콘텐츠
- **Now-working bar**: 화면 하단 고정 (Spotify now-playing 스타일) — 근무 중
  green pulse + 출근 시각 + 경과/목표 progress + 퇴근하기 CTA. 미출근 시
  상태 문구 + 출근하기. 전 페이지 상시 노출.
- 모바일: 사이드바 → 하단 dock 전환, working bar 는 dock 위에 축약형 유지
- `CustomerSupport` 플로팅 채팅은 다크 스타일로 리스타일 유지

### 페이지별 적용 (목업 파일 매핑)

| 라우트 | 목업 | 핵심 변경 |
|---|---|---|
| /dashboard | dashboard.html | hero(green gradient) + 보상휴가 stat + 주간 테이블(트랙리스트 스타일) |
| /schedule | schedule.html | Gantt 타임라인 다크화, 상태 아이콘·바 색 시맨틱 |
| /schedule/add (모달) | schedule-add.html | 구분 pill-row 선택 + 정적 캘린더 하이라이트 |
| /attendance/record/[checkId] | attendance-record.html | 성공/실패 센터 스테이트, green glow |
| /attendance/record/gps | attendance-gps.html | 장소 pill 필터, 출/퇴근 토글, 토큰 카드 |
| /profile | profile.html | 3카드 (개인 정보 / 패스워드 / 결재 서명) |
| /dayoff/requests | dayoff-requests.html | stat 4장 + 좌 설정 패널 + 우 캘린더 + 하단 요약 바 |
| /dayoff/used | dayoff-used.html | 연도 네비 + stat 2장 + 상세 테이블 |
| /dayoff/[id] | dayoff-detail.html | 결재 스텝 + 액션 3버튼 + **흰 A4 문서** |
| /overtime/requests | overtime-requests.html | 폼 카드 + 추가 내역 테이블 |
| /overtime/[id] | overtime-detail.html | 동일 3카드 패턴 + 흰 A4 + "초안" 워터마크 |
| /expense/reports/requests | expense-requests.html | 준비중 empty state 리디자인 |
| /documents | documents.html | pill 필터 + 트랙리스트 테이블 + pagination |
| /approvals | approvals.html | 동일 패턴 + 신청자 컬럼 |
| /approvals/[id] | approval-detail.html | 취소/반려/승인 트리오 + 흰 A4 |
| /attendance/view (관리자) | manager-attendance.html | sticky 임직원 컬럼 주간 그리드, 상태 dot/배지 |
| /attendance/people/schedules | manager-schedules.html | 준비중 리디자인 |
| /dayoff/users/vacations | manager-vacations.html | 연간 매트릭스, 보상 수치 orange 병기 |
| /dayoff/users/compensatory | manager-compensatory.html | 준비중 리디자인 |
| /chat/users | manager-chat.html | 아바타 리스트 rows + 새 메시지 배지 |
| /chat/users/[uniqueId] | manager-chat-room.html | 다크 채팅 버블 (수신 `#252525` / 발신 green) |
| /qr | qr.html | 출/퇴근 토글 + 흰 패널 위 QR |
| / (root) | — | redirect 유지, 변경 없음 |

### Phase 2 공통 작업

- **theme 제거:** `data-theme` cookie / `setTheme` server action / 토글 UI 제거,
  `ontime-dark` 고정. `docs/agents/libs/theme.md` 갱신.
- **문자열 추출:** 페이지 리디자인 시 해당 페이지의 하드코딩 한국어를
  `messages/ko.json` 으로 이동 (`next-intl` `useTranslations`).
- **공용 컴포넌트 먼저:** Button/Badge/StatCard/PillFilter/Table 스타일,
  Navigator(주/연도), 모달, working bar 를 `src/shared/components` 에 구축 후
  페이지 적용. 기존 컴포넌트 구조(`_components`, domain)는 유지 — 스타일과
  마크업만 교체.
- **애니메이션:** 기존 Pretendard/트랜지션 톤 유지 + lottie 는 로딩/빈
  상태에만 절제 사용. hover scale(1.03)/active scale(0.98) 버튼 인터랙션.
- **PDF export 경로 보존:** A4 문서 컴포넌트는 흰 배경 유지가 필수
  (html2canvas-pro 캡처 결과가 인쇄물이므로 다크화 금지).

### 검증 기준 (Phase 2 완료 조건)

- 24개 라우트 전부 목업과 시각적으로 일치 (구조·색·지오메트리)
- `yarn build` / `yarn lint` 통과
- PDF 다운로드 산출물이 기존과 동일 (흰 문서)
- 라이트 테마 잔재 없음 (slate/white 배경, `data-theme="light"` 등)
- 모바일 뷰포트에서 dock + working bar 동작

## Error Handling / Edge Cases

- **ky 2.x 마이그레이션:** 공유 `api` 인스턴스의 hooks/prefixUrl/retry 옵션이
  2.x 시그니처와 다른 부분을 전수 확인. HTTPError 타입 처리 변경 주의.
- **TS 6:** 컴파일 에러는 기계적으로 수정하되 동작 변경 금지. 수정 불가한
  서드파티 타입 충돌은 최소 범위 캐스팅.
- **miragejs 전환:** 기존 msw 핸들러(faker 기반)의 응답 shape 를 그대로 재현
  — mock 데이터 계약이 바뀌면 화면 검증이 무의미해짐.
- **WebSocket(STOMP) 기능**(채팅/알림)은 스타일만 변경, 연결 로직 불변.
- **결재 스텝 컴포넌트:** daisyUI steps 의존을 목업의 커스텀 스텝으로 교체
  시 WAITING/REJECTED/현재 상태 표현 누락 없게.

## Testing

테스트 스크립트가 없는 저장소이므로 (CLAUDE.md 참조) 검증은 build + lint +
수동 스모크 + 페이지별 목업 대조로 한다. Phase 1/2 각각 완료 시점에 검증
게이트를 둔다.

## Out of Scope

- 준비중 페이지 3종의 실제 기능 구현 (placeholder 리디자인만)
- 백엔드 API 변경, 신규 기능 추가
- en locale 번역 (ko 단일)
