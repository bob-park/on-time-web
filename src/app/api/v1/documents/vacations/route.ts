import { NextRequest } from 'next/server';

import { VacationDocument } from '@/domain/document/apis/document.dto';
import { PagedModel } from '@/shared/api/common.dto';
import { currentSub, forward, handle, serverApi, unauthorized } from '@/shared/api/server';

export async function GET(req: NextRequest) {
  return handle(async (sub) => {
    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    searchParams.set('userUniqueId', sub);

    const page = await serverApi
      .get('api/v1/documents/vacations', { searchParams })
      .json<PagedModel<VacationDocument>>();

    const content = await Promise.all(
      page.content.map((item) => serverApi.get(`api/v1/documents/vacations/${item.id}`).json<VacationDocument>()),
    );

    return { ...page, content };
  });
}

export async function POST(req: NextRequest) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  const body = await req.json();

  return forward(req, { body: JSON.stringify({ ...body, userUniqueId: sub }) });
}
