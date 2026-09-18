'use client';

import { IoLogOutOutline } from 'react-icons/io5';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import { useProceedingApprovalCount, useUser } from '@/domain/users/queries/user';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

import { MANAGER_ROLES, NAV_GROUPS, NavItem, isActive } from './nav';

export default function Sidebar() {
  // segments
  const segments = useSelectedLayoutSegments();

  // i18n
  const t = useTranslations('nav');

  // query
  const { user } = useUser();
  const { count } = useProceedingApprovalCount();

  const isManager = MANAGER_ROLES.includes(user?.role.type || 'ROLE_USER');
  const initial = user?.username?.substring(0, 1)?.toUpperCase() || '';

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(segments, item);

    return (
      <Link
        key={item.key}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-sm transition-colors',
          item.sub && 'pl-10 text-[13px]',
          active ? 'bg-primary-subtle text-primary font-semibold' : 'text-2 hover:bg-base-200 hover:text-base-content',
        )}
      >
        {Icon && <Icon className="size-[18px] flex-none" />}
        {t(item.key)}
        {item.badge === 'proceeding' && count > 0 && (
          <span className="bg-primary text-primary-content ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold">
            {count}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="bg-base-100 border-base-300 hidden w-[248px] flex-none flex-col border-r select-none md:flex">
      {/* logo */}
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 pt-5 pb-3 text-lg font-bold tracking-tight">
        <span className="bg-primary size-3 rounded-full" style={{ boxShadow: '0 0 0 4px var(--primary-subtle)' }} />
        OnTime
      </Link>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-1">
        {NAV_GROUPS.filter((group) => !group.manager || isManager).map((group, index) => (
          <div key={group.key ?? index} className="flex flex-col gap-0.5">
            {group.key && <div className="eyebrow px-3 pt-4 pb-1.5">{t(group.key)}</div>}
            {group.header && (
              <div className="text-2 flex items-center gap-2.5 px-3 py-2 text-sm">
                <span className="text-3 text-lg leading-none">+</span>
                {t(group.header)}
              </div>
            )}
            {group.items.map(renderItem)}
          </div>
        ))}
      </nav>

      {/* user */}
      <div className="border-base-300 flex items-center gap-2.5 border-t px-4 py-3">
        <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="from-primary to-secondary text-primary-content flex size-[34px] flex-none items-center justify-center rounded-full bg-gradient-to-br text-[13px] font-bold">
            {initial}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px] font-semibold">
              {user?.username}
              {user?.groups?.[0]?.isLeader && <span className="text-3 ml-1 font-normal">({t('leader')})</span>}
            </span>
            <span className="text-3 block truncate text-[11px]">
              {[user?.groups?.[0]?.group.name, user?.position?.name || user?.groups?.[0]?.description]
                .filter(Boolean)
                .join(' · ')}
            </span>
          </span>
        </Link>
        <a href="/logout" aria-label={t('logout')} className="text-3 hover:text-base-content p-1">
          <IoLogOutOutline className="size-5" />
        </a>
      </div>
    </aside>
  );
}
