'use client';

import { IoQrCode } from 'react-icons/io5';
import { RiDashboardFill } from 'react-icons/ri';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import cx from 'classnames';

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

export default function NavMenu({ isManager }: { isManager: boolean }) {
  const segments = useSelectedLayoutSegments();

  return (
    <div className="sticky flex h-[calc(100vh-80px)] select-none gap-2 bg-blue-900 p-6 text-white shadow-2xl">
      {/* menu list */}
      <MenuList>
        {/* general */}
        <MenuItem href="/" active={segments.length === 0}>
          <RiDashboardFill className="inline-block h-6 w-6" />
          대시보드
        </MenuItem>

        {/* admin */}
        {isManager && (
          <>
            <div className="mt-10">
              <span className="text-sm font-normal text-gray-400">관리자</span>
            </div>

            <MenuItem href="/qr" active={segments.includes('qr')}>
              <IoQrCode className="inline-block h-6 w-6" />
              QR 코드 생성
            </MenuItem>
          </>
        )}
      </MenuList>
    </div>
  );
}
