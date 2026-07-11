---
title: Theme — dark-only (ontime-dark 고정)
scope: src/app/globals.css, src/app/layout.tsx
applies_to: theme tokens, dark surface styling
related:
  - ./tailwind-daisyui.md
---

# Theme — dark-only (ontime-dark 고정)

> 앱은 단일 다크 테마 `ontime-dark` 로 고정된다. 테마 전환/토글/쿠키는 없다. root layout 이 `<html data-theme="ontime-dark">` 를 하드코딩하고, 모든 색상은 daisyUI 시맨틱 토큰(`base-100/200/300`, `base-content`, `primary`, ...)으로 표현한다.

## Single theme

- 유일한 테마는 `ontime-dark` — daisyUI theme 플러그인으로 `src/app/globals.css` 의 `@plugin 'daisyui/theme'` 블록에 정의된다 (`default: true`, `prefersdark: true`, `color-scheme: 'dark'`).
- root layout 은 값을 하드코딩한다:

```tsx
// src/app/layout.tsx (Server Component)
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" data-theme="ontime-dark">
      <body>{children}</body>
    </html>
  );
}
```

- `theme` cookie, `COOKIE_NAME_THEME`, `setTheme` server action, `ThemeProvider` 는 모두 제거되었다. 클라이언트/서버 어디에서도 테마를 읽거나 쓰지 않는다.

## Color tokens

- Spotify 계열 다크 팔레트를 사용한다. 핵심 토큰은 `globals.css` 의 theme 블록 참조:
  - surface: `--color-base-100` `#121212`, `--color-base-200` `#181818`, `--color-base-300` `#1f1f1f`, `--color-secondary` `#252525`
  - text: `--color-base-content` `#ffffff`
  - accent: `--color-primary` / `--color-accent` `#1ed760` (Spotify green), `--color-primary-content` `#000000`
  - status: `--color-info` `#539df5`, `--color-success` `#1ed760`, `--color-warning` `#ffa42b`, `--color-error` `#f3727f`
- 컴포넌트는 raw hex 대신 시맨틱 클래스(`bg-base-300`, `text-base-content/60`, `text-primary`, `bg-primary/15`, ...)를 사용한다.

## Sanctioned light surfaces

다크 규칙의 예외로, 물리적 종이/스캔을 표현해야 하는 면만 흰색을 유지한다. 신규 화면에서 흰 배경을 쓰지 말 것.

- A4 문서 컴포넌트: `VacationDocument`, `OverTimeWorkDocument`, `UserSignature` (인쇄/PDF 대상, 흰 종이 고정).
- QR 코드 흰 패널, 서명 미리보기(`bg-white`) — 스캐너/서명 이미지 가독성을 위해 흰색 유지.

## Adding a surface

- 새 카드/패널은 `bg-base-300`(또는 `bg-base-200`) + `text-base-content` 계열로 시작한다.
- 경계선·구분선은 `border-white/[0.04]`, hover 는 `bg-white/[0.04]` 같은 translucent white overlay 를 사용한다(다크 위 미세 대비용). 이는 `bg-white` 단색과 다르며 허용된다.
