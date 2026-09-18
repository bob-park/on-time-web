import { NextRequest } from 'next/server';

import { currentSub, forward, unauthorized } from '@/shared/api/server';

export async function POST(req: NextRequest) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  return forward(req, { path: `/api/v1/users/${sub}/avatar/reset` });
}
