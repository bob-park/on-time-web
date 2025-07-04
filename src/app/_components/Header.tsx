'use client';

import { useEffect } from 'react';

import { CgProfile } from 'react-icons/cg';
import { FiMenu } from 'react-icons/fi';
import { IoLogOutOutline } from 'react-icons/io5';

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

  // useEffect
  useEffect(() => {
    if (!currentUser) {
      return;
    }
  }, [currentUser]);

  return (
    <header className="m-2 flex w-full flex-row items-center justify-between gap-3 rounded-2xl border border-gray-300 bg-white p-3 shadow-lg backdrop-blur">
      {/* content */}
      <div className="">
        <div className="flex flex-row items-center justify-between">
          {/* menu button */}
          <button className="btn btn-circle btn-ghost">
            <FiMenu className="h-6 w-6" />
          </button>

          {/* logo */}
          <Link className="btn btn-ghost" href="/">
            <h2 className="text-2xl font-bold text-sky-600 select-none">OnTime</h2>
          </Link>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-3 pr-10">
        <div className="z-10 mr-10 flex w-64 flex-row items-center justify-end gap-3">
          <div className="">
            <button
              className="btn btn-soft btn-info"
              onClick={() => {
                overlay.open(({ isOpen, close, unmount }) => <NotificationDialog open={isOpen} onClose={close} />);
              }}
            >
              <div className="badge badge-secondary">new</div>
              <span className="">앱 출시</span>
            </button>
          </div>
        </div>

        {/* team + position */}
        <div className="hidden text-lg select-none md:block">
          <span className="mr-3 text-gray-600">
            <span className="font-semibold">{currentUser?.team.name}</span>
            {currentUser?.team && currentUser?.team.isLeader && <span>(팀장)</span>}
          </span>
          <span className="font-bold">{currentUser?.username}</span>
          {currentUser?.position && (
            <span className="">
              <span> {currentUser?.position.name} </span>
            </span>
          )}
          {currentUser?.position && currentUser?.team.teamUserDescription && <span> / </span>}
          {currentUser?.team.teamUserDescription && (
            <span>
              <span>{currentUser?.team.teamUserDescription}</span>
            </span>
          )}
        </div>

        {/* avatar */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="m-1">
            <UserAvatar
              key={currentUser?.uniqueId}
              avatar={currentUser && `/api/users/${currentUser.uniqueId}/avatar`}
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
