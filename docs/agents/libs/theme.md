---
title: Theme — cookie + server action
scope: src/shared/providers/theme/**, src/shared/components/theme/**, src/app/themeAction.ts, src/app/layout.tsx
applies_to: theme switching, cookie-driven dark mode, theme bridge for UI libraries
related:
  - ./next-intl.md
  - ./tailwind-daisyui.md
---

# Theme — cookie + server action

> 테마는 `theme` cookie 에 저장되어 `<html data-theme={theme}>` 에 적용된다. 변경은 `setTheme` server action (`revalidatePath('/', 'layout')` 포함) 을 통해서만, UI 는 `ThemeSwitcher`. OS `prefers-color-scheme` 자동 전환은 사용하지 않는다. 패턴은 [next-intl](./next-intl.md) 의 locale 변경과 동일 구조.

## Storage

- Cookie 이름: `theme` (server action 은 `COOKIE_NAME_THEME` 상수, root layout 은 literal).
- 값: `Theme = 'light' | 'dark'` (정의: `src/shared/providers/theme/ThemeProvider.tsx` — 타입만 export 하는 파일이며 React provider 는 없다).
- Default: cookie 가 없으면 `'light'`.
- 적용 위치: root layout 의 `<html data-theme={theme}>` — `globals.css` 의 daisyUI theme 두 개 (`light` / `dark`) 와 토큰 변수 블록 (`[data-theme='dark']`) 이 모두 이 attribute 로 분기한다. 토큰은 [Tailwind 4 + daisyUI 5](./tailwind-daisyui.md) 참조.
- `dark` theme 는 `prefersdark: false` 로 선언되어 있다 — OS 설정은 무시하고 cookie 값만 따른다.

## Server action

```ts
// src/app/themeAction.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { Theme } from '@/shared/providers/theme/ThemeProvider';

const COOKIE_NAME_THEME = 'theme';

export async function setTheme(theme: Theme) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME_THEME, theme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 365 days
    sameSite: 'lax',
  });

  revalidatePath('/', 'layout');
}
```

- Client 에서 cookie 를 직접 set 하지 않는다 — 항상 `setTheme(...)` server action 을 호출.
- `revalidatePath('/', 'layout')` 이 root layout 을 다시 렌더링시켜 `<html data-theme>` 이 즉시 갱신된다. 호출부에서 `router.refresh()` 를 따로 부르지 않는다.
- `maxAge` 1년 / `path: '/'` — 선택한 테마가 세션을 넘어 유지된다.

## Switcher UI

```tsx
// src/shared/components/theme/ThemeSwitcher.tsx ('use client')
export default function ThemeSwitcher({ current }: { current: Theme }) // setTheme 을 useTransition 으로 호출
```

- 현재 테마는 context 가 아니라 **prop 으로 내려간다**: root layout 이 cookie 를 읽어 `<Header theme={theme} />` 로 전달하고, `Header` 가 `<ThemeSwitcher current={theme} />` 로 넘긴다.
- 전환 중에는 `useTransition` 의 `isPending` 으로 버튼을 disable 한다.

## Reading in root layout

```tsx
// src/app/layout.tsx (Server Component)
import { cookies } from 'next/headers';

import { Theme } from '@/shared/providers/theme/ThemeProvider';

const COOKIE_NAME_THEME = 'theme';

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();

  const theme = (cookieStore.get(COOKIE_NAME_THEME)?.value ?? 'light') as Theme;

  return (
    <html lang="ko" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
```

## Bridging into UI libraries

3rd-party UI library 가 자체 테마 시스템을 가지면 (예: antd `ConfigProvider`), root layout 에서 cookie 로 읽은 `theme` 값을 해당 provider 에 전달해 SSR 부터 동기 적용한다. 컴포넌트 트리 안에서는 React context 가 아니라 root-supplied prop 으로 받는다.

## Why server action (not client cookie write)

- Cookie 를 client 에서 write 하면 root layout 이 다시 렌더링되지 않아 `<html data-theme>` 이 즉시 갱신되지 않는다.
- Server action 이 cookie 를 갱신하고 `revalidatePath('/', 'layout')` 로 root layout 을 revalidate 하므로 같은 transition 안에서 새 값이 반영된다.
- 같은 이유로 [next-intl](./next-intl.md) 의 `setLocale` 도 동일 패턴을 따른다. 새 cookie-driven 글로벌 상태가 추가되면 이 패턴을 재사용한다.
