'use client';

import { useEffect, useState } from 'react';

import { LuPanelLeft, LuSearch } from 'react-icons/lu';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import UserMenu from '@/app/_layouts/UserMenu';
import { useProceedingApprovalCount, useUser } from '@/domain/users/queries/user';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

import { MANAGER_ROLES, NAV_GROUPS, NavItem, isActive, openCommandPalette, useShortcutLabel } from './nav';

const STORAGE_KEY = 'sidebar-collapsed';

export default function Sidebar({ theme }: Readonly<{ theme: Theme }>) {
  // state
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // hooks
  const segments = useSelectedLayoutSegments();
  const t = useTranslations('nav');
  const shortcutLabel = useShortcutLabel();

  // query
  const { user } = useUser();
  const { count } = useProceedingApprovalCount();

  // useEffect
  useEffect(() => {
    // SSR 마크업을 맞추기 위해 마운트 후에 읽는다.
    setCollapsed(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  // handle
  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const isManager = MANAGER_ROLES.includes(user?.role.type || 'ROLE_USER');

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(segments, item);

    return (
      <Link
        key={item.key}
        href={item.href}
        title={collapsed ? t(item.key) : undefined}
        aria-current={active ? 'page' : undefined}
        className={cx(
          'relative flex items-center gap-2 rounded-[10px] px-2 py-[7px] text-sm',
          collapsed ? 'justify-center' : item.sub && 'pl-8',
          active
            ? 'text-accent before:bg-primary bg-[rgba(133,91,251,.12)] font-semibold before:absolute before:top-2 before:bottom-2 before:-left-2.5 before:w-[3px] before:rounded-r-[3px]'
            : 'text-base-content/75 hover:bg-base-200',
        )}
      >
        {Icon && (!item.sub || collapsed) && <Icon className="size-4 flex-none" />}
        {!collapsed && t(item.key)}
        {!collapsed && item.badge === 'proceeding' && count > 0 && (
          <span className="badge badge-soft badge-primary badge-xs ml-auto font-semibold">{count}</span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cx(
        'border-base-300/60 bg-base-100 hidden flex-none flex-col gap-0.5 border-r px-2.5 py-3 transition-[width] select-none md:flex',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className={cx('flex items-center gap-2 px-1.5 pt-1 pb-3', collapsed && 'flex-col')}>
        <Link href="/dashboard" aria-label="OnTime" className="flex flex-1 items-center gap-2.5">
          <span
            className="bg-primary m-1 size-3 flex-none rounded-full"
            style={{ boxShadow: '0 0 0 4px var(--primary-subtle)' }}
          />
          {!collapsed && <span className="text-sm font-bold tracking-[-0.3px]">OnTime</span>}
        </Link>
        <button
          type="button"
          className="text-base-content/40 hover:text-base-content"
          aria-label={t('collapse')}
          aria-pressed={collapsed}
          onClick={handleToggle}
        >
          <LuPanelLeft className="size-4" />
        </button>
      </div>

      <button
        type="button"
        title={collapsed ? t('search') : undefined}
        onClick={openCommandPalette}
        className={cx(
          'border-base-300/60 bg-base-200 text-base-content/50 mb-2.5 flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-sm',
          collapsed && 'justify-center',
        )}
      >
        <LuSearch className="size-4" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{t('search')}</span>
            <kbd className="kbd kbd-xs">{shortcutLabel}</kbd>
          </>
        )}
      </button>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {NAV_GROUPS.filter((group) => !group.manager || isManager).map((group, index) => (
          <div key={group.key ?? index} className="flex flex-col gap-0.5">
            {group.key && !collapsed && (
              <div className="text-base-content/50 px-2 pt-2.5 pb-1 text-[10px] tracking-[.6px] uppercase">
                {t(group.key)}
              </div>
            )}
            {group.header && !collapsed && (
              <div className="text-base-content/75 flex items-center gap-2 px-2 py-[7px] text-sm">
                <span className="text-base-content/50 w-4 text-center text-base leading-none">+</span>
                {t(group.header)}
              </div>
            )}
            {group.items.map(renderItem)}
          </div>
        ))}
      </nav>

      <UserMenu theme={theme} collapsed={collapsed} />
    </aside>
  );
}
