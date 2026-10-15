'use client';

import { LuCalendar, LuClockAlert, LuHouse, LuInbox, LuPlane, LuPlus, LuSearch } from 'react-icons/lu';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useProceedingApprovalCount } from '@/domain/users/queries/user';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

import { openCommandPalette } from './nav';

const TAB = 'relative flex flex-1 flex-col items-center gap-0.5 text-[10px]';

const TABS = [
  { href: '/dashboard', key: 'home', Icon: LuHouse },
  { href: '/schedule', key: 'schedule', Icon: LuCalendar },
  { href: '/approvals', key: 'approvals', Icon: LuInbox },
] as const;

export default function MobileTabBar() {
  // hooks
  const pathname = usePathname();
  const t = useTranslations('nav');

  // query
  const { count } = useProceedingApprovalCount();

  // handle
  const handleBlur = () => (document.activeElement as HTMLElement | null)?.blur();

  const renderTab = ({ href, key, Icon }: (typeof TABS)[number]) => {
    const active = pathname.startsWith(href);

    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cx(TAB, active ? 'text-primary font-semibold' : 'text-base-content/50')}
      >
        <Icon className="size-5" />
        {t(key)}
        {key === 'approvals' && count > 0 && (
          <span className="bg-primary text-primary-content absolute -top-1 left-1/2 ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
            {count}
          </span>
        )}
      </Link>
    );
  };

  const [home, schedule, approvals] = TABS;

  return (
    <nav className="border-base-300/60 bg-base-100 fixed inset-x-0 bottom-0 z-40 flex items-center border-t pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      {renderTab(home)}
      {renderTab(schedule)}
      <div className={cx(TAB, 'dropdown dropdown-top dropdown-center')}>
        <div
          tabIndex={0}
          role="button"
          aria-label={t('newRequest')}
          className="btn btn-circle btn-primary -mt-5 shadow-lg"
        >
          <LuPlus className="size-5" />
        </div>
        <ul
          tabIndex={0}
          className="menu dropdown-content bg-base-100 border-base-300 rounded-box z-50 mb-3 w-44 border p-2 text-sm shadow-lg"
        >
          <li>
            <Link href="/dayoff/requests" onClick={handleBlur}>
              <LuPlane className="size-4" />
              {t('dayoffRequest')}
            </Link>
          </li>
          <li>
            <Link href="/overtime/requests" onClick={handleBlur}>
              <LuClockAlert className="size-4" />
              {t('overtimeRequest')}
            </Link>
          </li>
        </ul>
      </div>
      {renderTab(approvals)}
      <button type="button" className={cx(TAB, 'text-base-content/50')} onClick={openCommandPalette}>
        <LuSearch className="size-5" />
        {t('search')}
      </button>
    </nav>
  );
}
