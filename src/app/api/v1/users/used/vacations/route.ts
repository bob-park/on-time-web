import { NextRequest } from 'next/server';

import { VacationDocument } from '@/domain/document/apis/document.dto';
import { UsedVacation, UserEmployment } from '@/domain/users/apis/users.dto';
import { PagedModel } from '@/shared/api/common.dto';
import { handle, serverApi } from '@/shared/api/server';

export async function GET(req: NextRequest) {
  return handle(async () => {
    const year = Number(req.nextUrl.searchParams.get('year') ?? new Date().getFullYear());

    const employments = await serverApi
      .get('api/v1/users/employments', { searchParams: { page: 0, size: 100 } })
      .json<PagedModel<UserEmployment>>();

    return Promise.all(
      employments.content.map(async (employment) => {
        const vacations = await serverApi
          .get('api/v1/documents/vacations', {
            searchParams: {
              userUniqueId: employment.userUniqueId,
              startDateFrom: `${year}-01-01`,
              endDateTo: `${year}-12-31`,
              status: 'APPROVED',
              page: 0,
              size: 100,
            },
          })
          .json<PagedModel<VacationDocument>>();

        const byMonth = new Map<number, UsedVacation>();

        for (const vacation of vacations.content) {
          const month = Number(String(vacation.startDate).slice(5, 7));
          const item = byMonth.get(month) ?? { month, used: 0, usedComp: 0 };

          if (vacation.vacationType === 'GENERAL') item.used += vacation.usedDays;
          if (vacation.vacationType === 'COMPENSATORY') item.usedComp += vacation.usedDays;

          byMonth.set(month, item);
        }

        return { userUniqueId: employment.userUniqueId, year, usedVacations: [...byMonth.values()] };
      }),
    );
  });
}
