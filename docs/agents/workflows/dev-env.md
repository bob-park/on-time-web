---
title: Dev Environment & Lint/Format
scope: package.json, eslint.config.mjs, .mise.toml
applies_to: setting up Node/yarn, running scripts, pre-commit lint/format
related:
  - ../tech-stack.md
  - ./git.md
---

# Dev Environment & Lint/Format

> Node 버전은 `mise` 로 동기화, 패키지 매니저는 corepack `yarn@4.18.0`. 커밋 전 `yarn lint` 필수, 포매팅은 `yarn prettier`. 테스트는 `yarn test` (`node --test`).

## Environment

- **Node version manager:** `mise`. First-time setup: `mise trust && mise ls`.
- **Package manager:** `yarn@4.18.0` via corepack (configured in `package.json#packageManager`).

## Common scripts

- `yarn dev` — start the Next.js dev server
- `yarn build` — production build
- `yarn start` — run the production build
- `yarn lint` — run ESLint against `./src`
- `yarn prettier` — format all source files
- `yarn test` — run `src/**/*.test.ts` with Node's built-in `node --test` (Node 24 strips types natively)

Tests import the module under test with its `.ts` extension (`./foo.ts`), so `*.test.ts` is excluded from `tsconfig.json`. A tested module may use `@/` paths only in `import type` — runtime path aliases don't resolve under `node --test`.

`.yarnrc.yml` sets `npmMinimalAgeGate: 0` (same as license-web), turning off yarn 4.18's one-day quarantine for newly published versions.

## Lint & format

- Run `yarn lint` before committing.
- `yarn prettier` auto-formats `**/*.{js,jsx,ts,tsx,css,html}`.
- The shared `@bob-park/*` ESLint and Prettier configs are authoritative. Do not override them locally without team consensus.
