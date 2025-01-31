import type { Metadata } from 'next';

import { cookies } from 'next/headers';

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

  let user;

  try {
    const userResponse = await fetch(`${WEB_SERVICE_HOST}/users/me`, {
      method: 'get',
      headers: {
        Cookie: `JSESSIONID=${cookieStore.get('JSESSIONID')?.value || ''}`,
      },
      credentials: 'include',
    });

    user = await userResponse.json().then((res: User) => res);
  } catch (err) {
    console.error(err);
  }

  return (
    <html lang="en">
      {process.env.NODE_ENV !== 'production' && (
        <head>
          <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
        </head>
      )}
      <body className="min-w-[1060px]">
        {/* header */}
        <Header user={user} />

        <RQProvider>{children}</RQProvider>
      </body>
    </html>
  );
}
