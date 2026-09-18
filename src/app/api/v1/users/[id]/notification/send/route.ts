import { NextRequest } from 'next/server';

import { handle, serverApi } from '@/shared/api/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  return handle(async () => {
    const user = await serverApi.get(`api/v1/users/${id}/summary`).json<User>();

    await serverApi.post(`api/v1/users/${id}/notification/send`, { json: body });

    return user;
  });
}
