import type { auth } from '@/shared/auth/index';

import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// .env 의 BETTER_AUTH_URL 은 컨테이너 런타임에 치환되는 placeholder 라 빌드 시점에 URL 로 파싱할 수 없다.
// 이 client 는 브라우저에서만 호출되므로 항상 현재 origin 을 사용한다.
export const authClient = createAuthClient({
  baseURL: typeof window === 'undefined' ? 'http://localhost' : window.location.origin,
  plugins: [inferAdditionalFields<typeof auth>()],
});
