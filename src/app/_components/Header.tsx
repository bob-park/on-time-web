'use client';

import { useEffect } from 'react';

import { CgProfile } from 'react-icons/cg';
import { FiMenu } from 'react-icons/fi';
import { IoLogOutOutline } from 'react-icons/io5';

import Link from 'next/link';

import { useStore } from '@/shared/rootStore';

import UserAvatar from '@/domain/user/components/UserAvatar';

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  // store
  const updateCurrentUser = useStore((state) => state.updateCurrentUser);

  // useEffect
  useEffect(() => {
    if (!user) {
      return;
    }

    updateCurrentUser(user);
  }, [user]);

  return (
    <header className="sticky flex size-full flex-row items-center justify-between gap-3 p-3 shadow-lg">
      {/* content */}
      <div className="">
        <div className="flex flex-row items-center justify-between gap-1">
          {/* menu button */}
          <button className="btn btn-circle btn-ghost">
            <FiMenu className="h-6 w-6" />
          </button>

          {/* logo */}
          <Link className="btn btn-ghost" href="/">
            <h2 className="select-none text-2xl font-bold text-sky-600 [text-shadow:_0_2px_4px_rgb(99_102_241_/_0.8)]">
              OnTime
            </h2>
          </Link>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-3 pr-10">
        {/* team + position */}
        <div className="select-none text-lg">
          <span className="text-gray-600">
            <span className="font-semibold">{user.team.name}</span>
            {user.team?.teamUsers && user.team.teamUsers[0].isLeader && <span>(팀장)</span>}
            <span> - </span>
            <span> {user.position.name} </span>
          </span>
          <span className="font-bold">{user.username}</span>
        </div>

        {/* avatar */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="m-1">
            <UserAvatar alt={user.username} />
          </div>
          <ul tabIndex={0} className="menu dropdown-content z-[1] w-32 rounded-box bg-base-100 p-2 shadow">
            <li>
              <span>
                <CgProfile className="h-3 w-3" />
                프로필
              </span>
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
