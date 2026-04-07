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

const DEFAULT_MANAGER_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

function isActive(sources: string[], targets: string[]): boolean {
  return targets.every((target) => sources.includes(target));
}

function MenuList({ children }: { children?: React.ReactNode }) {
  return <div className="flex h-max w-full flex-col items-start justify-start gap-1 font-semibold">{children}</div>;
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
        'relative w-full rounded-xl px-3 py-2.5 text-slate-400 duration-200 hover:bg-slate-800 hover:text-white',
        active && 'bg-slate-800 text-white shadow-sm shadow-indigo-500/10',
      )}
      href={href}
    >
      <div className="flex w-full flex-row items-center justify-start gap-3">
        {active && <div className="absolute left-0 h-5 w-0.5 rounded-r-full bg-indigo-500" />}
        {children}
      </div>
    </Link>
  );
}

export default function NavMenu() {
  // segments
  const segments = useSelectedLayoutSegments();

  // query
  const { currentUser } = useGetCurrentUser();

  const isManager = DEFAULT_MANAGER_ROLES.includes(currentUser?.role.type || 'ROLE_USER');

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-slate-900 select-none">
      {/* logo */}
      <div className="my-1 flex-none border-b border-slate-700 px-6 py-5">
        <Link href="/" className="group flex items-center gap-2">
          <div className="h-8 w-1 rounded-full bg-indigo-500 transition-all duration-200 group-hover:h-6 group-hover:bg-indigo-400" />
          <h1 className="text-2xl font-extrabold tracking-tight text-white">OnTime</h1>
        </Link>
      </div>

      {/* menu list */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <MenuList>
          {/* general */}
          <MenuItem href="/dashboard" active={isActive(segments, ['dashboard'])}>
            <RiDashboardFill className="inline-block h-5 w-5 flex-none" />
            대시보드
          </MenuItem>

          <div className="mt-4 mb-1 px-3">
            <span className="text-xs font-medium tracking-wider text-slate-500 uppercase">전자 결재</span>
          </div>

          <MenuItem href="/dayoff/requests" active={isActive(segments, ['dayoff', 'requests'])}>
            <HiDocumentPlus className="inline-block size-5 flex-none" />
            휴가 신청
          </MenuItem>

          <MenuItem href="/dayoff/used" active={isActive(segments, ['dayoff', 'used'])}>
            <LuHistory className="inline-block size-5 flex-none" />
            휴가 사용 내역
          </MenuItem>

          <MenuItem href="/overtime/requests" active={isActive(segments, ['overtime', 'requests'])}>
            <HiDocumentPlus className="inline-block size-5 flex-none" />
            휴일근무보고서 신청
          </MenuItem>

          <MenuItem href="/expense/reports/requests" active={isActive(segments, ['expense', 'reports', 'requests'])}>
            <HiDocumentPlus className="inline-block size-5 flex-none" />
            지출결의서 신청
          </MenuItem>

          <MenuItem href="/documents" active={isActive(segments, ['documents'])}>
            <MdOutlineApproval className="inline-block size-5 flex-none" />
            결재 신청 목록
          </MenuItem>

          <MenuItem href="/approvals" active={isActive(segments, ['approvals'])}>
            <MdOutlineApproval className="inline-block size-5 flex-none" />
            결재 처리 대기 목록
            {(currentUser?.proceedingDocumentsCount || 0) > 0 && (
              <span className="badge badge-sm badge-secondary ml-auto">{currentUser?.proceedingDocumentsCount}</span>
            )}
          </MenuItem>

          {/* admin */}
          {isManager && (
            <>
              <div className="mt-4 mb-1 px-3">
                <span className="text-xs font-medium tracking-wider text-slate-500 uppercase">관리자</span>
              </div>

              <MenuItem href="/dayoff/users/vacations" active={isActive(segments, ['dayoff', 'users', 'vacations'])}>
                <MdManageAccounts className="inline-block size-5 flex-none" />
                임직원 휴가 사용 현황
              </MenuItem>

              <MenuItem
                href="/dayoff/users/compensatory"
                active={isActive(segments, ['dayoff', 'users', 'compensatory'])}
              >
                <PiUserFocusBold className="inline-block size-5 flex-none" />
                임직원 보상 휴가 현황
              </MenuItem>

              <MenuItem href="/attendance/view" active={isActive(segments, ['attendance', 'view'])}>
                <FaUsersViewfinder className="inline-block size-5 flex-none" />
                임직원 근무 현황
              </MenuItem>

              <MenuItem
                href="/attendance/people/schedules"
                active={isActive(segments, ['attendance', 'people', 'schedules'])}
              >
                <AiOutlineSchedule className="inline-block size-5 flex-none" />
                임직원 근무 일정 등록
              </MenuItem>

              <MenuItem href="/chat/users" active={isActive(segments, ['chat'])}>
                <IoChatbox className="inline-block size-5 flex-none" />
                임직원과의 소통
              </MenuItem>
            </>
          )}
        </MenuList>
      </div>

      {/* bottom actions */}
      <div className="flex-none space-y-1 border-t border-slate-700 px-3 py-4">
        <a
          href="/logout"
          className="flex w-full flex-row items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 duration-150 hover:bg-slate-700 hover:text-white"
        >
          <IoLogOutOutline className="h-5 w-5 flex-none" />
          <span className="font-semibold">Logout</span>
        </a>
      </div>
    </div>
  );
}
