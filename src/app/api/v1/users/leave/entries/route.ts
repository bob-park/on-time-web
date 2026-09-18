import { NextRequest } from 'next/server';

import { User, UserEmployment, UserLeaveEntry } from '@/domain/users/apis/users.dto';
import { Page } from '@/shared/api/common.dto';
import { handle, serverApi } from '@/shared/api/server';

import { HTTPError } from 'ky';

export async function GET(req: NextRequest) {
  return handle(async () => {
    const year = req.nextUrl.searchParams.get('year') ?? String(new Date().getFullYear());

    const employments = await serverApi
      .get('api/v1/users/employments', { searchParams: { status: 'ACTIVE', page: 0, size: 100 } })
      .json<Page<UserEmployment>>();

    const users = await Promise.all(
      employments.content.map(async (employment) => {
        const user = await serverApi.get(`api/v1/users/${employment.userUniqueId}/summary`).json<User>();

        try {
          const leaveEntry = await serverApi
            .get(`api/v1/users/${employment.userUniqueId}/leave/entries`, { searchParams: { year } })
            .json<UserLeaveEntry>();

          return { ...user, leaveEntry, employment };
        } catch (e) {
          if (e instanceof HTTPError && e.response.status === 404) {
            return null;
          }

          throw e;
        }
      }),
    );

    return users.filter((user) => user !== null);
  });
}
