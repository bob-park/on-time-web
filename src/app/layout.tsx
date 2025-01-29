import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import Header from '@/app/_components/Header';
import NavMenu from '@/app/_components/NavMenu';
import RQProvider from '@/app/_components/RQProvider';

import './globals.css';

const { WEB_SERVICE_HOST } = process.env;
const ALLOW_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

export const metadata: Metadata = {
  title: 'On Time ',
  description: '전자 근태 관리 시스템',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
    <html lang="en">
      {process.env.NODE_ENV !== 'production' && (
        <head>
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        </head>
      )}
      <body className="min-w-[660px]">
        {/* header */}
        <Header user={user} />

        <div className="flex">
          {/* nav menu*/}
          <div className="relative w-52 flex-none">
            <NavMenu isManager={ALLOW_ROLES.includes(user.role.type)} />
          </div>

          {/* content */}
          <div className="mx-3 mt-6 size-full p-3">
            <RQProvider>{children}</RQProvider>
          </div>
        </div>
      </body>
    </html>
  );
}
