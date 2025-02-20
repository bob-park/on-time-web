import { NextRequest, NextResponse } from 'next/server';

const { WEB_SERVICE_HOST } = process.env;

export async function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const { pathname } = nextUrl;

  const sessionId = cookies.get('JSESSIONID');

  const isLogin = await checkAuth(sessionId?.value || '');

  const res = NextResponse.next();

  if (!isLogin) {
    res.cookies.set('lastPage', pathname);
  } else {
    res.cookies.delete('lastPage');
  }

  return res;
}

async function checkAuth(sessionId: string) {
  const result = await fetch(`${WEB_SERVICE_HOST}/users/me`, {
    method: 'GET',
    headers: {
      Cookie: `JSESSIONID=${sessionId}`,
    },
    credentials: 'include',
  });

  return result.ok;
}

export const config = {
  matcher: [],
};
