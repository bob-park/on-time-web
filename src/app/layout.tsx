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

  const queryClient = new QueryClient();

  const res = await fetch(`${WEB_SERVICE_HOST}/users/me`, {
    method: 'get',
    headers: {
      Cookie: `JSESSIONID=${cookieStore.get('JSESSIONID')?.value || ''}`,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    redirect('/api/oauth2/authorization/keyflow-auth');
  }

  const user = (await res.json()) as User;

  queryClient.setQueryData<User>(['user', 'me'], user);

  const dehydratedState = dehydrate(queryClient);

  return (
    <html lang="ko">
      {process.env.NODE_ENV !== 'production' && (
        <head>
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        </head>
      )}
      <body className="relative min-w-max">
        <RQProvider>
          <HydrationBoundary state={dehydratedState}>
            {/* header */}
            <div className="sticky top-1 left-0 z-50 flex w-full flex-row items-center justify-center px-5">
              <Header />
            </div>

            <div className="flex">
              {/* nav menu*/}
              <div className="sticky top-[120px] m-7 h-[calc(100vh-160px)] w-72 flex-none">
                <NavMenu />
              </div>

              {/* content */}
              <div className="mx-3 my-7 size-full p-3">{children}</div>
            </div>
          </HydrationBoundary>
        </RQProvider>
      </body>
    </html>
  );
}
