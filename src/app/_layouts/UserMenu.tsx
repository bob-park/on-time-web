'use client';

import { LuChevronsUpDown, LuLogOut, LuSmartphone, LuUser } from 'react-icons/lu';

import Link from 'next/link';

import NotificationDialog from '@/app/_layouts/NotificationDialog';
import ShellAvatar from '@/app/_layouts/ShellAvatar';
import { useUser } from '@/domain/users/queries/user';
import ThemeSwitcher from '@/shared/components/theme/ThemeSwitcher';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';
import { useTranslations } from 'next-intl';
import { overlay } from 'overlay-kit';

const ROW = 'hover:bg-base-200 flex w-full items-center gap-2.5 rounded-xl p-2 text-sm';
const ROW_ICON = 'bg-base-200 grid size-[30px] flex-none place-items-center rounded-[10px]';

export default function UserMenu({
  theme,
  collapsed = false,
  placement = 'top',
}: Readonly<{ theme: Theme; collapsed?: boolean; placement?: 'top' | 'bottom-end' }>) {
  // hooks
  const t = useTranslations('nav');

  // query
  const { user } = useUser();

  const group = user?.groups?.[0];
  const role = user?.role.type.replace(/^ROLE_/, '');
  const affiliation = [group?.group.name, user?.position?.name || group?.description].filter(Boolean).join(' · ');

  // handle
  const handleBlur = () => (document.activeElement as HTMLElement | null)?.blur();

  const handleAppInstall = () => {
    handleBlur();
    overlay.open(({ isOpen, close }) => <NotificationDialog open={isOpen} onClose={close} />);
  };

  return (
    <div
      className={cx('dropdown', placement === 'top' ? 'dropdown-top mt-auto w-full' : 'dropdown-bottom dropdown-end')}
    >
      {placement === 'top' ? (
        <div
          tabIndex={0}
          role="button"
          title={user?.username}
          className={cx(
            'border-base-300/60 hover:bg-base-200 flex w-full cursor-pointer items-center gap-2 rounded-xl border p-2',
            collapsed && 'justify-center',
          )}
        >
          <ShellAvatar user={user} />
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1 text-xs leading-tight">
                <div className="truncate font-bold">
                  {user?.username}
                  {group?.isLeader && <span className="text-base-content/50 ml-1 font-normal">({t('leader')})</span>}
                </div>
                {affiliation && <div className="text-base-content/50 truncate">{affiliation}</div>}
              </div>
              <LuChevronsUpDown className="text-base-content/40 size-4" />
            </>
          )}
        </div>
      ) : (
        <div tabIndex={0} role="button" aria-label={user?.username} className="cursor-pointer">
          <ShellAvatar user={user} />
        </div>
      )}

      <div
        tabIndex={0}
        className={cx(
          'dropdown-content border-base-300 bg-base-100 z-50 w-64 rounded-2xl border p-3 shadow-lg',
          placement === 'top' ? 'mb-2' : 'mt-2',
        )}
      >
        <div className="mb-3 flex items-center gap-2.5">
          <ShellAvatar user={user} size="md" />
          <div className="min-w-0 text-sm leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-bold">{user?.username}</span>
              {role && <span className="badge badge-xs bg-primary/12 text-primary border-0 font-bold">{role}</span>}
            </div>
            {affiliation && <div className="text-base-content/50 truncate text-xs">{affiliation}</div>}
          </div>
        </div>
        <div className="text-base-content/50 mx-0.5 mb-1.5 text-[10px] tracking-[.6px] uppercase">{t('theme')}</div>
        <ThemeSwitcher current={theme} />
        <hr className="border-base-200 my-2" />
        <Link href="/profile" className={ROW} onClick={handleBlur}>
          <span className={ROW_ICON}>
            <LuUser className="size-4" />
          </span>
          {t('profile')}
        </Link>
        <button type="button" className={ROW} onClick={handleAppInstall}>
          <span className={ROW_ICON}>
            <LuSmartphone className="size-4" />
          </span>
          {t('appInstall')}
        </button>
        <hr className="border-base-200 my-2" />
        {/* route handler, not a page — plain anchor avoids prefetch */}
        <a href="/logout" className="text-error hover:bg-error/5 flex items-center gap-2.5 rounded-xl p-2 text-sm">
          <span className="bg-error/10 grid size-[30px] flex-none place-items-center rounded-[10px]">
            <LuLogOut className="size-4" />
          </span>
          {t('logout')}
        </a>
      </div>
    </div>
  );
}
