---
title: Tailwind 4 + daisyUI 5
scope: src/**/*.{tsx,css}
applies_to: styling components, design tokens, theme handling
related:
  - ./theme.md
  - ../conventions/react-sections.md
  - ../structure.md
---

# Tailwind 4 + daisyUI 5

> 조건부 class 는 `classnames` (`import cx from 'classnames'`). daisyUI 토큰 (`btn`, `badge`, `menu`, `dropdown`, `modal`) 을 raw Tailwind 보다 우선. 색/그림자는 `src/app/globals.css` 의 CSS 변수와 `@utility` 만 사용 — 컴포넌트에 hex/rgba 리터럴 금지. 테마는 `theme` cookie 기반 `data-theme`.

## Basics

- Compose class names with `classnames` (`import cx from 'classnames'`). Do not hand-concatenate template strings for conditional classes.
- Prefer daisyUI components/tokens (`btn`, `badge`, `menu`, `dropdown`, `modal`, ...) before reaching for raw Tailwind primitives.
- All global styling lives in `src/app/globals.css`: daisyUI theme 선언, 토큰 CSS 변수, `@utility` 정의, keyframes, `react-day-picker` 스타일.

## Themes

`globals.css` 는 daisyUI theme 를 **두 개** 선언한다 — 이름은 `light` / `dark` 뿐이며 커스텀 테마 이름은 없다.

```css
@plugin 'daisyui/theme' {
  name: 'light';
  default: true;
  ...
}
@plugin 'daisyui/theme' {
  name: 'dark';
  prefersdark: false;
  ...
}
```

- `prefersdark: false` — **OS `prefers-color-scheme` 자동 전환은 사용하지 않는다.** 테마는 오직 `theme` cookie 로만 결정된다.
- `src/app/layout.tsx` 가 cookie 를 읽어 `<html lang={htmlLang} data-theme={theme}>` 에 적용하고, 같은 값을 `<Header theme={theme} />` 로 내려보낸다.
- 전환은 `src/app/themeAction.ts` 의 `setTheme` server action (`revalidatePath('/', 'layout')` 포함), UI 는 `src/shared/components/theme/ThemeSwitcher.tsx`. 자세한 흐름은 [Theme](./theme.md).
- 두 테마의 daisyUI 변수는 `--radius-field: 0.75rem` (= 12px), `--radius-box: 0.75rem`, `--radius-selector: 0.5rem`, `--depth: 0`, `--noise: 0` 로 동일하다. 값이 다른 것은 색뿐이다.

## Token custom properties

daisyUI 변수로 표현되지 않는 보조 색/그림자는 `globals.css` 의 `:root, [data-theme='light']` / `[data-theme='dark']` 두 블록에 **쌍으로** 정의한다. 새 토큰을 추가할 때 한쪽만 정의하면 다른 테마에서 값이 없다.

| 변수 | 용도 |
| --- | --- |
| `--text-2` | 보조 텍스트 (라벨, 캡션) |
| `--text-3` | 3차 텍스트 (eyebrow, 테이블 헤더) |
| `--border-soft` | 카드/행 구분선 |
| `--primary-subtle` | primary 반투명 배경 (badge, chip, focus glow) |
| `--primary-soft` | primary 불투명 옅은 배경 |
| `--success-soft` / `--success-text` | 승인·정상 badge 배경/글자 |
| `--warning-soft` / `--warning-text` | 대기 badge 배경/글자 |
| `--error-soft` | 반려·오류 badge 배경 (글자는 `--color-error`) |
| `--neutral-soft` | 중립 badge 배경 |
| `--shadow-whisper` | 카드 기본 그림자 |
| `--shadow-micro` | 1px 급 미세 그림자 |

## Token utilities

`@utility` 로 감싼 것만 class 로 쓴다. 인라인 `style` 로 변수를 직접 쓰는 것은 utility 가 없는 경우 (예: `Badge` 의 variant 별 배경/글자색 조합) 로 제한한다.

| Utility | 대응 |
| --- | --- |
| `text-2` / `text-3` | `color: var(--text-2 / --text-3)` |
| `border-soft` | `border-color: var(--border-soft)` |
| `bg-primary-subtle` / `bg-primary-soft` | primary 계열 배경 |
| `shadow-whisper` / `shadow-micro` | 토큰 그림자 |
| `btn-subtle` | primary-subtle 배경 + primary 글자 버튼. hover 는 utility 안에 `color-mix` 로 내장되어 있으므로 별도 `hover:` class 를 붙이지 않는다 |
| `eyebrow` | 11px / 600 / letter-spacing 1.6px / uppercase / `--text-3` — `PageHeader` 의 상단 라벨 |

애니메이션 utility (`animate-fade-up`, `delay-150|225|300`) 도 같은 파일에 있다. `prefers-reduced-motion: reduce` 전역 가드가 이미 걸려 있으므로 컴포넌트에서 따로 분기하지 않는다.

## Styling rules

1. **No hex / rgba literals outside `globals.css`.** 새 색이 필요하면 토큰 변수부터 추가한다. 현재 sanctioned 예외는 두 개뿐이다.
   - A4 미리보기 wrapper 의 `shadow-[0_8px_32px_rgba(0,0,0,0.08)]` — 종이 그림자라 테마와 무관 (`approvals/[id]/page.tsx`, `dayoff/[id]`, `overtime/[id]` 의 Contents).
   - `src/app/(manager)/qr/_components/QRContents.tsx` 의 QR dot 색 문자열 — `qr-code-styling` 이 CSS 변수를 받지 못한다.

   `src/app/manifest.ts` 의 `background_color` / `theme_color` 는 CSS 가 아니라 PWA manifest 값이며, frozen A4 컴포넌트 내부 (아래 참조) 도 이 규칙 밖이다.
2. **Buttons: radius ≤ 12px, never `rounded-full`.** daisyUI `btn` 은 `--radius-field: 0.75rem` 를 그대로 쓴다. 원형은 아바타·상태 dot·stepper 노드·아이콘 전용 컨트롤에만 허용한다 (텍스트 버튼에는 금지).
3. **Badges go through a component, never ad-hoc.** `src/shared/components/Badge.tsx` (variant: `ok` / `wait` / `no` / `neutral` / `primary`, `rounded-md` = 6px) 와 그 위에 얹은 `DocumentStatusBadge`, `DocumentTypeBadge`, `AttendanceStatusBadge` 만 사용한다. 새 상태 표기는 variant 를 추가하거나 도메인 badge 를 새로 만든다.
4. **Table 은 클래스 상수를 공유한다.** `src/shared/components/Table.tsx` 의 `thClass` / `tdClass` / `rowClass` / `TableSkeletonRows` 를 쓰고, 목록마다 셀 padding·border 를 새로 쓰지 않는다.

## Frozen A4 components

PDF 캡처 (`html2canvas-pro` + `jspdf`) 대상 문서 컴포넌트는 **테마를 따르지 않는다.** 항상 흰 배경 / 검은 글자로 고정한다 — 다크 테마에서 캡처해도 인쇄 가능한 문서가 나와야 하기 때문이다.

- `src/domain/document/components/VacationDocument.tsx`
- `src/domain/document/components/OverTimeWorkDocument.tsx`
- `src/domain/document/components/DocumentApprovalLine.tsx`
- `src/domain/users/components/UserSignature.tsx`

이 네 파일에는 토큰 utility (`text-2`, `border-soft`, `shadow-whisper` ...) 를 넣지 않는다. 리디자인 시에도 건드리지 않는 것이 기본이며, 바깥 wrapper (배경, 그림자, 툴바) 만 테마를 따른다.

## react-day-picker

`react-day-picker` 스타일은 `globals.css` 의 `.rdp-theme` 클래스가 담당한다 (구 `.rdp-dark` 에서 이름 변경 — 다크 전용이 아니라 두 테마 모두에 쓰인다). 캘린더를 쓰는 곳은 `<DayPicker className="rdp-theme" ... />` 로 붙인다. range 선택 색은 `.rdp-theme.rdp-root` 2-클래스 선택자로 라이브러리 기본값을 이긴다.
