'use client';

import { useContext } from 'react';

import Link from 'next/link';

import { AttendanceRecord } from '@/domain/attendance/apis/attendance.dto';
import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/queries/attendanceRecord';
import { useUser } from '@/domain/users/queries/user';
import { useUserCompLeaveEntries } from '@/domain/users/queries/userCompLeaveEntry';
import Badge from '@/shared/components/Badge';
import StatCard from '@/shared/components/StatCard';
import { isIncludeTime } from '@/utils/dataUtils';
import { getDuration } from '@/utils/parse';

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
  const { user: currentUser } = useUser();
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
      <div className="animate-fade-up bg-base-100 border-base-300 rounded-box shadow-whisper border p-7 lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-2 text-xs font-semibold tracking-widest uppercase">{t('heroLabel')}</p>
          <Badge variant={isOnTrack ? 'primary' : 'wait'}>
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: isOnTrack ? 'var(--color-primary)' : 'var(--warning-text)' }}
            />
            {isOnTrack ? t('statusOnTrack') : t('statusBehind')}
          </Badge>
        </div>

        <div className="mt-3.5 mb-1 text-[44px] leading-none font-bold tracking-tight">
          {cumulativeHours}
          <span className="text-2 text-xl font-normal">h</span>
          <span className="text-2 text-base font-normal"> / {WEEKLY_TOTAL_HOURS}h</span>
        </div>

        <div className="mt-5 space-y-3.5">
          {/* Cumulative work hours */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-2">{t('cumulativeHours')}</span>
              <span className="font-bold">{progressPercent}%</span>
            </div>
            <div className="bg-base-300 h-2 w-full overflow-hidden rounded">
              <div
                className="animate-progress bg-primary h-full origin-left rounded"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Expected work hours */}
          <div>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-2">{t('expectedHours')}</span>
              <span className="text-2 font-bold">{t('expectedTarget')}</span>
            </div>
            <div className="bg-base-300 h-2 w-full overflow-hidden rounded">
              <div className="bg-neutral h-full w-full rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Balance Card */}
      <div className="animate-fade-up delay-150">
        <StatCard
          label={t('compLeaveLabel')}
          value={`${overtimeBalanceHours >= 0 ? '+' : ''}${overtimeBalanceHours.toFixed(1)}`}
          unit="h"
          caption={t('compLeaveCaption')}
        >
          <Link href="/dayoff/used" className="btn btn-outline btn-sm mt-[18px]">
            {t('viewUsage')}
          </Link>
        </StatCard>
      </div>
    </div>
  );
}
