import { NextRequest, NextResponse } from 'next/server';

import { getAccessToken, getUserinfo } from '@/shared/auth/serverAction';

import ky, { HTTPError } from 'ky';
import 'server-only';

const { API_HOST } = process.env;

export const serverApi = ky.create({
  prefix: API_HOST,
  retry: 0,
  timeout: 30_000,
  hooks: {
    beforeRequest: [
      async ({ request }) => {
        request.headers.set('Authorization', `Bearer ${await getAccessToken()}`);
      },
    ],
  },
});

export function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function currentSub() {
  const user = await getUserinfo();

  return user?.sub;
}

function passthroughResponse(res: Response) {
  return new NextResponse(res.body, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  });
}

export async function forward(
  req: NextRequest,
  override: { path?: string; searchParams?: URLSearchParams; body?: BodyInit | null } = {},
) {
  let accessToken: string;

  try {
    accessToken = await getAccessToken();
  } catch {
    return unauthorized();
  }

  const url = new URL(`${API_HOST}${override.path ?? req.nextUrl.pathname}`);
  url.search = (override.searchParams ?? req.nextUrl.searchParams).toString();

  const hasBody = !['GET', 'HEAD'].includes(req.method);

  const res = await fetch(url, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': req.headers.get('Content-Type') ?? 'application/json',
    },
    body: hasBody ? (override.body ?? req.body) : undefined,
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });

  return passthroughResponse(res);
}

export async function handle(fn: (sub: string) => Promise<unknown>) {
  const sub = await currentSub();

  if (!sub) {
    return unauthorized();
  }

  try {
    return NextResponse.json(await fn(sub));
  } catch (e) {
    if (e instanceof HTTPError) {
      // ky already consumed the response body into `e.data`, so `e.response.body` is disturbed.
      return new NextResponse(typeof e.data === 'string' ? e.data : JSON.stringify(e.data ?? null), {
        status: e.response.status,
        headers: { 'Content-Type': e.response.headers.get('Content-Type') ?? 'application/json' },
      });
    }

    throw e;
  }
}
