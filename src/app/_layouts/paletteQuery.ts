import type { DocumentsType } from '@/domain/document/apis/document.dto';

// node --test 로 직접 실행되므로 `@/` 경로는 type import 만 사용한다.

export type PaletteQuery = { type?: DocumentsType; nameTokens: string[] };

export const TYPE_KEYWORDS: Record<DocumentsType, string[]> = {
  VACATION: ['휴가', '연차', '반차'],
  OVERTIME_WORK: ['휴일', '연장', '근무'],
};

function findType(token: string): DocumentsType | undefined {
  return (Object.keys(TYPE_KEYWORDS) as DocumentsType[]).find((type) =>
    TYPE_KEYWORDS[type].some((keyword) => token.includes(keyword)),
  );
}

// 문서 종류 키워드는 type 으로, 나머지는 기안자 이름 토큰으로 나눈다. 첫 종류 키워드만 적용한다.
export function parsePaletteQuery(input: string): PaletteQuery {
  let type: DocumentsType | undefined = undefined;
  const nameTokens: string[] = [];

  for (const token of input.trim().split(/\s+/).filter(Boolean)) {
    const tokenType = findType(token);

    if (!tokenType) {
      nameTokens.push(token.toLowerCase());
    } else if (!type) {
      type = tokenType;
    }
  }

  return { type, nameTokens };
}

export function matchesDrafter(username: string | undefined, nameTokens: string[]): boolean {
  if (!nameTokens.length) {
    return true;
  }

  const name = username?.toLowerCase();

  return !!name && nameTokens.every((token) => name.includes(token));
}

export function matchesLabel(label: string, input: string): boolean {
  const query = input.trim().toLowerCase();

  return !!query && label.toLowerCase().includes(query);
}
