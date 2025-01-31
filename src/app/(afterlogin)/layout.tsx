import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import NavMenu from '@/app/_components/NavMenu';

const { WEB_SERVICE_HOST } = process.env;
const ALLOW_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

export default async function AfterLoginLayout({ children }: { children: Readonly<React.ReactNode> }) {
  const cookieStore = await cookies();

  const userResponse = await fetch(`${WEB_SERVICE_HOST}/users/me`, {
    method: 'get',
    headers: {
      Cookie: `JSESSIONID=${cookieStore.get('JSESSIONID')?.value || ''}`,
    },
    credentials: 'include',
  });

  if (!userResponse.ok) {
    redirect('/api/oauth2/authorization/keyflow-auth');
  }

  const user = await userResponse.json().then((res: User) => res);

  return (
    <div className="flex">
      {/* nav menu*/}
      <div className="w-52 flex-none">
        <NavMenu isManager={ALLOW_ROLES.includes(user.role.type)} />
      </div>

      {/* content */}
      <div className="mx-3 mt-6 size-full p-3">{children}</div>
    </div>
  );
}
