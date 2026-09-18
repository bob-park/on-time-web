import type { Metadata } from 'next';

import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';

import NavMenu from '@/app/_components/NavMenu';
import NowWorkingBar from '@/app/_components/NowWorkingBar';
import ToastProvider from '@/shared/components/toast/ToastProvider';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import Header from './_components/Header';
import RQProvider from './_components/RQProvider';
import './globals.css';

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
  const queryClient = new QueryClient();

  const dehydratedState = dehydrate(queryClient);

  const messages = await getMessages();

  return (
    <html lang="ko" data-theme="ontime-dark">
      <body className="relative">
        <NextIntlClientProvider locale="ko" messages={messages}>
          <RQProvider>
            <HydrationBoundary state={dehydratedState}>
              <ToastProvider limit={5} timeout={5}>
                <div className="bg-base-100 flex h-screen gap-2 overflow-hidden p-2">
                  {/* sidebar (desktop) + mobile dock rendered inside NavMenu */}
                  <NavMenu />

                  {/* main area — floating surface card */}
                  <div className="to-base-200 flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-gradient-to-b from-[#1c1c1c]">
                    <Header />
                    <main className="flex-1 overflow-y-auto px-6 pb-[120px]">{children}</main>
                  </div>
                </div>

                <NowWorkingBar />
              </ToastProvider>
            </HydrationBoundary>
          </RQProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
