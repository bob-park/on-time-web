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
      {/* Weekly Progress Card */}
      <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">주간 근무 진척도</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {cumulativeHours}h<span className="ml-1 text-lg font-normal text-gray-400">/ {WEEKLY_TOTAL_HOURS}h</span>
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isOnTrack ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
            }`}
          >
            {isOnTrack ? '순조로움' : '지연'}
          </span>
        </div>

        <div className="space-y-3">
          {/* Cumulative work hours */}
          <div>
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span className="font-medium">누적 근무 시간</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Expected work hours */}
          <div>
            <div className="mb-1 flex justify-between text-xs text-gray-500">
              <span className="font-medium">예상 근무 시간</span>
              <span>목표 100%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div className="h-full w-full rounded-full bg-gray-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Overtime Balance Card */}
      <div className="w-56 flex-none rounded-2xl border border-gray-200 bg-slate-800 p-6 text-white shadow-sm">
        <p className="text-sm font-medium text-slate-300">보상휴가 잔여</p>
        <p className="mt-2 text-4xl font-bold">
          {overtimeBalanceHours >= 0 ? '+' : ''}
          {overtimeBalanceHours.toFixed(1)}
          <span className="ml-1 text-xl font-normal text-slate-300">h</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">이번 달 기준</p>

        <div className="mt-6 flex items-center gap-2">
          <Link
            href="/dayoff/used"
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-600"
          >
            사용 내역 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
