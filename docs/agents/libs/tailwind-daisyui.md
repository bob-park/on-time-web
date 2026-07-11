---
title: Tailwind 4 + daisyUI 5
scope: src/**/*.{tsx,css}
applies_to: styling components, theme handling
related:
  - ../conventions/react-sections.md
---

# Tailwind 4 + daisyUI 5

> 조건부 class 는 `classnames` (`import cx from 'classnames'`). daisyUI 토큰 (`btn`, `badge`, `menu`, `dropdown`, `modal`) 을 raw Tailwind 보다 우선. 테마는 단일 다크 `ontime-dark` 고정.

- Compose class names with `classnames` (`import cx from 'classnames'`). Do not hand-concatenate template strings for conditional classes.
- Prefer daisyUI components/tokens (`btn`, `badge`, `menu`, `dropdown`, `modal`, ...) before reaching for raw Tailwind primitives.
- 앱은 단일 다크 테마 `ontime-dark` 로 고정되어 있다 (`<html data-theme="ontime-dark">`, 토글/쿠키 없음). 색상은 시맨틱 토큰(`bg-base-300`, `text-base-content`, `text-primary`, ...)으로 표현한다. 자세한 내용은 [theme.md](./theme.md).
