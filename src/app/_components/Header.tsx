'use client';

import { CgProfile } from 'react-icons/cg';
import { IoLogOutOutline, IoNotificationsOutline } from 'react-icons/io5';

import Link from 'next/link';

import NotificationDialog from '@/app/_components/NotificationDialog';
import UserAvatar from '@/domain/user/components/UserAvatar';
import { useSession } from '@/domain/user/query/session';
import { useGetCurrentUser } from '@/domain/user/query/user';

import { overlay } from 'overlay-kit';

export default function Header() {
  // query
  const { currentUser } = useGetCurrentUser();
  const {} = useSession();

  return (
    <header className="flex w-full flex-row items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-3 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
      {/* search */}
      <div className=""></div>

      {/* right side */}
      <div className="flex flex-row items-center gap-3">
        {/* notification */}
        <button
          className="btn btn-circle btn-ghost btn-sm relative"
          aria-label="알림"
          onClick={() => {
            overlay.open(({ isOpen, close }) => <NotificationDialog open={isOpen} onClose={close} />);
          }}
        >
          <IoNotificationsOutline className="h-5 w-5 text-slate-600" />
        </button>

        {/* user info + avatar */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="flex cursor-pointer flex-row items-center gap-2">
            <div className="hidden text-right select-none md:block">
              <p className="text-sm leading-tight font-semibold text-slate-800">
                {currentUser?.group?.name && (
                  <span className="mr-2 font-normal text-slate-500">{currentUser.group.name}</span>
                )}
                {currentUser?.username}
                {currentUser?.group?.isLeader && <span className="ml-1 text-xs text-blue-600">(팀장)</span>}
              </p>
              <p className="text-xs leading-tight text-slate-500">
                {currentUser?.position?.name || currentUser?.group?.teamUserDescription}
              </p>
            </div>
            <UserAvatar
              key={currentUser?.id}
              avatar={currentUser && `/api/users/${currentUser.id}/avatar`}
              alt={currentUser?.username || ''}
            />
          </div>
          <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-100 z-[1] w-40 p-2 shadow">
            <li>
              <Link href="/profile">
                <CgProfile className="h-3 w-3" />
                프로필
              </Link>
            </li>
            <li>
              <a href="/logout">
                <IoLogOutOutline className="h-3 w-3" />
                로그아웃
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
