'use client';

import { CgProfile } from 'react-icons/cg';
import { IoLogOutOutline, IoNotificationsOutline } from 'react-icons/io5';

import Link from 'next/link';

import NotificationDialog from '@/app/_components/NotificationDialog';
import { useSession } from '@/domain/user/query/session';
import { useGetCurrentUser } from '@/domain/user/query/user';

import { useTranslations } from 'next-intl';
import { overlay } from 'overlay-kit';

export default function Header() {
  // i18n
  const t = useTranslations('nav');

  // query
  const { currentUser } = useGetCurrentUser();
  useSession();

  const initial = currentUser?.username?.substring(0, 1)?.toUpperCase() || '';

  return (
    <header className="flex w-full flex-none flex-row items-center justify-end gap-3 bg-transparent px-6 py-3.5">
      {/* notification */}
      <button
        className="bg-base-300 text-base-content/70 hover:text-base-content flex size-9 items-center justify-center rounded-full transition-transform duration-100 hover:scale-105"
        aria-label="알림"
        onClick={() => {
          overlay.open(({ isOpen, close }) => <NotificationDialog open={isOpen} onClose={close} />);
        }}
      >
        <IoNotificationsOutline className="size-5" />
      </button>

      {/* user info + avatar */}
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="bg-base-300 flex cursor-pointer flex-row items-center gap-2.5 rounded-full py-1 pr-3 pl-1"
        >
          {/* avatar */}
          <div className="from-info to-primary text-primary-content flex size-[30px] flex-none items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold select-none">
            {initial}
          </div>

          {/* name / team */}
          <div className="hidden text-left leading-tight select-none md:block">
            <div className="text-[13px] font-bold">
              {currentUser?.username}
              {currentUser?.group?.isLeader && <span className="text-base-content/60 ml-1 font-normal">(팀장)</span>}
            </div>
            <div className="text-base-content/60 text-[11px]">
              {[currentUser?.group?.name, currentUser?.position?.name || currentUser?.group?.teamUserDescription]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        </div>
        <ul tabIndex={0} className="menu dropdown-content rounded-box bg-base-300 z-[1] mt-2 w-40 p-2 shadow-lg">
          <li>
            <Link href="/profile">
              <CgProfile className="size-4" />
              {t('profile')}
            </Link>
          </li>
          <li>
            <a href="/logout">
              <IoLogOutOutline className="size-4" />
              {t('logout')}
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
