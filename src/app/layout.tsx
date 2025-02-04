import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import NavMenu from '@/app/_components/NavMenu';

import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

import Header from './_components/Header';
import RQProvider from './_components/RQProvider';
import './globals.css';

const { WEB_SERVICE_HOST } = process.env;

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

  const getCurrentUser = async () => {
    const response = await fetch(`${WEB_SERVICE_HOST}/users/me`, {
      method: 'get',
      headers: {
        Cookie: `JSESSIONID=${cookieStore.get('JSESSIONID')?.value || ''}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      redirect('/api/oauth2/authorization/keyflow-auth');
    }

    return response.json().then((res: User) => res);
  };

  const user = await getCurrentUser();

  const queryClient = new QueryClient();

  queryClient.setQueryData<User>(['user', 'me'], user);

  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="en">
      {process.env.NODE_ENV !== 'production' && (
        <head>
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        </head>
      )}
      <body className="min-w-max">
        <RQProvider>
          <HydrationBoundary state={dehydratedState}>
            {/* header */}
            <Header />

            <div className="flex min-w-[1060px]">
              {/* nav menu*/}
              <div className="w-52 flex-none">
                <NavMenu />
              </div>

              {/* content */}
              <div className="mx-3 mt-6 size-full p-3">{children}</div>
            </div>
          </HydrationBoundary>
        </RQProvider>
      </body>
    </html>
  );
}
