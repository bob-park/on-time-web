import { NextRequest } from 'next/server';

import { currentSub, forward, unauthorized } from '@/shared/api/server';

export async function GET(req: NextRequest) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  const searchParams = new URLSearchParams(req.nextUrl.searchParams);
  searchParams.set('userUniqueId', sub);

  return forward(req, { searchParams });
}

export async function POST(req: NextRequest) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  const body = await req.json();

  return forward(req, { body: JSON.stringify({ ...body, userUniqueId: sub }) });
}
