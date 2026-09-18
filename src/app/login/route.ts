import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/shared/auth';

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('callback');
  // 오픈 리다이렉트 방지: 같은 origin 의 상대 경로만 허용
  const callback = raw?.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  const { url } = await auth.api.signInSocial({
    body: {
      provider: 'keyflow-auth',
      callbackURL: callback,
    },
    headers: request.headers,
  });

  return NextResponse.redirect(url || '');
}
