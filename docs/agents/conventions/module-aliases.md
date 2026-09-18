---
title: Module & Path Aliases
scope: src/**/*.{ts,tsx}
applies_to: import statements across folders
related:
  - ./naming.md
  - ../structure.md
---

# Module & Path Aliases

> Cross-folder import 는 `@/...` alias, same-folder import 는 상대경로 (`*.dto.ts` 는 예외로 alias). import 순서는 ESLint 가 강제한다.

- Use the `@/...` alias (tsconfig `paths`) for cross-folder imports.
- Use relative paths only within the same folder — except `*.dto.ts`, which is imported
  through the `@/...` alias even from a sibling file
  (`import { User } from '@/domain/users/apis/users.dto';` inside `apis/users.ts`),
  matching the template.
- Import ordering is enforced by the shared ESLint/Prettier config — do not override locally.
