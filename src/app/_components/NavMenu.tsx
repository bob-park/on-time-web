'use client';

import { IoQrCode } from 'react-icons/io5';
import { RiCalendarScheduleFill, RiDashboardFill } from 'react-icons/ri';
import { TbSubtask } from 'react-icons/tb';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import { useGetCurrentUser } from '@/domain/user/query/user';
import cx from 'classnames';

const ALLOW_ROLES = ['ROLE_ADMIN', 'ROLE_MANAGER'];

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
    <Link className={cx('w-full rounded-xl p-3 duration-150 hover:bg-blue-950', { 'bg-blue-950': active })} href={href}>
      <div className={cx('flex w-full flex-row items-center justify-start gap-2')}>{children}</div>
    </Link>
  );
}

export default function NavMenu() {
  const segments = useSelectedLayoutSegments();

  // query
  const { currentUser } = useGetCurrentUser();

  return (
    <div className="sticky top-[80px] flex h-[calc(100vh-80px)] select-none gap-2 bg-blue-900 p-6 text-white shadow-2xl">
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
          <TbSubtask className="inline-block h-6 w-6" />
          근태 처리 (GPS)
        </MenuItem>

        {/* admin */}
        {ALLOW_ROLES.includes(currentUser?.role.type || '') && (
          <>
            <div className="mt-10">
              <span className="text-sm font-normal text-gray-400">관리자</span>
            </div>

            <MenuItem href="/qr" active={isActive(segments, ['qr'])}>
              <IoQrCode className="inline-block h-6 w-6" />
              QR 코드 생성
            </MenuItem>
          </>
        )}
      </MenuList>
    </div>
  );
}
