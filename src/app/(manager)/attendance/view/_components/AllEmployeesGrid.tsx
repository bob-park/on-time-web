'use client';

import { memo, useContext, useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { getAllRecords } from '@/domain/attendance/api/attendanceRecord';
import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetUsers } from '@/domain/user/query/user';
import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

const DEFAULT_WEEKENDS = [0, 6];
const SKELETON_ROW_COUNT = 5;

// ── Skeleton ──────────────────────────────────────────────────────────────

function SkeletonCell({ label }: { label: string }) {
  return (
    <td className="px-2 py-3 text-center align-middle" aria-label={label}>
      <div className="bg-base-content/10 mx-auto h-3 w-12 animate-pulse rounded" />
    </td>
  );
}

function SkeletonRow({ label }: { label: string }) {
  return (
    <tr className="border-base-content/[0.08] border-b last:border-b-0">
      <td className="bg-base-300 sticky left-0 z-10 min-w-[170px] px-3 py-3">
        <div className="bg-base-content/10 mb-1 h-3 w-20 animate-pulse rounded" />
        <div className="bg-base-content/[0.06] h-2 w-14 animate-pulse rounded" />
      </td>
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonCell key={i} label={label} />
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
  t: ReturnType<typeof useTranslations>;
}

function DayCell({ date, record, isLoading, isError, t }: DayCellProps) {
  const isToday = dayjs().isSame(date, 'day');
  const isWeekend = DEFAULT_WEEKENDS.includes(dayjs(date).day());

  const cellClass = cx('px-2 py-3 text-center align-middle', {
    'bg-error/[0.06]': record?.status === 'WARNING',
  });

  if (isLoading) {
    return (
      <td className={cellClass} aria-label={t('loadingLabel')}>
        <div className="bg-base-content/10 mx-auto h-3 w-12 animate-pulse rounded" />
      </td>
    );
  }

  if (isError) {
    return (
      <td className={cellClass} aria-label={t('errorLabel')}>
        <span className="text-error text-xs">{t('loadError')}</span>
      </td>
    );
  }

  if (isWeekend) {
    return (
      <td className={cellClass}>
        <span className="text-base-content/40 text-xs">{t('holiday')}</span>
      </td>
    );
  }

  if (!record) {
    return (
      <td className={cellClass}>
        <span className="text-base-content/30">—</span>
      </td>
    );
  }

  if (record.dayOffType === 'DAY_OFF') {
    return (
      <td className={cellClass}>
        <span className="bg-info/15 text-info rounded-full px-2 py-0.5 text-xs font-semibold">{t('dayOff')}</span>
      </td>
    );
  }

  if (record.dayOffType === 'AM_HALF_DAY_OFF') {
    return (
      <td className={cellClass}>
        <span className="bg-info/15 text-info rounded-full px-2 py-0.5 text-xs font-semibold">{t('amHalfDayOff')}</span>
      </td>
    );
  }

  if (record.dayOffType === 'PM_HALF_DAY_OFF') {
    return (
      <td className={cellClass}>
        <span className="bg-info/15 text-info rounded-full px-2 py-0.5 text-xs font-semibold">{t('pmHalfDayOff')}</span>
      </td>
    );
  }

  const clockIn = record.clockInTime ? dayjs(record.clockInTime).format('HH:mm') : null;
  const clockOut = record.clockOutTime ? dayjs(record.clockOutTime).format('HH:mm') : null;
  const leaveWorkAt = record.leaveWorkAt ? dayjs(record.leaveWorkAt).format('HH:mm') : null;
  const isInProgress = isToday && clockIn && !clockOut;

  const isWarning = record.status === 'WARNING';
  const timeColor = isWarning ? 'text-error' : 'text-base-content';

  return (
    <td className={cellClass}>
      <div className="inline-flex flex-col gap-1 text-left text-[12.5px] leading-snug whitespace-nowrap">
        {clockIn && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className={cx('inline-block h-2 w-2 rounded-full', isWarning ? 'bg-error' : 'bg-primary')}
              aria-hidden="true"
            />
            <span className="sr-only">{isWarning ? t('statusWarning') : t('statusDone')}</span>
            <span className="text-base-content/50">{t('clockIn')}</span>
            <span className={timeColor}>{clockIn}</span>
          </span>
        )}
        {leaveWorkAt && (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-base-content/40">{t('scheduled')}</span>
            <span className="text-base-content/60">{leaveWorkAt}</span>
          </span>
        )}
        {clockOut && (
          <span className="inline-flex items-center gap-1.5">
            <span className="text-base-content/40">{t('clockOut')}</span>
            <span className="text-base-content/60">{clockOut}</span>
          </span>
        )}
        {isInProgress && <span className="text-primary text-[13px] font-bold">{t('working')}</span>}
        {!clockIn && !clockOut && <span className="text-base-content/30">—</span>}
      </div>
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
  t: ReturnType<typeof useTranslations>;
}

const EmployeeRow = memo(function EmployeeRow({ user, dates, records, isLoading, isError, t }: EmployeeRowProps) {
  return (
    <tr className="group border-base-content/[0.08] hover:bg-base-content/[0.04] border-b transition-colors duration-100 last:border-b-0">
      <td scope="row" className="bg-base-300 sticky left-0 z-10 min-w-[170px] px-3 py-3 group-hover:bg-[#232323]">
        <div className="max-w-[150px] truncate text-sm font-bold">{user.username}</div>
        <div className="text-base-content/60 mt-0.5 max-w-[150px] truncate text-xs">
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
            t={t}
          />
        );
      })}
    </tr>
  );
});

// ── Main component ────────────────────────────────────────────────────────

function buildDates(startDate: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => dayjs(startDate).add(i, 'day').toDate());
}

export default function AllEmployeesGrid() {
  const t = useTranslations('manager.attendance');
  const tCommon = useTranslations('common');

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
    return cx('bg-base-300 sticky top-0 min-w-[110px] px-2 py-3 text-center text-xs font-semibold', {
      'text-primary font-bold': isToday,
      'text-base-content/40': isWeekend && !isToday,
      'text-base-content/60': !isWeekend && !isToday,
    });
  };

  return (
    <div className="flex size-full flex-col gap-2">
      {lastUpdatedAt && (
        <div className="flex justify-end">
          <span className="text-base-content/40 text-xs">
            {t('lastUpdated', { time: dayjs(lastUpdatedAt).format('HH:mm:ss') })}
          </span>
        </div>
      )}

      <div className="border-base-content/10 bg-base-300 min-h-0 flex-1 overflow-auto rounded-2xl border shadow-sm">
        <table className="table" role="table" aria-label={t('gridLabel')}>
          <thead>
            <tr className="border-base-content/[0.08] border-b">
              <th
                scope="col"
                className="bg-base-300 text-base-content/60 sticky top-0 left-0 z-30 min-w-[170px] py-3 pl-4 text-left text-xs font-semibold"
              >
                {t('employee')}
              </th>
              {dates.map((date) => {
                const isToday = dayjs().isSame(date, 'day');
                return (
                  <th key={dayjs(date).format('YYYY-MM-DD')} scope="col" className={colHeaderClass(date)}>
                    {getDaysOfWeek(dayjs(date).day())}{' '}
                    <span className="font-normal">{dayjs(date).format('MM/DD')}</span>
                    {isToday && ` · ${tCommon('today')}`}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {usersLoading &&
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                <SkeletonRow key={i} label={t('loadingLabel')} />
              ))}

            {!usersLoading && usersError && (
              <tr>
                <td colSpan={8}>
                  <div className="text-error flex h-32 items-center justify-center text-sm">{t('usersError')}</div>
                </td>
              </tr>
            )}

            {!usersLoading && !usersError && users.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="text-base-content/50 flex h-32 items-center justify-center text-sm">
                    {t('noEmployees')}
                  </div>
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
                    t={t}
                  />
                );
              })}
          </tbody>
        </table>
      </div>

      <div className="text-base-content/60 mt-1.5 flex flex-wrap items-center gap-4 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-primary inline-block h-2 w-2 rounded-full" />
          {t('legendNormal')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-error inline-block h-2 w-2 rounded-full" />
          {t('legendWarning')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="bg-info/15 text-info rounded-full px-2 py-0.5 font-semibold">{t('legendDayOff')}</span>
        </span>
      </div>
    </div>
  );
}
