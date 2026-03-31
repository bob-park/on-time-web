'use client';

import { useContext, useMemo } from 'react';

import { getAllRecords } from '@/domain/attendance/api/attendanceRecord';
import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetUsers } from '@/domain/user/query/user';

import { getDaysOfWeek } from '@/utils/parse';

import { useQueries } from '@tanstack/react-query';
import cx from 'classnames';
import dayjs from 'dayjs';

const DEFAULT_WEEKENDS = [0, 6];
const SKELETON_ROW_COUNT = 5;

// ── Skeleton ──────────────────────────────────────────────────────────────

function SkeletonCell() {
  return (
    <td className="px-2 py-3 text-center align-middle" aria-label="데이터 로딩 중">
      <div className="mx-auto w-12 h-3 bg-gray-200 animate-pulse rounded" />
    </td>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="sticky left-0 z-10 bg-white min-w-[140px] px-3 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
        <div className="w-20 h-3 bg-gray-200 animate-pulse rounded mb-1" />
        <div className="w-14 h-2 bg-gray-100 animate-pulse rounded" />
      </td>
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonCell key={i} />
      ))}
    </tr>
  );
}

// ── Day cell ──────────────────────────────────────────────────────────────

interface DayCellProps {
  date: Date;
  record?: AttendanceRecord;
  isLoading: boolean;
  isError: boolean;
}

function DayCell({ date, record, isLoading, isError }: DayCellProps) {
  const isToday = dayjs().isSame(date, 'day');
  const isWeekend = DEFAULT_WEEKENDS.includes(dayjs(date).day());

  const cellClass = cx('px-2 py-3 text-center align-middle', {
    'bg-blue-50': isToday && record?.status !== 'WARNING',
    'bg-red-50': record?.status === 'WARNING' && !isToday,
  });

  if (isLoading) {
    return (
      <td className={cellClass} aria-label="데이터 로딩 중">
        <div className="mx-auto w-12 h-3 bg-gray-200 animate-pulse rounded" />
      </td>
    );
  }

  if (isError) {
    return (
      <td className={cellClass} aria-label="데이터 오류">
        <span className="text-red-400 text-xs">오류</span>
      </td>
    );
  }

  if (isWeekend) {
    return (
      <td className={cellClass}>
        <span className="text-gray-300 text-xs">휴일</span>
      </td>
    );
  }

  if (!record) {
    return (
      <td className={cellClass}>
        <span className="text-gray-300">—</span>
      </td>
    );
  }

  if (record.dayOffType === 'DAY_OFF') {
    return (
      <td className={cellClass}>
        <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700">연차</span>
      </td>
    );
  }

  if (record.dayOffType === 'AM_HALF_DAY_OFF') {
    return (
      <td className={cellClass}>
        <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700">오전반차</span>
      </td>
    );
  }

  if (record.dayOffType === 'PM_HALF_DAY_OFF') {
    return (
      <td className={cellClass}>
        <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700">오후반차</span>
      </td>
    );
  }

  const clockIn = record.clockInTime ? dayjs(record.clockInTime).format('HH:mm') : null;
  const clockOut = record.clockOutTime ? dayjs(record.clockOutTime).format('HH:mm') : null;
  const leaveWorkAt = record.leaveWorkAt ? dayjs(record.leaveWorkAt).format('HH:mm') : null;
  const isInProgress = isToday && clockIn && !clockOut;

  const timeColor = record.status === 'WARNING' ? 'text-red-600' : 'text-gray-800';

  return (
    <td className={cellClass}>
      <div className="text-xs leading-tight">
        {clockIn && <div className={timeColor}>{clockIn}</div>}
        {leaveWorkAt && !clockOut && <div className="text-gray-400">{leaveWorkAt}</div>}
        {clockOut && <div className="text-gray-500">{clockOut}</div>}
        {isInProgress && <div className="text-blue-500">근무중</div>}
        {!clockIn && !clockOut && <span className="text-gray-300">—</span>}
      </div>
      {record.status === 'SUCCESS' && (
        <>
          <span className="ml-1 inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden="true" />
          <span className="sr-only">완료</span>
        </>
      )}
      {record.status === 'WARNING' && (
        <>
          <span className="ml-1 inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
          <span className="sr-only">경고</span>
        </>
      )}
    </td>
  );
}

// ── Employee row ──────────────────────────────────────────────────────────

interface EmployeeRowProps {
  user: User;
  dates: Date[];
  records: AttendanceRecord[];
  isLoading: boolean;
  isError: boolean;
}

function EmployeeRow({ user, dates, records, isLoading, isError }: EmployeeRowProps) {
  return (
    <tr className="group border-b border-gray-100 last:border-b-0 transition-colors duration-100 hover:bg-gray-50">
      <td
        scope="row"
        className="sticky left-0 z-10 min-w-[140px] px-3 py-3 bg-white group-hover:bg-gray-50 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
      >
        <div className="font-medium text-gray-900 truncate max-w-[130px]">{user.username}</div>
        <div className="text-xs text-gray-500 truncate max-w-[130px]">
          {user.group?.name}
          {user.group?.name && user.position?.name && ' · '}
          {user.position?.name}
        </div>
      </td>
      {dates.map((date) => {
        const record = records.find(
          (r) => dayjs(r.workingDate).format('YYYY-MM-DD') === dayjs(date).format('YYYY-MM-DD'),
        );
        return (
          <DayCell
            key={dayjs(date).format('YYYY-MM-DD')}
            date={date}
            record={record}
            isLoading={isLoading}
            isError={isError}
          />
        );
      })}
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────

function buildDates(startDate: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => dayjs(startDate).add(i, 'day').toDate());
}

export default function AllEmployeesGrid() {
  const { selectDate } = useContext(WorkingTimeContext);

  const startDateStr = dayjs(selectDate.startDate).format('YYYY-MM-DD');
  const endDateStr = dayjs(selectDate.endDate).format('YYYY-MM-DD');

  const { pages, isLoading: usersLoading } = useGetUsers({ page: 0, size: 100 });

  const users: User[] = pages.flatMap((page) => page.content);

  const attendanceResults = useQueries({
    queries: users.map((user) => ({
      queryKey: ['record', 'attendance', { userUniqueId: user.id, startDate: startDateStr, endDate: endDateStr }],
      queryFn: () => getAllRecords({ userUniqueId: user.id, startDate: startDateStr, endDate: endDateStr }),
      enabled: users.length > 0,
      staleTime: 5 * 60 * 1_000,
      gcTime: 10 * 60 * 1_000,
      refetchInterval: 60 * 1_000,
      placeholderData: (prev: AttendanceRecord[] | undefined) => prev,
    })),
  });

  const lastUpdatedAt = useMemo(() => {
    const timestamps = attendanceResults.map((r) => r.dataUpdatedAt ?? 0).filter((t) => t > 0);
    if (timestamps.length === 0) return null;
    return new Date(Math.max(...timestamps));
  }, [attendanceResults]);

  const dates = buildDates(selectDate.startDate);

  const colHeaderClass = (date: Date) => {
    const isToday = dayjs().isSame(date, 'day');
    const isWeekend = DEFAULT_WEEKENDS.includes(dayjs(date).day());
    return cx('min-w-[80px] py-3 px-2 text-center text-xs font-semibold', {
      'text-blue-600 font-semibold': isToday,
      'text-gray-400': isWeekend && !isToday,
      'text-gray-500': !isWeekend && !isToday,
    });
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
      {lastUpdatedAt && (
        <div className="flex justify-end px-4 py-2 border-b border-gray-100">
          <span className="text-xs text-gray-400">
            최근 갱신: {dayjs(lastUpdatedAt).format('HH:mm:ss')}
          </span>
        </div>
      )}
      <table role="table" aria-label="임직원 근무 현황" className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-gray-50 min-w-[140px] py-3 pl-4 text-left text-xs font-semibold text-gray-500"
            >
              임직원
            </th>
            {dates.map((date) => (
              <th key={dayjs(date).format('YYYY-MM-DD')} scope="col" className={colHeaderClass(date)}>
                {getDaysOfWeek(dayjs(date).day())} {dayjs(date).format('MM/DD')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {usersLoading &&
            Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => <SkeletonRow key={i} />)}

          {!usersLoading && users.length === 0 && (
            <tr>
              <td colSpan={8}>
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  임직원이 없습니다.
                </div>
              </td>
            </tr>
          )}

          {!usersLoading &&
            users.map((user, idx) => {
              const result = attendanceResults[idx];
              const records: AttendanceRecord[] = (result?.data as AttendanceRecord[]) || [];
              return (
                <EmployeeRow
                  key={user.id}
                  user={user}
                  dates={dates}
                  records={records}
                  isLoading={result?.isLoading ?? false}
                  isError={result?.isError ?? false}
                />
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
