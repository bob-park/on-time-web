'use client';

import { useContext } from 'react';

import Link from 'next/link';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/query/attendanceRecord';
import { useGetCurrentUser } from '@/domain/user/query/user';
import { useUserCompLeaveEntries } from '@/domain/user/query/userCompLeaveEntry';
import StatCard from '@/shared/components/StatCard';
import { isIncludeTime } from '@/utils/dataUtils';
import { getDuration } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

const ONE_HOUR = 3_600;
const WEEKLY_TOTAL_HOURS = 40;

function calcCumulativeHours(attendanceRecords: AttendanceRecord[]): number {
  return Math.floor(
    attendanceRecords
      .map((item) => {
        const duration =
          (item.clockInTime && item.clockOutTime && getDuration(item.clockInTime, item.clockOutTime)) || 0;
        return (
          duration -
          (duration > ONE_HOUR * 8 ||
          isIncludeTime(
            {
              from: item.clockInTime || dayjs(item.workingDate).hour(0).toDate(),
              to: item.clockOutTime || dayjs(item.workingDate).hour(0).toDate(),
            },
            dayjs(item.workingDate).hour(12).toDate(),
          )
            ? ONE_HOUR
            : 0)
        );
      })
      .reduce((sum, v) => sum + v, 0) / ONE_HOUR,
  );
}

export default function WeeklySummaryCards() {
  const t = useTranslations('dashboard');
  const { selectDate } = useContext(WorkingTimeContext);
  const { currentUser } = useGetCurrentUser();
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: currentUser?.id || '',
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });
  const { compLeaveEntries } = useUserCompLeaveEntries();

  const cumulativeHours = calcCumulativeHours(attendanceRecords);
  const progressPercent = Math.min(Math.round((cumulativeHours / WEEKLY_TOTAL_HOURS) * 100), 100);
  const isOnTrack = cumulativeHours >= WEEKLY_TOTAL_HOURS * 0.5;

  // 보상휴가 잔여 시간 (leaveDays - usedDays) * 8h
  const overtimeBalanceHours = compLeaveEntries.reduce((sum, entry) => {
    return sum + (entry.leaveDays - entry.usedDays) * 8;
  }, 0);

  return (
    <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Weekly Progress — Hero Card */}
      <div className="animate-fade-up to-base-200 rounded-lg bg-gradient-to-br from-[#14371f] p-7 shadow-[0_8px_8px_rgba(0,0,0,0.3)] lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-base-content/60 text-xs font-semibold tracking-widest uppercase">{t('heroLabel')}</p>
          <span
            className={cx(
              'inline-flex h-[22px] items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold',
              isOnTrack ? 'bg-primary/15 text-primary' : 'bg-warning/15 text-warning',
            )}
          >
            <span className={cx('h-2 w-2 rounded-full', isOnTrack ? 'bg-primary' : 'bg-warning')} />
            {isOnTrack ? t('statusOnTrack') : t('statusBehind')}
          </span>
        </div>

        <div className="mt-3.5 mb-1 text-[44px] leading-none font-bold tracking-tight">
          {cumulativeHours}
          <span className="text-base-content/60 text-xl font-normal">h</span>
          <span className="text-base-content/60 text-base font-normal"> / {WEEKLY_TOTAL_HOURS}h</span>
        </div>

        <div className="mt-5 space-y-3.5">
          {/* Cumulative work hours */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-base-content/60">{t('cumulativeHours')}</span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-white/10">
              <div
                className="animate-progress bg-primary h-full origin-left rounded"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Expected work hours */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-base-content/60">{t('expectedHours')}</span>
              <span className="text-base-content/60 font-bold">{t('expectedTarget')}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded bg-white/10">
              <div className="h-full w-full rounded bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Balance Card */}
      <div className="animate-fade-up delay-150">
        <StatCard
          highlight
          label={t('compLeaveLabel')}
          value={`${overtimeBalanceHours >= 0 ? '+' : ''}${overtimeBalanceHours.toFixed(1)}`}
          unit="h"
          caption={t('compLeaveCaption')}
        >
          <Link href="/dayoff/used" className="btn btn-outline btn-sm mt-[18px] rounded-full">
            {t('viewUsage')}
          </Link>
        </StatCard>
      </div>
    </div>
  );
}
