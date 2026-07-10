# Phase 2: Spotify Dark UI 전면 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 전 페이지(22개 화면)를 승인된 목업(`docs/design/mockups/`)의 Spotify 다크 디자인 시스템으로 리디자인하고, 손대는 페이지의 하드코딩 한국어를 `messages/ko.json` 으로 추출한다.

**Architecture:** 토큰(테마) → 공용 프리미티브 → 셸(사이드바/헤더/working bar) → 페이지 순의 상향식 적용. 기존 컴포넌트 트리(`_components`, `src/domain`)와 데이터/로직은 유지하고 **마크업과 스타일만 교체**한다. 각 태스크는 해당 목업과의 시각 대조가 완료 조건.

**Tech Stack:** Tailwind 4 + daisyUI 5 커스텀 테마 `ontime-dark`, next-intl v4 (ko), Pretendard, lottie-react(절제 사용)

**Spec:** `docs/superpowers/specs/2026-07-11-v3-upgrade-and-spotify-redesign-design.md`
**전제:** Phase 1 계획 (`2026-07-11-phase1-framework-upgrade.md`) 완료 상태.

## Global Constraints

- **목업이 마크업의 진실.** 각 태스크의 목업 HTML (`docs/design/mockups/*.html`) 과 `tokens.css` 가 구조·색·간격의 기준이다. 구현 전 반드시 해당 목업 파일을 Read 하고, 클래스는 Tailwind 유틸리티 + daisyUI 로 옮긴다.
- **색 규칙:** green `#1ed760` 은 기능적으로만 (CTA·출근·승인·활성·new badge) — 배경 장식 금지. 대기/보상=`#ffa42b`(warning), 반려/경고=`#f3727f`(error), 연차/정보=`#539df5`(info). 표면은 `#121212/#181818/#1f1f1f` 3단.
- **지오메트리:** 버튼·인풋·필터 = pill(rounded-full), 아이콘 버튼 = 원형, 카드 = rounded-lg(8px). 모달/드롭다운 그림자 `shadow-[0_8px_24px_rgba(0,0,0,0.5)]`.
- **결재 문서(A4) 는 흰 종이 유지** — `VacationDocument`, `OverTimeWorkDocument`, `UserSignature` 내부는 다크화 금지 (PDF/인쇄 정체성). 문서를 감싸는 카드만 다크.
- **문자열 추출 규칙:** 태스크가 손대는 파일의 **사용자 노출 한국어**는 `messages/ko.json` 에 페이지/도메인 네임스페이스로 추출하고 `useTranslations('<ns>')`(client) / `getTranslations('<ns>')`(server) 로 대체한다. 로그·주석·API 값은 추출하지 않는다.
- 컨벤션 준수: `docs/agents/conventions/` (naming, react-sections, typescript) + `docs/agents/libs/tailwind-daisyui.md`. 기존 파일의 섹션 주석 스타일 유지.
- 각 태스크 완료 조건: `yarn dev` 로 해당 라우트를 목업과 나란히 비교(구조·색·상태 표현 일치) + `yarn lint` + `yarn build` 통과 + 커밋.
- 데이터 페칭/mutation/스토어 로직 변경 금지. 라우트 변경 금지.

---

### Task 1: `ontime-dark` 테마 + 전역 스타일

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx` (`data-theme` 교체)

**Interfaces:**
- Produces: daisyUI 시맨틱 클래스(`btn-primary`, `badge-warning`, `bg-base-200` 등)가 Spotify 팔레트로 렌더링되는 전역 테마. 이후 모든 태스크가 이 토큰만 사용 (임의 hex 직접 사용 금지 — 예외: A4 문서 내부).

- [ ] **Step 1: globals.css 의 light 테마 블록을 ontime-dark 로 교체**

기존 `@plugin "daisyui/theme" { name: 'light'; ... }` 블록 전체를 다음으로 교체:

```css
@plugin "daisyui/theme" {
  name: 'ontime-dark';
  default: true;
  prefersdark: true;
  color-scheme: 'dark';
  --color-base-100: #121212;
  --color-base-200: #181818;
  --color-base-300: #1f1f1f;
  --color-base-content: #ffffff;
  --color-primary: #1ed760;
  --color-primary-content: #000000;
  --color-secondary: #252525;
  --color-secondary-content: #ffffff;
  --color-accent: #1ed760;
  --color-accent-content: #000000;
  --color-neutral: #1f1f1f;
  --color-neutral-content: #ffffff;
  --color-info: #539df5;
  --color-info-content: #000000;
  --color-success: #1ed760;
  --color-success-content: #000000;
  --color-warning: #ffa42b;
  --color-warning-content: #000000;
  --color-error: #f3727f;
  --color-error-content: #000000;
  --radius-selector: 2rem;
  --radius-field: 2rem;
  --radius-box: 0.5rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 1;
  --noise: 0;
}
```

(`--radius-field: 2rem` 이 버튼/인풋을 pill 로, `--radius-box: 0.5rem` 이 카드/모달을 8px 로 만든다.)

- [ ] **Step 2: Pretendard 로드 방식 수정 + 보조 토큰 추가**

globals.css 상단의 잘못된 `@font-face`(CSS 파일을 src 로 지정) 블록과 주석 처리된 `@import` 를 제거하고, `@import 'tailwindcss';` **위**에 추가:

```css
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
```

이어서 theme 블록 아래에 전역 보조 스타일 추가:

```css
:root {
  --shadow-heavy: rgba(0, 0, 0, 0.5) 0px 8px 24px;
  --shadow-medium: rgba(0, 0, 0, 0.3) 0px 8px 8px;
}

body {
  font-family: 'Pretendard Variable', Pretendard, -apple-system, system-ui, sans-serif;
  background: #121212;
}

@utility eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #1ed760;
}
```

기존 entrance animation keyframes 등 유지.

- [ ] **Step 3: 루트 레이아웃 테마 고정**

`src/app/layout.tsx` 의 `<html lang="ko" data-theme="light">` → `<html lang="ko" data-theme="ontime-dark">`. body 의 `font-[Pretendard,...]` 클래스는 제거 (globals.css 가 담당).

- [ ] **Step 4: 확인 및 Commit**

```bash
yarn dev
```

`/dashboard` 접속 — 전체가 다크 배경으로 전환되고 (레이아웃은 아직 기존 구조), 버튼이 pill 이 되었는지 확인. 깨진 곳은 이후 태스크에서 페이지별로 정리하므로 **테마 적용 여부만** 확인.

```bash
yarn lint && yarn build
git add -u
git commit -m "feat: ontime-dark daisyUI 테마 및 전역 다크 스타일 적용"
```

---

### Task 2: 공용 프리미티브 리스타일 + 신규 컴포넌트

**Files:**
- Modify: `src/shared/components/PillFilter.tsx`
- Modify: `src/shared/components/Pagination.tsx`
- Modify: `src/shared/components/Dropdown.tsx`
- Modify: `src/domain/document/components/DocumentStatusBadge.tsx`
- Modify: `src/domain/document/components/DocumentTypeBadge.tsx`
- Modify: `src/domain/attendance/components/WorkingTimeView.tsx`
- Modify: `src/app/_components/Preparing.tsx`
- Create: `src/shared/components/StatCard.tsx`
- Create: `src/shared/components/PageHeader.tsx`
- Modify: `messages/ko.json` (`common`, `preparing` 네임스페이스)

**Interfaces:**
- Produces (이후 페이지 태스크들이 사용하는 정확한 시그니처):
  - `StatCard({ label, value, unit, caption, highlight, children }: { label: string; value: React.ReactNode; unit?: string; caption?: string; highlight?: boolean; children?: React.ReactNode })` — 목업 `.stat` 카드. `highlight` 는 green inset ring + green value.
  - `PageHeader({ eyebrow, title, subtitle, actions }: { eyebrow?: string; title: string; subtitle?: string; actions?: React.ReactNode })` — 목업 `.page-head` (eyebrow green 대문자 + 24px bold title + 우측 actions 슬롯).
  - 기존 컴포넌트들의 **props 시그니처는 변경하지 않는다** — 내부 마크업/클래스만 교체.

- [ ] **Step 1: 목업 기준 확인**

`docs/design/mockups/tokens.css` 의 `.pill-filter`, `.stat`, `.page-head`, `.navigator`, `.empty` 섹션과 `docs/design/mockups/expense-requests.html` (Preparing 리디자인 기준) 을 Read.

- [ ] **Step 2: 리스타일 구현**

- `PillFilter`: 옵션 pill — 비활성 `bg-base-300 text-base-content font-normal`, 활성 `bg-primary text-primary-content font-bold`. 높이 32px(`h-8 px-4`), `rounded-full`.
- `Pagination`: 페이지 번호를 원형/pill 버튼으로, 현재 페이지 `bg-primary text-primary-content`.
- `Dropdown`: 메뉴 패널 `bg-[#252525] rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)]`.
- `DocumentStatusBadge`: 승인=`badge-success`풍 green tint(`bg-primary/15 text-primary`), 진행/대기=`bg-warning/15 text-warning`, 반려=`bg-error/15 text-error`, 초안/취소=`bg-base-content/10 text-base-content/60`. 형태 `rounded-full h-[22px] px-2.5 text-[11px] font-semibold`.
- `DocumentTypeBadge`: 휴가계=info tint, 휴일근무보고서=warning tint — 동일 pill 형태.
- `WorkingTimeView`: 화살표를 원형 아이콘 버튼(`w-9 h-9 rounded-full bg-base-300`), 날짜 범위 `font-bold text-sm min-w-[180px] text-center`, "오늘" pill `btn btn-sm btn-outline`.
- `Preparing`: 기존 9xl 회색 카드 3장 제거 → 목업 `expense-requests.html` 구조: 중앙 정렬, green pulse dot + "준비중" 72px bold + muted 서브라인 + outline pill 버튼. props 로 서브라인/버튼 라벨·링크를 받게 확장: `Preparing({ description, backHref, backLabel }: { description: string; backHref: string; backLabel: string })`.

- [ ] **Step 3: 신규 컴포넌트 작성**

`src/shared/components/StatCard.tsx`:
```tsx
import cx from 'classnames';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  caption?: string;
  highlight?: boolean;
  children?: React.ReactNode;
}

export default function StatCard({ label, value, unit, caption, highlight, children }: StatCardProps) {
  return (
    <div className={cx('rounded-lg bg-base-300 p-5', highlight && 'ring-1 ring-inset ring-primary')}>
      <div className="text-xs font-semibold tracking-widest text-base-content/60 uppercase">{label}</div>
      <div className={cx('mt-2 text-[32px] font-bold tracking-tight', highlight && 'text-primary')}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-base-content/60">{unit}</span>}
      </div>
      {caption && <div className="mt-1.5 text-xs text-base-content/60">{caption}</div>}
      {children}
    </div>
  );
}
```

`src/shared/components/PageHeader.tsx`:
```tsx
interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="my-3 mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-base-content/60">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 4: 문자열 추출**

`messages/ko.json` 에 추가:
```json
"common": {
  "today": "오늘",
  "cancel": "취소",
  "confirm": "확인",
  "total": "총 {count}건"
},
"preparing": {
  "title": "준비중",
  "descriptionExpense": "지출결의서 기능을 준비하고 있어요 — 조금만 기다려 주세요",
  "descriptionSchedules": "임직원 근무 일정 등록 기능을 준비하고 있어요",
  "descriptionCompensatory": "임직원 보상 휴가 현황 기능을 준비하고 있어요",
  "backToDocuments": "결재 목록으로",
  "backToDashboard": "대시보드로"
}
```

이 태스크에서 손댄 컴포넌트 내부의 한국어(예: WorkingTimeView 의 "오늘")를 위 키로 대체.

- [ ] **Step 5: 준비중 3개 라우트 연결 확인**

`Preparing` 을 사용하는 세 페이지(`src/app/(user)/expense/reports/requests/page.tsx`, `src/app/(manager)/attendance/people/schedules/page.tsx`, `src/app/(manager)/dayoff/users/compensatory/page.tsx`)에서 새 props 를 전달하도록 수정. `yarn dev` 로 세 라우트를 `expense-requests.html` / `manager-schedules.html` / `manager-compensatory.html` 목업과 대조.

- [ ] **Step 6: lint/build 및 Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 공용 프리미티브 다크 리스타일 및 StatCard/PageHeader 추가, 준비중 페이지 리디자인"
```

---

### Task 3: 앱 셸 — 사이드바 / 헤더 / Now-Working Bar / 레이아웃

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/_components/NavMenu.tsx`
- Modify: `src/app/_components/Header.tsx`
- Create: `src/app/_components/NowWorkingBar.tsx`
- Modify: `src/app/_components/CustomerSupport.tsx` (다크 리스타일)
- Modify: `messages/ko.json` (`nav`, `workingBar` 네임스페이스)

**Interfaces:**
- Consumes: Task 1 테마, `src/domain/attendance` 의 기존 오늘-근태 query hook (대시보드가 쓰는 것과 동일한 소스 — 구현 시 `src/domain/attendance/query` 에서 오늘 기록 조회 hook 을 찾아 재사용).
- Produces: 전 페이지 공통 셸. 콘텐츠 영역은 `.content` 에 해당하는 스크롤 컨테이너(`px-6 pb-[120px]`) — working bar 와 겹치지 않도록 하단 패딩 확보.

- [ ] **Step 1: 목업 확인**

`docs/design/mockups/dashboard.html` 의 `.app / .sidebar / .main / .header / .working-bar` 구조와 `tokens.css` 해당 섹션 Read.

- [ ] **Step 2: layout.tsx 구조 교체**

기존 `flex h-screen` + `w-64 사이드바` 구조를 목업 구조로:

```tsx
<body>
  {/* providers 트리 유지 */}
  <div className="flex h-screen gap-2 overflow-hidden bg-base-100 p-2">
    {/* sidebar */}
    <div className="hidden w-64 flex-none md:block">
      <NavMenu />
    </div>
    {/* main area */}
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#1c1c1c] to-base-200">
      <Header />
      <main className="flex-1 overflow-y-auto px-6 pb-[120px]">{children}</main>
    </div>
  </div>
  <NowWorkingBar />
  <CustomerSupport />
</body>
```

(모바일: 사이드바 `hidden md:block`, NavMenu 내부에서 모바일 dock 렌더 — Step 3.)

- [ ] **Step 3: NavMenu 리스타일**

목업 `.sidebar` 그대로: `bg-base-100` (독립 카드 아님 — 뷰포트와 동일 배경), 로고(green dot + "OnTime" 20px bold), 메뉴 아이템 `rounded-full px-3 py-2 text-sm text-base-content/60 hover:text-base-content`, 활성 `bg-base-300 font-bold text-base-content`, 그룹 헤더 `text-[11px] font-semibold uppercase tracking-[1.6px] text-base-content/60 mt-5`, 결재 대기 카운트 `bg-primary text-primary-content` 원형 배지, 하단 로그아웃 (top border `border-white/5`). 기존 아이콘(react-icons)과 라우팅/권한 로직 유지.

**모바일 dock**: 같은 컴포넌트에서 `md:hidden` 하단 고정 dock (`fixed bottom-0 inset-x-0 z-40 flex justify-around bg-base-300`) 으로 주요 5개 항목(대시보드/근무 일정/휴가 신청/결재 목록/결재 처리) 아이콘 렌더.

- [ ] **Step 4: Header 리스타일**

우측 클러스터만: 알림 벨 = 원형 아이콘 버튼(`w-9 h-9 rounded-full bg-base-300`), 프로필 = pill chip (`rounded-full bg-base-300 pl-1 pr-3 py-1` + 아바타 원형 30px + 이름/팀 2줄). 기존 NotificationDialog/드롭다운 로직 유지. 흰 배경/border/그림자 제거 (`bg-transparent`).

- [ ] **Step 5: NowWorkingBar 신규 작성**

`src/app/_components/NowWorkingBar.tsx` — client component. 목업 `.working-bar` 구조:

```tsx
'use client';

// 오늘의 근태 기록을 조회해 출근 전/근무 중/퇴근 완료 3상태를 렌더링한다.
// - 근무 중: green pulse dot + "근무 중 · HH:mm 출근" + 경과/8h progress + 퇴근 CTA(btn-primary)
// - 출근 전: gray dot + "출근 전" + 출근하기 CTA(/attendance/record/gps 링크)
// - 퇴근 완료: "오늘 근무 완료 · Xh Ym" + CTA 없음
```

- 컨테이너: `fixed bottom-2 inset-x-2 z-50 h-16 flex items-center justify-between gap-4 rounded-lg bg-base-300 px-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]`
- pulse dot: `w-2.5 h-2.5 rounded-full bg-primary animate-ping` 를 겹친 정적 dot 위에 (tailwind `animate-ping` + absolute 겹침).
- progress: 경과시간/8h — `h-1 rounded-full bg-[#4d4d4d]` 트랙 + `bg-base-content` 채움 (hover 시 `bg-primary`).
- 데이터: 대시보드가 사용하는 오늘 근태 조회 hook 재사용 (`src/domain/attendance/query` 에서 확인). 조회 실패/로딩 시 bar 자체를 렌더하지 않음 (`return null`).
- 모바일(`max-md`): 좌측 상태 텍스트와 CTA 만 (progress 숨김), 하단 dock 위에 위치하도록 `bottom-14`.

- [ ] **Step 6: CustomerSupport 다크 리스타일**

패널 `bg-[#252525] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)]`, 헤더/입력 다크 토큰, 전송 버튼 원형 green. 로직(WebSocket/toast) 불변.

- [ ] **Step 7: 문자열 추출**

`messages/ko.json`:
```json
"nav": {
  "dashboard": "대시보드",
  "schedule": "근무 일정",
  "groupApproval": "전자 결재",
  "dayoffRequest": "휴가 신청",
  "dayoffUsed": "휴가 사용 내역",
  "overtimeRequest": "휴일근무보고서 신청",
  "expenseRequest": "지출결의서 신청",
  "documents": "결재 신청 목록",
  "approvals": "결재 처리 대기 목록",
  "groupManager": "관리자",
  "managerVacations": "임직원 휴가 사용 현황",
  "managerCompensatory": "임직원 보상 휴가 현황",
  "managerAttendance": "임직원 근무 현황",
  "managerSchedules": "임직원 근무 일정 등록",
  "managerChat": "임직원과의 소통",
  "logout": "로그아웃",
  "profile": "프로필"
},
"workingBar": {
  "working": "근무 중 · {time} 출근",
  "leaveTarget": "목표 퇴근 {time}",
  "beforeWork": "출근 전",
  "done": "오늘 근무 완료 · {duration}",
  "clockOut": "퇴근하기",
  "clockIn": "출근하기"
}
```

NavMenu/Header/NowWorkingBar 의 노출 문자열을 위 키로 대체.

- [ ] **Step 8: 대조/빌드/Commit**

`yarn dev` → 아무 페이지에서나 목업 `dashboard.html` 의 셸(사이드바·헤더·working bar)과 대조. 브라우저 폭을 줄여 모바일 dock 확인.

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 앱 셸 리디자인 - 다크 사이드바, 헤더, Now-Working Bar, 모바일 dock"
```

---

### Task 4: 대시보드

**Files:**
- Modify: `src/app/(user)/dashboard/page.tsx` 및 `src/app/(user)/dashboard/_components/*` (WeeklySummaryCards, WorkingRecordContents 등 — 디렉토리 내 실제 파일 확인 후)
- Modify: `messages/ko.json` (`dashboard` 네임스페이스)

**Mockup:** `docs/design/mockups/dashboard.html`

**Interfaces:**
- Consumes: `PageHeader`, `StatCard`, `WorkingTimeView`(Task 2), 셸(Task 3). 기존 `WorkingTimeProvider` 와 query 로직 그대로.

- [ ] **Step 1: 목업 Read 후 구현**

- 페이지 헤더: `PageHeader(eyebrow="Dashboard", title=주간 근로 시간 타이틀, actions=<WorkingTimeView/>)`.
- Hero 카드: `rounded-lg p-7 bg-gradient-to-br from-[#14371f] to-base-200 shadow-[0_8px_8px_rgba(0,0,0,0.3)]` — 큰 누적시간 숫자(44px bold) + 상태 pill(순항=green tint badge / 분발=warning tint) + 누적/예상 progress 2줄 (기존 계산 로직 유지).
- 보상휴가 카드: `StatCard(highlight)` + "사용 내역 보기" `btn btn-outline btn-sm rounded-full`.
- 주간 테이블: 목업의 트랙리스트 스타일 — thead `text-[11px] uppercase tracking-[1.4px] text-base-content/60 border-b border-white/10`, 행 hover `bg-white/[0.04]`, 오늘 행 `bg-primary/[0.07]`, 구분 배지(Work=gray tint/연차·반차=info tint/휴일=gray), 근무시간 mini progress(정상=primary, 미달=warning), 상태 dot(green/red/gray), "근무 중…" green bold pulse.
- 기존 light 색(slate/white/blue 하이라이트) 전부 제거.

- [ ] **Step 2: 문자열 추출** — 이 페이지 노출 문자열(예: "근로 시간", "누적 근무 시간", "예상 근무 시간", "보상휴가 잔여", "이번 달 기준", "사용 내역 보기", "주간 근태 상세 내역", "해당 주 {count}건", "지난 주", "다음 주", "근무 중...", 상태 pill 문구)을 `dashboard.*` 키로 추출.

- [ ] **Step 3: 대조/빌드/Commit**

`yarn dev` → `/dashboard` 를 목업과 나란히 대조 (hero 그라데이션, 테이블 배지/dot, 오늘 행 하이라이트).

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 대시보드 Spotify 다크 리디자인 및 문자열 추출"
```

---

### Task 5: 근무 일정 + 일정 추가 모달

**Files:**
- Modify: `src/app/(user)/schedule/page.tsx` 및 `src/app/(user)/schedule/_components/*` (ScheduleContents, AddScheduleButton 등)
- Modify: `src/app/(user)/schedule/add/page.tsx`, `src/app/(user)/@modal/(.)schedule/add/page.tsx` 의 모달 컴포넌트(AddScheduleModal)
- Modify: `messages/ko.json` (`schedule` 네임스페이스)

**Mockup:** `docs/design/mockups/schedule.html`, `docs/design/mockups/schedule-add.html`

- [ ] **Step 1: 타임라인 리디자인** — Gantt 그리드: 시간축 헤더 `text-[10px] text-base-content/40`, 요일 라벨(토=info, 일=error), 상태 아이콘(완료=✓ primary, 예정=시계 muted, 연차=😴 info, 경고=⚠ warning), 근무 바 = `rounded-full h-3` (정상 `bg-white/25`, 근무중 우측 끝 green glow, 경고 `bg-warning/40`), 연차 행은 바 없이 info 배지. 고정폭 `w-[1152px]` 유지하되 wrapper 에 `overflow-x-auto`.
- [ ] **Step 2: 모달 리디자인** — daisyUI `<dialog>` 유지, 패널 `bg-[#252525] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.5)]`. 구분 선택을 Dropdown 에서 목업의 **stacked pill-row** (선택 = `ring-1 ring-primary bg-primary/10`) 로, 일자 버튼 pill + react-day-picker 캘린더 다크 스타일 (선택일 `bg-primary text-primary-content rounded-full`). 취소=`btn-ghost`, 추가=`btn-primary` (disabled/loading 상태 로직 유지).
- [ ] **Step 3: 문자열 추출** — "근무 일정", "추가", "근무 일정 추가", "구분", "일자", "없음/연차/오전 반차/오후 반차", "취소", "추가중" 등 → `schedule.*`.
- [ ] **Step 4: 대조/빌드/Commit** — `/schedule` 과 "+ 추가" 클릭(인터셉트 모달), 새로고침(전체 페이지 fallback) 모두 목업과 대조.

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 근무 일정 타임라인 및 일정 추가 모달 다크 리디자인"
```

---

### Task 6: 결재 목록 2종 (내 결재 문서 / 결재 처리)

**Files:**
- Modify: `src/app/(user)/documents/page.tsx` + `_components/DocumentListContents.tsx`, `DocumentResult.tsx` (실제 파일명 디렉토리에서 확인)
- Modify: `src/app/(user)/approvals/page.tsx` + `_components/DocumentApprovalContents.tsx`, `DocumentApprovalResult.tsx`
- Modify: `messages/ko.json` (`documents`, `approvals` 네임스페이스)

**Mockup:** `docs/design/mockups/documents.html`, `docs/design/mockups/approvals.html`

**Interfaces:**
- Consumes: `PageHeader`, `PillFilter`, `Pagination`, `DocumentStatusBadge`, `DocumentTypeBadge` (Task 2 리스타일 완료 상태).

- [ ] **Step 1: 두 페이지 공통 패턴 적용** — `PageHeader` + 카드(`bg-base-300 rounded-lg p-5`) 안에 PillFilter 2줄 → 트랙리스트 테이블(thead uppercase muted, 행 hover, `#id` 문서번호 bold, ··· 버튼 원형) → Pagination. 빈 상태/스켈레톤은 다크 토큰으로 (`bg-white/5 animate-pulse`). approvals 는 신청자 컬럼(이름 + position muted) 추가된 동일 구조.
- [ ] **Step 2: 문자열 추출** — 타이틀/서브타이틀/필터 라벨(전체·휴가계·휴일근무보고서·초안·진행·승인·반려)/빈 상태 문구/총 건수 → `documents.*`, `approvals.*` (공통 필터 라벨은 `common.filter.*` 로).
- [ ] **Step 3: 대조/빌드/Commit** — 필터 클릭·페이지네이션 동작 확인 포함.

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 결재 문서/결재 처리 목록 다크 리디자인"
```

---

### Task 7: 휴가 신청

**Files:**
- Modify: `src/app/(user)/dayoff/requests/page.tsx` + `_components/*` (UserLeaveEntryContents, 설정 패널, 캘린더, 요약 바, SelectUserCompLeaveEntriesModal)
- Modify: `messages/ko.json` (`dayoff.request` 네임스페이스)

**Mockup:** `docs/design/mockups/dayoff-requests.html`

- [ ] **Step 1: 구현** — 잔여 stat 4장 = `StatCard` (잔여 연차만 `highlight`). 좌측 설정 패널: 연차 구분 3장 stacked 선택 카드(선택 = `ring-1 ring-primary bg-primary/10`), 부가 구분 pill-row, 사유 pill input(`rounded-full bg-base-300 shadow-[inset_0_0_0_1px_#7c7c7c]`). 우측 캘린더: react-day-picker range 다크 (선택 범위 `bg-primary/20`, 양끝 `bg-primary text-primary-content rounded-full`). 하단 요약 바: 카드 안 inline stats (사용 후 잔여 음수 시 `text-error`) + 취소/초안 생성(btn-primary). 보상 휴가 선택 모달: 다크 패널 + 체크박스 테이블.
- [ ] **Step 2: 문자열 추출** — 카드 라벨/설정 패널 라벨/검증 문구("선택해 주세요" 등)/요약 라벨/버튼 문구 → `dayoff.request.*`.
- [ ] **Step 3: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 휴가 신청 페이지 다크 리디자인"
```

---

### Task 8: 휴가 사용 내역

**Files:**
- Modify: `src/app/(user)/dayoff/used/page.tsx` + `_components/*`
- Modify: `messages/ko.json` (`dayoff.used` 네임스페이스)

**Mockup:** `docs/design/mockups/dayoff-used.html`

- [ ] **Step 1: 구현** — `PageHeader(actions="+ 휴가 신청" btn-primary)`, 연도 navigator(원형 화살표 + "{year}년" bold), stat 2장(총 사용일 + 종류별 tint 칩 [연차=info, 보상=warning], 잔여 연차 highlight + 만료일 caption), 상세 테이블(종류 배지 tint 동일 규칙, 상태 배지 = DocumentStatusBadge 색 규칙).
- [ ] **Step 2: 문자열 추출** → `dayoff.used.*`.
- [ ] **Step 3: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 휴가 사용 내역 페이지 다크 리디자인"
```

---

### Task 9: 결재 상세 3종 (휴가/휴일근무/결재 처리) — 공통 패턴

**Files:**
- Modify: `src/domain/approval/components/ApprovalLines.tsx`
- Modify: `src/app/(user)/dayoff/[id]/page.tsx` + `_components/*`
- Modify: `src/app/(user)/overtime/[id]/page.tsx` + `_components/*`
- Modify: `src/app/(user)/approvals/[id]/page.tsx` + `_components/ApprovalProceedContents.tsx`, `ApproveModal.tsx`, `RejectModal.tsx`, `CancelConfirmModal.tsx` (+ dayoff/overtime 의 PressApprovalModal, RequestConfirmModal)
- **금지:** `src/domain/document/components/VacationDocument.tsx`, `OverTimeWorkDocument.tsx` 내부 스타일 변경 (흰 A4 유지 — 감싸는 래퍼만 변경)
- Modify: `messages/ko.json` (`approval.detail` 네임스페이스)

**Mockup:** `docs/design/mockups/dayoff-detail.html`, `overtime-detail.html`, `approval-detail.html`

- [ ] **Step 1: ApprovalLines 리디자인** — daisyUI steps 의존을 목업의 커스텀 가로 스텝으로: 완료=✓ `bg-primary text-primary-content` 원형, 현재(WAITING)=orange ring + "현재" warning-tint 배지, 미도달=회색 hollow 원, 반려=✕ `bg-error`, 스텝 간 연결선 `bg-white/10` (완료 구간 primary). 상태 표현 (NOT_YET/WAITING/APPROVED/REJECTED + 반려 사유 red 텍스트) 전부 유지.
- [ ] **Step 2: 3개 페이지 공통 적용** — 카드 1(결재 상태)·카드 2(액션 트리오)·카드 3(문서)을 다크 카드로. 액션 버튼: 빨리 진행시켜줘=`btn-outline` warning 텍스트, 신청하기=`btn-primary`(DRAFT 만 활성 — 기존 로직), PDF 다운로드=`btn-outline`, 승인=`btn-primary`, 반려=`btn-outline` error 텍스트, 취소=`btn-ghost`. 비활성 tooltip 유지. **A4 문서는 흰 배경 그대로** — 래퍼만 `bg-base-300 rounded-lg p-6` + heavy shadow, 문서에 `shadow-[0_8px_24px_rgba(0,0,0,0.5)]`. 확인 모달들 다크 패널로.
- [ ] **Step 3: PDF 회귀 확인** — 휴가계 상세에서 PDF 다운로드 실행, 산출물이 기존과 동일한 흰 문서인지 확인 (html2canvas-pro 캡처 대상에 다크 스타일이 새지 않았는지).
- [ ] **Step 4: 문자열 추출** — 페이지 타이틀/카드 헤더("현재 결재 상태")/버튼 문구/모달 문구 → `approval.detail.*`.
- [ ] **Step 5: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 결재 상세 3종 다크 리디자인 (A4 문서 흰 배경 보존)"
```

---

### Task 10: 휴일근무보고서 신청

**Files:**
- Modify: `src/app/(user)/overtime/requests/page.tsx` + `_components/*` (SelectUserModal 포함)
- Modify: `messages/ko.json` (`overtime.request` 네임스페이스)

**Mockup:** `docs/design/mockups/overtime-requests.html`

- [ ] **Step 1: 구현** — 단일 카드(max-w 800): 등록 여부 pill toggle group(선택=primary), 인원 선택 pill 버튼/pill input, 근무일 pill 버튼 + 다크 DayPicker popover, 시간 select 4개 = pill select(`rounded-full bg-base-300 shadow-inset`), 보상휴가 daisyUI toggle(`toggle-primary`), "+ 목록에 추가" outline full-width. 추가 내역 테이블: 트랙리스트 스타일 + 보상휴가 "적용" green tint 칩 + 삭제 ×(원형 ghost). 빈 상태 다크. SelectUserModal 다크 패널.
- [ ] **Step 2: 문자열 추출** → `overtime.request.*`.
- [ ] **Step 3: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 휴일근무보고서 신청 페이지 다크 리디자인"
```

---

### Task 11: 프로필

**Files:**
- Modify: `src/app/(user)/profile/page.tsx` + `_components/*` (PersonalInfoContents, UpdatePasswordContents, UpdateUserSignatureContents, UpdateAvatarModal, UpdateSignatureModal)
- Modify: `messages/ko.json` (`profile` 네임스페이스)

**Mockup:** `docs/design/mockups/profile.html`

- [ ] **Step 1: 구현** — 3개 다크 카드: 개인 정보(원형 아바타 + "아바타 변경" outline, 읽기 전용 필드 grid — 라벨 uppercase muted / 값 15px), 패스워드 변경(pill input 2개 + 눈 토글 유지, 불일치 에러 `text-error` + `ring-error`, "변경" btn-primary), 결재 서명(dashed `border-white/20` 프리뷰 박스, 빈 상태 문구, 투명 배경 경고 `text-warning`, "서명 등록" outline). 업로드 모달 2종: 다크 패널 + dropzone `border-dashed border-white/20 hover:border-primary`.
- [ ] **Step 2: 문자열 추출** → `profile.*` ("아바타 변경", "새 패스워드", "패스워드가 일치하지 않습니다", "서명이 등록되지 않았습니다" 등).
- [ ] **Step 3: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 프로필 페이지 다크 리디자인"
```

---

### Task 12: 근태 처리 (QR 체크 결과 / GPS)

**Files:**
- Modify: `src/app/(user)/attendance/record/[checkId]/_components/AttendanceRecordContents.tsx` (+ page)
- Modify: `src/app/(user)/attendance/record/gps/_components/AttendanceRecordGpsContents.tsx` (+ page, AttendanceRecordResult)
- Modify: `messages/ko.json` (`attendance.record` 네임스페이스)

**Mockup:** `docs/design/mockups/attendance-record.html`, `attendance-gps.html`

- [ ] **Step 1: 구현** — record: 중앙 성공 스테이트 — green 원형 ✓(glow: `shadow-[0_0_40px_rgba(30,215,96,0.35)]`) + 24px bold 헤딩 + 정보 카드(라벨/값 rows). 실패는 `bg-error` ✕ 동일 패턴. gps: 중앙 컬럼(max-w 480): 장소 PillFilter, 출근/퇴근 `btn-lg`(선택=primary/비선택=outline), 토큰 정보 카드 + green pulse "자동 갱신" 표시, 진행하기 `btn-lg btn-primary` full-width, 결과 카드. 로딩 스피너는 daisyUI `loading-infinity text-primary`.
- [ ] **Step 2: 문자열 추출** → `attendance.record.*` ("출근 처리되었습니다.", "근무일", "출근 시간", "퇴근 예정 시간", "잘못된 접근입니다.", "장소", "진행하기", "진행중" 등).
- [ ] **Step 3: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 근태 처리 (QR/GPS) 다크 리디자인"
```

---

### Task 13: 관리자 — 임직원 근무 현황 그리드

**Files:**
- Modify: `src/app/(manager)/attendance/view/page.tsx` + `_components/AllEmployeesGrid.tsx` (실제 파일명 확인)
- Modify: `messages/ko.json` (`manager.attendance` 네임스페이스)

**Mockup:** `docs/design/mockups/manager-attendance.html`

- [ ] **Step 1: 구현** — `PageHeader(actions=WorkingTimeView)`, "최근 갱신" 우측 muted. 테이블 카드: sticky 임직원 컬럼(`bg-base-300` 유지하며 sticky), 헤더 오늘 컬럼 green 텍스트/주말 muted, 셀: 출근/퇴근 2줄 + 상태 dot(완료=primary, 경고=error dot + `bg-error/[0.06]` 셀), "근무 중" green bold, 연차/반차 info tint 배지, 휴일 gray, 범례 행. 60s 자동 갱신 로직 유지.
- [ ] **Step 2: 문자열 추출** → `manager.attendance.*`.
- [ ] **Step 3: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 임직원 근무 현황 그리드 다크 리디자인"
```

---

### Task 14: 관리자 — 임직원 휴가 사용 현황 매트릭스

**Files:**
- Modify: `src/app/(manager)/dayoff/users/vacations/page.tsx` + `_components/*`
- Modify: `messages/ko.json` (`manager.vacations` 네임스페이스)

**Mockup:** `docs/design/mockups/manager-vacations.html`

- [ ] **Step 1: 구현** — 카드 헤더(타이틀 + 연도 navigator), 가로 스크롤 13px 테이블: sticky 좌측 컬럼, `DualValue` "3(1)" 패턴 — 본값 white / 괄호 보상값 `text-warning`, 0 은 "—" muted, 잔여 컬럼 bold green. 스켈레톤/빈 상태 다크.
- [ ] **Step 2: 문자열 추출** → `manager.vacations.*`.
- [ ] **Step 3: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 임직원 휴가 사용 현황 매트릭스 다크 리디자인"
```

---

### Task 15: 채팅 (임직원 목록 / 1:1 채팅룸)

**Files:**
- Modify: `src/app/(manager)/chat/users/page.tsx` + `_components/*`
- Modify: `src/app/(manager)/chat/users/[uniqueId]/page.tsx` + `_components/ChatUserContents.tsx`
- Modify: `src/domain/chat/components/ChatMessage.tsx` (실제 파일명 확인)
- Modify: `messages/ko.json` (`chat` 네임스페이스)

**Mockup:** `docs/design/mockups/manager-chat.html`, `manager-chat-room.html`

- [ ] **Step 1: 구현** — 목록: 테이블 → 아바타 리스트 rows(그라데이션 아바타 원형 + 이름 bold + 팀·직급 muted + 우측 ›, hover `bg-white/[0.04]`), 새 메시지 green dot 배지. 채팅룸: 카드(`bg-base-300 rounded-lg` flex column), 시스템 배지 중앙 gray pill, 수신 버블 `bg-[#252525] rounded-2xl` + 아바타/이름/시각, 발신 버블 `bg-primary text-primary-content`, 입력 pill input + 원형 green 전송 버튼. WebSocket 로직 불변.
- [ ] **Step 2: 문자열 추출** → `chat.*` ("메세지를 입력해주세요", "전송", 시스템 메시지 문구).
- [ ] **Step 3: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: 임직원 채팅 목록/채팅룸 다크 리디자인"
```

---

### Task 16: QR 코드 생성

**Files:**
- Modify: `src/app/(manager)/qr/page.tsx` + `_components/*`
- Modify: `messages/ko.json` (`manager.qr` 네임스페이스)

**Mockup:** `docs/design/mockups/qr.html`

- [ ] **Step 1: 구현** — 중앙 컬럼: 출근/퇴근 `btn-lg` 토글(선택=primary), 정보 카드(근무일/생성일/만료일 rows + green pulse "자동 갱신 중"), **QR 은 흰 패널(`bg-[#fdfdfd] rounded-xl p-5`) 위에** — qr-code-styling 캔버스는 로직 그대로 (dot 색상만 `#121212` 로 변경 검토 — 스캔 대비 확보), 캡션 muted. 1s 만료 재생성 로직 불변.
- [ ] **Step 2: 문자열 추출** → `manager.qr.*`.
- [ ] **Step 3: 대조/빌드/Commit**

```bash
yarn lint && yarn build
git add -A
git commit -m "feat: QR 코드 생성 페이지 다크 리디자인"
```

---

### Task 17: 최종 스윕 + 검증 게이트

**Files:** 스윕에서 발견된 잔재 파일들, `docs/agents/libs/theme.md`

- [ ] **Step 1: 라이트 테마 잔재 스윕**

```bash
grep -rn "bg-white\|bg-slate\|text-slate\|border-slate\|bg-gray-\|data-theme=\"light\"\|slate-50\|slate-900" src --include="*.tsx" --include="*.ts" --include="*.css"
grep -rn "setTheme\|themeAction\|theme.*cookie\|COOKIE_NAME_THEME" src --include="*.tsx" --include="*.ts"
```

Expected: **A4 문서 컴포넌트(`VacationDocument`, `OverTimeWorkDocument`, `UserSignature`) 와 QR 흰 패널 외에는 0건.** 나머지는 전부 다크 토큰으로 수정.

- [ ] **Step 2: 에러/404/forbidden/로딩 화면 확인** — `src/app/error.tsx`, `not-found.tsx`, `forbidden.tsx`, `loading.tsx` 가 다크 토큰으로 렌더되는지 확인, 필요 시 `Preparing` 과 동일한 empty-state 스타일로 정리.

- [ ] **Step 3: 전 페이지 목업 대조 QA** — `yarn dev` + `npx serve docs/design/mockups` 를 동시에 띄우고 22개 화면을 순회 대조. 데스크톱 + 모바일 폭(390px) 각각. 이슈는 해당 태스크 커밋 범위로 수정.

- [ ] **Step 4: 테마 문서 갱신** — `docs/agents/libs/theme.md` 를 다크 온리(`ontime-dark` 고정, cookie/토글 없음) 로 갱신. `docs/agents/libs/tailwind-daisyui.md` 의 theme cookie 관련 서술도 확인·갱신.

- [ ] **Step 5: 최종 빌드/커밋**

```bash
rm -rf .next && yarn build && yarn lint
git add -A
git commit -m "feat: 다크 리디자인 최종 스윕 및 문서 갱신"
```
