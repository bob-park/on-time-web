import { cookies } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';

const { WEB_SERVICE_HOST } = process.env;

const ALLOW_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

export default async function ManagerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();

  const res = await fetch(`${WEB_SERVICE_HOST}/users/me`, {
    method: 'get',
    headers: {
      Cookie: `JSESSIONID=${cookieStore.get('JSESSIONID')?.value || ''}`,
    },
  });

  if (!res.ok) {
    redirect('/api/oauth2/authorization/keyflow-auth');
  }

  const user = (await res.json()) as User;

  if (!ALLOW_ROLES.includes(user?.role.type || '')) {
    forbidden();
  }

  return <>{children}</>;
}
