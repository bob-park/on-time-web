'use client';

import { AiOutlineSchedule } from 'react-icons/ai';
import { FaUsersViewfinder } from 'react-icons/fa6';
import { HiDocumentPlus } from 'react-icons/hi2';
import { IoChatbox, IoLogOutOutline } from 'react-icons/io5';
import { LuHistory } from 'react-icons/lu';
import { MdManageAccounts, MdOutlineApproval } from 'react-icons/md';
import { PiUserFocusBold } from 'react-icons/pi';
import { RiDashboardFill } from 'react-icons/ri';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import { useGetCurrentUser } from '@/domain/user/query/user';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

const DEFAULT_MANAGER_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

function isActive(sources: string[], targets: string[]): boolean {
  return targets.every((target) => sources.includes(target));
}

function MenuList({ children }: { children?: React.ReactNode }) {
  return <div className="flex h-max w-full flex-col items-start justify-start gap-0.5">{children}</div>;
}

function GroupLabel({ children }: { children?: React.ReactNode }) {
  return (
    <div className="text-base-content/60 mt-5 px-3 pb-1.5 text-[11px] font-semibold tracking-[1.6px] uppercase">
      {children}
    </div>
  );
}

interface MenuItemProps {
  children?: React.ReactNode;
  href: string;
  active?: boolean;
}

function MenuItem({ children, href, active }: MenuItemProps) {
  return (
    <Link
      className={cx(
        'flex w-full flex-row items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors duration-150',
        active ? 'bg-base-300 text-base-content font-bold' : 'text-base-content/60 hover:text-base-content',
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

export default function NavMenu() {
  // segments
  const segments = useSelectedLayoutSegments();

  // i18n
  const t = useTranslations('nav');

  // query
  const { currentUser } = useGetCurrentUser();

  const isManager = DEFAULT_MANAGER_ROLES.includes(currentUser?.role.type || 'ROLE_USER');
  const proceedingCount = currentUser?.proceedingDocumentsCount || 0;

  return (
    <>
      {/* ===================== sidebar (desktop) ===================== */}
      <aside className="bg-base-100 hidden w-64 flex-none flex-col overflow-hidden select-none md:flex">
        {/* logo */}
        <Link href="/" className="flex flex-none items-center gap-2.5 px-6 pt-5 pb-4">
          <span className="bg-primary size-3 rounded-full shadow-[0_0_12px_rgba(30,215,96,0.6)]" />
          <span className="text-xl font-bold tracking-tight">OnTime</span>
        </Link>

        {/* menu list */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          <MenuList>
            {/* general */}
            <MenuItem href="/dashboard" active={isActive(segments, ['dashboard'])}>
              <RiDashboardFill className="inline-block size-5 flex-none" />
              {t('dashboard')}
            </MenuItem>

            <MenuItem href="/schedule" active={isActive(segments, ['schedule'])}>
              <AiOutlineSchedule className="inline-block size-5 flex-none" />
              {t('schedule')}
            </MenuItem>

            {/* 전자 결재 */}
            <GroupLabel>{t('groupApproval')}</GroupLabel>

            <MenuItem href="/dayoff/requests" active={isActive(segments, ['dayoff', 'requests'])}>
              <HiDocumentPlus className="inline-block size-5 flex-none" />
              {t('dayoffRequest')}
            </MenuItem>

            <MenuItem href="/dayoff/used" active={isActive(segments, ['dayoff', 'used'])}>
              <LuHistory className="inline-block size-5 flex-none" />
              {t('dayoffUsed')}
            </MenuItem>

            <MenuItem href="/overtime/requests" active={isActive(segments, ['overtime', 'requests'])}>
              <HiDocumentPlus className="inline-block size-5 flex-none" />
              {t('overtimeRequest')}
            </MenuItem>

            <MenuItem href="/expense/reports/requests" active={isActive(segments, ['expense', 'reports', 'requests'])}>
              <HiDocumentPlus className="inline-block size-5 flex-none" />
              {t('expenseRequest')}
            </MenuItem>

            <MenuItem href="/documents" active={isActive(segments, ['documents'])}>
              <MdOutlineApproval className="inline-block size-5 flex-none" />
              {t('documents')}
            </MenuItem>

            <MenuItem href="/approvals" active={isActive(segments, ['approvals'])}>
              <MdOutlineApproval className="inline-block size-5 flex-none" />
              {t('approvals')}
              {proceedingCount > 0 && (
                <span className="bg-primary text-primary-content ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold">
                  {proceedingCount}
                </span>
              )}
            </MenuItem>

            {/* 관리자 */}
            {isManager && (
              <>
                <GroupLabel>{t('groupManager')}</GroupLabel>

                <MenuItem href="/dayoff/users/vacations" active={isActive(segments, ['dayoff', 'users', 'vacations'])}>
                  <MdManageAccounts className="inline-block size-5 flex-none" />
                  {t('managerVacations')}
                </MenuItem>

                <MenuItem
                  href="/dayoff/users/compensatory"
                  active={isActive(segments, ['dayoff', 'users', 'compensatory'])}
                >
                  <PiUserFocusBold className="inline-block size-5 flex-none" />
                  {t('managerCompensatory')}
                </MenuItem>

                <MenuItem href="/attendance/view" active={isActive(segments, ['attendance', 'view'])}>
                  <FaUsersViewfinder className="inline-block size-5 flex-none" />
                  {t('managerAttendance')}
                </MenuItem>

                <MenuItem
                  href="/attendance/people/schedules"
                  active={isActive(segments, ['attendance', 'people', 'schedules'])}
                >
                  <AiOutlineSchedule className="inline-block size-5 flex-none" />
                  {t('managerSchedules')}
                </MenuItem>

                <MenuItem href="/chat/users" active={isActive(segments, ['chat'])}>
                  <IoChatbox className="inline-block size-5 flex-none" />
                  {t('managerChat')}
                </MenuItem>
              </>
            )}
          </MenuList>
        </nav>

        {/* logout */}
        <div className="flex-none border-t border-white/5 p-3">
          <a
            href="/logout"
            className="text-base-content/60 hover:text-base-content flex w-full flex-row items-center gap-3 rounded-full px-3 py-2 text-sm transition-colors duration-150"
          >
            <IoLogOutOutline className="size-5 flex-none" />
            {t('logout')}
          </a>
        </div>
      </aside>

      {/* ===================== mobile dock ===================== */}
      <nav className="bg-base-300 fixed inset-x-0 bottom-0 z-40 flex h-14 items-stretch justify-around md:hidden">
        <DockItem href="/dashboard" label={t('dashboard')} active={isActive(segments, ['dashboard'])}>
          <RiDashboardFill className="size-5" />
        </DockItem>
        <DockItem href="/schedule" label={t('schedule')} active={isActive(segments, ['schedule'])}>
          <AiOutlineSchedule className="size-5" />
        </DockItem>
        <DockItem
          href="/dayoff/requests"
          label={t('dayoffRequest')}
          active={isActive(segments, ['dayoff', 'requests'])}
        >
          <HiDocumentPlus className="size-5" />
        </DockItem>
        <DockItem href="/documents" label={t('documents')} active={isActive(segments, ['documents'])}>
          <MdOutlineApproval className="size-5" />
        </DockItem>
        <DockItem href="/approvals" label={t('approvals')} active={isActive(segments, ['approvals'])}>
          <div className="relative">
            <MdOutlineApproval className="size-5" />
            {proceedingCount > 0 && <span className="bg-primary absolute -top-1 -right-1.5 size-2 rounded-full" />}
          </div>
        </DockItem>
      </nav>
    </>
  );
}

interface DockItemProps {
  children?: React.ReactNode;
  href: string;
  label: string;
  active?: boolean;
}

function DockItem({ children, href, label, active }: DockItemProps) {
  return (
    <Link
      href={href}
      className={cx(
        'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-150',
        active ? 'text-base-content' : 'text-base-content/50',
      )}
    >
      {children}
      <span className="max-w-full truncate px-1 text-[10px] leading-none">{label}</span>
    </Link>
  );
}
