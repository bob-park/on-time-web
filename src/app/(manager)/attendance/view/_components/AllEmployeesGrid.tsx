'use client';

import { useContext, useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { getAllRecords } from '@/domain/attendance/api/attendanceRecord';
import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetUsers } from '@/domain/user/query/user';
import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';

const DEFAULT_WEEKENDS = [0, 6];
const SKELETON_ROW_COUNT = 5;

// ── Skeleton ──────────────────────────────────────────────────────────────

function SkeletonCell() {
  return (
    <td className="px-2 py-3 text-center align-middle" aria-label="데이터 로딩 중">
      <div className="mx-auto h-3 w-12 animate-pulse rounded bg-gray-200" />
    </td>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 last:border-b-0">
      <td className="sticky left-0 z-10 min-w-[140px] bg-white px-3 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
        <div className="mb-1 h-3 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-2 w-14 animate-pulse rounded bg-gray-100" />
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
    'bg-red-50': record?.status === 'WARNING',
  });

  if (isLoading) {
    return (
      <td className={cellClass} aria-label="데이터 로딩 중">
        <div className="mx-auto h-3 w-12 animate-pulse rounded bg-gray-200" />
      </td>
    );
  }

  if (isError) {
    return (
      <td className={cellClass} aria-label="데이터 오류">
        <span className="text-xs text-red-400">오류</span>
      </td>
    );
  }

  if (isWeekend) {
    return (
      <td className={cellClass}>
        <span className="text-xs text-gray-300">휴일</span>
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
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">연차</span>
      </td>
    );
  }

  if (record.dayOffType === 'AM_HALF_DAY_OFF') {
    return (
      <td className={cellClass}>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">오전반차</span>
      </td>
    );
  }

  if (record.dayOffType === 'PM_HALF_DAY_OFF') {
    return (
      <td className={cellClass}>
        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700">오후반차</span>
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
      <div className="space-y-0.5 text-sm leading-snug">
        {clockIn && (
          <div className={timeColor}>
            <span className="text-xs text-gray-400">출근· </span>
            {clockIn}
          </div>
        )}
        {leaveWorkAt && (
          <div className="text-gray-500">
            <span className="text-xs text-gray-400">예정· </span>
            {leaveWorkAt}
          </div>
        )}
        {clockOut && (
          <div className="text-gray-600">
            <span className="text-xs text-gray-400">퇴근· </span>
            {clockOut}
          </div>
        )}
        {isInProgress && <div className="text-xs text-blue-500">근무중</div>}
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
    <tr className="group border-b border-gray-100 transition-colors duration-100 last:border-b-0 hover:bg-gray-50">
      <td
        scope="row"
        className="sticky left-0 z-10 min-w-[140px] bg-white px-3 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)] group-hover:bg-gray-50"
      >
        <div className="max-w-[130px] truncate font-medium text-gray-900">{user.username}</div>
        <div className="max-w-[130px] truncate text-xs text-gray-500">
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

  const { pages, isLoading: usersLoading, isError: usersError } = useGetUsers({ page: 0, size: 100 });

  const users: User[] = useMemo(() => pages.flatMap((page) => page.content), [pages]);

  const attendanceResults = useQueries({
    queries: users.map((user) => ({
      queryKey: ['record', 'attendance', { userUniqueId: user.id, startDate: startDateStr, endDate: endDateStr }],
      queryFn: () => getAllRecords({ userUniqueId: user.id, startDate: startDateStr, endDate: endDateStr }),
      staleTime: 5 * 60 * 1_000,
      gcTime: 10 * 60 * 1_000,
      refetchInterval: 60 * 1_000,
      placeholderData: (prev: AttendanceRecord[] | undefined) => prev,
    })),
  });

  const maxUpdatedAt = attendanceResults.reduce(
    (m, r) => (!r.isError && (r.dataUpdatedAt ?? 0) > 0 ? Math.max(m, r.dataUpdatedAt ?? 0) : m),
    0,
  );
  const lastUpdatedAt = useMemo(() => (maxUpdatedAt > 0 ? new Date(maxUpdatedAt) : null), [maxUpdatedAt]);

  const dates = useMemo(() => buildDates(selectDate.startDate), [selectDate.startDate]);

  const colHeaderClass = (date: Date) => {
    const isToday = dayjs().isSame(date, 'day');
    const isWeekend = DEFAULT_WEEKENDS.includes(dayjs(date).day());
    return cx('sticky top-0 z-20 bg-gray-50 min-w-[110px] py-3 px-2 text-center text-xs font-semibold', {
      'text-blue-600 font-semibold': isToday,
      'text-gray-400': isWeekend && !isToday,
      'text-gray-500': !isWeekend && !isToday,
    });
  };

  return (
    <div className="size-full overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      {lastUpdatedAt && (
        <div className="flex justify-end border-b border-gray-100 px-4 py-2">
          <span className="text-xs text-gray-400">최근 갱신: {dayjs(lastUpdatedAt).format('HH:mm:ss')}</span>
        </div>
      )}
      <table role="table" aria-label="임직원 근무 현황" className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50">
            <th
              scope="col"
              className="sticky top-0 left-0 z-30 min-w-[140px] bg-gray-50 py-3 pl-4 text-left text-xs font-semibold text-gray-500"
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
          {usersLoading && Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => <SkeletonRow key={i} />)}

          {!usersLoading && usersError && (
            <tr>
              <td colSpan={8}>
                <div className="flex h-32 items-center justify-center text-sm text-red-400">
                  직원 목록을 불러오지 못했습니다. 페이지를 새로 고침해주세요.
                </div>
              </td>
            </tr>
          )}

          {!usersLoading && !usersError && users.length === 0 && (
            <tr>
              <td colSpan={8}>
                <div className="flex h-32 items-center justify-center text-sm text-gray-400">임직원이 없습니다.</div>
              </td>
            </tr>
          )}

          {!usersLoading &&
            !usersError &&
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
