import { NextRequest } from 'next/server';

import { ApprovalHistory } from '@/domain/approval/apis/approval.dto';
import { User } from '@/domain/users/apis/users.dto';
import { Page } from '@/shared/api/common.dto';
import { handle, serverApi } from '@/shared/api/server';

export async function GET(req: NextRequest) {
  return handle(async (sub) => {
    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    searchParams.set('userUniqueId', sub);

    const page = await serverApi.get('api/v1/documents/approval', { searchParams }).json<Page<ApprovalHistory>>();

    // 같은 기안자의 문서가 여러 건이어도 사용자 요약은 한 번만 조회한다.
    const userIds = [...new Set(page.content.map((item) => item.document.userUniqueId).filter((id) => !!id))];
    const users = new Map(
      await Promise.all(
        userIds.map(async (id) => [id, await serverApi.get(`api/v1/users/${id}/summary`).json<User>()] as const),
      ),
    );

    const content = page.content.map((item) => ({
      ...item,
      document: { ...item.document, user: users.get(item.document.userUniqueId ?? '') },
    }));

    return { ...page, content };
  });
}
