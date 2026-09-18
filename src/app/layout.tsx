import type { Metadata } from 'next';

import NavMenu from '@/app/_layouts/NavMenu';
import NowWorkingBar from '@/app/_layouts/NowWorkingBar';
import RQProvider from '@/shared/components/queries/RQProvider';
import ToastProvider from '@/shared/components/toast/ToastProvider';
import { LOCALE_META } from '@/shared/i18n/config';
import { getUserLocale } from '@/shared/i18n/locale';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import Header from './_layouts/Header';
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
  const locale = await getUserLocale();
  const messages = await getMessages();
  const htmlLang = LOCALE_META[locale].htmlLang;

  return (
    <html lang={htmlLang} data-theme="ontime-dark">
      <body className="relative">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RQProvider>
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
          </RQProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
