'use client';

import { useGetCurrentUser } from '@/domain/user/query/user';
import StatCard from '@/shared/components/StatCard';

import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

export default function UserLeaveEntryContents() {
  const t = useTranslations('dayoff.request');
  const { currentUser } = useGetCurrentUser();

  const leaveEntry = currentUser?.leaveEntry;
  const year = leaveEntry?.year || dayjs().year();
  const totalLeaveDays = leaveEntry?.totalLeaveDays ?? 0;
  const usedLeaveDays = leaveEntry?.usedLeaveDays ?? 0;
  const freeLeaveDays = totalLeaveDays - usedLeaveDays;
  const freeCompLeaveDays = (leaveEntry?.totalCompLeaveDays ?? 0) - (leaveEntry?.usedCompLeaveDays ?? 0);

  const unit = t('unit');

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label={t('stat.total')} value={totalLeaveDays} unit={unit} caption={t('stat.totalCaption', { year })} />
      <StatCard label={t('stat.used')} value={usedLeaveDays} unit={unit} caption={t('stat.usedCaption')} />
      <StatCard
        label={t('stat.remaining')}
        value={freeLeaveDays}
        unit={unit}
        caption={t('stat.remainingCaption')}
        highlight
      />
      <StatCard label={t('stat.comp')} value={freeCompLeaveDays} unit={unit} caption={t('stat.compCaption')} />
    </div>
  );
}
