'use client';

import { CgProfile } from 'react-icons/cg';
import { IoLogOutOutline, IoNotificationsOutline } from 'react-icons/io5';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import NotificationDialog from '@/app/_layouts/NotificationDialog';
import { useUser } from '@/domain/users/queries/user';
import ThemeSwitcher from '@/shared/components/theme/ThemeSwitcher';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import { useTranslations } from 'next-intl';
import { overlay } from 'overlay-kit';

import { findNavItem } from './nav';

interface HeaderProps {
  theme: Theme;
}

export default function Header({ theme }: HeaderProps) {
  // segments
  const segments = useSelectedLayoutSegments();

  // i18n
  const t = useTranslations('nav');

  // query
  const { user } = useUser();

  const { group, item } = findNavItem(segments);
  const initial = user?.username?.substring(0, 1)?.toUpperCase() || '';

  return (
    <header className="flex h-14 w-full flex-none items-center gap-3 px-7">
      {/* breadcrumb */}
      <div className="text-3 flex items-center gap-1.5 text-[13px]">
        {group?.key && (
          <>
            <span>{t(group.key)}</span>
            <span>›</span>
          </>
        )}
        {item && <span className="text-base-content font-semibold">{t(item.key)}</span>}
      </div>

      <span className="flex-1" />

      {/* notification */}
      <button
        type="button"
        aria-label="알림"
        className="bg-base-100 border-base-300 text-2 hover:text-base-content relative flex size-9 items-center justify-center rounded-full border transition-colors"
        onClick={() => {
          overlay.open(({ isOpen, close }) => <NotificationDialog open={isOpen} onClose={close} />);
        }}
      >
        <IoNotificationsOutline className="size-[18px]" />
      </button>

      <ThemeSwitcher current={theme} />

      {/* avatar dropdown */}
      <div className="dropdown dropdown-end">
        <div
          tabIndex={0}
          role="button"
          className="from-primary to-secondary text-primary-content flex size-9 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br text-[13px] font-bold select-none"
        >
          {initial}
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content bg-base-100 border-base-300 rounded-box shadow-whisper z-[1] mt-2 w-40 border p-2"
        >
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
