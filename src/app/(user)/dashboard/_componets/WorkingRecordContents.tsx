'use client';

import { memo, useContext } from 'react';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/query/attendanceRecord';
import { useGetCurrentUser } from '@/domain/user/query/user';
import { isIncludeTime } from '@/utils/dataUtils';
import { getDuration } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import padStart from 'lodash/padStart';

const ONE_HOUR = 3_600;
const DAILY_TOTAL_HOURS = 8;
const DEFAULT_WEEKENDS = [0, 6];

function parseHours(seconds: number): string {
  const hours = Math.floor(seconds / ONE_HOUR);
  const min = Math.floor((seconds / 60) % 60);
  return `${hours}h ${padStart(min + '', 2, '0')}m`;
}

function getCategory(date: Date, dayOffType?: DayOffType): string {
  if (dayOffType === 'DAY_OFF') return '연차';
  if (dayOffType === 'AM_HALF_DAY_OFF' || dayOffType === 'PM_HALF_DAY_OFF') return '반차';
  if (DEFAULT_WEEKENDS.includes(dayjs(date).day())) return '휴일';
  return 'Work';
}

function getCategoryStyle(category: string): string {
  if (category === 'Work') return 'bg-blue-100 text-blue-700';
  if (category === '연차' || category === '반차') return 'bg-purple-100 text-purple-700';
  return 'bg-slate-100 text-slate-500';
}

interface WorkingRecordRowProps {
  date: Date;
  clockInTime?: Date;
  leaveWorkAt?: Date;
  clockOutTime?: Date;
  status?: AttendanceStatus;
  dayOffType?: DayOffType;
}

const WorkingRecordRow = memo(function WorkingRecordRow({ date, clockInTime, leaveWorkAt, clockOutTime, status, dayOffType }: WorkingRecordRowProps) {
  const now = dayjs().hour(0).minute(0).second(0).millisecond(0);
  const isToday = now.isSame(date);
  const isInProgress = isToday && clockInTime && !clockOutTime;

  const rawDuration = clockInTime && clockOutTime ? getDuration(clockInTime, clockOutTime) : 0;
  const workDuration = rawDuration
    ? rawDuration -
      (rawDuration > ONE_HOUR * 8 ||
      isIncludeTime(
        {
          from: clockInTime || dayjs(date).hour(0).toDate(),
          to: clockOutTime || dayjs(date).hour(0).toDate(),
        },
        dayjs(date).hour(12).toDate(),
      )
        ? ONE_HOUR
        : 0)
    : 0;

  const durationPercent = Math.min(Math.round((workDuration / (ONE_HOUR * DAILY_TOTAL_HOURS)) * 100), 100);
  const category = getCategory(date, dayOffType);

  return (
    <tr
      className={cx('border-b border-slate-100 transition-colors duration-100 hover:bg-slate-50', {
        'bg-blue-50': isToday,
      })}
    >
      {/* DATE/DAY */}
      <td className="py-3 pr-3 pl-4">
        <span
          className={cx('text-sm font-medium', {
            'text-blue-600': dayjs(date).day() === 6,
            'text-red-500': dayjs(date).day() === 0,
            'text-slate-800': ![0, 6].includes(dayjs(date).day()),
          })}
        >
          {dayjs(date).format('YYYY.MM.DD')}
        </span>
        <span className="ml-1.5 text-xs text-slate-400">{dayjs(date).format('dddd')}</span>
      </td>

      {/* CATEGORY */}
      <td className="px-3 py-3 text-center">
        <span className={cx('rounded-full px-2.5 py-0.5 text-xs font-semibold', getCategoryStyle(category))}>
          {category}
        </span>
      </td>

      {/* CLOCK-IN */}
      <td className="px-3 py-3 text-center text-sm text-slate-700">
        {clockInTime ? dayjs(clockInTime).format('HH:mm') : <span className="text-slate-300">—</span>}
      </td>

      {/* TARGET CLOCK-OUT */}
      <td className="px-3 py-3 text-center text-sm text-slate-700">
        {leaveWorkAt ? dayjs(leaveWorkAt).format('HH:mm') : <span className="text-slate-300">—</span>}
      </td>

      {/* CLOCK-OUT */}
      <td className="px-3 py-3 text-center text-sm text-slate-700">
        {isInProgress ? (
          <span className="animate-pulse text-xs font-medium text-blue-500">근무 중...</span>
        ) : clockOutTime ? (
          dayjs(clockOutTime).format('HH:mm')
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* DURATION */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-blue-400" style={{ width: `${durationPercent}%` }} />
          </div>
          <span className="text-sm text-slate-700">
            {workDuration > 0 ? parseHours(workDuration) : <span className="text-slate-300">—</span>}
          </span>
        </div>
      </td>

      {/* STATUS */}
      <td className="py-3 pr-4 pl-3 text-center">
        {DEFAULT_WEEKENDS.includes(dayjs(date).day()) && !status ? null : !status ? (
          <span className="inline-block h-3 w-3 rounded-full bg-slate-200" />
        ) : status === 'SUCCESS' ? (
          <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
        ) : status === 'WARNING' ? (
          <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
        ) : (
          <span className="inline-block h-3 w-3 rounded-full bg-slate-300" />
        )}
      </td>
    </tr>
  );
});

function getDates(
  selectDate: { startDate: Date; endDate: Date },
  attendanceRecords: AttendanceRecord[],
): WorkingRecordRowProps[] {
  const result: WorkingRecordRowProps[] = [];
  let current = dayjs(selectDate.startDate).hour(0).minute(0).second(0).millisecond(0).toDate();

  while (current <= selectDate.endDate) {
    const record = attendanceRecords.find(
      (item) => dayjs(item.workingDate).format('YYYY-MM-DD') === dayjs(current).format('YYYY-MM-DD'),
    );
    result.push(
      record
        ? {
            date: current,
            clockInTime: record.clockInTime,
            clockOutTime: record.clockOutTime,
            leaveWorkAt: record.leaveWorkAt,
            status: record.status,
            dayOffType: record.dayOffType,
          }
        : { date: current },
    );
    current = dayjs(current).add(1, 'day').toDate();
  }

  return result;
}

export default function WorkingRecordContents() {
  const { selectDate, updateSelectDate } = useContext(WorkingTimeContext);
  const { currentUser } = useGetCurrentUser();
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: currentUser?.id || '',
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });

  const dataList = getDates(selectDate, attendanceRecords);

  const handlePrevWeek = () => {
    updateSelectDate({
      startDate: dayjs(selectDate.startDate).add(-7, 'day').toDate(),
      endDate: dayjs(selectDate.endDate).add(-7, 'day').toDate(),
    });
  };

  const handleNextWeek = () => {
    updateSelectDate({
      startDate: dayjs(selectDate.startDate).add(7, 'day').toDate(),
      endDate: dayjs(selectDate.endDate).add(7, 'day').toDate(),
    });
  };

  return (
    <div className="animate-fade-up delay-225 mt-6 w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* section header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-bold tracking-wide text-slate-800 uppercase">주간 근태 상세 내역</h3>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="py-3 pr-3 pl-4 text-center text-xs font-semibold text-slate-500">근무일</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500">구분</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500">출근 시간</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500">목표 퇴근 시간</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500">퇴근 시간</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-slate-500">근무 시간</th>
              <th className="py-3 pr-4 pl-3 text-center text-xs font-semibold text-slate-500">상태</th>
            </tr>
          </thead>
          <tbody>
            {dataList.map((item) => (
              <WorkingRecordRow
                key={`working-record-${dayjs(item.date).unix()}`}
                date={item.date}
                clockInTime={item.clockInTime}
                leaveWorkAt={item.leaveWorkAt}
                clockOutTime={item.clockOutTime}
                status={item.status}
                dayOffType={item.dayOffType}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
        <span className="text-xs text-slate-500">해당 주 {dataList.length}건</span>
        <div className="flex gap-2">
          <button
            onClick={handlePrevWeek}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50"
          >
            지난 주
          </button>
          <button
            onClick={handleNextWeek}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-700"
          >
            다음 주
          </button>
        </div>
      </div>
    </div>
  );
}
