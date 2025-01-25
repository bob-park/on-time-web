import { CgProfile } from 'react-icons/cg';
import { FiMenu } from 'react-icons/fi';
import { IoLogOutOutline } from 'react-icons/io5';

import Link from 'next/link';

import UserAvatar from '@/domain/user/components/UserAvatar';

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="flex size-full flex-row items-center justify-between gap-3 p-3">
      {/* content */}
      <div className="">
        <div className="flex flex-row items-center justify-between gap-1">
          {/* menu button */}
          <button className="btn btn-circle btn-ghost">
            <FiMenu className="h-6 w-6" />
          </button>

          {/* logo */}
          <Link className="btn btn-ghost" href="/">
            <h2 className="select-none text-2xl font-bold">On Time</h2>
          </Link>
        </div>
      </div>

      <div className="flex flex-row items-center justify-center gap-3 pr-10">
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
