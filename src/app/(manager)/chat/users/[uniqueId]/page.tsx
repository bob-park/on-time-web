import { cookies } from 'next/headers';

import ChatUserContents from './_components/ChatUserContents';

const { WEB_SERVICE_HOST, WS_HOST } = process.env;

export default async function ChatUserPage({ params }: { params: Promise<{ uniqueId: string }> }) {
  const { uniqueId } = await params;

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
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <p className="text-2xl">
          {user.team && <span className="">{user.team.name}</span>}
          <span className="mx-2 font-bold">{user.username}</span>
          {user.position && <span className="">{user.position.name}</span>}
        </p>
      </div>

      {/* contents */}
      <div className="mt-5">
        <ChatUserContents wsHost={WS_HOST || '/api/ws'} user={user} />
      </div>
    </div>
  );
}
