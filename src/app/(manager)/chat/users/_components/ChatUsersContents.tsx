'use client';

import { useRouter } from 'next/navigation';

import { useGetUsers } from '@/domain/user/query/user';

export default function ChatUserContents() {
  // hooks
  const router = useRouter();

  // query
  const { pages } = useGetUsers({ page: 0, size: 100 });

  const users = mergePageUsers(pages.map((page) => page.content));

  return (
    <div className="flex size-full flex-col items-center justify-start gap-1">
      {/* headers */}
      <div className="flex h-12 flex-row items-center justify-center gap-4 border-b border-gray-300 text-center text-base font-semibold">
        <div className="w-40 flex-none">팀(부서)</div>
        <div className="w-32 flex-none">직급</div>
        <div className="w-40 flex-none">이름</div>
        <div className="w-20 flex-none">비고</div>
      </div>

      {/* contents */}
      {users.map((user) => (
        <div
          key={`user-item-${user.id}`}
          className="hover:bg-base-200 flex h-12 flex-row items-center justify-center gap-4 rounded-2xl text-center text-base transition-all duration-150 hover:cursor-pointer"
          onClick={() => router.push(`/chat/users/${user.id}`)}
        >
          <div className="w-40 flex-none">{user.group?.name}</div>
          <div className="w-32 flex-none">{user.position?.name}</div>
          <div className="w-40 flex-none">{user.username}</div>
          <div className="w-20 flex-none"></div>
        </div>
      ))}
    </div>
  );
}

function mergePageUsers(pages: User[][]) {
  const users: User[] = [];

  for (const page of pages) {
    for (const user of page) {
      users.push(user);
    }
  }

  return users;
}
