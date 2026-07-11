import { cookies } from 'next/headers';
import Link from 'next/link';

import { getTranslations } from 'next-intl/server';

import ChatUserContents from './_components/ChatUserContents';

const { WEB_SERVICE_HOST, WS_HOST } = process.env;

export default async function ChatUserPage({ params }: { params: Promise<{ uniqueId: string }> }) {
  const { uniqueId } = await params;

  const t = await getTranslations('chat');

  const cookieStore = await cookies();

  const user = await fetch(`${WEB_SERVICE_HOST}/users/${uniqueId}`, {
    method: 'get',
    headers: {
      Cookie: `JSESSIONID=${cookieStore.get('JSESSIONID')?.value || ''}`,
    },
  })
    .then((res) => res.json())
    .then((data: User) => data);

  return (
    <div className="animate-fade-up flex size-full flex-col gap-4">
      {/* eyebrow + title + back */}
      <div className="my-3 mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="eyebrow">{t('eyebrow')}</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {user.group && <span className="text-base-content/50 font-normal">{user.group.name} </span>}
            {user.username}
            {user.position && <span className="text-base-content/50 font-normal"> {user.position.name}</span>}
          </h1>
        </div>
        <Link href="/chat/users" className="btn btn-ghost btn-sm">
          ‹ {t('back')}
        </Link>
      </div>

      {/* contents */}
      <ChatUserContents wsHost={WS_HOST || '/api/ws'} user={user} />
    </div>
  );
}
