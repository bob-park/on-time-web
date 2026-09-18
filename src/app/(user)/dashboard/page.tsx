import Link from 'next/link';

import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import { getUserinfo } from '@/shared/auth/serverAction';
import PageHeader from '@/shared/components/PageHeader';
import dayjs from '@/shared/dayjs';

import { getTranslations } from 'next-intl/server';

import ProceedingApprovals from './_components/ProceedingApprovals';
import QuickActions from './_components/QuickActions';
import WeeklySummaryCards from './_components/WeeklySummaryCards';
import WorkingRecordContents from './_components/WorkingRecordContents';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const user = await getUserinfo();

  return (
    <div className="animate-fade-up w-full">
      <WorkingTimeProvider>
        {/* 인사 + 오늘 날짜 + 자주 쓰는 신청 */}
        <PageHeader
          title={t('greeting', { name: user?.name ?? '' })}
          description={t('dateLine', { date: dayjs().format('M월 D일 dddd') })}
          actions={
            <>
              <Link href="/dayoff/requests" className="btn btn-outline btn-secondary">
                {t('actionDayoff')}
              </Link>
              <Link href="/overtime/requests" className="btn btn-primary">
                {t('actionOvertime')}
              </Link>
            </>
          }
        />

        {/* 4 스탯 */}
        <WeeklySummaryCards />

        {/* 주간 근무 기록 + 처리할 결재 / 빠른 신청 */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <WorkingRecordContents />
          <div className="flex flex-col gap-4">
            <ProceedingApprovals />
            <QuickActions />
          </div>
        </div>
      </WorkingTimeProvider>
    </div>
  );
}
