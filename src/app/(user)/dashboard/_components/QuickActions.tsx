import { AiOutlineSchedule } from 'react-icons/ai';
import { HiDocumentPlus } from 'react-icons/hi2';
import { IoCalendarOutline, IoTimeOutline } from 'react-icons/io5';

import Link from 'next/link';

import { Card, CardSection } from '@/shared/components/Card';

import { getTranslations } from 'next-intl/server';
import type { IconType } from 'react-icons';

const ACTIONS: { href: string; icon: IconType; titleKey: string; subKey: string }[] = [
  { href: '/dayoff/requests', icon: IoCalendarOutline, titleKey: 'quickDayoff', subKey: 'quickDayoffSub' },
  { href: '/overtime/requests', icon: IoTimeOutline, titleKey: 'quickOvertime', subKey: 'quickOvertimeSub' },
  { href: '/schedule/add', icon: AiOutlineSchedule, titleKey: 'quickSchedule', subKey: 'quickScheduleSub' },
  { href: '/documents', icon: HiDocumentPlus, titleKey: 'quickDocuments', subKey: 'quickDocumentsSub' },
];

export default async function QuickActions() {
  const t = await getTranslations('dashboard');

  return (
    <Card className="animate-fade-up delay-300">
      <CardSection title={t('sectionQuick')} />

      <div className="grid grid-cols-2 gap-2.5 p-4">
        {ACTIONS.map(({ href, icon: Icon, titleKey, subKey }) => (
          <Link
            key={href}
            href={href}
            className="bg-base-200 border-base-300 hover:bg-primary-soft hover:border-secondary rounded-box flex flex-col items-start gap-2 border p-3.5 text-left transition-colors"
          >
            <span className="bg-primary-subtle text-primary flex size-8 items-center justify-center rounded-[10px]">
              <Icon className="size-4" />
            </span>
            <span className="text-sm font-semibold">{t(titleKey)}</span>
            <span className="text-3 text-xs">{t(subKey)}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
