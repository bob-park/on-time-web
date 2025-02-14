import { cookies } from 'next/headers';
import { forbidden, redirect } from 'next/navigation';

const { WEB_SERVICE_HOST } = process.env;

const ALLOW_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

export default async function ManagerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();

  try {
    const res = await fetch(`${WEB_SERVICE_HOST}/users/me`, {
      method: 'get',
      headers: {
        Cookie: `JSESSIONID=${cookieStore.get('JSESSIONID')?.value || ''}`,
      },
      credentials: 'include',
    });

    if (res.ok) {
      const user = (await res.json()) as User;

      if (!ALLOW_ROLES.includes(user?.role.type || '')) {
        forbidden();
      }
    }
  } catch (err) {
    console.error(err);
    redirect('/api/oauth2/authorization/keyflow-auth');
  }

  return <>{children}</>;
}
