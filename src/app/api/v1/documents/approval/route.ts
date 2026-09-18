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

    const content = await Promise.all(
      page.content.map(async (item) => {
        const user = await serverApi.get(`api/v1/users/${item.document.userUniqueId}/summary`).json<User>();

        return { ...item, document: { ...item.document, user } };
      }),
    );

    return { ...page, content };
  });
}
