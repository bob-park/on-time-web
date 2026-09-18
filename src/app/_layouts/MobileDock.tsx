'use client';

import { AiOutlineSchedule } from 'react-icons/ai';
import { HiDocumentPlus } from 'react-icons/hi2';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { RiDashboardFill } from 'react-icons/ri';

import Link from 'next/link';
import { useSelectedLayoutSegments } from 'next/navigation';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

import { ClockFab } from './ClockCard';

const ITEMS = [
  { key: 'home', href: '/dashboard', segments: ['dashboard'], icon: RiDashboardFill },
  { key: 'schedule', href: '/schedule', segments: ['schedule'], icon: AiOutlineSchedule },
  null, // FAB slot
  { key: 'approvals', href: '/approvals', segments: ['approvals'], icon: HiDocumentPlus },
  { key: 'profile', href: '/profile', segments: ['profile'], icon: IoPersonCircleOutline },
] as const;

export default function MobileDock() {
  const segments = useSelectedLayoutSegments();
  const t = useTranslations('nav');

  return (
    <nav className="bg-base-100 border-base-300 fixed inset-x-0 bottom-0 z-40 flex h-[72px] items-start justify-around border-t px-1.5 pt-2 md:hidden">
      {ITEMS.map((item) =>
        item === null ? (
          <ClockFab key="fab" />
        ) : (
          <Link
            key={item.key}
            href={item.href}
            className={cx(
              'flex w-16 flex-col items-center gap-1 text-[10px]',
              item.segments.every((s) => segments.includes(s)) ? 'text-primary font-semibold' : 'text-3',
            )}
          >
            <item.icon className="size-[22px]" />
            {t(item.key)}
          </Link>
        ),
      )}
    </nav>
  );
}
