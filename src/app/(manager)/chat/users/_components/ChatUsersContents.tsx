'use client';

import { useRouter } from 'next/navigation';

import { useGetUsers } from '@/domain/user/query/user';

export default function ChatUsersContents() {
  // hooks
  const router = useRouter();

  // query
  const { pages } = useGetUsers({ page: 0, size: 100 });

  const users = mergePageUsers(pages.map((page) => page.content));

  return (
    <div className="bg-base-300 w-full max-w-2xl rounded-lg p-2">
      <div className="flex flex-col">
        {users.map((user) => (
          <button
            key={`user-item-${user.id}`}
            type="button"
            className="group flex items-center gap-3.5 rounded-lg px-3.5 py-3 text-left transition-colors hover:cursor-pointer hover:bg-white/[0.04]"
            onClick={() => router.push(`/chat/users/${user.id}`)}
          >
            {/* avatar */}
            <span className="from-info to-primary flex size-11 flex-none items-center justify-center rounded-full bg-gradient-to-br text-base font-bold text-black select-none">
              {user.username?.substring(0, 1)}
            </span>

            {/* info */}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{user.username}</span>
              <span className="text-base-content/60 mt-0.5 block truncate text-xs">
                {[user.group?.name, user.position?.name].filter(Boolean).join(' · ')}
              </span>
            </span>

            {/* chevron */}
            <span className="text-base-content/40 group-hover:text-base-content flex-none text-lg leading-none transition-colors">
              ›
            </span>
          </button>
        ))}
      </div>
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
