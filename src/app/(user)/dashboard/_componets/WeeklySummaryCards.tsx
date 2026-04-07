'use client';

import { useContext } from 'react';

import Link from 'next/link';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/query/attendanceRecord';
import { useGetCurrentUser } from '@/domain/user/query/user';
import { useUserCompLeaveEntries } from '@/domain/user/query/userCompLeaveEntry';
import { isIncludeTime } from '@/utils/dataUtils';
import { getDuration } from '@/utils/parse';

import dayjs from 'dayjs';

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
    <div className="flex w-full flex-row gap-4">
      {/* Weekly Progress — Hero Card */}
      <div className="animate-fade-up relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 shadow-lg">
        {/* Background accent glow */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">주간 근무 진척도</p>
            <p className="mt-2 text-6xl font-extrabold tracking-tight text-white">
              {cumulativeHours}
              <span className="ml-1 text-2xl font-light text-slate-400">/ {WEEKLY_TOTAL_HOURS}h</span>
            </p>
          </div>
          <span
            className={`animate-fade-in delay-300 rounded-full px-4 py-1.5 text-xs font-bold tracking-wide uppercase ${
              isOnTrack
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
            }`}
          >
            {isOnTrack ? '일쟁이' : '열심히 일해라 닝겐'}
          </span>
        </div>

        <div className="relative mt-8 space-y-4">
          {/* Cumulative work hours */}
          <div>
            <div className="mb-2 flex justify-between text-xs text-slate-400">
              <span className="font-medium">누적 근무 시간</span>
              <span className="font-bold text-white">{progressPercent}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="animate-progress h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Expected work hours */}
          <div>
            <div className="mb-2 flex justify-between text-xs text-slate-400">
              <span className="font-medium">예상 근무 시간</span>
              <span>목표 100%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full rounded-full bg-white/20" />
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Balance Card */}
      <div className="animate-fade-up delay-150 w-60 flex-none rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">보상휴가 잔여</p>
        <p className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900">
          {overtimeBalanceHours >= 0 ? '+' : ''}
          {overtimeBalanceHours.toFixed(1)}
          <span className="ml-1 text-lg font-normal text-slate-400">h</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">이번 달 기준</p>

        <div className="mt-8">
          <Link
            href="/dayoff/used"
            className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
          >
            사용 내역 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
