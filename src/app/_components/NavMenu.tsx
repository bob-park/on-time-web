'use client';

import { AiOutlineSchedule } from 'react-icons/ai';
import { FaUsersViewfinder } from 'react-icons/fa6';
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
    <div className="flex size-full select-none gap-2 overflow-auto rounded-2xl border bg-white p-6 shadow-xl">
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
          </>
        )}
      </MenuList>
    </div>
  );
}
