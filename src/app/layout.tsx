import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

import CustomerSupport from '@/app/_components/CustomerSupport';
import NavMenu from '@/app/_components/NavMenu';
import ToastProvider from '@/shared/components/toast/ToastProvider';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import Header from './_components/Header';
import RQProvider from './_components/RQProvider';
import './globals.css';

const { WEB_SERVICE_HOST, WS_HOST } = process.env;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return {
    title: t('title'),
    description: t('description'),
  };
}

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
  });

  if (!res.ok) {
    redirect('/api/oauth2/authorization/keyflow-auth');
  }

  const user = (await res.json()) as User;

  const dehydratedState = dehydrate(queryClient);

  const messages = await getMessages();

  return (
    <html lang="ko" data-theme="light">
      <body className="relative font-[Pretendard,system-ui,-apple-system,sans-serif]">
        <NextIntlClientProvider locale="ko" messages={messages}>
          <RQProvider>
            <HydrationBoundary state={dehydratedState}>
              <ToastProvider limit={5} timeout={5}>
                <div className="flex h-screen overflow-hidden">
                  {/* sidebar */}
                  <div className="w-64 flex-none">
                    <NavMenu />
                  </div>

                  {/* main area */}
                  <div className="flex flex-1 flex-col overflow-hidden">
                    {/* header */}
                    <div className="flex-none">
                      <Header />
                    </div>

                    {/* content */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">{children}</div>
                  </div>
                </div>

                <CustomerSupport wsHost={WS_HOST || '/api/ws'} userUniqueId={user.id} />
              </ToastProvider>
            </HydrationBoundary>
          </RQProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
