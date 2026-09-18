---
title: Project Overview
scope: docs/**
applies_to: all agents reading this repository
related:
  - ./tech-stack.md
  - ./structure.md
---

# Project Overview

> OnTime — 전자 근태 관리 시스템 (근무 기록, 근무 일정, 휴가/휴일근무 전자 결재). Next.js App Router app authenticating against the **KeyFlow Authorization Server** via **better-auth** (`genericOAuth` + PKCE) and calling the API gateway (`API_HOST`) through server-side route handlers under `src/app/api/`.

Requests without a valid session are redirected to `/login` by the session guard
(`src/proxy.ts`). The access token is resolved server-side only — it never reaches
the browser.

## API layer

The browser never talks to `API_HOST` directly. Everything goes through route
handlers that attach `Authorization: Bearer` server-side.

- **Generic passthrough** — `src/app/api/[...path]/route.ts` forwards GET/POST/PUT/DELETE
  to `API_HOST` unchanged (via `forward()` in `src/shared/api/server.ts`). This is the
  default path for any 도메인 API that needs no server-side work.
- **BFF-ported aggregations** — handlers under `src/app/api/v1/**` that fan out to several
  upstream calls, inject the current `userUniqueId`, or merge 결재선 data. These replaced
  the former Spring BFF:
  - 사용자 — `users/leave/entries` (GET), `users/used/vacations` (GET),
    `users/comp/leave/entries` (GET), `users/avatar` (POST), `users/avatar/reset` (POST),
    `users/signature` (POST), `users/signature/reset` (POST), `users/password` (POST),
    `users/[id]/notification/send` (POST)
  - 전자 결재 — `documents` (GET), `documents/vacations` (GET, POST),
    `documents/vacations/[id]` (GET), `documents/overtimes` (POST),
    `documents/overtimes/[id]` (GET), `documents/approval` (GET),
    `documents/approval/[id]` (GET, POST). 결재선 merge 로직은
    `src/app/api/v1/documents/_lib/enrichDocument.ts` 를 공유한다.
  - 근태 — `attendance/records` (GET, POST), `attendance/schedules` (POST)

better-auth's own endpoints live at `src/app/api/auth/[...all]/route.ts`, and
`src/app/api/health/route.ts` backs the container healthcheck.

Design rationale and the full handler contract: [better-auth + Next API 계층 설계](../superpowers/specs/2026-09-18-foundation-better-auth-api-design.md).
