'use client';

import { AiOutlineSchedule } from 'react-icons/ai';
import { FaUsersViewfinder } from 'react-icons/fa6';
import { HiDocumentPlus } from 'react-icons/hi2';
import { IoChatbox } from 'react-icons/io5';
import { LuHistory } from 'react-icons/lu';
import { MdOutlineApproval } from 'react-icons/md';
import { PiGpsFixBold } from 'react-icons/pi';
import { RiCalendarScheduleFill, RiDashboardFill } from 'react-icons/ri';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import { useGetCurrentUser } from '@/domain/user/query/user';

import cx from 'classnames';

const DEFAULT_MANAGER_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

function isActive(sources: string[], targets: string[]): boolean {
  return targets.every((target) => sources.includes(target));
}

function MenuList({ children }: { children?: React.ReactNode }) {
  return <div className="flex w-full flex-col items-start justify-start gap-3 font-semibold">{children}</div>;
}

interface MenuItemProps {
  children?: React.ReactNode;
  href: string;
  active?: boolean;
}

function MenuItem({ children, href, active }: MenuItemProps) {
  return (
    <Link
      className={cx('w-full rounded-xl p-3 duration-150 hover:bg-blue-950 hover:text-white', {
        'bg-blue-950 text-white': active,
        'text-black': active,
      })}
      href={href}
    >
      <div className={cx('flex w-full flex-row items-center justify-start gap-2')}>{children}</div>
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
    <div className="flex size-full gap-2 overflow-auto rounded-2xl border border-gray-300 bg-white p-6 shadow-xl select-none">
      {/* menu list */}
      <MenuList>
        {/* general */}
        <MenuItem href="/dashboard" active={isActive(segments, ['dashboard'])}>
          <RiDashboardFill className="inline-block h-6 w-6" />
          대시보드
        </MenuItem>

        <MenuItem href="/schedule" active={isActive(segments, ['schedule'])}>
          <RiCalendarScheduleFill className="inline-block h-6 w-6" />
          근무 일정
        </MenuItem>

        <MenuItem href="/attendance/record/gps" active={isActive(segments, ['attendance', 'record', 'gps'])}>
          <PiGpsFixBold className="inline-block h-6 w-6" />
          근태 처리 (GPS)
        </MenuItem>

        <div className="mt-5">
          <span className="text-sm font-normal text-gray-400">전자 결재</span>
        </div>

        <MenuItem href="/dayoff/requests" active={isActive(segments, ['dayoff', 'requests'])}>
          <HiDocumentPlus className="inline-block size-6" />
          휴가 신청
        </MenuItem>

        <MenuItem href="/dayoff/used" active={isActive(segments, ['dayoff', 'used'])}>
          <LuHistory className="inline-block size-6" />
          휴가 사용 내역
        </MenuItem>

        <MenuItem href="/overtime/requests" active={isActive(segments, ['overtime', 'requests'])}>
          <HiDocumentPlus className="inline-block size-6" />
          휴일근무보고서 신청
        </MenuItem>

        <MenuItem href="/expense/reports/requests" active={isActive(segments, ['expense', 'reports', 'requests'])}>
          <HiDocumentPlus className="inline-block size-6" />
          지출결의서 신청
        </MenuItem>

        <MenuItem href="/documents" active={isActive(segments, ['documents'])}>
          <MdOutlineApproval className="inline-block size-6" />
          결재 신청 목록
        </MenuItem>

        <MenuItem href="/approvals" active={isActive(segments, ['approvals'])}>
          <MdOutlineApproval className="inline-block size-6" />
          결재 처리 대기 목록
          {(currentUser?.proceedingDocumentsCount || 0) > 0 && (
            <span className="badge badge-sm badge-secondary">{currentUser?.proceedingDocumentsCount}</span>
          )}
        </MenuItem>

        {/* admin */}
        {isManager && (
          <>
            <div className="mt-5">
              <span className="text-sm font-normal text-gray-400">관리자</span>
            </div>

            <MenuItem href="/attendance/view" active={isActive(segments, ['attendance', 'view'])}>
              <FaUsersViewfinder className="inline-block size-6" />
              임직원 근무 현황
            </MenuItem>

            <MenuItem
              href="/attendance/people/schedules"
              active={isActive(segments, ['attendance', 'people', 'schedules'])}
            >
              <AiOutlineSchedule className="inline-block size-6" />
              임직원 근무 일정 등록
            </MenuItem>

            <MenuItem href="/chat/users" active={isActive(segments, ['chat'])}>
              <IoChatbox className="inline-block size-6" />
              임직원과의 소통
            </MenuItem>
          </>
        )}
      </MenuList>
    </div>
  );
}
